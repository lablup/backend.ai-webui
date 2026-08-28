import webuiThemeJson from '../../../resources/theme.json';
import type { BrandSeeds } from '../src/theme-shim';
import { astryxBrandTheme } from './astryxBrandTheme';
import { type DefinedTheme, resolveThemeToken } from '@astryxdesign/core/theme';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';

type ThemeMode = 'light' | 'dark';
export type ThemeStyle = 'default' | 'webui';

/** Astryx token → shim seed, for themes that ship no theme.json. */
const SEED_TOKENS: Record<
  keyof Omit<BrandSeeds, 'colorInfo' | 'components'>,
  string
> = {
  colorPrimary: '--color-accent',
  colorLink: '--color-accent',
  colorError: '--color-error',
  colorSuccess: '--color-success',
  colorWarning: '--color-warning',
  fontFamily: '--font-family-body',
};

const seedsFromTheme = (
  theme: DefinedTheme,
  mode: ThemeMode,
): Partial<BrandSeeds> =>
  Object.fromEntries(
    Object.entries(SEED_TOKENS).map(([seed, token]) => [
      seed,
      resolveThemeToken(theme, token, { mode }),
    ]),
  );

const webuiSeeds = (mode: ThemeMode): Partial<BrandSeeds> => ({
  ...webuiThemeJson[mode].token,
  fontFamily: webuiThemeJson.fontFamily,
  components: webuiThemeJson[mode].components,
});

export const themeStyleConfigs: Record<
  ThemeStyle,
  {
    /** The Astryx `<Theme>` mounted around every story. */
    astryxTheme: DefinedTheme;
    /** Per-mode seeds for `ThemeShimProvider` (antd token vocabulary). */
    seeds: Record<ThemeMode, Partial<BrandSeeds>>;
  }
> = {
  default: {
    astryxTheme: neutralTheme,
    seeds: {
      light: seedsFromTheme(neutralTheme, 'light'),
      dark: seedsFromTheme(neutralTheme, 'dark'),
    },
  },
  webui: {
    astryxTheme: astryxBrandTheme,
    seeds: { light: webuiSeeds('light'), dark: webuiSeeds('dark') },
  },
};
