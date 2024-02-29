import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

test.describe('Create account', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(process.env.PAGE_URL as string);
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
    await page.getByRole('menu').getByTestId('credential').click();
    await page.waitForURL('**/credential');
    await page.locator('mwc-tab[title="user-lists"]').click();
    await page.locator('mwc-tab[title="active-user-list"]').click();
  });
  test('Admin can create account', async ({ page }) => {
    await page.locator('#add-user').click();
    await page.locator('#new-user-dialog #id_user_email').click();
    await page
      .locator('#new-user-dialog #id_user_email label')
      .fill(process.env.CREATE_USER_EMAIL as string);
    await page.locator('#new-user-dialog #id_user_name').click();
    await page
      .locator('#new-user-dialog #id_user_name label')
      .fill(process.env.CREATE_USER_NAME as string);
    await page.locator('#new-user-dialog #id_user_password').click();
    await page
      .locator('#new-user-dialog #id_user_password label')
      .fill(process.env.CREATE_USER_PASSWORD as string);
    await page.locator('#new-user-dialog #id_user_confirm').click();
    await page
      .locator('#new-user-dialog #id_user_confirm label')
      .fill(process.env.CREATE_USER_PASSWORD as string);
    await page.locator('#new-user-dialog #create-user-button').click();
    await expect(
      page
        .locator('#active-user-list vaadin-grid-cell-content')
        .filter({ hasText: process.env.CREATE_USER_EMAIL }),
    ).toBeVisible();
    await page.locator('mwc-tab[title="credential-lists"]').click();
    await page.locator('mwc-tab[title="active-credential-list"]').click();
    await expect(
      page
        .locator('#active-credential-list vaadin-grid-cell-content')
        .filter({ hasText: process.env.CREATE_USER_EMAIL }),
    ).toBeVisible();
  });
});

test.describe('Delete account', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(process.env.PAGE_URL as string);
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
    await page.getByRole('menu').getByTestId('credential').click();
    await page.waitForURL('**/credential');
    await page.locator('mwc-tab[title="user-lists"]').click();
    await page.locator('mwc-tab[title="active-user-list"]').click();
  });
  test('Admin can delete account', async ({ page }) => {
    await page
      .getByTestId(process.env.DELETE_USER_EMAIL as string)
      .getByLabel('delete_forever')
      .click();
    await page.locator('#active-user-list').getByTestId('deleteUser').click();
    await page.waitForResponse(
      (response) =>
        response.url() === `${process.env.ENDPOINT}/func/admin/gql` &&
        response.body().then((b) => {
          return b.includes('"delete_user": {"ok": true, "msg": "success"}');
        }),
    );
    await expect(
      page.getByRole('gridcell', {
        name: process.env.DELETE_USER_EMAIL,
        exact: true,
      }),
    ).toBeHidden();
    await page.locator('mwc-tab[title="inactive-user-list"]').click();
    await expect(
      page.getByRole('gridcell', {
        name: process.env.DELETE_USER_EMAIL,
        exact: true,
      }),
    ).toBeVisible();
    await page.locator('mwc-tab[title="credential-lists"]').click();
    await expect(
      page
        .locator('#active-credential-list vaadin-grid-cell-content')
        .filter({ hasText: process.env.DELETE_USER_EMAIL }),
    ).toBeHidden();
    await page.locator('mwc-tab[title="inactive-credential-list"]').click();
    await expect(
      page
        .locator('#inactive-credential-list vaadin-grid-cell-content')
        .filter({ hasText: process.env.DELETE_USER_EMAIL }),
    ).toBeVisible();
  });
});
