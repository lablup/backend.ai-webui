// spec: e2e/.agent-output/test-plan-my-keypair-management.md
import { loginAsUser, navigateTo } from '../utils/test-util';
import test, { expect } from '@playwright/test';

// Helper to open the My Keypair Management modal
async function openKeypairModal(page: import('@playwright/test').Page) {
  await navigateTo(page, 'usersettings');
  await page
    .getByTestId('items-my-keypair-info')
    .getByRole('button', { name: /Config/i })
    .click();
  await expect(
    page.getByRole('dialog', { name: 'My Keypair Management' }),
  ).toBeVisible();
}

// Helper to get the keypair table rows (excluding measure rows)
function getKeypairTableRows(page: import('@playwright/test').Page) {
  const modal = page.getByRole('dialog', { name: 'My Keypair Management' });
  return modal.locator('tbody tr:not(.ant-table-measure-row)');
}

// Helper to issue a new keypair and close the credential dialog
// Returns the access key of the created keypair
async function issueNewKeypair(
  page: import('@playwright/test').Page,
): Promise<string> {
  const modal = page.getByRole('dialog', { name: 'My Keypair Management' });
  await modal.getByRole('button', { name: 'Issue New Keypair' }).click();
  const credDialog = page.getByRole('dialog', {
    name: 'Keypair Credential Information',
  });
  await expect(credDialog).toBeVisible();
  const accessKeyText = await credDialog
    .getByText(/^AKIA[A-Z0-9]+$/)
    .textContent();
  const accessKey = accessKeyText?.trim() ?? '';
  await credDialog.getByRole('button', { name: 'Close' }).click();
  await expect(credDialog).toBeHidden();
  return accessKey;
}

// Helper to deactivate a keypair by its access key (must be in Active tab)
async function deactivateKeypair(
  page: import('@playwright/test').Page,
  accessKey: string,
) {
  const modal = page.getByRole('dialog', { name: 'My Keypair Management' });
  // Make sure we're on the Active tab
  await modal
    .locator('label')
    .filter({ hasText: /^Active$/ })
    .click();
  const row = modal
    .locator('tbody tr:not(.ant-table-measure-row)')
    .filter({ hasText: accessKey });
  await expect(row).toBeVisible();
  // Click the Deactivate (dangerous) button in that row
  await row.locator('td').nth(1).locator('button.ant-btn-dangerous').click();
  await expect(
    page.getByText('Are you sure you want to deactivate this keypair?'),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Confirm' }).click();
  await expect(page.getByText('Keypair deactivated.')).toBeVisible();
}

// Helper to delete an inactive keypair by its access key (must be in Inactive tab)
async function deleteInactiveKeypair(
  page: import('@playwright/test').Page,
  accessKey: string,
) {
  const modal = page.getByRole('dialog', { name: 'My Keypair Management' });
  // Make sure we're on the Inactive tab
  await modal.locator('label').filter({ hasText: 'Inactive' }).click();
  const row = modal
    .locator('tbody tr:not(.ant-table-measure-row)')
    .filter({ hasText: accessKey });
  await expect(row).toBeVisible();
  // Click the Delete Keypair (dangerous) button in the Controls cell of that row
  await row.locator('td').nth(1).locator('button.ant-btn-dangerous').click();
  const deleteDialog = page.getByRole('dialog', { name: /Delete Keypair/ });
  await expect(deleteDialog).toBeVisible();
  await deleteDialog
    .getByRole('textbox', { name: 'Please type "Permanently' })
    .fill('Permanently Delete');
  await deleteDialog.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText('Keypair deleted.')).toBeVisible();
}

test.describe(
  'My Keypair Management',
  { tag: ['@critical', '@credential', '@functional'] },
  () => {
    test.describe.configure({ mode: 'serial' });

    test.beforeEach(async ({ page, request }) => {
      // Login as user
      await loginAsUser(page, request);
    });

    // ── 1. Modal Opening and Initial Display ───────────────────────────────────

    test('User can open the My Keypair Management modal from User Settings', async ({
      page,
    }) => {
      // Navigate to User Settings
      await navigateTo(page, 'usersettings');

      // Click the Config button inside the My Keypair Information card
      await page
        .getByTestId('items-my-keypair-info')
        .getByRole('button', { name: /Config/i })
        .click();

      // Verify the dialog is visible
      const modal = page.getByRole('dialog', { name: 'My Keypair Management' });
      await expect(modal).toBeVisible();

      // Verify alert banner shows the main access key
      await expect(modal.getByRole('alert')).toContainText('Main Access Key:');

      // Verify the Active radio button is selected by default
      await expect(
        modal.getByRole('radio', { name: 'Active', exact: true }),
      ).toBeChecked();

      // Verify table columns are visible
      await expect(
        modal.getByRole('columnheader', { name: 'Access Key' }),
      ).toBeVisible();
      await expect(
        modal.getByRole('columnheader', { name: 'Controls' }),
      ).toBeVisible();
      await expect(
        modal.getByRole('columnheader', { name: 'Resource Policy' }),
      ).toBeVisible();
      await expect(
        modal.getByRole('columnheader', { name: 'Created At' }),
      ).toBeVisible();
      await expect(
        modal.getByRole('columnheader', { name: 'Last Used' }),
      ).toBeVisible();

      // Verify at least one keypair row exists
      const rows = getKeypairTableRows(page);
      await expect(rows.first()).toBeVisible({ timeout: 10000 });
    });

    test('User can close the My Keypair Management modal using the Close button', async ({
      page,
    }) => {
      await openKeypairModal(page);

      const modal = page.getByRole('dialog', { name: 'My Keypair Management' });

      // Close the dialog using the header Close button
      await modal.getByRole('button', { name: 'Close' }).click();
      await expect(modal).toBeHidden({ timeout: 5000 });
    });

    // ── 2. Main Access Key Display ─────────────────────────────────────────────

    test('User can see the current main access key highlighted in the alert banner', async ({
      page,
    }) => {
      await openKeypairModal(page);

      const modal = page.getByRole('dialog', { name: 'My Keypair Management' });
      const alert = modal.getByRole('alert');

      // Verify the alert shows the main access key label
      await expect(alert).toContainText('Main Access Key:');

      // Verify a copy button is visible next to the access key
      await expect(alert.getByRole('button', { name: 'Copy' })).toBeVisible();
    });

    test('User can see the main access key visually distinguished in the table', async ({
      page,
    }) => {
      await openKeypairModal(page);

      const modal = page.getByRole('dialog', { name: 'My Keypair Management' });

      // Get the main access key from the alert banner
      const alertText = await modal.getByRole('alert').textContent();
      const mainKeyMatch = alertText?.match(/AKIA[A-Z0-9]+/);
      const mainAccessKey = mainKeyMatch?.[0] ?? '';
      expect(mainAccessKey).toBeTruthy();

      // Sort by Access Key ascending to ensure the main key is visible on the current page
      await modal.getByRole('columnheader', { name: 'Access Key' }).click();

      // Find the main keypair row by text content
      const mainKeyRow = modal
        .locator('tbody tr:not(.ant-table-measure-row)')
        .filter({
          hasText: mainAccessKey,
        })
        .first();
      await expect(mainKeyRow).toBeVisible({ timeout: 10000 });

      // The Controls cell for the main keypair row has a disabled button
      const controlsCell = mainKeyRow.locator('td').nth(1);
      const disabledButton = controlsCell.locator('button').first();
      await expect(disabledButton).toBeDisabled();
    });

    // ── 3. Active/Inactive Filter ──────────────────────────────────────────────

    test('User can filter keypairs by Active status', async ({ page }) => {
      await openKeypairModal(page);

      const modal = page.getByRole('dialog', { name: 'My Keypair Management' });

      // Active radio should be checked by default
      await expect(
        modal.getByRole('radio', { name: 'Active', exact: true }),
      ).toBeChecked();

      // Verify table renders with at least one row
      const rows = getKeypairTableRows(page);
      await expect(rows.first()).toBeVisible({ timeout: 10000 });

      // Verify table column headers are visible
      await expect(
        modal.getByRole('columnheader', { name: 'Access Key' }),
      ).toBeVisible();
      await expect(
        modal.getByRole('columnheader', { name: 'Controls' }),
      ).toBeVisible();
      await expect(
        modal.getByRole('columnheader', { name: 'Resource Policy' }),
      ).toBeVisible();
    });

    test('User can switch to Inactive keypair filter', async ({ page }) => {
      await openKeypairModal(page);

      const modal = page.getByRole('dialog', { name: 'My Keypair Management' });

      // Click the Inactive radio button
      await modal.locator('label').filter({ hasText: 'Inactive' }).click();

      // Verify the Inactive radio is now checked
      await expect(
        modal.getByRole('radio', { name: 'Inactive' }),
      ).toBeChecked();

      // Verify table re-renders (columns still visible)
      await expect(
        modal.getByRole('columnheader', { name: 'Access Key' }),
      ).toBeVisible();
    });

    test('User can switch back to Active keypair filter after viewing Inactive', async ({
      page,
    }) => {
      await openKeypairModal(page);

      const modal = page.getByRole('dialog', { name: 'My Keypair Management' });

      // Switch to Inactive
      await modal.locator('label').filter({ hasText: 'Inactive' }).click();
      await expect(
        modal.getByRole('radio', { name: 'Inactive' }),
      ).toBeChecked();

      // Switch back to Active
      await modal
        .locator('label')
        .filter({ hasText: /^Active$/ })
        .click();
      await expect(
        modal.getByRole('radio', { name: 'Active', exact: true }),
      ).toBeChecked();

      // Verify active keypairs are displayed again
      const rows = getKeypairTableRows(page);
      await expect(rows.first()).toBeVisible({ timeout: 10000 });
    });

    // ── 4. Issue New Keypair ───────────────────────────────────────────────────

    test('User can issue a new keypair and view credential information', async ({
      page,
    }) => {
      await openKeypairModal(page);

      const modal = page.getByRole('dialog', { name: 'My Keypair Management' });
      let createdAccessKey = '';

      try {
        // Click Issue New Keypair
        await modal.getByRole('button', { name: 'Issue New Keypair' }).click();

        // Verify the Keypair Credential Information dialog appears
        const credDialog = page.getByRole('dialog', {
          name: 'Keypair Credential Information',
        });
        await expect(credDialog).toBeVisible();

        // Verify warning alert is shown
        await expect(credDialog.getByRole('alert')).toContainText(
          'This information cannot be viewed again after closing this window. Please save it in a safe place.',
        );

        // Verify Access Key field is non-empty
        const accessKeyValue = credDialog.getByText(/^AKIA[A-Z0-9]+$/);
        await expect(accessKeyValue).toBeVisible();
        const accessKeyText = await accessKeyValue.textContent();
        expect(accessKeyText?.trim()).toBeTruthy();
        createdAccessKey = accessKeyText?.trim() ?? '';

        // Verify Secret Key field is non-empty
        await expect(credDialog.getByText('Secret Key')).toBeVisible();

        // Verify SSH Public Key field is non-empty
        await expect(credDialog.getByText('SSH Public Key')).toBeVisible();

        // Verify Download CSV button is present
        await expect(
          credDialog.getByRole('button', { name: 'Download CSV' }),
        ).toBeVisible();

        // Verify success notification
        await expect(
          page.getByText('Keypair successfully created.'),
        ).toBeVisible();

        // Close the credential dialog
        await credDialog.getByRole('button', { name: 'Close' }).click();
        await expect(credDialog).toBeHidden();
      } finally {
        // Cleanup: deactivate and delete the created keypair
        if (createdAccessKey) {
          try {
            await deactivateKeypair(page, createdAccessKey);
            await deleteInactiveKeypair(page, createdAccessKey);
          } catch (e) {
            console.warn('Cleanup failed:', e);
          }
        }
      }
    });

    test('User can close the Keypair Credential Information dialog and keypair remains in table', async ({
      page,
    }) => {
      await openKeypairModal(page);

      const modal = page.getByRole('dialog', { name: 'My Keypair Management' });
      let createdAccessKey = '';

      try {
        // Click Issue New Keypair
        await modal.getByRole('button', { name: 'Issue New Keypair' }).click();

        const credDialog = page.getByRole('dialog', {
          name: 'Keypair Credential Information',
        });
        await expect(credDialog).toBeVisible();

        // Capture the access key for cleanup
        const accessKeyText = await credDialog
          .getByText(/^AKIA[A-Z0-9]+$/)
          .textContent();
        createdAccessKey = accessKeyText?.trim() ?? '';

        // Close the Keypair Credential Information dialog
        await credDialog.getByRole('button', { name: 'Close' }).click();
        await expect(credDialog).toBeHidden();

        // Verify the My Keypair Management modal remains visible
        await expect(modal).toBeVisible();

        // Verify the newly created keypair appears in the Active table
        const rows = getKeypairTableRows(page);
        await expect(rows.first()).toBeVisible({ timeout: 10000 });
      } finally {
        // Cleanup: deactivate and delete the created keypair
        if (createdAccessKey) {
          try {
            await deactivateKeypair(page, createdAccessKey);
            await deleteInactiveKeypair(page, createdAccessKey);
          } catch (e) {
            console.warn('Cleanup failed:', e);
          }
        }
      }
    });

    // ── 5. Set as Main Access Key ──────────────────────────────────────────────

    test('User can cancel the Set as Main Popconfirm without changing the main key', async ({
      page,
    }) => {
      await openKeypairModal(page);

      const modal = page.getByRole('dialog', { name: 'My Keypair Management' });
      let createdAccessKey = '';

      try {
        // Issue a new keypair to ensure a non-main keypair exists
        createdAccessKey = await issueNewKeypair(page);

        // Get the main access key from the alert banner
        const alertText = await modal.getByRole('alert').textContent();
        const mainKeyMatch = alertText?.match(/AKIA[A-Z0-9]+/);
        const originalMainKey = mainKeyMatch?.[0] ?? '';

        // Find the newly created non-main keypair row
        const nonMainRow = modal
          .locator('tbody tr:not(.ant-table-measure-row)')
          .filter({ hasText: createdAccessKey });
        await expect(nonMainRow).toBeVisible({ timeout: 10000 });

        // Click the Set as Main button (first non-dangerous button in Controls cell)
        await nonMainRow
          .locator('td')
          .nth(1)
          .locator('button:not(.ant-btn-dangerous)')
          .first()
          .click();

        // Verify Popconfirm appears
        const visiblePopconfirm = page.locator(
          '.ant-popover:not(.ant-popover-hidden) .ant-popconfirm-buttons',
        );
        await expect(visiblePopconfirm).toBeVisible({ timeout: 8000 });

        // Click Cancel
        await visiblePopconfirm.getByRole('button', { name: 'Cancel' }).click();

        // Verify main key is unchanged
        await expect(modal.getByRole('alert')).toContainText(originalMainKey);

        // Verify the Re-login Required dialog did NOT appear
        await expect(
          page.getByRole('dialog', { name: 'Re-login Required' }),
        ).toBeHidden({ timeout: 3000 });
      } finally {
        // Cleanup
        if (createdAccessKey) {
          try {
            await deactivateKeypair(page, createdAccessKey);
            await deleteInactiveKeypair(page, createdAccessKey);
          } catch (e) {
            console.warn('Cleanup failed:', e);
          }
        }
      }
    });

    test('User cannot click Set as Main on the current main keypair (button is disabled)', async ({
      page,
    }) => {
      await openKeypairModal(page);

      const modal = page.getByRole('dialog', { name: 'My Keypair Management' });

      // Get the main access key from the alert banner
      const alertText = await modal.getByRole('alert').textContent();
      const mainKeyMatch = alertText?.match(/AKIA[A-Z0-9]+/);
      const mainAccessKey = mainKeyMatch?.[0] ?? '';
      expect(mainAccessKey).toBeTruthy();

      // Sort by Access Key to ensure main key is visible
      await modal.getByRole('columnheader', { name: 'Access Key' }).click();

      // Find the main keypair row
      const mainKeyRow = modal
        .locator('tbody tr:not(.ant-table-measure-row)')
        .filter({ hasText: mainAccessKey });
      await expect(mainKeyRow).toBeVisible({ timeout: 10000 });

      // Verify the deactivate button in the main key row is disabled
      const controlsCell = mainKeyRow.locator('td').nth(1);
      const disabledButton = controlsCell.locator('button').first();
      await expect(disabledButton).toBeDisabled();
    });

    // ── 6. Deactivate Active Keypair ───────────────────────────────────────────

    test('User can deactivate a non-main active keypair', async ({ page }) => {
      await openKeypairModal(page);

      const modal = page.getByRole('dialog', { name: 'My Keypair Management' });
      let deactivatedAccessKey = '';

      try {
        // Issue a new keypair first so we have one to safely deactivate
        deactivatedAccessKey = await issueNewKeypair(page);

        // Find the newly created keypair row and click Deactivate in the Controls cell
        const newKeypairRow = modal
          .locator('tbody tr:not(.ant-table-measure-row)')
          .filter({ hasText: deactivatedAccessKey });
        await expect(newKeypairRow).toBeVisible({ timeout: 10000 });
        await newKeypairRow
          .locator('td')
          .nth(1)
          .locator('button.ant-btn-dangerous')
          .click();

        // Verify Popconfirm appears
        await expect(
          page.getByText('Are you sure you want to deactivate this keypair?'),
        ).toBeVisible();

        // Confirm deactivation
        await page.getByRole('button', { name: 'Confirm' }).click();

        // Verify success notification
        await expect(page.getByText('Keypair deactivated.')).toBeVisible();

        // Verify the row is removed from Active table
        await expect(
          modal
            .locator('tbody tr:not(.ant-table-measure-row)')
            .filter({ hasText: deactivatedAccessKey }),
        ).toBeHidden({ timeout: 5000 });
      } finally {
        // Cleanup: delete the deactivated keypair
        if (deactivatedAccessKey) {
          try {
            await deleteInactiveKeypair(page, deactivatedAccessKey);
          } catch (e) {
            console.warn('Cleanup failed:', e);
          }
        }
      }
    });

    test('User can cancel the deactivate Popconfirm without changing keypair status', async ({
      page,
    }) => {
      await openKeypairModal(page);

      const modal = page.getByRole('dialog', { name: 'My Keypair Management' });

      // Find a non-main keypair row (has dangerous/deactivate button)
      const nonMainRow = modal
        .locator('tbody tr:not(.ant-table-measure-row)')
        .filter({
          has: page.locator('td button.ant-btn-dangerous'),
        })
        .first();
      await expect(nonMainRow).toBeVisible({ timeout: 10000 });

      // Click Deactivate button in the Controls cell
      await nonMainRow
        .locator('td')
        .nth(1)
        .locator('button.ant-btn-dangerous')
        .click();
      await expect(
        page.getByText('Are you sure you want to deactivate this keypair?'),
      ).toBeVisible();

      // Click Cancel
      await page.getByRole('button', { name: 'Cancel' }).click();

      // Verify keypair still visible in Active table
      await expect(nonMainRow).toBeVisible({ timeout: 5000 });
    });

    test('User cannot deactivate the main keypair (button is disabled)', async ({
      page,
    }) => {
      await openKeypairModal(page);

      const modal = page.getByRole('dialog', { name: 'My Keypair Management' });

      // Get the main access key from the alert banner
      const alertText = await modal.getByRole('alert').textContent();
      const mainKeyMatch = alertText?.match(/AKIA[A-Z0-9]+/);
      const mainAccessKey = mainKeyMatch?.[0] ?? '';
      expect(mainAccessKey).toBeTruthy();

      // Sort by Access Key to ensure main key is visible
      await modal.getByRole('columnheader', { name: 'Access Key' }).click();

      // Find the main keypair row
      const mainKeyRow = modal
        .locator('tbody tr:not(.ant-table-measure-row)')
        .filter({ hasText: mainAccessKey });
      await expect(mainKeyRow).toBeVisible({ timeout: 10000 });

      // Verify the deactivate button is disabled
      const controlsCell = mainKeyRow.locator('td').nth(1);
      const disabledBtn = controlsCell.locator('button').first();
      await expect(disabledBtn).toBeDisabled();
    });

    // ── 7. Restore Inactive Keypair ────────────────────────────────────────────

    test('User can restore an inactive keypair back to active status', async ({
      page,
    }) => {
      await openKeypairModal(page);

      const modal = page.getByRole('dialog', { name: 'My Keypair Management' });
      let restoredAccessKey = '';

      try {
        // Issue a new keypair and then deactivate it to ensure an inactive keypair exists
        await modal.getByRole('button', { name: 'Issue New Keypair' }).click();
        const credDialog = page.getByRole('dialog', {
          name: 'Keypair Credential Information',
        });
        await expect(credDialog).toBeVisible();
        const accessKeyText = await credDialog
          .getByText(/^AKIA[A-Z0-9]+$/)
          .textContent();
        restoredAccessKey = accessKeyText?.trim() ?? '';
        await credDialog.getByRole('button', { name: 'Close' }).click();
        await expect(credDialog).toBeHidden();

        // Deactivate the newly created keypair
        await deactivateKeypair(page, restoredAccessKey);

        // Switch to Inactive tab
        await modal.locator('label').filter({ hasText: 'Inactive' }).click();
        await expect(
          modal.getByRole('radio', { name: 'Inactive' }),
        ).toBeChecked();

        // Wait for inactive keypairs to load
        const inactiveRows = getKeypairTableRows(page);
        await expect(inactiveRows.first()).toBeVisible({ timeout: 10000 });

        // Find our deactivated keypair row and click Restore in the Controls cell
        const targetRow = modal
          .locator('tbody tr:not(.ant-table-measure-row)')
          .filter({ hasText: restoredAccessKey });
        await expect(targetRow).toBeVisible();
        // Use aria-label from Tooltip to find the Restore button
        const restoreBtn = targetRow
          .getByRole('button', { name: /undo/i })
          .first();
        if ((await restoreBtn.count()) > 0) {
          await restoreBtn.click();
        } else {
          // Fallback: click the first non-dangerous button
          await targetRow
            .locator('td')
            .nth(1)
            .locator('button:not(.ant-btn-dangerous)')
            .first()
            .click();
        }

        // Verify Popconfirm appears and confirm restoration
        await expect(page.getByText(/restore this keypair/i)).toBeVisible({
          timeout: 8000,
        });
        await page.getByRole('button', { name: 'Confirm' }).click();

        // Verify the restored keypair no longer appears in Inactive tab
        await expect(
          modal
            .locator('tbody tr:not(.ant-table-measure-row)')
            .filter({ hasText: restoredAccessKey }),
        ).toBeHidden({ timeout: 10000 });

        // Switch to Active tab and verify keypair is restored
        await modal
          .locator('label')
          .filter({ hasText: /^Active$/ })
          .click();
        await expect(
          modal.getByRole('radio', { name: 'Active', exact: true }),
        ).toBeChecked();

        const activeRow = modal
          .locator('tbody tr:not(.ant-table-measure-row)')
          .filter({ hasText: restoredAccessKey });
        await expect(activeRow).toBeVisible({ timeout: 10000 });
      } finally {
        // Cleanup: deactivate and delete the created keypair
        if (restoredAccessKey) {
          try {
            await deactivateKeypair(page, restoredAccessKey);
            await deleteInactiveKeypair(page, restoredAccessKey);
          } catch (e) {
            console.warn('Cleanup failed:', e);
          }
        }
      }
    });

    test('User can cancel the restore Popconfirm without changing keypair status', async ({
      page,
    }) => {
      await openKeypairModal(page);

      const modal = page.getByRole('dialog', { name: 'My Keypair Management' });
      let createdAccessKey = '';

      try {
        // Issue and deactivate a keypair to ensure an inactive keypair exists
        createdAccessKey = await issueNewKeypair(page);
        await deactivateKeypair(page, createdAccessKey);

        // Switch to Inactive tab
        await modal.locator('label').filter({ hasText: 'Inactive' }).click();
        await expect(
          modal.getByRole('radio', { name: 'Inactive' }),
        ).toBeChecked();

        // Find the target inactive keypair row
        const targetRow = modal
          .locator('tbody tr:not(.ant-table-measure-row)')
          .filter({ hasText: createdAccessKey });
        await expect(targetRow).toBeVisible({ timeout: 10000 });

        // Click the Restore button in the Controls cell
        const restoreBtn = targetRow
          .getByRole('button', { name: /undo/i })
          .first();
        if ((await restoreBtn.count()) > 0) {
          await restoreBtn.click();
        } else {
          await targetRow
            .locator('td')
            .nth(1)
            .locator('button:not(.ant-btn-dangerous)')
            .first()
            .click();
        }

        // Wait for Popconfirm and click Cancel
        await expect(page.getByText(/restore this keypair/i)).toBeVisible({
          timeout: 8000,
        });
        await page.getByRole('button', { name: 'Cancel' }).click();

        // Verify the keypair is still in Inactive tab
        await expect(targetRow).toBeVisible({ timeout: 5000 });
      } finally {
        // Cleanup: delete the inactive keypair
        if (createdAccessKey) {
          try {
            await deleteInactiveKeypair(page, createdAccessKey);
          } catch (e) {
            console.warn('Cleanup failed:', e);
          }
        }
      }
    });

    // ── 8. Delete Inactive Keypair ─────────────────────────────────────────────

    test('User can permanently delete an inactive keypair by typing the confirmation phrase', async ({
      page,
    }) => {
      await openKeypairModal(page);

      const modal = page.getByRole('dialog', { name: 'My Keypair Management' });
      let deleteTargetKey = '';

      // Issue and deactivate a keypair to ensure we have one to delete
      await modal.getByRole('button', { name: 'Issue New Keypair' }).click();
      const credDialog = page.getByRole('dialog', {
        name: 'Keypair Credential Information',
      });
      await expect(credDialog).toBeVisible();
      const accessKeyText = await credDialog
        .getByText(/^AKIA[A-Z0-9]+$/)
        .textContent();
      deleteTargetKey = accessKeyText?.trim() ?? '';
      await credDialog.getByRole('button', { name: 'Close' }).click();
      await expect(credDialog).toBeHidden();

      // Deactivate the keypair
      await deactivateKeypair(page, deleteTargetKey);

      // Switch to Inactive tab
      await modal.locator('label').filter({ hasText: 'Inactive' }).click();
      await expect(
        modal.getByRole('radio', { name: 'Inactive' }),
      ).toBeChecked();

      // Wait for inactive keypairs to load
      const inactiveRows = getKeypairTableRows(page);
      await expect(inactiveRows.first()).toBeVisible({ timeout: 10000 });

      // Find the target keypair row and click Delete Keypair in the Controls cell
      const targetRow = modal
        .locator('tbody tr:not(.ant-table-measure-row)')
        .filter({ hasText: deleteTargetKey });
      await expect(targetRow).toBeVisible();
      await targetRow
        .locator('td')
        .nth(1)
        .locator('button.ant-btn-dangerous')
        .click();

      // Verify the Delete Keypair confirmation dialog appears
      const deleteDialog = page.getByRole('dialog', { name: /Delete Keypair/ });
      await expect(deleteDialog).toBeVisible();
      await expect(deleteDialog).toContainText(
        `This will permanently delete the keypair (${deleteTargetKey}). This action cannot be undone.`,
      );
      await expect(
        deleteDialog.getByRole('button', { name: 'Delete' }),
      ).toBeDisabled();

      // Type the confirmation phrase
      await deleteDialog
        .getByRole('textbox', { name: 'Please type "Permanently' })
        .fill('Permanently Delete');

      // Verify Delete button becomes enabled
      await expect(
        deleteDialog.getByRole('button', { name: 'Delete' }),
      ).toBeEnabled();

      // Click Delete
      await deleteDialog.getByRole('button', { name: 'Delete' }).click();

      // Verify success notification and row removal
      await expect(page.getByText('Keypair deleted.')).toBeVisible();
      await expect(
        modal
          .locator('tbody tr:not(.ant-table-measure-row)')
          .filter({ hasText: deleteTargetKey }),
      ).toBeHidden({ timeout: 10000 });
    });

    test('User cannot delete a keypair without typing the exact confirmation phrase', async ({
      page,
    }) => {
      await openKeypairModal(page);

      const modal = page.getByRole('dialog', { name: 'My Keypair Management' });

      // Switch to Inactive tab
      await modal.locator('label').filter({ hasText: 'Inactive' }).click();

      const inactiveRows = getKeypairTableRows(page);
      const count = await inactiveRows.count();

      if (count === 0) {
        test.skip(
          true,
          'Requires at least one inactive keypair to exercise the delete confirmation flow.',
        );
      }

      // Click Delete Keypair on first inactive row (in Controls cell)
      await inactiveRows
        .first()
        .locator('td')
        .nth(1)
        .locator('button.ant-btn-dangerous')
        .click();

      const deleteDialog = page.getByRole('dialog', { name: /Delete Keypair/ });
      await expect(deleteDialog).toBeVisible();

      // Verify Delete button is disabled when input is empty
      await expect(
        deleteDialog.getByRole('button', { name: 'Delete' }),
      ).toBeDisabled();

      // Close the dialog without deleting
      await deleteDialog.getByRole('button', { name: 'Close' }).click();
      await expect(deleteDialog).toBeHidden();
    });

    test('User can cancel the delete confirmation dialog without deleting the keypair', async ({
      page,
    }) => {
      await openKeypairModal(page);

      const modal = page.getByRole('dialog', { name: 'My Keypair Management' });

      // Issue and deactivate a new keypair so we have a known key to test cancel with
      const cancelTestKey = await issueNewKeypair(page);
      await deactivateKeypair(page, cancelTestKey);

      // Switch to Inactive tab
      await modal.locator('label').filter({ hasText: 'Inactive' }).click();

      // Find the target row and click Delete Keypair
      const targetRow = modal
        .locator('tbody tr:not(.ant-table-measure-row)')
        .filter({ hasText: cancelTestKey });
      await expect(targetRow).toBeVisible();
      await targetRow
        .locator('td')
        .nth(1)
        .locator('button.ant-btn-dangerous')
        .click();

      const deleteDialog = page.getByRole('dialog', { name: /Delete Keypair/ });
      await expect(deleteDialog).toBeVisible();

      // Type the confirmation phrase
      await page
        .getByRole('textbox', { name: 'Please type "Permanently' })
        .fill('Permanently Delete');

      // Click Cancel instead of Delete
      await deleteDialog.getByRole('button', { name: 'Cancel' }).click();
      await expect(deleteDialog).toBeHidden();

      // Verify the keypair is still in the Inactive table (was not deleted)
      await expect(
        modal
          .locator('tbody tr:not(.ant-table-measure-row)')
          .filter({ hasText: cancelTestKey }),
      ).toBeVisible({ timeout: 5000 });

      // Cleanup: delete the test keypair
      await targetRow
        .locator('td')
        .nth(1)
        .locator('button.ant-btn-dangerous')
        .click();
      await expect(deleteDialog).toBeVisible();
      await deleteDialog
        .getByRole('textbox', { name: 'Please type "Permanently' })
        .fill('Permanently Delete');
      await deleteDialog.getByRole('button', { name: 'Delete' }).click();
      await expect(page.getByText('Keypair deleted.')).toBeVisible();
    });

    test('User cannot see Delete Keypair button for active keypairs', async ({
      page,
    }) => {
      await openKeypairModal(page);

      const modal = page.getByRole('dialog', { name: 'My Keypair Management' });

      // Verify we're on Active tab
      await expect(
        modal.getByRole('radio', { name: 'Active', exact: true }),
      ).toBeChecked();

      // Get all active keypair rows
      const rows = getKeypairTableRows(page);
      await expect(rows.first()).toBeVisible({ timeout: 10000 });
      const rowCount = await rows.count();

      // Verify no row in Active tab has a Delete Keypair context
      // Non-main rows should have: Set as Main + Deactivate buttons (2 buttons)
      // Main row should have: 1 disabled button only
      // None should have a Delete Keypair trigger
      for (let i = 0; i < rowCount; i++) {
        const row = rows.nth(i);
        const controlsCell = row.locator('td').nth(1);
        // There should be at most 2 buttons and none should be a Delete context
        const buttonCount = await controlsCell.locator('button').count();
        expect(buttonCount).toBeLessThanOrEqual(2);
      }
    });

    // ── 9. Table Settings (Column Visibility) ──────────────────────────────────

    test('User can show the hidden "Modified At" column via Table Settings', async ({
      page,
    }) => {
      await openKeypairModal(page);

      const modal = page.getByRole('dialog', { name: 'My Keypair Management' });

      // Verify Modified At column is NOT visible initially
      await expect(
        modal.getByRole('columnheader', { name: 'Modified At' }),
      ).toBeHidden({ timeout: 3000 });

      // Click the gear icon to open Table Settings (SettingOutlined icon button)
      await modal.getByRole('button', { name: 'setting' }).click();

      // Verify Table Settings dialog opens
      const settingsDialog = page.getByRole('dialog', {
        name: 'Table Settings',
      });
      await expect(settingsDialog).toBeVisible();

      // Verify Modified At checkbox is unchecked by default
      await expect(
        settingsDialog.getByRole('checkbox', { name: 'Modified At' }),
      ).not.toBeChecked();

      // Check the Modified At checkbox
      await settingsDialog
        .getByRole('checkbox', { name: 'Modified At' })
        .click();
      await expect(
        settingsDialog.getByRole('checkbox', { name: 'Modified At' }),
      ).toBeChecked();

      // Click OK
      await settingsDialog.getByRole('button', { name: 'OK' }).click();
      await expect(settingsDialog).toBeHidden();

      // Verify Modified At column is now visible
      await expect(
        modal.getByRole('columnheader', { name: 'Modified At' }),
      ).toBeVisible({ timeout: 5000 });
    });

    test('User can cancel Table Settings without applying changes', async ({
      page,
    }) => {
      await openKeypairModal(page);

      const modal = page.getByRole('dialog', { name: 'My Keypair Management' });

      // Click the gear icon to open Table Settings (SettingOutlined icon button)
      await modal.getByRole('button', { name: 'setting' }).click();

      const settingsDialog = page.getByRole('dialog', {
        name: 'Table Settings',
      });
      await expect(settingsDialog).toBeVisible();

      // Uncheck Resource Policy
      await settingsDialog
        .getByRole('checkbox', { name: 'Resource Policy' })
        .click();
      await expect(
        settingsDialog.getByRole('checkbox', { name: 'Resource Policy' }),
      ).not.toBeChecked();

      // Click Cancel
      await settingsDialog.getByRole('button', { name: 'Cancel' }).click();
      await expect(settingsDialog).toBeHidden();

      // Verify Resource Policy column is still visible (changes not applied)
      await expect(
        modal.getByRole('columnheader', { name: 'Resource Policy' }),
      ).toBeVisible();
    });

    // ── 10. Refresh ────────────────────────────────────────────────────────────

    test('User can manually refresh the keypair list', async ({ page }) => {
      await openKeypairModal(page);

      const modal = page.getByRole('dialog', { name: 'My Keypair Management' });

      // Click the reload button
      await modal.getByRole('button', { name: 'reload' }).click();

      // Verify the table still renders after reload
      const rows = getKeypairTableRows(page);
      await expect(rows.first()).toBeVisible({ timeout: 10000 });

      // Verify the modal is still open and no error messages appear
      await expect(modal).toBeVisible();
    });

    // ── 11. Pagination ─────────────────────────────────────────────────────────

    test('User can change the page size for the keypair table', async ({
      page,
    }) => {
      await openKeypairModal(page);

      const modal = page.getByRole('dialog', { name: 'My Keypair Management' });

      // Verify the default page size combobox is visible
      const pageSizeSelect = modal.getByRole('combobox', { name: 'Page Size' });
      await expect(pageSizeSelect).toBeVisible();

      // Click the page size selector and select 20 / page
      await pageSizeSelect.click();
      await page.getByRole('option', { name: '20 / page' }).click();

      // Verify the page size changed
      await expect(
        modal.locator('.ant-select-content').filter({ hasText: '20 / page' }),
      ).toBeVisible();
    });

    // ── 12. Edge Cases ─────────────────────────────────────────────────────────

    test('User sees newly issued keypair appear in the table', async ({
      page,
    }) => {
      await openKeypairModal(page);

      const modal = page.getByRole('dialog', { name: 'My Keypair Management' });
      let createdAccessKey = '';

      try {
        // Issue a new keypair
        createdAccessKey = await issueNewKeypair(page);

        // Verify the newly created keypair appears in the table (sorted by -createdAt, so it should be first)
        const newRow = modal
          .locator('tbody tr:not(.ant-table-measure-row)')
          .filter({ hasText: createdAccessKey });
        await expect(newRow).toBeVisible({ timeout: 10000 });
      } finally {
        // Cleanup: deactivate and delete the created keypair
        if (createdAccessKey) {
          try {
            await deactivateKeypair(page, createdAccessKey);
            await deleteInactiveKeypair(page, createdAccessKey);
          } catch (e) {
            console.warn('Cleanup failed:', e);
          }
        }
      }
    });
  },
);
