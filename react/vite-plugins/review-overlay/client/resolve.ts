/**
 * Resolving a `#bai=v3` anchor back to an element: the selector alone cannot
 * do it — a React `useId` never survives a reload and an nth-of-type path
 * never survives a refactor — so every other signal is tried in turn.
 */
import { TAG_RE } from './anchor-guard.js';
import { normText } from './anchor.js';
import { DIALOG_SELECTOR, isStop } from './stop-guard.js';
import type { AnchorV3, AnchorVia } from './types.js';
import { OVERLAY_MARKER_ATTR } from './ui.js';
import { viaKind, viaLabel, viaTid } from './via.js';

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

/**
 * Does this element occupy space on screen? A pin was CLICKED, so its element
 * had a box — but pages carry look-alikes that never do, and a text scan in
 * document order takes whichever comes first. Measured: github.com renders
 * every file-name link twice, the screen-reader copy first and inside a
 * `display: none` cell.
 *
 * `getClientRects()` costs one layout read and already answers `display: none`,
 * `[hidden]` and a detached node. jsdom returns nothing for everything, so
 * every candidate ties there and the callers fall back to today's order.
 */
export const isRendered = (element: Element): boolean => {
  const rects = element.getClientRects();
  for (let i = 0; i < rects.length; i++)
    if (rects[i].width > 0 || rects[i].height > 0) return true;
  return false;
};

/**
 * Does this document lay anything out? jsdom does not, and reports nothing for
 * every element — so only here does "has no box" mean "hidden" rather than
 * "no layout engine", and only here does the gate below apply.
 */
export const hasLayout = (doc: Document): boolean =>
  doc.documentElement.getClientRects().length > 0;

/**
 * An element with no box is never an answer: a pin drawn on one puts its
 * marker, its box and its card in the page's top-left corner, with none of
 * the wording an honestly off-screen pin gets. Waiting for the real element
 * to come back is the better answer, and the retry driver is already waiting.
 */
const drawable = (found: Element | null, doc: Document): Element | null =>
  !found || !hasLayout(doc) || isRendered(found) ? found : null;

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

/**
 * A stop (a pin the implementing session authored, FR-3949) resolves
 * strictly: a text match counts only inside its landmark, a stale selector
 * hit never counts, the frame its element lives in counts only when there is
 * no text to tell them apart, and a `dlg` stop counts only inside an open
 * dialog. A waiting stop beats a look-alike outside the modal — the measured
 * failure was a modal stop drawn on the page's own "Models" button.
 */
export const inScope = (element: Element, anchor: AnchorV3): boolean => {
  if (!(isStop(anchor) && anchor.dlg)) return true;
  const dialog = element.closest(DIALOG_SELECTOR);
  // A closed native <dialog> keeps its descendants in the DOM; only `open` counts.
  return (
    !!dialog && (dialog.tagName !== 'DIALOG' || dialog.hasAttribute('open'))
  );
};

/**
 * Modals the browser does not put in the top layer: ARIA modals, and the
 * portal roots of this app's own dialogs and drawers, which carry neither
 * (`BAI_MODAL_OPEN_ATTRIBUTE`, packages/backend.ai-ui dialogLevelStack.ts).
 */
export const PORTAL_MODAL =
  '[role="dialog"][aria-modal="true"], [role="alertdialog"][aria-modal="true"], [data-bai-modal-open]';

/**
 * Astryx renders every Popover (BAIPopconfirm included) as an `aria-modal`
 * dialog inside a native `[popover]` layer, which dismisses on an outside click.
 */
const isLightDismissSurface = (modal: Element): boolean =>
  modal.tagName !== 'DIALOG' &&
  !modal.hasAttribute('data-bai-modal-open') &&
  !!modal.closest('[popover]');

/**
 * Is an open modal painted over this element? A covered modal is `inert`, so
 * the topmost is the last one that is not; jsdom matches no `:modal`.
 */
export function isBehindModal(element: Element): boolean {
  const doc = element.ownerDocument;
  let found: Element[];
  try {
    found = Array.from(doc.querySelectorAll(`dialog:modal, ${PORTAL_MODAL}`));
  } catch {
    found = Array.from(doc.querySelectorAll(`dialog[open], ${PORTAL_MODAL}`));
  }
  const layout = hasLayout(doc);
  const open = found.filter(
    (modal) =>
      (!layout || isRendered(modal)) &&
      !modal.closest('[inert]') &&
      !isLightDismissSurface(modal),
  );
  const outer = open.filter(
    (modal) => !open.some((other) => other !== modal && other.contains(modal)),
  );
  const top = outer[outer.length - 1];
  return !!top && !top.contains(element);
}

/** What a `via` step clicks: a control, never the wrapper around its label. */
export const VIA_CONTROL =
  'button, a[href], summary, label, [role="button"], [role="link"], [role="tab"], [role="menuitem"], [role="option"], [role="radio"], [role="checkbox"], [role="switch"]';
/** What a `fill` step types into. */
export const VIA_FIELD =
  'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([type="reset"]), textarea, [contenteditable="true"], [contenteditable=""], [role="textbox"], [role="searchbox"]';
/** What a `select` step opens. */
export const VIA_SELECT = 'select, [role="combobox"]';

/** A field's accessible names: `aria-label`, placeholder, its labels. */
function fieldNames(element: Element): string[] {
  const names = [
    element.getAttribute('aria-label'),
    element.getAttribute('placeholder'),
  ];
  for (const id of (element.getAttribute('aria-labelledby') ?? '').split(/\s+/))
    if (id)
      names.push(element.ownerDocument.getElementById(id)?.textContent ?? '');
  const labels = (element as HTMLInputElement).labels;
  if (labels)
    for (const label of Array.from(labels)) names.push(label.textContent);
  return names.map((name) => normText(name)).filter(Boolean);
}

/** `root` when it is the field itself, else the one field inside it. */
function fieldIn(root: Element, selector: string): Element | null {
  if (root.matches(selector)) return root;
  const inner = root.querySelectorAll(selector);
  return inner.length === 1 ? inner[0] : null;
}

/**
 * The control a `via` step acts on, when it is on screen and not under a modal.
 * `alts` is the step in the reader's words, then in the base language. A
 * unique testid wins; then the words, the reader's first. A `select` whose
 * list is open points at the option itself.
 */
export function findViaTarget(
  alts: readonly (AnchorVia | undefined)[],
  { doc = document, ignore }: ResolveOptions = {},
): Element | null {
  const step = alts[0];
  if (!step) return null;
  const kind = viaKind(step);
  const same = alts.filter(
    (alt): alt is AnchorVia => !!alt && viaKind(alt) === kind,
  );
  const layout = hasLayout(doc);
  const usable = (element: Element) =>
    !isOurs(element, ignore) &&
    (!layout || isRendered(element)) &&
    !isBehindModal(element);
  // `textContent` too: `innerText` applies `text-transform`.
  const own = (element: Element, want: string) =>
    elementText(element) === want || normText(element.textContent) === want;
  if (kind === 'select') {
    const options = Array.from(doc.querySelectorAll('[role="option"]')).filter(
      usable,
    );
    for (const alt of same) {
      if (!('select' in alt)) continue;
      const want = normText(alt.select.option);
      const hit = options.find((option) => own(option, want));
      if (hit) return hit;
    }
  }
  const selector = kind === 'fill' ? VIA_FIELD : VIA_SELECT;
  const tid = same.map(viaTid).find(Boolean);
  if (tid) {
    const hits = Array.from(
      doc.querySelectorAll(`[data-testid="${esc(tid)}"]`),
    ).filter(usable);
    if (hits.length === 1)
      return kind === 'click'
        ? hits[0]
        : (fieldIn(hits[0], selector) ?? hits[0]);
  }
  const wants = same.map((alt) => normText(viaLabel(alt))).filter(Boolean);
  if (kind !== 'click') {
    const fields = Array.from(doc.querySelectorAll(selector)).filter(usable);
    for (const want of wants) {
      const hit = fields.find((field) => fieldNames(field).includes(want));
      if (hit) return hit;
    }
    return null;
  }
  const controls = Array.from(doc.querySelectorAll(VIA_CONTROL)).filter(usable);
  // Then a control whose label sits beside other text (a tab's count), as a
  // click on the text matched it.
  const inner = (element: Element, want: string) =>
    Array.from(element.querySelectorAll('*')).some((child) => own(child, want));
  for (const match of [own, inner])
    for (const want of wants) {
      const hit = controls.find((element) => match(element, want));
      if (hit) return hit;
    }
  return null;
}

/** A control that says it is already on: the selected tab, an open toggle. */
function clickedOn(element: Element): boolean {
  const on = (name: string) => element.getAttribute(name) === 'true';
  return (
    on('aria-selected') ||
    on('aria-current') ||
    on('aria-pressed') ||
    on('aria-expanded') ||
    (element.getAttribute('role') === 'radio' && on('aria-checked'))
  );
}

/**
 * Has the reader already done this step? A field that holds the value, a
 * select that shows the option, a tab or toggle that is already on. A plain
 * click, or a fill that still has to press Enter, leaves nothing to read back.
 */
export function viaStepDone(step: AnchorVia, element: Element): boolean {
  if ('fill' in step) {
    if (step.fill.enter === 1) return false;
    const value =
      'value' in element
        ? String((element as HTMLInputElement).value)
        : element.textContent;
    return normText(value) === normText(step.fill.value);
  }
  if ('select' in step) {
    if (element.getAttribute('role') === 'option') return false;
    const shown =
      element.tagName === 'SELECT'
        ? (element as HTMLSelectElement).options[
            (element as HTMLSelectElement).selectedIndex
          ]?.textContent
        : element.textContent;
    return normText(shown) === normText(step.select.option);
  }
  return clickedOn(element);
}

/**
 * The furthest step still to do whose control is on screen (`found[i]` for
 * `steps[i]`): an earlier step's control often stays, under the dialog the
 * later one is in. A label alone can be a look-alike elsewhere (a pager's
 * "Next"), so a later step found without its testid counts only once no
 * earlier step is left to do.
 */
export function nextViaControl(
  steps: readonly AnchorVia[],
  found: readonly (Element | null)[],
  done: (
    step: AnchorVia,
    element: Element,
    index: number,
  ) => boolean = viaStepDone,
): { element: Element; index: number } | null {
  const left = (i: number) => !!found[i] && !done(steps[i], found[i]!, i);
  for (let i = steps.length - 1; i >= 0; i--) {
    const element = found[i];
    if (!element || !left(i)) continue;
    const tid = viaTid(steps[i]);
    const byTid = !!tid && !!element.closest(`[data-testid="${esc(tid)}"]`);
    const earlierLeft = steps.slice(0, i).some((_, j) => left(j));
    if (byTid || !earlierLeft) return { element, index: i };
  }
  return null;
}

/** A strict stop with a landmark accepts a selector hit only inside one. */
const withinLandmark = (
  element: Element,
  anchor: AnchorV3,
  strict: boolean,
): boolean =>
  !strict ||
  !anchor.tid ||
  !!element.closest(`[data-testid="${esc(anchor.tid)}"]`);

/** The landmark alone: a wrapper stands in for its element only without text. */
const frameSuffices = (strict: boolean, anchor: AnchorV3): boolean =>
  !(strict && anchor.rect && anchor.txt);

const isOurs = (element: Element | null, ignore?: Element | null) =>
  !!element &&
  (!!element.closest(`[${OVERLAY_MARKER_ATTR}]`) ||
    (!!ignore && (element === ignore || ignore.contains(element))));

function querySafe(
  doc: Document,
  selector: string,
  ignore?: Element | null,
): Element | null {
  try {
    const hits = doc.querySelectorAll(selector);
    const first = hits[0] ?? null;
    if (isOurs(first, ignore)) return null;
    if (!first || isRendered(first)) return first;
    // The selector caught a copy with no box; a later match that has one is
    // the element the reader can actually see.
    for (let i = 1; i < hits.length; i++) {
      const hit = hits[i];
      if (!isOurs(hit, ignore) && isRendered(hit)) return hit;
    }
    return first;
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
  let hit = doc.elementFromPoint(x, y);
  // The walkthrough's own popover can sit over the spot a stop waits on.
  if (hit && isOurs(hit, ignore) && typeof doc.elementsFromPoint === 'function')
    hit =
      doc.elementsFromPoint(x, y).find((under) => !isOurs(under, ignore)) ??
      null;
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
  // A landmark a hidden copy of the page duplicates is still the only one on
  // screen, and without this the copy would disqualify the whole rung.
  let onlyRendered: Element | null = null;
  let rendered = 0;
  for (let i = 0; i < found.length; i++) {
    if (!isRendered(found[i])) continue;
    rendered++;
    onlyRendered = found[i];
  }
  const hit =
    rendered === 1 ? onlyRendered : found.length === 1 ? found[0] : null;
  return !hit || isOurs(hit, ignore) ? null : hit;
}

/**
 * Is the anchor's landmark on the page at all? One selector, so the retry loop
 * can tell "the frame it lived in is back" from "still nothing".
 */
export function hasLandmark(
  anchor: AnchorV3 | null,
  doc: Document = document,
): boolean {
  if (!anchor?.tid) return false;
  try {
    return !!doc.querySelector(`[data-testid="${esc(anchor.tid)}"]`);
  } catch {
    return false;
  }
}

/** Cheap enough to run on every reposition: no text scan, no projection. */
export function quickFindTarget(
  anchor: AnchorV3 | null,
  options: ResolveOptions = {},
): Element | null {
  return drawable(quickLadder(anchor, options), options.doc ?? document);
}

function quickLadder(
  anchor: AnchorV3 | null,
  options: ResolveOptions,
): Element | null {
  if (!anchor || typeof anchor.s !== 'string') return null;
  const doc = options.doc ?? document;
  const strict = isStop(anchor);
  const bySelector = querySafe(doc, anchor.s, options.ignore);
  if (
    bySelector &&
    textMatches(bySelector, anchor.txt) &&
    !componentConflicts(bySelector, anchor) &&
    inScope(bySelector, anchor) &&
    withinLandmark(bySelector, anchor, strict) &&
    // A hit with no box is a copy of the element, not the element: the rungs
    // below get their turn, and the gate above refuses it if they find nothing.
    (isRendered(bySelector) || !hasLayout(doc))
  )
    return bySelector;
  const landmark = uniqueLandmark(anchor, doc, options.ignore);
  if (landmark && inScope(landmark, anchor)) {
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
    if (!frameSuffices(strict, anchor)) return null;
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
  return drawable(fullLadder(anchor, options), options.doc ?? document);
}

function fullLadder(
  anchor: AnchorV3 | null,
  options: ResolveOptions,
): Element | null {
  if (!anchor || typeof anchor.s !== 'string') return null;
  const doc = options.doc ?? document;
  const strict = isStop(anchor);
  const bySelector = querySafe(doc, anchor.s, options.ignore);
  if (
    bySelector &&
    textMatches(bySelector, anchor.txt) &&
    !componentConflicts(bySelector, anchor) &&
    inScope(bySelector, anchor) &&
    withinLandmark(bySelector, anchor, strict) &&
    (isRendered(bySelector) || !hasLayout(doc))
  )
    return bySelector;

  const scan = (scope: Element | Document): Element | null => {
    if (!anchor.txt) return null;
    const candidates = scope.querySelectorAll(safeTag(anchor.tag));
    let best: Element | null = null;
    let bestByComponent = false;
    let bestRendered = false;
    for (let i = 0; i < candidates.length && i < SCAN_LIMIT; i++) {
      const candidate = candidates[i];
      if (isOurs(candidate, options.ignore)) continue;
      if (!elementText(candidate).includes(anchor.txt)) continue;
      if (!inScope(candidate, anchor)) continue;
      // Being on screen outranks every other signal: a hidden look-alike is
      // not what the reader clicked, however well it matches.
      const rendered = isRendered(candidate);
      if (best && bestRendered && !rendered) continue;
      // The component name breaks the tie two controls with the same words
      // inside one card would otherwise lose; deeper wins within a tier,
      // because the outer wrappers all contain the same words.
      const byComponent = componentMatches(candidate, anchor);
      if (best && rendered && !bestRendered) {
        best = candidate;
        bestRendered = true;
        bestByComponent = byComponent;
        continue;
      }
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
        bestRendered = rendered;
        bestByComponent = byComponent;
      }
    }
    return best;
  };

  const landmark = uniqueLandmark(anchor, doc, options.ignore);
  if (landmark && inScope(landmark, anchor)) {
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
      !componentConflicts(landmark, anchor) &&
      frameSuffices(strict, anchor)
    )
      return landmark;
  }
  if (strict) return anchor.tid ? null : scan(doc);
  // The weak answer both ladders agree on: `quickFindTarget` returns null for
  // a conflicting selector hit, so this must not hand it back either.
  const weak =
    bySelector && !componentConflicts(bySelector, anchor) ? bySelector : null;
  return scan(doc) ?? weak;
}
