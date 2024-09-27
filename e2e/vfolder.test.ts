import {
  createVFolderAndVerify,
  deleteVFolderAndVerify,
  fillOutVaadinGridCellFilter,
  loginAsUser,
  loginAsUser2,
  logout,
  userInfo,
} from './test-util';
import { test, expect } from '@playwright/test';

test.describe('VFolder ', () => {
  test('User can create and delete vFolder', async ({ page }) => {
    await loginAsUser(page);
    const folderName = 'e2e-test-folder-user-creation' + new Date().getTime();
    await createVFolderAndVerify(page, folderName);
    await deleteVFolderAndVerify(page, folderName);
  });
});

test.describe('VFolder sharing', () => {
  const sharingFolderName = 'e2e-test-folder-sharing';
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    await createVFolderAndVerify(page, sharingFolderName);
  });

  test('User can share vFolder to User2. User2 can accept invitation', async ({
    page,
  }) => {
    await page
      .locator('#general-folder-storage vaadin-grid-cell-content')
      .filter({ hasText: sharingFolderName })
      .locator('//following-sibling::*[7]')
      .getByRole('button', { name: 'share' })
      .click();
    await page.getByRole('textbox', { name: 'Enter E-Mail address' }).click();
    await page
      .getByRole('textbox', { name: 'Enter E-Mail address' })
      .fill('user2@lablup.com');
    await page
      .locator('#share-folder-dialog')
      .locator('#share-button')
      .getByLabel('share')
      .click();

    await logout(page);
    await loginAsUser2(page);

    // click accept button in the invitation
    await page
      .getByText(`From ${userInfo.user.email}`)
      .locator('..')
      .filter({ hasText: sharingFolderName })
      .getByRole('button', { name: 'accept' })
      .first()
      .click();
    await page.getByRole('menuitem', { name: 'Data & Storage' }).click();
    await page.waitForTimeout(1000);

    await fillOutVaadinGridCellFilter(
      page.locator('#general-folder-storage'),
      'Name',
      sharingFolderName,
    );

    await page
      .locator('#general-folder-storage vaadin-grid-cell-content')
      .filter({ hasText: sharingFolderName })
      .locator('//following-sibling::*[7]')
      .getByLabel('remove_circle')
      .click();
    await page.getByLabel('Type folder name to leave').click();
    await page.getByLabel('Type folder name to leave').fill(sharingFolderName);
    await page.getByRole('button', { name: 'Leave' }).click();

    await page.waitForTimeout(1000);
    // check disappeared
    await expect(
      page
        .locator('#general-folder-storage vaadin-grid-cell-content')
        .filter({ hasText: sharingFolderName })
        .first(),
    ).toBeHidden();

    await logout(page);
    await loginAsUser(page);
    await deleteVFolderAndVerify(page, sharingFolderName);
  });

  test('User2 can not see the invitation if User deleted the folder you shared.', async ({
    page,
  }) => {
    await page
      .locator('#general-folder-storage vaadin-grid-cell-content')
      .filter({ hasText: sharingFolderName })
      .locator('//following-sibling::*[7]')
      .getByRole('button', { name: 'share' })
      .click();
    await page.getByRole('textbox', { name: 'Enter E-Mail address' }).click();
    await page
      .getByRole('textbox', { name: 'Enter E-Mail address' })
      .fill('user2@lablup.com');
    await page
      .locator('#share-folder-dialog')
      .locator('#share-button')
      .getByLabel('share')
      .click();

    await logout(page);
    await loginAsUser2(page);

    // check the invitation is sent to User2
    await expect(
      page
        .getByText(`From ${userInfo.user.email}`)
        .locator('..')
        .filter({ hasText: sharingFolderName }),
    ).toBeVisible();

    await logout(page);
    await loginAsUser(page);
    await deleteVFolderAndVerify(page, sharingFolderName);

    // check the invitation is disappeared
    await logout(page);
    await loginAsUser2(page);
    await expect(
      page
        .getByText(`From ${userInfo.user.email}`)
        .locator('..')
        .filter({ hasText: sharingFolderName }),
    ).toBeHidden();
  });

  test('User2 can see the invitation but can not accept if User deleted the folder when User2 is trying to accept.', async ({
    page,
    browser,
  }) => {
    await page
      .locator('#general-folder-storage vaadin-grid-cell-content')
      .filter({ hasText: sharingFolderName })
      .locator('//following-sibling::*[7]')
      .getByRole('button', { name: 'share' })
      .click();
    await page.getByRole('textbox', { name: 'Enter E-Mail address' }).click();
    await page
      .getByRole('textbox', { name: 'Enter E-Mail address' })
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
    await deleteVFolderAndVerify(page, sharingFolderName);

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
  });
});
