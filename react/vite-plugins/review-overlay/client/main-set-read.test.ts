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

afterEach(() => {
  // The layer outlives the module and keeps a MutationObserver on `body`;
  // taking every pin down first keeps it from firing into a torn-down jsdom.
  for (const close of all('.card .close')) close.click();
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
