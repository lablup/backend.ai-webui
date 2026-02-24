/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DiagnosticResult } from '../../types/diagnostics';

/**
 * Check for SSL/TLS protocol mismatch between API endpoint and proxy URL.
 * e.g., API endpoint uses HTTPS but proxy uses HTTP (or vice versa).
 */
export function checkSslMismatch(
  apiEndpoint: string,
  proxyUrl: string,
): DiagnosticResult | null {
  if (!apiEndpoint || !proxyUrl) return null;

  let apiProtocol: string;
  let proxyProtocol: string;

  try {
    apiProtocol = new URL(apiEndpoint).protocol;
  } catch {
    return null;
  }

  try {
    proxyProtocol = new URL(proxyUrl).protocol;
  } catch {
    return null;
  }

  const apiIsSecure = apiProtocol === 'https:' || apiProtocol === 'wss:';
  const proxyIsSecure = proxyProtocol === 'https:' || proxyProtocol === 'wss:';

  if (apiIsSecure !== proxyIsSecure) {
    return {
      id: 'ssl-mismatch',
      severity: 'warning',
      titleKey: 'diagnostics.SslMismatch',
      descriptionKey: 'diagnostics.SslMismatchDesc',
      remediationKey: 'diagnostics.SslMismatchFix',
      interpolationValues: {
        apiProtocol,
        proxyProtocol,
      },
    };
  }

  return null;
}

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
 * Check storage proxy reachability by inspecting a fetch result.
 * This is a pure function that evaluates a pre-fetched result.
 */
export function checkProxyReachability(
  proxyUrl: string,
  isReachable: boolean,
  errorMessage?: string,
): DiagnosticResult | null {
  if (!proxyUrl) return null;

  if (!isReachable) {
    return {
      id: 'proxy-unreachable',
      severity: 'critical',
      titleKey: 'diagnostics.ProxyUnreachable',
      descriptionKey: 'diagnostics.ProxyUnreachableDesc',
      remediationKey: 'diagnostics.ProxyUnreachableFix',
      interpolationValues: {
        proxyUrl,
        error: errorMessage || 'Unknown error',
      },
    };
  }

  return null;
}
