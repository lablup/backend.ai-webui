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
export declare const ANTD_DARK_ALGORITHM_OUTPUT: Record<string, string>;
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
export declare const ANTD_ALIGN_TOKENS: {
    readonly '--radius-element': "8px";
    readonly '--radius-container': "8px";
    readonly '--font-size-lg': "16px";
    readonly '--font-size-3xl': "30px";
    readonly '--font-size-4xl': "38px";
    readonly '--text-heading-1-size': "var(--font-size-4xl)";
    readonly '--text-heading-2-size': "var(--font-size-3xl)";
    readonly '--text-heading-3-size': "var(--font-size-2xl)";
    readonly '--text-heading-4-size': "var(--font-size-xl)";
    readonly '--text-heading-5-size': "var(--font-size-lg)";
    readonly '--text-body-leading': "1.5714";
    readonly '--text-label-leading': "1.5714";
    readonly '--text-code-leading': "1.5714";
    readonly '--size-element-sm': "24px";
    readonly '--duration-slow': "300ms";
    readonly '--shadow-med': string;
    readonly '--shadow-high': string;
};
/**
 * The neutral hover/pressed washes for the header band, which is a REVERSED
 * surface: its content polarity follows the app mode (FR-3502), so the wash
 * must too — TRANSLUCENT WHITE over the brand orange in light, TRANSLUCENT
 * BLACK in dark. Both stay translucent so the orange shows through; the
 * app-wide `--color-overlay-hover` cannot be used here because its dark half
 * is a translucent WHITE wash (`rgba(255,255,255,0.08)`, `ANTD_NEUTRAL_SURFACES`)
 * — right for a page-polarity surface, wrong POLARITY for a band that inverts
 * with the app mode, where dark needs black. (Before FR-3557 that dark half was
 * the opaque `#262626`, so the reason was opacity rather than polarity; the
 * override is still required either way.)
 *
 * `light-dark()` is not usable and this must be indexed in JS by the caller: a
 * custom property holding `light-dark(a, b)` is substituted at USE time, and
 * consumers sit inside the band's `MediaTheme`, so the forced scheme picks the
 * slot instead of the app scheme (measured).
 *
 * `rgba(255,255,255,0.16)` is the same wash `ANTD_HOVER_PARITY` applies to
 * filled buttons (`backendAiTheme.ts`) — no new number. FR-3501.
 */
export declare const ANTD_REVERSED_BAND_OVERLAYS: {
    readonly light: {
        readonly '--color-overlay-hover': "rgba(255,255,255,0.16)";
        readonly '--color-overlay-pressed': "rgba(255,255,255,0.18)";
    };
    readonly dark: {
        readonly '--color-overlay-hover': "rgba(0,0,0,0.06)";
        readonly '--color-overlay-pressed': "rgba(0,0,0,0.15)";
    };
};
