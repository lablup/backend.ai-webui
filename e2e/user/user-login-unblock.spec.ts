// FR-4131 (#10117): admin "Unblock login" row action on the Users list.
// Kept out of user-crud.spec.ts: that serial lifecycle chain races itself
// under --repeat-each and would mask these independent tests.
import {
  createAdminApiContext,
  gqlAdmin,
  purgeUserViaApi,
} from '../utils/admin-api';
import { skipUnlessClientFeature } from '../utils/feature-gate-util';
import {
  loginAsAdmin,
  loginAsCreatedAccount,
  logout,
  modifyConfigToml,
  webServerEndpoint,
  webuiEndpoint,
} from '../utils/test-util';
import { navigateToUsersPage } from '../utils/user-profile-util';
import test, {
  expect,
  request as apiRequest,
  type APIRequestContext,
  type Page,
} from '@playwright/test';
import { randomBytes } from 'crypto';

// The webserver blocks a login identifier after repeated failures (10 on the
// nightly cluster); `adminUnblockUser` (manager >= 26.4.2) clears it.
const LOGIN_BLOCK_FAILURE_ATTEMPTS = 12;

async function blockLoginWithWrongPasswords(email: string): Promise<void> {
  const client = await apiRequest.newContext({ baseURL: webServerEndpoint });
  try {
    for (let i = 0; i < LOGIN_BLOCK_FAILURE_ATTEMPTS; i++) {
      const res = await client.post('/server/login', {
        data: { username: email, password: 'definitely-wrong-password' },
      });
      if (res.status() === 429) return;
    }
    throw new Error(
      `login for ${email} was not blocked after ${LOGIN_BLOCK_FAILURE_ATTEMPTS} failures`,
    );
  } finally {
    await client.dispose();
  }
}

async function submitLoginForm(
  page: Page,
  request: APIRequestContext,
  email: string,
  password: string,
): Promise<void> {
  await modifyConfigToml(page, request, {
    general: {
      connectionMode: 'SESSION',
      apiEndpoint: '',
      apiEndpointText: '',
    },
  });
  await page.goto(webuiEndpoint);
  await page.getByLabel('Email or Username').fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  const endpointInput = page.getByRole('textbox', {
    name: 'Endpoint',
    exact: true,
  });
  if (!(await endpointInput.isVisible({ timeout: 500 }).catch(() => false))) {
    await page.getByText('Advanced').click();
  }
  await endpointInput.fill(webServerEndpoint);
  await page.getByRole('button', { name: 'Login', exact: true }).click();
}

// The list shows 10 rows per page, so narrow it to the target email first.
async function filterUsersByEmail(page: Page, email: string): Promise<void> {
  const searchBar = page.getByRole('combobox', { name: 'Search filters' });
  await searchBar.click();
  await page.getByRole('option', { name: 'Email', exact: true }).click();
  await page.getByRole('textbox', { name: 'Value' }).fill(email);
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  const typeahead = page.getByRole('listbox', { name: 'Search results' });
  if (await typeahead.isVisible({ timeout: 1000 }).catch(() => false)) {
    await searchBar.press('Escape');
    await expect(typeahead).toBeHidden({ timeout: 5000 });
  }
}

async function unblockLoginFromUserList(
  page: Page,
  email: string,
): Promise<void> {
  await skipUnlessClientFeature(
    page,
    'admin-unblock-user',
    "Unblock login requires the 'admin-unblock-user' capability (manager >= 26.4.2, FR-4131)",
  );
  await navigateToUsersPage(page);
  await filterUsersByEmail(page, email);
  const userRow = page.getByRole('row').filter({ hasText: email });
  await expect(userRow).toBeVisible({ timeout: 15000 });

  // `showInMenu: 'always'` keeps the action in the row's More actions menu.
  await userRow.hover();
  await userRow.getByRole('button', { name: 'More actions' }).click();
  await page.getByRole('menuitem', { name: 'Unblock login' }).click();

  // A menu action's popConfirm falls back to the app-shim modal.confirm.
  const confirmDialog = page.getByRole('alertdialog', {
    name: 'Clear the failed-login block for this user?',
  });
  await expect(confirmDialog).toBeVisible();
  await expect(confirmDialog.getByText(email)).toBeVisible();
  await confirmDialog
    .getByRole('button', { name: 'Unblock login', exact: true })
    .click();

  await expect(
    page
      .getByRole('region', { name: 'Notifications' })
      .getByText(
        'The login block has been cleared. The user can sign in again.',
      ),
  ).toBeVisible({ timeout: 10000 });
  await expect(confirmDialog).toBeHidden();
}

test.describe(
  'User login unblock',
  { tag: ['@regression', '@user', '@functional'] },
  () => {
    let api: APIRequestContext | null = null;
    let email: string;
    let password: string;

    test.beforeEach(async () => {
      const runId = `${Date.now().toString(36)}${randomBytes(3).toString('hex')}`;
      email = `e2e-unblock-${runId}@lablup.com`;
      password = `e2e-${randomBytes(12).toString('hex')}@Pw`;
      api = await createAdminApiContext();
      const created = await gqlAdmin<{
        create_user: { ok: boolean; msg: string };
      }>(
        api,
        `mutation($email: String!, $props: UserInput!) {
          create_user(email: $email, props: $props) { ok msg }
        }`,
        {
          email,
          props: {
            username: `e2e-unblock-${runId}`,
            password,
            need_password_change: false,
            domain_name: 'default',
            group_ids: [],
          },
        },
      );
      expect(created.create_user.ok, created.create_user.msg).toBe(true);
    });

    test.afterEach(async () => {
      if (!api) return;
      const adminApi = api;
      api = null;
      await purgeUserViaApi(adminApi, email).catch((error) =>
        console.warn(`could not purge ${email}:`, error),
      );
      await adminApi.dispose();
    });

    test("Admin can unblock a user's failed-login lock from the user list", async ({
      page,
      request,
    }) => {
      await blockLoginWithWrongPasswords(email);
      await loginAsAdmin(page, request);
      await unblockLoginFromUserList(page, email);
    });

    test('User can log in again after admin unblocks their failed-login lock', async ({
      page,
      request,
    }) => {
      await blockLoginWithWrongPasswords(email);

      // The correct password is refused while the block is in place.
      await submitLoginForm(page, request, email, password);
      await expect(
        page.getByRole('alert').getByText('Too many failed login attempts', {
          exact: true,
        }),
      ).toBeVisible({ timeout: 10000 });

      await loginAsAdmin(page, request);
      await unblockLoginFromUserList(page, email);

      await logout(page);
      await loginAsCreatedAccount(page, request, email, password);
      await expect(page.getByTestId('user-dropdown-button')).toBeVisible();
    });
  },
);
