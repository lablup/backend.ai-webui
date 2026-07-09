/**
 * Global cleanup teardown (FR-3090).
 *
 * Runs once after the whole suite — wired via the `chromium` project's
 * `teardown: 'cleanup'` in `playwright.config.ts` — regardless of whether the
 * tests passed or failed. Per-test `afterEach` cleanup is best-effort and can be
 * aborted when a test exhausts its 180s budget (the cleanup then stops mid-way,
 * leaving an `e2e-*` orphan behind). This teardown is the safety net that
 * guarantees the shared test server is left clean.
 *
 * It is intentionally tolerant: every sweep is best-effort and never fails the
 * run — a cleanup hiccup must not turn a green suite red. It sweeps as the user
 * (personal folders on /data) and as the admin (/admin-data), because different
 * specs create folders under different accounts:
 *   - vfolder-crud / file-* / type-selection (user) → personal folders on /data
 *   - type-selection project (admin) → project folders, created on /project-data
 *     but only DELETABLE from /admin-data (VFolderNodesV2 on /project-data does
 *     not expose trash/delete). /admin-data also lists every other admin-visible
 *     folder, so it doubles as a catch-all.
 *
 * The pattern is the broad `/e2e-/i` (covering `e2e-test-*`, `e2e-mod-*`, the
 * dot-prefixed auto-mount folder, etc.). Broad matching is safe HERE — unlike in
 * a per-test `sweepVFolders` call — because the teardown runs after every other
 * project has finished, so no parallel test owns a live `e2e-*` folder.
 *
 * It also purges any leftover `e2e-*` fixture user and `e2e-plan-*` /
 * `e2e-token-*` deployment via the admin GraphQL API (no browser UI involved),
 * so those sweeps cannot fail the same way a per-test UI-based cleanup can.
 */
import {
  createAdminApiContext,
  listUsersByPattern,
  purgeUserViaApi,
  sweepLeftoverDeploymentsViaApi,
} from './utils/admin-api';
import { sweepServices, sweepVFolders } from './utils/cleanup-util';
import { loginAsAdmin, loginAsUser } from './utils/test-util';
import { Page, test } from '@playwright/test';

// Matches every e2e vfolder naming scheme used across the specs.
const E2E_VFOLDER_PATTERN = /e2e-/i;

// Matches the disposable fixture accounts other specs create (e.g.
// e2e-rbac-assign-*, e2e-mykeypair-*, e2e-test-user-*, e2e-profile-*). Anchored
// to the `e2e-` prefix so it can never match a standard test account
// (admin@/user@/user2@/monitor@/domain-admin@lablup.com).
const E2E_USER_PATTERN = /^e2e-[a-z0-9._-]*@lablup\.com$/i;

/**
 * Belt-and-suspenders user sweep (FR-3217). Specs that create fixture users now
 * purge them in their own afterAll, but a hard-killed run can skip that hook and
 * strand an `e2e-*` account on the shared server. This purges any leftover via
 * the admin GraphQL API (pagination-immune, no credential-UI flakiness — see
 * FR-3138). It CAN throw: admin login (createAdminApiContext), transport, and
 * GraphQL errors propagate (purgeUserViaApi only swallows missing-user /
 * `ok: false`). The caller wraps this in its own try/catch so a sweep failure
 * never reds an otherwise-green run; the `finally` here disposes the API
 * context even when a sweep step throws.
 */
async function sweepLeftoverE2EUsers(): Promise<void> {
  const api = await createAdminApiContext();
  try {
    const leaked = await listUsersByPattern(api, E2E_USER_PATTERN);
    let purged = 0;
    for (const { email } of leaked) {
      if (await purgeUserViaApi(api, email)) purged++;
    }
    if (purged > 0) {
      console.log(`[global-cleanup] purged ${purged} leftover e2e-* user(s).`);
    }
  } finally {
    await api.dispose();
  }
}

/**
 * Belt-and-suspenders deployment sweep. deployment-lifecycle.spec.ts and
 * deployment-access-token.spec.ts name their throwaway shells `e2e-plan-*` /
 * `e2e-token-*`, which neither sweepServices' `/e2e-svc-/` nor sweepVFolders'
 * `/e2e-/` folder pattern matches — deployments were the one e2e-provisioned
 * resource this teardown didn't cover. Each spec's own `cleanupDeploymentSafely`
 * (a UI-delete flow) is the primary cleanup path, but it can fail for the same
 * reason the test body already failed (e.g. mid-modal, a stuck locator),
 * leaking a `PENDING` deployment with no other backstop. This purges any
 * leftover via the admin GraphQL API instead of the UI, so it cannot fail the
 * same way. API-based, so it does not use `page`; guard it directly (like
 * sweepLeftoverE2EUsers) so a failure never reds the run.
 */
async function sweepLeftoverDeployments(): Promise<void> {
  const api = await createAdminApiContext();
  try {
    await sweepLeftoverDeploymentsViaApi(api);
  } finally {
    await api.dispose();
  }
}

/** Run a best-effort sweep, swallowing any error so teardown never fails. */
async function safeSweep(
  label: string,
  fn: (page: Page) => Promise<unknown>,
  page: Page,
): Promise<void> {
  try {
    await fn(page);
  } catch (error) {
    console.warn(`[global-cleanup] ${label} sweep failed (ignored):`, error);
  }
}

test.describe('Global e2e cleanup', () => {
  // The sweep may have to trash + delete-forever several leftover folders, each
  // a multi-step navigate/filter/confirm flow, and a stuck folder now fails its
  // action at the 30s actionTimeout before being skipped. Give the cleanup more
  // room than the default 180s so it can drain a backlog instead of timing out
  // mid-sweep and leaving the rest behind.
  test.describe.configure({ timeout: 300_000 });

  test('sweep leftover e2e vfolders (user)', async ({ page, request }) => {
    await loginAsUser(page, request);
    await safeSweep(
      'user /data',
      (p) => sweepVFolders(p, E2E_VFOLDER_PATTERN, 'data'),
      page,
    );
  });

  test('sweep leftover e2e vfolders and services (admin)', async ({
    page,
    request,
  }) => {
    await loginAsAdmin(page, request);
    // /admin-data (AdminVFolderNodeListPage) lists every vfolder visible to an
    // admin — project folders (only deletable here, not on /project-data) plus
    // any folder another sweep missed — using the same table component as /data.
    await safeSweep(
      'admin /admin-data',
      (p) => sweepVFolders(p, E2E_VFOLDER_PATTERN, 'admin-data'),
      page,
    );
    await safeSweep('admin services', (p) => sweepServices(p), page);
    // Purge any e2e-* fixture user a per-spec afterAll failed to reap. API-based,
    // so it does not use `page`; guard it directly so a failure never reds the run.
    try {
      await sweepLeftoverE2EUsers();
    } catch (error) {
      console.warn('[global-cleanup] user sweep failed (ignored):', error);
    }
    // Purge any e2e-plan-*/e2e-token-* deployment a per-spec afterEach failed
    // to reap. API-based, so it does not use `page`; guard it directly so a
    // failure never reds the run.
    try {
      await sweepLeftoverDeployments();
    } catch (error) {
      console.warn(
        '[global-cleanup] deployment sweep failed (ignored):',
        error,
      );
    }
  });
});
