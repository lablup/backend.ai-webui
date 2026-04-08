import { PurgeUsersModal } from '../utils/classes/user/PurgeUsersModal';
import {
  KeyPairModal,
  UserSettingModal,
} from '../utils/classes/user/UserSettingModal';
import {
  loginAsAdmin,
  loginAsCreatedAccount,
  navigateTo,
} from '../utils/test-util';
import {
  clickRowAction,
  openProfileModal,
  getCurrentClientIp,
  addIpTags,
  removeAllIpTags,
  deriveDifferentIp,
} from '../utils/user-profile-util';
import test, { expect } from '@playwright/test';

// Generate unique identifiers for this test run
const TEST_RUN_ID = Date.now().toString(36);
const EMAIL = `e2e-ip-restrict-${TEST_RUN_ID}@lablup.com`;
const USERNAME = `e2e-ip-restrict-${TEST_RUN_ID}`;
const PASSWORD = 'testing@123';

test.describe.serial(
  'IP restriction enforcement during active session',
  { tag: ['@functional', '@regression', '@user-profile'] },
  () => {
    let currentClientIp: string;

    test('Admin can create a test user', async ({ page, request }) => {
      // 1. Login as admin
      await loginAsAdmin(page, request);

      // 2. Navigate to credential page
      await navigateTo(page, 'credential');
      await expect(page.getByRole('tab', { name: 'Users' })).toBeVisible();

      // 3. Create the test user
      await page.getByRole('button', { name: 'Create User' }).click();
      const userSettingModal = new UserSettingModal(page);
      await userSettingModal.createUser(EMAIL, USERNAME, PASSWORD);

      // 4. Handle the key pair modal
      const keyPairModal = new KeyPairModal(page);
      await keyPairModal.waitForVisible();
      await keyPairModal.close();
      await userSettingModal.waitForHidden();

      // 5. Verify user appears in Active users list
      await expect(page.getByRole('cell', { name: EMAIL })).toBeVisible({
        timeout: 10000,
      });
    });

    test('User can access pages when their current IP is in the allowed list', async ({
      browser,
    }) => {
      // Create a context for the test user
      const userContext = await browser.newContext();
      const userPage = await userContext.newPage();
      const userRequest = userContext.request;

      // 1. Login as the created user
      await loginAsCreatedAccount(userPage, userRequest, EMAIL, PASSWORD);

      // 2. Open profile modal and get the current client IP
      await openProfileModal(userPage);
      currentClientIp = await getCurrentClientIp(userPage);
      expect(currentClientIp).toBeTruthy();

      // Close profile modal
      await userPage
        .locator('.ant-modal')
        .getByRole('button', { name: 'Cancel' })
        .click();

      // 3. Now use admin to set allowed IP for this user to their current IP
      const adminContext = await browser.newContext();
      const adminPage = await adminContext.newPage();
      const adminRequest = adminContext.request;

      await loginAsAdmin(adminPage, adminRequest);
      await navigateTo(adminPage, 'credential');
      await expect(adminPage.getByRole('tab', { name: 'Users' })).toBeVisible();

      // Find and edit the test user
      const userRow = adminPage.getByRole('row').filter({ hasText: EMAIL });
      await expect(userRow).toBeVisible();
      await clickRowAction(adminPage, userRow, 'Edit');

      // Wait for edit modal
      const editModal = UserSettingModal.forEdit(adminPage);
      await editModal.waitForVisible();

      // Add the current client IP to allowed list
      const modal = editModal.getModal();
      await addIpTags(modal, [currentClientIp]);
      await editModal.clickOk();
      await editModal.waitForHidden();

      await adminContext.close();

      // 4. Verify user can still access pages normally
      await navigateTo(userPage, 'summary');
      await expect(userPage.getByTestId('user-dropdown-button')).toBeVisible({
        timeout: 15000,
      });

      // Navigate to another page to confirm access is working
      await navigateTo(userPage, 'job');
      await expect(userPage.getByTestId('user-dropdown-button')).toBeVisible({
        timeout: 15000,
      });

      await userContext.close();
    });

    test('User is denied access after admin revokes their IP and sets an arbitrary IP', async ({
      browser,
    }) => {
      // 1. Login as the test user in a fresh context
      const userContext = await browser.newContext();
      const userPage = await userContext.newPage();
      const userRequest = userContext.request;

      await loginAsCreatedAccount(userPage, userRequest, EMAIL, PASSWORD);

      // Verify user can navigate initially
      await navigateTo(userPage, 'summary');
      await expect(userPage.getByTestId('user-dropdown-button')).toBeVisible({
        timeout: 15000,
      });

      // 2. Admin revokes the user's current IP and sets an arbitrary one
      const adminContext = await browser.newContext();
      const adminPage = await adminContext.newPage();
      const adminRequest = adminContext.request;

      await loginAsAdmin(adminPage, adminRequest);
      await navigateTo(adminPage, 'credential');
      await expect(adminPage.getByRole('tab', { name: 'Users' })).toBeVisible();

      // Find and edit the test user
      const userRow = adminPage.getByRole('row').filter({ hasText: EMAIL });
      await expect(userRow).toBeVisible();
      await clickRowAction(adminPage, userRow, 'Edit');

      const editModal = UserSettingModal.forEdit(adminPage);
      await editModal.waitForVisible();

      // Remove existing IP tags and add an arbitrary IP
      const modal = editModal.getModal();
      await removeAllIpTags(modal);
      const arbitraryAllowedIp = deriveDifferentIp(currentClientIp);
      await addIpTags(modal, [arbitraryAllowedIp]);
      await editModal.clickOk();
      await editModal.waitForHidden();

      await adminContext.close();

      // 3. Verify user is denied access when navigating
      // After admin changed allowed IP, navigating should trigger an IP check
      await navigateTo(userPage, 'job');

      // The user should see either:
      // - A login page (redirected due to unauthorized)
      // - An error notification about IP restriction
      // - The user dropdown is no longer visible (logged out)
      // We check for the login form or an error indicator
      await expect(
        userPage
          .getByLabel('Email or Username')
          .or(userPage.getByText(/Unauthorized/i))
          .or(userPage.getByText(/allowed/i))
          .or(userPage.getByText(/restricted/i))
          .or(userPage.getByText(/blocked/i)),
      ).toBeVisible({ timeout: 30000 });

      await userContext.close();
    });

    test('Admin can clean up: remove IP restriction and delete test user', async ({
      page,
      request,
    }) => {
      test.setTimeout(60000);
      // 1. Login as admin
      await loginAsAdmin(page, request);

      // 2. Navigate to credential page
      await navigateTo(page, 'credential');
      await expect(page.getByRole('tab', { name: 'Users' })).toBeVisible();

      // 3. Edit user to clear IP restrictions first (to avoid issues with deactivation)
      const userRow = page.getByRole('row').filter({ hasText: EMAIL });
      const isActive = await userRow
        .isVisible({ timeout: 2000 })
        .catch(() => false);

      if (isActive) {
        await clickRowAction(page, userRow, 'Edit');
        const editModal = UserSettingModal.forEdit(page);
        await editModal.waitForVisible();

        const modal = editModal.getModal();
        await removeAllIpTags(modal);
        await editModal.clickOk();
        await editModal.waitForHidden();

        // 4. Deactivate the user (no popconfirm — mutation fires directly)
        await expect(userRow).toBeVisible();
        await clickRowAction(page, userRow, 'Deactivate');
        await expect(userRow).toBeHidden({ timeout: 10000 });
      }

      // 5. Switch to Inactive and purge the user
      // Re-navigate to credential page to clear any stale state
      await navigateTo(page, 'credential');
      await expect(page.getByRole('tab', { name: 'Users' })).toBeVisible();
      await page.getByText('Inactive', { exact: true }).click();
      const inactiveUserRow = page.getByRole('row').filter({ hasText: EMAIL });
      await expect(inactiveUserRow).toBeVisible({ timeout: 10000 });

      // Use dispatchEvent to bypass DOM detachment during table re-renders
      await inactiveUserRow.getByRole('checkbox').dispatchEvent('click');
      await page.getByRole('button', { name: 'trash bin' }).click();

      const purgeModal = new PurgeUsersModal(page);
      await purgeModal.waitForVisible();
      await purgeModal.confirmDeletion();

      // 6. Verify user is deleted
      await expect(inactiveUserRow).toBeHidden({ timeout: 10000 });
    });
  },
);
