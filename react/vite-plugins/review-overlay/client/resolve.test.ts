import { findAnchorTarget, quickFindTarget } from './resolve.js';
import type { AnchorV3 } from './types.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

/** react-grab 0.1.50's synchronous `getDisplayName`, stubbed per test. */
const stubReactGrab = (names: Record<string, string>) => {
  (window as unknown as { __REACT_GRAB__?: unknown }).__REACT_GRAB__ = {
    getDisplayName: (element: Element) =>
      names[element.getAttribute('data-name') ?? ''] ?? null,
  };
};

const mount = (html: string) => {
  document.body.innerHTML = html;
};

const anchor = (over: Partial<AnchorV3> = {}): AnchorV3 => ({
  v: 3,
  s: 'button:nth-of-type(1)',
  p: '/',
  tag: 'button',
  txt: 'Login',
  ...over,
});

beforeEach(() => {
  document.body.innerHTML = '';
});

afterEach(() => {
  delete (window as unknown as { __REACT_GRAB__?: unknown }).__REACT_GRAB__;
});

describe('quickFindTarget', () => {
  it('takes the selector when its text agrees', () => {
    mount('<button>Login</button>');
    expect(quickFindTarget(anchor())?.textContent).toBe('Login');
  });

  it('refuses a selector whose element now says something else', () => {
    mount('<button>Sign out</button>');
    expect(quickFindTarget(anchor())).toBeNull();
  });

  // `includes('')` would otherwise confirm every icon-only button.
  it('refuses a selector hit that carries no text at all', () => {
    mount('<button><svg></svg></button>');
    expect(quickFindTarget(anchor())).toBeNull();
  });

  it('falls back to a unique testid landmark', () => {
    mount('<section data-testid="page-start"><button>Login</button></section>');
    expect(
      quickFindTarget(anchor({ s: 'nope:nth-of-type(9)', tid: 'page-start' })),
    ).toBe(document.querySelector('[data-testid="page-start"]'));
  });

  it('does not guess when the landmark is ambiguous', () => {
    mount('<i data-testid="row"></i><i data-testid="row"></i>');
    expect(quickFindTarget(anchor({ s: 'nope', tid: 'row' }))).toBeNull();
  });

  it('survives a selector the browser cannot parse', () => {
    mount('<button>Login</button>');
    expect(quickFindTarget(anchor({ s: 'button:has(' }))).toBeNull();
  });
});

describe('findAnchorTarget', () => {
  it('scans by tag and text when the selector moved', () => {
    mount(
      '<div><span>x</span><button>Cancel</button><button>Login</button></div>',
    );
    expect(
      findAnchorTarget(anchor({ s: 'button:nth-of-type(7)' }))?.textContent,
    ).toBe('Login');
  });

  it('prefers the innermost element carrying the text', () => {
    mount('<button><span>Login</span></button>');
    const found = findAnchorTarget(anchor({ s: 'nope', tag: undefined }));
    expect(found?.tagName).toBe('SPAN');
  });

  it('scopes the scan to a unique testid landmark', () => {
    mount(`
      <div><button>Login</button></div>
      <section data-testid="page-start"><button>Login</button></section>
    `);
    const found = findAnchorTarget(anchor({ s: 'nope', tid: 'page-start' }));
    expect(found?.closest('[data-testid="page-start"]')).toBeTruthy();
  });

  it('keeps the selector hit as a weak answer when the text scan finds nothing', () => {
    mount('<button>Sign out</button>');
    expect(findAnchorTarget(anchor())?.textContent).toBe('Sign out');
  });

  it('never returns the overlay’s own chrome', () => {
    mount('<div data-bai-review-overlay><button>Login</button></div>');
    expect(findAnchorTarget(anchor({ s: 'nope' }))).toBeNull();
  });

  it('returns null when the page has nothing like the anchor', () => {
    mount('<p>empty page</p>');
    expect(findAnchorTarget(anchor({ s: 'nope' }))).toBeNull();
  });

  it('refuses an anchor with no selector at all', () => {
    mount('<button>Login</button>');
    expect(findAnchorTarget({ v: 3, p: '/' } as AnchorV3)).toBeNull();
  });
});

// R3.6 put the react-grab component name in the anchor as a resolution signal:
// `useId` selectors go stale and the testid + rect fallback stacked two pins on
// the same landmark corner.
describe('the anchor’s component name', () => {
  const withComponent = (over: Partial<AnchorV3> = {}) =>
    anchor({
      c: { name: 'RowActions', src: 'src/Row.tsx:12:4', dn: 'RowActions' },
      ...over,
    });

  it('breaks the tie between two candidates with the same text', () => {
    mount(`
      <div data-name="Toolbar"><button data-name="Toolbar">Login</button></div>
      <div data-name="RowActions"><button data-name="RowActions">Login</button></div>
    `);
    stubReactGrab({ Toolbar: 'Toolbar', RowActions: 'RowActions' });
    const found = findAnchorTarget(withComponent({ s: 'nope' }));
    expect(found?.closest('[data-name="RowActions"]')).toBeTruthy();
  });

  it('rejects a testid landmark that is a different component', () => {
    mount('<div data-testid="panel" data-name="Toolbar"><i>Login</i></div>');
    stubReactGrab({ Toolbar: 'Toolbar' });
    expect(
      quickFindTarget(withComponent({ s: 'nope', tid: 'panel' })),
    ).toBeNull();
  });

  it('takes the landmark when react-grab agrees', () => {
    mount('<div data-testid="panel" data-name="RowActions"><i>Login</i></div>');
    stubReactGrab({ RowActions: 'RowActions' });
    expect(quickFindTarget(withComponent({ s: 'nope', tid: 'panel' }))).toBe(
      document.querySelector('[data-testid="panel"]'),
    );
  });

  // Without react-grab the signal must never make the ladder worse.
  it('is ignored when react-grab is not on the page', () => {
    mount('<div data-testid="panel"><i>Login</i></div>');
    expect(quickFindTarget(withComponent({ s: 'nope', tid: 'panel' }))).toBe(
      document.querySelector('[data-testid="panel"]'),
    );
  });

  // `c.name` is `getSource`'s OWNER component and `getDisplayName` answers the
  // rendered one: on a real page those disagree on nearly every element.
  it('keeps a hit whose rendered name differs from the owner name', () => {
    mount('<button data-name="Link">Login</button>');
    stubReactGrab({ Link: 'Link' });
    const found = quickFindTarget(
      anchor({ c: { name: 'WebUILink', src: 'src/L.tsx:1', dn: 'Link' } }),
    );
    expect(found?.textContent).toBe('Login');
  });

  // A pre-`dn` link carries no name the read side can compare with itself.
  it('never rejects anything on an anchor with no rendered name', () => {
    mount('<div data-testid="panel" data-name="Layout"><i>Login</i></div>');
    stubReactGrab({ Layout: 'Layout' });
    const withOwnerOnly = anchor({
      s: 'nope',
      tid: 'panel',
      c: { name: 'BAIAppShell', src: 'src/A.tsx:1' },
    });
    expect(quickFindTarget(withOwnerOnly)).toBe(
      document.querySelector('[data-testid="panel"]'),
    );
  });

  // The owner name is a positive rank, never a pass on the veto: an element
  // that merely renders under the pick's OWNER is still the wrong element.
  it('rejects a landmark whose rendered name is only the owner name', () => {
    mount('<div data-testid="panel" data-name="WebUILink"><i>Login</i></div>');
    stubReactGrab({ WebUILink: 'WebUILink' });
    expect(
      quickFindTarget(
        anchor({
          s: 'nope',
          tid: 'panel',
          c: { name: 'WebUILink', src: 'src/L.tsx:1', dn: 'Link' },
        }),
      ),
    ).toBeNull();
  });

  it('lets a named wrapper keep the deeper node it contains', () => {
    mount('<div data-name="RowActions"><div id="body">Delete</div></div>');
    stubReactGrab({ RowActions: 'RowActions' });
    const found = findAnchorTarget(
      withComponent({ s: 'nope', tag: 'div', txt: 'Delete' }),
    );
    expect((found as HTMLElement)?.id).toBe('body');
  });

  // Both ladders have to agree, or the pin lands on what `quickFindTarget`
  // refused the moment the debounce runs.
  it('refuses a conflicting selector hit in both ladders', () => {
    mount('<button data-name="Toolbar"><svg></svg></button>');
    stubReactGrab({ Toolbar: 'Toolbar' });
    const iconOnly = withComponent({ txt: undefined });
    expect(quickFindTarget(iconOnly)).toBeNull();
    expect(findAnchorTarget(iconOnly)).toBeNull();
  });
});

// The rect projection is the only ladder step with no selector behind it, so a
// sibling inserted at the recorded spot is whatever `elementFromPoint` says.
describe('the landmark’s rect projection', () => {
  const projected = (over: Partial<AnchorV3> = {}) =>
    anchor({
      s: 'nope',
      tag: 'span',
      tid: 'page-start',
      rect: { x: 0.1, y: 0.1, w: 0.2, h: 0.2 },
      ...over,
    });

  /** jsdom has no layout: give the landmark a box and name the hit. */
  const stubLayout = (container: Element, hit: Element) => {
    container.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 400, height: 200 }) as DOMRect;
    document.elementFromPoint = () => hit;
  };

  afterEach(() => {
    delete (document as Partial<Document>).elementFromPoint;
  });

  it('refuses a same-component decoy that took over the recorded spot', () => {
    mount(`
      <section data-testid="page-start">
        <span data-name="Link">decoy inserted above the anchor</span>
        <span data-name="Link">Login</span>
      </section>
    `);
    stubReactGrab({ Link: 'Link' });
    const landmark = document.querySelector('[data-testid="page-start"]');
    const decoy = document.querySelector('span');
    stubLayout(landmark as Element, decoy as Element);

    const withName = projected({
      c: { name: 'BAIMenu', src: 'src/BAIMenu.tsx:109:16', dn: 'Link' },
    });
    expect(quickFindTarget(withName)).toBe(landmark);
    // The landmark answer is what `pin.ts` escalates on, and the full ladder's
    // text scan then finds the node the decoy displaced.
    expect(findAnchorTarget(withName)?.textContent).toBe('Login');
  });

  it('still projects for an anchor that recorded no text', () => {
    mount(
      '<section data-testid="page-start"><button><svg></svg></button></section>',
    );
    const landmark = document.querySelector('[data-testid="page-start"]');
    const iconOnly = document.querySelector('button');
    stubLayout(landmark as Element, iconOnly as Element);

    const noText = projected({ tag: 'button', txt: undefined });
    expect(quickFindTarget(noText)).toBe(iconOnly);
    expect(findAnchorTarget(noText)).toBe(iconOnly);
  });
});
