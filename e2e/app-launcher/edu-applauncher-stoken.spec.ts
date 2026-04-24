/**
 * E2E regression for FR-2616 Story 3 — `STokenLoginBoundary` applied to
 * the EduAppLauncher routes (`/edu-applauncher` and `/applauncher`).
 *
 * Parity checks with the LoginView sToken flow:
 *   - the boundary mounts on both route aliases,
 *   - an invalid token surfaces the error card with a Retry button.
 *
 * URL handling differs from the LoginView path:
 *   - LoginView (`/`, `/interactive-login`) strips `sToken` from the URL
 *     on successful auth (security, via `clearSToken(null)` in
 *     `onSuccess`).
 *   - EduAppLauncher (`/edu-applauncher`, `/applauncher`) intentionally
 *     does NOT strip: `_createEduSession` re-reads `sToken` for the
 *     customer-specific `eduApp.get_user_credential(sToken)` call, and
 *     the `app` / `session_id` / resource-hint params drive downstream
 *     Relay loaders. The edu token URL is LMS-issued so leaving it in
 *     browser history is an accepted trade-off.
 *
 * Valid-token happy-path is out of scope here for the same reason as
 * `stoken-login.spec.ts`: a customer-specific auth plugin is required
 * to mint real sTokens.
 */
import { webuiEndpoint } from '../utils/test-util';
import { expect, test, type Page } from '@playwright/test';

/**
 * Minimal ping + existing-session probes so the boundary reaches
 * `token_login` where test-specific responses are fulfilled. Kept local
 * to the EduAppLauncher spec to avoid cross-module coupling with the
 * auth spec's mocks.
 */
const MOCK_SERVER_VERSION = {
  manager: '25.0.0',
  version: 'v6.20220615',
  'backend.ai': '25.0.0',
};

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
      body: JSON.stringify({ authenticated: false }),
    });
  });
}

test.describe(
  'EduAppLauncher sToken boundary',
  { tag: ['@regression', '@app-launcher', '@functional'] },
  () => {
    test('invalid sToken on `/edu-applauncher` surfaces the boundary error card', async ({
      page,
    }) => {
      await page.goto(
        `${webuiEndpoint}/edu-applauncher?sToken=invalid-token-for-e2e&app=jupyter&session_id=test-session`,
      );
      await expect(page.getByRole('button', { name: /retry/i })).toBeVisible({
        timeout: 15_000,
      });
    });

    test('invalid sToken on `/applauncher` (legacy alias) surfaces the same error card', async ({
      page,
    }) => {
      await page.goto(
        `${webuiEndpoint}/applauncher?sToken=invalid-token-for-e2e`,
      );
      await expect(page.getByRole('button', { name: /retry/i })).toBeVisible({
        timeout: 15_000,
      });
    });

    test('error state keeps non-sToken URL params intact (app, session_id)', async ({
      page,
    }) => {
      await page.goto(
        `${webuiEndpoint}/edu-applauncher?sToken=invalid-token-for-e2e&app=jupyter&session_id=test-session`,
      );
      await expect(page.getByRole('button', { name: /retry/i })).toBeVisible({
        timeout: 15_000,
      });
      // On failure the URL is untouched.
      const url = page.url();
      expect(url).toContain('app=jupyter');
      expect(url).toContain('session_id=test-session');
      expect(url).toContain('sToken=invalid-token-for-e2e');
    });

    /**
     * Regression guard for the nuqs allowlist fix on eduApp routes.
     *
     * The pre-migration `_token_login` forwarded every URL param except
     * `sToken`/`stoken` to `client.token_login`. The nuqs rewrite replaced
     * the URL scan with an explicit allowlist and initially dropped the
     * LMS signing envelope (`api_version`, `date`, `endpoint`), which made
     * manager-side auth hooks reject `token_login` as tampered. This test
     * asserts the launcher POST body carries the full envelope verbatim.
     *
     * The URL shape below mirrors a real upstream launcher click from the
     * integrating LMS: JWT-shaped sToken, the full LMS signing envelope,
     * and an `app` / `session_id` pair. `session_id` is left as a stable
     * UUID literal — the test asserts only that it is forwarded to
     * `token_login`, not that any session with that ID exists. Fulfilling
     * with an inert `auth-failed` response stops the flow before any
     * session-lookup step runs against the mocked backend.
     */
    test('eduApp URL params (app, session_id, api_version, date, endpoint) all reach the token_login body', async ({
      page,
    }) => {
      await installBoundaryProbeMocks(page);

      let capturedBody: Record<string, unknown> | null = null;
      await page.route('**/server/token-login', async (route) => {
        capturedBody = route.request().postDataJSON() ?? null;
        // 200 required so `client.token_login` takes the
        // `authenticated: false` branch (non-2xx throws a generic
        // "no manager found" and short-circuits before the envelope is
        // consumed).
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            authenticated: false,
            data: {
              type: 'https://api.backend.ai/probs/auth-failed',
              title: 'stub',
              details: 'stub',
            },
          }),
        });
      });

      // JWT-shaped fixture with a deliberately synthetic payload (no
      // `access_key` / `secret_key` / `AKIA`-style fields) so that secret
      // scanners and credential detectors do not flag it as a leaked AWS
      // key. The webserver mock below returns a stub response without
      // cryptographically validating the signature, so the token body
      // content is irrelevant to the regression assertion.
      const fixtureSToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWJqZWN0IjoiZml4dHVyZS1lMmUiLCJpc3N1ZWRfYXQiOiIyMDI2LTA0LTIyVDAwOjAwOjAwWiIsImtpbmQiOiJzVG9rZW4tcmVncmVzc2lvbi1maXh0dXJlIn0.fixture_signature_not_validated';
      const sessionId = 'd847ee6f-be1c-4e40-8cc4-0cb182f4ceff';
      const apiVersion = 'v9.20250722';
      const date = '2026-04-22T07:58:04.609420+00:00';
      const endpoint = '127.0.0.1';
      const params = new URLSearchParams({
        sToken: fixtureSToken,
        api_version: apiVersion,
        date,
        endpoint,
        session_id: sessionId,
        app: 'jupyterlab',
      });
      // Use `/applauncher` (the user-facing alias the LMS actually hits)
      // rather than `/edu-applauncher` — both routes share the same
      // boundary wrapping so the regression assertion holds for either.
      await page.goto(`${webuiEndpoint}/applauncher?${params.toString()}`);

      await expect.poll(() => capturedBody, { timeout: 15_000 }).not.toBeNull();
      expect(capturedBody).toMatchObject({
        sToken: fixtureSToken,
        app: 'jupyterlab',
        session_id: sessionId,
        api_version: apiVersion,
        date,
        endpoint,
      });
    });
  },
);
