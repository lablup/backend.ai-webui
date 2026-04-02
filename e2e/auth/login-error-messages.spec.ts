/**
 * E2E tests for FR-2377: Distinct error messages for each login failure type
 *
 * Tests verify that the correct notification message is shown for each
 * login error scenario handled by `handleLoginError` in LoginView.tsx.
 *
 * Mock strategy (same pattern as concurrent-login-guard.spec.ts):
 *   - GET  /func/              -> mock server version (get_manager_version)
 *   - POST /server/login-check -> mock not-authenticated (show login form)
 *   - POST /server/login       -> per-test mock response
 *
 * The monitor-role test uses a real backend account (no mocks).
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

const TEST_EMAIL = userInfo.admin.email;
const TEST_PASSWORD = userInfo.admin.password;

// ---------------------------------------------------------------------------
// Helpers (fully-mocked login page)
// ---------------------------------------------------------------------------

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

async function fillLoginForm(page: Page): Promise<void> {
  await page.getByLabel('Email or Username').fill(TEST_EMAIL);
  await page.getByLabel('Password').fill(TEST_PASSWORD);

  const endpointInput = page.getByLabel('Endpoint');
  if (!(await endpointInput.isVisible({ timeout: 500 }).catch(() => false))) {
    await page.getByText('Advanced').click();
  }
  await endpointInput.fill(webServerEndpoint);
}

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

/**
 * Mock POST /server/login to return a 401 envelope (isLoginError path).
 * The client.login() catch block detects `authenticated` + `data` in the
 * response body and re-throws as `{ isLoginError: true, data }`.
 */
function mockLoginEnvelope(
  page: Page,
  envelope: {
    type: string;
    title?: string;
    details?: string;
    [key: string]: unknown;
  },
  status = 401,
): Promise<void> {
  return page.route('**/server/login', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify({
          authenticated: false,
          data: {
            type: `https://api.backend.ai/probs/${envelope.type}`,
            title: envelope.title || '',
            details: envelope.details || '',
            ...Object.fromEntries(
              Object.entries(envelope).filter(
                ([k]) => !['type', 'title', 'details'].includes(k),
              ),
            ),
          },
        }),
      });
    } else {
      await route.continue();
    }
  });
}

/**
 * Mock POST /server/login to return a server error (isError path).
 * _wrapWithPromise reads body.type on non-2xx and throws with isError: true.
 */
function mockLoginServerError(
  page: Page,
  statusCode: number,
  errorType: string,
  title: string,
): Promise<void> {
  return page.route('**/server/login', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: statusCode,
        contentType: 'application/json',
        body: JSON.stringify({
          type: `https://api.backend.ai/probs/${errorType}`,
          title,
        }),
      });
    } else {
      await route.continue();
    }
  });
}

// ---------------------------------------------------------------------------
// Phase 1: Web proxy errors (HTTP 4xx/5xx)
// ---------------------------------------------------------------------------

test.describe(
  'Login error messages — proxy errors (FR-2377)',
  { tag: ['@regression', '@auth', '@functional'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await gotoLoginPage(page, request);
    });

    test('invalid API params (missing username) shows login failed notification', async ({
      page,
    }) => {
      await mockLoginServerError(
        page,
        400,
        'invalid-api-params',
        'Missing required parameter: username',
      );

      await fillLoginForm(page);
      await page.getByLabel('Login', { exact: true }).click();

      await expect(
        page.getByText('Missing required parameter: username'),
      ).toBeVisible({ timeout: 10_000 });
    });

    test('invalid API params (missing password) shows login failed notification', async ({
      page,
    }) => {
      await mockLoginServerError(
        page,
        400,
        'invalid-api-params',
        'Missing required parameter: password',
      );

      await fillLoginForm(page);
      await page.getByLabel('Login', { exact: true }).click();

      await expect(
        page.getByText('Missing required parameter: password'),
      ).toBeVisible({ timeout: 10_000 });
    });

    test('too many login failures shows brute-force block notification', async ({
      page,
    }) => {
      await mockLoginServerError(
        page,
        429,
        'too-many-requests',
        'Too many login attempts.',
      );

      await fillLoginForm(page);
      await page.getByLabel('Login', { exact: true }).click();

      await expect(
        page.getByText(
          'There have been too many login failures in a short time',
        ),
      ).toBeVisible({ timeout: 10_000 });
    });
  },
);

// ---------------------------------------------------------------------------
// Phase 2: Manager authorize errors (login envelope)
// ---------------------------------------------------------------------------

test.describe(
  'Login error messages — auth errors (FR-2377)',
  { tag: ['@regression', '@auth', '@functional'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await gotoLoginPage(page, request);
    });

    test('credential mismatch shows login information mismatch notification', async ({
      page,
    }) => {
      await mockLoginEnvelope(page, {
        type: 'auth-failed',
        title: 'Authentication failed.',
        details: 'User credential mismatch.',
      });

      await fillLoginForm(page);
      await page.getByLabel('Login', { exact: true }).click();

      await expect(
        page.getByText('Login information mismatch. Check your information'),
      ).toBeVisible({ timeout: 10_000 });
    });

    test('inactive account shows login information mismatch notification', async ({
      page,
    }) => {
      await mockLoginEnvelope(page, {
        type: 'auth-failed',
        title: 'Authentication failed.',
        details: 'User is inactive.',
      });

      await fillLoginForm(page);
      await page.getByLabel('Login', { exact: true }).click();

      await expect(
        page.getByText('Login information mismatch. Check your information'),
      ).toBeVisible({ timeout: 10_000 });
    });

    test('email verification required shows email verification notification', async ({
      page,
    }) => {
      await mockLoginEnvelope(page, {
        type: 'auth-failed',
        title: 'Authentication failed.',
        details:
          'Email verification is required. Please verify your email first.',
      });

      await fillLoginForm(page);
      await page.getByLabel('Login', { exact: true }).click();

      await expect(
        page.getByText(
          'Email verification is required. Please check your inbox and verify your email address.',
        ),
      ).toBeVisible({ timeout: 10_000 });
    });

    test('missing keypair shows login information mismatch notification', async ({
      page,
    }) => {
      await mockLoginEnvelope(page, {
        type: 'auth-failed',
        title: 'Authentication failed.',
        details: 'No keypair found for the user.',
      });

      await fillLoginForm(page);
      await page.getByLabel('Login', { exact: true }).click();

      await expect(
        page.getByText('Login information mismatch. Check your information'),
      ).toBeVisible({ timeout: 10_000 });
    });

    test('active login session exists shows session exists notification', async ({
      page,
    }) => {
      await mockLoginEnvelope(
        page,
        {
          type: 'active-login-session-exists',
          title: 'Active login session exists.',
          details: 'You already have an active login session.',
        },
        200,
      );

      await fillLoginForm(page);
      await page.getByLabel('Login', { exact: true }).click();

      await expect(
        page.getByText('An active login session already exists.'),
      ).toBeVisible({ timeout: 10_000 });
    });
  },
);

// ---------------------------------------------------------------------------
// Additional: Monitor role (real backend, no mocks)
// ---------------------------------------------------------------------------

test.describe(
  'Login error messages — monitor role (FR-2377)',
  { tag: ['@regression', '@auth', '@functional'] },
  () => {
    test('monitor role user sees login forbidden notification', async ({
      page,
      request,
    }) => {
      await modifyConfigToml(page, request, {
        general: {
          connectionMode: 'SESSION',
          apiEndpoint: '',
          apiEndpointText: '',
        },
      });
      await page.goto(webuiEndpoint);
      await page
        .evaluate(() => {
          document
            .getElementById('webpack-dev-server-client-overlay')
            ?.remove();
        })
        .catch(() => {});

      await page.getByLabel('Email or Username').fill(userInfo.monitor.email);
      await page.getByLabel('Password').fill(userInfo.monitor.password);

      const endpointInput = page.getByLabel('Endpoint');
      if (
        !(await endpointInput.isVisible({ timeout: 500 }).catch(() => false))
      ) {
        await page.getByText('Advanced').click();
      }
      await endpointInput.fill(webServerEndpoint);

      await page.getByLabel('Login', { exact: true }).click();

      await expect(
        page.getByText('Monitor role users are not allowed to log in.'),
      ).toBeVisible({ timeout: 15_000 });
    });
  },
);
