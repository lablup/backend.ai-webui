import { modifyConfigToml, webuiEndpoint } from '../utils/test-util';
import { test, expect, Page } from '@playwright/test';

// Saved endpoints are what `backendaioptions.set('endpoints', …)` writes after a
// successful login; seeding the same key skips the login round-trips.
const ENDPOINTS_STORAGE_KEY = 'backendaiwebui.settings.user.endpoints';
const SAVED_ENDPOINTS = [
  'https://api.example.com',
  'https://staging.example.com',
  'https://cluster-a.example.com',
];

/**
 * Expand the Advanced section if needed and return the endpoint input.
 */
async function endpointField(page: Page) {
  // Wait for the form itself first: `isVisible()` does not retry, and the
  // section starts expanded when no endpoint is pre-filled, so clicking
  // "Advanced" before the form renders would collapse it.
  await expect(page.getByLabel('Email or Username')).toBeVisible({
    timeout: 15_000,
  });
  // `getByLabel('Endpoint')` also matches the "About Endpoint" button.
  const input = page.getByRole('textbox', { name: 'Endpoint', exact: true });
  if (!(await input.isVisible().catch(() => false))) {
    await page.getByText('Advanced').click();
  }
  await expect(input).toBeVisible();
  return input;
}

function endpointRow(page: Page, endpoint: string) {
  return page.getByRole('listitem').filter({ hasText: endpoint });
}

function deleteButton(page: Page, endpoint: string) {
  return page.getByRole('button', { name: `Delete: ${endpoint}`, exact: true });
}

test.describe(
  'Login - endpoint history list',
  { tag: ['@regression', '@auth', '@functional'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await modifyConfigToml(page, request, {
        general: {
          connectionMode: 'SESSION',
          apiEndpoint: '',
          apiEndpointText: '',
        },
      });
      // Init scripts run on every navigation, so seed only once per context:
      // a reload must see what the app itself wrote since.
      await page.addInitScript(
        ([key, endpoints]) => {
          if (localStorage.getItem(key as string) === null) {
            localStorage.setItem(key as string, JSON.stringify(endpoints));
          }
        },
        [ENDPOINTS_STORAGE_KEY, SAVED_ENDPOINTS] as const,
      );
      await page.goto(webuiEndpoint);
    });

    test('user can see the saved endpoints under the field when it is focused', async ({
      page,
    }) => {
      const input = await endpointField(page);

      // Nothing is listed until the field takes focus.
      await expect(deleteButton(page, SAVED_ENDPOINTS[0])).toBeHidden();

      await input.focus();
      for (const endpoint of SAVED_ENDPOINTS) {
        await expect(endpointRow(page, endpoint)).toBeVisible();
        await expect(deleteButton(page, endpoint)).toBeVisible();
      }
    });

    test('user can fill the field by picking a saved endpoint', async ({
      page,
    }) => {
      const input = await endpointField(page);
      await input.focus();

      await endpointRow(page, SAVED_ENDPOINTS[1]).click();

      await expect(input).toHaveValue(SAVED_ENDPOINTS[1]);
      // Picking a row closes the list.
      await expect(deleteButton(page, SAVED_ENDPOINTS[1])).toBeHidden();
    });

    test('user can delete a saved endpoint without changing the field', async ({
      page,
    }) => {
      const input = await endpointField(page);
      await input.fill('https://typed.example.com');
      await input.focus();

      await deleteButton(page, SAVED_ENDPOINTS[1]).click();

      await expect(endpointRow(page, SAVED_ENDPOINTS[1])).toBeHidden();
      await expect(endpointRow(page, SAVED_ENDPOINTS[0])).toBeVisible();
      await expect(endpointRow(page, SAVED_ENDPOINTS[2])).toBeVisible();
      // The trash button must not also select its row.
      await expect(input).toHaveValue('https://typed.example.com');

      // The deletion is persisted, not just hidden.
      await page.reload();
      await (await endpointField(page)).focus();
      await expect(endpointRow(page, SAVED_ENDPOINTS[0])).toBeVisible();
      await expect(endpointRow(page, SAVED_ENDPOINTS[1])).toBeHidden();
    });
  },
);
