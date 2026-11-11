/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { LoginConfigState } from './loginConfig';
import * as _ from 'lodash-es';

/**
 * The flat `settings` document served through app config (#10436). The same
 * sub-key lives in `publicConfigByDomain.<domain>` (keys the login page needs
 * before sign-in) and in `domainConfig` (everything else). Key names are the
 * former `config.toml` names; a key no document carries keeps its code default
 * (`getDefaultLoginConfig`).
 */
export const WEBUI_SETTINGS_CONFIG_KEY = 'settings';
/** `WebUISettingsPage`'s `?tab=` default; kept a literal there for the search-index extractor. */
export const WEBUI_SETTINGS_DEFAULT_TAB = 'settings';

export type WebUISettingScope = 'public' | 'domain';
export type WebUISettingType = 'boolean' | 'number' | 'string' | 'stringList';

/** Display grouping for the admin page only; the stored document is flat. */
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

export interface WebUISettingDefinition {
  /** App-config key, equal to the `config.toml` key unless noted. */
  key: string;
  scope: WebUISettingScope;
  type: WebUISettingType;
  group: WebUISettingGroup;
  /** The `LoginConfigState` field the key overrides. */
  field: keyof LoginConfigState;
  /** For a `stringList`: the only values the WebUI acts on; others are dropped. */
  options?: ReadonlyArray<{ value: string; label: string }>;
  /** For a `number`: the unit shown after the input. */
  unit?: string;
  /** For a `number`: the valid range, inclusive; a value outside it is ignored. */
  min?: number;
  max?: number;
}

/** The SSO vendors the login form renders a button for. */
export const SSO_VENDOR_OPTIONS: ReadonlyArray<{
  value: string;
  label: string;
}> = [
  { value: 'saml', label: 'SAML' },
  { value: 'openid', label: 'OpenID' },
];

const def = (
  key: string,
  scope: WebUISettingScope,
  type: WebUISettingType,
  group: WebUISettingGroup,
  field: keyof LoginConfigState = key as keyof LoginConfigState,
): WebUISettingDefinition => ({ key, scope, type, group, field });

export const WEBUI_SETTING_DEFINITIONS: ReadonlyArray<WebUISettingDefinition> =
  [
    // Read anonymously before login (publicConfigByDomain).
    def('autoLogout', 'public', 'boolean', 'login'),
    def(
      'allowChangeSigninMode',
      'public',
      'boolean',
      'login',
      'change_signin_support',
    ),
    def('allowAnonymousChangePassword', 'public', 'boolean', 'login'),
    def('allowSignupWithoutConfirmation', 'public', 'boolean', 'login'),
    def('enableInteractiveLoginAccountSwitch', 'public', 'boolean', 'login'),
    {
      ...def('singleSignOnVendors', 'public', 'stringList', 'login'),
      options: SSO_VENDOR_OPTIONS,
    },
    def('ssoRealmName', 'public', 'string', 'login'),
    // Also anonymous: the diagnostics surfaces run on the login page too.
    def('debug', 'public', 'boolean', 'diagnostics'),
    {
      ...def('storageWarningThreshold', 'domain', 'number', 'diagnostics'),
      min: 0,
      max: 100,
      unit: '%',
    },
    // Plugin scripts are loaded at bootstrap, before sign-in, so both keys
    // are anonymous too.
    def('pluginLogin', 'public', 'string', 'plugins', 'loginPlugin'),
    def('pluginPage', 'public', 'stringList', 'plugins', 'pluginPages'),

    // Session launcher.
    def(
      'defaultSessionEnvironment',
      'domain',
      'string',
      'session',
      'default_session_environment',
    ),
    def(
      'allowManualImageNameForSession',
      'domain',
      'boolean',
      'session',
      'allow_manual_image_name_for_session',
    ),
    def('allowCustomResourceAllocation', 'domain', 'boolean', 'session'),
    def('enableContainerCommit', 'domain', 'boolean', 'session'),
    {
      ...def('maxCountForPreopenPorts', 'domain', 'number', 'session'),
      min: 0,
      max: 100,
    },
    {
      ...def('maxCPUCoresPerContainer', 'domain', 'number', 'session'),
      min: 1,
      max: 8192,
    },
    {
      ...def('maxMemoryPerContainer', 'domain', 'number', 'session'),
      min: 1,
      max: 16384,
      unit: 'GiB',
    },
    {
      ...def('maxShmPerContainer', 'domain', 'number', 'session'),
      min: 0,
      max: 16384,
      unit: 'GiB',
    },
    {
      ...def('maxCUDADevicesPerContainer', 'domain', 'number', 'session'),
      min: 0,
      max: 64,
    },
    {
      ...def('maxCUDASharesPerContainer', 'domain', 'number', 'session'),
      min: 0,
      max: 64,
    },
    {
      ...def('maxROCMDevicesPerContainer', 'domain', 'number', 'session'),
      min: 0,
      max: 64,
    },
    {
      ...def('maxTPUDevicesPerContainer', 'domain', 'number', 'session'),
      min: 0,
      max: 64,
    },
    {
      ...def('maxIPUDevicesPerContainer', 'domain', 'number', 'session'),
      min: 0,
      max: 64,
    },
    {
      ...def('maxATOMDevicesPerContainer', 'domain', 'number', 'session'),
      min: 0,
      max: 64,
    },
    {
      ...def('maxATOMPLUSDevicesPerContainer', 'domain', 'number', 'session'),
      min: 0,
      max: 64,
    },
    {
      ...def('maxGaudi2DevicesPerContainer', 'domain', 'number', 'session'),
      min: 0,
      max: 64,
    },
    {
      ...def('maxWarboyDevicesPerContainer', 'domain', 'number', 'session'),
      min: 0,
      max: 64,
    },
    {
      ...def('maxRNGDDevicesPerContainer', 'domain', 'number', 'session'),
      min: 0,
      max: 64,
    },
    {
      ...def(
        'maxHyperaccelLPUDevicesPerContainer',
        'domain',
        'number',
        'session',
      ),
      min: 0,
      max: 64,
    },
    def('showNonInstalledImages', 'domain', 'boolean', 'session'),

    // App launcher.
    def('openPortToPublic', 'domain', 'boolean', 'appLauncher'),
    def('allowPreferredPort', 'domain', 'boolean', 'appLauncher'),
    def('allowNonAuthTCP', 'domain', 'boolean', 'appLauncher'),

    // Images.
    def(
      'defaultImportEnvironment',
      'domain',
      'string',
      'environments',
      'default_import_environment',
    ),
    def('systemSSHImage', 'domain', 'string', 'environments'),
    def('defaultFileBrowserImage', 'domain', 'string', 'environments'),

    // Folders and uploads.
    def('isDirectorySizeVisible', 'domain', 'boolean', 'storage'),
    def('enableModelFolders', 'domain', 'boolean', 'storage'),
    {
      ...def('maxFileUploadSize', 'domain', 'number', 'storage'),
      min: -1,
      max: 107374182400,
      unit: 'Bytes',
    },

    // Sidebar.
    def('menuBlocklist', 'domain', 'stringList', 'menu', 'blockList'),
    def('menuInactivelist', 'domain', 'stringList', 'menu', 'inactiveList'),
    def('hideAgents', 'domain', 'boolean', 'menu'),
    def('enableReservoir', 'domain', 'boolean', 'menu'),
    def('fasttrackEndpoint', 'domain', 'string', 'menu'),

    // Downloads.
    def('allowAppDownloadPanel', 'domain', 'boolean', 'downloads'),
    def('appDownloadUrl', 'domain', 'string', 'downloads'),
    def('allowCLIDownloadPanel', 'domain', 'boolean', 'downloads'),
    def('cliDownloadUrl', 'domain', 'string', 'downloads'),

    // Account.
    def('maskUserInfo', 'domain', 'boolean', 'account'),
    def('allowSignout', 'domain', 'boolean', 'account', 'allow_signout'),
    def('allowThemeMode', 'domain', 'boolean', 'account'),
    def('enableExtendLoginSession', 'domain', 'boolean', 'account'),
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

export type WebUISettingsDocument = Record<string, unknown>;

/** A list value with only the entries the definition's `options` allow. */
export const restrictToOptions = (
  definition: WebUISettingDefinition,
  value: unknown,
): unknown =>
  definition.options && Array.isArray(value)
    ? value.filter((v) => definition.options!.some((o) => o.value === v))
    : value;

/** The value has the definition's type and, for a number, lies in its range. */
export const isValidWebUISetting = (
  definition: WebUISettingDefinition,
  value: unknown,
): boolean =>
  isValidWebUISettingValue(definition.type, value) &&
  (definition.type !== 'number' ||
    ((definition.min === undefined || (value as number) >= definition.min) &&
      (definition.max === undefined || (value as number) <= definition.max)));

export const isValidWebUISettingValue = (
  type: WebUISettingType,
  value: unknown,
): boolean => {
  switch (type) {
    case 'boolean':
      return typeof value === 'boolean';
    case 'number':
      return typeof value === 'number' && Number.isFinite(value);
    case 'string':
      return typeof value === 'string';
    case 'stringList':
      return Array.isArray(value) && value.every((v) => typeof v === 'string');
  }
};

/**
 * `state` with every key of `scope` that `doc` carries with a value of the
 * right type overridden. Anything else, including a whole missing document,
 * keeps the value `state` already holds.
 */
export const applyWebUISettings = (
  state: LoginConfigState,
  doc: unknown,
  scope: WebUISettingScope,
): LoginConfigState => {
  if (!_.isPlainObject(doc)) {
    return state;
  }
  const settings = doc as WebUISettingsDocument;
  const next = { ...state };
  for (const definition of WEBUI_SETTING_DEFINITIONS) {
    const { key, field, scope: defScope } = definition;
    if (defScope !== scope || !(key in settings)) continue;
    const value = restrictToOptions(definition, settings[key]);
    if (isValidWebUISetting(definition, value)) {
      (next as Record<string, unknown>)[field] = value;
    }
  }
  return next;
};

/** The value of one setting as `state` holds it. */
export const readWebUISettingFromState = (
  state: LoginConfigState,
  definition: WebUISettingDefinition,
): unknown => state[definition.field];

/**
 * The document to save for `scope`: every key the draft holds with a valid
 * value, a default included. `undefined` when it holds none, which removes the
 * sub-key; a key left out follows the code default.
 */
export const buildWebUISettingsDocument = (
  scope: WebUISettingScope,
  draft: WebUISettingsDocument,
): WebUISettingsDocument | undefined => {
  const doc: WebUISettingsDocument = {};
  for (const definition of WEBUI_SETTING_DEFINITIONS) {
    if (definition.scope !== scope || !(definition.key in draft)) continue;
    const value = restrictToOptions(definition, draft[definition.key]);
    if (isValidWebUISetting(definition, value)) {
      doc[definition.key] = value;
    }
  }
  return _.isEmpty(doc) ? undefined : doc;
};

const OWNED_WEBUI_SETTING_KEYS = new Set(
  WEBUI_SETTING_DEFINITIONS.map((d) => d.key),
);

/** The keys of `settings` that a definition owns. */
export const ownedWebUISettings = (
  settings: WebUISettingsDocument,
): WebUISettingsDocument =>
  _.pickBy(settings, (_v, key) => OWNED_WEBUI_SETTING_KEYS.has(key));

/**
 * `doc` plus every key of the stored `current` document that no definition
 * owns (the announcement, #10713), so replacing the `settings` sub-key keeps
 * them. `undefined` when nothing is left.
 */
export const withForeignWebUISettings = (
  current: unknown,
  doc: WebUISettingsDocument | undefined,
): WebUISettingsDocument | undefined => {
  const foreign = _.isPlainObject(current)
    ? _.pickBy(
        current as WebUISettingsDocument,
        (_v, key) => !OWNED_WEBUI_SETTING_KEYS.has(key),
      )
    : {};
  const next = { ...foreign, ...doc };
  return _.isEmpty(next) ? undefined : next;
};

/**
 * The `settings` sub-key of the `domainConfig` row among `myAppConfigs`;
 * `undefined` when there is no document or the read failed.
 */
export const readDomainWebUISettings = (
  configs:
    | ReadonlyArray<{ configName: string; config: unknown } | null>
    | null
    | undefined,
): WebUISettingsDocument | undefined => {
  const doc = _.find(
    configs,
    (row) => row?.configName === 'domainConfig',
  )?.config;
  const settings: unknown = (doc as Record<string, unknown> | undefined)?.[
    WEBUI_SETTINGS_CONFIG_KEY
  ];
  return _.isPlainObject(settings)
    ? (settings as WebUISettingsDocument)
    : undefined;
};

export const findWebUISettingDefinition = (
  key: string,
): WebUISettingDefinition | undefined =>
  _.find(WEBUI_SETTING_DEFINITIONS, (d) => d.key === key);

/** The i18n key of a setting's row title on System Settings (`WebUISettingLabels.ts`). */
export const webuiSettingLabelKey = (key: string): string =>
  `webuiSettings.${_.upperFirst(key)}`;

/** The i18n key of a System Settings group heading. */
export const webuiSettingGroupLabelKey = (group: WebUISettingGroup): string =>
  `webuiSettings.group.${_.upperFirst(group)}`;
