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
import { ANTD_ALIGN_TOKENS, ANTD_DARK_ALGORITHM_OUTPUT } from 'backend.ai-ui';

// The measured parity tables moved into BUI's theme-shim with the shim itself
// (ticket 10 — BUI cannot import from react/src). Re-exported here so this
// module keeps its ticket-02 public API.
export { ANTD_ALIGN_TOKENS, ANTD_DARK_ALGORITHM_OUTPUT };

/** Bump when the static recipe (align tokens, formulas) changes. */
export const THEME_NAME_REV = 3;

/**
 * Sidebar navigation density — THEME DEFAULTS, not per-component CSS.
 *
 * antd expressed this as `ConfigProvider theme.components.Menu` tokens in
 * `BAIMenu` (`itemHeight: 40`, `itemBorderRadius: 20`, `fontSize:
 * fontSizeLG`, item `padding-inline: token.padding`) plus a `createStyles`
 * block for the group headers. Ticket 24 dropped that block on the reasoning
 * that "Astryx's nav-item styling is theme-owned and its enums are closed" —
 * correct about the enums, but the conclusion skipped the part that IS open:
 * `defineTheme({components})` targets Astryx's semantic component keys
 * (`side-nav-item`, `side-nav-heading`) and emits `@layer astryx-theme` CSS,
 * which outranks the components' own `@layer astryx-base` StyleX output.
 * So the density lands here, in the theme, exactly once — no CSS sprinkled on
 * `BAISider`/`BAIMenu`, and every deployment/theme family inherits it.
 *
 * Values are the legacy antd numbers, converted where the box model differs:
 *
 *   antd token                      | Astryx declaration
 *   --------------------------------|-------------------------------------
 *   Menu.itemHeight: 40             | height: 40px   (was --size-element-md, 32px)
 *   Menu.itemMarginBlock: 4 (antd   | marginBlock: 2px — antd's items are in
 *     default; adjacent margins     |   normal flow so 4+4 collapsed to a
 *     collapse -> 44px pitch)       |   44px pitch; SideNav's column is FLEX,
 *                                   |   where margins do NOT collapse, so 2px
 *                                   |   each side reproduces the same pitch.
 *   Menu.itemBorderRadius: 20       | borderRadius: 20px (pill; Astryx
 *                                   |   default is --radius-element = 8px)
 *   Menu.fontSize: fontSizeLG (16)  | fontSize: 16px (Astryx default 14px)
 *   item padding-inline: padding    | paddingInline: 24px — legacy put the row
 *     (16) + itemMarginInline (16)  |   content 32px from the rail edge;
 *                                   |   SideNav's scroll column already
 *                                   |   contributes 8px, so 24px here lands on
 *                                   |   the same 32px.
 *   group title padding-top:        | side-nav-section paddingBlockStart: 16px
 *     paddingMD (20)                |   — `SideNavSection`'s own header adds
 *                                   |   `--spacing-1` (4px) on top, so 16
 *                                   |   here lands on the legacy 20px gap.
 *                                   |   (Astryx default is --spacing-1, 4px)
 *
 * STILL not portable, and now overridden elsewhere: the group title's
 * `padding-left: paddingXL` and `font-weight: 500`. `SideNavSection` renders
 * its title as a bare `<span>` inside a bare `<div>` header, neither carrying
 * an `astryx-*` class, and `defineTheme({components})` can only emit
 * `.astryx-<name><variant-classes>` — style keys become CLASS SUFFIXES on the
 * element that owns the class (see the CLI's `parseStyleKey`), never
 * descendant combinators. Ticket 24 deferred those two values on the
 * visual-values policy; the user has since asked for the legacy metrics, so
 * they live in `react/src/components/BAISider.css`, scoped to `.bai-sider` and
 * expressed in Astryx tokens. That file carries the justification. `color` is
 * still NOT overridden anywhere — antd's `groupTitleColor`
 * (`colorTextDescription`) and Astryx's `--color-text-secondary` are the same
 * role, so the Astryx default stands.
 */
const SIDE_NAV_DENSITY = {
  // `SideNav`'s own StyleX sets `background-color: inherit` on the root AND on
  // its sticky top/bottom bands — it assumes an `AppShell` ancestor paints the
  // rail. Without one, `inherit` bottoms out at the page backdrop, so the rail
  // had NO surface of its own (antd's `Layout.Sider` painted
  // `colorBgContainer`) and, worse, the sticky footer band was see-through:
  // scrolled menu items visibly ran underneath the terms/version block on the
  // admin sider. Naming the surface here fixes both, for every theme family.
  'side-nav': {
    base: {
      backgroundColor: 'var(--color-background-surface)',
    },
  },
  'side-nav-item': {
    base: {
      height: '40px',
      marginBlock: '2px',
      paddingInline: '24px',
      borderRadius: '20px',
      fontSize: '16px',
    },
  },
  'side-nav-section': {
    base: {
      paddingBlockStart: '16px',
    },
  },
};

export interface BrandSeedPair {
  /** Light-scheme seed, as declared in theme.json. */
  light: string;
  /** Dark-scheme seed AS DECLARED (pre-darkAlgorithm) in theme.json. */
  dark: string;
}

/**
 * Map a declared dark seed to the value antd's darkAlgorithm rendered for it.
 * Unknown seeds pass through verbatim (see PILOT-DECISION in the header).
 */
export const resolveDarkSeed = (seed: string): string =>
  ANTD_DARK_ALGORITHM_OUTPUT[seed.toUpperCase()] ?? seed;

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
    // Component-level theme defaults (see SIDE_NAV_DENSITY above). This is
    // the sanctioned place for "our look differs from the Astryx default" —
    // it deep-merges over `neutralTheme`'s own component rules and applies to
    // every role/family theme built from this recipe.
    components: SIDE_NAV_DENSITY,
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
