import {
  acceptAllInvitationAndVerifySpecificFolder,
  createVFolderAndVerify,
  deleteForeverAndVerifyFromTrash,
  loginAsUser,
  loginAsUser2,
  moveToTrashAndVerify,
  restoreVFolderAndVerify,
  shareVFolderAndVerify,
  userInfo,
} from './test-util';
import { test } from '@playwright/test';

test.describe('VFolder ', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
  });
  const folderName = 'e2e-test-folder-user-creation' + new Date().getTime();
  test('User can create and delete, delete forever vFolder', async ({
    page,
  }) => {
    await createVFolderAndVerify(page, folderName);
    await moveToTrashAndVerify(page, folderName);
    await deleteForeverAndVerifyFromTrash(page, folderName);
  });

  test('User can create, delete(move to trash), restore, delete forever vFolder', async ({
    page,
  }) => {
    await createVFolderAndVerify(page, folderName);
    await moveToTrashAndVerify(page, folderName);
    await restoreVFolderAndVerify(page, folderName);
    await moveToTrashAndVerify(page, folderName);
    await deleteForeverAndVerifyFromTrash(page, folderName);
  });
});

test.describe('VFolder sharing', () => {
  const sharingFolderName = 'e2e-test-folder-sharing' + new Date().getTime();
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    await createVFolderAndVerify(page, sharingFolderName);
  });
  test.afterEach(async ({ page }) => {
    await moveToTrashAndVerify(page, sharingFolderName);
    await deleteForeverAndVerifyFromTrash(page, sharingFolderName);
  });

  test('User can share vFolder', async ({ page, browser }) => {
    await shareVFolderAndVerify(page, sharingFolderName, userInfo.user2.email);
    const user2_page = await browser.newPage();
    await loginAsUser2(user2_page);
    await acceptAllInvitationAndVerifySpecificFolder(
      user2_page,
      sharingFolderName,
    );
  });
});
