// spec: Resource Policy page tests
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import test, { expect, type Locator, type Page } from '@playwright/test';

const TEST_RUN_ID = Date.now().toString(36);

// BAINameActionCell measures the name column and moves whatever does not fit
// into a "More actions" DropdownMenu, so the SAME action is a directly
// clickable icon button on one tab and an overflow menu item on another: the
// Keypair list declares three actions (Info / Edit / Delete) and overflows all
// of them, while the User and Project lists declare two and render them
// inline. Resolve both shapes instead of assuming one.
async function clickRowAction(
  page: Page,
  row: Locator,
  action: 'Edit' | 'Delete',
) {
  const iconButton = row.getByRole('button', { name: action, exact: true });
  const isInline = await iconButton
    .isVisible({ timeout: 2000 })
    .catch(() => false);
  if (isInline) {
    await iconButton.click();
    return;
  }
  await row.getByRole('button', { name: 'More actions' }).click();
  await page.getByRole('menuitem', { name: action, exact: true }).click();
}

async function cleanupPolicy(page: Page, policyName: string) {
  const row = page.getByRole('row').filter({ hasText: policyName });
  const isVisible = await row.isVisible({ timeout: 2000 }).catch(() => false);
  if (isVisible) {
    await clickRowAction(page, row, 'Delete');
    // BAIDeleteConfirmModal with requireConfirmInput: type the policy name to
    // enable Delete. The input carries `name="confirmText"` (not `id`), so
    // scope to the dialog's single textbox instead of an `#confirmText` id.
    const confirmInput = page.getByRole('dialog').getByRole('textbox');
    await expect(confirmInput).toBeVisible();
    await confirmInput.fill(policyName);
    // Scope to the confirm dialog: FR-3331 exposes each row's delete action
    // title as aria-label="Delete" (BAINameActionCell), so a page-wide
    // name:'Delete' now also matches every table row's delete button. The
    // modal's Delete button is the intended target.
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Delete', exact: true })
      .click();
    await expect(row).toBeHidden({ timeout: 10000 });
  }
}

// Each CRUD test provisions its own uniquely-named policy so that edit and
// delete no longer depend on a create test having run first. TEST_RUN_ID keeps
// names unique across runs; the per-test label keeps them unique within a run.
function policyName(kind: string, label: string) {
  return `e2e-${kind}-policy-${TEST_RUN_ID}-${label}`;
}

// The page's tab strip is `BAICard`'s `tabList`, which renders through
// `BAITabList` -> Astryx `TabList`. Left without an explicit `role="tablist"`
// (ResourcePolicyPage does not set one), `TabList` speaks the NAVIGATION
// pattern: a `<nav aria-label="Tabs">` whose tabs are plain `<button>`s and
// whose active tab is marked `aria-current="true"` — there is no `role="tab"`
// and no `aria-selected`. See `Tab.tsx`'s `isTabRole` branch in
// `@astryxdesign/core`.
function policyTab(page: Page, tabName: 'Keypair' | 'User' | 'Project') {
  return page
    .getByRole('navigation', { name: 'Tabs' })
    .getByRole('button', { name: `${tabName} Resource Policy`, exact: true });
}

async function expectPolicyTabActive(
  page: Page,
  tabName: 'Keypair' | 'User' | 'Project',
) {
  const tab = policyTab(page, tabName);
  // `navigateTo` resolves on `load`, but the SPA still has to boot, read the
  // session and render the card — regularly longer than the 5 s expect
  // timeout. The sibling assertions get this for free from the click's
  // 30 s actionTimeout; this one has no click in front of it.
  await expect(tab).toBeVisible({ timeout: 30000 });
  await expect(tab).toHaveAttribute('aria-current', 'true');
}

async function selectPolicyTab(
  page: Page,
  tabName: 'Keypair' | 'User' | 'Project',
) {
  await policyTab(page, tabName).click();
  await expectPolicyTabActive(page, tabName);
}

// A BAITable column header, matched on its visible label. `getByRole(
// 'columnheader', { name })` does NOT work for sortable columns: the header's
// content is a sort button whose `aria-label` ("Sort by max_vfolder_count")
// overrides the label text in the accessible-name computation, so the
// user-visible label never appears in the header's accessible name.
async function expectColumnHeader(page: Page, label: string) {
  await expect(
    page.getByRole('columnheader').filter({ hasText: label }),
  ).toBeVisible();
}

// The default policy row, located without `.ant-*` classes (antd is gone).
// A plain `getByRole('row').filter({ hasText: 'default' })` also matches the
// HEADER row, whose accessible name contains the `default_for_unspecified`
// column's "Sort by default_for_unspecified" button label. Anchoring the row's
// accessible name at "default " excludes it: the header row's name starts with
// "Sort by name".
function defaultPolicyRow(page: Page) {
  return page.getByRole('row', { name: /^default\s/ });
}

// Creation helpers — extracted so each test can provision its own resource.
// Each assumes the caller is already on the resource-policy page; the helper
// selects the right tab, clears any leftover policy of the same name (retry
// safety), creates the policy and verifies it appears.
async function createKeypairPolicy(page: Page, name: string) {
  // Keypair is the default tab.
  await cleanupPolicy(page, name);
  // Anchored regex: a substring match on 'Create' also matches the
  // "Sort by created_at" column-header button (accessible name contains
  // "creat" from "created_at"). Anchoring at the start excludes it while
  // still matching both "Create" and "Create Policy" button labels.
  await page.getByRole('button', { name: /^Create/i }).click();
  const modal = page.getByRole('dialog', {
    name: 'Create Keypair Resource Policy',
  });
  await expect(modal).toBeVisible();
  await modal.getByRole('textbox', { name: 'Name' }).fill(name);
  await modal.getByRole('button', { name: 'Create' }).click();
  await expect(modal).toBeHidden({ timeout: 10000 });
  await expect(page.getByRole('row').filter({ hasText: name })).toBeVisible({
    timeout: 10000,
  });
}

async function createUserPolicy(page: Page, name: string) {
  await selectPolicyTab(page, 'User');
  await cleanupPolicy(page, name);
  // See createKeypairPolicy: anchored to exclude "Sort by created_at".
  await page.getByRole('button', { name: /^Create/i }).click();
  const modal = page.getByRole('dialog', {
    name: 'Create User Resource Policy',
  });
  await expect(modal).toBeVisible();
  await modal.getByRole('textbox', { name: 'Name' }).fill(name);
  await modal
    .getByRole('spinbutton', { name: 'Max Session Count Per Model Session' })
    .fill('10');
  await modal
    .getByRole('spinbutton', { name: 'Max Customized Image Count' })
    .fill('3');
  await modal.getByRole('button', { name: 'Create' }).click();
  // User policy creation makes an API call that may take time.
  await expect(modal).toBeHidden({ timeout: 30000 });
  await expect(page.getByRole('row').filter({ hasText: name })).toBeVisible({
    timeout: 10000,
  });
}

async function createProjectPolicy(page: Page, name: string) {
  await selectPolicyTab(page, 'Project');
  await cleanupPolicy(page, name);
  // See createKeypairPolicy: anchored to exclude "Sort by created_at".
  await page.getByRole('button', { name: /^Create/i }).click();
  const modal = page.getByRole('dialog');
  await expect(modal).toBeVisible();
  await modal.getByRole('textbox', { name: 'Name' }).fill(name);
  await modal.getByRole('button', { name: 'Create' }).click();
  await expect(modal).toBeHidden({ timeout: 10000 });
  await expect(page.getByRole('row').filter({ hasText: name })).toBeVisible({
    timeout: 10000,
  });
}

// Deletes a policy on the current tab by hovering its row and confirming the
// typed-name delete modal. Used by the delete tests (where deletion is the
// asserted behavior) — create/edit tests reuse cleanupPolicy for teardown.
async function deletePolicyAndVerify(page: Page, name: string) {
  const policyRow = page.getByRole('row').filter({ hasText: name });
  await expect(policyRow).toBeVisible();
  await clickRowAction(page, policyRow, 'Delete');

  // BAIDeleteConfirmModal with requireConfirmInput: type the policy name to
  // enable Delete. The input carries `name="confirmText"`, not an `id`.
  const confirmInput = page.getByRole('dialog').getByRole('textbox');
  await expect(confirmInput).toBeVisible();
  await confirmInput.fill(name);

  // Scope to the confirm dialog: FR-3331 exposes each row's delete action
  // title as aria-label="Delete" (BAINameActionCell), so a page-wide
  // name:'Delete' now also matches every table row's delete button. The
  // modal's Delete button is the intended target.
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Delete', exact: true })
    .click();

  await expect(page.getByRole('row').filter({ hasText: name })).toBeHidden({
    timeout: 10000,
  });
}

test.describe(
  'Resource Policy',
  { tag: ['@critical', '@resource-policy', '@functional'] },
  () => {
    // Not serial: each CRUD test provisions its own uniquely-named policy and
    // cleans up after itself, so the tests are order-independent and a failure
    // in one does not cascade-skip the others (FR-3116). `mode: 'default'` only
    // removes serial's cascade-skip — it does not by itself pin execution to a
    // single worker: under the project's `fullyParallel: true` these tests can
    // run concurrently locally and run sequentially on CI (`workers: 1`). The
    // independence above makes both execution orders safe.
    test.describe.configure({ mode: 'default' });

    // Independent of the CRUD tests: only reads the default policy list, so a
    // CRUD failure must not skip it (extracted from the serial block in FR-3113).
    test('Admin can see Keypair policy list with expected columns', async ({
      page,
      request,
    }) => {
      await loginAsAdmin(page, request);
      await navigateTo(page, 'resource-policy');

      // Verify Keypair tab is selected by default
      await expectPolicyTabActive(page, 'Keypair');

      // Verify table columns. A sortable BAITable header's accessible NAME is
      // the sort button's aria-label ("Sort by max_containers_per_session"),
      // which replaces the visible label in the name computation — so match the
      // header's TEXT, which is the label the user actually reads.
      await expectColumnHeader(page, 'Name');
      await expectColumnHeader(page, 'Concurrent Sessions');
      await expectColumnHeader(page, 'Cluster Size');

      // Verify default policy row exists
      await expect(defaultPolicyRow(page)).toBeVisible();
    });

    test('Admin can create a Keypair policy', async ({ page, request }) => {
      const name = policyName('kp', 'create');
      await loginAsAdmin(page, request);
      await navigateTo(page, 'resource-policy');

      await createKeypairPolicy(page, name);

      // Self-cleanup so the created policy does not leak to later runs.
      await cleanupPolicy(page, name);
    });

    test('Admin can edit a Keypair policy', async ({ page, request }) => {
      const name = policyName('kp', 'edit');
      await loginAsAdmin(page, request);
      await navigateTo(page, 'resource-policy');

      // Provision this test's own policy so it doesn't depend on the create test.
      await createKeypairPolicy(page, name);

      // Find the test policy row and open its edit action. On the Keypair tab
      // BAINameActionCell collapses all three actions into the "More actions"
      // menu, so there is no directly-clickable "Edit" icon button —
      // clickRowAction resolves either shape.
      const policyRow = page.getByRole('row').filter({ hasText: name });
      await expect(policyRow).toBeVisible();
      await clickRowAction(page, policyRow, 'Edit');

      // Verify Update dialog appears
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();

      // Change Cluster Size to 2
      const clusterSizeInput = modal.getByRole('spinbutton', {
        name: 'Cluster Size',
      });
      await clusterSizeInput.fill('2');

      // Click Save (FR-3331 switched edit-form submits from "OK" to "Save")
      await modal.getByRole('button', { name: 'Save' }).click();

      // Verify modal closes
      await expect(modal).toBeHidden({ timeout: 10000 });

      // Verify the cluster size value is updated in the table
      const updatedRow = page.getByRole('row').filter({ hasText: name });
      await expect(
        updatedRow.getByRole('cell', { name: '2', exact: true }),
      ).toBeVisible({ timeout: 10000 });

      // Self-cleanup.
      await cleanupPolicy(page, name);
    });

    test('Admin can delete a Keypair policy', async ({ page, request }) => {
      const name = policyName('kp', 'delete');
      await loginAsAdmin(page, request);
      await navigateTo(page, 'resource-policy');

      // Provision this test's own policy, then delete it (the asserted behavior).
      await createKeypairPolicy(page, name);
      await deletePolicyAndVerify(page, name);
    });

    // Independent of the CRUD tests: only reads the default policy list, so a
    // CRUD failure must not skip it (extracted from the serial block in FR-3113).
    test('Admin can see User policy list', async ({ page, request }) => {
      await loginAsAdmin(page, request);
      await navigateTo(page, 'resource-policy');

      // Switch to User tab
      await selectPolicyTab(page, 'User');

      // Verify table columns (see the Keypair test for why this matches text).
      await expectColumnHeader(page, 'Name');
      await expectColumnHeader(page, 'Max Folder Count');

      // Verify default policy row exists
      await expect(defaultPolicyRow(page)).toBeVisible();
    });

    test('Admin can create a User policy', async ({ page, request }) => {
      const name = policyName('user', 'create');
      await loginAsAdmin(page, request);
      await navigateTo(page, 'resource-policy');

      await createUserPolicy(page, name);

      // Self-cleanup (createUserPolicy left us on the User tab).
      await cleanupPolicy(page, name);
    });

    test('Admin can delete a User policy', async ({ page, request }) => {
      const name = policyName('user', 'delete');
      await loginAsAdmin(page, request);
      await navigateTo(page, 'resource-policy');

      // Provision this test's own policy, then delete it (createUserPolicy
      // leaves us on the User tab where the policy lives).
      await createUserPolicy(page, name);
      await deletePolicyAndVerify(page, name);
    });

    // Independent of the CRUD tests: only reads the default policy list, so a
    // CRUD failure must not skip it (extracted from the serial block in FR-3113).
    test('Admin can see Project policy list', async ({ page, request }) => {
      await loginAsAdmin(page, request);
      await navigateTo(page, 'resource-policy');

      // Switch to Project tab
      await selectPolicyTab(page, 'Project');

      // Verify table columns (see the Keypair test for why this matches text).
      await expectColumnHeader(page, 'Name');
      await expectColumnHeader(page, 'Max Folder Count');

      // Verify default policy row
      await expect(defaultPolicyRow(page)).toBeVisible();
    });

    test('Admin can create a Project policy', async ({ page, request }) => {
      const name = policyName('proj', 'create');
      await loginAsAdmin(page, request);
      await navigateTo(page, 'resource-policy');

      await createProjectPolicy(page, name);

      // Self-cleanup (createProjectPolicy left us on the Project tab).
      await cleanupPolicy(page, name);
    });

    test('Admin can delete a Project policy', async ({ page, request }) => {
      const name = policyName('proj', 'delete');
      await loginAsAdmin(page, request);
      await navigateTo(page, 'resource-policy');

      // Provision this test's own policy, then delete it (createProjectPolicy
      // leaves us on the Project tab where the policy lives).
      await createProjectPolicy(page, name);
      await deletePolicyAndVerify(page, name);
    });
  },
);
