/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 SPIKE (06-theme-token-layer): the antd -> Astryx token mapping table.

 Every one of the 99 antd design-token names the repo actually references gets a
 resolution here. Verdicts:

   'astryx'  exact Astryx counterpart, same value          -> resolved live
   'drift'   Astryx counterpart, DIFFERENT value           -> resolved live, delta documented
   'derive'  computed from a brand seed (antd's own algorithm)
   'brand'   owned by resources/theme.json + user accent   -> must stay runtime-configurable
   'self'    no Astryx counterpart                         -> our own light/dark pair
*/

export type Verdict = 'astryx' | 'drift' | 'derive' | 'brand' | 'self';

export interface MapEntry {
  verdict: Verdict;
  /** Astryx CSS custom property (verdict astryx | drift). */
  var?: string;
  kind?: 'length' | 'color' | 'raw' | 'number';
  /** For 'drift': antd value -> Astryx value, in px unless noted. */
  delta?: string;
  /** For 'derive': human-readable formula. */
  formula?: string;
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
  // ---- spacing: 27 names, all EXACT -------------------------------------
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
    verdict: 'drift',
    var: '--radius-element',
    kind: 'length',
    delta: 'antd 8 -> Astryx 10 (+2px)',
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
    verdict: 'drift',
    var: '--font-size-lg',
    kind: 'length',
    delta: 'antd 16 -> Astryx 17 (+1px)',
  },
  fontSizeHeading5: {
    verdict: 'drift',
    var: '--font-size-lg',
    kind: 'length',
    delta: 'antd 16 -> Astryx 17 (+1px)',
  },
  fontSizeHeading1: {
    verdict: 'drift',
    var: '--font-size-4xl',
    kind: 'length',
    delta: 'antd 38 -> Astryx 35 (-3px); the whole heading ramp differs',
  },
  // `--font-weight-*` is a unitless number, not a length: a padding probe
  // resolves it to 0. It needs the 'number' kind (raw custom-property read).
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
    verdict: 'drift',
    var: '--duration-slow',
    kind: 'raw',
    delta: 'antd 0.3s -> Astryx 700ms (2.3x slower)',
  },
  boxShadowSecondary: {
    verdict: 'drift',
    var: '--shadow-med',
    kind: 'raw',
    delta: 'different shadow recipe (Astryx adds an inset hairline)',
  },

  // ---- neutral colours: EXACT -------------------------------------------
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
  // per-deployment accent, so these stay ours regardless of the design system.
  colorPrimary: { verdict: 'brand' },
  colorLink: { verdict: 'brand' },
  colorError: {
    verdict: 'brand',
    note: 'Astryx --color-error exists but is red-600-ish; theme.json overrides it',
  },
  colorSuccess: { verdict: 'brand', note: 'ditto --color-success' },
  colorWarning: { verdict: 'brand', note: 'ditto --color-warning' },
  colorInfo: { verdict: 'brand', note: 'Astryx has NO info colour at all' },

  // ---- derived state families: antd derived these; so do we -------------
  // `generate(seed, {theme, backgroundColor})` is antd's own palette algorithm.
  // 10-step ramp; antd picks index 4 for Hover, 0 for Bg, 2 for Border, 3 for
  // BorderHover. Astryx offers only `--color-*-muted` + two overlay levels.
  colorPrimaryHover: { verdict: 'derive', formula: 'ramp(colorPrimary)[4]' },
  colorPrimaryBg: { verdict: 'derive', formula: 'ramp(colorPrimary)[0]' },
  colorLinkHover: { verdict: 'derive', formula: 'ramp(colorLink)[3]' },
  colorErrorHover: { verdict: 'derive', formula: 'ramp(colorError)[4]' },
  colorErrorBg: { verdict: 'derive', formula: 'ramp(colorError)[0]' },
  colorErrorBorder: { verdict: 'derive', formula: 'ramp(colorError)[2]' },
  colorWarningHover: { verdict: 'derive', formula: 'ramp(colorWarning)[3]' },
  colorWarningBg: { verdict: 'derive', formula: 'ramp(colorWarning)[0]' },
  colorWarningBorder: { verdict: 'derive', formula: 'ramp(colorWarning)[2]' },
  colorWarningBorderHover: {
    verdict: 'derive',
    formula: 'ramp(colorWarning)[3]',
  },
  colorSuccessBorderHover: {
    verdict: 'derive',
    formula: 'ramp(colorSuccess)[3]',
  },
  colorInfoBg: { verdict: 'derive', formula: 'ramp(colorInfo)[0]' },
  // preset hues antd generates from its own seed palette
  red: { verdict: 'derive', formula: 'presetRamp("red")[5]' }, // preset hues are NOT dark-transformed by antd
  red5: { verdict: 'derive', formula: 'presetRamp("red")[4]' },
  green5: { verdict: 'derive', formula: 'presetRamp("green")[4]' },
  purple5: { verdict: 'derive', formula: 'presetRamp("purple")[4]' },
  blue10: { verdict: 'derive', formula: 'presetRamp("blue")[9]' },

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
