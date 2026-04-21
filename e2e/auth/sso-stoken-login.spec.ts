// cspell:words STOKEN sToken
/**
 * E2E tests for sToken-based SSO login at the root URL.
 *
 * Regression coverage for FR-2574 (PR #6693), which fixed three bugs that
 * prevented `/?sToken=...` SSO from working:
 *
 *   1. Race in `useLoginOrchestration`: the orchestration effect fired
 *      when `isConfigLoaded` became true but before `apiEndpoint` was
 *      hydrated, so `connectUsingSession` bailed out on an empty endpoint
 *      before reaching the sToken check.
 *   2. `LoginView` did `window.location.href = '/'` after `tokenLogin`,
 *      which dropped the sToken query param and broke the second load.
 *   3. `token_login()` in `backend.ai-client-esm.ts` didn't persist
 *      `_loginSessionId` to localStorage, so the session was lost on
 *      refresh and `check_login()` returned false.
 *
 * Backend prerequisites
 * ---------------------
 * The sToken used below is signed with HS256 against a keypair that the
 * target Backend.AI Manager must have provisioned. For the test to pass,
 * the target Manager must:
 *
 *   - Have the `auth-keypair` plugin enabled.
 *   - Have the keypair used to sign `E2E_STOKEN_JWT` provisioned and active.
 *   - Use a JWT secret that validates `E2E_STOKEN_JWT`.
 *
 * Because these preconditions do not hold in default CI or local
 * environments, this suite is opt-in. Set `E2E_ENABLE_STOKEN_SSO=true`
 * together with `E2E_STOKEN_JWT` and (optionally) `E2E_STOKEN_API_ENDPOINT`
 * to run it.
 */
import {
  modifyConfigToml,
  webServerEndpoint,
  webuiEndpoint,
} from '../utils/test-util';
import { test, expect } from '@playwright/test';

/**
 * Opt-in guard: this suite requires a very specific Backend.AI Manager
 * setup (auth-keypair plugin + pre-provisioned keypair + matching JWT
 * secret), so keep it disabled by default to avoid failing standard CI
 * runs. Set `E2E_ENABLE_STOKEN_SSO=true` to run it intentionally.
 */
const IS_STOKEN_SSO_E2E_ENABLED = process.env.E2E_ENABLE_STOKEN_SSO === 'true';

/**
 * sToken JWT used for the test. Sourced from the environment so no
 * credential-shaped material needs to live in the repository. The token
 * must be signed with the Manager's JWT secret and encode an access/
 * secret key pair that the `auth-keypair` plugin accepts.
 */
const STATIC_S_TOKEN = process.env.E2E_STOKEN_JWT ?? '';

/**
 * Backend endpoint where the auth-keypair plugin is configured and the
 * matching keypair exists. Defaults to `webServerEndpoint`
 * (`E2E_WEBSERVER_ENDPOINT`) so local runs work out of the box; override
 * with `E2E_STOKEN_API_ENDPOINT` to point at a different backend.
 */
const S_TOKEN_API_ENDPOINT =
  process.env.E2E_STOKEN_API_ENDPOINT || webServerEndpoint;

test.describe(
  'sToken SSO login at root URL (FR-2574)',
  {
    tag: ['@critical', '@auth', '@functional', '@requires-auth-keypair-plugin'],
  },
  () => {
    test.skip(
      !IS_STOKEN_SSO_E2E_ENABLED || !STATIC_S_TOKEN,
      'Requires auth-keypair-enabled Backend.AI Manager with a pre-provisioned keypair and matching JWT secret. Set E2E_ENABLE_STOKEN_SSO=true and E2E_STOKEN_JWT=<signed token> to run this suite intentionally.',
    );

    test.beforeEach(async ({ page, request }) => {
      // Pre-populate apiEndpoint in config.toml so the WebUI does not
      // require manual endpoint input. This is the precondition the
      // PR #6693 fix relies on: orchestration only runs once both
      // `isConfigLoaded` and `apiEndpoint` are non-empty, then it
      // inspects the sToken in the URL and calls `tokenLogin`.
      await modifyConfigToml(page, request, {
        general: {
          connectionMode: 'SESSION',
          apiEndpoint: S_TOKEN_API_ENDPOINT,
        },
      });
    });

    test('auto-logs in and strips sToken from URL when navigating to /?sToken=<token>', async ({
      page,
    }) => {
      await page.goto(`${webuiEndpoint}/?sToken=${STATIC_S_TOKEN}`);

      // Success gate: orchestration must call `tokenLogin`, succeed,
      // and dispatch the post-connect setup that lands the user on the
      // start page. 15s accounts for config fetch + tokenLogin + GQL
      // connect + React Router redirect.
      await expect(page).toHaveURL(/\/start/, { timeout: 15_000 });

      // Bug 2 regression: after `tokenLogin`, `LoginView` calls
      // `history.replaceState({}, '', '/')` instead of a full reload,
      // so the sToken query parameter must be gone from the URL.
      expect(page.url()).not.toContain('sToken');

      // The login form must NOT remain visible: orchestration should
      // have detected the sToken and completed the silent login,
      // bypassing manual entry entirely.
      await expect(page.getByLabel('Email or Username')).toBeHidden();

      // Final confirmation that the user landed on an authenticated
      // page and the start view rendered.
      await expect(
        page.getByTestId('webui-breadcrumb').getByText('Start'),
      ).toBeVisible();
    });

    test('persists session after page refresh', async ({ page }) => {
      // Establish the session via sToken auto-login first.
      await page.goto(`${webuiEndpoint}/?sToken=${STATIC_S_TOKEN}`);
      await expect(page).toHaveURL(/\/start/, { timeout: 15_000 });
      await expect(
        page.getByTestId('webui-breadcrumb').getByText('Start'),
      ).toBeVisible();

      // Refresh the page. Bug 3 regression: without the
      // `localStorage.setItem('backendaiwebui.sessionid', ...)` fix in
      // `token_login()`, the session id would not be persisted, so
      // `check_login()` would return false on reload and the user
      // would be dropped back to the login form.
      await page.reload();

      // The login form must NOT reappear after the refresh.
      await expect(page.getByLabel('Email or Username')).toBeHidden();
      // The user should still be on the start page with an active session.
      await expect(
        page.getByTestId('webui-breadcrumb').getByText('Start'),
      ).toBeVisible();
    });
  },
);
