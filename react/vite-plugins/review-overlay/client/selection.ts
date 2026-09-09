/**
 * Turning react-grab's MULTI-element drag selection into the one element an
 * anchor can carry, plus the region inside it that the drag actually covered.
 *
 * react-grab labels a drag with the drag rectangle itself (`Dn` in its core:
 * `f = l && u ? nr(l) : N(t)` — the drag rect when the selection has more than
 * one element, the element's own box otherwise). No single element's box
 * equals that rectangle, so the anchor names the selection's common ancestor
 * as a COORDINATE FRAME and stores the union of the selected boxes as a
 * fraction of it. The pin projects that fraction back, so what the overlay
 * outlines, what the pin draws, and what react-grab showed are one region.
 */
import type { AnchorRect } from './types.js';

export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** How far outside its frame a union may sit before the frame is unusable. */
const ESCAPE_TOLERANCE_PX = 1;

const boxOf = (element: Element): Box => {
  const r = element.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height };
};

/** A shadow root's host is the parent react-grab's own de-duplication uses. */
function parentOf(element: Element): Element | null {
  if (element.parentElement) return element.parentElement;
  const root = element.getRootNode();
  return root && (root as ShadowRoot).host ? (root as ShadowRoot).host : null;
}

/** The deepest element containing every one of them (or the only one given). */
export function commonAncestor(elements: Element[]): Element | null {
  if (elements.length === 0) return null;
  for (let node: Element | null = elements[0]; node; node = parentOf(node)) {
    const scope = node;
    if (elements.every((e) => e === scope || scope.contains(e))) return scope;
  }
  return null;
}

/** Bounding box of every element that has one. Zero-size nodes contribute nothing. */
export function unionBox(elements: Element[]): Box | null {
  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;
  for (const element of elements) {
    const r = element.getBoundingClientRect();
    if (!r.width && !r.height) continue;
    left = Math.min(left, r.left);
    top = Math.min(top, r.top);
    right = Math.max(right, r.right);
    bottom = Math.max(bottom, r.bottom);
  }
  if (!Number.isFinite(left)) return null;
  return { left, top, width: right - left, height: bottom - top };
}

const round4 = (n: number) => Math.round(n * 1e4) / 1e4;

/** `box` as a fraction of `frame`. Null when the frame cannot be measured. */
export function fractionWithin(box: Box, frame: Box): AnchorRect | null {
  if (!frame.width || !frame.height) return null;
  return {
    x: round4((box.left - frame.left) / frame.width),
    y: round4((box.top - frame.top) / frame.height),
    w: round4(box.width / frame.width),
    h: round4(box.height / frame.height),
  };
}

/** The inverse: a fraction laid back over a frame measured right now. */
export function projectFraction(frame: Box, fraction: AnchorRect): Box {
  return {
    left: frame.left + fraction.x * frame.width,
    top: frame.top + fraction.y * frame.height,
    width: fraction.w * frame.width,
    height: fraction.h * frame.height,
  };
}

/** The frame has to actually contain the region, or the fraction is nonsense. */
const contains = (frame: Box, box: Box): boolean =>
  box.left >= frame.left - ESCAPE_TOLERANCE_PX &&
  box.top >= frame.top - ESCAPE_TOLERANCE_PX &&
  box.left + box.width <= frame.left + frame.width + ESCAPE_TOLERANCE_PX &&
  box.top + box.height <= frame.top + frame.height + ESCAPE_TOLERANCE_PX;

export interface DragPick {
  /** The element the anchor names — the frame for `region`, if there is one. */
  element: Element;
  /** Viewport box the overlay outlines and the pin redraws. */
  region: Box | null;
  /** How many elements react-grab selected. 1 means it was not a box select. */
  count: number;
  /** The common ancestor was unusable; this is react-grab's primary element. */
  degenerate: boolean;
}

/**
 * react-grab's own single-element drag shows the element's box, not the drag
 * rectangle, so a one-element selection is deliberately indistinguishable from
 * a click here: same element, no region, nothing about the pick changes.
 */
export function resolveDragPick(elements: Element[]): DragPick | null {
  const live = elements.filter((e) => e && e.isConnected !== false);
  if (live.length === 0) return null;
  if (live.length === 1) {
    return { element: live[0], region: null, count: 1, degenerate: false };
  }
  const fallback = (): DragPick => ({
    element: live[0],
    region: null,
    count: live.length,
    degenerate: true,
  });
  const ancestor = commonAncestor(live);
  const region = unionBox(live);
  if (!ancestor || !region) return fallback();
  const frame = boxOf(ancestor);
  if (!frame.width || !frame.height) return fallback();
  // A portalled or `position: fixed` child can sit outside the box of the
  // element that owns it in the DOM; a fraction of that frame would not
  // project back onto anything.
  if (!contains(frame, region)) return fallback();
  return { element: ancestor, region, count: live.length, degenerate: false };
}
