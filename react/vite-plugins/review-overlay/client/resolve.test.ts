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
