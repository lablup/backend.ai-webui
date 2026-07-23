import { Locator, Page, expect } from '@playwright/test';

export async function checkActiveTab(
  tabsLocator: Locator,
  expectedTabName: string,
) {
  const activeTab = await tabsLocator.locator('.ant-tabs-tab-active');
  await expect(activeTab).toContainText(expectedTabName);
}

export async function getTableHeaders(locator: Locator) {
  return await locator.locator('.ant-table-thead th');
}

export async function findColumnIndex(
  tableLocator: Locator,
  columnTitle: string,
) {
  const headers = await getTableHeaders(tableLocator);
  const columnIndex = await headers.evaluateAll((ths, title) => {
    return ths.findIndex((th) => th.textContent?.trim() === title);
  }, columnTitle);

  return columnIndex;
}

export function getNotificationTextContainer(page: Page) {
  return page.locator('.ant-notification-notice-description');
}

export function getNotificationMessageBox(page: Page) {
  return getNotificationTextContainer(page).locator('li > div > div >> nth=0');
}

export function getNotificationDescriptionBox(page: Page) {
  return getNotificationTextContainer(page).locator('li > div > div >> nth=1');
}

export const getMenuItem = (page: Page, menuName: string) => {
  return page.getByRole('link', { name: menuName, exact: true }).first();
};

export const getCardItemByCardTitle = (page: Page, title: string) => {
  return page.locator(`.ant-card:has-text("${title}")`);
};

export const getFormItemControlByLabel = (page: Page, label: string) => {
  return page
    .locator('.ant-form-item-row')
    .filter({
      has: page.locator('.ant-form-item-label label', { hasText: label }),
    })
    .locator('.ant-form-item-control-input');
};
