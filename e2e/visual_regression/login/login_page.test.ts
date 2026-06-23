import { webuiEndpoint, webServerEndpoint } from '../../utils/test-util';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto(webuiEndpoint);
  await expect(page.getByRole('textbox', { name: 'Endpoint' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Endpoint' }).fill(webServerEndpoint);
});

test.describe(
  'Login page Visual Regression Test',
  { tag: ['@regression', '@auth', '@visual'] },
  () => {
    // FIXME: Snapshot diff detected (ratio 0.15) — the login modal layout has changed
    // significantly (div.card replaced by div.ant-modal, IAM and Sign Up links removed,
    // modal is smaller 400x296 vs expected 400x554). Baseline needs snapshot-update PR.
    test.fixme(`Login With email or Username modal`, async ({ page }) => {
      // The login page now renders as an ant-modal dialog (div.card is gone)
      const loginEmailModal = page.locator('div.ant-modal').first();
      await expect(loginEmailModal).toHaveScreenshot('basic_login_modal.png');
    });

    // FIXME: The IAM login button ('Click To Use IAM') no longer exists on the login page.
    // The IAM login flow was removed or relocated in a recent UI update.
    test.fixme('Login With IAM modal', async ({ page }) => {
      await page.getByLabel('Click To Use IAM').click();
      await expect(page.locator('div.ant-modal').first()).toBeVisible();
      const loginIAMModal = page.locator('div.ant-modal').first();
      await expect(loginIAMModal).toHaveScreenshot('iam_login_modal.png');
    });

    // FIXME: The 'Sign up' link no longer exists on the login page.
    // The sign-up flow was removed or relocated in a recent UI update.
    test.fixme('Sign up modal', async ({ page }) => {
      await page.getByLabel('Sign up').click();
      await expect(page.locator('div.ant-modal').nth(4)).toBeVisible();
      const signupModal = page.locator('div.ant-modal').nth(4);
      await expect(signupModal).toHaveScreenshot('signup_modal.png', {
        maxDiffPixelRatio: 0.001,
      });
    });

    // FIXME(FR-3111/stale-baseline): The login UI migrated from the Lit `div.card`
    // markup to React (LoginFormPanel/ChangePasswordView), so the getByLabel('Change')
    // locator is dead and `snapshot/change-password-modal.png` shows the old Lit modal.
    // Locator rewrite + baseline refresh deferred to FR-3115 (frozen backend).
    test.fixme('Change password modal', async ({ page }) => {
      await page.getByLabel('Change').click();
      await expect(page.locator('div.card').nth(1)).toBeVisible();
      const changeModal = page.locator('div.card').nth(1);
      await expect(changeModal).toHaveScreenshot('change_password_modal.png');
    });
  },
);
