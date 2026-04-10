// spec: e2e/.agent-output/test-plan-admin-model-card.md
// section: 1. Page Load and Table Display
import { AdminModelCardPage } from '../utils/classes/AdminModelCardPage';
import { loginAsAdmin, webuiEndpoint } from '../utils/test-util';
import { test, expect } from '@playwright/test';

test.describe(
  'Admin Model Card Management - Page Load and Table Display',
  { tag: ['@admin-model-card', '@admin', '@functional'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
    });

    // 1.1 Superadmin can view the Admin Model Card management page
    test('Superadmin can view the Admin Model Card management page', async ({
      page,
    }) => {
      const adminModelCardPage = new AdminModelCardPage(page);

      // Navigate to /admin-serving?tab=model-store
      await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);

      // Verify the "Model Store Management" tab is active
      await expect(
        page.getByText('Model Store Management').first(),
      ).toBeVisible();

      // Verify the "Create Model Card" button is visible
      await expect(adminModelCardPage.getCreateModelCardButton()).toBeVisible();

      // Verify the refresh button is visible
      await expect(adminModelCardPage.getRefreshButton()).toBeVisible();

      // Verify the table is rendered with the correct column headers
      await expect(
        page.getByRole('columnheader', { name: 'Name' }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'Title' }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'Category' }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'Task' }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'Access Level' }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'Domain' }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'Project' }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'Created At' }),
      ).toBeVisible();
    });

    // 1.2 Superadmin can see model card rows with correct data in the table
    test('Superadmin can see model card rows with correct data in the table', async ({
      page,
    }) => {
      const adminModelCardPage = new AdminModelCardPage(page);

      // Navigate and wait for at least one row
      await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);
      await adminModelCardPage.waitForTableLoad();

      // Wait for at least one data row to appear
      const firstRow = adminModelCardPage.getDataRows().first();
      await expect(firstRow).toBeVisible();

      // Verify the name cell has setting and trash bin buttons
      await expect(
        firstRow.getByRole('button', { name: 'setting' }),
      ).toBeVisible();
      await expect(
        firstRow.getByRole('button', { name: 'trash bin' }),
      ).toBeVisible();

      // Verify Access Level cell shows a tag (Public or Internal)
      const accessLevelCell = firstRow.getByRole('cell', {
        name: /Public|Internal/,
      });
      await expect(accessLevelCell).toBeVisible();

      // Verify Created At cell shows a date in YYYY-MM-DD HH:mm format
      const createdAtCell = firstRow.locator('td').last();
      await expect(createdAtCell).toHaveText(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/);
    });

    // 1.3 Superadmin can see pagination controls
    test('Superadmin can see pagination controls and navigate between pages', async ({
      page,
    }) => {
      const adminModelCardPage = new AdminModelCardPage(page);

      // Navigate to the page
      await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);
      await adminModelCardPage.waitForTableLoad();

      // Verify pagination control is visible with total count
      await expect(adminModelCardPage.getPaginationInfo()).toBeVisible();

      // Verify next/previous page buttons
      await expect(page.getByRole('button', { name: 'left' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'right' })).toBeVisible();

      // If there are multiple pages, navigate to page 2
      const nextButton = page.getByRole('button', { name: 'right' });
      const isNextEnabled = await nextButton.isEnabled();
      if (isNextEnabled) {
        await nextButton.click();
        // Verify page indicator updates by checking the URL parameter
        await expect(page).toHaveURL(/current=2/);
      }
    });

    // 1.4 Superadmin can change page size
    test('Superadmin can change page size in the pagination', async ({
      page,
    }) => {
      const adminModelCardPage = new AdminModelCardPage(page);

      // Navigate to the page
      await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);
      await adminModelCardPage.waitForTableLoad();

      // Change page size from 10 to 20
      const pageSizeSelector = page.getByRole('combobox', {
        name: 'Page Size',
      });
      await pageSizeSelector.click();
      await expect(
        page
          .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')
          .first(),
      ).toBeVisible();
      await page
        .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')
        .first()
        .locator('.ant-select-item-option')
        .filter({ hasText: '20 / page' })
        .click();

      // Verify pagination reflects 20 items per page via URL parameter
      await expect(page).toHaveURL(/pageSize=20/);
    });
  },
);
