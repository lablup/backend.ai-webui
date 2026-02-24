/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DiagnosticResult } from '../../types/diagnostics';

/**
 * Extract sources for a given CSP directive (e.g. connect-src, script-src).
 */
export function parseCspDirective(
  cspContent: string | null | undefined,
  directive: string,
): string[] {
  if (!cspContent) return [];

  const regex = new RegExp(`${directive}\\s+([^;]*)`, 'i');
  const match = cspContent.match(regex);
  if (!match) return [];

  return match[1]
    .trim()
    .split(/\s+/)
    .filter((v) => v.length > 0);
}

/**
 * Extract the CSP connect-src directive value from the page's meta tag.
 */
export function parseCspConnectSrc(
  cspContent: string | null | undefined,
): string[] {
  return parseCspDirective(cspContent, 'connect-src');
}

/**
 * Resolve effective sources for a directive, falling back to default-src.
 * Per CSP spec, if a specific directive is absent, default-src applies.
 */
function getEffectiveSources(
  cspContent: string,
  directive: string,
): string[] | null {
  const sources = parseCspDirective(cspContent, directive);
  if (sources.length > 0) return sources;

  const defaultSources = parseCspDirective(cspContent, 'default-src');
  if (defaultSources.length > 0) return defaultSources;

  // Neither directive nor default-src exists — no CSP restriction
  return null;
}

/**
 * Check if a URL matches a CSP source expression.
 * Handles exact URL, wildcard domains (*.example.com), and scheme-only sources.
 */
function matchesCspSource(
  source: string,
  targetUrl: URL,
  pageOrigin?: string,
): boolean {
  if (source === '*') return true;

  // 'self' only matches the page's own origin
  if (source === "'self'") {
    if (!pageOrigin) return false;
    try {
      const originUrl = new URL(pageOrigin);
      return (
        targetUrl.protocol === originUrl.protocol &&
        targetUrl.hostname === originUrl.hostname &&
        (targetUrl.port || getDefaultPort(targetUrl.protocol)) ===
          (originUrl.port || getDefaultPort(originUrl.protocol))
      );
    } catch {
      return false;
    }
  }

  // Wildcard domain matching (e.g., *.example.com)
  if (source.startsWith('*.')) {
    const domain = source.slice(2);
    const hostname = targetUrl.hostname;
    // Require dot boundary: *.example.com matches sub.example.com but NOT
    // example.com (apex) or badexample.com
    if (hostname === domain) return false;
    return hostname.endsWith(`.${domain}`);
  }

  try {
    const sourceUrl = new URL(source);
    return (
      targetUrl.protocol === sourceUrl.protocol &&
      targetUrl.hostname === sourceUrl.hostname &&
      (sourceUrl.port === '' || targetUrl.port === sourceUrl.port)
    );
  } catch {
    // Handle scheme-only sources like "ws:" or "wss:"
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:$/.test(source)) {
      return source.toLowerCase() === targetUrl.protocol.toLowerCase();
    }
    return false;
  }
}

function getDefaultPort(protocol: string): string {
  if (protocol === 'https:' || protocol === 'wss:') return '443';
  if (protocol === 'http:' || protocol === 'ws:') return '80';
  return '';
}

/**
 * Check if the API endpoint is allowed by CSP connect-src.
 * Falls back to default-src if connect-src is absent (per CSP spec).
 * @param pageOrigin - The page's origin for resolving 'self' (e.g. window.location.origin)
 */
export function checkCspConnectSrc(
  cspContent: string | null | undefined,
  apiEndpoint: string,
  pageOrigin?: string,
): DiagnosticResult | null {
  if (!cspContent || !apiEndpoint) return null;

  const sources = getEffectiveSources(cspContent, 'connect-src');
  if (!sources) return null;

  let endpointUrl: URL;
  try {
    endpointUrl = new URL(apiEndpoint);
  } catch {
    return null;
  }

  const isAllowed = sources.some((source) =>
    matchesCspSource(source, endpointUrl, pageOrigin),
  );

  if (!isAllowed) {
    return {
      id: 'csp-connect-src-api',
      severity: 'critical',
      titleKey: 'diagnostics.CspApiEndpointBlocked',
      descriptionKey: 'diagnostics.CspApiEndpointBlockedDesc',
      remediationKey: 'diagnostics.CspApiEndpointBlockedFix',
      interpolationValues: { endpoint: apiEndpoint },
    };
  }

  return null;
}

/**
 * Check if the WebSocket proxy URL is allowed by CSP connect-src.
 * Falls back to default-src if connect-src is absent (per CSP spec).
 * @param pageOrigin - The page's origin for resolving 'self'
 */
export function checkCspWsConnectSrc(
  cspContent: string | null | undefined,
  proxyUrl: string,
  pageOrigin?: string,
): DiagnosticResult | null {
  if (!cspContent || !proxyUrl) return null;

  const sources = getEffectiveSources(cspContent, 'connect-src');
  if (!sources) return null;

  let wsUrl: URL;
  try {
    wsUrl = new URL(proxyUrl);
  } catch {
    return null;
  }

  const isAllowed = sources.some((source) =>
    matchesCspSource(source, wsUrl, pageOrigin),
  );

  if (!isAllowed) {
    return {
      id: 'csp-connect-src-ws',
      severity: 'critical',
      titleKey: 'diagnostics.CspWsProxyBlocked',
      descriptionKey: 'diagnostics.CspWsProxyBlockedDesc',
      remediationKey: 'diagnostics.CspWsProxyBlockedFix',
      interpolationValues: { proxyUrl },
    };
  }

  return null;
}

/**
 * Check if CSP script-src might block application scripts.
 * Accepts 'self', wildcard, or nonce/hash-based policies.
 * Falls back to default-src if script-src is absent.
 */
export function checkCspScriptSrc(
  cspContent: string | null | undefined,
): DiagnosticResult | null {
  if (!cspContent) return null;

  const sources = getEffectiveSources(cspContent, 'script-src');
  if (!sources) return null;

  const allowsScripts = sources.some(
    (s) =>
      s === "'self'" ||
      s === '*' ||
      s.startsWith("'nonce-") ||
      s.startsWith("'sha256-") ||
      s.startsWith("'sha384-") ||
      s.startsWith("'sha512-"),
  );

  if (!allowsScripts) {
    return {
      id: 'csp-script-src-blocked',
      severity: 'critical',
      titleKey: 'diagnostics.CspScriptSrcBlocked',
      descriptionKey: 'diagnostics.CspScriptSrcBlockedDesc',
      remediationKey: 'diagnostics.CspScriptSrcBlockedFix',
    };
  }

  return null;
}

/**
 * Check if CSP style-src might block inline styles (required by antd).
 * Accepts 'unsafe-inline', wildcard, or nonce/hash-based policies.
 * Falls back to default-src if style-src is absent.
 */
export function checkCspStyleSrc(
  cspContent: string | null | undefined,
): DiagnosticResult | null {
  if (!cspContent) return null;

  const sources = getEffectiveSources(cspContent, 'style-src');
  if (!sources) return null;

  const allowsInline = sources.some(
    (s) =>
      s === "'unsafe-inline'" ||
      s === '*' ||
      s.startsWith("'nonce-") ||
      s.startsWith("'sha256-") ||
      s.startsWith("'sha384-") ||
      s.startsWith("'sha512-"),
  );

  if (!allowsInline) {
    return {
      id: 'csp-style-src-no-inline',
      severity: 'warning',
      titleKey: 'diagnostics.CspStyleSrcNoInline',
      descriptionKey: 'diagnostics.CspStyleSrcNoInlineDesc',
      remediationKey: 'diagnostics.CspStyleSrcNoInlineFix',
    };
  }

  return null;
}
