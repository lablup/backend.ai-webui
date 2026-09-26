/**
 * Guided mode end to end through `main.ts` (FR-3950): a link whose parts are
 * ALL stops opens the walkthrough instead of merging into the draft set. Only
 * `main.ts` composes the codec, the store, the layer and the guided-mode
 * modules, so this is where the mode switch can be asserted at all.
 */
import { encodeAnchor } from './codec.js';
import { DRAFT_KEY } from './draft.js';
import type { AnchorV3, SetPin } from './types.js';
import {
  WALKTHROUGH_FOCUS_KEY,
  WALKTHROUGH_KEY,
  WALKTHROUGH_STATE_PREFIX,
} from './walkthrough.js';
import type { Plugin, ReactGrabAPI } from 'react-grab';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const SHA = 'a'.repeat(40);
const A = 'c_aaaaaaa';
const B = 'c_bbbbbbb';
const C = 'c_ccccccc';

const shadow = () =>
  document.querySelector('[data-bai-review-overlay]')?.shadowRoot as ShadowRoot;
const node = <T extends HTMLElement>(selector: string) =>
  shadow()?.querySelector<T>(selector) as T | null;
const all = (selector: string) =>
  Array.from(shadow()?.querySelectorAll<HTMLElement>(selector) ?? []);

const pill = () => node('.bai-nav');
const pillText = () => pill()?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
const marks = () => all('.wt-mark');
const ordinals = () => all('.wt-badge.num').map((badge) => badge.textContent);
const toast = () => node('.toast')?.textContent ?? '';
const act = (name: string) => node<HTMLButtonElement>(`[data-act="${name}"]`);

/** jsdom has no editing host: `execCommand` never fires its own copy event. */
function stubExecCommand(): Record<string, string> {
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
    return true;
  });
  return written;
}

/**
 * Leave guided mode the way the reader does. A live one keeps a
 * MutationObserver on `body` and a 10 s ladder, which would run into a torn
 * down jsdom — and a simulated reload would leave TWO of them.
 */
function exitGuided() {
  if (!pill()) return;
  if (!act('exit')) act('panel')?.click();
  act('exit')?.click();
}

/** The same teardown, with the stored set left alone so the reload finds it. */
function exitGuidedKeepingSet() {
  const held = sessionStorage.getItem(WALKTHROUGH_KEY);
  const focus = sessionStorage.getItem(WALKTHROUGH_FOCUS_KEY);
  exitGuided();
  if (held) sessionStorage.setItem(WALKTHROUGH_KEY, held);
  if (focus) sessionStorage.setItem(WALKTHROUGH_FOCUS_KEY, focus);
}

const press = (code: string) =>
  document.dispatchEvent(
    new KeyboardEvent('keydown', { code, bubbles: true, cancelable: true }),
  );

const ticks = async (count: number, ms = 10) => {
  for (let i = 0; i < count; i++)
    await new Promise((resolve) => setTimeout(resolve, ms));
};

function mount(testid: string, text = testid) {
  document.body.insertAdjacentHTML(
    'beforeend',
    `<button data-testid="${testid}">${text}</button>`,
  );
}

interface StopSpec {
  id: string;
  testid: string;
  path?: string;
  /** The stop's element lives inside a dialog, so it resolves only in one. */
  dlg?: true;
  via?: string;
  /** Omitted for the one part that makes a link a plain pin set. */
  check?: string;
  type?: 'added' | 'modified';
}

const anchorFor = (spec: StopSpec): AnchorV3 => ({
  v: 3,
  s: `[data-testid="${spec.testid}"]`,
  p: spec.path ?? '/',
  tag: 'button',
  txt: spec.testid,
  ...(spec.check === undefined
    ? {}
    : {
        ck: spec.check,
        ch: `${spec.testid} changed`,
        old: 'Old',
        new: 'New',
        type: spec.type ?? 'modified',
        kind: 'button',
        sha: SHA,
        pr: 9690,
        code: [{ path: 'react/src/App.tsx', line: 12 }],
        ...(spec.dlg ? { dlg: 1 as const } : {}),
        ...(spec.via ? { via: [{ click: { text: spec.via } }] } : {}),
      }),
});

async function part(spec: StopSpec): Promise<string> {
  return `bai=v3.${spec.id}.${await encodeAnchor(anchorFor(spec))}`;
}

async function bootOn(hash: string, path = '/') {
  window.__REACT_GRAB__ = {
    activate: () => undefined,
    deactivate: () => undefined,
    isActive: () => false,
    registerPlugin: (_plugin: Plugin) => undefined,
    getStackContext: () => Promise.resolve(''),
    getSource: () => Promise.resolve(null),
  } as unknown as ReactGrabAPI;
  vi.stubGlobal('fetch', () =>
    Promise.resolve({ json: () => Promise.resolve({ pr: 9690, head: SHA }) }),
  );
  history.replaceState({}, '', `${path}${hash ? `#${hash}` : ''}`);
  vi.resetModules();
  delete window.__baiReviewOverlay;
  await import('./main.js');
  await ticks(12);
}

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  history.replaceState({}, '', '/');
  document.body.innerHTML = '';
  mount('upload');
  mount('create');
});

afterEach(() => {
  exitGuided();
  vi.unstubAllGlobals();
  document.querySelector('[data-bai-review-overlay]')?.remove();
  document.body.innerHTML = '';
  delete window.__REACT_GRAB__;
  delete window.__BAI_REVIEW__;
});

describe('the mode switch', () => {
  it('opens a link whose parts are all stops as a walkthrough', async () => {
    const hash = [
      await part({ id: A, testid: 'upload', check: 'The button says Upload' }),
      await part({ id: B, testid: 'create', check: 'It is still there' }),
    ].join('&');

    await bootOn(hash);

    expect(pillText()).toContain('1 page · 2 changes');
    expect(marks()).toHaveLength(2);
    expect(ordinals()).toEqual(['1', '2']);
    // The reviewer's own set is a different set, and it was not touched.
    expect(sessionStorage.getItem(DRAFT_KEY)).toBeNull();
    expect(all('.setdock .row')).toHaveLength(0);
    expect(sessionStorage.getItem(WALKTHROUGH_KEY)).toContain(A);
    // The element carries the semantics, the tracking box the styling.
    expect(
      document
        .querySelector('[data-testid="upload"]')
        ?.getAttribute('data-bai-type'),
    ).toBe('modified');
  });

  it('merges a link with one non-stop part into the draft set as before', async () => {
    const hash = [
      await part({ id: A, testid: 'upload', check: 'The button says Upload' }),
      await part({ id: B, testid: 'create' }),
    ].join('&');

    await bootOn(hash);

    expect(pill()).toBeNull();
    expect(marks()).toHaveLength(0);
    expect(all('.setdock .row')).toHaveLength(2);
    expect(sessionStorage.getItem(WALKTHROUGH_KEY)).toBeNull();
    expect(toast()).toContain('Added 2 pins from the link');
  });

  it('resumes the walkthrough it was left in, with its viewed ticks', async () => {
    const hash = await part({
      id: A,
      testid: 'upload',
      check: 'The button says Upload',
    });
    await bootOn(hash);
    node<HTMLInputElement>('[data-pact="viewed"]')?.click();
    expect(localStorage.getItem(`${WALKTHROUGH_STATE_PREFIX}${SHA}`)).toContain(
      A,
    );

    // A reload: the hash was scrubbed when the link opened, and the set is
    // what brings the walkthrough back. Guided mode is torn down first, the
    // way a real reload tears the whole document down.
    exitGuidedKeepingSet();
    document.querySelector('[data-bai-review-overlay]')?.remove();
    await bootOn('');

    expect(pillText()).toContain('1 / 1 · 1 viewed');
    expect(marks()[0].className).toContain('viewed');
  });
});

describe('the navigator', () => {
  const threeStops = async () =>
    [
      await part({ id: A, testid: 'upload', check: 'Upload is renamed' }),
      await part({
        id: B,
        testid: 'start',
        path: '/session/start',
        check: 'The step list gained one',
        type: 'added',
      }),
      await part({ id: C, testid: 'create', check: 'Still there' }),
    ].join('&');

  it('groups every stop by its page, in set order', async () => {
    await bootOn(await threeStops());

    expect(pillText()).toContain('2 pages · 3 changes');
    act('panel')?.click();

    const rows = all('.bai-panel .it').map((row) =>
      row.textContent?.replace(/\s+/g, ' ').trim(),
    );
    expect(rows).toHaveLength(3);
    expect(rows[0]).toContain('1.');
    expect(rows[1]).toContain('3.');
    expect(rows[2]).toContain('2.');
    expect(all('.bai-panel .pg')).toHaveLength(2);
  });

  it('crosses a page through the app’s router when it publishes one', async () => {
    const seen: string[] = [];
    window.__BAI_REVIEW__ = { navigate: (to) => seen.push(to) };
    await bootOn(await threeStops());

    // Stop 1 is here, stop 2 is on the session launcher.
    act('next')?.click();

    expect(seen).toEqual(['/session/start']);
    expect(pillText()).toContain('2 / 3');
  });

  it('takes every mark and attribute off on exit', async () => {
    await bootOn(await threeStops());
    expect(marks()).toHaveLength(2);

    act('panel')?.click();
    act('exit')?.click();

    expect(marks()).toHaveLength(0);
    expect(pill()).toBeNull();
    expect(document.querySelectorAll('[data-bai-change]')).toHaveLength(0);
    expect(document.querySelectorAll('[data-bai-mark-owned]')).toHaveLength(0);
    expect(sessionStorage.getItem(WALKTHROUGH_KEY)).toBeNull();
  });
});

/** One pin the reviewer already had in this tab, as the draft store holds it. */
const seedDraftPin = () => {
  const pin: SetPin = {
    id: 'c_zzzzzzz',
    origin: 'pick',
    anchor: { v: 3, s: '[data-testid="create"]', p: '/', tag: 'button' },
    anchorB64: 'PAYLOAD_own',
    label: 'Start › create',
    appHash: '',
    stack: [],
    note: 'my own pin',
    at: '2026-09-15T09:00:00Z',
    pr: 9690,
  };
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ v: 1, pins: [pin] }));
};

/** Every stylesheet the overlay mounted, as one string. */
const overlayCss = () =>
  Array.from(shadow()?.querySelectorAll('style') ?? [])
    .map((sheet) => sheet.textContent)
    .join('\n');

describe('guided mode’s colours', () => {
  it('binds its surfaces to the app theme, never to the OS preference', async () => {
    await bootOn(
      await part({ id: A, testid: 'upload', check: 'Upload is renamed' }),
    );
    const css = overlayCss();

    expect(css).toContain('--bai-pop-bg: var(--bai-review-surface)');
    expect(css).toContain('--bai-pop-fg: var(--bai-review-text)');
    expect(css).toContain('--bai-pop-border: var(--bai-review-border)');
    // The app owns the theme toggle; reading the OS behind its back turned the
    // popover dark under a light app.
    // The at-rule, not the word: the comment beside the tokens names it.
    expect(css).not.toMatch(/@media[^{]*prefers-color-scheme/);
    // The marks keep the docs grammar literally.
    expect(css).toContain('--bai-accent: #ff7a00');
  });

  it('leaves a disabled control legible instead of half-faded', async () => {
    await bootOn(
      await part({ id: A, testid: 'upload', check: 'Upload is renamed' }),
    );

    // No comments yet, so the copy button is the disabled one.
    expect(act('copyall')?.disabled).toBe(true);
    expect(overlayCss()).toMatch(/button:disabled[^{]*\{[^}]*opacity: 1/);
  });
});

describe('a link that arrived truncated', () => {
  /** What a chat client does to a long link: it cuts the tail off. */
  const cut = (hash: string, chars: number) => hash.slice(0, -chars);

  it('opens on the stops it can still read, and says what it lost', async () => {
    const hash = [
      await part({ id: A, testid: 'upload', check: 'Upload is renamed' }),
      await part({ id: B, testid: 'create', check: 'Still there' }),
      await part({ id: C, testid: 'confirm', check: 'The confirm is primary' }),
    ].join('&');

    await bootOn(cut(hash, 20));

    // Guided mode, on the two whole stops — not the pin path.
    expect(pill()).not.toBeNull();
    expect(marks()).toHaveLength(2);
    expect(pillText()).toContain('2 changes');
    expect(all('.setdock .row')).toHaveLength(0);

    const banner = node('.bai-banner')?.textContent ?? '';
    expect(banner).toContain('1 stop could not be read');
    expect(banner).toContain('truncated when it was copied');

    // And the ☰ panel says it too, for a reader who dismissed the banner.
    act('panel')?.click();
    expect(node('.bai-panel .cut')?.textContent).toContain(
      '1 stop could not be read',
    );
  });

  it('keeps the note across the reload that resumes the walkthrough', async () => {
    const hash = [
      await part({ id: A, testid: 'upload', check: 'Upload is renamed' }),
      await part({ id: B, testid: 'create', check: 'Still there' }),
    ].join('&');
    await bootOn(cut(hash, 20));
    expect(marks()).toHaveLength(1);

    exitGuidedKeepingSet();
    document.querySelector('[data-bai-review-overlay]')?.remove();
    await bootOn('');

    expect(node('.bai-banner')?.textContent).toContain(
      '1 stop could not be read',
    );
  });

  it('leaves a link whose only part is unreadable exactly as it was', async () => {
    const hash = cut(
      await part({ id: A, testid: 'upload', check: 'Upload is renamed' }),
      20,
    );

    await bootOn(hash);

    expect(pill()).toBeNull();
    expect(marks()).toHaveLength(0);
    expect(sessionStorage.getItem(WALKTHROUGH_KEY)).toBeNull();
    expect(toast()).toContain('Could not read the anchor in that link');
  });

  it('still merges a link that carries a readable reviewer pin', async () => {
    const hash = [
      await part({ id: A, testid: 'upload', check: 'Upload is renamed' }),
      // A reviewer's own pin: readable, and not a stop.
      await part({ id: B, testid: 'create' }),
      await part({ id: C, testid: 'confirm', check: 'The confirm is primary' }),
    ].join('&');

    await bootOn(cut(hash, 20));

    expect(pill()).toBeNull();
    expect(marks()).toHaveLength(0);
    expect(all('.setdock .row')).toHaveLength(2);
  });
});

describe('the pill and the set dock', () => {
  it('steps out of the corner the dock is in, and back when it empties', async () => {
    seedDraftPin();
    const hash = await part({
      id: A,
      testid: 'upload',
      check: 'Upload is renamed',
    });

    await bootOn(hash);

    expect(all('.setdock .row')).toHaveLength(1);
    expect(pill()?.className).toContain('dodge');

    // The reviewer clears their set; the corner is free again.
    node<HTMLButtonElement>('.setdock .row .remove')?.click();

    expect(all('.setdock .row')).toHaveLength(0);
    expect(pill()?.className).not.toContain('dodge');
  });

  it('keeps the corner when the reviewer has no pins of their own', async () => {
    await bootOn(
      await part({ id: A, testid: 'upload', check: 'Upload is renamed' }),
    );

    expect(pill()?.className).not.toContain('dodge');
  });
});

describe('landing on the requested stop', () => {
  it('starts at the first stop that belongs to this page', async () => {
    const hash = [
      await part({ id: A, testid: 'upload', check: 'Upload is renamed' }),
      await part({
        id: B,
        testid: 'start',
        path: '/session/start',
        check: 'The step list gained one',
      }),
      await part({ id: C, testid: 'create', check: 'Still there' }),
    ].join('&');

    // What the `location.assign(pinSetUrlAt(...))` fallback produces: the
    // whole set, reloaded on stop 2's page. Nothing is mounted yet at boot,
    // so every stop here reads as waiting — only `away` is decidable.
    await bootOn(hash, '/session/start');

    expect(pillText()).toContain('2 / 3');
    expect(node('.bai-popover .foot')?.textContent).toContain('#2');
  });

  it('resumes on the stop the full-reload fallback was sent to', async () => {
    // No `navigate` published, so `›` across a page goes through
    // `location.assign` — and the destination page holds TWO stops.
    const hash = [
      await part({ id: A, testid: 'upload', check: 'Upload is renamed' }),
      await part({
        id: B,
        testid: 'start',
        path: '/session/start',
        check: 'The step list gained one',
      }),
      await part({
        id: C,
        testid: 'confirm',
        path: '/session/start',
        check: 'The confirm button is primary',
      }),
    ].join('&');
    await bootOn(hash);

    // Stop 3, straight from the ☰ panel: another page, so it reloads.
    act('panel')?.click();
    all('.bai-panel .it')[2]?.click();
    expect(sessionStorage.getItem(WALKTHROUGH_FOCUS_KEY)).toBe(C);

    // The reload `location.assign` would have caused. Its URL carries the
    // WHOLE set, so boot resumes the stored walkthrough and the link then
    // re-enters the same one — both have to land on stop 3.
    exitGuidedKeepingSet();
    document.querySelector('[data-bai-review-overlay]')?.remove();
    await bootOn(hash, '/session/start');

    expect(pillText()).toContain('3 / 3');
    // One-shot: the next reload takes the first stop on the page again.
    expect(sessionStorage.getItem(WALKTHROUGH_FOCUS_KEY)).toBeNull();
  });

  it('falls back to the head of the set when no stop is on this page', async () => {
    const hash = [
      await part({
        id: A,
        testid: 'upload',
        path: '/data',
        check: 'Upload is renamed',
      }),
      await part({
        id: B,
        testid: 'create',
        path: '/data',
        check: 'Still there',
      }),
    ].join('&');

    await bootOn(hash, '/session/start');

    expect(pillText()).toContain('1 / 2');
  });
});

describe('what the reader gives back', () => {
  it('keeps a comment across a reload and copies it as one reviewer pin', async () => {
    const written = stubExecCommand();
    const hash = await part({
      id: A,
      testid: 'upload',
      check: 'The button says Upload',
    });
    await bootOn(hash);

    const area = node<HTMLTextAreaElement>('[data-pact="comment"]');
    area!.value = 'the label is cut off';
    area!.dispatchEvent(new Event('input', { bubbles: true }));

    // A reload: the comment comes back with the walkthrough it belongs to.
    exitGuidedKeepingSet();
    document.querySelector('[data-bai-review-overlay]')?.remove();
    await bootOn('');
    expect(node<HTMLTextAreaElement>('[data-pact="comment"]')?.value).toBe(
      'the label is cut off',
    );
    expect(pillText()).toContain('✎ Copy 1 comment');
    expect(all('.wt-badge')[1]?.textContent).toBe('✎ comment');

    act('copyall')?.click();
    await ticks(2);

    const { parsePins } = await import('../cli.js');
    const { isStop } = await import('./stop-guard.js');
    const parsed = await parsePins(written['text/plain']);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].note).toContain('the label is cut off');
    expect(parsed[0].note).toContain(`re: stop 1 · ${A}`);
    expect(parsed[0].idVerified).toBe(true);
    // An ordinary finding, not a stop: `review-pins parse` skips stops by
    // default, and the reviewer's remark is theirs to answer.
    expect(isStop(parsed[0].anchor)).toBe(false);
    expect(parsed[0].anchor?.s).toBe('[data-testid="upload"]');
  });

  it('answers the walkthrough keys by code, and ignores them while typing', async () => {
    const hash = [
      await part({ id: A, testid: 'upload', check: 'Upload is renamed' }),
      await part({ id: B, testid: 'create', check: 'Still there' }),
    ].join('&');
    await bootOn(hash);

    press('KeyV');
    expect(pillText()).toContain('1 viewed');
    press('KeyN');
    expect(pillText()).toContain('2 / 2');
    press('KeyP');
    expect(pillText()).toContain('1 / 2');

    // A letter typed into the comment is a letter, not a command.
    node<HTMLTextAreaElement>('[data-pact="comment"]')?.focus();
    press('KeyN');
    expect(pillText()).toContain('1 / 2');
  });
});

describe('a stop behind a dialog', () => {
  it('waits with its via sentence, then marks itself when the dialog opens', async () => {
    const hash = [
      await part({ id: A, testid: 'upload', check: 'Upload is renamed' }),
      await part({
        id: B,
        testid: 'confirm',
        check: 'The confirm button is primary',
        dlg: true,
        via: 'Upload',
      }),
    ].join('&');

    await bootOn(hash);
    act('next')?.click();

    expect(marks()).toHaveLength(1);
    expect(pillText()).toContain('waiting');
    expect(node('.bai-popover .via')?.textContent).toContain('Click “Upload”');

    // The dialog opens. No URL changed, so only the DOM settle can catch it.
    document.body.insertAdjacentHTML(
      'beforeend',
      '<div role="dialog"><button data-testid="confirm">confirm</button></div>',
    );
    await ticks(30);

    expect(marks()).toHaveLength(2);
    expect(pillText()).not.toContain('waiting');
  });

  it('keeps its popover open while the reader follows the via sentence', async () => {
    const hash = [
      await part({ id: A, testid: 'upload', check: 'Upload is renamed' }),
      await part({
        id: B,
        testid: 'confirm',
        check: 'The confirm button is primary',
        dlg: true,
        via: 'Upload',
      }),
    ].join('&');
    await bootOn(hash);
    act('next')?.click();
    expect(node('.bai-popover')?.className).toContain('shown');

    // The click the via sentence asks for lands outside the popover.
    document
      .querySelector('[data-testid="upload"]')
      ?.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    expect(node('.bai-popover')?.className).toContain('shown');
  });
});

describe('a stop under an open modal', () => {
  it('draws no mark over the modal, and marks itself when the modal closes in place', async () => {
    document.body.insertAdjacentHTML(
      'beforeend',
      '<div role="dialog" aria-modal="true" id="modal"><button data-testid="confirm">confirm</button></div>',
    );
    const hash = [
      await part({ id: A, testid: 'confirm', check: 'Confirm is primary' }),
      await part({ id: B, testid: 'create', check: 'Create is renamed' }),
    ].join('&');

    await bootOn(hash);

    expect(ordinals()).toEqual(['1']);
    act('next')?.click();
    expect(pillText()).toContain('waiting');
    expect(node('.bai-popover .via')?.textContent).toContain(
      'Behind the open dialog',
    );

    // Closing in place drops the role, as BAIDialog does; no childList record.
    document.getElementById('modal')?.removeAttribute('role');
    await ticks(30);

    expect(ordinals()).toEqual(['1', '2']);
    expect(pillText()).not.toContain('waiting');
  });
});
