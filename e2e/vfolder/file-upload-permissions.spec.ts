// spec: Upload Permission Controls Test Plan
import { FolderExplorerModal } from '../utils/classes/vfolder/FolderExplorerModal';
import { cleanupVFolderSafely } from '../utils/cleanup-util';
import {
  loginAsUser,
  navigateTo,
  createVFolderAndVerify,
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

// Since #10647 the create modal offers no mount permission: every folder is
// created read-only for shared users, and the default is changed from the
// share modal's folder settings card. Keep serial: the change test (fixme —
// FR-3110) reuses the folder created by the first test.
test.describe.serial(
  'Upload Permission Controls',
  { tag: ['@critical', '@vfolder', '@functional'] },
  () => {
    const folderName = 'e2e-test-perm-' + Date.now();

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

      await cleanupVFolderSafely(page, folderName);

      await context.close();
    });

    test('User creates a folder and it is read-only for shared users', async ({
      page,
    }) => {
      await createVFolderAndVerify(page, folderName);

      // The list shows the shared-user mount permission, read-only by default.
      await navigateTo(page, 'data');
      const folderRow = page.getByRole('row', {
        name: new RegExp(folderName),
      });
      await expect(folderRow.getByText('Read only').first()).toBeVisible();

      // The explorer no longer shows or edits the mount permission; the owner
      // still writes to the folder.
      const modal = await openFolderExplorer(page, folderName);
      await modal.verifyFolderDetails();
      await expect(await modal.getUploadButton()).toBeEnabled();
      await modal.close();
    });

    // FIXME: Server returns "Cannot read properties of null (reading 'type')" on update-options API
    test.fixme('User can change the default mount permission from the share modal', async ({
      page,
    }) => {
      // Open the folder's share modal from the row's share action, press Edit
      // on the folder settings card, pick "Read & Write" and save; the list
      // row then shows "Read & Write".
      await navigateTo(page, 'data');
      const folderRow = page.getByRole('row', {
        name: new RegExp(folderName),
      });
      await folderRow.getByRole('button', { name: 'Share' }).click();
      const shareModal = page
        .getByRole('dialog')
        .filter({ hasText: 'Share Folder' });
      await shareModal.getByRole('button', { name: 'Edit' }).click();
      const editModal = page
        .getByRole('dialog')
        .filter({ hasText: /default mount permission/i })
        .last();
      await editModal.getByLabel('Read & Write', { exact: true }).click();
      await editModal.getByRole('button', { name: 'Save' }).click();
      await expect(
        shareModal.getByText('Read & Write', { exact: true }).first(),
      ).toBeVisible();
    });
  },
);
