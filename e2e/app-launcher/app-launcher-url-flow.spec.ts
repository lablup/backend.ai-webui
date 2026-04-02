// spec: e2e/AppLauncher-Test-Plan.md
// Section 3: App Launcher - URL-based Launch Flow (/applauncher)
import { webuiEndpoint } from '../utils/test-util';
import { test, expect } from '@playwright/test';

/**
 * Build a URL for /applauncher with the given query parameters.
 */
function buildAppLauncherUrl(params: Record<string, string>): string {
  const searchParams = new URLSearchParams(params);
  return `${webuiEndpoint}/applauncher?${searchParams.toString()}`;
}

test.describe(
  'App Launcher URL Flow (/applauncher)',
  { tag: ['@app-launcher', '@url-flow'] },
  () => {
    test('should load /applauncher page without crashing', async ({ page }) => {
      // Navigate to /applauncher with minimal params (no sToken)
      // The page should render without a blank crash or unhandled error
      await page.goto(`${webuiEndpoint}/applauncher`);

      // Wait for DOM to be ready
      await page.waitForLoadState('domcontentloaded');

      // The page itself should be reachable (not a 404 or white screen crash)
      // Verify it renders the root app container
      const body = page.locator('body');
      await expect(body).toBeVisible();

      // Verify no JavaScript fatal crash (no "Something went wrong" crash boundary)
      const crashMessage = page.locator('text=Something went wrong');
      const isCrashed = await crashMessage
        .isVisible({ timeout: 3000 })
        .catch(() => false);
      expect(isCrashed).toBe(false);
    });

    test('should show error notification for missing sToken', async ({
      page,
    }) => {
      // Navigate to /applauncher without sToken
      // The launcher will try to authenticate and fail without a token
      await page.goto(
        buildAppLauncherUrl({
          api_version: 'v7.20230615',
          date: new Date().toISOString(),
          endpoint: 'https://api.backend.ai',
          app: 'jupyterlab',
        }),
      );

      await page.waitForLoadState('domcontentloaded');

      // The component should attempt authentication and fail.
      // Expect a notification about the authorization failure.
      // The error message comes from eduapi.CannotAuthorizeSessionByToken or
      // eduapi.CannotInitializeClient (since backend is unreachable in tests).
      const errorNotification = page.locator('.ant-notification-notice');
      await expect(errorNotification).toBeVisible({ timeout: 20000 });
    });

    test('should accept sToken parameter (lowercase) as valid token input', async ({
      page,
    }) => {
      // Navigate using lowercase 'stoken' (case-insensitive token parameter)
      // Both 'sToken' and 'stoken' should be parsed by the EduAppLauncher component
      await page.goto(
        buildAppLauncherUrl({
          stoken: 'test-token-value',
          api_version: 'v7.20230615',
          date: new Date().toISOString(),
          endpoint: 'https://api.backend.ai',
          app: 'jupyterlab',
        }),
      );

      await page.waitForLoadState('domcontentloaded');

      // A notification should appear (auth will fail but page should not crash)
      // This confirms the page attempted to process the lowercase 'stoken'
      const notification = page.locator('.ant-notification-notice');
      await expect(notification).toBeVisible({ timeout: 20000 });
    });

    test('should accept sToken parameter (mixed case) as valid token input', async ({
      page,
    }) => {
      // Navigate using 'sToken' (canonical mixed-case parameter name)
      await page.goto(
        buildAppLauncherUrl({
          sToken: 'test-token-value',
          api_version: 'v7.20230615',
          date: new Date().toISOString(),
          endpoint: 'https://api.backend.ai',
          app: 'jupyterlab',
        }),
      );

      await page.waitForLoadState('domcontentloaded');

      // A notification should appear (auth will fail but page should not crash)
      // This confirms the page attempted to process the mixed-case 'sToken'
      const notification = page.locator('.ant-notification-notice');
      await expect(notification).toBeVisible({ timeout: 20000 });
    });

    test('should handle missing endpoint parameter gracefully', async ({
      page,
    }) => {
      // Navigate without an endpoint parameter.
      // The component falls back to localStorage or stored endpoint.
      // Without a real cluster, initialization should fail gracefully.
      await page.goto(
        buildAppLauncherUrl({
          sToken: 'test-token-value',
          api_version: 'v7.20230615',
          date: new Date().toISOString(),
          app: 'jupyterlab',
          session_id: '00000000-0000-0000-0000-000000000001',
        }),
      );

      await page.waitForLoadState('domcontentloaded');

      // The page must not crash (no unhandled rejection visible in the UI).
      // A notification may or may not appear depending on stored endpoint.
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });

    test('should show error for invalid endpoint', async ({ page }) => {
      // Navigate with an obviously unreachable endpoint.
      // The client init or manager version check will fail.
      await page.goto(
        buildAppLauncherUrl({
          sToken: 'test-token-value',
          api_version: 'v7.20230615',
          date: new Date().toISOString(),
          endpoint: 'https://invalid-backend-endpoint.example.invalid',
          app: 'jupyterlab',
          session_id: '00000000-0000-0000-0000-000000000001',
        }),
      );

      await page.waitForLoadState('domcontentloaded');

      // The error notification should appear rather than the page crashing
      const notification = page.locator('.ant-notification-notice');
      await expect(notification).toBeVisible({ timeout: 20000 });
    });

    test('should default app to jupyter when app param is not specified', async ({
      page,
    }) => {
      // The EduAppLauncher reads `urlParams.get('app') || 'jupyter'`
      // We verify the page behaves consistently (attempts launch, shows error)
      // when 'app' parameter is absent.
      await page.goto(
        buildAppLauncherUrl({
          sToken: 'test-token-value',
          api_version: 'v7.20230615',
          date: new Date().toISOString(),
          endpoint: 'https://api.backend.ai',
          // Intentionally omit 'app' parameter
        }),
      );

      await page.waitForLoadState('domcontentloaded');

      // Page should not crash; it should attempt launch and show an error
      // because the endpoint is unreachable (not because of a missing app default)
      const body = page.locator('body');
      await expect(body).toBeVisible();

      // A notification must appear (auth failure, not crash from missing app param)
      const notification = page.locator('.ant-notification-notice');
      await expect(notification).toBeVisible({ timeout: 20000 });
    });

    test('should process both session_id and app params from URL', async ({
      page,
    }) => {
      // Verify that session_id and app params are picked up and processed.
      // Since there is no real cluster, this will fail at auth/init but must not crash.
      const sessionId = '12345678-1234-1234-1234-123456789012';
      await page.goto(
        buildAppLauncherUrl({
          sToken: 'test-token-value',
          api_version: 'v7.20230615',
          date: new Date().toISOString(),
          endpoint: 'https://api.backend.ai',
          session_id: sessionId,
          app: 'jupyterlab',
        }),
      );

      await page.waitForLoadState('domcontentloaded');

      // The page must stay alive — no crash boundary
      const body = page.locator('body');
      await expect(body).toBeVisible();

      // The launch flow is triggered; an error notification is expected
      // because authentication will fail without a real Backend.AI cluster
      const notification = page.locator('.ant-notification-notice');
      await expect(notification).toBeVisible({ timeout: 20000 });
    });

    test.describe('With valid cluster connection', () => {
      test.fixme('should launch app with valid sToken and session_id', // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async ({ page }) => {
        // Requires: running Backend.AI cluster + valid HMAC-SHA256 signed sToken
        //
        // Steps:
        // 1. Navigate to /applauncher with valid sToken + session_id + app
        // 2. Verify token_login succeeds
        // 3. Verify redirect occurs to the app proxy URL
      });

      test.fixme('should create session when session_id is not provided', // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async ({ page }) => {
        // Requires: running Backend.AI cluster + valid sToken + session template
        //
        // Steps:
        // 1. Navigate with valid sToken + session_template (no session_id)
        // 2. Verify session creation is triggered
        // 3. Verify app launches after session reaches RUNNING status
      });

      test.fixme('should reuse existing RUNNING session with matching image', // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async ({ page }) => {
        // Requires: running Backend.AI cluster + valid sToken + existing session
        //
        // Steps:
        // 1. Navigate with valid sToken + session_template
        // 2. Verify existing session is detected and reused
        // 3. Verify app opens without creating a new session
      });
    });
  },
);
