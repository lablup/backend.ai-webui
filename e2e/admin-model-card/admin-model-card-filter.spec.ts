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
      await page.goto(
        `${webuiEndpoint}/admin-deployments?tab=model-store-management`,
      );
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
      await page.goto(
        `${webuiEndpoint}/admin-deployments?tab=model-store-management`,
      );
      await adminModelCardPage.waitForTableLoad();

      // Capture the unfiltered total count. Avoid asserting an exact count after
      // clearing — parallel workers create/delete cards mid-test, which makes a
      // strict equality assertion flaky. Verify total is non-zero instead.
      const paginationInfo = adminModelCardPage.getPaginationInfo();
      const parseTotal = (text: string): number => {
        const match = text.match(/of (\d+) items/);
        return match ? Number(match[1]) : 0;
      };
      const initialCountText = (await paginationInfo.textContent()) ?? '';
      const initialTotal = parseTotal(initialCountText);
      expect(initialTotal).toBeGreaterThan(0);

      // Get the name of the first model card to use as a filter value
      const firstRowName = await adminModelCardPage
        .getDataRows()
        .first()
        .locator('td')
        .nth(1)
        .innerText();
      const filterName = firstRowName.trim().split('\n')[0];

      // Apply a filter and capture the filtered total
      await adminModelCardPage.applyNameFilter(filterName);
      await expect(paginationInfo).toContainText('items');
      const filteredTotal = parseTotal(
        (await paginationInfo.textContent()) ?? '',
      );

      // Clear the filter by clicking the close icon on the active filter chip
      await adminModelCardPage.clearFilter();

      // Verify the URL no longer contains a filter param
      await expect(page).not.toHaveURL(/filter=/);

      // Verify the unfiltered list is restored: total must be >= the filtered
      // total (other workers may have added/removed cards in parallel, so the
      // count is not guaranteed to match initialTotal exactly).
      await expect
        .poll(async () =>
          parseTotal((await paginationInfo.textContent()) ?? ''),
        )
        .toBeGreaterThanOrEqual(filteredTotal);
    });

    // 2.3 Superadmin sees empty table state when no model cards match the filter
    test('Superadmin sees empty table state when no model cards match the filter', async ({
      page,
    }) => {
      const adminModelCardPage = new AdminModelCardPage(page);
      await page.goto(
        `${webuiEndpoint}/admin-deployments?tab=model-store-management`,
      );
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
