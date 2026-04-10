// spec: e2e/.agent-output/test-plan-admin-model-card.md
// section: 2. Filtering
import { AdminModelCardPage } from '../utils/classes/AdminModelCardPage';
import { loginAsAdmin, webuiEndpoint } from '../utils/test-util';
import { test, expect } from '@playwright/test';

test.describe(
  'Admin Model Card Management - Filtering',
  { tag: ['@admin-model-card', '@admin', '@functional'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
    });

    // 2.1 Superadmin can filter model cards by name
    test('Superadmin can filter model cards by name using BAIGraphQLPropertyFilter', async ({
      page,
    }) => {
      const adminModelCardPage = new AdminModelCardPage(page);
      await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);
      await adminModelCardPage.waitForTableLoad();

      // Note the initial pagination count
      await expect(adminModelCardPage.getPaginationInfo()).toBeVisible();

      // Get the name of the first model card to use as a filter value
      const firstRowName = await adminModelCardPage
        .getDataRows()
        .first()
        .locator('td')
        .nth(1)
        .innerText();
      const filterName = firstRowName.trim().split('\n')[0];

      // Apply a name filter with the known name
      await adminModelCardPage.applyNameFilter(filterName);

      // Wait for the table to reload with filtered results
      await expect(
        page.locator('tbody tr:not(.ant-table-measure-row)').first(),
      ).toBeVisible();

      // Verify the URL contains the filter parameter
      await expect(page).toHaveURL(/filter=/);

      // Verify matching rows are shown
      await expect(adminModelCardPage.getPaginationInfo()).toContainText(
        'items',
      );
    });

    // 2.2 Superadmin can clear a filter to restore the full list
    test('Superadmin can clear a filter to restore the full list', async ({
      page,
    }) => {
      const adminModelCardPage = new AdminModelCardPage(page);
      await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);
      await adminModelCardPage.waitForTableLoad();

      // Get the unfiltered total count text
      const paginationInfo = adminModelCardPage.getPaginationInfo();
      const initialCountText = await paginationInfo.textContent();

      // Get the name of the first model card to use as a filter value
      const firstRowName = await adminModelCardPage
        .getDataRows()
        .first()
        .locator('td')
        .nth(1)
        .innerText();
      const filterName = firstRowName.trim().split('\n')[0];

      // Apply a filter
      await adminModelCardPage.applyNameFilter(filterName);
      await expect(paginationInfo).toContainText('items');

      // Clear the filter by clicking the close icon on the active filter chip
      await adminModelCardPage.clearFilter();

      // Verify the table reloads with the original count
      await expect(paginationInfo).toHaveText(initialCountText!);
    });

    // 2.3 Superadmin sees empty table state when no model cards match the filter
    test('Superadmin sees empty table state when no model cards match the filter', async ({
      page,
    }) => {
      const adminModelCardPage = new AdminModelCardPage(page);
      await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);
      await adminModelCardPage.waitForTableLoad();

      // Apply a filter that matches nothing
      await adminModelCardPage.applyNameFilter('zzz_nonexistent_name_xyz');

      // Verify pagination shows 0 total
      await expect(adminModelCardPage.getPaginationInfo()).toContainText(
        '0 items',
      );

      // Verify no data rows are displayed
      await expect(adminModelCardPage.getDataRows()).toHaveCount(0);
    });
  },
);
