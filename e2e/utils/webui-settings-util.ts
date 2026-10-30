/**
 * Helpers for the System Settings page (`/admin/system-settings`) and the
 * `settings` app-config documents behind it (#10436).
 *
 * The page edits one flat `settings` sub-key in two documents:
 * `publicConfigByDomain.<domain>.settings` (PUBLIC scope, read anonymously
 * before sign-in) and `domainConfig.settings` (DOMAIN scope, read at sign-in).
 * `config.toml` stays the fallback for every key a document does not carry.
 *
 * Both documents are cluster-wide, so a spec that writes them must run its
 * tests sequentially and restore what it found (`WebUISettingsApi.snapshot`
 * / `restore`). Other sub-keys of the same documents (`appearance`,
 * `announcement`, …) belong to other features and are never touched: every
 * write is a read-modify-write of the `settings` sub-key alone.
 */
import { createAccountApiContext, gqlAdmin } from './admin-api';
import {
  fetchConfigToml,
  modifyConfigToml,
  navigateTo,
  seedStoredApiEndpoint,
  userInfo,
  webuiEndpoint,
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
  /** `[section, key]` in `config.toml`. */
  toml: [string, string];
  /**
   * Field on `globalThis.backendaiclient._config` after sign-in; `null` for
   * the pre-login keys the client never receives.
   */
  configField: string | null;
}

const row = (
  key: string,
  scope: WebUISettingScope,
  type: WebUISettingType,
  group: WebUISettingGroup,
  toml: [string, string] = ['general', key],
  configField: string | null = key,
): WebUISettingRow => ({ key, scope, type, group, toml, configField });

/**
 * Mirror of `WEBUI_SETTING_DEFINITIONS` (`react/src/helper/webuiSettings.ts`).
 * The page inventory test fails when the two drift apart.
 */
export const WEBUI_SETTING_ROWS: ReadonlyArray<WebUISettingRow> = [
  // Public scope — read before sign-in.
  row('autoLogout', 'public', 'boolean', 'login', undefined, null),
  row('allowChangeSigninMode', 'public', 'boolean', 'login', undefined, null),
  row(
    'allowAnonymousChangePassword',
    'public',
    'boolean',
    'login',
    undefined,
    null,
  ),
  row(
    'allowSignupWithoutConfirmation',
    'public',
    'boolean',
    'login',
    undefined,
    null,
  ),
  row('enableInteractiveLoginAccountSwitch', 'public', 'boolean', 'login'),
  row('singleSignOnVendors', 'public', 'stringList', 'login'),
  row('ssoRealmName', 'public', 'string', 'login'),
  row('debug', 'public', 'boolean', 'diagnostics', undefined, null),
  row('storageWarningThreshold', 'domain', 'number', 'diagnostics', [
    'resources',
    'storageWarningThreshold',
  ]),
  row('pluginLogin', 'public', 'string', 'plugins', ['plugin', 'login'], null),
  row(
    'pluginPage',
    'public',
    'stringList',
    'plugins',
    ['plugin', 'page'],
    'pluginPages',
  ),

  // Domain scope — session launcher.
  row(
    'defaultSessionEnvironment',
    'domain',
    'string',
    'session',
    undefined,
    'default_session_environment',
  ),
  row(
    'allowManualImageNameForSession',
    'domain',
    'boolean',
    'session',
    undefined,
    'allow_manual_image_name_for_session',
  ),
  row('allowCustomResourceAllocation', 'domain', 'boolean', 'session'),
  row('enableContainerCommit', 'domain', 'boolean', 'session'),
  row('maxCountForPreopenPorts', 'domain', 'number', 'session'),
  row('maxCPUCoresPerContainer', 'domain', 'number', 'session', [
    'resources',
    'maxCPUCoresPerContainer',
  ]),
  row('maxMemoryPerContainer', 'domain', 'number', 'session', [
    'resources',
    'maxMemoryPerContainer',
  ]),
  row('maxShmPerContainer', 'domain', 'number', 'session', [
    'resources',
    'maxShmPerContainer',
  ]),
  row('maxCUDADevicesPerContainer', 'domain', 'number', 'session', [
    'resources',
    'maxCUDADevicesPerContainer',
  ]),
  row('maxCUDASharesPerContainer', 'domain', 'number', 'session', [
    'resources',
    'maxCUDASharesPerContainer',
  ]),
  row('maxROCMDevicesPerContainer', 'domain', 'number', 'session', [
    'resources',
    'maxROCMDevicesPerContainer',
  ]),
  row('maxTPUDevicesPerContainer', 'domain', 'number', 'session', [
    'resources',
    'maxTPUDevicesPerContainer',
  ]),
  row('maxIPUDevicesPerContainer', 'domain', 'number', 'session', [
    'resources',
    'maxIPUDevicesPerContainer',
  ]),
  row('maxATOMDevicesPerContainer', 'domain', 'number', 'session', [
    'resources',
    'maxATOMDevicesPerContainer',
  ]),
  row('maxATOMPLUSDevicesPerContainer', 'domain', 'number', 'session', [
    'resources',
    'maxATOMPLUSDevicesPerContainer',
  ]),
  row('maxGaudi2DevicesPerContainer', 'domain', 'number', 'session', [
    'resources',
    'maxGaudi2DevicesPerContainer',
  ]),
  row('maxWarboyDevicesPerContainer', 'domain', 'number', 'session', [
    'resources',
    'maxWarboyDevicesPerContainer',
  ]),
  row('maxRNGDDevicesPerContainer', 'domain', 'number', 'session', [
    'resources',
    'maxRNGDDevicesPerContainer',
  ]),
  row('maxHyperaccelLPUDevicesPerContainer', 'domain', 'number', 'session', [
    'resources',
    'maxHyperaccelLPUDevicesPerContainer',
  ]),
  row('showNonInstalledImages', 'domain', 'boolean', 'session', [
    'environments',
    'showNonInstalledImages',
  ]),

  // App launcher.
  row('openPortToPublic', 'domain', 'boolean', 'appLauncher', [
    'resources',
    'openPortToPublic',
  ]),
  row('allowPreferredPort', 'domain', 'boolean', 'appLauncher', [
    'resources',
    'allowPreferredPort',
  ]),
  row('allowNonAuthTCP', 'domain', 'boolean', 'appLauncher', [
    'resources',
    'allowNonAuthTCP',
  ]),

  // Images.
  row(
    'defaultImportEnvironment',
    'domain',
    'string',
    'environments',
    undefined,
    'default_import_environment',
  ),
  row('systemSSHImage', 'domain', 'string', 'environments'),
  row('defaultFileBrowserImage', 'domain', 'string', 'environments'),

  // Folders and uploads.
  row('isDirectorySizeVisible', 'domain', 'boolean', 'storage'),
  row('enableModelFolders', 'domain', 'boolean', 'storage'),
  row('maxFileUploadSize', 'domain', 'number', 'storage', [
    'resources',
    'maxFileUploadSize',
  ]),

  // Sidebar.
  row(
    'menuBlocklist',
    'domain',
    'stringList',
    'menu',
    ['menu', 'blocklist'],
    'blockList',
  ),
  row(
    'menuInactivelist',
    'domain',
    'stringList',
    'menu',
    ['menu', 'inactivelist'],
    'inactiveList',
  ),
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
  row(
    'allowSignout',
    'domain',
    'boolean',
    'account',
    undefined,
    'allowSignout',
  ),
  row('allowThemeMode', 'domain', 'boolean', 'account'),
  row('enableExtendLoginSession', 'domain', 'boolean', 'account'),
];

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

/** Groups that hold only public keys; a domain admin does not see them. */
export const PUBLIC_ONLY_GROUPS: ReadonlyArray<WebUISettingGroup> =
  WEBUI_SETTING_GROUPS.filter((group) =>
    WEBUI_SETTING_ROWS.filter((r) => r.group === group).every(
      (r) => r.scope === 'public',
    ),
  );

export const rowByKey = (key: string): WebUISettingRow => {
  const found = WEBUI_SETTING_ROWS.find((r) => r.key === key);
  if (!found) throw new Error(`Unknown WebUI setting key: ${key}`);
  return found;
};

export type SettingsDocument = Record<string, unknown>;

/**
 * The value `config.toml` holds for a row, normalized to the row's type the
 * way `refreshConfigFromToml` does (comma lists become arrays). `undefined`
 * when the file does not set the key — the app then uses its built-in default.
 */
export function tomlValueOf(
  config: Record<string, any> | undefined,
  setting: WebUISettingRow,
): unknown {
  const raw = config?.[setting.toml[0]]?.[setting.toml[1]];
  // An empty string counts as unset too: the app then falls back to its
  // built-in default (`defaultImportEnvironment` has a non-empty one).
  if (raw === undefined || raw === null || raw === '') return undefined;
  switch (setting.type) {
    case 'boolean':
      return typeof raw === 'boolean' ? raw : String(raw) === 'true';
    case 'number': {
      const n = Number(raw);
      return Number.isFinite(n) ? n : undefined;
    }
    case 'string':
      return String(raw);
    case 'stringList':
      return String(raw)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
  }
}

/** The config.toml of the WebUI under test, fetched once per call. */
export async function readConfigToml(page: Page): Promise<Record<string, any>> {
  const config = await fetchConfigToml(page);
  if (!config) {
    throw new Error(`config.toml could not be fetched from ${webuiEndpoint}`);
  }
  return config;
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

  static async create(): Promise<WebUISettingsApi> {
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
    const domainName = user.user?.domain_name;
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

  /** The saved `settings` document of `scope`, or `undefined` when absent. */
  async readSettings(
    scope: WebUISettingScope,
  ): Promise<SettingsDocument | undefined> {
    const doc = await this.readRawDocument(scope);
    const settings = getPath(doc, this.settingsPath(scope));
    return isPlainObject(settings) ? (settings as SettingsDocument) : undefined;
  }

  /**
   * Replaces the `settings` sub-key of `scope` with `settings`; `undefined`
   * removes it. Every other sub-key of the document is written back as read.
   */
  async writeSettings(
    scope: WebUISettingScope,
    settings: SettingsDocument | undefined,
  ): Promise<void> {
    const doc = structuredClone(await this.readRawDocument(scope));
    setPath(doc, this.settingsPath(scope), settings);
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

  async restore(snapshot: SettingsSnapshot): Promise<void> {
    await this.writeSettings('public', snapshot.public);
    await this.writeSettings('domain', snapshot.domain);
  }

  /** Removes the `settings` sub-key from both documents (file values only). */
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
  return page.locator('[data-testid^="webui-setting-"]');
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
  return rowLocator.getByRole('spinbutton').or(rowLocator.getByRole('textbox'));
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

export function applyButton(page: Page): Locator {
  return page.getByRole('button', { name: 'Apply', exact: true });
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

/**
 * Presses Apply, confirms, and waits for the reload the page performs plus
 * the client re-connect that follows it.
 */
export async function applyWebUISettings(page: Page) {
  await applyButton(page).click();
  const dialog = page
    .getByRole('dialog')
    .filter({ hasText: 'Apply System Settings' });
  await expect(dialog).toBeVisible();
  await Promise.all([
    page.waitForEvent('load'),
    dialog.getByRole('button', { name: 'Apply', exact: true }).click(),
  ]);
  await waitForClientReady(page);
  await expect(settingGroup(page, 'session')).toBeVisible({ timeout: 30_000 });
}

/** Resolves once `backendaiclient` has finished applying the login config. */
export async function waitForClientReady(page: Page) {
  await expect
    .poll(
      () =>
        page.evaluate(
          () =>
            (globalThis as any).backendaiclient?.ready === true &&
            (globalThis as any).backendaiclient?._config !== undefined,
        ),
      { timeout: 60_000 },
    )
    .toBe(true);
}

/** `backendaiclient._config[field]` as the signed-in app holds it. */
export async function readClientConfig(
  page: Page,
  field: string,
): Promise<unknown> {
  return page.evaluate(
    (f) => (globalThis as any).backendaiclient._config[f],
    field,
  );
}

/** `_config` for every row that has a client field, keyed by setting key. */
export async function readClientConfigForRows(
  page: Page,
  rows: ReadonlyArray<WebUISettingRow>,
): Promise<Record<string, unknown>> {
  await waitForClientReady(page);
  const fields = rows
    .filter((r) => r.configField !== null)
    .map((r) => [r.key, r.configField as string]);
  return page.evaluate((pairs) => {
    const cfg = (globalThis as any).backendaiclient._config;
    return Object.fromEntries(pairs.map(([key, field]) => [key, cfg[field]]));
  }, fields);
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
