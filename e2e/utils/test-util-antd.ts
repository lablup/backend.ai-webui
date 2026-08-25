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

// `BAINotificationStack` (to-astryx ticket 29 rewire) renders each
// notice as `[data-notification-key]` inside the single stack root
// `[data-testid="bai-notification-stack"]`; its title/description are plain
// `<div>`s with no class of their own, so they carry explicit
// `data-testid="notification-title"` / `"notification-description"` anchors
// (`packages/backend.ai-ui/src/components/BAINotificationStack.tsx`).
function getFirstNotification(page: Page) {
  return page
    .locator('[data-testid="bai-notification-stack"] [data-notification-key]')
    .first();
}

export function getNotificationMessageBox(page: Page) {
  return getFirstNotification(page).getByTestId('notification-title');
}

export function getNotificationDescriptionBox(page: Page) {
  return getFirstNotification(page).getByTestId('notification-description');
}

export const getMenuItem = (page: Page, menuName: string) => {
  return page.getByRole('link', { name: menuName, exact: true }).first();
};

export const getCardItemByCardTitle = (page: Page, title: string) => {
  return page.locator(`.ant-card:has-text("${title}")`);
};

/**
 * Ticket 31 made this dual-mode because some pages still rendered a raw antd
 * `Form.Item` (`.ant-form-item-row`) while others had adopted `BAIFormItem`.
 * Ticket 34 ended that split: `Form.Item` IS `BAIFormItem` now, the form
 * engine is self-hosted, and no screen renders antd's form DOM — so the antd
 * half of each selector could never match again and is gone.
 *
 * Attribute set: `packages/backend.ai-ui/src/form-engine/FormItemVisual.tsx`.
 */
export const getFormItemControlByLabel = (page: Page, label: string) => {
  return page
    .locator('[data-bai-form-item]')
    .filter({
      has: page.locator('[data-bai-form-item-label]', { hasText: label }),
    })
    .locator('[data-bai-form-item-control-input]');
};
