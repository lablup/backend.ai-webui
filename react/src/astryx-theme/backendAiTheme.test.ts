import {
  ANTD_ALIGN_TOKENS,
  BAI_DEFAULT_SEEDS,
  backendAiAdminTheme,
  backendAiBrandTheme,
  backendAiSecondaryTheme,
  buildBackendAiTheme,
  computeThemeName,
  resolveDarkSeed,
  themeOptionsFromConfig,
} from './backendAiTheme';
import { builtBackendAiBrandTheme } from './built';
import { resolveRoleTheme } from './resolveRoleTheme';

describe('backendAiTheme', () => {
  describe('dark tuples (settled decision: measured darkAlgorithm outputs)', () => {
    it('maps the shipped dark seeds to the measured antd outputs', () => {
      expect(resolveDarkSeed('#DC6B03')).toBe('#be5e06'); // colorPrimary
      expect(resolveDarkSeed('#dc6b03')).toBe('#be5e06'); // case-insensitive
      expect(resolveDarkSeed('#DC4446')).toBe('#be3d3f'); // colorError
      expect(resolveDarkSeed('#03A487')).toBe('#068e76'); // colorSuccess
      expect(resolveDarkSeed('#009BDD')).toBe('#0387bf'); // colorInfo
      expect(resolveDarkSeed('#FAAD14')).toBe('#d89614'); // colorWarning
    });

    it('passes unknown (rebranded) seeds through verbatim — PILOT-DECISION', () => {
      expect(resolveDarkSeed('#123456')).toBe('#123456');
    });

    it('pins the brand accent tuple to [light seed, measured dark]', () => {
      // defineTheme normalizes [light, dark] tuples to light-dark() strings.
      expect(backendAiBrandTheme.tokens?.['--color-accent']).toBe(
        'light-dark(#FF7A00, #be5e06)',
      );
    });
  });

  describe('antd value alignment (the 6 known diffs)', () => {
    it.each([
      ['--radius-element', '8px'], // borderRadiusLG 8 (Astryx 10)
      ['--font-size-lg', '16px'], // fontSizeLG + fontSizeHeading5 (Astryx 17)
      ['--font-size-4xl', '38px'], // fontSizeHeading1 (Astryx 35)
      ['--duration-slow', '300ms'], // motionDurationSlow (Astryx 700ms)
    ] as const)('%s -> %s', (token, value) => {
      expect(backendAiBrandTheme.tokens?.[token]).toBe(value);
    });

    it('replaces --shadow-med with the antd boxShadowSecondary recipes', () => {
      const shadow = backendAiBrandTheme.tokens?.['--shadow-med'];
      expect(shadow).toBe(ANTD_ALIGN_TOKENS['--shadow-med']);
      // One string, light-dark() per COLOR position — a [light, dark] tuple
      // of full recipes would serialize to invalid CSS (light-dark takes
      // colors only) and silently drop box-shadow at every use site.
      expect(shadow).toContain(
        'light-dark(rgba(0,0,0,0.08), rgba(255,255,255,0.016))',
      );
      expect(shadow).not.toMatch(/^light-dark\(/);
    });
  });

  describe('theme name numbering', () => {
    it('is deterministic and encodes rev/family/role', () => {
      const name = computeThemeName();
      expect(name).toBe(computeThemeName({ family: 'default', role: 'brand' }));
      expect(name).toMatch(/^bai-r1-default-brand-h[a-z0-9]+$/);
    });

    it('changes when any CSS-affecting seed changes (no silent first-wins)', () => {
      const base = computeThemeName();
      expect(
        computeThemeName({ error: { light: '#AA0000', dark: '#AA0000' } }),
      ).not.toBe(base);
      expect(
        computeThemeName({ accent: { light: '#123456', dark: '#123456' } }),
      ).not.toBe(base);
    });

    it('gives the three role singletons distinct names', () => {
      const names = new Set([
        backendAiBrandTheme.name,
        backendAiAdminTheme.name,
        backendAiSecondaryTheme.name,
      ]);
      expect(names.size).toBe(3);
    });

    it('returns the SAME instance for the same seed set (registry-safe)', () => {
      expect(buildBackendAiTheme()).toBe(backendAiBrandTheme);
    });
  });

  describe('prebuilt production path', () => {
    it('built artifact matches the current default recipe (else rebuild — see built/index.ts)', () => {
      expect(builtBackendAiBrandTheme.name).toBe(
        computeThemeName({ role: 'brand' }),
      );
      expect(builtBackendAiBrandTheme.__built).toBe(true);
    });

    it('resolveRoleTheme uses the prebuilt theme for the shipped defaults', () => {
      expect(resolveRoleTheme(undefined, 'brand')).toBe(
        builtBackendAiBrandTheme,
      );
      // A theme.json that restates the shipped values is still the built theme.
      expect(
        resolveRoleTheme(
          {
            fontFamily: BAI_DEFAULT_SEEDS.fontFamily,
            light: { token: { colorPrimary: '#FF7A00' } },
            dark: { token: { colorPrimary: '#DC6B03' } },
          },
          'brand',
        ),
      ).toBe(builtBackendAiBrandTheme);
    });

    it('resolveRoleTheme falls back to a runtime theme for overridden seeds', () => {
      const runtime = resolveRoleTheme(
        {
          light: { token: { colorPrimary: '#8B5CF6' } },
          dark: { token: { colorPrimary: '#A78BFA' } },
        },
        'brand',
      );
      expect(runtime).not.toBe(builtBackendAiBrandTheme);
      expect(runtime.name).not.toBe(builtBackendAiBrandTheme.name);
      // Unknown dark seed: verbatim (PILOT-DECISION).
      expect(runtime.tokens?.['--color-accent']).toBe(
        'light-dark(#8B5CF6, #A78BFA)',
      );
    });
  });

  describe('theme.json runtime override path', () => {
    it('maps roles to their accent keys (brand/admin/secondary)', () => {
      const config = {
        light: {
          token: {
            colorPrimary: '#FF7A00',
            colorInfo: '#028DF2',
            colorSuccess: '#00BD9B',
          },
        },
        dark: {
          token: {
            colorPrimary: '#DC6B03',
            colorInfo: '#009BDD',
            colorSuccess: '#03A487',
          },
        },
      };
      expect(themeOptionsFromConfig(config, 'brand').accent).toEqual({
        light: '#FF7A00',
        dark: '#DC6B03',
      });
      expect(themeOptionsFromConfig(config, 'admin').accent).toEqual({
        light: '#028DF2',
        dark: '#009BDD',
      });
      expect(themeOptionsFromConfig(config, 'secondary').accent).toEqual({
        light: '#00BD9B',
        dark: '#03A487',
      });
    });

    it('reuses the light seed when a config declares no dark seed', () => {
      const options = themeOptionsFromConfig(
        { light: { token: { colorPrimary: '#123456' } } },
        'brand',
      );
      expect(options.accent).toEqual({ light: '#123456', dark: '#123456' });
    });
  });
});
