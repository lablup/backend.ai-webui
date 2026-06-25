// spec: e2e/.agent-output/test-plan-admin-model-card.md
// section: 10. URL State Persistence
import { AdminModelCardPage } from '../utils/classes/AdminModelCardPage';
import {
  deleteForeverAndVerifyFromTrash,
  loginAsAdmin,
  moveToTrashAndVerify,
  webuiEndpoint,
} from '../utils/test-util';
import { test, expect } from '@playwright/test';

test.describe(
  'Admin Model Card Management - URL State Persistence',
  { tag: ['@admin-model-card', '@admin', '@functional'] },
  () => {
    let testCardName: string;
    let testFolderName: string;

    test.beforeEach(async ({ page, request }, testInfo) => {
      const timestamp = Date.now();
      testCardName = `e2e-test-url-${testInfo.workerIndex}-${timestamp}`;
      testFolderName = `e2e-test-url-folder-${testInfo.workerIndex}-${timestamp}`;
      await loginAsAdmin(page, request);

      // Create a test model card so the table is guaranteed to have data
      await page.goto(
        `${webuiEndpoint}/admin-deployments?tab=model-store-management`,
      );
      const adminModelCardPage = new AdminModelCardPage(page);
      await adminModelCardPage.waitForTableLoad();
      await adminModelCardPage.createModelCard({
        name: testCardName,
        createNewFolderName: testFolderName,
      });
    });

    test.afterEach(async ({ page }) => {
      try {
        await page.goto(
          `${webuiEndpoint}/admin-deployments?tab=model-store-management`,
        );
        const adminModelCardPage = new AdminModelCardPage(page);
        await adminModelCardPage.waitForTableLoad();
        await adminModelCardPage.applyNameFilter(testCardName);
        const row = adminModelCardPage.getRowByName(testCardName);
        if ((await row.count()) > 0) {
          await adminModelCardPage.deleteModelCardByName(testCardName);
        }
      } catch {
        // Ignore cleanup errors
      }
      try {
        await moveToTrashAndVerify(page, testFolderName, 'admin-data');
      } catch {
        // Folder may already be in Trash or may not exist
      }
      try {
        await deleteForeverAndVerifyFromTrash(
          page,
          testFolderName,
          'admin-data',
        );
      } catch {
        // Folder may not be in Trash (already purged or never created)
      }
    });

    // 10.1 Filter state is persisted in the URL query parameters
    test('Superadmin can persist filter state in the URL query parameters', async ({
      page,
    }) => {
      const adminModelCardPage = new AdminModelCardPage(page);
      await page.goto(
        `${webuiEndpoint}/admin-deployments?tab=model-store-management`,
      );
      await adminModelCardPage.waitForTableLoad();

      // Apply a name filter using the card created in beforeEach (guaranteed to exist)
      await adminModelCardPage.applyNameFilter(testCardName);

      // Verify the URL updates to include the filter parameter
      await expect(page).toHaveURL(/filter=/);
      const currentURL = page.url();

      // Navigate to the same URL and verify filter is re-applied
      await page.goto(currentURL);
      await adminModelCardPage.waitForTableLoad();

      // Verify the filter chip is visible (filter persisted from URL)
      const filterChipPattern = new RegExp(
        `Name.*${testCardName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
      );
      await expect(
        page
          .getByRole('status')
          .filter({ hasText: filterChipPattern })
          .or(page.locator('.ant-tag').filter({ hasText: filterChipPattern }))
          .first(),
      ).toBeVisible();

      // Verify the filtered results are shown
      await expect(adminModelCardPage.getPaginationInfo()).toContainText(
        'items',
      );
    });

    // 10.2 Sort order is persisted in the URL query parameters
    test('Superadmin can persist sort order in the URL query parameters', async ({
      page,
    }) => {
      const adminModelCardPage = new AdminModelCardPage(page);
      await page.goto(
        `${webuiEndpoint}/admin-deployments?tab=model-store-management`,
      );
      await adminModelCardPage.waitForTableLoad();

      // Click the "Name" column to sort ascending
      await page.getByRole('columnheader', { name: 'Name' }).click();
      await expect(page).toHaveURL(/order=name/);

      const sortedURL = page.url();

      // Reload the page
      await page.goto(sortedURL);
      await adminModelCardPage.waitForTableLoad();

      // Verify the URL still has the sort parameter
      await expect(page).toHaveURL(/order=name/);

      // Verify rows are still displayed (sort preserved)
      await expect(adminModelCardPage.getDataRows().first()).toBeVisible({
        timeout: 15000,
      });
    });

    // 10.3 Pagination state is persisted in the URL query parameters
    test(
      'Superadmin can persist pagination state in the URL query parameters',
      { tag: ['@requires-seeded-data'] },
      async ({ page }) => {
        const adminModelCardPage = new AdminModelCardPage(page);
        await page.goto(
          `${webuiEndpoint}/admin-deployments?tab=model-store-management`,
        );
        await adminModelCardPage.waitForTableLoad();

        // Environment data gate (FR-3114): this scenario needs more than one
        // page of model store cards on the target cluster. Seeding more model
        // cards is an infra task — until then the test skips with an auditable
        // reason.
        const nextButton = page.getByRole('button', { name: 'right' });
        const isNextEnabled = await nextButton.isEnabled();
        test.skip(
          !isNextEnabled,
          'Pagination scenario requires more than one page of model store cards on the target cluster (@requires-seeded-data)',
        );

        // Navigate to page 2
        await nextButton.click();
        // Use the URL as the source of truth for the active page
        await expect(page).toHaveURL(/current=2/);

        // Verify page 2 pagination item is active
        await expect(
          page.getByRole('listitem', { name: '2' }).first(),
        ).toBeVisible();

        const page2URL = page.url();

        // Reload the page and verify it stays on page 2
        await page.goto(page2URL);
        await adminModelCardPage.waitForTableLoad();

        // Verify page 2 is still active after reload
        await expect(page).toHaveURL(/current=2/);
      },
    );
  },
);
