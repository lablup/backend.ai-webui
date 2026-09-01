// spec: e2e/.agent-output/test-plan-rbac-management.md
// Scenarios: 3.1 – 3.4, 4.1 – 4.4, 5.1 – 5.4, 6.2 – 6.3
// (Role detail drawer, permissions management, user assignments, edge cases)
import { createAdminApiContext, purgeUserViaApi } from '../utils/admin-api';
import {
  KeyPairModal,
  UserSettingModal,
} from '../utils/classes/user/UserSettingModal';
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import test, {
  expect,
  Locator,
  Page,
  type APIRequestContext,
} from '@playwright/test';

const TEST_RUN_ID = Date.now().toString(36);
const ROLE_NAME = `e2e-detail-role-${TEST_RUN_ID}`;
const ROLE_DESCRIPTION = `E2E detail test role created at ${new Date().toISOString()}`;

// BAIPropertyFilter (Astryx PowerSearch): the RBAC page has multiple filter
// fields (Role Name, Source), so typing opens a Field/Operator/Value edit
// popover rather than auto-committing (contrast with a single-field page's
// content-search shortcut) -- see `environment.spec.ts`'s
// `applyImageFilter` for the canonical pattern this mirrors.
async function searchForRole(page: Page, roleName: string) {
  const searchBar = page.getByRole('combobox', { name: 'Search filters' });
  await searchBar.click();
  await page.getByRole('option', { name: 'Role Name', exact: true }).click();
  await page.getByRole('textbox', { name: 'Value' }).fill(roleName);
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(
    page.getByRole('row').filter({ hasText: roleName }).first(),
  ).toBeVisible({ timeout: 10000 });
}

async function createTestRole(page: Page) {
  await page.getByRole('button', { name: 'Create Role' }).click();
  const modal = page.getByRole('dialog', { name: 'Create Role' });
  await expect(modal).toBeVisible();
  await modal.getByLabel('Role Name').fill(ROLE_NAME);
  await modal.getByLabel('Description').fill(ROLE_DESCRIPTION);

  // Fill in the required "Scope Type / Target" field. Both are Astryx
  // Selector triggers. "Target" starts out disabled (rendered as a
  // `combobox`, `aria-busy="true"`, while it fetches the domain list after
  // "Scope Type" is picked) and re-renders as an enabled `button` once
  // ready -- so target it by role `button`, whose `.click()` naturally
  // waits out that role/attribute transition.
  await modal.getByRole('button', { name: 'Scope Type', exact: true }).click();
  await page.getByRole('option', { name: 'Domain', exact: true }).click();

  await modal
    .getByRole('button', { name: 'Target', exact: true })
    .click({ timeout: 15000 });
  const targetOptions = page.getByRole('option');
  await expect(targetOptions.first()).toBeVisible({ timeout: 10000 });
  await targetOptions.first().click();

  await modal.getByRole('button', { name: 'OK' }).click();
  await expect(modal).toBeHidden({ timeout: 10000 });
  // Verify success notification instead of row visibility (pagination may hide the new row)
  await expect(
    page.getByRole('alert').filter({ hasText: /Role created successfully/i }),
  ).toBeVisible({ timeout: 10000 });
}

// Same PowerSearch interaction as `searchForRole`, without asserting the
// row appears — cleanup callers branch on `isVisible` themselves since the
// role may not exist yet (first run) or may already be gone.
async function applyRoleNameFilter(page: Page, roleName: string) {
  const searchBar = page.getByRole('combobox', { name: 'Search filters' });
  await searchBar.click();
  await page.getByRole('option', { name: 'Role Name', exact: true }).click();
  await page.getByRole('textbox', { name: 'Value' }).fill(roleName);
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
}

async function clearRoleSearch(page: Page) {
  // PowerSearch ships its own "Clear all" button, gated on there being at
  // least one committed filter token.
  const clearAllButton = page.getByRole('button', {
    name: 'Clear all',
    exact: true,
  });
  if (await clearAllButton.isVisible({ timeout: 1000 }).catch(() => false)) {
    await clearAllButton.click();
    await expect(clearAllButton).toBeHidden({ timeout: 5000 });
  }
}

// Scope status-filter clicks to the radiogroup — the AutoAssign column also
// renders per-row "Active"/"Inactive" tags, which collide with a bare
// getByText locator (strict-mode violation).
function statusFilterOption(page: Page, status: 'Active' | 'Inactive') {
  return page.getByRole('radiogroup').getByText(status, { exact: true });
}

// `BAICard`'s `tabList` renders a `nav[aria-label="Tabs"]` of plain
// `<button>`s (BAITabList / Astryx `TabList`), never ARIA `tab` elements —
// the same contract rbac-role-list.spec.ts already uses.
function rbacManagementTab(page: Page) {
  return page
    .getByRole('navigation', { name: 'Tabs' })
    .getByRole('button', { name: 'RBAC Management' });
}

// `RoleDetailDrawer` renders as an Astryx `Dialog` (`role="dialog"`,
// accessible name "RBAC Role Info"), not an antd Drawer.
function roleDrawer(page: Page) {
  return page.getByRole('dialog', { name: 'RBAC Role Info' });
}

// The drawer carries its own BAITabList ("Scopes" / "Permissions" /
// "Role Assignments"); the active button carries `aria-current="true"`.
function drawerTab(page: Page, name: string) {
  return roleDrawer(page)
    .getByRole('navigation', { name: 'Tabs' })
    .getByRole('button', { name });
}

// Astryx `Table` renders native <table><tbody><tr role="row">; a plain
// getByRole('row') also matches the header row, so exclude it.
function dataRows(page: Page, scope: Locator | Page = page) {
  return scope
    .getByRole('row')
    .filter({ hasNot: page.getByRole('columnheader') });
}

// Astryx `Selector` triggers are plain `<button>`s whose accessible name
// concatenates the field label with its placeholder — which on these fields is
// the label again ("Permission Permission"). Match that doubled form exactly:
// a substring "Permission" would also hit "Permission Type" and the drawer's
// own "Add Permission" button.
function selectorTrigger(scope: Locator, label: string) {
  return scope.getByRole('button', { name: `${label} ${label}`, exact: true });
}

// The role table (900+ roles in the shared nightly env) can take a while to
// render on a busy shared backend; give the page chrome more headroom than
// the default wait.
const SLOW_PAGE_TIMEOUT = 30000;

async function cleanupTestRole(page: Page) {
  // Close any lingering drawer from a previous test so it doesn't block clicks.
  const openDrawer = roleDrawer(page);
  if (await openDrawer.isVisible().catch(() => false)) {
    await openDrawer.getByRole('button', { name: 'close' }).first().click();
    await expect(openDrawer).toBeHidden({ timeout: 5000 });
  }

  // Check Active tab first
  await statusFilterOption(page, 'Active').click();
  await clearRoleSearch(page);
  // Use name filter to find the role even if it's on a later page
  await applyRoleNameFilter(page, ROLE_NAME);

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
    // The deactivate action is gated by a Popconfirm — click it then confirm.
    await expect(async () => {
      await activeRow.hover();
      const deactivateBtn = activeRow
        .locator('.bai-name-action-cell-actions button')
        .first();
      await expect(deactivateBtn).toBeVisible();
      await deactivateBtn.click();
      // Confirm the Popconfirm that appears after clicking the deactivate button
      await page
        .getByRole('dialog', { name: 'Deactivate' })
        .getByRole('button', { name: 'Deactivate' })
        .click({ timeout: 5000 });
      await expect(activeRow).toBeHidden({ timeout: 5000 });
    }).toPass({ timeout: 20000 });
  }

  // Check Inactive tab. The Role Name filter set above persists across the
  // Active/Inactive status switch (it's carried in the URL's `filter` query
  // param), so there's no need to reapply it here.
  await statusFilterOption(page, 'Inactive').click();

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
      const purgeModal = page.getByRole('dialog', { name: 'Purge Role' });
      await expect(purgeModal).toBeVisible({ timeout: 5000 });
      // BAIDeleteConfirmModal requires typing the role name before the Delete
      // button enables. Its confirm input is the dialog's only textbox — the
      // Astryx build carries no `#confirmText` id (see project-crud.spec.ts).
      await purgeModal.getByRole('textbox').fill(ROLE_NAME);
      await purgeModal.getByRole('button', { name: 'Delete' }).click();
      await expect(inactiveRow).toBeHidden({ timeout: 5000 });
    }).toPass({ timeout: 20000 });
  }

  // Return to Active tab and clear any search filters
  await statusFilterOption(page, 'Active').click();
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
      await expect(rbacManagementTab(page)).toBeVisible({
        timeout: SLOW_PAGE_TIMEOUT,
      });
      const roleRows = dataRows(page);
      await expect(roleRows.first()).toBeVisible({
        timeout: SLOW_PAGE_TIMEOUT,
      });

      // 4. Click any role name in the first column of the table (excluding "monitor" role — known bug)
      await roleRows
        .filter({ hasNotText: /monitor/i })
        .first()
        .getByRole('cell')
        .first()
        // The drawer handler sits on `BAINameActionCell`'s title, which
        // `BAILink` renders as a `<button>` (Astryx `Link`, no `href`) — not on
        // the cell, whose centre can fall outside that fit-content button.
        .getByRole('button')
        .first()
        .click();

      // 5. Verify the "RBAC Role Info" drawer slides open from the right
      const drawer = roleDrawer(page);
      await expect(drawer).toBeVisible({ timeout: 10000 });

      // 6. Verify a Refresh button is visible in the drawer.
      // `RoleDetailDrawer.tsx` uses `BAIFetchKeyButton`, which renders an
      // Astryx icon button whose accessible name is "Refresh". The drawer
      // holds two — one in the header, one above the tab's table — so take
      // the first rather than tripping strict mode.
      await expect(
        drawer.getByRole('button', { name: 'Refresh' }).first(),
      ).toBeVisible();

      // 7. Close the drawer (Astryx `Dialog`'s close control is named "Close")
      await drawer.getByRole('button', { name: 'Close' }).click();
      await expect(drawer).toBeHidden({ timeout: 5000 });
    });

    test('Drawer shows "Role Assignments" and "Permissions" tabs', async ({
      page,
      request,
    }) => {
      // 1. Login as admin
      await loginAsAdmin(page, request);

      // 2. Navigate to RBAC page
      await navigateTo(page, 'rbac');

      // 3. Wait for the table to load and click any role name (excluding "monitor" role — known bug)
      const roleRows = dataRows(page);
      await expect(roleRows.first()).toBeVisible({
        timeout: SLOW_PAGE_TIMEOUT,
      });
      await roleRows
        .filter({ hasNotText: /monitor/i })
        .first()
        .getByRole('cell')
        .first()
        // The drawer handler sits on `BAINameActionCell`'s title, which
        // `BAILink` renders as a `<button>` (Astryx `Link`, no `href`) — not on
        // the cell, whose centre can fall outside that fit-content button.
        .getByRole('button')
        .first()
        .click();

      // `RoleDetailDrawer` renders as an Astryx `Dialog` (`role="dialog"`,
      // accessible name "RBAC Role Info") rather than an antd Drawer.
      const drawer = roleDrawer(page);
      await expect(drawer).toBeVisible({ timeout: 10000 });
      // `BAITabs`/`BAITabList` renders tab items as plain `<button>`s inside
      // a `navigation "Tabs"` landmark, not `role="tab"` (see
      // `start-page.spec.ts`). The active tab carries `aria-current="true"`.
      const tabs = drawer.getByRole('navigation', { name: 'Tabs' });

      // 4. Verify two tabs are visible: "Permissions" and "Role Assignments".
      // Managers below 26.8.0 (the nightly manager under test) don't support
      // the merged "Detailed Permissions" view, so the drawer actually shows
      // three tabs here — "Scopes", "Permissions", "Role Assignments" — with
      // "Scopes" active by default. See the docblock on
      // RoleDetailDrawerContent.tsx / RolePermissionDetailTab.tsx for the
      // version-gated split. Assert the "Permissions" tab becomes active on
      // click instead of assuming it's the default, so this passes on both
      // legacy and merged-view managers.
      await expect(
        tabs.getByRole('button', { name: 'Permissions' }),
      ).toBeVisible();
      await expect(
        tabs.getByRole('button', { name: 'Role Assignments' }),
      ).toBeVisible();

      // 5. Click the "Permissions" tab and verify it becomes active
      await tabs.getByRole('button', { name: 'Permissions' }).click();
      await expect(
        tabs.getByRole('button', { name: 'Permissions' }),
      ).toHaveAttribute('aria-current', 'true');

      // 6. Verify the active tab's content area is visible -- the
      // Permissions panel's own "Add Permission" button.
      await expect(
        drawer.getByRole('button', { name: 'Add Permission' }),
      ).toBeVisible({
        timeout: 10000,
      });

      // 7. Click the "Role Assignments" tab
      await tabs.getByRole('button', { name: 'Role Assignments' }).click();

      // 8. Verify the Role Assignments tab becomes active
      await expect(
        tabs.getByRole('button', { name: 'Role Assignments' }),
      ).toHaveAttribute('aria-current', 'true');

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
      const roleRows = dataRows(page);
      await expect(roleRows.first()).toBeVisible({
        timeout: SLOW_PAGE_TIMEOUT,
      });
      await roleRows
        .filter({ hasNotText: /monitor/i })
        .first()
        .getByRole('cell')
        .first()
        // The drawer handler sits on `BAINameActionCell`'s title, which
        // `BAILink` renders as a `<button>` (Astryx `Link`, no `href`) — not on
        // the cell, whose centre can fall outside that fit-content button.
        .getByRole('button')
        .first()
        .click();

      // `RoleDetailDrawer` renders as an Astryx `Dialog` (`role="dialog"`,
      // accessible name "RBAC Role Info") rather than an antd Drawer.
      const drawer = roleDrawer(page);

      // 4. Verify the drawer is visible
      await expect(drawer).toBeVisible({ timeout: 10000 });

      // 5. Click the close (X) button on the drawer
      await drawer.getByRole('button', { name: 'close' }).click();

      // 6. Verify the drawer closes (is hidden)
      await expect(drawer).toBeHidden({ timeout: 5000 });

      // 7. Verify the underlying role list is still visible
      await expect(roleRows.first()).toBeVisible();
    });
  },
);

// Not serial: each test provisions its own role (cleanupTestRole + createTestRole),
// so a failure doesn't cascade. mode: 'default' keeps tests sequential on one worker
// because they share the same ROLE_NAME (fullyParallel would make them race).
test.describe(
  'RBAC Role Permissions Management',
  { tag: ['@rbac', '@critical', '@functional'] },
  () => {
    test.describe.configure({ mode: 'default' });

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

      const drawer = roleDrawer(page);
      await expect(drawer).toBeVisible({ timeout: 10000 });

      // 5. Click the "Permissions" tab
      await drawerTab(page, 'Permissions').click();

      // 6. Click the "Add Permission" button
      await drawer.getByRole('button', { name: 'Add Permission' }).click();

      // 7. Verify a modal titled "Add Permission" appears
      const addModal = page.getByRole('dialog', { name: 'Add Permission' });
      await expect(addModal).toBeVisible();

      // 8. The role has a Domain scope, so the modal shows a single "Scope Type / Target"
      // field (roleScopeKey) instead of separate Scope Type and Target fields.
      await expect(
        selectorTrigger(addModal, 'Scope Type / Target'),
      ).toBeVisible();

      // 9. Attempt to click OK without filling any fields – verify validation error
      await addModal.getByRole('button', { name: 'Add' }).click();
      await expect(
        addModal.getByText(/Please enter Scope Type \/ Target/i),
      ).toBeVisible({
        timeout: 5000,
      });

      // 10. Select the role scope from the "Scope Type / Target" dropdown
      // The dropdown shows combined scope entries like "Domain / <domain-name>"
      await selectorTrigger(addModal, 'Scope Type / Target').click();
      const roleScopeOptions = page.getByRole('option');
      await expect(roleScopeOptions.first()).toBeVisible({ timeout: 10000 });
      await roleScopeOptions.first().click();

      // Wait for the scope dropdown to fully close
      await expect(page.getByRole('option').first()).toBeHidden({
        timeout: 5000,
      });

      // 11. Verify the Permission Type field becomes enabled
      await expect(selectorTrigger(addModal, 'Permission Type')).toBeEnabled({
        timeout: 5000,
      });

      // 12. Select a Permission Type from the dropdown
      await selectorTrigger(addModal, 'Permission Type').click();
      const entityTypeOptions = page.getByRole('option');
      await expect(entityTypeOptions.first()).toBeVisible({ timeout: 5000 });
      await entityTypeOptions.first().click();

      // Wait for the entityType dropdown to fully close so the next dropdown
      // query doesn't resolve to the previous (stale) options.
      await expect(page.getByRole('option').first()).toBeHidden({
        timeout: 5000,
      });

      // 13. Select a permission (operation) from the Permission dropdown
      await expect(selectorTrigger(addModal, 'Permission')).toBeEnabled({
        timeout: 5000,
      });
      await selectorTrigger(addModal, 'Permission').click();
      const operationOptions = page.getByRole('option');
      await expect(operationOptions.first()).toBeVisible({ timeout: 5000 });
      await operationOptions.first().click();

      // 14. Click "Add" (OK button)
      await addModal.getByRole('button', { name: 'Add' }).click();

      // 17. Verify the modal closes
      await expect(addModal).toBeHidden({ timeout: 10000 });

      // 18. Verify a success notification "Permission created successfully." appears
      await expect(
        page
          .getByRole('alert')
          .filter({ hasText: /Permission created successfully/i }),
      ).toBeVisible({ timeout: 10000 });

      // 19. Verify the new permission row appears in the Permissions tab table.
      // Scope to the active tab panel so we don't match rows rendered in the
      // Scopes tab (which remains in the DOM but is hidden).
      await expect(dataRows(page, drawer).first()).toBeVisible({
        timeout: 10000,
      });
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
      const drawer = roleDrawer(page);
      await expect(drawer).toBeVisible({ timeout: 10000 });
      await drawerTab(page, 'Permissions').click();
      await drawer.getByRole('button', { name: 'Add Permission' }).click();

      const addModal = page.getByRole('dialog', { name: 'Add Permission' });
      await expect(addModal).toBeVisible();
      // The role has a Domain scope, so the modal shows "Scope Type / Target" as a single field
      await selectorTrigger(addModal, 'Scope Type / Target').click();
      const roleScopeOpts = page.getByRole('option');
      await expect(roleScopeOpts.first()).toBeVisible({ timeout: 10000 });
      await roleScopeOpts.first().click();
      // Wait for scope dropdown to close
      await expect(page.getByRole('option').first()).toBeHidden({
        timeout: 5000,
      });
      await expect(selectorTrigger(addModal, 'Permission Type')).toBeEnabled({
        timeout: 5000,
      });
      await selectorTrigger(addModal, 'Permission Type').click();
      const entityTypeOpts = page.getByRole('option');
      await expect(entityTypeOpts.first()).toBeVisible({ timeout: 5000 });
      await entityTypeOpts.first().click();
      await expect(page.getByRole('option').first()).toBeHidden({
        timeout: 5000,
      });
      await expect(selectorTrigger(addModal, 'Permission')).toBeEnabled({
        timeout: 5000,
      });
      await selectorTrigger(addModal, 'Permission').click();
      const operationOpts = page.getByRole('option');
      await expect(operationOpts.first()).toBeVisible({ timeout: 5000 });
      await operationOpts.first().click();
      // Use dispatchEvent to ensure the click reaches React's event handler
      // for modal buttons rendered as portals outside the React root.
      await addModal
        .getByRole('button', { name: 'Add' })
        .dispatchEvent('click');
      await expect(addModal).toBeHidden({ timeout: 10000 });
      await expect(
        page
          .getByRole('alert')
          .filter({ hasText: /Permission created successfully/i }),
      ).toBeVisible({ timeout: 10000 });

      // 4. Locate the permission row and hover to reveal action buttons.
      // Scope to the active tab panel to skip rows rendered in other (hidden) tabs.
      const permissionRow = dataRows(page, drawer).first();
      await expect(permissionRow).toBeVisible({ timeout: 10000 });
      await permissionRow.hover();

      // 5. Click the "Remove Permission" (trash bin icon) action button - last action button in the row
      await permissionRow
        .locator('.bai-name-action-cell-actions button')
        .last()
        .click();

      // 6. Verify a confirmation modal titled "Remove Permission" appears
      // (the modal title uses t('rbac.RemovePermission') = "Remove Permission")
      const deleteModal = page.getByRole('dialog', {
        name: 'Remove Permission',
      });
      await expect(deleteModal).toBeVisible();

      // 7. Click "Remove Permission" to confirm
      // (the modal okText is t('rbac.RemovePermission') = "Remove Permission")
      await deleteModal
        .getByRole('button', { name: 'Remove Permission' })
        .click();

      // 8. Verify the permission row disappears from the table
      await expect(permissionRow).toBeHidden({ timeout: 10000 });

      // 9. Verify a success notification "Permission removed from role successfully." appears
      await expect(
        page
          .getByRole('alert')
          .filter({ hasText: /Permission removed from role successfully/i }),
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

      const drawer = roleDrawer(page);
      await expect(drawer).toBeVisible({ timeout: 10000 });

      // 5. Click the "Permissions" tab
      await drawerTab(page, 'Permissions').click();

      // 6. Verify an empty state message is shown
      await expect(
        drawer.getByRole('heading', { name: 'No data to display' }),
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

// Disposable fixture user for the Role Assignments block. These tests
// assign / revoke a user to/from a custom role and then purge that role
// during cleanup. To keep tests fully isolated from the shared
// `user@lablup.com` (whose state must remain stable for all other suites),
// we create a fresh user via admin in beforeAll and purge it in afterAll
// (see below) via the admin GraphQL API. The unique `<RUN_ID>` suffix keeps
// leftovers from colliding between runs, and the global-cleanup teardown
// sweeps any `e2e-*` account a hard-killed run failed to purge.
const ASSIGN_FIXTURE_RUN_ID =
  Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const ASSIGN_FIXTURE_EMAIL = `e2e-rbac-assign-${ASSIGN_FIXTURE_RUN_ID}@lablup.com`;
const ASSIGN_FIXTURE_USERNAME = `e2e-rbac-assign-${ASSIGN_FIXTURE_RUN_ID}`;
const ASSIGN_FIXTURE_PASSWORD = 'testing@123';

// Not serial: each test provisions its own role (cleanupTestRole + createTestRole),
// so a failure doesn't cascade. mode: 'default' keeps tests sequential on one worker
// because they share the same ROLE_NAME (fullyParallel would make them race).
test.describe(
  'RBAC Role Assignments Management',
  { tag: ['@rbac', '@critical', '@functional'] },
  () => {
    test.describe.configure({ mode: 'default' });

    test.beforeAll(async ({ browser }) => {
      // Admin creates the disposable user via the Credential page UI.
      const adminContext = await browser.newContext();
      const adminPage = await adminContext.newPage();
      const adminRequest = adminContext.request;
      try {
        await loginAsAdmin(adminPage, adminRequest);
        await navigateTo(adminPage, 'credential');
        await expect(
          adminPage
            .getByRole('navigation', { name: 'Tabs' })
            .getByRole('button', { name: 'Users' }),
        ).toBeVisible({ timeout: 10000 });
        await adminPage.getByRole('button', { name: 'Create User' }).click();
        const userSettingModal = new UserSettingModal(adminPage);
        await userSettingModal.createUser(
          ASSIGN_FIXTURE_EMAIL,
          ASSIGN_FIXTURE_USERNAME,
          ASSIGN_FIXTURE_PASSWORD,
        );
        // The Create User flow shows the new user's keypair in a follow-up
        // modal — close it; we don't need to keep the keypair info.
        const keyPairModal = new KeyPairModal(adminPage);
        await keyPairModal.waitForVisible();
        await keyPairModal.close();
        await userSettingModal.waitForHidden();
        await expect(
          adminPage.getByRole('cell', { name: ASSIGN_FIXTURE_EMAIL }),
        ).toBeVisible({ timeout: 10000 });
      } finally {
        await adminContext.close();
      }
    });

    // Purge the disposable fixture user after the suite via the admin GraphQL
    // API (pagination-immune, no UI flakiness). The global-cleanup teardown
    // also sweeps any leaked `e2e-*` account as a belt-and-suspenders backstop,
    // but reaping it here keeps the shared server clean even when the teardown
    // is skipped (e.g. a single-file run). Never throws — a cleanup hiccup must
    // not fail an otherwise-passing suite.
    test.afterAll(async () => {
      let api: APIRequestContext | undefined;
      try {
        api = await createAdminApiContext();
        await purgeUserViaApi(api, ASSIGN_FIXTURE_EMAIL);
      } catch (error) {
        console.warn(
          `[rbac-role-detail] failed to purge fixture user ${ASSIGN_FIXTURE_EMAIL}:`,
          error,
        );
      } finally {
        await api?.dispose();
      }
    });

    test('Superadmin can assign a user to a role', async ({
      page,
      request,
    }) => {
      const TEST_USER_EMAIL = ASSIGN_FIXTURE_EMAIL;

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

      const drawer = roleDrawer(page);
      await expect(drawer).toBeVisible({ timeout: 10000 });

      // 5. Click the "Role Assignments" tab (default tab is "Scopes" since the UI update)
      await drawerTab(page, 'Role Assignments').click();
      await expect(drawerTab(page, 'Role Assignments')).toHaveAttribute(
        'aria-selected',
        'true',
      );

      // 6. Click the "Add User" button
      await drawer.getByRole('button', { name: 'Add User' }).click();

      // 7. Verify a modal titled "Add User" appears with a multi-select "Users" field
      const assignModal = page.getByRole('dialog', { name: 'Add User' });
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
        .getByRole('option')
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
          .getByRole('alert')
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
      const TEST_USER_EMAIL = ASSIGN_FIXTURE_EMAIL;

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
      const drawer = roleDrawer(page);
      await expect(drawer).toBeVisible({ timeout: 10000 });
      // Navigate to Role Assignments tab (default tab is "Scopes" since the UI update)
      await drawerTab(page, 'Role Assignments').click();
      await drawer.getByRole('button', { name: 'Add User' }).click();

      const assignModal = page.getByRole('dialog', { name: 'Add User' });
      await expect(assignModal).toBeVisible();
      await assignModal.getByLabel('Users').click();
      await assignModal.getByLabel('Users').fill(TEST_USER_EMAIL);
      await page
        .getByRole('option')
        .filter({ hasText: TEST_USER_EMAIL })
        .first()
        .click({ timeout: 10000 });
      // Close the dropdown so it doesn't block the Add button
      await page.keyboard.press('Escape');
      await assignModal.getByRole('button', { name: 'Add' }).click();
      await expect(assignModal).toBeHidden({ timeout: 10000 });
      await expect(
        page
          .getByRole('alert')
          .filter({ hasText: /Users assigned to role successfully/i }),
      ).toBeVisible({ timeout: 10000 });

      // 4. Locate the assigned user row in the Role Assignments tab
      const userRow = drawer
        .getByRole('row')
        .filter({ hasText: TEST_USER_EMAIL });
      await expect(userRow).toBeVisible({ timeout: 10000 });

      // 5. Hover over the User ID cell to reveal action buttons
      await userRow.hover();

      // 6. Click the "Revoke User" (trash bin icon) action button - first (only) action button in the row
      await userRow
        .locator('.bai-name-action-cell-actions button')
        .first()
        .click();

      // 7. Verify a confirmation modal titled "Revoke User" appears
      const deleteModal = page.getByRole('dialog', { name: 'Revoke User' });
      await expect(deleteModal).toBeVisible();

      // 8. Verify the description mentions revoking user(s)
      await expect(
        deleteModal.getByText(/revoke the following user/i),
      ).toBeVisible();

      // 9. Click "Revoke User" to confirm (the modal okText is t('rbac.RevokeUser'))
      await deleteModal.getByRole('button', { name: 'Revoke User' }).click();

      // 10. Verify the user row disappears from the assignments table
      await expect(userRow).toBeHidden({ timeout: 10000 });

      // 11. Verify a success notification "User removed from role successfully." appears
      await expect(
        page
          .getByRole('alert')
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

      const drawer = roleDrawer(page);
      await expect(drawer).toBeVisible({ timeout: 10000 });

      // 5. Click the "Role Assignments" tab (default tab is "Scopes" since the UI update)
      await drawerTab(page, 'Role Assignments').click();
      await expect(drawerTab(page, 'Role Assignments')).toHaveAttribute(
        'aria-selected',
        'true',
      );

      // 6. Verify an empty state message is shown
      await expect(
        drawer.getByRole('heading', { name: 'No data to display' }),
      ).toBeVisible({
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
