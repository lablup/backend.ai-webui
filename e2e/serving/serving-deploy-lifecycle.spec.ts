// FR-2295: Integration E2E test for model service deploy lifecycle.
// Tests the full lifecycle: vfolder creation -> file upload -> service deploy
// via ServiceLauncher UI -> HEALTHY status -> service termination -> cleanup.
import { FolderExplorerModal } from '../utils/classes/vfolder/FolderExplorerModal';
import { sweepServices, sweepVFolders } from '../utils/cleanup-util';
import {
  loginAsAdmin,
  navigateTo,
  createVFolderAndVerify,
  moveToTrashAndVerify,
  deleteForeverAndVerifyFromTrash,
} from '../utils/test-util';
import { test, expect, Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const FIXTURES_DIR = path.join(__dirname, 'fixtures');

function shortId(): string {
  return Math.random().toString(36).slice(2, 8);
}

const SERVICE_NAME = `e2e-svc-${shortId()}`;
const VFOLDER_NAME = `e2e-mod-${shortId()}`;

// Fallback image if defaultSessionEnvironment is not set in config.toml
const DEFAULT_PYTHON_IMAGE =
  'cr.backend.ai/stable/python:3.9-ubuntu20.04@x86_64';

// Resolved at runtime from config.toml's defaultSessionEnvironment
let resolvedImage = DEFAULT_PYTHON_IMAGE;

/**
 * Reads defaultSessionEnvironment from the WebUI config via backendaiclient.
 * Must be called after login (backendaiclient is initialized).
 */
async function resolveDefaultImage(page: Page): Promise<string> {
  const image = await page.evaluate(() => {
    const client = (globalThis as any).backendaiclient;
    return client?._config?.default_session_environment || '';
  });
  return image || DEFAULT_PYTHON_IMAGE;
}

// Max time to wait for service health check
const SERVICE_READY_TIMEOUT = 180_000; // 3 minutes
const HEALTH_CHECK_INTERVAL = 5_000; // 5 seconds

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Locates the BAIFetchKeyButton (refresh/reload button) on the serving page.
 * The button renders a ReloadOutlined icon with title="Refresh".
 */
function getTableRefreshButton(page: Page) {
  return page
    .locator('button')
    .filter({ has: page.locator('.anticon-reload') })
    .first();
}

/**
 * Opens the FolderExplorerModal for a given vfolder and uploads fixture files.
 */
async function uploadFixturesToVFolder(
  page: Page,
  folderName: string,
  pythonImage: string = DEFAULT_PYTHON_IMAGE,
): Promise<void> {
  await navigateTo(page, 'data');
  const folderLink = page.getByRole('link', { name: folderName }).first();
  await expect(folderLink).toBeVisible({ timeout: 15000 });
  await folderLink.click();

  const modal = new FolderExplorerModal(page);
  await modal.waitForOpen();
  await modal.verifyFileExplorerLoaded();

  const uploadButton = await modal.getUploadButton();
  await uploadButton.click();

  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByRole('button', { name: 'file-add Upload Files' }).click(),
  ]);

  const mockServerContent = fs.readFileSync(
    path.join(FIXTURES_DIR, 'mock_openai_server.py'),
    'utf-8',
  );
  const modelDefContent = fs.readFileSync(
    path.join(FIXTURES_DIR, 'model-definition.yaml'),
    'utf-8',
  );

  const serviceDefContent = [
    '[custom.environment]',
    `image = "${pythonImage}"`,
    'architecture = "x86_64"',
    '',
    '[custom.resource_slots]',
    'cpu = 1',
    'mem = "512m"',
  ].join('\n');

  await fileChooser.setFiles([
    {
      name: 'mock_openai_server.py',
      mimeType: 'text/x-python',
      buffer: Buffer.from(mockServerContent),
    },
    {
      name: 'model-definition.yaml',
      mimeType: 'application/x-yaml',
      buffer: Buffer.from(modelDefContent),
    },
    {
      name: 'service-definition.toml',
      mimeType: 'application/toml',
      buffer: Buffer.from(serviceDefContent),
    },
  ]);

  await modal.verifyFileVisible('mock_openai_server.py');
  await modal.verifyFileVisible('model-definition.yaml');
  await modal.verifyFileVisible('service-definition.toml');

  await modal.close();
}

/**
 * Creates a model service via the ServiceLauncher UI form.
 */
async function createServiceViaUI(
  page: Page,
  serviceName: string,
  vfolderName: string,
): Promise<void> {
  await navigateTo(page, 'service/start');

  // Fill service name
  const serviceNameInput = page.getByLabel('Service Name').first();
  await expect(serviceNameInput).toBeVisible({ timeout: 10000 });
  await serviceNameInput.fill(serviceName);

  // Select model storage vfolder
  const modelStorageSelect = page.getByRole('combobox', {
    name: 'Model Storage to mount',
  });
  await expect(modelStorageSelect).toBeVisible({ timeout: 10000 });
  await modelStorageSelect.click();
  await modelStorageSelect.fill(vfolderName);

  await page
    .locator('.ant-select-item-option')
    .filter({ hasText: vfolderName })
    .first()
    .click({ timeout: 10000 });

  // Select environment image
  const envSelect = page.getByRole('combobox', {
    name: /Environments \/ Version/i,
  });
  await expect(envSelect).toBeVisible({ timeout: 10000 });
  await envSelect.click();
  await envSelect.fill('python');

  await page
    .locator('.ant-select-item-option')
    .filter({ hasText: /python/i })
    .first()
    .click({ timeout: 10000 });

  // Switch Model Definition mode from the default "Enter Command" to
  // "Use Config File" so the service reads the uploaded `model-definition.yaml`
  // instead of requiring a startCommand input. The uploaded fixture already
  // defines the start command, port, and health check — toggling here keeps
  // the test free of duplicated command wiring that has to be maintained in
  // lockstep with the yaml.
  //
  // Ant Design's Segmented renders its radios as visually-hidden inputs, so
  // `toBeVisible` on the radio itself fails. Click the segment label instead
  // (the label's <div> is the actual click target) and assert via `toBeChecked`
  // on the hidden radio once the state flips.
  const useConfigFileRadio = page.getByRole('radio', {
    name: 'Use Config File',
  });
  await page
    .locator('.ant-segmented-item-label', { hasText: 'Use Config File' })
    .click({ timeout: 10000 });
  await expect(useConfigFileRadio).toBeChecked({ timeout: 3000 });

  // Select resource group - click to open dropdown, search, then select option
  const resourceGroupSelect = page
    .getByRole('combobox', { name: 'Resource Group' })
    .first();
  await expect(resourceGroupSelect).toBeVisible({ timeout: 10000 });
  await resourceGroupSelect.click();
  await resourceGroupSelect.fill('default');
  await page
    .locator('.ant-select-item-option')
    .filter({ hasText: /default/i })
    .first()
    .click({ timeout: 10000 });

  // Pick the "Minimum requirements" resource preset so CPU/Memory are auto-
  // filled from the selected image's `resourceLimits.min`. Without this, the
  // form keeps its default values which may fall below the image's minimum
  // (e.g. "CPU must be minimum 5", "minimum memory capacity is 1088MiB") and
  // service creation fails with inline Form.Item validation errors at submit
  // time. Selecting the preset triggers the effect at
  // ResourceAllocationFormItems.tsx that pulls min values from image metadata,
  // making the test resilient to image-catalog changes that bump minimums.
  const presetSelect = page
    .getByRole('combobox', { name: /Resource Presets?/i })
    .first();
  if (await presetSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
    await presetSelect.click();
    await page
      .locator('.ant-select-item-option')
      .filter({ hasText: 'Minimum requirements' })
      .first()
      .click({ timeout: 10000 });
  }

  // Set AI Accelerator to 0 to avoid GPU-based allocation presets.
  // When the resource group has a GPU preset selected by default (e.g. cuda01-small),
  // service creation would fail if no GPU agents are available.
  // Setting the accelerator count to 0 ensures CPU-only resource allocation.
  //
  // Strategy: Find the AI Accelerator form item by its label text, then target
  // the spinbutton inside it. Ant Design Form.Item uses a `label` element that
  // may not have a `for` attribute in all versions, so we use a compound selector.
  const acceleratorFormItem = page
    .locator('.ant-form-item')
    .filter({ hasText: 'AI Accelerator' })
    .first();
  const acceleratorSpinbutton = acceleratorFormItem.getByRole('spinbutton');
  if (
    await acceleratorSpinbutton.isVisible({ timeout: 5000 }).catch(() => false)
  ) {
    // If the spinbutton is already disabled (e.g., no GPU presets available in
    // the selected resource group), it is already at 0 — skip editing it.
    const isEditable = await acceleratorSpinbutton
      .isEditable({ timeout: 1000 })
      .catch(() => false);
    if (isEditable) {
      await acceleratorSpinbutton.scrollIntoViewIfNeeded();
      await acceleratorSpinbutton.click({ clickCount: 3 });
      await acceleratorSpinbutton.fill('0');
      await acceleratorSpinbutton.press('Tab');
      // Wait for the field to reflect the updated CPU-only allocation value
      await expect(acceleratorSpinbutton).toHaveValue('0', { timeout: 5000 });
    }
  }

  // Check "Open To Public"
  const openToPublicCheckbox = page.getByLabel('Open To Public');
  await openToPublicCheckbox.scrollIntoViewIfNeeded();
  await expect(openToPublicCheckbox).toBeVisible({ timeout: 5000 });
  if (!(await openToPublicCheckbox.isChecked())) {
    await openToPublicCheckbox.check({ force: true });
  }
  await expect(openToPublicCheckbox).toBeChecked({ timeout: 3000 });

  // Submit
  const createButton = page.getByRole('button', { name: 'Create' });
  await expect(createButton).toBeEnabled({ timeout: 5000 });
  await createButton.click();

  // Wait for the service creation to complete. The form navigates to /serving
  // on success; on failure it stays on /service/start and surfaces feedback
  // via one of three channels: (1) an Ant Design error notification, (2) an
  // Ant Design error message toast, or (3) inline `Form.Item` validation
  // errors when `form.validateFields()` rejects. The original Promise.race
  // pattern only covered (1) and (2); when (3) fired, the URL wait silently
  // timed out with an opaque message and no clue as to which field was
  // invalid. Replace the race with a sequential wait that, on URL timeout,
  // scans all three error channels and surfaces whichever it finds.
  const errorNotification = page
    .locator('.ant-notification-notice-error, .ant-message-error')
    .first();

  try {
    await page.waitForURL('**/serving', { timeout: 60_000 });
  } catch (urlError) {
    // 1) Ant Design error notification / message toast
    const toastText = await errorNotification
      .textContent({ timeout: 1000 })
      .catch(() => null);
    if (toastText?.trim()) {
      throw new Error(
        `Service creation failed with error notification: ${toastText.trim()}`,
      );
    }

    // 2) Inline Form.Item validation errors (handleOk's validateFields catch)
    const fieldErrorTexts = await page
      .locator('.ant-form-item-explain-error')
      .allTextContents()
      .catch(() => [] as string[]);
    const fieldErrors = fieldErrorTexts.filter((t) => t.trim().length > 0);
    if (fieldErrors.length > 0) {
      throw new Error(
        `Service creation failed: form validation errors — ${fieldErrors.join(' | ')}`,
      );
    }

    // 3) No visible error, but we are still on /service/start (the form
    // debounces its state into the URL as ?formValues=...). Surface the
    // current URL so the reviewer can tell mutation-never-fired apart from
    // a slow backend.
    const currentUrl = page.url();
    throw new Error(
      `Service creation did not redirect to /serving within 60s. ` +
        `Current URL: ${currentUrl}. ` +
        `No error notification or form validation error was detected — ` +
        `the create mutation likely never fired (form submit blocked) or ` +
        `the backend deploy is hanging. Original error: ${
          (urlError as Error).message
        }`,
    );
  }

  await expect(
    page.getByRole('row').filter({ hasText: serviceName }).first(),
  ).toBeVisible({ timeout: 15000 });
}

/**
 * Polls the serving table until the service shows HEALTHY status.
 * Uses the table's refresh button (BAIFetchKeyButton) instead of full page
 * reload, which is lighter and avoids resetting the DOM state.
 */
async function waitForServiceReady(
  page: Page,
  serviceName: string,
): Promise<void> {
  await navigateTo(page, 'serving');

  const refreshButton = getTableRefreshButton(page);
  await expect(refreshButton).toBeVisible({ timeout: 10000 });

  await expect
    .poll(
      async () => {
        // Click the table refresh button to fetch latest data
        await refreshButton.click();
        // Wait briefly for the data to load after refresh
        await page.waitForTimeout(2000);
        const serviceRow = page
          .getByRole('row')
          .filter({ hasText: serviceName });
        const healthyBadge = serviceRow.getByText(/HEALTHY/i);
        return await healthyBadge
          .isVisible({ timeout: 2000 })
          .catch(() => false);
      },
      {
        message: `Waiting for service "${serviceName}" to become HEALTHY`,
        timeout: SERVICE_READY_TIMEOUT,
        intervals: [HEALTH_CHECK_INTERVAL],
      },
    )
    .toBe(true);
}

/**
 * Terminates a model service by name via the serving list row action.
 */
async function terminateService(
  page: Page,
  serviceName: string,
): Promise<void> {
  await navigateTo(page, 'serving');

  // Wait for the serving table to fully load before checking for the service.
  const refreshButton = getTableRefreshButton(page);
  await expect(refreshButton).toBeVisible({ timeout: 15000 });
  await refreshButton.click();

  // Wait for the table's loading indicator to clear. We cannot wait for a
  // data row to appear here: when every service has already been terminated
  // (e.g., by a prior run's afterAll or a retry after an earlier failure),
  // the table is legitimately empty and requiring a row would fail this
  // helper before its early-return check for a missing service.
  await page
    .locator('.ant-spin-spinning')
    .first()
    .waitFor({ state: 'hidden', timeout: 15000 })
    .catch(() => {
      // Spinner may never have appeared if data was served from cache.
    });

  const serviceRow = page.getByRole('row').filter({ hasText: serviceName });
  if ((await serviceRow.count()) === 0) {
    console.log(
      `Service "${serviceName}" not found, may already be terminated`,
    );
    return;
  }

  // Hover over the name cell to reveal BAINameActionCell actions
  await serviceRow.getByRole('cell').first().hover();
  const deleteButton = serviceRow
    .getByRole('button', { name: 'delete' })
    .first();
  await expect(deleteButton).toBeVisible({ timeout: 5000 });
  await deleteButton.click();

  const confirmButton = page
    .locator('.ant-modal-confirm')
    .getByRole('button', { name: 'Delete' })
    .first();
  await expect(confirmButton).toBeVisible({ timeout: 5000 });
  await confirmButton.click();

  await expect(page.getByRole('row').filter({ hasText: serviceName }))
    .toHaveCount(0, { timeout: 60000 })
    .catch(() => {
      console.log(`Service "${serviceName}" still visible, may be DESTROYING`);
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

test.describe(
  'Serving -- Model Service Deploy Lifecycle',
  { tag: ['@integration', '@serving'] },
  () => {
    test.describe.configure({ mode: 'serial' });
    test.setTimeout(240_000); // 4 minutes per test (3 min polling + overhead)

    test.afterAll(async ({ browser, request }, testInfo) => {
      testInfo.setTimeout(300_000);

      const context = await browser.newContext();
      const page = await context.newPage();

      try {
        await loginAsAdmin(page, request);
      } catch {
        console.log('afterAll: login failed, skipping cleanup');
        await context.close();
        return;
      }

      try {
        await terminateService(page, SERVICE_NAME);
      } catch {
        console.log(`Could not terminate service ${SERVICE_NAME}`);
      }

      try {
        await sweepServices(page);
      } catch {
        console.log('Could not sweep services');
      }

      try {
        await moveToTrashAndVerify(page, VFOLDER_NAME);
        await deleteForeverAndVerifyFromTrash(page, VFOLDER_NAME);
      } catch {
        console.log(`Could not delete vfolder ${VFOLDER_NAME}`);
      }

      try {
        await sweepVFolders(page);
      } catch {
        console.log('Could not sweep vfolders');
      }

      await context.close();
    });

    test('Admin can create a model vfolder and upload mock server files', async ({
      page,
      request,
    }) => {
      await loginAsAdmin(page, request);

      // Resolve image from config.toml's defaultSessionEnvironment
      resolvedImage = await resolveDefaultImage(page);

      // Create model vfolder
      await createVFolderAndVerify(page, VFOLDER_NAME, 'model');

      // Upload mock server fixtures. The helper verifies each uploaded file is
      // visible in the explorer before closing the modal, so no second pass is
      // needed here.
      await uploadFixturesToVFolder(page, VFOLDER_NAME, resolvedImage);
    });

    test('Admin can deploy a model service via ServiceLauncher UI', async ({
      page,
      request,
    }) => {
      await loginAsAdmin(page, request);

      await createServiceViaUI(page, SERVICE_NAME, VFOLDER_NAME);

      // Verify service appears in the serving list
      await navigateTo(page, 'serving');
      const serviceRow = page
        .getByRole('row')
        .filter({ hasText: SERVICE_NAME });
      await expect(serviceRow.first()).toBeVisible({ timeout: 15000 });
    });

    test('Deployed service reaches HEALTHY status', async ({
      page,
      request,
    }) => {
      await loginAsAdmin(page, request);

      await waitForServiceReady(page, SERVICE_NAME);

      // Verify the service row shows HEALTHY
      const serviceRow = page
        .getByRole('row')
        .filter({ hasText: SERVICE_NAME });
      await expect(serviceRow.getByText(/HEALTHY/i).first()).toBeVisible({
        timeout: 5000,
      });
    });

    test('Admin can terminate a deployed service', async ({
      page,
      request,
    }) => {
      await loginAsAdmin(page, request);

      await terminateService(page, SERVICE_NAME);

      // Verify service is removed or in DESTROYING state.
      // Click the table refresh button to get latest data.
      await navigateTo(page, 'serving');
      const refreshButton = getTableRefreshButton(page);
      await expect(refreshButton).toBeVisible({ timeout: 15000 });
      await refreshButton.click();
      await page.waitForTimeout(2000);

      // Service should eventually disappear
      await expect
        .poll(
          async () => {
            await refreshButton.click();
            await page.waitForTimeout(2000);
            return await page
              .getByRole('row')
              .filter({ hasText: SERVICE_NAME })
              .count();
          },
          {
            message: `Waiting for service "${SERVICE_NAME}" to be removed`,
            timeout: 60_000,
            intervals: [5_000],
          },
        )
        .toBe(0);
    });
  },
);
