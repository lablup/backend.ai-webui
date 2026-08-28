// spec: e2e/.agent-output/test-plan-rbac-management.md
// Scenarios: 1.1 – 1.4, 6.1, 6.4, 6.5 (Role list view, filtering, sorting, refresh)
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import test, { expect, Page } from '@playwright/test';

// `BAICard`'s `tabList` renders a `nav[aria-label="Tabs"]` of plain
// `<button>`s (BAITabList / Astryx `TabList`), not ARIA `tab` elements —
// `role="tab"` is never emitted unless `TabList` is given `role="tablist"`,
// which this app never does (see registry.spec.ts's identical pattern).
function rbacManagementTab(page: Page) {
  return page
    .getByRole('navigation', { name: 'Tabs' })
    .getByRole('button', { name: 'RBAC Management' });
}

// A BAITable column header's accessible NAME is overridden by its sort
// button's aria-label ("Sort by name") for sortable columns; match the
// header's visible TEXT instead (see resource-policy.spec.ts /
// registry.spec.ts for the identical pattern).
function roleColumnHeader(page: Page, label: string) {
  return page.getByRole('columnheader').filter({ hasText: label });
}

// Astryx `Table` renders native <table><tbody><tr role="row">; a plain
// getByRole('row') also matches the header row, so exclude it.
function roleDataRows(page: Page) {
  return page
    .getByRole('row')
    .filter({ hasNot: page.getByRole('columnheader') });
}

/**
 * Apply a filter using BAIPropertyFilter (Astryx PowerSearch), same
 * interaction model as environment.spec.ts / registry.spec.ts: open the
 * typeahead, pick the field, then fill/pick the Value in the edit popover.
 * Free-text fields (Role Name) commit on "Apply"; strict-selection fields
 * (Source) auto-commit when an option is picked.
 */
async function applyRoleFilter(page: Page, fieldLabel: string, value: string) {
  const searchBar = page.getByRole('combobox', { name: 'Search filters' });
  await searchBar.click();
  await page.getByRole('option', { name: fieldLabel, exact: true }).click();

  const valueTextbox = page.getByRole('textbox', { name: 'Value' });
  if (await valueTextbox.isVisible({ timeout: 3000 }).catch(() => false)) {
    await valueTextbox.fill(value);
    await page.getByRole('button', { name: 'Apply', exact: true }).click();
  } else {
    await page.getByRole('combobox', { name: 'Value' }).click();
    await page.getByRole('option', { name: value, exact: true }).click();
  }
}

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
      // The role table (909 roles in the shared nightly env) can take a
      // while to render on a busy shared backend; give it more headroom
      // than the default page-chrome wait.
      await expect(rbacManagementTab(page)).toBeVisible({ timeout: 30000 });

      // 4. Verify the "Create Role" button is visible and enabled
      await expect(
        page.getByRole('button', { name: 'Create Role' }),
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Create Role' }),
      ).toBeEnabled();

      // 5. Verify the status filter shows "Active" and "Inactive" options.
      // Scope to the status filter's radiogroup — the AutoAssign column also
      // renders per-row "Active"/"Inactive" tags, which collide with a bare
      // getByText locator (strict-mode violation).
      const statusFilter = page.getByRole('radiogroup');
      await expect(
        statusFilter.getByText('Active', { exact: true }),
      ).toBeVisible();
      await expect(
        statusFilter.getByText('Inactive', { exact: true }),
      ).toBeVisible();

      // 6. Verify the role table is rendered with expected column headers
      await expect(roleColumnHeader(page, 'Role Name')).toBeVisible();
      await expect(roleColumnHeader(page, 'Description')).toBeVisible();
      await expect(roleColumnHeader(page, 'Source')).toBeVisible();
      await expect(roleColumnHeader(page, 'Created At')).toBeVisible();
      await expect(roleColumnHeader(page, 'Updated At')).toBeVisible();

      // 7. Verify the table contains at least one row (system roles like "superadmin" should exist)
      await expect(roleDataRows(page).first()).toBeVisible({ timeout: 10000 });
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
      // The role table (909 roles in the shared nightly env) can take a
      // while to render on a busy shared backend; give it more headroom
      // than the default page-chrome wait.
      await expect(rbacManagementTab(page)).toBeVisible({ timeout: 30000 });
      const activeRows = roleDataRows(page);
      await expect(activeRows.first()).toBeVisible({ timeout: 10000 });

      // 4. Click the "Inactive" filter button.
      // Scope to the status filter's radiogroup — the AutoAssign column also
      // renders per-row "Active"/"Inactive" tags, which collide with a bare
      // getByText locator (strict-mode violation).
      const statusFilter = page.getByRole('radiogroup');
      await statusFilter.getByText('Inactive', { exact: true }).click();

      // 5. Verify the table updates (shows deleted roles or empty state message)
      // Either the table shows rows or an empty state — we only check that there's no error
      await expect(page.getByRole('table')).toBeVisible({ timeout: 10000 });

      // 6. Click the "Active" filter button
      await statusFilter.getByText('Active', { exact: true }).click();

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
      // The role table (909 roles in the shared nightly env) can take a
      // while to render on a busy shared backend; give it more headroom
      // than the default page-chrome wait.
      await expect(rbacManagementTab(page)).toBeVisible({ timeout: 30000 });
      await expect(page.getByRole('table')).toBeVisible();

      // 4-7. Apply a Role Name filter with a known partial name
      await applyRoleFilter(page, 'Role Name', 'super');

      // 8. Verify the table shows ONLY roles whose name matches the search.
      // Asserting "some row contains super" would also pass on an unfiltered
      // list, so require every returned row to match.
      await expect(roleDataRows(page).first()).toBeVisible({ timeout: 10000 });
      await expect(async () => {
        const rows = await roleDataRows(page).all();
        expect(rows.length).toBeGreaterThan(0);
        for (const row of rows) {
          // Role Name is the first column (RoleNodes.tsx column order).
          const name = await row.getByRole('cell').first().innerText();
          expect(name.toLowerCase()).toContain('super');
        }
      }).toPass({ timeout: 10000 });

      // 9. Remove the filter chip
      const filterChip = page.getByRole('button', {
        name: 'Remove Role Name: contains',
        exact: true,
      });
      await expect(filterChip).toBeVisible({ timeout: 5000 });
      await filterChip.click();

      // 10. Verify the full role list is restored
      await expect(roleDataRows(page).first()).toBeVisible({
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
      // The role table (909 roles in the shared nightly env) can take a
      // while to render on a busy shared backend; give it more headroom
      // than the default page-chrome wait.
      await expect(rbacManagementTab(page)).toBeVisible({ timeout: 30000 });

      // 4-6. Select "Source" and choose "System" — Source is a
      // strict-selection field, so picking the option auto-commits (no
      // separate Apply click, see PowerSearchToken.tsx PILOT-DECISION #1
      // in environment.spec.ts).
      await applyRoleFilter(page, 'Source', 'System');

      // 7. Verify the table shows only roles with "System" in the Source
      // column. The Source column renders plain text (no antd `.ant-tag`).
      // "at least one System cell exists" would also hold on an unfiltered
      // list, so require the Source cell of every returned row to be System.
      await expect(roleDataRows(page).first()).toBeVisible({ timeout: 10000 });
      await expect(async () => {
        const rows = await roleDataRows(page).all();
        expect(rows.length).toBeGreaterThan(0);
        for (const row of rows) {
          // Source is the 5th column (RoleNodes.tsx column order).
          const source = await row.getByRole('cell').nth(4).innerText();
          expect(source.trim()).toBe('System');
        }
      }).toPass({ timeout: 10000 });

      // 8. Remove the filter chip
      const filterChip = page.getByRole('button', {
        name: 'Remove Source: equals',
        exact: true,
      });
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
      // The role table (909 roles in the shared nightly env) can take a
      // while to render on a busy shared backend; give it more headroom
      // than the default page-chrome wait.
      await expect(rbacManagementTab(page)).toBeVisible({ timeout: 30000 });

      // 4. Apply a Role Name filter with a value that will not match any role
      await applyRoleFilter(page, 'Role Name', 'zzz-nonexistent-role-xyz');

      // 5. Verify the table shows an empty state message
      await expect(
        page.getByRole('heading', { name: 'No data to display' }),
      ).toBeVisible({ timeout: 10000 });

      // 6. Remove the filter
      const filterChip = page.getByRole('button', {
        name: 'Remove Role Name: contains',
        exact: true,
      });
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
      // The role table (909 roles in the shared nightly env) can take a
      // while to render on a busy shared backend; give it more headroom
      // than the default page-chrome wait.
      await expect(rbacManagementTab(page)).toBeVisible({ timeout: 30000 });
      await expect(roleDataRows(page).first()).toBeVisible({
        timeout: 10000,
      });

      // 4. Click the "Role Name" column header to sort ascending
      const nameHeader = roleColumnHeader(page, 'Role Name');
      await nameHeader.click();

      // 5. Verify the sort actually engaged — "header is still visible" would
      // pass even if clicking did nothing.
      await expect(nameHeader).toHaveAttribute('aria-sort', 'ascending', {
        timeout: 10000,
      });

      // 6. Click the "Role Name" column header again to sort descending
      await nameHeader.click();

      // 7. Verify the sort direction flipped and rows are still rendered
      await expect(nameHeader).toHaveAttribute('aria-sort', 'descending', {
        timeout: 10000,
      });
      await expect(roleDataRows(page).first()).toBeVisible({
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
      // The role table (909 roles in the shared nightly env) can take a
      // while to render on a busy shared backend; give it more headroom
      // than the default page-chrome wait.
      await expect(rbacManagementTab(page)).toBeVisible({ timeout: 30000 });
      await expect(roleDataRows(page).first()).toBeVisible({
        timeout: 10000,
      });

      // 4. Locate the Refresh button by its accessible name.
      const refreshButton = page.getByRole('button', { name: 'Refresh' });
      await expect(refreshButton).toBeVisible({ timeout: 10000 });

      // 5. Click the Refresh button
      await refreshButton.click();

      // 6. Verify the table reloads and still shows role rows
      await expect(roleDataRows(page).first()).toBeVisible({
        timeout: 10000,
      });
    });
  },
);
