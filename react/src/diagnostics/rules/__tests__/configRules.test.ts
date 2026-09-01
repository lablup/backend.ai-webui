/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  checkBlocklistValidity,
  checkConnectionMode,
  checkGeneralNumericFields,
  checkImageReferences,
  checkPlaceholderValues,
  checkPluginConfiguration,
  checkResourceLimits,
  checkSslMismatch,
  checkUrlFields,
} from '../configRules';

const validMenuKeys = [
  'start',
  'dashboard',
  'session',
  'serving',
  'model-store',
  'data',
  'my-environment',
  'agent-summary',
  'statistics',
  'credential',
  'environment',
  'maintenance',
  'information',
];

// ---------------------------------------------------------------------------
// checkPlaceholderValues
// ---------------------------------------------------------------------------

describe('checkPlaceholderValues', () => {
  it('should return empty array when config is empty', () => {
    expect(checkPlaceholderValues({})).toEqual([]);
  });

  it('should return empty array when no placeholders exist', () => {
    const result = checkPlaceholderValues({
      general: {
        apiEndpoint: 'https://api.example.com',
        defaultLanguage: 'en',
      },
      wsproxy: { proxyURL: 'https://proxy.example.com' },
    });
    expect(result).toEqual([]);
  });

  it('should detect a single placeholder value', () => {
    const result = checkPlaceholderValues({
      general: { apiEndpoint: '[Default API Endpoint]' },
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('config-placeholder-general-apiEndpoint');
    expect(result[0].severity).toBe('warning');
    expect(result[0].category).toBe('config');
    expect(result[0].interpolationValues?.section).toBe('[general]');
    expect(result[0].interpolationValues?.field).toBe('apiEndpoint');
    expect(result[0].interpolationValues?.value).toBe('[Default API Endpoint]');
  });

  it('should detect multiple placeholders across sections', () => {
    const result = checkPlaceholderValues({
      general: { apiEndpoint: '[Proxy URL]' },
      wsproxy: { proxyURL: '[Proxy URL]' },
    });
    expect(result).toHaveLength(2);
    const ids = result.map((r) => r.id);
    expect(ids).toContain('config-placeholder-general-apiEndpoint');
    expect(ids).toContain('config-placeholder-wsproxy-proxyURL');
  });

  it('should skip non-object section values', () => {
    const result = checkPlaceholderValues({
      general: null,
      wsproxy: 'not-an-object',
      pipeline: 42,
    } as Record<string, unknown>);
    expect(result).toEqual([]);
  });

  it('should not flag non-placeholder string values', () => {
    const result = checkPlaceholderValues({
      general: { apiEndpoint: 'https://real-url.com' },
    });
    expect(result).toEqual([]);
  });

  it('should detect placeholder with surrounding whitespace', () => {
    const result = checkPlaceholderValues({
      general: { apiEndpoint: '  [Proxy URL]  ' },
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('config-placeholder-general-apiEndpoint');
  });

  it('should not flag values that partially look like placeholders', () => {
    const result = checkPlaceholderValues({
      general: {
        description: '[brackets in middle] value',
        partial: 'no brackets',
      },
    });
    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// checkSslMismatch
// ---------------------------------------------------------------------------

describe('checkSslMismatch', () => {
  it('should return null when inputs are empty', () => {
    expect(checkSslMismatch('', 'http://proxy.example.com')).toBeNull();
    expect(checkSslMismatch('https://api.example.com', '')).toBeNull();
  });

  it('should return null when both use HTTPS', () => {
    expect(
      checkSslMismatch('https://api.example.com', 'https://proxy.example.com'),
    ).toBeNull();
  });

  it('should return null when both use HTTP', () => {
    expect(
      checkSslMismatch('http://api.example.com', 'http://proxy.example.com'),
    ).toBeNull();
  });

  it('should return warning when API is HTTPS but proxy is HTTP', () => {
    const result = checkSslMismatch(
      'https://api.example.com',
      'http://proxy.example.com',
    );
    expect(result).not.toBeNull();
    expect(result?.severity).toBe('warning');
    expect(result?.category).toBe('config');
    expect(result?.id).toBe('config-ssl-mismatch');
  });

  it('should return warning when API is HTTP but proxy is HTTPS', () => {
    const result = checkSslMismatch(
      'http://api.example.com',
      'https://proxy.example.com',
    );
    expect(result).not.toBeNull();
    expect(result?.severity).toBe('warning');
  });

  it('should return null for invalid URLs', () => {
    expect(
      checkSslMismatch('not-a-url', 'https://proxy.example.com'),
    ).toBeNull();
    expect(checkSslMismatch('https://api.example.com', 'not-a-url')).toBeNull();
  });

  it('should include protocol interpolation values', () => {
    const result = checkSslMismatch(
      'https://api.example.com',
      'http://proxy.example.com',
    );
    expect(result?.interpolationValues?.apiProtocol).toBe('https:');
    expect(result?.interpolationValues?.proxyProtocol).toBe('http:');
  });

  it('should treat WSS as secure (no mismatch with HTTPS)', () => {
    expect(
      checkSslMismatch('wss://api.example.com', 'https://proxy.example.com'),
    ).toBeNull();
  });

  it('should detect mismatch between WSS and HTTP', () => {
    const result = checkSslMismatch(
      'wss://api.example.com',
      'http://proxy.example.com',
    );
    expect(result).not.toBeNull();
    expect(result?.severity).toBe('warning');
  });
});

// ---------------------------------------------------------------------------
// checkBlocklistValidity
// ---------------------------------------------------------------------------

describe('checkBlocklistValidity', () => {
  it('should return null when blocklist is empty', () => {
    expect(checkBlocklistValidity([], validMenuKeys)).toBeNull();
  });

  it('should return null when all entries are valid', () => {
    expect(
      checkBlocklistValidity(['session', 'serving'], validMenuKeys),
    ).toBeNull();
  });

  it('should return warning when blocklist has invalid entries', () => {
    const result = checkBlocklistValidity(
      ['session', 'nonexistent-menu', 'another-bad'],
      validMenuKeys,
    );
    expect(result).not.toBeNull();
    expect(result?.severity).toBe('warning');
    expect(result?.category).toBe('config');
    expect(result?.id).toBe('config-invalid-blocklist');
    expect(result?.interpolationValues?.entries).toBe(
      'nonexistent-menu, another-bad',
    );
    expect(result?.interpolationValues?.count).toBe('2');
  });

  it('should return null when blocklist is undefined-like', () => {
    expect(
      checkBlocklistValidity(undefined as unknown as string[], validMenuKeys),
    ).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// checkConnectionMode
// ---------------------------------------------------------------------------

describe('checkConnectionMode', () => {
  it('should return empty array when connectionMode is empty', () => {
    expect(
      checkConnectionMode(
        '',
        'https://api.example.com',
        'https://web.example.com',
      ),
    ).toEqual([]);
  });

  it('should return empty array for placeholder connectionMode', () => {
    expect(
      checkConnectionMode(
        '[Connection Mode]',
        'https://api.example.com',
        'https://web.example.com',
      ),
    ).toEqual([]);
  });

  it('should return empty array for valid API mode', () => {
    expect(
      checkConnectionMode(
        'API',
        'https://api.example.com',
        'https://web.example.com',
      ),
    ).toEqual([]);
  });

  it('should return empty array for valid SESSION mode when endpoints match', () => {
    expect(
      checkConnectionMode(
        'SESSION',
        'https://api.example.com',
        'https://api.example.com',
      ),
    ).toEqual([]);
  });

  it('should be case-insensitive for valid modes', () => {
    expect(checkConnectionMode('api', 'https://api.example.com', '')).toEqual(
      [],
    );
    expect(
      checkConnectionMode('session', 'https://same.com', 'https://same.com'),
    ).toEqual([]);
  });

  it('should return warning for invalid connection mode value', () => {
    const results = checkConnectionMode(
      'INVALID_MODE',
      'https://api.example.com',
      'https://web.example.com',
    );
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('config-invalid-connection-mode');
    expect(results[0].severity).toBe('warning');
    expect(results[0].category).toBe('config');
    expect(results[0].interpolationValues?.value).toBe('INVALID_MODE');
    expect(results[0].interpolationValues?.allowed).toContain('API');
    expect(results[0].interpolationValues?.allowed).toContain('SESSION');
  });

  it('should return warning when SESSION mode endpoints do not match', () => {
    const results = checkConnectionMode(
      'SESSION',
      'https://api.example.com',
      'https://web.example.com',
    );
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('config-connection-mode-mismatch');
    expect(results[0].severity).toBe('warning');
    expect(results[0].interpolationValues?.apiEndpoint).toBe(
      'https://api.example.com',
    );
    expect(results[0].interpolationValues?.webServerUrl).toBe(
      'https://web.example.com',
    );
  });

  it('should ignore trailing slashes when comparing SESSION endpoints', () => {
    expect(
      checkConnectionMode(
        'SESSION',
        'https://api.example.com/',
        'https://api.example.com',
      ),
    ).toEqual([]);
  });

  it('should not check SESSION consistency when webServerUrl is empty', () => {
    expect(
      checkConnectionMode('SESSION', 'https://api.example.com', ''),
    ).toEqual([]);
  });

  it('should not check SESSION consistency when apiEndpoint is empty', () => {
    expect(
      checkConnectionMode('SESSION', '', 'https://web.example.com'),
    ).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// checkUrlFields
// ---------------------------------------------------------------------------

describe('checkUrlFields', () => {
  it('should return no issues and zero checked count for empty config', () => {
    const { issues, checkedCount } = checkUrlFields({});
    expect(issues).toEqual([]);
    expect(checkedCount).toBe(0);
  });

  it('should skip missing/empty URL fields', () => {
    const { issues, checkedCount } = checkUrlFields({
      general: { apiEndpoint: '' },
      wsproxy: {},
    });
    expect(issues).toEqual([]);
    expect(checkedCount).toBe(0);
  });

  it('should skip placeholder URL fields', () => {
    const { issues, checkedCount } = checkUrlFields({
      general: { apiEndpoint: '[Default API Endpoint]' },
    });
    expect(issues).toEqual([]);
    expect(checkedCount).toBe(0);
  });

  it('should count valid URLs without issues', () => {
    const { issues, checkedCount } = checkUrlFields({
      general: { apiEndpoint: 'https://api.example.com' },
      wsproxy: { proxyURL: 'https://proxy.example.com' },
    });
    expect(issues).toEqual([]);
    expect(checkedCount).toBe(2);
  });

  it('should return issue for invalid URL', () => {
    const { issues, checkedCount } = checkUrlFields({
      general: { apiEndpoint: 'not-a-url' },
    });
    expect(issues).toHaveLength(1);
    expect(checkedCount).toBe(1);
    expect(issues[0].id).toBe('config-invalid-url-general-apiEndpoint');
    expect(issues[0].severity).toBe('warning');
    expect(issues[0].category).toBe('config');
    expect(issues[0].interpolationValues?.section).toBe('[general]');
    expect(issues[0].interpolationValues?.field).toBe('apiEndpoint');
    expect(issues[0].interpolationValues?.value).toBe('not-a-url');
  });

  it('should validate all defined URL fields', () => {
    const { issues, checkedCount } = checkUrlFields({
      general: {
        apiEndpoint: 'https://api.example.com',
        appDownloadUrl: 'https://download.example.com',
      },
      wsproxy: {
        proxyURL: 'https://proxy.example.com',
        proxyBaseURL: 'https://proxy-base.example.com',
      },
      server: { webServerURL: 'https://web.example.com' },
      pipeline: {
        endpoint: 'https://pipeline.example.com',
        frontendEndpoint: 'https://pipeline-frontend.example.com',
      },
    });
    expect(issues).toEqual([]);
    expect(checkedCount).toBe(7);
  });

  it('should return multiple issues when multiple URLs are invalid', () => {
    const { issues, checkedCount } = checkUrlFields({
      general: { apiEndpoint: 'bad-url', appDownloadUrl: 'also-bad' },
    });
    expect(issues).toHaveLength(2);
    expect(checkedCount).toBe(2);
  });

  it('should reject ftp URLs as invalid', () => {
    const { issues } = checkUrlFields({
      general: { apiEndpoint: 'ftp://files.example.com' },
    });
    expect(issues).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// checkResourceLimits
// ---------------------------------------------------------------------------

describe('checkResourceLimits', () => {
  it('should return empty array when resources is undefined', () => {
    expect(checkResourceLimits(undefined)).toEqual([]);
  });

  it('should return empty array when resources is empty object', () => {
    expect(checkResourceLimits({})).toEqual([]);
  });

  it('should return empty array when all values are within range', () => {
    const results = checkResourceLimits({
      maxCPUCoresPerContainer: 8,
      maxMemoryPerContainer: 1024,
      maxCUDADevicesPerContainer: 4,
      maxFileUploadSize: 1073741824,
    });
    expect(results).toEqual([]);
  });

  it('should return warning when maxCPUCoresPerContainer is below minimum', () => {
    const results = checkResourceLimits({ maxCPUCoresPerContainer: 0 });
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('config-resources-maxCPUCoresPerContainer');
    expect(results[0].severity).toBe('warning');
    expect(results[0].category).toBe('config');
    expect(results[0].interpolationValues?.field).toBe(
      'maxCPUCoresPerContainer',
    );
    expect(results[0].interpolationValues?.min).toBe('1');
    expect(results[0].interpolationValues?.max).toBe('8192');
  });

  it('should return warning when maxCPUCoresPerContainer exceeds maximum', () => {
    const results = checkResourceLimits({ maxCPUCoresPerContainer: 9999 });
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('config-resources-maxCPUCoresPerContainer');
  });

  it('should allow -1 for maxFileUploadSize (unlimited)', () => {
    const results = checkResourceLimits({ maxFileUploadSize: -1 });
    expect(results).toEqual([]);
  });

  it('should return warning when maxFileUploadSize is below -1', () => {
    const results = checkResourceLimits({ maxFileUploadSize: -2 });
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('config-resources-maxFileUploadSize');
  });

  it('should skip undefined/null fields', () => {
    const results = checkResourceLimits({
      maxCPUCoresPerContainer: undefined,
      maxMemoryPerContainer: null,
    } as Record<string, unknown>);
    expect(results).toEqual([]);
  });

  it('should skip NaN values', () => {
    const results = checkResourceLimits({
      maxCPUCoresPerContainer: 'not-a-number',
    });
    expect(results).toEqual([]);
  });

  it('should return multiple warnings for multiple out-of-range fields', () => {
    const results = checkResourceLimits({
      maxCPUCoresPerContainer: 0,
      maxMemoryPerContainer: 0,
    });
    expect(results).toHaveLength(2);
  });

  it('should accept boundary minimum values', () => {
    const results = checkResourceLimits({
      maxCPUCoresPerContainer: 1,
      maxCUDADevicesPerContainer: 0,
    });
    expect(results).toEqual([]);
  });

  it('should accept boundary maximum values', () => {
    const results = checkResourceLimits({
      maxCPUCoresPerContainer: 8192,
      maxCUDADevicesPerContainer: 64,
    });
    expect(results).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// checkGeneralNumericFields
// ---------------------------------------------------------------------------

describe('checkGeneralNumericFields', () => {
  it('should return empty array when general is undefined', () => {
    expect(checkGeneralNumericFields(undefined)).toEqual([]);
  });

  it('should return empty array when general is empty object', () => {
    expect(checkGeneralNumericFields({})).toEqual([]);
  });

  it('should return empty array when all values are within range', () => {
    const results = checkGeneralNumericFields({
      maxCountForPreopenPorts: 10,
      loginAttemptLimit: 5,
      loginBlockTime: 300,
    });
    expect(results).toEqual([]);
  });

  it('should return warning when maxCountForPreopenPorts is negative', () => {
    const results = checkGeneralNumericFields({
      maxCountForPreopenPorts: -1,
    });
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('config-general-maxCountForPreopenPorts');
    expect(results[0].severity).toBe('warning');
    expect(results[0].category).toBe('config');
    expect(results[0].interpolationValues?.section).toBe('[general]');
    expect(results[0].interpolationValues?.field).toBe(
      'maxCountForPreopenPorts',
    );
    expect(results[0].interpolationValues?.min).toBe('0');
    expect(results[0].interpolationValues?.max).toBe('100');
  });

  it('should return warning when maxCountForPreopenPorts exceeds 100', () => {
    const results = checkGeneralNumericFields({
      maxCountForPreopenPorts: 101,
    });
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('config-general-maxCountForPreopenPorts');
  });

  it('should return warning when loginAttemptLimit is below minimum', () => {
    const results = checkGeneralNumericFields({ loginAttemptLimit: 0 });
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('config-general-loginAttemptLimit');
  });

  it('should return warning when loginBlockTime exceeds maximum', () => {
    const results = checkGeneralNumericFields({ loginBlockTime: 86401 });
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('config-general-loginBlockTime');
  });

  it('should accept 0 for maxCountForPreopenPorts (disables feature)', () => {
    const results = checkGeneralNumericFields({ maxCountForPreopenPorts: 0 });
    expect(results).toEqual([]);
  });

  it('should skip undefined/null fields', () => {
    const results = checkGeneralNumericFields({
      loginAttemptLimit: undefined,
      loginBlockTime: null,
    } as Record<string, unknown>);
    expect(results).toEqual([]);
  });

  it('should skip NaN string values', () => {
    const results = checkGeneralNumericFields({
      loginAttemptLimit: 'unlimited',
    });
    expect(results).toEqual([]);
  });

  it('should return multiple warnings for multiple out-of-range fields', () => {
    const results = checkGeneralNumericFields({
      loginAttemptLimit: 0,
      loginBlockTime: 86401,
    });
    expect(results).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// checkImageReferences
// ---------------------------------------------------------------------------

describe('checkImageReferences', () => {
  it('should return empty array when generalConfig is undefined', () => {
    expect(checkImageReferences(undefined)).toEqual([]);
  });

  it('should return empty array when generalConfig is empty', () => {
    expect(checkImageReferences({})).toEqual([]);
  });

  it('should return empty array for valid image references', () => {
    const results = checkImageReferences({
      systemSSHImage: 'cr.backend.ai/stable/python:3.9-ubuntu20.04',
      defaultFileBrowserImage: 'registry.example.com/namespace/image:tag',
    });
    expect(results).toEqual([]);
  });

  it('should return warning for invalid image reference format', () => {
    const results = checkImageReferences({
      systemSSHImage: 'invalid image ref!',
    });
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('config-invalid-image-ref-systemSSHImage');
    expect(results[0].severity).toBe('warning');
    expect(results[0].category).toBe('config');
    expect(results[0].interpolationValues?.field).toBe('systemSSHImage');
    expect(results[0].interpolationValues?.value).toBe('invalid image ref!');
  });

  it('should skip empty image reference fields', () => {
    const results = checkImageReferences({
      systemSSHImage: '',
      defaultFileBrowserImage: '',
    });
    expect(results).toEqual([]);
  });

  it('should skip placeholder image reference fields', () => {
    const results = checkImageReferences({
      systemSSHImage: '[System SSH Image]',
    });
    expect(results).toEqual([]);
  });

  it('should validate all four image reference fields', () => {
    const results = checkImageReferences({
      systemSSHImage: 'registry.example.com/ns/image:tag',
      defaultFileBrowserImage: 'registry.example.com/ns/browser:latest',
      defaultSessionEnvironment: 'registry.example.com/ns/session:1.0',
      defaultImportEnvironment: 'registry.example.com/ns/import:1.0',
    });
    expect(results).toEqual([]);
  });

  it('should return warnings for each invalid image reference field', () => {
    const results = checkImageReferences({
      systemSSHImage: '!!invalid!!',
      defaultFileBrowserImage: '??also-invalid',
    });
    expect(results).toHaveLength(2);
    const ids = results.map((r) => r.id);
    expect(ids).toContain('config-invalid-image-ref-systemSSHImage');
    expect(ids).toContain('config-invalid-image-ref-defaultFileBrowserImage');
  });

  it('should accept image with port in registry', () => {
    const results = checkImageReferences({
      systemSSHImage: 'registry.example.com:5000/namespace/image:tag',
    });
    expect(results).toEqual([]);
  });

  it('should accept image with architecture suffix', () => {
    const results = checkImageReferences({
      systemSSHImage: 'registry.example.com/ns/image:tag@amd64',
    });
    expect(results).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// checkPluginConfiguration
// ---------------------------------------------------------------------------

describe('checkPluginConfiguration', () => {
  it('should return empty array when pluginConfig is undefined', () => {
    expect(checkPluginConfiguration(undefined)).toEqual([]);
  });

  it('should return empty array when pluginConfig is empty', () => {
    expect(checkPluginConfiguration({})).toEqual([]);
  });

  it('should return empty array for valid plugin page names', () => {
    const results = checkPluginConfiguration({
      page: 'cloud-reports, custom-page, my_plugin',
    });
    expect(results).toEqual([]);
  });

  it('should return empty array for valid JS filenames', () => {
    const results = checkPluginConfiguration({
      login: 'signup-cloud.js',
      sidebar: 'report-cloud.js',
    });
    expect(results).toEqual([]);
  });

  it('should return warning for invalid plugin page name', () => {
    const results = checkPluginConfiguration({
      page: 'valid-plugin, invalid plugin!',
    });
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('config-invalid-plugin-names');
    expect(results[0].severity).toBe('warning');
    expect(results[0].category).toBe('config');
    expect(results[0].interpolationValues?.plugins).toContain(
      'invalid plugin!',
    );
    expect(results[0].interpolationValues?.count).toBe('1');
  });

  it('should return warning for invalid login JS filename', () => {
    const results = checkPluginConfiguration({
      login: 'invalid login.js',
    });
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('config-invalid-plugin-login');
    expect(results[0].severity).toBe('warning');
    expect(results[0].interpolationValues?.field).toBe('plugin.login');
    expect(results[0].interpolationValues?.value).toBe('invalid login.js');
  });

  it('should return warning for sidebar filename without .js extension', () => {
    const results = checkPluginConfiguration({
      sidebar: 'report-cloud.ts',
    });
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('config-invalid-plugin-sidebar');
    expect(results[0].interpolationValues?.field).toBe('plugin.sidebar');
  });

  it('should skip placeholder page value', () => {
    const results = checkPluginConfiguration({
      page: '[Plugin Pages]',
    });
    expect(results).toEqual([]);
  });

  it('should skip placeholder JS filenames', () => {
    const results = checkPluginConfiguration({
      login: '[Login Plugin]',
      sidebar: '[Sidebar Plugin]',
    });
    expect(results).toEqual([]);
  });

  it('should skip empty JS filename fields', () => {
    const results = checkPluginConfiguration({
      login: '',
      sidebar: '',
    });
    expect(results).toEqual([]);
  });

  it('should return multiple warnings for multiple invalid entries', () => {
    const results = checkPluginConfiguration({
      page: 'valid-plugin, invalid!plugin',
      login: 'bad file name.js',
      sidebar: 'also bad.js',
    });
    expect(results).toHaveLength(3);
    const ids = results.map((r) => r.id);
    expect(ids).toContain('config-invalid-plugin-names');
    expect(ids).toContain('config-invalid-plugin-login');
    expect(ids).toContain('config-invalid-plugin-sidebar');
  });

  it('should count multiple invalid plugin page names', () => {
    const results = checkPluginConfiguration({
      page: 'bad!name1, bad!name2, valid-name',
    });
    expect(results).toHaveLength(1);
    expect(results[0].interpolationValues?.count).toBe('2');
  });

  it('should accept single valid plugin page name', () => {
    const results = checkPluginConfiguration({ page: 'my-plugin' });
    expect(results).toEqual([]);
  });

  it('should accept underscores and hyphens in plugin names', () => {
    const results = checkPluginConfiguration({
      page: 'plugin_name, another-plugin, alphanumeric123',
    });
    expect(results).toEqual([]);
  });
});
