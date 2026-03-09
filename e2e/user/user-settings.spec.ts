// spec: User Settings page E2E tests
// Tests the /usersettings page: General tab preferences including
// desktop notifications, compact sidebar, language selection, auto-logout,
// automatic update check, keypair info, SSH keypair management,
// shell script editing, experimental features, and tab navigation.
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

    test('User can toggle Desktop Notification checkbox', async ({
      page,
      context,
    }) => {
      // 0. Grant notification permission so the toggle isn't reverted
      await context.grantPermissions(['notifications']);

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

    test('User can toggle Automatic Update Check checkbox', async ({
      page,
    }) => {
      // 1. Find the automatic update check setting item
      const settingItem = page.getByTestId('items-automatic-update-check');
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

test.describe.serial(
  'User Settings - Keypair & SSH Management',
  { tag: ['@regression', '@user', '@functional'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await loginAsUser(page, request);
      await navigateTo(page, 'usersettings');
      await expect(page.getByRole('tab', { name: 'General' })).toBeVisible();
    });

    test('User can open and close My Keypair Info modal', async ({ page }) => {
      // 1. Find the My Keypair Info setting item
      const settingItem = page.getByTestId('items-my-keypair-info');
      await expect(settingItem).toBeVisible();

      // 2. Click the Config button
      await settingItem.getByRole('button', { name: 'Config' }).click();

      // 3. Verify modal opens
      const modal = page.locator('.ant-modal').last();
      await expect(modal).toBeVisible();

      // 4. Close the modal without making changes (use X button to avoid ambiguity)
      await modal.locator('.ant-modal-close').click();
      await expect(modal).toBeHidden();
    });

    test('User can open and close SSH Keypair Management modal', async ({
      page,
    }) => {
      // 1. Find the SSH Keypair Management setting item
      const settingItem = page.getByTestId('items-ssh-keypair-management');
      await expect(settingItem).toBeVisible();

      // 2. Click the Config button
      await settingItem.getByRole('button', { name: 'Config' }).click();

      // 3. Verify modal opens
      const modal = page.locator('.ant-modal').last();
      await expect(modal).toBeVisible();

      // 4. Close the modal without making changes (use X button to avoid ambiguity)
      await modal.locator('.ant-modal-close').click();
      await expect(modal).toBeHidden();
    });
  },
);

test.describe.serial(
  'User Settings - Shell Environments',
  { tag: ['@regression', '@user', '@functional'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await loginAsUser(page, request);
      await navigateTo(page, 'usersettings');
      await expect(page.getByRole('tab', { name: 'General' })).toBeVisible();
    });

    test('User can see Shell Environments group', async ({ page }) => {
      // 1. Verify the Shell Environments group is visible
      const group = page.getByTestId('group-shell-environments');
      await expect(group).toBeVisible();

      // 2. Verify both script items are visible
      await expect(
        page.getByTestId('items-edit-bootstrap-script'),
      ).toBeVisible();
      await expect(
        page.getByTestId('items-edit-user-config-script'),
      ).toBeVisible();
    });

    test('User can open and close Bootstrap Script editor modal', async ({
      page,
    }) => {
      // 1. Find the Bootstrap Script setting item
      const settingItem = page.getByTestId('items-edit-bootstrap-script');

      // 2. Click the Config button
      await settingItem.getByRole('button', { name: 'Config' }).click();

      // 3. Verify modal opens with correct title
      const modal = page.locator('.ant-modal').last();
      await expect(modal).toBeVisible();
      await expect(modal.locator('.ant-modal-title')).toContainText(
        'Bootstrap Script',
      );

      // 4. Verify code editor is present
      await expect(modal.locator('.cm-editor')).toBeVisible();

      // 5. Close the modal without saving (Cancel button)
      await modal.getByRole('button', { name: 'Cancel' }).click();
      await expect(modal).toBeHidden();
    });

    test('User can open and close User Config Script editor modal', async ({
      page,
    }) => {
      // 1. Find the User Config Script setting item
      const settingItem = page.getByTestId('items-edit-user-config-script');

      // 2. Click the Config button
      await settingItem.getByRole('button', { name: 'Config' }).click();

      // 3. Verify modal opens with correct title
      const modal = page.locator('.ant-modal').last();
      await expect(modal).toBeVisible();
      await expect(modal.locator('.ant-modal-title')).toContainText(
        'User Config Script',
      );

      // 4. Verify code editor is present
      await expect(modal.locator('.cm-editor')).toBeVisible();

      // 5. Verify rc file selector is present with .bashrc as default
      await expect(modal.locator('.ant-select')).toBeVisible();
      await expect(modal.locator('.ant-select')).toContainText('.bashrc');

      // 6. Close the modal without saving
      await modal.getByRole('button', { name: 'Cancel' }).click();
      await expect(modal).toBeHidden();
    });

    test('User can switch between rc files in User Config Script modal', async ({
      page,
    }) => {
      // 1. Open User Config Script modal
      const settingItem = page.getByTestId('items-edit-user-config-script');
      await settingItem.getByRole('button', { name: 'Config' }).click();

      const modal = page.locator('.ant-modal').last();
      await expect(modal).toBeVisible();

      // 2. Open the rc file selector
      await modal.locator('.ant-select').click();

      // 3. Verify dropdown options
      const dropdown = page.locator('.ant-select-dropdown').last();
      await expect(dropdown).toBeVisible();
      await expect(
        dropdown
          .locator('.ant-select-item-option')
          .filter({ hasText: '.zshrc' }),
      ).toBeVisible();
      await expect(
        dropdown
          .locator('.ant-select-item-option')
          .filter({ hasText: '.vimrc' }),
      ).toBeVisible();

      // 4. Select .zshrc
      await dropdown
        .locator('.ant-select-item-option')
        .filter({ hasText: '.zshrc' })
        .click();

      // 5. Verify selection changed
      await expect(modal.locator('.ant-select')).toContainText('.zshrc');

      // 6. Close without saving
      await modal.getByRole('button', { name: 'Cancel' }).click();
      await expect(modal).toBeHidden();
    });
  },
);

test.describe.serial(
  'User Settings - Experimental Features',
  { tag: ['@regression', '@user', '@functional'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await loginAsUser(page, request);
      await navigateTo(page, 'usersettings');
      await expect(page.getByRole('tab', { name: 'General' })).toBeVisible();
    });

    test('User can see Experimental Features group', async ({ page }) => {
      // 1. Verify the Experimental Features group is visible
      const group = page.getByTestId('group-experimental-features');
      await expect(group).toBeVisible();

      // 2. Verify AI Agents item is visible
      await expect(
        page.getByTestId('items-experimental-ai-agents'),
      ).toBeVisible();
    });

    test('User can toggle Experimental AI Agents checkbox', async ({
      page,
    }) => {
      // 1. Find the AI Agents setting item
      const settingItem = page.getByTestId('items-experimental-ai-agents');
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

test.describe(
  'User Settings - Search and Filter',
  { tag: ['@regression', '@user', '@functional'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await loginAsUser(page, request);
      await navigateTo(page, 'usersettings');
      await expect(page.getByRole('tab', { name: 'General' })).toBeVisible();
    });

    test('User can search settings by keyword', async ({ page }) => {
      // 1. Find the search bar (plain Input with SearchOutlined prefix)
      const searchInput = page
        .locator('.ant-input-affix-wrapper')
        .locator('input')
        .first();
      await expect(searchInput).toBeVisible();

      // 2. Type a search term that matches a specific setting
      await searchInput.fill('Notification');

      // 3. Verify filtered results — Desktop Notification should be visible
      await expect(
        page.getByTestId('items-desktop-notification'),
      ).toBeVisible();

      // 4. Verify unrelated settings are hidden
      await expect(
        page.getByTestId('items-max-concurrent-uploads'),
      ).not.toBeVisible();

      // 5. Clear the search to restore all settings
      await searchInput.clear();

      // 6. Verify all settings are visible again
      await expect(
        page.getByTestId('items-max-concurrent-uploads'),
      ).toBeVisible();
    });
  },
);
