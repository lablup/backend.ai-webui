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

// Keep serial: tests share the user created in the first test and the
// currentClientIp captured in the second; later tests depend on the IP
// allow-list state set by earlier ones, and the last test cleans up.
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
      test.setTimeout(90000);
      // 1. Login as admin
      await loginAsAdmin(page, request);

      // 2. Navigate directly to the Active users view and filter by this user's email
      // to reliably find the user regardless of table pagination.
      await navigateTo(page, 'credential');
      await expect(page.getByRole('tab', { name: 'Users' })).toBeVisible();
      await page.getByText('Active', { exact: true }).click();

      // Use the filter to search for this specific user's email.
      // BAIPropertyFilter renders Input.Search inside AutoComplete; in antd v6
      // the aria-label on Input.Search is dropped from the underlying input,
      // so target the input directly via the .ant-input-search wrapper.
      const filterValueInput = page
        .locator('.ant-input-search input[type="search"]')
        .first();
      await filterValueInput.fill(EMAIL);
      await page.getByRole('button', { name: 'search' }).click();

      // 3. Check if the user is in the Active list
      const userRow = page.getByRole('row').filter({ hasText: EMAIL });
      const isActive = await userRow
        .isVisible({ timeout: 5000 })
        .catch(() => false);

      if (isActive) {
        // 3a. Edit user to clear IP restrictions first (to avoid issues with deactivation)
        await clickRowAction(page, userRow, 'Edit');
        const editModal = UserSettingModal.forEdit(page);
        await editModal.waitForVisible();

        const modal = editModal.getModal();
        await removeAllIpTags(modal);
        await editModal.clickOk();
        await editModal.waitForHidden();

        // 3b. Deactivate the user — confirm the Popconfirm that appears
        await expect(userRow).toBeVisible();
        await clickRowAction(page, userRow, 'Deactivate');
        const deactivatePopconfirm = page.locator('.ant-popconfirm');
        await expect(deactivatePopconfirm).toBeVisible({ timeout: 5000 });
        await deactivatePopconfirm
          .getByRole('button', { name: 'Deactivate' })
          .click();
        await expect(userRow).toBeHidden({ timeout: 10000 });
      }

      // 4. Switch to Inactive and purge the user.
      // Click the Inactive radio (URL param is `activeType`, not `status`,
      // so a query-string navigate won't toggle the view).
      await page.getByText('Inactive', { exact: true }).click();
      await expect(page.getByRole('tab', { name: 'Users' })).toBeVisible();

      // Apply the same email filter on the Inactive tab
      const inactiveFilterInput = page
        .locator('.ant-input-search input[type="search"]')
        .first();
      await inactiveFilterInput.fill(EMAIL);
      await page.getByRole('button', { name: 'search' }).click();

      // Wait for the filtered Inactive table to load and show this specific user
      await expect(page.getByRole('cell', { name: EMAIL })).toBeVisible({
        timeout: 15000,
      });

      const inactiveUserRow = page.getByRole('row').filter({ hasText: EMAIL });
      await inactiveUserRow.getByRole('checkbox').click();
      // Wait for the selection action bar to appear, then click the purge button.
      // The purge button uses DeleteFilled icon (accessible name "delete").
      // Scope to the first "delete" button (the header purge button); the row-level
      // per-row delete action also uses "delete" aria-label and would cause strict
      // mode violation if unscoped.
      await expect(page.getByText(/\d+ selected/)).toBeVisible({
        timeout: 5000,
      });
      await page.getByRole('button', { name: 'delete' }).first().click();

      const purgeModal = new PurgeUsersModal(page);
      await purgeModal.waitForVisible();
      await purgeModal.confirmDeletion();

      // 5. Verify user is deleted
      await expect(inactiveUserRow).toBeHidden({ timeout: 10000 });
    });
  },
);
