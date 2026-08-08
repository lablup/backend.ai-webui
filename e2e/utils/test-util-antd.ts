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

// `BAINotificationStackAstryx` (to-astryx ticket 29 rewire) renders each
// notice as `[data-notification-key]` inside the single stack root
// `[data-testid="bai-notification-stack"]`; its title/description are plain
// `<div>`s with no class of their own, so they carry explicit
// `data-testid="notification-title"` / `"notification-description"` anchors
// (`react/src/components/astryx-bui/BAINotificationStackAstryx.tsx`).
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
 * Dual-mode: some callers target pages that adopted `BAIFormItem`
 * (`data-bai-form-item`, e.g. `FolderCreateModalV2`'s "Location" field) and
 * some still target raw antd `Form.Item` (`.ant-form-item-row`, e.g.
 * `AutoScalingRuleEditorModal`'s "Metric Source" — not yet migrated as of
 * to-astryx ticket 31). The combined selector matches whichever DOM shape
 * the target page renders; see `BAIFormItem.tsx` for the new attribute set.
 */
export const getFormItemControlByLabel = (page: Page, label: string) => {
  return page
    .locator('.ant-form-item-row, [data-bai-form-item]')
    .filter({
      has: page.locator(
        '.ant-form-item-label label, [data-bai-form-item-label]',
        { hasText: label },
      ),
    })
    .locator(
      '.ant-form-item-control-input, [data-bai-form-item-control-input]',
    );
};
