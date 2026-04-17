// spec: Upload Permission Controls Test Plan
import { FolderExplorerModal } from '../utils/classes/vfolder/FolderExplorerModal';
import {
  loginAsUser,
  navigateTo,
  createVFolderAndVerify,
  moveToTrashAndVerify,
  deleteForeverAndVerifyFromTrash,
} from '../utils/test-util';
import { test, expect, Page } from '@playwright/test';

const openFolderExplorer = async (
  page: Page,
  folderName: string,
): Promise<FolderExplorerModal> => {
  await navigateTo(page, 'data');
  const folderLink = page.getByRole('link', { name: folderName }).first();
  await expect(folderLink).toBeVisible({ timeout: 15000 });
  await folderLink.click();
  const modal = new FolderExplorerModal(page);
  await modal.waitForOpen();
  await modal.verifyFileExplorerLoaded();
  return modal;
};

test.describe.serial(
  'Upload Permission Controls',
  { tag: ['@critical', '@vfolder', '@functional'] },
  () => {
    const rwFolderName = 'e2e-test-perm-rw-' + Date.now();
    const roFolderName = 'e2e-test-perm-ro-' + Date.now();

    test.beforeEach(async ({ page, request }) => {
      await loginAsUser(page, request);
    });

    test.afterAll(async ({ browser, request }) => {
      // Use an extended timeout for cleanup since deleteForeverAndVerifyFromTrash
      // waits up to 15s per folder for the delete button to be enabled
      test.setTimeout(240_000);
      const context = await browser.newContext();
      const page = await context.newPage();
      await loginAsUser(page, request);

      for (const folderName of [rwFolderName, roFolderName]) {
        try {
          await moveToTrashAndVerify(page, folderName);
          await deleteForeverAndVerifyFromTrash(page, folderName);
        } catch {
          console.log(`Could not delete ${folderName}, it may not exist`);
        }
      }

      await context.close();
    });

    test('User can create RW folder and verify permission', async ({
      page,
    }) => {
      await createVFolderAndVerify(page, rwFolderName, 'general', 'user', 'rw');
      const modal = await openFolderExplorer(page, rwFolderName);
      await modal.verifyPermission('Read & Write');
      await modal.close();
    });

    // FIXME: Server returns "Cannot read properties of null (reading 'type')" on update-options API
    test.fixme('User can change permission from RW to RO', async ({ page }) => {
      const modal = await openFolderExplorer(page, rwFolderName);
      await modal.changePermission('Read only');
      await modal.close();

      // Re-open and verify the permission persisted
      const modal2 = await openFolderExplorer(page, rwFolderName);
      await modal2.verifyPermission('Read only');
      await modal2.close();
    });

    test('User can create RO folder and verify permission', async ({
      page,
    }) => {
      await createVFolderAndVerify(page, roFolderName, 'general', 'user', 'ro');
      const modal = await openFolderExplorer(page, roFolderName);
      await modal.verifyPermission('Read only');
      await modal.close();
    });

    // FIXME: Server returns "Cannot read properties of null (reading 'type')" on update-options API
    test.fixme('User can change permission from RO to RW', async ({ page }) => {
      const modal = await openFolderExplorer(page, roFolderName);
      await modal.changePermission('Read & Write');
      await modal.close();

      // Re-open and verify the permission persisted
      const modal2 = await openFolderExplorer(page, roFolderName);
      await modal2.verifyPermission('Read & Write');
      await modal2.close();
    });
  },
);
