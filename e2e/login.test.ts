import { loginAsAdmin } from './test-util';
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://127.0.0.1:9081');
});

test.describe('Before login', () => {
  test('should display the login form', async ({ page }) => {
    await expect(page.getByLabel('E-mail or Username')).toBeVisible();
    await expect(page.locator('#id_password label')).toBeVisible();
    await expect(page.getByLabel('Login', { exact: true })).toBeVisible();
  });
});

test.describe('Login using the admin account', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should redirect to the Summary', async ({ page }) => {
    await expect(page).toHaveURL(/\/summary/);
    await expect(
      page.getByTestId('webui-breadcrumb').getByText('Summary'),
    ).toBeVisible();
  });
});
