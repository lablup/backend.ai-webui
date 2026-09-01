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
