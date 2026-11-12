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
import { createStore } from 'jotai';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockFetch(
  status: number,
  body: string,
  contentType: string = 'application/octet-stream',
): void {
  global.fetch = vi.fn().mockResolvedValue({
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
    vi.restoreAllMocks();
  });

  it('returns null config when fetch response status is not 200', async () => {
    mockFetch(404, '');
    const result = await fetchAndParseConfig('/config.toml');
    expect(result.config).toBeNull();
    expect(result.error).toBeUndefined();
  });

  it('returns null config without error when fetch throws (network failure)', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    const result = await fetchAndParseConfig('/config.toml');
    expect(result.config).toBeNull();
    expect(result.error).toBeUndefined();
  });

  it('returns null config with error when TOML parsing fails', async () => {
    // Invalid TOML that will cause a parse error
    mockFetch(200, '[general]\ninvalid toml = = =');
    const result = await fetchAndParseConfig('/config.toml');
    expect(result.config).toBeNull();
    expect(result.error).toBeDefined();
  });

  it('returns null config for HTTP 500 (server error)', async () => {
    mockFetch(500, 'Internal Server Error');
    const result = await fetchAndParseConfig('/config.toml');
    expect(result.config).toBeNull();
  });

  it('returns null config when response Content-Type is text/html (SPA fallback)', async () => {
    // When config.toml is missing, the dev server's historyApiFallback
    // serves index.html with status 200 and Content-Type: text/html.
    const html =
      '<!DOCTYPE html><html><head><title>App</title></head><body></body></html>';
    mockFetch(200, html, 'text/html; charset=utf-8');
    const result = await fetchAndParseConfig('/config.toml');
    expect(result.config).toBeNull();
  });

  it('returns parsed config object for valid TOML', async () => {
    const tomlContent = `
[general]
apiEndpoint = "https://api.example.com"
`;
    mockFetch(200, tomlContent);
    const result = await fetchAndParseConfig('/config.toml');
    expect(result.config).not.toBeNull();
    expect(result.config?.general).toBeDefined();
    expect(result.config?.general?.apiEndpoint).toBe('https://api.example.com');
  });

  it('parses license section from TOML', async () => {
    const tomlContent = `
[license]
edition = "Enterprise"
validUntil = "2030-12-31"
`;
    mockFetch(200, tomlContent);
    const result = await fetchAndParseConfig('/config.toml');
    expect(result.config).not.toBeNull();
    expect(result.config?.license?.edition).toBe('Enterprise');
    expect(result.config?.license?.validUntil).toBe('2030-12-31');
  });

  it('parses wsproxy section from TOML', async () => {
    const tomlContent = `
[wsproxy]
proxyURL = "http://127.0.0.1:5050/"
`;
    mockFetch(200, tomlContent);
    const result = await fetchAndParseConfig('/config.toml');
    expect(result.config).not.toBeNull();
    expect(result.config?.wsproxy?.proxyURL).toBe('http://127.0.0.1:5050/');
  });

  it('parses plugin section from TOML', async () => {
    const tomlContent = `
[plugin]
login = "custom-login"
page = "custom-pages"
`;
    mockFetch(200, tomlContent);
    const result = await fetchAndParseConfig('/config.toml');
    expect(result.config).not.toBeNull();
    expect(result.config?.plugin?.login).toBe('custom-login');
    expect(result.config?.plugin?.page).toBe('custom-pages');
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
    expect(result.config).not.toBeNull();
    // After preprocessing, the string should contain an actual newline
    expect(result.config?.general?.apiEndpointText).toBe('Line1\nLine2');
  });

  it('keeps original apiEndpointText when preprocessing fails', async () => {
    // An invalid escape sequence that JSON.parse cannot handle
    const tomlContent = `
[general]
apiEndpointText = "valid text"
`;
    mockFetch(200, tomlContent);
    const result = await fetchAndParseConfig('/config.toml');
    expect(result.config).not.toBeNull();
    // Regular text without escape sequences should be preserved
    expect(result.config?.general?.apiEndpointText).toBe('valid text');
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
    expect(result.config).not.toBeNull();
    expect(result.config?.general?.apiEndpoint).toBe('https://api.example.com');
    expect(result.config?.license?.edition).toBe('Community');
    expect(result.config?.wsproxy?.proxyURL).toBe('http://localhost:5050');
  });

  it('returns non-null config for empty TOML body', async () => {
    mockFetch(200, '');
    const result = await fetchAndParseConfig('/config.toml');
    // smol-toml parses empty string to an empty object, not null
    // The config should be a non-null object (empty)
    expect(result.config).not.toBeNull();
    expect(typeof result.config).toBe('object');
  });

  it('returns error when TOML has duplicate keys', async () => {
    const tomlContent = `
[general]
debug = false
apiEndpoint = "https://api.example.com"
debug = true
`;
    mockFetch(200, tomlContent);
    const result = await fetchAndParseConfig('/config.toml');
    expect(result.config).toBeNull();
    expect(result.error).toBeDefined();
  });

  it('calls fetch with the provided config path', async () => {
    const tomlContent = '[general]\napiEndpoint = ""';
    mockFetch(200, tomlContent);
    await fetchAndParseConfig('./config.toml');
    expect(global.fetch).toHaveBeenCalledWith('./config.toml', undefined);
  });

  it('calls fetch with Electron config path', async () => {
    const tomlContent = '[general]\napiEndpoint = ""';
    mockFetch(200, tomlContent);
    await fetchAndParseConfig('./config.toml');
    expect(global.fetch).toHaveBeenCalledWith('./config.toml', undefined);
  });
});

// ---------------------------------------------------------------------------
// preprocessToml (tested indirectly via fetchAndParseConfig)
// ---------------------------------------------------------------------------

describe('preprocessToml via fetchAndParseConfig', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not modify config when general section is absent', async () => {
    const tomlContent = `
[license]
edition = "Open Source"
`;
    mockFetch(200, tomlContent);
    const result = await fetchAndParseConfig('/config.toml');
    expect(result.config?.general).toBeUndefined();
  });

  it('does not modify config when apiEndpointText is absent', async () => {
    const tomlContent = `
[general]
apiEndpoint = "https://example.com"
`;
    mockFetch(200, tomlContent);
    const result = await fetchAndParseConfig('/config.toml');
    expect(result.config?.general?.apiEndpoint).toBe('https://example.com');
    expect(result.config?.general?.apiEndpointText).toBeUndefined();
  });

  it('handles tab escape sequence in apiEndpointText', async () => {
    const tomlContent = `
[general]
apiEndpointText = "Column1\\tColumn2"
`;
    mockFetch(200, tomlContent);
    const result = await fetchAndParseConfig('/config.toml');
    expect(result.config?.general?.apiEndpointText).toBe('Column1\tColumn2');
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
// refreshConfigAfterLogin (post-login config.toml re-read, #10912)
// ---------------------------------------------------------------------------

describe('refreshConfigAfterLogin', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete (globalThis as Record<string, unknown>).isElectron;
  });

  // A store holding the truncated pre-login document the webserver serves.
  function preLoginStore() {
    const store = createStore();
    store.set(rawConfigState, {
      general: { apiEndpoint: 'https://api.example.com' },
    });
    store.set(proxyUrlState, 'http://keep:5050');
    return store;
  }

  async function runWithTimers<T>(promise: Promise<T>, ms: number) {
    vi.useFakeTimers();
    try {
      await vi.advanceTimersByTimeAsync(ms);
      return await promise;
    } finally {
      vi.useRealTimers();
    }
  }

  it('re-reads config.toml and populates the previously missing values', async () => {
    const { refreshConfigAfterLogin, configParseErrorState } =
      await import('./useWebUIConfig');
    const store = preLoginStore();
    store.set(configParseErrorState, new Error('earlier attempt'));
    mockFetch(
      200,
      `
[general]
apiEndpoint = "https://api.example.com"

[wsproxy]
proxyURL = "http://127.0.0.1:5050/"

[license]
edition = "Enterprise"
validUntil = "2030-12-31"

[plugin]
login = "custom-login"
`,
    );

    await expect(refreshConfigAfterLogin(store)).resolves.toBe('refreshed');

    expect(store.get(proxyUrlState)).toBe('http://127.0.0.1:5050/');
    expect(store.get(loginPluginState)).toBe('custom-login');
    expect(store.get(loginConfigState)?.proxy_url).toBe(
      'http://127.0.0.1:5050/',
    );
    expect((globalThis as any).packageEdition).toBe('Enterprise');
    expect((globalThis as any).packageValidUntil).toBe('2030-12-31');
    expect(store.get(configLoadedState)).toBe(true);
    expect(store.get(configParseErrorState)).toBeNull();
  });

  it('leaves the defaults alone when there was no config.toml before login', async () => {
    const { refreshConfigAfterLogin, didLastConfigRefreshFail } =
      await import('./useWebUIConfig');
    const store = createStore();
    global.fetch = vi.fn();

    await expect(refreshConfigAfterLogin(store)).resolves.toBe('unchanged');

    expect(global.fetch).not.toHaveBeenCalled();
    expect(didLastConfigRefreshFail()).toBe(false);
  });

  it('skips the re-read on Electron, keeping the merged webserver config', async () => {
    const { refreshConfigAfterLogin } = await import('./useWebUIConfig');
    (globalThis as Record<string, unknown>).isElectron = true;
    const store = preLoginStore();
    global.fetch = vi.fn();

    await expect(refreshConfigAfterLogin(store)).resolves.toBe('unchanged');

    expect(global.fetch).not.toHaveBeenCalled();
    expect(store.get(proxyUrlState)).toBe('http://keep:5050');
  });

  it('waits for an in-flight bootstrap so it cannot overwrite the refresh', async () => {
    const { refreshConfigAfterLogin, initializeConfigOnce } =
      await import('./useWebUIConfig');
    const store = createStore();
    let releaseBootstrap!: () => void;
    global.fetch = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<Response>((resolve) => {
            releaseBootstrap = () =>
              resolve({
                status: 200,
                text: () =>
                  Promise.resolve(
                    '[general]\napiEndpoint = "https://api.example.com"',
                  ),
                headers: new Headers({
                  'content-type': 'application/octet-stream',
                }),
              } as unknown as Response);
          }),
      )
      .mockResolvedValue({
        status: 200,
        text: () =>
          Promise.resolve('[wsproxy]\nproxyURL = "http://post-login:5050/"'),
        headers: new Headers({ 'content-type': 'application/octet-stream' }),
      } as unknown as Response);

    const bootstrap = initializeConfigOnce(store, { error() {}, warn() {} });
    const refresh = refreshConfigAfterLogin(store);
    releaseBootstrap();
    await bootstrap;

    await expect(refresh).resolves.toBe('refreshed');
    expect(store.get(proxyUrlState)).toBe('http://post-login:5050/');
  });

  it('keeps the pre-login state when the re-fetch finds no config', async () => {
    const { refreshConfigAfterLogin } = await import('./useWebUIConfig');
    const store = preLoginStore();
    mockFetch(404, '');

    await expect(
      runWithTimers(refreshConfigAfterLogin(store), 2000),
    ).resolves.toBe('failed');

    expect(store.get(proxyUrlState)).toBe('http://keep:5050');
    expect(store.get(configLoadedState)).toBe(false);
  });

  it('treats an empty document as a failed read, not as a config', async () => {
    const { refreshConfigAfterLogin } = await import('./useWebUIConfig');
    const store = preLoginStore();
    mockFetch(200, '');

    await expect(
      runWithTimers(refreshConfigAfterLogin(store), 2000),
    ).resolves.toBe('failed');

    expect(store.get(proxyUrlState)).toBe('http://keep:5050');
    expect(store.get(loginConfigState)).toBeNull();
  });

  it('records a parse error but keeps the pre-login state', async () => {
    const { refreshConfigAfterLogin, configParseErrorState } =
      await import('./useWebUIConfig');
    const store = preLoginStore();
    mockFetch(200, '[general]\ninvalid toml = = =');

    await runWithTimers(refreshConfigAfterLogin(store), 2000);

    expect(store.get(configParseErrorState)).toBeTruthy();
    expect(store.get(proxyUrlState)).toBe('http://keep:5050');
  });

  it('retries and succeeds on a later attempt', async () => {
    const { refreshConfigAfterLogin, didLastConfigRefreshFail } =
      await import('./useWebUIConfig');
    const store = preLoginStore();
    const tomlContent = '[general]\napiEndpoint = "https://api.example.com"';
    global.fetch = vi
      .fn()
      .mockRejectedValueOnce(new Error('network blip'))
      .mockRejectedValueOnce(new Error('network blip'))
      .mockResolvedValue({
        status: 200,
        text: () => Promise.resolve(tomlContent),
        headers: new Headers({ 'content-type': 'application/octet-stream' }),
      } as unknown as Response);

    await expect(
      runWithTimers(refreshConfigAfterLogin(store), 2000),
    ).resolves.toBe('refreshed');

    expect(global.fetch).toHaveBeenCalledTimes(3);
    expect(store.get(configLoadedState)).toBe(true);
    expect(didLastConfigRefreshFail()).toBe(false);
  });

  it('gives up after all attempts fail and flags the failure', async () => {
    const { refreshConfigAfterLogin, didLastConfigRefreshFail } =
      await import('./useWebUIConfig');
    const store = preLoginStore();
    global.fetch = vi.fn().mockRejectedValue(new Error('network down'));

    await expect(
      runWithTimers(refreshConfigAfterLogin(store), 2000),
    ).resolves.toBe('failed');

    expect(global.fetch).toHaveBeenCalledTimes(3);
    expect(store.get(proxyUrlState)).toBe('http://keep:5050');
    expect(store.get(configLoadedState)).toBe(false);
    expect(didLastConfigRefreshFail()).toBe(true);
  });

  it('aborts an attempt whose fetch exceeds the per-attempt timeout', async () => {
    const { refreshConfigAfterLogin } = await import('./useWebUIConfig');
    const store = preLoginStore();
    const warn = vi.fn();
    // Only the AbortController timeout can end each attempt.
    const hangingFetch = (
      _input: unknown,
      init?: { signal?: AbortSignal },
    ): Promise<Response> =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () =>
          reject(new Error('aborted')),
        );
      });
    global.fetch = vi.fn(hangingFetch as unknown as typeof fetch);

    // 3 attempts x 5s timeout + 500ms/1000ms backoff between them.
    await expect(
      runWithTimers(
        refreshConfigAfterLogin(store, { error() {}, warn }),
        17000,
      ),
    ).resolves.toBe('failed');

    expect(global.fetch).toHaveBeenCalledTimes(3);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('timed out'));
  });

  it('aborts an attempt whose body read stalls past the timeout', async () => {
    const { refreshConfigAfterLogin } = await import('./useWebUIConfig');
    const store = preLoginStore();
    global.fetch = vi.fn().mockResolvedValue({
      status: 200,
      text: () => new Promise<string>(() => {}),
      headers: new Headers({ 'content-type': 'application/octet-stream' }),
    } as unknown as Response);

    await expect(
      runWithTimers(refreshConfigAfterLogin(store), 17000),
    ).resolves.toBe('failed');

    expect(global.fetch).toHaveBeenCalledTimes(3);
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
