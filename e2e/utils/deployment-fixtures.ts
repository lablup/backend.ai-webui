/**
 * Self-contained provisioning for the deployment e2e specs.
 *
 * The Add Revision flow needs (1) a selectable deployment preset and (2) a
 * selectable model VFolder. Earlier revisions of the deployment specs assumed
 * a pre-seeded `mockvllm-preset` + `mockllm-svc` pair existed on the target
 * cluster, which silently fails on any cluster that has not been hand-seeded.
 * These helpers make each run self-sufficient instead:
 *
 *  - The preset is FOUND-OR-CREATED: if the cluster already has a preset
 *    compatible with the provisioned model folder (see
 *    {@link findCompatiblePreset} for the exact criteria), it is reused
 *    as-is and never modified or deleted; otherwise one is created as the
 *    admin over GraphQL (`adminCreateDeploymentRevisionPreset` — the admin
 *    preset-creation wizard is a heavy multi-step form that is not what
 *    these specs verify) and torn down at cleanup. The required
 *    `runtimeVariantId`/`imageId` are resolved dynamically by name — they
 *    are per-cluster UUIDs.
 *  - The model folder is created through the same UI helpers the vfolder
 *    specs use, then seeded with `e2e/serving/fixtures/` (a GPU-free mock
 *    OpenAI server, its model-definition.yaml, and a `start.sh` shim so the
 *    folder is startable under both this helper's own startup command and
 *    the common `bash /models/start.sh` convention of hand-made presets).
 *    Live probing confirmed the Add Revision submit succeeds even with an
 *    EMPTY folder, but uploading the fixtures keeps the revision genuinely
 *    startable — if cleanup is ever interrupted, a leaked deployment idles
 *    as a tiny mock server instead of crash-looping on a missing startup
 *    file on the shared cluster.
 *
 * Both specs verify "revision submit succeeds" only — replica scheduling and
 * health are cluster-timing-dependent (measured ~40s to 20min+ on the shared
 * QA cluster) and are deliberately out of scope for webui e2e.
 */
import { FolderExplorerModal } from './classes/vfolder/FolderExplorerModal';
import {
  createVFolderAndVerify,
  deleteForeverAndVerifyFromTrash,
  moveToTrashAndVerify,
  navigateTo,
} from './test-util';
import { expect, Page } from '@playwright/test';
import path from 'path';

const FIXTURES_DIR = path.join(__dirname, '..', 'serving', 'fixtures');

/**
 * The runtime variant / image / resources the provisioned preset uses. These
 * mirror the hand-seeded `mockvllm-preset` this replaces: the "custom" variant
 * (start command driven by the folder's model-definition.yaml / the preset's
 * startupCommand — no vLLM/SGLang runtime needed) and a deliberately GPU-free
 * resource footprint so the revision schedules on any agent.
 */
const RUNTIME_VARIANT_NAME = 'custom';
const PREFERRED_IMAGE_NAME = 'bai/ngc-pytorch';
const PRESET_RESOURCE_SLOTS = [
  { resourceType: 'cpu', quantity: '2' },
  { resourceType: 'mem', quantity: '2147483648' }, // 2 GiB
];

/** How old an `e2e-dfx-*` preset must be before the stale sweep removes it. */
const STALE_PRESET_AGE_MS = 2 * 60 * 60 * 1000; // 2 hours

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Shared deployment-shell helpers, used verbatim by both deployment specs
 * (deployment-lifecycle / deployment-access-token). They live here — the
 * shared home for deployment e2e utilities — rather than being copy-pasted
 * into each spec, so the two specs can never drift apart.
 */
export function escapeForRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Creates a deployment shell from the /deployments list page. Caller must
 * already be on /deployments. Creating a deployment auto-navigates directly
 * to its detail page, so this resolves once that page has loaded.
 */
export async function createDeploymentShell(
  page: Page,
  name: string,
): Promise<void> {
  await page.getByRole('button', { name: 'Create Deployment' }).click();
  const dialog = page.getByRole('dialog', { name: 'Create Deployment' });
  await expect(dialog).toBeVisible({ timeout: 20000 });
  await dialog.getByRole('textbox', { name: /Deployment Name/ }).fill(name);
  await dialog.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.getByRole('heading', { level: 3, name })).toBeVisible({
    timeout: 20000,
  });
}

/**
 * Permanently deletes a deployment via the list page's per-row delete icon
 * and the typed-name "Delete Deployment" confirmation modal, then verifies
 * the row is actually gone (not just that the button was clicked).
 */
export async function deleteDeploymentAndVerify(
  page: Page,
  name: string,
): Promise<void> {
  const row = page.getByRole('row', {
    name: new RegExp(escapeForRegExp(name)),
  });
  // The list can take longer to fetch/render while the shared QA cluster is
  // busy, and it is fetched once per navigation — right after a revision is
  // attached the backend's list read can lag behind the mutation (observed
  // live: a row absent across one full in-page wait appeared on the next
  // fresh navigation). A single in-page wait never refetches, so poll with
  // re-navigation instead — the same retry-by-refetch pattern as
  // verifyVFolder in test-util.ts.
  await expect(async () => {
    await navigateTo(page, 'deployments');
    await expect(row).toBeVisible({ timeout: 15000 });
  }).toPass({ timeout: 60_000 });
  await row.getByRole('button', { name: 'delete' }).click();

  const dialog = page.getByRole('dialog', { name: /Delete Deployment/ });
  await expect(dialog).toBeVisible({ timeout: 10000 });
  const deleteButton = dialog.getByRole('button', {
    name: 'Delete',
    exact: true,
  });
  await expect(deleteButton).toBeDisabled();
  await page.getByPlaceholder(name).fill(name);
  await expect(deleteButton).toBeEnabled({ timeout: 5000 });
  await deleteButton.click();

  await expect(page.getByText(name).first()).toBeHidden({ timeout: 30000 });
}

/**
 * Best-effort safety-net cleanup for a deployment that a test may not have
 * deleted itself (e.g. due to an earlier assertion failure). Never throws.
 */
export async function cleanupDeploymentSafely(
  page: Page,
  name: string,
): Promise<void> {
  try {
    await navigateTo(page, 'deployments');
    const row = page.getByRole('row', {
      name: new RegExp(escapeForRegExp(name)),
    });
    // Use a polling `expect` (not `isVisible()`, which does not reliably
    // retry) with a generous timeout -- under parallel worker load the
    // deployments list can take a while to fetch/render after navigation,
    // and a too-short existence check previously caused this safety net to
    // silently skip cleanup, leaking `e2e-plan-*` rows (observed live).
    await expect(row.first()).toBeVisible({ timeout: 15000 });
    await deleteDeploymentAndVerify(page, name);
  } catch (error) {
    console.warn(
      `[cleanupDeploymentSafely] could not verify cleanup of deployment "${name}":`,
      error,
    );
  }
}

export interface DeploymentFixtures {
  /**
   * Preset name selectable in the Add Revision modal — either a compatible
   * pre-existing preset that was found on the cluster, or a fresh
   * `e2e-dfx-*` one this run created.
   */
  presetName: string;
  /**
   * Raw preset UUID as required by `adminDeleteDeploymentRevisionPreset` —
   * set ONLY when this run created the preset. Unset when a pre-existing
   * compatible preset was reused, so cleanup never deletes something this
   * run does not own.
   */
  presetId?: string;
  /** Unique model VFolder name, selectable in the Add Revision modal. */
  folderName: string;
}

/**
 * Runs a GraphQL operation through the logged-in page's `backendaiclient`.
 * The strawberry-graph fields used here (runtimeVariants, deployment presets)
 * are reachable through `client.query` with the session login the e2e helpers
 * already perform — confirmed by live probing. Throws on any GraphQL error.
 */
async function gqlViaClient(
  page: Page,
  query: string,
  variables: Record<string, unknown> = {},
): Promise<any> {
  const result = await page.evaluate(
    async ({ query, variables }) => {
      const client = (globalThis as any).backendaiclient;
      if (!client) {
        return {
          ok: false as const,
          error: 'backendaiclient is not initialized (is the page logged in?)',
        };
      }
      try {
        return {
          ok: true as const,
          data: await client.query(query, variables),
        };
      } catch (error: any) {
        return {
          ok: false as const,
          error:
            (error && (error.message || error.title)) ||
            JSON.stringify(error)?.slice(0, 500),
        };
      }
    },
    { query, variables },
  );
  if (!result.ok) {
    throw new Error(`GraphQL operation failed: ${result.error}`);
  }
  return result.data;
}

/**
 * Strawberry Node ids are base64 `TypeName:<uuid>` global ids, but the
 * mutation inputs (`runtimeVariantId`, delete-by-id) take the raw UUID —
 * confirmed by live probing (`RuntimeVariant:7361e24b-…` decoded vs. the raw
 * `runtimeVariantId` echoed back by the create mutation).
 */
function toRawUUID(id: string): string {
  if (UUID_RE.test(id)) return id;
  const decoded = Buffer.from(id, 'base64').toString('utf-8');
  const raw = decoded.split(':').pop() ?? '';
  if (!UUID_RE.test(raw)) {
    throw new Error(`Cannot extract a raw UUID from id "${id}" ("${decoded}")`);
  }
  return raw;
}

/**
 * Best-effort sweep of `e2e-dfx-*` presets leaked by previously interrupted
 * runs. Presets are the one provisioned resource no existing safety net
 * covers (the global teardown sweeps `e2e-*` folders/services/users, but not
 * deployment presets). Only presets older than {@link STALE_PRESET_AGE_MS}
 * are removed so concurrently-running specs can never sweep each other's
 * freshly provisioned preset. Never throws.
 */
async function sweepStaleDeploymentPresets(page: Page): Promise<void> {
  try {
    const data = await gqlViaClient(
      page,
      `query {
        deploymentRevisionPresets(
          filter: { name: { startsWith: "e2e-dfx-" } }
          limit: 50
        ) {
          edges { node { id name createdAt } }
        }
      }`,
    );
    const nodes: Array<{ id: string; name: string; createdAt: string }> = (
      data.deploymentRevisionPresets?.edges ?? []
    ).map((e: any) => e.node);
    for (const node of nodes) {
      const ageMs = Date.now() - new Date(node.createdAt).getTime();
      if (!(ageMs > STALE_PRESET_AGE_MS)) continue;
      await gqlViaClient(
        page,
        `mutation($id: UUID!) {
          adminDeleteDeploymentRevisionPreset(id: $id) { id }
        }`,
        { id: toRawUUID(node.id) },
      );
      console.log(
        `[deployment-fixtures] swept stale preset "${node.name}" (age ${Math.round(ageMs / 60000)}m)`,
      );
    }
  } catch (error) {
    console.warn(
      '[deployment-fixtures] stale preset sweep failed (ignored):',
      error,
    );
  }
}

/**
 * Uploads the GPU-free mock-server fixtures into the provisioned model folder
 * via the FolderExplorerModal (same UI path as serving-deploy-lifecycle).
 */
async function uploadDeploymentFixtureFiles(
  page: Page,
  folderName: string,
): Promise<void> {
  const FIXTURE_FILES = [
    'mock_openai_server.py',
    'model-definition.yaml',
    'start.sh',
  ];

  const folderLink = page.getByRole('link', { name: folderName }).first();
  // The folder list is fetched once per navigation, and right after the
  // folder was created the list read can lag behind the mutation — observed
  // live under concurrent worker load. Poll with re-navigation (the same
  // retry-by-refetch pattern as verifyVFolder / deleteDeploymentAndVerify)
  // instead of a single in-page wait that never refetches.
  const openExplorer = async (): Promise<FolderExplorerModal> => {
    await expect(async () => {
      await navigateTo(page, 'data');
      await expect(folderLink).toBeVisible({ timeout: 15000 });
    }).toPass({ timeout: 60_000 });
    await folderLink.click();
    const modal = new FolderExplorerModal(page);
    await modal.waitForOpen();
    await modal.verifyFileExplorerLoaded();
    return modal;
  };

  const modal = await openExplorer();
  const uploadButton = await modal.getUploadButton();
  await uploadButton.click();

  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByRole('button', { name: 'file-add Upload Files' }).click(),
  ]);
  await fileChooser.setFiles(
    FIXTURE_FILES.map((f) => path.join(FIXTURES_DIR, f)),
  );

  // The explorer's file table refreshes when uploads complete, but with
  // several files in flight the refresh can land before the last file's
  // row exists — observed live under load as one of the three rows never
  // appearing within its wait even though the upload itself succeeded.
  // Retry once by closing and reopening the explorer, which refetches the
  // listing (the modal itself has no refresh affordance) — the same
  // eventual-consistency retry convention as verifyVFolder.
  try {
    for (const fileName of FIXTURE_FILES) {
      await modal.verifyFileVisible(fileName);
    }
    await modal.close();
  } catch (error) {
    console.warn(
      `[deployment-fixtures] fixture rows missing after upload; reopening the explorer to refetch the listing:`,
      error,
    );
    await modal.close();
    const reopened = await openExplorer();
    for (const fileName of FIXTURE_FILES) {
      await reopened.verifyFileVisible(fileName);
    }
    await reopened.close();
  }
}

/**
 * Finds a pre-existing preset compatible with the provisioned model folder,
 * or returns null when the cluster has none. Compatibility means the preset
 * could actually start the folder's mock server:
 *  - "custom" runtime variant (start command driven, no vLLM/SGLang engine);
 *  - GPU-free resource slots (only cpu/mem), so it schedules on any agent;
 *  - a container image is set (revision creation needs one).
 * Two ownership/uniqueness guards apply on top:
 *  - `e2e-dfx-*` presets are NEVER reuse candidates: one of those may be a
 *    concurrently-running test's still-in-flight preset, and its owning run
 *    deletes it at cleanup — reusing it would let that cleanup pull the
 *    preset out from under this run. Only genuinely pre-existing
 *    (hand-seeded) presets are safe to share, since nothing ever deletes
 *    them.
 *  - The preset's name must resolve to exactly one preset under the Add
 *    Revision modal's server-side "contains" search — i.e. no OTHER preset
 *    name contains it as a substring AND no other preset shares the exact
 *    same name. {@link selectRevisionModalOption}'s settle gate keys on the
 *    "Total 1 items" footer, so a name matching two or more presets (common:
 *    Backend.AI clusters carry same-named presets, one per runtime variant)
 *    would hang the search. Both conditions collapse to a single count check
 *    (see the filter below).
 *
 * The match is deterministic: candidates are ordered by rank then name, so
 * repeated runs against the same cluster always pick the same preset.
 */
async function findCompatiblePreset(
  page: Page,
): Promise<{ name: string } | null> {
  const data = await gqlViaClient(
    page,
    `query {
      deploymentRevisionPresets(limit: 100) {
        edges { node {
          name rank
          runtimeVariant { name }
          image { id }
          resourceSlots { slotName }
        } }
      }
    }`,
  );
  const presets: Array<{
    name: string;
    rank: number;
    runtimeVariant: { name: string } | null;
    image: { id: string } | null;
    resourceSlots: Array<{ slotName: string }> | null;
  }> = (data.deploymentRevisionPresets?.edges ?? []).map((e: any) => e.node);

  const allNames = presets.map((p) => p.name);
  const candidates = presets
    .filter(
      (p) =>
        !p.name.startsWith('e2e-dfx-') &&
        p.runtimeVariant?.name === RUNTIME_VARIANT_NAME &&
        p.image != null &&
        (p.resourceSlots ?? []).every((s) =>
          ['cpu', 'mem'].includes(s.slotName),
        ) &&
        // The name must resolve to EXACTLY ONE preset under the modal's
        // server-side "contains" search, or selectRevisionModalOption's
        // "Total 1 items" settle gate never fires. Counting the names that
        // contain p.name catches both failure modes at once: a longer name
        // that has p.name as a substring, AND another preset sharing p.name
        // verbatim (Backend.AI clusters routinely carry same-named presets —
        // one per runtime variant, e.g. two "cpu-medium"s). An identity
        // skip (`n === p.name`) cannot express the latter: the duplicate is
        // an equal string, so it would be skipped as "self".
        allNames.filter((n) => n.includes(p.name)).length === 1,
    )
    .sort((a, b) => a.rank - b.rank || a.name.localeCompare(b.name));

  return candidates.length > 0 ? { name: candidates[0].name } : null;
}

/**
 * Ensures a preset usable by the Add Revision flow exists, reusing a
 * compatible pre-existing one when the cluster has it (never modified, never
 * deleted by us) and creating an `e2e-dfx-*` one as the admin otherwise.
 * Returns the preset's selectable name plus, ONLY when this call created it,
 * the raw UUID cleanup should delete.
 */
export async function ensureDeploymentPreset(
  page: Page,
): Promise<{ presetName: string; presetId?: string }> {
  await sweepStaleDeploymentPresets(page);

  const existing = await findCompatiblePreset(page);
  if (existing) {
    console.log(
      `[deployment-fixtures] reusing compatible pre-existing preset "${existing.name}"`,
    );
    return { presetName: existing.name };
  }

  const presetName = `e2e-dfx-preset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  // Resolve the "custom" runtime variant's raw UUID (per-cluster value).
  const rvData = await gqlViaClient(
    page,
    `query { runtimeVariants(limit: 100) { edges { node { id name } } } }`,
  );
  const variant = (rvData.runtimeVariants?.edges ?? [])
    .map((e: any) => e.node)
    .find((n: any) => n.name === RUNTIME_VARIANT_NAME);
  if (!variant) {
    throw new Error(
      `No "${RUNTIME_VARIANT_NAME}" runtime variant on this cluster — cannot provision a deployment preset`,
    );
  }

  // Resolve a CPU-capable image's raw UUID. Prefer a widely-seeded image
  // family; fall back to any python-ish image so the helper stays usable on
  // clusters with a different registry layout.
  const imgData = await gqlViaClient(
    page,
    `query { images(is_operation: false) { id name tag } }`,
  );
  const images: Array<{ id: string; name: string; tag: string }> =
    imgData.images ?? [];
  const image =
    images.find((i) => i.name === PREFERRED_IMAGE_NAME) ??
    images.find((i) => /python/i.test(i.name));
  if (!image) {
    throw new Error(
      `No "${PREFERRED_IMAGE_NAME}" (or python) image on this cluster — cannot provision a deployment preset`,
    );
  }

  // Create the preset. `clusterMode`/`clusterSize`/`imageId` are required
  // input fields (added in 26.4.4); values are a minimal GPU-free footprint
  // (SINGLE_NODE × 1, rolling, open to public) matching the fixture folder.
  const created = await gqlViaClient(
    page,
    `mutation($input: CreateDeploymentRevisionPresetInput!) {
      adminCreateDeploymentRevisionPreset(input: $input) {
        preset { id name }
      }
    }`,
    {
      input: {
        name: presetName,
        runtimeVariantId: toRawUUID(variant.id),
        imageId: toRawUUID(image.id),
        replicaCount: 1,
        openToPublic: true,
        deploymentStrategy: { type: 'ROLLING' },
        clusterMode: 'SINGLE_NODE',
        clusterSize: 1,
        resourceSlots: PRESET_RESOURCE_SLOTS,
        startupCommand: 'python3 /models/mock_openai_server.py',
        description:
          'Self-provisioned by the webui deployment e2e specs — safe to delete.',
      },
    },
  );
  console.log(
    `[deployment-fixtures] no compatible preset on this cluster — created "${presetName}"`,
  );
  return {
    presetName,
    presetId: toRawUUID(created.adminCreateDeploymentRevisionPreset.preset.id),
  };
}

/**
 * Provisions a uniquely-named `e2e-dfx-*` model folder seeded with the
 * GPU-free mock-server fixtures, and returns its name. Usable on its own by
 * flows that need a model folder but no preset (e.g. the Advanced Mode
 * manual-revision test). Callers must clean it up via
 * {@link cleanupDeploymentFixtures} (as `{ folderName }`).
 */
export async function provisionDeploymentModelFolder(
  page: Page,
): Promise<string> {
  const folderName = `e2e-dfx-fld-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  await createVFolderAndVerify(page, folderName, 'model');
  try {
    await uploadDeploymentFixtureFiles(page, folderName);
  } catch (error) {
    await cleanupDeploymentFixtures(page, { folderName });
    throw error;
  }
  return folderName;
}

/**
 * Provisions the preset + model-folder pair the Add Revision flow needs —
 * the preset via find-or-create ({@link ensureDeploymentPreset}), the folder
 * always freshly created. Requires an already-logged-in admin `page` (the
 * preset mutation is admin-only). If any step fails, everything THIS run
 * created so far is torn back down before the error is rethrown, so callers
 * never have to clean up a partially-provisioned state they were never
 * handed.
 *
 * Callers own the returned fixtures and must pass them to
 * {@link cleanupDeploymentFixtures} when done (typically from `afterEach`).
 */
export async function provisionDeploymentFixtures(
  page: Page,
): Promise<DeploymentFixtures> {
  const preset = await ensureDeploymentPreset(page);
  try {
    const folderName = await provisionDeploymentModelFolder(page);
    return { ...preset, folderName };
  } catch (error) {
    // The folder helper already unwound itself; unwind the preset only if
    // this run created it.
    await cleanupDeploymentFixtures(page, { presetId: preset.presetId });
    throw error;
  }
}

/**
 * Best-effort teardown of everything THIS RUN created. Never throws — a
 * cleanup hiccup must not mask the real test result. Accepts a partial
 * fixtures object so it can also unwind a partially-failed provisioning.
 * A reused pre-existing preset is naturally left untouched: its
 * `presetId` is never set on the fixtures object (see
 * {@link ensureDeploymentPreset}).
 *
 * The caller must delete any deployment that references the fixtures BEFORE
 * calling this (the specs' existing deployment cleanup already does).
 */
export async function cleanupDeploymentFixtures(
  page: Page,
  fixtures: Partial<DeploymentFixtures>,
): Promise<void> {
  if (fixtures.presetId) {
    try {
      await gqlViaClient(
        page,
        `mutation($id: UUID!) {
          adminDeleteDeploymentRevisionPreset(id: $id) { id }
        }`,
        { id: fixtures.presetId },
      );
    } catch (error) {
      console.warn(
        `[deployment-fixtures] could not delete preset "${fixtures.presetName ?? fixtures.presetId}":`,
        error,
      );
    }
  }

  if (fixtures.folderName) {
    try {
      await moveToTrashAndVerify(page, fixtures.folderName, 'data', {
        skipTrashVerify: true,
      });
      await deleteForeverAndVerifyFromTrash(page, fixtures.folderName);
    } catch (error) {
      console.warn(
        `[deployment-fixtures] primary folder cleanup of "${fixtures.folderName}" failed; retrying delete-from-trash:`,
        error,
      );
      // The folder may already be in Trash (move succeeded, purge failed).
      try {
        await deleteForeverAndVerifyFromTrash(page, fixtures.folderName);
      } catch (retryError) {
        console.warn(
          `[deployment-fixtures] could not purge folder "${fixtures.folderName}" — the global e2e teardown sweep will collect it:`,
          retryError,
        );
      }
    }
  }
}

/**
 * Searches an Add Revision modal combobox (`#revisionPresetId` /
 * `#modelFolderId`) and selects `optionName` — which must be unique on the
 * cluster, as every provisioned `e2e-dfx-*` name is — via keyboard.
 *
 * Why keyboard, and why the extra gates (all confirmed by live DOM
 * investigation on these two Selects):
 *  - Both Selects search SERVER-side (`filterOption: false` plus a
 *    searchAction-driven refetch in BAIAvailablePresetSelect /
 *    BAIVFolderSelect), so after typing, the option list and its
 *    "Total N items" footer only narrow once the search round-trip lands.
 *    Until then the footer still shows the unfiltered count and Enter can
 *    land on a stale highlighted row — or on nothing at all (observed live
 *    as a missing `.ant-select-selection-item` after the dropdown closed).
 *    Because the searched name is unique, the search is settled exactly when
 *    the footer reads "Total 1 items"; only then is Enter trustworthy.
 *  - The virtualized option rows render with a computed width of 0, so both
 *    `.click()` and `.click({ force: true })` fail even though the option is
 *    attached and correctly labeled — ArrowDown + Enter selects the sole
 *    settled result without depending on the row's bounding box. (ArrowDown
 *    is a no-op when the single option is already highlighted, and activates
 *    it when antd did not auto-highlight.)
 *  - The raw `#…` input's value is not where antd renders the selection.
 *    antd v6's single-mode Select renders the selected label inside
 *    `.ant-select-content` (the `.ant-select-selection-item` element of
 *    antd v5 now only exists in multiple mode — confirmed against
 *    @rc-component/select's SingleContent). The closing assertion reads that
 *    container, which proves the intended option (not some other row) was
 *    selected.
 */
export async function selectRevisionModalOption(
  page: Page,
  inputSelector: string,
  optionName: string,
): Promise<void> {
  await page.locator(inputSelector).click();
  await page.locator(inputSelector).fill(optionName);
  const dropdown = page
    .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')
    .first();
  await expect(dropdown).toBeVisible({ timeout: 10000 });
  await expect(dropdown.getByText('Total 1 items')).toBeVisible({
    timeout: 15000,
  });
  await expect(
    dropdown.getByRole('option', { name: optionName }).first(),
  ).toBeAttached({ timeout: 15000 });
  await page.locator(inputSelector).press('ArrowDown');
  await page.locator(inputSelector).press('Enter');
  await expect(dropdown).toBeHidden({ timeout: 5000 });
  await expect(
    page
      .locator('.ant-select', { has: page.locator(inputSelector) })
      .locator('.ant-select-content'),
  ).toContainText(optionName, { timeout: 5000 });
}
