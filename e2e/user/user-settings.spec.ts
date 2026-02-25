// spec: User Settings page E2E tests
// Tests the /usersettings page: General tab preferences including
// desktop notifications, compact sidebar, language selection, auto-logout,
// and tab navigation.
import { loginAsUser, navigateTo } from '../utils/test-util';
import { checkActiveTab } from '../utils/test-util-antd';
import test, { expect } from '@playwright/test';

test.describe.serial(
  'User Settings - General Preferences',
  { tag: ['@critical', '@user', '@functional'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      // 1. Login as user
      await loginAsUser(page, request);

      // 2. Navigate to user settings page
      await navigateTo(page, 'usersettings');

      // 3. Wait for page to load
      await expect(page.getByRole('tab', { name: 'General' })).toBeVisible();
    });

    test('User can see the General tab active by default', async ({ page }) => {
      // 1. Verify General tab is active (use .first() since SettingList has its own tabs)
      await checkActiveTab(page.locator('.ant-tabs').first(), 'General');

      // 2. Verify Preferences group is visible
      await expect(page.getByTestId('group-preferences')).toBeVisible();
    });

    test('User can toggle Desktop Notification checkbox', async ({ page }) => {
      // 1. Find the Desktop Notification setting item
      const settingItem = page.getByTestId('items-desktop-notification');
      await expect(settingItem).toBeVisible();

      // 2. Find the checkbox within the setting item
      const checkbox = settingItem.locator('input[type="checkbox"]');

      // 3. Get initial state
      const initialChecked = await checkbox.isChecked();

      // 4. Toggle the checkbox
      await checkbox.click({ force: true });

      // 5. Verify state changed
      await expect(checkbox).toBeChecked({ checked: !initialChecked });

      // 6. Toggle back to restore original state
      await checkbox.click({ force: true });
      await expect(checkbox).toBeChecked({ checked: initialChecked });
    });

    test('User can toggle Use Compact Sidebar checkbox', async ({ page }) => {
      // 1. Find the Compact Sidebar setting item
      const settingItem = page.getByTestId('items-use-compact-sidebar');
      await expect(settingItem).toBeVisible();

      // 2. Find the checkbox
      const checkbox = settingItem.locator('input[type="checkbox"]');

      // 3. Get initial state
      const initialChecked = await checkbox.isChecked();

      // 4. Toggle
      await checkbox.click({ force: true });
      await expect(checkbox).toBeChecked({ checked: !initialChecked });

      // 5. Toggle back to restore
      await checkbox.click({ force: true });
      await expect(checkbox).toBeChecked({ checked: initialChecked });
    });

    test('User can change language selection', async ({ page }) => {
      // 1. Find the language setting item
      const settingItem = page.getByTestId('items-language-select');
      await expect(settingItem).toBeVisible();

      // 2. Find the Ant Design select within the setting item
      const selectTrigger = settingItem.locator('.ant-select');
      await expect(selectTrigger).toBeVisible();

      // 3. Open the dropdown
      await selectTrigger.click();

      // 4. Verify dropdown is visible with language options
      const dropdown = page.locator('.ant-select-dropdown').last();
      await expect(dropdown).toBeVisible();

      // 5. Select Korean — language change triggers UI re-render
      await dropdown
        .locator('.ant-select-item-option')
        .filter({ hasText: '한국어' })
        .click();

      // 6. Wait for UI to update after language change, then verify
      //    Use .ant-select (not .ant-select-selection-item) because showSearch
      //    changes DOM structure and i18n re-render recreates elements
      await expect(
        page.getByTestId('items-language-select').locator('.ant-select'),
      ).toContainText('한국어', { timeout: 15000 });

      // 7. Restore English — re-locate elements since DOM may have changed
      await page
        .getByTestId('items-language-select')
        .locator('.ant-select')
        .click();
      const restoredDropdown = page.locator('.ant-select-dropdown').last();
      await expect(restoredDropdown).toBeVisible();

      await restoredDropdown
        .locator('.ant-select-item-option')
        .filter({ hasText: 'English' })
        .click();

      // 8. Verify English is restored
      await expect(
        page.getByTestId('items-language-select').locator('.ant-select'),
      ).toContainText('English', { timeout: 15000 });
    });

    test('User can toggle Auto Logout checkbox', async ({ page }) => {
      // 1. Find the auto logout setting item
      const settingItem = page.getByTestId('items-auto-logout');
      await expect(settingItem).toBeVisible();

      // 2. Find the checkbox
      const checkbox = settingItem.locator('input[type="checkbox"]');

      // 3. Get initial state
      const initialChecked = await checkbox.isChecked();

      // 4. Toggle
      await checkbox.click({ force: true });
      await expect(checkbox).toBeChecked({ checked: !initialChecked });

      // 5. Toggle back to restore
      await checkbox.click({ force: true });
      await expect(checkbox).toBeChecked({ checked: initialChecked });
    });

    test('User can change max concurrent uploads', async ({ page }) => {
      // 1. Find the max concurrent uploads setting item
      const settingItem = page.getByTestId('items-max-concurrent-uploads');
      await expect(settingItem).toBeVisible();

      // 2. Find the select
      const selectTrigger = settingItem.locator('.ant-select');
      await expect(selectTrigger).toBeVisible();

      // 3. Open the dropdown
      await selectTrigger.click();

      // 4. Verify dropdown with numeric options
      const dropdown = page.locator('.ant-select-dropdown').last();
      await expect(dropdown).toBeVisible();
      await expect(
        dropdown.locator('.ant-select-item-option').first(),
      ).toBeVisible();

      // 5. Select "3"
      await dropdown
        .locator('.ant-select-item-option')
        .filter({ hasText: '3' })
        .click();

      // 6. Verify selection — use parent .ant-select since .ant-select-selection-item
      //    may not render immediately in Ant Design 6
      await expect(selectTrigger).toContainText('3');

      // 7. Restore default (2)
      await selectTrigger.click();
      const restoredDropdown = page.locator('.ant-select-dropdown').last();
      await restoredDropdown
        .locator('.ant-select-item-option')
        .filter({ hasText: '2' })
        .first()
        .click();
    });
  },
);

test.describe(
  'User Settings - Tab Navigation',
  { tag: ['@regression', '@user', '@functional'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await loginAsUser(page, request);
      await navigateTo(page, 'usersettings');
      await expect(page.getByRole('tab', { name: 'General' })).toBeVisible();
    });

    test('User can switch to Logs tab', async ({ page }) => {
      // 1. Click Logs tab
      await page.getByRole('tab', { name: 'Logs' }).click();

      // 2. Verify Logs tab is active
      await checkActiveTab(page.locator('.ant-tabs').first(), 'Logs');

      // 3. Verify Preferences group is no longer visible
      await expect(page.getByTestId('group-preferences')).not.toBeVisible();
    });

    test('User can switch back to General tab from Logs', async ({ page }) => {
      // 1. Switch to Logs
      await page.getByRole('tab', { name: 'Logs' }).click();
      await checkActiveTab(page.locator('.ant-tabs').first(), 'Logs');

      // 2. Switch back to General
      await page.getByRole('tab', { name: 'General' }).click();

      // 3. Verify General tab is active and content visible
      await checkActiveTab(page.locator('.ant-tabs').first(), 'General');
      await expect(page.getByTestId('group-preferences')).toBeVisible();
    });
  },
);
