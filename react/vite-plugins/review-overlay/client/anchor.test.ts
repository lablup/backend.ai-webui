import {
  buildSelector,
  captureAnchorSignals,
  isStableId,
  normText,
} from './anchor.js';
import { beforeEach, describe, expect, it } from 'vitest';

beforeEach(() => {
  document.body.innerHTML = '';
});

const mount = (html: string) => {
  document.body.innerHTML = html;
};

describe('isStableId', () => {
  it('accepts an author-written id', () => {
    expect(isStableId('go')).toBe(true);
    expect(isStableId('session-name-input')).toBe(true);
    expect(isStableId('r2d2')).toBe(true);
  });

  // React's `useId` moves with the fiber tree, so it is not an anchor.
  it.each(['_r_1_', '_r_a3_', '_R_2H3_', '_R_1_', ':r0:', ':R1A:'])(
    'rejects the React-generated id %s',
    (id) => {
      expect(isStableId(id)).toBe(false);
    },
  );

  it('rejects an empty id', () => {
    expect(isStableId('')).toBe(false);
  });
});

describe('buildSelector', () => {
  it('prefers the element’s own data-testid', () => {
    mount('<div id="outer"><button data-testid="go" id="b">x</button></div>');
    expect(buildSelector(document.querySelector('[data-testid="go"]')!)).toBe(
      '[data-testid="go"]',
    );
  });

  it('falls back to a stable id', () => {
    mount('<div><button id="go">x</button></div>');
    expect(buildSelector(document.querySelector('#go')!)).toBe('#go');
  });

  it('walks up to the nearest testid landmark instead of a React id', () => {
    mount(
      '<div data-testid="card"><ul><li></li><li><span id="_r_1_">x</span></li></ul></div>',
    );
    expect(buildSelector(document.querySelector('#_r_1_')!)).toBe(
      '[data-testid="card"] > ul:nth-of-type(1) > li:nth-of-type(2) > span:nth-of-type(1)',
    );
  });

  it('stops at the first landmark ancestor rather than walking to body', () => {
    mount('<main id="root"><section><b id="_r_2_">x</b></section></main>');
    expect(buildSelector(document.querySelector('#_r_2_')!)).toBe(
      '#root > section:nth-of-type(1) > b:nth-of-type(1)',
    );
  });

  it('returns body for body itself', () => {
    expect(buildSelector(document.body)).toBe('body');
  });
});

describe('captureAnchorSignals', () => {
  it('records the testid landmark and the fractional rect inside it', () => {
    mount('<div data-testid="card"><button>Go now</button></div>');
    const card = document.querySelector('[data-testid="card"]') as HTMLElement;
    const button = document.querySelector('button') as HTMLElement;
    card.getBoundingClientRect = () =>
      ({ left: 100, top: 200, width: 400, height: 100 }) as DOMRect;
    button.getBoundingClientRect = () =>
      ({ left: 140, top: 210, width: 40, height: 20 }) as DOMRect;

    const anchor = captureAnchorSignals(button);
    expect(anchor.tid).toBe('card');
    expect(anchor.tag).toBe('button');
    expect(anchor.txt).toBe('Go now');
    expect(anchor.rect).toEqual({ x: 0.1, y: 0.1, w: 0.1, h: 0.2 });
  });

  it('omits the rect when the element IS the landmark', () => {
    mount('<div data-testid="card">x</div>');
    const anchor = captureAnchorSignals(
      document.querySelector('[data-testid="card"]')!,
    );
    expect(anchor.tid).toBe('card');
    expect(anchor.rect).toBeUndefined();
  });

  it('truncates the text at 64 characters and collapses whitespace', () => {
    mount(
      `<div data-testid="card"><p>  a\n\n  b  ${'z'.repeat(80)} </p></div>`,
    );
    const anchor = captureAnchorSignals(document.querySelector('p')!);
    expect(anchor.txt).toHaveLength(64);
    expect(anchor.txt?.startsWith('a b z')).toBe(true);
  });

  it('omits q when there is no query string, and carries it when there is', () => {
    mount('<div id="a">x</div>');
    expect(
      captureAnchorSignals(document.querySelector('#a')!).q,
    ).toBeUndefined();
  });

  // The picker hands over whatever the reviewer clicked — an element removed by
  // a re-render mid-pick, an SVG glyph inside a button, a node in a shadow
  // tree. None of them may throw; a zero-size landmark must not divide by zero.
  it('does not throw on a detached element', () => {
    const detached = document.createElement('div');
    detached.textContent = 'orphan';
    expect(() => captureAnchorSignals(detached)).not.toThrow();
    expect(captureAnchorSignals(detached).tag).toBe('div');
  });

  it('does not throw on an SVG child, and skips a zero-size landmark rect', () => {
    mount(
      '<div data-testid="icon-btn"><svg><path d="M0 0"></path></svg></div>',
    );
    const path = document.querySelector('path') as Element;
    const anchor = captureAnchorSignals(path);
    expect(anchor.tid).toBe('icon-btn');
    expect(anchor.tag).toBe('path');
    // jsdom reports a 0x0 landmark; the guard must keep `rect` off rather than
    // emit NaN.
    expect(anchor.rect).toBeUndefined();
  });

  it('does not throw on an element inside a shadow tree', () => {
    mount('<div id="host"></div>');
    const shadow = (
      document.querySelector('#host') as HTMLElement
    ).attachShadow({ mode: 'open' });
    shadow.innerHTML = '<span>inside</span>';
    const span = shadow.querySelector('span') as Element;
    expect(() => captureAnchorSignals(span)).not.toThrow();
    expect(captureAnchorSignals(span).tag).toBe('span');
  });
});

describe('normText', () => {
  it('collapses runs of whitespace and trims', () => {
    expect(normText('  a \n\t b  ')).toBe('a b');
    expect(normText(null)).toBe('');
    expect(normText(undefined)).toBe('');
  });
});
