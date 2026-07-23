import {
  KeyPairModal,
  UserSettingModal,
} from './classes/user/UserSettingModal';
import { navigateTo } from './test-util';
import { expect, type Page, type Locator } from '@playwright/test';

/**
 * Clicks a BAINameActionCell action by its title.
 * Handles both directly visible icon buttons and overflow dropdown menu items.
 *
 * BAINameActionCell exposes each action's `title` (not the icon name) as the
 * visible button's accessible name (`aria-label={action.title}`), e.g. the
 * "Edit" action's title is t('button.Edit') = "Edit", "User Detail" is
 * t('credential.UserDetail') = "User Detail", etc. The caller's
 * `actionTitle` argument already matches these titles exactly, so a direct
 * role-based lookup replaces the older icon-class-based lookup (which broke
 * once BAINameActionCell started deriving the aria-label from the action
 * title instead of the icon).
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

  // Case 2: Actions are directly visible — find by accessible name
  const button = row.getByRole('button', { name: actionTitle, exact: true });
  if (await button.isVisible({ timeout: 5000 }).catch(() => false)) {
    await button.click();
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
 * Uses keyboard Backspace on the combobox input to remove tags one by one,
 * which is robust against Ant Design version changes in tag close button selectors.
 */
export async function removeAllIpTags(container: Locator) {
  const formItem = getAllowedClientIpFormItem(container);
  const selectInput = formItem.getByRole('combobox');
  await selectInput.click();
  // Backspace removes the last selected tag in an antd Select. Keep pressing
  // until none remain, with a safety cap so a stuck DOM can't cause an infinite
  // loop. The cap is generous enough for any realistic Allowed Client IP list.
  //
  // The Allowed Client IP field uses a custom `tagRender` (see
  // UserProfileSettingModal.tsx / UserSettingModal.tsx) that renders each
  // selected value as a plain antd `<Tag>` (`.ant-tag`) instead of the
  // default `.ant-select-selection-item` markup. Using the default selector
  // here made `tags.count()` always resolve to 0, so the loop exited before
  // ever pressing Backspace — a silent no-op that left the form untouched,
  // caused the "no changes" message instead of a real update, and left the
  // modal open (blocking any subsequent reopen click).
  const tags = formItem.locator('.ant-tag');
  for (let safety = 0; safety < 100; safety++) {
    const remaining = await tags.count();
    if (remaining === 0) break;
    await selectInput.press('Backspace');
    await tags
      .nth(remaining - 1)
      .waitFor({ state: 'detached', timeout: 1000 })
      .catch(() => {});
  }
  // Press Tab to blur the combobox without closing the modal (Escape would close it)
  await selectInput.press('Tab');
}

/**
 * Creates a fresh, disposable user through the admin credential UI.
 *
 * Used so profile-editing / allowed-client-IP tests never mutate a shared
 * account (e.g. `admin@lablup.com`). The caller must be logged in as an admin
 * on `adminPage` before invoking this. See FR-3138.
 */
export async function createDisposableUser(
  adminPage: Page,
  email: string,
  username: string,
  password: string,
): Promise<void> {
  await navigateTo(adminPage, 'credential');
  await expect(adminPage.getByRole('tab', { name: 'Users' })).toBeVisible();

  await adminPage.getByRole('button', { name: 'Create User' }).click();
  const userSettingModal = UserSettingModal.forCreate(adminPage);
  await userSettingModal.createUser(email, username, password);

  // A key pair is generated on creation — acknowledge and close the modal.
  const keyPairModal = new KeyPairModal(adminPage);
  await keyPairModal.waitForVisible();
  await keyPairModal.close();
  await userSettingModal.waitForHidden();

  await expect(adminPage.getByRole('cell', { name: email })).toBeVisible({
    timeout: 10000,
  });
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
