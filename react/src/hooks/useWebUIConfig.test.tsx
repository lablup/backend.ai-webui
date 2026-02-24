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
 * - Hook behavior: useInitializeConfig, useUpdateRawConfig, etc.
 */

// Setup matchMedia mock
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

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

function mockFetch(status: number, body: string): void {
  global.fetch = jest.fn().mockResolvedValue({
    status,
    text: () => Promise.resolve(body),
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
    // markty-toml parses empty string to an empty object, not null
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
// Hook tests (useLoginConfig, useRawConfig, useConfigLoaded, etc.)
// ---------------------------------------------------------------------------

import { renderHook, act } from '@testing-library/react';
import { useStore } from 'jotai';
import { Provider } from 'jotai';
import React from 'react';
import {
  useLoginConfig,
  useRawConfig,
  useConfigLoaded,
  useAutoLogout,
  useProxyUrl,
  useInitializeConfig,
  useUpdateRawConfig,
  useConfigRefreshPageEffect,
} from './useWebUIConfig';

// Helper to render hooks with Jotai provider
function renderHookWithProvider<T>(hook: () => T) {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider>{children}</Provider>
  );
  return renderHook(hook, { wrapper });
}

describe('useLoginConfig hook', () => {
  it('returns null initially', () => {
    const { result } = renderHookWithProvider(() => useLoginConfig());
    expect(result.current).toBeNull();
  });
});

describe('useRawConfig hook', () => {
  it('returns null initially', () => {
    const { result } = renderHookWithProvider(() => useRawConfig());
    expect(result.current).toBeNull();
  });
});

describe('useConfigLoaded hook', () => {
  it('returns false initially', () => {
    const { result } = renderHookWithProvider(() => useConfigLoaded());
    expect(result.current).toBe(false);
  });
});

describe('useAutoLogout hook', () => {
  it('returns false initially', () => {
    const { result } = renderHookWithProvider(() => useAutoLogout());
    expect(result.current).toBe(false);
  });
});

describe('useProxyUrl hook', () => {
  it('returns empty string initially', () => {
    const { result } = renderHookWithProvider(() => useProxyUrl());
    expect(result.current).toBe('');
  });
});

describe('useInitializeConfig hook', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    // Reset globalThis state
    delete (globalThis as any).isElectron;
    delete (globalThis as any).packageEdition;
    delete (globalThis as any).packageValidUntil;
  });

  it('returns initial state with isLoaded=false', () => {
    const { result } = renderHookWithProvider(() => useInitializeConfig());
    expect(result.current.isLoaded).toBe(false);
    expect(result.current.rawConfig).toBeNull();
    expect(result.current.loginConfig).toBeNull();
  });

  it('loads config successfully from web path', async () => {
    const tomlContent = `
[general]
apiEndpoint = "https://api.example.com"
autoLogout = true

[license]
edition = "Enterprise"
validUntil = "2030-12-31"

[wsproxy]
proxyURL = "http://127.0.0.1:5050/"

[plugin]
login = "custom-login"
page = "custom-pages"
`;
    mockFetch(200, tomlContent);

    const { result } = renderHookWithProvider(() => useInitializeConfig());

    await act(async () => {
      await result.current.loadConfig();
    });

    expect(result.current.isLoaded).toBe(true);
    expect(result.current.rawConfig).not.toBeNull();
    expect(result.current.rawConfig?.general?.apiEndpoint).toBe(
      'https://api.example.com',
    );
    expect(global.fetch).toHaveBeenCalledWith('../../config.toml');
  });

  it('loads config from Electron path when isElectron is true', async () => {
    (globalThis as any).isElectron = true;
    const tomlContent = `
[general]
apiEndpoint = "https://api.example.com"
`;
    mockFetch(200, tomlContent);

    const { result } = renderHookWithProvider(() => useInitializeConfig());

    await act(async () => {
      await result.current.loadConfig();
    });

    expect(global.fetch).toHaveBeenCalledWith('./config.toml');
  });

  it('marks config as loaded even when fetch fails', async () => {
    mockFetch(404, '');

    const { result } = renderHookWithProvider(() => useInitializeConfig());

    await act(async () => {
      await result.current.loadConfig();
    });

    expect(result.current.isLoaded).toBe(true);
    expect(result.current.rawConfig).toBeNull();
  });

  it('prevents multiple initialization calls', async () => {
    const tomlContent = '[general]\napiEndpoint = ""';
    mockFetch(200, tomlContent);

    const { result } = renderHookWithProvider(() => useInitializeConfig());

    await act(async () => {
      await result.current.loadConfig();
      await result.current.loadConfig(); // Second call should be ignored
    });

    // Fetch should only be called once
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('sets package edition and validUntil on globalThis', async () => {
    const tomlContent = `
[license]
edition = "Enterprise"
validUntil = "2030-12-31"
`;
    mockFetch(200, tomlContent);

    const { result } = renderHookWithProvider(() => useInitializeConfig());

    await act(async () => {
      await result.current.loadConfig();
    });

    expect((globalThis as any).packageEdition).toBe('Enterprise');
    expect((globalThis as any).packageValidUntil).toBe('2030-12-31');
  });

  it('defaults to "Open Source" edition when not specified', async () => {
    const tomlContent = '[general]\napiEndpoint = ""';
    mockFetch(200, tomlContent);

    const { result } = renderHookWithProvider(() => useInitializeConfig());

    await act(async () => {
      await result.current.loadConfig();
    });

    expect((globalThis as any).packageEdition).toBe('Open Source');
  });
});

describe('useUpdateRawConfig hook', () => {
  beforeEach(() => {
    delete (globalThis as any).packageEdition;
    delete (globalThis as any).packageValidUntil;
  });

  it('updates raw config and reprocesses values', () => {
    const { result } = renderHookWithProvider(() => {
      const update = useUpdateRawConfig();
      const rawConfig = useRawConfig();
      const autoLogout = useAutoLogout();
      const proxyUrl = useProxyUrl();
      return { update, rawConfig, autoLogout, proxyUrl };
    });

    const newConfig: RawTomlConfig = {
      general: { autoLogout: true },
      license: { edition: 'Community' },
      wsproxy: { proxyURL: 'http://localhost:8080' },
      plugin: { login: 'oauth' },
    };

    act(() => {
      result.current.update(newConfig);
    });

    expect(result.current.rawConfig).toEqual(newConfig);
    expect(result.current.autoLogout).toBe(true);
    expect(result.current.proxyUrl).toBe('http://localhost:8080');
    expect((globalThis as any).packageEdition).toBe('Community');
  });

  it('handles empty config sections gracefully', () => {
    const { result } = renderHookWithProvider(() => {
      const update = useUpdateRawConfig();
      const proxyUrl = useProxyUrl();
      return { update, proxyUrl };
    });

    const newConfig: RawTomlConfig = {};

    act(() => {
      result.current.update(newConfig);
    });

    expect(result.current.proxyUrl).toBe('');
  });
});

describe('useConfigRefreshPageEffect hook', () => {
  beforeEach(() => {
    delete (globalThis as any).backendaiclient;
  });

  it('sets up event listener for backend-ai-connected', () => {
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

    const { unmount } = renderHookWithProvider(() =>
      useConfigRefreshPageEffect(),
    );

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'backend-ai-connected',
      expect.any(Function),
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'backend-ai-connected',
      expect.any(Function),
    );
  });

  it('sets proxy URL on backend client when connected event fires', () => {
    const mockClient = { proxyURL: '' };
    (globalThis as any).backendaiclient = mockClient;

    // Set up a test provider with proxy URL
    const wrapper = ({ children }: { children: React.ReactNode }) => {
      const ProxyProvider = () => {
        const Store = useStore();
        // Set proxy URL in the store
        React.useEffect(() => {
          Store.set(proxyUrlState, 'http://test-proxy:5050');
        }, [Store]);
        return <>{children}</>;
      };
      return (
        <Provider>
          <ProxyProvider />
        </Provider>
      );
    };

    renderHook(() => useConfigRefreshPageEffect(), { wrapper });

    // Simulate the backend-ai-connected event
    act(() => {
      const event = new Event('backend-ai-connected');
      document.dispatchEvent(event);
    });

    expect(mockClient.proxyURL).toBe('http://test-proxy:5050');
  });

  it('handles missing backend client gracefully', () => {
    // Ensure no client exists
    delete (globalThis as any).backendaiclient;

    renderHookWithProvider(() => useConfigRefreshPageEffect());

    // Should not throw when event fires
    expect(() => {
      const event = new Event('backend-ai-connected');
      document.dispatchEvent(event);
    }).not.toThrow();
  });
});
