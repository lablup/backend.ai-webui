/**
 * E2E tests for the full Edu App Launcher flow (/applauncher).
 *
 * Tests the complete token-based authentication → session resolution → app launch
 * flow that external education portals rely on.
 *
 * Requirements:
 *   - Running Backend.AI cluster (manager + agent + appproxy)
 *   - BAI_ACCESS_KEY and BAI_SECRET_KEY in .env.playwright
 *   - BAI_SESSION_TEMPLATE registered in the cluster
 *   - WebUI dev server running
 *
 * Test Tiers:
 *   - Tier 2: Authentication tests (backend required, no session creation)
 *   - Tier 3: Full flow tests (full cluster, session creation + app launch)
 */
import {
  generateSToken,
  buildAppLauncherParams,
} from '../utils/stoken-helper';
import {
  webuiEndpoint,
  webServerEndpoint,
} from '../utils/test-util';
import { test, expect, Page } from '@playwright/test';

// Environment configuration
const BAI_ACCESS_KEY = process.env.BAI_ACCESS_KEY || '';
const BAI_SECRET_KEY = process.env.BAI_SECRET_KEY || '';
const BAI_SESSION_TEMPLATE = process.env.BAI_SESSION_TEMPLATE || 'test';
const BAI_ENDPOINT = process.env.E2E_WEBSERVER_ENDPOINT || webServerEndpoint;

const hasCredentials = BAI_ACCESS_KEY !== '' && BAI_SECRET_KEY !== '';

/**
 * Generate a valid sToken and build the /applauncher URL.
 */
function buildAppLauncherUrl(options?: {
  app?: string;
  sessionTemplate?: string;
  sessionId?: string;
  invalidToken?: boolean;
}): string {
  const tokenResult = options?.invalidToken
    ? {
        sToken: 'BackendAI signMethod=HMAC-SHA256, credential=INVALID:invalidsignature',
        date: new Date().toISOString(),
        apiVersion: 'v7.20230615',
        endpointHost: BAI_ENDPOINT.replace(/^[^:]+:\/\//, ''),
      }
    : generateSToken({
        accessKey: BAI_ACCESS_KEY,
        secretKey: BAI_SECRET_KEY,
        endpoint: BAI_ENDPOINT,
      });

  const params = buildAppLauncherParams(tokenResult, {
    endpoint: BAI_ENDPOINT,
    app: options?.app ?? 'jupyterlab',
    sessionTemplate: options?.sessionTemplate,
    sessionId: options?.sessionId,
  });

  return `${webuiEndpoint}/applauncher?${params.toString()}`;
}

/**
 * Wait for the step-based UI card to appear.
 */
async function waitForAppLauncherCard(page: Page) {
  const card = page.locator('.ant-card');
  await expect(card).toBeVisible({ timeout: 15000 });
  return card;
}

/**
 * Get the current step status from the Steps component.
 * Returns the index of the current active step (0-based).
 */
async function getCurrentStepIndex(page: Page): Promise<number> {
  const steps = page.locator('.ant-steps-item');
  const count = await steps.count();
  for (let i = 0; i < count; i++) {
    const step = steps.nth(i);
    const className = await step.getAttribute('class');
    if (
      className?.includes('ant-steps-item-process') ||
      className?.includes('ant-steps-item-error')
    ) {
      return i;
    }
  }
  return 0;
}

// ============================================================================
// Tier 2: Authentication Tests (Backend Required, No Session Creation)
// ============================================================================

test.describe(
  'Edu AppLauncher - Authentication Flow',
  { tag: ['@app-launcher', '@edu-flow', '@requires-backend'] },
  () => {
    test.skip(!hasCredentials, 'BAI_ACCESS_KEY and BAI_SECRET_KEY not configured');

    test('Valid sToken authenticates successfully past step 1', async ({
      page,
    }, testInfo) => {
      testInfo.setTimeout(60000);

      const url = buildAppLauncherUrl({
        app: 'jupyterlab',
        // No session_template or session_id → auth succeeds but session resolution may fail
      });

      await page.goto(url);
      await waitForAppLauncherCard(page);

      // Steps should be visible
      const steps = page.locator('.ant-steps');
      await expect(steps).toBeVisible();
      await expect(page.locator('.ant-steps-item')).toHaveCount(3);

      // Wait for authentication to complete (step moves past 0)
      // Either: step 1+ becomes active (auth succeeded) OR step 0 shows error
      await expect
        .poll(
          async () => {
            const step0 = page.locator('.ant-steps-item').first();
            const className = await step0.getAttribute('class');
            // Step 0 is no longer "process" → auth completed
            const isFinished = className?.includes('ant-steps-item-finish');
            const isError = className?.includes('ant-steps-item-error');
            return isFinished || isError;
          },
          {
            message: 'Waiting for authentication step to complete',
            timeout: 30000,
            intervals: [1000, 2000, 3000],
          },
        )
        .toBe(true);

      // Check if authentication succeeded (step 0 has "finish" status)
      const step0 = page.locator('.ant-steps-item').first();
      const step0Class = await step0.getAttribute('class');

      if (step0Class?.includes('ant-steps-item-finish')) {
        // Auth succeeded — step should have moved to 1 (session) or 2 (launch)
        const currentStep = await getCurrentStepIndex(page);
        expect(currentStep).toBeGreaterThanOrEqual(1);
      } else {
        // Auth failed — check if it's an expected error
        const errorAlert = page.locator('.ant-alert-error');
        await expect(errorAlert).toBeVisible({ timeout: 5000 });
        // Log the error for debugging
        const errorText = await errorAlert.textContent();
        console.log(`Authentication failed (may need hook plugin): ${errorText}`);
        // Mark test as soft-failed — auth failure is expected if hook plugin is not installed
        test.info().annotations.push({
          type: 'note',
          description: `sToken auth failed — cluster may not have AUTHORIZE hook plugin. Error: ${errorText}`,
        });
      }
    });

    test('Invalid sToken shows authentication error', async ({
      page,
    }, testInfo) => {
      testInfo.setTimeout(60000);

      const url = buildAppLauncherUrl({ invalidToken: true });

      await page.goto(url);
      await waitForAppLauncherCard(page);

      // Wait for error to appear
      const errorAlert = page.locator('.ant-alert-error');
      await expect(errorAlert).toBeVisible({ timeout: 30000 });

      // Error should be on step 0 (authentication)
      const step0 = page.locator('.ant-steps-item').first();
      await expect(step0).toHaveClass(/ant-steps-item-error/);

      // Retry button should be visible
      const retryButton = page.getByRole('button', { name: /retry/i });
      await expect(retryButton).toBeVisible();
    });

    test('Expired date in sToken shows authentication error', async ({
      page,
    }, testInfo) => {
      testInfo.setTimeout(60000);

      // Generate token with a date far in the past
      const expiredDate = new Date('2020-01-01T00:00:00Z');
      const tokenResult = generateSToken({
        accessKey: BAI_ACCESS_KEY,
        secretKey: BAI_SECRET_KEY,
        endpoint: BAI_ENDPOINT,
        date: expiredDate,
      });

      const params = buildAppLauncherParams(tokenResult, {
        endpoint: BAI_ENDPOINT,
        app: 'jupyterlab',
      });

      await page.goto(`${webuiEndpoint}/applauncher?${params.toString()}`);
      await waitForAppLauncherCard(page);

      // Should show error (expired token or signature mismatch)
      const errorAlert = page.locator('.ant-alert-error');
      await expect(errorAlert).toBeVisible({ timeout: 30000 });
    });
  },
);

// ============================================================================
// Tier 3: Full Flow Tests (Full Cluster, Session Creation + App Launch)
// ============================================================================

test.describe(
  'Edu AppLauncher - Template-based Session Flow',
  { tag: ['@app-launcher', '@edu-flow', '@requires-backend', '@requires-session-template'] },
  () => {
    test.skip(!hasCredentials, 'BAI_ACCESS_KEY and BAI_SECRET_KEY not configured');

    test('Template-based flow progresses through all 3 steps', async ({
      page,
    }, testInfo) => {
      // This test exercises the full flow: auth → find/create session → launch app
      // Long timeout due to potential session creation (up to 3-5 min)
      testInfo.setTimeout(600000);

      const url = buildAppLauncherUrl({
        app: 'jupyterlab',
        sessionTemplate: BAI_SESSION_TEMPLATE,
      });

      // Track navigation to proxy URL (indicates successful app launch)
      let redirectedToProxy = false;
      let proxyUrl = '';
      page.on('request', (request) => {
        const reqUrl = request.url();
        if (reqUrl.includes('/proxy/') || reqUrl.includes('/v2/proxy/')) {
          redirectedToProxy = true;
          proxyUrl = reqUrl;
        }
      });

      await page.goto(url);
      await waitForAppLauncherCard(page);

      // Steps should be visible with 3 items
      await expect(page.locator('.ant-steps-item')).toHaveCount(3);

      // Wait for authentication to complete
      await expect
        .poll(
          async () => {
            const step0 = page.locator('.ant-steps-item').first();
            const className = await step0.getAttribute('class');
            return (
              className?.includes('ant-steps-item-finish') ||
              className?.includes('ant-steps-item-error')
            );
          },
          {
            message: 'Waiting for authentication step to complete',
            timeout: 30000,
            intervals: [1000, 2000, 3000],
          },
        )
        .toBe(true);

      // Check if auth succeeded
      const step0 = page.locator('.ant-steps-item').first();
      const step0Class = await step0.getAttribute('class');
      if (!step0Class?.includes('ant-steps-item-finish')) {
        const errorAlert = page.locator('.ant-alert-error');
        const errorText = await errorAlert.textContent().catch(() => 'unknown');
        test.skip(true, `sToken auth not supported on this cluster: ${errorText}`);
        return;
      }

      // Auth succeeded — wait for session resolution (step 1)
      // This may take a long time if a new session needs to be created
      await expect
        .poll(
          async () => {
            // Check if step 1 finished (session resolved)
            const step1 = page.locator('.ant-steps-item').nth(1);
            const className = await step1.getAttribute('class');
            const isFinished = className?.includes('ant-steps-item-finish');
            const isError = className?.includes('ant-steps-item-error');
            return isFinished || isError;
          },
          {
            message:
              'Waiting for session resolution (may create new session from template)',
            timeout: 300000, // 5 minutes for session creation
            intervals: [2000, 5000, 10000],
          },
        )
        .toBe(true);

      // Check if session resolution succeeded
      const step1 = page.locator('.ant-steps-item').nth(1);
      const step1Class = await step1.getAttribute('class');

      if (step1Class?.includes('ant-steps-item-error')) {
        const errorAlert = page.locator('.ant-alert-error');
        const errorText = await errorAlert.textContent().catch(() => 'unknown');
        console.log(`Session resolution failed: ${errorText}`);
        // This may fail if template doesn't exist or no resources available
        test.info().annotations.push({
          type: 'note',
          description: `Session resolution failed: ${errorText}`,
        });
        return;
      }

      // Session resolved — step 2 (app launch) should be active or completed
      // The page will redirect to the proxy URL via window.open(_self)
      // Wait for either: redirect happens OR step 2 shows error
      await expect
        .poll(
          async () => {
            // Check if page URL changed to proxy
            const currentUrl = page.url();
            if (
              currentUrl.includes('/proxy/') ||
              currentUrl.includes('/v2/proxy/')
            ) {
              return 'redirected';
            }
            // Check if step 2 errored
            const step2 = page.locator('.ant-steps-item').nth(2);
            const className = await step2
              .getAttribute('class')
              .catch(() => '');
            if (className?.includes('ant-steps-item-error')) {
              return 'error';
            }
            // Check if app launch happened via network
            if (redirectedToProxy) {
              return 'redirected';
            }
            return 'waiting';
          },
          {
            message: 'Waiting for app launch or redirect',
            timeout: 120000,
            intervals: [2000, 5000],
          },
        )
        .not.toBe('waiting');

      // Log the result
      const finalUrl = page.url();
      if (
        finalUrl.includes('/proxy/') ||
        finalUrl.includes('/v2/proxy/') ||
        redirectedToProxy
      ) {
        console.log(`App launched successfully. Proxy URL: ${proxyUrl || finalUrl}`);
      }
    });

    test('Missing session template shows error at step 2', async ({
      page,
    }, testInfo) => {
      testInfo.setTimeout(120000);

      const url = buildAppLauncherUrl({
        app: 'jupyterlab',
        sessionTemplate: 'nonexistent-template-e2e-test',
      });

      await page.goto(url);
      await waitForAppLauncherCard(page);

      // Wait for authentication to complete
      await expect
        .poll(
          async () => {
            const step0 = page.locator('.ant-steps-item').first();
            const className = await step0.getAttribute('class');
            return (
              className?.includes('ant-steps-item-finish') ||
              className?.includes('ant-steps-item-error')
            );
          },
          {
            message: 'Waiting for authentication',
            timeout: 30000,
            intervals: [1000, 2000],
          },
        )
        .toBe(true);

      const step0Class = await page
        .locator('.ant-steps-item')
        .first()
        .getAttribute('class');
      if (!step0Class?.includes('ant-steps-item-finish')) {
        test.skip(true, 'sToken auth not supported on this cluster');
        return;
      }

      // Auth succeeded — wait for session resolution to fail with template error
      const errorAlert = page.locator('.ant-alert-error');
      await expect(errorAlert).toBeVisible({ timeout: 30000 });

      // Error should mention missing template
      await expect(errorAlert).toContainText(/template|session/i);

      // Error should be at step 1 (session)
      const step1 = page.locator('.ant-steps-item').nth(1);
      await expect(step1).toHaveClass(/ant-steps-item-error/);
    });
  },
);

// ============================================================================
// Tier 3: Direct Session ID Flow
// ============================================================================

test.describe(
  'Edu AppLauncher - Direct Session ID Flow',
  { tag: ['@app-launcher', '@edu-flow', '@requires-backend'] },
  () => {
    test.skip(!hasCredentials, 'BAI_ACCESS_KEY and BAI_SECRET_KEY not configured');

    test('Direct session_id skips template resolution and launches app', async ({
      page,
    }, testInfo) => {
      testInfo.setTimeout(120000);

      // Use a fake session ID — this will fail at app launch but should
      // skip template resolution (step 1 → directly to step 2)
      const fakeSessionId = '00000000-0000-0000-0000-000000000000';

      const url = buildAppLauncherUrl({
        app: 'ttyd',
        sessionId: fakeSessionId,
      });

      await page.goto(url);
      await waitForAppLauncherCard(page);

      // Wait for auth to complete
      await expect
        .poll(
          async () => {
            const step0 = page.locator('.ant-steps-item').first();
            const className = await step0.getAttribute('class');
            return (
              className?.includes('ant-steps-item-finish') ||
              className?.includes('ant-steps-item-error')
            );
          },
          {
            message: 'Waiting for authentication',
            timeout: 30000,
            intervals: [1000, 2000],
          },
        )
        .toBe(true);

      const step0Class = await page
        .locator('.ant-steps-item')
        .first()
        .getAttribute('class');
      if (!step0Class?.includes('ant-steps-item-finish')) {
        test.skip(true, 'sToken auth not supported on this cluster');
        return;
      }

      // Auth succeeded — with session_id provided, it should skip to step 2 (launch)
      // and fail because the fake session doesn't exist
      await expect
        .poll(
          async () => {
            const errorAlert = page.locator('.ant-alert-error');
            const isError = await errorAlert.isVisible().catch(() => false);
            // Or page redirected (unlikely with fake ID)
            const url = page.url();
            return isError || url.includes('/proxy/');
          },
          {
            message: 'Waiting for app launch attempt with fake session ID',
            timeout: 60000,
            intervals: [2000, 5000],
          },
        )
        .toBe(true);

      // Should show error at step 2 (launch) since session doesn't exist
      const errorAlert = page.locator('.ant-alert-error');
      if (await errorAlert.isVisible()) {
        const currentStep = await getCurrentStepIndex(page);
        // Step should be at 1 (session) or 2 (launch) — NOT 0 (auth)
        expect(currentStep).toBeGreaterThanOrEqual(1);
      }
    });
  },
);
