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
