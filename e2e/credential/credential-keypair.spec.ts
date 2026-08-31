// spec: Credential Keypairs tests
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import test, { expect, Page } from '@playwright/test';

// `role="tab"` is never emitted unless `TabList` is given `role="tablist"`,
// which this app never does. The active tab carries `aria-current="true"`.
function credentialsTab(page: Page) {
  return page
    .getByRole('navigation', { name: 'Tabs' })
    .getByRole('button', { name: 'Credentials' });
}

// A BAITable column header's accessible NAME is overridden by its sort
// button's aria-label ("Sort by accessKey") for sortable columns; match the
// header's visible TEXT instead (see resource-policy.spec.ts / registry.spec.ts
// for the identical pattern).
function credentialColumnHeader(page: Page, label: string) {
  return page.getByRole('columnheader').filter({ hasText: label });
}

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
      await credentialsTab(page).click();
      await expect(credentialsTab(page)).toHaveAttribute(
        'aria-current',
        'true',
      );

      // Verify table columns
      await expect(credentialColumnHeader(page, 'Access Key')).toBeVisible();
      await expect(credentialColumnHeader(page, 'User ID')).toBeVisible();
      await expect(credentialColumnHeader(page, 'Allocation')).toBeVisible();
      await expect(credentialColumnHeader(page, 'Permission')).toBeVisible();
      await expect(
        credentialColumnHeader(page, 'Resource Policy'),
      ).toBeVisible();

      // Verify at least one keypair row exists in the credentials table
      const credentialTable = page.locator('table').filter({
        has: credentialColumnHeader(page, 'Access Key'),
      });
      const dataRows = credentialTable.locator('tbody tr');
      await expect(dataRows.first()).toBeVisible({ timeout: 10000 });
    });

    test('Admin can view Keypair info modal', async ({ page, request }) => {
      await loginAsAdmin(page, request);
      await navigateTo(page, 'credential');

      // Switch to Credentials tab
      await credentialsTab(page).click();

      // Scope row lookup to the credentials table to avoid matching other tables
      const credentialTable = page.locator('table').filter({
        has: credentialColumnHeader(page, 'Access Key'),
      });
      const dataRows = credentialTable.locator('tbody tr');
      await expect(dataRows.first()).toBeVisible({ timeout: 10000 });

      // Click the info button on the first keypair row.
      // BAINameActionCell now sets aria-label={action.title} unconditionally
      // (PR #8320); the info action's title is t('button.Info') = "Info",
      // not the icon name "info-circle".
      const firstRow = dataRows.first();
      await firstRow.getByRole('button', { name: 'Info' }).click();

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
      await credentialsTab(page).click();

      // Verify Active/Inactive radio group exists
      const radioGroup = page.getByRole('radiogroup');
      await expect(radioGroup).toBeVisible();
      await expect(
        radioGroup.getByText('Active', { exact: true }),
      ).toBeVisible();
      await expect(radioGroup.getByText('Inactive')).toBeVisible();

      // Click Inactive and verify the table still renders
      await radioGroup.getByText('Inactive').click();
      await expect(credentialColumnHeader(page, 'Access Key')).toBeVisible();

      // Switch back to Active and verify the table still renders
      await radioGroup.getByText('Active', { exact: true }).click();
      await expect(credentialColumnHeader(page, 'Access Key')).toBeVisible();
    });
  },
);
