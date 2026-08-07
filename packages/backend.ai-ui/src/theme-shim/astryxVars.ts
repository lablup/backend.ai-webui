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

const LENGTH_PROP = 'padding-top';
const COLOR_PROP = 'color';

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
export function resolveAstryxVars(
  spec: Record<string, { var: string; kind: AstryxVarKind }>,
  { mode, scopeAttr, container = document.body }: ResolveAstryxVarsOptions,
): Record<string, string | number> {
  const keys = Object.keys(spec);
  const host = document.createElement('div');
  host.setAttribute('aria-hidden', 'true');
  if (scopeAttr !== null) {
    host.setAttribute('data-astryx-theme', scopeAttr);
  }
  host.style.cssText =
    'position:absolute;visibility:hidden;pointer-events:none;width:0;height:0;overflow:hidden;contain:strict';
  host.style.colorScheme = mode;

  const probes = keys.map((k) => {
    const { var: name, kind } = spec[k];
    const el = document.createElement('div');
    if (kind === 'color') el.style.setProperty(COLOR_PROP, `var(${name})`);
    else el.style.setProperty(LENGTH_PROP, `var(${name})`);
    host.appendChild(el);
    return el;
  });

  container.appendChild(host);
  const out: Record<string, string | number> = {};
  // Scoped custom properties inherit to the host, so `raw`/`number` reads go
  // through the host's computed style (NOT documentElement, which may sit
  // outside the @scope'd theme region).
  const hostStyle = getComputedStyle(host);
  keys.forEach((k, i) => {
    const { var: name, kind } = spec[k];
    const cs = getComputedStyle(probes[i]);
    if (kind === 'color') {
      out[k] = cs.color;
    } else if (kind === 'length') {
      out[k] = parseFloat(cs.paddingTop) || 0;
    } else if (kind === 'number') {
      out[k] = parseFloat(hostStyle.getPropertyValue(name)) || 0;
    } else {
      // `raw`: the probe cannot resolve non-length/color streams — read the
      // declared value off the host's inherited custom property.
      out[k] = hostStyle.getPropertyValue(name).trim();
    }
  });
  container.removeChild(host);
  return out;
}

/** `rgb(a, b, c)` / `rgba(a, b, c, d)` -> `#rrggbb` (drops alpha). */
export function rgbToHex(rgb: string): string {
  const m = rgb.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/);
  if (!m) return rgb;
  const h = (v: string) =>
    Math.round(parseFloat(v)).toString(16).padStart(2, '0');
  return `#${h(m[1])}${h(m[2])}${h(m[3])}`;
}

/**
 * Resolve every `light-dark(A, B)` occurrence in a token stream to its
 * per-mode side. Needed for multi-color recipes (box shadows) that store the
 * mode pair inline — see `ANTD_ALIGN_TOKENS['--shadow-med']` in
 * `../astryx-theme/backendAiTheme.ts` for why they must be single strings.
 * Paren-aware: `rgba(...)` commas inside either side are handled.
 */
export function resolveLightDark(
  value: string,
  mode: 'light' | 'dark',
): string {
  const fn = 'light-dark(';
  let out = '';
  let i = 0;
  for (;;) {
    const idx = value.indexOf(fn, i);
    if (idx === -1) {
      out += value.slice(i);
      return out;
    }
    out += value.slice(i, idx);
    let depth = 1;
    let commaAt = -1;
    let j = idx + fn.length;
    for (; j < value.length && depth > 0; j++) {
      const c = value[j];
      if (c === '(') depth += 1;
      else if (c === ')') depth -= 1;
      else if (c === ',' && depth === 1 && commaAt === -1) commaAt = j;
    }
    if (commaAt === -1) {
      // Malformed — emit verbatim rather than corrupting the stream.
      out += value.slice(idx, j);
    } else {
      out += (
        mode === 'dark'
          ? value.slice(commaAt + 1, j - 1)
          : value.slice(idx + fn.length, commaAt)
      ).trim();
    }
    i = j;
  }
}
