import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

test.describe('Login user', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:9081');
  });
  test('User login success', async ({ page }) => {
    await page.locator('#id_user_id label').click();
    await page.locator('#id_user_id label').fill(process.env.SUPER_ADMIN_EMAIL);
    await page.locator('#id_password label').click();
    await page
      .locator('#id_password label')
      .fill(process.env.SUPER_ADMIN_PASSWORD);
    await page.locator('#id_api_endpoint label').click();
    await page.locator('#id_api_endpoint label').fill(process.env.ENDPOINT);
    await page.locator('#login-button').click();
    await page.waitForResponse(async (response) => {
      const responseJSONData = await response.json();
      return (
        response.url() === 'http://localhost:8090/server/login' &&
        response.status() === 200 &&
        responseJSONData?.authenticated
      );
    });
    await expect(page.locator('#app-body')).toBeVisible();
  });
  test('User login fail', async ({ page }) => {
    await page.locator('#id_user_id label').click();
    await page.locator('#id_user_id label').fill('test10@lablup.com');
    await page.locator('#id_password label').click();
    await page.locator('#id_password label').fill('test123!');
    await page.locator('#id_api_endpoint label').click();
    await page.locator('#id_api_endpoint label').fill(process.env.ENDPOINT);
    await page.locator('#login-button').click();
    await page.waitForResponse(async (response) => {
      const responseJSONData = await response.json();
      return (
        response.url() === 'http://localhost:8090/server/login' &&
        response.status() === 200 && //todo: Need to change status code after resolving this issue at core.
        responseJSONData?.data?.details === 'User credential mismatch.'
      );
    });
    await expect(page.locator('#app-body')).toBeHidden();
  });
});
