import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

test.describe('Login user', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(process.env.PAGE_URL as string);
  });
  test('User login success', async ({ page }) => {
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
    await page.waitForResponse(async (response) => {
      return (
        response.url() === `${process.env.ENDPOINT as string}/server/login` &&
        response.status() === 200 &&
        (await response.json()).authenticated
      );
    });
    await expect(page.locator('#app-page')).not.toHaveAttribute('inert');
  });
  test('User login fail', async ({ page }) => {
    await page.locator('#id_user_id label').click();
    await page
      .locator('#id_user_id label')
      .fill(process.env.INCORRECT_EMAIL as string);
    await page.locator('#id_password label').click();
    await page
      .locator('#id_password label')
      .fill(process.env.INCORRECT_PASSWORD as string);
    await page.locator('#id_api_endpoint label').click();
    await page
      .locator('#id_api_endpoint label')
      .fill(process.env.ENDPOINT as string);
    await page.locator('#login-button').click();
    await page.waitForResponse(async (response) => {
      return (
        response.url() === `${process.env.ENDPOINT as string}/server/login` &&
        response.status() === 200 && //todo: Need to change status code after resolving this issue at core.
        (await response.json()).data.details === 'User credential mismatch.'
      );
    });
    await page.waitForTimeout(1000);
    await expect(page.locator('#app-page')).toHaveAttribute('inert');
  });
});
