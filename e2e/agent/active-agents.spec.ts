import { loginAsAdmin, navigateTo } from '../utils/test-util';
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page, request }) => {
  await loginAsAdmin(page, request);
  await navigateTo(page, 'dashboard');
  await expect(
    page.getByTestId('webui-breadcrumb').getByText('Dashboard'),
  ).toBeVisible();

  // Scroll to the Active Agents widget to ensure it's visible on screen
  const activeAgentsHeading = page.getByRole('heading', {
    name: 'Active Agents',
  });
  await activeAgentsHeading.scrollIntoViewIfNeeded();
});

// Helper to locate the Active Agents board item container
function getActiveAgentsBoard(page: import('@playwright/test').Page) {
  // Scope to the board item content area that contains the "Active Agents" heading.
  // awsui_content-inner is part of the Cloudscape Board component's CSS module naming
  // and provides the tightest container that avoids matching ancestor layout wrappers.
  return page
    .locator('[class*="awsui_content-inner"]')
    .filter({
      has: page.getByRole('heading', { name: 'Active Agents' }),
    })
    .filter({ has: page.locator('.ant-table') });
}

test.describe(
  'Active Agents dashboard widget',
  { tag: ['@regression', '@agent', '@functional'] },
  () => {
    test('Admin can see Active Agents widget on the dashboard', async ({
      page,
    }) => {
      const board = getActiveAgentsBoard(page);
      await expect(board).toBeVisible({ timeout: 10_000 });
      await expect(
        board.getByRole('heading', { name: 'Active Agents' }),
      ).toBeVisible();
    });

    test('Active Agents widget should display agent table with at least one agent', async ({
      page,
    }) => {
      const board = getActiveAgentsBoard(page);
      await expect(board).toBeVisible({ timeout: 10_000 });

      const rows = board.locator('.ant-table-row');
      await expect(rows.first()).toBeVisible({ timeout: 10_000 });
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThan(0);
    });

    test('Admin can click agent name to open detail drawer', async ({
      page,
    }) => {
      const board = getActiveAgentsBoard(page);
      await expect(board).toBeVisible({ timeout: 10_000 });

      // Wait for table rows to load
      const firstRow = board.locator('.ant-table-row').first();
      await expect(firstRow).toBeVisible({ timeout: 10_000 });

      // Click on the first agent name link in the first cell
      const firstAgentLink = firstRow
        .locator('td')
        .first()
        .locator('a')
        .first();
      await firstAgentLink.click();

      // Verify the Agent Detail drawer opens
      const drawer = page.getByRole('dialog');
      await expect(drawer).toBeVisible({ timeout: 5_000 });
      await expect(drawer.getByText('Agent Info')).toBeVisible();

      // Close the drawer
      await drawer.getByRole('button', { name: 'Close' }).click();
      await expect(drawer).toBeHidden();
    });

    test('Admin can manually refresh Active Agents widget', async ({
      page,
    }) => {
      const board = getActiveAgentsBoard(page);
      await expect(board).toBeVisible({ timeout: 10_000 });

      // Find the refresh button scoped to the Active Agents board item
      const refreshButton = board.getByRole('button', { name: 'reload' });
      await expect(refreshButton).toBeVisible();
      await refreshButton.click();

      // Verify the table still shows data after refresh
      const rows = board.locator('.ant-table-row');
      await expect(rows.first()).toBeVisible({ timeout: 10_000 });
    });

    test('Active Agents widget should show max 3 agents per page', async ({
      page,
    }) => {
      const board = getActiveAgentsBoard(page);
      await expect(board).toBeVisible({ timeout: 10_000 });

      // Verify pagination limit: at most 3 rows visible
      const rows = board.locator('.ant-table-row');
      await expect(rows.first()).toBeVisible({ timeout: 10_000 });
      const rowCount = await rows.count();
      expect(rowCount).toBeLessThanOrEqual(3);
    });

    test('Admin can sort agents by clicking column headers', async ({
      page,
    }) => {
      const board = getActiveAgentsBoard(page);
      await expect(board).toBeVisible({ timeout: 10_000 });

      // Wait for table rows to load
      const rows = board.locator('.ant-table-row');
      await expect(rows.first()).toBeVisible({ timeout: 10_000 });

      // Click the "Starts" (first_contact) column header to toggle sort order
      // Scope to .ant-table-thead to avoid matching the duplicate virtual sorter row
      const startsHeader = board
        .locator('.ant-table-thead .ant-table-column-sorters')
        .filter({ hasText: /Starts/i });
      await startsHeader.click();

      // Verify sort indicator appears on the header column (ascending)
      await expect(
        board.locator('.ant-table-thead .ant-table-column-sort'),
      ).toBeVisible({
        timeout: 5_000,
      });

      // Click again for descending order
      // Re-locate the header since the DOM may have updated after sorting
      await board
        .locator('.ant-table-thead .ant-table-column-sorters')
        .filter({ hasText: /Starts/i })
        .click();

      // Verify sort indicator still visible on the header column
      await expect(
        board.locator('.ant-table-thead .ant-table-column-sort'),
      ).toBeVisible({
        timeout: 5_000,
      });

      // Verify table still shows data after sorting
      await expect(rows.first()).toBeVisible({ timeout: 10_000 });
    });
  },
);
