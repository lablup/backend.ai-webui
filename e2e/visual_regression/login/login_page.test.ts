import { webuiEndpoint, webServerEndpoint } from '../../utils/test-util';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto(webuiEndpoint);
  await page.waitForLoadState('networkidle');
  await page.getByRole('textbox', { name: 'Endpoint' }).fill(webServerEndpoint);
});

test.describe('Login page Visual Regression Test', () => {
  test(`Login With email or Username modal`, async ({ page }) => {
    const loginEmailModal = page.locator('div.card').first();
    await expect(loginEmailModal).toHaveScreenshot('basic_login_modal.png');
  });

  test('Login With IAM modal', async ({ page }) => {
    await page.getByLabel('Click To Use IAM').click();
    await page.waitForLoadState('networkidle');
    const loginIAMModal = page.locator('div.card').first();
    await expect(loginIAMModal).toHaveScreenshot('iam_login_modal.png');
  });

  test('Sign up modal', async ({ page }) => {
    await page.getByLabel('Sign up').click();
    await page.waitForLoadState('networkidle');
    const signupModal = page.locator('div.card').nth(4);
    await expect(signupModal).toHaveScreenshot('signup_modal.png', {
      maxDiffPixelRatio: 0.001,
    });
  });

  test('Change password modal', async ({ page }) => {
    await page.getByLabel('Change').click();
    await page.waitForLoadState('networkidle');
    const changeModal = page.locator('div.card').nth(1);
    await expect(changeModal).toHaveScreenshot('change_password_modal.png');
  });
});
