/**
 * Authoring a pin set (FR-3858), end to end through `main.ts`: pick, note,
 * ⌘⏎ — and the pin stays, so the next ⌘⏎ copies every pin so far as one
 * comment behind one link. Only `main.ts` composes the store, the composer,
 * the layer and the dock, so this is where the flow can be asserted at all.
 */
import { DRAFT_KEY } from './draft.js';
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
const storedIds = (): string[] => {
  const raw = sessionStorage.getItem(DRAFT_KEY);
  return raw
    ? (JSON.parse(raw) as { pins: SetPin[] }).pins.map((p) => p.id)
    : [];
};

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

afterEach(() => {
  // The layer outlives the module and keeps a MutationObserver on `body`;
  // taking every pin down first keeps it from firing into a torn-down jsdom.
  for (const close of all('.card .close')) close.click();
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
    expect(copyButton().textContent).toBe('📋 Copy block');

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

  it('refuses the pin that would overflow the set', async () => {
    seed(
      Array.from({ length: 30 }, (_, i) =>
        storedPin(`c_seed${i}`, 'create', `Start › ${i}`),
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
        storedPin(`c_seed${i}`, 'create', `Start › ${i}`),
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
    seed([storedPin('c_kept', 'create', 'Start › create › button "Create"')]);

    await bootOverlay();
    await ticks(4);

    expect(dockRows()).toHaveLength(1);
    expect(node('.setdock .rowlabel').textContent).toBe(
      'Start › create › button "Create"',
    );
    expect(node('.card').classList.contains('found')).toBe(true);
  });

  it('copies from the dock, from one click', async () => {
    seed([
      storedPin('c_one', 'create', 'Start › create'),
      storedPin('c_two', 'cancel', 'Start › cancel'),
    ]);
    await bootOverlay();
    const written = stubExecCommand();

    node<HTMLButtonElement>('.setdock .copyall').click();

    expect(written['text/plain'].split('📍')).toHaveLength(3);
    expect(toast()).toBe('Copied all 2 pins — replaces your last paste');
  });

  it('drops one pin when its ✕ is pressed', async () => {
    seed([
      storedPin('c_one', 'create', 'Start › create'),
      storedPin('c_two', 'cancel', 'Start › cancel'),
    ]);
    await bootOverlay();
    await ticks(2);

    node<HTMLButtonElement>('.card[data-pin-id="c_one"] .close').click();

    expect(storedIds()).toEqual(['c_two']);
    expect(dockRows()).toHaveLength(1);
    expect(copyButton().textContent).toBe('Add & copy all (2)');
  });

  // The dock is 260px of chrome over the app; the next pick has to reach
  // whatever is under it, the same way it reaches under a card.
  it('folds the dock away while the next pick is being composed', async () => {
    seed([storedPin('c_one', 'create', 'Start › create')]);
    await bootOverlay();
    await ticks(2);
    expect(node('.setdock').classList.contains('folded')).toBe(false);

    await pick('cancel', 'two');
    expect(node('.setdock').classList.contains('folded')).toBe(true);

    pressEscape();

    expect(node('.setdock').classList.contains('folded')).toBe(false);
  });

  // The dock is the one control that reaches every pin, including the ones
  // the layer never found.
  it('says so when the dock cannot reach a pin', async () => {
    seed([storedPin('c_gone', 'missing', 'Start › missing')]);
    await bootOverlay();
    await ticks(2);

    node<HTMLButtonElement>('.setdock .locate').click();

    expect(toast()).toBe('That pin is not on this page');
  });

  it('ends the set once the dock asks twice', async () => {
    seed([storedPin('c_one', 'create', 'Start › create')]);
    await bootOverlay();
    await ticks(2);

    node<HTMLButtonElement>('.setdock .clear').click();
    expect(storedIds()).toEqual(['c_one']);
    node<HTMLButtonElement>('.setdock .yes').click();

    expect(sessionStorage.getItem(DRAFT_KEY)).toBeNull();
    expect(node('.setdock').classList.contains('shown')).toBe(false);
    expect(all('.card.found')).toHaveLength(0);
  });
});
