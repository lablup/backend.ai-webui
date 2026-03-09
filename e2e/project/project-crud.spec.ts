// spec: e2e/.agent-output/test-plan-project.md
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import test, { expect } from '@playwright/test';

const TEST_RUN_ID = Date.now().toString(36);
const PROJECT_NAME = `e2e-test-project-${TEST_RUN_ID}`;
const PROJECT_DESCRIPTION = 'Test project for E2E';
const UPDATED_DESCRIPTION = 'Updated E2E description';

test.describe.serial(
  'Project CRUD',
  { tag: ['@critical', '@project', '@functional'] },
  () => {
    // Cleanup function to delete the test project if it exists
    async function cleanupTestProject(page: any) {
      const projectRow = page
        .getByRole('row')
        .filter({ hasText: PROJECT_NAME });
      const isVisible = await projectRow
        .isVisible({ timeout: 2000 })
        .catch(() => false);

      if (isVisible) {
        await projectRow.getByRole('button', { name: 'delete' }).click();
        const purgeDialog = page.getByRole('dialog', { name: 'Purge Project' });
        await purgeDialog.getByRole('button', { name: 'Purge' }).click();
        await expect(projectRow).toBeHidden({ timeout: 10000 });
      }
    }

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
        page.getByRole('columnheader', { name: 'Controls' }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'Domain' }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'Active' }),
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

      // 5. Verify default row has Active = true and Type = GENERAL
      await expect(
        defaultRow.getByRole('cell', { name: 'true' }),
      ).toBeVisible();
      await expect(
        defaultRow.getByRole('cell', { name: 'GENERAL' }),
      ).toBeVisible();

      // 6. Cleanup any leftover test project from previous runs
      await cleanupTestProject(page);
    });

    test('Admin can create a new project', async ({ page, request }) => {
      // 1. Login as admin and navigate to project page
      await loginAsAdmin(page, request);
      await navigateTo(page, 'project');

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

      // 8. Verify the new project appears in the table
      await expect(
        page.getByRole('cell', { name: PROJECT_NAME, exact: true }),
      ).toBeVisible({ timeout: 10000 });
    });

    test('Admin can edit a project', async ({ page, request }) => {
      // 1. Login as admin and navigate to project page
      await loginAsAdmin(page, request);
      await navigateTo(page, 'project');

      // 2. Find the test project row and click the setting button
      const projectRow = page
        .getByRole('row')
        .filter({ hasText: PROJECT_NAME });
      await expect(projectRow).toBeVisible();
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

      // 4. Verify table shows only the matching project
      await expect(
        page.getByRole('cell', { name: PROJECT_NAME, exact: true }),
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

      // 2. Find the test project row
      const projectRow = page
        .getByRole('row')
        .filter({ hasText: PROJECT_NAME });
      await expect(projectRow).toBeVisible();

      // 3. Click the delete button
      await projectRow.getByRole('button', { name: 'delete' }).click();

      // 4. Verify Purge Project confirmation dialog appears
      const purgeDialog = page.getByRole('dialog', { name: 'Purge Project' });
      await expect(purgeDialog).toBeVisible();
      await expect(
        purgeDialog.getByText('Are you sure to purge'),
      ).toBeVisible();

      // 5. Confirm deletion by clicking Purge
      await purgeDialog.getByRole('button', { name: 'Purge' }).click();

      // 6. Verify the test project is removed from the table
      await expect(
        page.getByRole('row').filter({ hasText: PROJECT_NAME }),
      ).toBeHidden({ timeout: 10000 });
    });
  },
);
