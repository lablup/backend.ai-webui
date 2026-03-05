/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '.';
import { checkBlocklistValidity } from '../diagnostics/rules/configRules';
import { checkSslMismatch } from '../diagnostics/rules/endpointRules';
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

    // Check SSL mismatch between API endpoint and proxy URL from config
    const sslCheck = checkSslMismatch(apiEndpoint, proxyUrl);
    if (sslCheck) {
      results.push({
        ...sslCheck,
        id: 'config-ssl-mismatch',
        titleKey: 'diagnostics.ConfigSslMismatch',
        descriptionKey: 'diagnostics.ConfigSslMismatchDesc',
      });
    } else if (apiEndpoint && proxyUrl) {
      results.push({
        id: 'config-ssl-match-passed',
        severity: 'passed',
        titleKey: 'diagnostics.ConfigSslMatchPassed',
        descriptionKey: 'diagnostics.ConfigSslMatchPassedDesc',
      });
    }

    // Check if proxy URL is configured
    if (rawConfig && !rawConfig.wsproxy?.proxyURL) {
      results.push({
        id: 'config-missing-proxy-url',
        severity: 'info',
        titleKey: 'diagnostics.MissingProxyUrl',
        descriptionKey: 'diagnostics.MissingProxyUrlDesc',
      });
    } else if (rawConfig?.wsproxy?.proxyURL) {
      results.push({
        id: 'config-proxy-url-passed',
        severity: 'passed',
        titleKey: 'diagnostics.ProxyUrlConfigured',
        descriptionKey: 'diagnostics.ProxyUrlConfiguredDesc',
        interpolationValues: { proxyUrl },
      });
    }

    // Check if blocklist contains invalid menu keys
    const blocklistCheck = checkBlocklistValidity(blockList, VALID_MENU_KEYS);
    if (blocklistCheck) {
      results.push(blocklistCheck);
    } else if (blockList.length > 0) {
      results.push({
        id: 'config-blocklist-valid',
        severity: 'passed',
        titleKey: 'diagnostics.BlocklistValid',
        descriptionKey: 'diagnostics.BlocklistValidDesc',
        interpolationValues: { count: String(blockList.length) },
      });
    }

    return results;
  }, [
    baiClient?._config?.endpoint,
    baiClient?._config?.blockList,
    proxyUrl,
    rawConfig,
  ]);
}
