// E2E tests for the config.toml → app config migration and the System Settings
// page (#10436, #10677).
//
// Every test here writes the cluster-wide `settings` documents
// (`publicConfigByDomain.<domain>.settings`, `domainConfig.settings`), so the
// file runs its tests one after another in a single worker, clears the
// documents around each test, and restores whatever the deployment held
// before the run. Other specs that sign in while one of these tests holds an
// override see that override; keep the write→assert→clear window short.
import {
  getSideNavItem,
  loginAsAdmin,
  loginAsDomainAdmin,
  notFoundPageHeading,
  navigateTo,
  webServerEndpoint,
  userInfo,
} from '../utils/test-util';
import {
  allSettingRows,
  applyButton,
  applyWebUISettings,
  changedMarker,
  commitRowInput,
  differentValueFor,
  enablePublicSlice,
  openLoginPage,
  openWebUISettings,
  PUBLIC_GROUPS,
  readClientConfig,
  readClientConfigForRows,
  readConfigToml,
  resetRow,
  rowByKey,
  rowCheckbox,
  rowInput,
  settingGroup,
  settingRow,
  suppressAdminViewSwitchTour,
  tomlValueOf,
  toolbarResetButton,
  waitForClientReady,
  WEBUI_SETTING_GROUPS,
  WEBUI_SETTING_ROWS,
  WebUISettingsApi,
  type SettingsDocument,
  type SettingsSnapshot,
} from '../utils/webui-settings-util';
import {
  test,
  expect,
  type APIRequestContext,
  type Browser,
  type Page,
} from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Sequential on purpose: one cluster-wide document, see the file comment.
test.describe.configure({ mode: 'default' });

const DOMAIN_ROWS = WEBUI_SETTING_ROWS.filter((r) => r.scope === 'domain');
const PUBLIC_ROWS = WEBUI_SETTING_ROWS.filter((r) => r.scope === 'public');

let api: WebUISettingsApi;
let snapshot: SettingsSnapshot;

test.beforeAll(async () => {
  api = await WebUISettingsApi.create();
  snapshot = await api.snapshot();
});

test.afterAll(async () => {
  await api.restore(snapshot);
  await api.dispose();
});

// Each test starts from file values only and leaves nothing behind.
test.beforeEach(async () => {
  await api.clear();
});
test.afterEach(async () => {
  await api.clear();
});

/** Superadmin sign-in with the admin view-switch tour already dismissed. */
async function signInAsAdmin(page: Page, request: APIRequestContext) {
  await suppressAdminViewSwitchTour(page);
  await loginAsAdmin(page, request);
}

/** Signs in as superadmin in a fresh browser context and returns its page. */
async function signInAsAdminInNewContext(
  browser: Browser,
  request: APIRequestContext,
): Promise<Page> {
  const context = await browser.newContext();
  const page = await context.newPage();
  await signInAsAdmin(page, request);
  await waitForClientReady(page);
  return page;
}

function pluginScript(name: string): RegExp {
  // Vite appends `?import` to dynamically imported module URLs.
  return new RegExp(`/dist/plugins/${name}\\.js(\\?.*)?$`);
}

function readPluginFixture(filename: string): string {
  return fs.readFileSync(
    path.join(__dirname, '..', 'plugin', filename),
    'utf-8',
  );
}

// ===========================================================================
// 1. The page
// ===========================================================================

test.describe(
  'System Settings - Page',
  { tag: ['@critical', '@config', '@webui-settings', '@functional'] },
  () => {
    test('superadmin sees every group and every row with its config.toml value as the default', async ({
      page,
      request,
    }) => {
      const config = await readConfigToml(page);
      await signInAsAdmin(page, request);
      await openWebUISettings(page);

      await test.step('every group renders', async () => {
        for (const group of WEBUI_SETTING_GROUPS) {
          await expect(settingGroup(page, group)).toBeVisible();
        }
      });

      await test.step('the rows are exactly the definition table', async () => {
        await expect(allSettingRows(page)).toHaveCount(
          WEBUI_SETTING_ROWS.length,
        );
        for (const setting of WEBUI_SETTING_ROWS) {
          await expect(settingRow(page, setting.key)).toBeVisible();
        }
      });

      await test.step('no row is marked as changed and each shows the file value', async () => {
        for (const setting of WEBUI_SETTING_ROWS) {
          const row = settingRow(page, setting.key);
          await expect(changedMarker(row)).toHaveCount(0);
          const fileValue = tomlValueOf(config, setting);
          if (fileValue === undefined) continue;
          switch (setting.type) {
            case 'boolean':
              await expect(rowCheckbox(row)).toBeChecked({
                checked: fileValue as boolean,
              });
              break;
            case 'number':
            case 'string':
              await expect(rowInput(row)).toHaveValue(String(fileValue));
              break;
            case 'stringList':
              // Rendered per key (vendor checkboxes, plugin path rows, a
              // comma list); presence and the clean marker above are the
              // common contract.
              break;
          }
        }
      });

      await test.step('Apply is disabled while nothing changed', async () => {
        await expect(applyButton(page)).toBeDisabled();
      });
    });

    test('domain admin sees no public-scope group', async ({
      page,
      request,
    }) => {
      await loginAsDomainAdmin(page, request);
      await openWebUISettings(page);

      for (const group of PUBLIC_GROUPS) {
        await expect(settingGroup(page, group)).toHaveCount(0);
      }
      for (const group of WEBUI_SETTING_GROUPS.filter(
        (g) => !PUBLIC_GROUPS.includes(g),
      )) {
        await expect(settingGroup(page, group)).toBeVisible();
      }
      await expect(allSettingRows(page)).toHaveCount(DOMAIN_ROWS.length);
      for (const setting of PUBLIC_ROWS) {
        await expect(settingRow(page, setting.key)).toHaveCount(0);
      }
    });

    test('a checkbox row shows the changed marker and resets to the file value', async ({
      page,
      request,
    }) => {
      await signInAsAdmin(page, request);
      await openWebUISettings(page);
      const row = settingRow(page, 'hideAgents');
      const checkbox = rowCheckbox(row);
      const before = await checkbox.isChecked();

      await checkbox.click();
      await expect(checkbox).toBeChecked({ checked: !before });
      await expect(changedMarker(row)).toBeVisible();
      await expect(applyButton(page)).toBeEnabled();

      await resetRow(page, row);
      await expect(checkbox).toBeChecked({ checked: before });
      await expect(changedMarker(row)).toHaveCount(0);
      await expect(applyButton(page)).toBeDisabled();
    });

    test('a number row shows the changed marker and resets to the file value', async ({
      page,
      request,
    }) => {
      await signInAsAdmin(page, request);
      await openWebUISettings(page);
      const row = settingRow(page, 'maxCPUCoresPerContainer');
      const before = await rowInput(row).inputValue();

      await commitRowInput(row, String(Number(before) + 1));
      await expect(changedMarker(row)).toBeVisible();
      await expect(applyButton(page)).toBeEnabled();

      await resetRow(page, row);
      await expect(rowInput(row)).toHaveValue(before);
      await expect(changedMarker(row)).toHaveCount(0);
    });

    test('the Reset button discards every changed row', async ({
      page,
      request,
    }) => {
      await signInAsAdmin(page, request);
      await openWebUISettings(page);
      const checkboxRow = settingRow(page, 'maskUserInfo');
      const textRow = settingRow(page, 'ssoRealmName');

      await rowCheckbox(checkboxRow).click();
      await commitRowInput(textRow, 'e2e-realm');
      await expect(changedMarker(checkboxRow)).toBeVisible();
      await expect(changedMarker(textRow)).toBeVisible();

      await toolbarResetButton(page).click();
      const dialog = page
        .getByRole('dialog')
        .filter({ hasText: 'Do you want to reset your changes?' });
      await dialog.getByRole('button', { name: 'Reset', exact: true }).click();
      await expect(dialog).toBeHidden();

      await expect(changedMarker(checkboxRow)).toHaveCount(0);
      await expect(changedMarker(textRow)).toHaveCount(0);
      await expect(applyButton(page)).toBeDisabled();
    });

    test('Apply confirms, reloads, saves only the changed keys and resetting them removes the document', async ({
      page,
      request,
    }) => {
      await signInAsAdmin(page, request);
      await waitForClientReady(page);
      const fileHideAgents = await readClientConfig(page, 'hideAgents');
      const fileMaxCpu = await readClientConfig(
        page,
        'maxCPUCoresPerContainer',
      );
      await openWebUISettings(page);

      const hideAgentsRow = settingRow(page, 'hideAgents');
      const maxCpuRow = settingRow(page, 'maxCPUCoresPerContainer');
      const nextMaxCpu = Number(fileMaxCpu) + 3;

      await test.step('change two domain rows and apply', async () => {
        await rowCheckbox(hideAgentsRow).click();
        await commitRowInput(maxCpuRow, String(nextMaxCpu));
        await applyWebUISettings(page);
      });

      await test.step('the reloaded page keeps the rows marked and the client reads the new values', async () => {
        await expect(changedMarker(hideAgentsRow)).toBeVisible();
        await expect(changedMarker(maxCpuRow)).toBeVisible();
        await expect(rowInput(maxCpuRow)).toHaveValue(String(nextMaxCpu));
        expect(await readClientConfig(page, 'hideAgents')).toBe(
          !fileHideAgents,
        );
        expect(await readClientConfig(page, 'maxCPUCoresPerContainer')).toBe(
          nextMaxCpu,
        );
      });

      await test.step('only the two differing keys were saved, in the domain document', async () => {
        expect(await api.readSettings('domain')).toEqual({
          hideAgents: !fileHideAgents,
          maxCPUCoresPerContainer: nextMaxCpu,
        });
        expect(await api.readSettings('public')).toBeUndefined();
      });

      await test.step('resetting both rows and applying removes the document and the file values return', async () => {
        await resetRow(page, hideAgentsRow);
        await resetRow(page, maxCpuRow);
        await applyWebUISettings(page);
        await expect(changedMarker(hideAgentsRow)).toHaveCount(0);
        await expect(changedMarker(maxCpuRow)).toHaveCount(0);
        expect(await api.readSettings('domain')).toBeUndefined();
        expect(await readClientConfig(page, 'hideAgents')).toBe(fileHideAgents);
        expect(await readClientConfig(page, 'maxCPUCoresPerContainer')).toBe(
          fileMaxCpu,
        );
      });
    });

    test('superadmin saves a Sign-in row into the public document', async ({
      page,
      request,
    }) => {
      await signInAsAdmin(page, request);
      await openWebUISettings(page);
      const row = settingRow(page, 'ssoRealmName');

      await commitRowInput(row, 'e2e-realm');
      await applyWebUISettings(page);

      await expect(changedMarker(row)).toBeVisible();
      await expect(rowInput(row)).toHaveValue('e2e-realm');
      expect(await api.readSettings('public')).toEqual({
        ssoRealmName: 'e2e-realm',
      });
      expect(await api.readSettings('domain')).toBeUndefined();
    });

    test('leaving the page with unapplied changes asks for confirmation', async ({
      page,
      request,
    }) => {
      await signInAsAdmin(page, request);
      await openWebUISettings(page);
      const row = settingRow(page, 'maskUserInfo');
      await rowCheckbox(row).click();
      await expect(changedMarker(row)).toBeVisible();

      await getSideNavItem(page, 'Information').click();
      // `modal.confirm` renders an AlertModal, not a plain dialog.
      const dialog = page.getByRole('alertdialog', {
        name: 'Leave without applying?',
      });
      await expect(dialog).toBeVisible();

      await dialog.getByRole('button', { name: 'Cancel' }).click();
      await expect(dialog).toBeHidden();
      await expect(page).toHaveURL(/\/admin\/webui-settings/);
      await expect(changedMarker(row)).toBeVisible();

      await getSideNavItem(page, 'Information').click();
      await dialog.getByRole('button', { name: 'Discard' }).click();
      await expect(page).toHaveURL(/\/admin\/information/);
      expect(await api.readSettings('domain')).toBeUndefined();
    });
  },
);

// ===========================================================================
// 2. Precedence: document over file, file as fallback
// ===========================================================================

test.describe(
  'System Settings - Precedence',
  { tag: ['@critical', '@config', '@webui-settings', '@integration'] },
  () => {
    test('a value in the domain document overrides config.toml for every domain key after sign-in', async ({
      browser,
      request,
    }) => {
      const baselinePage = await signInAsAdminInNewContext(browser, request);
      const baseline = await readClientConfigForRows(baselinePage, DOMAIN_ROWS);
      await baselinePage.context().close();

      const override: SettingsDocument = Object.fromEntries(
        DOMAIN_ROWS.map((setting) => [
          setting.key,
          differentValueFor(setting, baseline[setting.key]),
        ]),
      );
      await api.writeSettings('domain', override);

      const page = await signInAsAdminInNewContext(browser, request);
      const effective = await readClientConfigForRows(page, DOMAIN_ROWS);
      await page.context().close();

      for (const setting of DOMAIN_ROWS) {
        expect(effective[setting.key], setting.key).toEqual(
          override[setting.key],
        );
        expect(effective[setting.key], setting.key).not.toEqual(
          baseline[setting.key],
        );
      }
    });

    test('a wrong-typed value or an absent key keeps the config.toml value', async ({
      browser,
      request,
    }) => {
      const probed = [
        'hideAgents',
        'maxCPUCoresPerContainer',
        'menuBlocklist',
        'enableModelFolders',
        'ssoRealmName',
      ];
      const rows = probed.map(rowByKey);

      const baselinePage = await signInAsAdminInNewContext(browser, request);
      const baseline = await readClientConfigForRows(baselinePage, rows);
      await baselinePage.context().close();

      // Each value has the wrong type for its key; `ssoRealmName` is absent.
      await api.writeSettings('domain', {
        hideAgents: 'yes',
        maxCPUCoresPerContainer: '12',
        menuBlocklist: 'session',
        enableModelFolders: 1,
      });

      const page = await signInAsAdminInNewContext(browser, request);
      const effective = await readClientConfigForRows(page, rows);
      for (const setting of rows) {
        expect(effective[setting.key], setting.key).toEqual(
          baseline[setting.key],
        );
      }

      // The page falls back the same way: none of these rows is marked.
      await openWebUISettings(page);
      for (const key of probed) {
        await expect(changedMarker(settingRow(page, key))).toHaveCount(0);
      }
      await page.context().close();
    });

    test('a key saved under the other scope is ignored', async ({
      browser,
      request,
    }) => {
      const rows = [rowByKey('hideAgents'), rowByKey('ssoRealmName')];
      const baselinePage = await signInAsAdminInNewContext(browser, request);
      const baseline = await readClientConfigForRows(baselinePage, rows);
      await baselinePage.context().close();

      // `hideAgents` is a domain key, `ssoRealmName` a public one.
      await api.writeSettings('public', { hideAgents: !baseline.hideAgents });
      await api.writeSettings('domain', { ssoRealmName: 'e2e-wrong-scope' });

      const context = await browser.newContext();
      const page = await context.newPage();
      await enablePublicSlice(page, request, api.domainName);
      await signInAsAdmin(page, request);
      const effective = await readClientConfigForRows(page, rows);
      await context.close();

      expect(effective.hideAgents).toEqual(baseline.hideAgents);
      expect(effective.ssoRealmName).toEqual(baseline.ssoRealmName);
    });

    test('a value in the public document overrides config.toml on the login page before sign-in', async ({
      page,
      request,
    }) => {
      const config = await readConfigToml(page);
      const fileSigninSwitch =
        (tomlValueOf(config, rowByKey('allowChangeSigninMode')) as
          boolean | undefined) ?? false;
      const fileAnonymousPassword =
        (tomlValueOf(config, rowByKey('allowAnonymousChangePassword')) as
          boolean | undefined) ?? false;

      await api.writeSettings('public', {
        allowChangeSigninMode: !fileSigninSwitch,
        allowAnonymousChangePassword: !fileAnonymousPassword,
        singleSignOnVendors: ['saml', 'openid'],
        ssoRealmName: 'e2e-realm',
        debug: true,
      });

      await enablePublicSlice(page, request, api.domainName);
      await openLoginPage(page);

      const signinSwitch = page.getByRole('radiogroup', {
        name: 'Login',
        exact: true,
      });
      const forgotPassword = page.getByText('Forgot password?');
      if (fileSigninSwitch) {
        await expect(signinSwitch).toBeHidden();
      } else {
        await expect(signinSwitch).toBeVisible();
      }
      if (fileAnonymousPassword) {
        await expect(forgotPassword).toBeHidden();
      } else {
        await expect(forgotPassword).toBeVisible();
      }
      await expect(
        page.getByRole('button', { name: 'Login with SAML' }),
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Login with e2e-realm' }),
      ).toBeVisible();
      expect(
        await page.evaluate(() => (globalThis as any).backendaiwebui?.debug),
      ).toBe(true);
    });

    test('a key absent from the public document keeps the login page config.toml value', async ({
      page,
      request,
    }) => {
      const config = await readConfigToml(page);
      const fileSigninSwitch =
        (tomlValueOf(config, rowByKey('allowChangeSigninMode')) as
          boolean | undefined) ?? false;
      const fileVendors =
        (tomlValueOf(config, rowByKey('singleSignOnVendors')) as
          Array<string> | undefined) ?? [];

      await api.writeSettings('public', { ssoRealmName: 'e2e-realm' });
      await enablePublicSlice(page, request, api.domainName);
      await openLoginPage(page);

      const signinSwitch = page.getByRole('radiogroup', {
        name: 'Login',
        exact: true,
      });
      if (fileSigninSwitch) {
        await expect(signinSwitch).toBeVisible();
      } else {
        await expect(signinSwitch).toBeHidden();
      }
      const samlButton = page.getByRole('button', { name: 'Login with SAML' });
      if (fileVendors.includes('saml')) {
        await expect(samlButton).toBeVisible();
      } else {
        await expect(samlButton).toBeHidden();
      }
      expect(
        await page.evaluate(() => (globalThis as any).backendaiwebui?.debug),
      ).toBe(
        (tomlValueOf(config, rowByKey('debug')) as boolean | undefined) ??
          false,
      );
    });
  },
);

// ===========================================================================
// 3. Effects: the overridden value shows where the app reads it
// ===========================================================================

test.describe(
  'System Settings - Effects',
  { tag: ['@regression', '@config', '@webui-settings', '@integration'] },
  () => {
    test('hideAgents controls the Agent Summary menu and the launcher agent selector', async ({
      browser,
      request,
    }) => {
      const baselinePage = await signInAsAdminInNewContext(browser, request);
      const fileHideAgents = (await readClientConfig(
        baselinePage,
        'hideAgents',
      )) as boolean;
      await baselinePage.context().close();

      const hideAgents = !fileHideAgents;
      await api.writeSettings('domain', { hideAgents });

      const page = await signInAsAdminInNewContext(browser, request);
      await navigateTo(page, 'session/start?step=1');
      const agentSummary = getSideNavItem(page, 'Agent Summary');
      const agentSelect = page.getByRole('button', { name: 'Select Agent' });
      // The resource step is up once its preset selector renders.
      await expect(
        page.getByRole('button', { name: 'Resource Presets' }),
      ).toBeVisible({ timeout: 30_000 });
      if (hideAgents) {
        await expect(agentSummary).toBeHidden();
        await expect(agentSelect).toHaveCount(0);
      } else {
        await expect(agentSummary).toBeVisible();
        await expect(agentSelect).toBeVisible();
      }
      await page.context().close();
    });

    test('menuBlocklist from the domain document hides a page from the sidebar and its route', async ({
      browser,
      request,
    }) => {
      await api.writeSettings('domain', { menuBlocklist: ['information'] });

      const page = await signInAsAdminInNewContext(browser, request);
      await navigateTo(page, 'admin/users');
      await expect(getSideNavItem(page, 'Users')).toBeVisible();
      await expect(getSideNavItem(page, 'Information')).toBeHidden();
      await navigateTo(page, 'admin/information');
      await expect(notFoundPageHeading(page)).toBeVisible();
      await page.context().close();
    });

    test('maxCPUCoresPerContainer from the domain document caps the session launcher', async ({
      browser,
      request,
    }) => {
      await api.writeSettings('domain', {
        maxCPUCoresPerContainer: 1,
        allowCustomResourceAllocation: true,
      });

      const page = await signInAsAdminInNewContext(browser, request);
      expect(await readClientConfig(page, 'maxCPUCoresPerContainer')).toBe(1);
      await navigateTo(page, 'session/start?step=1');
      await expect(
        page.getByRole('button', { name: 'Resource Presets' }),
      ).toBeVisible({ timeout: 30_000 });
      // The resource step renders CPU first; its slider carries the
      // effective maximum (the smallest of the per-container cap and the
      // keypair, project and resource-group limits).
      const cpuSlider = page.getByRole('slider', { name: 'Value' }).first();
      await expect(cpuSlider).toBeVisible();
      await expect(cpuSlider).toHaveAttribute('aria-valuemax', '1');
      await page.context().close();
    });

    test('download panel keys from the domain document remove the Downloads menu item', async ({
      browser,
      request,
    }) => {
      await api.writeSettings('domain', {
        allowAppDownloadPanel: false,
        allowCLIDownloadPanel: false,
      });

      const page = await signInAsAdminInNewContext(browser, request);
      await page.getByTestId('user-dropdown-button').click();
      await expect(
        page.getByRole('menuitem', { name: 'Log Out' }),
      ).toBeVisible();
      await expect(
        page.getByRole('menuitem', { name: 'Downloads' }),
      ).toHaveCount(0);
      await page.context().close();
    });

    test('enableModelFolders from the domain document removes Models from the Data page', async ({
      browser,
      request,
    }) => {
      await api.writeSettings('domain', { enableModelFolders: false });

      const page = await signInAsAdminInNewContext(browser, request);
      // A superadmin lands in the admin console, where `/data` is the admin
      // page; the usage-mode filter lives on the user-scope Data page.
      await navigateTo(page, 'start');
      await navigateTo(page, 'data');
      await expect(page.getByRole('radio', { name: 'General' })).toBeVisible({
        timeout: 30_000,
      });
      await expect(page.getByRole('radio', { name: 'Models' })).toHaveCount(0);
      await page.context().close();
    });

    test('loginAttemptLimit from the public document blocks the login form after the limit', async ({
      page,
      request,
    }) => {
      await api.writeSettings('public', {
        loginAttemptLimit: 1,
        loginBlockTime: 600,
      });
      await enablePublicSlice(page, request, api.domainName);
      await openLoginPage(page);

      // A deliberately failing sign-in, so the shared helper does not apply.
      await page.getByLabel('Email or Username').fill(userInfo.admin.email);
      await page.getByLabel('Password').fill('e2e-wrong-password');
      const endpointInput = page.getByRole('textbox', {
        name: 'Endpoint',
        exact: true,
      });
      if (await endpointInput.isVisible().catch(() => false)) {
        await endpointInput.fill(webServerEndpoint);
      }
      const loginButton = page.getByRole('button', {
        name: 'Login',
        exact: true,
      });

      await loginButton.click();
      await expect(page.getByRole('alert').first()).toBeVisible({
        timeout: 30_000,
      });

      // The second attempt reaches the browser-side limit and sends nothing.
      await loginButton.click();
      await expect(
        page.getByText(
          'There were too many login attempts. Login attempts have been blocked for a while.',
        ),
      ).toBeVisible();
    });

    test('plugin paths from the public document load the login plugin and the page plugin', async ({
      page,
      request,
    }) => {
      await api.writeSettings('public', {
        pluginLogin: 'backend-ai-homepage-link',
        pluginPage: ['test-plugin'],
      });
      await page.route(pluginScript('backend-ai-homepage-link'), (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/javascript',
          body: readPluginFixture('backend-ai-homepage-link.js'),
        }),
      );
      await page.route(pluginScript('test-plugin'), (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/javascript',
          body: readPluginFixture('test-plugin.js'),
        }),
      );

      await enablePublicSlice(page, request, api.domainName);
      await openLoginPage(page);
      await expect(page.locator('.bai-homepage-link a')).toBeVisible();

      await signInAsAdmin(page, request);
      // The page plugin's menu item is in the user-scope sidebar; a
      // superadmin lands in the admin console.
      await navigateTo(page, 'start');
      await expect(
        page.getByRole('link', { name: 'Open Backend.AI' }),
      ).toBeVisible({ timeout: 30_000 });
    });
  },
);

// ===========================================================================
// 4. Cleanup contract
// ===========================================================================

test.describe(
  'System Settings - Cleanup',
  { tag: ['@regression', '@config', '@webui-settings', '@integration'] },
  () => {
    test('clearing the settings sub-key leaves the other sub-keys of both documents untouched', async () => {
      const publicBefore = await api.readRawDocument('public');
      const domainBefore = await api.readRawDocument('domain');

      await api.writeSettings('public', { ssoRealmName: 'e2e-cleanup' });
      await api.writeSettings('domain', { hideAgents: true });
      expect(await api.readSettings('public')).toEqual({
        ssoRealmName: 'e2e-cleanup',
      });
      expect(await api.readSettings('domain')).toEqual({ hideAgents: true });

      await api.clear();
      expect(await api.readSettings('public')).toBeUndefined();
      expect(await api.readSettings('domain')).toBeUndefined();
      expect(await api.readRawDocument('public')).toEqual(publicBefore);
      expect(await api.readRawDocument('domain')).toEqual(domainBefore);
    });
  },
);
