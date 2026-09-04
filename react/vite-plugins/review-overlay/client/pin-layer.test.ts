/**
 * The layer side of `pin.ts` (FR-3857): one `<style>`, one observer, one retry
 * driver and one docked column over N pin views. `pin.test.ts` covers what a
 * single view does; this covers what only a set can show.
 */
import {
  createPinLayer,
  type DeepLinkPinTarget,
  type PinLayer,
} from './pin.js';
import type { AnchorV3 } from './types.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let host: HTMLElement;
let layer: PinLayer;
let toasts: string[];
let dismissed: string[];
let scrolled: string[];

const shadow = () => host.shadowRoot as ShadowRoot;
const cards = () => Array.from(shadow().querySelectorAll<HTMLElement>('.card'));
const cardOf = (id: string) =>
  shadow().querySelector<HTMLElement>(
    `.card[data-pin-id="${id}"]`,
  ) as HTMLElement;
const markerOf = (id: string) =>
  shadow().querySelector<HTMLElement>(
    `.pin[data-pin-id="${id}"]`,
  ) as HTMLElement;
const countOf = (id: string) =>
  cardOf(id).querySelector<HTMLElement>('.count')?.textContent;

/** The layer places on a rAF; give it one frame to land. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 60));

const target = (
  id: string,
  testid: string,
  over: Partial<AnchorV3> = {},
): DeepLinkPinTarget => ({
  id,
  anchor: {
    v: 3,
    s: `[data-testid="${testid}"]`,
    p: '/',
    tag: 'button',
    txt: testid,
    ...over,
  },
  anchorB64: `PAYLOAD_${id}`,
  label: `Start › ${testid}`,
});

/** jsdom has no layout, so every element the layer measures is given a box. */
const mount = (testid: string, box: Partial<DOMRect> = {}): HTMLElement => {
  document.body.insertAdjacentHTML(
    'beforeend',
    `<button data-testid="${testid}">${testid}</button>`,
  );
  const element = document.querySelector<HTMLElement>(
    `[data-testid="${testid}"]`,
  ) as HTMLElement;
  element.getBoundingClientRect = () =>
    ({
      left: 20,
      right: 420,
      width: 400,
      top: 100,
      bottom: 300,
      height: 200,
      ...box,
    }) as DOMRect;
  element.scrollIntoView = () => {
    scrolled.push(testid);
  };
  return element;
};

beforeEach(() => {
  document.body.innerHTML = '';
  toasts = [];
  dismissed = [];
  scrolled = [];
  host = document.createElement('div');
  host.setAttribute('data-bai-review-overlay', '');
  document.body.append(host);
  Object.defineProperty(window, 'innerHeight', {
    value: 800,
    configurable: true,
  });
  Object.defineProperty(window, 'innerWidth', {
    value: 1024,
    configurable: true,
  });
  layer = createPinLayer({
    root: host.attachShadow({ mode: 'open' }),
    host,
    copyText: () => true,
    showToast: (message) => toasts.push(message),
    buildComment: () => ({ text: 'block', html: '<p>block</p>' }),
    onDismiss: (pin) => dismissed.push(pin.id),
  });
});

afterEach(() => {
  layer.dispose();
});

describe('createPinLayer', () => {
  it('draws one view per pin, tagged with its own id', () => {
    mount('one');
    mount('two');
    layer.show([target('c_a', 'one'), target('c_b', 'two')]);

    expect(layer.locate()).toBe(true);
    expect(cards().map((card) => card.dataset.pinId)).toEqual(['c_a', 'c_b']);
    expect(cardOf('c_b').textContent).toContain('Start › two');
    expect(layer.locatedElement('c_b')).toBe(
      document.querySelector('[data-testid="two"]'),
    );
  });

  // One layer means one stylesheet and one fixed plane, however many pins.
  it('keeps a single style and a single plane for the whole set', () => {
    mount('one');
    mount('two');
    mount('three');
    layer.show([
      target('c_a', 'one'),
      target('c_b', 'two'),
      target('c_c', 'three'),
    ]);

    expect(shadow().querySelectorAll('style')).toHaveLength(1);
    expect(shadow().querySelectorAll('.pinlayer')).toHaveLength(1);
    expect(shadow().querySelectorAll('.card')).toHaveLength(3);
    expect(shadow().querySelectorAll('.markbox')).toHaveLength(3);
  });

  it('numbers the markers and heads each card with its place in the set', () => {
    mount('one');
    mount('two');
    layer.show([target('c_a', 'one'), target('c_b', 'two')]);

    expect(markerOf('c_a').textContent).toBe('1');
    expect(markerOf('c_b').textContent).toBe('2');
    expect(countOf('c_a')).toBe('1 / 2');
    expect(countOf('c_b')).toBe('2 / 2');
  });

  // A set of one is what a single pin has always been.
  it('leaves a set of one unnumbered', () => {
    mount('one');
    layer.show([target('c_a', 'one')]);

    expect(markerOf('c_a').textContent).toBe('📍');
    expect(countOf('c_a')).toBe('');
  });

  it('shrinks back to one view when the set does', () => {
    mount('one');
    mount('two');
    layer.show([target('c_a', 'one'), target('c_b', 'two')]);
    layer.show([target('c_a', 'one')]);

    expect(shadow().querySelectorAll('.card')).toHaveLength(1);
    expect(markerOf('c_a').textContent).toBe('📍');
  });

  describe('the focus pin', () => {
    it('is the only one that scrolls the page and pulses', () => {
      mount('one');
      mount('two');
      layer.show([target('c_a', 'one'), target('c_b', 'two')]);

      expect(scrolled).toEqual(['one']);
      expect(markerOf('c_a').classList.contains('pulse')).toBe(true);
      expect(markerOf('c_b').classList.contains('pulse')).toBe(false);
    });

    // A stored focus id outlives the pin it named; the set still scrolls.
    it('falls back to the first pin when the named one is not in the set', () => {
      mount('one');
      mount('two');
      layer.show([target('c_a', 'one'), target('c_b', 'two')], {
        focusId: 'c_gone',
      });

      expect(scrolled).toEqual(['one']);
      expect(markerOf('c_a').classList.contains('pulse')).toBe(true);
    });

    it('is whichever pin the caller names', () => {
      mount('one');
      mount('two');
      layer.show([target('c_a', 'one'), target('c_b', 'two')], {
        focusId: 'c_b',
      });

      expect(scrolled).toEqual(['two']);
      expect(markerOf('c_b').classList.contains('pulse')).toBe(true);
    });
  });

  describe('dismissing one pin of a set', () => {
    beforeEach(() => {
      mount('one');
      mount('two');
      layer.show([target('c_a', 'one'), target('c_b', 'two')]);
      layer.locate();
    });

    it('takes that one down and leaves the rest drawn', () => {
      layer.dismiss('c_a');

      expect(layer.ids()).toEqual(['c_b']);
      expect(layer.isShowing('c_a')).toBe(false);
      expect(cardOf('c_a').classList.contains('found')).toBe(false);
      expect(markerOf('c_a').classList.contains('found')).toBe(false);
      expect(cardOf('c_b').classList.contains('found')).toBe(true);
      expect(markerOf('c_b').classList.contains('found')).toBe(true);
    });

    // ✕ is a set edit, and only the set's owner knows what that costs.
    it('hands the pin back to the owner when ✕ is what did it', () => {
      cardOf('c_b').querySelector<HTMLButtonElement>('.close')?.click();

      expect(dismissed).toEqual(['c_b']);
      expect(layer.ids()).toEqual(['c_a']);
    });

    it('renumbers what is left, so the heads still count the set', () => {
      mount('three');
      layer.show([
        target('c_a', 'one'),
        target('c_b', 'two'),
        target('c_c', 'three'),
      ]);

      layer.dismiss('c_a');

      expect(markerOf('c_b').textContent).toBe('1');
      expect(countOf('c_b')).toBe('1 / 2');
      expect(countOf('c_c')).toBe('2 / 2');
    });

    // Two pins minus one is a set of one, which never numbered itself.
    it('drops back to a lone 📍 when ✕ leaves one pin', () => {
      cardOf('c_a').querySelector<HTMLButtonElement>('.close')?.click();

      expect(markerOf('c_b').textContent).toBe('📍');
      expect(countOf('c_b')).toBe('');
    });

    it('takes the whole set down when no pin is named', () => {
      layer.dismiss();

      expect(layer.ids()).toEqual([]);
      expect(layer.isShowing()).toBe(false);
    });
  });

  describe('the retry driver', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    // One driver, one sentence: a pin per toast would bury the page in them.
    it('gives up once for the whole set, counting what is missing', () => {
      mount('one');
      layer.show([
        target('c_a', 'one'),
        target('c_b', 'two'),
        target('c_c', 'three'),
      ]);

      vi.advanceTimersByTime(20 * 500);

      expect(toasts).toEqual(['2 of 3 pins are not on this page']);
    });

    // The sentence a single pin has always given up with.
    it('says what it always said for a set of one', () => {
      layer.show([target('c_a', 'one')]);

      vi.advanceTimersByTime(20 * 500);

      expect(toasts).toEqual(['Could not find that element on this page']);
    });

    it('says nothing at all once every pin has landed', () => {
      mount('one');
      mount('two');
      layer.show([target('c_a', 'one'), target('c_b', 'two')]);

      vi.advanceTimersByTime(20 * 500);

      expect(toasts).toEqual([]);
    });
  });

  // Mid-pick a card would swallow the click meant for the element under it.
  describe('folding away for a pick', () => {
    it('collapses every card and leaves the markers', () => {
      mount('one');
      mount('two');
      layer.show([target('c_a', 'one'), target('c_b', 'two')]);
      layer.locate();

      layer.setCollapsed(true);
      expect(
        cards().every((card) => card.classList.contains('collapsed')),
      ).toBe(true);
      expect(markerOf('c_a').classList.contains('found')).toBe(true);

      layer.setCollapsed(false);
      expect(cards().some((card) => card.classList.contains('collapsed'))).toBe(
        false,
      );
    });

    // Only the card folds: the marker is what still says where the pin is.
    it('keeps the marker on the element while the card is folded', async () => {
      const element = mount('one');
      layer.show([target('c_a', 'one')]);
      layer.locate();
      layer.setCollapsed(true);

      element.getBoundingClientRect = () =>
        ({
          left: 40,
          right: 440,
          width: 400,
          top: 200,
          bottom: 400,
          height: 200,
        }) as DOMRect;
      window.dispatchEvent(new Event('resize'));
      await settle();

      expect(markerOf('c_a').classList.contains('found')).toBe(true);
      expect(markerOf('c_a').style.left).toBe('46px');
    });

    // A folded card measures 0 high, and a card placed on that lands off-screen.
    it('leaves the folded card where it was and re-places it on the way out', async () => {
      mount('one', { top: 900, bottom: 1100 });
      layer.show([target('c_a', 'one')]);
      layer.locate();
      Object.defineProperty(cardOf('c_a'), 'offsetHeight', {
        value: 60,
        configurable: true,
      });
      await settle();
      expect(cardOf('c_a').style.top).toBe('732px');

      layer.setCollapsed(true);
      Object.defineProperty(window, 'innerHeight', {
        value: 600,
        configurable: true,
      });
      window.dispatchEvent(new Event('resize'));
      await settle();
      expect(cardOf('c_a').style.top).toBe('732px');

      layer.setCollapsed(false);
      await settle();
      expect(cardOf('c_a').style.top).toBe('532px');
    });

    it('reaches a pin drawn after the pick began', () => {
      mount('one');
      layer.setCollapsed(true);
      layer.show([target('c_a', 'one')]);

      expect(cardOf('c_a').classList.contains('collapsed')).toBe(true);
    });
  });

  // FR-3853 docks an away card to the edge the element left by. Two of them
  // at the same edge would sit on top of each other.
  it('stacks away cards into a column, the first where it always was', async () => {
    const gone = { top: -300, bottom: -100 };
    mount('one', gone);
    mount('two', gone);
    layer.show([target('c_a', 'one'), target('c_b', 'two')]);
    layer.locate();
    for (const card of cards()) {
      Object.defineProperty(card, 'offsetHeight', {
        value: 60,
        configurable: true,
      });
    }
    // No resize, no mutation: locating the set is what lays the column out.
    await settle();

    expect(cardOf('c_a').classList.contains('away')).toBe(true);
    expect(cardOf('c_b').classList.contains('away')).toBe(true);
    // The head of the column keeps FR-3853's own geometry; the next clears it.
    expect(cardOf('c_a').style.top).toBe('8px');
    expect(cardOf('c_b').style.top).toBe('74px');
  });

  // A pin that lands on a later retry tick has no scroll to follow and no
  // draw of the set to ride on: locating it is what must lay the column out.
  it('stacks the column for a pin that lands after the set was drawn', async () => {
    const gone = { top: -300, bottom: -100 };
    mount('one', gone);
    layer.show(
      [target('c_x', 'missing'), target('c_a', 'one'), target('c_b', 'two')],
      { focusId: 'c_x' },
    );
    layer.locate();
    for (const card of cards()) {
      Object.defineProperty(card, 'offsetHeight', {
        value: 60,
        configurable: true,
      });
    }
    await settle();
    expect(cardOf('c_a').style.top).toBe('8px');

    mount('two', gone);
    layer.locate();
    await settle();

    expect(cardOf('c_b').style.top).toBe('74px');
  });
});
