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
 */
import { sweepServices, sweepVFolders } from './utils/cleanup-util';
import { loginAsAdmin, loginAsUser } from './utils/test-util';
import { Page, test } from '@playwright/test';

// Matches every e2e vfolder naming scheme used across the specs.
const E2E_VFOLDER_PATTERN = /e2e-/i;

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
  });
});
