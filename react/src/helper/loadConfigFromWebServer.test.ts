/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  fetchAndParseConfig,
  fetchAppConfigOnce,
} from '../hooks/useWebUIConfig';
import { loadConfigFromWebServer } from './loginSessionAuth';
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

const serverConfigs: Record<string, Record<string, any>> = {
  'https://a.example/config.toml': {
    general: { signupSupport: true },
    plugin: { login: 'a-login' },
  },
  'https://b.example/config.toml': { general: { allowSignout: true } },
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
      config: { general: { apiEndpoint: '' }, plugin: { login: 'bundled' } },
    } as any);
    vi.mocked(fetchAndParseConfig).mockImplementation(
      async (url: string) =>
        ({ config: structuredClone(serverConfigs[url]) }) as any,
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
