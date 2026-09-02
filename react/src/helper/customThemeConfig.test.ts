import type { BAIAppearanceConfig } from './customThemeConfig';
import type { Mock } from 'vitest';

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

  const mockStaticDoc = (staticDoc: unknown) => {
    fetchMock.mockImplementation((url: string) => {
      if (url === 'resources/theme.json') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(staticDoc),
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
    mockStaticDoc(V2_THEME);

    mod.loadCustomThemeConfig();
    await flush();

    expect(mod.getCustomTheme()).toEqual(V2_THEME);
    expect(mod.getStaticAppearanceConfig()).toEqual(V2_THEME);
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
    mockStaticDoc(V1_THEME);

    mod.loadCustomThemeConfig();
    await flush();

    expect(mod.getCustomTheme()).toBeUndefined();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('v1 (antd-shaped)'),
    );
  });

  it('injects font CSS from theme.fontFamily', async () => {
    const mod = await importFreshModule();
    mockStaticDoc(V2_THEME);

    mod.loadCustomThemeConfig();
    await flush();

    const link = document.head.querySelector(
      'link[href="resources/fonts/ubuntu/ubuntu.css"]',
    );
    expect(link).not.toBeNull();
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
