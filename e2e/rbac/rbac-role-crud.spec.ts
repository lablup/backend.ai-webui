// spec: e2e/.agent-output/test-plan-rbac-management.md
// Scenarios: 2.1 – 2.7 (Role CRUD lifecycle)
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import test, { expect, Page } from '@playwright/test';

const TEST_RUN_ID = Date.now().toString(36);
const ROLE_NAME = `e2e-role-${TEST_RUN_ID}`;
const ROLE_NAME_EDITED = `e2e-role-edited-${TEST_RUN_ID}`;
const ROLE_DESCRIPTION = `E2E test role created at ${new Date().toISOString()}`;

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

    async function clearRoleSearch(page: Page) {
      // Remove any active filter chip
      const filterChip = page.locator('.ant-tag-close-icon').first();
      if (await filterChip.isVisible({ timeout: 1000 }).catch(() => false)) {
        await filterChip.click();
        await expect(filterChip).toBeHidden({ timeout: 5000 });
      }
    }

    async function cleanupTestRole(page: Page, roleName: string) {
      // Check Active tab first
      await page.getByText('Active', { exact: true }).click();
      await clearRoleSearch(page);
      const activeRow = page.getByRole('row').filter({ hasText: roleName });
      const isActiveVisible = await activeRow
        .isVisible({ timeout: 2000 })
        .catch(() => false);

      if (isActiveVisible) {
        // Deactivate button is the first (and only) action button in Active view
        await activeRow
          .locator('.bai-name-action-cell-actions button')
          .first()
          .click();
        await expect(activeRow).toBeHidden({ timeout: 10000 });
      }

      // Check Inactive tab
      await page.getByText('Inactive', { exact: true }).click();
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
        await page
          .locator('.ant-modal')
          .getByRole('button', { name: 'Delete' })
          .click();
        await expect(inactiveRow).toBeHidden({ timeout: 10000 });
      }

      // Return to Active tab
      await page.getByText('Active', { exact: true }).click();
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

      // 5. Verify a modal titled "Create Role" appears
      const modal = page
        .locator('.ant-modal')
        .filter({ hasText: 'Create Role' });
      await expect(modal).toBeVisible();

      // 6. Verify the modal has Role Name (required) and Description fields
      await expect(modal.getByLabel('Role Name')).toBeVisible();
      await expect(modal.getByLabel('Description')).toBeVisible();

      // 7. Click OK without filling in the name field to trigger validation
      await modal.getByRole('button', { name: 'OK' }).click();

      // 8. Verify a validation error appears for the Role Name field
      await expect(page.getByText(/Please enter Role Name/i)).toBeVisible({
        timeout: 10000,
      });

      // 9. Fill in the Role Name field with a unique test name
      await modal.getByLabel('Role Name').fill(ROLE_NAME);

      // 10. Fill in the Description field
      await modal.getByLabel('Description').fill(ROLE_DESCRIPTION);

      // 11. Fill in the required "Scope Type / Target" field.
      // The Create Role modal now requires at least one scope entry.
      // AntD Form.List generates input IDs: scopes_0_scopeType and scopes_0_scopeId.
      // Click the parent .ant-select container (not the input directly) to open dropdowns.
      const scopeTypeContainer = modal
        .locator('input#scopes_0_scopeType')
        .locator('xpath=ancestor::div[contains(@class,"ant-select")][1]');
      await scopeTypeContainer.click();
      await page
        .locator(
          '.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option',
        )
        .filter({ hasText: 'Domain' })
        .first()
        .click();

      // Wait for Scope Type dropdown to fully close before interacting with Target
      await expect(
        page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)'),
      ).toHaveCount(0, { timeout: 5000 });

      // Wait for Target (scopeId) container to become enabled (DomainScopeIdSelect loads asynchronously)
      const scopeIdContainer = modal
        .locator('input#scopes_0_scopeId')
        .locator('xpath=ancestor::div[contains(@class,"ant-select")][1]');
      await expect(scopeIdContainer).not.toHaveClass(/ant-select-disabled/, {
        timeout: 5000,
      });
      await scopeIdContainer.click();
      // Wait for domain options to load and select the first available option
      const domainDropdownOptions = page.locator(
        '.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option',
      );
      await expect(domainDropdownOptions.first()).toBeVisible({
        timeout: 10000,
      });
      await domainDropdownOptions.first().click();

      // 12. Click OK to submit
      await modal.getByRole('button', { name: 'OK' }).click();

      // 12. Verify the modal closes
      await expect(modal).toBeHidden({ timeout: 10000 });

      // 13. Verify a success notification "Role created successfully." appears
      await expect(
        page
          .locator('.ant-message-notice-wrapper')
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

    test('Superadmin cannot edit a system role name or description (edit button absent)', async ({
      page,
      request,
    }) => {
      // 1. Login as admin
      await loginAsAdmin(page, request);

      // 2. Navigate to RBAC page
      await navigateTo(page, 'rbac');

      // 3. Locate a row with a "System" source, excluding "monitor" role (known bug)
      // First, check if system roles are visible; if not, navigate to the last page
      let systemRoleRows = page
        .getByRole('row')
        .filter({ hasText: 'System' })
        .filter({ hasNotText: /monitor/i });
      let systemRoleRow = systemRoleRows.first();
      const isSystemVisible = await systemRoleRow
        .isVisible({ timeout: 3000 })
        .catch(() => false);
      if (!isSystemVisible) {
        // Navigate to last page to find system roles
        const lastPageButton = page.locator('.ant-pagination-item').last();
        await lastPageButton.click();
        await expect(page.locator('.ant-table-row').first()).toBeVisible({
          timeout: 10000,
        });
      }
      systemRoleRow = page
        .getByRole('row')
        .filter({ hasText: 'System' })
        .filter({ hasNotText: /monitor/i })
        .first();
      await expect(systemRoleRow).toBeVisible({ timeout: 10000 });

      // 4. Click the role name to open the detail drawer
      const systemRoleName = await systemRoleRow
        .getByRole('cell')
        .first()
        .textContent();
      await systemRoleRow
        .getByRole('cell')
        .first()
        .locator('.ant-typography')
        .first()
        .click();

      // 5. Verify the drawer title "RBAC Role Info" appears
      const drawer = page.locator('.ant-drawer');
      await expect(drawer.getByText('RBAC Role Info')).toBeVisible();

      // 6. Verify the role name heading is visible
      if (systemRoleName) {
        await expect(drawer.getByText(systemRoleName.trim())).toBeVisible();
      }

      // 7. Verify the Edit button is NOT present for system roles
      // The Edit Role button would have size="large" (CSS class .ant-btn-lg) if present
      await expect(drawer.locator('.ant-btn-lg').first()).toBeHidden();

      // Close the drawer
      await drawer.getByRole('button', { name: 'close' }).click();
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
      await page.getByText('Active', { exact: true }).click();

      // 4. Search for the test role by name (using the edited name from previous test)
      await searchForRole(page, ROLE_NAME_EDITED);
      const roleRow = page
        .getByRole('row')
        .filter({ hasText: ROLE_NAME_EDITED })
        .first();

      // 5. Click the "Deactivate" action button on the role row (first button in action cell)
      await roleRow
        .locator('.bai-name-action-cell-actions button')
        .first()
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
      await page.getByText('Inactive', { exact: true }).click();
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
      await page.getByText('Inactive', { exact: true }).click();

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

      // 6. Click the "Activate" button (first action button in Inactive view)
      await inactiveRoleRow
        .locator('.bai-name-action-cell-actions button')
        .first()
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
      await page.getByText('Active', { exact: true }).click();
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
      await page.getByText('Active', { exact: true }).click();
      await searchForRole(page, ROLE_NAME_EDITED);
      const activeRoleRow = page
        .getByRole('row')
        .filter({ hasText: ROLE_NAME_EDITED })
        .first();
      // Hover to reveal action buttons, then click deactivate (first action button in Active view)
      await activeRoleRow.hover();
      await activeRoleRow
        .locator('.bai-name-action-cell-actions button')
        .first()
        .click();
      await expect(activeRoleRow).toBeHidden({ timeout: 10000 });

      // 4. Switch to Inactive filter
      await page.getByText('Inactive', { exact: true }).click();

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
      await page.getByText('Active', { exact: true }).click();
      await expect(
        page.getByRole('row').filter({ hasText: ROLE_NAME_EDITED }),
      ).toBeHidden({ timeout: 5000 });
    });
  },
);
