// spec: e2e/.agent-output/test-plan-rbac-management.md
// Scenarios: 2.1 – 2.7 (Role CRUD lifecycle)
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import test, { expect, Page } from '@playwright/test';

const TEST_RUN_ID = Date.now().toString(36);
const ROLE_NAME = `e2e-role-${TEST_RUN_ID}`;
const ROLE_NAME_EDITED = `e2e-role-edited-${TEST_RUN_ID}`;
const ROLE_DESCRIPTION = `E2E test role created at ${new Date().toISOString()}`;

// Run all groups in this file in order on a single worker so the independent
// system-role check below doesn't interleave with the CRUD chain (role
// creation/purging shifts table pagination).
test.describe.configure({ mode: 'default' });

// Keep serial: lifecycle chain on a single custom role — create → edit (rename)
// → deactivate → activate → purge all share ROLE_NAME / ROLE_NAME_EDITED state.
test.describe.serial(
  'RBAC Role CRUD',
  { tag: ['@rbac', '@critical', '@functional'] },
  () => {
    async function searchForRole(page: Page, roleName: string) {
      // Use the property filter to search for the role by name
      const filterContainer = page.locator('.ant-space-compact').first();
      const propertySelect = filterContainer.locator('.ant-select').first();
      await propertySelect.click();
      await page.getByRole('option', { name: 'Role Name' }).click();
      const searchInput = filterContainer
        .locator('.ant-select')
        .last()
        .locator('input');
      await searchInput.fill(roleName);
      await page.getByRole('button', { name: 'search' }).click();
      await expect(
        page.getByRole('row').filter({ hasText: roleName }).first(),
      ).toBeVisible({ timeout: 10000 });
    }

    // Scope status-filter clicks to the radiogroup — the AutoAssign column
    // also renders per-row "Active"/"Inactive" tags, which collide with a
    // bare getByText locator (strict-mode violation).
    function statusFilterOption(page: Page, status: 'Active' | 'Inactive') {
      return page.getByRole('radiogroup').getByText(status, { exact: true });
    }

    async function clearRoleSearch(page: Page) {
      // Remove any active filter chip — scope to the filter-chip area so we
      // don't accidentally click tag close icons in the table itself.
      const filterChip = page
        .locator('.ant-space-compact')
        .first()
        .locator('.ant-tag-close-icon')
        .first();
      if (await filterChip.isVisible({ timeout: 1000 }).catch(() => false)) {
        await filterChip.click();
        await expect(filterChip).toBeHidden({ timeout: 5000 });
      }
    }

    async function cleanupTestRole(page: Page, roleName: string) {
      // Check Active tab first
      await statusFilterOption(page, 'Active').click();
      await clearRoleSearch(page);
      const activeRow = page.getByRole('row').filter({ hasText: roleName });
      const isActiveVisible = await activeRow
        .isVisible({ timeout: 2000 })
        .catch(() => false);

      if (isActiveVisible) {
        // Deactivate button is the first (and only) action button in Active view.
        // It is wrapped in a BAINameActionCell popConfirm (Astryx Popover,
        // role="dialog" labeled by the action's title) that requires a second
        // "Deactivate" click.
        await activeRow
          .locator('.bai-name-action-cell-actions button')
          .first()
          .click();
        await page
          .getByRole('dialog', { name: 'Deactivate' })
          .getByRole('button', { name: 'Deactivate', exact: true })
          .click();
        await expect(activeRow).toBeHidden({ timeout: 10000 });
      }

      // Check Inactive tab
      await statusFilterOption(page, 'Inactive').click();
      await clearRoleSearch(page);
      const inactiveRow = page.getByRole('row').filter({ hasText: roleName });
      const isInactiveVisible = await inactiveRow
        .isVisible({ timeout: 2000 })
        .catch(() => false);

      if (isInactiveVisible) {
        // Purge Role button is the second (last) action button in Inactive view
        await inactiveRow
          .locator('.bai-name-action-cell-actions button')
          .last()
          .click();
        // BAIDeleteConfirmModal requires typing the role name into its
        // textbox (carries `name="confirmText"`, not `id`) before Delete
        // enables.
        const purgeModal = page.getByRole('dialog', { name: 'Purge Role' });
        await expect(purgeModal).toBeVisible({ timeout: 5000 });
        await purgeModal.getByRole('textbox').fill(roleName);
        await purgeModal.getByRole('button', { name: 'Delete' }).click();
        await expect(inactiveRow).toBeHidden({ timeout: 10000 });
      }

      // Return to Active tab
      await statusFilterOption(page, 'Active').click();
      await clearRoleSearch(page);
    }

    test('Superadmin can create a new custom role with name and description', async ({
      page,
      request,
    }) => {
      // 1. Login as admin
      await loginAsAdmin(page, request);

      // 2. Navigate to RBAC page
      await navigateTo(page, 'rbac');

      // 3. Run cleanup to remove any leftover test roles from previous runs
      await cleanupTestRole(page, ROLE_NAME);
      await cleanupTestRole(page, ROLE_NAME_EDITED);

      // 4. Click the "Create Role" button
      await page.getByRole('button', { name: 'Create Role' }).click();

      // 5. Verify a modal titled "Create Role" appears (RoleFormModal renders
      // BAIModal, an Astryx dialog whose accessible name is its title).
      const modal = page.getByRole('dialog', { name: 'Create Role' });
      await expect(modal).toBeVisible();

      // 6. Verify the modal has Role Name (required) and Description fields
      await expect(modal.getByLabel('Role Name')).toBeVisible();
      await expect(modal.getByLabel('Description')).toBeVisible();

      // 7. Click OK without filling in the name field to trigger validation.
      // Use dispatchEvent to ensure the click reaches React's event handler
      // even though the modal renders as a portal outside the React root.
      const okButton = modal.getByRole('button', { name: 'OK' });
      await okButton.dispatchEvent('click');

      // 8. Verify a validation error appears for the Role Name field.
      // Scope to the modal's form error area for reliability.
      await expect(
        modal.locator('[data-bai-form-item-explain-error]').filter({
          hasText: /Please enter Role Name/i,
        }),
      ).toBeVisible({ timeout: 10000 });

      // 9. Fill in the Role Name field with a unique test name
      await modal.getByLabel('Role Name').fill(ROLE_NAME);

      // 10. Fill in the Description field
      await modal.getByLabel('Description').fill(ROLE_DESCRIPTION);

      // 11. Fill in the required "Scope Type / Target" field.
      // ScopeRow renders BAISelect (Scope Type) and ScopeIdSelect (Target) as
      // Astryx Selector triggers (`role="button"`), each opening a floating
      // `listbox`/`option` panel — not an antd `.ant-select`.
      await modal.getByRole('button', { name: 'Scope Type' }).click();
      await page.getByRole('option', { name: 'Domain', exact: true }).click();

      // Wait for the Target select to become enabled (DomainScopeIdSelect
      // loads its options asynchronously once a scope type is picked) and
      // pick the first available domain.
      const targetTrigger = modal.getByRole('button', { name: 'Target' });
      await expect(targetTrigger).toBeEnabled({ timeout: 5000 });
      await targetTrigger.click();
      const targetOptions = page
        .getByRole('listbox', { name: 'Target' })
        .getByRole('option');
      await expect(targetOptions.first()).toBeVisible({ timeout: 10000 });
      await targetOptions.first().click();

      // 12. Click OK to submit
      await modal.getByRole('button', { name: 'OK' }).click();

      // 12. Verify the modal closes
      await expect(modal).toBeHidden({ timeout: 10000 });

      // 13. Verify a success notification "Role created successfully." appears.
      // RoleFormModal reports through the app-shim's `message.success`, which
      // is backed by an Astryx toast (role="status"), not BAINotificationStack.
      await expect(
        page
          .getByRole('status')
          .filter({ hasText: /Role created successfully/i }),
      ).toBeVisible({ timeout: 10000 });

      // 14. Creation is validated via the success notification.
      // Avoid asserting table row visibility here because the RBAC role list is paginated
      // and the newly created role may not be rendered on the current table page.
    });

    test('Superadmin can edit a custom role name and description via drawer', async ({
      page,
      request,
    }) => {
      // 1. Login as admin
      await loginAsAdmin(page, request);

      // 2. Navigate to RBAC page
      await navigateTo(page, 'rbac');

      // Wait for RBAC page to fully load before interacting
      await expect(
        page.getByRole('tab', { name: 'RBAC Management' }),
      ).toBeVisible({ timeout: 10000 });
      await expect(page.locator('.ant-table-row').first()).toBeVisible({
        timeout: 10000,
      });

      // 3. Search for the test custom role by name (pagination may hide it otherwise)
      await searchForRole(page, ROLE_NAME);
      const roleRow = page
        .getByRole('row')
        .filter({ hasText: ROLE_NAME })
        .first();

      // 4. Click the role name cell's typography element to open the detail drawer
      await roleRow
        .getByRole('cell')
        .first()
        .locator('.ant-typography')
        .first()
        .click();

      // 5. Verify the drawer opens and title "RBAC Role Info" appears
      const drawer = page.locator('.ant-drawer');
      await expect(page.locator('.ant-drawer-content-wrapper')).toBeVisible({
        timeout: 10000,
      });
      await expect(drawer.getByText('RBAC Role Info')).toBeVisible();

      // 6. Verify the Edit button is visible (only for CUSTOM roles), which also confirms data loaded
      // The Edit Role button is an icon-only button with size="large" (CSS class .ant-btn-lg), unique in the drawer
      const editButton = drawer.locator('.ant-btn-lg').first();
      await expect(editButton).toBeVisible({ timeout: 10000 });

      // 8. Click the Edit button
      await editButton.click();

      // 9. Verify a modal titled "Edit Role" appears with pre-filled name and description
      const editModal = page
        .locator('.ant-modal')
        .filter({ hasText: 'Edit Role' });
      await expect(editModal).toBeVisible();
      await expect(editModal.getByLabel('Role Name')).toHaveValue(ROLE_NAME);

      // 10. Clear the Role Name field and type a new name
      await editModal.getByLabel('Role Name').clear();
      await editModal.getByLabel('Role Name').fill(ROLE_NAME_EDITED);

      // 11. Clear the Description field and type an updated description
      await editModal.getByLabel('Description').clear();
      await editModal.getByLabel('Description').fill('Updated description');

      // 12. Click OK to save changes
      await editModal.getByRole('button', { name: 'OK' }).click();

      // 13. Verify the modal closes
      await expect(editModal).toBeHidden({ timeout: 10000 });

      // 14. Verify a success notification "Role updated successfully." appears
      await expect(
        page
          .locator('.ant-message-notice-wrapper')
          .filter({ hasText: /Role updated successfully/i }),
      ).toBeVisible({ timeout: 10000 });

      // 15. Verify the drawer heading updates to the new role name
      await expect(drawer.getByText(ROLE_NAME_EDITED)).toBeVisible({
        timeout: 10000,
      });

      // 16. Close the drawer
      await drawer.getByRole('button', { name: 'close' }).click();
      await expect(page.locator('.ant-drawer-content-wrapper')).toBeHidden({
        timeout: 5000,
      });
    });

    test('Superadmin can delete (soft-delete) an active custom role', async ({
      page,
      request,
    }) => {
      // 1. Login as admin
      await loginAsAdmin(page, request);

      // 2. Navigate to RBAC page
      await navigateTo(page, 'rbac');

      // 3. Ensure "Active" filter is selected
      await statusFilterOption(page, 'Active').click();

      // 4. Search for the test role by name (using the edited name from previous test)
      await searchForRole(page, ROLE_NAME_EDITED);
      const roleRow = page
        .getByRole('row')
        .filter({ hasText: ROLE_NAME_EDITED })
        .first();

      // 5. Click the "Deactivate" action button on the role row (first button in action cell)
      // The deactivate action is gated by a Popconfirm — click the button then confirm.
      await roleRow
        .locator('.bai-name-action-cell-actions button')
        .first()
        .click();
      await page
        .locator('.ant-popconfirm')
        .getByRole('button', { name: 'Deactivate' })
        .click();

      // 6. Verify the role disappears from the "Active" roles list
      await expect(roleRow).toBeHidden({ timeout: 10000 });

      // 7. Verify a success notification "Role deactivated successfully." appears
      await expect(
        page
          .locator('.ant-message-notice-wrapper')
          .filter({ hasText: /Role deactivated successfully/i }),
      ).toBeVisible({ timeout: 10000 });

      // 8. Click the "Inactive" filter to verify the role appears there
      await statusFilterOption(page, 'Inactive').click();
      await searchForRole(page, ROLE_NAME_EDITED);
    });

    test('Superadmin can activate (restore) a soft-deleted role', async ({
      page,
      request,
    }) => {
      // 1. Login as admin
      await loginAsAdmin(page, request);

      // 2. Navigate to RBAC page
      await navigateTo(page, 'rbac');

      // 3. Click the "Inactive" filter button
      await statusFilterOption(page, 'Inactive').click();

      // 4. Search for the test role by name and locate the row
      await searchForRole(page, ROLE_NAME_EDITED);
      const inactiveRoleRow = page
        .getByRole('row')
        .filter({ hasText: ROLE_NAME_EDITED })
        .first();

      // 5. Verify an "Activate" action button is visible (first button in action cell)
      await expect(
        inactiveRoleRow.locator('.bai-name-action-cell-actions button').first(),
      ).toBeVisible();

      // 6. Click the "Activate" button (first action button in Inactive view).
      // The activate action is gated by a Popconfirm — click the button then confirm.
      await inactiveRoleRow
        .locator('.bai-name-action-cell-actions button')
        .first()
        .click();
      await page
        .locator('.ant-popconfirm')
        .getByRole('button', { name: 'Activate' })
        .click();

      // 7. Verify a success notification "Role activated successfully." appears
      await expect(
        page
          .locator('.ant-message-notice-wrapper')
          .filter({ hasText: /Role activated successfully/i }),
      ).toBeVisible({ timeout: 10000 });

      // 8. Verify the role disappears from the Inactive list
      await expect(inactiveRoleRow).toBeHidden({ timeout: 10000 });

      // 9. Click the "Active" filter and verify the role reappears there
      await statusFilterOption(page, 'Active').click();
      await searchForRole(page, ROLE_NAME_EDITED);
    });

    test('Superadmin can purge (hard-delete) a soft-deleted role', async ({
      page,
      request,
    }) => {
      // 1. Login as admin
      await loginAsAdmin(page, request);

      // 2. Navigate to RBAC page
      await navigateTo(page, 'rbac');

      // 3. Deactivate the role first (so it's in the Inactive state for purging)
      await statusFilterOption(page, 'Active').click();
      await searchForRole(page, ROLE_NAME_EDITED);
      const activeRoleRow = page
        .getByRole('row')
        .filter({ hasText: ROLE_NAME_EDITED })
        .first();
      // Hover to reveal action buttons, then click deactivate (first action button in Active view).
      // The deactivate action is gated by a Popconfirm — click the button then confirm.
      await activeRoleRow.hover();
      await activeRoleRow
        .locator('.bai-name-action-cell-actions button')
        .first()
        .click();
      await page
        .locator('.ant-popconfirm')
        .getByRole('button', { name: 'Deactivate' })
        .click();
      await expect(activeRoleRow).toBeHidden({ timeout: 10000 });

      // 4. Switch to Inactive filter
      await statusFilterOption(page, 'Inactive').click();

      // 5. Search for and locate the deleted test role row
      await searchForRole(page, ROLE_NAME_EDITED);
      const inactiveRoleRow = page
        .getByRole('row')
        .filter({ hasText: ROLE_NAME_EDITED })
        .first();

      // 6. Hover to reveal action buttons, then verify "Purge Role" button is visible
      await inactiveRoleRow.hover();
      await expect(
        inactiveRoleRow.locator('.bai-name-action-cell-actions button').last(),
      ).toBeVisible();

      // 7. Click the "Purge Role" button (last action button in Inactive view)
      await inactiveRoleRow
        .locator('.bai-name-action-cell-actions button')
        .last()
        .click();

      // 8. Verify a confirmation modal titled "Purge Role" appears
      const purgeModal = page
        .locator('.ant-modal')
        .filter({ hasText: 'Purge Role' });
      await expect(purgeModal).toBeVisible();

      // 9. Verify the modal contains the role name
      await expect(purgeModal.getByText(ROLE_NAME_EDITED)).toBeVisible();

      // 9a. Type the role name in the confirmation input to enable the Delete button.
      // BAIDeleteConfirmModal with requireConfirmInput=true requires typing the confirmText
      // before the Delete button becomes enabled.
      await purgeModal.locator('input').fill(ROLE_NAME_EDITED);

      // 10. Click the Delete button in the modal to confirm purge
      await purgeModal.getByRole('button', { name: 'Delete' }).click();

      // 11. Verify a success notification "Role permanently removed." appears
      await expect(
        page
          .locator('.ant-message-notice-wrapper')
          .filter({ hasText: /Role permanently removed/i }),
      ).toBeVisible({ timeout: 10000 });

      // 12. Verify the role no longer appears in the Inactive list
      await expect(inactiveRoleRow).toBeHidden({ timeout: 10000 });

      // 13. Verify the role also doesn't appear in the Active list
      await statusFilterOption(page, 'Active').click();
      await expect(
        page.getByRole('row').filter({ hasText: ROLE_NAME_EDITED }),
      ).toBeHidden({ timeout: 5000 });
    });
  },
);

// Independent of the CRUD chain above: only reads existing system roles, so a
// chain failure must not skip it (extracted from the serial block in FR-3113).
test.describe(
  'RBAC System Role Restrictions',
  { tag: ['@rbac', '@critical', '@functional'] },
  () => {
    test('Superadmin cannot edit a system role name or description (edit button absent)', async ({
      page,
      request,
    }) => {
      // 1. Login as admin
      await loginAsAdmin(page, request);

      // 2. Navigate to RBAC page
      await navigateTo(page, 'rbac');

      // 3. Wait for the table's first data row. The header row renders before
      // the query resolves, so only a data row proves the list loaded — and
      // the 3s system-row probe below is conditional, so an unloaded table
      // silently sends the test to a pagination bar that does not exist yet.
      await expect(page.getByRole('row').nth(1)).toBeVisible({
        timeout: 30000,
      });

      // 4. Locate system roles by their "Source" cell value being exactly
      // "System", excluding "monitor" (known bug). Real rows/cells come from
      // `BAITable`'s semantic `<table>`, so role-based locators reach them —
      // the header row has `columnheader`s, not `cell`s, so it never matches.
      // If no system row is visible on page 1, navigate to the last page
      // where they accumulate.
      const systemRoleRowLocator = () =>
        page
          .getByRole('row')
          .filter({
            has: page.getByRole('cell', { name: 'System', exact: true }),
          })
          .filter({ hasNotText: /monitor/i })
          .first();

      let systemRoleRow = systemRoleRowLocator();
      const isSystemVisible = await systemRoleRow
        .isVisible({ timeout: 3000 })
        .catch(() => false);
      if (!isSystemVisible) {
        // Navigate to the last page button in the pagination bar.
        const lastPageButton = page
          .getByRole('button', { name: /^Go to page \d+$/ })
          .last();
        await lastPageButton.click();
        systemRoleRow = systemRoleRowLocator();
      }
      await expect(systemRoleRow).toBeVisible({ timeout: 10000 });

      // 5. Click the role name to open the detail drawer. BAINameActionCell
      // renders the title as a button when `onTitleClick` is set, and it is
      // the first control in the row's first cell (actions come after it).
      const titleElement = systemRoleRow
        .getByRole('cell')
        .first()
        .getByRole('button')
        .first();
      // Extract name for later verification (must be done before click to avoid stale ref)
      const systemRoleName = (await titleElement.textContent())?.trim() ?? null;
      await titleElement.click();

      // 6. Verify the drawer title "RBAC Role Info" appears. `RoleDetailDrawer`
      // renders `BAIDrawer` (Astryx lab `Drawer`), an Astryx dialog whose
      // accessible name is its fixed `label` — the role name is the visible
      // heading text, not the dialog's name.
      const drawer = page.getByRole('dialog', { name: 'RBAC Role Info' });
      await expect(drawer).toBeVisible();

      // 7. Verify the drawer heading matches the role name we clicked.
      // `BAIDrawer`'s title renders through Astryx `Heading level={5}`.
      if (systemRoleName) {
        await expect(
          drawer
            .getByRole('heading', { level: 5 })
            .filter({ hasText: systemRoleName }),
        ).toBeVisible({
          timeout: 5000,
        });
      }

      // 8. Verify the Edit button is NOT present for system roles.
      // `RoleDetailDrawer` only renders the Edit Role `IconButton` (aria-label
      // "Edit Role") when `role.source === 'CUSTOM'`.
      await expect(
        drawer.getByRole('button', { name: 'Edit Role' }),
      ).toBeHidden();

      // Close the drawer
      await drawer.getByRole('button', { name: 'Close' }).click();
    });
  },
);
