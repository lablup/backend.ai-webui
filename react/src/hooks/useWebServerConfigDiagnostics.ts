/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '.';
import {
  checkBlocklistValidity,
  checkConnectionMode,
  checkGeneralNumericFields,
  checkImageReferences,
  checkPlaceholderValues,
  checkPluginConfiguration,
  checkResourceLimits,
  checkSslMismatch,
  checkUrlFields,
  isPlaceholder,
} from '../diagnostics/rules/configRules';
import type { DiagnosticResult } from '../types/diagnostics';
import { useProxyUrl, useRawConfig } from './useWebUIConfig';
import { VALID_MENU_KEYS } from './useWebUIMenuItems';
import { useMemo } from 'react';

/**
 * Hook that checks webserver configuration consistency.
 * Compares raw TOML config values against the running client config.
 * Synchronous — no suspense needed.
 */
export function useWebServerConfigDiagnostics(): DiagnosticResult[] {
  'use memo';

  const baiClient = useSuspendedBackendaiClient();
  const rawConfig = useRawConfig();
  const proxyUrl = useProxyUrl();

  return useMemo(() => {
    const results: DiagnosticResult[] = [];
    const apiEndpoint: string = baiClient?._config?.endpoint ?? '';
    const blockList: string[] = baiClient?._config?.blockList ?? [];

    // --- Placeholder detection (e.g. "[Proxy URL]" left in config.toml) ---
    if (rawConfig) {
      const placeholderIssues = checkPlaceholderValues(rawConfig);
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

    // --- Blocklist validity ---
    const blocklistCheck = checkBlocklistValidity(blockList, VALID_MENU_KEYS);
    if (blocklistCheck) {
      results.push(blocklistCheck);
    } else if (blockList.length > 0) {
      results.push({
        id: 'config-blocklist-valid',
        severity: 'passed',
        category: 'config',
        titleKey: 'diagnostics.BlocklistValid',
        descriptionKey: 'diagnostics.BlocklistValidDesc',
        interpolationValues: { count: String(blockList.length) },
      });
    }

    // --- Connection mode (enum + SESSION consistency) ---
    const connectionMode: string =
      (rawConfig?.general?.connectionMode as string) ??
      baiClient?._config?.connectionMode ??
      '';
    const webServerUrl: string =
      ((rawConfig?.server as Record<string, unknown> | undefined)
        ?.webServerURL as string) ?? '';
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

    // --- URL field validation ---
    if (rawConfig) {
      const { issues: urlIssues, checkedCount } = checkUrlFields(rawConfig);
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

    // --- Resource limits ([resources] section) ---
    const resourceLimitIssues = checkResourceLimits(
      rawConfig?.resources as Record<string, unknown> | undefined,
    );
    // --- Numeric fields in [general] (maxCountForPreopenPorts, loginAttemptLimit, loginBlockTime) ---
    const generalNumericIssues = checkGeneralNumericFields(
      rawConfig?.general as Record<string, unknown> | undefined,
    );
    const allNumericIssues = [...resourceLimitIssues, ...generalNumericIssues];
    if (allNumericIssues.length > 0) {
      results.push(...allNumericIssues);
    } else if (rawConfig?.resources) {
      results.push({
        id: 'config-resource-limits-passed',
        severity: 'passed',
        category: 'config',
        titleKey: 'diagnostics.ResourceLimitsPassed',
        descriptionKey: 'diagnostics.ResourceLimitsPassedDesc',
      });
    }

    // --- Image references (systemSSHImage, defaultFileBrowserImage, etc.) ---
    const imageRefIssues = checkImageReferences(
      rawConfig?.general as Record<string, unknown> | undefined,
    );
    if (imageRefIssues.length > 0) {
      results.push(...imageRefIssues);
    } else if (rawConfig?.general) {
      // Only show "passed" when at least one image ref field is non-placeholder
      const imageRefFields = [
        'systemSSHImage',
        'defaultFileBrowserImage',
        'defaultSessionEnvironment',
        'defaultImportEnvironment',
      ];
      const generalSection = rawConfig.general as Record<string, unknown>;
      const hasNonPlaceholderImageRef = imageRefFields.some((f) => {
        const v = generalSection[f];
        return (
          v && typeof v === 'string' && v.trim() !== '' && !isPlaceholder(v)
        );
      });
      if (hasNonPlaceholderImageRef) {
        results.push({
          id: 'config-image-references-passed',
          severity: 'passed',
          category: 'config',
          titleKey: 'diagnostics.ImageReferencesPassed',
          descriptionKey: 'diagnostics.ImageReferencesPassedDesc',
        });
      }
    }

    // --- Plugin configuration (page names, login/sidebar JS filenames) ---
    const pluginIssues = checkPluginConfiguration(
      rawConfig?.plugin as Record<string, unknown> | undefined,
    );
    if (pluginIssues.length > 0) {
      results.push(...pluginIssues);
    } else if (
      rawConfig?.plugin?.page &&
      !isPlaceholder(rawConfig.plugin.page as string)
    ) {
      const pluginNames = (rawConfig.plugin.page as string)
        .split(',')
        .map((n) => n.trim())
        .filter(Boolean)
        .join(', ');
      results.push({
        id: 'config-plugin-valid',
        severity: 'passed',
        category: 'config',
        titleKey: 'diagnostics.PluginConfigValid',
        descriptionKey: 'diagnostics.PluginConfigValidDesc',
        interpolationValues: { plugins: pluginNames },
      });
    }

    return results;
  }, [
    baiClient?._config?.endpoint,
    baiClient?._config?.blockList,
    baiClient?._config?.connectionMode,
    proxyUrl,
    rawConfig,
  ]);
}
