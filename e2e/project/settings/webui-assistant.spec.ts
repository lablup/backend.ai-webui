import {
  createAdminApiContext,
  createUserViaApi,
  purgeUserViaApi,
} from '../../utils/admin-api';
import { getE2EDomainName, getE2EProjectName } from '../../utils/e2e-scope';
import { loginAsCreatedAccount, navigateTo } from '../../utils/test-util';
import { test, expect, type Page } from '@playwright/test';
import { randomBytes } from 'node:crypto';

// The assistant connection is saved in the account's server-side userConfig,
// so the tests log in as a disposable user that has none, never the shared one.
const runId = `${Date.now().toString(36)}${randomBytes(3).toString('hex')}`;
const FIXTURE_EMAIL = `e2e-webui-assistant-${runId}@lablup.com`;
const FIXTURE_PASSWORD = `e2e-${randomBytes(12).toString('hex')}@Pw`;

// The switch itself is a device-local setting, so each test's fresh
// browser context starts with it off.
const MOCK_ASSISTANT_BASE_URL = 'https://e2e-webui-assistant.example.com/v1';

async function setWebUIAssistantEnabled(page: Page, enabled: boolean) {
  await navigateTo(page, 'usersettings');
  const settingsDialog = page.getByRole('dialog', { name: 'Settings & Logs' });
  await expect(settingsDialog).toBeVisible({ timeout: 15000 });
  const checkbox = settingsDialog
    .getByTestId('items-experimental-webui-assistant')
    .getByRole('checkbox', { name: 'WebUI Assistant' });
  await checkbox.setChecked(enabled);
  await expect(checkbox).toBeChecked({ checked: enabled });
  await settingsDialog.getByRole('button', { name: 'Close' }).click();
  await expect(settingsDialog).toBeHidden();
}

test.describe(
  'WebUI Assistant',
  { tag: ['@regression', '@user-settings', '@functional'] },
  () => {
    test.beforeAll(async () => {
      const api = await createAdminApiContext();
      try {
        await createUserViaApi(api, {
          email: FIXTURE_EMAIL,
          password: FIXTURE_PASSWORD,
          domainName: await getE2EDomainName(api),
          projectName: await getE2EProjectName(api),
        });
      } finally {
        await api.dispose();
      }
    });

    test.afterAll(async () => {
      const api = await createAdminApiContext();
      try {
        await purgeUserViaApi(api, FIXTURE_EMAIL).catch((error) =>
          console.warn(
            `[webui-assistant] could not purge ${FIXTURE_EMAIL}:`,
            error,
          ),
        );
      } finally {
        await api.dispose();
      }
    });

    test.beforeEach(async ({ page, request }) => {
      await loginAsCreatedAccount(
        page,
        request,
        FIXTURE_EMAIL,
        FIXTURE_PASSWORD,
      );
    });

    test('User can turn on WebUI Assistant and see the floating chat button', async ({
      page,
    }) => {
      const fab = page.getByTestId('webui-assistant-fab');

      await setWebUIAssistantEnabled(page, true);
      await expect(fab).toBeVisible();
      await expect(fab).toHaveAccessibleName('Open WebUI Assistant');

      await setWebUIAssistantEnabled(page, false);
      await expect(fab).toBeHidden();
    });

    test('User can open the Connect WebUI Assistant modal from the floating button', async ({
      page,
    }) => {
      // The custom endpoint answers the `/models` probe with 401, so nothing is saved.
      await page.route(`${MOCK_ASSISTANT_BASE_URL}/models`, async (route) => {
        const corsHeaders = {
          'access-control-allow-origin': '*',
          'access-control-allow-headers': 'authorization, content-type',
          'access-control-allow-methods': 'GET, OPTIONS',
        };
        if (route.request().method() === 'OPTIONS') {
          await route.fulfill({ status: 204, headers: corsHeaders });
          return;
        }
        await route.fulfill({
          status: 401,
          headers: corsHeaders,
          contentType: 'application/json',
          body: JSON.stringify({ error: { message: 'Invalid API key' } }),
        });
      });

      await setWebUIAssistantEnabled(page, true);
      await page.getByTestId('webui-assistant-fab').click();

      const modal = page.getByRole('dialog', {
        name: 'Connect WebUI Assistant',
      });
      await expect(modal).toBeVisible();
      await expect(
        modal.getByRole('radio', { name: 'Deployment', exact: true }),
      ).toBeVisible();
      const customEndpoint = modal.getByRole('radio', {
        name: 'Custom endpoint',
      });
      await expect(customEndpoint).toBeVisible();

      await customEndpoint.click();
      await modal
        .getByRole('textbox', { name: 'Base URL' })
        .fill(MOCK_ASSISTANT_BASE_URL);
      await modal
        .getByLabel('API key', { exact: true })
        .fill('e2e-invalid-api-key');
      await modal.getByRole('button', { name: 'Connect', exact: true }).click();

      await expect(
        modal
          .getByRole('alert')
          .filter({ hasText: 'The endpoint rejected the request (401/403).' }),
      ).toBeVisible();

      await modal.getByRole('button', { name: 'Cancel' }).click();
      await expect(modal).toBeHidden();
    });
  },
);
