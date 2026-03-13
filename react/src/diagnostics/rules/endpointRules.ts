/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DiagnosticResult } from '../../types/diagnostics';

/**
 * Check API endpoint reachability by inspecting a fetch result.
 * This is a pure function that evaluates a pre-fetched result.
 */
export function checkEndpointReachability(
  apiEndpoint: string,
  isReachable: boolean,
  errorMessage?: string,
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

  return null;
}

/**
 * Check if CORS is properly configured for the API endpoint.
 * This is a pure function that evaluates a pre-fetched CORS check result.
 *
 * CORS check semantics:
 * - allowed=true: CORS is configured correctly — returns null (passed)
 * - allowed=false with no error: CORS headers are missing/blocking — returns warning
 * - error exists: network-level failure (not necessarily a CORS issue) — returns info
 */
export function checkCorsHeaders(
  apiEndpoint: string,
  corsData: { allowed: boolean; allowOrigin?: string; error?: string },
): DiagnosticResult | null {
  if (!apiEndpoint) return null;

  if (corsData.error) {
    return {
      id: 'cors-check-failed',
      severity: 'info',
      category: 'endpoint',
      titleKey: 'diagnostics.CorsCheckFailed',
      descriptionKey: 'diagnostics.CorsCheckFailedDesc',
      interpolationValues: {
        endpoint: apiEndpoint,
        error: corsData.error,
      },
    };
  }

  if (!corsData.allowed) {
    return {
      id: 'cors-misconfigured',
      severity: 'warning',
      category: 'endpoint',
      titleKey: 'diagnostics.CorsMisconfigured',
      descriptionKey: 'diagnostics.CorsMisconfiguredDesc',
      remediationKey: 'diagnostics.CorsMisconfiguredFix',
      interpolationValues: {
        endpoint: apiEndpoint,
      },
    };
  }

  return null;
}
