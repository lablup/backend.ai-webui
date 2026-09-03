import themeJson from '../../../resources/theme.json';
import type { BAIThemeConfig } from '../helper/customThemeConfig';
import {
  ANTD_ALIGN_TOKENS,
  buildBackendAITheme,
  computeThemeName,
  themeOptionsFromConfig,
  THEME_NAME_REV,
} from './backendAiTheme';
import { builtBackendAiBrandTheme } from './built';
import { resolveRoleTheme } from './resolveRoleTheme';
import { neutralTheme } from '@astryxdesign/theme-neutral';

// The shipped document is the only source of brand values: every default the
// tests reason about is read from it, never restated here.
const shippedTheme = themeJson.theme as unknown as BAIThemeConfig;
const shippedOptions = themeOptionsFromConfig(shippedTheme, 'brand');
const brandTheme = buildBackendAITheme(shippedOptions);

describe('backendAiTheme', () => {
  describe('dark tuples (declared values applied verbatim)', () => {
    it('pins the brand accent tuple to the declared [light, dark]', () => {
      // defineTheme normalizes [light, dark] tuples to light-dark() strings.
      expect(brandTheme.tokens?.['--color-accent']).toBe(
        'light-dark(#FF7A00, #DC6B03)',
      );
    });

    it('pins the muted accent so useTheme() cannot fall back to neutral grey', () => {
      expect(brandTheme.tokens?.['--color-accent-muted']).toBe(
        'light-dark(#FF7A0033, #DC6B033F)',
      );
    });
  });

  describe('no document, no brand (theme.json is the only source of brand values)', () => {
    const bare = buildBackendAITheme({});

    it('pins none of the brand families without seeds (Astryx neutral applies)', () => {
      // `extends: neutralTheme` copies the base tokens, so "not pinned" reads
      // as "equals Astryx's own value", never as a Backend.AI color.
      for (const token of [
        '--color-accent',
        '--color-on-accent',
        '--color-error',
        '--color-success',
        '--color-warning',
        '--font-family-body',
      ]) {
        expect(bare.tokens?.[token]).toBe(neutralTheme.tokens?.[token]);
      }
      expect(bare.tokens?.['--color-accent']).not.toContain('#FF7A00');
    });

    it('resolves the --bai-* vocabulary to Astryx references', () => {
      expect(bare.tokens?.['--bai-color-info']).toBe('var(--color-accent)');
      expect(bare.tokens?.['--bai-color-link']).toBe(
        'var(--color-text-accent)',
      );
      expect(bare.tokens?.['--bai-header-bg']).toBe(
        'var(--color-background-surface)',
      );
      expect(bare.tokens?.['--bai-primary-5']).toBe('var(--color-accent)');
    });

    it('keeps the structural parity pins that are not brand data', () => {
      expect(bare.tokens?.['--radius-element']).toBe('8px');
      expect(bare.tokens?.['--shadow-med']).toBe(
        ANTD_ALIGN_TOKENS['--shadow-med'],
      );
    });

    it('returns undefined options for seeds the document omits', () => {
      const options = themeOptionsFromConfig(
        { families: { default: { seeds: { accent: '#123456' } } } },
        'brand',
      );
      expect(options.accent).toEqual({ light: '#123456', dark: '#123456' });
      expect(options.error).toBeUndefined();
      expect(options.link).toBeUndefined();
      expect(options.headerBg).toBeUndefined();
      expect(options.fontFamily).toBeUndefined();
    });
  });

  describe('antd value alignment (the 6 known diffs)', () => {
    it.each([
      ['--radius-element', '8px'], // borderRadiusLG 8 (Astryx 10)
      ['--font-size-lg', '16px'], // fontSizeLG + fontSizeHeading5 (Astryx 17)
      ['--font-size-4xl', '38px'], // fontSizeHeading1 (Astryx 35)
      ['--duration-slow', '300ms'], // motionDurationSlow (Astryx 700ms)
    ] as const)('%s -> %s', (token, value) => {
      expect(brandTheme.tokens?.[token]).toBe(value);
    });

    it('replaces --shadow-med with the antd boxShadowSecondary recipes', () => {
      const shadow = brandTheme.tokens?.['--shadow-med'];
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

  describe('dropdown menu is a page surface (FR-3493)', () => {
    // Without this the panel inherits WebUIHeader's app-mode-INVERTED wash,
    // because it renders as a DOM child of the band. Nothing else guards it:
    // dropping the spread only changes the theme name, so regenerating the
    // artifacts makes every other check pass again.
    const base = brandTheme.components?.['dropdown-menu']?.base as
      Record<string, string> | undefined;

    it.each([
      [
        '--color-overlay-hover',
        'light-dark(rgba(0,0,0,0.06), rgba(255,255,255,0.08))',
      ],
      [
        '--color-overlay-pressed',
        'light-dark(rgba(0,0,0,0.15), rgba(255,255,255,0.18))',
      ],
    ] as const)('pins %s to the page pair', (prop, value) => {
      expect(base?.[prop]).toBe(value);
    });

    it('keeps the pair in sync with the tokens it restores', () => {
      // The override exists to RESTORE the page value, so it must equal the
      // theme's own token — a change to the neutral pair cannot leave the
      // menu behind. (`defineTheme` normalizes a [light, dark] tuple to a
      // `light-dark()` string, so both sides compare as strings.)
      for (const prop of [
        '--color-overlay-hover',
        '--color-overlay-pressed',
      ] as const) {
        expect(base?.[prop]).toBe(brandTheme.tokens?.[prop]);
      }
    });

    it('does not carry the density keys into a colour override', () => {
      // `dropdown-menu.base` is shared with ANTD_DROPDOWN_DENSITY; a spread
      // that replaced rather than merged would drop these.
      expect(base?.gap).toBe('0px');
      expect(base?.maxHeight).toBe('none');
    });
  });

  describe('a Selector listbox is a page surface (FR-3505)', () => {
    // `field` is the only ancestor the trigger and the popup panel share, so
    // deleting this spread silently hands the header band's inverted wash back
    // to every option row — and only changes the theme name, which regenerating
    // the artifacts makes green again.
    const base = brandTheme.components?.['field']?.base as
      Record<string, string> | undefined;

    it.each(['--color-overlay-hover', '--color-overlay-pressed'] as const)(
      'pins %s to the page token it restores',
      (prop) => {
        expect(base?.[prop]).toBe(brandTheme.tokens?.[prop]);
      },
    );
  });

  describe('theme name numbering', () => {
    it('is deterministic and encodes rev/family/role', () => {
      const name = computeThemeName(shippedOptions);
      expect(name).toBe(computeThemeName({ ...shippedOptions }));
      expect(name).toMatch(
        new RegExp(`^bai-r${THEME_NAME_REV}-default-brand-h[a-z0-9]+$`),
      );
    });

    it('changes when any CSS-affecting seed changes (no silent first-wins)', () => {
      const base = computeThemeName(shippedOptions);
      expect(
        computeThemeName({
          ...shippedOptions,
          error: { light: '#AA0000', dark: '#AA0000' },
        }),
      ).not.toBe(base);
      expect(
        computeThemeName({
          ...shippedOptions,
          accent: { light: '#123456', dark: '#123456' },
        }),
      ).not.toBe(base);
      // No seeds at all is its own name, not the shipped one.
      expect(computeThemeName({})).not.toBe(base);
    });

    it('gives the three roles distinct names for the shipped document', () => {
      const names = new Set(
        (['brand', 'admin', 'secondary'] as const).map((role) =>
          computeThemeName(themeOptionsFromConfig(shippedTheme, role)),
        ),
      );
      expect(names.size).toBe(3);
    });

    it('returns the SAME instance for the same seed set (registry-safe)', () => {
      expect(buildBackendAITheme(shippedOptions)).toBe(brandTheme);
    });
  });

  describe('prebuilt production path', () => {
    it('built artifact matches the shipped document (else rebuild — see built/index.ts)', () => {
      expect(builtBackendAiBrandTheme.name).toBe(
        computeThemeName(shippedOptions),
      );
      expect(builtBackendAiBrandTheme.__built).toBe(true);
    });

    it('resolveRoleTheme uses the prebuilt theme for the shipped document', () => {
      expect(resolveRoleTheme(shippedTheme, 'brand')).toBe(
        builtBackendAiBrandTheme,
      );
    });

    it('resolveRoleTheme without a document is the brand-less runtime theme', () => {
      const bare = resolveRoleTheme(undefined, 'brand');
      expect(bare).not.toBe(builtBackendAiBrandTheme);
      expect(bare.tokens?.['--color-accent']).toBe(
        neutralTheme.tokens?.['--color-accent'],
      );
      expect(bare.tokens?.['--bai-color-info']).toBe('var(--color-accent)');
    });

    it('resolveRoleTheme falls back to a runtime theme for overridden seeds', () => {
      const runtime = resolveRoleTheme(
        {
          families: {
            default: { seeds: { accent: ['#8B5CF6', '#A78BFA'] } },
          },
        },
        'brand',
      );
      expect(runtime).not.toBe(builtBackendAiBrandTheme);
      expect(runtime.name).not.toBe(builtBackendAiBrandTheme.name);
      // The declared dark value is pinned verbatim: no dark-palette re-mapping.
      expect(runtime.tokens?.['--color-accent']).toBe(
        'light-dark(#8B5CF6, #A78BFA)',
      );
    });
  });

  describe('appearance document runtime override path', () => {
    it('maps roles to their seeds (brand=accent/admin=info/secondary=success)', () => {
      const config: BAIThemeConfig = {
        families: {
          default: {
            seeds: {
              accent: ['#FF7A00', '#DC6B03'],
              info: ['#028DF2', '#009BDD'],
              success: ['#00BD9B', '#03A487'],
            },
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

    it('applies a string seed to both schemes', () => {
      const options = themeOptionsFromConfig(
        { families: { default: { seeds: { accent: '#123456' } } } },
        'brand',
      );
      expect(options.accent).toEqual({ light: '#123456', dark: '#123456' });
    });

    it('reads the requested family and falls back to default when absent', () => {
      const config: BAIThemeConfig = {
        families: {
          default: { seeds: { accent: '#111111' } },
          stained: { seeds: { accent: '#222222' } },
        },
      };
      expect(themeOptionsFromConfig(config, 'brand', 'stained').accent).toEqual(
        { light: '#222222', dark: '#222222' },
      );
      expect(themeOptionsFromConfig(config, 'brand', 'missing').accent).toEqual(
        { light: '#111111', dark: '#111111' },
      );
    });
  });

  describe('banner status fills (FR-3700)', () => {
    const fill = (
      theme: ReturnType<typeof buildBackendAITheme>,
      target: string,
      token: string,
    ) =>
      (theme as any)?.components?.[target]?.['status:error']?.[token] as
        string | undefined;

    it('are opaque, and follow an operator rebrand rather than a literal', () => {
      const shipped = buildBackendAITheme(shippedOptions);
      const rebranded = buildBackendAITheme({
        ...shippedOptions,
        error: { light: '#7B1FA2', dark: '#7B1FA2' },
      });

      const shippedBand = fill(shipped, 'banner', '--color-error-muted');
      const rebrandBand = fill(rebranded, 'banner', '--color-error-muted');
      const rebrandContent = fill(
        rebranded,
        'banner-content',
        '--color-background-card',
      );

      // A floating notice must not show the page through it: no #RRGGBBAA.
      expect(shippedBand).toBeTruthy();
      expect(String(shippedBand)).not.toMatch(/#[0-9a-fA-F]{8}/);
      // Seed-derived, not hardcoded — a theme.json rebrand reaches the fill.
      expect(rebrandBand).not.toEqual(shippedBand);
      // Header band and content area stay the same colour.
      expect(rebrandContent).toEqual(rebrandBand);
      // No error seed, no banner fill of ours — the component keeps Astryx's.
      expect(
        fill(buildBackendAITheme({}), 'banner', '--color-error-muted'),
      ).toBeUndefined();
    });
  });
});
