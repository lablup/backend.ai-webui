// E2E tests for the config.toml → app config migration and the System Settings
// page (#10436, #10677), which saves each row on change (#10941).
//
// Every test here writes the cluster-wide `settings` documents
// (`publicConfigByDomain.<domain>.settings`, `domainConfig.settings`), so the
// file runs its tests one after another in a single worker, clears the
// documents around each test, and restores whatever the deployment held
// before the run. Other specs that sign in while one of these tests holds an
// override see that override; keep the write→assert→clear window short.
import { SessionAPIHelper } from '../../utils/classes/session/SessionAPIHelper';
import {
  forbiddenPageHeading,
  getSideNavItem,
  loginAsAdmin,
  loginAsDomainAdmin,
  modifyConfigToml,
  notFoundPageHeading,
  navigateTo,
} from '../../utils/test-util';
import {
  allSettingRows,
  changedMarker,
  commitRowInput,
  differentValueFor,
  effectiveValuesOf,
  enablePublicSlice,
  notSavedDialog,
  openLoginPage,
  openWebUISettings,
  resetRow,
  rowByKey,
  rowCheckbox,
  rowInput,
  saveNotice,
  settingGroup,
  settingRow,
  suppressAdminViewSwitchTour,
  defaultValueOf,
  toolbarResetButton,
  waitForClientReady,
  WEBUI_SETTING_GROUPS,
  WEBUI_SETTING_ROWS,
  WebUISettingsApi,
  WEBUI_SETTINGS_PATH,
  i18nKeyMarkers,
  type SettingsDocument,
  type SettingsSnapshot,
} from '../../utils/webui-settings-util';
import {
  test,
  expect,
  request as apiRequest,
  type APIRequestContext,
  type Browser,
  type Page,
} from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Sequential on purpose: one cluster-wide document, see the file comment.
test.describe.configure({ mode: 'default' });

const DOMAIN_ROWS = WEBUI_SETTING_ROWS.filter((r) => r.scope === 'domain');

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

// Each test starts from the defaults only and leaves nothing behind.
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
    path.join(__dirname, '..', '..', 'common', 'plugin', filename),
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
    test('superadmin sees every group and every row with its code default', async ({
      page,
      request,
    }) => {
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

      await test.step('no row is marked as changed and each shows its default', async () => {
        for (const setting of WEBUI_SETTING_ROWS) {
          const row = settingRow(page, setting.key);
          await expect(changedMarker(row)).toHaveCount(0);
          const defaultValue = defaultValueOf(setting);
          if (defaultValue === undefined) continue;
          switch (setting.type) {
            case 'boolean':
              await expect(rowCheckbox(row)).toBeChecked({
                checked: defaultValue as boolean,
              });
              break;
            case 'number':
            case 'string':
              await expect(rowInput(row)).toHaveValue(String(defaultValue));
              break;
            case 'stringList':
              // Rendered per key (vendor checkboxes, plugin path rows, a
              // comma list); presence and the clean marker above are the
              // common contract.
              break;
          }
        }
      });

      await test.step('the save notice is shown and there is no Apply step', async () => {
        await expect(saveNotice(page)).toBeVisible();
        await expect(saveNotice(page)).toContainText(
          'Changes are saved as you make them and apply to every user.',
        );
        await expect(
          page.getByRole('button', { name: 'Apply', exact: true }),
        ).toHaveCount(0);
      });
    });

    test('domain admin cannot open System Settings', async ({
      page,
      request,
    }) => {
      await loginAsDomainAdmin(page, request);
      await navigateTo(page, WEBUI_SETTINGS_PATH);

      await expect(forbiddenPageHeading(page)).toBeVisible({
        timeout: 30_000,
      });
      await expect(getSideNavItem(page, 'System Settings')).toHaveCount(0);
      await expect(allSettingRows(page)).toHaveCount(0);
    });

    test('a checkbox row saves on change and its reset removes the saved key', async ({
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
      await api.expectSaved('domain', { hideAgents: !before });

      await resetRow(page, row);
      await expect(checkbox).toBeChecked({ checked: before });
      await expect(changedMarker(row)).toHaveCount(0);
      await api.expectSaved('domain', undefined);
    });

    test('a number row saves on commit and its reset removes the saved key', async ({
      page,
      request,
    }) => {
      await signInAsAdmin(page, request);
      await openWebUISettings(page);
      const row = settingRow(page, 'maxCPUCoresPerContainer');
      const before = await rowInput(row).inputValue();
      const next = Number(before) + 1;

      await commitRowInput(row, String(next));
      await expect(changedMarker(row)).toBeVisible();
      await api.expectSaved('domain', { maxCPUCoresPerContainer: next });

      await resetRow(page, row);
      await expect(rowInput(row)).toHaveValue(before);
      await expect(changedMarker(row)).toHaveCount(0);
      await api.expectSaved('domain', undefined);
    });

    test('the Reset button deletes both saved documents after a typed confirmation', async ({
      page,
      request,
    }) => {
      await signInAsAdmin(page, request);
      await openWebUISettings(page);
      const checkboxRow = settingRow(page, 'maskUserInfo');
      const textRow = settingRow(page, 'ssoRealmName');

      // Save one domain and one public value first, so the reset has
      // documents to delete.
      const maskBefore = await rowCheckbox(checkboxRow).isChecked();
      await rowCheckbox(checkboxRow).click();
      await commitRowInput(textRow, 'e2e-realm');
      await expect(changedMarker(checkboxRow)).toBeVisible();
      await expect(changedMarker(textRow)).toBeVisible();
      await api.expectSaved('domain', { maskUserInfo: !maskBefore });
      await api.expectSaved('public', { ssoRealmName: 'e2e-realm' });
      await page.evaluate(() => ((window as any).__e2eNoReload = true));

      await toolbarResetButton(page).click();
      const dialog = page.getByRole('dialog', {
        name: 'Reset all System Settings?',
      });
      await expect(dialog).toBeVisible();
      const confirm = dialog.getByRole('button', {
        name: 'Reset',
        exact: true,
      });
      await expect(confirm).toBeDisabled();
      await dialog.getByRole('textbox').fill('Reset');
      await expect(confirm).toBeEnabled();
      await confirm.click();
      await expect(dialog).toBeHidden();

      await expect(changedMarker(checkboxRow)).toHaveCount(0);
      await expect(changedMarker(textRow)).toHaveCount(0);
      await api.expectSaved('domain', undefined);
      await api.expectSaved('public', undefined);
      // Reset all no longer reloads the page.
      expect(await page.evaluate(() => (window as any).__e2eNoReload)).toBe(
        true,
      );
    });

    test('changes save only the changed keys, survive a reload, and resetting them removes the document', async ({
      page,
      request,
    }) => {
      const defaultHideAgents = defaultValueOf(
        rowByKey('hideAgents'),
      ) as boolean;
      const defaultMaxCpu = defaultValueOf(
        rowByKey('maxCPUCoresPerContainer'),
      ) as number;
      await signInAsAdmin(page, request);
      await openWebUISettings(page);

      const hideAgentsRow = settingRow(page, 'hideAgents');
      const maxCpuRow = settingRow(page, 'maxCPUCoresPerContainer');
      const nextMaxCpu = defaultMaxCpu + 3;

      await test.step('change two domain rows', async () => {
        await rowCheckbox(hideAgentsRow).click();
        await commitRowInput(maxCpuRow, String(nextMaxCpu));
      });

      await test.step('only the two changed keys are saved, in the domain document', async () => {
        await api.expectSaved('domain', {
          hideAgents: !defaultHideAgents,
          maxCPUCoresPerContainer: nextMaxCpu,
        });
        expect(await api.readSettings('public')).toBeUndefined();
        expect(
          effectiveValuesOf(await api.snapshot(), [
            rowByKey('hideAgents'),
            rowByKey('maxCPUCoresPerContainer'),
          ]),
        ).toEqual({
          hideAgents: !defaultHideAgents,
          maxCPUCoresPerContainer: nextMaxCpu,
        });
      });

      await test.step('a reloaded page shows the saved values', async () => {
        await page.reload();
        await expect(settingGroup(page, 'session')).toBeVisible({
          timeout: 30_000,
        });
        await expect(changedMarker(hideAgentsRow)).toBeVisible();
        await expect(rowCheckbox(hideAgentsRow)).toBeChecked({
          checked: !defaultHideAgents,
        });
        await expect(changedMarker(maxCpuRow)).toBeVisible();
        await expect(rowInput(maxCpuRow)).toHaveValue(String(nextMaxCpu));
      });

      await test.step('resetting both rows removes the document and the defaults return after a reload', async () => {
        await resetRow(page, hideAgentsRow);
        await resetRow(page, maxCpuRow);
        await api.expectSaved('domain', undefined);
        await page.reload();
        await expect(settingGroup(page, 'session')).toBeVisible({
          timeout: 30_000,
        });
        await expect(changedMarker(hideAgentsRow)).toHaveCount(0);
        await expect(changedMarker(maxCpuRow)).toHaveCount(0);
        await expect(rowCheckbox(hideAgentsRow)).toBeChecked({
          checked: defaultHideAgents,
        });
        await expect(rowInput(maxCpuRow)).toHaveValue(String(defaultMaxCpu));
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

      await expect(changedMarker(row)).toBeVisible();
      await expect(rowInput(row)).toHaveValue('e2e-realm');
      await api.expectSaved('public', { ssoRealmName: 'e2e-realm' });
      expect(await api.readSettings('domain')).toBeUndefined();
    });

    test('a change reaches the running app without a reload', async ({
      page,
      request,
    }) => {
      await signInAsAdmin(page, request);
      await openWebUISettings(page);
      await page.evaluate(() => ((window as any).__e2eNoReload = true));
      const downloadsItem = page.getByRole('menuitem', { name: 'Downloads' });
      const openUserMenu = async () => {
        await page.getByTestId('user-dropdown-button').click();
        await expect(
          page.getByRole('menuitem', { name: 'Log Out' }),
        ).toBeVisible();
      };

      // Both download panels are on by default.
      await openUserMenu();
      await expect(downloadsItem).toBeVisible();
      await page.keyboard.press('Escape');

      await rowCheckbox(settingRow(page, 'allowAppDownloadPanel')).click();
      await rowCheckbox(settingRow(page, 'allowCLIDownloadPanel')).click();
      await openUserMenu();
      await expect(downloadsItem).toHaveCount(0);
      await page.keyboard.press('Escape');

      await api.expectSaved('domain', {
        allowAppDownloadPanel: false,
        allowCLIDownloadPanel: false,
      });
      expect(await page.evaluate(() => (window as any).__e2eNoReload)).toBe(
        true,
      );
    });

    test('a failed save rolls the row back and names the setting', async ({
      page,
      request,
    }) => {
      await signInAsAdmin(page, request);
      await openWebUISettings(page);
      await page.route('**/admin/gql', async (route) => {
        if (
          (route.request().postData() ?? '').includes(
            'scopedAtomicBulkUpsertAppConfigFragments',
          )
        ) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: null,
              errors: [{ message: 'e2e-rejected' }],
            }),
          });
          return;
        }
        await route.fallback();
      });
      const row = settingRow(page, 'maskUserInfo');
      const checkbox = rowCheckbox(row);
      const before = await checkbox.isChecked();

      await checkbox.click();
      const dialog = notSavedDialog(page);
      await expect(dialog).toBeVisible({ timeout: 15_000 });
      await expect(dialog).toContainText('Mask user information');
      await expect(checkbox).toBeChecked({ checked: before });
      await expect(changedMarker(row)).toHaveCount(0);
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
    test('a value in the domain document overrides the default for every domain key', async ({
      browser,
      request,
    }) => {
      const override: SettingsDocument = Object.fromEntries(
        DOMAIN_ROWS.map((setting) => [
          setting.key,
          differentValueFor(setting, defaultValueOf(setting)),
        ]),
      );
      await api.writeSettings('domain', override);

      await test.step('the effective value of every domain key is the document value', async () => {
        const effective = effectiveValuesOf(await api.snapshot(), DOMAIN_ROWS);
        for (const setting of DOMAIN_ROWS) {
          expect(effective[setting.key], setting.key).toEqual(
            override[setting.key],
          );
        }
      });

      await test.step('a fresh sign-in shows every domain row with the document value', async () => {
        const page = await signInAsAdminInNewContext(browser, request);
        await openWebUISettings(page);
        for (const setting of DOMAIN_ROWS) {
          const row = settingRow(page, setting.key);
          await expect(changedMarker(row), setting.key).toBeVisible();
          const value = override[setting.key];
          if (setting.type === 'boolean') {
            await expect(rowCheckbox(row), setting.key).toBeChecked({
              checked: value as boolean,
            });
          } else if (setting.type === 'string') {
            await expect(rowInput(row), setting.key).toHaveValue(String(value));
          }
          // A number row may format its value with a unit; the marker above
          // is its contract.
        }
        await page.context().close();
      });
    });

    test('a wrong-typed value or an absent key keeps the default', async ({
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

      // Each value has the wrong type for its key; `ssoRealmName` is absent.
      await api.writeSettings('domain', {
        hideAgents: 'yes',
        maxCPUCoresPerContainer: '12',
        menuBlocklist: 'session',
        enableModelFolders: 1,
      });

      const effective = effectiveValuesOf(await api.snapshot(), rows);
      for (const setting of rows) {
        expect(effective[setting.key], setting.key).toEqual(
          defaultValueOf(setting),
        );
      }

      // The page falls back the same way: none of these rows is marked.
      const page = await signInAsAdminInNewContext(browser, request);
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
      // `maskUserInfo` is a domain key, `enableInteractiveLoginAccountSwitch`
      // a public one; each is written to the other scope's document with a
      // value that differs from its default (off and on).
      expect(defaultValueOf(rowByKey('maskUserInfo'))).toBe(false);
      expect(
        defaultValueOf(rowByKey('enableInteractiveLoginAccountSwitch')),
      ).toBe(true);
      await api.writeSettings('public', { maskUserInfo: true });
      await api.writeSettings('domain', {
        enableInteractiveLoginAccountSwitch: false,
      });

      expect(
        effectiveValuesOf(await api.snapshot(), [
          rowByKey('maskUserInfo'),
          rowByKey('enableInteractiveLoginAccountSwitch'),
        ]),
      ).toEqual({
        maskUserInfo: false,
        enableInteractiveLoginAccountSwitch: true,
      });

      const context = await browser.newContext();
      const page = await context.newPage();
      await enablePublicSlice(page, request, api.domainName);
      await signInAsAdmin(page, request);
      await navigateTo(
        page,
        'interactive-login?callback=https://example.com&name=Test',
      );
      await expect(
        page.getByText(/Would you like to sign in with/),
      ).toBeVisible({ timeout: 30_000 });
      await expect(
        page.getByText(/Would you like to sign in with \S{2}\*{3,}/),
      ).toHaveCount(0);
      await expect(
        page.getByRole('button', { name: 'Sign in with a different account' }),
      ).toBeVisible();
      await context.close();
    });

    test('a value in the public document overrides the default on the login page before sign-in', async ({
      page,
      request,
    }) => {
      const defaultSigninSwitch =
        (defaultValueOf(rowByKey('allowChangeSigninMode')) as
          boolean | undefined) ?? false;
      const defaultAnonymousPassword =
        (defaultValueOf(rowByKey('allowAnonymousChangePassword')) as
          boolean | undefined) ?? false;

      await api.writeSettings('public', {
        allowChangeSigninMode: !defaultSigninSwitch,
        allowAnonymousChangePassword: !defaultAnonymousPassword,
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
      if (defaultSigninSwitch) {
        await expect(signinSwitch).toBeHidden();
      } else {
        await expect(signinSwitch).toBeVisible();
      }
      if (defaultAnonymousPassword) {
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
      // `debug` turns on the i18n key markers next to every translated string.
      await expect(i18nKeyMarkers(page).first()).toBeVisible();
    });

    test('a key absent from the public document keeps the login page default', async ({
      page,
      request,
    }) => {
      const defaultSigninSwitch =
        (defaultValueOf(rowByKey('allowChangeSigninMode')) as
          boolean | undefined) ?? false;
      const defaultVendors =
        (defaultValueOf(rowByKey('singleSignOnVendors')) as
          Array<string> | undefined) ?? [];

      await api.writeSettings('public', { ssoRealmName: 'e2e-realm' });
      await enablePublicSlice(page, request, api.domainName);
      const publicSlice = page.waitForResponse(
        (response) =>
          response.url().includes('/func/v2/app-config/public/get') &&
          response.ok(),
      );
      await openLoginPage(page);

      // The public slice was read: it carries the one key written above.
      const payload = await (await publicSlice).json();
      const publicDoc = payload?.app_configs?.find(
        (entry: { config_name: string }) =>
          entry.config_name === 'publicConfigByDomain',
      )?.config;
      expect(publicDoc?.[api.domainName]?.settings?.ssoRealmName).toBe(
        'e2e-realm',
      );
      if (defaultVendors.includes('openid')) {
        await expect(
          page.getByRole('button', { name: 'Login with e2e-realm' }),
        ).toBeVisible();
      }

      const signinSwitch = page.getByRole('radiogroup', {
        name: 'Login',
        exact: true,
      });
      if (defaultSigninSwitch) {
        await expect(signinSwitch).toBeVisible();
      } else {
        await expect(signinSwitch).toBeHidden();
      }
      const samlButton = page.getByRole('button', { name: 'Login with SAML' });
      if (defaultVendors.includes('saml')) {
        await expect(samlButton).toBeVisible();
      } else {
        await expect(samlButton).toBeHidden();
      }
      const defaultDebug =
        (defaultValueOf(rowByKey('debug')) as boolean | undefined) ?? false;
      if (defaultDebug) {
        await expect(i18nKeyMarkers(page).first()).toBeVisible();
      } else {
        await expect(i18nKeyMarkers(page)).toHaveCount(0);
      }
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
      const hideAgents = !(defaultValueOf(rowByKey('hideAgents')) as boolean);
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

    test('menuBlocklist from the domain document hides a page from the sidebar and its route, but never System Settings', async ({
      browser,
      request,
    }) => {
      await api.writeSettings('domain', {
        menuBlocklist: ['information', 'system-settings'],
      });

      const page = await signInAsAdminInNewContext(browser, request);
      await navigateTo(page, 'admin/users');
      await expect(getSideNavItem(page, 'Users')).toBeVisible();
      await expect(getSideNavItem(page, 'Information')).toBeHidden();
      // The page that edits the list cannot be hidden by it.
      await expect(getSideNavItem(page, 'System Settings')).toBeVisible();
      await navigateTo(page, 'admin/information');
      await expect(notFoundPageHeading(page)).toBeVisible();
      await openWebUISettings(page);
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

// ===========================================================================
// 5. Effects, per page: one document carries every key the page reads, so
//    one sign-in verifies them all.
// ===========================================================================

const PYTHON_IMAGE = 'cr.backend.ai/multiarch/python:3.9-ubuntu20.04@x86_64';
const STABLE_IMAGE = 'cr.backend.ai/stable/python:3.9-ubuntu20.04@x86_64';

/** `formValues` of the session launcher URL the page navigated to. */
function launcherFormValues(page: Page): Record<string, any> {
  const raw = new URL(page.url()).searchParams.get('formValues');
  return raw ? JSON.parse(raw) : {};
}

test.describe(
  'System Settings - Effects per page',
  { tag: ['@regression', '@config', '@webui-settings', '@integration'] },
  () => {
    test('sidebar, header and Downloads keys from the domain document', async ({
      browser,
      request,
    }) => {
      await api.writeSettings('domain', {
        menuInactivelist: ['dashboard', 'system-settings'],
        enableReservoir: true,
        fasttrackEndpoint: 'https://example.com/fasttrack',
        allowSignout: true,
        enableExtendLoginSession: true,
        allowAppDownloadPanel: true,
        allowCLIDownloadPanel: true,
        cliDownloadUrl: '',
      });

      const page = await signInAsAdminInNewContext(browser, request);
      await navigateTo(page, 'start');
      await expect(getSideNavItem(page, 'Dashboard')).toBeDisabled();
      await expect(getSideNavItem(page, /FastTrack/)).toBeVisible();
      await expect(page.getByTestId('button-leave-service')).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Extend login session' }),
      ).toBeVisible();

      await page.getByTestId('user-dropdown-button').click();
      await page.getByRole('menuitem', { name: 'Downloads' }).click();
      const downloads = page.getByRole('dialog', { name: 'Downloads' });
      await expect(downloads).toBeVisible();
      await expect(
        downloads.getByRole('button', { name: 'Desktop App' }),
      ).toBeVisible();
      await downloads.getByRole('button', { name: 'CLI' }).click();
      await expect(downloads.getByText('Install via pip')).toBeVisible();
      // An empty CLI download URL hides the standalone-executable section.
      await expect(
        downloads.getByText('Download standalone executable'),
      ).toHaveCount(0);
      await page.keyboard.press('Escape');

      await navigateTo(page, 'admin/users');
      await expect(getSideNavItem(page, 'Reservoir')).toBeVisible();
      // menuInactivelist cannot disable the page that edits it.
      await expect(getSideNavItem(page, 'System Settings')).toBeEnabled();
      await page.context().close();
    });

    test('maskUserInfo and enableInteractiveLoginAccountSwitch on the interactive-login page', async ({
      browser,
      request,
    }) => {
      // `enableInteractiveLoginAccountSwitch` is public-scope and on by default,
      // so the document's `false` is a real override.
      await api.writeSettings('domain', { maskUserInfo: true });
      await api.writeSettings('public', {
        enableInteractiveLoginAccountSwitch: false,
      });

      const page = await (await browser.newContext()).newPage();
      await enablePublicSlice(page, request, api.domainName);
      await signInAsAdmin(page, request);
      await navigateTo(
        page,
        'interactive-login?callback=https://example.com&name=Test',
      );
      // The name is masked from its third character on.
      await expect(
        page.getByText(/Would you like to sign in with \S{2}\*{3,}/),
      ).toBeVisible({ timeout: 30_000 });
      await expect(
        page.getByRole('button', { name: 'Sign in with a different account' }),
      ).toHaveCount(0);
      await page.context().close();
    });

    test('allowThemeMode shows the theme family row in user settings', async ({
      browser,
      request,
    }) => {
      await api.writeSettings('domain', { allowThemeMode: true });

      const page = await signInAsAdminInNewContext(browser, request);
      await navigateTo(page, 'usersettings');
      await expect(page.getByTestId('items-theme-mode')).toBeVisible({
        timeout: 30_000,
      });
      await expect(page.getByTestId('items-theme-family')).toBeVisible();
      await page.context().close();
    });

    test('session launcher keys from the domain document', async ({
      browser,
      request,
    }) => {
      await api.writeSettings('domain', {
        allowManualImageNameForSession: true,
        allowCustomResourceAllocation: true,
        maxMemoryPerContainer: 2,
        maxCountForPreopenPorts: 1,
        defaultSessionEnvironment: STABLE_IMAGE,
        showNonInstalledImages: true,
      });

      const page = await signInAsAdminInNewContext(browser, request);
      const imageQuery = page.waitForRequest(
        (req) =>
          req.method() === 'POST' &&
          (req.postData() ?? '').includes(
            'ImageEnvironmentSelectFormItemsQuery',
          ),
      );
      await navigateTo(page, 'session/start?step=1');
      await expect(
        page.getByRole('button', { name: 'Resource Presets' }),
      ).toBeVisible({ timeout: 30_000 });

      await test.step('showNonInstalledImages drops the installed filter', async () => {
        const variables = (await imageQuery).postDataJSON().variables;
        expect(variables.installed ?? null).toBeNull();
      });
      await test.step('defaultSessionEnvironment prefills the environment', async () => {
        await expect
          .poll(() => launcherFormValues(page).environments?.version)
          .toBe(STABLE_IMAGE);
      });
      await test.step('allowManualImageNameForSession shows the manual image input', async () => {
        await expect(
          page.getByRole('textbox', { name: 'Image Name (Manual)' }),
        ).toBeVisible();
      });
      await test.step('allowCustomResourceAllocation offers custom allocation and maxMemoryPerContainer caps the memory slider', async () => {
        await page.getByRole('button', { name: 'Resource Presets' }).click();
        await expect(
          page.getByRole('option', { name: 'Custom allocation' }),
        ).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(
          page.getByRole('slider', { name: 'Amount' }),
        ).toHaveAttribute('aria-valuemax', '2');
      });
      await test.step('maxCountForPreopenPorts rejects a second port', async () => {
        await navigateTo(page, 'session/start?step=3');
        const ports = page.getByRole('combobox', { name: 'Preopen Ports' });
        await expect(ports).toBeVisible({ timeout: 30_000 });
        await ports.fill('3000');
        await ports.press('Enter');
        await ports.fill('3001');
        await ports.press('Enter');
        await expect(
          page.getByText('You can set up to 1 preopen port.'),
        ).toBeVisible();
      });
      await page.context().close();
    });

    test('allowCustomResourceAllocation off hides custom allocation and showNonInstalledImages off filters installed images', async ({
      browser,
      request,
    }) => {
      await api.writeSettings('domain', {
        allowCustomResourceAllocation: false,
        showNonInstalledImages: false,
      });

      const page = await signInAsAdminInNewContext(browser, request);
      const imageQuery = page.waitForRequest(
        (req) =>
          req.method() === 'POST' &&
          (req.postData() ?? '').includes(
            'ImageEnvironmentSelectFormItemsQuery',
          ),
      );
      await navigateTo(page, 'session/start?step=1');
      await expect(
        page.getByRole('button', { name: 'Resource Presets' }),
      ).toBeVisible({ timeout: 30_000 });
      expect((await imageQuery).postDataJSON().variables.installed).toBe(true);
      await page.getByRole('button', { name: 'Resource Presets' }).click();
      await expect(page.getByRole('option').first()).toBeVisible();
      await expect(
        page.getByRole('option', { name: 'Custom allocation' }),
      ).toHaveCount(0);
      await page.keyboard.press('Escape');
      await page.context().close();
    });

    test('folder explorer keys from the domain document', async ({
      browser,
      request,
    }) => {
      await api.writeSettings('domain', {
        isDirectorySizeVisible: true,
        maxFileUploadSize: 1,
        systemSSHImage: PYTHON_IMAGE,
        defaultFileBrowserImage: PYTHON_IMAGE,
        allowManualImageNameForSession: true,
      });

      const page = await signInAsAdminInNewContext(browser, request);
      const folderName = `e2e-settings-${Date.now().toString(36)}`;
      // Session creation is intercepted: only the request body matters here.
      await page.route('**/func/session', (route) =>
        route.request().method() === 'POST'
          ? route.fulfill({
              status: 400,
              contentType: 'application/json',
              body: '{"title":"e2e-intercepted"}',
            })
          : route.continue(),
      );
      const sessionPost = (type: string) =>
        page.waitForRequest(
          (req) =>
            req.method() === 'POST' &&
            req.url().endsWith('/func/session') &&
            req.postDataJSON()?.type === type,
        );
      let folderId: string | undefined;
      try {
        folderId = await page.evaluate(async (name) => {
          const client = (globalThis as any).backendaiclient;
          // The create call needs an explicit host; use the deployment's default.
          const { default: host } = await client.vfolder.list_hosts();
          // A team project's Data page lists only that project's folders.
          const projectId =
            typeof client.current_group_id === 'function'
              ? client.current_group_id()
              : client.current_group_id;
          const created = await client.vfolder.create(
            name,
            host,
            projectId,
            'general',
            'rw',
            false,
          );
          return created?.id as string;
        }, folderName);
        await navigateTo(page, 'start');
        await navigateTo(page, 'data');
        await page
          .getByRole('row', { name: new RegExp(folderName) })
          .getByText(folderName)
          .first()
          .click();
        const explorer = page
          .getByRole('dialog')
          .filter({ has: page.getByRole('heading', { name: folderName }) });
        await expect(explorer).toBeVisible({ timeout: 30_000 });

        await test.step('isDirectorySizeVisible shows a size for a directory row', async () => {
          await explorer.getByRole('button', { name: 'Create Folder' }).click();
          const dialog = page.getByRole('dialog', {
            name: 'Create a new folder',
          });
          await dialog
            .getByRole('textbox', { name: 'Folder Name' })
            .fill('subdir');
          await dialog
            .getByRole('button', { name: 'Create', exact: true })
            .click();
          const row = explorer.getByRole('row', { name: /subdir/ });
          await expect(row).toBeVisible({ timeout: 30_000 });
          await expect(row.getByRole('cell').nth(2)).toHaveText(/\d/);
        });

        await test.step('maxFileUploadSize rejects a larger file before any request', async () => {
          await page
            .locator('input[type=file]:not([webkitdirectory])')
            .first()
            .setInputFiles({
              name: 'e2e-two-bytes.txt',
              mimeType: 'text/plain',
              buffer: Buffer.from('ab'),
            });
          await expect(
            page
              .locator('[data-testid="bai-notification-stack"]')
              .getByText('File size exceeds upload size limit.'),
          ).toBeVisible();
        });

        await test.step('systemSSHImage is the image of the SFTP session request', async () => {
          const [req] = await Promise.all([
            sessionPost('system'),
            explorer.getByRole('button', { name: 'Run SFTP server' }).click(),
          ]);
          const body = req.postDataJSON();
          expect(`${body.lang}@${body.architecture}`).toBe(PYTHON_IMAGE);
          // The intercepted request fails; close its error dialog, not the explorer.
          const failure = page
            .getByRole('alertdialog')
            .or(page.getByRole('dialog'))
            .filter({ hasText: 'Failed to create SFTP session' });
          // The footer "Close" (text), not the header × (aria-label "Close").
          await failure
            .getByRole('button', { name: 'Close', exact: true })
            .and(page.locator('button:not([aria-label])'))
            .click();
          await expect(failure).toBeHidden();
          await expect(explorer).toBeVisible();
        });

        await test.step('defaultFileBrowserImage is the image of the file browser session request', async () => {
          const [req] = await Promise.all([
            sessionPost('interactive'),
            explorer
              .getByRole('button', { name: 'Execute filebrowser' })
              .click(),
          ]);
          const body = req.postDataJSON();
          expect(`${body.lang}@${body.architecture}`).toBe(PYTHON_IMAGE);
          await page.keyboard.press('Escape');
        });
      } finally {
        if (folderId) {
          await page
            .evaluate(
              (id) =>
                (globalThis as any).backendaiclient.vfolder.delete_by_id(id),
              folderId,
            )
            .catch(() => {
              /* the global cleanup sweeps e2e-* folders */
            });
        }
        await page.context().close();
      }
    });

    test('defaultImportEnvironment is the environment of an imported notebook', async ({
      browser,
      request,
    }) => {
      await api.writeSettings('domain', {
        defaultImportEnvironment: STABLE_IMAGE,
      });

      const page = await signInAsAdminInNewContext(browser, request);
      await navigateTo(page, 'start');
      await page.getByRole('button', { name: 'Start Now' }).last().click();
      const modal = page.getByRole('dialog', { name: 'Start From URL' });
      await expect(modal).toBeVisible();
      await modal
        .getByRole('textbox', { name: 'Notebook URL' })
        .fill('https://github.com/lablup/e2e/blob/main/notebook.ipynb');
      await modal.getByRole('button', { name: 'Start with options' }).click();
      await page.getByRole('menuitem', { name: 'Start with options' }).click();
      await expect(page).toHaveURL(/\/session\/start/);
      expect(launcherFormValues(page).environments?.version).toBe(STABLE_IMAGE);
      await page.context().close();
    });

    test('storageWarningThreshold from the domain document turns the diagnostics warning on', async ({
      browser,
      request,
    }) => {
      await api.writeSettings('domain', { storageWarningThreshold: 0 });

      const page = await signInAsAdminInNewContext(browser, request);
      await navigateTo(page, 'admin/diagnostics');
      await expect(page.getByText('Storage Volume High Usage')).toBeVisible({
        timeout: 60_000,
      });
      await page.context().close();
    });

    test('allowSignupWithoutConfirmation from the public document controls the invitation token field', async ({
      page,
      request,
    }) => {
      // Sign-up asks for an invitation token by default; the document turns
      // confirmation off, which removes the token field.
      await api.writeSettings('public', {
        allowSignupWithoutConfirmation: true,
      });
      await modifyConfigToml(page, request, {
        general: { signupSupport: true },
      });
      await enablePublicSlice(page, request, api.domainName);
      await openLoginPage(page);
      await page.getByText('Sign up', { exact: true }).click();
      const dialog = page.getByRole('dialog', {
        name: 'Sign up',
        exact: true,
      });
      await expect(dialog).toBeVisible();
      await expect(
        dialog.getByRole('textbox', { name: 'Invitation Token' }),
      ).toHaveCount(0);
    });
  },
);

// ===========================================================================
// 6. Keys read from a running session's actions and app launcher
// ===========================================================================

test.describe(
  'System Settings - Effects on a running session',
  { tag: ['@regression', '@config', '@webui-settings', '@integration'] },
  () => {
    const sessionName = `e2e-settings-session-${Date.now().toString(36)}`;
    let sessionRequest: APIRequestContext;

    test.beforeAll(async ({ browser }) => {
      test.setTimeout(300_000);
      sessionRequest = await apiRequest.newContext();
      const page = await signInAsAdminInNewContext(browser, sessionRequest);
      const helper = new SessionAPIHelper(page);
      await helper.create({ sessionType: 'interactive', sessionName });
      await helper.waitForStatus(sessionName, ['RUNNING'], 240_000);
      await page.context().close();
    });

    test.afterAll(async ({ browser }) => {
      const page = await signInAsAdminInNewContext(browser, sessionRequest);
      await new SessionAPIHelper(page).terminate(sessionName).catch(() => {});
      await page.context().close();
      await sessionRequest.dispose();
    });

    /** Opens the session's detail drawer and returns it. */
    async function openSessionDrawer(page: Page) {
      await navigateTo(page, 'session');
      const row = page.getByRole('row', { name: new RegExp(sessionName) });
      await expect(row).toBeVisible({ timeout: 30_000 });
      await row.getByText(sessionName).first().click();
      const drawer = page.getByRole('dialog').filter({
        has: page.getByRole('button', { name: 'Terminate Session' }),
      });
      await expect(drawer).toBeVisible({ timeout: 30_000 });
      return drawer;
    }

    for (const enabled of [true, false]) {
      test(`app launcher and commit controls follow the domain document (${enabled ? 'all on' : 'all off'})`, async ({
        browser,
        request,
      }) => {
        await api.writeSettings('domain', {
          openPortToPublic: enabled,
          allowPreferredPort: enabled,
          allowNonAuthTCP: enabled,
          enableContainerCommit: enabled,
        });

        const page = await signInAsAdminInNewContext(browser, request);
        const drawer = await openSessionDrawer(page);
        const commit = drawer.getByRole('button', {
          name: 'Request Container Commit',
        });
        await expect(commit).toHaveCount(enabled ? 1 : 0);

        await drawer.getByRole('button', { name: 'See App Dialog' }).click();
        const launcher = page.getByTestId('app-launcher-modal');
        await expect(launcher).toBeVisible({ timeout: 30_000 });
        await expect(
          launcher.getByRole('button', { name: 'Console' }),
        ).toBeVisible();
        const expectedCount = enabled ? 1 : 0;
        await expect(
          launcher.getByRole('checkbox', { name: 'Open app to public' }),
        ).toHaveCount(expectedCount);
        await expect(
          launcher.getByRole('checkbox', { name: 'Try preferred port' }),
        ).toHaveCount(expectedCount);
        // `allowNonAuthTCP` gates the sshd (SSH / SFTP) app tile.
        await expect(
          launcher.getByRole('button', { name: 'SSH / SFTP' }),
        ).toHaveCount(expectedCount);
        await page.context().close();
      });
    }
  },
);
