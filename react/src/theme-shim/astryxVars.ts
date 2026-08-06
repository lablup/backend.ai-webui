/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 SPIKE (06-theme-token-layer): resolve Astryx CSS custom properties to concrete
 JS values.

 Why resolve instead of returning `var(--x)` strings: the repo consumes antd
 tokens in JS contexts that a `var()` string cannot survive —
 `token.marginSM * -1`, `` `${token.paddingSM}px` ``, `token.colorPrimary.slice(1, 3)`,
 `generate(token.colorPrimary)`. See `scripts/spike-token-scan.mjs` for counts.

 Resolution is batched: every probe element is written first, then read once, so
 the whole table costs a single style/layout flush per theme change.
*/

export type AstryxVarKind = 'length' | 'color' | 'raw' | 'number';

const LENGTH_PROP = 'padding-top';
const COLOR_PROP = 'color';

/**
 * Resolve a batch of CSS custom properties against `document.documentElement`'s
 * current cascade (so `light-dark()`, nested `<Theme mode>` and any custom
 * Astryx theme all flow through).
 *
 * `length` -> px number, `color` -> `rgb()/rgba()` string, `raw` -> the
 * computed token stream (font stacks, shadows, durations).
 */
export function resolveAstryxVars(
  spec: Record<string, { var: string; kind: AstryxVarKind }>,
  container: HTMLElement = document.body,
): Record<string, string | number> {
  const keys = Object.keys(spec);
  const host = document.createElement('div');
  host.setAttribute('aria-hidden', 'true');
  host.style.cssText =
    'position:absolute;visibility:hidden;pointer-events:none;width:0;height:0;overflow:hidden;contain:strict';

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
  const rootStyle = getComputedStyle(document.documentElement);
  keys.forEach((k, i) => {
    const { var: name, kind } = spec[k];
    const cs = getComputedStyle(probes[i]);
    if (kind === 'color') {
      out[k] = cs.color;
    } else if (kind === 'length') {
      out[k] = parseFloat(cs.paddingTop) || 0;
    } else if (kind === 'number') {
      out[k] = parseFloat(rootStyle.getPropertyValue(name)) || 0;
    } else {
      // `raw`: custom properties are not resolved by the probe, read declared value
      out[k] = rootStyle.getPropertyValue(name).trim();
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
