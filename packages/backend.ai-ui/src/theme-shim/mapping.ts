/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 The antd -> Astryx token mapping table (to-astryx ticket 03, from the
 ticket-06 spike).

 Every one of the 99 antd design-token names the repo actually references
 gets a resolution here. Verdicts:

   'astryx'   exact Astryx counterpart                  -> resolved live from CSS
   'aligned'  Astryx counterpart whose value ticket 02 pinned to the antd
              value (`ANTD_ALIGN_TOKENS` in ../astryx-theme/backendAiTheme.ts)
              -> taken from that table, NOT probed, so the value is correct
              even while only the neutral theme's CSS is in the cascade
   'derive'   computed from a brand seed with antd's own palette algorithm
              (vendored in ./vendor/antdColors.ts)
   'brand'    owned by resources/theme.json + user accent -> runtime seeds;
              dark side goes through antd's darkAlgorithm seed transform
              (= `palette(seed, 'dark')(6)`, reproducing ticket 02's measured
              ANTD_DARK_ALGORITHM_OUTPUT table for every seed)
   'self'     no Astryx counterpart                      -> our own light/dark pair
              (./selfTokens.ts)
 */

export type Verdict = 'astryx' | 'aligned' | 'derive' | 'brand' | 'self';

/** The six runtime-configurable brand seeds (resources/theme.json). */
export type BrandSeedName =
  | 'colorPrimary'
  | 'colorLink'
  | 'colorError'
  | 'colorSuccess'
  | 'colorWarning'
  | 'colorInfo';

export interface MapEntry {
  verdict: Verdict;
  /** Astryx CSS custom property (verdict astryx | aligned). */
  var?: string;
  kind?: 'length' | 'color' | 'raw' | 'number';
  /**
   * verdict 'derive' — antd palette-key lookup over a brand seed:
   * `palette(seed, mode)(key)` (see vendor/antdColors.ts). `darkKey`
   * overrides the key in dark mode where antd's dark derivative diverges
   * (e.g. `colorPrimaryBg` = colorPrimaryBorder in dark).
   */
  derive?: { seed: BrandSeedName; key: number; darkKey?: number };
  /**
   * verdict 'derive' — fixed antd preset-hue table lookup.
   * `darkTable: true` reads presetDarkPalettes in dark mode (the `redN`
   * steps); bare hues (`token.red`) are NOT dark-transformed by antd.
   */
  preset?: { hue: string; index: number; darkTable?: boolean };
  note?: string;
}

// --------------------------------------------------------------- spacing (px)
// antd's margin*/padding*/size* ladders are 4/8/12/16/20/24/32/48 and Astryx's
// --spacing-N ladder contains every one of those values exactly.
const sp = (v: string): MapEntry => ({
  verdict: 'astryx',
  var: v,
  kind: 'length',
});

export const TOKEN_MAP: Record<string, MapEntry> = {
  // ---- spacing: 25 names, all EXACT -------------------------------------
  marginXXS: sp('--spacing-1'), //  4
  marginXS: sp('--spacing-2'), //  8
  marginSM: sp('--spacing-3'), // 12
  margin: sp('--spacing-4'), // 16
  marginMD: sp('--spacing-5'), // 20
  marginLG: sp('--spacing-6'), // 24
  marginXL: sp('--spacing-8'), // 32
  marginXXL: sp('--spacing-12'), // 48
  paddingXXS: sp('--spacing-1'),
  paddingXS: sp('--spacing-2'),
  paddingSM: sp('--spacing-3'),
  padding: sp('--spacing-4'),
  paddingMD: sp('--spacing-5'),
  paddingLG: sp('--spacing-6'),
  paddingXL: sp('--spacing-8'),
  sizeXXS: sp('--spacing-1'),
  sizeXS: sp('--spacing-2'),
  size: sp('--spacing-4'),
  sizeXL: sp('--spacing-8'),
  sizeXXL: sp('--spacing-12'),
  paddingContentVertical: sp('--spacing-3'), // 12
  paddingContentVerticalLG: sp('--spacing-4'), // 16
  paddingContentHorizontal: sp('--spacing-4'), // 16
  paddingContentHorizontalSM: sp('--spacing-4'), // 16
  paddingContentHorizontalLG: sp('--spacing-6'), // 24

  // ---- radius ------------------------------------------------------------
  borderRadiusSM: sp('--radius-none'), //  4 == theme-neutral 0.25rem
  borderRadius: sp('--radius-inner'), //  6 == theme-neutral 0.375rem
  borderRadiusLG: {
    verdict: 'aligned',
    var: '--radius-element',
    kind: 'length',
    note: 'Astryx neutral 10px; ticket 02 pinned 8px (antd)',
  },
  borderRadiusXS: {
    verdict: 'self',
    note: 'antd 2px; Astryx theme-neutral has no radius below --radius-none (4px)',
  },

  // ---- line / control ----------------------------------------------------
  lineWidth: sp('--border-width'), // 1
  controlHeight: sp('--size-element-md'), // 32 exact
  controlHeightSM: {
    verdict: 'self',
    note: 'antd 24 vs Astryx --size-element-sm 28; too big a delta for form rows',
  },

  // ---- typography --------------------------------------------------------
  fontSizeSM: sp('--font-size-sm'), // 12 exact
  fontSize: sp('--font-size-base'), // 14 exact
  fontSizeXL: sp('--font-size-xl'), // 20 exact
  fontSizeHeading4: sp('--font-size-xl'), // 20 exact
  fontSizeHeading3: sp('--font-size-2xl'), // 24 exact
  fontSizeLG: {
    verdict: 'aligned',
    var: '--font-size-lg',
    kind: 'length',
    note: 'Astryx neutral 17px; ticket 02 pinned 16px (antd)',
  },
  fontSizeHeading5: {
    verdict: 'aligned',
    var: '--font-size-lg',
    kind: 'length',
    note: 'same variable as fontSizeLG',
  },
  fontSizeHeading1: {
    verdict: 'aligned',
    var: '--font-size-4xl',
    kind: 'length',
    note: 'Astryx neutral 35px; ticket 02 pinned 38px (antd)',
  },
  // `--font-weight-*` is a unitless number, not a length: a padding probe
  // resolves it to 0. It needs the 'number' kind (custom-property read).
  fontWeightStrong: {
    verdict: 'astryx',
    var: '--font-weight-semibold',
    kind: 'number',
  }, // 600
  fontFamilyCode: {
    verdict: 'astryx',
    var: '--font-family-code',
    kind: 'raw',
  },
  fontFamily: {
    verdict: 'brand',
    note: "resources/theme.json fontFamily ('Ubuntu'); Astryx --font-family-body is Figtree",
  },
  lineHeight: {
    verdict: 'self',
    note: 'antd 1.5714 vs Astryx --text-body-leading 1.4286; Astryx has no global lineHeight',
  },

  // ---- motion / elevation ------------------------------------------------
  motionDurationSlow: {
    verdict: 'aligned',
    var: '--duration-slow',
    kind: 'raw',
    note: 'Astryx neutral 700ms; ticket 02 pinned 300ms (antd 0.3s)',
  },
  boxShadowSecondary: {
    verdict: 'aligned',
    var: '--shadow-med',
    kind: 'raw',
    note: 'ticket 02 pinned the antd recipe (single string with light-dark())',
  },

  // ---- neutral colours: Astryx counterparts ------------------------------
  // Semantic counterparts. Values follow the ACTIVE Astryx theme; under
  // theme-neutral most are within a few steps of antd's greys (measured
  // ticket 06: e.g. colorText #141414 -> #171717). That drift is the
  // visual-value policy working as intended — Astryx defaults win.
  colorText: { verdict: 'astryx', var: '--color-text-primary', kind: 'color' },
  colorTextBase: {
    verdict: 'astryx',
    var: '--color-text-primary',
    kind: 'color',
  },
  colorTextSecondary: {
    verdict: 'astryx',
    var: '--color-text-secondary',
    kind: 'color',
  },
  colorTextDisabled: {
    verdict: 'astryx',
    var: '--color-text-disabled',
    kind: 'color',
  },
  colorBorder: {
    verdict: 'astryx',
    var: '--color-border-emphasized',
    kind: 'color',
  },
  colorBorderSecondary: {
    verdict: 'astryx',
    var: '--color-border',
    kind: 'color',
  },
  colorSplit: { verdict: 'astryx', var: '--color-border', kind: 'color' },
  colorBgContainer: {
    verdict: 'astryx',
    var: '--color-background-surface',
    kind: 'color',
  },
  colorBgBase: {
    verdict: 'astryx',
    var: '--color-background-body',
    kind: 'color',
  },
  colorBgLayout: {
    verdict: 'astryx',
    var: '--color-background-body',
    kind: 'color',
  },
  colorBgElevated: {
    verdict: 'astryx',
    var: '--color-background-popover',
    kind: 'color',
  },
  colorWhite: { verdict: 'astryx', var: '--color-on-dark', kind: 'color' },
  colorTextLightSolid: {
    verdict: 'astryx',
    var: '--color-on-dark',
    kind: 'color',
  },
  colorBgTextHover: {
    verdict: 'astryx',
    var: '--color-overlay-hover',
    kind: 'color',
  },

  // ---- brand seeds: runtime-configurable, NOT Astryx --------------------
  // resources/theme.json + the per-user `custom_primary_color` setting own
  // these. Astryx themes are static npm packages; they cannot express a
  // per-deployment accent, so these stay ours regardless of the design
  // system. Light = the declared seed; dark = antd's darkAlgorithm seed
  // transform, reproduced exactly by `palette(seed, 'dark')(6)` (verified
  // against ticket 02's measured table in mapping.test.ts).
  colorPrimary: { verdict: 'brand' },
  colorLink: { verdict: 'brand' },
  colorError: {
    verdict: 'brand',
    note: 'Astryx --color-error exists but theme.json overrides it',
  },
  colorSuccess: { verdict: 'brand', note: 'ditto --color-success' },
  colorWarning: { verdict: 'brand', note: 'ditto --color-warning' },
  colorInfo: { verdict: 'brand', note: 'Astryx has NO info colour at all' },

  // ---- derived state families: antd derived these; so do we -------------
  // Astryx offers only `--color-*-muted` + two overlay levels where antd has
  // a ten-step ramp per seed, so the shim keeps antd's own derivation
  // (vendored `palette()`), including the light/dark key divergence of
  // antd's two algorithms.
  colorPrimaryHover: {
    verdict: 'derive',
    derive: { seed: 'colorPrimary', key: 5 },
  },
  colorPrimaryBg: {
    verdict: 'derive',
    // antd dark aliases colorPrimaryBg to colorPrimaryBorder (key 3) — see
    // the trailing overrides in antd/es/theme/themes/dark/index.js.
    derive: { seed: 'colorPrimary', key: 1, darkKey: 3 },
  },
  colorLinkHover: { verdict: 'derive', derive: { seed: 'colorLink', key: 4 } },
  colorErrorHover: {
    verdict: 'derive',
    derive: { seed: 'colorError', key: 5 },
  },
  colorErrorBg: { verdict: 'derive', derive: { seed: 'colorError', key: 1 } },
  colorErrorBorder: {
    verdict: 'derive',
    derive: { seed: 'colorError', key: 3 },
  },
  colorWarningHover: {
    verdict: 'derive',
    derive: { seed: 'colorWarning', key: 4 },
  },
  colorWarningBg: {
    verdict: 'derive',
    derive: { seed: 'colorWarning', key: 1 },
  },
  colorWarningBorder: {
    verdict: 'derive',
    derive: { seed: 'colorWarning', key: 3 },
  },
  colorWarningBorderHover: {
    verdict: 'derive',
    derive: { seed: 'colorWarning', key: 4 },
  },
  colorSuccessBorderHover: {
    verdict: 'derive',
    derive: { seed: 'colorSuccess', key: 4 },
  },
  colorInfoBg: { verdict: 'derive', derive: { seed: 'colorInfo', key: 1 } },
  // Preset hues are FIXED tables in antd, not `generate()` output — using
  // the tables keeps parity exact. Bare hues (`token.red`) stay
  // untransformed in dark mode; the `*5`/`*10` steps switch to the dark
  // table (antd's dark derivative regenerates them per hue seed).
  red: {
    verdict: 'derive',
    preset: { hue: 'red', index: 5 },
    note: 'bare preset hue = the seed; NOT dark-transformed by antd',
  },
  red5: {
    verdict: 'derive',
    preset: { hue: 'red', index: 4, darkTable: true },
  },
  green5: {
    verdict: 'derive',
    preset: { hue: 'green', index: 4, darkTable: true },
  },
  purple5: {
    verdict: 'derive',
    preset: { hue: 'purple', index: 4, darkTable: true },
  },
  blue10: {
    verdict: 'derive',
    preset: { hue: 'blue', index: 9, darkTable: true },
  },

  // ---- no Astryx counterpart: we own the value --------------------------
  colorTextTertiary: {
    verdict: 'self',
    note: 'Astryx text tiers stop at secondary/disabled',
  },
  colorTextQuaternary: { verdict: 'self', note: 'ditto' },
  colorTextLabel: { verdict: 'self', note: 'ditto' },
  colorTextDescription: { verdict: 'self', note: 'ditto' },
  colorTextPlaceholder: {
    verdict: 'self',
    note: 'exists as a Text prop value, not a token',
  },
  colorFill: { verdict: 'self', note: 'Astryx fill scale is 2 levels, antd 6' },
  colorFillSecondary: { verdict: 'self' },
  colorFillTertiary: { verdict: 'self' },
  colorFillQuaternary: { verdict: 'self' },
  colorFillContent: { verdict: 'self' },
  colorFillAlter: { verdict: 'self' },
  colorBgContainerDisabled: {
    verdict: 'self',
    note: 'no disabled-surface token',
  },
  colorBgSpotlight: {
    verdict: 'self',
    note: 'tooltip surface; no counterpart',
  },
  screenXS: { verdict: 'self', note: 'Astryx has NO breakpoint tokens' },
  screenSM: { verdict: 'self', note: 'ditto' },
  zIndexPopupBase: {
    verdict: 'self',
    note: 'Astryx layering is owned by LayerProvider',
  },
};

/** antd component tokens reached through `token.Layout?.*` (8 refs, 4 files). */
export const COMPONENT_TOKEN_KEYS = ['Layout'] as const;
