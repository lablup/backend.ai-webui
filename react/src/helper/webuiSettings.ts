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
 * `config.toml` names; the file stays the fallback for any key a document does
 * not carry.
 */
export const WEBUI_SETTINGS_CONFIG_KEY = 'settings';

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
  | 'diagnostics';

export interface WebUISettingDefinition {
  /** App-config key, equal to the `config.toml` key unless noted. */
  key: string;
  scope: WebUISettingScope;
  type: WebUISettingType;
  group: WebUISettingGroup;
  /** The `LoginConfigState` field the key overrides. */
  field: keyof LoginConfigState;
}

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
    def('singleSignOnVendors', 'public', 'stringList', 'login'),
    def('ssoRealmName', 'public', 'string', 'login'),
    // Also anonymous: the diagnostics surfaces run on the login page too.
    def('debug', 'public', 'boolean', 'diagnostics'),

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
    def('maxCountForPreopenPorts', 'domain', 'number', 'session'),
    def('maxCPUCoresPerContainer', 'domain', 'number', 'session'),
    def('maxMemoryPerContainer', 'domain', 'number', 'session'),
    def('maxShmPerContainer', 'domain', 'number', 'session'),
    def('maxCUDADevicesPerContainer', 'domain', 'number', 'session'),
    def('maxCUDASharesPerContainer', 'domain', 'number', 'session'),
    def('maxROCMDevicesPerContainer', 'domain', 'number', 'session'),
    def('maxTPUDevicesPerContainer', 'domain', 'number', 'session'),
    def('maxIPUDevicesPerContainer', 'domain', 'number', 'session'),
    def('maxATOMDevicesPerContainer', 'domain', 'number', 'session'),
    def('maxATOMPLUSDevicesPerContainer', 'domain', 'number', 'session'),
    def('maxGaudi2DevicesPerContainer', 'domain', 'number', 'session'),
    def('maxWarboyDevicesPerContainer', 'domain', 'number', 'session'),
    def('maxRNGDDevicesPerContainer', 'domain', 'number', 'session'),
    def('maxHyperaccelLPUDevicesPerContainer', 'domain', 'number', 'session'),

    // App launcher.
    def('openPortToPublic', 'domain', 'boolean', 'appLauncher'),
    def('allowPreferredPort', 'domain', 'boolean', 'appLauncher'),
    def('allowNonAuthTCP', 'domain', 'boolean', 'appLauncher'),
    def('eduAppNamePrefix', 'domain', 'string', 'appLauncher'),

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
    def('showNonInstalledImages', 'domain', 'boolean', 'environments'),

    // Folders and uploads.
    def('isDirectorySizeVisible', 'domain', 'boolean', 'storage'),
    def('enableModelFolders', 'domain', 'boolean', 'storage'),
    def('maxFileUploadSize', 'domain', 'number', 'storage'),
    def('storageWarningThreshold', 'domain', 'number', 'storage'),

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
];

export type WebUISettingsDocument = Record<string, unknown>;

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
 * keeps the `config.toml`-derived value.
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
  for (const {
    key,
    type,
    field,
    scope: defScope,
  } of WEBUI_SETTING_DEFINITIONS) {
    if (defScope !== scope || !(key in settings)) continue;
    const value = settings[key];
    if (isValidWebUISettingValue(type, value)) {
      (next as Record<string, unknown>)[field] = value;
    }
  }
  return next;
};

/** The value of one setting as the file-derived state holds it. */
export const readWebUISettingFromState = (
  state: LoginConfigState,
  definition: WebUISettingDefinition,
): unknown => state[definition.field];

/**
 * The document to save for `scope`: only the keys whose draft differs from
 * the file value, so an untouched key keeps following `config.toml`.
 * `undefined` when nothing differs, which removes the sub-key.
 */
export const buildWebUISettingsDocument = (
  scope: WebUISettingScope,
  draft: WebUISettingsDocument,
  fileState: LoginConfigState,
): WebUISettingsDocument | undefined => {
  const doc: WebUISettingsDocument = {};
  for (const definition of WEBUI_SETTING_DEFINITIONS) {
    if (definition.scope !== scope || !(definition.key in draft)) continue;
    const value = draft[definition.key];
    if (
      isValidWebUISettingValue(definition.type, value) &&
      !_.isEqual(value, readWebUISettingFromState(fileState, definition))
    ) {
      doc[definition.key] = value;
    }
  }
  return _.isEmpty(doc) ? undefined : doc;
};

/**
 * The signed-in domain's `domainConfig.settings` through the plain client,
 * for the login path that runs outside `RelayEnvironmentProvider`.
 * `undefined` when the manager has no document or the read fails.
 */
export const fetchDomainWebUISettings = async (client: {
  query: (q: string, v: Record<string, unknown>) => Promise<any>;
}): Promise<WebUISettingsDocument | undefined> => {
  try {
    const result = await client.query(
      `query ($configNames: [String!]!) {
        myAppConfigs(configNames: $configNames) { configName config }
      }`,
      { configNames: ['domainConfig'] },
    );
    const doc = _.find(result?.myAppConfigs, {
      configName: 'domainConfig',
    })?.config;
    const settings = _.get(doc, WEBUI_SETTINGS_CONFIG_KEY);
    return _.isPlainObject(settings)
      ? (settings as WebUISettingsDocument)
      : undefined;
  } catch (error) {
    // eslint-disable-next-line no-console -- module-scope diagnostics; no logger exists outside React here
    console.warn(
      `[domainConfig.settings] could not be read; keeping config.toml values (${String(error)}).`,
    );
    return undefined;
  }
};
