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
import { loginAsAdmin, modifyConfigToml, navigateTo } from '../utils/test-util';
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
      .locator('.ant-form-item')
      .filter({ hasText: 'Image Name (Manual)' });
    await expect(
      manualFormItem.locator('.ant-form-item-explain-error'),
    ).toContainText('could not be found', { timeout: 15_000 });

    // No revision is created for an unresolved image.
    await expect(page.getByText('Revision has been added.')).toHaveCount(0);
  });
});
