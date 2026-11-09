/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  checkConnectionMode,
  checkPlaceholderValues,
  checkSslMismatch,
  checkUrlFields,
} from '../configRules';

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

  it('validates only the URL keys config.toml still owns', () => {
    const { issues, checkedCount } = checkUrlFields({
      general: {
        apiEndpoint: 'https://api.example.com',
        appDownloadUrl: 'not-read-here',
      },
      wsproxy: { proxyURL: 'https://proxy.example.com' },
      server: { webServerURL: 'https://web.example.com' },
      pipeline: { frontendEndpoint: 'not-read-here' },
    });
    expect(issues).toEqual([]);
    expect(checkedCount).toBe(3);
  });

  it('should return multiple issues when multiple URLs are invalid', () => {
    const { issues, checkedCount } = checkUrlFields({
      general: { apiEndpoint: 'bad-url' },
      wsproxy: { proxyURL: 'also-bad' },
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
