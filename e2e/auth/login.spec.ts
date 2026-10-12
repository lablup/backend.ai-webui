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
  // Must be the role locator: getByLabel('Endpoint') is ambiguous once the
  // section is expanded (matches the History/About buttons too).
  const endpointInput = page.getByRole('textbox', { name: 'Endpoint' });
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
      // Astryx `Button`'s accessible name comes from its visible text content,
      // not `aria-label`, so `getByRole` is required (`getByLabel` matches
      // nothing) — see `fillEndpoint` above for the sibling `Endpoint` locator
      // issue from the same migration.
      await expect(
        page.getByRole('button', { name: 'Login', exact: true }),
      ).toBeVisible();
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
      await page.getByRole('button', { name: 'Login', exact: true }).click();

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
      await page.getByRole('button', { name: 'Login', exact: true }).click();

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
      await page.getByRole('button', { name: 'Login', exact: true }).click();

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
      await page.getByRole('button', { name: 'Login', exact: true }).click();

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
      await page.getByRole('button', { name: 'Login', exact: true }).click();

      // Wait for and verify the error notification appears
      await expect(
        page.getByText('Login information mismatch. Check your information'),
      ).toBeVisible();
    });
  },
);

/**
 * FR-3562: a configured `apiEndpoint` is a webserver, which cannot serve
 * API-mode sign-in, so the Session/API switch is locked to Session.
 */
test.describe(
  'Sign-in mode switch (FR-3562)',
  { tag: ['@regression', '@auth', '@functional'] },
  () => {
    test('User cannot switch to API sign-in when apiEndpoint is configured', async ({
      page,
      request,
    }) => {
      await modifyConfigToml(page, request, {
        general: {
          connectionMode: 'SESSION',
          allowChangeSigninMode: true,
          apiEndpoint: webServerEndpoint,
        },
      });
      await page.goto(webuiEndpoint);

      const modeSwitch = page.getByRole('radiogroup', {
        name: 'Login',
        exact: true,
      });
      await expect(modeSwitch).toBeVisible();
      await expect(modeSwitch).toHaveAttribute('aria-disabled', 'true');
      await expect(
        modeSwitch.getByRole('radio', { name: 'Session' }),
      ).toHaveAttribute('aria-checked', 'true');
      const apiRadio = modeSwitch.getByRole('radio', { name: 'API' });
      await expect(apiRadio).toHaveAttribute('aria-disabled', 'true');

      await modeSwitch.hover();
      await expect(page.getByRole('tooltip')).toHaveText(
        'API sign-in needs a Manager endpoint. This WebUI is set to connect through a Backend.AI Webserver.',
      );

      // force: the radio is aria-disabled; the click must be a no-op.
      await apiRadio.click({ force: true });
      await expect(
        modeSwitch.getByRole('radio', { name: 'Session' }),
      ).toHaveAttribute('aria-checked', 'true');
      await expect(page.getByLabel('Email or Username')).toBeVisible();
      await expect(page.getByLabel('API Key')).toHaveCount(0);
    });

    test('User can switch to API sign-in when apiEndpoint is empty', async ({
      page,
      request,
    }) => {
      await modifyConfigToml(page, request, {
        general: {
          connectionMode: 'SESSION',
          allowChangeSigninMode: true,
          apiEndpoint: '',
        },
      });
      await page.goto(webuiEndpoint);

      const modeSwitch = page.getByRole('radiogroup', {
        name: 'Login',
        exact: true,
      });
      await expect(modeSwitch).toBeVisible();
      await expect(modeSwitch).not.toHaveAttribute('aria-disabled', 'true');

      await modeSwitch.getByRole('radio', { name: 'API' }).click();
      await expect(
        modeSwitch.getByRole('radio', { name: 'API' }),
      ).toHaveAttribute('aria-checked', 'true');
      await expect(page.getByLabel('API Key')).toBeVisible();
      await expect(page.getByLabel('Email or Username')).toHaveCount(0);
    });
  },
);
