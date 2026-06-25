// spec: e2e/.agent-output/test-plan-project.md
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import test, { expect, Page } from '@playwright/test';

const TEST_RUN_ID = Date.now().toString(36);
const PROJECT_DESCRIPTION = 'Test project for E2E';
const UPDATED_DESCRIPTION = 'Updated E2E description';

// Each CRUD test provisions its own uniquely-named project so that edit,
// filter and delete no longer depend on a create test having run first.
// TEST_RUN_ID keeps names unique across runs; the per-test label keeps them
// unique within a run.
function projectName(label: string) {
  return `e2e-test-project-${TEST_RUN_ID}-${label}`;
}

// Not serial: each CRUD test provisions and cleans up its own uniquely-named
// project, so the tests are order-independent and a failure in one does not
// cascade-skip the others. `mode: 'default'` only removes serial's cascade-skip
// — it does not by itself pin execution to a single worker: under the project's
// `fullyParallel: true` these tests can run concurrently locally and run
// sequentially on CI (`workers: 1`). The independence above makes both safe.
test.describe.configure({ mode: 'default' });

// Cleanup function to delete a test project if it exists.
// The project lifecycle is: Active → Deactivated (trash) → Purged (hard delete).
// This helper handles all lifecycle states: if the project is active it
// deactivates it first, then switches to the Inactive tab and purges it.
async function cleanupTestProject(page: Page, projectName: string) {
  // Check Active tab first
  const activeProjectRow = page
    .getByRole('row')
    .filter({ hasText: projectName });
  const isActiveVisible = await activeProjectRow
    .isVisible({ timeout: 2000 })
    .catch(() => false);

  if (isActiveVisible) {
    // Deactivate first (Popconfirm flow)
    await activeProjectRow.hover();
    await activeProjectRow
      .locator('.bai-name-action-cell-actions button')
      .nth(1)
      .click();
    const deactivatePopconfirm = page.locator('.ant-popconfirm');
    await expect(deactivatePopconfirm).toBeVisible({ timeout: 5000 });
    await deactivatePopconfirm
      .getByRole('button', { name: 'Deactivate' })
      .click();
    await expect(activeProjectRow).toBeHidden({ timeout: 10000 });
  }

  // Switch to Inactive tab and purge
  // Use the label wrapper (not the hidden radio input) to click the radio button
  await page
    .locator('label')
    .filter({ hasText: /^Inactive$/ })
    .click();
  const inactiveProjectRow = page
    .getByRole('row')
    .filter({ hasText: projectName });
  const isInactiveVisible = await inactiveProjectRow
    .isVisible({ timeout: 5000 })
    .catch(() => false);

  if (isInactiveVisible) {
    await inactiveProjectRow.hover();
    // In Inactive tab: buttons are [setting(0), activate(1), purge(2)]
    await inactiveProjectRow
      .locator('.bai-name-action-cell-actions button')
      .nth(2)
      .click();
    const purgeDialog = page.getByRole('dialog', { name: 'Purge Project' });
    await expect(purgeDialog).toBeVisible({ timeout: 5000 });
    await purgeDialog.locator('#confirmText').fill(projectName);
    await purgeDialog.getByRole('button', { name: 'Purge' }).click();
    await expect(inactiveProjectRow).toBeHidden({ timeout: 10000 });
  }

  // Return to Active tab for subsequent tests
  await page
    .locator('label')
    .filter({ hasText: /^Active$/ })
    .click();
}

// Creation helper — extracted so each test can provision its own project.
// Assumes the caller is already on the project page; pre-cleans any leftover
// project of the same name (retry safety), creates it and verifies it appears.
async function createProject(page: Page, name: string, description: string) {
  await cleanupTestProject(page, name);

  // Click the Create Project button
  await page.getByRole('button', { name: 'Create Project' }).click();

  // Verify Create Project dialog appears
  const modal = page.locator('.ant-modal');
  await expect(modal).toBeVisible();
  await expect(modal.getByText('Create Project')).toBeVisible();

  // Fill in the project name and description
  await modal.getByRole('textbox', { name: 'Name' }).fill(name);
  await modal.getByRole('textbox', { name: 'Description' }).fill(description);

  // Select Domain 'default'
  await modal.getByRole('combobox', { name: 'Domain' }).click();
  await page.locator('.ant-select-dropdown').waitFor({ state: 'visible' });
  await page
    .locator('.ant-select-item-option')
    .filter({ hasText: 'default' })
    .click();

  // Click OK to create and verify the modal closes
  await modal.getByRole('button', { name: 'OK' }).click();
  await expect(modal).toBeHidden({ timeout: 10000 });

  // Verify the new project appears in the table. The name column renders via
  // BAINameActionCell so the cell's accessible name also includes hover-only
  // action labels; match by filter({ hasText }) instead of exact name.
  await expect(page.getByRole('row').filter({ hasText: name })).toBeVisible({
    timeout: 10000,
  });
}

// Independent of the CRUD tests: only reads the default project list, so a
// CRUD failure must not skip it (extracted from the serial block in FR-3113).
test.describe(
  'Project List',
  { tag: ['@critical', '@project', '@functional'] },
  () => {
    test('Admin can see project list with expected columns', async ({
      page,
      request,
    }) => {
      // 1. Login as admin and navigate to project page
      await loginAsAdmin(page, request);
      await navigateTo(page, 'project');

      // 2. Verify the Project tab is selected
      await expect(
        page.getByRole('tab', { name: 'Project', selected: true }),
      ).toBeVisible();

      // 3. Verify table columns are visible
      await expect(
        page.getByRole('columnheader', { name: 'Name' }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'Domain' }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'Description' }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'Type' }),
      ).toBeVisible();

      // 4. Verify the default project row
      const defaultRow = page
        .getByRole('row')
        .filter({ hasText: 'default' })
        .first();
      await expect(defaultRow).toBeVisible();

      // 5. Verify the Active radio button is selected and the default row has Type = GENERAL
      // (Active is a filter tab, not a table column; the default project is active by default)
      await expect(
        page.locator('.ant-radio-button-wrapper-checked', {
          hasText: 'Active',
        }),
      ).toBeVisible();
      await expect(
        defaultRow.getByRole('cell', { name: 'GENERAL' }),
      ).toBeVisible();
    });
  },
);

// No longer serial: each test provisions its own uniquely-named project and
// cleans up after itself, so a failure in one no longer cascade-skips the rest.
test.describe(
  'Project CRUD',
  { tag: ['@critical', '@project', '@functional'] },
  () => {
    test('Admin can create a new project', async ({ page, request }) => {
      const name = projectName('create');
      await loginAsAdmin(page, request);
      await navigateTo(page, 'project');

      await createProject(page, name, PROJECT_DESCRIPTION);

      // Self-cleanup so the created project does not leak to later runs.
      await cleanupTestProject(page, name);
    });

    test('Admin can edit a project', async ({ page, request }) => {
      const name = projectName('edit');
      await loginAsAdmin(page, request);
      await navigateTo(page, 'project');

      // Provision this test's own project so it doesn't depend on the create test.
      await createProject(page, name, PROJECT_DESCRIPTION);

      // Find the test project row, hover to reveal BAINameActionCell action
      // buttons, then click the setting (edit) button.
      const projectRow = page.getByRole('row').filter({ hasText: name });
      await expect(projectRow).toBeVisible();
      await projectRow.hover();
      await projectRow.getByRole('button', { name: 'setting' }).click();

      // Verify Update Project dialog appears
      const modal = page.locator('.ant-modal');
      await expect(modal).toBeVisible();
      await expect(modal.getByText('Update Project')).toBeVisible();

      // Verify the name field contains the test project name
      await expect(modal.getByRole('textbox', { name: 'Name' })).toHaveValue(
        name,
      );

      // Update the description
      await modal.getByRole('textbox', { name: 'Description' }).clear();
      await modal
        .getByRole('textbox', { name: 'Description' })
        .fill(UPDATED_DESCRIPTION);

      // Click OK to save and verify modal closes
      await modal.getByRole('button', { name: 'OK' }).click();
      await expect(modal).toBeHidden({ timeout: 10000 });

      // Verify updated description is visible in the project row
      await expect(
        projectRow.getByRole('cell', { name: UPDATED_DESCRIPTION }),
      ).toBeVisible({ timeout: 10000 });

      // Self-cleanup.
      await cleanupTestProject(page, name);
    });

    test('Admin can filter projects by name', async ({ page, request }) => {
      const name = projectName('filter');
      await loginAsAdmin(page, request);
      await navigateTo(page, 'project');

      // Provision this test's own project to filter for.
      await createProject(page, name, PROJECT_DESCRIPTION);

      // Type the project name in the filter value search
      await page
        .getByRole('combobox', { name: 'Filter value search' })
        .fill(name);

      // Click the search button
      await page.getByRole('button', { name: 'search' }).click();

      // Verify table shows only the matching project. The Name cell renders
      // BAINameActionCell, so its accessible name also includes hover-only
      // action labels; match the row by hasText instead.
      await expect(page.getByRole('row').filter({ hasText: name })).toBeVisible(
        { timeout: 10000 },
      );

      // Verify only one data row is visible (excluding header rows)
      const dataRows = page.locator('tbody tr:not(.ant-table-measure-row)');
      await expect(dataRows).toHaveCount(1);

      // Clear the filter by clicking the close button on the specific "Name" filter tag
      const nameFilterTag = page
        .locator('.ant-tag')
        .filter({ hasText: `Name: ${name}` });
      await nameFilterTag.locator('[aria-label="Close"]').click();

      // Verify the default project is visible again (filter cleared)
      await expect(
        page.getByRole('cell', { name: 'default', exact: true }).first(),
      ).toBeVisible({ timeout: 10000 });

      // Self-cleanup.
      await cleanupTestProject(page, name);
    });

    test('Admin can delete a project', async ({ page, request }) => {
      const name = projectName('delete');
      await loginAsAdmin(page, request);
      await navigateTo(page, 'project');

      // Provision this test's own project, then delete it (the asserted behavior).
      await createProject(page, name, PROJECT_DESCRIPTION);

      // Find the test project row (Active tab is the default view)
      const projectRow = page.getByRole('row').filter({ hasText: name });
      await expect(projectRow).toBeVisible();

      // The project lifecycle is Active → Deactivated → Purged.
      // Step 1: Deactivate — hover the row to reveal the BAINameActionCell
      // action buttons, then click the deactivate button (index 1 in the
      // Active tab; index 0 is the setting/edit button).
      await projectRow.hover();
      await projectRow
        .locator('.bai-name-action-cell-actions button')
        .nth(1)
        .click();

      // Confirm the antd Popconfirm for deactivation
      const deactivatePopconfirm = page.locator('.ant-popconfirm');
      await expect(deactivatePopconfirm).toBeVisible({ timeout: 5000 });
      await deactivatePopconfirm
        .getByRole('button', { name: 'Deactivate' })
        .click();

      // Verify the project disappears from the Active list
      await expect(projectRow).toBeHidden({ timeout: 10000 });

      // Switch to the Inactive tab to find the deactivated project
      await page
        .locator('label')
        .filter({ hasText: /^Inactive$/ })
        .click();

      // Find the deactivated project row in the Inactive tab
      const inactiveProjectRow = page
        .getByRole('row')
        .filter({ hasText: name });
      await expect(inactiveProjectRow).toBeVisible({ timeout: 10000 });

      // Hover the row and click the Purge button (index 2 in the
      // Inactive tab: setting(0), activate(1), purge(2))
      await inactiveProjectRow.hover();
      await inactiveProjectRow
        .locator('.bai-name-action-cell-actions button')
        .nth(2)
        .click();

      // Verify the Purge Project confirmation dialog appears
      const purgeDialog = page.getByRole('dialog', { name: 'Purge Project' });
      await expect(purgeDialog).toBeVisible({ timeout: 5000 });

      // Type the project name into the confirmation input to enable the Purge button
      await purgeDialog.locator('#confirmText').fill(name);

      // Click the Purge button to permanently delete the project
      await purgeDialog.getByRole('button', { name: 'Purge' }).click();

      // Verify the project is removed from the Inactive table
      await expect(inactiveProjectRow).toBeHidden({ timeout: 10000 });
    });
  },
);
