// spec: e2e/.agent-output/test-plan-rbac-management.md
// Scenarios: 3.1 – 3.4, 5.1 – 5.4, 6.2 – 6.3
// (Role detail drawer, user assignments, edge cases)
import { createAdminApiContext, purgeUserViaApi } from '../utils/admin-api';
import {
  KeyPairModal,
  UserSettingModal,
} from '../utils/classes/user/UserSettingModal';
import { getE2EDomainName } from '../utils/e2e-scope';
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import test, {
  expect,
  Locator,
  Page,
  type APIRequestContext,
} from '@playwright/test';
import { randomUUID } from 'node:crypto';

const TEST_RUN_ID = Date.now().toString(36);

// Relay global ids are base64 `Type:uuid`; filters and URLs carry the uuid.
function toLocalId(globalId: string) {
  return Buffer.from(globalId, 'base64').toString('utf8').split(':')[1];
}
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

// Creates a Domain-scoped role. Since #10081 (FR-4141) the modal fills the
// Domain scope with the signed-in domain and hides the Target field, so the
// role always lands in the admin's own domain.
async function createTestRole(page: Page, roleName = ROLE_NAME) {
  await page.getByRole('button', { name: 'Create Role' }).click();
  const modal = page.getByRole('dialog', { name: 'Create Role' });
  await expect(modal).toBeVisible();
  await modal.getByLabel('Role Name').fill(roleName);
  await modal.getByLabel('Description').fill(ROLE_DESCRIPTION);

  // The Selector trigger's accessible name is the field label plus its
  // current value ("Scope Type Scope Type" before a pick), so it cannot be
  // matched exactly.
  await modal.getByRole('button', { name: 'Scope Type' }).click();
  await page.getByRole('option', { name: 'Domain', exact: true }).click();
  await expect(modal.getByRole('button', { name: 'Target' })).toBeHidden();

  await modal.getByRole('button', { name: 'OK' }).click();
  await expect(modal).toBeHidden({ timeout: 10000 });
  // Verify success notification instead of row visibility (pagination may hide the new row)
  await expect(toast(page, /Role created successfully/i)).toBeVisible({
    timeout: 10000,
  });
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
// the same contract rbac-role-list.spec.ts already uses. The role list tab
// is "Roles" since #9924 (formerly "RBAC Management").
function rolesTab(page: Page) {
  return page
    .getByRole('navigation', { name: 'Tabs' })
    .getByRole('button', { name: 'Roles', exact: true });
}

// `RoleDetailDrawer` renders as an Astryx `Dialog` (`role="dialog"`,
// accessible name "RBAC Role Info"), not an antd Drawer.
function roleDrawer(page: Page) {
  return page.getByRole('dialog', { name: 'RBAC Role Info' });
}

// The drawer carries its own BAITabList ("Permissions" / "Role
// Assignments"); the active button carries `aria-current="true"`.
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

// The Add User modal's "Users" field is a paged selector: a trigger button
// opening a "Users" popover with its own "Search options" combobox.
async function pickAssignUser(page: Page, assignModal: Locator, email: string) {
  await assignModal.getByRole('button', { name: 'Users' }).click();
  const userPicker = page.getByRole('dialog', { name: 'Users' });
  await userPicker
    .getByRole('combobox', { name: 'Search options' })
    .fill(email);
  await userPicker
    .getByRole('option')
    .filter({ hasText: email })
    .first()
    .click({ timeout: 10000 });
  // Close the picker so it doesn't block the Add button
  await page.keyboard.press('Escape');
  await expect(userPicker).toBeHidden();
  await expect(
    assignModal.getByRole('button', { name: 'Users' }),
  ).toContainText(email);
}

// The app-shim's `message.*` renders an Astryx toast (role="status") and a
// live-region copy of it, so the text matches twice.
function toast(page: Page, text: RegExp) {
  return page.getByRole('status').filter({ hasText: text }).first();
}

// The role table (900+ roles in the shared nightly env) can take a while to
// render on a busy shared backend; give the page chrome more headroom than
// the default wait.
const SLOW_PAGE_TIMEOUT = 30000;

async function cleanupTestRole(page: Page, roleName = ROLE_NAME) {
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
  await applyRoleNameFilter(page, roleName);

  const activeRow = page.getByRole('row').filter({ hasText: roleName }).first();
  const isActiveVisible = await expect(activeRow)
    .toBeVisible({ timeout: 10000 })
    .then(() => true)
    .catch(() => false);

  if (isActiveVisible) {
    // Retry deactivation until the row is removed from the Active list.
    // A stale "Role deactivated" notice from a parallel test can make a single
    // notification check unreliable, so drive the loop off of row visibility instead.
    // The deactivate action is gated by a Popconfirm — click it then confirm.
    await expect(async () => {
      await activeRow.hover();
      const deactivateBtn = activeRow.getByRole('button', {
        name: 'Deactivate',
        exact: true,
      });
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

  // Older describe blocks can share ROLE_NAME; purge every matching row.
  while (true) {
    const inactiveRow = page
      .getByRole('row')
      .filter({ hasText: roleName })
      .first();
    const isInactiveVisible = await expect(inactiveRow)
      .toBeVisible({ timeout: 10000 })
      .then(() => true)
      .catch(() => false);
    if (!isInactiveVisible) break;

    await expect(async () => {
      await inactiveRow.hover();
      await inactiveRow.getByRole('button', { name: 'Purge Role' }).click();
      const purgeModal = page.getByRole('dialog', { name: 'Purge Role' });
      await expect(purgeModal).toBeVisible({ timeout: 5000 });
      await purgeModal.getByRole('textbox').fill(roleName);
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
      await expect(rolesTab(page)).toBeVisible({
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
      // Permissions panel's Read / Write grid, one row per permission type.
      await expect(drawer.getByRole('row').first()).toBeVisible({
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
// Disposable fixture user for the Role Assignments block. These tests
// assign / revoke a user to/from a custom role and then purge that role
// during cleanup. To keep tests fully isolated from the shared
// `user@lablup.com` (whose state must remain stable for all other suites),
// we create a fresh user via admin in beforeAll and purge it in afterAll
// (see below) via the admin GraphQL API. The unique `<RUN_ID>` suffix keeps
// leftovers from colliding between runs, and the global-cleanup teardown
// sweeps any `e2e-*` account a hard-killed run failed to purge.
const ASSIGN_FIXTURE_RUN_ID =
  Date.now().toString(36) + randomUUID().slice(0, 4);
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

      // 5. Click the "Role Assignments" tab
      await drawerTab(page, 'Role Assignments').click();
      await expect(drawerTab(page, 'Role Assignments')).toHaveAttribute(
        'aria-current',
        'true',
      );

      // 6. Click the "Add User" button
      await drawer.getByRole('button', { name: 'Add User' }).click();

      // 7. Verify a modal titled "Add User" appears with a multi-select "Users" field
      const assignModal = page.getByRole('dialog', { name: 'Add User' });
      await expect(assignModal).toBeVisible();
      await expect(
        assignModal.getByRole('button', { name: 'Users' }),
      ).toBeVisible();

      // 8. Attempt to click "Add" (OK) without selecting any user – verify validation error
      await assignModal.getByRole('button', { name: 'Add' }).click();
      await expect(
        assignModal.getByText(/Please select at least one user|required/i),
      ).toBeVisible({ timeout: 5000 });

      // 9-10. Search the Users picker for the test user's email and select it
      await pickAssignUser(page, assignModal, TEST_USER_EMAIL);

      // 11. Click "Add"
      await assignModal.getByRole('button', { name: 'Add' }).click();

      // 12. Verify the modal closes
      await expect(assignModal).toBeHidden({ timeout: 10000 });

      // 13. Verify a success notification "Users assigned to role successfully." appears
      await expect(
        toast(page, /Users assigned to role successfully/i),
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
      // Navigate to Role Assignments tab
      await drawerTab(page, 'Role Assignments').click();
      await drawer.getByRole('button', { name: 'Add User' }).click();

      const assignModal = page.getByRole('dialog', { name: 'Add User' });
      await expect(assignModal).toBeVisible();
      await pickAssignUser(page, assignModal, TEST_USER_EMAIL);
      await assignModal.getByRole('button', { name: 'Add' }).click();
      await expect(assignModal).toBeHidden({ timeout: 10000 });
      await expect(
        toast(page, /Users assigned to role successfully/i),
      ).toBeVisible({ timeout: 10000 });

      // 4. Locate the assigned user row in the Role Assignments tab
      const userRow = drawer
        .getByRole('row')
        .filter({ hasText: TEST_USER_EMAIL });
      await expect(userRow).toBeVisible({ timeout: 10000 });

      // 5. Hover over the User ID cell to reveal action buttons
      await userRow.hover();

      // 6. Click the row's "Revoke User" (trash bin icon) action button
      await userRow
        .getByRole('button', { name: 'Revoke User', exact: true })
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
        toast(page, /User removed from role successfully/i),
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

      // 5. Click the "Role Assignments" tab
      await drawerTab(page, 'Role Assignments').click();
      await expect(drawerTab(page, 'Role Assignments')).toHaveAttribute(
        'aria-current',
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

      // Close the drawer and cleanup test role. Wait for the close animation
      // so cleanup does not try to close a drawer that is already leaving.
      await drawer.getByRole('button', { name: 'Close' }).click();
      await expect(drawer).toBeHidden({ timeout: 5000 });
      await cleanupTestRole(page);
    });
  },
);

// Managers >= 26.9.0a4 render `RoleDetailDrawerV2`: a metadata card with the
// role's one scope, and a Permissions tab that edits grants in place as a
// Read / Write checkbox grid behind a floating save bar (#9849, ADR 0006).
// `createTestRole` scopes the role to the signed-in domain: the e2e admin's
// own domain (`getE2EDomainName`), which is not `default` on every cluster.

async function openRoleDrawer(page: Page, roleName: string) {
  await navigateTo(page, 'rbac');
  await searchForRole(page, roleName);
  await page
    .getByRole('row')
    .filter({ hasText: roleName })
    .first()
    .getByRole('button', { name: roleName, exact: true })
    .click();
  const drawer = roleDrawer(page);
  await expect(drawer).toBeVisible({ timeout: 10000 });
  return drawer;
}

// Each grid row is one permission type; its cells hold one checkbox per
// permission bit, named after the bit ("Read", "Create", …). A `has` locator
// resolves inside the row, so it must be page-rooted, not drawer-rooted.
function permissionRow(drawer: Locator, permissionType: string) {
  return drawer.getByRole('row').filter({
    has: drawer.page().getByRole('cell', { name: permissionType, exact: true }),
  });
}

function saveBarText(drawer: Locator) {
  return drawer.getByText(/unsaved permission change\(s\)/);
}

test.describe(
  'RBAC Role Detail Drawer for a single-scope role',
  { tag: ['@rbac', '@regression', '@functional', '@requires-manager-v26.9'] },
  () => {
    let roleName: string;
    let roleToCleanup: string | undefined;

    test.beforeEach(async ({ page, request }) => {
      roleToCleanup = undefined;
      await loginAsAdmin(page, request);
      roleName = `e2e-scope-role-${Date.now().toString(36)}${randomUUID().slice(0, 4)}`;
      roleToCleanup = roleName;
      await navigateTo(page, 'rbac');
      await createTestRole(page, roleName);
    });

    test.afterEach(async ({ page }) => {
      if (!roleToCleanup) return;
      try {
        await navigateTo(page, 'rbac');
        const createModal = page.getByRole('dialog', { name: 'Create Role' });
        if (await createModal.isVisible()) {
          await createModal.getByRole('button', { name: 'Cancel' }).click();
        }
        await cleanupTestRole(page, roleToCleanup);
      } catch (error) {
        console.warn(
          `[rbac-role-detail] failed to purge role ${roleName}:`,
          error,
        );
      } finally {
        roleToCleanup = undefined;
      }
    });

    test('Superadmin can see the role scope as a type and target token in the role drawer', async ({
      page,
    }) => {
      const drawer = await openRoleDrawer(page, roleName);

      await expect(
        drawer.getByRole('heading', { name: 'RBAC Role Info' }),
      ).toBeVisible();
      await expect(drawer.getByText(roleName, { exact: true })).toBeVisible();
      await expect(
        drawer.getByRole('button', { name: 'Copy' }).first(),
      ).toBeVisible();
      await expect(
        drawer.getByText(ROLE_DESCRIPTION, { exact: true }),
      ).toBeVisible();

      await expect(
        drawer.getByRole('term').filter({ hasText: 'Scope Type / Target' }),
      ).toBeVisible();
      const scopeDomain = await getE2EDomainName();
      const scopeToken = drawer
        .getByRole('definition')
        .filter({ hasText: 'Domain' })
        .filter({ hasText: scopeDomain });
      await expect(scopeToken).toBeVisible();
      await expect(
        scopeToken.getByText('Domain', { exact: true }),
      ).toBeVisible();
      await expect(
        scopeToken.getByText(scopeDomain, { exact: true }),
      ).toBeVisible();
    });

    test('Superadmin can toggle role permissions in the Read and Write grid and save them', async ({
      page,
    }) => {
      let drawer = await openRoleDrawer(page, roleName);
      await expect(drawerTab(page, 'Permissions')).toHaveAttribute(
        'aria-current',
        'true',
      );

      let folderRow = permissionRow(drawer, 'Folder');
      await expect(folderRow).toBeVisible({ timeout: 10000 });
      const readCheckbox = () =>
        permissionRow(drawer, 'Folder').getByRole('checkbox', {
          name: 'Read',
          exact: true,
        });
      const createCheckbox = () =>
        permissionRow(drawer, 'Folder').getByRole('checkbox', {
          name: 'Create',
          exact: true,
        });
      await expect(readCheckbox()).not.toBeChecked();
      await expect(createCheckbox()).not.toBeChecked();
      await expect(saveBarText(drawer)).toBeHidden();

      // Cancel discards every pending toggle.
      await readCheckbox().check();
      await createCheckbox().check();
      await expect(saveBarText(drawer)).toHaveText(
        '2 unsaved permission change(s)',
      );
      await drawer.getByRole('button', { name: 'Cancel' }).click();
      await expect(saveBarText(drawer)).toBeHidden();
      await expect(readCheckbox()).not.toBeChecked();
      await expect(createCheckbox()).not.toBeChecked();

      // Save ships the pending toggle and retires the save bar.
      await readCheckbox().check();
      await expect(saveBarText(drawer)).toHaveText(
        '1 unsaved permission change(s)',
      );
      await drawer.getByRole('button', { name: 'Save' }).click();
      await expect(
        page.getByText('Permissions saved successfully.').first(),
      ).toBeVisible({ timeout: 10000 });
      await expect(saveBarText(drawer)).toBeHidden({ timeout: 10000 });
      await expect(readCheckbox()).toBeChecked();

      // The grant survives a reload.
      await page.reload();
      drawer = await openRoleDrawer(page, roleName);
      folderRow = permissionRow(drawer, 'Folder');
      await expect(folderRow).toBeVisible({ timeout: 10000 });
      await expect(readCheckbox()).toBeChecked();
      await expect(createCheckbox()).not.toBeChecked();
      await expect(saveBarText(drawer)).toBeHidden();
    });

    test('Superadmin can filter the permission rows by permission type', async ({
      page,
    }) => {
      const drawer = await openRoleDrawer(page, roleName);
      await expect(permissionRow(drawer, 'Agent')).toBeVisible({
        timeout: 10000,
      });
      await expect(permissionRow(drawer, 'Folder')).toBeVisible();

      const filterInput = drawer.getByRole('textbox', {
        name: 'Filter by permission type',
      });
      await filterInput.fill('folder');

      await expect(permissionRow(drawer, 'Folder')).toBeVisible();
      await expect(permissionRow(drawer, 'Agent')).toBeHidden();
      const visibleRows = dataRows(page, drawer);
      await expect(visibleRows.first()).toBeVisible();
      await expect
        .poll(async () => {
          const types = await visibleRows.evaluateAll((rows) =>
            rows.map((row) => row.querySelector('td')?.textContent ?? ''),
          );
          return (
            types.length > 0 && types.every((type) => /folder/i.test(type))
          );
        })
        .toBe(true);

      await filterInput.fill('');
      await expect(permissionRow(drawer, 'Agent')).toBeVisible();
    });
  },
);

test.describe(
  'RBAC Role Detail Drawer - View Presets link',
  { tag: ['@rbac', '@regression', '@functional', '@requires-manager-v26.9'] },
  () => {
    test('Superadmin can open exactly the preset of a system role from the role detail drawer', async ({
      page,
      request,
    }) => {
      await loginAsAdmin(page, request);

      // The role list query carries each role's `rolePresetId` (a raw
      // uuid; #10322 dropped `rolePreset { id }`), the identity the link must
      // land on.
      const rolePresetIdByRoleName = new Map<string, string>();
      page.on('response', async (response) => {
        if (!response.request().postData()?.includes('RBACManagementPageQuery'))
          return;
        const body = await response.json().catch(() => null);
        for (const edge of body?.data?.adminRoles?.edges ?? []) {
          if (edge?.node?.name && edge.node.rolePresetId) {
            rolePresetIdByRoleName.set(edge.node.name, edge.node.rolePresetId);
          }
        }
      });

      // Land on the Roles tab already filtered to SYSTEM roles, the only
      // source whose Permissions tab carries the View Presets link.
      await navigateTo(
        page,
        `admin/rbac?${new URLSearchParams({
          tab: 'roles',
          filter: JSON.stringify({ source: { equals: 'SYSTEM' } }),
        })}`,
      );
      const roleRows = dataRows(page);
      await expect(roleRows.first()).toBeVisible({
        timeout: SLOW_PAGE_TIMEOUT,
      });
      const roleNameButton = roleRows
        .first()
        .getByRole('cell')
        .first()
        .getByRole('button')
        .first();
      const roleName = (await roleNameButton.innerText()).trim();
      await expect
        .poll(() => rolePresetIdByRoleName.get(roleName), {
          message: `role list response names the preset of ${roleName}`,
        })
        .toBeTruthy();
      const expectedPresetId = rolePresetIdByRoleName.get(roleName);
      await roleNameButton.click();

      const drawer = roleDrawer(page);
      await expect(drawer).toBeVisible({ timeout: 10000 });
      const viewPresetsLink = drawer.getByText('View Presets', { exact: true });
      await expect(viewPresetsLink).toBeVisible({ timeout: 10000 });
      const presetListResponse = page.waitForResponse(
        (response) =>
          !!response.request().postData()?.includes('RolePresetListTabQuery') &&
          !!response
            .request()
            .postData()
            ?.includes(expectedPresetId ?? ''),
      );
      await viewPresetsLink.click();

      await expect(drawer).toBeHidden({ timeout: 10000 });
      await expect(
        page
          .getByRole('navigation', { name: 'Tabs' })
          .getByRole('button', { name: 'Presets', exact: true }),
      ).toHaveAttribute('aria-current', 'true');

      await expect(page).toHaveURL(/[?&]tab=presets(&|$)/);
      expect(
        JSON.parse(new URL(page.url()).searchParams.get('filter') ?? '{}'),
      ).toEqual({ id: { equals: expectedPresetId } });

      // The id condition shows as a removable chip in the Presets filter.
      const searchFilters = page.getByRole('group', { name: 'Search filters' });
      await expect(
        searchFilters.getByRole('button', { name: 'ID: equals', exact: true }),
      ).toBeVisible();
      await expect(
        searchFilters.getByRole('button', {
          name: 'Remove ID: equals',
          exact: true,
        }),
      ).toBeVisible();

      // Exactly one preset is listed, and it is the role's own preset.
      const presetEdges =
        (await (await presetListResponse).json())?.data?.adminRolePresets
          ?.edges ?? [];
      expect(
        presetEdges.map((edge: { node: { id: string } }) =>
          toLocalId(edge.node.id),
        ),
      ).toEqual([expectedPresetId]);
      await expect(dataRows(page)).toHaveCount(1, {
        timeout: SLOW_PAGE_TIMEOUT,
      });
    });
  },
);
