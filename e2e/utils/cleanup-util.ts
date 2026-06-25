/**
 * Reusable cleanup utilities for e2e tests.
 * Sweep-deletes services and vfolders matching e2e naming patterns.
 */
import {
  navigateTo,
  moveToTrashAndVerify,
  deleteForeverAndVerifyFromTrash,
} from './test-util';
import { Page } from '@playwright/test';

/**
 * Locates the BAIFetchKeyButton (refresh/reload button) by the ReloadOutlined icon.
 */
function getTableRefreshButton(page: Page) {
  return page
    .locator('button')
    .filter({ has: page.locator('.anticon-reload') })
    .first();
}

/**
 * Deletes all services matching the given pattern from the serving page.
 * Uses the table refresh button + delete icon button + Ant Design confirm modal.
 */
export async function sweepServices(
  page: Page,
  pattern: RegExp = /e2e-svc-/i,
  maxIterations = 20,
): Promise<number> {
  await navigateTo(page, 'serving');

  const refreshButton = getTableRefreshButton(page);
  let deleted = 0;

  while (deleted < maxIterations) {
    if (await refreshButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await refreshButton.click();
      await page.waitForTimeout(2000);
    }

    const serviceRow = page
      .getByRole('row')
      .filter({ hasText: pattern })
      .first();
    if ((await serviceRow.count()) === 0) break;

    // Hover over the first cell to reveal BAINameActionCell action buttons
    await serviceRow
      .getByRole('cell')
      .first()
      .hover()
      .catch(() => {});

    const deleteBtn = serviceRow
      .getByRole('button', { name: 'delete' })
      .first();
    if (!(await deleteBtn.isVisible({ timeout: 5000 }).catch(() => false))) {
      console.log('Service row found but no delete button, skipping');
      break;
    }
    await deleteBtn.click();

    const confirmBtn = page
      .locator('.ant-modal-confirm')
      .getByRole('button', { name: 'Delete' })
      .first();
    if (await confirmBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await confirmBtn.click();
    }

    await page.waitForTimeout(3000);
    deleted++;
  }

  if (deleted > 0) {
    console.log(`Swept ${deleted} service(s) matching ${pattern}`);
  }
  return deleted;
}

/**
 * Returns the exact name of the first vfolder row matching `pattern` on the
 * current tab that is actionable (not in `skip`, and — when
 * `requireEnabledDelete` is set — whose move-to-trash button is enabled), or
 * null when none qualifies. The name is read from the row's identicon name cell
 * (`VFolder Identicon <name>`); the identicon is an <img> (no text), so the
 * cell's text content is just the folder name — exactly the string the
 * maintained trash/delete helpers and the "type to confirm" dialog need.
 *
 * Why the enabled check matters: the broad teardown sweep runs on /data as the
 * regular user, where project-type folders (created by an admin) are visible
 * but their move-to-trash button is DISABLED. Without this guard the sweep
 * would call `moveToTrashAndVerify` on such a row and the unbounded `.click()`
 * on a disabled button would retry until the whole 180s test budget is gone,
 * aborting cleanup and stranding every other orphan. Un-actionable rows are
 * added to `skip` so the caller's loop advances to the next candidate instead
 * of re-selecting the same stuck row forever.
 *
 * Waits briefly so a still-loading table is not mistaken for "empty".
 */
async function firstActionableVFolderName(
  page: Page,
  pattern: RegExp,
  skip: Set<string>,
  requireEnabledDelete: boolean,
): Promise<string | null> {
  const rows = page.getByRole('row').filter({ hasText: pattern });
  const appeared = await rows
    .first()
    .waitFor({ state: 'visible', timeout: 5000 })
    .then(() => true)
    .catch(() => false);
  if (!appeared) return null;

  const count = await rows.count();
  for (let i = 0; i < count; i++) {
    const row = rows.nth(i);
    const nameCell = row
      .getByRole('cell', { name: /VFolder Identicon/ })
      .first();
    const name = (await nameCell.textContent().catch(() => null))?.trim();
    if (!name || skip.has(name)) continue;

    if (requireEnabledDelete) {
      const deleteBtn = row.getByRole('button', { name: 'delete' }).first();
      // Read the button's enabled state directly. The move-to-trash button's
      // disabled flag is derived from data that arrives with the row itself
      // (`vfolder.permissions` → `delete_vfolder`), so it is correct as soon as
      // the row is visible — no settling wait is needed. Reading instantly (vs.
      // waiting) keeps the sweep fast even when the page lists many folders the
      // current account cannot delete (e.g. the admin viewing every user's
      // folders on /admin-data); a slow per-row wait there can exhaust the
      // teardown's time budget. A genuinely un-deletable folder is skipped so
      // the sweep still never hangs on it.
      const enabled = await deleteBtn
        .isEnabled({ timeout: 2000 })
        .catch(() => false);
      if (!enabled) {
        skip.add(name);
        continue;
      }
    }
    return name;
  }
  return null;
}

/**
 * Trashes and permanently deletes every vfolder matching `pattern` on the given
 * data page. Choose `dataPath` to match where the folder is DELETABLE:
 *   - `data`        — personal folders (the regular user data page);
 *   - `admin-data`  — project folders and any folder visible to an admin
 *                     (`AdminVFolderNodeListPage`). Project folders are created
 *                     on `/project-data` but can only be deleted from
 *                     `/admin-data`, which shares the same table component as
 *                     `/data`.
 *
 * Phase 1: Active tab — move each match to Trash and delete it forever.
 * Phase 2: Trash tab — delete forever any remaining orphans (folders a previous,
 *   possibly aborted, test moved to Trash but never permanently deleted — the
 *   lingering `DELETE-PENDING` rows).
 *
 * Rather than duplicate the row-action selectors (which drift — e.g. the move-to-
 * trash confirm button is "Confirm", not "Move"), this delegates to the
 * maintained `moveToTrashAndVerify` / `deleteForeverAndVerifyFromTrash` helpers.
 * Each iteration re-reads the first matching name and operates by exact name, so
 * it never hangs on a stale locator. It is best-effort: a single stuck folder
 * stops that phase (logged) rather than failing the caller.
 */
export async function sweepVFolders(
  page: Page,
  pattern: RegExp = /e2e-mod-/i,
  dataPath: string = 'data',
  maxIterations = 20,
): Promise<number> {
  let removed = 0;

  // Phase 1: fully remove each Active folder (trash + delete forever). Skip
  // rows whose move-to-trash button is disabled (e.g. project folders the
  // current account cannot delete here) and rows that error out, so one stuck
  // orphan never strands the rest of the sweep.
  const activeSkip = new Set<string>();
  for (let i = 0; i < maxIterations; i++) {
    await navigateTo(page, dataPath);
    await page
      .getByRole('tab', { name: 'Active' })
      .click()
      .catch(() => {});
    const name = await firstActionableVFolderName(
      page,
      pattern,
      activeSkip,
      true,
    );
    if (!name) break;
    try {
      await moveToTrashAndVerify(page, name, dataPath);
      await deleteForeverAndVerifyFromTrash(page, name, dataPath);
      removed++;
    } catch (error) {
      console.warn(
        `[sweepVFolders:${dataPath}] could not remove active "${name}" (skipping):`,
        error,
      );
      activeSkip.add(name);
    }
  }

  // Phase 2: delete forever any leftover Trash orphans. Same skip-and-continue
  // policy; `deleteForeverAndVerifyFromTrash` already bounds its own enabled
  // check, so a stuck trash row fails fast and is skipped.
  const trashSkip = new Set<string>();
  for (let i = 0; i < maxIterations; i++) {
    await navigateTo(page, dataPath);
    await page
      .getByRole('tab', { name: 'Trash' })
      .click()
      .catch(() => {});
    const name = await firstActionableVFolderName(
      page,
      pattern,
      trashSkip,
      false,
    );
    if (!name) break;
    try {
      await deleteForeverAndVerifyFromTrash(page, name, dataPath);
      removed++;
    } catch (error) {
      console.warn(
        `[sweepVFolders:${dataPath}] could not delete trashed "${name}" (skipping):`,
        error,
      );
      trashSkip.add(name);
    }
  }

  if (removed > 0) {
    console.log(
      `[sweepVFolders:${dataPath}] removed ${removed} folder(s) (pattern ${pattern}).`,
    );
  }
  return removed;
}

/**
 * Best-effort cleanup of a single test vfolder that NEVER throws (FR-3090).
 *
 * Cleanup hooks (`afterAll`/`afterEach`) previously wrapped the normal
 * trash + delete-forever flow in a `try/catch` that just logged on failure,
 * silently leaving the folder behind so `e2e-test-*` orphans accumulated on
 * the test server. This helper keeps the "a cleanup hiccup must not fail an
 * otherwise-passing test" property but actually removes the orphan:
 *
 *  1. Happy path — `moveToTrashAndVerify` + `deleteForeverAndVerifyFromTrash`.
 *  2. Fallback A — the folder may already be in Trash (move-to-trash
 *     succeeded but delete-forever failed), so retry the delete-forever step.
 *  3. Fallback B — the folder may still be in Active, so sweep it out by name.
 *
 * Each stage is guarded; the helper resolves even if every stage fails (it
 * only warns), so it is safe to call unguarded from a cleanup hook.
 *
 * Use it ONLY for cleanup hooks — never for tests that assert the delete flow
 * itself (e.g. the consecutive-deletion / create-delete-restore tests).
 */
export async function cleanupVFolderSafely(
  page: Page,
  folderName: string,
  dataPath: string = 'data',
): Promise<void> {
  try {
    await moveToTrashAndVerify(page, folderName, dataPath);
    await deleteForeverAndVerifyFromTrash(page, folderName, dataPath);
    return;
  } catch (error) {
    console.warn(
      `[cleanupVFolderSafely] primary cleanup of "${folderName}" failed; attempting fallbacks.`,
      error,
    );
  }

  // Fallback A: folder may already be in Trash (move succeeded, delete failed).
  try {
    await deleteForeverAndVerifyFromTrash(page, folderName, dataPath);
    return;
  } catch {
    // fall through to the sweep
  }

  // Fallback B: folder may still be in Active — sweep it out by exact name on
  // the same data page it was created on (project folders live on project-data).
  try {
    const escaped = folderName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    await sweepVFolders(page, new RegExp(escaped, 'i'), dataPath);
  } catch (sweepError) {
    console.warn(
      `[cleanupVFolderSafely] all fallbacks for "${folderName}" failed; manual cleanup may be needed.`,
      sweepError,
    );
  }
}
