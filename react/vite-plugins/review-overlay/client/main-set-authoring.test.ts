/**
 * Authoring a pin set (FR-3858), end to end through `main.ts`: pick, note,
 * ⌘⏎ — and the pin stays, so the next ⌘⏎ copies every pin so far as one
 * comment behind one link. Only `main.ts` composes the store, the composer,
 * the layer and the dock, so this is where the flow can be asserted at all.
 */
import { DRAFT_KEY, MAX_SET_PINS } from './draft.js';
import type { SetPin } from './types.js';
import type { Plugin, ReactGrabAPI } from 'react-grab';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const ROOT = '/home/driver/Workspace/backend.ai-webui';
const FILE = 'react/src/components/CreateButton.tsx';

let plugin: Plugin | null = null;

const shadow = () =>
  document.querySelector('[data-bai-review-overlay]')?.shadowRoot as ShadowRoot;
const node = <T extends HTMLElement>(selector: string) =>
  shadow()?.querySelector<T>(selector) as T;
const all = (selector: string) =>
  Array.from(shadow()?.querySelectorAll<HTMLElement>(selector) ?? []);

const textarea = () => node<HTMLTextAreaElement>('.compose textarea');
const copyButton = () => node<HTMLButtonElement>('[data-act="copy"]');
const toast = () => node('.toast')?.textContent ?? '';
const dockRows = () => all('.setdock .row');
const composeOpen = () => node('.compose').style.display === 'block';
const storedSet = (): { pins: SetPin[]; cardsHidden?: true } => {
  const raw = sessionStorage.getItem(DRAFT_KEY);
  return raw
    ? (JSON.parse(raw) as { pins: SetPin[]; cardsHidden?: true })
    : { pins: [] };
};
const storedPins = (): SetPin[] => storedSet().pins;
const storedIds = (): string[] => storedPins().map((pin) => pin.id);
const hiddenCard = (id: string) =>
  node(`.card[data-pin-id="${id}"]`).classList.contains('hidden');

const ticks = async (count: number, ms = 10) => {
  for (let i = 0; i < count; i++) {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
};

/** jsdom has no editing host: `execCommand` never fires its own copy event. */
function stubExecCommand(ok = true): Record<string, string> {
  const written: Record<string, string> = {};
  document.execCommand = vi.fn(() => {
    const evt = new Event('copy', { bubbles: true, cancelable: true });
    Object.defineProperty(evt, 'clipboardData', {
      value: {
        setData: (type: string, value: string) => {
          written[type] = value;
        },
      },
    });
    document.dispatchEvent(evt);
    return ok;
  });
  return written;
}

function mount(testid: string, text: string) {
  document.body.insertAdjacentHTML(
    'beforeend',
    `<button data-testid="${testid}">${text}</button>`,
  );
}

/** Boot the overlay with react-grab present, on a page with no link. */
async function bootOverlay() {
  window.__REACT_GRAB__ = {
    activate: () => undefined,
    deactivate: () => undefined,
    isActive: () => false,
    registerPlugin: (next: Plugin) => {
      plugin = next;
    },
    getStackContext: () =>
      Promise.resolve(`  in CreateButton (at ${ROOT}/${FILE})`),
    getSource: () => Promise.resolve(null),
  } as unknown as ReactGrabAPI;
  vi.stubGlobal('fetch', () =>
    Promise.resolve({ json: () => Promise.resolve({ pr: 42, root: ROOT }) }),
  );
  vi.resetModules();
  delete window.__baiReviewOverlay;
  await import('./main.js');
  await ticks(4);
}

/** react-grab's own hook is the pick: the composer opens a tick later. */
async function pick(testid: string, note: string) {
  const element = document.querySelector(
    `[data-testid="${testid}"]`,
  ) as Element;
  plugin?.hooks?.onElementSelect?.(element);
  await ticks(6);
  textarea().value = note;
  textarea().dispatchEvent(new Event('input'));
  // The note debounce, then the anchor re-encode it starts.
  await ticks(6, 100);
}

const pressCopy = () =>
  textarea().dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 'Enter',
      metaKey: true,
      bubbles: true,
    }),
  );

/** Both modifiers: the platform one is whichever this environment reports. */
const pressCardsChord = () =>
  document.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 'H',
      code: 'KeyH',
      shiftKey: true,
      metaKey: true,
      ctrlKey: true,
      bubbles: true,
    }),
  );

const pressEscape = () =>
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
  );

async function pickAndCopy(testid: string, note: string) {
  await pick(testid, note);
  pressCopy();
  await ticks(2);
}

const storedPin = (id: string, testid: string, label: string): SetPin => ({
  id,
  origin: 'pick',
  anchor: { v: 3, s: `[data-testid="${testid}"]`, p: '/', tag: 'button' },
  anchorB64: `PAYLOAD_${id}`,
  label,
  appHash: '',
  stack: [],
  at: '2026-08-31T09:00:00Z',
  pr: 42,
});

const LETTERS = 'abcdefghijklmnopqrstuvwxyz';
/** A distinct WELL-FORMED id per index — base32 is `a`-`z` and `2`-`7`. */
const nthId = (i: number) =>
  `c_s${LETTERS[i % 26]}${LETTERS[Math.floor(i / 26)]}aaaa`;

const seed = (pins: SetPin[]) =>
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ v: 1, pins }));

beforeEach(() => {
  plugin = null;
  sessionStorage.clear();
  history.replaceState({}, '', '/');
  document.body.innerHTML = '';
  mount('create', 'Create');
  mount('cancel', 'Cancel');
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
  // A secure-context run is one test's business, never the next one's.
  Reflect.deleteProperty(navigator, 'clipboard');
  document.querySelector('[data-bai-review-overlay]')?.remove();
  document.body.innerHTML = '';
  delete window.__REACT_GRAB__;
});

describe('the first pin of a set', () => {
  it('copies the block the overlay has always copied', async () => {
    await bootOverlay();
    const written = stubExecCommand();

    await pickAndCopy('create', 'The label is cut off.');

    const id = storedIds()[0];
    const lines = written['text/plain'].split('\n');
    expect(lines.slice(0, 4)).toEqual([
      'The label is cut off.',
      '',
      `> 📍 **/ › create › button "Create"** · \`${id}\``,
      `> ⚛️ in CreateButton (at ${FILE})`,
    ]);
    // `at` is this copy's own instant; the id is what carries the identity.
    expect(
      lines[4].startsWith(
        `> [Open on dev server](${location.origin}/#bai=v3.${id}.`,
      ),
    ).toBe(true);
    expect(lines[5]).toContain(`<!-- bai-review v3 id=${id} pr=42 at=`);
    expect(toast()).toContain('Copied — paste it');
  });

  // The pick used to be thrown away the moment the composer closed.
  it('keeps the pin on screen and in the set', async () => {
    await bootOverlay();
    stubExecCommand();

    await pickAndCopy('create', 'The label is cut off.');

    expect(storedIds()).toHaveLength(1);
    expect(dockRows()).toHaveLength(1);
    expect(node('.setdock').classList.contains('shown')).toBe(true);
    expect(node('.card').classList.contains('found')).toBe(true);
    expect(composeOpen()).toBe(false);
  });

  it('says what the next ⌘⏎ will do', async () => {
    await bootOverlay();
    stubExecCommand();
    expect(copyButton().textContent).toBe('Copy block');

    await pickAndCopy('create', 'The label is cut off.');

    expect(copyButton().textContent).toBe('Add & copy all (2)');
  });
});

describe('adding to a set', () => {
  it('copies every pin so far, behind its own link and one set link', async () => {
    await bootOverlay();
    stubExecCommand();
    await pickAndCopy('create', 'The label is cut off.');
    const written = stubExecCommand();

    await pickAndCopy('cancel', 'And this one is unreachable.');

    const text = written['text/plain'];
    expect(text.split('📍')).toHaveLength(3);
    expect(text).toContain('The label is cut off.');
    expect(text).toContain('And this one is unreachable.');
    // One link per block carrying that pin alone, then one carrying both —
    // repeating the set's URL in every block made the comment grow as N².
    const urls = [...text.matchAll(/\(http[^)]+\)/g)].map((m) => m[0]);
    expect(urls).toHaveLength(3);
    expect(new Set(urls).size).toBe(3);
    const ids = storedIds();
    ids.forEach((id, i) => {
      expect(urls[i].split('bai=v3.')).toHaveLength(2);
      expect(urls[i]).toContain(id);
    });
    const setUrl = urls[urls.length - 1];
    expect(setUrl.split('bai=v3.')).toHaveLength(3);
    for (const id of ids) expect(setUrl).toContain(id);
    expect(text).toContain(`[Open all 2 pins on dev server]${setUrl}`);
    expect(toast()).toBe('Copied all 2 pins — replaces your last paste');
  });

  it('draws the whole set, numbered', async () => {
    await bootOverlay();
    stubExecCommand();
    await pickAndCopy('create', 'one');

    await pickAndCopy('cancel', 'two');

    expect(storedIds()).toHaveLength(2);
    expect(dockRows()).toHaveLength(2);
    expect(all('.pin').map((marker) => marker.textContent)).toEqual(['1', '2']);
  });

  // The clipboard is the whole point: a pin that was never handed over must
  // not be in the set the next copy claims to have written.
  it('adds nothing when the clipboard write fails', async () => {
    await bootOverlay();
    stubExecCommand();
    await pickAndCopy('create', 'one');
    stubExecCommand(false);

    await pickAndCopy('cancel', 'two');

    expect(storedIds()).toHaveLength(1);
    expect(dockRows()).toHaveLength(1);
    // The note is still in the box, for the ⌘⏎ that retries it.
    expect(composeOpen()).toBe(true);
    expect(textarea().value).toBe('two');
  });

  /**
   * A secure-context dev run gets `navigator.clipboard`, and its write lands
   * a tick later — long enough for the composer to be gone by then.
   */
  it('commits the pin the copy actually wrote, whatever closed meanwhile', async () => {
    await bootOverlay();
    let landed: () => void = () => undefined;
    const writeText = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          landed = resolve;
        }),
    );
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
    Object.defineProperty(window, 'isSecureContext', {
      value: true,
      configurable: true,
    });

    await pick('create', 'one');
    pressCopy();
    // A second ⌘⏎ would build a second pin for the same pick.
    pressCopy();
    await ticks(1);
    expect(storedIds()).toHaveLength(0);
    pressEscape();
    landed();
    await ticks(2);

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(storedIds()).toHaveLength(1);
    expect(dockRows()).toHaveLength(1);
  });

  /**
   * The write settles long after the composer it ran from is gone, and the
   * reviewer is by then typing into the next pick.
   */
  it('never closes a composer opened after the copy it settles for', async () => {
    await bootOverlay();
    let landed: () => void = () => undefined;
    const writeText = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          landed = resolve;
        }),
    );
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
    Object.defineProperty(window, 'isSecureContext', {
      value: true,
      configurable: true,
    });

    await pick('create', 'one');
    pressCopy();
    await ticks(1);
    pressEscape();
    await pick('cancel', 'two');
    landed();
    await ticks(2);

    expect(composeOpen()).toBe(true);
    expect(textarea().value).toBe('two');
    // The first pick still joined the set: closing did not cancel its write.
    expect(storedIds()).toHaveLength(1);
  });

  it('refuses the pin that would overflow the set', async () => {
    seed(
      Array.from({ length: 30 }, (_, i) =>
        storedPin(nthId(i), 'create', `Start › ${i}`),
      ),
    );
    await bootOverlay();
    const written = stubExecCommand();

    await pickAndCopy('create', 'one too many');

    expect(written['text/plain']).toBeUndefined();
    expect(toast()).toContain('full at 30 pins');
    expect(storedIds()).toHaveLength(30);
    expect(composeOpen()).toBe(true);
  });

  it('says the set is full on the button, before the ⌘⏎', async () => {
    seed(
      Array.from({ length: 30 }, (_, i) =>
        storedPin(nthId(i), 'create', `Start › ${i}`),
      ),
    );
    await bootOverlay();
    stubExecCommand();

    await pick('create', 'one too many');

    expect(copyButton().textContent).toBe('Set is full (30)');
    expect(copyButton().disabled).toBe(true);
  });
});

describe('the set the tab was left with', () => {
  it('is drawn and listed again at boot', async () => {
    seed([
      storedPin('c_keptaaa', 'create', 'Start › create › button "Create"'),
    ]);

    await bootOverlay();
    await ticks(4);

    expect(dockRows()).toHaveLength(1);
    expect(node('.setdock .rowlabel').textContent).toBe(
      'Start › create › button "Create"',
    );
    expect(node('.card').classList.contains('found')).toBe(true);
  });

  // The dock's ⧉ is the set; a card is where the reviewer points at one thing.
  it('copies one pin, and only that one, from its own card', async () => {
    seed([
      storedPin('c_oneaaaa', 'create', 'Start › create'),
      storedPin('c_twoaaaa', 'cancel', 'Start › cancel'),
    ]);
    await bootOverlay();
    await ticks(2);
    const written = stubExecCommand();

    node<HTMLButtonElement>('.card[data-pin-id="c_twoaaaa"] .copyall').click();

    const text = written['text/plain'];
    expect(text.split('📍')).toHaveLength(2);
    expect(text).toContain('Start › cancel');
    expect(text).not.toContain('Start › create');
    const urls = [...text.matchAll(/\(http[^)]+\)/g)].map((m) => m[0]);
    expect(urls).toHaveLength(1);
    expect(urls[0]).toContain('c_twoaaaa');
    expect(urls[0].split('bai=v3.')).toHaveLength(2);
    expect(toast()).toBe('Copied 1 pin');
  });

  it('copies from the dock, from one click', async () => {
    seed([
      storedPin('c_oneaaaa', 'create', 'Start › create'),
      storedPin('c_twoaaaa', 'cancel', 'Start › cancel'),
    ]);
    await bootOverlay();
    const written = stubExecCommand();

    node<HTMLButtonElement>('.setdock .copyall').click();

    expect(written['text/plain'].split('📍')).toHaveLength(3);
    expect(toast()).toBe('Copied all 2 pins — replaces your last paste');
  });

  // R6.2: the card's 🗑 sat 20px from ⧉, so reaching for copy ended the pin.
  // The dock row is the one place a pin can be removed from now.
  it('drops one pin when its row’s 🗑 is pressed', async () => {
    seed([
      storedPin('c_oneaaaa', 'create', 'Start › create'),
      storedPin('c_twoaaaa', 'cancel', 'Start › cancel'),
    ]);
    await bootOverlay();
    await ticks(2);

    expect(all('.card .remove')).toHaveLength(0);
    node<HTMLButtonElement>(
      '.setdock .row[data-pin-id="c_oneaaaa"] .remove',
    ).click();

    expect(storedIds()).toEqual(['c_twoaaaa']);
    expect(dockRows()).toHaveLength(1);
    expect(copyButton().textContent).toBe('Add & copy all (2)');
    expect(toast()).toBe('Removed pin 1 of 2');
  });

  // ✕ is about the card being in the way of the thing under it, and the
  // reviewer should not lose a pin by tidying the screen.
  it('only puts the card away when its ✕ is pressed, and remembers', async () => {
    seed([
      storedPin('c_oneaaaa', 'create', 'Start › create'),
      storedPin('c_twoaaaa', 'cancel', 'Start › cancel'),
    ]);
    await bootOverlay();
    await ticks(2);

    node<HTMLButtonElement>('.card[data-pin-id="c_oneaaaa"] .close').click();

    expect(storedIds()).toEqual(['c_oneaaaa', 'c_twoaaaa']);
    expect(storedPins()[0].hidden).toBe(true);
    expect(hiddenCard('c_oneaaaa')).toBe(true);
    expect(hiddenCard('c_twoaaaa')).toBe(false);
    // The marker is what still says where the pin is.
    expect(
      node('.pin[data-pin-id="c_oneaaaa"]').classList.contains('found'),
    ).toBe(true);
    expect(dockRows()[0].classList.contains('off')).toBe(true);
  });

  it('draws a hidden pin’s card again from its dock row', async () => {
    seed([
      { ...storedPin('c_oneaaaa', 'create', 'Start › create'), hidden: true },
    ]);
    await bootOverlay();
    await ticks(2);
    expect(hiddenCard('c_oneaaaa')).toBe(true);

    node<HTMLButtonElement>('.setdock .row .unhide').click();

    expect(hiddenCard('c_oneaaaa')).toBe(false);
    expect(storedPins()[0].hidden).toBeUndefined();
  });

  it('removes the pin the row’s 🗑 names, and renumbers the rest', async () => {
    seed([
      storedPin('c_oneaaaa', 'create', 'Start › create'),
      storedPin('c_twoaaaa', 'cancel', 'Start › cancel'),
    ]);
    await bootOverlay();
    await ticks(2);

    node<HTMLButtonElement>('.setdock .row .remove').click();

    expect(storedIds()).toEqual(['c_twoaaaa']);
    expect(toast()).toBe('Removed pin 1 of 2');
    expect(all('.setdock .idx').map((idx) => idx.textContent)).toEqual(['1']);
  });

  // The marker is the only thing that says which of them is meant.
  it('scrolls to the pin the row names and beats its marker again', async () => {
    seed([storedPin('c_oneaaaa', 'create', 'Start › create')]);
    const scrolled: string[] = [];
    (
      document.querySelector('[data-testid="create"]') as HTMLElement
    ).scrollIntoView = () => {
      scrolled.push('create');
    };
    await bootOverlay();
    await ticks(2);
    const marker = node('.pin[data-pin-id="c_oneaaaa"]');
    marker.classList.remove('pulse');

    node<HTMLButtonElement>('.setdock .rowlabel').click();

    expect(scrolled).toEqual(['create']);
    expect(marker.classList.contains('pulse')).toBe(true);
  });

  // Nothing about hiding a card changes what can be resolved, and re-running
  // the ladder re-toasts its 10 s give-up line once per flip.
  it('does not re-run the resolution ladder to hide a card', async () => {
    seed([
      storedPin('c_oneaaaa', 'create', 'Start › create'),
      storedPin('c_goneaaa', 'missing', 'Start › missing'),
    ]);
    await bootOverlay();
    await ticks(2);
    const scan = vi.spyOn(document, 'querySelector');

    node<HTMLButtonElement>('.setdock .cards').click();
    node<HTMLButtonElement>('.card[data-pin-id="c_oneaaaa"] .close').click();

    expect(
      scan.mock.calls.filter(([selector]) =>
        String(selector).includes('missing'),
      ),
    ).toEqual([]);
    expect(hiddenCard('c_oneaaaa')).toBe(true);
    scan.mockRestore();
  });

  /**
   * R7.2/R7.3: the element is not rendered right now — a closed modal — which
   * is a different thing from gone, and the row is what has to say so.
   */
  it('dims the row of a pin whose element is not on the page', async () => {
    seed([
      {
        ...storedPin('c_goneaaa', 'missing', 'Start › missing'),
        anchor: { v: 3, s: '[data-testid="missing"]', p: '/', tid: 'missing' },
      },
    ]);
    await bootOverlay();
    await ticks(2);

    expect(dockRows()[0].classList.contains('waiting')).toBe(true);
    expect(dockRows()[0].querySelector('.where')?.textContent).toBe(
      'waiting — missing',
    );

    mount('missing', 'Missing');
    await ticks(60);

    expect(dockRows()[0].classList.contains('waiting')).toBe(false);
    expect(dockRows()[0].querySelector('.where')).toBeNull();
  });

  // A teardown that halves the set leaves a live layer — MutationObserver and
  // retry driver — running into the next test file.
  it('takes every pin down when the set is torn down', async () => {
    seed([
      storedPin('c_oneaaaa', 'create', 'Start › create'),
      storedPin('c_twoaaaa', 'cancel', 'Start › cancel'),
      storedPin('c_threeaa', 'create', 'Start › create'),
    ]);
    await bootOverlay();
    await ticks(2);

    tearDownPins();

    expect(storedIds()).toEqual([]);
    expect(all('.card')).toHaveLength(0);
    expect(dockRows()).toHaveLength(0);
  });

  describe('the cards switch', () => {
    beforeEach(async () => {
      seed([
        storedPin('c_oneaaaa', 'create', 'Start › create'),
        storedPin('c_twoaaaa', 'cancel', 'Start › cancel'),
      ]);
      await bootOverlay();
      await ticks(2);
    });

    it('takes every card off the page from the dock, and remembers', () => {
      node<HTMLButtonElement>('.setdock .cards').click();

      expect(hiddenCard('c_oneaaaa')).toBe(true);
      expect(hiddenCard('c_twoaaaa')).toBe(true);
      expect(storedSet().cardsHidden).toBe(true);
      expect(
        node('.pin[data-pin-id="c_oneaaaa"]').classList.contains('found'),
      ).toBe(true);

      node<HTMLButtonElement>('.setdock .cards').click();
      expect(hiddenCard('c_oneaaaa')).toBe(false);
      expect(storedSet().cardsHidden).toBeUndefined();
    });

    it('flips from the chord too', () => {
      pressCardsChord();

      expect(hiddenCard('c_oneaaaa')).toBe(true);

      pressCardsChord();
      expect(hiddenCard('c_oneaaaa')).toBe(false);
    });

    // Every key belongs to the note while one is being typed.
    it('ignores the chord while the composer has the keyboard', async () => {
      await pick('cancel', 'typing an h in here');

      pressCardsChord();

      expect(hiddenCard('c_oneaaaa')).toBe(false);
    });

    // The switch is about the cards; the composer is how the next pin is made.
    it('leaves the composer visible whatever the switch says', async () => {
      node<HTMLButtonElement>('.setdock .cards').click();

      await pick('cancel', 'still authoring');

      expect(composeOpen()).toBe(true);
    });
  });

  // The dock is 260px of chrome over the app; the next pick has to reach
  // whatever is under it, the same way it reaches under a card.
  it('folds the dock away while the next pick is being composed', async () => {
    seed([storedPin('c_oneaaaa', 'create', 'Start › create')]);
    await bootOverlay();
    await ticks(2);
    expect(node('.setdock').classList.contains('folded')).toBe(false);

    await pick('cancel', 'two');
    expect(node('.setdock').classList.contains('folded')).toBe(true);

    pressEscape();

    expect(node('.setdock').classList.contains('folded')).toBe(false);
  });

  // The dock is the one control that reaches every pin, including the ones
  // the layer never found. R7.3: waiting is not gone, so the row says where
  // the element was rather than that the pin missed the page.
  it('says where a pin it cannot reach was', async () => {
    seed([
      {
        ...storedPin('c_goneaaa', 'missing', 'Start › missing'),
        anchor: { v: 3, s: '[data-testid="missing"]', p: '/', tid: 'missing' },
      },
    ]);
    await bootOverlay();
    await ticks(2);

    node<HTMLButtonElement>('.setdock .rowlabel').click();

    expect(toast()).toBe(
      '1 pin is waiting for its element (it was inside missing)',
    );
  });

  it('ends the set once the dock asks twice', async () => {
    seed([storedPin('c_oneaaaa', 'create', 'Start › create')]);
    await bootOverlay();
    await ticks(2);

    node<HTMLButtonElement>('.setdock .clear').click();
    expect(storedIds()).toEqual(['c_oneaaaa']);
    node<HTMLButtonElement>('.setdock .yes').click();

    expect(sessionStorage.getItem(DRAFT_KEY)).toBeNull();
    expect(node('.setdock').classList.contains('shown')).toBe(false);
    expect(all('.card.found')).toHaveLength(0);
  });
});

/**
 * R5.5. The switch is hide-all / SHOW-all, not suspend-and-restore: a reviewer
 * who presses "show" expects to see everything, not everything except what
 * they hid one card at a time.
 */
describe('the cards switch as show-all', () => {
  const cardsSwitch = () => node<HTMLButtonElement>('.setdock .cards');

  it('shows every card again, including the ones hidden one by one', async () => {
    mount('save', 'Save');
    seed([
      { ...storedPin('c_oneaaaa', 'create', 'Start › create'), hidden: true },
      storedPin('c_twoaaaa', 'cancel', 'Start › cancel'),
      { ...storedPin('c_threeaa', 'save', 'Start › save'), hidden: true },
    ]);
    await bootOverlay();
    await ticks(2);
    expect(hiddenCard('c_oneaaaa')).toBe(true);
    expect(hiddenCard('c_threeaa')).toBe(true);

    cardsSwitch().click();
    cardsSwitch().click();

    expect(hiddenCard('c_oneaaaa')).toBe(false);
    expect(hiddenCard('c_twoaaaa')).toBe(false);
    expect(hiddenCard('c_threeaa')).toBe(false);
    expect(storedPins().some((pin) => pin.hidden)).toBe(false);
  });

  /**
   * R8.3. The row's reveal while the switch is on means "that one, alone":
   * the switch goes off and the rest take the per-pin flag, so no card is
   * shown in spite of the switch.
   */
  it('reveals one card alone, and the switch still brings them all back', async () => {
    mount('save', 'Save');
    seed([
      storedPin('c_one', 'create', 'Start › create'),
      storedPin('c_two', 'cancel', 'Start › cancel'),
      storedPin('c_three', 'save', 'Start › save'),
    ]);
    await bootOverlay();
    await ticks(2);
    cardsSwitch().click();
    expect(hiddenCard('c_two')).toBe(true);

    node<HTMLButtonElement>(
      '.setdock .row[data-pin-id="c_two"] .unhide',
    ).click();

    expect(hiddenCard('c_one')).toBe(true);
    expect(hiddenCard('c_two')).toBe(false);
    expect(hiddenCard('c_three')).toBe(true);
    expect(storedSet().cardsHidden).toBeUndefined();
    expect(storedPins().map((pin) => pin.hidden)).toEqual([
      true,
      undefined,
      true,
    ]);

    cardsSwitch().click();
    cardsSwitch().click();

    expect(storedPins().some((pin) => pin.hidden)).toBe(false);
    expect(hiddenCard('c_one')).toBe(false);
    expect(hiddenCard('c_three')).toBe(false);
  });

  // Off is not "remember what was hidden and hide everything else".
  it('leaves the per-pin flags alone on the way off', async () => {
    seed([
      { ...storedPin('c_oneaaaa', 'create', 'Start › create'), hidden: true },
      storedPin('c_twoaaaa', 'cancel', 'Start › cancel'),
    ]);
    await bootOverlay();
    await ticks(2);

    cardsSwitch().click();

    expect(storedPins()[0].hidden).toBe(true);
  });
});
