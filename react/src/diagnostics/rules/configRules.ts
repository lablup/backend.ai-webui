/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DiagnosticResult } from '../../types/diagnostics';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Check whether a string is a valid URL (http/https). */
function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
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
// Blocklist
// ---------------------------------------------------------------------------

/**
 * Check if the blocklist contains menu keys that don't exist.
 * Invalid blocklist entries have no effect and may indicate a typo or
 * an outdated config referencing removed menu items.
 */
export function checkBlocklistValidity(
  blockList: readonly string[],
  validMenuKeys: readonly string[],
): DiagnosticResult | null {
  if (!blockList || blockList.length === 0) return null;

  const invalidEntries = blockList.filter(
    (key) => !validMenuKeys.includes(key),
  );

  if (invalidEntries.length > 0) {
    return {
      id: 'config-invalid-blocklist',
      severity: 'warning',
      category: 'config',
      titleKey: 'diagnostics.InvalidBlocklistEntries',
      descriptionKey: 'diagnostics.InvalidBlocklistEntriesDesc',
      remediationKey: 'diagnostics.InvalidBlocklistEntriesFix',
      interpolationValues: {
        entries: invalidEntries.join(', '),
        count: String(invalidEntries.length),
      },
    };
  }

  return null;
}

// ---------------------------------------------------------------------------
// Connection mode  (config.toml: "Default is API. Currently supports API and SESSION")
// ---------------------------------------------------------------------------

const VALID_CONNECTION_MODES = ['API', 'SESSION'];

/**
 * 1) connectionMode must be "API" or "SESSION".
 * 2) In SESSION mode, apiEndpoint should match webServerURL.
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
      severity: 'warning',
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
        severity: 'warning',
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

/**
 * URL fields extracted from config.toml comments:
 *   general.apiEndpoint   — "Default API Endpoint"
 *   general.appDownloadUrl — "URL to download the electron app"
 *   wsproxy.proxyURL      — "Proxy URL"
 *   wsproxy.proxyBaseURL  — "Base URL of websocket proxy"
 *   server.webServerURL   — "Web server website URL"
 *   pipeline.endpoint     — "FastTrack API endpoint"
 *   pipeline.frontendEndpoint — "FastTrack frontend endpoint"
 */
const URL_FIELDS: UrlFieldDef[] = [
  { section: 'general', field: 'apiEndpoint' },
  { section: 'general', field: 'appDownloadUrl' },
  { section: 'wsproxy', field: 'proxyURL' },
  { section: 'wsproxy', field: 'proxyBaseURL' },
  { section: 'server', field: 'webServerURL' },
  { section: 'pipeline', field: 'endpoint' },
  { section: 'pipeline', field: 'frontendEndpoint' },
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
      | Record<string, unknown>
      | undefined;
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

// ---------------------------------------------------------------------------
// Resource limits  (config.toml [resources] section)
// ---------------------------------------------------------------------------

interface ResourceLimitRange {
  field: string;
  min: number;
  max: number;
}

const RESOURCE_LIMIT_RANGES: ResourceLimitRange[] = [
  // [resources] — device / memory caps
  {
    field: 'maxCPUCoresPerContainer',
    min: 1,
    max: 8192,
  },
  {
    field: 'maxMemoryPerContainer',
    min: 1,
    max: 16384,
  },
  {
    field: 'maxCUDADevicesPerContainer',
    min: 0,
    max: 64,
  },
  {
    field: 'maxCUDASharesPerContainer',
    min: 0,
    max: 64,
  },
  {
    field: 'maxROCMDevicesPerContainer',
    min: 0,
    max: 64,
  },
  {
    field: 'maxTPUDevicesPerContainer',
    min: 0,
    max: 64,
  },
  {
    field: 'maxIPUDevicesPerContainer',
    min: 0,
    max: 64,
  },
  {
    field: 'maxATOMDevicesPerContainer',
    min: 0,
    max: 64,
  },
  {
    field: 'maxATOMPLUSDevicesPerContainer',
    min: 0,
    max: 64,
  },
  {
    field: 'maxGaudi2DevicesPerContainer',
    min: 0,
    max: 64,
  },
  {
    field: 'maxWarboyDevicesPerContainer',
    min: 0,
    max: 64,
  },
  {
    field: 'maxRNGDDevicesPerContainer',
    min: 0,
    max: 64,
  },
  {
    field: 'maxHyperaccelLPUDevicesPerContainer',
    min: 0,
    max: 64,
  },
  {
    field: 'maxShmPerContainer',
    min: 0,
    max: 16384,
  },
  // "Set to -1 for unlimited upload"
  {
    field: 'maxFileUploadSize',
    min: -1,
    max: 107374182400,
  },
];

/** [general] numeric fields with expected ranges. */
const GENERAL_NUMERIC_RANGES: ResourceLimitRange[] = [
  // "The maximum allowed number of preopen ports. 0 disables the feature."
  {
    field: 'maxCountForPreopenPorts',
    min: 0,
    max: 100,
  },
  // "The number of allowed login attempts"
  {
    field: 'loginAttemptLimit',
    min: 1,
    max: 1000,
  },
  // "The amount of time(sec.) for rejecting login attempt"
  {
    field: 'loginBlockTime',
    min: 1,
    max: 86400,
  },
];

/**
 * Check that all resource limit values are within reasonable ranges.
 */
export function checkResourceLimits(
  resources: Record<string, unknown> | undefined,
): DiagnosticResult[] {
  if (!resources) return [];
  return checkNumericRanges(resources, RESOURCE_LIMIT_RANGES, 'resources');
}

/**
 * Check numeric fields in [general] section.
 */
export function checkGeneralNumericFields(
  general: Record<string, unknown> | undefined,
): DiagnosticResult[] {
  if (!general) return [];
  return checkNumericRanges(general, GENERAL_NUMERIC_RANGES, 'general');
}

function checkNumericRanges(
  config: Record<string, unknown>,
  ranges: ResourceLimitRange[],
  section: string,
): DiagnosticResult[] {
  const results: DiagnosticResult[] = [];

  for (const range of ranges) {
    const rawValue = config[range.field];
    if (rawValue === undefined || rawValue === null) continue;

    const value = Number(rawValue);
    if (Number.isNaN(value)) continue;

    if (value < range.min || value > range.max) {
      results.push({
        id: `config-${section}-${range.field}`,
        severity: 'warning',
        category: 'config',
        titleKey: 'diagnostics.ResourceLimitOutOfRange',
        descriptionKey: 'diagnostics.ResourceLimitOutOfRangeDesc',
        remediationKey: 'diagnostics.ResourceLimitOutOfRangeFix',
        interpolationValues: {
          section: `[${section}]`,
          field: range.field,
          value: String(value),
          min: String(range.min),
          max: String(range.max),
        },
      });
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Image references  (config.toml: "registry/namespace:tag@arch")
// ---------------------------------------------------------------------------

const IMAGE_REFERENCE_PATTERN =
  /^[a-zA-Z0-9._-]+(?::[0-9]+)?(\/[a-zA-Z0-9._-]+)+(:[a-zA-Z0-9._-]+)?(@[a-zA-Z0-9._-]+)?$/;

/**
 * Validate image reference fields:
 *   systemSSHImage, defaultFileBrowserImage,
 *   defaultSessionEnvironment, defaultImportEnvironment
 */
export function checkImageReferences(
  generalConfig: Record<string, unknown> | undefined,
): DiagnosticResult[] {
  if (!generalConfig) return [];

  const results: DiagnosticResult[] = [];
  const fields = [
    'systemSSHImage',
    'defaultFileBrowserImage',
    'defaultSessionEnvironment',
    'defaultImportEnvironment',
  ];

  for (const field of fields) {
    const value = generalConfig[field];
    if (!value || typeof value !== 'string' || value.trim() === '') continue;
    if (isPlaceholder(value)) continue;

    if (!IMAGE_REFERENCE_PATTERN.test(value)) {
      results.push({
        id: `config-invalid-image-ref-${field}`,
        severity: 'warning',
        category: 'config',
        titleKey: 'diagnostics.InvalidImageReference',
        descriptionKey: 'diagnostics.InvalidImageReferenceDesc',
        remediationKey: 'diagnostics.InvalidImageReferenceFix',
        interpolationValues: { field, value },
      });
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Plugin configuration  (config.toml [plugin] section)
// ---------------------------------------------------------------------------

const VALID_PLUGIN_NAME_PATTERN = /^[a-zA-Z0-9_-]+$/;
const VALID_JS_FILENAME_PATTERN = /^[a-zA-Z0-9_-]+\.js$/;

/**
 * Validate [plugin] section:
 *   - page: comma-separated plugin names (alphanumeric + hyphens/underscores)
 *   - login: JS filename (e.g. "signup-cloud.js")
 *   - sidebar: JS filename (e.g. "report-cloud.js")
 */
export function checkPluginConfiguration(
  pluginConfig: Record<string, unknown> | undefined,
): DiagnosticResult[] {
  if (!pluginConfig) return [];

  const results: DiagnosticResult[] = [];

  // Check page names (skip placeholders — already reported by checkPlaceholderValues)
  const page = pluginConfig.page;
  if (page && typeof page === 'string' && !isPlaceholder(page)) {
    const pluginNames = page
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean);

    const invalidNames = pluginNames.filter(
      (name) => !VALID_PLUGIN_NAME_PATTERN.test(name),
    );

    if (invalidNames.length > 0) {
      results.push({
        id: 'config-invalid-plugin-names',
        severity: 'warning',
        category: 'config',
        titleKey: 'diagnostics.InvalidPluginNames',
        descriptionKey: 'diagnostics.InvalidPluginNamesDesc',
        remediationKey: 'diagnostics.InvalidPluginNamesFix',
        interpolationValues: {
          plugins: invalidNames.join(', '),
          count: String(invalidNames.length),
        },
      });
    }
  }

  // Check login / sidebar JS filenames
  const jsFields = [
    { key: 'login', label: 'plugin.login' },
    { key: 'sidebar', label: 'plugin.sidebar' },
  ];

  for (const { key, label } of jsFields) {
    const value = pluginConfig[key];
    if (!value || typeof value !== 'string' || value.trim() === '') continue;
    if (isPlaceholder(value)) continue;

    if (!VALID_JS_FILENAME_PATTERN.test(value)) {
      results.push({
        id: `config-invalid-plugin-${key}`,
        severity: 'warning',
        category: 'config',
        titleKey: 'diagnostics.InvalidPluginFilename',
        descriptionKey: 'diagnostics.InvalidPluginFilenameDesc',
        remediationKey: 'diagnostics.InvalidPluginFilenameFix',
        interpolationValues: { field: label, value },
      });
    }
  }

  return results;
}
