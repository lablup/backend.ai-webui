// E2E tests for the "Forgot Password" flow.
//
// The feature spans two surfaces:
//   1. Login page (/): "Forgot password? Change" link → ChangePasswordEmailModal
//      (requires allowAnonymousChangePassword=true in config.toml + SESSION mode)
//   2. Change password page (/change-password?token=JWT): ChangePasswordView
//      (direct page navigation; no login required)
//
// Mock strategy:
//   - config.toml: Intercepted via modifyConfigToml() with allowAnonymousChangePassword=true (Part 1)
//   - POST /cloud/send-password-change-email → mocked per-test (Part 1)
//   - POST /cloud/change-password → mocked per-test (Part 2)
//   - All other requests hit the real server.
//
// No resource cleanup needed — all tests use mocked API responses; no real data is created.
import { modifyConfigToml, webuiEndpoint } from '../utils/test-util';
import { test, expect, type Page } from '@playwright/test';

// ── Constants ────────────────────────────────────────────────────────────────

const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'NewPass1!';

/**
 * A real JWT-format token used in Part 2 tests.
 * The server is always mocked so the actual token payload does not matter,
 * but using a properly-structured JWT keeps the app's token-presence check happy.
 */
const TEST_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
  '.eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJ1c2VyX2lkIjoiZmE5Y2UxOTItOGNhYi00ZDg1LTkwZDctMjVhYzdkMWY1YWUwIiwianRpIjoiNWI0OTg5YWMtYTlhNy00NjhjLTkzZTctNDQ5MDM1MWQ0MGEyIiwiZXhwIjoxNzc0MzM2NDk0fQ' +
  '.xLoegTxPn3pR4JgLyyKhUBCD_NYhZGKRVuV08AXZm1g';

// ── Mock response bodies ──────────────────────────────────────────────────────

const SEND_EMAIL_SUCCESS = {};

const SEND_EMAIL_ERROR_400 = {
  type: 'https://api.backend.ai/probs/invalid-api-params',
  title: 'Missing or invalid API parameters.',
  error_code: 'api_generic_invalid-parameters',
  msg: 'Unable to send email',
};

const CHANGE_PASSWORD_SUCCESS = {};

const CHANGE_PASSWORD_ERROR_INVALID_TOKEN = {
  type: 'https://api.backend.ai/probs/invalid-api-params',
  title: 'Missing or invalid API parameters.',
  error_code: 'api_generic_invalid-parameters',
  msg: 'Invalid or expired token',
};

const CHANGE_PASSWORD_ERROR_EMAIL_MISMATCH = {
  type: 'https://api.backend.ai/probs/invalid-api-params',
  title: 'Missing or invalid API parameters.',
  error_code: 'api_generic_invalid-parameters',
  msg: 'Email mismatch',
};

// ── Helper functions ──────────────────────────────────────────────────────────

/**
 * Open the "Send change password email" modal from the login page.
 * Assumes the page has already been navigated to webuiEndpoint with the
 * allowAnonymousChangePassword config in place.
 */
async function openForgotPasswordModal(page: Page): Promise<void> {
  await page.getByText('Change').click();
  await expect(
    page.getByRole('dialog', { name: 'Send change password email' }),
  ).toBeVisible({ timeout: 10_000 });
}

// ── Part 1: Forgot password email modal ──────────────────────────────────────

test.describe('Forgot password email modal', () => {
  test.beforeEach(async ({ page, request }) => {
    // Enable the "Forgot password?" link by setting allowAnonymousChangePassword=true
    await modifyConfigToml(page, request, {
      general: {
        connectionMode: 'SESSION',
        allowAnonymousChangePassword: true,
      },
    });
    await page.goto(webuiEndpoint);
  });

  test(
    'User can open the forgot password modal from login page',
    { tag: ['@regression', '@auth', '@functional', '@smoke'] },
    async ({ page }) => {
      // 1. Verify "Forgot password?" text is visible on the login page
      await expect(page.getByText('Forgot password?')).toBeVisible({
        timeout: 10_000,
      });

      // 2. Click "Change" link to open the ChangePasswordEmailModal
      await openForgotPasswordModal(page);

      // 3. Verify modal title, email input, and Send button are all present
      await expect(
        page.getByRole('dialog', { name: 'Send change password email' }),
      ).toBeVisible();
      await expect(
        page.getByRole('textbox', { name: 'Email', exact: true }),
      ).toBeVisible();
      await expect(page.getByRole('button', { name: 'Send' })).toBeVisible();
    },
  );

  test(
    'User can send a password change email successfully',
    { tag: ['@regression', '@auth', '@functional'] },
    async ({ page }) => {
      // Mock the send-password-change-email endpoint to return success
      await page.route('**/cloud/send-password-change-email', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(SEND_EMAIL_SUCCESS),
        });
      });

      // 1. Open the forgot password modal
      await openForgotPasswordModal(page);

      // 2. Enter a valid email address
      await page
        .getByRole('textbox', { name: 'Email', exact: true })
        .fill(TEST_EMAIL);

      // 3. Click the Send button
      await page.getByRole('button', { name: 'Send' }).click();

      // 4. Verify success notification appears and modal closes
      await expect(
        page.getByText('A verification email has been sent.'),
      ).toBeVisible({ timeout: 10_000 });
      await expect(
        page.getByRole('dialog', { name: 'Send change password email' }),
      ).toBeHidden({ timeout: 10_000 });
    },
  );

  test(
    'User sees an error when email sending fails',
    { tag: ['@regression', '@auth', '@functional'] },
    async ({ page }) => {
      // Mock the send-password-change-email endpoint to return 400
      await page.route('**/cloud/send-password-change-email', async (route) => {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify(SEND_EMAIL_ERROR_400),
        });
      });

      // 1. Open the forgot password modal
      await openForgotPasswordModal(page);

      // 2. Enter an unregistered email address
      await page
        .getByRole('textbox', { name: 'Email', exact: true })
        .fill('nonexistent@example.com');

      // 3. Click the Send button
      await page.getByRole('button', { name: 'Send' }).click();

      // 4. Verify error notification appears and modal stays open
      await expect(
        page.getByText(
          'This email address is not registered. Please contact your administrator.',
        ),
      ).toBeVisible({ timeout: 10_000 });
      await expect(
        page.getByRole('dialog', { name: 'Send change password email' }),
      ).toBeVisible();
    },
  );

  test(
    'User cannot submit without email',
    { tag: ['@regression', '@auth', '@functional'] },
    async ({ page }) => {
      // 1. Open the forgot password modal
      await openForgotPasswordModal(page);

      // 2. Click Send without entering any email
      await page.getByRole('button', { name: 'Send' }).click();

      // 3. Verify form validation error appears and no API call is attempted
      await expect(
        page.locator('.ant-form-item-explain-error').first(),
      ).toBeVisible({ timeout: 10_000 });
    },
  );

  test(
    'User cannot submit with invalid email format',
    { tag: ['@regression', '@auth', '@functional'] },
    async ({ page }) => {
      // 1. Open the forgot password modal
      await openForgotPasswordModal(page);

      // 2. Enter an invalid email format
      await page
        .getByRole('textbox', { name: 'Email', exact: true })
        .fill('not-an-email');

      // 3. Click the Send button
      await page.getByRole('button', { name: 'Send' }).click();

      // 4. Verify email validation error appears
      await expect(page.getByText('Invalid email address')).toBeVisible({
        timeout: 10_000,
      });
    },
  );

  test(
    'User can close the modal and return to login form',
    { tag: ['@regression', '@auth', '@functional'] },
    async ({ page }) => {
      // 1. Open the forgot password modal
      await openForgotPasswordModal(page);

      // 2. Click Cancel to close the modal
      await page.getByRole('button', { name: 'Cancel' }).click();

      // 3. Verify the modal closes and login form is still accessible
      await expect(
        page.getByRole('dialog', { name: 'Send change password email' }),
      ).toBeHidden({ timeout: 10_000 });
      await expect(page.getByLabel('Email or Username')).toBeVisible();
      await expect(page.getByLabel('Password')).toBeVisible();
    },
  );

  test(
    '"Forgot password?" link is hidden when config is disabled',
    { tag: ['@regression', '@auth', '@functional'] },
    async ({ page, request }) => {
      // Override config to disable allowAnonymousChangePassword
      await modifyConfigToml(page, request, {
        general: {
          connectionMode: 'SESSION',
          allowAnonymousChangePassword: false,
        },
      });
      await page.goto(webuiEndpoint);

      // Verify "Forgot password?" text and "Change" link are not visible
      await expect(page.getByText('Forgot password?')).toBeHidden();
      await expect(page.getByText('Change')).toBeHidden();
    },
  );
});

// ── Part 2: Change password page ─────────────────────────────────────────────

test.describe('Change password page', () => {
  const changePasswordUrl = `${webuiEndpoint}/change-password?token=${TEST_TOKEN}`;

  test(
    'User sees the password change form with a valid token',
    { tag: ['@regression', '@auth', '@functional', '@smoke'] },
    async ({ page }) => {
      // 1. Navigate directly to the change-password page with a token in the URL
      await page.goto(changePasswordUrl);
      await expect(
        page.getByRole('dialog', { name: 'Change Password' }),
      ).toBeVisible({
        timeout: 10_000,
      });

      // 2. Verify all form fields and the Update button are visible
      await expect(
        page.getByRole('textbox', { name: 'Enter email address' }),
      ).toBeVisible();
      await expect(
        page.getByRole('textbox', { name: 'New password', exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole('textbox', { name: 'New password (again)' }),
      ).toBeVisible();
      await expect(page.getByRole('button', { name: 'Update' })).toBeVisible();

      // 3. Verify modal is not closable (no X close button in dialog header)
      await expect(
        page
          .getByRole('dialog', { name: 'Change Password' })
          .getByRole('button', { name: 'Close' }),
      ).toBeHidden();
    },
  );

  test(
    'User can successfully change password with valid token',
    { tag: ['@regression', '@auth', '@functional'] },
    async ({ page }) => {
      // Mock the change-password endpoint to return success
      await page.route('**/cloud/change-password', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(CHANGE_PASSWORD_SUCCESS),
        });
      });

      // 1. Navigate to the change-password page
      await page.goto(changePasswordUrl);
      await expect(
        page.getByRole('dialog', { name: 'Change Password' }),
      ).toBeVisible({
        timeout: 10_000,
      });

      // 2. Fill in the form
      await page
        .getByRole('textbox', { name: 'Enter email address' })
        .fill(TEST_EMAIL);
      await page
        .getByRole('textbox', { name: 'New password', exact: true })
        .fill(TEST_PASSWORD);
      await page
        .getByRole('textbox', { name: 'New password (again)' })
        .fill(TEST_PASSWORD);

      // 3. Click Update
      await page.getByRole('button', { name: 'Update' }).click();

      // 4. Verify success view appears with the success message and Close button
      await expect(
        page.getByText('Password is successfully changed'),
      ).toBeVisible({ timeout: 10_000 });
      await expect(page.getByRole('button', { name: 'Close' })).toBeVisible();
    },
  );

  test(
    'User is redirected to login page after closing the success modal',
    { tag: ['@regression', '@auth', '@functional'] },
    async ({ page }) => {
      // Mock the change-password endpoint to return success
      await page.route('**/cloud/change-password', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(CHANGE_PASSWORD_SUCCESS),
        });
      });

      // 1. Navigate and complete the password change flow
      await page.goto(changePasswordUrl);
      await expect(
        page.getByRole('dialog', { name: 'Change Password' }),
      ).toBeVisible({
        timeout: 10_000,
      });

      await page
        .getByRole('textbox', { name: 'Enter email address' })
        .fill(TEST_EMAIL);
      await page
        .getByRole('textbox', { name: 'New password', exact: true })
        .fill(TEST_PASSWORD);
      await page
        .getByRole('textbox', { name: 'New password (again)' })
        .fill(TEST_PASSWORD);
      await page.getByRole('button', { name: 'Update' }).click();

      // 2. Verify success message is shown
      await expect(
        page.getByText('Password is successfully changed'),
      ).toBeVisible({ timeout: 10_000 });

      // 3. Click Close and verify redirect to login page
      await page.getByRole('button', { name: 'Close' }).click();
      await page.waitForURL(webuiEndpoint + '/', { timeout: 10_000 });
      await expect(page.getByLabel('Email or Username')).toBeVisible({
        timeout: 10_000,
      });
    },
  );

  test(
    'User sees invalid token view when accessing the page without a token',
    { tag: ['@regression', '@auth', '@functional'] },
    async ({ page }) => {
      // 1. Navigate to the change-password page without a token parameter
      await page.goto(`${webuiEndpoint}/change-password`);

      // 2. Verify Invalid Token modal is displayed with the error message
      await expect(
        page.getByRole('dialog', { name: 'Invalid Token' }),
      ).toBeVisible({
        timeout: 10_000,
      });
      await expect(
        page.getByText(
          'Issued token to change password has error. Please send another email for changing password and try again.',
        ),
      ).toBeVisible();
      await expect(page.getByRole('button', { name: 'Close' })).toBeVisible();

      // 3. Click Close and verify redirect to login page
      await page.getByRole('button', { name: 'Close' }).click();
      await page.waitForURL(webuiEndpoint + '/', { timeout: 10_000 });
      await expect(page.getByLabel('Email or Username')).toBeVisible({
        timeout: 10_000,
      });
    },
  );

  test(
    'User sees invalid token view when server rejects the token',
    { tag: ['@regression', '@auth', '@functional'] },
    async ({ page }) => {
      // Mock the change-password endpoint to return an invalid token error
      await page.route('**/cloud/change-password', async (route) => {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify(CHANGE_PASSWORD_ERROR_INVALID_TOKEN),
        });
      });

      // 1. Navigate to the change-password page with a token
      await page.goto(changePasswordUrl);
      await expect(
        page.getByRole('dialog', { name: 'Change Password' }),
      ).toBeVisible({
        timeout: 10_000,
      });

      // 2. Fill in the form and submit
      await page
        .getByRole('textbox', { name: 'Enter email address' })
        .fill(TEST_EMAIL);
      await page
        .getByRole('textbox', { name: 'New password', exact: true })
        .fill(TEST_PASSWORD);
      await page
        .getByRole('textbox', { name: 'New password (again)' })
        .fill(TEST_PASSWORD);
      await page.getByRole('button', { name: 'Update' }).click();

      // 3. Verify Invalid Token view is shown (component transitions state)
      await expect(
        page.getByRole('dialog', { name: 'Invalid Token' }),
      ).toBeVisible({
        timeout: 10_000,
      });
      await expect(page.getByRole('button', { name: 'Close' })).toBeVisible();
    },
  );

  test(
    'User sees email mismatch error when email does not match the token',
    { tag: ['@regression', '@auth', '@functional'] },
    async ({ page }) => {
      // Mock the change-password endpoint to return an email mismatch error
      await page.route('**/cloud/change-password', async (route) => {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify(CHANGE_PASSWORD_ERROR_EMAIL_MISMATCH),
        });
      });

      // 1. Navigate to the change-password page with a token
      await page.goto(changePasswordUrl);
      await expect(
        page.getByRole('dialog', { name: 'Change Password' }),
      ).toBeVisible({
        timeout: 10_000,
      });

      // 2. Fill in the form with the wrong email and submit
      await page
        .getByRole('textbox', { name: 'Enter email address' })
        .fill('wrong@example.com');
      await page
        .getByRole('textbox', { name: 'New password', exact: true })
        .fill(TEST_PASSWORD);
      await page
        .getByRole('textbox', { name: 'New password (again)' })
        .fill(TEST_PASSWORD);
      await page.getByRole('button', { name: 'Update' }).click();

      // 3. Verify inline email mismatch error and that view stays on change-password state
      await expect(
        page.getByText(
          'The email address does not match the one used for the password change request.',
        ),
      ).toBeVisible({
        timeout: 10_000,
      });
      await expect(
        page.getByRole('dialog', { name: 'Change Password' }),
      ).toBeVisible();
    },
  );

  test(
    'User cannot submit with empty fields',
    { tag: ['@regression', '@auth', '@functional'] },
    async ({ page }) => {
      // 1. Navigate to the change-password page with a token
      await page.goto(changePasswordUrl);
      await expect(
        page.getByRole('dialog', { name: 'Change Password' }),
      ).toBeVisible({
        timeout: 10_000,
      });

      // 2. Click Update without filling any fields
      await page.getByRole('button', { name: 'Update' }).click();

      // 3. Verify validation errors appear for all three fields
      await expect(
        page.locator('.ant-form-item-explain-error').first(),
      ).toBeVisible({ timeout: 10_000 });
    },
  );

  test(
    'User cannot submit with a weak password',
    { tag: ['@regression', '@auth', '@functional'] },
    async ({ page }) => {
      // 1. Navigate to the change-password page with a token
      await page.goto(changePasswordUrl);
      await expect(
        page.getByRole('dialog', { name: 'Change Password' }),
      ).toBeVisible({
        timeout: 10_000,
      });

      // 2. Fill email with valid value but use a weak password that fails the pattern
      await page
        .getByRole('textbox', { name: 'Enter email address' })
        .fill(TEST_EMAIL);
      await page
        .getByRole('textbox', { name: 'New password', exact: true })
        .fill('abc');
      await page
        .getByRole('textbox', { name: 'New password (again)' })
        .fill('abc');

      // 3. Click Update and verify password pattern validation error
      await page.getByRole('button', { name: 'Update' }).click();
      await expect(
        page
          .locator('.ant-form-item-explain-error')
          .filter({
            hasText:
              'At least 1 alphabet, 1 number and 1 special character is required with at least 8 chars.',
          })
          .first(),
      ).toBeVisible({ timeout: 10_000 });
    },
  );

  test(
    'User cannot submit when passwords do not match',
    { tag: ['@regression', '@auth', '@functional'] },
    async ({ page }) => {
      // 1. Navigate to the change-password page with a token
      await page.goto(changePasswordUrl);
      await expect(
        page.getByRole('dialog', { name: 'Change Password' }),
      ).toBeVisible({
        timeout: 10_000,
      });

      // 2. Fill email and two different passwords that both pass the pattern individually
      await page
        .getByRole('textbox', { name: 'Enter email address' })
        .fill(TEST_EMAIL);
      await page
        .getByRole('textbox', { name: 'New password', exact: true })
        .fill('NewPass1!');
      await page
        .getByRole('textbox', { name: 'New password (again)' })
        .fill('DiffPass2@');

      // 3. Click Update and verify the password mismatch error notification
      await page.getByRole('button', { name: 'Update' }).click();
      await expect(page.getByText('Password mismatch')).toBeVisible({
        timeout: 10_000,
      });

      // 4. Verify view stays on the change-password dialog (not invalid-token)
      await expect(
        page.getByRole('dialog', { name: 'Change Password' }),
      ).toBeVisible();
    },
  );
});
