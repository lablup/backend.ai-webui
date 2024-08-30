import { Locator, expect } from '@playwright/test';

export async function checkActiveTab(
  tabsLocator: Locator,
  expectedTabName: string,
) {
  const activeTab = await tabsLocator.locator('.ant-tabs-tab-active');
  await expect(activeTab).toContainText(expectedTabName);
}

export async function getTableHeaders(page: Locator) {
  return await page.locator('.ant-table-thead th');
}

export async function findColumnIndex(
  tableLocator: Locator,
  columnTitle: string,
) {
  const headers = await tableLocator.locator('.ant-table-thead th');
  const columnIndex = await headers.evaluateAll((ths, title) => {
    return ths.findIndex((th) => th.textContent?.trim() === title);
  }, columnTitle);

  return columnIndex;
}
