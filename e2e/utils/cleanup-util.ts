/**
 * Reusable cleanup utilities for e2e tests.
 * Sweep-deletes services and vfolders matching e2e naming patterns.
 */
import { navigateTo } from './test-util';
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
 * Trashes and permanently deletes all vfolders matching the given pattern.
 * Step 1: Move matching folders to Trash from the active tab.
 * Step 2: Delete them forever from the Trash tab.
 */
export async function sweepVFolders(
  page: Page,
  pattern: RegExp = /e2e-mod-/i,
  maxIterations = 20,
): Promise<number> {
  await navigateTo(page, 'data');
  let trashed = 0;

  // Step 1: Move to trash
  while (trashed < maxIterations) {
    const modRow = page.getByRole('row').filter({ hasText: pattern }).first();
    if ((await modRow.count()) === 0) break;

    const trashBtn = modRow.getByRole('button', { name: 'trash bin' }).first();
    if (!(await trashBtn.isVisible({ timeout: 3000 }).catch(() => false)))
      break;
    await trashBtn.click();

    const moveBtn = page.getByRole('button', { name: 'Move' });
    if (await moveBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await moveBtn.click();
    }
    await page.waitForTimeout(2000);
    trashed++;
  }

  if (trashed === 0) return 0;

  // Step 2: Delete forever from Trash
  await navigateTo(page, 'data');
  await page.getByRole('tab', { name: 'Trash' }).click();
  await page.waitForTimeout(2000);

  let deletedForever = 0;
  while (deletedForever < maxIterations) {
    const trashedRow = page
      .getByRole('row')
      .filter({ hasText: pattern })
      .first();
    if ((await trashedRow.count()) === 0) break;

    // Extract folder name for the confirmation input
    const rowText = (await trashedRow.textContent()) || '';
    const nameMatch = rowText.match(new RegExp(pattern.source, 'i'));
    // Try to get the full folder name (e.g. e2e-mod-a-abc123)
    const fullMatch = rowText.match(/e2e-mod-[a-z]-[a-z0-9]+/i);
    const folderName = fullMatch?.[0] || nameMatch?.[0];
    if (!folderName) break;

    await trashedRow.getByRole('button').nth(1).click();
    const confirmInput = page.locator('#confirmText');
    if (await confirmInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await confirmInput.fill(folderName);
      await page.getByRole('button', { name: 'Delete forever' }).click();
      await page.waitForTimeout(3000);
    }
    deletedForever++;
  }

  console.log(
    `Swept ${trashed} vfolder(s) to trash, deleted ${deletedForever} forever`,
  );
  return deletedForever;
}
