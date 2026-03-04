// E2E tests for the WebUI plugin system
import {
  loginAsAdmin,
  loginAsUser,
  modifyConfigToml,
} from '../utils/test-util';
import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

function readPluginFixture(filename: string): string {
  return fs.readFileSync(path.join(__dirname, filename), 'utf-8');
}

const TEST_PLUGIN_JS = readPluginFixture('test-plugin.js');
const ADMIN_PLUGIN_JS = readPluginFixture('admin-test-plugin.js');
const PLUGIN_A_JS = readPluginFixture('plugin-a.js');
const PLUGIN_B_JS = readPluginFixture('plugin-b.js');

test.describe.parallel(
  'Plugin System',
  { tag: ['@plugin', '@functional', '@regression'] },
  () => {
    // =========================================================================
    // 1. Plugin Menu Item Appears in Sidebar
    // =========================================================================

    test.describe('Plugin Menu Item Appears in Sidebar', () => {
      test('Admin can see user-permission plugin menu item in sidebar', async ({
        page,
        request,
      }) => {
        // 1. Modify config to include the plugin
        await modifyConfigToml(page, request, {
          plugin: { page: 'test-plugin' },
        });

        // 2. Serve the plugin JS inline
        await page.route('**/dist/plugins/test-plugin.js', async (route) => {
          await route.fulfill({
            status: 200,
            contentType: 'application/javascript',
            body: TEST_PLUGIN_JS,
          });
        });

        // 3. Login as admin after setting up routes
        await loginAsAdmin(page, request);

        // 4. Verify sidebar has "Open Backend.AI" menuitem
        await expect(
          page.getByRole('menuitem', { name: 'Open Backend.AI' }),
        ).toBeVisible();
      });

      test('User can see user-permission plugin menu item in sidebar', async ({
        page,
        request,
      }) => {
        // 1. Modify config to include the plugin
        await modifyConfigToml(page, request, {
          plugin: { page: 'test-plugin' },
        });

        // 2. Serve the plugin JS inline
        await page.route('**/dist/plugins/test-plugin.js', async (route) => {
          await route.fulfill({
            status: 200,
            contentType: 'application/javascript',
            body: TEST_PLUGIN_JS,
          });
        });

        // 3. Login as user after setting up routes
        await loginAsUser(page, request);

        // 4. Verify sidebar has "Open Backend.AI" menuitem
        await expect(
          page.getByRole('menuitem', { name: 'Open Backend.AI' }),
        ).toBeVisible();
      });

      test('Admin can see admin-permission plugin in Admin Settings panel', async ({
        page,
        request,
      }) => {
        // 1. Modify config to include the admin plugin
        await modifyConfigToml(page, request, {
          plugin: { page: 'admin-test-plugin' },
        });

        // 2. Serve the admin plugin JS inline
        await page.route(
          '**/dist/plugins/admin-test-plugin.js',
          async (route) => {
            await route.fulfill({
              status: 200,
              contentType: 'application/javascript',
              body: ADMIN_PLUGIN_JS,
            });
          },
        );

        // 3. Login as admin after setting up routes
        await loginAsAdmin(page, request);

        // 4. Click "Admin Settings" menu item in sidebar
        await page.getByRole('menuitem', { name: 'Admin Settings' }).click();

        // 5. Verify Admin Settings panel has "Admin Tool" menuitem
        await expect(
          page.getByRole('menuitem', { name: 'Admin Tool' }),
        ).toBeVisible();
      });
    });

    // =========================================================================
    // 2. Plugin Menu Does Not Appear Without Config
    // =========================================================================

    test.describe('Plugin Menu Does Not Appear Without Config', () => {
      test('Admin cannot see extra plugin menu when plugin.page is not set', async ({
        page,
        request,
      }) => {
        // 1. Login as admin without setting any plugin config
        await loginAsAdmin(page, request);

        // 2. Verify no "Open Backend.AI" plugin menuitem is shown
        await expect(
          page.getByRole('menuitem', { name: 'Open Backend.AI' }),
        ).toBeHidden();
      });

      test('Admin cannot see plugin menu when plugin JS file returns 404', async ({
        page,
        request,
      }) => {
        // 1. Setup config with plugin.page pointing to broken plugin
        await modifyConfigToml(page, request, {
          plugin: { page: 'broken-plugin' },
        });

        // 2. Route the plugin JS to return 404
        await page.route('**/dist/plugins/broken-plugin.js', async (route) => {
          await route.fulfill({ status: 404 });
        });

        // 3. Login as admin after setting up routes
        await loginAsAdmin(page, request);

        // 4. Verify no "broken-plugin" menu item appears
        await expect(
          page.getByRole('menuitem', { name: 'broken-plugin' }),
        ).toBeHidden();

        // 5. Verify the standard menu items still appear (app works normally)
        await expect(
          page.getByRole('menuitem', { name: /\bDashboard\b/ }),
        ).toBeVisible();
      });
    });

    // =========================================================================
    // 3. Plugin Menu Click Navigation
    // =========================================================================

    test.describe('Plugin Menu Click Navigation', () => {
      test('Admin can open external link plugin in new tab', async ({
        page,
        context,
        request,
      }) => {
        // 1. Setup plugin config and JS
        await modifyConfigToml(page, request, {
          plugin: { page: 'test-plugin' },
        });

        await page.route('**/dist/plugins/test-plugin.js', async (route) => {
          await route.fulfill({
            status: 200,
            contentType: 'application/javascript',
            body: TEST_PLUGIN_JS,
          });
        });

        // 2. Login as admin
        await loginAsAdmin(page, request);

        // 3. Verify the plugin menu item links to the plugin route
        const pluginLink = page
          .getByRole('menuitem', { name: 'Open Backend.AI' })
          .locator('a');
        await expect(pluginLink).toHaveAttribute('href', /\/test-plugin/);

        // 4. Verify clicking opens a new tab (externalLink type plugin)
        const [newPage] = await Promise.all([
          context.waitForEvent('page'),
          pluginLink.click(),
        ]);
        await newPage.close();
      });
    });

    // =========================================================================
    // 4. Permission-Based Visibility
    // =========================================================================

    test.describe('Permission-Based Visibility', () => {
      test('User cannot see admin-permission plugin menu item', async ({
        page,
        request,
      }) => {
        // 1. Setup admin-permission plugin
        await modifyConfigToml(page, request, {
          plugin: { page: 'admin-test-plugin' },
        });

        await page.route(
          '**/dist/plugins/admin-test-plugin.js',
          async (route) => {
            await route.fulfill({
              status: 200,
              contentType: 'application/javascript',
              body: ADMIN_PLUGIN_JS,
            });
          },
        );

        // 2. Login as USER (not admin)
        await loginAsUser(page, request);

        // 3. Verify "Admin Tool" menuitem is NOT visible
        await expect(
          page.getByRole('menuitem', { name: 'Admin Tool' }),
        ).toBeHidden();
      });
    });

    // =========================================================================
    // 5. Plugin Blocklist
    // =========================================================================

    test.describe('Plugin Blocklist', () => {
      test('Admin cannot see plugin that is in the blocklist', async ({
        page,
        request,
      }) => {
        // 1. Setup config with plugin.page AND menu.blocklist containing the same plugin
        await modifyConfigToml(page, request, {
          plugin: { page: 'test-plugin' },
          menu: { blocklist: 'test-plugin' },
        });

        await page.route('**/dist/plugins/test-plugin.js', async (route) => {
          await route.fulfill({
            status: 200,
            contentType: 'application/javascript',
            body: TEST_PLUGIN_JS,
          });
        });

        // 2. Login as admin
        await loginAsAdmin(page, request);

        // 3. Verify "Open Backend.AI" is NOT visible
        await expect(
          page.getByRole('menuitem', { name: 'Open Backend.AI' }),
        ).toBeHidden();
      });

      test('Admin can see plugin that is not in the blocklist while blocked item is hidden', async ({
        page,
        request,
      }) => {
        // 1. Setup config with plugin.page AND menu.blocklist blocking "chat"
        await modifyConfigToml(page, request, {
          plugin: { page: 'test-plugin' },
          menu: { blocklist: 'chat' },
        });

        await page.route('**/dist/plugins/test-plugin.js', async (route) => {
          await route.fulfill({
            status: 200,
            contentType: 'application/javascript',
            body: TEST_PLUGIN_JS,
          });
        });

        // 2. Login as admin
        await loginAsAdmin(page, request);

        // 3. Verify "Open Backend.AI" IS visible (plugin not in blocklist)
        await expect(
          page.getByRole('menuitem', { name: 'Open Backend.AI' }),
        ).toBeVisible();

        // 4. Verify "Chat" IS hidden (it is in the blocklist)
        await expect(
          page.getByRole('menuitem', { name: /\bChat\b/ }),
        ).toBeHidden();
      });
    });

    // =========================================================================
    // 6. Multiple Plugins
    // =========================================================================

    test.describe('Multiple Plugins', () => {
      test('Admin can see multiple plugin menu items when multiple plugins are configured', async ({
        page,
        request,
      }) => {
        // 1. Setup config with multiple plugins
        await modifyConfigToml(page, request, {
          plugin: { page: 'plugin-a,plugin-b' },
        });

        // 2. Route both plugin JS files
        await page.route('**/dist/plugins/plugin-a.js', async (route) => {
          await route.fulfill({
            status: 200,
            contentType: 'application/javascript',
            body: PLUGIN_A_JS,
          });
        });

        await page.route('**/dist/plugins/plugin-b.js', async (route) => {
          await route.fulfill({
            status: 200,
            contentType: 'application/javascript',
            body: PLUGIN_B_JS,
          });
        });

        // 3. Login as admin
        await loginAsAdmin(page, request);

        // 4. Verify both "Plugin A" and "Plugin B" menuitems are visible
        await expect(
          page.getByRole('menuitem', { name: 'Plugin A' }),
        ).toBeVisible();
        await expect(
          page.getByRole('menuitem', { name: 'Plugin B' }),
        ).toBeVisible();
      });

      test('Admin can see valid plugin when one of multiple plugins fails to load', async ({
        page,
        request,
      }) => {
        // 1. Setup config with one valid and one broken plugin
        await modifyConfigToml(page, request, {
          plugin: { page: 'plugin-a,broken-plugin' },
        });

        // 2. Route plugin-a with valid JS, broken-plugin with 404
        await page.route('**/dist/plugins/plugin-a.js', async (route) => {
          await route.fulfill({
            status: 200,
            contentType: 'application/javascript',
            body: PLUGIN_A_JS,
          });
        });

        await page.route('**/dist/plugins/broken-plugin.js', async (route) => {
          await route.fulfill({ status: 404 });
        });

        // 3. Login as admin
        await loginAsAdmin(page, request);

        // 4. Verify "Plugin A" IS visible
        await expect(
          page.getByRole('menuitem', { name: 'Plugin A' }),
        ).toBeVisible();

        // 5. Verify no "broken-plugin" menuitem appears
        await expect(
          page.getByRole('menuitem', { name: 'broken-plugin' }),
        ).toBeHidden();
      });
    });

    // =========================================================================
    // Sections 7 (Plugin Name Security Validation), 8 (Plugin Group Assignment),
    // and 9 (Plugin Icon Rendering) from plugin-system-test-plan.md are not yet
    // implemented. They require additional infrastructure (e.g. verifying icon
    // DOM structure and group position in the sidebar).
    // =========================================================================

    // =========================================================================
    // 10. Plugin State After Reload
    // =========================================================================

    test.describe('Plugin State After Reload', () => {
      test('Admin can see plugin menu item after page reload', async ({
        page,
        request,
      }) => {
        // 1. Setup plugin config and JS
        await modifyConfigToml(page, request, {
          plugin: { page: 'test-plugin' },
        });

        await page.route('**/dist/plugins/test-plugin.js', async (route) => {
          await route.fulfill({
            status: 200,
            contentType: 'application/javascript',
            body: TEST_PLUGIN_JS,
          });
        });

        // 2. Login as admin
        await loginAsAdmin(page, request);

        // 3. Verify "Open Backend.AI" is visible before reload
        await expect(
          page.getByRole('menuitem', { name: 'Open Backend.AI' }),
        ).toBeVisible();

        // 4. Reload the page
        await page.reload();

        // 5. Wait for the user dropdown button to confirm page is ready
        await expect(page.getByTestId('user-dropdown-button')).toBeVisible();

        // 6. Verify "Open Backend.AI" still visible after reload
        await expect(
          page.getByRole('menuitem', { name: 'Open Backend.AI' }),
        ).toBeVisible();
      });
    });
  },
);
