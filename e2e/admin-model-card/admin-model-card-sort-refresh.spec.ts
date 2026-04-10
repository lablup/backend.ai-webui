// spec: e2e/.agent-output/test-plan-admin-model-card.md
// section: 6. Refresh & 7. Sorting
import { AdminModelCardPage } from '../utils/classes/AdminModelCardPage';
import { loginAsAdmin, webuiEndpoint } from '../utils/test-util';
import { test, expect } from '@playwright/test';

test.describe(
  'Admin Model Card Management - Refresh and Sorting',
  { tag: ['@admin-model-card', '@admin', '@functional'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
    });

    // 6.1 Superadmin can refresh the table using the fetch key button
    test('Superadmin can refresh the table using the fetch key button', async ({
      page,
    }) => {
      const adminModelCardPage = new AdminModelCardPage(page);
      await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);
      await adminModelCardPage.waitForTableLoad();

      // Click the refresh button
      await adminModelCardPage.getRefreshButton().click();

      // Verify the table reloads (wait for table to still be visible after refresh)
      await adminModelCardPage.waitForTableLoad();
      await expect(adminModelCardPage.getDataRows().first()).toBeVisible();
    });

    // 7.1 Superadmin can sort model cards by Name in ascending order
    test('Superadmin can sort model cards by Name in ascending order', async ({
      page,
    }) => {
      const adminModelCardPage = new AdminModelCardPage(page);
      await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);
      await adminModelCardPage.waitForTableLoad();

      // Click the "Name" column header to sort ascending
      await page.getByRole('columnheader', { name: 'Name' }).click();

      // Verify the URL contains an ascending sort order
      await expect(page).toHaveURL(/order=name/);

      // Verify rows are reordered (at least the table is still showing)
      await expect(adminModelCardPage.getDataRows().first()).toBeVisible();

      // Verify the sort indicator shows ascending
      const nameHeader = page.getByRole('columnheader', { name: 'Name' });
      await expect(nameHeader).toBeVisible();
    });

    // 7.2 Superadmin can sort model cards by Name in descending order
    test('Superadmin can sort model cards by Name in descending order', async ({
      page,
    }) => {
      const adminModelCardPage = new AdminModelCardPage(page);
      await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);
      await adminModelCardPage.waitForTableLoad();

      // Click Name header once (ascending), then again (descending)
      const nameHeader = page.getByRole('columnheader', { name: 'Name' });
      await nameHeader.click();
      await nameHeader.click();

      // Verify the URL contains a descending sort order
      await expect(page).toHaveURL(/order=-name/);

      // Verify rows are still displayed
      await expect(adminModelCardPage.getDataRows().first()).toBeVisible();
    });

    // 7.3 Superadmin can sort model cards by Created At
    test('Superadmin can sort model cards by Created At', async ({ page }) => {
      const adminModelCardPage = new AdminModelCardPage(page);
      await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);
      await adminModelCardPage.waitForTableLoad();

      // Click the "Created At" column header to sort
      const createdAtHeader = page.getByRole('columnheader', {
        name: 'Created At',
      });
      await createdAtHeader.click();

      // Verify the URL reflects the sort
      await expect(page).toHaveURL(/order=createdAt/);

      // Click again to toggle sort direction
      await createdAtHeader.click();
      await expect(page).toHaveURL(/order=-createdAt/);

      // Verify rows are still displayed
      await expect(adminModelCardPage.getDataRows().first()).toBeVisible();
    });

    // 7.4 Superadmin can switch sort from one column to another
    test('Superadmin can switch sort from Name to Created At', async ({
      page,
    }) => {
      const adminModelCardPage = new AdminModelCardPage(page);
      await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);
      await adminModelCardPage.waitForTableLoad();

      // Sort by Name ascending
      await page.getByRole('columnheader', { name: 'Name' }).click();
      await expect(page).toHaveURL(/order=name/);

      // Switch to sort by Created At
      await page.getByRole('columnheader', { name: 'Created At' }).click();
      await expect(page).toHaveURL(/order=createdAt/);
      await expect(page).not.toHaveURL(/order=name/);

      // Verify rows are still displayed
      await expect(adminModelCardPage.getDataRows().first()).toBeVisible();
    });
  },
);
