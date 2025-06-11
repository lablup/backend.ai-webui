import {
  login,
  loginAsAdmin,
  userInfo,
  webServerEndpoint,
} from './utils/test-util';
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://127.0.0.1:9081');
});

test.describe('Before login', () => {
  test('should display the login form', async ({ page }) => {
    await expect(page.getByLabel('Email or Username')).toBeVisible();
    await expect(page.locator('#id_password label')).toBeVisible();
    await expect(page.getByLabel('Login', { exact: true })).toBeVisible();
  });
});

test.describe('Login using the admin account', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should redirect to the Summary', async ({ page }) => {
    await expect(page).toHaveURL(/\/start/);
    await expect(
      page.getByTestId('webui-breadcrumb').getByText('Start'),
    ).toBeVisible();
  });
});

test.describe('Login failure cases', () => {
  test('should display error message for non-existent email', async ({
    page,
  }) => {
    await page
      .getByLabel('Email or Username')
      // Use random email to avoid block due to too many requests
      .fill(`nonexistent-${new Date().getTime()}@example.com`);
    await page.getByRole('textbox', { name: 'Password' }).fill('somepassword');
    await page
      .getByRole('textbox', { name: 'Endpoint' })
      .fill(webServerEndpoint);
    await page.getByLabel('Login', { exact: true }).click();

    await expect(
      page.locator('.ant-notification-notice-message'),
    ).toContainText('Login information mismatch. Check your information');
  });

  test('should display error message for incorrect password', async ({
    page,
  }) => {
    await page.getByLabel('Email or Username').fill(userInfo.admin.email);
    await page
      .getByRole('textbox', { name: 'Password' })
      .fill(userInfo.admin.password + 'wrong');
    await page
      .getByRole('textbox', { name: 'Endpoint' })
      .fill(webServerEndpoint);
    await page.getByLabel('Login', { exact: true }).click();

    await expect(
      page.locator('.ant-notification-notice-message'),
    ).toContainText('Login information mismatch. Check your information');
  });
});
