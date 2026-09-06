/**
 * Opening a pin set's link (FR-3859), end to end through `main.ts`: every pin
 * the fragment carries MERGES into the draft set this tab is building, the
 * members on this page are drawn and the rest are rows in the dock. Only
 * `main.ts` composes the codec, the store, the layer and the dock, so this is
 * where the read flow can be asserted at all.
 */
import { encodeAnchor } from './codec.js';
import { DRAFT_KEY, MAX_SET_PINS } from './draft.js';
import type { AnchorV3, SetPin } from './types.js';
import type { Plugin, ReactGrabAPI } from 'react-grab';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const ROOT = '/home/driver/Workspace/backend.ai-webui';
const FILE = 'react/src/components/CreateButton.tsx';
const APPLIED_KEY = 'bai-review-applied';
const FOCUS_KEY = 'bai-review:focus';
const A = 'c_aaaaaaa';
const B = 'c_bbbbbbb';

const shadow = () =>
  document.querySelector('[data-bai-review-overlay]')?.shadowRoot as ShadowRoot;
const node = <T extends HTMLElement>(selector: string) =>
  shadow()?.querySelector<T>(selector) as T | null;
const all = (selector: string) =>
  Array.from(shadow()?.querySelectorAll<HTMLElement>(selector) ?? []);

const toast = () => node('.toast')?.textContent ?? '';
const dockRows = () => all('.setdock .row');
const cards = () => all('.card.found');
const storedPins = (): SetPin[] => {
  const raw = sessionStorage.getItem(DRAFT_KEY);
  return raw ? (JSON.parse(raw) as { pins: SetPin[] }).pins : [];
};
const storedIds = () => storedPins().map((pin) => pin.id);

/** `ANCHOR_TRIES` + a beat: the give-up sentence lands after the ladder. */
const LADDER_TICKS = 22;

const ticks = async (count: number, ms = 10) => {
  for (let i = 0; i < count; i++) {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
};

function mount(testid: string) {
  document.body.insertAdjacentHTML(
    'beforeend',
    `<button data-testid="${testid}">${testid}</button>`,
  );
}

interface PinSpec {
  id: string;
  testid: string;
  /** The page the pin was made on; this document's is `/`. */
  path?: string;
}

/** One `bai=v3.<id>.<anchor>` part, encoded by the real codec. */
async function part(spec: PinSpec): Promise<string> {
  const anchor: AnchorV3 = {
    v: 3,
    s: `[data-testid="${spec.testid}"]`,
    p: spec.path ?? '/',
    tag: 'button',
    txt: spec.testid,
    n: `note for ${spec.testid}`,
  };
  return `bai=v3.${spec.id}.${await encodeAnchor(anchor)}`;
}

/** A pin the reviewer already had in this tab, as the store holds it. */
const storedPin = (
  id: string,
  testid: string,
  over: Partial<SetPin> = {},
): SetPin => {
  const pin: SetPin = {
    id,
    origin: 'pick',
    anchor: { v: 3, s: `[data-testid="${testid}"]`, p: '/', tag: 'button' },
    anchorB64: `PAYLOAD_${id}`,
    label: `Start › ${testid}`,
    appHash: '',
    stack: [],
    note: 'picked here',
    at: '2026-08-31T09:00:00Z',
    pr: 42,
  };
  return Object.assign(pin, over);
};

const seed = (pins: SetPin[]) =>
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ v: 1, pins }));

/** Boot the overlay on `<path>#<hash>`, with react-grab already present. */
async function bootOn(
  hash: string,
  path = '/',
  getStackContext = () =>
    Promise.resolve(`  in CreateButton (at ${ROOT}/${FILE})`),
) {
  window.__REACT_GRAB__ = {
    activate: () => undefined,
    deactivate: () => undefined,
    isActive: () => false,
    registerPlugin: (_plugin: Plugin) => undefined,
    getStackContext,
    getSource: () => Promise.resolve(null),
  } as unknown as ReactGrabAPI;
  vi.stubGlobal('fetch', () =>
    Promise.resolve({ json: () => Promise.resolve({ pr: 42, root: ROOT }) }),
  );
  history.replaceState({}, '', `${path}${hash ? `#${hash}` : ''}`);
  vi.resetModules();
  delete window.__baiReviewOverlay;
  await import('./main.js');
  await ticks(12);
}

beforeEach(() => {
  sessionStorage.clear();
  history.replaceState({}, '', '/');
  document.body.innerHTML = '';
  mount('create');
  mount('cancel');
  mount('deploy');
});

/**
 * The dock row's 🗑 is the only remove control (R6.2). Its rows are rebuilt on
 * every render, so a snapshot goes stale on the first click — take the live
 * head of the list each time.
 */
function tearDownPins() {
  for (let left = MAX_SET_PINS; left > 0; left--) {
    const remove = all('.setdock .row .remove')[0] as
      HTMLButtonElement | undefined;
    if (!remove) return;
    remove.click();
  }
}

afterEach(() => {
  // The layer outlives the module and keeps a MutationObserver on `body` plus
  // a 10 s retry driver; taking every pin down first keeps them from firing
  // into a torn-down jsdom.
  tearDownPins();
  vi.unstubAllGlobals();
  document.querySelector('[data-bai-review-overlay]')?.remove();
  document.body.innerHTML = '';
  delete window.__REACT_GRAB__;
});

describe('opening a link that carries a set', () => {
  it('draws every pin it carries, numbered, and lists them all', async () => {
    const hash = [
      await part({ id: A, testid: 'create' }),
      await part({ id: B, testid: 'cancel' }),
    ].join('&');

    await bootOn(hash);

    expect(storedIds()).toEqual([A, B]);
    expect(dockRows()).toHaveLength(2);
    expect(cards()).toHaveLength(2);
    expect(all('.pin').map((marker) => marker.textContent)).toEqual(['1', '2']);
    expect(toast()).toBe('Added 2 pins from the link');
  });

  // A teardown that halves the set leaves a live layer — MutationObserver and
  // retry driver — running into the next test file.
  it('takes every pin down when the set is torn down', async () => {
    const hash = [
      await part({ id: A, testid: 'create' }),
      await part({ id: B, testid: 'cancel' }),
      await part({ id: 'c_ddddddd', testid: 'deploy' }),
    ].join('&');
    await bootOn(hash);

    tearDownPins();

    expect(storedIds()).toEqual([]);
    expect(all('.card')).toHaveLength(0);
    expect(dockRows()).toHaveLength(0);
  });

  // Opening a link at a pin whose card was tidied away must not land the
  // reviewer on a bare marker: the link is what asked to see it.
  it('brings back the card of the pin it opens on', async () => {
    seed([storedPin(A, 'create', { hidden: true })]);

    await bootOn(await part({ id: A, testid: 'create' }));

    expect(storedPins()[0].hidden).toBeUndefined();
    expect(
      node(`.card[data-pin-id="${A}"]`)?.classList.contains('hidden'),
    ).toBe(false);
  });

  // A reload must not re-apply the link and resurrect a pin just dismissed.
  it('takes the pins out of the address bar and leaves the app’s fragment', async () => {
    const hash = `tab=logs&${await part({ id: A, testid: 'create' })}`;

    await bootOn(hash);

    expect(location.hash).toBe('#tab=logs');
  });

  it('leaves nothing behind when the fragment was only pins', async () => {
    await bootOn(await part({ id: A, testid: 'create' }));

    expect(location.hash).toBe('');
  });

  // The set the tab is building is the truth; a link adds to it.
  it('appends to the set the tab already had, keeping what it held', async () => {
    seed([storedPin(A, 'create')]);
    const hash = await part({ id: B, testid: 'cancel' });

    await bootOn(hash);

    expect(storedIds()).toEqual([A, B]);
    expect(storedPins()[0].origin).toBe('pick');
    expect(storedPins()[0].note).toBe('picked here');
    expect(toast()).toBe('Added 1 pin from the link');
  });

  it('says so when the set already had every pin in the link', async () => {
    seed([storedPin(A, 'create'), storedPin(B, 'cancel')]);
    const hash = [
      await part({ id: A, testid: 'create' }),
      await part({ id: B, testid: 'cancel' }),
    ].join('&');

    await bootOn(hash);

    expect(storedIds()).toEqual([A, B]);
    expect(toast()).toBe('All 2 pins are already in your set');
  });

  // A pasted hash is untrusted: one unreadable part must not cost the others.
  it('keeps the parts it can read and counts the ones it cannot', async () => {
    const hash = [
      await part({ id: A, testid: 'create' }),
      'bai=v3.c_ccccccc.QUJDREVGR0g',
    ].join('&');

    await bootOn(hash);

    expect(storedIds()).toEqual([A]);
    expect(toast()).toBe(
      'Added 1 pin from the link · 1 of 2 pins could not be read',
    );
  });

  // The 31st pin is refused, and one sentence has to say what did not fit.
  it('says what the link brought that the full set could not take', async () => {
    seed(
      Array.from({ length: MAX_SET_PINS }, (_, index) =>
        storedPin(`c_seed${index}`, 'create'),
      ),
    );

    await bootOn(await part({ id: A, testid: 'cancel' }));

    expect(storedIds()).toHaveLength(MAX_SET_PINS);
    expect(storedIds()).not.toContain(A);
    expect(toast()).toBe(`1 did not fit — your set is full at ${MAX_SET_PINS}`);
  });

  // The link is the only carrier of a pin that came off one, so its block has
  // to quote the ⚛️ stack of the element it landed on.
  it('writes the stack it read back into the set', async () => {
    await bootOn(await part({ id: A, testid: 'create' }));

    expect(storedPins()[0].stack.join('\n')).toContain(
      `in CreateButton (at ${FILE})`,
    );
  });

  // The card's ⧉ refuses that same block; the dock must not emit it either.
  it('will not copy the set while a pin’s ⚛️ frames are still unread', async () => {
    await bootOn(
      await part({ id: A, testid: 'create' }),
      '/',
      () => new Promise<string>(() => undefined),
    );

    node<HTMLButtonElement>('.setdock .copyall')?.click();

    expect(toast()).toBe('Still reading a pin — try again');
  });
});

describe('a set that spans pages', () => {
  const spread = async () =>
    [
      await part({ id: A, testid: 'create' }),
      await part({ id: B, testid: 'deploy', path: '/start' }),
    ].join('&');

  it('draws what is here and leaves the rest to the dock', async () => {
    await bootOn(await spread());

    expect(storedIds()).toEqual([A, B]);
    expect(cards()).toHaveLength(1);
    expect(cards()[0].dataset.pinId).toBe(A);
    expect(dockRows()).toHaveLength(2);
    const away = dockRows()[1];
    expect(away.classList.contains('away')).toBe(true);
    expect(away.querySelector('.where')?.textContent).toBe('/start');
  });

  // The glyph is the pin's place in the SET, not in what this page can draw.
  it('numbers an on-page pin by its place in the whole set', async () => {
    const hash = [
      await part({ id: A, testid: 'create', path: '/start' }),
      await part({ id: B, testid: 'cancel' }),
    ].join('&');

    await bootOn(hash);

    expect(all('.pin.found').map((marker) => marker.textContent)).toEqual([
      '2',
    ]);
    expect(node('.card.found .count')?.textContent).toBe('2 / 2');
  });

  // Only the page the app is on publishes a route label, so a pin from another
  // page can be named at all only by the label it was stamped with.
  it('names an off-page pin by the route its own label leads with', async () => {
    seed([
      storedPin(A, 'create', {
        anchor: {
          v: 3,
          s: '[data-testid="create"]',
          p: '/project/a한국어가능_cde/start',
          tag: 'button',
        },
        label: 'Start › page-start › button "Create"',
      }),
    ]);

    await bootOn('');

    const away = dockRows()[0];
    expect(away.classList.contains('away')).toBe(true);
    expect(away.querySelector('.where')?.textContent).toBe('Start');
  });

  // The row is the only thing an off-page pin has, and "/" is not a difference.
  it('names the missing query on a pin whose page differs only by it', async () => {
    seed([storedPin(A, 'create')]);

    await bootOn('', '/?tab=logs');

    const away = dockRows()[0];
    expect(away.classList.contains('away')).toBe(true);
    expect(away.querySelector('.where')?.textContent).toBe('no query');
  });

  // The reader's own fragment belongs to the page they are standing on: the
  // set has to reopen on the tab its focus pin was made on.
  it('opens the set on the focus pin’s own app fragment', async () => {
    seed([
      storedPin(A, 'create', {
        anchor: { v: 3, s: '[data-testid="create"]', p: '/start' },
        appHash: 'tab=logs',
      }),
    ]);

    await bootOn(
      `env=dev&${await part({ id: A, testid: 'create', path: '/start' })}`,
      '/elsewhere',
    );

    expect(sessionStorage.getItem(APPLIED_KEY) ?? '').toContain(
      `/start#tab=logs&bai=v3.${A}.`,
    );
  });

  it('hands the focus pin over to the page the go button opens', async () => {
    await bootOn(await spread());

    dockRows()[1].querySelector<HTMLButtonElement>('.go')?.click();

    expect(sessionStorage.getItem(FOCUS_KEY)).toBe(B);
  });

  /**
   * R7.1: an off-page row is a real link. The platform already has both
   * intents — this tab, or a new one — so we intercept only the plain click
   * and leave ⌘/Ctrl-click, middle-click and "copy link address" alone.
   */
  describe('the link an off-page row is', () => {
    const awayLink = () =>
      dockRows()[1].querySelector<HTMLAnchorElement>('a.rowlabel') as
        HTMLAnchorElement | undefined;

    it('carries the whole set behind an absolute href', async () => {
      await bootOn(await spread());

      const href = awayLink()?.getAttribute('href') ?? '';
      expect(href.startsWith(`${location.origin}/start#`)).toBe(true);
      expect(href).toContain(`bai=v3.${A}.`);
      expect(href).toContain(`bai=v3.${B}.`);
      expect(dockRows()[1].querySelector<HTMLAnchorElement>('a.go')?.href).toBe(
        href,
      );
    });

    it('keeps a plain click in this tab', async () => {
      await bootOn(await spread());
      const evt = new MouseEvent('click', { bubbles: true, cancelable: true });

      awayLink()?.dispatchEvent(evt);

      expect(evt.defaultPrevented).toBe(true);
      expect(sessionStorage.getItem(FOCUS_KEY)).toBe(B);
    });

    it('lets a modifier or middle click reach the browser', async () => {
      await bootOn(await spread());

      for (const init of [
        { metaKey: true },
        { ctrlKey: true },
        { shiftKey: true },
        { altKey: true },
        { button: 1 },
      ]) {
        const evt = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          ...init,
        });
        awayLink()?.dispatchEvent(evt);
        expect(evt.defaultPrevented).toBe(false);
      }
      expect(sessionStorage.getItem(FOCUS_KEY)).toBeNull();
    });
  });

  /**
   * R7.4: "N of M pins are not on this page" answered two different questions
   * with one sentence. Another page is opened from the list; this page with no
   * element yet is waiting, and will draw itself when the element appears.
   */
  describe('what the set says about the pins it cannot draw', () => {
    it('names the pins that are on other pages', async () => {
      await bootOn(await spread());

      expect(toast()).toBe(
        'Added 2 pins from the link · ' +
          '1 pin is on another page — open it from the list',
      );
    });

    it('says what a waiting pin was inside', async () => {
      seed([
        storedPin(A, 'create', {
          anchor: { v: 3, s: '[data-testid="gone"]', p: '/', tid: 'gone' },
        }),
      ]);

      await bootOn('');
      await ticks(LADDER_TICKS, 500);

      expect(toast()).toBe(
        '1 pin is waiting for its element (it was inside gone)',
      );
    }, 30_000);

    // Two different facts arrive at two different moments: the page a pin is
    // on is known at once, that its element never turned up is not.
    it('says each in its own moment when the set is spread both ways', async () => {
      seed([
        storedPin(A, 'create', {
          anchor: { v: 3, s: '[data-testid="gone"]', p: '/', tid: 'gone' },
        }),
        storedPin(B, 'deploy', {
          anchor: { v: 3, s: '[data-testid="gone2"]', p: '/', tid: 'gone2' },
        }),
        storedPin('c_c', 'create', {
          anchor: { v: 3, s: '[data-testid="create"]', p: '/start' },
          label: 'Start › create',
        }),
      ]);

      await bootOn('');
      expect(toast()).toBe('1 pin is on another page — open it from the list');

      await ticks(LADDER_TICKS, 500);

      expect(toast()).toBe(
        '2 pins are waiting for their elements — the list says where',
      );
    }, 30_000);
  });

  /**
   * R7.3: the row of a pin whose element is not rendered re-runs ITS resolve.
   * A link's arrival leaves the layer with a focus pin, so re-running the whole
   * layer would scroll the page to a pin the reviewer did not click.
   */
  it('re-resolves the clicked pin alone, scrolling nothing', async () => {
    const hash = [
      await part({ id: A, testid: 'create' }),
      await part({ id: B, testid: 'gone' }),
    ].join('&');
    await bootOn(hash);
    const scrolled: string[] = [];
    for (const testid of ['create', 'cancel', 'deploy']) {
      const element = document.querySelector<HTMLElement>(
        `[data-testid="${testid}"]`,
      ) as HTMLElement;
      element.scrollIntoView = () => scrolled.push(testid);
    }

    dockRows()[1].querySelector<HTMLButtonElement>('.rowlabel')?.click();

    expect(scrolled).toEqual([]);
    expect(toast()).toBe(
      '1 pin is waiting for its element (it was inside button "gone")',
    );
  });

  /**
   * R7.4 says the line on arrival and after a re-partition. The app writes its
   * own fragment — its "Skip to content" link is one — and that moves nothing.
   */
  describe('repeating the off-page line', () => {
    it('stays quiet when only the app’s own fragment changed', async () => {
      await bootOn(await spread());
      expect(toast()).toContain('1 pin is on another page');
      const banner = node('.toast') as HTMLElement;
      banner.textContent = '';

      history.replaceState({}, '', '/#astryx-app-shell-main');
      window.dispatchEvent(new Event('hashchange'));
      await ticks(4);

      expect(banner.textContent).toBe('');
    });

    it('says it again when a navigation moved a pin off the page', async () => {
      await bootOn(await spread());
      const banner = node('.toast') as HTMLElement;
      banner.textContent = '';

      history.pushState({}, '', '/start');
      await ticks(4);

      expect(banner.textContent).toBe(
        '1 pin is on another page — open it from the list',
      );
    });
  });

  // Arriving on pin 2's page must not bounce the reviewer back to pin 1's.
  it('stays put while any member of the set is on this page', async () => {
    await bootOn(await spread());

    expect(sessionStorage.getItem(APPLIED_KEY)).toBeNull();
  });

  it('opens on the focus pin’s page when none of the set is here', async () => {
    const hash = await spread();

    await bootOn(hash, '/elsewhere');

    const applied = sessionStorage.getItem(APPLIED_KEY) ?? '';
    expect(applied.startsWith(`${A} /#bai=v3.${A}.`)).toBe(true);
    // The whole set travels, whichever page it opens on.
    expect(applied).toContain(`&bai=v3.${B}.`);
  });

  // An SPA navigation does not reload, so nothing else would re-partition.
  it('re-partitions when the app navigates', async () => {
    await bootOn(await spread());

    history.pushState({}, '', '/start');
    await ticks(4);

    expect(cards()).toHaveLength(1);
    expect(cards()[0].dataset.pinId).toBe(B);
    expect(dockRows()[0].classList.contains('away')).toBe(true);
  });
});

describe('the focus pin', () => {
  const twoHere = async () =>
    [
      await part({ id: A, testid: 'create' }),
      await part({ id: B, testid: 'cancel' }),
    ].join('&');

  // A "go" re-opens the set it just persisted; calling those duplicates would
  // report an action the reviewer never took.
  it('says nothing about duplicates when a go re-opened the set', async () => {
    seed([storedPin(A, 'create'), storedPin(B, 'cancel')]);
    sessionStorage.setItem(FOCUS_KEY, B);

    await bootOn(await twoHere());

    expect(storedIds()).toEqual([A, B]);
    expect(toast()).toBe('');
  });

  it('is the head of the set by default', async () => {
    await bootOn(await twoHere());

    expect(node('.pin.pulse')?.dataset.pinId).toBe(A);
  });

  // What the dock's go button wrote before it reloaded the document.
  it('is the id a go handed over, not the first pin', async () => {
    const hash = await twoHere();
    sessionStorage.setItem(FOCUS_KEY, B);

    await bootOn(hash);

    expect(node('.pin.pulse')?.dataset.pinId).toBe(B);
    // One-shot: the next link opened in this tab focuses its own pin.
    expect(sessionStorage.getItem(FOCUS_KEY)).toBeNull();
  });
});
