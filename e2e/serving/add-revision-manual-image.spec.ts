// FR-3278: Regression test for adding a model-serving revision using a
// manually entered image name.
//
// Bug: In the "Add Revision" modal (Advanced/Custom mode), typing an image
// reference into the "Image Name (Manual)" field raised `Image is required.`
// and blocked submission — even though interactive session creation accepts
// the same manual image. Root cause was entirely client-side: the revision
// mutation references an image only by id (`ImageInput.id`), the manual field
// populates only a string, and the modal required `environments.image.id`. The
// fix resolves the manual reference to a registered image id via the
// `image(reference:)` query before committing, exactly like a dropdown pick.
//
// This test drives the real flow against a live backend: it opens a deployment
// that already has a current revision, loads that revision as a starting point,
// re-enters that revision's own image via the manual field, and asserts the
// manual image is accepted (no image-required error) and the `addModelRevision`
// mutation is dispatched carrying the resolved image id — i.e. the manual entry
// behaves identically to selecting the image from the dropdown.
import {
  loginAsAdmin,
  modifyConfigToml,
  navigateTo,
  userInfo,
  webServerEndpoint,
} from '../utils/test-util';
import { test, expect, APIRequestContext } from '@playwright/test';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
async function findServableDeployment(
  request: APIRequestContext,
): Promise<ServableDeployment | null> {
  await request.post(`${webServerEndpoint}/server/login`, {
    data: {
      username: userInfo.admin.email,
      password: userInfo.admin.password,
    },
  });
  const res = await request.post(`${webServerEndpoint}/func/admin/gql`, {
    data: {
      query: `query {
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
    },
  });
  if (!res.ok()) return null;

  type Node = {
    id: string;
    metadata: { status: string };
    currentRevision: {
      imageV2: { identity: { canonicalName: string; architecture?: string } };
    } | null;
  };
  const json = await res.json();
  const nodes: Node[] = (json?.data?.myDeployments?.edges ?? [])
    .map((e: { node: Node }) => e.node)
    .filter((n: Node) => n?.currentRevision?.imageV2?.identity?.canonicalName);
  const node = nodes.find((n) => n.metadata.status === 'READY') ?? nodes[0];
  if (!node) return null;

  const { canonicalName, architecture } =
    node.currentRevision!.imageV2.identity;
  // Global id is base64 of "ModelDeployment:<uuid>"; the detail route uses the
  // decoded local UUID.
  const deploymentId =
    Buffer.from(node.id, 'base64').toString('utf8').split(':')[1] ?? '';
  return {
    deploymentId,
    imageReference: architecture
      ? `${canonicalName}@${architecture}`
      : canonicalName,
  };
}

test.describe('Model Serving — Add Revision with manual image name (FR-3278)', () => {
  test('a manually entered image is accepted and submitted as a resolved image', async ({
    page,
    request,
  }) => {
    const servable = await findServableDeployment(request);
    test.skip(
      !servable,
      'No deployment with a current revision is available on this backend',
    );
    const { deploymentId, imageReference } = servable!;

    // The "Image Name (Manual)" field only renders when this client flag is on.
    await modifyConfigToml(page, request, {
      general: { allowManualImageNameForSession: true },
    });
    await loginAsAdmin(page, request);

    // Open the deployment detail page and launch the Add Revision modal.
    await navigateTo(page, `/deployments/${deploymentId}`);
    await page
      .getByRole('button', { name: 'Add Revision', exact: true })
      .first()
      .click();

    const modal = page.locator('.ant-modal');
    await modal.waitFor({ state: 'visible' });

    // Load the current revision as a starting point. This switches the modal to
    // Advanced mode and prefills every required field (model folder, resources,
    // runtime variant) plus the image via the dropdown. Wait for the "loaded"
    // toast so the async prefill has been applied.
    await modal.getByRole('button', { name: 'Load current revision' }).click();
    await expect(
      page.getByText('Current revision configuration loaded'),
    ).toBeVisible({ timeout: 15_000 });

    // The resource section (`ResourceAllocationFormItems`) loads its presets
    // under a Suspense boundary; its `resource.*` / cluster fields only register
    // once it mounts. Wait for the CPU field to appear with the prefilled value
    // so the submitted form actually carries the resource configuration.
    const cpuSpin = modal.getByRole('spinbutton').first();
    await expect(cpuSpin).toBeVisible({ timeout: 30_000 });
    await expect(cpuSpin).toHaveValue(/\d/, { timeout: 30_000 });

    // Replace the dropdown-selected image with a manually typed reference.
    // Typing into the manual field clears the dropdown image selection, so the
    // only image the form carries is the manual string — the exact scenario
    // that used to fail with "Image is required.".
    const manualImageInput = modal.getByLabel('Image Name (Manual)');
    await manualImageInput.waitFor({ state: 'visible' });
    await manualImageInput.fill(imageReference);

    // Do not spin up a replica.
    const autoApply = modal.getByRole('checkbox', {
      name: 'Apply immediately after adding',
    });
    if (await autoApply.isChecked()) {
      await autoApply.uncheck();
    }

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

    // The dispatched mutation carries a resolved image id (a real UUID), i.e.
    // the manually typed reference was looked up and sent as an image, exactly
    // like a dropdown selection.
    const req = await addRevisionRequest;
    const sentImageId = JSON.parse(req.postData() ?? '{}')?.variables?.input
      ?.image?.id;
    expect(
      sentImageId,
      'addModelRevision must carry a resolved image id',
    ).toMatch(UUID_RE);
  });
});
