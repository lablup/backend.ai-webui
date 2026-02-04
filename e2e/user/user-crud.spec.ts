// spec: e2e/credential/user_crud.test-plan.md
import { PurgeUsersModal } from '../utils/classes/user/PurgeUsersModal';
import {
  KeyPairModal,
  UserInfoModal,
  UserSettingModal,
} from '../utils/classes/user/UserSettingModal';
import {
  loginAsAdmin,
  loginAsCreatedAccount,
  logout,
  navigateTo,
  webServerEndpoint,
  webuiEndpoint,
} from '../utils/test-util';
import test, { expect } from '@playwright/test';

// Generate unique identifiers for this test run to avoid conflicts
const TEST_RUN_ID = Date.now().toString(36);
const EMAIL = `e2e-test-user-${TEST_RUN_ID}@lablup.com`;
const USERNAME = `e2e-test-user-${TEST_RUN_ID}`;
const PASSWORD = 'testing@123';
const NEW_PASSWORD = 'new-password@123';
const MODIFIED_USERNAME = `modified-e2e-user-${TEST_RUN_ID}`;

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
        // Deactivate the user
        await userRow.getByRole('button', { name: 'Deactivate' }).click();
        const popconfirm = page.locator('.ant-popconfirm');
        await popconfirm.getByRole('button', { name: 'Deactivate' }).click();
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
        await page.getByRole('button', { name: 'trash bin' }).click();

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
      await navigateTo(page, 'credential');

      // 3. Wait for Users tab to be visible
      await expect(page.getByRole('tab', { name: 'Users' })).toBeVisible();

      // 4. Clean up any existing test user from previous runs
      await cleanupTestUser(page);

      // 5. Click "Create User" button
      await page.getByRole('button', { name: 'Create User' }).click();

      // 6. Create user using the modal class
      const userSettingModal = new UserSettingModal(page);
      await userSettingModal.createUser(EMAIL, USERNAME, PASSWORD);

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
      await navigateTo(page, 'credential');

      // 3. Locate the user in the table
      const userRow = page.getByRole('row').filter({ hasText: EMAIL });
      await expect(userRow).toBeVisible();

      // 4. Click the Edit button to open the modify modal
      await userRow.getByRole('button', { name: 'Edit' }).click();

      // 5. Update user name and password using the modal class
      const editModal = UserSettingModal.forEdit(page);
      await editModal.waitForVisible();
      await editModal.fillUserName(MODIFIED_USERNAME);
      await editModal.fillNewPasswords(NEW_PASSWORD);
      await editModal.clickOk();

      // 6. Wait for modal to close
      await editModal.waitForHidden();

      // 7. Verify success by checking user info
      await userRow.getByRole('button', { name: 'info-circle' }).click();
      const userInfoModal = new UserInfoModal(page);
      await userInfoModal.waitForVisible();
      await userInfoModal.verifyUserName(MODIFIED_USERNAME);
      await userInfoModal.close();

      // 8. Verify the new password works by logging in
      await logout(page);
      await loginAsCreatedAccount(page, request, EMAIL, NEW_PASSWORD);
      await expect(page.getByTestId('user-dropdown-button')).toBeVisible();
    });

    test('Admin can deactivate a user', async ({ page, request }) => {
      // 1. Login as admin
      await loginAsAdmin(page, request);

      // 2. Navigate to credential page
      await navigateTo(page, 'credential');

      // 3. Ensure "Active" filter is selected (should be default)
      const activeRadio = page.getByRole('radio', {
        name: 'Active',
        exact: true,
      });
      await expect(activeRadio).toBeChecked();

      // 4. Locate the user to deactivate in the table
      const userRow = page.getByRole('row').filter({ hasText: EMAIL });
      await expect(userRow).toBeVisible();

      // 5. Click the "Deactivate" button (Ban icon) in the Control column
      await userRow.getByRole('button', { name: 'Deactivate' }).click();

      // 6. Verify popconfirm dialog appears
      const popconfirm = page.locator('.ant-popconfirm');
      await expect(popconfirm.getByText('Deactivate User')).toBeVisible();

      // 7. Confirm deactivation
      await popconfirm.getByRole('button', { name: 'Deactivate' }).click();

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
      await navigateTo(page, 'credential');

      // 3. Switch to "Inactive" filter
      await page.getByText('Inactive', { exact: true }).click();

      // 4. Locate the inactive user in the table
      const userRow = page.getByRole('row').filter({ hasText: EMAIL });
      await expect(userRow).toBeVisible();

      // 5. Click the "Activate" button (Undo icon) in the Control column
      await userRow.getByRole('button', { name: 'Activate' }).click();

      // 6. Verify popconfirm dialog appears
      const popconfirm = page.locator('.ant-popconfirm');
      await expect(popconfirm.getByText('Activate User')).toBeVisible();

      // 7. Confirm activation
      await popconfirm.getByRole('button', { name: 'Activate' }).click();

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
      await navigateTo(page, 'credential');

      // 3. Deactivate the user first (required before purging)
      const userRow = page.getByRole('row').filter({ hasText: EMAIL });
      await expect(userRow).toBeVisible();
      await userRow.getByRole('button', { name: 'Deactivate' }).click();
      const popconfirm = page.locator('.ant-popconfirm');
      await popconfirm.getByRole('button', { name: 'Deactivate' }).click();
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

      // 8. Click the trash bin button to open purge modal
      await page.getByRole('button', { name: 'trash bin' }).click();

      // 9. Use PurgeUsersModal class to handle the deletion
      const purgeModal = new PurgeUsersModal(page);
      await purgeModal.waitForVisible();

      // 10. Verify modal shows the user email
      await purgeModal.verifyUserEmailDisplayed(EMAIL);

      // 11. Confirm the deletion
      await purgeModal.confirmDeletion();

      // 12. Verify success message appears
      await expect(
        page.getByText(/Permanently deleted \d+ out of \d+ users/),
      ).toBeVisible({ timeout: 10000 });

      // 13. Verify user completely disappears from inactive users list
      await expect(page.getByRole('row').filter({ hasText: EMAIL })).toBeHidden(
        {
          timeout: 10000,
        },
      );
    });

    test('Deleted user cannot log in', async ({ page }) => {
      // 1. Attempt to login as the deleted user
      await page.goto(webuiEndpoint);
      await page.getByLabel('Email or Username').fill(EMAIL);
      await page.getByRole('textbox', { name: 'Password' }).fill(NEW_PASSWORD);
      await page
        .getByRole('textbox', { name: 'Endpoint' })
        .fill(webServerEndpoint);
      await page.getByLabel('Login', { exact: true }).click();

      // 2. Verify "Login information mismatch" error notification appears
      await expect(
        page.getByRole('alert').getByText('Login information mismatch'),
      ).toBeVisible({ timeout: 10000 });

      // 3. Verify user is still on login page
      await expect(page.getByLabel('Email or Username')).toBeVisible();
    });
  },
);
