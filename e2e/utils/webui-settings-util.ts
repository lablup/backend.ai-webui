/**
 * Helpers for the System Settings page (`/admin/system-settings`) and the
 * `settings` app-config documents behind it (#10436).
 *
 * The page edits one flat `settings` sub-key in two documents:
 * `publicConfigByDomain.<domain>.settings` (PUBLIC scope, read anonymously
 * before sign-in) and `domainConfig.settings` (DOMAIN scope, read at sign-in).
 * A key no document carries keeps its code default (`getDefaultLoginConfig`);
 * `config.toml` no longer feeds these settings (#10664). Each row saves on
 * change and the write lands in the background (#10941): assert the stored
 * document with `WebUISettingsApi.expectSaved`. Settings are not on
 * `backendaiclient._config`; `effectiveValuesOf` derives what the app uses.
 *
 * Both documents are cluster-wide, so a spec that writes them must run its
 * tests sequentially and restore what it found (`WebUISettingsApi.snapshot`
 * / `restore`). Other sub-keys of the same documents (`appearance`, …) belong
 * to other features and are never touched: every write is a read-modify-write
 * of the `settings` sub-key alone, and inside it every key no row owns
 * (`settings.announcement`, #10713) is carried over as read.
 */
import { getDefaultLoginConfig } from '../../react/src/helper/loginConfig';
import {
  WEBUI_SETTING_DEFINITIONS,
  withWebUISettings,
} from '../../react/src/helper/webuiSettings';
import { createAccountApiContext, gqlAdmin } from './admin-api';
import {
  modifyConfigToml,
  navigateTo,
  seedStoredApiEndpoint,
  userInfo,
  webuiEndpoint,
  withRequestedSettings,
} from './test-util';
import {
  expect,
  type APIRequestContext,
  type Locator,
  type Page,
} from '@playwright/test';

export const WEBUI_SETTINGS_KEY = 'settings';

export type WebUISettingScope = 'public' | 'domain';
export type WebUISettingType = 'boolean' | 'number' | 'string' | 'stringList';
export type WebUISettingGroup =
  | 'login'
  | 'session'
  | 'appLauncher'
  | 'environments'
  | 'storage'
  | 'menu'
  | 'downloads'
  | 'account'
  | 'diagnostics'
  | 'plugins';

export interface WebUISettingRow {
  /** App-config key; also the `data-testid` suffix of the page row. */
  key: string;
  scope: WebUISettingScope;
  type: WebUISettingType;
  group: WebUISettingGroup;
  /** `[section, key]` the setting had in `config.toml`; the app no longer reads it there. */
  toml: [string, string];
}

const row = (
  key: string,
  scope: WebUISettingScope,
  type: WebUISettingType,
  group: WebUISettingGroup,
  toml: [string, string] = ['general', key],
): WebUISettingRow => ({ key, scope, type, group, toml });

const resources = (key: string): [string, string] => ['resources', key];

/**
 * Mirror of `WEBUI_SETTING_DEFINITIONS` (`react/src/helper/webuiSettings.ts`).
 * The page inventory test fails when the two drift apart.
 */
export const WEBUI_SETTING_ROWS: ReadonlyArray<WebUISettingRow> = [
  // Public scope — read before sign-in.
  row('autoLogout', 'public', 'boolean', 'login'),
  row('allowChangeSigninMode', 'public', 'boolean', 'login'),
  row('allowAnonymousChangePassword', 'public', 'boolean', 'login'),
  row('allowSignupWithoutConfirmation', 'public', 'boolean', 'login'),
  row('enableInteractiveLoginAccountSwitch', 'public', 'boolean', 'login'),
  row('singleSignOnVendors', 'public', 'stringList', 'login'),
  row('ssoRealmName', 'public', 'string', 'login'),
  row('debug', 'public', 'boolean', 'diagnostics'),
  row(
    'storageWarningThreshold',
    'domain',
    'number',
    'diagnostics',
    resources('storageWarningThreshold'),
  ),
  row('pluginLogin', 'public', 'string', 'plugins', ['plugin', 'login']),
  row('pluginPage', 'public', 'stringList', 'plugins', ['plugin', 'page']),

  // Domain scope — session launcher.
  row('defaultSessionEnvironment', 'domain', 'string', 'session'),
  row('allowManualImageNameForSession', 'domain', 'boolean', 'session'),
  row('allowCustomResourceAllocation', 'domain', 'boolean', 'session'),
  row('enableContainerCommit', 'domain', 'boolean', 'session'),
  row('maxCountForPreopenPorts', 'domain', 'number', 'session'),
  ...[
    'maxCPUCoresPerContainer',
    'maxMemoryPerContainer',
    'maxShmPerContainer',
    'maxCUDADevicesPerContainer',
    'maxCUDASharesPerContainer',
    'maxROCMDevicesPerContainer',
    'maxTPUDevicesPerContainer',
    'maxIPUDevicesPerContainer',
    'maxATOMDevicesPerContainer',
    'maxATOMPLUSDevicesPerContainer',
    'maxGaudi2DevicesPerContainer',
    'maxWarboyDevicesPerContainer',
    'maxRNGDDevicesPerContainer',
    'maxHyperaccelLPUDevicesPerContainer',
  ].map((key) => row(key, 'domain', 'number', 'session', resources(key))),
  row('showNonInstalledImages', 'domain', 'boolean', 'session', [
    'environments',
    'showNonInstalledImages',
  ]),

  // App launcher.
  row(
    'openPortToPublic',
    'domain',
    'boolean',
    'appLauncher',
    resources('openPortToPublic'),
  ),
  row(
    'allowPreferredPort',
    'domain',
    'boolean',
    'appLauncher',
    resources('allowPreferredPort'),
  ),
  row(
    'allowNonAuthTCP',
    'domain',
    'boolean',
    'appLauncher',
    resources('allowNonAuthTCP'),
  ),

  // Images.
  row('defaultImportEnvironment', 'domain', 'string', 'environments'),
  row('systemSSHImage', 'domain', 'string', 'environments'),
  row('defaultFileBrowserImage', 'domain', 'string', 'environments'),

  // Folders and uploads.
  row('isDirectorySizeVisible', 'domain', 'boolean', 'storage'),
  row('enableModelFolders', 'domain', 'boolean', 'storage'),
  row(
    'maxFileUploadSize',
    'domain',
    'number',
    'storage',
    resources('maxFileUploadSize'),
  ),

  // Sidebar.
  row('menuBlocklist', 'domain', 'stringList', 'menu', ['menu', 'blocklist']),
  row('menuInactivelist', 'domain', 'stringList', 'menu', [
    'menu',
    'inactivelist',
  ]),
  row('hideAgents', 'domain', 'boolean', 'menu'),
  row('enableReservoir', 'domain', 'boolean', 'menu'),
  row('fasttrackEndpoint', 'domain', 'string', 'menu', [
    'pipeline',
    'frontendEndpoint',
  ]),

  // Downloads.
  row('allowAppDownloadPanel', 'domain', 'boolean', 'downloads'),
  row('appDownloadUrl', 'domain', 'string', 'downloads'),
  row('allowCLIDownloadPanel', 'domain', 'boolean', 'downloads'),
  row('cliDownloadUrl', 'domain', 'string', 'downloads'),

  // Account.
  row('maskUserInfo', 'domain', 'boolean', 'account'),
  row('allowSignout', 'domain', 'boolean', 'account'),
  row('allowThemeMode', 'domain', 'boolean', 'account'),
  row('enableExtendLoginSession', 'domain', 'boolean', 'account'),
];

const ROW_KEYS = new Set(WEBUI_SETTING_ROWS.map((row) => row.key));

export const WEBUI_SETTING_GROUPS: ReadonlyArray<WebUISettingGroup> = [
  'login',
  'session',
  'appLauncher',
  'environments',
  'storage',
  'menu',
  'downloads',
  'account',
  'diagnostics',
  'plugins',
];

export const rowByKey = (key: string): WebUISettingRow => {
  const found = WEBUI_SETTING_ROWS.find((r) => r.key === key);
  if (!found) throw new Error(`Unknown WebUI setting key: ${key}`);
  return found;
};

export type SettingsDocument = Record<string, unknown>;

function definitionOf(setting: WebUISettingRow) {
  const definition = WEBUI_SETTING_DEFINITIONS.find(
    (d) => d.key === setting.key,
  );
  if (!definition) throw new Error(`Unknown WebUI setting key: ${setting.key}`);
  return definition;
}

/** The value a row falls back to when no document carries it: the app's code default. */
export function defaultValueOf(setting: WebUISettingRow): unknown {
  return getDefaultLoginConfig()[definitionOf(setting).field];
}

/**
 * The value a signed-in app uses for each row, keyed by setting key: the
 * domain value if valid, else the public value (public keys only), else the
 * code default. Built with the app's own `withWebUISettings`.
 */
export function effectiveValuesOf(
  snapshot: SettingsSnapshot,
  rows: ReadonlyArray<WebUISettingRow> = WEBUI_SETTING_ROWS,
): Record<string, unknown> {
  const state = withWebUISettings(
    getDefaultLoginConfig(),
    snapshot.public,
    snapshot.domain,
  );
  return Object.fromEntries(
    rows.map((setting) => [setting.key, state[definitionOf(setting).field]]),
  );
}

// ---------------------------------------------------------------------------
// App-config API
// ---------------------------------------------------------------------------

const FRAGMENTS_QUERY = `query ($scope: AppConfigScopeRef!, $names: [String!]!) {
  scopedAppConfigFragmentsByNames(scope: $scope, configNames: $names) {
    id
    configName
    config
  }
}`;

const UPSERT_MUTATION = `mutation ($input: ScopedUpsertAppConfigFragmentsInput!) {
  scopedUpsertAppConfigFragments(input: $input) {
    items { id configName }
    failed { configName message }
  }
}`;

export interface SettingsSnapshot {
  public: SettingsDocument | undefined;
  domain: SettingsDocument | undefined;
}

/**
 * Superadmin access to the two `settings` documents, through the webserver's
 * GraphQL proxy. Create one per spec file (`beforeAll`) and `dispose()` it.
 */
export class WebUISettingsApi {
  private constructor(
    private readonly api: APIRequestContext,
    /** Domain the admin account belongs to; keys the public slice. */
    readonly domainName: string,
    /** UUID of that domain; the DOMAIN scope id. */
    readonly domainId: string,
  ) {}

  /**
   * `domainName` picks the domain whose documents are read; it defaults to
   * the admin account's own domain.
   */
  static async create(
    options: { domainName?: string } = {},
  ): Promise<WebUISettingsApi> {
    const api = await createAccountApiContext(userInfo.admin, 'Admin');
    const user = await gqlAdmin<{
      user: { domain_name: string; role: string } | null;
    }>(
      api,
      `query ($email: String!) { user(email: $email) { domain_name role } }`,
      {
        email: userInfo.admin.email,
      },
    );
    const domainName = options.domainName || user.user?.domain_name;
    if (!domainName) {
      throw new Error(
        `Could not resolve the domain of ${userInfo.admin.email}`,
      );
    }
    if (user.user?.role !== 'superadmin') {
      throw new Error(
        `${userInfo.admin.email} is "${user.user?.role}", but the public settings need a superadmin`,
      );
    }
    const domain = await gqlAdmin<{ domainV2: { entityId: string } | null }>(
      api,
      `query ($name: String!) { domainV2(domainName: $name) { entityId } }`,
      { name: domainName },
    );
    if (!domain.domainV2?.entityId) {
      throw new Error(`domainV2("${domainName}") returned no entityId`);
    }
    return new WebUISettingsApi(api, domainName, domain.domainV2.entityId);
  }

  async dispose() {
    await this.api.dispose();
  }

  private scopeRef(scope: WebUISettingScope) {
    return scope === 'public'
      ? { scopeType: 'PUBLIC' }
      : { scopeType: 'DOMAIN', scopeId: this.domainId };
  }

  private configName(scope: WebUISettingScope) {
    return scope === 'public' ? 'publicConfigByDomain' : 'domainConfig';
  }

  /** Path of the `settings` sub-key inside the raw document of `scope`. */
  private settingsPath(scope: WebUISettingScope): string[] {
    return scope === 'public'
      ? [this.domainName, WEBUI_SETTINGS_KEY]
      : [WEBUI_SETTINGS_KEY];
  }

  /** The raw document written at `scope` (not the merged view). */
  async readRawDocument(
    scope: WebUISettingScope,
  ): Promise<Record<string, any>> {
    const data = await gqlAdmin<{
      scopedAppConfigFragmentsByNames: Array<{
        config: Record<string, any>;
      } | null>;
    }>(this.api, FRAGMENTS_QUERY, {
      scope: this.scopeRef(scope),
      names: [this.configName(scope)],
    });
    return data.scopedAppConfigFragmentsByNames?.[0]?.config ?? {};
  }

  /**
   * The saved settings of `scope` (the keys a row owns), or `undefined` when
   * none is saved.
   */
  async readSettings(
    scope: WebUISettingScope,
  ): Promise<SettingsDocument | undefined> {
    const doc = await this.readRawDocument(scope);
    const settings = getPath(doc, this.settingsPath(scope));
    if (!isPlainObject(settings)) return undefined;
    const rest = Object.fromEntries(
      Object.entries(settings).filter(([key]) => ROW_KEYS.has(key)),
    );
    return Object.keys(rest).length > 0
      ? (rest as SettingsDocument)
      : undefined;
  }

  /**
   * Replaces the row-owned keys of `scope` with `settings`; keys no row owns
   * (the announcement) and every other sub-key are written back as read.
   */
  async writeSettings(
    scope: WebUISettingScope,
    settings: SettingsDocument | undefined,
  ): Promise<void> {
    const doc = structuredClone(await this.readRawDocument(scope));
    const current = getPath(doc, this.settingsPath(scope));
    const foreign = isPlainObject(current)
      ? Object.fromEntries(
          Object.entries(current).filter(([key]) => !ROW_KEYS.has(key)),
        )
      : {};
    const merged = { ...foreign, ...(settings ?? {}) };
    const next = Object.keys(merged).length > 0 ? merged : undefined;
    setPath(doc, this.settingsPath(scope), next);
    const result = await gqlAdmin<{
      scopedUpsertAppConfigFragments: {
        failed: Array<{ configName: string; message: string }>;
      };
    }>(this.api, UPSERT_MUTATION, {
      input: {
        scope: this.scopeRef(scope),
        items: [{ configName: this.configName(scope), config: doc }],
      },
    });
    const failed = result.scopedUpsertAppConfigFragments.failed;
    if (failed.length > 0) {
      throw new Error(
        `scopedUpsertAppConfigFragments failed: ${failed
          .map((f) => `${f.configName}: ${f.message}`)
          .join('; ')}`,
      );
    }
  }

  async snapshot(): Promise<SettingsSnapshot> {
    return {
      public: await this.readSettings('public'),
      domain: await this.readSettings('domain'),
    };
  }

  /** The value a signed-in app of this domain uses for each of `rows`. */
  async readEffectiveValues(
    rows: ReadonlyArray<WebUISettingRow> = WEBUI_SETTING_ROWS,
  ): Promise<Record<string, unknown>> {
    return effectiveValuesOf(await this.snapshot(), rows);
  }

  /**
   * Waits until the row-owned keys saved at `scope` equal `expected`: the page
   * writes in the background after a change, so the document lands later.
   */
  async expectSaved(
    scope: WebUISettingScope,
    expected: SettingsDocument | undefined,
  ): Promise<void> {
    await expect
      .poll(() => this.readSettings(scope), {
        message: `saved ${scope} settings`,
        timeout: 15_000,
      })
      .toEqual(expected);
  }

  async restore(snapshot: SettingsSnapshot): Promise<void> {
    await this.writeSettings('public', snapshot.public);
    await this.writeSettings('domain', snapshot.domain);
  }

  /** Removes every row-owned key from both documents (file values only). */
  async clear(): Promise<void> {
    await this.writeSettings('public', undefined);
    await this.writeSettings('domain', undefined);
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

function getPath(obj: Record<string, any>, path: string[]): unknown {
  return path.reduce<any>(
    (acc, key) => (isPlainObject(acc) ? acc[key] : undefined),
    obj,
  );
}

function setPath(
  obj: Record<string, any>,
  path: string[],
  value: unknown,
): void {
  let cursor = obj;
  for (const key of path.slice(0, -1)) {
    if (!isPlainObject(cursor[key])) cursor[key] = {};
    cursor = cursor[key];
  }
  const last = path[path.length - 1];
  if (value === undefined) {
    delete cursor[last];
  } else {
    cursor[last] = value;
  }
}

// ---------------------------------------------------------------------------
// Pre-login (public slice) plumbing
// ---------------------------------------------------------------------------

/**
 * Makes the anonymous `publicConfigByDomain` read happen on this page: the
 * app resolves its target from `general.apiDomainName` plus `general.apiEndpoint`
 * or the stored endpoint. `login()` blanks `apiEndpoint`, so the stored one is
 * seeded too, and both pre-login and post-login flows reach the slice.
 */
export async function enablePublicSlice(
  page: Page,
  request: APIRequestContext,
  domainName: string,
) {
  await modifyConfigToml(page, request, {
    general: { connectionMode: 'SESSION', apiDomainName: domainName },
  });
  await seedStoredApiEndpoint(page);
}

/** Opens the login page and waits for the form. */
export async function openLoginPage(page: Page) {
  await page.goto(webuiEndpoint);
  await expect(page.getByLabel('Email or Username')).toBeVisible({
    timeout: 60_000,
  });
}

// ---------------------------------------------------------------------------
// Page helpers
// ---------------------------------------------------------------------------

export const WEBUI_SETTINGS_PATH = 'admin/system-settings';

/**
 * Marks the superadmin view-switch tour (`AdminViewSwitchTour`) as already
 * seen before the app loads. Its intro is a modal that intercepts every click
 * on the first admin page a fresh browser opens.
 */
export async function suppressAdminViewSwitchTour(page: Page) {
  await page.addInitScript(() => {
    for (const name of [
      'has_opened_tour_back_to_user_view',
      'has_opened_tour_back_to_admin_settings',
    ]) {
      localStorage.setItem(`backendaiwebui.settings.user.${name}`, 'true');
    }
  });
}

export async function openWebUISettings(page: Page) {
  await navigateTo(page, WEBUI_SETTINGS_PATH);
  // The Session launcher group is in every admin's view.
  await expect(settingGroup(page, 'session')).toBeVisible({ timeout: 30_000 });
}

export function settingGroup(page: Page, group: WebUISettingGroup): Locator {
  return page.getByTestId(`webui-settings-group-${group}`);
}

export function settingRow(page: Page, key: string): Locator {
  return page.getByTestId(`webui-setting-${key}`);
}

/** Every rendered setting row, for the inventory check. */
export function allSettingRows(page: Page): Locator {
  return page.locator(
    '[data-testid^="webui-setting-"]:not([data-testid$="-input"])',
  );
}

/** Key markers the `debug` setting adds next to every translated string. */
export function i18nKeyMarkers(page: Page): Locator {
  return page.locator('[data-i18n-key-anchor]');
}

/** The "Changed from default" dot a row shows while its value differs. */
export function changedMarker(rowLocator: Locator): Locator {
  return rowLocator.getByRole('img', { name: 'Changed from default' });
}

export function rowCheckbox(rowLocator: Locator): Locator {
  return rowLocator.getByRole('checkbox');
}

/** The text/number input of a string or number row. */
export function rowInput(rowLocator: Locator): Locator {
  // A plugin path row also renders the fixed `/dist/plugins` root as a
  // disabled textbox; only the editable input is the row's value.
  return rowLocator
    .getByRole('spinbutton')
    .or(rowLocator.getByRole('textbox', { disabled: false }));
}

/** Types `value` into an uncontrolled row input and commits it (Enter). */
export async function commitRowInput(rowLocator: Locator, value: string) {
  const input = rowInput(rowLocator);
  await input.fill(value);
  await input.press('Enter');
}

/** Hovers the row and presses its reset icon, then confirms the dialog. */
export async function resetRow(page: Page, rowLocator: Locator) {
  await rowLocator.hover();
  await rowLocator.getByRole('button', { name: 'Reset' }).click();
  const dialog = page
    .getByRole('dialog')
    .filter({ hasText: 'Do you want to reset your changes?' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(dialog).toBeHidden();
}

/**
 * The toolbar's Reset (every row). The per-row reset is an icon button named
 * through `aria-label`; the toolbar one carries visible text instead.
 */
export function toolbarResetButton(page: Page): Locator {
  return page
    .getByRole('button', { name: 'Reset', exact: true })
    .and(page.locator('button:not([aria-label])'));
}

/** Resolves once `backendaiclient` is connected (sign-in finished). */
export async function waitForClientReady(page: Page) {
  await expect
    .poll(
      () =>
        page.evaluate(
          () => (globalThis as any).backendaiclient?.ready === true,
        ),
      { timeout: 60_000 },
    )
    .toBe(true);
}

/**
 * The value of one setting for the account signed in on `page`, read from the
 * stored documents of that account's domain (see `effectiveValuesOf`). The
 * app keeps settings in a jotai atom, not on `backendaiclient`.
 */
export async function readEffectiveWebUISetting(
  page: Page,
  key: string,
): Promise<unknown> {
  await waitForClientReady(page);
  const domainName = await page.evaluate(
    () =>
      (globalThis as any).backendaiclient?._config?.domainName as
        string | undefined,
  );
  const api = await WebUISettingsApi.create({ domainName });
  try {
    const stored = await api.snapshot();
    // A spec's `modifyConfigToml` serves its own values over the stored ones.
    const served: SettingsSnapshot = {
      public: withRequestedSettings(page, 'public', stored.public),
      domain: withRequestedSettings(page, 'domain', stored.domain),
    };
    return effectiveValuesOf(served, [rowByKey(key)])[key];
  } finally {
    await api.dispose();
  }
}

/** The info alert at the top of the page about save-on-change. */
export function saveNotice(page: Page): Locator {
  return page.getByTestId('webui-settings-save-notice');
}

/** The error modal a failed background write opens. */
export function notSavedDialog(page: Page): Locator {
  return page
    .getByRole('alertdialog')
    .or(page.getByRole('dialog'))
    .filter({ hasText: 'Some System Settings were not saved' });
}

/** A value of the row's type that differs from `current`. */
export function differentValueFor(
  setting: WebUISettingRow,
  current: unknown,
): unknown {
  switch (setting.type) {
    case 'boolean':
      return !(current === true);
    case 'number':
      return typeof current === 'number' && Number.isFinite(current)
        ? current + 1
        : 7;
    case 'string':
      return `e2e-${setting.key}`;
    case 'stringList':
      // The SSO vendor list only keeps `saml` / `openid`.
      if (setting.key === 'singleSignOnVendors') {
        return Array.isArray(current) && current.includes('saml')
          ? ['openid']
          : ['saml'];
      }
      return [`e2e-${setting.key}`];
  }
}
