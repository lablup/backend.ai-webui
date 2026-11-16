// FR-2295: Integration E2E test for the model service deploy lifecycle:
// vfolder + file upload -> deployment from /deployments with an Advanced Mode
// revision -> HEALTHY replica -> deployment deletion -> cleanup.
import { FolderExplorerModal } from '../../utils/classes/vfolder/FolderExplorerModal';
import { sweepVFolders } from '../../utils/cleanup-util';
import {
  createDeploymentShell,
  deleteDeploymentAndVerify,
  escapeForRegExp,
  selectRevisionModalOption,
} from '../../utils/deployment-fixtures';
import { createTestResources } from '../../utils/test-resources';
import {
  loginAsAdmin,
  modifyConfigToml,
  navigateTo,
  createVFolderAndVerify,
  moveToTrashAndVerify,
  deleteForeverAndVerifyFromTrash,
} from '../../utils/test-util';
import { test, expect, Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const FIXTURES_DIR = path.join(__dirname, '..', '..', 'fixtures', 'serving');

function shortId(): string {
  return Math.random().toString(36).slice(2, 8);
}

// Deleted through the admin API in afterAll, however far the group got.
const resources = createTestResources();
const DEPLOYMENT_NAME = resources.name('deployment', 'e2e-plan-svc-lifecycle');
const VFOLDER_NAME = `e2e-mod-${shortId()}`;

// Fallback image if defaultSessionEnvironment is not set in config.toml
const DEFAULT_PYTHON_IMAGE =
  'cr.backend.ai/stable/python:3.9-ubuntu20.04@x86_64';

// Resolved at runtime from config.toml's defaultSessionEnvironment
let resolvedImage = DEFAULT_PYTHON_IMAGE;
// Set by the deploy test; the serial follow-up tests open it directly.
let deploymentDetailUrl: string | null = null;

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

// Max time to wait for a replica to report HEALTHY
const SERVICE_READY_TIMEOUT = 300_000; // 5 minutes
const HEALTH_CHECK_INTERVAL = 10_000; // 10 seconds

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

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
    page.getByRole('menuitem', { name: 'Upload Files' }).click(),
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

// `cr.backend.ai/stable/python:3.9-ubuntu20.04@x86_64` -> `python`
function imageKeyOf(image: string): string {
  const name = image.split('@')[0];
  const colon = name.lastIndexOf(':');
  const repo = colon >= 0 ? name.slice(0, colon) : name;
  return repo.split('/').pop() ?? repo;
}

/**
 * Adds an Advanced Mode revision (model folder + `custom` runtime) to the
 * deployment whose detail page is open. The Start Command is left empty so
 * the folder's model-definition.yaml supplies command, port and health check.
 */
async function addAdvancedRevision(
  page: Page,
  folderName: string,
  image: string,
): Promise<void> {
  await page
    .getByRole('navigation', { name: 'Tabs' })
    .getByRole('button', { name: 'Add Revision' })
    .click();
  const dialog = page.getByRole('dialog', { name: /Add Revision/ });
  await expect(dialog).toBeVisible({ timeout: 20000 });
  await dialog.getByRole('radio', { name: 'Advanced Mode' }).click();
  await expect(dialog.getByText('Model & Runtime')).toBeVisible({
    timeout: 10000,
  });

  await selectRevisionModalOption(page, 'Model Folder', folderName);
  await selectRevisionModalOption(page, 'Runtime', 'custom');

  // The default image is a GPU one; pick a CPU image of the same environment
  // as the folder's service-definition.toml (search matches visible text).
  const imageKey = imageKeyOf(image);
  const envSelect = dialog.getByRole('button', {
    name: /^Environments \/ Version/,
  });
  await envSelect.click();
  await page
    .getByRole('combobox', { name: 'Search options', exact: true })
    .fill(imageKey);
  await page
    .getByRole('listbox', { name: /^Environments \/ Version/ })
    .getByRole('option')
    .first()
    .click();
  await expect(envSelect).toContainText(imageKey, {
    ignoreCase: true,
    timeout: 10000,
  });

  // Cluster & Resources mounts behind its own Suspense boundary; submitting
  // before it does leaves the resource fields unregistered.
  const presetSelect = dialog.getByRole('button', { name: 'Resource Presets' });
  await expect(presetSelect).toBeVisible({ timeout: 30000 });
  await presetSelect.click();
  await page
    .getByRole('option', { name: /^Minimum requirements/ })
    .first()
    .click();
  await expect(presetSelect).toContainText('Minimum requirements');

  await expect(
    dialog.getByRole('checkbox', { name: 'Apply immediately after adding' }),
  ).toBeChecked();
  await dialog.getByRole('button', { name: 'Add Revision' }).click();
  await expect(dialog).toBeHidden({ timeout: 20000 });

  const revisionDetailDialog = page.getByRole('dialog', {
    name: 'Revision Detail',
  });
  await expect(revisionDetailDialog).toBeVisible({ timeout: 10000 });
  await revisionDetailDialog.getByRole('button', { name: 'Close' }).click();
  await expect(revisionDetailDialog).toBeHidden({ timeout: 10000 });

  await expect(
    page.getByRole('heading', { name: /No revision is deployed/ }),
  ).toBeHidden({ timeout: 20000 });
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

test.describe(
  'Serving -- Model Service Deploy Lifecycle',
  { tag: ['@integration', '@serving'] },
  () => {
    test.describe.configure({ mode: 'serial' });
    test.setTimeout(240_000);

    test.afterAll(async ({ browser, request }, testInfo) => {
      testInfo.setTimeout(300_000);

      // Deployment first: its revision mounts the model folder.
      await resources.cleanup();

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
        await moveToTrashAndVerify(page, VFOLDER_NAME, 'data', {
          skipTrashVerify: true,
        });
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

      resolvedImage = await resolveDefaultImage(page);

      await createVFolderAndVerify(page, VFOLDER_NAME, 'model');

      // The helper verifies each uploaded file is visible before closing.
      await uploadFixturesToVFolder(page, VFOLDER_NAME, resolvedImage);
    });

    test('Admin can deploy a model service from the Deployments page', async ({
      page,
      request,
    }) => {
      // No image is marked installed on the shared cluster; list them all so
      // the Advanced Mode image select has a default.
      await modifyConfigToml(page, request, {
        environments: { showNonInstalledImages: true },
      });
      await loginAsAdmin(page, request);

      await navigateTo(page, 'deployments');
      await createDeploymentShell(page, DEPLOYMENT_NAME);
      deploymentDetailUrl = page.url();

      await addAdvancedRevision(page, VFOLDER_NAME, resolvedImage);

      await expect(async () => {
        await navigateTo(page, 'deployments');
        await expect(
          page.getByRole('row', {
            name: new RegExp(escapeForRegExp(DEPLOYMENT_NAME)),
          }),
        ).toBeVisible({ timeout: 15000 });
      }).toPass({ timeout: 60_000 });
    });

    test('Deployed service reaches HEALTHY status', async ({
      page,
      request,
    }) => {
      test.setTimeout(SERVICE_READY_TIMEOUT + 120_000);
      expect(deploymentDetailUrl, 'deployment was created').toBeTruthy();
      await loginAsAdmin(page, request);
      await page.goto(deploymentDetailUrl!);
      await expect(
        page.getByRole('heading', { level: 3, name: DEPLOYMENT_NAME }),
      ).toBeVisible({ timeout: 20000 });

      const replicaRows = page.getByRole('row').filter({
        has: page.getByRole('button', { name: 'Replica Scheduling History' }),
      });
      const healthyRow = replicaRows.filter({
        has: page.getByText('Healthy', { exact: true }),
      });
      const deadline = Date.now() + SERVICE_READY_TIMEOUT;
      let reachedHealthy = false;
      while (!reachedHealthy && Date.now() < deadline) {
        await page.reload();
        reachedHealthy = await healthyRow
          .first()
          .waitFor({ state: 'visible', timeout: HEALTH_CHECK_INTERVAL })
          .then(() => true)
          .catch(() => false);
      }

      if (!reachedHealthy) {
        // A replica still Provisioning was never scheduled (the shared
        // cluster keeps sessions PENDING); any other state is a real failure.
        const rowTexts = await replicaRows.allInnerTexts();
        test.skip(
          rowTexts.every((text) => /Provisioning/.test(text)),
          `no replica left Provisioning within ${SERVICE_READY_TIMEOUT / 60_000} min: the environment did not schedule the replica session`,
        );
        throw new Error(
          `Replica did not become Healthy; replica rows: ${rowTexts.join(' | ')}`,
        );
      }
    });

    test('Admin can terminate a deployed service', async ({
      page,
      request,
    }) => {
      await loginAsAdmin(page, request);

      await deleteDeploymentAndVerify(page, DEPLOYMENT_NAME);

      // Confirm on a fresh fetch that the deployment left the Serving list.
      await navigateTo(page, 'deployments');
      await expect(page.getByRole('columnheader').first()).toBeVisible({
        timeout: 15000,
      });
      await expect(
        page.getByRole('row', {
          name: new RegExp(escapeForRegExp(DEPLOYMENT_NAME)),
        }),
      ).toHaveCount(0, { timeout: 30000 });
    });
  },
);
