// E2E tests for FR-2173: Password change modal blocked by login modal on password expiry.
//
// When a user's password has expired, the backend responds to POST /server/login with:
//   { authenticated: false, data: { details: "Password expired on ..." } }
//
// The app must display the ResetPasswordRequiredInline modal (zIndex 1002) without
// it being blocked by the login modal's mask or wrapper.
//
// Mock strategy:
//   - POST /server/login → password-expired response (mocked in beforeEach)
//   - POST /server/update-password-no-auth → success response (mocked per-test when needed)
//   - All other requests (GET / for version, POST /server/login-check) hit the real cluster.
import { PurgeUsersModal } from '../utils/classes/user/PurgeUsersModal';
import {
  KeyPairModal,
  UserSettingModal,
} from '../utils/classes/user/UserSettingModal';
import {
  loginAsAdmin,
  logout,
  modifyConfigToml,
  navigateTo,
  webServerEndpoint,
  webuiEndpoint,
} from '../utils/test-util';
import { test, expect, type Page } from '@playwright/test';

const EXPIRED_PASSWORD_RESPONSE = {
  authenticated: false,
  data: {
    type: 'https://api.backend.ai/probs/password-expired',
    title: 'Password has expired.',
    details: 'Password expired on 2026-01-30 04:46:00.309306+00:00.',
  },
};

/**
 * Minimal server version response returned by the mocked GET /func/ endpoint.
 * The connectUsingSession flow calls get_manager_version() before attempting
 * login; without a reachable backend this call throws and shows
 * "Network connection failed", preventing the login mock from ever being hit.
 */
const MOCK_SERVER_VERSION_RESPONSE = {
  manager: '25.0.0',
  version: 'v6.20220615',
  'backend.ai': '25.0.0',
};

/** Credentials used in tests. The password drives the "same as current" validation check. */
const TEST_EMAIL = 'expired-user@example.com';
const TEST_PASSWORD = 'oldPassword1!';

/**
 * Fill the SESSION login form fields and expand the endpoint section.
 * Mirrors the pattern used in e2e/auth/login.spec.ts.
 */
async function fillLoginForm(page: Page): Promise<void> {
  await page.getByLabel('Email or Username').fill(TEST_EMAIL);
  await page.getByLabel('Password').fill(TEST_PASSWORD);

  const endpointInput = page.getByLabel('Endpoint');
  if (!(await endpointInput.isVisible({ timeout: 500 }).catch(() => false))) {
    await page.getByText('Advanced').click();
  }
  await endpointInput.fill(webServerEndpoint);
}

/**
 * Fill login form, submit, and wait for the password change modal to appear.
 * The modal can take up to ~3s to appear (2s block timer + network latency).
 */
async function triggerPasswordExpiryModal(page: Page): Promise<void> {
  await fillLoginForm(page);
  await page.getByLabel('Login', { exact: true }).click();
  await expect(page.getByText('Please change your password.')).toBeVisible({
    timeout: 10_000,
  });
}

test.beforeEach(async ({ page, request }) => {
  await modifyConfigToml(page, request, {
    general: {
      connectionMode: 'SESSION',
      apiEndpoint: '',
      apiEndpointText: '',
    },
  });

  // Mock GET /func/ (the Backend.AI server version endpoint).
  // In SESSION mode, connectUsingSession() calls get_manager_version() which
  // issues GET <endpoint>/func/ before attempting login. Without a reachable
  // backend this call throws and the UI shows "Network connection failed",
  // preventing the login mock below from ever being reached.
  await page.route(`${webServerEndpoint}/func/`, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_SERVER_VERSION_RESPONSE),
      });
    } else {
      await route.continue();
    }
  });

  // Mock the login endpoint to return a password-expired response.
  // Must be registered before page.goto so the route is in place when the
  // app makes its automatic login-check on load.
  await page.route('**/server/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(EXPIRED_PASSWORD_RESPONSE),
    });
  });

  await page.goto(webuiEndpoint);
});

test(
  'user sees the password change modal when their password has expired',
  { tag: ['@regression', '@auth', '@functional'] },
  async ({ page }) => {
    await triggerPasswordExpiryModal(page);

    await expect(page.getByRole('button', { name: 'Update' })).toBeVisible();
  },
);

test(
  'the login modal does not block the password change modal when password has expired',
  { tag: ['@regression', '@auth', '@functional'] },
  async ({ page }) => {
    await triggerPasswordExpiryModal(page);

    // The password change modal must be fully interactive — its form fields accessible.
    await expect(
      page.getByLabel('New password', { exact: true }),
    ).toBeVisible();
    await expect(page.getByLabel('New password (again)')).toBeVisible();

    // Verify the password change form is not visually blocked by clicking and
    // typing into the new password field. If the login modal's mask were covering
    // it, the click would fail or the field would not accept input.
    const newPasswordInput = page.getByLabel('New password', { exact: true });
    await newPasswordInput.click();
    await newPasswordInput.fill('TestPassword1!');
    await expect(newPasswordInput).toHaveValue('TestPassword1!');
  },
);

test(
  'user can cancel the password change modal and return to the login form',
  { tag: ['@regression', '@auth', '@functional'] },
  async ({ page }) => {
    await triggerPasswordExpiryModal(page);

    // Cancel via the modal's X close button
    await page.getByRole('button', { name: 'Close' }).click();

    // Password change modal must disappear
    await expect(page.getByText('Please change your password.')).toBeHidden();

    // Login form must be accessible again (login modal stays open, wrapper restored)
    await expect(page.getByLabel('Email or Username')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
  },
);

test(
  'password change form shows a validation error when submitted empty',
  { tag: ['@regression', '@auth', '@functional'] },
  async ({ page }) => {
    await triggerPasswordExpiryModal(page);

    await page.getByRole('button', { name: 'Update' }).click();

    // Validation error message appears for the required password field.
    // Ant Design 6 form validation messages use .ant-form-item-explain-error
    // rather than role="alert".
    await expect(
      page.locator('.ant-form-item-explain-error').first(),
    ).toBeVisible();
  },
);

test(
  'password change form rejects a new password that is the same as the current one',
  { tag: ['@regression', '@auth', '@functional'] },
  async ({ page }) => {
    await triggerPasswordExpiryModal(page);

    // Fill the new password fields with the same value as the current password
    await page.getByLabel('New password', { exact: true }).fill(TEST_PASSWORD);
    await page.getByLabel('New password (again)').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: 'Update' }).click();

    await expect(
      page.getByText(
        'Please enter a password that is different from your current password.',
      ),
    ).toBeVisible();
  },
);

test.describe('real account password change flow', () => {
  const RUN_ID = Date.now().toString(36);
  const USER_EMAIL = `e2e-pw-expiry-${RUN_ID}@lablup.com`;
  const USER_NAME = `e2e-pw-expiry-${RUN_ID}`;
  const ORIGINAL_PASSWORD = 'Testing@123';
  const NEW_PASSWORD = 'Changed@456';
  let userCreated = false;

  test.afterEach(async ({ page, request }) => {
    if (!userCreated) return;

    // Ensure no mocked routes interfere with cleanup
    await page.unroute('**/server/login');
    await page.unroute('**/server/update-password-no-auth');

    await loginAsAdmin(page, request);
    await navigateTo(page, 'credential');
    await expect(page.getByRole('tab', { name: 'Users' })).toBeVisible();

    // Deactivate
    const userRow = page.getByRole('row').filter({ hasText: USER_EMAIL });
    await expect(userRow).toBeVisible({ timeout: 10_000 });
    await userRow.getByRole('button', { name: 'Deactivate' }).click();
    const popconfirm = page.locator('.ant-popconfirm');
    await popconfirm.getByRole('button', { name: 'Deactivate' }).click();
    await expect(userRow).toBeHidden({ timeout: 10_000 });

    // Purge
    await page.getByText('Inactive', { exact: true }).click();
    const inactiveRow = page.getByRole('row').filter({ hasText: USER_EMAIL });
    await expect(inactiveRow).toBeVisible({ timeout: 10_000 });
    await inactiveRow.getByRole('checkbox').click();
    await page.getByRole('button', { name: 'trash bin' }).click();
    const purgeModal = new PurgeUsersModal(page);
    await purgeModal.waitForVisible();
    await purgeModal.confirmDeletion();
    await expect(inactiveRow).toBeHidden({ timeout: 10_000 });
  });

  test.fixme(
    'user can complete the password change flow with a real account and re-login is attempted',
    { tag: ['@regression', '@auth', '@functional'], timeout: 90_000 },
    async ({ page, request }) => {
      // This test requires a live Backend.AI cluster at webServerEndpoint
      // (http://localhost:8090). In environments where the backend is not
      // reachable, loginAsAdmin times out waiting for the user-dropdown-button.
      // The test is skipped until the backend is available.
      // ── Setup: remove the beforeEach mock and create a real test user ──
      await page.unroute('**/server/login');
      await loginAsAdmin(page, request);
      await navigateTo(page, 'credential');
      await expect(page.getByRole('tab', { name: 'Users' })).toBeVisible();
      await page.getByRole('button', { name: 'Create User' }).click();

      const userSettingModal = new UserSettingModal(page);
      await userSettingModal.createUser(
        USER_EMAIL,
        USER_NAME,
        ORIGINAL_PASSWORD,
      );
      userCreated = true;

      // Key pair modal may appear after user creation
      const keyPairModal = new KeyPairModal(page);
      if (
        await keyPairModal
          .getModal()
          .isVisible({ timeout: 5_000 })
          .catch(() => false)
      ) {
        await keyPairModal.close();
      }
      await userSettingModal.waitForHidden();
      await expect(page.getByRole('cell', { name: USER_EMAIL })).toBeVisible({
        timeout: 10_000,
      });
      await logout(page);

      // ── Navigate and fill the login form BEFORE registering the mock ──
      // The app's orchestration hook calls /server/login on load (auto-login check).
      // We must let that pass through to the real backend so it doesn't consume our mock.
      await page.goto(webuiEndpoint);
      await expect(page.getByLabel('Email or Username')).toBeVisible({
        timeout: 15_000,
      });
      await page.getByLabel('Email or Username').fill(USER_EMAIL);
      await page.getByLabel('Password').fill(ORIGINAL_PASSWORD);
      const endpointInput = page.getByLabel('Endpoint');
      if (
        !(await endpointInput.isVisible({ timeout: 500 }).catch(() => false))
      ) {
        await page.getByText('Advanced').click();
      }
      await endpointInput.fill(webServerEndpoint);

      // ── Now register the mock: first user-initiated call → expired, rest → real backend ──
      // The mock is registered late (after page.goto and form fill) so that the app's
      // automatic login-check on load hits the real backend instead of consuming our
      // one-shot expired response meant for the explicit Login button click.
      let loginCallCount = 0;
      await page.route('**/server/login', async (route) => {
        loginCallCount++;
        if (loginCallCount === 1) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(EXPIRED_PASSWORD_RESPONSE),
          });
        } else {
          await route.continue();
        }
      });

      await page.getByLabel('Login', { exact: true }).click();

      // ── Password change modal appears ──
      await expect(page.getByText('Please change your password.')).toBeVisible({
        timeout: 10_000,
      });

      // ── Fill new password; submit will go through mocked /server/update-password-no-auth ──
      await page.getByLabel('New password', { exact: true }).fill(NEW_PASSWORD);
      await page.getByLabel('New password (again)').fill(NEW_PASSWORD);

      // Mock the password update endpoint — the real backend returns "Malformed body"
      // for anonymous signed requests, so the following submit uses this mocked success.
      await page.route('**/server/update-password-no-auth', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ result: 'ok' }),
        });
      });

      await page.getByRole('button', { name: 'Update' }).click();

      // After mocked update succeeds, the modal's onOk sets needToResetPassword=false
      // (closing the password change modal) and triggers re-login.
      // The re-login goes to the real backend with NEW_PASSWORD but the backend
      // still has ORIGINAL_PASSWORD, so it will fail. We verify the modal closed
      // successfully, which confirms the password update flow completed.
      await expect(page.getByText('Please change your password.')).toBeHidden({
        timeout: 10_000,
      });

      // Login form should be visible again (re-login failed, user is back at login)
      await expect(page.getByLabel('Email or Username')).toBeVisible({
        timeout: 10_000,
      });
    },
  );
});
