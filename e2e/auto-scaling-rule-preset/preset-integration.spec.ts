// spec: e2e/.agent-output/test-plan-auto-scaling-rule-preset.md
// section: 9. Preset Selectability in the Auto-Scaling Rule Editor (Integration)
//
// Prerequisites: A running Backend.AI cluster with model serving capability.
// This test deploys a brand-new model service, verifies the preset appears in the
// auto-scaling rule editor dropdown, then terminates the service in afterAll.
import { FolderExplorerModal } from '../utils/classes/vfolder/FolderExplorerModal';
import { sweepServices, sweepVFolders } from '../utils/cleanup-util';
import {
  loginAsAdmin,
  navigateTo,
  webuiEndpoint,
  createVFolderAndVerify,
} from '../utils/test-util';
import { test, expect, Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

function shortId(): string {
  return Math.random().toString(36).slice(2, 8);
}

const SERVICE_NAME = `e2e-svc-preset-${shortId()}`;
const VFOLDER_NAME = `e2e-mod-preset-${shortId()}`;
const FIXTURES_DIR = path.join(__dirname, '../serving/fixtures');

const DEFAULT_PYTHON_IMAGE =
  'cr.backend.ai/stable/python:3.9-ubuntu20.04@x86_64';

let resolvedImage = DEFAULT_PYTHON_IMAGE;

async function resolveDefaultImage(page: Page): Promise<string> {
  const image = await page.evaluate(() => {
    const client = (globalThis as any).backendaiclient;
    return client?._config?.default_session_environment || '';
  });
  return image || DEFAULT_PYTHON_IMAGE;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

async function createPreset(
  page: Page,
  name: string,
  metricName = 'e2e_metric',
  queryTemplate = 'up',
): Promise<void> {
  await page.goto(`${webuiEndpoint}/admin-serving?tab=auto-scaling-rule`);
  await page.getByRole('button', { name: /Add Preset/i }).click();
  const modal = page.getByRole('dialog');
  await expect(modal).toBeVisible({ timeout: 10000 });
  await expect(modal).not.toHaveClass(/ant-zoom-appear/, { timeout: 10000 });
  await modal.getByRole('textbox', { name: 'Name', exact: true }).fill(name);
  await modal.getByRole('textbox', { name: 'Metric Name' }).fill(metricName);
  await modal
    .getByRole('textbox', { name: 'Query Template' })
    .fill(queryTemplate);
  await modal.getByRole('button', { name: 'Create' }).click();
  await expect(
    page.getByText('Prometheus query preset has been successfully created.'),
  ).toBeVisible({ timeout: 10000 });
  await expect(modal).toBeHidden({ timeout: 30000 });
}

async function deletePreset(page: Page, presetName: string): Promise<void> {
  await page.goto(`${webuiEndpoint}/admin-serving?tab=auto-scaling-rule`);
  const row = page.getByRole('row').filter({ hasText: presetName });
  if ((await row.count()) === 0) return;
  await row.locator('button:has(.anticon-delete)').click();
  const confirmModal = page.getByRole('dialog');
  await expect(confirmModal).toBeVisible({ timeout: 30000 });
  await expect(confirmModal).not.toHaveClass(/ant-zoom-appear/, {
    timeout: 10000,
  });
  await confirmModal.locator('input').fill(presetName);
  await confirmModal
    .getByRole('button', { name: 'Delete', exact: true })
    .click();
  await expect(
    page.getByText('Prometheus query preset has been successfully deleted.'),
  ).toBeVisible({ timeout: 10000 });
  await expect(confirmModal).toBeHidden({ timeout: 30000 });
}

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

async function createServiceViaUI(
  page: Page,
  serviceName: string,
  vfolderName: string,
): Promise<void> {
  await navigateTo(page, 'service/start');

  const serviceNameInput = page.getByLabel('Service Name').first();
  await expect(serviceNameInput).toBeVisible({ timeout: 10000 });
  await serviceNameInput.fill(serviceName);

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

  const useConfigFileRadio = page.getByRole('radio', {
    name: 'Use Config File',
  });
  await page
    .locator('.ant-segmented-item-label', { hasText: 'Use Config File' })
    .click({ timeout: 10000 });
  await expect(useConfigFileRadio).toBeChecked({ timeout: 3000 });

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

  const acceleratorFormItem = page
    .locator('.ant-form-item')
    .filter({ hasText: 'AI Accelerator' })
    .first();
  const acceleratorSpinbutton = acceleratorFormItem.getByRole('spinbutton');
  if (
    await acceleratorSpinbutton.isVisible({ timeout: 5000 }).catch(() => false)
  ) {
    const isEditable = await acceleratorSpinbutton
      .isEditable({ timeout: 1000 })
      .catch(() => false);
    if (isEditable) {
      await acceleratorSpinbutton.scrollIntoViewIfNeeded();
      await acceleratorSpinbutton.click({ clickCount: 3 });
      await acceleratorSpinbutton.fill('0');
      await acceleratorSpinbutton.press('Tab');
      await expect(acceleratorSpinbutton).toHaveValue('0', { timeout: 5000 });
    }
  }

  const openToPublicCheckbox = page.getByLabel('Open To Public');
  await openToPublicCheckbox.scrollIntoViewIfNeeded();
  await expect(openToPublicCheckbox).toBeVisible({ timeout: 5000 });
  if (!(await openToPublicCheckbox.isChecked())) {
    await openToPublicCheckbox.check({ force: true });
  }
  await expect(openToPublicCheckbox).toBeChecked({ timeout: 3000 });

  const createButton = page.getByRole('button', { name: 'Create' });
  await expect(createButton).toBeEnabled({ timeout: 5000 });
  await createButton.click();

  try {
    await page.waitForURL('**/serving', { timeout: 60_000 });
  } catch {
    const errorNotification = page
      .locator('.ant-notification-notice-error, .ant-message-error')
      .first();
    const toastText = await errorNotification
      .textContent({ timeout: 1000 })
      .catch(() => null);
    if (toastText?.trim()) {
      throw new Error(`Service creation failed: ${toastText.trim()}`);
    }
    const formError = page.locator('.ant-form-item-explain-error').first();
    const formErrorText = await formError
      .textContent({ timeout: 1000 })
      .catch(() => null);
    if (formErrorText?.trim()) {
      throw new Error(`Service creation form error: ${formErrorText.trim()}`);
    }
    throw new Error('Service creation timed out navigating to /serving');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Integration Test Suite (Serial)
// ─────────────────────────────────────────────────────────────────────────────

test.describe(
  'Auto Scaling Rule Preset - Integration (Preset in Auto-Scaling Rule Editor)',
  { tag: ['@auto-scaling-rule-preset', '@admin', '@integration'] },
  () => {
    test.describe.configure({ mode: 'serial' });

    let presetName: string;
    let presetNameTimeWindow: string;

    test.afterAll(async ({ browser, request }) => {
      // Cleanup presets and services using a fresh context (page fixture not allowed in afterAll)
      const context = await browser.newContext();
      const page = await context.newPage();
      try {
        await loginAsAdmin(page, request);
      } catch {
        await context.close();
        return;
      }
      // Cleanup presets
      if (presetName) {
        try {
          await deletePreset(page, presetName);
        } catch {
          // ignore
        }
      }
      if (presetNameTimeWindow) {
        try {
          await deletePreset(page, presetNameTimeWindow);
        } catch {
          // ignore
        }
      }
      // Terminate the model service
      try {
        await sweepServices(page, new RegExp(SERVICE_NAME));
      } catch {
        // ignore
      }
      // Delete the model vfolder
      try {
        await sweepVFolders(page, new RegExp(VFOLDER_NAME));
      } catch {
        // ignore
      }
      await context.close();
    });

    // 9.1 A newly created Prometheus Query Preset appears in the auto-scaling rule editor dropdown
    test('Superadmin can find a newly created preset in the auto-scaling rule editor Prometheus dropdown', async ({
      page,
      request,
    }) => {
      test.setTimeout(300_000);

      // Step 1: Login
      await loginAsAdmin(page, request);

      // Step 2: Create the integration preset
      const timestamp = Date.now();
      presetName = `e2e-preset-integration-${timestamp}`;

      await page.goto(`${webuiEndpoint}/admin-serving?tab=auto-scaling-rule`);
      await page.getByRole('button', { name: /Add Preset/i }).click();
      const createModal = page.getByRole('dialog');
      await expect(createModal).toBeVisible({ timeout: 10000 });
      await expect(createModal).not.toHaveClass(/ant-zoom-appear/, {
        timeout: 10000,
      });
      await createModal
        .getByRole('textbox', { name: 'Name', exact: true })
        .fill(presetName);
      await createModal
        .getByRole('textbox', { name: 'Metric Name' })
        .fill('e2e_integration_metric');
      await createModal
        .getByRole('textbox', { name: 'Query Template' })
        .fill('rate(http_requests_total{job="e2e-test"}[5m])');

      // Click "Create"
      await createModal.getByRole('button', { name: 'Create' }).click();

      // Verify success notification
      await expect(
        page.getByText(
          'Prometheus query preset has been successfully created.',
        ),
      ).toBeVisible({ timeout: 10000 });
      await expect(createModal).toBeHidden({ timeout: 30000 });

      // Verify the preset row appears in the table
      await expect(
        page.getByRole('row').filter({ hasText: presetName }),
      ).toBeVisible({ timeout: 10000 });

      // Step 3: Resolve default image from config
      resolvedImage = await resolveDefaultImage(page);

      // Step 4: Create a model vfolder
      await createVFolderAndVerify(page, VFOLDER_NAME, 'model');

      // Step 5: Upload fixtures to the vfolder
      await uploadFixturesToVFolder(page, VFOLDER_NAME, resolvedImage);

      // Step 6: Deploy a brand-new model service
      await createServiceViaUI(page, SERVICE_NAME, VFOLDER_NAME);

      // Step 7: Verify the service row appears in the serving table
      const serviceRow = page
        .getByRole('row')
        .filter({ hasText: SERVICE_NAME });
      await expect(serviceRow).toBeVisible({ timeout: 60_000 });

      // Step 8: Navigate to the endpoint detail page
      await serviceRow
        .getByRole('link', { name: SERVICE_NAME })
        .first()
        .click();

      // Step 9: Locate the "Auto Scaling Rules" section and click "Add Rules"
      const addRulesButton = page
        .getByRole('button', { name: /Add.*Auto.*Scaling.*Rule|Add Rules/i })
        .first();
      await expect(addRulesButton).toBeVisible({ timeout: 30_000 });
      await addRulesButton.click();

      // Step 10: Verify the Add Auto Scaling Rule modal opens
      const ruleModal = page.getByRole('dialog');
      await expect(ruleModal).toBeVisible({ timeout: 10000 });
      await expect(ruleModal).not.toHaveClass(/ant-zoom-appear/, {
        timeout: 10000,
      });
      await expect(ruleModal).toContainText(/Auto Scaling Rule/i);

      // Step 11: Set Metric Source to "Prometheus"
      const metricSourceSelect = ruleModal.getByRole('combobox', {
        name: /Metric Source/i,
      });
      await expect(metricSourceSelect).toBeVisible({ timeout: 10000 });
      await metricSourceSelect.click();
      const prometheusItem = page
        .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')
        .last()
        .locator('.ant-select-item-option', { hasText: 'Prometheus' });
      await expect(prometheusItem).toBeVisible({ timeout: 10000 });
      await prometheusItem.click();

      // Step 12: Verify the Metric Name (Prometheus Preset) select field is visible
      const prometheusPresetSelect = ruleModal.getByRole('combobox', {
        name: /Metric Name.*Prometheus.*Preset/i,
      });
      await expect(prometheusPresetSelect).toBeVisible({ timeout: 10000 });

      // Step 13: Click the dropdown and verify the test preset is listed
      await prometheusPresetSelect.click();
      // Use .last() to pick the actively appearing dropdown (the previous one may still be in leave-animation)
      const presetOption = page
        .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')
        .last()
        .locator('.ant-select-item-option', { hasText: presetName });
      await expect(presetOption).toBeVisible({ timeout: 10000 });

      // Step 14: Select the test preset
      await presetOption.click();

      // Step 15: Verify the (hidden) Metric Name field is auto-filled
      // The Metric Name field is hidden (display:none) when Prometheus is selected,
      // since the field is controlled via form.setFieldsValue. Check via DOM input value.
      const metricNameInput = ruleModal.locator('input[id*="metricName"]');
      await expect(metricNameInput).toHaveValue('e2e_integration_metric', {
        timeout: 5000,
      });

      // Step 16: Cancel the modal
      await ruleModal.getByRole('button', { name: 'Cancel' }).click();
      await expect(ruleModal).toBeHidden({ timeout: 30000 });
    });

    // 9.2 Selecting a Prometheus preset auto-fills the Metric Name and Cool Down Seconds
    test('Superadmin sees Metric Name auto-filled when selecting a preset with Time Window in the editor', async ({
      page,
      request,
    }) => {
      test.setTimeout(300_000);

      // Login (reuses existing service from 9.1 in serial mode)
      await loginAsAdmin(page, request);

      // Create a second preset with Time Window
      const timestamp = Date.now();
      presetNameTimeWindow = `e2e-preset-integration-timewindow-${timestamp}`;

      await createPreset(page, presetNameTimeWindow, 'e2e_tw_metric', 'up');

      // Fill Time Window for this second preset via edit modal
      await page.goto(`${webuiEndpoint}/admin-serving?tab=auto-scaling-rule`);
      const twRow = page
        .getByRole('row')
        .filter({ hasText: presetNameTimeWindow });
      await expect(twRow).toBeVisible({ timeout: 10000 });
      await twRow.getByRole('button', { name: 'edit' }).click();
      const editModal = page.getByRole('dialog');
      await expect(editModal).toBeVisible({ timeout: 10000 });
      await expect(editModal).not.toHaveClass(/ant-zoom-appear/, {
        timeout: 10000,
      });
      await editModal
        .getByRole('textbox', { name: 'Time Window (optional)' })
        .fill('15m');
      await editModal.getByRole('button', { name: 'Save' }).click();
      await expect(
        page.getByText(
          'Prometheus query preset has been successfully updated.',
        ),
      ).toBeVisible({ timeout: 10000 });
      await expect(editModal).toBeHidden({ timeout: 30000 });

      // Navigate to the endpoint detail page for the service from test 9.1
      await navigateTo(page, 'serving');
      const serviceRow = page
        .getByRole('row')
        .filter({ hasText: SERVICE_NAME });
      await expect(serviceRow).toBeVisible({ timeout: 30_000 });
      await serviceRow
        .getByRole('link', { name: SERVICE_NAME })
        .first()
        .click();

      // Open the "Add Auto Scaling Rule" modal
      const addRulesButton = page
        .getByRole('button', { name: /Add.*Auto.*Scaling.*Rule|Add Rules/i })
        .first();
      await expect(addRulesButton).toBeVisible({ timeout: 30_000 });
      await addRulesButton.click();

      const ruleModal = page.getByRole('dialog');
      await expect(ruleModal).toBeVisible({ timeout: 10000 });
      await expect(ruleModal).not.toHaveClass(/ant-zoom-appear/, {
        timeout: 10000,
      });

      // Set Metric Source to "Prometheus"
      const metricSourceSelect = ruleModal.getByRole('combobox', {
        name: /Metric Source/i,
      });
      await metricSourceSelect.click();
      const prometheusItemTw = page
        .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')
        .last()
        .locator('.ant-select-item-option', { hasText: 'Prometheus' });
      await expect(prometheusItemTw).toBeVisible({ timeout: 10000 });
      await prometheusItemTw.click();

      // Select the time-window preset
      const prometheusPresetSelect = ruleModal.getByRole('combobox', {
        name: /Metric Name.*Prometheus.*Preset/i,
      });
      await expect(prometheusPresetSelect).toBeVisible({ timeout: 10000 });
      await prometheusPresetSelect.click();
      const twPresetOption = page
        .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')
        .last()
        .locator('.ant-select-item-option', { hasText: presetNameTimeWindow });
      await expect(twPresetOption).toBeVisible({ timeout: 10000 });
      await twPresetOption.click();

      // Verify the hidden Metric Name field is auto-filled
      // The Metric Name field is hidden (display:none) when Prometheus is selected,
      // since the field is controlled via form.setFieldsValue. Check via DOM input value.
      const metricNameInputTw = ruleModal.locator('input[id*="metricName"]');
      await expect(metricNameInputTw).toHaveValue('e2e_tw_metric', {
        timeout: 5000,
      });

      // Cancel the modal
      await ruleModal.getByRole('button', { name: 'Cancel' }).click();
      await expect(ruleModal).toBeHidden({ timeout: 30000 });
    });
  },
);
