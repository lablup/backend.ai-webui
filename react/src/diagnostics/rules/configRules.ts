/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { FILE_ONLY_CONFIG_KEYS } from '../../helper/loginConfig';
import type { DiagnosticResult } from '../../types/diagnostics';
import * as _ from 'lodash-es';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Check whether a string is a valid URL (http/https). */
export function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * The keys `config.toml` still owns, as the file sets them. `server.webServerURL`
 * is read only by the Electron app (`electron-app/main.js`), so it is left out elsewhere.
 */
export function fileOnlyConfig(
  rawConfig: Record<string, any>,
  isElectron: boolean,
): Record<string, Record<string, unknown>> {
  return _.mapValues(FILE_ONLY_CONFIG_KEYS, (keys, section) =>
    section === 'server' && !isElectron
      ? {}
      : _.pick(rawConfig[section] ?? {}, keys),
  );
}

/**
 * Detect config.toml placeholder values that were never replaced.
 * e.g. "[Proxy URL]", "[Default API Endpoint. If blank, ...]"
 */
export function isPlaceholder(value: unknown): boolean {
  return typeof value === 'string' && /^\[.*\]$/.test(value.trim());
}

/**
 * Check top-level section fields in the raw config for unreplaced placeholder values.
 * Only scans one level deep (top-level sections → direct fields).
 * Returns one warning per placeholder found.
 */
export function checkPlaceholderValues(
  rawConfig: Record<string, unknown>,
): DiagnosticResult[] {
  const results: DiagnosticResult[] = [];

  for (const [section, sectionValue] of Object.entries(rawConfig)) {
    if (!sectionValue || typeof sectionValue !== 'object') continue;
    const sectionObj = sectionValue as Record<string, unknown>;

    for (const [field, value] of Object.entries(sectionObj)) {
      if (isPlaceholder(value)) {
        results.push({
          id: `config-placeholder-${section}-${field}`,
          severity: 'warning',
          category: 'config',
          titleKey: 'diagnostics.PlaceholderValue',
          descriptionKey: 'diagnostics.PlaceholderValueDesc',
          remediationKey: 'diagnostics.PlaceholderValueFix',
          interpolationValues: {
            section: `[${section}]`,
            field,
            value: value as string,
          },
        });
      }
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// SSL/TLS mismatch  (API endpoint vs proxy URL protocol)
// ---------------------------------------------------------------------------

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
      id: 'config-ssl-mismatch',
      severity: 'warning',
      category: 'config',
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

// ---------------------------------------------------------------------------
// Connection mode  (API or SESSION; anything else runs as SESSION, see loginConfig.ts)
// ---------------------------------------------------------------------------

const VALID_CONNECTION_MODES = ['API', 'SESSION'];

/**
 * 1) connectionMode must be "API" or "SESSION"; the WebUI runs any other value as SESSION.
 * 2) In SESSION mode, notes when apiEndpoint differs from webServerURL, which may be
 *    intended. Pass an empty webServerUrl outside Electron, the only reader of it.
 */
export function checkConnectionMode(
  connectionMode: string,
  apiEndpoint: string,
  webServerUrl: string,
): DiagnosticResult[] {
  if (!connectionMode || isPlaceholder(connectionMode)) return [];

  const results: DiagnosticResult[] = [];
  const mode = connectionMode.toUpperCase();

  // Enum check
  if (!VALID_CONNECTION_MODES.includes(mode)) {
    results.push({
      id: 'config-invalid-connection-mode',
      severity: 'critical',
      category: 'config',
      titleKey: 'diagnostics.InvalidConnectionMode',
      descriptionKey: 'diagnostics.InvalidConnectionModeDesc',
      remediationKey: 'diagnostics.InvalidConnectionModeFix',
      interpolationValues: {
        value: connectionMode,
        allowed: VALID_CONNECTION_MODES.join(', '),
      },
    });
    return results;
  }

  // SESSION mode consistency check
  if (mode === 'SESSION' && webServerUrl && apiEndpoint) {
    const normalizedApi = apiEndpoint.replace(/\/+$/, '');
    const normalizedWeb = webServerUrl.replace(/\/+$/, '');

    if (normalizedApi !== normalizedWeb) {
      results.push({
        id: 'config-connection-mode-mismatch',
        severity: 'info',
        category: 'config',
        titleKey: 'diagnostics.ConnectionModeMismatch',
        descriptionKey: 'diagnostics.ConnectionModeMismatchDesc',
        remediationKey: 'diagnostics.ConnectionModeMismatchFix',
        interpolationValues: { apiEndpoint, webServerUrl },
      });
      return results;
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// URL field validation
// ---------------------------------------------------------------------------

interface UrlFieldDef {
  section: string;
  field: string;
}

/** The URL keys `config.toml` still owns; the settings URLs are `checkSettingUrls`. */
const URL_FIELDS: UrlFieldDef[] = [
  { section: 'general', field: 'apiEndpoint' },
  { section: 'wsproxy', field: 'proxyURL' },
  { section: 'server', field: 'webServerURL' },
];

/**
 * Validate all URL-typed config fields are parseable URLs.
 * Blank / absent fields are skipped (they are optional).
 * Returns issues and the count of actually validated (non-empty, non-placeholder) URLs.
 */
export function checkUrlFields(rawConfig: Record<string, unknown>): {
  issues: DiagnosticResult[];
  checkedCount: number;
} {
  const issues: DiagnosticResult[] = [];
  let checkedCount = 0;

  for (const { section, field } of URL_FIELDS) {
    const sectionObj = rawConfig[section] as
      Record<string, unknown> | undefined;
    const value = sectionObj?.[field];
    if (!value || typeof value !== 'string' || value.trim() === '') continue;
    // Placeholders are reported separately by checkPlaceholderValues
    if (isPlaceholder(value)) continue;

    checkedCount++;
    if (!isValidUrl(value)) {
      issues.push({
        id: `config-invalid-url-${section}-${field}`,
        severity: 'warning',
        category: 'config',
        titleKey: 'diagnostics.InvalidConfigUrl',
        descriptionKey: 'diagnostics.InvalidConfigUrlDesc',
        remediationKey: 'diagnostics.InvalidConfigUrlFix',
        interpolationValues: {
          section: `[${section}]`,
          field,
          value,
        },
      });
    }
  }

  return { issues, checkedCount };
}
