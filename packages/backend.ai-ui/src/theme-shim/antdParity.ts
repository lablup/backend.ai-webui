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
 - ANTD_ALIGN_TOKENS: the known antd<->Astryx token VALUE differences,
   pinned to the antd values so migrated surfaces keep today's metrics.
   Extended by the audit-1 regression catalog (REGRESSION-CATALOG.md §1.3):
   the original 6 pins landed on the LADDER tokens (`--font-size-lg`,
   `--font-size-4xl`, `--radius-element`) but nothing consumed them, because
   the Astryx type/radius SEMANTICS (`--text-heading-N-size`,
   `--radius-container`) point at other rungs. The semantic tokens are pinned
   here too, so a pin actually reaches a rendered heading / card / dialog.
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
 * The known antd↔Astryx token VALUE differences (ticket 06 "drift" class,
 * extended by audit 1), aligned to the antd values so migrated surfaces keep
 * today's metrics.
 *
 * | antd token          | antd  | Astryx neutral            | override    |
 * |---------------------|-------|---------------------------|-------------|
 * | borderRadiusLG      | 8px   | --radius-element 10       | 8px         |
 * | borderRadiusLG      | 8px   | --radius-container 12     | 8px         |
 * | fontSizeLG          | 16px  | --font-size-lg 17         | 16px        |
 * | fontSizeHeading5    | 16px  | --font-size-lg 17         | (same var)  |
 * | fontSizeHeading2    | 30px  | --font-size-3xl 29        | 30px        |
 * | fontSizeHeading1    | 38px  | --font-size-4xl 35        | 38px        |
 * | fontSizeHeading1..5 | 38/30/24/20/16 | --text-heading-N-size    | remapped    |
 * | lineHeight          | 1.5714| --text-body-leading 1.4286| 1.5714      |
 * | controlHeightSM     | 24px  | --size-element-sm 28      | 24px        |
 * | motionDurationSlow  | .3s   | --duration-slow 700       | 300ms       |
 * | boxShadowSecondary  | —     | --shadow-med              | antd recipe |
 * | boxShadowSecondary  | —     | --shadow-high             | antd recipe |
 *
 * px (not rem) on purpose: antd emitted px, and the goal of this layer is
 * approximating the current appearance exactly.
 *
 * EVERY value here is a PLAIN STRING, never a `[light, dark]` tuple.
 * `defineTheme` serialises a tuple as `light-dark(a, b)`, and CSS
 * `light-dark()` accepts COLOURS only — a tuple on a size / radius /
 * line-height token emits invalid CSS and the declaration silently falls back
 * to the Astryx default (this is exactly how the `--shadow-med` bug shipped
 * once, see the note above). None of these are mode-dependent in antd either:
 * `darkAlgorithm` transforms colours, not the size/radius/duration ladders.
 */
export const ANTD_ALIGN_TOKENS = {
  // --- radius: antd `borderRadiusLG` feeds BOTH Astryx radius semantics.
  // `--radius-element` alone reaches inputs/buttons; Card, Dialog, Banner,
  // Tooltip and DropdownMenu all read `--radius-container`, which stayed at
  // Astryx's 12px until audit 1 measured it (catalog G-5 / O-3 / T-4 / F-4).
  '--radius-element': '8px',
  '--radius-container': '8px',
  // --- type ladder rungs the headings below point at.
  '--font-size-lg': '16px',
  '--font-size-3xl': '30px',
  '--font-size-4xl': '38px',
  // --- type SEMANTICS. Pinning the ladder above never reached a heading:
  // Astryx's heading scale starts three rungs lower than antd's, so
  // `Typography.Title` 1..5 (38/30/24/20/16) rendered as 24/20/16/14/12 —
  // a modal title (Heading level 2) came out 20px against antd's 16px, and
  // the route-error headline (level 4) came out smaller than body text
  // (catalog G-3, O-2, R-5, 57 sites).
  //
  // ⚠ KNOWN FALLOUT — OPEN, needs a call-site pass, not a token change.
  // These five lines restore the antd SCALE, but a large share of this repo's
  // `<Heading level={N}>` call sites were chosen against the OLD Astryx scale,
  // i.e. by rendered size rather than by document level. Several carry a
  // PILOT-DECISION comment saying so outright — e.g.
  // `MyResourceWithinResourceGroup.tsx:203` converts an antd `Typography.Text`
  // at `fontSizeHeading5` (16px) to `Heading level={3}` "visual values follow
  // Astryx defaults", which was 16px then and is 24px now. Measured after this
  // pin, at 1600x1000, light + dark:
  //
  //   BAICard string title (`BAICard.tsx:270`, level 3)   16px -> 24px
  //   Board widget titles (dashboard, x9, level 3)        16px -> 24px
  //   Astryx `DialogHeader` title (hard-coded level 2)    20px -> 30px
  //     — antd `.ant-modal-title` was 16px, so catalog O-2's "closed by G-3"
  //       is wrong in BOTH directions; the dialog title needs its own pin.
  //   Card titles already on level 5 (a-settings, …)      12px -> 16px ✅
  //
  // So the pin FIXES every level-5 site and OVERSHOOTS the 33 level-3 and
  // 2 level-2 sites. The fix is to re-level those call sites (mostly
  // `level={3}` -> `level={5}`), which is a component pass and deliberately
  // out of scope here. If that pass is not landing in the same release, drop
  // these five lines plus the `--font-size-3xl` rung above and the scale
  // reverts cleanly — nothing else in this table depends on them.
  '--text-heading-1-size': 'var(--font-size-4xl)', // antd fontSizeHeading1 38
  '--text-heading-2-size': 'var(--font-size-3xl)', // antd fontSizeHeading2 30
  '--text-heading-3-size': 'var(--font-size-2xl)', // antd fontSizeHeading3 24
  '--text-heading-4-size': 'var(--font-size-xl)', //  antd fontSizeHeading4 20
  '--text-heading-5-size': 'var(--font-size-lg)', //  antd fontSizeHeading5 16
  // --- line rhythm. antd `lineHeight` 1.5714 → 22px at 14px; Astryx's 1.4286
  // → 20px. The breadcrumb is still antd-rendered, so before this pin the two
  // engines disagreed by 2px inside a single screen (catalog G-2 / G-11).
  '--text-body-leading': '1.5714',
  '--text-label-leading': '1.5714',
  '--text-code-leading': '1.5714',
  // --- control height. antd `controlHeightSM` 24; every `size="small"`
  // button/select/input was 4px too tall (catalog G-8 / F-6).
  '--size-element-sm': '24px',
  '--duration-slow': '300ms',
  // --- elevation. antd had ONE elevated-surface recipe (`boxShadowSecondary`)
  // for dialogs, popovers, dropdowns and notifications alike; Astryx splits
  // them across `--shadow-med` / `--shadow-high`, and the Dialog/Banner read
  // the harder `high` step (catalog G-6 / O-4 / O-9).
  '--shadow-med': ANTD_BOX_SHADOW_SECONDARY,
  '--shadow-high': ANTD_BOX_SHADOW_SECONDARY,
} as const;
