/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '.';
import {
  checkSslMismatch,
  isPlaceholder,
} from '../diagnostics/rules/configRules';
import { checkEndpointReachability } from '../diagnostics/rules/endpointRules';
import type { DiagnosticResult } from '../types/diagnostics';
import { useTanQuery } from './reactQueryAlias';
import { useProxyUrl, useRawConfig } from './useWebUIConfig';
import { App } from 'antd';
import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const AUTO_DIAGNOSTICS_DISMISSED_KEY = 'bai-auto-diagnostics-dismissed';

/**
 * Hook that runs a subset of critical diagnostic checks after login
 * and shows an antd notification if any critical issue is found.
 *
 * - Only runs for superadmin users.
 * - Uses sessionStorage to avoid re-showing the notification within the same session.
 * - Runs asynchronously and does NOT block the login flow.
 */
export function useAutoDiagnostics(): void {
  'use memo';

  const { t } = useTranslation();
  const { notification } = App.useApp();
  const baiClient = useSuspendedBackendaiClient();
  const rawConfig = useRawConfig();
  const proxyUrl = useProxyUrl();

  const isSuperAdmin: boolean = !!baiClient?.is_superadmin;
  const apiEndpoint: string = baiClient?._config?.endpoint ?? '';
  const isApiPlaceholder = isPlaceholder(apiEndpoint);

  // Fetch endpoint reachability
  const { data: healthCheck } = useTanQuery<{
    isReachable: boolean;
    statusCode?: number;
    error?: string;
  }>({
    queryKey: ['auto-diagnostics', 'endpoint-health', apiEndpoint],
    queryFn: async () => {
      if (!apiEndpoint) return { isReachable: true };
      try {
        const response = await fetch(apiEndpoint, {
          method: 'GET',
          signal: AbortSignal.timeout(10000),
        });
        return {
          isReachable: response.status < 500,
          statusCode: response.status,
        };
      } catch (e) {
        return {
          isReachable: false,
          error: e instanceof Error ? e.message : 'Unknown error',
        };
      }
    },
    enabled: isSuperAdmin && !!apiEndpoint && !isApiPlaceholder,
    staleTime: 60_000,
    retry: 1,
  });

  // Compute critical results synchronously from the fetched data
  const criticalResults = useMemo<DiagnosticResult[]>(() => {
    if (!isSuperAdmin) return [];

    const results: DiagnosticResult[] = [];

    // Endpoint reachability check (critical only)
    if (healthCheck && !isApiPlaceholder && apiEndpoint) {
      const reachCheck = checkEndpointReachability(
        apiEndpoint,
        healthCheck.isReachable,
        healthCheck.error,
        healthCheck.statusCode,
      );
      if (reachCheck && reachCheck.severity === 'critical') {
        results.push(reachCheck);
      }
    }

    // SSL mismatch check (warning severity; include as it's a config issue)
    if (rawConfig && apiEndpoint && proxyUrl && !isApiPlaceholder) {
      const sslResult = checkSslMismatch(apiEndpoint, proxyUrl);
      if (sslResult && sslResult.severity === 'critical') {
        results.push(sslResult);
      }
    }

    return results;
  }, [
    isSuperAdmin,
    healthCheck,
    isApiPlaceholder,
    apiEndpoint,
    rawConfig,
    proxyUrl,
  ]);

  // Track whether we have already shown the notification in this session
  const notificationShownRef = useRef(false);

  useEffect(() => {
    if (!isSuperAdmin) return;
    if (criticalResults.length === 0) return;
    if (notificationShownRef.current) return;

    // Check sessionStorage dismissal flag
    try {
      if (sessionStorage.getItem(AUTO_DIAGNOSTICS_DISMISSED_KEY)) return;
    } catch {
      // sessionStorage may be unavailable in some environments
    }

    notificationShownRef.current = true;

    notification.warning({
      key: 'auto-diagnostics-warning',
      message: t('diagnostics.AutoDiagnosticsTitle'),
      description: t('diagnostics.AutoDiagnosticsDesc'),
      duration: 0,
      placement: 'bottomRight',
      onClose: () => {
        try {
          sessionStorage.setItem(AUTO_DIAGNOSTICS_DISMISSED_KEY, '1');
        } catch {
          // ignore
        }
      },
    });
  }, [isSuperAdmin, criticalResults, notification, t]);
}
