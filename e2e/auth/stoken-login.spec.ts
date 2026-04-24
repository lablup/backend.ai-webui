/**
 * E2E regression for FR-2616 Story 2 — `STokenLoginBoundary` applied to
 * the LoginView route tree (`/` and `/interactive-login`).
 *
 * Valid-token happy-path coverage requires a Backend.AI install with a
 * customer-specific auth plugin (auth-keypair / OpenID) to mint real
 * sTokens; standard installs do not provide one. These tests therefore
 * focus on:
 *   - invalid-token error UI renders and exposes a Retry button;
 *   - the non-sToken entry points still render the regular login form
 *     (regression guard — the boundary must not leak into non-sToken
 *     flows);
 *   - URL preservation on error: the boundary only strips `sToken`
 *     after a successful login, so an invalid token remains in the URL
 *     and the user's Retry can still pick it up.
 *
 * Additionally, this file mocks `/server/token-login` to exercise the
 * interactive paths that do not require a customer-specific auth plugin
 * to reproduce:
 *   - `require-totp-authentication` → inline OTP form
 *   - `active-login-session-exists` → "Logged in elsewhere" + Login
 *   - sticky retries fold both `otp` and `force: true` into the same
 *     body when the user satisfies both challenges in sequence.
 */
import { webuiEndpoint } from '../utils/test-util';
import { expect, test, type Page } from '@playwright/test';

/**
 * Mock webserver version response returned by the boundary's
 * `get_manager_version()` probe. Needed so the ping step passes and the
 * sequence actually reaches `token_login` where the test-specific
 * response is fulfilled.
 */
const MOCK_SERVER_VERSION = {
  manager: '25.0.0',
  version: 'v6.20220615',
  'backend.ai': '25.0.0',
};

/** Not-logged-in envelope for the fast-path session probe. */
const MOCK_LOGIN_CHECK_NOT_AUTHED = { authenticated: false };

const TOTP_REQUIRED_RESPONSE = {
  authenticated: false,
  data: {
    type: 'https://api.backend.ai/probs/require-totp-authentication',
    title: 'Two-Factor Authentication needed.',
    details: 'You must authenticate using Two-Factor Authentication.',
  },
};

const CONCURRENT_SESSION_RESPONSE = {
  authenticated: false,
  data: {
    type: 'https://api.backend.ai/probs/active-login-session-exists',
    title: 'Too many concurrent login sessions for this user.',
    details: 'Internal server error',
  },
};

const AUTH_FAILED_INERT_RESPONSE = {
  authenticated: false,
  data: {
    type: 'https://api.backend.ai/probs/auth-failed',
    title: 'stub',
    details: 'stub',
  },
};

/**
 * Fixture JWT-shaped sToken used to exercise the interactive flows.
 * It never actually authenticates — the tests mock `/server/token-login`
 * — but using a realistic shape ensures no assumptions about length,
 * URL-encoding safety, or signed-section format accidentally leak into
 * the classifier or cookie-writing code.
 */
const FIXTURE_STOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3Nfa2V5IjoiQUtJQUlPU0ZPRE5ON0VYQU1QTEUiLCJzZWNyZXRfa2V5Ijoid0phbHJYVXRuRkVNSS9LN01ERU5HL2JQeFJmaUNZRVhBTVBMRUtFWSJ9.BC4eXVHEG0_HhYknddlUo8NlUnr0aY99qpXAO5FfN5g';

/**
 * Install the ping + existing-session probes once so the boundary reaches
 * `token_login`. Individual tests register `**\/server/token-login` on
 * top of this to drive the flow they care about.
 */
async function installBoundaryProbeMocks(page: Page): Promise<void> {
  await page.route('**/func/', async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_SERVER_VERSION),
    });
  });
  await page.route('**/server/login-check', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_LOGIN_CHECK_NOT_AUTHED),
    });
  });
}

test.describe(
  'sToken login boundary (LoginView routes)',
  { tag: ['@regression', '@auth', '@functional'] },
  () => {
    test('visiting `/` without a sToken still renders the login form', async ({
      page,
    }) => {
      await page.goto(webuiEndpoint);
      // Regression guard: the route-level STokenGuard passes through when
      // no sToken is present, so the ordinary LoginView panel still mounts.
      await expect(page.getByLabel('Email or Username')).toBeVisible();
      await expect(page.getByLabel('Password')).toBeVisible();
    });

    test('invalid sToken on `/` surfaces the boundary error card with a Retry button', async ({
      page,
    }) => {
      await page.goto(`${webuiEndpoint}/?sToken=invalid-token-for-e2e`);

      // The boundary renders one of the `STokenLoginError.kind`-specific
      // cards. Depending on reachability the kind will be either
      // `token-invalid` (server rejected the token) or `server-unreachable`
      // (no cluster), and in edge cases `endpoint-unresolved`. Match the
      // Retry button that is present in every kind's default card.
      await expect(page.getByRole('button', { name: /retry/i })).toBeVisible({
        timeout: 15_000,
      });
      await expect(
        page.getByRole('button', { name: /copy error details/i }),
      ).toBeVisible();
    });

    test('invalid sToken on `/` does not strip the token from the URL', async ({
      page,
    }) => {
      await page.goto(`${webuiEndpoint}/?sToken=invalid-token-for-e2e`);
      await expect(page.getByRole('button', { name: /retry/i })).toBeVisible({
        timeout: 15_000,
      });
      // The boundary only calls `clearSToken(null)` from `onSuccess`.
      // On failure the token stays in the URL so the user can read it,
      // report it, or Retry which re-consumes the same value.
      expect(page.url()).toContain('sToken=invalid-token-for-e2e');
    });

    test('invalid sToken on `/interactive-login` surfaces the same error card', async ({
      page,
    }) => {
      await page.goto(
        `${webuiEndpoint}/interactive-login?sToken=invalid-token-for-e2e`,
      );
      await expect(page.getByRole('button', { name: /retry/i })).toBeVisible({
        timeout: 15_000,
      });
    });
  },
);

test.describe(
  'sToken login boundary (interactive flows)',
  { tag: ['@regression', '@auth', '@functional'] },
  () => {
    /**
     * Critical: the webserver signals `authenticated: false` with a 200
     * status. `client.token_login` only routes into the `{ fail_reason,
     * fail_type }` branch when `_wrapWithPromise` resolves; any non-2xx
     * is rethrown as a generic "no manager found" and misclassified as
     * `token-invalid`. Every mock below therefore returns 200 regardless
     * of the authentication outcome.
     */

    test('TOTP-required response swaps the action area for an OTP form (no Retry button)', async ({
      page,
    }) => {
      await installBoundaryProbeMocks(page);
      await page.route('**/server/token-login', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(TOTP_REQUIRED_RESPONSE),
        });
      });

      await page.goto(`${webuiEndpoint}/?sToken=${FIXTURE_STOKEN}`);

      // Inline OTP input + Submit, per design "no separate modal, only
      // the lower half of the card changes". Input.OTP exposes an
      // aria-label on its root; individual slots are queryable via
      // `locator('input')`.
      await expect(page.getByLabel(/authenticator code/i)).toBeVisible({
        timeout: 15_000,
      });
      await expect(
        page.getByRole('button', { name: /^submit$/i }),
      ).toBeVisible();
      // The OTP kind replaces Retry — it must NOT co-exist with the
      // generic retry button (would be a design regression).
      await expect(
        page.getByRole('button', { name: /retry/i }),
      ).not.toBeVisible();
    });

    test('submitting the OTP folds `otp` into the next token_login body', async ({
      page,
    }) => {
      await installBoundaryProbeMocks(page);

      let callIndex = 0;
      const bodies: Array<Record<string, unknown> | null> = [];
      await page.route('**/server/token-login', async (route) => {
        bodies.push(route.request().postDataJSON() ?? null);
        callIndex += 1;
        // First call: demand TOTP. Second call (after submit): inert
        // failure so the test stays focused on the request body.
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(
            callIndex === 1
              ? TOTP_REQUIRED_RESPONSE
              : AUTH_FAILED_INERT_RESPONSE,
          ),
        });
      });

      await page.goto(`${webuiEndpoint}/?sToken=${FIXTURE_STOKEN}`);

      const otpGroup = page.getByLabel(/authenticator code/i);
      await expect(otpGroup).toBeVisible({ timeout: 15_000 });
      // Input.OTP distributes a multi-char string pasted into a single
      // slot across the remaining slots; `fill` dispatches the same
      // input event.
      await otpGroup.locator('input').first().fill('123456');
      await page.getByRole('button', { name: /^submit$/i }).click();

      await expect
        .poll(() => bodies.length, { timeout: 10_000 })
        .toBeGreaterThanOrEqual(2);
      expect(bodies[0]).not.toHaveProperty('otp');
      expect(bodies[1]).toMatchObject({ otp: '123456' });
    });

    test('concurrent-session response renders the Login confirm (no Retry) and sends `force: true`', async ({
      page,
    }) => {
      await installBoundaryProbeMocks(page);

      let callIndex = 0;
      const bodies: Array<Record<string, unknown> | null> = [];
      await page.route('**/server/token-login', async (route) => {
        bodies.push(route.request().postDataJSON() ?? null);
        callIndex += 1;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(
            callIndex === 1
              ? CONCURRENT_SESSION_RESPONSE
              : AUTH_FAILED_INERT_RESPONSE,
          ),
        });
      });

      await page.goto(`${webuiEndpoint}/?sToken=${FIXTURE_STOKEN}`);

      // The concurrent-session card uses the LoginView-aligned copy:
      // "Logged in elsewhere" title with a Login confirm button.
      await expect(
        page.getByText('Logged in elsewhere', { exact: true }),
      ).toBeVisible({
        timeout: 15_000,
      });
      await expect(
        page.getByRole('button', { name: /^login$/i }),
      ).toBeVisible();
      // Retry button must NOT appear — this kind replaces it entirely.
      await expect(
        page.getByRole('button', { name: /retry/i }),
      ).not.toBeVisible();

      await page.getByRole('button', { name: /^login$/i }).click();

      await expect
        .poll(() => bodies.length, { timeout: 10_000 })
        .toBeGreaterThanOrEqual(2);
      expect(bodies[0]).not.toHaveProperty('force');
      expect(bodies[1]).toMatchObject({ force: true });
    });

    test('OTP-then-concurrent sequence keeps both `otp` and `force: true` sticky on the final body', async ({
      page,
    }) => {
      await installBoundaryProbeMocks(page);

      let callIndex = 0;
      const bodies: Array<Record<string, unknown> | null> = [];
      await page.route('**/server/token-login', async (route) => {
        bodies.push(route.request().postDataJSON() ?? null);
        callIndex += 1;
        let body: unknown;
        if (callIndex === 1) {
          body = TOTP_REQUIRED_RESPONSE;
        } else if (callIndex === 2) {
          // After the OTP submission, the server discovers an existing
          // active session. This is the sticky-OTP scenario the bug
          // report uncovered.
          body = CONCURRENT_SESSION_RESPONSE;
        } else {
          body = AUTH_FAILED_INERT_RESPONSE;
        }
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(body),
        });
      });

      await page.goto(`${webuiEndpoint}/?sToken=${FIXTURE_STOKEN}`);

      // Step 1: supply OTP.
      const otpGroup = page.getByLabel(/authenticator code/i);
      await expect(otpGroup).toBeVisible({ timeout: 15_000 });
      await otpGroup.locator('input').first().fill('999111');
      await page.getByRole('button', { name: /^submit$/i }).click();

      // Step 2: confirm force-login.
      await expect(
        page.getByText('Logged in elsewhere', { exact: true }),
      ).toBeVisible({
        timeout: 10_000,
      });
      await page.getByRole('button', { name: /^login$/i }).click();

      await expect
        .poll(() => bodies.length, { timeout: 10_000 })
        .toBeGreaterThanOrEqual(3);
      // Final body must carry BOTH factors the user satisfied.
      expect(bodies[2]).toMatchObject({ otp: '999111', force: true });
    });
  },
);
