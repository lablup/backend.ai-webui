// spec: e2e/.agent-output/test-plan-no-project-user.md
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
import { test, expect } from '@playwright/test';

// Use random suffix to avoid collision on cleanup failure
const RANDOM_SUFFIX = Math.random().toString(36).substring(2, 8);
const EMAIL = `e2e-no-proj-${RANDOM_SUFFIX}@lablup.com`;
const USERNAME = `e2e-no-proj-${RANDOM_SUFFIX}`;
const PASSWORD = 'NoProject@Test123';

test.describe.serial(
  'Dashboard for user with no project assignment',
  { tag: ['@critical', '@regression', '@dashboard', '@functional'] },
  () => {
    test('Admin can create a user without any project assignment', async ({
      page,
      request,
    }) => {
      // 1. Log in as admin and navigate to Users management page
      await loginAsAdmin(page, request);
      await navigateTo(page, 'credential');

      // 2. Wait for Users tab to be visible
      await expect(page.getByRole('tab', { name: 'Users' })).toBeVisible();

      // 3. Click "Create User" button
      await page.getByRole('button', { name: 'Create User' }).click();

      // 4. Fill in required fields using UserSettingModal - leave Project empty
      const userSettingModal = new UserSettingModal(page);
      await userSettingModal.waitForVisible();
      await userSettingModal.fillEmail(EMAIL);
      await userSettingModal.fillUserName(USERNAME);
      await userSettingModal.fillPasswords(PASSWORD);
      // Intentionally leave Project field empty (no project assignment)
      await userSettingModal.clickOk();

      // 5. Handle the Keypair for new users dialog - it always appears after user creation
      const keyPairModal = new KeyPairModal(page);
      await keyPairModal.waitForVisible();
      await keyPairModal.close();

      // 6. Wait for the Create User dialog to close (closes after keypair modal is dismissed)
      await userSettingModal.waitForHidden();

      // 7. Verify new user appears in the Active users list
      await expect(page.getByRole('cell', { name: EMAIL })).toBeVisible({
        timeout: 10000,
      });
    });

    test('User with no project can log in without crashing the application', async ({
      page,
      request,
    }) => {
      // 1. Log in as the test user with no project assignment
      await loginAsCreatedAccount(page, request, EMAIL, PASSWORD);

      // 2. Verify login was successful by checking user dropdown is visible
      await expect(page.getByTestId('user-dropdown-button')).toBeVisible();

      // 3. Verify the URL is not the login page (user is authenticated)
      await expect(page).not.toHaveURL(/\/(login|signin)/);
    });

    test('User with no project sees the dashboard page load without full-page crash', async ({
      page,
      request,
    }) => {
      // 1. Log in as the test user with no project assignment
      await loginAsCreatedAccount(page, request, EMAIL, PASSWORD);

      // 2. Navigate to /summary which redirects to /dashboard
      await navigateTo(page, 'summary');

      // 3. Wait for URL to change to /dashboard (redirect from /summary)
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

      // 4. Verify the main content area is visible (page did not full-page crash)
      await expect(page.locator('main')).toBeVisible();

      // 5. Verify no full-page error text "Something went wrong" is displayed
      await expect(page.getByText('Something went wrong')).not.toBeVisible();

      // 6. Verify the page header breadcrumb "Dashboard" is visible
      await expect(
        page.getByRole('listitem').filter({ hasText: 'Dashboard' }),
      ).toBeVisible();
    });

    test('Error boundaries activate for project-dependent board items for no-project user', async ({
      page,
      request,
    }) => {
      // 1. Log in as the test user with no project assignment
      await loginAsCreatedAccount(page, request, EMAIL, PASSWORD);

      // 2. Navigate to the dashboard
      await navigateTo(page, 'summary');
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

      // 3. Wait for main element to be visible
      await expect(page.locator('main')).toBeVisible();

      // 4. Verify the "My Total Resources Limit" error boundary is triggered
      await expect(
        page.getByRole('heading', { name: 'My Total Resources Limit' }),
      ).toBeVisible({ timeout: 15_000 });

      // 5. Verify the BAIBoardItemErrorBoundary rendered error indicators
      // data-bai-board-item-status="error" appears when an error boundary catches a throw
      await expect(
        page.locator('[data-bai-board-item-status="error"]'),
      ).toHaveCount(2, { timeout: 15_000 });

      // 6. Verify "My Resources in Resource Group" also shows error boundary
      await expect(
        page.getByRole('heading', { name: 'My Resources in Resource Group' }),
      ).toBeVisible();

      // 7. Verify the "no resource group assigned" alert is NOT shown
      // When there's no project at all, this alert message is misleading
      await expect(
        page.getByText('No resource group is assigned'),
      ).not.toBeVisible();
    });

    test('Project-independent board items still render correctly for no-project user', async ({
      page,
      request,
    }) => {
      // 1. Log in as the test user with no project assignment
      await loginAsCreatedAccount(page, request, EMAIL, PASSWORD);

      // 2. Navigate to the dashboard
      await navigateTo(page, 'summary');
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

      // 3. Wait for main element to be visible (page did not crash)
      await expect(page.locator('main')).toBeVisible();

      // 4. Verify the "My Sessions" board item heading is visible
      await expect(
        page.getByRole('heading', { name: 'My Sessions' }),
      ).toBeVisible({ timeout: 15_000 });

      // 5. Verify session count labels are visible (Interactive, Batch, Inference, Upload Sessions)
      await expect(
        page.getByText('Interactive', { exact: true }),
      ).toBeVisible();
      await expect(page.getByText('Batch', { exact: true })).toBeVisible();
      await expect(page.getByText('Inference')).toBeVisible();
      await expect(page.getByText('Upload Sessions')).toBeVisible();

      // 6. Verify the "Recently Created Sessions" board item is visible
      await expect(
        page.getByRole('heading', { name: 'Recently Created Sessions' }),
      ).toBeVisible();

      // 7. Verify sidebar navigation is still accessible (no full-page crash)
      await expect(page.locator('nav').first()).toBeVisible();
    });

    test('Admin can deactivate and permanently delete the test user', async ({
      browser,
      request,
    }) => {
      // Use a fresh browser context to log in as admin for cleanup
      const context = await browser.newContext();
      const page = await context.newPage();

      try {
        // 1. Log in as admin
        await loginAsAdmin(page, request);

        // 2. Navigate to credential page
        await navigateTo(page, 'credential');

        // 3. Wait for Users tab to be visible
        await expect(page.getByRole('tab', { name: 'Users' })).toBeVisible();

        // 4. Find the test user row in the Active users table
        const userRow = page.getByRole('row').filter({ hasText: EMAIL });
        await expect(userRow).toBeVisible();

        // 5. Click the "Deactivate" button for the test user
        await userRow.getByRole('button', { name: 'Deactivate' }).click();

        // 6. Confirm deactivation in the popconfirm dialog
        const popconfirm = page.locator('.ant-popconfirm');
        await expect(popconfirm.getByText('Deactivate User')).toBeVisible();
        await popconfirm.getByRole('button', { name: 'Deactivate' }).click();

        // 7. Wait for the success toast message indicating deactivation completed
        await expect(
          page.getByText('The user status has changed.'),
        ).toBeVisible({ timeout: 15000 });

        // 8. Wait for user to disappear from Active list after status update
        await expect(userRow).toBeHidden({ timeout: 15000 });

        // 9. Switch to Inactive filter
        await page.getByText('Inactive', { exact: true }).click();

        // 10. Verify user appears in Inactive list
        await expect(page.getByRole('cell', { name: EMAIL })).toBeVisible({
          timeout: 10000,
        });

        // 11. Select the user checkbox for permanent deletion
        const inactiveUserRow = page
          .getByRole('row')
          .filter({ hasText: EMAIL });
        await inactiveUserRow.getByRole('checkbox').click();

        // 12. Verify selection count appears
        await expect(page.getByText('1 selected')).toBeVisible();

        // 13. Click the trash bin button to open the Purge Users modal
        await page.getByRole('button', { name: 'trash bin' }).click();

        // 14. Handle the PurgeUsersModal to confirm permanent deletion
        const purgeModal = new PurgeUsersModal(page);
        await purgeModal.waitForVisible();

        // 15. Verify modal shows the user email
        await purgeModal.verifyUserEmailDisplayed(EMAIL);

        // 16. Confirm the deletion
        await purgeModal.confirmDeletion();

        // 17. Verify success message appears
        await expect(
          page.getByText(/Permanently deleted \d+ out of \d+ users/),
        ).toBeVisible({ timeout: 10000 });

        // 18. Verify user completely disappears from inactive users list
        await expect(
          page.getByRole('row').filter({ hasText: EMAIL }),
        ).toBeHidden({ timeout: 10000 });
      } finally {
        await context.close();
      }
    });
  },
);
