/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  fetchAndParseConfig,
  fetchAppConfigOnce,
} from '../hooks/useWebUIConfig';
import { loadConfigFromWebServer } from './loginSessionAuth';
import { parse } from 'smol-toml';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const store = new Map<unknown, unknown>();

vi.mock('../hooks/useWebUIConfig', () => ({
  fetchAndParseConfig: vi.fn(),
  fetchAppConfigOnce: vi.fn(),
  rawConfigState: Symbol('rawConfigState'),
  loginConfigState: Symbol('loginConfigState'),
  autoLogoutState: Symbol('autoLogoutState'),
  loginPluginState: Symbol('loginPluginState'),
}));
vi.mock('../components/DefaultProviders', () => ({
  jotaiStore: {
    get: (atom: unknown) => store.get(atom),
    set: (atom: unknown, value: unknown) => store.set(atom, value),
  },
}));
vi.mock('../RelayEnvironment', async () => {
  const { createMockEnvironment } = await import('relay-test-utils');
  return { RelayEnvironment: createMockEnvironment() };
});

// Real parser output: smol-toml >= 1.9 returns null-prototype tables.
const serverConfigs: Record<string, string> = {
  'https://a.example/config.toml': `
[general]
signupSupport = true
apiEndpoint = "https://a-webserver.example"

[plugin]
login = "a-login"

[wsproxy]
proxyURL = "https://a-proxy.example"
`,
  'https://b.example/config.toml': `
[general]
allowSignout = true
`,
  'https://c.example/config.toml': `
[resources]
maxCPUCoresPerContainer = 32
`,
};

describe('loadConfigFromWebServer', () => {
  beforeAll(async () => {
    // Installs globalThis.backendaiutils (mergeNestedObjects & co.).
    await import('../global-stores');
  });

  beforeEach(async () => {
    store.clear();
    const { rawConfigState } = await import('../hooks/useWebUIConfig');
    vi.mocked(fetchAppConfigOnce).mockResolvedValue({
      config: parse(`
[general]
apiEndpoint = ""

[plugin]
login = "bundled"

[wsproxy]
proxyURL = "https://bundled-proxy.example"
`),
    } as any);
    vi.mocked(fetchAndParseConfig).mockImplementation(
      async (url: string) =>
        ({
          config: url in serverConfigs ? parse(serverConfigs[url]) : null,
        }) as any,
    );
    // Whatever the app settled on before; the merge must not build on it.
    store.set(rawConfigState, { general: { stale: true } });
  });

  it("does not carry one endpoint's server config into the next", async () => {
    const { rawConfigState } = await import('../hooks/useWebUIConfig');
    await loadConfigFromWebServer('https://a.example');
    expect(store.get(rawConfigState)).toMatchObject({
      general: { signupSupport: true },
    });

    await loadConfigFromWebServer('https://b.example');
    const merged = store.get(rawConfigState) as Record<string, any>;
    expect(merged.general).toEqual({ apiEndpoint: '', allowSignout: true });
    expect(merged.plugin).toEqual({ login: 'bundled' });
  });

  it('feeds null-prototype tables, as smol-toml returns them', () => {
    const parsed = parse(serverConfigs['https://a.example/config.toml']);
    expect(Object.getPrototypeOf(parsed.general)).toBeNull();
  });

  it("strips the webserver's own endpoint and wsproxy before merging", async () => {
    const { rawConfigState } = await import('../hooks/useWebUIConfig');
    await loadConfigFromWebServer('https://a.example');
    const merged = store.get(rawConfigState) as Record<string, any>;
    expect(merged.general).toEqual({ apiEndpoint: '', signupSupport: true });
    expect(merged.wsproxy).toEqual({
      proxyURL: 'https://bundled-proxy.example',
    });
  });

  it('deep-merges sections the bundled config also has', async () => {
    const { rawConfigState } = await import('../hooks/useWebUIConfig');
    await loadConfigFromWebServer('https://c.example');
    const merged = store.get(rawConfigState) as Record<string, any>;
    expect(merged.general).toEqual({ apiEndpoint: '' });
    expect(merged.resources).toEqual({ maxCPUCoresPerContainer: 32 });
    expect(merged.plugin).toEqual({ login: 'bundled' });
  });

  it('keeps the bundled login plugin', async () => {
    const { loginPluginState } = await import('../hooks/useWebUIConfig');
    await loadConfigFromWebServer('https://a.example');
    expect(store.has(loginPluginState)).toBe(false);
  });

  it("keeps a sub-path deployment's last segment and bounds the fetch", async () => {
    await loadConfigFromWebServer('https://host.example/webui');
    expect(fetchAndParseConfig).toHaveBeenCalledWith(
      'https://host.example/webui/config.toml',
      expect.any(Number),
    );
  });

  it("reports the page's own domain for the same-origin endpoint", async () => {
    vi.mocked(fetchAndParseConfig).mockClear();
    vi.mocked(fetchAppConfigOnce).mockResolvedValue({
      config: {
        general: {
          apiDomainName: 'default',
          apiEndpoint: window.location.origin,
        },
      },
    } as any);
    await expect(
      loadConfigFromWebServer(window.location.origin),
    ).resolves.toEqual({ status: 'loaded', domainName: 'default' });
    expect(fetchAndParseConfig).not.toHaveBeenCalled();
  });

  it("drops the previous server's config when the same origin is confirmed", async () => {
    const { rawConfigState } = await import('../hooks/useWebUIConfig');
    await loadConfigFromWebServer('https://a.example');
    await loadConfigFromWebServer(window.location.origin);
    const merged = store.get(rawConfigState) as Record<string, any>;
    expect(merged.general).toEqual({ apiEndpoint: '' });
  });
});
