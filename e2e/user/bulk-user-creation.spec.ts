// spec: e2e/user/bulk-user-creation.spec.ts
import { BulkCreateUserModal } from '../utils/classes/user/BulkCreateUserModal';
import { PurgeUsersModal } from '../utils/classes/user/PurgeUsersModal';
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import test, { expect, type Page } from '@playwright/test';

// Generate unique identifiers for this test run to avoid conflicts
const TEST_RUN_ID = Date.now().toString(36);
const EMAIL_SUFFIX = 'lablup.com';
const PASSWORD = 'Testing@123';

/**
 * Cleanup function to deactivate and permanently delete bulk-created test users.
 * Optimized to batch operations: deactivate all active users first, then purge all at once.
 */
async function cleanupBulkCreatedUsers(
  page: Page,
  emails: string[],
): Promise<void> {
  // Ensure we start on the credential page regardless of where the test ended
  await navigateTo(page, 'credential');

  // Phase 1: Deactivate all active users
  await page.getByText('Active', { exact: true }).click();
  for (const email of emails) {
    const userRow = page.getByRole('row').filter({ hasText: email });
    const isActive = await userRow
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    if (isActive) {
      await userRow.getByRole('button', { name: 'Deactivate' }).click();
      const popconfirm = page.locator('.ant-popconfirm');
      await popconfirm.getByRole('button', { name: 'Deactivate' }).click();
      await expect(userRow).toBeHidden({ timeout: 10000 });
    }
  }

  // Phase 2: Batch select and purge all inactive users at once
  await page.getByText('Inactive', { exact: true }).click();
  // Wait for the inactive table to load before checking for rows
  await page
    .locator('tbody tr:not(.ant-table-measure-row)')
    .first()
    .waitFor({ state: 'attached', timeout: 10000 })
    .catch(() => {});

  let hasInactiveUsers = false;
  for (const email of emails) {
    const inactiveRow = page.getByRole('row').filter({ hasText: email });
    const isInactive = await inactiveRow
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    if (isInactive) {
      await inactiveRow.getByRole('checkbox').click();
      hasInactiveUsers = true;
    }
  }

  if (hasInactiveUsers) {
    await page.getByRole('button', { name: 'trash bin' }).click();
    const purgeModal = new PurgeUsersModal(page);
    await purgeModal.waitForVisible();
    await purgeModal.confirmDeletion();
    await purgeModal.waitForHidden();
  }
}

test.describe(
  'Bulk User Creation',
  { tag: ['@critical', '@user', '@functional'] },
  () => {
    test.describe.configure({ mode: 'serial' });

    test(
      'Admin can open bulk create modal from dropdown',
      { tag: ['@smoke'] },
      async ({ page, request }) => {
        // 1. Login as admin
        await loginAsAdmin(page, request);

        // 2. Navigate to credential page
        await navigateTo(page, 'credential');

        // 3. Verify the "Users" tab is visible and selected
        await expect(page.getByRole('tab', { name: 'Users' })).toBeVisible();

        // 4. Verify the "Create User" button is visible
        await expect(
          page.getByRole('button', { name: 'Create User' }),
        ).toBeVisible();

        // 5. Click the "ellipsis" dropdown button adjacent to "Create User"
        await page.getByRole('button', { name: 'ellipsis' }).click();

        // 6. Verify the dropdown menu appears containing the item "Bulk Create Users"
        await expect(
          page.getByRole('menuitem', { name: 'Bulk Create Users' }),
        ).toBeVisible();

        // 7. Click "Bulk Create Users"
        await page.getByRole('menuitem', { name: 'Bulk Create Users' }).click();

        // 8. Verify a dialog with the title "Bulk Create Users" is visible
        const modal = new BulkCreateUserModal(page);
        await modal.waitForVisible();

        // 9. Verify required fields are present in the modal
        await expect(modal.getEmailPrefixInput()).toBeVisible();
        await expect(modal.getEmailSuffixInput()).toBeVisible();
        await expect(modal.getUserCountInput()).toBeVisible();
        await expect(modal.getUserCountInput()).toHaveValue('1');
        await expect(modal.getPasswordInput()).toBeVisible();
        await expect(modal.getConfirmPasswordInput()).toBeVisible();
        await expect(modal.getOkButton()).toBeVisible();
        await expect(modal.getCancelButton()).toBeVisible();

        // 10. Click "Cancel"
        await modal.cancel();

        // 11. Verify the modal is no longer visible
        await modal.waitForHidden();
      },
    );

    test.describe('Bulk create multiple users', () => {
      test.setTimeout(90000);

      const EMAIL_PREFIX = `bulke2e-${TEST_RUN_ID}`;
      const createdEmails = [
        `${EMAIL_PREFIX}1@${EMAIL_SUFFIX}`,
        `${EMAIL_PREFIX}2@${EMAIL_SUFFIX}`,
        `${EMAIL_PREFIX}3@${EMAIL_SUFFIX}`,
      ];

      test.afterEach(async ({ page }) => {
        try {
          await cleanupBulkCreatedUsers(page, createdEmails);
        } catch {
          // Ignore cleanup errors to not mask test failures
        }
      });

      test(
        'Admin can bulk create multiple users',
        { tag: ['@critical'] },
        async ({ page, request }) => {
          // 1. Login as admin
          await loginAsAdmin(page, request);

          // 2. Navigate to credential page
          await navigateTo(page, 'credential');

          // 3. Verify the "Users" tab is active
          await expect(
            page.getByRole('radio', { name: 'Active', exact: true }),
          ).toBeChecked();

          // 4. Click the "ellipsis" dropdown button next to "Create User"
          await page.getByRole('button', { name: 'ellipsis' }).click();

          // 5. Click "Bulk Create Users"
          await page
            .getByRole('menuitem', { name: 'Bulk Create Users' })
            .click();

          // 6. Verify the "Bulk Create Users" dialog is visible
          const modal = new BulkCreateUserModal(page);
          await modal.waitForVisible();

          // 7. Fill in the "Email prefix (before @)" field
          await modal.fillEmailPrefix(EMAIL_PREFIX);

          // 8. Fill in the "Email suffix (after @)" field
          await modal.fillEmailSuffix(EMAIL_SUFFIX);

          // 9. Set "Number of users" spinner to 3
          await modal.fillUserCount(3);

          // 10. Fill in "Password"
          await modal.fillPassword(PASSWORD);

          // 11. Fill in "Confirm Password"
          await modal.fillConfirmPassword(PASSWORD);

          // 12. Click "OK" and wait for success message
          await modal.submit();
          await expect(
            page.locator('.ant-message').getByText(/Successfully created/),
          ).toBeVisible({ timeout: 30000 });

          // 13. Verify the modal is no longer visible (confirms mutation completed)
          await modal.waitForHidden();

          // 14. Verify the Users table contains all 3 created users
          for (const email of createdEmails) {
            await expect(page.getByRole('cell', { name: email })).toBeVisible({
              timeout: 10000,
            });
          }

          // 15. Deactivate each created user
          for (const email of createdEmails) {
            const userRow = page.getByRole('row').filter({ hasText: email });
            await userRow.getByRole('button', { name: 'Deactivate' }).click();
            const popconfirm = page.locator('.ant-popconfirm');
            await popconfirm
              .getByRole('button', { name: 'Deactivate' })
              .click();
            await expect(userRow).toBeHidden({ timeout: 10000 });
          }

          // 16. Switch to Inactive tab and verify users appear there
          await page.getByText('Inactive', { exact: true }).click();
          for (const email of createdEmails) {
            await expect(page.getByRole('cell', { name: email })).toBeVisible({
              timeout: 10000,
            });
          }

          // 17. Select all inactive users via checkboxes
          for (const email of createdEmails) {
            const inactiveRow = page
              .getByRole('row')
              .filter({ hasText: email });
            await inactiveRow.getByRole('checkbox').click();
          }

          // 18. Click the purge (trash bin) button
          await page.getByRole('button', { name: 'trash bin' }).click();

          // 19. Confirm permanent deletion in the purge modal
          const purgeModal = new PurgeUsersModal(page);
          await purgeModal.waitForVisible();
          await purgeModal.confirmDeletion();
          await purgeModal.waitForHidden();

          // 20. Verify users are permanently deleted from inactive list
          for (const email of createdEmails) {
            await expect(page.getByRole('cell', { name: email })).toBeHidden({
              timeout: 10000,
            });
          }
        },
      );
    });

    test(
      'Admin can cancel bulk user creation without creating users',
      { tag: ['@functional'] },
      async ({ page, request }) => {
        // 1. Login as admin
        await loginAsAdmin(page, request);

        // 2. Navigate to credential page
        await navigateTo(page, 'credential');

        // 3. Click the "ellipsis" dropdown button and select "Bulk Create Users"
        await page.getByRole('button', { name: 'ellipsis' }).click();
        await page.getByRole('menuitem', { name: 'Bulk Create Users' }).click();

        // 5. Verify the "Bulk Create Users" dialog is visible
        const modal = new BulkCreateUserModal(page);
        await modal.waitForVisible();

        // 5-8. Fill the form with test data
        await modal.fillEmailPrefix('canceltest');
        await modal.fillEmailSuffix(EMAIL_SUFFIX);
        await modal.fillUserCount(3);
        await modal.fillPassword(PASSWORD);
        await modal.fillConfirmPassword(PASSWORD);

        // 9. Click "Cancel"
        await modal.cancel();

        // 10. Verify the modal is no longer visible
        await modal.waitForHidden();

        // 11. Verify no success notification appeared
        await expect(page.getByText(/Successfully created/)).not.toBeVisible();

        // 12. Verify no rows with emails matching "canceltest" appear in Active users list
        await expect(
          page.getByRole('row').filter({ hasText: 'canceltest' }),
        ).toHaveCount(0);
      },
    );

    test.describe('Bulk create a single user', () => {
      test.setTimeout(90000);

      const EMAIL_PREFIX = `bulksingle-${TEST_RUN_ID}`;
      const createdEmail = `${EMAIL_PREFIX}1@${EMAIL_SUFFIX}`;

      test.afterEach(async ({ page }) => {
        try {
          await cleanupBulkCreatedUsers(page, [createdEmail]);
        } catch {
          // Ignore cleanup errors to not mask test failures
        }
      });

      test(
        'Admin can bulk create a single user',
        { tag: ['@functional'] },
        async ({ page, request }) => {
          // 1. Login as admin
          await loginAsAdmin(page, request);

          // 2. Navigate to credential page
          await navigateTo(page, 'credential');

          // 3. Click the "ellipsis" dropdown button and select "Bulk Create Users"
          await page.getByRole('button', { name: 'ellipsis' }).click();
          await page
            .getByRole('menuitem', { name: 'Bulk Create Users' })
            .click();

          // 4. Verify the "Bulk Create Users" dialog is visible
          const modal = new BulkCreateUserModal(page);
          await modal.waitForVisible();

          // 5. Verify the "Number of users" spinner shows the default value 1
          await expect(modal.getUserCountInput()).toHaveValue('1');

          // 6. Verify the Decrease Value button is disabled at value 1
          await expect(modal.getDecreaseValueButton()).toBeDisabled();

          // 7. Fill in "Email prefix (before @)"
          await modal.fillEmailPrefix(EMAIL_PREFIX);

          // 8. Fill in "Email suffix (after @)"
          await modal.fillEmailSuffix(EMAIL_SUFFIX);

          // 9-10. Fill in "Password" and "Confirm Password" (use default count of 1)
          await modal.fillPassword(PASSWORD);
          await modal.fillConfirmPassword(PASSWORD);

          // 11. Click "OK" and wait for success message
          await modal.submit();
          await expect(
            page.locator('.ant-message').getByText(/Successfully created/),
          ).toBeVisible({ timeout: 30000 });

          // 12. Verify the modal closes (confirms mutation completed)
          await modal.waitForHidden();

          // 13. Verify the user appears in the Active users list
          await expect(
            page.getByRole('cell', { name: createdEmail }),
          ).toBeVisible({ timeout: 10000 });

          // 14. Deactivate the created user
          const userRow = page
            .getByRole('row')
            .filter({ hasText: createdEmail });
          await userRow.getByRole('button', { name: 'Deactivate' }).click();
          const popconfirm = page.locator('.ant-popconfirm');
          await popconfirm.getByRole('button', { name: 'Deactivate' }).click();
          await expect(userRow).toBeHidden({ timeout: 10000 });

          // 15. Switch to Inactive tab and verify the user appears there
          await page.getByText('Inactive', { exact: true }).click();
          await expect(
            page.getByRole('cell', { name: createdEmail }),
          ).toBeVisible({ timeout: 10000 });

          // 16. Select the inactive user via checkbox
          const inactiveRow = page
            .getByRole('row')
            .filter({ hasText: createdEmail });
          await inactiveRow.getByRole('checkbox').click();

          // 17. Click the purge (trash bin) button
          await page.getByRole('button', { name: 'trash bin' }).click();

          // 18. Confirm permanent deletion in the purge modal
          const purgeModal = new PurgeUsersModal(page);
          await purgeModal.waitForVisible();
          await purgeModal.confirmDeletion();
          await purgeModal.waitForHidden();

          // 19. Verify the user is permanently deleted from inactive list
          await expect(
            page.getByRole('cell', { name: createdEmail }),
          ).toBeHidden({ timeout: 10000 });
        },
      );
    });
  },
);
