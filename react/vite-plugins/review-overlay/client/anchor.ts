/**
 * Capture the multi-signal `#bai=v3` anchor for a picked element.
 *
 * Selector alone is too brittle to survive a re-render or a refactor, so the
 * payload carries redundant signals (testid landmark + fractional rect + tag +
 * text). Resolving them back to an element is the READ side's job (FR-3813).
 */
import type { AnchorComponent, AnchorV3 } from './types.js';

const esc = (v: string) => (window.CSS && CSS.escape ? CSS.escape(v) : v);

export const normText = (s: string | null | undefined) =>
  (s || '').replace(/\s+/g, ' ').trim();

/**
 * React's `useId` encodes the element's position in the fiber tree — `:r1:` in
 * React 18, `_r_1_` / `_R_2H3_` in React 19 — so it changes whenever anything
 * above the element is refactored, which is exactly what the anchor has to
 * survive. `BAIComplexSelect` and `BAIDialog` put such ids on real DOM nodes,
 * so skip them and let the nth-of-type walk find a stable landmark instead.
 */
export const isStableId = (id: string): boolean =>
  !!id &&
  !/^:r[0-9a-z]*:$/i.test(id) &&
  !/^_[a-zA-Z0-9]*[rR]_[0-9a-zA-Z]*_/.test(id);

/** `[data-testid=…]` / `#id` when available, else an nth-of-type path up to one. */
export function buildSelector(target: Element): string {
  const testid = target.getAttribute('data-testid');
  if (testid) return `[data-testid="${esc(testid)}"]`;
  if (isStableId(target.id)) return `#${esc(target.id)}`;
  const parts: string[] = [];
  let node: Element | null = target;
  while (node && node.nodeType === 1 && node !== document.body) {
    const parent: Element | null = node.parentElement;
    const nodeTestid = node.getAttribute('data-testid');
    const anchorId = nodeTestid
      ? `[data-testid="${esc(nodeTestid)}"]`
      : isStableId(node.id)
        ? `#${esc(node.id)}`
        : null;
    if (anchorId) {
      parts.unshift(anchorId);
      break;
    }
    const tag = node.tagName.toLowerCase();
    let nth = 1;
    let sib: Element | null = node;
    while ((sib = sib.previousElementSibling)) {
      if (sib.tagName === node.tagName) nth++;
    }
    parts.unshift(`${tag}:nth-of-type(${nth})`);
    node = parent;
  }
  return parts.join(' > ') || 'body';
}

export function captureAnchorSignals(
  target: Element,
  component?: AnchorComponent,
): AnchorV3 {
  const anchor: AnchorV3 = {
    v: 3,
    s: buildSelector(target),
    p: location.pathname,
  };
  const q = location.search.replace(/^\?/, '');
  if (q) anchor.q = q;
  anchor.tag = target.tagName.toLowerCase();
  const txt = normText(
    (target as HTMLElement).innerText || target.textContent,
  ).slice(0, 64);
  if (txt) anchor.txt = txt;
  const tidEl = target.closest('[data-testid]');
  if (tidEl) {
    anchor.tid = tidEl.getAttribute('data-testid') ?? undefined;
    if (tidEl !== target) {
      const cr = tidEl.getBoundingClientRect();
      const tr = target.getBoundingClientRect();
      if (cr.width && cr.height) {
        const f = (n: number) => Math.round(n * 1e4) / 1e4;
        anchor.rect = {
          x: f((tr.left - cr.left) / cr.width),
          y: f((tr.top - cr.top) / cr.height),
          w: f(tr.width / cr.width),
          h: f(tr.height / cr.height),
        };
      }
    }
  }
  if (component) anchor.c = component;
  return anchor;
}
