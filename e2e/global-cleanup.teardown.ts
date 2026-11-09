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
 *   - vfolder-crud / file-* (user) → folders on /data
 *   - admin → /admin-data lists every admin-visible folder, so it doubles as a
 *     catch-all.
 *
 * The user sweep uses the broad `/e2e-/i` (covering `e2e-test-*`, `e2e-mod-*`, the
 * dot-prefixed auto-mount folder, etc.). Broad matching is safe HERE — unlike in
 * a per-test `sweepVFolders` call — because the teardown runs after every other
 * project has finished, so no parallel test owns a live `e2e-*` folder.
 *
 * The admin sweep is anchored to `/^e2e-/i` instead: /admin-data lists every
 * account's folders, and the sweep matches against the whole row text, so an
 * unanchored pattern could reach a folder that merely has `e2e-` somewhere else
 * in its row. Dot-prefixed auto-mount folders stay covered by the user sweep.
 *
 * It also purges, via the admin GraphQL API (no browser UI involved), any
 * leftover `e2e-*` fixture user, stale e2e deployment (`E2E_DEPLOYMENT_PATTERN`),
 * stale `e2e-preset-*` Prometheus query preset, stale e2e role
 * (`E2E_ROLE_PATTERN`) and stale `e2e-test-project-*` project, so those sweeps cannot fail the same way a per-test UI-based
 * cleanup can. Specs register what they create with `createTestResources()`
 * (utils/test-resources.ts); these prefix sweeps only catch hard-killed runs.
 */
import {
  createAdminApiContext,
  listUsersByPattern,
  purgeUserViaApi,
  sweepLeftoverDeploymentsViaApi,
  sweepStaleProjectsViaApi,
  sweepStalePrometheusQueryPresetsViaApi,
  sweepStaleRolesViaApi,
} from './utils/admin-api';
import { sweepServices, sweepVFolders } from './utils/cleanup-util';
import { loginAsAdmin, loginAsUser } from './utils/test-util';
import { Page, test } from '@playwright/test';

// Matches every e2e vfolder naming scheme used across the specs.
const E2E_VFOLDER_PATTERN = /e2e-/i;

// Admin sweep: /admin-data shows every account's folders, so only rows that
// start with the folder-name prefix qualify. Keeps the case-insensitive flag.
const E2E_ADMIN_VFOLDER_PATTERN = /^e2e-/i;

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
 * Belt-and-suspenders deployment sweep. The deployment specs name their
 * throwaway shells `e2e-plan-*` / `e2e-token-*` / `e2e-fr<N>-*` /
 * `e2e-gh<N>-*` (`E2E_DEPLOYMENT_PATTERN`), which neither sweepServices' `/e2e-svc-/` nor sweepVFolders'
 * `/e2e-/` folder pattern matches — deployments were the one e2e-provisioned
 * resource this teardown didn't cover. Each spec's own `cleanupDeploymentSafely`
 * (a UI-delete flow) is the primary cleanup path, but it can fail for the same
 * reason the test body already failed (e.g. mid-modal, a stuck locator),
 * leaking a `PENDING` deployment with no other backstop. This purges any
 * leftover past the helper's age gate via the admin GraphQL API instead of the UI, so it cannot fail the
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

// project-crud.spec.ts names its GENERAL projects `e2e-test-project-<runId>-*`.
const E2E_TEST_PROJECT_PATTERN = /^e2e-test-project-/;

/**
 * Backstop sweeps for Prometheus query presets (`e2e-preset-*`, the
 * auto-scaling-rule-preset specs), the RBAC specs' roles and project-crud's
 * GENERAL projects. All keep the helpers' age gate, as the deployment sweep does, so a concurrent
 * run's fresh fixtures survive.
 */
async function sweepLeftoverPresetsRolesAndProjects(): Promise<void> {
  const api = await createAdminApiContext();
  try {
    try {
      await sweepStalePrometheusQueryPresetsViaApi(api, 'e2e-preset-');
    } catch (error) {
      console.warn('[global-cleanup] preset sweep failed (ignored):', error);
    }
    // Only custom roles matching E2E_ROLE_PATTERN; never a system role.
    try {
      await sweepStaleRolesViaApi(api);
    } catch (error) {
      console.warn('[global-cleanup] role sweep failed (ignored):', error);
    }
    try {
      const purged = await sweepStaleProjectsViaApi(
        api,
        E2E_TEST_PROJECT_PATTERN,
      );
      if (purged > 0) {
        console.log(
          `[global-cleanup] purged ${purged} leftover e2e-test-project-* project(s).`,
        );
      }
    } catch (error) {
      console.warn('[global-cleanup] project sweep failed (ignored):', error);
    }
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

/**
 * Wall-clock budgets handed to the sweeps as `deadline`s, so a large backlog
 * ends in a logged "stopping, N left" instead of the test timeout aborting
 * the cleanup mid-flight (and reddening the run). They sum well under the
 * 600s test budget because a sweep only checks its deadline between
 * iterations, and one iteration (navigate + filter + bounded retries +
 * confirm) can run ~60-90s in the worst case before the check fires.
 */
const USER_VFOLDER_SWEEP_BUDGET_MS = 420_000;
const ADMIN_VFOLDER_SWEEP_BUDGET_MS = 300_000;
const ADMIN_SERVICE_SWEEP_BUDGET_MS = 90_000;

test.describe('Global e2e cleanup', () => {
  // The sweep may have to trash + delete-forever several leftover folders, each
  // a multi-step navigate/filter/confirm flow, and a stuck folder now fails its
  // action at the 30s actionTimeout before being skipped. `sweepVFolders` bounds
  // itself to `maxIterations` (default 20) per phase, but on a large backlog
  // (up to 20 Active + 20 Trash iterations, each a full navigate/verify round
  // trip) the 300s budget can still be exhausted mid-sweep, leaving the rest of
  // the backlog behind. Give the cleanup more headroom than the default 180s
  // (and the previous 300s) so it can drain a larger backlog instead of timing
  // out mid-sweep; the per-sweep deadlines above keep it from ever reaching
  // this limit.
  // `default` keeps file order under `fullyParallel`: API sweeps follow the UI ones.
  test.describe.configure({ mode: 'default', timeout: 600_000 });

  test('sweep leftover e2e vfolders (user)', async ({ page, request }) => {
    await loginAsUser(page, request);
    await safeSweep(
      'user /data',
      (p) =>
        sweepVFolders(p, E2E_VFOLDER_PATTERN, 'data', undefined, {
          deadline: Date.now() + USER_VFOLDER_SWEEP_BUDGET_MS,
        }),
      page,
    );
  });

  test('sweep leftover e2e vfolders and services (admin)', async ({
    page,
    request,
  }) => {
    await loginAsAdmin(page, request);
    // /admin-data (AdminVFolderNodeListPage) lists every vfolder visible to an
    // admin — project folders plus any folder another sweep missed — using the same table component as /data.
    await safeSweep(
      'admin /admin-data',
      (p) =>
        sweepVFolders(p, E2E_ADMIN_VFOLDER_PATTERN, 'admin-data', undefined, {
          deadline: Date.now() + ADMIN_VFOLDER_SWEEP_BUDGET_MS,
        }),
      page,
    );
    await safeSweep(
      'admin services',
      (p) =>
        sweepServices(p, undefined, undefined, {
          deadline: Date.now() + ADMIN_SERVICE_SWEEP_BUDGET_MS,
        }),
      page,
    );
    // Purge any e2e-* fixture user a per-spec afterAll failed to reap. API-based,
    // so it does not use `page`; guard it directly so a failure never reds the run.
    try {
      await sweepLeftoverE2EUsers();
    } catch (error) {
      console.warn('[global-cleanup] user sweep failed (ignored):', error);
    }
  });

  // Own test, so its own 600s budget: these sweeps have no deadline. No `page`;
  // guard each directly so a failure never reds the run.
  test('sweep leftover e2e deployments, presets, roles and projects (API)', async () => {
    // Purge any e2e deployment past the age gate that an afterEach failed to reap.
    try {
      await sweepLeftoverDeployments();
    } catch (error) {
      console.warn(
        '[global-cleanup] deployment sweep failed (ignored):',
        error,
      );
    }
    try {
      await sweepLeftoverPresetsRolesAndProjects();
    } catch (error) {
      console.warn(
        '[global-cleanup] preset/role/project sweep failed (ignored):',
        error,
      );
    }
  });
});
