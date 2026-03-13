/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '.';
import { isPlaceholder } from '../diagnostics/rules/configRules';
import {
  checkCorsHeaders,
  checkEndpointReachability,
} from '../diagnostics/rules/endpointRules';
import type { DiagnosticResult } from '../types/diagnostics';
import { useTanQuery } from './reactQueryAlias';
import { useMemo } from 'react';

/**
 * Hook that checks API endpoint reachability.
 * Uses TanStack Query to perform health check fetches.
 */
export function useEndpointDiagnostics(): {
  results: DiagnosticResult[];
  isLoading: boolean;
} {
  'use memo';

  const baiClient = useSuspendedBackendaiClient();
  const apiEndpoint: string = baiClient?._config?.endpoint ?? '';

  // Skip health checks for placeholder values like "[Proxy URL]"
  const isApiPlaceholder = isPlaceholder(apiEndpoint);

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
          error: e instanceof Error ? e.message : undefined,
        };
      }
    },
    enabled: !!apiEndpoint && !isApiPlaceholder,
    staleTime: 0,
    retry: 1,
  });

  const { data: corsCheck, isLoading: isCorsLoading } = useTanQuery<{
    allowed: boolean;
    error?: string;
  }>({
    queryKey: ['diagnostics', 'cors-check', apiEndpoint],
    queryFn: async () => {
      if (!apiEndpoint) return { allowed: true };
      try {
        await fetch(apiEndpoint, {
          method: 'GET',
          mode: 'cors',
          signal: AbortSignal.timeout(10000),
        });
        // Fetch succeeded with mode 'cors' — CORS is properly configured
        return { allowed: true };
      } catch (e) {
        if (e instanceof TypeError) {
          // TypeError from fetch in 'cors' mode can be CORS block or network failure.
          // Retry with 'no-cors' to disambiguate: if it also fails, it's a network issue.
          try {
            await fetch(apiEndpoint, {
              method: 'GET',
              mode: 'no-cors',
              signal: AbortSignal.timeout(5000),
            });
            // no-cors succeeded — endpoint is reachable, so original failure was CORS
            return { allowed: false };
          } catch {
            // no-cors also failed — network issue, not CORS
            return {
              allowed: true,
              error: e instanceof Error ? e.message : undefined,
            };
          }
        }
        // Other errors (e.g., AbortError) are network issues, not CORS issues
        return {
          allowed: true,
          error: e instanceof Error ? e.message : undefined,
        };
      }
    },
    enabled: !!apiEndpoint && !isApiPlaceholder,
    staleTime: 60_000,
    retry: 1,
  });

  const results = useMemo(() => {
    const diagnostics: DiagnosticResult[] = [];

    if (healthCheck && !isApiPlaceholder) {
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
          category: 'endpoint',
          titleKey: 'diagnostics.EndpointReachable',
          descriptionKey: 'diagnostics.EndpointReachableDesc',
          interpolationValues: { endpoint: apiEndpoint },
        });
      }
    }

    if (corsCheck && !isApiPlaceholder) {
      const corsResult = checkCorsHeaders(apiEndpoint, corsCheck);
      if (corsResult) {
        diagnostics.push(corsResult);
      } else if (apiEndpoint) {
        diagnostics.push({
          id: 'cors-passed',
          severity: 'passed',
          category: 'endpoint',
          titleKey: 'diagnostics.CorsPassed',
          descriptionKey: 'diagnostics.CorsPassedDesc',
          interpolationValues: { endpoint: apiEndpoint },
        });
      }
    }

    return diagnostics;
  }, [apiEndpoint, corsCheck, healthCheck, isApiPlaceholder]);

  return { results, isLoading: isEndpointLoading || isCorsLoading };
}
