import { FolderCreationModal } from '../utils/classes/vfolder/FolderCreationModal';
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
} from './utils/test-util';
import { test, expect } from '@playwright/test';

test.describe('VFolder ', () => {
  test.beforeEach(async ({ page, request }) => {
    await loginAsUser(page, request);
  });
  const folderName = 'e2e-test-folder-user-creation' + new Date().getTime();
  test.describe('vFolder Creation', () => {
    test.beforeEach(async ({ page }) => {
      await page.getByRole('link', { name: 'Data' }).click();
      await page.getByRole('button', { name: 'Create Folder' }).nth(1).click();
    });
    test.afterEach(async ({ page }) => {
      await moveToTrashAndVerify(page, folderName);
      await deleteForeverAndVerifyFromTrash(page, folderName);
    });
    test('User can create a vFolder by selecting a specific location', async ({
      page,
    }) => {
      const folderCreationModal = new FolderCreationModal(page);
      await folderCreationModal.modalToBeVisible();
      await folderCreationModal.fillFolderName(folderName);
      await folderCreationModal.fillLocationSelector('local');
      await folderCreationModal.selectLocationOptionByText('local');
      await (await folderCreationModal.getCreateButton()).click();
    });
    test('User can create default vFolder', async ({ page }) => {
      const folderCreationModal = new FolderCreationModal(page);
      await folderCreationModal.modalToBeVisible();
      await folderCreationModal.fillFolderName(folderName);
      await (await folderCreationModal.getCreateButton()).click();
    });
    test('User can create Model vFolder', async ({ page }) => {
      const folderCreationModal = new FolderCreationModal(page);
      await folderCreationModal.modalToBeVisible();
      await folderCreationModal.fillFolderName(folderName);
      await (await folderCreationModal.getModelUsageModeRadio()).check();
      await expect(
        await folderCreationModal.getModelUsageModeRadio(),
      ).toBeChecked();
      await (await folderCreationModal.getCreateButton()).click();
    });
    test('User can create cloneable Model vFolder', async ({ page }) => {
      const folderCreationModal = new FolderCreationModal(page);
      await folderCreationModal.modalToBeVisible();
      await folderCreationModal.fillFolderName(folderName);
      await (await folderCreationModal.getModelUsageModeRadio()).check();
      await expect(
        await folderCreationModal.getModelUsageModeRadio(),
      ).toBeChecked();
      await (await folderCreationModal.getCloneableSwitchButton()).click();
      await expect(
        await folderCreationModal.getCloneableSwitchButton(),
      ).toBeChecked();
      await (await folderCreationModal.getCreateButton()).click();
    });
    test('User can create Read & Write vFolder', async ({ page }) => {
      const folderCreationModal = new FolderCreationModal(page);
      await folderCreationModal.modalToBeVisible();
      await folderCreationModal.fillFolderName(folderName);
      await (await folderCreationModal.getReadWritePermissionRadio()).check();
      await expect(
        await folderCreationModal.getReadWritePermissionRadio(),
      ).toBeChecked();
      await (await folderCreationModal.getCreateButton()).click();
    });
    test('User can create Read Only vFolder', async ({ page }) => {
      const folderCreationModal = new FolderCreationModal(page);
      await folderCreationModal.modalToBeVisible();
      await folderCreationModal.fillFolderName(folderName);
      await (await folderCreationModal.getReadOnlyPermissionRadio()).check();
      await expect(
        await folderCreationModal.getReadOnlyPermissionRadio(),
      ).toBeChecked();
      await (await folderCreationModal.getCreateButton()).click();
    });
  });
  test.describe('Auto Mount vFolder Creation', () => {
    const folderName = '.e2e-test-folder-auto-mount' + new Date().getTime();
    test.beforeEach(async ({ page }) => {
      await page.getByRole('link', { name: 'Data' }).click();
      await page.getByRole('button', { name: 'Create Folder' }).nth(1).click();
    });
    test.afterEach(async ({ page }) => {
      await moveToTrashAndVerify(page, folderName);
      await deleteForeverAndVerifyFromTrash(page, folderName);
    });
    test('User can create Auto Mount vFolder', async ({ page }) => {
      const folderCreationModal = new FolderCreationModal(page);
      await folderCreationModal.modalToBeVisible();
      await folderCreationModal.fillFolderName(folderName);
      await (await folderCreationModal.getAutoMountUsageModeRadio()).check();
      await expect(
        await folderCreationModal.getAutoMountUsageModeRadio(),
      ).toBeChecked();
      await (await folderCreationModal.getCreateButton()).click();
    });
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

  test('User can share vFolder', async ({ page, browser, request }) => {
    await shareVFolderAndVerify(page, sharingFolderName, userInfo.user2.email);
    const user2_page = await browser.newPage();
    await loginAsUser2(user2_page, request);
    await acceptAllInvitationAndVerifySpecificFolder(
      user2_page,
      sharingFolderName,
    );
  });
});
