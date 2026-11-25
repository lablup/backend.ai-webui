// FR-3278: adding a revision with a manually entered image name must resolve
// it to a registered image id instead of failing with "Image is required.".
import {
  createAdminApiContext,
  createDeploymentWithRevisionViaApi,
  createModelVFolderViaApi,
  deleteDeploymentViaApi,
  purgeVFoldersByNameViaApi,
} from '../../utils/admin-api';
import { cleanupVFolderSafely } from '../../utils/cleanup-util';
import {
  cleanupDeploymentFixtures,
  cleanupDeploymentSafely,
  createDeploymentShell,
  escapeForRegExp,
  provisionDeploymentModelFolder,
  selectRevisionModalOption,
} from '../../utils/deployment-fixtures';
import {
  getE2EDomainName,
  getE2EProjectName,
  getE2EVFolderHost,
} from '../../utils/e2e-scope';
import { skipUnlessManagerVersion } from '../../utils/feature-gate-util';
import {
  createVFolderAndVerify,
  loginAsAdmin,
  modifyConfigToml,
  navigateTo,
  userInfo,
} from '../../utils/test-util';
import { getFormItemControlByLabel } from '../../utils/test-util-antd';
import {
  test,
  expect,
  Page,
  Locator,
  APIRequestContext,
} from '@playwright/test';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// A reference that does not match any registered image on the backend.
const UNREGISTERED_IMAGE = 'cr.backend.ai/nonexistent/nope-fr3278:0.0.0@x86_64';

/**
 * Opens the Add Revision modal on a deployment, switches it to Advanced mode by
 * loading the current revision (which prefills every required field), and waits
 * until the manual image field is interactable. Returns the modal and the
 * manual-image input.
 */
async function openAdvancedAddRevisionWithManualImage(
  page: Page,
  request: APIRequestContext,
  deploymentId: string,
): Promise<{ modal: Locator; manualImageInput: Locator }> {
  // The "Image Name (Manual)" field only renders when this client flag is on.
  await modifyConfigToml(page, request, {
    general: { allowManualImageNameForSession: true },
  });
  await loginAsAdmin(page, request);

  await navigateTo(page, `/deployments/${deploymentId}`);
  await page
    .getByRole('button', { name: 'Add Revision', exact: true })
    .first()
    .click();

  const modal = page.getByRole('dialog', { name: /Add Revision/ });
  await expect(modal).toBeVisible({ timeout: 20_000 });

  // Switches to Advanced mode and prefills every required field.
  await modal.getByRole('button', { name: 'Load current revision' }).click();
  await expect(
    page.getByText('Current revision configuration loaded'),
  ).toBeVisible({ timeout: 15_000 });

  // The resource fields mount under Suspense; wait for the prefilled CPU value
  // so the submitted form carries the resource configuration.
  const cpuSpin = modal
    .locator('.uic-form-item')
    .filter({
      has: page.locator('.uic-form-item__label', { hasText: /^CPU$/ }),
    })
    .locator('.uic-form-item__control-input')
    .getByRole('spinbutton')
    .first();
  await expect(cpuSpin).toBeVisible({ timeout: 30_000 });
  await expect(cpuSpin).toHaveValue(/\d/, { timeout: 30_000 });

  const manualImageInput = modal.getByLabel('Image Name (Manual)');
  await manualImageInput.waitFor({ state: 'visible' });

  // Do not spin up a replica.
  const autoApply = modal.getByRole('checkbox', {
    name: 'Apply immediately after adding',
  });
  if (await autoApply.isChecked()) {
    await autoApply.uncheck();
  }

  return { modal, manualImageInput };
}

test.describe(
  'Model Serving — Add Revision with manual image name (FR-3278)',
  { tag: ['@serving', '@deploy', '@functional', '@regression'] },
  () => {
    // A zero-replica `e2e-gh11213-*` deployment with a current revision, so
    // "Load current revision" has something to prefill and nothing is scheduled.
    let deployment: { id: string; imageReference: string } | undefined;
    let deploymentId: string | undefined;
    let folderName: string | undefined;

    test.beforeAll(async () => {
      test.setTimeout(180_000);
      const api = await createAdminApiContext();
      try {
        const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        folderName = `e2e-gh11213-model-${suffix}`;
        const modelFolderId = await createModelVFolderViaApi(
          api,
          folderName,
          await getE2EVFolderHost(userInfo.admin),
        );
        deployment = await createDeploymentWithRevisionViaApi(api, {
          name: `e2e-gh11213-manual-image-${suffix}`,
          domainName: await getE2EDomainName(api),
          projectName: await getE2EProjectName(api),
          modelFolderId,
          onCreated: (id) => (deploymentId = id),
        });
      } finally {
        await api.dispose();
      }
    });

    test.afterAll(async () => {
      if (deploymentId) {
        const api = await createAdminApiContext();
        try {
          if (!(await deleteDeploymentViaApi(api, deploymentId))) {
            throw new Error(`Could not delete deployment ${deploymentId}`);
          }
        } finally {
          await api.dispose();
        }
      }
      // The soft-deleted deployment can hold the mount for a moment; retry.
      if (folderName) {
        await expect(() => purgeVFoldersByNameViaApi([folderName!])).toPass({
          timeout: 60_000,
        });
      }
    });

    test('a manually entered image is accepted and submitted as a resolved image', async ({
      page,
      request,
    }) => {
      const { id, imageReference } = deployment!;
      const { modal, manualImageInput } =
        await openAdvancedAddRevisionWithManualImage(page, request, id);

      // Replace the dropdown-selected image with a manually typed reference.
      // Typing into the manual field clears the dropdown image selection, so the
      // only image the form carries is the manual string — the exact scenario
      // that used to fail with "Image is required.".
      await manualImageInput.fill(imageReference);

      // Submitting must dispatch the revision mutation carrying an image id
      // resolved from the manual reference — proving the manual entry is treated
      // as a real image rather than being blocked at validation.
      const addRevisionRequest = page.waitForRequest(
        (req) =>
          req.url().includes('/admin/gql') &&
          req.method() === 'POST' &&
          (req.postData() ?? '').includes('addModelRevision'),
        { timeout: 30_000 },
      );
      await modal
        .getByRole('button', { name: 'Add Revision', exact: true })
        .click();

      // The manual image never trips the false "Image is required." validation.
      await expect(modal.getByText('Image is required.')).toHaveCount(0);

      // The dispatched mutation carries a resolved image id (a real UUID).
      const req = await addRevisionRequest;
      const sentImageId = JSON.parse(req.postData() ?? '{}')?.variables?.input
        ?.image?.id;
      expect(
        sentImageId,
        'addModelRevision must carry a resolved image id',
      ).toMatch(UUID_RE);
    });

    test('an unregistered manual image name shows a not-found error on the manual field', async ({
      page,
      request,
    }) => {
      const { modal, manualImageInput } =
        await openAdvancedAddRevisionWithManualImage(
          page,
          request,
          deployment!.id,
        );

      await manualImageInput.fill(UNREGISTERED_IMAGE);
      await modal
        .getByRole('button', { name: 'Add Revision', exact: true })
        .click();

      // The not-found error is surfaced on the "Image Name (Manual)" form item
      // (not the version dropdown, and not a generic toast): the manual field's
      // Form.Item shows the error in its own explain-error slot.
      const manualFormItem = modal
        .locator('.uic-form-item')
        .filter({ hasText: 'Image Name (Manual)' });
      await expect(
        manualFormItem.locator('.uic-form-item__explain-error'),
      ).toContainText('could not be found', { timeout: 15_000 });

      // No revision is created for an unresolved image.
      await expect(page.getByText('Revision has been added.')).toHaveCount(0);
    });
  },
);

// #10038: the Advanced Mode "Additional Mounts" field is a paged folder select
// (BAIVFolderMountConfigInput) instead of the old VFolderTable. A real revision
// is built by hand, as in deployment-lifecycle's Advanced Mode test, with one
// general folder mounted next to a provisioned model folder.
test.describe(
  'Model Serving — Add Revision additional mounts (#10038)',
  {
    tag: [
      '@serving',
      '@deploy',
      '@functional',
      '@regression',
      '@requires-manager-v26.10',
    ],
  },
  () => {
    // Cleanup runs in afterEach so it still has a live page after a timeout.
    let deploymentName: string | undefined;
    let modelFolderName: string | undefined;
    let dataFolderName: string | undefined;

    test.afterEach(async ({ page }) => {
      if (deploymentName) {
        await cleanupDeploymentSafely(page, deploymentName);
      }
      if (dataFolderName) {
        await cleanupVFolderSafely(page, dataFolderName);
      }
      if (modelFolderName) {
        await cleanupDeploymentFixtures(page, { folderName: modelFolderName });
      }
      deploymentName = modelFolderName = dataFolderName = undefined;
    });

    test('Admin can add a revision that mounts an additional general folder', async ({
      page,
      request,
    }) => {
      test.setTimeout(360_000);

      // The Environments / Version select only lists installed images unless
      // this flag is on; see deployment-lifecycle's Advanced Mode test.
      await modifyConfigToml(page, request, {
        environments: { showNonInstalledImages: true },
      });
      await loginAsAdmin(page, request);
      await skipUnlessManagerVersion(
        page,
        '26.10.0a1',
        'The paged Additional Mounts select reads scopedVFoldersV2 (manager >= 26.10, #10038)',
      );

      modelFolderName = await provisionDeploymentModelFolder(page);
      // Shares the model folder's name as a prefix, so one search lists both.
      // Names are set before creating, so a half-verified create is cleaned up.
      dataFolderName = `${modelFolderName}-data`;
      await createVFolderAndVerify(page, dataFolderName, 'general');

      // `e2e-plan-` keeps it in the global teardown's deployment sweep.
      deploymentName = `e2e-plan-gh10038-mounts-${Date.now()}`;
      await navigateTo(page, 'deployments');
      await createDeploymentShell(page, deploymentName);

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

      await selectRevisionModalOption(page, 'Model Folder', modelFolderName);
      await selectRevisionModalOption(page, 'Runtime', 'custom');
      const startCommandControl = getFormItemControlByLabel(
        page,
        /^(Start )?Command(?! \()/,
      );
      await expect(startCommandControl).toBeVisible({ timeout: 10000 });
      await startCommandControl
        .getByRole('textbox')
        .fill('python3 /models/mock_openai_server.py');

      // Resources: above the default image's minimum footprint.
      await expect(
        dialog.getByRole('button', { name: 'Resource Presets' }),
      ).toBeVisible({ timeout: 30000 });
      const cpuInput = getFormItemControlByLabel(page, 'CPU')
        .getByRole('spinbutton')
        .first();
      await cpuInput.click();
      await cpuInput.fill('5');
      await cpuInput.blur();
      await getFormItemControlByLabel(page, 'Memory')
        .getByRole('spinbutton')
        .first()
        .fill('4');

      // Additional Mounts lives in the collapsed Advanced Settings section.
      await dialog.getByRole('button', { name: 'Advanced Settings' }).click();
      const mountsControl = getFormItemControlByLabel(
        page,
        'Additional Mounts',
      );
      await expect(mountsControl).toBeVisible({ timeout: 30000 });
      await mountsControl
        .getByRole('combobox', { name: 'Select Folder', exact: true })
        .click();
      const popup = page.getByRole('dialog', {
        name: 'Select Folder',
        exact: true,
      });
      await expect(popup).toBeVisible({ timeout: 10000 });
      // A search matching both folders offers only the general one: model
      // folders are not offered as data mounts.
      await popup
        .getByRole('combobox', { name: 'Search options', exact: true })
        .fill(modelFolderName);
      const dataOption = popup.getByRole('option', { name: dataFolderName });
      await expect(dataOption).toHaveCount(1, { timeout: 15000 });
      await expect(
        popup.getByRole('option', {
          name: new RegExp(`${escapeForRegExp(modelFolderName)}(?!-data)`),
        }),
      ).toHaveCount(0);
      await dataOption.click();
      await page.keyboard.press('Escape');
      await expect(popup).toBeHidden({ timeout: 5000 });
      await expect(dialog).toBeVisible();

      // The picked folder shows as a source → destination row.
      const mountRow = mountsControl
        .getByRole('listitem')
        .filter({ hasText: dataFolderName });
      await expect(mountRow).toBeVisible();
      await expect(
        mountRow.getByRole('textbox', { name: 'Mount path' }),
      ).toHaveAttribute('placeholder', `/home/work/${dataFolderName}`);

      const autoApply = dialog.getByRole('checkbox', {
        name: 'Apply immediately after adding',
      });
      await autoApply.setChecked(false);

      await dialog
        .getByRole('button', { name: 'Add Revision', exact: true })
        .click();
      await expect(dialog).toBeHidden({ timeout: 20000 });

      // The new revision carries the mount.
      const revisionDetailDialog = page.getByRole('dialog', {
        name: 'Revision Detail',
      });
      await expect(revisionDetailDialog).toBeVisible({ timeout: 10000 });
      await expect(
        revisionDetailDialog.getByText(dataFolderName, { exact: true }),
      ).toBeVisible();
      await expect(
        revisionDetailDialog.getByText(`/home/work/${dataFolderName}`, {
          exact: true,
        }),
      ).toBeVisible();
      await revisionDetailDialog.getByRole('button', { name: 'Close' }).click();
      await expect(revisionDetailDialog).toBeHidden({ timeout: 10000 });
    });
  },
);
