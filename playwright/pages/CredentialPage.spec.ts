import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

test.describe('Create account', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:9081');
    await page.locator('#id_user_id label').click();
    await page
      .locator('#id_user_id label')
      .fill(process.env.SUPER_ADMIN_EMAIL as string);
    await page.locator('#id_password label').click();
    await page
      .locator('#id_password label')
      .fill(process.env.SUPER_ADMIN_PASSWORD as string);
    await page.locator('#id_api_endpoint label').click();
    await page
      .locator('#id_api_endpoint label')
      .fill(process.env.ENDPOINT as string);
    await page.locator('#login-button').click();
    await page.getByTestId('credential').click();
    await page.waitForURL('**/credential');
    await page.locator('mwc-tab[title="user-lists"]').click();
    await page.locator('mwc-tab[title="active-user-list"]').click();
  });
  test('Admin can create account', async ({ page }) => {
    const email = 'test6@lablup.com'; //Write new account'email
    const userName = 'test6'; //Write new account'userName
    const password = 'test123!'; //Write new account'password
    await page.locator('#add-user').click();
    await page.locator('#new-user-dialog #id_user_email').click();
    await page.locator('#new-user-dialog #id_user_email label').fill(email);
    await page.locator('#new-user-dialog #id_user_name').click();
    await page.locator('#new-user-dialog #id_user_name label').fill(userName);
    await page.locator('#new-user-dialog #id_user_password').click();
    await page
      .locator('#new-user-dialog #id_user_password label')
      .fill(password);
    await page.locator('#new-user-dialog #id_user_confirm').click();
    await page
      .locator('#new-user-dialog #id_user_confirm label')
      .fill(password);
    await page.locator('#new-user-dialog #create-user-button').click();
    await expect(
      page
        .locator('#active-user-list vaadin-grid-cell-content')
        .filter({ hasText: email }),
    ).toBeVisible();
    await page.locator('mwc-tab[title="credential-lists"]').click();
    await page.locator('mwc-tab[title="active-credential-list"]').click();
    await expect(
      page
        .locator('#active-credential-list vaadin-grid-cell-content')
        .filter({ hasText: email }),
    ).toBeVisible();
  });
});

test.describe('Delete account', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:9081');
    await page.locator('#id_user_id label').click();
    await page
      .locator('#id_user_id label')
      .fill(process.env.SUPER_ADMIN_EMAIL as string);
    await page.locator('#id_password label').click();
    await page
      .locator('#id_password label')
      .fill(process.env.SUPER_ADMIN_PASSWORD as string);
    await page.locator('#id_api_endpoint label').click();
    await page
      .locator('#id_api_endpoint label')
      .fill(process.env.ENDPOINT as string);
    await page.locator('#login-button').click();
    await page.getByTestId('credential').click();
    await page.waitForURL('**/credential');
    await page.locator('mwc-tab[title="user-lists"]').click();
    await page.locator('mwc-tab[title="active-user-list"]').click();
  });
  test('Admin can delete account', async ({ page }) => {
    const email = 'test5@lablup.com'; //Write account's email you want to delete
    await page.getByTestId(email).getByLabel('delete_forever').click();
    await page.locator('#active-user-list').getByTestId('deleteUser').click();
    await page.waitForResponse(
      (response) =>
        response.url() === 'http://localhost:8090/func/admin/gql' &&
        response.body().then((b) => {
          return b.includes('"delete_user": {"ok": true, "msg": "success"}');
        }),
    );
    await expect(
      page.getByRole('gridcell', { name: email, exact: true }),
    ).toBeHidden();
    await page.locator('mwc-tab[title="inactive-user-list"]').click();
    await expect(
      page.getByRole('gridcell', { name: email, exact: true }),
    ).toBeVisible();
    await page.locator('mwc-tab[title="credential-lists"]').click();
    await expect(
      page
        .locator('#active-credential-list vaadin-grid-cell-content')
        .filter({ hasText: email }),
    ).toBeHidden();
    await page.locator('mwc-tab[title="inactive-credential-list"]').click();
    await expect(
      page
        .locator('#inactive-credential-list vaadin-grid-cell-content')
        .filter({ hasText: email }),
    ).toBeVisible();
  });
});
