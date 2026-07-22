// spec: Resource Policy page tests
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import test, { expect, type Page } from '@playwright/test';

const TEST_RUN_ID = Date.now().toString(36);

async function cleanupPolicy(page: Page, policyName: string) {
  const row = page.getByRole('row').filter({ hasText: policyName });
  const isVisible = await row.isVisible({ timeout: 2000 }).catch(() => false);
  if (isVisible) {
    // Hover over the name cell to reveal BAINameActionCell actions
    await row.getByRole('cell').first().hover();
    await row.getByRole('button', { name: 'delete' }).click();
    // BAIDeleteConfirmModal with requireConfirmInput: type the policy name to enable Delete
    const confirmInput = page.locator('#confirmText');
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

async function selectPolicyTab(
  page: Page,
  tabName: 'Keypair' | 'User' | 'Project',
) {
  await page.getByRole('tab', { name: tabName }).click();
  await expect(
    page.getByRole('tab', { name: tabName, selected: true }),
  ).toBeVisible();
}

// Creation helpers — extracted so each test can provision its own resource.
// Each assumes the caller is already on the resource-policy page; the helper
// selects the right tab, clears any leftover policy of the same name (retry
// safety), creates the policy and verifies it appears.
async function createKeypairPolicy(page: Page, name: string) {
  // Keypair is the default tab.
  await cleanupPolicy(page, name);
  await page.getByRole('button', { name: 'Create' }).click();
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
  await page.getByRole('button', { name: 'Create' }).click();
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
  await page.getByRole('button', { name: 'Create' }).click();
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
  await policyRow.getByRole('cell').first().hover();
  await policyRow.getByRole('button', { name: 'delete' }).click();

  // BAIDeleteConfirmModal with requireConfirmInput: type the policy name to enable Delete
  const confirmInput = page.locator('#confirmText');
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
      await expect(
        page.getByRole('tab', { name: 'Keypair', selected: true }),
      ).toBeVisible();

      // Verify table columns
      await expect(
        page.getByRole('columnheader', { name: 'Name' }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'Concurrent Sessions' }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'Cluster Size' }),
      ).toBeVisible();

      // Verify default policy row exists
      // Scope to tbody rows: a column header tooltip also contains the text
      // "Default" (e.g. "Default For Unspecified"), which a plain
      // getByRole('row') filter would match too via case-insensitive substring
      // matching, causing a strict-mode violation.
      const defaultRow = page
        .locator('.ant-table-tbody .ant-table-row')
        .filter({ hasText: 'default' });
      await expect(defaultRow).toBeVisible();
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

      // Find the test policy row, hover to reveal actions, and click the
      // edit action by its accessible name (the action title is exposed as
      // the button's `aria-label` by BAINameActionCell — FR-3331).
      const policyRow = page.getByRole('row').filter({ hasText: name });
      await expect(policyRow).toBeVisible();
      await policyRow.getByRole('cell').first().hover();
      await policyRow
        .getByRole('button', { name: 'Edit', exact: true })
        .click();

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
      await page.getByRole('tab', { name: 'User' }).click();
      await expect(
        page.getByRole('tab', { name: 'User', selected: true }),
      ).toBeVisible();

      // Verify table columns
      await expect(
        page.getByRole('columnheader', { name: 'Name' }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'Max Folder Count' }),
      ).toBeVisible();

      // Verify default policy row exists
      // Scope to tbody rows: a column header tooltip also contains the text
      // "Default" (e.g. "Default For Unspecified"), which a plain
      // getByRole('row') filter would match too via case-insensitive substring
      // matching, causing a strict-mode violation.
      const defaultRow = page
        .locator('.ant-table-tbody .ant-table-row')
        .filter({ hasText: 'default' });
      await expect(defaultRow).toBeVisible();
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
      await page.getByRole('tab', { name: 'Project' }).click();
      await expect(
        page.getByRole('tab', { name: 'Project', selected: true }),
      ).toBeVisible();

      // Verify table columns
      await expect(
        page.getByRole('columnheader', { name: 'Name' }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'Max Folder Count' }),
      ).toBeVisible();

      // Verify default policy row
      // Scope to tbody rows: a column header tooltip also contains the text
      // "Default" (e.g. "Default For Unspecified"), which a plain
      // getByRole('row') filter would match too via case-insensitive substring
      // matching, causing a strict-mode violation.
      const defaultRow = page
        .locator('.ant-table-tbody .ant-table-row')
        .filter({ hasText: 'default' });
      await expect(defaultRow).toBeVisible();
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
