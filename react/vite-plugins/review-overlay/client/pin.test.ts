import { createDeepLinkPin, type DeepLinkPin } from './pin.js';
import type { AnchorV3 } from './types.js';
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

const show = (over: Partial<AnchorV3> = {}) =>
  pin.show({ id: 'c_zdv3rhz', anchor: anchor(over), label: 'Start › button' });

const marker = () => host.shadowRoot?.querySelector('.pin') as HTMLElement;
const card = () => host.shadowRoot?.querySelector('.card') as HTMLElement;
const outlined = () =>
  document.querySelector<HTMLElement>('[data-testid="create"]')?.style.outline;

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
  pin = createDeepLinkPin({ root: host.attachShadow({ mode: 'open' }), host });
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
    expect(outlined()).toContain('3px solid');
    expect(marker().classList.contains('found')).toBe(true);
    expect(card().textContent).toContain('Start › button');
    expect(card().textContent).toContain('c_zdv3rhz');
  });

  it('names the component the block carried under the label', () => {
    pin.show({
      id: 'c_zdv3rhz',
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
    expect(outlined()).toContain('3px solid');
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
    it('drops the pin when a scroller clips the element out of sight', () => {
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
      expect(card().classList.contains('found')).toBe(false);
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

    it('drops the marker and the card when the element scrolls away', () => {
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
        expect(card().classList.contains('found')).toBe(false);
      });
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

  it('restores the element’s own outline when the pin is dismissed', () => {
    document.body.insertAdjacentHTML(
      'beforeend',
      '<button data-testid="create" style="outline: 1px dotted red">Create</button>',
    );
    show();
    pin.locate();
    pin.dismiss();
    expect(outlined()).toBe('1px dotted red');
    expect(pin.isShowing()).toBe(false);
  });

  // A box select anchors to the FRAME it happened inside — outlining that
  // would highlight something many times the region the reviewer dragged.
  describe('a pin whose anchor carries a region', () => {
    const SEL = { x: 0.05, y: 0.1, w: 0.5, h: 0.25 };
    const region = () =>
      host.shadowRoot?.querySelector('.region') as HTMLElement;

    it('draws the projected region instead of outlining the frame', () => {
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
      expect(outlined()).toBe('');
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

    it('still outlines the element when there is no region', () => {
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
      expect(region().classList.contains('found')).toBe(false);
      expect(outlined()).toContain('3px solid');
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
