/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Backend.AI brand theme on Astryx `defineTheme()` (to-astryx ticket 02).

 This module is PURE (no React, no app hooks) so it can be consumed by
 - the app-level providers (`AstryxBrandTheme` / `AstryxAdminTheme` /
   `AstryxSecondaryTheme`),
 - the `astryx theme build` production entry (`built/backendai-default.ts`),
 - standalone probes/harnesses that run without the app shell.

 ## Seeds

 Seeded from `resources/theme.json` (the operator-editable runtime document):
 `colorPrimary` (brand accent), `colorInfo` (admin accent), `colorSuccess`
 (secondary accent + success), `colorError`, `fontFamily`. `colorWarning` is
 not declared there, so the antd default seed applies.

 ## Dark tuples — SETTLED DECISION (2026-08-07, MIGRATION-SPEC §1-③)

 antd's `darkAlgorithm` does not merely swap palettes — it transforms the
 brand seeds themselves (`#DC6B03` declared → `#be5e06` rendered). The current
 dark UI shows the TRANSFORMED values, so to keep today's appearance the
 `[light, dark]` tuples pin the dark side to the MEASURED darkAlgorithm
 outputs (see `ANTD_DARK_ALGORITHM_OUTPUT`), not the raw theme.json seeds.
 Measurements come from `theme.getDesignToken()` A/B captures (ticket 06).

 PILOT-DECISION (ticket 02): for dark seeds NOT in the measured table (an
 operator rebrands via theme.json at runtime), the declared dark seed is used
 verbatim instead of re-implementing antd's dark derivation (~250 LOC vendor).
 A rebranded deployment then gets "seed-direct" dark colors — acceptable per
 the simplicity policy; revisit only if a real deployment reports it.

 ## Theme name numbering (채번 규칙)

 A theme's `name` IS its identity: it becomes the `data-astryx-theme`
 attribute, and two `defineTheme()` calls sharing a name fight over one
 attribute — the FIRST registration silently wins (measured in the pilot).
 With 4 selectable theme families (default/stained/glass/reverie/bliss ×
 light/dark) plus per-role accents (brand/admin/secondary) plus runtime
 theme.json overrides, names are therefore DERIVED, never hardcoded:

     bai-r{REV}-{family}-{role}-{hash}

 - `REV` (`THEME_NAME_REV`): bumped whenever the static recipe in this file
   changes (align tokens, muted formula, …), so a recipe change can never be
   masked by a stale registration or stale built CSS.
 - `family`: theme-family key (`default`, `stained`, …) — readability only.
 - `role`: `brand` | `admin` | `secondary` — readability only.
 - `hash`: djb2 over every CSS-affecting seed. This is the correctness part:
   any seed change (even a single status color) yields a new name, so a
   runtime override can never silently no-op against a same-named
   registration, and identical seed sets share one registration via the
   build cache below.
 */
import { defineTheme, type DefinedTheme } from '@astryxdesign/core/theme';
import { neutralTheme } from '@astryxdesign/theme-neutral';

/** Bump when the static recipe (align tokens, formulas) changes. */
export const THEME_NAME_REV = 1;

export interface BrandSeedPair {
  /** Light-scheme seed, as declared in theme.json. */
  light: string;
  /** Dark-scheme seed AS DECLARED (pre-darkAlgorithm) in theme.json. */
  dark: string;
}

/**
 * Measured antd `darkAlgorithm` outputs for the dark seeds this repo ships
 * (source: ticket 06 numeric A/B, `theme.getDesignToken()` against
 * resources/theme.json). Key = declared dark seed (uppercase), value = what
 * antd actually renders today in dark mode.
 */
export const ANTD_DARK_ALGORITHM_OUTPUT: Record<string, string> = {
  '#DC6B03': '#be5e06', // colorPrimary / colorLink
  '#DC4446': '#be3d3f', // colorError
  '#03A487': '#068e76', // colorSuccess (also the secondary accent)
  '#009BDD': '#0387bf', // colorInfo (the admin accent)
  '#FAAD14': '#d89614', // colorWarning (antd default seed)
};

/**
 * Map a declared dark seed to the value antd's darkAlgorithm rendered for it.
 * Unknown seeds pass through verbatim (see PILOT-DECISION in the header).
 */
export const resolveDarkSeed = (seed: string): string =>
  ANTD_DARK_ALGORITHM_OUTPUT[seed.toUpperCase()] ?? seed;

/**
 * antd `boxShadowSecondary` recipes (light / dark measured from
 * `theme.getDesignToken()`), replacing Astryx `--shadow-med` (different
 * recipe: Astryx adds an inset hairline and different offsets).
 *
 * NOT a `[light, dark]` tuple: defineTheme serializes tuples as
 * `light-dark(lightValue, darkValue)`, and `light-dark()` accepts COLORS
 * only — a tuple of multi-shadow recipes emits
 * `light-dark(0 6px 16px 0 rgba(...), ..., ...)` which is invalid CSS and
 * silently kills `box-shadow: var(--shadow-med)` at every use site
 * (measured on the built artifact). Instead this is ONE string with
 * `light-dark()` at each color position — the same shape Astryx uses for its
 * own shadow defaults — so it mode-switches through `color-scheme` exactly
 * like every other token.
 */
const ANTD_BOX_SHADOW_SECONDARY =
  '0 6px 16px 0 light-dark(rgba(0,0,0,0.08), rgba(255,255,255,0.016)), ' +
  '0 3px 6px -4px light-dark(rgba(0,0,0,0.12), rgba(255,255,255,0.024)), ' +
  '0 9px 28px 8px light-dark(rgba(0,0,0,0.05), rgba(255,255,255,0.01))';

/**
 * The 6 known antd↔Astryx token VALUE differences (ticket 06 "drift" class),
 * aligned to the antd values so migrated surfaces keep today's metrics.
 * (`fontSizeLG` and `fontSizeHeading5` share `--font-size-lg`, so 6 antd
 * tokens collapse to 5 CSS variables.)
 *
 * | antd token         | antd | Astryx neutral      | override    |
 * |--------------------|------|---------------------|-------------|
 * | borderRadiusLG     | 8px  | --radius-element 10 | 8px         |
 * | fontSizeLG         | 16px | --font-size-lg 17   | 16px        |
 * | fontSizeHeading5   | 16px | --font-size-lg 17   | (same var)  |
 * | fontSizeHeading1   | 38px | --font-size-4xl 35  | 38px        |
 * | motionDurationSlow | .3s  | --duration-slow 700 | 300ms       |
 * | boxShadowSecondary | —    | --shadow-med        | antd recipe |
 *
 * px (not rem) on purpose: antd emitted px, and the goal of this layer is
 * approximating the current appearance exactly.
 */
export const ANTD_ALIGN_TOKENS = {
  '--radius-element': '8px',
  '--font-size-lg': '16px',
  '--font-size-4xl': '38px',
  '--duration-slow': '300ms',
  '--shadow-med': ANTD_BOX_SHADOW_SECONDARY,
} as const;

/** Default seeds — verbatim from resources/theme.json (+ antd defaults). */
export const BAI_DEFAULT_SEEDS = {
  /** colorPrimary / colorLink */
  accent: { light: '#FF7A00', dark: '#DC6B03' } as BrandSeedPair,
  /** colorInfo — what `usePrimaryColors().admin` resolves to */
  admin: { light: '#028DF2', dark: '#009BDD' } as BrandSeedPair,
  /** colorSuccess — what `usePrimaryColors().secondary` resolves to */
  secondary: { light: '#00BD9B', dark: '#03A487' } as BrandSeedPair,
  error: { light: '#FF4D4F', dark: '#DC4446' } as BrandSeedPair,
  success: { light: '#00BD9B', dark: '#03A487' } as BrandSeedPair,
  /** theme.json declares no colorWarning — antd default seed. */
  warning: { light: '#FAAD14', dark: '#FAAD14' } as BrandSeedPair,
  /** theme.json `fontFamily` */
  fontFamily: "'Ubuntu', Roboto, sans-serif",
};

export type BrandThemeRole = 'brand' | 'admin' | 'secondary';

export interface BuildBackendAiThemeOptions {
  /** Theme-family key (`default`, `stained`, `glass`, `reverie`, `bliss`). */
  family?: string;
  /** Which accent this theme carries. Readability segment of the name. */
  role?: BrandThemeRole;
  /** Accent seed pair (declared values; dark is mapped through the table). */
  accent?: BrandSeedPair;
  error?: BrandSeedPair;
  success?: BrandSeedPair;
  warning?: BrandSeedPair;
  fontFamily?: string;
}

/** Resolve tuple = [light seed, measured darkAlgorithm output of dark seed]. */
const toTuple = (pair: BrandSeedPair): [string, string] => [
  pair.light,
  resolveDarkSeed(pair.dark),
];

/**
 * Astryx muted status surfaces are the status color at ~20%/25% alpha
 * (e.g. neutral `--color-error-muted: #E3193B33 / #F5394F3F`). Reproduce the
 * same formula over our seeds. Only 6-digit hex seeds get a muted override;
 * anything else keeps the neutral default (no silent invalid CSS).
 */
const toMutedTuple = (tuple: [string, string]): [string, string] | undefined =>
  /^#[0-9a-fA-F]{6}$/.test(tuple[0]) && /^#[0-9a-fA-F]{6}$/.test(tuple[1])
    ? [`${tuple[0]}33`, `${tuple[1]}3F`]
    : undefined;

/** djb2 — tiny, stable, DOM-attribute-safe (base36). */
const hashSeeds = (input: string): string => {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) + h + input.charCodeAt(i)) >>> 0;
  }
  return h.toString(36);
};

const sanitizeNameSegment = (segment: string): string =>
  segment.toLowerCase().replace(/[^a-z0-9-]+/g, '-');

interface ResolvedSeeds {
  family: string;
  role: BrandThemeRole;
  accent: BrandSeedPair;
  error: BrandSeedPair;
  success: BrandSeedPair;
  warning: BrandSeedPair;
  fontFamily: string;
}

const resolveSeeds = (
  options: BuildBackendAiThemeOptions = {},
): ResolvedSeeds => ({
  family: options.family ?? 'default',
  role: options.role ?? 'brand',
  accent: options.accent ?? BAI_DEFAULT_SEEDS.accent,
  error: options.error ?? BAI_DEFAULT_SEEDS.error,
  success: options.success ?? BAI_DEFAULT_SEEDS.success,
  warning: options.warning ?? BAI_DEFAULT_SEEDS.warning,
  fontFamily: options.fontFamily ?? BAI_DEFAULT_SEEDS.fontFamily,
});

/**
 * The theme name for a given option set — see "Theme name numbering" in the
 * module header. Exported separately so callers can compare against a built
 * theme's name WITHOUT calling `defineTheme()` (constructing a same-named
 * runtime theme would register a competing entry for the identical CSS).
 */
export const computeThemeName = (
  options: BuildBackendAiThemeOptions = {},
): string => {
  const seeds = resolveSeeds(options);
  const hash = hashSeeds(
    JSON.stringify([
      seeds.accent,
      seeds.error,
      seeds.success,
      seeds.warning,
      seeds.fontFamily,
      ANTD_ALIGN_TOKENS,
    ]),
  );
  // `h` prefix: every name segment must start with a letter — `astryx theme
  // build` camelizes the name into a JS export identifier, and a segment
  // starting with a digit yields an invalid identifier (measured: hash
  // `1em9oeh` produced `baiR1DefaultBrand-1em9oehTheme`, a syntax error).
  return sanitizeNameSegment(
    `bai-r${THEME_NAME_REV}-${seeds.family}-${seeds.role}-h${hash}`,
  );
};

/**
 * `defineTheme()` registers by name and the first registration silently wins,
 * so building the same seed set twice must return the SAME object rather than
 * registering a doomed duplicate. Keyed by the derived name (= content).
 */
const themeCache = new Map<string, DefinedTheme>();

/**
 * Build a Backend.AI theme. Called with no arguments this yields the default
 * brand theme; role/seed overrides yield the admin/secondary/runtime themes.
 */
export function buildBackendAiTheme(
  options: BuildBackendAiThemeOptions = {},
): DefinedTheme {
  const name = computeThemeName(options);
  const cached = themeCache.get(name);
  if (cached) {
    return cached;
  }

  const seeds = resolveSeeds(options);
  const accent = toTuple(seeds.accent);
  const error = toTuple(seeds.error);
  const success = toTuple(seeds.success);
  const warning = toTuple(seeds.warning);
  const errorMuted = toMutedTuple(error);
  const successMuted = toMutedTuple(success);
  const warningMuted = toMutedTuple(warning);

  const theme = defineTheme({
    name,
    // Start from neutral: only the brand-owned families + the 6 antd value
    // alignments are overridden; everything else keeps Astryx defaults
    // (visual-value policy: component-level look stays Astryx).
    extends: neutralTheme,
    // Runs the HCT generator over the light seed so the DERIVED accent ramp
    // (hover/active/surface steps) follows the brand — measured in the pilot
    // to recompute correctly on accent swap.
    color: { accent: seeds.accent.light },
    tokens: {
      // The generator takes ONE accent; the light/dark pair is expressed as
      // explicit [light, dark] tuple overrides, which win over generated
      // values. Dark side = measured antd darkAlgorithm output (header note).
      '--color-accent': accent,
      '--color-text-accent': accent,
      '--color-icon-accent': accent,
      // Text/icons ON the accent fill. All shipped accents (orange, admin
      // blue, secondary teal) are dark enough for white at both ends — and
      // white-on-primary is what antd rendered.
      '--color-on-accent': ['#ffffff', '#ffffff'],
      // Status colors, brand-owned via theme.json (antd colorError /
      // colorSuccess / colorWarning). Astryx has no info color; the admin
      // accent (colorInfo) lives in the nested admin theme instead.
      '--color-error': error,
      '--color-success': success,
      '--color-warning': warning,
      ...(errorMuted ? { '--color-error-muted': errorMuted } : {}),
      ...(successMuted ? { '--color-success-muted': successMuted } : {}),
      ...(warningMuted ? { '--color-warning-muted': warningMuted } : {}),
      // theme.json fontFamily (Ubuntu stack). Token-level override rather
      // than `typography` config: a partial `typography` block REPLACES the
      // base scale config wholesale (docs: "child config replaces base
      // entirely"), which would silently regenerate the type ramp.
      '--font-family-body': seeds.fontFamily,
      '--font-family-heading': seeds.fontFamily,
      // The 6 antd↔Astryx value differences, pinned to antd values.
      ...ANTD_ALIGN_TOKENS,
    },
  });

  themeCache.set(name, theme);
  return theme;
}

/* -------------------------------------------------------------------------
 * theme.json runtime override path
 * ---------------------------------------------------------------------- */

/**
 * Minimal structural view of an antd `ThemeConfig` — declared here so this
 * module stays antd-import-free (it must outlive antd removal).
 */
export interface AntdishThemeConfig {
  token?: {
    colorPrimary?: string;
    colorInfo?: string;
    colorSuccess?: string;
    colorError?: string;
    colorWarning?: string;
  };
}

export interface AntdishCustomThemeConfig {
  fontFamily?: string;
  light?: AntdishThemeConfig;
  dark?: AntdishThemeConfig;
}

const seedPairFromConfig = (
  config: AntdishCustomThemeConfig,
  key:
    | 'colorPrimary'
    | 'colorInfo'
    | 'colorSuccess'
    | 'colorError'
    | 'colorWarning',
  fallback: BrandSeedPair,
): BrandSeedPair => {
  const light = config.light?.token?.[key];
  const dark = config.dark?.token?.[key];
  return {
    light: typeof light === 'string' ? light : fallback.light,
    dark:
      typeof dark === 'string'
        ? dark
        : // A config that declares only a light seed reuses it for dark
          // (antd behaved the same way: dark derived from whatever seed the
          // dark ThemeConfig carried, falling back to light's).
          typeof light === 'string'
          ? light
          : fallback.dark,
  };
};

/**
 * Derive the full option set for one role from a runtime theme.json document
 * (the operator-editable override path). Role→accent mapping mirrors
 * `usePrimaryColors`: brand=colorPrimary, admin=colorInfo,
 * secondary=colorSuccess.
 */
export const themeOptionsFromConfig = (
  config: AntdishCustomThemeConfig,
  role: BrandThemeRole = 'brand',
  family = 'default',
): BuildBackendAiThemeOptions => {
  const accentKey =
    role === 'admin'
      ? 'colorInfo'
      : role === 'secondary'
        ? 'colorSuccess'
        : 'colorPrimary';
  const accentFallback =
    role === 'admin'
      ? BAI_DEFAULT_SEEDS.admin
      : role === 'secondary'
        ? BAI_DEFAULT_SEEDS.secondary
        : BAI_DEFAULT_SEEDS.accent;
  return {
    family,
    role,
    accent: seedPairFromConfig(config, accentKey, accentFallback),
    error: seedPairFromConfig(config, 'colorError', BAI_DEFAULT_SEEDS.error),
    success: seedPairFromConfig(
      config,
      'colorSuccess',
      BAI_DEFAULT_SEEDS.success,
    ),
    warning: seedPairFromConfig(
      config,
      'colorWarning',
      BAI_DEFAULT_SEEDS.warning,
    ),
    fontFamily: config.fontFamily ?? BAI_DEFAULT_SEEDS.fontFamily,
  };
};

/* -------------------------------------------------------------------------
 * Default singletons (the shipped theme.json values)
 * ---------------------------------------------------------------------- */

/** Backend.AI brand (orange) — the app-wide default. */
export const backendAiBrandTheme = buildBackendAiTheme({ role: 'brand' });

/** Admin sections (colorInfo blue) — `ThemeAdminProvider` counterpart. */
export const backendAiAdminTheme = buildBackendAiTheme({
  role: 'admin',
  accent: BAI_DEFAULT_SEEDS.admin,
});

/** Secondary sections (colorSuccess teal) — `ThemeSecondaryProvider` counterpart. */
export const backendAiSecondaryTheme = buildBackendAiTheme({
  role: 'secondary',
  accent: BAI_DEFAULT_SEEDS.secondary,
});
