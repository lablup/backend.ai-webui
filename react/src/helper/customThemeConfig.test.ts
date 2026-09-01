import type { BAIAppearanceConfig } from './customThemeConfig';
import type { Mock } from 'vitest';

// The loader resolves the pre-login domain and REST base through these two
// helpers; both are controlled per test via the hoisted state below.
const resolverState = vi.hoisted(() => ({
  apiDomainName: undefined as string | undefined,
  apiEndpoint: '' as string,
}));

vi.mock('../hooks/useWebUIConfig', () => ({
  fetchAndParseConfig: vi.fn(async () => ({
    config: { general: { apiDomainName: resolverState.apiDomainName } },
  })),
}));
vi.mock('../hooks/useResolvedApiEndpoint', () => ({
  resolveApiEndpoint: vi.fn(async () => resolverState.apiEndpoint),
}));

const V2_THEME: BAIAppearanceConfig = {
  schemaVersion: 2,
  theme: {
    fontFamily: "'Ubuntu', Roboto, sans-serif",
    families: {
      default: {
        seeds: { accent: ['#FF7A00', '#DC6B03'] },
        headerBg: ['#FF9729', '#E88A28'],
      },
    },
  },
  branding: {
    logo: { src: '/logo.png', srcCollapsed: '/logo-small.png' },
    companyName: 'Lablup Inc.',
  },
};

const V2_DOMAIN_THEME: BAIAppearanceConfig = {
  schemaVersion: 2,
  theme: {
    families: {
      default: { seeds: { accent: '#123456' } },
    },
  },
  branding: { brandName: 'Acme AI' },
};

const V1_THEME = {
  fontFamily: "'Ubuntu', Roboto, sans-serif",
  light: { token: { colorPrimary: '#FF7A00' } },
  dark: { token: { colorPrimary: '#DC6B03' } },
  logo: { src: '/logo.png', srcCollapsed: '/logo-small.png' },
};

describe('customThemeConfig (v2 appearance bootstrap)', () => {
  let fetchMock: Mock;
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    vi.resetModules();
    originalFetch = global.fetch;
    fetchMock = vi.fn();
    global.fetch = fetchMock as unknown as typeof global.fetch;
    resolverState.apiDomainName = undefined;
    resolverState.apiEndpoint = '';
    // @ts-ignore
    delete globalThis.backendaiclient;
    document.head
      .querySelectorAll('link[rel="stylesheet"]')
      .forEach((el) => el.remove());
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  const importFreshModule = async () => await import('./customThemeConfig');

  // Route the fetch mock by URL: theme.json and the anonymous app-config
  // REST endpoint.
  const mockFetchRoutes = ({
    staticDoc,
    publicConfigByDomain,
    restStatus = 200,
  }: {
    staticDoc?: unknown;
    publicConfigByDomain?: unknown;
    restStatus?: number;
  }) => {
    fetchMock.mockImplementation((url: string) => {
      if (url === 'resources/theme.json') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(staticDoc),
        } as unknown as Response);
      }
      if (String(url).endsWith('/func/v2/app-config/public/get')) {
        return Promise.resolve({
          ok: restStatus === 200,
          status: restStatus,
          json: () =>
            Promise.resolve({
              app_configs: [
                {
                  config_name: 'publicConfigByDomain',
                  config: publicConfigByDomain,
                },
              ],
            }),
        } as unknown as Response);
      }
      return Promise.reject(new Error(`Unexpected fetch: ${url}`));
    });
  };

  const flush = () => new Promise((resolve) => setTimeout(resolve, 50));

  it('returns undefined before any load', async () => {
    const mod = await importFreshModule();
    expect(mod.getCustomTheme()).toBeUndefined();
  });

  it('loads a v2 theme.json and dispatches custom-theme-loaded once', async () => {
    const mod = await importFreshModule();
    const dispatchEventSpy = vi.spyOn(document, 'dispatchEvent');
    mockFetchRoutes({ staticDoc: V2_THEME });

    mod.loadCustomThemeConfig();
    await flush();

    expect(mod.getCustomTheme()).toEqual(V2_THEME);
    expect(mod.getStaticAppearanceConfig()).toEqual(V2_THEME);
    expect(mod.getDomainAppearanceConfig()).toBeUndefined();
    expect(
      dispatchEventSpy.mock.calls.filter(
        ([e]) => (e as CustomEvent).type === 'custom-theme-loaded',
      ),
    ).toHaveLength(1);
  });

  it('rejects a v1 (antd-shaped) theme.json loudly', async () => {
    const mod = await importFreshModule();
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    mockFetchRoutes({ staticDoc: V1_THEME });

    mod.loadCustomThemeConfig();
    await flush();

    expect(mod.getCustomTheme()).toBeUndefined();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('v1 (antd-shaped)'),
    );
  });

  it('injects font CSS from theme.fontFamily', async () => {
    const mod = await importFreshModule();
    mockFetchRoutes({ staticDoc: V2_THEME });

    mod.loadCustomThemeConfig();
    await flush();

    const link = document.head.querySelector(
      'link[href="resources/fonts/ubuntu/ubuntu.css"]',
    );
    expect(link).not.toBeNull();
  });

  describe('domain document resolution', () => {
    it('the saved domain appearance slice wins wholesale over theme.json', async () => {
      resolverState.apiDomainName = 'default';
      resolverState.apiEndpoint = 'https://api.example.com';
      const mod = await importFreshModule();
      mockFetchRoutes({
        staticDoc: V2_THEME,
        publicConfigByDomain: {
          default: { appearance: V2_DOMAIN_THEME },
        },
      });

      mod.loadCustomThemeConfig();
      await flush();

      expect(mod.getCustomTheme()).toEqual(V2_DOMAIN_THEME);
      expect(mod.getDomainAppearanceConfig()).toEqual(V2_DOMAIN_THEME);
      expect(mod.getStaticAppearanceConfig()).toEqual(V2_THEME);
    });

    it('skips the REST fetch entirely when no domain is known', async () => {
      const mod = await importFreshModule();
      mockFetchRoutes({ staticDoc: V2_THEME });

      mod.loadCustomThemeConfig();
      await flush();

      expect(mod.getCustomTheme()).toEqual(V2_THEME);
      expect(
        fetchMock.mock.calls.filter(([url]) =>
          String(url).includes('app-config'),
        ),
      ).toHaveLength(0);
    });

    it('falls back to theme.json when the REST fetch fails', async () => {
      resolverState.apiDomainName = 'default';
      resolverState.apiEndpoint = 'https://api.example.com';
      const mod = await importFreshModule();
      mockFetchRoutes({ staticDoc: V2_THEME, restStatus: 500 });

      mod.loadCustomThemeConfig();
      await flush();

      expect(mod.getCustomTheme()).toEqual(V2_THEME);
      expect(mod.getDomainAppearanceConfig()).toBeUndefined();
    });

    it('ignores an invalid (v1-shaped) domain slice and keeps theme.json', async () => {
      resolverState.apiDomainName = 'default';
      resolverState.apiEndpoint = 'https://api.example.com';
      const mod = await importFreshModule();
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      mockFetchRoutes({
        staticDoc: V2_THEME,
        publicConfigByDomain: { default: { appearance: V1_THEME } },
      });

      mod.loadCustomThemeConfig();
      await flush();

      expect(mod.getCustomTheme()).toEqual(V2_THEME);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('prefers the connected session domain and endpoint over config.toml', async () => {
      resolverState.apiDomainName = 'from-toml';
      globalThis.backendaiclient = {
        _config: {
          domainName: 'session-domain',
          endpoint: 'https://session.example.com/',
        },
      } as never;
      const mod = await importFreshModule();
      mockFetchRoutes({
        staticDoc: V2_THEME,
        publicConfigByDomain: {
          'session-domain': { appearance: V2_DOMAIN_THEME },
        },
      });

      mod.loadCustomThemeConfig();
      await flush();

      expect(mod.getCustomTheme()).toEqual(V2_DOMAIN_THEME);
      const restCall = fetchMock.mock.calls.find(([url]) =>
        String(url).includes('app-config'),
      );
      expect(String(restCall?.[0])).toBe(
        'https://session.example.com/func/v2/app-config/public/get',
      );
    });
  });

  describe('pickSeed', () => {
    it('resolves a tuple per scheme and a string for both', async () => {
      const mod = await importFreshModule();
      expect(mod.pickSeed(['#111111', '#222222'], 'light')).toBe('#111111');
      expect(mod.pickSeed(['#111111', '#222222'], 'dark')).toBe('#222222');
      expect(mod.pickSeed('#333333', 'light')).toBe('#333333');
      expect(mod.pickSeed('#333333', 'dark')).toBe('#333333');
      expect(mod.pickSeed(undefined, 'light')).toBeUndefined();
      // A short or malformed tuple falls back dark -> light (recipe parity)
      // instead of handing a non-string to the consumer.
      expect(mod.pickSeed(['#111111'] as never, 'dark')).toBe('#111111');
      expect(mod.pickSeed([null, '#222222'] as never, 'light')).toBeUndefined();
    });
  });

  describe('pickValidAppearanceConfig', () => {
    it('accepts only schemaVersion 2 plain objects', async () => {
      const mod = await importFreshModule();
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      expect(mod.pickValidAppearanceConfig(V2_THEME, 'test')).toEqual(V2_THEME);
      expect(mod.pickValidAppearanceConfig(undefined, 'test')).toBeUndefined();
      expect(mod.pickValidAppearanceConfig('nope', 'test')).toBeUndefined();
      expect(mod.pickValidAppearanceConfig({}, 'test')).toBeUndefined();
      expect(mod.pickValidAppearanceConfig(V1_THEME, 'test')).toBeUndefined();
      // Every rejection is loud, not just the v1 sniff: 'nope', undefined,
      // a schemaVersion-less object and the v1 document each log once.
      expect(consoleErrorSpy).toHaveBeenCalledTimes(4);
      expect(consoleErrorSpy).toHaveBeenLastCalledWith(
        expect.stringContaining('v1 (antd-shaped)'),
      );
    });

    it('warns when theme.families lacks the default entry but still accepts', async () => {
      const mod = await importFreshModule();
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const doc = {
        schemaVersion: 2,
        theme: { families: { stained: { seeds: { accent: '#8B5CF6' } } } },
      };
      expect(mod.pickValidAppearanceConfig(doc, 'test')).toEqual(doc);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('without a "default" entry'),
      );
    });
  });
});
