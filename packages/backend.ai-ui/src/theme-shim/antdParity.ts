/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Measured antd parity tables shared by the theme shim and the react app's
 brand-theme builder (to-astryx ticket 10 — moved here from
 react/src/astryx-theme/backendAiTheme.ts so the shim can live in BUI, which
 cannot import from react/src; backendAiTheme.ts re-exports these for its
 own consumers).

 Both tables are ticket-02/06 MEASUREMENTS, not styling opinions:
 - ANTD_DARK_ALGORITHM_OUTPUT: what antd's darkAlgorithm actually renders for
   the dark seeds this repo ships (`theme.getDesignToken()` numeric A/B).
 - ANTD_ALIGN_TOKENS: the 6 known antd<->Astryx token VALUE differences,
   pinned to the antd values so migrated surfaces keep today's metrics.
 */

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
