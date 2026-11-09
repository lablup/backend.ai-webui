/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Resolve Astryx CSS custom properties to concrete JS values
 (to-astryx ticket 03, from the ticket-06 spike).

 Why resolve instead of returning `var(--x)` strings: the repo consumes antd
 tokens in JS contexts a `var()` string cannot survive — measured 144 sites in
 39 files (ticket 06): `token.marginSM * -1`, `` `${token.paddingSM}px` ``,
 `token.colorPrimary.slice(1, 3)`, `generate(token.colorPrimary)`.

 Resolution is batched: every probe element is written first, then read once,
 so the whole table costs a single style/layout flush per theme change.

 The probe is SELF-CONTAINED: the hidden host carries its own
 `data-astryx-theme` scope attribute (only when no real Astryx root `<Theme>`
 owns the document — then the host inherits that cascade instead) and its own
 inline `color-scheme` (which is what resolves every `light-dark()` token).
 No attribute is ever written to `<html>`/`<body>`, so mounting the shim can
 not restyle anything outside its probes — scrollbars, native form controls
 and Astryx @scope'd prose rules all stay exactly as they were.
 */
export type AstryxVarKind = 'length' | 'color' | 'raw' | 'number';
export interface ResolveAstryxVarsOptions {
    /** Resolves `light-dark()` tokens via an inline `color-scheme` on the host. */
    mode: 'light' | 'dark';
    /**
     * Theme scope to open on the probe host (e.g. `'neutral'`). Pass `null`
     * when an ancestor already carries `data-astryx-theme` — the host then
     * reads that live cascade at its insertion point.
     */
    scopeAttr: string | null;
    container?: HTMLElement;
}
/**
 * Resolve a batch of CSS custom properties against the Astryx cascade.
 *
 * `length` -> px number, `color` -> `rgb()/rgba()` string, `number` ->
 * unitless number (font weights — a padding probe would resolve them to 0),
 * `raw` -> the computed token stream (font stacks, shadows, durations).
 */
export declare function resolveAstryxVars(spec: Record<string, {
    var: string;
    kind: AstryxVarKind;
}>, { mode, scopeAttr, container }: ResolveAstryxVarsOptions): Record<string, string | number>;
/** `rgb(a, b, c)` / `rgba(a, b, c, d)` -> `#rrggbb` (drops alpha). */
export declare function rgbToHex(rgb: string): string;
/**
 * Resolve every `light-dark(A, B)` occurrence in a token stream to its
 * per-mode side. Needed for multi-color recipes (box shadows) that store the
 * mode pair inline — see `ANTD_ALIGN_TOKENS['--shadow-med']` in
 * `../astryx-theme/backendAiTheme.ts` for why they must be single strings.
 * Paren-aware: `rgba(...)` commas inside either side are handled.
 */
export declare function resolveLightDark(value: string, mode: 'light' | 'dark'): string;
