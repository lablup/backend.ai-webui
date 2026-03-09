// spec: Credential Keypairs tests
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import test, { expect } from '@playwright/test';

test.describe(
  'Credential Keypairs',
  { tag: ['@critical', '@credential', '@functional'] },
  () => {
    test('Admin can see Credential list with expected columns', async ({
      page,
      request,
    }) => {
      await loginAsAdmin(page, request);
      await navigateTo(page, 'credential');

      // Switch to Credentials tab
      await page.getByRole('tab', { name: 'Credentials' }).click();
      await expect(
        page.getByRole('tab', { name: 'Credentials', selected: true }),
      ).toBeVisible();

      // Verify table columns
      await expect(
        page.getByRole('columnheader', { name: 'Access Key' }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'User ID' }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'Control' }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'Permission' }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'Resource Policy' }),
      ).toBeVisible();

      // Verify at least one keypair row exists in the credentials table
      const credentialTable = page.locator('table').filter({
        has: page.getByRole('columnheader', { name: 'Access Key' }),
      });
      const dataRows = credentialTable.locator(
        'tbody tr:not(.ant-table-measure-row)',
      );
      await expect(dataRows.first()).toBeVisible({ timeout: 10000 });
    });

    test('Admin can view Keypair info modal', async ({ page, request }) => {
      await loginAsAdmin(page, request);
      await navigateTo(page, 'credential');

      // Switch to Credentials tab
      await page.getByRole('tab', { name: 'Credentials' }).click();

      // Scope row lookup to the credentials table to avoid matching other tables
      const credentialTable = page.locator('table').filter({
        has: page.getByRole('columnheader', { name: 'Access Key' }),
      });
      const dataRows = credentialTable.locator(
        'tbody tr:not(.ant-table-measure-row)',
      );
      await expect(dataRows.first()).toBeVisible({ timeout: 10000 });

      // Click the info button on the first keypair row
      const firstRow = dataRows.first();
      await firstRow.getByRole('button', { name: 'info-circle' }).click();

      // Verify Keypair Detail dialog appears
      const modal = page.getByRole('dialog', { name: /Keypair Detail/ });
      await expect(modal).toBeVisible();

      // Verify key information sections are displayed
      await expect(modal.getByText('Information')).toBeVisible();
      await expect(modal.getByText('Allocation')).toBeVisible();

      // Close modal
      await modal.getByRole('button', { name: 'Close' }).click();
      await expect(modal).toBeHidden({ timeout: 5000 });
    });

    test('Admin can see Active/Inactive radio filter', async ({
      page,
      request,
    }) => {
      await loginAsAdmin(page, request);
      await navigateTo(page, 'credential');

      // Switch to Credentials tab
      await page.getByRole('tab', { name: 'Credentials' }).click();

      // Verify Active/Inactive radio group exists
      const radioGroup = page.getByRole('radiogroup');
      await expect(radioGroup).toBeVisible();
      await expect(
        radioGroup.getByText('Active', { exact: true }),
      ).toBeVisible();
      await expect(radioGroup.getByText('Inactive')).toBeVisible();

      // Click Inactive and verify the table still renders
      await radioGroup.getByText('Inactive').click();
      await expect(
        page.getByRole('columnheader', { name: 'Access Key' }),
      ).toBeVisible();

      // Switch back to Active and verify the table still renders
      await radioGroup.getByText('Active', { exact: true }).click();
      await expect(
        page.getByRole('columnheader', { name: 'Access Key' }),
      ).toBeVisible();
    });
  },
);
