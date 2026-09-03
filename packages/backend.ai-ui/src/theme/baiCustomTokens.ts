/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 The custom token layer of the Backend.AI Astryx theme (FR-3605).

 These carry the values the retired theme-shim used to compute at runtime
 for the antd vocabulary Astryx has no token for: the brand link/info
 seeds, the per-status bg/border/hover tints, and antd's neutral text/fill
 alpha ramp. The tints are `color-mix()` references over the pinned base
 tokens, so they follow an operator rebrand without any palette code. A seed
 the document does not declare falls back to an Astryx `var()` reference, so
 the token never goes missing. Shared by the app recipe
 (`react/src/astryx-theme/backendAiTheme.ts`) and the Storybook brand theme
 so the two cannot drift. Consumers read them via `useTheme().token()`.
 */

/** A seed declared per scheme; both sides are applied as declared. */
export interface BrandSeedPair {
  light: string;
  dark: string;
}

export type BaiCustomTokenSeeds = {
  accent?: BrandSeedPair;
  info?: BrandSeedPair;
  link?: BrandSeedPair;
  headerBg?: BrandSeedPair;
  error?: BrandSeedPair;
  success?: BrandSeedPair;
  warning?: BrandSeedPair;
};

/** The declared pair as a `[light, dark]` tuple. */
export const toSeedTuple = (pair: BrandSeedPair): [string, string] => [
  pair.light,
  pair.dark,
];

/**
 * A tint of a base token over the page surface: `amount`% of the token, the
 * rest `--color-background-surface` (white in light, near-black in dark). One
 * amount per scheme, chosen to sit where antd's palette steps used to
 * (bg ≈ step 1, border ≈ step 3, hover ≈ step 4, ramp-5 ≈ step 5).
 */
const tint = (token: string, light: number, dark: number): [string, string] => [
  `color-mix(in srgb, var(${token}) ${light}%, var(--color-background-surface))`,
  `color-mix(in srgb, var(${token}) ${dark}%, var(--color-background-surface))`,
];

/** antd's neutral text/fill alpha ramp and the preset steps still consumed. */
export const BAI_SELF_COLOR_TOKENS: Record<string, [string, string]> = {
  '--color-text-tertiary': ['rgba(0,0,0,0.45)', 'rgba(255,255,255,0.45)'],
  '--color-text-quaternary': ['rgba(0,0,0,0.25)', 'rgba(255,255,255,0.25)'],
  '--color-text-description': ['rgba(0,0,0,0.45)', 'rgba(255,255,255,0.45)'],
  '--color-fill': ['rgba(0,0,0,0.15)', 'rgba(255,255,255,0.18)'],
  '--color-fill-secondary': ['rgba(0,0,0,0.06)', '#262626'],
  '--color-fill-tertiary': ['rgba(0,0,0,0.04)', 'rgba(255,255,255,0.08)'],
  '--color-fill-quaternary': ['rgba(0,0,0,0.02)', 'rgba(255,255,255,0.04)'],
  '--color-bg-container-disabled': [
    'rgba(0,0,0,0.04)',
    'rgba(255,255,255,0.08)',
  ],
  // antd preset palette steps (light/dark tables) still consumed by name.
  '--preset-purple-5': ['#9254de', '#51258f'],
  '--preset-green-5': ['#73d13d', '#3c8618'],
  '--preset-red-5': ['#ff4d4f', '#a61d24'],
};

/**
 * The full custom token set for one seed set. Each brand-derived token has an
 * Astryx fallback for an undeclared seed. `--primary-5` is the accent ramp
 * step still consumed by progress fills.
 */
export const buildBaiCustomTokens = (
  seeds: BaiCustomTokenSeeds,
): Record<string, string | [string, string]> => ({
  '--color-info': seeds.info ? toSeedTuple(seeds.info) : 'var(--color-accent)',
  '--color-link': seeds.link
    ? toSeedTuple(seeds.link)
    : 'var(--color-text-accent)',
  '--header-bg': seeds.headerBg
    ? [seeds.headerBg.light, seeds.headerBg.dark]
    : 'var(--color-background-surface)',
  '--color-error-bg': seeds.error
    ? tint('--color-error', 10, 15)
    : 'var(--color-error-muted)',
  '--color-info-bg': seeds.info
    ? tint('--color-info', 10, 15)
    : 'var(--color-accent-muted)',
  '--color-warning-hover': seeds.warning
    ? tint('--color-warning', 65, 45)
    : 'var(--color-warning)',
  '--color-success-border-hover': seeds.success
    ? tint('--color-success', 65, 45)
    : 'var(--color-success)',
  '--color-primary-bg': seeds.accent
    ? tint('--color-accent', 10, 30)
    : 'var(--color-accent-muted)',
  '--color-error-border': seeds.error
    ? tint('--color-error', 45, 30)
    : 'var(--color-error)',
  '--primary-5': seeds.accent
    ? tint('--color-accent', 85, 65)
    : 'var(--color-accent)',
  ...BAI_SELF_COLOR_TOKENS,
});
