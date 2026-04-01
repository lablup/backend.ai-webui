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
import test, { expect, Page } from '@playwright/test';

// Generate unique identifiers for this test run
const TEST_RUN_ID = Date.now().toString(36);
const EMAIL = `e2e-ip-restrict-${TEST_RUN_ID}@lablup.com`;
const USERNAME = `e2e-ip-restrict-${TEST_RUN_ID}`;
const PASSWORD = 'testing@123';

/**
 * Opens the User Profile Setting Modal by clicking the user dropdown
 * and selecting the "My Account" menu item.
 */
async function openProfileModal(page: Page) {
  await page.getByTestId('user-dropdown-button').click();
  await page.getByText('My Account').click();
  await page.locator('.ant-modal').waitFor({ state: 'visible' });
}

/**
 * Reads the current client IP displayed in the modal's helper text.
 */
async function getCurrentClientIp(page: Page): Promise<string> {
  const ipText = await page.getByText(/Current client IP:/).textContent();
  const match = ipText?.match(/Current client IP:\s*(.+)/);
  return match?.[1]?.trim() ?? '';
}

/**
 * Adds IP tags to the Allowed Client IP select field within the admin edit modal.
 */
async function addIpTagsInModal(
  modal: ReturnType<Page['locator']>,
  ips: string[],
) {
  const formItem = modal
    .locator('.ant-form-item')
    .filter({ hasText: 'Allowed client IP' });
  const selectInput = formItem.getByRole('combobox');
  for (const ip of ips) {
    await selectInput.click();
    await selectInput.fill(ip);
    await selectInput.press('Enter');
  }
  await selectInput.press('Tab');
}

/**
 * Removes all IP tags from the Allowed Client IP select field within a modal.
 */
async function removeAllIpTagsInModal(modal: ReturnType<Page['locator']>) {
  const formItem = modal
    .locator('.ant-form-item')
    .filter({ hasText: 'Allowed client IP' });
  const removeButtons = formItem.locator('.ant-tag .anticon-close');
  const count = await removeButtons.count();
  for (let i = count - 1; i >= 0; i--) {
    await removeButtons.nth(i).click();
  }
}

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
      await userRow.getByRole('button', { name: 'Edit' }).click();

      // Wait for edit modal
      const editModal = UserSettingModal.forEdit(adminPage);
      await editModal.waitForVisible();

      // Add the current client IP to allowed list
      const modal = editModal.getModal();
      await addIpTagsInModal(modal, [currentClientIp]);
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
      await userRow.getByRole('button', { name: 'Edit' }).click();

      const editModal = UserSettingModal.forEdit(adminPage);
      await editModal.waitForVisible();

      // Remove existing IP tags and add an arbitrary IP
      const modal = editModal.getModal();
      await removeAllIpTagsInModal(modal);
      await addIpTagsInModal(modal, ['99.99.99.99']);
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
        await userRow.getByRole('button', { name: 'Edit' }).click();
        const editModal = UserSettingModal.forEdit(page);
        await editModal.waitForVisible();

        const modal = editModal.getModal();
        await removeAllIpTagsInModal(modal);
        await editModal.clickOk();
        await editModal.waitForHidden();

        // 4. Deactivate the user
        await expect(userRow).toBeVisible();
        await userRow.getByRole('button', { name: 'Deactivate' }).click();
        const popconfirm = page.locator('.ant-popconfirm');
        await popconfirm.getByRole('button', { name: 'Deactivate' }).click();
        await expect(userRow).toBeHidden({ timeout: 10000 });
      }

      // 5. Switch to Inactive and purge the user
      await page.getByText('Inactive', { exact: true }).click();
      const inactiveUserRow = page.getByRole('row').filter({ hasText: EMAIL });
      await expect(inactiveUserRow).toBeVisible({ timeout: 5000 });

      await inactiveUserRow.getByRole('checkbox').click();
      await page.getByRole('button', { name: 'trash bin' }).click();

      const purgeModal = new PurgeUsersModal(page);
      await purgeModal.waitForVisible();
      await purgeModal.confirmDeletion();

      // 6. Verify user is deleted
      await expect(inactiveUserRow).toBeHidden({ timeout: 10000 });
    });
  },
);
