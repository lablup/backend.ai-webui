import { loginAsAdmin } from './utils/test-util';
import { checkActiveTab, findColumnIndex } from './utils/test-util-antd';
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await loginAsAdmin(page);
  await page.getByRole('menuitem', { name: 'hdd Resources' }).click();
  await expect(
    page.getByTestId('webui-breadcrumb').getByText('Resources'),
  ).toBeVisible();
});

test.describe('Agent list', () => {
  let resourcesPageTab;
  let agentListTable;

  test.beforeEach(async ({ page }) => {
    const firstCard = await page
      .locator('.ant-layout-content .ant-card')
      .first();
    resourcesPageTab = await firstCard.locator('.ant-tabs');
    agentListTable = await firstCard.locator('.ant-table');
  });

  test('should have at least one connected agent', async ({ page }) => {
    const firstCard = await page
      .locator('.ant-layout-content .ant-card')
      .first();
    await checkActiveTab(firstCard.locator('.ant-tabs'), 'Agent');

    await page.getByText('Connected', { exact: true }).click();
    await expect(page.getByRole('main')).toContainText('Connected');

    const rows = await agentListTable.locator('.ant-table-row');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
    const firstRow = rows.first();

    const columnIndex = await findColumnIndex(agentListTable, 'ID / Endpoint');
    const specificColumn = await firstRow
      .locator('.ant-table-cell')
      .nth(columnIndex);
    const columnText = await specificColumn.textContent();
    const firstAgentId = columnText?.split('tcp://')[0];
    expect(firstAgentId).toBeTruthy();
  });
});
