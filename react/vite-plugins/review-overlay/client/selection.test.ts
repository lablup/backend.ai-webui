/**
 * A box select shows the DRAG RECTANGLE in react-grab and one element in the
 * overlay — the bug this file pins down. The anchor still names one element,
 * but it names the selection's frame and carries the region as a fraction of
 * it, so the outline and the pin are the same rectangle.
 */
import {
  commonAncestor,
  fractionWithin,
  projectFraction,
  resolveDragPick,
  unionBox,
} from './selection.js';
import { beforeEach, describe, expect, it } from 'vitest';

/** jsdom has no layout, so every box in these fixtures is declared. */
const sized = (element: Element, box: Partial<DOMRect>) => {
  const full = { left: 0, top: 0, width: 0, height: 0, ...box };
  element.getBoundingClientRect = () =>
    ({
      ...full,
      x: full.left,
      y: full.top,
      right: full.left + full.width,
      bottom: full.top + full.height,
    }) as DOMRect;
  return element;
};

const $ = (id: string) => document.getElementById(id) as Element;

beforeEach(() => {
  document.body.innerHTML = `
    <div id="page">
      <div id="grid">
        <div id="card1"><span id="t1">One</span><span id="d1">First</span></div>
        <div id="card2"><span id="t2">Two</span><span id="d2">Second</span></div>
      </div>
      <div id="aside">Aside</div>
    </div>`;
  sized($('page'), { left: 0, top: 0, width: 1000, height: 800 });
  sized($('grid'), { left: 100, top: 100, width: 800, height: 400 });
  sized($('card1'), { left: 100, top: 100, width: 380, height: 400 });
  sized($('card2'), { left: 520, top: 100, width: 380, height: 400 });
  sized($('t1'), { left: 120, top: 120, width: 200, height: 40 });
  sized($('d1'), { left: 120, top: 180, width: 200, height: 60 });
  sized($('t2'), { left: 540, top: 120, width: 200, height: 40 });
  sized($('d2'), { left: 540, top: 180, width: 200, height: 60 });
  sized($('aside'), { left: 100, top: 600, width: 800, height: 100 });
});

describe('commonAncestor', () => {
  it('is the frame two siblings share', () => {
    expect(commonAncestor([$('t1'), $('d1')])).toBe($('card1'));
    expect(commonAncestor([$('t1'), $('t2')])).toBe($('grid'));
    expect(commonAncestor([$('t1'), $('aside')])).toBe($('page'));
  });

  it('is an element itself when the others are inside it', () => {
    expect(commonAncestor([$('card1'), $('t1')])).toBe($('card1'));
  });
});

describe('unionBox', () => {
  it('is the bounding box of everything with a box', () => {
    expect(unionBox([$('t1'), $('d2')])).toEqual({
      left: 120,
      top: 120,
      width: 620,
      height: 120,
    });
  });

  it('ignores zero-size nodes and gives up when nothing has a box', () => {
    document.body.insertAdjacentHTML('beforeend', '<i id="empty"></i>');
    sized($('empty'), {});
    expect(unionBox([$('t1'), $('empty')])).toEqual({
      left: 120,
      top: 120,
      width: 200,
      height: 40,
    });
    expect(unionBox([$('empty')])).toBeNull();
  });
});

describe('the fraction round trip', () => {
  it('projects a region back onto the same rectangle', () => {
    const frame = { left: 100, top: 100, width: 800, height: 400 };
    const region = { left: 120, top: 120, width: 620, height: 120 };
    const fraction = fractionWithin(region, frame);
    expect(fraction).toEqual({ x: 0.025, y: 0.05, w: 0.775, h: 0.3 });
    expect(projectFraction(frame, fraction!)).toEqual(region);
  });

  it('refuses a frame with no size', () => {
    expect(
      fractionWithin(
        { left: 0, top: 0, width: 10, height: 10 },
        { left: 0, top: 0, width: 0, height: 0 },
      ),
    ).toBeNull();
  });
});

describe('resolveDragPick', () => {
  it('leaves a single-element pick exactly as it was', () => {
    // react-grab shows the element's own box for a one-element drag too
    // (`Dn`: the drag rect is used only when the selection has more than one).
    expect(resolveDragPick([$('t1')])).toEqual({
      element: $('t1'),
      region: null,
      count: 1,
      degenerate: false,
    });
  });

  it('anchors a box select to the frame and keeps the region', () => {
    const pick = resolveDragPick([$('t1'), $('d1')]);
    expect(pick?.element).toBe($('card1'));
    expect(pick?.region).toEqual({
      left: 120,
      top: 120,
      width: 200,
      height: 120,
    });
    expect(pick?.degenerate).toBe(false);
    expect(pick?.count).toBe(2);
  });

  it('walks up as far as the selection spreads', () => {
    expect(resolveDragPick([$('t1'), $('t2')])?.element).toBe($('grid'));
    expect(resolveDragPick([$('t1'), $('aside')])?.element).toBe($('page'));
  });

  it('falls back to the primary element when the region escapes its frame', () => {
    // A portalled or fixed child sits outside the box of the element that owns
    // it in the DOM, so a fraction of that frame projects back onto nothing.
    sized($('d1'), { left: 120, top: 2000, width: 200, height: 60 });
    const pick = resolveDragPick([$('t1'), $('d1')]);
    expect(pick?.element).toBe($('t1'));
    expect(pick?.region).toBeNull();
    expect(pick?.degenerate).toBe(true);
  });

  it('falls back when the frame cannot be measured', () => {
    sized($('card1'), {});
    const pick = resolveDragPick([$('t1'), $('d1')]);
    expect(pick?.element).toBe($('t1'));
    expect(pick?.degenerate).toBe(true);
  });

  it('has nothing to say about an empty selection', () => {
    expect(resolveDragPick([])).toBeNull();
  });
});
