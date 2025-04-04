import {
  createVFolderAndVerify,
  deleteForeverAndVerifyFromTrash,
  fillOutVaadinGridCellFilter,
  loginAsUser,
  loginAsUser2,
  logout,
  moveToTrashAndVerify,
  navigateTo,
  restoreVFolderAndVerify,
  userInfo,
} from './test-util';
import { test, expect } from '@playwright/test';

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

  test('User can share vFolder to User2. User2 can accept invitation', async ({
    page,
    browser,
  }) => {
    await fillOutVaadinGridCellFilter(
      page.locator('#general-folder-storage'),
      'Name',
      sharingFolderName,
    );
    await expect(
      page
        .locator('vaadin-grid-cell-content')
        .filter({ hasText: sharingFolderName }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'share' })).toHaveCount(1);
    await page.getByRole('button', { name: 'share' }).click();
    await page.getByRole('textbox', { name: 'Enter email address' }).click();
    await page
      .getByRole('textbox', { name: 'Enter email address' })
      .fill('user2@lablup.com');
    await page
      .locator('#share-folder-dialog')
      .locator('#share-button')
      .getByLabel('share')
      .click();
    // check the invitation and accept as User2
    const page2 = await browser.newPage();
    await loginAsUser2(page2);
    await expect(
      page2
        .getByText(`From ${userInfo.user.email}`)
        .locator('..')
        .filter({ hasText: sharingFolderName }),
    ).toBeVisible();
    await page2
      .getByText(`From ${userInfo.user.email}`)
      .locator('..')
      .filter({ hasText: sharingFolderName })
      .getByRole('button', { name: 'accept' })
      .click();
    // check the shared folder is visible
    await navigateTo(page2, 'data');
    await fillOutVaadinGridCellFilter(
      page2.locator('#general-folder-storage'),
      'Name',
      sharingFolderName,
    );
    await expect(
      page2
        .locator('vaadin-grid-cell-content')
        .filter({ hasText: sharingFolderName }),
    ).toBeVisible();
    // leave the shared folder
    await expect(
      page2.getByRole('button', { name: 'remove_circle' }),
    ).toHaveCount(1);
    await page2.getByRole('button', { name: 'remove_circle' }).click();
    await page2
      .getByRole('textbox', { name: 'Type folder name to leave' })
      .click();
    await page2.getByLabel('Type folder name to leave').fill(sharingFolderName);
    await page2.getByRole('button', { name: 'Leave' }).click();
    // delete folder
    await moveToTrashAndVerify(page, sharingFolderName);
    await deleteForeverAndVerifyFromTrash(page, sharingFolderName);
    await page.close();
    await page2.close();
  });

  test('User2 can not see the invitation if User deleted the folder you shared.', async ({
    page,
    browser,
  }) => {
    await fillOutVaadinGridCellFilter(
      page.locator('#general-folder-storage'),
      'Name',
      sharingFolderName,
    );
    await expect(
      page
        .locator('vaadin-grid-cell-content')
        .filter({ hasText: sharingFolderName }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'share' })).toHaveCount(1);
    await page.getByRole('button', { name: 'share' }).click();
    await page.getByRole('textbox', { name: 'Enter email address' }).click();
    await page
      .getByRole('textbox', { name: 'Enter email address' })
      .fill('user2@lablup.com');
    await page
      .locator('#share-folder-dialog')
      .locator('#share-button')
      .getByLabel('share')
      .click();
    // check the invitation is sent to User2
    const page2 = await browser.newPage();
    await loginAsUser2(page2);
    await expect(
      page2
        .getByText(`From ${userInfo.user.email}`)
        .locator('..')
        .filter({ hasText: sharingFolderName }),
    ).toBeVisible();
    // Delete folder as User before User2 accept the invitation
    await moveToTrashAndVerify(page, sharingFolderName);
    await deleteForeverAndVerifyFromTrash(page, sharingFolderName);
    // check the invitation is disappeared
    await page2.reload();
    await expect(
      // make sure summary page is rendered
      page2.getByTitle('Invitation'),
    ).toBeVisible();
    await expect(
      page2
        .getByText(`From ${userInfo.user.email}`)
        .locator('..')
        .filter({ hasText: sharingFolderName }),
    ).toHaveCount(0);
    await page.close();
    await page2.close();
  });

  test('User2 can see the invitation but can not accept if User deleted the folder when User2 is trying to accept.', async ({
    page,
    browser,
  }) => {
    await fillOutVaadinGridCellFilter(
      page.locator('#general-folder-storage'),
      'Name',
      sharingFolderName,
    );
    await expect(
      page
        .locator('vaadin-grid-cell-content')
        .filter({ hasText: sharingFolderName }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'share' })).toHaveCount(1);
    await page.getByRole('button', { name: 'share' }).click();
    await page.getByRole('textbox', { name: 'Enter email address' }).click();
    await page
      .getByRole('textbox', { name: 'Enter email address' })
      .fill('user2@lablup.com');
    await page
      .locator('#share-folder-dialog')
      .locator('#share-button')
      .getByLabel('share')
      .click();
    // check the invitation is sent to User2
    const page2 = await browser.newPage();
    await loginAsUser2(page2);
    await expect(
      page2
        .getByText(`From ${userInfo.user.email}`)
        .locator('..')
        .filter({ hasText: sharingFolderName }),
    ).toBeVisible();
    // User delete the folder when User2 is trying to accept
    await moveToTrashAndVerify(page, sharingFolderName);
    await deleteForeverAndVerifyFromTrash(page, sharingFolderName);
    // User2 accept the invitation
    await page2
      .getByText(`From ${userInfo.user.email}`)
      .locator('..')
      .filter({ hasText: sharingFolderName })
      .getByRole('button', { name: 'accept' })
      .first()
      .click();
    await expect(
      page2
        .locator('.ant-notification-notice')
        .filter({ hasText: 'No such vfolder invitation' }),
    ).toBeVisible();
    await page.close();
    await page2.close();
  });
});
