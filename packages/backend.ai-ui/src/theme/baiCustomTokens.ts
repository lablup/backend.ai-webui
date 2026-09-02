/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 The `--bai-*` custom token layer of the Backend.AI Astryx theme (FR-3605).

 These carry the values the retired theme-shim used to compute at runtime
 for the antd vocabulary Astryx has no token for: the brand link/info
 seeds, antd's per-status hover/bg/border palette steps, and antd's neutral
 text/fill alpha ramp. Shared by the app recipe
 (`react/src/astryx-theme/backendAiTheme.ts`) and the Storybook brand theme
 so the two cannot drift. Consumers read them via `useTheme().token('--bai-…')`.
 */
import { generate, palette } from './antdColors';
import { ANTD_DARK_ALGORITHM_OUTPUT } from './antdParity';

/** A seed declared per scheme; `dark` is the DECLARED value, pre-transform. */
export interface BrandSeedPair {
  light: string;
  dark: string;
}

export type BaiCustomTokenSeeds = {
  accent: BrandSeedPair;
  info: BrandSeedPair;
  link: BrandSeedPair;
  headerBg: BrandSeedPair;
  error: BrandSeedPair;
  success: BrandSeedPair;
  warning: BrandSeedPair;
};

/**
 * Map a declared dark seed to the value antd's darkAlgorithm rendered for it:
 * the measured table for the shipped seeds, the vendored palette for any
 * other 6-digit hex (the same computation the shim ran live), and verbatim
 * passthrough for anything the generator cannot parse.
 */
export const resolveDarkSeed = (seed: string): string =>
  ANTD_DARK_ALGORITHM_OUTPUT[seed.toUpperCase()] ??
  (/^#[0-9a-fA-F]{6}$/.test(seed) ? palette(seed, 'dark')(6) : seed);

/** Resolve tuple = [light seed, darkAlgorithm output of the dark seed]. */
export const toSeedTuple = (pair: BrandSeedPair): [string, string] => [
  pair.light,
  resolveDarkSeed(pair.dark),
];

/**
 * antd palette step for one seed pair, per scheme: light = palette(light)(key),
 * dark = palette over the DECLARED dark seed with the dark algorithm
 * (darkKey where antd's dark alias diverges).
 */
const deriveTuple = (
  pair: BrandSeedPair,
  key: number,
  darkKey?: number,
): [string, string] => [
  palette(pair.light, 'light')(key),
  palette(pair.dark, 'dark')(darkKey ?? key),
];

/** antd's neutral text/fill alpha ramp and the preset steps still consumed. */
export const BAI_SELF_COLOR_TOKENS: Record<string, [string, string]> = {
  '--bai-color-text-tertiary': ['rgba(0,0,0,0.45)', 'rgba(255,255,255,0.45)'],
  '--bai-color-text-quaternary': ['rgba(0,0,0,0.25)', 'rgba(255,255,255,0.25)'],
  '--bai-color-text-description': [
    'rgba(0,0,0,0.45)',
    'rgba(255,255,255,0.45)',
  ],
  '--bai-color-fill': ['rgba(0,0,0,0.15)', 'rgba(255,255,255,0.18)'],
  '--bai-color-fill-secondary': ['rgba(0,0,0,0.06)', '#262626'],
  '--bai-color-fill-tertiary': ['rgba(0,0,0,0.04)', 'rgba(255,255,255,0.08)'],
  '--bai-color-fill-quaternary': ['rgba(0,0,0,0.02)', 'rgba(255,255,255,0.04)'],
  '--bai-color-bg-container-disabled': [
    'rgba(0,0,0,0.04)',
    'rgba(255,255,255,0.08)',
  ],
  // antd preset palette steps (light/dark tables) still consumed by name.
  '--bai-preset-purple-5': ['#9254de', '#51258f'],
  '--bai-preset-green-5': ['#73d13d', '#3c8618'],
  '--bai-preset-red-5': ['#ff4d4f', '#a61d24'],
};

/**
 * The full `--bai-*` set for one seed set. `--bai-primary-5` is the one antd
 * ramp step still consumed (progress fills): `generate()` (default options)
 * over the mode's palette key-6 map color, per scheme, index 4.
 */
export const buildBaiCustomTokens = (
  seeds: BaiCustomTokenSeeds,
): Record<string, string | [string, string]> => ({
  '--bai-color-info': toSeedTuple(seeds.info),
  '--bai-color-link': toSeedTuple(seeds.link),
  '--bai-header-bg': [seeds.headerBg.light, seeds.headerBg.dark],
  '--bai-color-error-bg': deriveTuple(seeds.error, 1),
  '--bai-color-info-bg': deriveTuple(seeds.info, 1),
  '--bai-color-warning-hover': deriveTuple(seeds.warning, 4),
  '--bai-color-success-border-hover': deriveTuple(seeds.success, 4),
  '--bai-color-primary-bg': deriveTuple(seeds.accent, 1, 3),
  '--bai-color-error-border': deriveTuple(seeds.error, 3),
  '--bai-primary-5': [
    generate(palette(seeds.accent.light, 'light')(6))[4],
    generate(palette(seeds.accent.dark, 'dark')(6))[4],
  ],
  ...BAI_SELF_COLOR_TOKENS,
});
