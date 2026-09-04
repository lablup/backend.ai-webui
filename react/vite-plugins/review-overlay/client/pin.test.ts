import {
  createDeepLinkPin,
  type DeepLinkPin,
  type DeepLinkPinTarget,
} from './pin.js';
import type { AnchorV3, CopyPayload } from './types.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const anchor = (over: Partial<AnchorV3> = {}): AnchorV3 => ({
  v: 3,
  s: '[data-testid="create"]',
  p: '/',
  tag: 'button',
  txt: 'Create',
  ...over,
});

let host: HTMLElement;
let pin: DeepLinkPin;
let copied: string[];
let copiedHtml: (string | undefined)[];
let toasts: string[];
let copyResult: boolean | Promise<boolean>;
let located: (Element | null)[];
/** What `main.ts` would render for this pin; null stands for "cannot". */
let comment: CopyPayload | null;
let commentFor: DeepLinkPinTarget | null;

const show = (over: Partial<AnchorV3> = {}) =>
  pin.show({
    id: 'c_zdv3rhz',
    anchor: anchor(over),
    anchorB64: 'PAYLOAD',
    label: 'Start › button',
  });

const marker = () => host.shadowRoot?.querySelector('.pin') as HTMLElement;
const card = () => host.shadowRoot?.querySelector('.card') as HTMLElement;
const outlined = () =>
  document.querySelector<HTMLElement>('[data-testid="create"]')?.style.outline;
const markbox = () => host.shadowRoot?.querySelector('.markbox') as HTMLElement;
const marked = () => markbox().classList.contains('found');

/** jsdom has no layout: the pin reads the element's box and the card's height. */
const mountSized = (box: Partial<DOMRect>, cardHeight: number) => {
  document.body.insertAdjacentHTML(
    'beforeend',
    '<button data-testid="create">Create</button>',
  );
  const element = document.querySelector(
    '[data-testid="create"]',
  ) as HTMLElement;
  element.getBoundingClientRect = () =>
    ({
      left: 20,
      right: 420,
      width: 400,
      top: 0,
      bottom: 0,
      height: 0,
      ...box,
    }) as DOMRect;
  Object.defineProperty(card(), 'offsetHeight', {
    value: cardHeight,
    configurable: true,
  });
  return element;
};

beforeEach(() => {
  document.body.innerHTML = '';
  host = document.createElement('div');
  host.setAttribute('data-bai-review-overlay', '');
  document.body.append(host);
  copied = [];
  copiedHtml = [];
  toasts = [];
  located = [];
  copyResult = true;
  comment = { text: 'the whole comment', html: '<p>the whole comment</p>' };
  commentFor = null;
  pin = createDeepLinkPin({
    root: host.attachShadow({ mode: 'open' }),
    host,
    copyText: (text, html) => {
      copied.push(text);
      copiedHtml.push(html);
      return copyResult;
    },
    showToast: (message) => toasts.push(message),
    buildComment: (target) => {
      commentFor = target;
      return comment;
    },
    onLocated: (element) => located.push(element),
  });
});

afterEach(() => {
  pin.dispose();
});

describe('createDeepLinkPin', () => {
  it('draws nothing until the element it is anchored to exists', () => {
    show();
    expect(pin.locate()).toBe(false);
    expect(marker().classList.contains('found')).toBe(false);
    expect(card().classList.contains('found')).toBe(false);
  });

  it('highlights the element the moment it is found, and shows the quoted label', () => {
    show();
    document.body.insertAdjacentHTML(
      'beforeend',
      '<button data-testid="create">Create</button>',
    );
    expect(pin.locate()).toBe(true);
    expect(marked()).toBe(true);
    expect(marker().classList.contains('found')).toBe(true);
    expect(card().textContent).toContain('Start › button');
    expect(card().textContent).toContain('c_zdv3rhz');
  });

  it('names the component the block carried under the label', () => {
    pin.show({
      id: 'c_zdv3rhz',
      anchorB64: 'PAYLOAD',
      anchor: anchor({ c: { name: 'StartPage', src: 'src/StartPage.tsx:4' } }),
      label: 'Start › button',
    });
    expect(card().textContent).toContain('StartPage');
  });

  // The overlay must never anchor a pasted link to its own chrome.
  it('refuses the overlay’s own DOM as an answer', () => {
    host.insertAdjacentHTML(
      'beforeend',
      '<button data-testid="create">Create</button>',
    );
    show();
    expect(pin.locate()).toBe(false);
  });

  it('follows the element across a re-render that replaces the node', async () => {
    document.body.insertAdjacentHTML(
      'beforeend',
      '<div id="app"><button data-testid="create">Create</button></div>',
    );
    show();
    expect(pin.locate()).toBe(true);
    const first = document.querySelector('[data-testid="create"]');

    // What React does: same markup, a brand new node.
    const app = document.querySelector('#app') as HTMLElement;
    app.innerHTML = '<button data-testid="create">Create</button>';
    await new Promise((resolve) => setTimeout(resolve, 400));

    const second = document.querySelector('[data-testid="create"]');
    expect(second).not.toBe(first);
    expect(pin.locatedElement()).toBe(second);
    expect(marked()).toBe(true);
    expect(marker().classList.contains('found')).toBe(true);
  });

  // Two ladders run: the debounced observer's cheap one and `locate()`'s full
  // one. When only the cheap one lands, the caller must not toast "not found"
  // over a pin that is already drawn.
  it('reports found when the observer’s cheaper ladder got there first', async () => {
    show({ s: '#gone', tid: 'panel', txt: 'Save' });
    document.body.insertAdjacentHTML(
      'beforeend',
      '<div data-testid="panel"><button>Cancel</button></div>',
    );
    await new Promise((resolve) => setTimeout(resolve, 400));

    expect(pin.locatedElement()).toBe(
      document.querySelector('[data-testid="panel"]'),
    );
    expect(marker().classList.contains('found')).toBe(true);
    expect(pin.locate()).toBe(true);
  });

  it('pulses once when the link lands, not on every later resolution', () => {
    document.body.insertAdjacentHTML(
      'beforeend',
      '<button data-testid="create">Create</button>',
    );
    show();
    pin.locate();
    expect(marker().classList.contains('pulse')).toBe(true);

    marker().classList.remove('pulse');
    pin.locate();
    expect(marker().classList.contains('pulse')).toBe(false);

    // A new link is a new arrival.
    show();
    pin.locate();
    expect(marker().classList.contains('pulse')).toBe(true);
  });

  describe('place', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerHeight', {
        value: 800,
        configurable: true,
      });
      Object.defineProperty(window, 'innerWidth', {
        value: 1024,
        configurable: true,
      });
    });

    it('puts the card under an element that leaves room for it', () => {
      mountSized({ top: 100, bottom: 300, height: 200 }, 60);
      show();
      expect(pin.locate()).toBe(true);
      expect(card().style.top).toBe('310px');
    });

    // `locate()` centres the element, so a tall one pushes `bottom` past the
    // fold — and a fixed layer cannot be scrolled to.
    it('flips the card above an element too tall to fit one below', () => {
      mountSized({ top: 160, bottom: 760, height: 600 }, 60);
      show();
      expect(pin.locate()).toBe(true);
      expect(card().style.top).toBe('90px');
    });

    it('clamps into the viewport when the card fits neither way', () => {
      mountSized({ top: -50, bottom: 900, height: 950 }, 60);
      show();
      expect(pin.locate()).toBe(true);
      expect(card().style.top).toBe('8px');
    });

    // `getBoundingClientRect` still reports the box of an element a scroller
    // has clipped out of sight, so the window test alone leaves an orphan pin.
    it('docks the card when a scroller clips the element out of sight', () => {
      document.body.insertAdjacentHTML(
        'beforeend',
        '<div id="scroller" style="overflow-x: auto; overflow-y: auto"></div>',
      );
      const scroller = document.querySelector('#scroller') as HTMLElement;
      scroller.getBoundingClientRect = () =>
        ({
          left: 0,
          right: 800,
          width: 800,
          top: 400,
          bottom: 700,
          height: 300,
        }) as DOMRect;
      const element = mountSized({ top: 100, bottom: 300, height: 200 }, 60);
      scroller.append(element);
      show();
      expect(pin.locate()).toBe(true);
      expect(marker().classList.contains('found')).toBe(false);
      expect(marked()).toBe(false);
      expect(card().classList.contains('found')).toBe(true);
      expect(card().classList.contains('away')).toBe(true);
    });

    // A resize is pure geometry: it must not wait on the mutation debounce.
    it('re-places on resize within a frame', async () => {
      show();
      const element = mountSized({ top: 100, bottom: 300, height: 200 }, 60);
      await new Promise((resolve) => setTimeout(resolve, 400));
      expect(marker().style.top).toBe('106px');

      element.getBoundingClientRect = () =>
        ({
          left: 20,
          right: 420,
          width: 400,
          top: 400,
          bottom: 600,
          height: 200,
        }) as DOMRect;
      window.dispatchEvent(new Event('resize'));
      await new Promise((resolve) => setTimeout(resolve, 60));
      expect(marker().style.top).toBe('406px');
    });

    // The marker and the box belong ON the element and leave with it; the card
    // is the comment, and it carries the control that scrolls back — hiding it
    // is what put that button out of reach exactly when it was wanted.
    it('drops the marker but docks the card when the element scrolls away', () => {
      const element = mountSized({ top: 100, bottom: 300, height: 200 }, 60);
      show();
      expect(pin.locate()).toBe(true);
      element.getBoundingClientRect = () =>
        ({
          left: 20,
          right: 420,
          width: 400,
          top: -300,
          bottom: -100,
          height: 200,
        }) as DOMRect;
      window.dispatchEvent(new Event('resize'));
      return new Promise((resolve) => setTimeout(resolve, 400)).then(() => {
        expect(marker().classList.contains('found')).toBe(false);
        expect(marked()).toBe(false);
        expect(card().classList.contains('found')).toBe(true);
        expect(card().classList.contains('away')).toBe(true);
        // Scrolled off the top, so the card docks to the top edge.
        expect(card().style.top).toBe('8px');
        expect(
          host.shadowRoot?.querySelector('.awaynote')?.textContent,
        ).toContain('↑');
      });
    });

    it('anchors the card again once the element scrolls back', () => {
      const element = mountSized({ top: 100, bottom: 300, height: 200 }, 60);
      show();
      expect(pin.locate()).toBe(true);
      const away = {
        left: 20,
        right: 420,
        width: 400,
        top: 2000,
        bottom: 2200,
        height: 200,
      } as DOMRect;
      const back = element.getBoundingClientRect;
      element.getBoundingClientRect = () => away;
      window.dispatchEvent(new Event('resize'));
      return new Promise((resolve) => setTimeout(resolve, 400))
        .then(() => {
          expect(card().classList.contains('away')).toBe(true);
          expect(
            host.shadowRoot?.querySelector('.awaynote')?.textContent,
          ).toContain('↓');
          element.getBoundingClientRect = back;
          window.dispatchEvent(new Event('resize'));
          return new Promise((resolve) => setTimeout(resolve, 400));
        })
        .then(() => {
          expect(card().classList.contains('away')).toBe(false);
          expect(marked()).toBe(true);
          expect(host.shadowRoot?.querySelector('.awaynote')?.textContent).toBe(
            '',
          );
        });
    });

    it('clears the docked state when the pin is dismissed', () => {
      mountSized({ top: -900, bottom: -700, height: 200 }, 60);
      show();
      expect(pin.locate()).toBe(true);
      expect(card().classList.contains('away')).toBe(true);
      pin.dismiss();
      expect(card().classList.contains('found')).toBe(false);
      expect(card().classList.contains('away')).toBe(false);
      expect(host.shadowRoot?.querySelector('.awaynote')?.textContent).toBe('');
    });
  });

  // The normal case: a React `useId` selector is stale on the next reload, so
  // the text scan is what found the element — and only it can find it again.
  describe('a target the full ladder resolved', () => {
    const stale = () =>
      show({
        s: '#_r_gone_',
        tid: 'panel',
        rect: { x: 0, y: 0, w: 0.4, h: 0.4 },
        txt: 'Save',
      });
    const render = () => {
      (document.querySelector('#app') as HTMLElement).innerHTML =
        '<div data-testid="panel"><button>Save</button><button>Cancel</button></div>';
    };

    beforeEach(() => {
      document.body.insertAdjacentHTML('beforeend', '<div id="app"></div>');
      render();
    });

    it('re-finds it with the full ladder after a re-render, not the landmark', async () => {
      stale();
      expect(pin.locate()).toBe(true);
      expect(pin.locatedElement()?.textContent).toBe('Save');

      render();
      await new Promise((resolve) => setTimeout(resolve, 400));

      expect(pin.locatedElement()?.textContent).toBe('Save');
      expect(marker().classList.contains('found')).toBe(true);
    });

    // Nothing marks a target as "text-scanned": a selector that resolved at
    // landing goes stale on the very next re-render.
    it('escalates for a target the selector itself resolved at landing', async () => {
      show({ s: '#save', tid: undefined, txt: 'Save' });
      (document.querySelector('#app') as HTMLElement).innerHTML =
        '<button id="save">Save</button>';
      expect(pin.locate()).toBe(true);

      (document.querySelector('#app') as HTMLElement).innerHTML =
        '<section><button>Save</button></section>';
      await new Promise((resolve) => setTimeout(resolve, 400));

      expect(pin.locatedElement()?.textContent).toBe('Save');
      expect(marker().classList.contains('found')).toBe(true);
    });

    // The escalation is a document-wide text scan; a reviewer who navigates
    // away must not pay for it on every mutation batch for the tab's life.
    it('stops re-scanning once the element is gone for good', async () => {
      stale();
      expect(pin.locate()).toBe(true);
      const app = document.querySelector('#app') as HTMLElement;
      app.innerHTML = '';

      let scans = 0;
      const real = document.querySelectorAll.bind(document);
      document.querySelectorAll = ((selector: string) => {
        if (selector === 'button') scans++;
        return real(selector);
      }) as typeof document.querySelectorAll;
      for (let i = 0; i < 6; i++) {
        app.append(document.createElement('i'));
        await new Promise((resolve) => setTimeout(resolve, 400));
      }
      document.querySelectorAll = real;

      expect(scans).toBeGreaterThan(0);
      expect(scans).toBeLessThanOrEqual(3);
    });

    it('escalates when the cheap ladder comes back empty', async () => {
      stale();
      expect(pin.locate()).toBe(true);

      // The landmark is gone too: only the text scan can still answer.
      (document.querySelector('#app') as HTMLElement).innerHTML =
        '<section><button>Save</button></section>';
      await new Promise((resolve) => setTimeout(resolve, 400));

      expect(pin.locatedElement()?.textContent).toBe('Save');
      expect(pin.locatedElement()?.parentElement?.tagName).toBe('SECTION');
    });
  });

  // The marker sits on the element's own top-left corner, so it must not be
  // what a click lands on; the scroll-back affordance lives on the card.
  it('scrolls back from the card, not from the marker', () => {
    document.body.insertAdjacentHTML(
      'beforeend',
      '<button data-testid="create">Create</button>',
    );
    const element = document.querySelector(
      '[data-testid="create"]',
    ) as HTMLElement;
    let scrolled = 0;
    element.scrollIntoView = () => {
      scrolled++;
    };
    show();
    expect(pin.locate()).toBe(true);
    const after = scrolled;
    (host.shadowRoot?.querySelector('.card .locate') as HTMLElement).click();
    expect(scrolled).toBe(after + 1);
  });

  // The pin used to write an outline onto the app's own element and put the
  // old value back on dismiss. It draws on its own layer now and never
  // restyles the page.
  it('never touches the element’s own style, and clears on dismiss', () => {
    document.body.insertAdjacentHTML(
      'beforeend',
      '<button data-testid="create" style="outline: 1px dotted red">Create</button>',
    );
    show();
    pin.locate();
    expect(outlined()).toBe('1px dotted red');
    expect(marked()).toBe(true);
    pin.dismiss();
    expect(outlined()).toBe('1px dotted red');
    expect(marked()).toBe(false);
    expect(pin.isShowing()).toBe(false);
  });

  // The card leads with the reviewer's own words; the generated label follows.
  describe('the note the link carries', () => {
    const note = () => host.shadowRoot?.querySelector('.note') as HTMLElement;
    const trunc = () => host.shadowRoot?.querySelector('.trunc') as HTMLElement;

    it('shows it above the label, verbatim', () => {
      show({ n: 'The button is misaligned.\nIt should sit flush.' });
      expect(note().textContent).toBe(
        'The button is misaligned.\nIt should sit flush.',
      );
      expect(card().textContent?.indexOf('The button')).toBeLessThan(
        card().textContent?.indexOf('Start › button') ?? -1,
      );
      expect(trunc().classList.contains('shown')).toBe(false);
    });

    it('says so when the note was capped', () => {
      show({ n: `${'x'.repeat(279)}…`, nt: 1 });
      expect(trunc().classList.contains('shown')).toBe(true);
      expect(trunc().textContent).toContain('comment');
    });

    // Every link copied before the note travelled: no note, and no gap where
    // one would have been.
    it('leaves nothing at all for a link without one', () => {
      show({ n: `${'x'.repeat(279)}…`, nt: 1 });
      show();
      expect(note().textContent).toBe('');
      expect(trunc().classList.contains('shown')).toBe(false);
      const css = host.shadowRoot?.querySelector('style')?.textContent ?? '';
      expect(css).toContain('.card .note:empty { display: none; }');
    });
  });

  // A box select anchors to the FRAME it happened inside — marking that would
  // highlight something many times the region the reviewer dragged.
  describe('a pin whose anchor carries a region', () => {
    const SEL = { x: 0.05, y: 0.1, w: 0.5, h: 0.25 };
    const region = markbox;

    it('draws the projected region instead of the whole frame', () => {
      mountSized(
        {
          left: 100,
          right: 500,
          top: 200,
          bottom: 600,
          width: 400,
          height: 400,
        },
        60,
      );
      show({ sel: SEL });
      expect(pin.locate()).toBe(true);

      expect(region().classList.contains('found')).toBe(true);
      expect(region().style.left).toBe('120px');
      expect(region().style.top).toBe('240px');
      expect(region().style.width).toBe('200px');
      expect(region().style.height).toBe('100px');
      // A region has no corners of its own; react-grab's drag box has none either.
      expect(region().style.borderRadius).toBe('0px');
      // The marker sits on the region, not on the frame's corner.
      expect(marker().style.left).toBe('126px');
    });

    it('takes the region down with the pin', () => {
      mountSized(
        {
          left: 100,
          right: 500,
          top: 200,
          bottom: 600,
          width: 400,
          height: 400,
        },
        60,
      );
      show({ sel: SEL });
      pin.locate();
      pin.dismiss();
      expect(region().classList.contains('found')).toBe(false);
    });

    it('marks the element itself when there is no region', () => {
      mountSized(
        {
          left: 100,
          right: 500,
          top: 200,
          bottom: 600,
          width: 400,
          height: 400,
        },
        60,
      );
      show();
      pin.locate();
      expect(marked()).toBe(true);
      expect(region().style.width).toBe('400px');
      expect(region().style.height).toBe('400px');
    });
  });

  // The arriving overlay is the pick box the reviewer already saw: a thin
  // stroke over a light fill, rounded to the element's own corners.
  describe('the box it draws is react-grab’s style', () => {
    it('strokes thin and fills, from the pick tokens', () => {
      const css = host.shadowRoot?.querySelector('style')?.textContent ?? '';
      expect(css).toContain('border: 1px solid var(--bai-review-pick-line)');
      expect(css).toContain('background: var(--bai-review-pick-fill)');
      expect(css).not.toContain('3px solid');
    });

    it('takes the element’s own border radius', () => {
      document.body.insertAdjacentHTML(
        'beforeend',
        '<button data-testid="create" style="border-radius: 6px">Create</button>',
      );
      show();
      expect(pin.locate()).toBe(true);
      expect(markbox().style.borderRadius).toBe('6px');
    });
  });

  // FR-3849. The id is what names this comment in the PR thread, a Teams
  // message or a Claude prompt — reading it off the card and retyping it was
  // the only way to get it.
  describe('the id copy control', () => {
    const idCopy = () =>
      host.shadowRoot?.querySelector('.idcopy') as HTMLButtonElement;
    const subText = () =>
      (host.shadowRoot?.querySelector('.sub') as HTMLElement).textContent;

    it('writes the bare id — no #bai prefix, no URL', () => {
      show({
        c: { name: 'CreateButton', src: 'react/src/Create.tsx:12' },
      } as Partial<AnchorV3>);
      idCopy().click();
      expect(copied).toEqual(['c_zdv3rhz']);
    });

    it('names every icon-only control for a screen reader', () => {
      show();
      const named = ['.idcopy', '.close', '.locate', '.copyall'].map((sel) =>
        host.shadowRoot?.querySelector(sel)?.getAttribute('aria-label'),
      );
      expect(named).toEqual([
        'Copy this comment id',
        'Dismiss this pin',
        'Scroll back to this element',
        'Copy the whole comment',
      ]);
    });

    it('says which id it copied', () => {
      show();
      idCopy().click();
      expect(toasts).toEqual(['Copied c_zdv3rhz 📋']);
    });

    it('waits for an async clipboard before it claims success', async () => {
      copyResult = Promise.resolve(false);
      show();
      idCopy().click();
      await copyResult;
      expect(toasts[0]).toContain('Could not reach the clipboard');
    });

    it('copies nothing once the pin is dismissed', () => {
      show();
      pin.dismiss();
      idCopy().click();
      expect(copied).toEqual([]);
    });

    it('keeps the component line beside the id, not inside the button', () => {
      show({
        c: { name: 'CreateButton', src: 'react/src/Create.tsx:12' },
      } as Partial<AnchorV3>);
      expect(idCopy().textContent).toBe('📋');
      expect(subText()).toBe(
        'c_zdv3rhz📋 · CreateButton (react/src/Create.tsx:12)',
      );
    });
  });

  // FR-3851. The id names the comment; the comment is what gets forwarded.
  describe('the whole-comment copy control', () => {
    const commentCopy = () =>
      host.shadowRoot?.querySelector('.copyall') as HTMLButtonElement;

    it('writes both flavours of the block the owner rendered', () => {
      show({ n: 'The label is cut off.' });
      commentCopy().click();
      expect(copied).toEqual(['the whole comment']);
      expect(copiedHtml).toEqual(['<p>the whole comment</p>']);
      expect(toasts).toEqual(['Copied the whole comment 📋']);
    });

    it('hands the owner the pin it is showing, payload included', () => {
      show({ n: 'Misaligned.' });
      commentCopy().click();
      expect(commentFor).toMatchObject({
        id: 'c_zdv3rhz',
        anchorB64: 'PAYLOAD',
        label: 'Start › button',
      });
      expect(commentFor?.anchor.n).toBe('Misaligned.');
    });

    // The link caps the note it carries, so a copy off a capped link is short.
    it('says so when the link only carries a shortened note', () => {
      show({ n: 'A very long note…', nt: 1 });
      commentCopy().click();
      expect(toasts).toEqual([
        'Copied — the note is the shortened one the link carries 📋',
      ]);
    });

    it('copies nothing once the pin is dismissed', () => {
      show();
      pin.dismiss();
      commentCopy().click();
      expect(copied).toEqual([]);
      expect(toasts).toEqual([]);
    });

    it('says so rather than writing a half-read block', () => {
      comment = null;
      show();
      commentCopy().click();
      expect(copied).toEqual([]);
      expect(toasts).toEqual(['Still reading this element — try again']);
    });

    it('waits for an async clipboard before it claims success', async () => {
      copyResult = Promise.resolve(false);
      show();
      commentCopy().click();
      await copyResult;
      expect(toasts[0]).toContain('Could not reach the clipboard');
    });
  });

  // The ⚛️ stack is not in the anchor: the owner re-reads it from whatever
  // element the pin is on, so it has to hear about every move.
  describe('the located-element handoff', () => {
    it('reports the element it settled on, and the loss of it', () => {
      show();
      document.body.insertAdjacentHTML(
        'beforeend',
        '<button data-testid="create">Create</button>',
      );
      const element = document.querySelector('[data-testid="create"]');
      expect(pin.locate()).toBe(true);
      expect(located).toEqual([element]);
      pin.dismiss();
      expect(located).toEqual([element, null]);
    });

    it('stays quiet while the pin holds the same element', () => {
      show();
      document.body.insertAdjacentHTML(
        'beforeend',
        '<button data-testid="create">Create</button>',
      );
      expect(pin.locate()).toBe(true);
      expect(pin.locate()).toBe(true);
      expect(located).toHaveLength(1);
    });
  });

  // FR-3849. G4 made the whole card click-through so it would not swallow
  // clicks meant for the app; that also made its text unselectable.
  describe('selectable text on a click-through card', () => {
    const runs = () =>
      Array.from(host.shadowRoot?.querySelectorAll('.card .txt') ?? []);

    it('carries every text run in an inline span of its own', () => {
      show({ n: 'Misaligned.' });
      expect(runs().map((span) => span.parentElement?.className)).toEqual([
        'note',
        'trunc',
        'label',
        'sub',
        'sub',
      ]);
    });

    it('gives those spans pointer events and selection, not the card', () => {
      const css = host.shadowRoot?.querySelector('style')?.textContent ?? '';
      expect(css).toContain(
        'padding: 8px 10px; font-size: 14px; pointer-events: none;',
      );
      expect(css).toContain(
        'pointer-events: auto; -webkit-user-select: text; user-select: text;',
      );
    });
  });

  it('hides the pin when the element leaves the page', async () => {
    document.body.insertAdjacentHTML(
      'beforeend',
      '<button data-testid="create">Create</button>',
    );
    show();
    pin.locate();
    document.querySelector('[data-testid="create"]')?.remove();
    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(marker().classList.contains('found')).toBe(false);
  });
});
