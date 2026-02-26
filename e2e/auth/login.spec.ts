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
  { tag: ['@smoke', '@auth', '@functional'] },
  () => {
    test('should display the login form', async ({ page }) => {
      await expect(page.getByLabel('Email or Username')).toBeVisible();
      await expect(page.getByLabel('Password')).toBeVisible();
      await expect(page.getByLabel('Login', { exact: true })).toBeVisible();
    });
  },
);

test.describe('Login', { tag: ['@smoke', '@auth', '@functional'] }, () => {
  test.beforeEach(async ({ page, request }) => {
    await loginAsAdmin(page, request);
  });

  test('should redirect to the Summary', async ({ page }) => {
    await expect(page).toHaveURL(/\/start/);
    await expect(
      page.getByTestId('webui-breadcrumb').getByText('Start'),
    ).toBeVisible();
  });
});

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
