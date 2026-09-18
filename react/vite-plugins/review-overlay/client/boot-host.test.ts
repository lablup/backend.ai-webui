/**
 * The OverlayHost seam (ADR 0008): the same client booted with answers that
 * are NOT this app's. `main.ts` covers the default host — everything here is
 * what a second host changes, and what it must be able to change without
 * claiming to be a static build.
 */
import { bootOverlay, defaultOverlayHost } from './boot.js';
import { encodeAnchor } from './codec.js';
import { DRAFT_KEY } from './draft.js';
import type { AnchorV3, ReviewServerState, SetPin } from './types.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const A = 'c_aaaaaaa';
const B = 'c_bbbbbbb';
const SHA = 'a'.repeat(40);
const APPLIED_KEY = 'bai-review-applied';
const FOCUS_KEY = 'bai-review:focus';

const overlayHost = () =>
  document.querySelector('[data-bai-review-overlay]') as HTMLElement | null;
const shadow = () => overlayHost()?.shadowRoot as ShadowRoot;
const css = () => shadow()?.querySelector('style')?.textContent ?? '';
const toast = () => shadow()?.querySelector('.toast')?.textContent ?? '';
const dockRows = () =>
  Array.from(shadow()?.querySelectorAll<HTMLElement>('.setdock .row') ?? []);
const cards = () =>
  Array.from(shadow()?.querySelectorAll<HTMLElement>('.card.found') ?? []);
/** The dock's switch folds every card away — `display: none`, not removal. */
const hiddenCards = () =>
  Array.from(
    shadow()?.querySelectorAll<HTMLElement>('.card.found.hidden') ?? [],
  );
const storedIds = (): string[] => {
  const raw = sessionStorage.getItem(DRAFT_KEY);
  return raw
    ? (JSON.parse(raw) as { pins: SetPin[] }).pins.map((p) => p.id)
    : [];
};

const ticks = async (count = 12, ms = 10) => {
  for (let i = 0; i < count; i++) {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
};

/** One `bai=v3.<id>.<anchor>` part, encoded by the real codec. */
async function part(id: string, testid: string, path = '/'): Promise<string> {
  const anchor: AnchorV3 = {
    v: 3,
    s: `[data-testid="${testid}"]`,
    p: path,
    tag: 'button',
    txt: testid,
    n: `note for ${testid}`,
  };
  return `bai=v3.${id}.${await encodeAnchor(anchor)}`;
}

/** One stop part: a link whose parts are ALL stops opens guided mode. */
async function stopPart(id: string, testid: string): Promise<string> {
  const anchor: AnchorV3 = {
    v: 3,
    s: `[data-testid="${testid}"]`,
    p: '/',
    tag: 'button',
    txt: testid,
    ck: `${testid} is there`,
    ch: `${testid} changed`,
    old: 'Old',
    new: 'New',
    type: 'modified',
    kind: 'button',
    sha: SHA,
    pr: 9690,
    code: [{ path: 'react/src/App.tsx', line: 12 }],
  };
  return `bai=v3.${id}.${await encodeAnchor(anchor)}`;
}

/** The platform modifier plus C, whichever platform `isMac()` decides on. */
const pressPickChord = () =>
  window.dispatchEvent(
    new KeyboardEvent('keydown', {
      code: 'KeyC',
      key: 'c',
      ctrlKey: true,
      metaKey: true,
      bubbles: true,
    }),
  );

const picking = () => document.documentElement.style.cursor === 'crosshair';

/** A bare letter on `document` — guided mode's own keys, and the page's. */
function pressBare(code: string): KeyboardEvent {
  const evt = new KeyboardEvent('keydown', {
    code,
    bubbles: true,
    cancelable: true,
  });
  document.dispatchEvent(evt);
  return evt;
}

const navPill = () => shadow()?.querySelector('.bai-nav') as HTMLElement | null;
const pillText = () =>
  navPill()?.textContent?.replace(/\s+/g, ' ').trim() ?? '';

/** A fresh document per test: the flag is what makes a second boot a no-op. */
async function boot(options: Parameters<typeof bootOverlay>[0] = {}) {
  vi.resetModules();
  delete window.__baiReviewOverlay;
  const module = await import('./boot.js');
  const handle = module.bootOverlay(options);
  await ticks();
  return handle;
}

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  history.replaceState({}, '', '/');
  document.body.innerHTML = '';
  document.body.insertAdjacentHTML(
    'beforeend',
    '<button data-testid="create">create</button>' +
      '<button data-testid="upload">upload</button>',
  );
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.reject(new Error('no server in this test'))),
  );
});

afterEach(() => {
  // A live guided mode keeps a MutationObserver on `body` and a 10 s ladder;
  // leaving it the way the reader does takes both down.
  if (navPill()) {
    const act = (name: string) =>
      shadow()?.querySelector<HTMLButtonElement>(`[data-act="${name}"]`);
    if (!act('exit')) act('panel')?.click();
    act('exit')?.click();
  }
  // The layer outlives the module and keeps a MutationObserver on `body` plus
  // a retry driver; taking every pin down first keeps them out of the next file.
  for (let left = 30; left > 0; left--) {
    const remove = shadow()?.querySelector<HTMLButtonElement>(
      '.setdock .row .remove',
    );
    if (!remove) break;
    remove.click();
  }
  document.documentElement.style.cursor = '';
  overlayHost()?.remove();
  document.body.innerHTML = '';
  sessionStorage.clear();
  vi.unstubAllGlobals();
  delete window.__baiReviewOverlay;
});

describe('the default host', () => {
  it("is this app: the page's tokens, the chord, and a bare marker", () => {
    const host = defaultOverlayHost();

    expect(host.palette).toBe('inherit');
    expect(host.pageChords).toBe(true);
    expect(host.autoNavigate).toBe(true);
    expect(host.marker).toBe('');
    // Not a boolean: nothing has claimed either way, so the state decides.
    expect(host.expectReactGrab).toBeUndefined();
  });

  it('boots once per document, and says so the second time', async () => {
    expect(await boot({ expectReactGrab: false })).not.toBeNull();

    expect(bootOverlay({ expectReactGrab: false })).toBeNull();
  });
});

describe('the host marker', () => {
  it('is present but empty by default, so the attribute still matches', async () => {
    await boot({ expectReactGrab: false });

    expect(overlayHost()?.getAttribute('data-bai-review-overlay')).toBe('');
  });

  it('carries the value the host chose, so hosts can be told apart', async () => {
    await boot({ expectReactGrab: false, marker: 'extension' });

    expect(overlayHost()?.getAttribute('data-bai-review-overlay')).toBe(
      'extension',
    );
  });
});

describe('the palette', () => {
  it("inherits the page's own tokens by default", async () => {
    await boot({ expectReactGrab: false });

    expect(css()).toContain('var(--color-background-popover, #fff)');
    expect(css()).toContain('color-scheme: inherit');
  });

  /**
   * `--color-text-primary` means something else on a foreign site, and white
   * on white is the failure mode — so `own` reads nothing from the page.
   */
  it('reads no host custom property at all when the host owns it', async () => {
    await boot({ expectReactGrab: false, palette: 'own' });

    expect(css()).not.toContain('var(--color-');
    expect(css()).toContain('@media (prefers-color-scheme: dark)');
    expect(css()).toContain('color-scheme: light dark');
    // The pin's own colour is a literal either way.
    expect(css()).toContain('--bai-review-accent: #ff0de7');
  });
});

describe('the page chords', () => {
  it('enters pick mode by default', async () => {
    await boot({ expectReactGrab: false });

    pressPickChord();

    expect(picking()).toBe(true);
    expect(toast()).toContain('Click the element you want to comment on');
  });

  it('binds nothing when the host cannot afford to shadow it', async () => {
    await boot({ expectReactGrab: false, pageChords: false });

    pressPickChord();

    expect(picking()).toBe(false);
    expect(toast()).toBe('');
  });

  it('still opens the fallback picker through the handle', async () => {
    const handle = await boot({ expectReactGrab: false, pageChords: false });

    handle?.startPick();

    expect(picking()).toBe(true);
    handle?.cancelPick();
    expect(picking()).toBe(false);
  });
});

describe('the state source', () => {
  it('asks the host, not the network, when the document carries state', async () => {
    const embedded: ReviewServerState = {
      pr: 7,
      repo: 'lablup/backend.ai-webui',
      branch: null,
      source: 'none',
    };
    const source = {
      embedded: vi.fn(() => embedded),
      fetch: vi.fn(() => Promise.resolve(null)),
    };

    await boot({ expectReactGrab: false, state: source });

    expect(source.embedded).toHaveBeenCalled();
    // Already in hand: nothing is waited for, and nothing is asked for.
    expect(source.fetch).not.toHaveBeenCalled();
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("awaits the host's own fetch when there is no embedded state", async () => {
    const source = {
      embedded: vi.fn(() => null),
      fetch: vi.fn(() =>
        Promise.resolve<ReviewServerState>({
          pr: 7,
          repo: null,
          branch: null,
          source: 'none',
        }),
      ),
    };

    await boot({ expectReactGrab: false, state: source });

    expect(source.fetch).toHaveBeenCalled();
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});

describe('the boot hash', () => {
  it('reads the pins from what the host captured, not from the live hash', async () => {
    const hash = await part(A, 'create');
    // The document is on `/` with no fragment at all: only the override has it.
    await boot({ expectReactGrab: false, bootHash: `#${hash}` });

    expect(storedIds()).toEqual([A]);
    expect(cards()).toHaveLength(1);
  });
});

describe('auto navigation', () => {
  it('follows a link whose pins are all elsewhere by default', async () => {
    const hash = await part(A, 'create', '/elsewhere');

    await boot({ expectReactGrab: false, bootHash: `#${hash}` });

    expect(sessionStorage.getItem(APPLIED_KEY)).toContain('/elsewhere');
    expect(sessionStorage.getItem(FOCUS_KEY)).toBe(A);
  });

  /**
   * A crafted fragment must not move a reader who never asked for it. The set
   * still merges; the dock row is how they open it, exactly as for a link that
   * the loop guard has already refused once.
   */
  it('leaves the reader where they are when the host refuses it', async () => {
    const hash = await part(A, 'create', '/elsewhere');

    await boot({
      expectReactGrab: false,
      autoNavigate: false,
      bootHash: `#${hash}`,
    });

    // The guard key and the focus handover are written ON the navigating
    // path and nowhere else, so their absence IS the refusal. `location`
    // itself proves nothing here: jsdom implements no navigation.
    expect(sessionStorage.getItem(APPLIED_KEY)).toBeNull();
    expect(sessionStorage.getItem(FOCUS_KEY)).toBeNull();
    expect(storedIds()).toEqual([A]);
    expect(dockRows()).toHaveLength(1);
    expect(toast()).toContain(
      '1 pin is on another page — open it from the list',
    );
  });
});

describe('the handle', () => {
  it('counts the draft set and switches its cards away', async () => {
    const hash = [await part(A, 'create'), await part(B, 'upload')].join('&');

    const handle = await boot({ expectReactGrab: false, bootHash: `#${hash}` });

    expect(handle?.pinCount()).toBe(2);
    expect(cards()).toHaveLength(2);
    expect(hiddenCards()).toHaveLength(0);

    handle?.toggleCards();
    await ticks(4);
    // The markers and the boxes stay; only the cards fold away.
    expect(hiddenCards()).toHaveLength(2);

    handle?.toggleCards();
    await ticks(4);
    expect(hiddenCards()).toHaveLength(0);
  });
});

describe('guided mode on a page the overlay does not own', () => {
  /**
   * `n` `p` `v` `m` `c` `[` `]` are bare, and the handler `preventDefault`s
   * them — `c` is "create" on GitHub and Jira, and it copies. A walkthrough
   * link is the ordinary way a second host opens a page, so the keys have to
   * go with the rest of the page chords.
   */
  it('claims no bare letter key when the host refuses page chords', async () => {
    const hash = [
      await stopPart(A, 'create'),
      await stopPart(B, 'upload'),
    ].join('&');

    await boot({
      expectReactGrab: false,
      pageChords: false,
      bootHash: `#${hash}`,
    });

    expect(pillText()).toContain('2 changes');
    const first = pillText();

    expect(pressBare('KeyN').defaultPrevented).toBe(false);
    expect(pressBare('KeyC').defaultPrevented).toBe(false);

    expect(pillText()).toBe(first);
  });

  it('still walks on the keys in this app', async () => {
    const hash = [
      await stopPart(A, 'create'),
      await stopPart(B, 'upload'),
    ].join('&');

    await boot({ expectReactGrab: false, bootHash: `#${hash}` });

    expect(pressBare('KeyN').defaultPrevented).toBe(true);
  });
});
