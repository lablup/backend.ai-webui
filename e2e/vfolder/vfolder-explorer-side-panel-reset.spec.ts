// spec: FR-4005 (#9793) — the explorer's side panel starts on Metadata every time it opens
import { FolderExplorerModal } from '../utils/classes/vfolder/FolderExplorerModal';
import { cleanupVFolderSafely } from '../utils/cleanup-util';
import {
  clearAllFilters,
  createVFolderAndVerify,
  getPowerSearchInput,
  loginAsAdmin,
  selectPropertyFilter,
} from '../utils/test-util';
import { test, expect, Page } from '@playwright/test';

// Narrow the Data list to this folder by name before clicking it: on a shared
// server the folder may not be on the first page. Clear first, so a filter left
// over from the previous folder does not hide this one. Removing a token
// leaves focus on the search bar, where a click no longer opens the field
// list, so blur it before searching again. No reload here: reloading would
// reset the explorer state this spec checks.
const openFolderExplorer = async (page: Page, folderName: string) => {
  await clearAllFilters(page);
  await getPowerSearchInput(page).blur();
  await selectPropertyFilter(page, 'Name', folderName);
  const folderLink = page.getByRole('link', { name: folderName }).first();
  await expect(folderLink).toBeVisible({ timeout: 15000 });
  await folderLink.click();
  const modal = new FolderExplorerModal(page);
  await modal.waitForOpen();
  await modal.verifyFolderName(folderName);
  return modal;
};

// The side panel's tab strip is a tablist; the selected tab has `aria-selected`.
const getSidePanelTab = (page: Page, name: 'Metadata' | 'Audit Log') =>
  page
    .getByRole('dialog')
    .first()
    .getByRole('tablist')
    .getByRole('tab', { name, exact: true });

test.describe(
  'FolderExplorerModal - Side Panel',
  { tag: ['@regression', '@vfolder', '@functional'] },
  () => {
    const createdFolderNames: string[] = [];

    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
    });

    test.afterEach(async ({ page }) => {
      for (const name of createdFolderNames.splice(0)) {
        await cleanupVFolderSafely(page, name);
      }
    });

    test('User can see the side panel start on Metadata when opening another folder after viewing the Audit Log', async ({
      page,
    }) => {
      test.setTimeout(180_000);
      const suffix = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const [firstFolder, secondFolder] = [
        `e2e-side-panel-a-${suffix}`,
        `e2e-side-panel-b-${suffix}`,
      ];
      // A team project's Data page lists only project folders, and a folder
      // POSTed without a project is user-owned, so create these through the page.
      for (const name of [firstFolder, secondFolder]) {
        createdFolderNames.push(name);
        await createVFolderAndVerify(page, name);
      }

      // 1. The first folder's side panel opens on Metadata; switch to Audit Log.
      const firstModal = await openFolderExplorer(page, firstFolder);
      await expect(getSidePanelTab(page, 'Metadata')).toHaveAttribute(
        'aria-selected',
        'true',
      );
      await getSidePanelTab(page, 'Audit Log').click();
      await expect(getSidePanelTab(page, 'Audit Log')).toHaveAttribute(
        'aria-selected',
        'true',
      );
      await firstModal.close();

      // 2. Opening a different folder starts the side panel over on Metadata.
      await openFolderExplorer(page, secondFolder);
      await expect(getSidePanelTab(page, 'Metadata')).toHaveAttribute(
        'aria-selected',
        'true',
      );
      await expect(getSidePanelTab(page, 'Audit Log')).not.toHaveAttribute(
        'aria-selected',
        'true',
      );
    });
  },
);
