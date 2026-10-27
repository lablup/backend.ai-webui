// spec: e2e/credential/user_crud.test-plan.md
import {
  createAdminApiContext,
  gqlAdmin,
  purgeUserViaApi,
} from '../utils/admin-api';
import { PurgeUsersModal } from '../utils/classes/user/PurgeUsersModal';
import {
  KeyPairModal,
  UserInfoModal,
  UserSettingModal,
} from '../utils/classes/user/UserSettingModal';
import { getE2EDomainName } from '../utils/e2e-scope';
import {
  loginAsAdmin,
  loginAsCreatedAccount,
  logout,
  modifyConfigToml,
  navigateTo,
  webServerEndpoint,
  webuiEndpoint,
} from '../utils/test-util';
import {
  clickRowAction,
  createUserMoreButton,
  navigateToUsersPage,
} from '../utils/user-profile-util';
import test, {
  APIRequestContext,
  expect,
  Locator,
  Page,
} from '@playwright/test';
import { randomBytes } from 'crypto';

// FR-3331/FR-3339 (PRs #8303/#8315) renamed the User Setting modal's submit
// button from "OK" to "Create" (create mode) / "Save" (edit mode).
// UserSettingModal.getOkButton()/clickOk() still target the stale "OK" name
// (a fix is pending in another in-flight PR touching that shared page
// object), so this spec clicks the modal's submit button directly instead of
// going through clickOk()/createUser().
async function submitUserSettingModal(
  modal: UserSettingModal,
  label: 'Create' | 'Save',
): Promise<void> {
  await modal
    .getModal()
    .getByRole('button', { name: label, exact: true })
    .click();
}

// Generate unique identifiers for this test run to avoid conflicts
const TEST_RUN_ID = Date.now().toString(36);
const EMAIL = `e2e-test-user-${TEST_RUN_ID}@lablup.com`;
const USERNAME = `e2e-test-user-${TEST_RUN_ID}`;
const PASSWORD = 'testing@123';
const NEW_PASSWORD = 'new-password@123';
const MODIFIED_USERNAME = `modified-e2e-user-${TEST_RUN_ID}`;

// Keep serial: lifecycle chain on a single user (EMAIL) — create → update
// password → deactivate → reactivate → purge → login-denied all carry the
// user's credentials and active/inactive state forward between tests.
test.describe.serial(
  'User CRUD',
  { tag: ['@critical', '@user', '@functional'] },
  () => {
    // Cleanup function to delete the test user if it exists
    async function cleanupTestUser(page: any) {
      // Check if user exists in Active users
      const userRow = page.getByRole('row').filter({ hasText: EMAIL });
      const isVisible = await userRow
        .isVisible({ timeout: 2000 })
        .catch(() => false);

      if (isVisible) {
        // Deactivate the user.
        // The Deactivate action uses a lucide BanIcon which has no accessible name,
        // so we target it by its position (3rd button) in the actions area.
        // Hover first so that hover-only action cells reveal their buttons.
        await userRow.hover();
        await userRow
          .locator('.bai-name-action-cell-actions button')
          .nth(2)
          .click();
        // BAINameActionCell's popConfirm renders as an Astryx Popover with
        // role="dialog", labeled by the action's title ("Deactivate"), not
        // the confirm copy inside it ("Deactivate user").
        const popconfirm = page.getByRole('dialog', { name: 'Deactivate' });
        await popconfirm
          .getByRole('button', { name: 'Deactivate', exact: true })
          .click();
        // Wait for user to disappear from the Active list
        await expect(userRow).toBeHidden({ timeout: 10000 });
      }

      // Switch to Inactive filter and check if user exists there
      await page.getByText('Inactive', { exact: true }).click();
      const inactiveUserRow = page.getByRole('row').filter({ hasText: EMAIL });
      const isInactiveVisible = await inactiveUserRow
        .isVisible({ timeout: 2000 })
        .catch(() => false);

      if (isInactiveVisible) {
        // Permanently delete the user
        await inactiveUserRow.getByRole('checkbox').click();
        // The purge button uses <DeleteFilled /> icon whose aria-label is "delete".
        // Use .first() to target the selection-area bulk delete button.
        await page.getByRole('button', { name: 'delete' }).first().click();

        const purgeModal = new PurgeUsersModal(page);
        await purgeModal.waitForVisible();
        await purgeModal.confirmDeletion();

        // Wait for user to disappear from the list after deletion
        await expect(inactiveUserRow).toBeHidden({ timeout: 10000 });
      }

      // Return to Active filter
      await page.getByText('Active', { exact: true }).click();
    }

    test('Admin can create a new user', async ({ page, request }) => {
      // 1. Login as admin
      await loginAsAdmin(page, request);

      // 2. Navigate to credential page
      await navigateToUsersPage(page);

      // 4. Clean up any existing test user from previous runs
      await cleanupTestUser(page);

      // 5. Click "Create User" button
      await page.getByRole('button', { name: 'Create User' }).click();

      // 6. Create user using the modal class
      const userSettingModal = new UserSettingModal(page);
      await userSettingModal.waitForVisible();
      await userSettingModal.fillRequiredFields(EMAIL, USERNAME, PASSWORD);
      await submitUserSettingModal(userSettingModal, 'Create');

      // 7. Handle the key pair modal that appears after user creation
      const keyPairModal = new KeyPairModal(page);
      await keyPairModal.waitForVisible();
      await keyPairModal.close();

      // 8. Verify user setting modal is also closed
      await userSettingModal.waitForHidden();

      // 9. Verify new user appears in the Active users list
      await expect(page.getByRole('cell', { name: EMAIL })).toBeVisible({
        timeout: 10000,
      });

      // 10. Logout and login as the created user to verify account works
      await logout(page);
      await loginAsCreatedAccount(page, request, EMAIL, PASSWORD);

      // 11. Verify login was successful by checking user dropdown is visible
      await expect(page.getByTestId('user-dropdown-button')).toBeVisible();
    });

    test('Admin can update user information (password change)', async ({
      page,
      request,
    }) => {
      // 1. Login as admin
      await loginAsAdmin(page, request);

      // 2. Navigate to credential page
      await navigateToUsersPage(page);

      // 4. Locate the user in the table
      const userRow = page.getByRole('row').filter({ hasText: EMAIL });
      await expect(userRow).toBeVisible();

      // 5. Click the Edit button to open the modify modal.
      // The edit action is the 2nd button (index 1) in the action cell.
      // Hover first so that hover-only action cells reveal their buttons.
      await userRow.hover();
      await userRow
        .locator('.bai-name-action-cell-actions button')
        .nth(1)
        .click();

      // 6. Update user name and password.
      // FR-3339 renamed this dialog from "Modify User Detail" to "Edit User
      // Detail" as part of unifying edit terminology across the app.
      // UserSettingModal.forEdit() still targets the stale dialog name (a fix
      // is pending in another in-flight PR touching that shared page
      // object), so this test locates the dialog directly instead.
      const editDialog = page.getByRole('dialog', { name: 'Edit User Detail' });
      await expect(editDialog).toBeVisible();
      const editUserNameInput = editDialog.getByLabel('User Name');
      await editUserNameInput.fill(MODIFIED_USERNAME);
      await expect(editUserNameInput).toHaveValue(MODIFIED_USERNAME);
      await editDialog.getByLabel(/^New Password/).fill(NEW_PASSWORD);
      await editDialog.getByLabel(/^New password \(again\)/).fill(NEW_PASSWORD);
      await editDialog.getByRole('button', { name: 'Save' }).click();

      // 7. Wait for modal to close
      await expect(editDialog).toBeHidden({ timeout: 10000 });

      // 8. Verify success by checking user info.
      // The info button is the 1st button (index 0) in the action cell.
      // Hover first so that hover-only action cells reveal their buttons.
      await userRow.hover();
      await userRow
        .locator('.bai-name-action-cell-actions button')
        .nth(0)
        .click();
      const userInfoModal = new UserInfoModal(page);
      await userInfoModal.waitForVisible();
      await userInfoModal.verifyUserName(MODIFIED_USERNAME);
      await userInfoModal.close();

      // 9. Verify the new password works by logging in
      await logout(page);
      await loginAsCreatedAccount(page, request, EMAIL, NEW_PASSWORD);
      await expect(page.getByTestId('user-dropdown-button')).toBeVisible();
    });

    test('Admin can deactivate a user', async ({ page, request }) => {
      // 1. Login as admin
      await loginAsAdmin(page, request);

      // 2. Navigate to credential page
      await navigateToUsersPage(page);
      await page.getByText('Active', { exact: true }).click();

      // 4. Locate the user to deactivate in the table
      const userRow = page.getByRole('row').filter({ hasText: EMAIL });
      await expect(userRow).toBeVisible();

      // 5. Click the "Deactivate" button (Ban icon) in the Control column.
      // The Deactivate action uses a lucide BanIcon which has no accessible name,
      // so we target it by its position (3rd button) in the actions area.
      // Hover first so that hover-only action cells reveal their buttons.
      await userRow.hover();
      await userRow
        .locator('.bai-name-action-cell-actions button')
        .nth(2)
        .click();

      // 6. Verify popconfirm dialog appears. BAINameActionCell's popConfirm
      // renders as an Astryx Popover with role="dialog", labeled by the
      // action's title ("Deactivate") — not the antd `.ant-popconfirm` class.
      const popconfirm = page.getByRole('dialog', { name: 'Deactivate' });
      await expect(popconfirm).toBeVisible();

      // 7. Confirm deactivation
      await popconfirm
        .getByRole('button', { name: 'Deactivate', exact: true })
        .click();

      // 8. Verify user disappears from Active users list
      await expect(page.getByRole('row').filter({ hasText: EMAIL })).toBeHidden(
        {
          timeout: 10000,
        },
      );

      // 10. Switch to "Inactive" filter and verify the deactivated user appears there
      await page.getByText('Inactive', { exact: true }).click();
      await expect(page.getByRole('cell', { name: EMAIL })).toBeVisible({
        timeout: 10000,
      });
    });

    test('Admin can reactivate an inactive user', async ({ page, request }) => {
      // 1. Login as admin
      await loginAsAdmin(page, request);

      // 2. Navigate to credential page
      await navigateToUsersPage(page);

      // 3. Switch to "Inactive" filter
      await page.getByText('Inactive', { exact: true }).click();

      // 4. Locate the inactive user in the table
      const userRow = page.getByRole('row').filter({ hasText: EMAIL });
      await expect(userRow).toBeVisible();

      // 5. Click the "Activate" button (Undo icon) in the Control column.
      // The Activate action uses a lucide UndoIcon which has no accessible name,
      // so we target it by its position (3rd button) in the actions area.
      // Hover first so that hover-only action cells reveal their buttons.
      await userRow.hover();
      await userRow
        .locator('.bai-name-action-cell-actions button')
        .nth(2)
        .click();

      // 6. Verify popconfirm dialog appears (Astryx Popover, role="dialog").
      const popconfirm = page.getByRole('dialog', { name: 'Activate' });
      await expect(popconfirm).toBeVisible();

      // 7. Confirm activation
      await popconfirm
        .getByRole('button', { name: 'Activate', exact: true })
        .click();

      // 8. Verify user disappears from Inactive users list
      await expect(page.getByRole('row').filter({ hasText: EMAIL })).toBeHidden(
        {
          timeout: 10000,
        },
      );

      // 10. Switch to "Active" filter and verify the activated user appears there
      await page.getByText('Active', { exact: true }).click();
      await expect(page.getByRole('cell', { name: EMAIL })).toBeVisible({
        timeout: 10000,
      });

      // 11. Verify the reactivated user can log in
      await logout(page);
      await loginAsCreatedAccount(page, request, EMAIL, NEW_PASSWORD);
      await expect(page.getByTestId('user-dropdown-button')).toBeVisible();
    });

    test('Admin can deactivate and permanently delete (purge) a user', async ({
      page,
      request,
    }) => {
      // 1. Login as admin
      await loginAsAdmin(page, request);

      // 2. Navigate to credential page
      await navigateToUsersPage(page);

      // 3. Deactivate the user first (required before purging).
      // The Deactivate action uses a lucide BanIcon which has no accessible name,
      // so we target it by its position (3rd button) in the actions area.
      // Hover first so that hover-only action cells reveal their buttons.
      const userRow = page.getByRole('row').filter({ hasText: EMAIL });
      await expect(userRow).toBeVisible();
      await userRow.hover();
      await userRow
        .locator('.bai-name-action-cell-actions button')
        .nth(2)
        .click();
      const popconfirm = page.getByRole('dialog', { name: 'Deactivate' });
      await popconfirm
        .getByRole('button', { name: 'Deactivate', exact: true })
        .click();
      // Wait for user to disappear from Active list before switching filters
      await expect(userRow).toBeHidden({ timeout: 10000 });

      // 4. Switch to "Inactive" filter
      await page.getByText('Inactive', { exact: true }).click();

      // 5. Wait for the inactive users list to load
      await expect(page.getByRole('cell', { name: EMAIL })).toBeVisible({
        timeout: 10000,
      });

      // 6. Select the user by clicking its checkbox
      const inactiveUserRow = page.getByRole('row').filter({ hasText: EMAIL });
      await inactiveUserRow.getByRole('checkbox').click();

      // 7. Verify selection count appears
      await expect(page.getByText('1 selected')).toBeVisible();

      // 8. Click the bulk-delete (purge selected) button to open purge modal.
      // The purge button uses <DeleteFilled /> icon whose aria-label is "delete".
      // Use .first() to target the selection-area bulk delete button, not row-level purge buttons.
      await page.getByRole('button', { name: 'delete' }).first().click();

      // 9. Use PurgeUsersModal class to handle the deletion
      const purgeModal = new PurgeUsersModal(page);
      await purgeModal.waitForVisible();

      // 10. Confirm the deletion
      // Note: BAIDeleteConfirmModal only shows the item list when deleting >1 items,
      // so we cannot verify the email directly in the modal for a single-user deletion.
      await purgeModal.confirmDeletion();

      // 12. Verify success message appears. The toast text is rendered twice
      // (notification stack + screen-reader announcer), so scope to the stack.
      await expect(
        page
          .getByRole('region', { name: 'Notifications' })
          .getByText(/Permanently deleted \d+ out of \d+ users/),
      ).toBeVisible({ timeout: 10000 });

      // 13. Verify user completely disappears from inactive users list
      await expect(page.getByRole('row').filter({ hasText: EMAIL })).toBeHidden(
        {
          timeout: 10000,
        },
      );
    });

    test('Deleted user cannot log in', async ({ page, request }) => {
      // 1. Modify config.toml to enable session-based login with manual endpoint input
      await modifyConfigToml(page, request, {
        general: {
          connectionMode: 'SESSION',
          apiEndpoint: '',
          apiEndpointText: '',
        },
      });

      // 2. Attempt to login as the deleted user
      await page.goto(webuiEndpoint);
      await page.getByLabel('Email or Username').fill(EMAIL);
      await page.getByRole('textbox', { name: 'Password' }).fill(NEW_PASSWORD);
      // The endpoint input is collapsed under "Advanced" on the login form.
      const endpointInput = page.getByRole('textbox', {
        name: 'Endpoint',
        exact: true,
      });
      if (!(await endpointInput.isVisible())) {
        await page.getByText('Advanced').click();
      }
      await endpointInput.fill(webServerEndpoint);
      await page.getByRole('button', { name: 'Login', exact: true }).click();

      // 3. Verify "Login information mismatch" error notification appears
      await expect(
        page.getByRole('alert').getByText('Login information mismatch'),
      ).toBeVisible({ timeout: 10000 });

      // 4. Verify user is still on login page
      await expect(page.getByLabel('Email or Username')).toBeVisible();
    });
  },
);

/** `26.9.0a4` → comparable tuple; a release sorts after its rc/b/a builds. */
function parseManagerVersion(version: string): Array<number> {
  const m = version.match(/^v?(\d+)\.(\d+)\.(\d+)(?:(a|b|rc)(\d+))?/);
  if (!m) return [0, 0, 0, 0, 0];
  const stage = { a: 0, b: 1, rc: 2 }[m[4] ?? ''] ?? 3;
  return [+m[1], +m[2], +m[3], stage, +(m[5] ?? 0)];
}

function isVersionAtLeast(version: string, floor: string): boolean {
  const a = parseManagerVersion(version);
  const b = parseManagerVersion(floor);
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return a[i] > b[i];
  }
  return true;
}

type UserListOperation = { errors?: unknown; count?: number | null };

/** Records every `AdminUserManagementQuery` response the page receives. */
function recordUserListResponses(page: Page): Array<UserListOperation> {
  const operations: Array<UserListOperation> = [];
  page.on('response', async (response) => {
    const req = response.request();
    if (req.method() !== 'POST' || !req.url().includes('/admin/gql')) return;
    let query: string | undefined;
    try {
      query = req.postDataJSON()?.query;
    } catch {
      return;
    }
    if (!query?.match(/query\s+AdminUserManagementQuery\b/)) return;
    const body = await response.json().catch(() => null);
    operations.push({
      errors: body?.errors,
      count: body?.data?.scopedUsersV2?.count,
    });
  });
  return operations;
}

/**
 * Asserts a BAINameActionCell row offers each named action, either as an
 * inline button or as an item of the row's "More actions" menu, and that
 * every `menuOnly` action sits in that menu.
 */
async function expectRowActions(
  page: Page,
  row: Locator,
  actions: Array<string>,
  menuOnly: Array<string> = [],
) {
  await row.hover();
  const moreButton = row.getByRole('button', { name: 'More actions' });
  const menu = page.getByRole('menu');
  if (menuOnly.length > 0) {
    await expect(moreButton).toBeVisible({ timeout: 10000 });
  }
  if ((await moreButton.count()) > 0) {
    await moreButton.click();
    await expect(menu.getByRole('menuitem').first()).toBeVisible();
  }
  for (const name of actions) {
    const action = row
      .getByRole('button', { name, exact: true })
      .or(menu.getByRole('menuitem', { name, exact: true }));
    await expect(action, `row action "${name}"`).toBeVisible();
    await expect(action, `row action "${name}"`).toBeEnabled();
  }
  for (const name of menuOnly) {
    const item = menu.getByRole('menuitem', { name, exact: true });
    await expect(item, `"More actions" item "${name}"`).toBeVisible();
    await expect(item, `"More actions" item "${name}"`).toBeEnabled();
  }
  if ((await moreButton.count()) > 0) {
    await page.keyboard.press('Escape');
    await expect(menu).toHaveCount(0);
  }
}

// #10310: the Users tab reads scopedUsersV2 (ADR 0012) and keeps the user and
// keypair management actions for superadmins. Signs in as the e2e superadmin.
test.describe(
  'User list - Superadmin',
  { tag: ['@regression', '@user', '@functional', '@requires-manager-v26.9'] },
  () => {
    let api: APIRequestContext | null = null;
    let inactiveEmail: string | null = null;

    test.beforeEach(async () => {
      api = await createAdminApiContext();
      // Gate before any setup: scopedUsersV2 needs 26.9.0a4.
      const info = await (await api.get('/func/')).json().catch(() => ({}));
      test.skip(
        !isVersionAtLeast(String(info?.manager ?? ''), '26.9.0a4'),
        'scopedUsersV2 needs a Backend.AI manager >= 26.9.0a4 (#10302)',
      );

      // An inactive row, the only kind that offers Permanently Delete.
      const runId = `${Date.now().toString(36)}${randomBytes(3).toString('hex')}`;
      const email = `e2e-superadmin-inactive-${runId}@lablup.com`;
      const domainName = await getE2EDomainName(api);
      const { create_user } = await gqlAdmin<{
        create_user: { ok: boolean; msg: string };
      }>(
        api,
        `mutation($email: String!, $props: UserInput!) {
          create_user(email: $email, props: $props) { ok msg }
        }`,
        {
          email,
          props: {
            username: email.split('@')[0],
            password: `e2e-${randomBytes(12).toString('hex')}@Pw`,
            need_password_change: false,
            domain_name: domainName,
            is_active: false,
            status: 'inactive',
          },
        },
      );
      expect(create_user.ok, create_user.msg).toBe(true);
      inactiveEmail = email;
    });

    test.afterEach(async () => {
      if (!api) return;
      const adminApi = api;
      api = null;
      try {
        if (inactiveEmail) {
          await purgeUserViaApi(adminApi, inactiveEmail).catch((error) =>
            console.warn(`could not purge ${inactiveEmail}:`, error),
          );
        }
      } finally {
        inactiveEmail = null;
        await adminApi.dispose();
      }
    });

    test('Superadmin can view the domain user list with user management actions', async ({
      page,
      request,
    }) => {
      const operations = recordUserListResponses(page);
      await loginAsAdmin(page, request);

      await navigateToUsersPage(page);

      const firstRow = page
        .getByRole('row')
        .filter({ has: page.getByRole('cell', { name: /@/ }) })
        .first();
      await expect(firstRow).toBeVisible({ timeout: 20000 });
      await expect.poll(() => operations.length).toBeGreaterThan(0);
      for (const op of operations) {
        expect(op.errors).toBeUndefined();
      }
      expect(operations.at(-1)?.count ?? 0).toBeGreaterThan(0);

      // Create User and its More group (Bulk Create / CSV import).
      const createUserGroup = page.getByRole('group', { name: 'Create User' });
      const createUserButton = createUserGroup.getByRole('button', {
        name: 'Create User',
        exact: true,
      });
      await expect(createUserButton).toBeVisible();
      await expect(createUserButton).toBeEnabled();
      await createUserMoreButton(page).click();
      for (const name of ['Bulk Create Users', 'Bulk Create Users from CSV']) {
        const item = page.getByRole('menuitem', { name, exact: true });
        await expect(item).toBeVisible();
        await expect(item).toBeEnabled();
      }
      await page.keyboard.press('Escape');
      await expect(page.getByRole('menu')).toHaveCount(0);

      // Active row: Edit, Deactivate and, in the More actions menu, Unblock login.
      await expectRowActions(
        page,
        firstRow,
        ['User Detail', 'Edit', 'Deactivate'],
        ['Unblock login'],
      );

      // Inactive row: Activate and Permanently Delete.
      await navigateTo(
        page,
        `credential?tab=users&status=INACTIVE&filter=${encodeURIComponent(
          JSON.stringify({ email: { equals: inactiveEmail } }),
        )}`,
      );
      await expect(
        page.getByRole('radio', { name: 'Inactive', exact: true }),
      ).toBeChecked({ timeout: 20000 });
      const inactiveRow = page
        .getByRole('row')
        .filter({ has: page.getByRole('cell', { name: inactiveEmail! }) });
      await expect(inactiveRow).toBeVisible({ timeout: 20000 });
      await expectRowActions(
        page,
        inactiveRow,
        ['User Detail', 'Edit', 'Activate', 'Permanently Delete'],
        ['Unblock login'],
      );

      await clickRowAction(page, inactiveRow, 'User Detail');
      const userInfoModal = new UserInfoModal(page);
      await userInfoModal.waitForVisible();
      await page.keyboard.press('Escape');
      await expect(userInfoModal.getModal()).toBeHidden();

      // Credentials tab: Create Credential and the keypair row actions.
      const credentialsTab = page
        .getByRole('navigation', { name: 'Tabs' })
        .getByRole('button', { name: 'Credentials' });
      await credentialsTab.click();
      await expect(credentialsTab).toHaveAttribute('aria-current', 'true');
      const addCredentialButton = page.getByRole('button', {
        name: 'Create Credential',
        exact: true,
      });
      await expect(addCredentialButton).toBeVisible({ timeout: 20000 });
      await expect(addCredentialButton).toBeEnabled();
      const credentialTable = page.locator('table').filter({
        has: page.getByRole('columnheader').filter({ hasText: 'Access Key' }),
      });
      const keypairRow = credentialTable.locator('tbody tr').first();
      await expect(keypairRow).toBeVisible({ timeout: 20000 });
      await expectRowActions(page, keypairRow, ['Info', 'Edit', 'Deactivate']);
    });
  },
);
