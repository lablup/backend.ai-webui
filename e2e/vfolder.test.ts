import { test, expect } from '@playwright/test';
import { createVFolderAndVerify, deleteVFolderAndVerify, fillOutVaadinGridCellFilter, loginAsUser, loginAsUser2, logout, userInfo } from './test-util';


test.describe('VFolder ', () => {
  test('User can create and delete vFolder', async ({ page }) => {
    await loginAsUser(page);
    const folderName = 'e2e-test-folder-user-creation' + new Date().getTime();
    await createVFolderAndVerify(page, folderName);
    await deleteVFolderAndVerify(page, folderName);
  });
});

test.describe('VFolder sharing', ()=>{

  const sharingFolderName = 'e2e-test-folder-sharing';
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    await createVFolderAndVerify(page, sharingFolderName);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
    await loginAsUser(page);
    await deleteVFolderAndVerify(page, sharingFolderName);
  });

  test('User can share vFolder to User2. User2 can accept invitation', async ({ page }) => {
    await page.locator("#general-folder-storage vaadin-grid-cell-content").filter({ hasText: sharingFolderName }).locator("//following-sibling::*[7]").getByRole('button', { name: 'share' }).click();
    await page.getByRole('textbox', { name: 'Enter E-Mail address' }).click();
    await page.getByRole('textbox', { name: 'Enter E-Mail address' }).fill('user2@lablup.com');
    // await page.getByRole('button', { name: 'add', exact: true }).click();
    // await page.getByLabel('Enter E-Mail address').nth(1).click();
    // await page.getByLabel('Enter E-Mail address').nth(1).fill('admin@lablup.com');
    await page.locator('#share-folder-dialog').locator('#share-button').getByLabel('share').click();

    await logout(page);
    await loginAsUser2(page);

    // click accept button in the invitation
    await page.getByText(`From ${userInfo.user.email}`).locator('..').filter({ hasText: sharingFolderName }).getByRole('button', { name: 'accept' }).first().click();
    await page.getByRole('menuitem', { name: 'Data & Storage' }).click();
    await page.waitForTimeout(1000);
    
    await fillOutVaadinGridCellFilter(page.locator("#general-folder-storage"), 'Name', sharingFolderName);
    
    await page.locator("#general-folder-storage vaadin-grid-cell-content").filter({ hasText: sharingFolderName }).locator("//following-sibling::*[7]").getByLabel('remove_circle').click();
    await page.getByLabel('Type folder name to leave').click();
    await page.getByLabel('Type folder name to leave').fill(sharingFolderName);
    await page.getByRole('button', { name: 'Leave' }).click();

    await page.waitForTimeout(1000);
    // check disappeared
    await expect(page.locator("#general-folder-storage vaadin-grid-cell-content").filter({ hasText: sharingFolderName }).first()).toBeHidden();
  });
});
