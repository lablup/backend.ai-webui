// FR-3278: Regression test for adding a model-serving revision using a
// manually entered image name.
//
// Bug: In the "Add Revision" modal (Advanced/Custom mode), typing an image
// reference into the "Image Name (Manual)" field raised `Image is required.`
// and blocked submission. Root cause was entirely client-side: the revision
// mutation references an image only by id (`ImageInput.id`), the manual field
// populates only a string, and the modal required `environments.image.id`. The
// fix resolves the manual reference to a registered image id via the
// `image(reference:)` query before committing.
//
// These tests drive the real flow against a live backend on an existing
// deployment that already has a current revision:
//   1. a registered image typed manually is accepted and the mutation is
//      dispatched with the resolved image id;
//   2. an unregistered manual image name is rejected with a not-found error
//      shown on the "Image Name (Manual)" field (no mutation dispatched).
import { createAdminApiContext, gqlAdmin } from '../utils/admin-api';
import { cleanupVFolderSafely } from '../utils/cleanup-util';
import {
  cleanupDeploymentFixtures,
  cleanupDeploymentSafely,
  createDeploymentShell,
  escapeForRegExp,
  provisionDeploymentModelFolder,
  selectRevisionModalOption,
} from '../utils/deployment-fixtures';
import { skipUnlessManagerVersion } from '../utils/feature-gate-util';
import {
  createVFolderAndVerify,
  loginAsAdmin,
  modifyConfigToml,
  navigateTo,
} from '../utils/test-util';
import { getFormItemControlByLabel } from '../utils/test-util-antd';
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

interface ServableDeployment {
  /** Decoded local UUID used by the `/deployments/:id` route. */
  deploymentId: string;
  /**
   * The current revision's own image, formatted as
   * `registry/namespace:tag@architecture`. We re-enter this exact image via the
   * manual field so the rest of the (already valid) revision config is reused
   * unchanged — isolating the manual-image entry as the only variable.
   */
  imageReference: string;
}

/**
 * Finds a deployment whose current revision can be reused as a starting point.
 * Prefers a READY deployment, falling back to any deployment that has a current
 * revision. Returns null when the backend has none.
 */
async function findServableDeployment(): Promise<ServableDeployment | null> {
  type Node = {
    id: string;
    metadata: { status: string };
    currentRevision: {
      imageV2: { identity: { canonicalName: string; architecture?: string } };
    } | null;
  };
  const api = await createAdminApiContext();
  try {
    const data = await gqlAdmin<{
      myDeployments: { edges: Array<{ node: Node }> };
    }>(
      api,
      `query {
        myDeployments(limit: 200, offset: 0) {
          edges {
            node {
              id
              metadata { status }
              currentRevision {
                imageV2 { identity { canonicalName architecture } }
              }
            }
          }
        }
      }`,
    );
    const nodes = (data?.myDeployments?.edges ?? [])
      .map((e) => e.node)
      .filter((n) => n?.currentRevision?.imageV2?.identity?.canonicalName);
    const node = nodes.find((n) => n.metadata.status === 'READY') ?? nodes[0];
    if (!node) return null;

    const { canonicalName, architecture } =
      node.currentRevision!.imageV2.identity;
    // Global id is base64 of "ModelDeployment:<uuid>"; the detail route uses
    // the decoded local UUID.
    const deploymentId =
      Buffer.from(node.id, 'base64').toString('utf8').split(':')[1] ?? '';
    return {
      deploymentId,
      imageReference: architecture
        ? `${canonicalName}@${architecture}`
        : canonicalName,
    };
  } finally {
    await api.dispose();
  }
}

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

  const modal = page.locator('.ant-modal');
  await modal.waitFor({ state: 'visible' });

  // Load the current revision as a starting point: switches to Advanced mode and
  // prefills every required field. Wait for the "loaded" toast so the async
  // prefill has been applied.
  await modal.getByRole('button', { name: 'Load current revision' }).click();
  await expect(
    page.getByText('Current revision configuration loaded'),
  ).toBeVisible({ timeout: 15_000 });

  // The resource section (`ResourceAllocationFormItems`) loads its presets under
  // a Suspense boundary; its `resource.*` / cluster fields only register once it
  // mounts. Wait for the CPU field to appear with the prefilled value so the
  // submitted form actually carries the resource configuration.
  const cpuSpin = modal.getByRole('spinbutton').first();
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

test.describe('Model Serving — Add Revision with manual image name (FR-3278)', () => {
  test('a manually entered image is accepted and submitted as a resolved image', async ({
    page,
    request,
  }) => {
    const servable = await findServableDeployment();
    test.skip(
      !servable,
      'No deployment with a current revision is available on this backend',
    );
    const { deploymentId, imageReference } = servable!;

    const { modal, manualImageInput } =
      await openAdvancedAddRevisionWithManualImage(page, request, deploymentId);

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
    const servable = await findServableDeployment();
    test.skip(
      !servable,
      'No deployment with a current revision is available on this backend',
    );
    const { deploymentId } = servable!;

    const { modal, manualImageInput } =
      await openAdvancedAddRevisionWithManualImage(page, request, deploymentId);

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
});

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
        .getByRole('button', { name: 'Select Folder', exact: true })
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
