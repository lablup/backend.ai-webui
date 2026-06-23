/**
 * Declarative feature-gate helpers for E2E tests (FR-3112).
 *
 * Problem: tests used to probe for a UI element from inside the test body and
 * silently skip when it was absent ("widget not visible → assume the feature
 * is unavailable"). Such graceful self-skips hide coverage gaps: a green run
 * can mean the feature was absent everywhere, and a regression that removes
 * the element is reported as "skipped" instead of "failed".
 *
 * Instead, gate the test on the *actual* capability source the WebUI itself
 * reads, and let the UI assertion fail loudly when the backend is capable:
 *
 * - Manager-version capabilities → `skipUnlessClientFeature(page, 'agent-stats', ...)`
 *   (same source of truth as `baiClient.supports(...)` in components; the
 *   version → flag mapping lives in `packages/backend.ai-client/src/client.ts`
 *   `_updateSupportList()`)
 * - `config.toml` toggles → `skipUnlessClientConfig(page, 'enableModelFolders', ...)`
 *   (same source of truth as `baiClient._config.*` in components)
 * - Client properties (FR-3114) → `getClientProperty(page, 'current_group')`
 *   (same source of truth as `baiClient.<property>` in components)
 * - etcd-configured vfolder types (FR-3114) →
 *   `skipUnlessAllowedVFolderType(page, 'group', ...)` (same source of truth
 *   as `baiClient.vfolder.list_allowed_types()`)
 *
 * Pair these gates with a version-requirement tag on the test or describe
 * block (e.g. `@requires-manager-v25.15`, `@requires-webui-v26.4`) so gated
 * specs can be excluded explicitly on incapable targets:
 * `npx playwright test --grep-invert "@requires-manager-v25.15"`.
 * See e2e/E2E-TEST-NAMING-GUIDELINES.md ("Feature-gate tags (FR-3112)" and
 * "Environment-constraint tags (FR-3114)").
 */
import { test, Page } from '@playwright/test';

/**
 * Waits until the global Backend.AI client is initialized and ready.
 * The client is created during login, so callers must be logged in first
 * (e.g. via `loginAsAdmin` / `loginAsUser` in a `beforeEach`).
 */
async function waitForBackendAIClient(page: Page): Promise<void> {
  await page.waitForFunction(
    () =>
      typeof (globalThis as any).backendaiclient !== 'undefined' &&
      (globalThis as any).backendaiclient !== null &&
      (globalThis as any).backendaiclient.ready === true,
    { timeout: 10000 },
  );
}

/**
 * Reads the WebUI package version injected by `index.html`
 * (`globalThis.packageVersion`, e.g. "26.5.0-alpha.0"). Available on every
 * page as soon as the app shell loads — no login required.
 */
export async function getWebUIVersion(page: Page): Promise<string> {
  return page.evaluate(() => (globalThis as any).packageVersion as string);
}

/**
 * Numeric, segment-wise dotted-version comparison ("26.5.0-alpha.0" vs
 * "26.4"). Pre-release suffixes are ignored: an alpha/rc of a release line
 * already contains the features gated on that line.
 */
function isVersionAtLeast(version: string, minVersion: string): boolean {
  const parse = (v: string) =>
    v
      .split('-')[0]
      .split('.')
      .map((seg) => Number.parseInt(seg, 10) || 0);
  const a = parse(version);
  const b = parse(minVersion);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const diff = (a[i] ?? 0) - (b[i] ?? 0);
    if (diff !== 0) return diff > 0;
  }
  return true;
}

/**
 * Declaratively skips the current test when the WebUI under test is older
 * than `minVersion`. Use for WebUI-version capabilities that have no
 * `baiClient.supports(...)` flag (pair with a `@requires-webui-vX.Y` tag).
 * On a capable build the test proceeds, so a missing UI element fails
 * loudly instead of being reported as a skip.
 */
export async function skipUnlessWebUIVersion(
  page: Page,
  minVersion: string,
  reason: string,
): Promise<void> {
  const version = await getWebUIVersion(page);
  test.skip(
    !isVersionAtLeast(version, minVersion),
    `${reason} (WebUI ${version} < ${minVersion})`,
  );
}

/**
 * Returns whether the logged-in Backend.AI client reports support for the
 * given capability flag — the same check components perform via
 * `baiClient.supports(feature)`.
 */
export async function clientSupports(
  page: Page,
  feature: string,
): Promise<boolean> {
  await waitForBackendAIClient(page);
  return page.evaluate(
    (f) => !!(globalThis as any).backendaiclient?.supports(f),
    feature,
  );
}

/**
 * Returns a value from the logged-in Backend.AI client's parsed `config.toml`
 * (`baiClient._config`), e.g. `enableModelFolders`.
 */
export async function getClientConfigValue(
  page: Page,
  key: string,
): Promise<unknown> {
  await waitForBackendAIClient(page);
  return page.evaluate(
    (k) => (globalThis as any).backendaiclient?._config?.[k],
    key,
  );
}

/**
 * Declarative feature gate: skips the current test (with the given auditable
 * reason) when the backend does not support the capability flag. When the
 * backend IS capable, the test proceeds — so a missing UI element becomes a
 * real failure instead of a silent skip.
 *
 * The `reason` should cite the originating feature ticket and the minimum
 * backend version, e.g.
 * `"Agent Statistics widget requires the 'agent-stats' capability (manager >= 25.15.0, FR-1575)"`.
 */
export async function skipUnlessClientFeature(
  page: Page,
  feature: string,
  reason: string,
): Promise<void> {
  const supported = await clientSupports(page, feature);
  test.skip(!supported, reason);
}

/**
 * Declarative config gate: skips the current test (with the given auditable
 * reason) when the given `config.toml` key is falsy for the logged-in client.
 */
export async function skipUnlessClientConfig(
  page: Page,
  key: string,
  reason: string,
): Promise<void> {
  const value = await getClientConfigValue(page, key);
  test.skip(!value, reason);
}

/**
 * Returns a top-level property of the logged-in Backend.AI client, e.g.
 * `current_group` (the active project name) — the same source components
 * read via `useCurrentProjectValue()` / `baiClient.current_group`.
 */
export async function getClientProperty(
  page: Page,
  key: string,
): Promise<unknown> {
  await waitForBackendAIClient(page);
  return page.evaluate((k) => (globalThis as any).backendaiclient?.[k], key);
}

/**
 * Returns the vfolder types allowed by the cluster's etcd configuration
 * (`volumes/_types`), e.g. `['user', 'group']` — the same source
 * `FolderCreateModal` reads via `baiClient.vfolder.list_allowed_types()`.
 */
export async function listAllowedVFolderTypes(page: Page): Promise<string[]> {
  await waitForBackendAIClient(page);
  return page.evaluate(async () => {
    const types = await (
      globalThis as any
    ).backendaiclient?.vfolder?.list_allowed_types();
    return Array.isArray(types) ? types : [];
  });
}

/**
 * Declarative environment gate (FR-3114): skips the current test (with the
 * given auditable reason) when the cluster's etcd `volumes/_types` config
 * does not allow the given vfolder type (e.g. `'group'` for Project-type
 * vfolders). Pair with the `@requires-vfolder-type-group` tag.
 */
export async function skipUnlessAllowedVFolderType(
  page: Page,
  type: string,
  reason: string,
): Promise<void> {
  const allowedTypes = await listAllowedVFolderTypes(page);
  test.skip(!allowedTypes.includes(type), reason);
}
