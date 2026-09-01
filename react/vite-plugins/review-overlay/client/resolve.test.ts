import { findAnchorTarget, quickFindTarget } from './resolve.js';
import type { AnchorV3 } from './types.js';
import { beforeEach, describe, expect, it } from 'vitest';

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
