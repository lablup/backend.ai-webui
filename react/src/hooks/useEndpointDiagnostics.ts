/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '.';
import { isPlaceholder } from '../diagnostics/rules/configRules';
import { checkEndpointReachability } from '../diagnostics/rules/endpointRules';
import type { DiagnosticResult } from '../types/diagnostics';
import { useTanQuery } from './reactQueryAlias';
import { useTranslation } from 'react-i18next';

/**
 * Hook that checks API endpoint reachability.
 * Uses TanStack Query to perform health check fetches.
 */
export function useEndpointDiagnostics(fetchKey?: string): {
  results: DiagnosticResult[];
  isLoading: boolean;
} {
  'use memo';

  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  const apiEndpoint: string = baiClient?._config?.endpoint ?? '';

  // Skip health checks for placeholder values like "[Proxy URL]"
  const isApiPlaceholder = isPlaceholder(apiEndpoint);

  const { data: healthCheck, isLoading: isEndpointLoading } = useTanQuery<{
    isReachable: boolean;
    statusCode?: number;
    error?: string;
  }>({
    queryKey: ['diagnostics', 'endpoint-health', apiEndpoint, fetchKey],
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
          error: e instanceof Error ? e.message : t('error.UnknownError'),
        };
      }
    },
    enabled: !!apiEndpoint && !isApiPlaceholder,
    staleTime: 0,
    retry: 1,
  });

  const results: DiagnosticResult[] = [];

  if (healthCheck && !isApiPlaceholder) {
    const reachCheck = checkEndpointReachability(
      apiEndpoint,
      healthCheck.isReachable,
      healthCheck.error,
      healthCheck.statusCode,
    );
    if (reachCheck) {
      results.push(reachCheck);
    } else if (apiEndpoint) {
      results.push({
        id: 'endpoint-reachable-passed',
        severity: 'passed',
        category: 'endpoint',
        titleKey: 'diagnostics.EndpointReachable',
        descriptionKey: 'diagnostics.EndpointReachableDesc',
        interpolationValues: { endpoint: apiEndpoint },
      });
    }
  }

  return { results, isLoading: isEndpointLoading };
}
