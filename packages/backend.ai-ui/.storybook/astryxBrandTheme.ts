/**
 * Backend.AI brand Astryx theme for Storybook (to-astryx ticket 32).
 *
 * Before this file, no `<Theme>` from `@astryxdesign/core/theme` was ever
 * mounted in the preview — Astryx-native components (`BAITableAstryx`,
 * `BAIComplexSelect`, PowerSearch, …) fell back to `@astryxdesign/theme-
 * neutral`'s default palette (imported globally in `astryx.css`), not the
 * Backend.AI brand. `ThemeShimProvider` (ticket 10) only feeds antd-shaped
 * seed tokens to the LEGACY antd-consuming BUI surfaces; it does not mount
 * an Astryx `<Theme>`, so it never themed the Astryx-native ones.
 *
 * Storybook's Vite build lives in a different workspace package than
 * `react/`, so it cannot import the app's real theme builder
 * (`react/src/astryx-theme/backendAiTheme.ts`) — that file is "pure" (no
 * React, no app hooks) but still lives under `react/src`. This mirrors its
 * brand-role recipe (ticket 02: `buildBackendAiTheme({ role: 'brand' })`)
 * using the SAME measured parity tables — re-exported by BUI's own
 * `theme-shim` (ticket 10), so they cannot drift between the app and this
 * file — and the SAME seeds as `resources/theme.json` (mirrored locally as
 * `./theme.json`, already consumed by `themeConfig.ts` for the antd side).
 *
 * KEEP IN SYNC (seed values only, not the glue code) with
 * `react/src/astryx-theme/backendAiTheme.ts` `BAI_DEFAULT_SEEDS` /
 * `buildBackendAiTheme({ role: 'brand' })`.
 */
import { ANTD_ALIGN_TOKENS, ANTD_DARK_ALGORITHM_OUTPUT } from '../src/theme-shim';
import webuiThemeJson from './theme.json';
import { defineTheme } from '@astryxdesign/core/theme';
import { neutralTheme } from '@astryxdesign/theme-neutral';

/** Map a declared dark seed to antd darkAlgorithm's measured output for it. */
const resolveDarkSeed = (seed: string): string =>
  ANTD_DARK_ALGORITHM_OUTPUT[seed.toUpperCase()] ?? seed;

const toTuple = (light: string, dark: string): [string, string] => [
  light,
  resolveDarkSeed(dark),
];

/** Astryx muted status surfaces = the status color at ~20%/25% alpha. */
const toMutedTuple = (
  tuple: [string, string],
): [string, string] | undefined =>
  /^#[0-9a-fA-F]{6}$/.test(tuple[0]) && /^#[0-9a-fA-F]{6}$/.test(tuple[1])
    ? [`${tuple[0]}33`, `${tuple[1]}3F`]
    : undefined;

const light = webuiThemeJson.light.token;
const dark = webuiThemeJson.dark.token;

const accent = toTuple(light.colorPrimary, dark.colorPrimary);
const error = toTuple(light.colorError, dark.colorError);
const success = toTuple(light.colorSuccess, dark.colorSuccess);
// theme.json declares no colorWarning — antd's own default seed (ticket 02).
const warning = toTuple('#FAAD14', '#FAAD14');
const fontFamily = light.fontFamily;

const errorMuted = toMutedTuple(error);
const successMuted = toMutedTuple(success);
const warningMuted = toMutedTuple(warning);

/**
 * Backend.AI brand Astryx theme — Storybook's build of `backendAiBrandTheme`
 * (ticket 02). Mounted unconditionally in `decorators.tsx` so every story
 * (legacy and Astryx-native alike) renders against the real brand palette in
 * both light and dark, independent of the "Theme Style" (antd-only) toolbar.
 */
export const astryxBrandTheme = defineTheme({
  name: 'storybook-bai-brand',
  extends: neutralTheme,
  color: { accent: light.colorPrimary },
  tokens: {
    '--color-accent': accent,
    '--color-text-accent': accent,
    '--color-icon-accent': accent,
    '--color-on-accent': ['#ffffff', '#ffffff'],
    '--color-error': error,
    '--color-success': success,
    '--color-warning': warning,
    ...(errorMuted ? { '--color-error-muted': errorMuted } : {}),
    ...(successMuted ? { '--color-success-muted': successMuted } : {}),
    ...(warningMuted ? { '--color-warning-muted': warningMuted } : {}),
    '--font-family-body': fontFamily,
    '--font-family-heading': fontFamily,
    ...ANTD_ALIGN_TOKENS,
  },
});
