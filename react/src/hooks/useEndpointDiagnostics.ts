/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '.';
import {
  checkEndpointReachability,
  checkProxyReachability,
  checkSslMismatch,
} from '../diagnostics/rules/endpointRules';
import type { DiagnosticResult } from '../types/diagnostics';
import { useTanQuery } from './reactQueryAlias';
import { useProxyUrl } from './useWebUIConfig';
import { useMemo } from 'react';

/**
 * Hook that checks endpoint/proxy reachability and SSL mismatch.
 * Uses TanStack Query to perform health check fetches.
 */
export function useEndpointDiagnostics(): {
  results: DiagnosticResult[];
  isLoading: boolean;
} {
  'use memo';

  const baiClient = useSuspendedBackendaiClient();
  const proxyUrl = useProxyUrl();
  const apiEndpoint: string = baiClient?._config?.endpoint ?? '';

  const { data: healthCheck, isLoading: isEndpointLoading } = useTanQuery<{
    isReachable: boolean;
    error?: string;
  }>({
    queryKey: ['diagnostics', 'endpoint-health', apiEndpoint],
    queryFn: async () => {
      if (!apiEndpoint) return { isReachable: true };
      try {
        const response = await fetch(apiEndpoint, {
          method: 'GET',
          signal: AbortSignal.timeout(10000),
        });
        return { isReachable: response.ok || response.status < 500 };
      } catch (e) {
        return {
          isReachable: false,
          error: e instanceof Error ? e.message : 'Unknown error',
        };
      }
    },
    enabled: !!apiEndpoint,
    staleTime: 60_000,
    retry: 1,
  });

  const { data: proxyHealthCheck, isLoading: isProxyLoading } = useTanQuery<{
    isReachable: boolean;
    error?: string;
  }>({
    queryKey: ['diagnostics', 'proxy-health', proxyUrl],
    queryFn: async () => {
      if (!proxyUrl) return { isReachable: true };
      try {
        const response = await fetch(proxyUrl, {
          method: 'GET',
          signal: AbortSignal.timeout(10000),
        });
        return { isReachable: response.ok || response.status < 500 };
      } catch (e) {
        return {
          isReachable: false,
          error: e instanceof Error ? e.message : 'Unknown error',
        };
      }
    },
    enabled: !!proxyUrl,
    staleTime: 60_000,
    retry: 1,
  });

  const results = useMemo(() => {
    const diagnostics: DiagnosticResult[] = [];

    const sslCheck = checkSslMismatch(apiEndpoint, proxyUrl);
    if (sslCheck) {
      diagnostics.push(sslCheck);
    } else if (apiEndpoint && proxyUrl) {
      diagnostics.push({
        id: 'ssl-match-passed',
        severity: 'passed',
        titleKey: 'diagnostics.SslMatchPassed',
        descriptionKey: 'diagnostics.SslMatchPassedDesc',
      });
    }

    if (healthCheck) {
      const reachCheck = checkEndpointReachability(
        apiEndpoint,
        healthCheck.isReachable,
        healthCheck.error,
      );
      if (reachCheck) {
        diagnostics.push(reachCheck);
      } else if (apiEndpoint) {
        diagnostics.push({
          id: 'endpoint-reachable-passed',
          severity: 'passed',
          titleKey: 'diagnostics.EndpointReachable',
          descriptionKey: 'diagnostics.EndpointReachableDesc',
          interpolationValues: { endpoint: apiEndpoint },
        });
      }
    }

    if (proxyHealthCheck) {
      const proxyCheck = checkProxyReachability(
        proxyUrl,
        proxyHealthCheck.isReachable,
        proxyHealthCheck.error,
      );
      if (proxyCheck) {
        diagnostics.push(proxyCheck);
      } else if (proxyUrl) {
        diagnostics.push({
          id: 'proxy-reachable-passed',
          severity: 'passed',
          titleKey: 'diagnostics.ProxyReachable',
          descriptionKey: 'diagnostics.ProxyReachableDesc',
          interpolationValues: { proxyUrl },
        });
      }
    }

    return diagnostics;
  }, [apiEndpoint, proxyUrl, healthCheck, proxyHealthCheck]);

  return { results, isLoading: isEndpointLoading || isProxyLoading };
}
