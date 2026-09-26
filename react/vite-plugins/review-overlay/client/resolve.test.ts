import { findAnchorTarget, isBehindModal, quickFindTarget } from './resolve.js';
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

// A stop is a pin the implementing session authored; a wrong element under
// its mark is worse than a waiting one, so it resolves strictly.
describe('walkthrough stops resolve strictly (FR-3949)', () => {
  const stop = (over: Partial<AnchorV3> = {}): AnchorV3 =>
    anchor({ ck: 'The Models choice is visible', ...over });

  it('takes no text look-alike while its landmark is absent', () => {
    // The modal is closed: only the page's own "Models" filter is on screen.
    mount('<button data-testid="filter-models">Models</button>');
    const modalRadio = {
      s: '[data-testid="model-usage-mode"]',
      tid: 'model-usage-mode',
      txt: 'Models',
    };
    expect(findAnchorTarget(anchor(modalRadio))?.textContent).toBe('Models');
    expect(findAnchorTarget(stop(modalRadio))).toBeNull();
    expect(quickFindTarget(stop(modalRadio))).toBeNull();
  });

  it('is found once its landmark is on the page', () => {
    mount(
      '<button data-testid="filter-models">Models</button><div role="dialog"><label data-testid="model-usage-mode">Models</label></div>',
    );
    const found = findAnchorTarget(
      stop({
        s: '[data-testid="model-usage-mode"]',
        tid: 'model-usage-mode',
        txt: 'Models',
        tag: 'label',
      }),
    );
    expect(found?.tagName).toBe('LABEL');
  });

  it('takes no stale selector hit', () => {
    mount('<button>Cancel</button>');
    expect(findAnchorTarget(anchor())?.textContent).toBe('Cancel');
    expect(findAnchorTarget(stop())).toBeNull();
  });

  it('scans the page only when it has no landmark to match', () => {
    mount('<section><button>Login</button></section>');
    expect(
      findAnchorTarget(stop({ s: '#gone', tid: undefined }))?.textContent,
    ).toBe('Login');
  });

  it('never settles for the frame its element lives in', () => {
    mount('<div data-testid="panel"><button>Other</button></div>');
    const framed = {
      s: '#_r_gone_',
      tid: 'panel',
      rect: { x: 0, y: 0, w: 0.4, h: 0.4 },
      txt: 'Save',
    };
    expect(quickFindTarget(anchor(framed))?.getAttribute('data-testid')).toBe(
      'panel',
    );
    expect(quickFindTarget(stop(framed))).toBeNull();
    expect(findAnchorTarget(stop(framed))).toBeNull();
  });

  it('with dlg, counts an element inside an alertdialog too', () => {
    mount('<div role="alertdialog"><button data-testid="ok">OK</button></div>');
    const found = findAnchorTarget(
      stop({ s: '[data-testid="ok"]', tid: 'ok', txt: 'OK', dlg: 1 }),
    );
    expect(found?.textContent).toBe('OK');
  });

  // An icon-only pick has no text to tell the frame from the element, and
  // the projection needs layout; the landmark is the honest best answer.
  it('settles for the landmark when the stop carries no text', () => {
    mount('<div data-testid="panel"><button aria-label="x"></button></div>');
    const iconOnly = stop({
      s: '#_r_gone_',
      tid: 'panel',
      rect: { x: 0, y: 0, w: 0.4, h: 0.4 },
      txt: undefined,
    });
    expect(quickFindTarget(iconOnly)?.getAttribute('data-testid')).toBe(
      'panel',
    );
    expect(findAnchorTarget(iconOnly)?.getAttribute('data-testid')).toBe(
      'panel',
    );
  });

  it('with dlg, counts only an element inside an open dialog', () => {
    mount('<button data-testid="ok">OK</button>');
    const dialogStop = stop({
      s: '[data-testid="ok"]',
      tid: 'ok',
      txt: 'OK',
      dlg: 1,
    });
    expect(findAnchorTarget(dialogStop)).toBeNull();
    expect(quickFindTarget(dialogStop)).toBeNull();
    mount('<div role="dialog"><button data-testid="ok">OK</button></div>');
    expect(findAnchorTarget(dialogStop)?.textContent).toBe('OK');
    expect(quickFindTarget(dialogStop)?.textContent).toBe('OK');
  });

  // A closed native <dialog> keeps its subtree in the DOM, so "inside a
  // dialog" is not enough: it has to be an OPEN one.
  it('with dlg, ignores an element inside a closed native dialog', () => {
    mount('<dialog><button data-testid="ok">OK</button></dialog>');
    const dialogStop = stop({
      s: '[data-testid="ok"]',
      tid: 'ok',
      txt: 'OK',
      dlg: 1,
    });
    expect(findAnchorTarget(dialogStop)).toBeNull();
    expect(quickFindTarget(dialogStop)).toBeNull();
    document.querySelector('dialog')?.setAttribute('open', '');
    expect(findAnchorTarget(dialogStop)?.textContent).toBe('OK');
    expect(quickFindTarget(dialogStop)?.textContent).toBe('OK');
  });

  // A recycled selector can hit a same-text control outside the landmark; a
  // stop takes the selector only where the text scan would take it.
  it('takes a selector hit only inside its landmark', () => {
    mount(
      '<button class="primary">Save</button><div data-testid="panel"><button>Save</button></div>',
    );
    const outside = { s: 'button.primary', tid: 'panel', txt: 'Save' };
    const panel = () => document.querySelector('[data-testid="panel"]');
    expect(quickFindTarget(anchor(outside))?.className).toBe('primary');
    const quick = quickFindTarget(stop(outside));
    expect(quick?.className).not.toBe('primary');
    expect(panel()?.contains(quick)).toBe(true);
    const full = findAnchorTarget(stop(outside));
    expect(full?.tagName).toBe('BUTTON');
    expect(panel()?.contains(full)).toBe(true);
    mount('<button class="primary">Save</button>');
    expect(quickFindTarget(stop(outside))).toBeNull();
    expect(findAnchorTarget(stop(outside))).toBeNull();
  });

  // Two tabs render the same row component, so the landmark testid is not
  // unique; the selector hit still counts when it sits inside one of them.
  it('resolves through a duplicated landmark by its selector hit', () => {
    mount(
      '<div data-testid="row"><button>Save</button></div><div data-testid="row"><button id="right">Save</button></div><button id="loose">Save</button>',
    );
    const inside = stop({ s: '#right', tid: 'row', txt: 'Save' });
    expect(quickFindTarget(inside)?.id).toBe('right');
    expect(findAnchorTarget(inside)?.id).toBe('right');
    const loose = stop({ s: '#loose', tid: 'row', txt: 'Save' });
    expect(quickFindTarget(loose)).toBeNull();
    expect(findAnchorTarget(loose)).toBeNull();
  });
});

/**
 * Pages render the same thing twice. github.com emits every file-name link in
 * a screen-reader cell first, `display: none`, and again in the cell a reader
 * sees — and the scan, walking document order, took the first one. The pin
 * then drew a zero-size box in the page's top-left corner, which is not even
 * the "scrolled below" state the real element deserved.
 */
describe('a hidden look-alike never beats a rendered one', () => {
  /** jsdom reports nothing for every element; give these ones a box. */
  const render = (...elements: Element[]) => {
    for (const element of elements) {
      const rect = { left: 0, top: 0, width: 120, height: 20 } as DOMRect;
      element.getClientRects = () => [rect] as unknown as DOMRectList;
      element.getBoundingClientRect = () => rect;
    }
  };

  /**
   * …and jsdom lays nothing out at all, which the client reads as "no layout
   * engine", not "everything is hidden". Refusing an element with no box is
   * conditional on that: a test about hidden elements says the document lays
   * out, and one about jsdom itself does not.
   */
  const laidOut = () => render(document.documentElement);

  afterEach(() => {
    delete (document.documentElement as Partial<HTMLElement>).getClientRects;
    delete (document.documentElement as Partial<HTMLElement>)
      .getBoundingClientRect;
  });

  const twice = `
    <div class="sr"><a href="/f">.cspell.json</a></div>
    <div class="wide"><a href="/f">.cspell.json</a></div>
  `;
  const copies = () => document.querySelectorAll('a');
  const file = (over: Partial<AnchorV3> = {}) =>
    anchor({ s: '.wide a', tag: 'a', txt: '.cspell.json', ...over });

  it('is skipped by the text scan that would have taken it first', () => {
    mount(twice);
    laidOut();
    render(copies()[1]);

    // The selector has gone stale, so the scan is the only rung left.
    expect(findAnchorTarget(file({ s: '#gone' }))).toBe(copies()[1]);
  });

  it('loses the selector rung too, in both ladders', () => {
    mount(twice);
    laidOut();
    render(copies()[1]);

    const both = file({ s: 'a[href="/f"]' });
    expect(quickFindTarget(both)).toBe(copies()[1]);
    expect(findAnchorTarget(both)).toBe(copies()[1]);
  });

  it('does not disqualify a landmark it duplicates', () => {
    laidOut();
    mount(`
      <div class="sr" data-testid="row"><a href="/f">.cspell.json</a></div>
      <div class="wide" data-testid="row"><a href="/f">.cspell.json</a></div>
    `);
    const rows = document.querySelectorAll('[data-testid="row"]');
    render(rows[1], copies()[1]);

    const framed = file({ s: '#gone', tid: 'row' });
    expect(findAnchorTarget(framed)).toBe(copies()[1]);
    expect(quickFindTarget(framed)).toBe(rows[1]);
  });

  it('loses to a rendered one for a strict stop as well', () => {
    mount(twice);
    laidOut();
    render(copies()[1]);

    const stop = file({ s: '#gone', ck: 'The file row is visible' });
    expect(findAnchorTarget(stop)).toBe(copies()[1]);
  });

  // Waiting is better than drawing somewhere wrong: the marker, the box and
  // the card of a boxless element all land in the page's top-left corner, and
  // the retry driver is already waiting for the real one to come back.
  it('is refused outright when it is the only candidate left', () => {
    mount(twice);
    laidOut();

    expect(findAnchorTarget(file({ s: 'a[href="/f"]' }))).toBeNull();
    expect(quickFindTarget(file({ s: 'a[href="/f"]' }))).toBeNull();
  });

  // The whole preference is conditional on the document laying anything out:
  // in jsdom nothing has a box, and the old order stands.
  it('changes nothing in a document with no layout at all', () => {
    mount(twice);

    expect(findAnchorTarget(file({ s: '#gone' }))).toBe(copies()[0]);
    expect(quickFindTarget(file({ s: 'a[href="/f"]' }))).toBe(copies()[0]);
  });
});

describe('isBehindModal', () => {
  const byId = (id: string) => document.getElementById(id) as Element;

  beforeEach(() => {
    document.body.innerHTML = '<button id="page">page</button>';
  });

  it('is false with no modal open, and under a non-modal dialog', () => {
    expect(isBehindModal(byId('page'))).toBe(false);
    document.body.insertAdjacentHTML('beforeend', '<div role="dialog"></div>');
    expect(isBehindModal(byId('page'))).toBe(false);
  });

  it('holds for the page under a modal, not for what the modal contains', () => {
    document.body.insertAdjacentHTML(
      'beforeend',
      '<div role="dialog" aria-modal="true"><div role="alertdialog" aria-modal="true"><button id="in">in</button></div><p id="frame">frame</p></div>',
    );
    expect(isBehindModal(byId('page'))).toBe(true);
    // A modal nested in another is the same layer, not one above it.
    expect(isBehindModal(byId('in'))).toBe(false);
    expect(isBehindModal(byId('frame'))).toBe(false);
  });

  it('puts the first modal under the one opened after it', () => {
    document.body.insertAdjacentHTML(
      'beforeend',
      '<div role="dialog" aria-modal="true"><button id="first">first</button></div>' +
        '<div role="alertdialog" aria-modal="true"><button id="second">second</button></div>',
    );
    expect(isBehindModal(byId('first'))).toBe(true);
    expect(isBehindModal(byId('second'))).toBe(false);
  });
});
