// spec: e2e/.agent-output/test-plan-rbac-management.md
// Scenarios: 3.1 – 3.4, 4.1 – 4.4, 5.1 – 5.4, 6.2 – 6.3
// (Role detail drawer, permissions management, user assignments, edge cases)
import { loginAsAdmin, navigateTo, userInfo } from '../utils/test-util';
import test, { expect, Page } from '@playwright/test';

const TEST_RUN_ID = Date.now().toString(36);
const ROLE_NAME = `e2e-detail-role-${TEST_RUN_ID}`;
const ROLE_DESCRIPTION = `E2E detail test role created at ${new Date().toISOString()}`;

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

async function createTestRole(page: Page) {
  await page.getByRole('button', { name: 'Create Role' }).click();
  const modal = page.locator('.ant-modal').filter({ hasText: 'Create Role' });
  await expect(modal).toBeVisible();
  await modal.getByLabel('Role Name').fill(ROLE_NAME);
  await modal.getByLabel('Description').fill(ROLE_DESCRIPTION);

  // Fill in the required "Scope Type / Target" field.
  // AntD Form.List generates input IDs: scopes_0_scopeType and scopes_0_scopeId.
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

  // Wait for Target (scopeId) container to become enabled
  const scopeIdContainer = modal
    .locator('input#scopes_0_scopeId')
    .locator('xpath=ancestor::div[contains(@class,"ant-select")][1]');
  await expect(scopeIdContainer).not.toHaveClass(/ant-select-disabled/, {
    timeout: 5000,
  });
  // Click the combobox to open the dropdown; retry if it doesn't open because the
  // component may still be mounting after Domain was selected.
  const domainDropdownOptions = page.locator(
    '.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option',
  );
  await expect(async () => {
    await scopeIdContainer.click();
    await expect(domainDropdownOptions.first()).toBeVisible({ timeout: 2000 });
  }).toPass({ timeout: 15000 });
  await domainDropdownOptions.first().click();

  // Wait for Target dropdown to fully close before submitting
  await expect(
    page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)'),
  ).toHaveCount(0, { timeout: 5000 });

  await modal.getByRole('button', { name: 'OK' }).click();
  await expect(modal).toBeHidden({ timeout: 10000 });
  // Verify success notification instead of row visibility (pagination may hide the new row)
  await expect(
    page
      .locator('.ant-message-notice-wrapper')
      .filter({ hasText: /Role created successfully/i }),
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

async function cleanupTestRole(page: Page) {
  // Close any lingering drawer from a previous test so it doesn't block clicks.
  const openDrawer = page.locator('.ant-drawer-open');
  if (await openDrawer.isVisible().catch(() => false)) {
    await openDrawer.getByRole('button', { name: 'close' }).first().click();
    await expect(openDrawer).toBeHidden({ timeout: 5000 });
  }

  // Check Active tab first
  await page.getByText('Active', { exact: true }).click();
  await clearRoleSearch(page);
  // Use name filter to find the role even if it's on a later page
  const filterContainer = page.locator('.ant-space-compact').first();
  const propertySelect = filterContainer.locator('.ant-select').first();
  await propertySelect.click();
  await page.getByRole('option', { name: 'Role Name' }).click();
  const activeSearchInput = filterContainer
    .locator('.ant-select')
    .last()
    .locator('input');
  await activeSearchInput.fill(ROLE_NAME);
  await page.getByRole('button', { name: 'search' }).click();

  const activeRow = page
    .getByRole('row')
    .filter({ hasText: ROLE_NAME })
    .first();
  const isActiveVisible = await activeRow
    .isVisible({ timeout: 2000 })
    .catch(() => false);

  if (isActiveVisible) {
    // Retry deactivation until the row is removed from the Active list.
    // A stale "Role deactivated" notice from a parallel test can make a single
    // notification check unreliable, so drive the loop off of row visibility instead.
    await expect(async () => {
      await activeRow.hover();
      const deactivateBtn = activeRow
        .locator('.bai-name-action-cell-actions button')
        .first();
      await expect(deactivateBtn).toBeVisible();
      await deactivateBtn.click();
      await expect(activeRow).toBeHidden({ timeout: 5000 });
    }).toPass({ timeout: 20000 });
  }

  // Check Inactive tab
  await page.getByText('Inactive', { exact: true }).click();
  await clearRoleSearch(page);
  const inactivePropertySelect = filterContainer.locator('.ant-select').first();
  await inactivePropertySelect.click();
  await page.getByRole('option', { name: 'Role Name' }).click();
  const inactiveSearchInput = filterContainer
    .locator('.ant-select')
    .last()
    .locator('input');
  await inactiveSearchInput.fill(ROLE_NAME);
  await page.getByRole('button', { name: 'search' }).click();

  // Purge every inactive row matching the role name. A parallel describe block
  // in this file may share the same ROLE_NAME and create additional roles while
  // this cleanup runs, so keep purging until no matching row remains.
  while (true) {
    const inactiveRow = page
      .getByRole('row')
      .filter({ hasText: ROLE_NAME })
      .first();
    const isInactiveVisible = await inactiveRow
      .isVisible({ timeout: 2000 })
      .catch(() => false);
    if (!isInactiveVisible) break;

    await expect(async () => {
      await inactiveRow
        .locator('.bai-name-action-cell-actions button')
        .last()
        .click();
      const purgeModal = page
        .locator('.ant-modal')
        .filter({ hasText: 'Purge Role' });
      await expect(purgeModal).toBeVisible({ timeout: 5000 });
      await purgeModal.getByRole('button', { name: 'Delete' }).click();
      await expect(inactiveRow).toBeHidden({ timeout: 5000 });
    }).toPass({ timeout: 20000 });
  }

  // Return to Active tab and clear any search filters
  await page.getByText('Active', { exact: true }).click();
  await clearRoleSearch(page);
}

test.describe(
  'RBAC Role Detail Drawer',
  { tag: ['@rbac', '@critical', '@functional'] },
  () => {
    test('Superadmin can open the role detail drawer by clicking a role name', async ({
      page,
      request,
    }) => {
      // 1. Login as admin
      await loginAsAdmin(page, request);

      // 2. Navigate to RBAC page
      await navigateTo(page, 'rbac');

      // 3. Wait for the table to load
      await expect(
        page.getByRole('tab', { name: 'RBAC Management' }),
      ).toBeVisible({ timeout: 10000 });
      await expect(page.locator('.ant-table-row').first()).toBeVisible({
        timeout: 10000,
      });

      // 4. Click any role name in the first column of the table (excluding "monitor" role — known bug)
      await page
        .locator('.ant-table-row')
        .filter({ hasNotText: /monitor/i })
        .first()
        .getByRole('cell')
        .first()
        .locator('.ant-typography')
        .first()
        .click();

      // 5. Verify a drawer with title "RBAC Role Info" slides open from the right
      const drawer = page.locator('.ant-drawer');
      const drawerPanel = page.locator('.ant-drawer-content-wrapper');
      await expect(drawerPanel).toBeVisible({ timeout: 10000 });
      await expect(drawer.getByText('RBAC Role Info')).toBeVisible();

      // 6. Verify a Refresh button (reload icon) is visible in the drawer header
      await expect(
        drawer
          .locator('button')
          .filter({ has: page.locator('.anticon-reload') }),
      ).toBeVisible();

      // 7. Close the drawer
      await drawer.getByRole('button', { name: 'close' }).click();
      await expect(drawerPanel).toBeHidden({ timeout: 5000 });
    });

    test('Drawer shows "Scopes", "Permissions", and "Role Assignments" tabs', async ({
      page,
      request,
    }) => {
      // 1. Login as admin
      await loginAsAdmin(page, request);

      // 2. Navigate to RBAC page
      await navigateTo(page, 'rbac');

      // 3. Wait for the table to load and click any role name (excluding "monitor" role — known bug)
      await expect(page.locator('.ant-table-row').first()).toBeVisible({
        timeout: 10000,
      });
      await page
        .locator('.ant-table-row')
        .filter({ hasNotText: /monitor/i })
        .first()
        .getByRole('cell')
        .first()
        .locator('.ant-typography')
        .first()
        .click();

      const drawer = page.locator('.ant-drawer');
      const drawerPanel = page.locator('.ant-drawer-content-wrapper');
      await expect(drawerPanel).toBeVisible({ timeout: 10000 });

      // 4. Verify three tabs are visible: "Scopes", "Permissions", and "Role Assignments"
      await expect(drawer.getByRole('tab', { name: 'Scopes' })).toBeVisible();
      await expect(
        drawer.getByRole('tab', { name: 'Permissions' }),
      ).toBeVisible();
      await expect(
        drawer.getByRole('tab', { name: 'Role Assignments' }),
      ).toBeVisible();

      // 5. Verify "Scopes" tab is active by default
      await expect(drawer.getByRole('tab', { name: 'Scopes' })).toHaveAttribute(
        'aria-selected',
        'true',
      );

      // 6. Verify the active tab content area is visible
      await expect(drawer.locator('.ant-tabs-tabpane-active')).toBeVisible({
        timeout: 5000,
      });

      // 7. Click the "Permissions" tab
      await drawer.getByRole('tab', { name: 'Permissions' }).click();

      // 8. Verify the Permissions tab becomes active
      await expect(
        drawer.getByRole('tab', { name: 'Permissions' }),
      ).toHaveAttribute('aria-selected', 'true');

      // 9. Click the "Role Assignments" tab
      await drawer.getByRole('tab', { name: 'Role Assignments' }).click();

      // 10. Verify the Role Assignments tab becomes active
      await expect(
        drawer.getByRole('tab', { name: 'Role Assignments' }),
      ).toHaveAttribute('aria-selected', 'true');

      // Close the drawer
      await drawer.getByRole('button', { name: 'close' }).click();
    });

    test('Superadmin can close the role detail drawer', async ({
      page,
      request,
    }) => {
      // 1. Login as admin
      await loginAsAdmin(page, request);

      // 2. Navigate to RBAC page
      await navigateTo(page, 'rbac');

      // 3. Open the detail drawer by clicking a role name (excluding "monitor" role — known bug)
      await expect(page.locator('.ant-table-row').first()).toBeVisible({
        timeout: 10000,
      });
      await page
        .locator('.ant-table-row')
        .filter({ hasNotText: /monitor/i })
        .first()
        .getByRole('cell')
        .first()
        .locator('.ant-typography')
        .first()
        .click();

      const drawer = page.locator('.ant-drawer');
      const drawerPanel = page.locator('.ant-drawer-content-wrapper');

      // 4. Verify the drawer is visible
      await expect(drawerPanel).toBeVisible({ timeout: 10000 });

      // 5. Click the close (X) button on the drawer
      await drawer.getByRole('button', { name: 'close' }).click();

      // 6. Verify the drawer closes (is hidden)
      await expect(drawerPanel).toBeHidden({ timeout: 5000 });

      // 7. Verify the underlying role list is still visible
      await expect(page.locator('.ant-table-row').first()).toBeVisible();
    });
  },
);

test.describe.serial(
  'RBAC Role Permissions Management',
  { tag: ['@rbac', '@critical', '@functional'] },
  () => {
    test('Superadmin can add a permission to a role', async ({
      page,
      request,
    }) => {
      test.setTimeout(60000);
      // 1. Login as admin
      await loginAsAdmin(page, request);

      // 2. Navigate to RBAC page
      await navigateTo(page, 'rbac');

      // 3. Create a fresh test custom role
      await cleanupTestRole(page);
      await createTestRole(page);

      // 4. Search for and click the test custom role's name to open the drawer
      await searchForRole(page, ROLE_NAME);
      const roleRow = page
        .getByRole('row')
        .filter({ hasText: ROLE_NAME })
        .first();
      await roleRow.getByText(ROLE_NAME).click();

      const drawer = page.locator('.ant-drawer');
      await expect(page.locator('.ant-drawer-content-wrapper')).toBeVisible({
        timeout: 10000,
      });

      // 5. Click the "Permissions" tab
      await drawer.getByRole('tab', { name: 'Permissions' }).click();

      // 6. Click the "Add Permission" button
      await drawer.getByRole('button', { name: 'Add Permission' }).click();

      // 7. Verify a modal titled "Add Permission" appears
      const addModal = page
        .locator('.ant-modal')
        .filter({ hasText: 'Add Permission' });
      await expect(addModal).toBeVisible();

      // 8. The role has a Domain scope, so the modal shows a single "Scope Type / Target"
      // field (roleScopeKey) instead of separate Scope Type and Target fields.
      await expect(addModal.getByLabel('Scope Type / Target')).toBeVisible();

      // 9. Attempt to click OK without filling any fields – verify validation error
      await addModal.getByRole('button', { name: 'Add' }).click();
      await expect(
        addModal.getByText(/Please enter Scope Type \/ Target/i),
      ).toBeVisible({
        timeout: 5000,
      });

      // 10. Select the role scope from the "Scope Type / Target" dropdown
      // The dropdown shows combined scope entries like "Domain / <domain-name>"
      await addModal.getByLabel('Scope Type / Target').click();
      const roleScopeOptions = page.locator(
        '.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option',
      );
      await expect(roleScopeOptions.first()).toBeVisible({ timeout: 10000 });
      await roleScopeOptions.first().click();

      // Wait for the scope dropdown to fully close
      await expect(
        page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)'),
      ).toHaveCount(0, { timeout: 5000 });

      // 11. Verify the Permission Type field becomes enabled
      await expect(addModal.locator('#entityType')).toBeEnabled({
        timeout: 5000,
      });

      // 12. Select a Permission Type from the dropdown
      await addModal.locator('#entityType').click();
      const entityTypeOptions = page.locator(
        '.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option',
      );
      await expect(entityTypeOptions.first()).toBeVisible({ timeout: 5000 });
      await entityTypeOptions.first().click();

      // Wait for the entityType dropdown to fully close so the next dropdown
      // query doesn't resolve to the previous (stale) options.
      await expect(
        page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)'),
      ).toHaveCount(0);

      // 13. Select a permission (operation) from the Permission dropdown
      await expect(addModal.locator('#operation')).toBeEnabled({
        timeout: 5000,
      });
      await addModal.locator('#operation').click();
      const operationOptions = page.locator(
        '.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option',
      );
      await expect(operationOptions.first()).toBeVisible({ timeout: 5000 });
      await operationOptions.first().click();

      // 14. Click "Add" (OK button)
      await addModal.getByRole('button', { name: 'Add' }).click();

      // 17. Verify the modal closes
      await expect(addModal).toBeHidden({ timeout: 10000 });

      // 18. Verify a success notification "Permission created successfully." appears
      await expect(
        page
          .locator('.ant-message-notice-wrapper')
          .filter({ hasText: /Permission created successfully/i }),
      ).toBeVisible({ timeout: 10000 });

      // 19. Verify the new permission row appears in the Permissions tab table.
      // Scope to the active tab panel so we don't match rows rendered in the
      // Scopes tab (which remains in the DOM but is hidden).
      await expect(
        drawer.locator('.ant-tabs-tabpane-active .ant-table-row').first(),
      ).toBeVisible({ timeout: 10000 });
    });

    test('Superadmin can delete a permission from a role', async ({
      page,
      request,
    }) => {
      test.setTimeout(60000);
      // 1. Login as admin
      await loginAsAdmin(page, request);

      // 2. Navigate to RBAC page
      await navigateTo(page, 'rbac');

      // 3. Create a fresh test custom role and add a permission to it
      await cleanupTestRole(page);
      await createTestRole(page);

      // Open drawer and add a permission first
      await searchForRole(page, ROLE_NAME);
      const roleRow = page
        .getByRole('row')
        .filter({ hasText: ROLE_NAME })
        .first();
      await roleRow.getByText(ROLE_NAME).click();
      const drawer = page.locator('.ant-drawer');
      await expect(page.locator('.ant-drawer-content-wrapper')).toBeVisible({
        timeout: 10000,
      });
      await drawer.getByRole('tab', { name: 'Permissions' }).click();
      await drawer.getByRole('button', { name: 'Add Permission' }).click();

      const addModal = page
        .locator('.ant-modal')
        .filter({ hasText: 'Add Permission' });
      await expect(addModal).toBeVisible();
      // The role has a Domain scope, so the modal shows "Scope Type / Target" as a single field
      await addModal.getByLabel('Scope Type / Target').click();
      const roleScopeOpts = page.locator(
        '.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option',
      );
      await expect(roleScopeOpts.first()).toBeVisible({ timeout: 10000 });
      await roleScopeOpts.first().click();
      // Wait for scope dropdown to close
      await expect(
        page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)'),
      ).toHaveCount(0, { timeout: 5000 });
      await expect(addModal.locator('#entityType')).toBeEnabled({
        timeout: 5000,
      });
      await addModal.locator('#entityType').click();
      const entityTypeOpts = page.locator(
        '.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option',
      );
      await expect(entityTypeOpts.first()).toBeVisible({ timeout: 5000 });
      await entityTypeOpts.first().click();
      await expect(
        page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)'),
      ).toHaveCount(0);
      await expect(addModal.locator('#operation')).toBeEnabled({
        timeout: 5000,
      });
      await addModal.locator('#operation').click();
      const operationOpts = page.locator(
        '.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option',
      );
      await expect(operationOpts.first()).toBeVisible({ timeout: 5000 });
      await operationOpts.first().click();
      await addModal.getByRole('button', { name: 'Add' }).click();
      await expect(addModal).toBeHidden({ timeout: 10000 });
      await expect(
        page
          .locator('.ant-message-notice-wrapper')
          .filter({ hasText: /Permission created successfully/i }),
      ).toBeVisible({ timeout: 10000 });

      // 4. Locate the permission row and hover to reveal action buttons.
      // Scope to the active tab panel to skip rows rendered in other (hidden) tabs.
      const permissionRow = drawer
        .locator('.ant-tabs-tabpane-active .ant-table-row')
        .first();
      await expect(permissionRow).toBeVisible({ timeout: 10000 });
      await permissionRow.hover();

      // 5. Click the "Delete Permission" (trash bin icon) action button - second action button in the row
      await permissionRow
        .locator('.bai-name-action-cell-actions button')
        .last()
        .click();

      // 6. Verify a confirmation modal titled "Delete Permission" appears
      const deleteModal = page
        .locator('.ant-modal')
        .filter({ hasText: 'Delete Permission' });
      await expect(deleteModal).toBeVisible();

      // 7. Click Delete to confirm
      await deleteModal.getByRole('button', { name: 'Delete' }).click();

      // 8. Verify the permission row disappears from the table
      await expect(permissionRow).toBeHidden({ timeout: 10000 });

      // 9. Verify a success notification "Permission deleted successfully." appears
      await expect(
        page
          .locator('.ant-message-notice-wrapper')
          .filter({ hasText: /Permission deleted successfully/i }),
      ).toBeVisible({ timeout: 10000 });
    });

    test('Superadmin sees empty state in Permissions tab when role has no permissions', async ({
      page,
      request,
    }) => {
      // 1. Login as admin
      await loginAsAdmin(page, request);

      // 2. Navigate to RBAC page
      await navigateTo(page, 'rbac');

      // 3. Create a fresh test custom role with no permissions
      await cleanupTestRole(page);
      await createTestRole(page);

      // 4. Search for and click the test custom role name to open the drawer
      await searchForRole(page, ROLE_NAME);
      const roleRow = page
        .getByRole('row')
        .filter({ hasText: ROLE_NAME })
        .first();
      await roleRow.getByText(ROLE_NAME).click();

      const drawer = page.locator('.ant-drawer');
      await expect(page.locator('.ant-drawer-content-wrapper')).toBeVisible({
        timeout: 10000,
      });

      // 5. Click the "Permissions" tab
      await drawer.getByRole('tab', { name: 'Permissions' }).click();

      // 6. Verify an empty state message is shown
      await expect(
        drawer.locator('.ant-tabs-tabpane-active .ant-empty-description'),
      ).toBeVisible({ timeout: 10000 });

      // 7. Verify the "Add Permission" button is still present and enabled
      await expect(
        drawer.getByRole('button', { name: 'Add Permission' }),
      ).toBeVisible();
      await expect(
        drawer.getByRole('button', { name: 'Add Permission' }),
      ).toBeEnabled();

      // Close the drawer and cleanup test role
      await drawer.getByRole('button', { name: 'close' }).click();
      await cleanupTestRole(page);
    });
  },
);

test.describe.serial(
  'RBAC Role Assignments Management',
  { tag: ['@rbac', '@critical', '@functional'] },
  () => {
    test('Superadmin can assign a user to a role', async ({
      page,
      request,
    }) => {
      const TEST_USER_EMAIL = userInfo.user.email;

      // 1. Login as admin
      await loginAsAdmin(page, request);

      // 2. Navigate to RBAC page
      await navigateTo(page, 'rbac');

      // 3. Create a fresh test role
      await cleanupTestRole(page);
      await createTestRole(page);

      // 4. Search for and click the test custom role's name to open the drawer
      await searchForRole(page, ROLE_NAME);
      const roleRow = page
        .getByRole('row')
        .filter({ hasText: ROLE_NAME })
        .first();
      await roleRow.getByText(ROLE_NAME).click();

      const drawer = page.locator('.ant-drawer');
      await expect(page.locator('.ant-drawer-content-wrapper')).toBeVisible({
        timeout: 10000,
      });

      // 5. Click the "Role Assignments" tab (default tab is "Scopes" since the UI update)
      await drawer.getByRole('tab', { name: 'Role Assignments' }).click();
      await expect(
        drawer.getByRole('tab', { name: 'Role Assignments' }),
      ).toHaveAttribute('aria-selected', 'true');

      // 6. Click the "Add User" button
      await drawer.getByRole('button', { name: 'Add User' }).click();

      // 7. Verify a modal titled "Add User" appears with a multi-select "Users" field
      const assignModal = page
        .locator('.ant-modal')
        .filter({ hasText: 'Add User' });
      await expect(assignModal).toBeVisible();
      await expect(assignModal.getByLabel('Users')).toBeVisible();

      // 8. Attempt to click "Add" (OK) without selecting any user – verify validation error
      await assignModal.getByRole('button', { name: 'Add' }).click();
      await expect(
        assignModal.getByText(/Please select at least one user|required/i),
      ).toBeVisible({ timeout: 5000 });

      // 9. Click in the Users select field and type the test user's email
      await assignModal.getByLabel('Users').click();
      await assignModal.getByLabel('Users').fill(TEST_USER_EMAIL);

      // 10. Wait for the dropdown option to appear and select it
      await page
        .locator(
          '.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option',
        )
        .filter({ hasText: TEST_USER_EMAIL })
        .first()
        .click({ timeout: 10000 });

      // Close the dropdown by pressing Escape so it doesn't block the Add button
      await page.keyboard.press('Escape');

      // 11. Click "Add"
      await assignModal.getByRole('button', { name: 'Add' }).click();

      // 12. Verify the modal closes
      await expect(assignModal).toBeHidden({ timeout: 10000 });

      // 13. Verify a success notification "Users assigned to role successfully." appears
      await expect(
        page
          .locator('.ant-message-notice-wrapper')
          .filter({ hasText: /Users assigned to role successfully/i }),
      ).toBeVisible({ timeout: 10000 });

      // 14. Verify the assigned user appears in the Role Assignments tab table
      await expect(
        drawer.getByRole('row').filter({ hasText: TEST_USER_EMAIL }),
      ).toBeVisible({ timeout: 10000 });
    });

    test('Superadmin can revoke a single user from a role', async ({
      page,
      request,
    }) => {
      const TEST_USER_EMAIL = userInfo.user.email;

      // 1. Login as admin
      await loginAsAdmin(page, request);

      // 2. Navigate to RBAC page
      await navigateTo(page, 'rbac');

      // 3. Create a fresh test role and assign a user to it
      await cleanupTestRole(page);
      await createTestRole(page);

      // Open drawer and assign user
      await searchForRole(page, ROLE_NAME);
      const roleRow = page
        .getByRole('row')
        .filter({ hasText: ROLE_NAME })
        .first();
      await roleRow.getByText(ROLE_NAME).click();
      const drawer = page.locator('.ant-drawer');
      await expect(page.locator('.ant-drawer-content-wrapper')).toBeVisible({
        timeout: 10000,
      });
      // Navigate to Role Assignments tab (default tab is "Scopes" since the UI update)
      await drawer.getByRole('tab', { name: 'Role Assignments' }).click();
      await drawer.getByRole('button', { name: 'Add User' }).click();

      const assignModal = page
        .locator('.ant-modal')
        .filter({ hasText: 'Add User' });
      await expect(assignModal).toBeVisible();
      await assignModal.getByLabel('Users').click();
      await assignModal.getByLabel('Users').fill(TEST_USER_EMAIL);
      await page
        .locator(
          '.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option',
        )
        .filter({ hasText: TEST_USER_EMAIL })
        .first()
        .click({ timeout: 10000 });
      // Close the dropdown so it doesn't block the Add button
      await page.keyboard.press('Escape');
      await assignModal.getByRole('button', { name: 'Add' }).click();
      await expect(assignModal).toBeHidden({ timeout: 10000 });
      await expect(
        page
          .locator('.ant-message-notice-wrapper')
          .filter({ hasText: /Users assigned to role successfully/i }),
      ).toBeVisible({ timeout: 10000 });

      // 4. Locate the assigned user row in the Role Assignments tab
      const userRow = drawer
        .getByRole('row')
        .filter({ hasText: TEST_USER_EMAIL });
      await expect(userRow).toBeVisible({ timeout: 10000 });

      // 5. Hover over the User ID cell to reveal action buttons
      await userRow.hover();

      // 6. Click the "Delete User" (trash bin icon) action button - first (only) action button in the row
      await userRow
        .locator('.bai-name-action-cell-actions button')
        .first()
        .click();

      // 7. Verify a confirmation modal titled "Delete User" appears
      const deleteModal = page
        .locator('.ant-modal')
        .filter({ hasText: 'Delete User' });
      await expect(deleteModal).toBeVisible();

      // 8. Verify the description mentions revoking user(s)
      await expect(
        deleteModal.getByText(/revoke the following user/i),
      ).toBeVisible();

      // 9. Click Delete to confirm
      await deleteModal.getByRole('button', { name: 'Delete' }).click();

      // 10. Verify the user row disappears from the assignments table
      await expect(userRow).toBeHidden({ timeout: 10000 });

      // 11. Verify a success notification "User removed from role successfully." appears
      await expect(
        page
          .locator('.ant-message-notice-wrapper')
          .filter({ hasText: /User removed from role successfully/i }),
      ).toBeVisible({ timeout: 10000 });
    });

    test('Superadmin sees empty state in Role Assignments tab when role has no users', async ({
      page,
      request,
    }) => {
      // 1. Login as admin
      await loginAsAdmin(page, request);

      // 2. Navigate to RBAC page
      await navigateTo(page, 'rbac');

      // 3. Create a fresh test role with no assignments
      await cleanupTestRole(page);
      await createTestRole(page);

      // 4. Search for and click the test custom role name to open the drawer
      await searchForRole(page, ROLE_NAME);
      const roleRow = page
        .getByRole('row')
        .filter({ hasText: ROLE_NAME })
        .first();
      await roleRow.getByText(ROLE_NAME).click();

      const drawer = page.locator('.ant-drawer');
      await expect(page.locator('.ant-drawer-content-wrapper')).toBeVisible({
        timeout: 10000,
      });

      // 5. Click the "Role Assignments" tab (default tab is "Scopes" since the UI update)
      await drawer.getByRole('tab', { name: 'Role Assignments' }).click();
      await expect(
        drawer.getByRole('tab', { name: 'Role Assignments' }),
      ).toHaveAttribute('aria-selected', 'true');

      // 6. Verify an empty state message is shown
      await expect(drawer.locator('.ant-empty-description')).toBeVisible({
        timeout: 10000,
      });

      // 7. Verify the "Add User" button is still present and enabled
      await expect(
        drawer.getByRole('button', { name: 'Add User' }),
      ).toBeVisible();
      await expect(
        drawer.getByRole('button', { name: 'Add User' }),
      ).toBeEnabled();

      // Close the drawer and cleanup test role
      await drawer.getByRole('button', { name: 'close' }).click();
      await cleanupTestRole(page);
    });
  },
);
