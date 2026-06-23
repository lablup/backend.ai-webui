// spec: e2e/.agent-output/test-plan-project.md
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import test, { expect, Page } from '@playwright/test';

const TEST_RUN_ID = Date.now().toString(36);
const PROJECT_NAME = `e2e-test-project-${TEST_RUN_ID}`;
const PROJECT_DESCRIPTION = 'Test project for E2E';
const UPDATED_DESCRIPTION = 'Updated E2E description';

// Run groups and tests in this file in order on a single worker so the
// independent list test doesn't interleave with the CRUD chain.
test.describe.configure({ mode: 'default' });

// Cleanup function to delete the test project if it exists.
// The project lifecycle is: Active → Deactivated (trash) → Purged (hard delete).
// This helper handles all lifecycle states: if the project is active it
// deactivates it first, then switches to the Inactive tab and purges it.
async function cleanupTestProject(page: Page) {
  // Check Active tab first
  const activeProjectRow = page
    .getByRole('row')
    .filter({ hasText: PROJECT_NAME });
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
    .filter({ hasText: PROJECT_NAME });
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
    await purgeDialog.locator('#confirmText').fill(PROJECT_NAME);
    await purgeDialog.getByRole('button', { name: 'Purge' }).click();
    await expect(inactiveProjectRow).toBeHidden({ timeout: 10000 });
  }

  // Return to Active tab for subsequent tests
  await page
    .locator('label')
    .filter({ hasText: /^Active$/ })
    .click();
}

// Independent of the CRUD chain: only reads the default project list, so a
// chain failure must not skip it (extracted from the serial block in FR-3113).
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

// Keep serial: create → edit → filter → delete operate on the same project
// (PROJECT_NAME).
test.describe.serial(
  'Project CRUD',
  { tag: ['@critical', '@project', '@functional'] },
  () => {
    test('Admin can create a new project', async ({ page, request }) => {
      // 1. Login as admin and navigate to project page
      await loginAsAdmin(page, request);
      await navigateTo(page, 'project');

      // Cleanup any leftover test project (also handles serial-group retries)
      await cleanupTestProject(page);

      // 2. Click the Create Project button
      await page.getByRole('button', { name: 'Create Project' }).click();

      // 3. Verify Create Project dialog appears
      const modal = page.locator('.ant-modal');
      await expect(modal).toBeVisible();
      await expect(modal.getByText('Create Project')).toBeVisible();

      // 4. Fill in the project name
      await modal.getByRole('textbox', { name: 'Name' }).fill(PROJECT_NAME);

      // 5. Fill in description
      await modal
        .getByRole('textbox', { name: 'Description' })
        .fill(PROJECT_DESCRIPTION);

      // 6. Select Domain 'default'
      await modal.getByRole('combobox', { name: 'Domain' }).click();
      await page.locator('.ant-select-dropdown').waitFor({ state: 'visible' });
      await page
        .locator('.ant-select-item-option')
        .filter({ hasText: 'default' })
        .click();

      // 7. Click OK to create
      await modal.getByRole('button', { name: 'OK' }).click();

      // 7. Verify modal closes
      await expect(modal).toBeHidden({ timeout: 10000 });

      // 8. Verify the new project appears in the table.
      // The name column now renders via BAINameActionCell so the cell's
      // accessible name also includes hover-only action labels; match by
      // filter({ hasText }) instead of exact name.
      await expect(
        page.getByRole('row').filter({ hasText: PROJECT_NAME }),
      ).toBeVisible({ timeout: 10000 });
    });

    test('Admin can edit a project', async ({ page, request }) => {
      // 1. Login as admin and navigate to project page
      await loginAsAdmin(page, request);
      await navigateTo(page, 'project');

      // 2. Find the test project row, hover to reveal BAINameActionCell
      // action buttons, then click the setting (edit) button.
      const projectRow = page
        .getByRole('row')
        .filter({ hasText: PROJECT_NAME });
      await expect(projectRow).toBeVisible();
      await projectRow.hover();
      await projectRow.getByRole('button', { name: 'setting' }).click();

      // 3. Verify Update Project dialog appears
      const modal = page.locator('.ant-modal');
      await expect(modal).toBeVisible();
      await expect(modal.getByText('Update Project')).toBeVisible();

      // 4. Verify the name field contains the test project name
      await expect(modal.getByRole('textbox', { name: 'Name' })).toHaveValue(
        PROJECT_NAME,
      );

      // 5. Update the description
      await modal.getByRole('textbox', { name: 'Description' }).clear();
      await modal
        .getByRole('textbox', { name: 'Description' })
        .fill(UPDATED_DESCRIPTION);

      // 6. Click OK to save
      await modal.getByRole('button', { name: 'OK' }).click();

      // 7. Verify modal closes
      await expect(modal).toBeHidden({ timeout: 10000 });

      // 8. Verify updated description is visible in the project row
      await expect(
        projectRow.getByRole('cell', { name: UPDATED_DESCRIPTION }),
      ).toBeVisible({ timeout: 10000 });
    });

    test('Admin can filter projects by name', async ({ page, request }) => {
      // 1. Login as admin and navigate to project page
      await loginAsAdmin(page, request);
      await navigateTo(page, 'project');

      // 2. Type the project name in the filter value search
      await page
        .getByRole('combobox', { name: 'Filter value search' })
        .fill(PROJECT_NAME);

      // 3. Click the search button
      await page.getByRole('button', { name: 'search' }).click();

      // 4. Verify table shows only the matching project. The Name cell
      // renders BAINameActionCell, so its accessible name also includes
      // hover-only action labels; match the row by hasText instead.
      await expect(
        page.getByRole('row').filter({ hasText: PROJECT_NAME }),
      ).toBeVisible({ timeout: 10000 });

      // 5. Verify only one data row is visible (excluding header rows)
      const dataRows = page.locator('tbody tr:not(.ant-table-measure-row)');
      await expect(dataRows).toHaveCount(1);

      // 6. Clear the filter by clicking the close button on the specific "Name" filter tag
      const nameFilterTag = page
        .locator('.ant-tag')
        .filter({ hasText: `Name: ${PROJECT_NAME}` });
      await nameFilterTag.locator('[aria-label="Close"]').click();

      // 7. Verify the default project is visible again (filter cleared)
      await expect(
        page.getByRole('cell', { name: 'default', exact: true }).first(),
      ).toBeVisible({ timeout: 10000 });
    });

    test('Admin can delete a project', async ({ page, request }) => {
      // 1. Login as admin and navigate to project page
      await loginAsAdmin(page, request);
      await navigateTo(page, 'project');

      // 2. Find the test project row (Active tab is the default view)
      const projectRow = page
        .getByRole('row')
        .filter({ hasText: PROJECT_NAME });
      await expect(projectRow).toBeVisible();

      // 3. The project lifecycle is Active → Deactivated → Purged.
      //    Step 1: Deactivate — hover the row to reveal the BAINameActionCell
      //    action buttons, then click the deactivate button (index 1 in the
      //    Active tab; index 0 is the setting/edit button).
      await projectRow.hover();
      await projectRow
        .locator('.bai-name-action-cell-actions button')
        .nth(1)
        .click();

      // 4. Confirm the antd Popconfirm for deactivation
      const deactivatePopconfirm = page.locator('.ant-popconfirm');
      await expect(deactivatePopconfirm).toBeVisible({ timeout: 5000 });
      await deactivatePopconfirm
        .getByRole('button', { name: 'Deactivate' })
        .click();

      // 5. Verify the project disappears from the Active list
      await expect(projectRow).toBeHidden({ timeout: 10000 });

      // 6. Switch to the Inactive tab to find the deactivated project
      await page
        .locator('label')
        .filter({ hasText: /^Inactive$/ })
        .click();

      // 7. Find the deactivated project row in the Inactive tab
      const inactiveProjectRow = page
        .getByRole('row')
        .filter({ hasText: PROJECT_NAME });
      await expect(inactiveProjectRow).toBeVisible({ timeout: 10000 });

      // 8. Hover the row and click the Purge button (index 2 in the
      //    Inactive tab: setting(0), activate(1), purge(2))
      await inactiveProjectRow.hover();
      await inactiveProjectRow
        .locator('.bai-name-action-cell-actions button')
        .nth(2)
        .click();

      // 9. Verify the Purge Project confirmation dialog appears
      const purgeDialog = page.getByRole('dialog', { name: 'Purge Project' });
      await expect(purgeDialog).toBeVisible({ timeout: 5000 });

      // 10. Type the project name into the confirmation input to enable the Purge button
      await purgeDialog.locator('#confirmText').fill(PROJECT_NAME);

      // 11. Click the Purge button to permanently delete the project
      await purgeDialog.getByRole('button', { name: 'Purge' }).click();

      // 12. Verify the project is removed from the Inactive table
      await expect(inactiveProjectRow).toBeHidden({ timeout: 10000 });
    });
  },
);
