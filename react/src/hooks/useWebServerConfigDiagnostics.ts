/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '.';
import {
  checkConnectionMode,
  checkPlaceholderValues,
  checkSslMismatch,
  checkUrlFields,
  fileOnlyConfig,
  isPlaceholder,
} from '../diagnostics/rules/configRules';
import {
  SETTING_IMAGE_KEYS,
  SETTING_RANGES,
  SETTING_URL_KEYS,
  changedSettingKeys,
  checkIgnoredConfigTomlKeys,
  checkPluginConfiguration,
  checkSettingImageReferences,
  checkSettingMenuKeys,
  checkSettingRanges,
  checkSettingUrls,
} from '../diagnostics/rules/settingsRules';
import {
  getDefaultLoginConfig,
  type LoginConfigState,
} from '../helper/loginConfig';
import type { DiagnosticResult } from '../types/diagnostics';
import {
  useConfigParseError,
  useProxyUrl,
  useLoginConfig,
  useRawConfig,
} from './useWebUIConfig';
import { VALID_MENU_KEYS } from './useWebUIMenuItems';

/**
 * Checks the keys `config.toml` still owns against the file, and the System
 * Settings values the WebUI runs with (ADR 0028). Synchronous.
 */
export function useWebServerConfigDiagnostics(
  _fetchKey?: string,
): DiagnosticResult[] {
  'use memo';

  const baiClient = useSuspendedBackendaiClient();
  const rawConfig = useRawConfig();
  const fileConfig = rawConfig
    ? fileOnlyConfig(rawConfig, !!globalThis.isElectron)
    : {};
  const loginConfig = useLoginConfig();
  const proxyUrl = useProxyUrl();
  const configParseError = useConfigParseError();

  const results: DiagnosticResult[] = [];

  // --- config.toml parse failure (e.g. duplicate keys) ---
  if (configParseError) {
    results.push({
      id: 'config-parse-error',
      severity: 'critical',
      category: 'config',
      titleKey: 'diagnostics.ConfigParseError',
      descriptionKey: 'diagnostics.ConfigParseErrorDesc',
      interpolationValues: {
        errorMessage:
          configParseError instanceof Error
            ? configParseError.message
            : String(configParseError),
      },
    });
    return results;
  }

  const apiEndpoint: string = baiClient?._config?.endpoint ?? '';

  // --- Placeholder detection (e.g. "[Proxy URL]" left in config.toml) ---
  if (rawConfig) {
    const placeholderIssues = checkPlaceholderValues(fileConfig);
    results.push(...placeholderIssues);
  }

  // --- SSL mismatch between API endpoint and proxy URL ---
  const sslCheck = checkSslMismatch(apiEndpoint, proxyUrl);
  if (sslCheck) {
    results.push({
      ...sslCheck,
      category: 'config',
      titleKey: 'diagnostics.ConfigSslMismatch',
      descriptionKey: 'diagnostics.ConfigSslMismatchDesc',
      remediationKey: 'diagnostics.ConfigSslMismatchFix',
    });
  } else if (apiEndpoint && proxyUrl) {
    results.push({
      id: 'config-ssl-match-passed',
      severity: 'passed',
      category: 'config',
      titleKey: 'diagnostics.ConfigSslMatchPassed',
      descriptionKey: 'diagnostics.ConfigSslMatchPassedDesc',
    });
  }

  // --- Proxy URL configured & not a placeholder ---
  const rawProxyUrl = rawConfig?.wsproxy?.proxyURL;
  if (rawConfig && !rawProxyUrl) {
    results.push({
      id: 'config-missing-proxy-url',
      severity: 'info',
      category: 'config',
      titleKey: 'diagnostics.MissingProxyUrl',
      descriptionKey: 'diagnostics.MissingProxyUrlDesc',
    });
  } else if (rawProxyUrl && !isPlaceholder(rawProxyUrl)) {
    results.push({
      id: 'config-proxy-url-passed',
      severity: 'passed',
      category: 'config',
      titleKey: 'diagnostics.ProxyUrlConfigured',
      descriptionKey: 'diagnostics.ProxyUrlConfiguredDesc',
      interpolationValues: { proxyUrl },
    });
  }

  // --- Connection mode (enum + SESSION consistency) ---
  const connectionMode: string =
    (rawConfig?.general?.connectionMode as string) ??
    baiClient?._config?.connectionMode ??
    '';
  const webServerUrl: string =
    (fileConfig.server?.webServerURL as string) ?? '';
  const apiEndpointForCheck: string =
    (rawConfig?.general?.apiEndpoint as string) ?? apiEndpoint;
  const connectionModeIssues = checkConnectionMode(
    connectionMode,
    apiEndpointForCheck,
    webServerUrl,
  );
  if (connectionModeIssues.length > 0) {
    results.push(...connectionModeIssues);
  } else if (connectionMode && !isPlaceholder(connectionMode)) {
    results.push({
      id: 'config-connection-mode-consistent',
      severity: 'passed',
      category: 'config',
      titleKey: 'diagnostics.ConnectionModeConsistent',
      descriptionKey: 'diagnostics.ConnectionModeConsistentDesc',
      interpolationValues: { connectionMode: connectionMode.toUpperCase() },
    });
  }

  // --- URL fields config.toml still owns ---
  if (rawConfig) {
    const { issues: urlIssues, checkedCount } = checkUrlFields(fileConfig);
    if (urlIssues.length > 0) {
      results.push(...urlIssues);
    } else if (checkedCount > 0) {
      results.push({
        id: 'config-urls-valid',
        severity: 'passed',
        category: 'config',
        titleKey: 'diagnostics.ConfigUrlsValid',
        descriptionKey: 'diagnostics.ConfigUrlsValidDesc',
      });
    }
  }

  if (loginConfig) {
    results.push(
      ...checkIgnoredConfigTomlKeys(rawConfig),
      ...settingsDiagnostics(loginConfig, getDefaultLoginConfig()),
    );
  }

  return results;
}

/** The System Settings rules; a pass shows only for a value someone set. */
function settingsDiagnostics(
  state: LoginConfigState,
  defaults: LoginConfigState,
): DiagnosticResult[] {
  const results: DiagnosticResult[] = [];
  const passedIfChanged = (
    issues: DiagnosticResult[],
    keys: ReadonlyArray<string>,
    passed: Pick<DiagnosticResult, 'id' | 'titleKey' | 'descriptionKey'>,
  ) => {
    if (issues.length > 0) {
      results.push(...issues);
    } else if (changedSettingKeys(state, defaults, keys).length > 0) {
      results.push({ ...passed, severity: 'passed', category: 'config' });
    }
  };

  passedIfChanged(checkSettingRanges(state), Object.keys(SETTING_RANGES), {
    id: 'settings-ranges-passed',
    titleKey: 'diagnostics.ResourceLimitsPassed',
    descriptionKey: 'diagnostics.ResourceLimitsPassedDesc',
  });
  passedIfChanged(checkSettingUrls(state), SETTING_URL_KEYS, {
    id: 'settings-urls-valid',
    titleKey: 'diagnostics.SettingUrlsValid',
    descriptionKey: 'diagnostics.SettingUrlsValidDesc',
  });
  passedIfChanged(checkSettingImageReferences(state), SETTING_IMAGE_KEYS, {
    id: 'settings-image-references-passed',
    titleKey: 'diagnostics.ImageReferencesPassed',
    descriptionKey: 'diagnostics.ImageReferencesPassedDesc',
  });

  results.push(...checkSettingMenuKeys(state, VALID_MENU_KEYS));

  const pluginIssues = checkPluginConfiguration(
    state.pluginPages,
    state.loginPlugin,
  );
  if (pluginIssues.length > 0) {
    results.push(...pluginIssues);
  } else if (state.pluginPages.length > 0) {
    results.push({
      id: 'settings-plugin-valid',
      severity: 'passed',
      category: 'config',
      titleKey: 'diagnostics.PluginConfigValid',
      descriptionKey: 'diagnostics.PluginConfigValidDesc',
      settingKey: 'pluginPage',
      interpolationValues: { plugins: state.pluginPages.join(', ') },
    });
  }

  return results;
}
