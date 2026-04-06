import type { Page, Locator } from '@playwright/test';

/**
 * Map of action titles to their Ant Design / Lucide icon selectors.
 * BAINameActionCell renders icon-only buttons, so we locate by icon class.
 */
const ACTION_ICON_SELECTORS: Record<string, string> = {
  Edit: '[aria-label="setting"]',
  'User Detail': '[aria-label="info-circle"]',
  Deactivate: '.lucide-ban',
  Activate: '.lucide-undo-2',
};

/**
 * Clicks a BAINameActionCell action by its title.
 * Handles both directly visible icon buttons and overflow dropdown menu items.
 */
export async function clickRowAction(
  page: Page,
  row: Locator,
  actionTitle: string,
) {
  await row.hover();

  // Case 1: Actions overflowed into "More actions" dropdown
  const moreButton = row.getByRole('button', { name: 'More actions' });
  if (await moreButton.isVisible().catch(() => false)) {
    await moreButton.click();
    const menuItem = page.getByRole('menuitem', { name: actionTitle });
    if (await menuItem.isVisible({ timeout: 2000 }).catch(() => false)) {
      await menuItem.click();
      return;
    }
    await page.keyboard.press('Escape');
  }

  // Case 2: Actions are directly visible — find by icon selector
  const iconSelector = ACTION_ICON_SELECTORS[actionTitle];
  if (iconSelector) {
    const icon = row.locator(iconSelector);
    await icon.waitFor({ state: 'visible', timeout: 5000 });
    await icon.click();
    return;
  }

  throw new Error(`Action "${actionTitle}" not found in row`);
}

/**
 * Opens the User Profile Setting Modal by clicking the user dropdown
 * and selecting the "My Account" menu item.
 */
export async function openProfileModal(page: Page) {
  await page.getByTestId('user-dropdown-button').click();
  await page.getByText('My Account').click();
  await page.locator('.ant-modal').waitFor({ state: 'visible' });
}

/**
 * Reads the current client IP displayed in the modal's helper text.
 */
export async function getCurrentClientIp(page: Page): Promise<string> {
  const ipText = await page.getByText(/Current client IP:/).textContent();
  const match = ipText?.match(/Current client IP:\s*(.+)/);
  return match?.[1]?.trim() ?? '';
}

/**
 * Gets the Allowed Client IP form item container within a modal or page.
 */
export function getAllowedClientIpFormItem(container: Locator) {
  return container
    .locator('.ant-form-item')
    .filter({ hasText: 'Allowed client IP' });
}

/**
 * Adds IP tags to the Allowed Client IP select field within a container.
 */
export async function addIpTags(container: Locator, ips: string[]) {
  const formItem = getAllowedClientIpFormItem(container);
  const selectInput = formItem.getByRole('combobox');
  for (const ip of ips) {
    await selectInput.click();
    await selectInput.fill(ip);
    await selectInput.press('Enter');
  }
  await selectInput.press('Tab');
}

/**
 * Removes all IP tags from the Allowed Client IP select field within a container.
 */
export async function removeAllIpTags(container: Locator) {
  const formItem = getAllowedClientIpFormItem(container);
  const removeButtons = formItem.locator('.ant-tag .anticon-close');
  const count = await removeButtons.count();
  for (let i = count - 1; i >= 0; i--) {
    await removeButtons.nth(i).click();
  }
}

/**
 * Derives a guaranteed-different IP from the given IP by changing the last octet.
 * Falls back to '99.99.99.99' if no valid IP is provided.
 */
export function deriveDifferentIp(currentIp: string): string {
  if (!currentIp || !currentIp.trim()) return '99.99.99.99';
  const parts = currentIp.trim().split('.');
  if (parts.length !== 4) return '99.99.99.99';
  const lastOctet = parseInt(parts[3], 10);
  parts[3] = String(lastOctet === 255 ? lastOctet - 1 : lastOctet + 1);
  return parts.join('.');
}
