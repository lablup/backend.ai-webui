// spec: e2e/.agent-output/test-plan-admin-model-card.md
// section: 2. Filtering
import { AdminModelCardPage } from '../utils/classes/AdminModelCardPage';
import {
  deleteForeverAndVerifyFromTrash,
  loginAsAdmin,
  moveToTrashAndVerify,
  webuiEndpoint,
} from '../utils/test-util';
import { test, expect } from '@playwright/test';

test.describe(
  'Admin Model Card Management - Filtering',
  { tag: ['@admin-model-card', '@admin', '@functional'] },
  () => {
    // A card is created per-test so the table is guaranteed to have at least one row.
    // Tests 2.1 and 2.2 read the first row name for filtering — without a guaranteed
    // row the tests would fail on an empty table.
    let filterCardName: string;
    let filterFolderName: string;

    test.beforeEach(async ({ page, request }, testInfo) => {
      await loginAsAdmin(page, request);
      const timestamp = Date.now();
      filterCardName = `e2e-test-filter-seed-${testInfo.workerIndex}-${timestamp}`;
      filterFolderName = `e2e-test-filter-folder-${testInfo.workerIndex}-${timestamp}`;

      // Create a seed card so the table has at least one row for filter tests
      await page.goto(
        `${webuiEndpoint}/admin-deployments?tab=model-store-management`,
      );
      const adminModelCardPage = new AdminModelCardPage(page);
      await adminModelCardPage.waitForTableLoad();
      await adminModelCardPage.createModelCard({
        name: filterCardName,
        createNewFolderName: filterFolderName,
      });
    });

    test.afterEach(async ({ page }) => {
      // Cleanup: delete the seed card and purge its folder
      try {
        await page.goto(
          `${webuiEndpoint}/admin-deployments?tab=model-store-management`,
        );
        const adminModelCardPage = new AdminModelCardPage(page);
        await adminModelCardPage.waitForTableLoad();
        await adminModelCardPage.applyNameFilter(filterCardName);
        const row = adminModelCardPage.getRowByName(filterCardName);
        if ((await row.count()) > 0) {
          await adminModelCardPage.deleteModelCardByName(filterCardName);
        }
      } catch {
        // Ignore cleanup errors
      }
      try {
        await moveToTrashAndVerify(page, filterFolderName, 'admin-data');
      } catch {
        // Folder may already be in Trash or may not exist
      }
      try {
        await deleteForeverAndVerifyFromTrash(
          page,
          filterFolderName,
          'admin-data',
        );
      } catch {
        // Folder may not be in Trash (already purged or never created)
      }
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

      // Apply a filter and confirm the table updates to a filtered view
      await adminModelCardPage.applyNameFilter(filterName);
      await expect(paginationInfo).toContainText('items');

      // Clear the filter by clicking the close icon on the active filter chip
      await adminModelCardPage.clearFilter();

      // Verify the URL no longer contains a filter param
      await expect(page).not.toHaveURL(/filter=/);

      // Verify the unfiltered list is restored: total must be >= 1 (at minimum
      // the seed card created in beforeEach still exists). We cannot assert >=
      // filteredTotal because parallel workers may delete cards between the
      // filter step and the clear step, producing a cleared count lower than
      // the filtered count.
      await expect
        .poll(async () =>
          parseTotal((await paginationInfo.textContent()) ?? ''),
        )
        .toBeGreaterThanOrEqual(1);
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
