import { webuiEndpoint, webServerEndpoint } from './utils/test-util';
import { expect, test } from '@playwright/test';

test.describe('Login page Visual Regression Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(webuiEndpoint);
    await page.waitForLoadState('networkidle');
    await page
      .getByRole('textbox', { name: 'Endpoint' })
      .fill(webServerEndpoint);
  });
  test(`Login With email or Username modal`, async ({ page }) => {
    await expect(page).toHaveScreenshot('basic_login_modal.png', {
      fullPage: true,
    });
  });

  test('Login With IAM modal', async ({ page }) => {
    await page.getByLabel('Click To Use IAM').click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('iam_login_modal.png', {
      fullPage: true,
    });
  });

  test('Sign up modal', async ({ page }) => {
    await page.getByLabel('Sign up').click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('signup_modal.png', {
      fullPage: true,
    });
  });

  test('Change password modal', async ({ page }) => {
    await page.getByLabel('Change').click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('change_password_modal.png', {
      fullPage: true,
    });
  });
});
