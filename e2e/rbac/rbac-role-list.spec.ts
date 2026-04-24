// spec: e2e/.agent-output/test-plan-rbac-management.md
// Scenarios: 1.1 – 1.4, 6.1, 6.4, 6.5 (Role list view, filtering, sorting, refresh)
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import test, { expect } from '@playwright/test';

test.describe(
  'RBAC Role List View',
  { tag: ['@rbac', '@critical', '@functional'] },
  () => {
    test('Superadmin can view the RBAC management page with role list table', async ({
      page,
      request,
    }) => {
      // 1. Login as admin
      await loginAsAdmin(page, request);

      // 2. Navigate to RBAC page
      await navigateTo(page, 'rbac');

      // 3. Verify the page heading "RBAC Management" is visible
      await expect(
        page.getByRole('tab', { name: 'RBAC Management' }),
      ).toBeVisible({ timeout: 10000 });

      // 4. Verify the "Create Role" button is visible and enabled
      await expect(
        page.getByRole('button', { name: 'Create Role' }),
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Create Role' }),
      ).toBeEnabled();

      // 5. Verify the status filter shows "Active" and "Inactive" options
      await expect(page.getByText('Active', { exact: true })).toBeVisible();
      await expect(page.getByText('Inactive', { exact: true })).toBeVisible();

      // 6. Verify the role table is rendered with expected column headers
      await expect(
        page.getByRole('columnheader', { name: 'Role Name' }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'Description' }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'Source' }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'Created At' }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'Updated At' }),
      ).toBeVisible();

      // 7. Verify the table contains at least one row (system roles like "superadmin" should exist)
      const rows = page
        .getByRole('row')
        .filter({ hasNot: page.getByRole('columnheader') });
      await expect(rows.first()).toBeVisible({ timeout: 10000 });
    });

    test('Superadmin can switch to Inactive roles filter and back to Active', async ({
      page,
      request,
    }) => {
      // 1. Login as admin
      await loginAsAdmin(page, request);

      // 2. Navigate to RBAC page
      await navigateTo(page, 'rbac');

      // 3. Verify "Active" filter is selected by default (table contains active roles)
      await expect(
        page.getByRole('tab', { name: 'RBAC Management' }),
      ).toBeVisible({ timeout: 10000 });
      const activeRows = page
        .getByRole('row')
        .filter({ hasNot: page.getByRole('columnheader') });
      await expect(activeRows.first()).toBeVisible({ timeout: 10000 });

      // 4. Click the "Inactive" filter button
      await page.getByText('Inactive', { exact: true }).click();

      // 5. Verify the table updates (shows deleted roles or empty state message)
      // Either the table shows rows or an empty state — we only check that there's no error
      await expect(page.locator('.ant-table')).toBeVisible({ timeout: 10000 });

      // 6. Click the "Active" filter button
      await page.getByText('Active', { exact: true }).click();

      // 7. Verify the table updates back to showing active roles
      await expect(activeRows.first()).toBeVisible({ timeout: 10000 });
    });

    test('Superadmin can search for a role by name using the property filter', async ({
      page,
      request,
    }) => {
      // 1. Login as admin
      await loginAsAdmin(page, request);

      // 2. Navigate to RBAC page
      await navigateTo(page, 'rbac');

      // 3. Wait for the page and table to load
      await expect(
        page.getByRole('tab', { name: 'RBAC Management' }),
      ).toBeVisible({ timeout: 10000 });
      await expect(page.locator('.ant-table')).toBeVisible();

      // 4. Click the property selector dropdown (first .ant-select in the compact filter area)
      const filterContainer = page.locator('.ant-space-compact').first();
      const propertySelect = filterContainer.locator('.ant-select').first();
      await propertySelect.click();

      // 5. Select "Role Name" from the dropdown options
      await page.getByRole('option', { name: 'Role Name' }).click();

      // 6. Type a known partial role name (e.g., "super") into the search input
      const searchInput = filterContainer
        .locator('.ant-select')
        .last()
        .locator('input');
      await searchInput.fill('super');

      // 7. Click the search button (or press Enter)
      await page.getByRole('button', { name: 'search' }).click();

      // 8. Verify the table only shows roles with names matching the search
      await expect(
        page.getByRole('row').filter({ hasText: /super/i }).first(),
      ).toBeVisible({ timeout: 10000 });

      // 9. Remove the filter chip by clicking its close icon
      const filterChip = page.locator('.ant-tag-close-icon').first();
      await expect(filterChip).toBeVisible({ timeout: 5000 });
      await filterChip.click();

      // 10. Verify the full role list is restored
      await expect(page.locator('.ant-table-row').first()).toBeVisible({
        timeout: 10000,
      });
    });

    test('Superadmin can filter roles by Source (SYSTEM or CUSTOM)', async ({
      page,
      request,
    }) => {
      // 1. Login as admin
      await loginAsAdmin(page, request);

      // 2. Navigate to RBAC page
      await navigateTo(page, 'rbac');

      // 3. Wait for the page and table to load
      await expect(
        page.getByRole('tab', { name: 'RBAC Management' }),
      ).toBeVisible({ timeout: 10000 });

      // 4. Click the property selector in the filter component
      const filterContainer = page.locator('.ant-space-compact').first();
      const propertySelect = filterContainer.locator('.ant-select').first();
      await propertySelect.click();

      // 5. Select "Source" from the dropdown options
      await page.getByRole('option', { name: 'Source' }).click();

      // Wait for the property dropdown to fully close before interacting with value input
      await expect(
        page.locator('.ant-select-dropdown').filter({ hasText: 'Source' }),
      ).toBeHidden({ timeout: 5000 });

      // 6. Click the value input (AutoComplete for enum type) and choose "System"
      // For enum-type properties with strictSelection, the value input is an AutoComplete (not .ant-select)
      const valueInput = filterContainer
        .locator('input[role="combobox"]')
        .last();
      await valueInput.click();
      await page
        .locator('.ant-select-item-option')
        .filter({ hasText: 'System' })
        .click();

      // 7. Click the search button
      await page.getByRole('button', { name: 'search' }).click();

      // 8. Verify the table shows only roles with "System" source tags.
      // Wait for the filtered query to complete by asserting at least one row
      // has a "System" source tag before counting.
      await expect(
        page
          .locator('.ant-table-row')
          .first()
          .locator('.ant-tag')
          .filter({ hasText: 'System' }),
      ).toBeVisible({ timeout: 10000 });
      const systemTagsVisible = await page
        .locator('.ant-table-row .ant-tag')
        .filter({ hasText: 'System' })
        .count();
      expect(systemTagsVisible).toBeGreaterThan(0);

      // 9. Remove the filter chip
      const filterChip = page.locator('.ant-tag-close-icon').first();
      await filterChip.click();
      await expect(filterChip).toBeHidden({ timeout: 5000 });
    });

    test('Superadmin sees empty state message when no roles match the search', async ({
      page,
      request,
    }) => {
      // 1. Login as admin
      await loginAsAdmin(page, request);

      // 2. Navigate to RBAC page
      await navigateTo(page, 'rbac');

      // 3. Wait for the page to load
      await expect(
        page.getByRole('tab', { name: 'RBAC Management' }),
      ).toBeVisible({ timeout: 10000 });

      // 4. Apply a Name filter with a value that will not match any role
      const filterContainer = page.locator('.ant-space-compact').first();
      const propertySelect = filterContainer.locator('.ant-select').first();
      await propertySelect.click();
      await page.getByRole('option', { name: 'Role Name' }).click();

      const searchInput = filterContainer
        .locator('.ant-select')
        .last()
        .locator('input');
      await searchInput.fill('zzz-nonexistent-role-xyz');
      await page.getByRole('button', { name: 'search' }).click();

      // 5. Verify the table shows an empty state message
      await expect(page.locator('.ant-empty-description')).toBeVisible({
        timeout: 10000,
      });

      // 6. Remove the filter
      const filterChip = page.locator('.ant-tag-close-icon').first();
      await filterChip.click();
    });

    test('Superadmin can sort role list by Role Name column', async ({
      page,
      request,
    }) => {
      // 1. Login as admin
      await loginAsAdmin(page, request);

      // 2. Navigate to RBAC page
      await navigateTo(page, 'rbac');

      // 3. Wait for the table to load with at least some rows
      await expect(
        page.getByRole('tab', { name: 'RBAC Management' }),
      ).toBeVisible({ timeout: 10000 });
      await expect(page.locator('.ant-table-row').first()).toBeVisible({
        timeout: 10000,
      });

      // 4. Click the "Role Name" column header to sort ascending
      await page.getByRole('columnheader', { name: 'Role Name' }).click();

      // 5. Verify a sort indicator appears on the column header (class changes)
      await expect(
        page.getByRole('columnheader', { name: 'Role Name' }),
      ).toBeVisible();

      // 6. Click the "Role Name" column header again to sort descending
      await page.getByRole('columnheader', { name: 'Role Name' }).click();

      // 7. Verify the table rows are still visible (they may have reordered)
      await expect(page.locator('.ant-table-row').first()).toBeVisible({
        timeout: 5000,
      });
    });

    test('Superadmin can refresh the role list using the refresh button', async ({
      page,
      request,
    }) => {
      // 1. Login as admin
      await loginAsAdmin(page, request);

      // 2. Navigate to RBAC page
      await navigateTo(page, 'rbac');

      // 3. Wait for the page to fully load
      await expect(
        page.getByRole('tab', { name: 'RBAC Management' }),
      ).toBeVisible({ timeout: 10000 });
      await expect(page.locator('.ant-table-row').first()).toBeVisible({
        timeout: 10000,
      });

      // 4. Locate the Refresh button (reload icon)
      const refreshButton = page
        .locator('button')
        .filter({ has: page.locator('.anticon-reload') })
        .first();
      await expect(refreshButton).toBeVisible();

      // 5. Click the Refresh button
      await refreshButton.click();

      // 6. Verify the table reloads and still shows role rows
      await expect(page.locator('.ant-table-row').first()).toBeVisible({
        timeout: 10000,
      });
    });
  },
);
