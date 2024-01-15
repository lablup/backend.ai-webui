import { test, expect } from '@playwright/test';

test.describe('LoginPage: User login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:9081');
  });
  test('User login success', async ({ page }) => {
    await page.locator('#id_user_id label').click();
    await page.locator('#id_user_id label').fill('test@lablup.com');
    await page.locator('#id_password label').click();
    await page.locator('#id_password label').fill('test123!');
    await page.locator('#id_api_endpoint label').click();
    await page.locator('#id_api_endpoint label').fill('http://localhost:8090');
    await page.locator('#login-button').click();
    await expect(page.locator('#app-body')).toBeVisible();
  });
  test('User login fail', async ({ page }) => {
    await page.locator('#id_user_id label').click();
    await page.locator('#id_user_id label').fill('test10@lablup.com');
    await page.locator('#id_password label').click();
    await page.locator('#id_password label').fill('test123!');
    await page.locator('#id_api_endpoint label').click();
    await page.locator('#id_api_endpoint label').fill('http://localhost:8090');
    await page.locator('#login-button').click();
    await expect(page.locator('#app-body')).toBeHidden();
  });
});
