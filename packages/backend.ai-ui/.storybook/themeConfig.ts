import type { BrandSeeds } from '../src/theme-shim';
import { astryxBrandTheme } from './astryxBrandTheme';
import webuiThemeJson from './theme.json';
import type { DefinedTheme } from '@astryxdesign/core/theme';
import { neutralTheme } from '@astryxdesign/theme-neutral';

export type ThemeStyle = 'astryx' | 'webui';

type Seeds = Partial<BrandSeeds>;

/**
 * A "Theme" toolbar preset. Both layers must move together: Astryx-native
 * components read the `<Theme>`, while the legacy antd-era ones read the
 * shim's seed bag — and the shim's `colorPrimary`/`colorSuccess`/… are
 * `verdict: 'brand'`, i.e. seed-only, never probed from the CSS cascade.
 * Setting just one layer is what made the pre-FR-3819 toolbar look inert.
 */
export interface ThemePreset {
  theme: DefinedTheme;
  light: Seeds;
  dark: Seeds;
}

/**
 * Astryx theme-neutral's own palette, read off `@astryxdesign/theme-neutral`'s
 * `theme.css` (0.5.2) — a monochrome accent, deliberately not a brand hue.
 * The shim re-runs antd's dark ramp over these seeds, so the dark shades land
 * near, not exactly on, Astryx's own; the point is the absent brand hue.
 */
const ASTRYX_NEUTRAL_SEEDS: { light: Seeds; dark: Seeds } = {
  light: {
    colorPrimary: '#262626',
    colorLink: '#262626',
    colorInfo: '#00458c',
    colorError: '#a50c25',
    colorSuccess: '#007004',
    colorWarning: '#745b00',
    fontFamily:
      'Figtree, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  dark: {
    colorPrimary: '#ebebeb',
    colorLink: '#ebebeb',
    colorInfo: '#c7d3ff',
    colorError: '#ffc6c1',
    colorSuccess: '#9fe59b',
    colorWarning: '#fdcf4f',
    fontFamily:
      'Figtree, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
};

/** The seeds the app feeds `ThemeShimProvider` in `DefaultProviders.tsx`. */
const webuiSeeds = (mode: 'light' | 'dark'): Seeds => {
  const t = webuiThemeJson[mode].token;
  return {
    colorPrimary: t.colorPrimary,
    colorLink: t.colorLink ?? t.colorPrimary,
    colorInfo: t.colorInfo,
    colorError: t.colorError,
    colorSuccess: t.colorSuccess,
    // theme.json declares no colorWarning — the shim falls back to antd's seed.
    colorWarning: undefined,
    fontFamily: t.fontFamily,
  };
};

export const themePresets: Record<ThemeStyle, ThemePreset> = {
  astryx: {
    theme: neutralTheme,
    light: ASTRYX_NEUTRAL_SEEDS.light,
    dark: ASTRYX_NEUTRAL_SEEDS.dark,
  },
  webui: {
    theme: astryxBrandTheme,
    light: webuiSeeds('light'),
    dark: webuiSeeds('dark'),
  },
};
