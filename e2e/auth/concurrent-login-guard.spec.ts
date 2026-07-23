/**
 * E2E tests for FR-2189: Concurrent Login Session Guard
 *
 * All tests are fully mocked — no live backend required.
 * Since completing login requires GQL and many subsequent API calls,
 * tests verify behavior UP TO the login API call (modal, form state,
 * request body parameters) rather than asserting navigation to /start.
 *
 * Mock strategy (following the pattern in e2e/auth/password-expiry.spec.ts):
 *   - GET  /func/              → mock server version (get_manager_version)
 *   - POST /server/login-check → mock not-authenticated (show login form)
 *   - POST /server/login       → per-test mock (409, TOTP-required, etc.)
 */
import {
  modifyConfigToml,
  userInfo,
  webServerEndpoint,
  webuiEndpoint,
} from '../utils/test-util';
import {
  test,
  expect,
  type Page,
  type APIRequestContext,
} from '@playwright/test';

// ---------------------------------------------------------------------------
// Mock response fixtures
// ---------------------------------------------------------------------------

const MOCK_SERVER_VERSION = {
  manager: '25.0.0',
  version: 'v6.20220615',
  'backend.ai': '25.0.0',
};

/**
 * HTTP 200 response body returned when a concurrent session exists.
 * The backend proxy wraps 409 responses in an envelope with `authenticated: false`
 * and `data.type` set to the problem type URL. The BackendAIClient.login()
 * method detects `authenticated === false` and throws `{ isLoginError: true, data }`,
 * which LoginView.handleLoginError() classifies by `data.type`.
 */
const CONCURRENT_SESSION_RESPONSE = {
  authenticated: false,
  data: {
    type: 'https://api.backend.ai/probs/active-login-session-exists',
    title: 'Active login session exists',
    details: 'Concurrent session exists',
  },
};

/** Response indicating TOTP is required before login can proceed. */
const TOTP_REQUIRED_RESPONSE = {
  authenticated: false,
  data: {
    details: 'You must authenticate using Two-Factor Authentication.',
  },
};

// ---------------------------------------------------------------------------
// Test credentials (match default seed data)
// ---------------------------------------------------------------------------
const TEST_EMAIL = userInfo.admin.email;
const TEST_PASSWORD = userInfo.admin.password;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Set up common mocks so the app reaches the login form without a live backend.
 *   - GET /func/              → server version
 *   - POST /server/login-check → { authenticated: false }
 */
async function setupBaseMocks(page: Page): Promise<void> {
  await page.route(`${webServerEndpoint}/func/`, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_SERVER_VERSION),
      });
    } else {
      await route.continue();
    }
  });

  await page.route('**/server/login-check', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ authenticated: false }),
    });
  });
}

/**
 * Fill the SESSION login form with test credentials and endpoint.
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
 * Navigate to the login page with SESSION mode, empty endpoint, and base mocks.
 */
async function gotoLoginPage(
  page: Page,
  request: APIRequestContext,
): Promise<void> {
  await modifyConfigToml(page, request, {
    general: {
      connectionMode: 'SESSION',
      apiEndpoint: '',
      apiEndpointText: '',
    },
  });
  await setupBaseMocks(page);
  await page.goto(webuiEndpoint);
  await page
    .evaluate(() => {
      document.getElementById('webpack-dev-server-client-overlay')?.remove();
    })
    .catch(() => {});
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe(
  'Concurrent Login Session Guard (FR-2189)',
  { tag: ['@regression', '@auth', '@functional'] },
  () => {
    test.describe.configure({ mode: 'serial' });

    test.beforeEach(async ({ page, request }) => {
      await gotoLoginPage(page, request);
    });

    // ── 1. Modal appears when concurrent session response is received ──────

    test('user sees concurrent session modal when another session is active', async ({
      page,
    }) => {
      await page.route('**/server/login', async (route) => {
        if (route.request().method() === 'POST') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(CONCURRENT_SESSION_RESPONSE),
          });
        } else {
          await route.continue();
        }
      });

      await fillLoginForm(page);
      await page.getByLabel('Login', { exact: true }).click();

      const concurrentModal = page.getByRole('dialog', {
        name: 'Logged in elsewhere',
      });
      await expect(concurrentModal).toBeVisible({
        timeout: 10_000,
      });
      await expect(
        concurrentModal.getByText(/You are already logged in elsewhere/),
      ).toBeVisible();
      await expect(
        concurrentModal.getByRole('button', { name: 'Login' }),
      ).toBeVisible();
      await expect(
        concurrentModal.getByRole('button', { name: 'Cancel' }),
      ).toBeVisible();
    });

    // ── 2. Cancel returns to login form ──────────────────────────────────

    test('user can cancel concurrent session modal and return to login form with credentials preserved', async ({
      page,
    }) => {
      await page.route('**/server/login', async (route) => {
        if (route.request().method() === 'POST') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(CONCURRENT_SESSION_RESPONSE),
          });
        } else {
          await route.continue();
        }
      });

      await fillLoginForm(page);
      await page.getByLabel('Login', { exact: true }).click();

      const concurrentModal = page.getByRole('dialog', {
        name: 'Logged in elsewhere',
      });
      await expect(concurrentModal).toBeVisible({
        timeout: 10_000,
      });

      await concurrentModal.getByRole('button', { name: 'Cancel' }).click();

      await expect(concurrentModal).toBeHidden();
      await expect(page.getByLabel('Email or Username')).toBeVisible();
      await expect(page.getByLabel('Email or Username')).toHaveValue(
        TEST_EMAIL,
      );
      await expect(page.getByLabel('Password')).toBeVisible();
      await expect(page.getByLabel('Password')).toHaveValue(TEST_PASSWORD);
      await expect(page.getByLabel('Endpoint')).toHaveValue(webServerEndpoint);
    });

    // ── 3. Force login sends force=true ──────────────────────────────────

    test('clicking Proceed to Login sends a second login request with force=true', async ({
      page,
    }) => {
      // Spy on BackendAIClient.prototype.login to capture arguments before
      // the body is AES-encrypted. Records each call as { otp, force }.
      // Uses page.evaluate() because gotoLoginPage (beforeEach) already navigated.
      await page.evaluate(() => {
        (window as any).__loginCalls = [];
        const proto = (globalThis as any).BackendAIClient?.prototype;
        if (proto) {
          const origLoginFn = proto.login;
          proto.login = async function (otp?: string, force?: boolean) {
            (window as any).__loginCalls.push({ otp, force });
            return origLoginFn.call(this, otp, force);
          };
        }
      });

      let loginCallCount = 0;

      await page.route('**/server/login', async (route) => {
        if (route.request().method() !== 'POST') {
          await route.continue();
          return;
        }
        loginCallCount++;

        if (loginCallCount === 1) {
          // 1st call: concurrent session response (authenticated: false)
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(CONCURRENT_SESSION_RESPONSE),
          });
        } else {
          // 2nd call: should contain force=true.
          // Return concurrent session response again (we only care about verifying the request body).
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(CONCURRENT_SESSION_RESPONSE),
          });
        }
      });

      await fillLoginForm(page);
      await page.getByLabel('Login', { exact: true }).click();

      // Modal appears
      const concurrentModal = page.getByRole('dialog', {
        name: 'Logged in elsewhere',
      });
      await expect(concurrentModal).toBeVisible({
        timeout: 10_000,
      });

      // Click "Login" (OK button) → triggers second login with force=true
      await concurrentModal.getByRole('button', { name: 'Login' }).click();

      // Wait for the second login call to be captured
      await expect
        .poll(() => page.evaluate(() => (window as any).__loginCalls), {
          timeout: 5_000,
        })
        .toHaveLength(2);

      const loginCalls: { otp?: string; force?: boolean }[] =
        await page.evaluate(() => (window as any).__loginCalls);

      // Verify: 1st call has no force, 2nd call includes force=true
      expect(loginCalls[0].force).toBeFalsy();
      expect(loginCalls[1].force).toBe(true);
    });

    // ── 4. TOTP after force approval (fully mocked) ─────────────────────

    test('TOTP is required after force login approval — force flag persists when submitting OTP', async ({
      page,
    }) => {
      /**
       * Mocked flow:
       *   1st POST /server/login          → concurrent session envelope
       *   User clicks "Login" (force)     → forceLoginApprovedRef = true
       *   2nd POST /server/login (force)  → TOTP required
       *   User enters OTP
       *   3rd POST /server/login (force + otp) → verify request body
       */

      // Spy on BackendAIClient.prototype.login to capture arguments before
      // the body is AES-encrypted. Records each call as { otp, force }.
      await page.evaluate(() => {
        (window as any).__loginCalls = [];
        const proto = (globalThis as any).BackendAIClient?.prototype;
        if (proto) {
          const origLoginFn = proto.login;
          proto.login = async function (otp?: string, force?: boolean) {
            (window as any).__loginCalls.push({ otp, force });
            return origLoginFn.call(this, otp, force);
          };
        }
      });

      let loginCallCount = 0;

      await page.route('**/server/login', async (route) => {
        if (route.request().method() !== 'POST') {
          await route.continue();
          return;
        }
        loginCallCount++;

        if (loginCallCount === 1) {
          // concurrent session response
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(CONCURRENT_SESSION_RESPONSE),
          });
        } else if (loginCallCount === 2) {
          // force=true sent, but server requires TOTP
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(TOTP_REQUIRED_RESPONSE),
          });
        } else {
          // force=true + otp sent — respond with concurrent session
          // again (we only need to verify the request body).
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(CONCURRENT_SESSION_RESPONSE),
          });
        }
      });

      await fillLoginForm(page);
      await page.getByLabel('Login', { exact: true }).click();

      // Step 1: Concurrent session modal
      const concurrentModal = page.getByRole('dialog', {
        name: 'Logged in elsewhere',
      });
      await expect(concurrentModal).toBeVisible({
        timeout: 10_000,
      });

      // Step 2: Approve force-login
      await concurrentModal.getByRole('button', { name: 'Login' }).click();

      // Step 3: TOTP input appears
      await expect(page.getByPlaceholder('One-time password')).toBeVisible({
        timeout: 5_000,
      });

      // Step 4: Enter OTP and submit
      await page.getByPlaceholder('One-time password').fill('123456');
      await page.getByLabel('Login', { exact: true }).click();

      // Wait for the 3rd login call to be captured
      await expect
        .poll(() => page.evaluate(() => (window as any).__loginCalls), {
          timeout: 5_000,
        })
        .toHaveLength(3);

      const loginCalls: { otp?: string; force?: boolean }[] =
        await page.evaluate(() => (window as any).__loginCalls);

      // Verify call arguments:
      // 1st: no force, no otp
      expect(loginCalls[0].force).toBeFalsy();
      expect(loginCalls[0].otp).toBeFalsy();
      // 2nd: force=true, no otp (TOTP not yet entered)
      expect(loginCalls[1].force).toBe(true);
      expect(loginCalls[1].otp).toBeFalsy();
      // 3rd: force=true persisted + otp included
      expect(loginCalls[2].force).toBe(true);
      expect(loginCalls[2].otp).toBe('123456');
    });

    // ── 5. Silent re-login does not show modal ──────────────────────────

    test('page refresh does not show concurrent session modal for silent re-login attempts', async ({
      page,
    }) => {
      let loginRequestCount = 0;
      await page.route('**/server/login', async (route) => {
        if (route.request().method() === 'POST') {
          loginRequestCount++;
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(CONCURRENT_SESSION_RESPONSE),
          });
        } else {
          await route.continue();
        }
      });

      // Set a non-empty endpoint so that silent re-login actually fires
      // (connectUsingSession returns early when endpoint is empty).
      await page.evaluate((ep) => {
        localStorage.setItem('backendaiwebui.api_endpoint', ep);
      }, webServerEndpoint);

      // Reload triggers the silent re-login path (showError=false)
      await page.reload();

      // Wait for the login form to appear (silent re-login failed → login panel opens)
      await expect(page.getByLabel('Email or Username')).toBeVisible({
        timeout: 10_000,
      });

      // Silent re-login must actually fire a /server/login request —
      // otherwise this test would pass trivially without exercising
      // the concurrent-session guard.
      await expect.poll(() => loginRequestCount).toBeGreaterThanOrEqual(1);

      // Concurrent session modal must NOT appear (showError=false path)
      await expect(
        page.getByRole('dialog', { name: 'Logged in elsewhere' }),
      ).toBeHidden();
    });
  },
);
