/**
 * Resolving a `#bai=v3` anchor back to an element (FR-3813).
 *
 * The selector alone is not enough — a React `useId` never survives a reload
 * and an nth-of-type path does not survive a refactor — so the signals are
 * tried in order of how much they promise: selector (confirmed by text),
 * testid landmark, text scan, rect projection, and the bare selector hit as a
 * last resort.
 */
import { normText } from './anchor.js';
import type { AnchorV3 } from './types.js';

/** How many candidates a text scan will look at before giving up. */
const SCAN_LIMIT = 5000;

export interface ResolveOptions {
  doc?: Document;
  /** The overlay's own shadow host — never a valid answer. */
  ignore?: Element | null;
}

const esc = (value: string) =>
  typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(value) : value;

const elementText = (element: Element) =>
  normText((element as HTMLElement).innerText || element.textContent);

/** A moved element keeps its words; a recycled selector usually does not. */
export const textMatches = (element: Element, txt?: string): boolean => {
  if (!txt) return true;
  const text = elementText(element).slice(0, 160);
  return text.includes(txt) || txt.includes(text.slice(0, 64));
};

const safeTag = (tag?: string) =>
  tag && /^[a-z][a-z0-9-]*$/.test(tag) ? tag : '*';

const isOurs = (element: Element | null, ignore?: Element | null) =>
  !!element &&
  (!!element.closest('[data-bai-review-overlay]') ||
    (!!ignore && (element === ignore || ignore.contains(element))));

function querySafe(
  doc: Document,
  selector: string,
  ignore?: Element | null,
): Element | null {
  try {
    const hit = doc.querySelector(selector);
    return isOurs(hit, ignore) ? null : hit;
  } catch {
    // A selector from a pasted comment is not guaranteed to parse.
    return null;
  }
}

/**
 * The fractional rect inside the landmark, projected back onto the page. Only
 * useful in a real browser: jsdom has no layout, so every rect is zero and
 * this returns null there.
 */
function rectProjectedTarget(
  container: Element,
  anchor: AnchorV3,
  doc: Document,
  ignore?: Element | null,
): Element | null {
  const rect = anchor.rect;
  const view = doc.defaultView;
  if (!rect || !view || typeof doc.elementFromPoint !== 'function') return null;
  const box = container.getBoundingClientRect();
  if (!box.width || !box.height) return null;
  const x = box.left + (rect.x + rect.w / 2) * box.width;
  const y = box.top + (rect.y + rect.h / 2) * box.height;
  if (x < 0 || y < 0 || x >= view.innerWidth || y >= view.innerHeight)
    return null;
  const hit = doc.elementFromPoint(x, y);
  if (!hit || isOurs(hit, ignore) || !container.contains(hit)) return null;
  return hit;
}

function uniqueLandmark(
  anchor: AnchorV3,
  doc: Document,
  ignore?: Element | null,
): Element | null {
  if (!anchor.tid) return null;
  const found = doc.querySelectorAll(`[data-testid="${esc(anchor.tid)}"]`);
  if (found.length !== 1) return null;
  return isOurs(found[0], ignore) ? null : found[0];
}

/** Cheap enough to run on every reposition: no text scan, no projection. */
export function quickFindTarget(
  anchor: AnchorV3 | null,
  options: ResolveOptions = {},
): Element | null {
  if (!anchor || typeof anchor.s !== 'string') return null;
  const doc = options.doc ?? document;
  const bySelector = querySafe(doc, anchor.s, options.ignore);
  if (bySelector && textMatches(bySelector, anchor.txt)) return bySelector;
  const landmark = uniqueLandmark(anchor, doc, options.ignore);
  if (landmark) {
    return (
      rectProjectedTarget(landmark, anchor, doc, options.ignore) ?? landmark
    );
  }
  return null;
}

/** The full ladder, for a deep link or an explicit "locate" click. */
export function findAnchorTarget(
  anchor: AnchorV3 | null,
  options: ResolveOptions = {},
): Element | null {
  if (!anchor || typeof anchor.s !== 'string') return null;
  const doc = options.doc ?? document;
  const bySelector = querySafe(doc, anchor.s, options.ignore);
  if (bySelector && textMatches(bySelector, anchor.txt)) return bySelector;

  const scan = (scope: Element | Document): Element | null => {
    if (!anchor.txt) return null;
    const candidates = scope.querySelectorAll(safeTag(anchor.tag));
    let best: Element | null = null;
    for (let i = 0; i < candidates.length && i < SCAN_LIMIT; i++) {
      const candidate = candidates[i];
      if (isOurs(candidate, options.ignore)) continue;
      if (!elementText(candidate).includes(anchor.txt)) continue;
      // Deeper wins: the outer wrappers all contain the same words.
      if (!best || best.contains(candidate)) best = candidate;
    }
    return best;
  };

  const landmark = uniqueLandmark(anchor, doc, options.ignore);
  if (landmark) {
    const inner = scan(landmark);
    if (inner) return inner;
    const projected = rectProjectedTarget(
      landmark,
      anchor,
      doc,
      options.ignore,
    );
    if (projected) return projected;
    if (textMatches(landmark, anchor.txt)) return landmark;
  }
  return scan(doc) ?? bySelector;
}
