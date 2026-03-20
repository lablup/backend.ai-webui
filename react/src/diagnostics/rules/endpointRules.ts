/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DiagnosticResult } from '../../types/diagnostics';

/**
 * Check API endpoint reachability by inspecting a fetch result.
 * This is a pure function that evaluates a pre-fetched result.
 *
 * HTTP status code semantics:
 * - 404: reachable but endpoint not found — returns a warning
 * - 200, 401, 403, and other non-404 responses below 500: reachable — returns null (passed)
 * - 500+: unreachable — returns critical
 * - network errors (isReachable=false): returns critical
 */
export function checkEndpointReachability(
  apiEndpoint: string,
  isReachable: boolean,
  errorMessage?: string,
  statusCode?: number,
): DiagnosticResult | null {
  if (!apiEndpoint) return null;

  if (!isReachable) {
    return {
      id: 'endpoint-unreachable',
      severity: 'critical',
      category: 'endpoint',
      titleKey: 'diagnostics.EndpointUnreachable',
      descriptionKey: 'diagnostics.EndpointUnreachableDesc',
      remediationKey: 'diagnostics.EndpointUnreachableFix',
      interpolationValues: {
        endpoint: apiEndpoint,
        error: errorMessage || 'Unknown error',
      },
    };
  }

  if (statusCode === 404) {
    return {
      id: 'endpoint-not-found',
      severity: 'warning',
      category: 'endpoint',
      titleKey: 'diagnostics.EndpointNotFound',
      descriptionKey: 'diagnostics.EndpointNotFoundDesc',
      remediationKey: 'diagnostics.EndpointNotFoundFix',
      interpolationValues: {
        endpoint: apiEndpoint,
      },
    };
  }

  return null;
}
