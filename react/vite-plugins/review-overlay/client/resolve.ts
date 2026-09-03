/**
 * Resolving a `#bai=v3` anchor back to an element: the selector alone cannot
 * do it — a React `useId` never survives a reload and an nth-of-type path
 * never survives a refactor — so every other signal is tried in turn.
 */
import { TAG_RE } from './anchor-guard.js';
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
  // An element with no text at all matches nothing: `includes('')` would
  // otherwise confirm every recycled selector that now hits an icon button.
  if (!text) return false;
  return text.includes(txt) || txt.includes(text.slice(0, 64));
};

const safeTag = (tag?: string) => (tag && TAG_RE.test(tag) ? tag : '*');

/** react-grab 0.1.50 answers synchronously, so this costs no await. */
function displayName(element: Element): string | null {
  const grab = window.__REACT_GRAB__;
  if (!grab || typeof grab.getDisplayName !== 'function') return null;
  try {
    return grab.getDisplayName(element);
  } catch {
    return null;
  }
}

/** Ranks a candidate: react-grab names it as one of the anchor's names. */
const componentMatches = (element: Element, anchor: AnchorV3): boolean => {
  if (!anchor.c) return false;
  const name = displayName(element);
  return name !== null && (name === anchor.c.dn || name === anchor.c.name);
};

/**
 * A veto needs like-for-like, so it compares `c.dn` and nothing else. `c.name`
 * is `getSource`'s OWNER component, which disagrees with `getDisplayName` on
 * 57 of 58 sampled elements: letting it satisfy the veto (via
 * `componentMatches`, where it is a positive rank) would clear any candidate
 * whose display name happens to equal the pick's owner.
 */
const componentConflicts = (element: Element, anchor: AnchorV3): boolean => {
  const dn = anchor.c?.dn;
  if (!dn) return false;
  const name = displayName(element);
  return name !== null && name !== dn;
};

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
 * this returns null there. Callers must still text-verify the hit: a sibling
 * inserted at the recorded spot often carries the same display name.
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
  if (
    bySelector &&
    textMatches(bySelector, anchor.txt) &&
    !componentConflicts(bySelector, anchor)
  )
    return bySelector;
  const landmark = uniqueLandmark(anchor, doc, options.ignore);
  if (landmark) {
    const projected = rectProjectedTarget(
      landmark,
      anchor,
      doc,
      options.ignore,
    );
    if (
      projected &&
      textMatches(projected, anchor.txt) &&
      !componentConflicts(projected, anchor)
    )
      return projected;
    // A landmark that is a different component is the corner-stacking answer
    // R3.6's component signal exists to refuse.
    return componentConflicts(landmark, anchor) ? null : landmark;
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
  if (
    bySelector &&
    textMatches(bySelector, anchor.txt) &&
    !componentConflicts(bySelector, anchor)
  )
    return bySelector;

  const scan = (scope: Element | Document): Element | null => {
    if (!anchor.txt) return null;
    const candidates = scope.querySelectorAll(safeTag(anchor.tag));
    let best: Element | null = null;
    let bestByComponent = false;
    for (let i = 0; i < candidates.length && i < SCAN_LIMIT; i++) {
      const candidate = candidates[i];
      if (isOurs(candidate, options.ignore)) continue;
      if (!elementText(candidate).includes(anchor.txt)) continue;
      // The component name breaks the tie two controls with the same words
      // inside one card would otherwise lose; deeper wins within a tier,
      // because the outer wrappers all contain the same words.
      const byComponent = componentMatches(candidate, anchor);
      // A named wrapper must not veto the deeper node it contains: the name
      // rules between branches, containment still rules within one.
      if (best && bestByComponent && !byComponent && !best.contains(candidate))
        continue;
      if (
        !best ||
        (byComponent && !bestByComponent) ||
        best.contains(candidate)
      ) {
        best = candidate;
        bestByComponent = byComponent;
      }
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
    if (
      projected &&
      textMatches(projected, anchor.txt) &&
      !componentConflicts(projected, anchor)
    )
      return projected;
    if (
      textMatches(landmark, anchor.txt) &&
      !componentConflicts(landmark, anchor)
    )
      return landmark;
  }
  // The weak answer both ladders agree on: `quickFindTarget` returns null for
  // a conflicting selector hit, so this must not hand it back either.
  const weak =
    bySelector && !componentConflicts(bySelector, anchor) ? bySelector : null;
  return scan(doc) ?? weak;
}
