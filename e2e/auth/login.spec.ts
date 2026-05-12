import {
  loginAsAdmin,
  modifyConfigToml,
  userInfo,
  webServerEndpoint,
  webuiEndpoint,
} from '../utils/test-util';
import { test, expect, Page } from '@playwright/test';

/**
 * Expand the endpoint section if not already visible and fill the endpoint.
 */
async function fillEndpoint(page: Page, endpoint: string): Promise<void> {
  const endpointInput = page.getByLabel('Endpoint');
  if (!(await endpointInput.isVisible({ timeout: 500 }).catch(() => false))) {
    await page.getByText('Advanced').click();
  }
  await endpointInput.fill(endpoint);
}

test.beforeEach(async ({ page, request }) => {
  // Modify config.toml to enable session-based login with manual endpoint input
  await modifyConfigToml(page, request, {
    general: {
      connectionMode: 'SESSION',
      apiEndpoint: '',
      apiEndpointText: '',
    },
  });
  await page.goto(webuiEndpoint);
});

test.describe(
  'Before Login',
  { tag: ['@smoke', '@smoke-admin', '@auth', '@functional'] },
  () => {
    test('should display the login form', async ({ page }) => {
      await expect(page.getByLabel('Email or Username')).toBeVisible();
      await expect(page.getByLabel('Password')).toBeVisible();
      await expect(page.getByLabel('Login', { exact: true })).toBeVisible();
    });
  },
);

test.describe(
  'Login',
  { tag: ['@smoke', '@smoke-admin', '@auth', '@functional'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
    });

    test('should redirect to the Summary', async ({ page }) => {
      await expect(page).toHaveURL(/\/start/);
      await expect(
        page.getByTestId('webui-breadcrumb').getByText('Start'),
      ).toBeVisible();
    });
  },
);

/**
 * Regression tests for FR-2199: endpoint URL normalization.
 *
 * Trailing slashes on the endpoint must be stripped before API calls are made
 * to prevent double-slash in request URLs (e.g. `http://host//func/...`).
 */
test.describe(
  'Endpoint URL normalization (FR-2199)',
  { tag: ['@regression', '@auth', '@functional'] },
  () => {
    test('user can login with endpoint that has a single trailing slash', async ({
      page,
    }) => {
      await page.getByLabel('Email or Username').fill(userInfo.admin.email);
      await page.getByLabel('Password').fill(userInfo.admin.password);
      await fillEndpoint(page, webServerEndpoint + '/');
      await page.getByLabel('Login', { exact: true }).click();

      await expect(page).toHaveURL(/\/start/, { timeout: 15_000 });
      await expect(
        page.getByTestId('webui-breadcrumb').getByText('Start'),
      ).toBeVisible();
    });

    test('user can login with endpoint that has multiple trailing slashes', async ({
      page,
    }) => {
      await page.getByLabel('Email or Username').fill(userInfo.admin.email);
      await page.getByLabel('Password').fill(userInfo.admin.password);
      await fillEndpoint(page, webServerEndpoint + '///');
      await page.getByLabel('Login', { exact: true }).click();

      await expect(page).toHaveURL(/\/start/, { timeout: 15_000 });
      await expect(
        page.getByTestId('webui-breadcrumb').getByText('Start'),
      ).toBeVisible();
    });

    test('API requests do not contain double-slash after endpoint normalization', async ({
      page,
    }) => {
      const doubleSlashUrls: string[] = [];

      // Intercept all requests and check for double-slash in the path
      page.on('request', (req) => {
        const url = req.url();
        // Strip the protocol (https://) before checking for double-slash
        const pathPart = url.replace(/^[^:]+:\/\//, '');
        if (pathPart.includes('//')) {
          doubleSlashUrls.push(url);
        }
      });

      await page.getByLabel('Email or Username').fill(userInfo.admin.email);
      await page.getByLabel('Password').fill(userInfo.admin.password);
      await fillEndpoint(page, webServerEndpoint + '/');
      await page.getByLabel('Login', { exact: true }).click();

      await expect(page).toHaveURL(/\/start/, { timeout: 15_000 });
      expect(doubleSlashUrls).toHaveLength(0);
    });
  },
);

test.describe(
  'Login failure cases',
  { tag: ['@critical', '@auth', '@functional'] },
  () => {
    test('should display error message for non-existent email', async ({
      page,
    }) => {
      await page
        .getByLabel('Email or Username')
        // Use random email to avoid block due to too many requests
        .fill(`nonexistent-${new Date().getTime()}@example.com`);
      await page.getByLabel('Password').fill('somepassword');
      await fillEndpoint(page, webServerEndpoint);
      await page.getByLabel('Login', { exact: true }).click();

      // Wait for and verify the error notification appears
      await expect(
        page.getByText('Login information mismatch. Check your information'),
      ).toBeVisible();
    });

    test('should display error message for incorrect password', async ({
      page,
    }) => {
      await page.getByLabel('Email or Username').fill(userInfo.admin.email);
      await page.getByLabel('Password').fill(userInfo.admin.password + 'wrong');
      await fillEndpoint(page, webServerEndpoint);
      await page.getByLabel('Login', { exact: true }).click();

      // Wait for and verify the error notification appears
      await expect(
        page.getByText('Login information mismatch. Check your information'),
      ).toBeVisible();
    });
  },
);
