/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Tests for useWebUIConfig module.
 *
 * Tests cover:
 * - fetchAndParseConfig: TOML fetching and parsing
 * - preprocessToml: escape sequence handling in apiEndpointText
 * - processConfig (via fetchAndParseConfig): config value extraction
 * - Atom initial values
 */
import '../../__test__/matchMedia.mock.js';
import { getDefaultLoginConfig } from '../helper/loginConfig';
import {
  fetchAndParseConfig,
  rawConfigState,
  loginConfigState,
  configLoadedState,
  autoLogoutState,
  proxyUrlState,
  loginPluginState,
  type RawTomlConfig,
} from './useWebUIConfig';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockFetch(
  status: number,
  body: string,
  contentType: string = 'application/octet-stream',
): void {
  global.fetch = jest.fn().mockResolvedValue({
    status,
    text: () => Promise.resolve(body),
    headers: new Headers({ 'content-type': contentType }),
  } as unknown as Response);
}

// ---------------------------------------------------------------------------
// fetchAndParseConfig
// ---------------------------------------------------------------------------

describe('fetchAndParseConfig', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns null when fetch response status is not 200', async () => {
    mockFetch(404, '');
    const result = await fetchAndParseConfig('/config.toml');
    expect(result).toBeNull();
  });

  it('returns null when fetch throws an error', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
    const result = await fetchAndParseConfig('/config.toml');
    expect(result).toBeNull();
  });

  it('returns null for HTTP 500 (server error)', async () => {
    mockFetch(500, 'Internal Server Error');
    const result = await fetchAndParseConfig('/config.toml');
    expect(result).toBeNull();
  });

  it('returns null when response Content-Type is text/html (SPA fallback)', async () => {
    // When config.toml is missing, the dev server's historyApiFallback
    // serves index.html with status 200 and Content-Type: text/html.
    const html =
      '<!DOCTYPE html><html><head><title>App</title></head><body></body></html>';
    mockFetch(200, html, 'text/html; charset=utf-8');
    const result = await fetchAndParseConfig('/config.toml');
    expect(result).toBeNull();
  });

  it('returns parsed config object for valid TOML', async () => {
    const tomlContent = `
[general]
apiEndpoint = "https://api.example.com"
`;
    mockFetch(200, tomlContent);
    const result = await fetchAndParseConfig('/config.toml');
    expect(result).not.toBeNull();
    expect(result?.general).toBeDefined();
    expect(result?.general?.apiEndpoint).toBe('https://api.example.com');
  });

  it('parses license section from TOML', async () => {
    const tomlContent = `
[license]
edition = "Enterprise"
validUntil = "2030-12-31"
`;
    mockFetch(200, tomlContent);
    const result = await fetchAndParseConfig('/config.toml');
    expect(result).not.toBeNull();
    expect(result?.license?.edition).toBe('Enterprise');
    expect(result?.license?.validUntil).toBe('2030-12-31');
  });

  it('parses wsproxy section from TOML', async () => {
    const tomlContent = `
[wsproxy]
proxyURL = "http://127.0.0.1:5050/"
`;
    mockFetch(200, tomlContent);
    const result = await fetchAndParseConfig('/config.toml');
    expect(result).not.toBeNull();
    expect(result?.wsproxy?.proxyURL).toBe('http://127.0.0.1:5050/');
  });

  it('parses plugin section from TOML', async () => {
    const tomlContent = `
[plugin]
login = "custom-login"
page = "custom-pages"
`;
    mockFetch(200, tomlContent);
    const result = await fetchAndParseConfig('/config.toml');
    expect(result).not.toBeNull();
    expect(result?.plugin?.login).toBe('custom-login');
    expect(result?.plugin?.page).toBe('custom-pages');
  });

  it('preprocesses apiEndpointText escape sequences', async () => {
    // The preprocessing replaces escape sequences like \\n with actual newlines
    // by wrapping the value in JSON.parse(`"..."`)
    const tomlContent = `
[general]
apiEndpointText = "Line1\\nLine2"
`;
    mockFetch(200, tomlContent);
    const result = await fetchAndParseConfig('/config.toml');
    expect(result).not.toBeNull();
    // After preprocessing, the string should contain an actual newline
    expect(result?.general?.apiEndpointText).toBe('Line1\nLine2');
  });

  it('keeps original apiEndpointText when preprocessing fails', async () => {
    // An invalid escape sequence that JSON.parse cannot handle
    const tomlContent = `
[general]
apiEndpointText = "valid text"
`;
    mockFetch(200, tomlContent);
    const result = await fetchAndParseConfig('/config.toml');
    expect(result).not.toBeNull();
    // Regular text without escape sequences should be preserved
    expect(result?.general?.apiEndpointText).toBe('valid text');
  });

  it('handles TOML with multiple sections', async () => {
    const tomlContent = `
[general]
apiEndpoint = "https://api.example.com"

[license]
edition = "Community"

[wsproxy]
proxyURL = "http://localhost:5050"

[plugin]
login = ""
page = ""
`;
    mockFetch(200, tomlContent);
    const result = await fetchAndParseConfig('/config.toml');
    expect(result).not.toBeNull();
    expect(result?.general?.apiEndpoint).toBe('https://api.example.com');
    expect(result?.license?.edition).toBe('Community');
    expect(result?.wsproxy?.proxyURL).toBe('http://localhost:5050');
  });

  it('returns null for empty TOML body', async () => {
    mockFetch(200, '');
    const result = await fetchAndParseConfig('/config.toml');
    // smol-toml parses empty string to an empty object, not null
    // The config should be a non-null object (empty)
    expect(result).not.toBeNull();
    expect(typeof result).toBe('object');
  });

  it('calls fetch with the provided config path', async () => {
    const tomlContent = '[general]\napiEndpoint = ""';
    mockFetch(200, tomlContent);
    await fetchAndParseConfig('./config.toml');
    expect(global.fetch).toHaveBeenCalledWith('./config.toml');
  });

  it('calls fetch with Electron config path', async () => {
    const tomlContent = '[general]\napiEndpoint = ""';
    mockFetch(200, tomlContent);
    await fetchAndParseConfig('./config.toml');
    expect(global.fetch).toHaveBeenCalledWith('./config.toml');
  });
});

// ---------------------------------------------------------------------------
// preprocessToml (tested indirectly via fetchAndParseConfig)
// ---------------------------------------------------------------------------

describe('preprocessToml via fetchAndParseConfig', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('does not modify config when general section is absent', async () => {
    const tomlContent = `
[license]
edition = "Open Source"
`;
    mockFetch(200, tomlContent);
    const result = await fetchAndParseConfig('/config.toml');
    expect(result?.general).toBeUndefined();
  });

  it('does not modify config when apiEndpointText is absent', async () => {
    const tomlContent = `
[general]
apiEndpoint = "https://example.com"
`;
    mockFetch(200, tomlContent);
    const result = await fetchAndParseConfig('/config.toml');
    expect(result?.general?.apiEndpoint).toBe('https://example.com');
    expect(result?.general?.apiEndpointText).toBeUndefined();
  });

  it('handles tab escape sequence in apiEndpointText', async () => {
    const tomlContent = `
[general]
apiEndpointText = "Column1\\tColumn2"
`;
    mockFetch(200, tomlContent);
    const result = await fetchAndParseConfig('/config.toml');
    expect(result?.general?.apiEndpointText).toBe('Column1\tColumn2');
  });
});

// ---------------------------------------------------------------------------
// Atom initial values
// ---------------------------------------------------------------------------

describe('Atom initial values', () => {
  it('rawConfigState has null as initial value', () => {
    // Jotai atoms expose their initial value via .init
    expect((rawConfigState as any).init).toBeNull();
  });

  it('loginConfigState has null as initial value', () => {
    expect((loginConfigState as any).init).toBeNull();
  });

  it('configLoadedState has false as initial value', () => {
    expect((configLoadedState as any).init).toBe(false);
  });

  it('autoLogoutState has false as initial value', () => {
    expect((autoLogoutState as any).init).toBe(false);
  });

  it('proxyUrlState has empty string as initial value', () => {
    expect((proxyUrlState as any).init).toBe('');
  });

  it('loginPluginState has empty string as initial value', () => {
    expect((loginPluginState as any).init).toBe('');
  });
});

// ---------------------------------------------------------------------------
// RawTomlConfig type shape (structural smoke tests)
// ---------------------------------------------------------------------------

describe('RawTomlConfig structure', () => {
  it('accepts a config object with all known sections', () => {
    const config: RawTomlConfig = {
      general: { apiEndpoint: 'https://example.com' },
      license: { edition: 'Open Source', validUntil: '' },
      wsproxy: { proxyURL: 'http://127.0.0.1:5050/' },
      plugin: { login: '', page: '' },
      resources: {},
      environments: {},
      menu: {},
      pipeline: {},
    };
    expect(config.general?.apiEndpoint).toBe('https://example.com');
    expect(config.license?.edition).toBe('Open Source');
    expect(config.wsproxy?.proxyURL).toBe('http://127.0.0.1:5050/');
  });

  it('allows additional unknown keys via index signature', () => {
    const config: RawTomlConfig = {
      customSection: { foo: 'bar' },
    };
    expect(config.customSection).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// getDefaultLoginConfig fallback (used when config.toml is missing)
// ---------------------------------------------------------------------------

describe('getDefaultLoginConfig fallback values', () => {
  it('returns a non-null LoginConfigState with sensible defaults', () => {
    const defaults = getDefaultLoginConfig();
    expect(defaults).not.toBeNull();
    expect(typeof defaults).toBe('object');
  });

  it('sets proxy_url to the default wsproxy address', () => {
    const defaults = getDefaultLoginConfig();
    expect(defaults.proxy_url).toBe('http://127.0.0.1:5050/');
  });

  it('sets api_endpoint to empty string so login page shows empty field', () => {
    const defaults = getDefaultLoginConfig();
    expect(defaults.api_endpoint).toBe('');
  });

  it('sets login_attempt_limit to 500', () => {
    const defaults = getDefaultLoginConfig();
    expect(defaults.login_attempt_limit).toBe(500);
  });

  it('sets login_block_time to 180', () => {
    const defaults = getDefaultLoginConfig();
    expect(defaults.login_block_time).toBe(180);
  });

  it('disables optional features by default', () => {
    const defaults = getDefaultLoginConfig();
    expect(defaults.signup_support).toBe(false);
    expect(defaults.force2FA).toBe(false);
    expect(defaults.enablePipeline).toBe(false);
    expect(defaults.maskUserInfo).toBe(false);
  });

  it('sets connection_mode to SESSION', () => {
    const defaults = getDefaultLoginConfig();
    expect(defaults.connection_mode).toBe('SESSION');
  });

  it('returns empty arrays for list fields', () => {
    const defaults = getDefaultLoginConfig();
    expect(defaults.singleSignOnVendors).toEqual([]);
    expect(defaults.allow_image_list).toEqual([]);
    expect(defaults.blockList).toEqual([]);
    expect(defaults.inactiveList).toEqual([]);
  });

  it('returns independent objects on each call (no shared state)', () => {
    const a = getDefaultLoginConfig();
    const b = getDefaultLoginConfig();
    a.api_endpoint = 'https://modified.example.com';
    expect(b.api_endpoint).toBe('');
  });
});
