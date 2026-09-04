/**
 * What the deep-link card's copy control actually writes (FR-3851). `pin.ts`
 * owns the button and `block.ts` the rendering, but only `main.ts` composes
 * them — the note off the fragment, the ⚛️ stack re-read from the element the
 * pin landed on, and the pin's own link on this origin.
 */
import { encodeAnchor } from './codec.js';
import type { AnchorV3 } from './types.js';
import type { Plugin, ReactGrabAPI } from 'react-grab';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const ID = 'c_zdv3rhz';
const ROOT = '/home/driver/Workspace/backend.ai-webui';
const FILE = 'react/src/components/CreateButton.tsx';

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

interface OpenPinOptions {
  /** Extra fragment parts the pin rides alongside, e.g. `tab=logs`. */
  otherHash?: string;
  /** Withhold react-grab, the way a pin that beats the app's boot sees it. */
  withoutReactGrab?: boolean;
  /** Hold `/__review/state` open, so the pin locates before `pr` is known. */
  slowState?: boolean;
  /** Boot ticks to run; short enough to catch the pin mid-read. */
  ticks?: number;
}

/** Boot the overlay on a `#bai=v3` link to `[data-testid="create"]`. */
async function openPin(
  over: Partial<AnchorV3> = {},
  options: OpenPinOptions = {},
): Promise<string> {
  const anchor: AnchorV3 = {
    v: 3,
    s: '[data-testid="create"]',
    p: '/',
    tag: 'button',
    txt: 'Create',
    n: 'The label is cut off.',
    ...over,
  };
  const anchorB64 = await encodeAnchor(anchor);
  document.body.innerHTML = '<button data-testid="create">Create</button>';
  const rest = options.otherHash ? `${options.otherHash}&` : '';
  history.replaceState({}, '', `/#${rest}bai=v3.${ID}.${anchorB64}`);
  if (options.withoutReactGrab) delete window.__REACT_GRAB__;
  else
    window.__REACT_GRAB__ = {
      activate: () => undefined,
      deactivate: () => undefined,
      isActive: () => false,
      registerPlugin: (_plugin: Plugin) => undefined,
      getStackContext: () =>
        Promise.resolve(`  in CreateButton (at ${ROOT}/${FILE})`),
      getSource: () => Promise.resolve(null),
    } as unknown as ReactGrabAPI;
  const state = { json: () => Promise.resolve({ pr: 42, root: ROOT }) };
  vi.stubGlobal('fetch', () =>
    options.slowState
      ? new Promise((resolve) => setTimeout(() => resolve(state), 5000))
      : Promise.resolve(state),
  );

  vi.resetModules();
  delete window.__baiReviewOverlay;
  await import('./main.js');
  // The state gate, the anchor inflate, the locate ladder and the stack read.
  for (let i = 0; i < (options.ticks ?? 12); i++) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  return anchorB64;
}

const toast = () =>
  document
    .querySelector('[data-bai-review-overlay]')
    ?.shadowRoot?.querySelector('.toast')?.textContent ?? '';

const click = (selector: string) =>
  document
    .querySelector('[data-bai-review-overlay]')
    ?.shadowRoot?.querySelector<HTMLButtonElement>(selector)
    ?.click();

beforeEach(() => {
  sessionStorage.clear();
  history.replaceState({}, '', '/');
});

afterEach(() => {
  // The pin outlives the module and keeps a MutationObserver on `body`; with
  // no target it schedules nothing, so dismissing it first keeps the observer
  // from firing into a torn-down jsdom.
  click('.close');
  vi.unstubAllGlobals();
  document.querySelector('[data-bai-review-overlay]')?.remove();
  document.body.innerHTML = '';
  delete window.__REACT_GRAB__;
});

describe('copying the whole comment off a deep link', () => {
  it('rebuilds the block the composer wrote, link and stack included', async () => {
    const anchorB64 = await openPin();
    const written = stubExecCommand();

    click('.copyall');

    const lines = written['text/plain'].split('\n');
    expect(lines.slice(0, 5)).toEqual([
      'The label is cut off.',
      '',
      `> 📍 **/ › button "Create"** · \`${ID}\``,
      `> ⚛️ in CreateButton (at ${FILE})`,
      `> [Open on dev server](${location.origin}/#bai=v3.${ID}.${anchorB64})`,
    ]);
    // No marker (D5): a link carries no `at`/`pr`, and a fabricated stamp
    // would write a marker whose id hash does not verify. The link is the
    // canonical carrier of a pin that came off one.
    expect(lines).toHaveLength(5);
    expect(written['text/plain']).not.toContain('<!-- bai-review');
  });

  it('writes the rich flavour too, so a Teams paste stays a quote', async () => {
    await openPin();
    const written = stubExecCommand();

    click('.copyall');

    expect(written['text/html']).toContain('<p>The label is cut off.</p>');
    expect(written['text/html']).toContain('<blockquote>📍 <b>');
  });

  // A link written before the note travelled in the anchor still copies.
  it('drops the note and keeps the block when the link carries none', async () => {
    await openPin({ n: undefined });
    const written = stubExecCommand();

    click('.copyall');

    expect(written['text/plain'].startsWith('> 📍 ')).toBe(true);
  });

  // The pin can ride inside a fragment the app already uses; a link that
  // reopens on the wrong tab is not the link that was shared.
  it('keeps the app fragment the pin rides alongside', async () => {
    const anchorB64 = await openPin({}, { otherHash: 'tab=logs' });
    const written = stubExecCommand();

    click('.copyall');

    expect(written['text/plain']).toContain(
      `(${location.origin}/#tab=logs&bai=v3.${ID}.${anchorB64})`,
    );
  });

  // `pr` and the ⚛️ stack are read per element; a block written before they
  // land would claim `pr=0` and quietly drop the frames.
  it('refuses to write until this element has been read', async () => {
    await openPin({}, { slowState: true });
    const card = document
      .querySelector('[data-bai-review-overlay]')
      ?.shadowRoot?.querySelector('.card');
    // The pin is drawn — it is only `pr` and the stack that have not landed.
    expect(card?.classList.contains('found')).toBe(true);
    const written = stubExecCommand();

    click('.copyall');

    expect(written['text/plain']).toBeUndefined();
    expect(toast()).toBe('Still reading this element — try again');
  });

  // react-grab arrives with the app, so a pin that locates first sees an
  // empty stack — and `onLocated` will not fire again for the same element.
  it('retries the stack for a pin that beat react-grab to the page', async () => {
    await openPin({}, { withoutReactGrab: true, ticks: 4 });
    window.__REACT_GRAB__ = {
      activate: () => undefined,
      deactivate: () => undefined,
      isActive: () => false,
      registerPlugin: (_plugin: Plugin) => undefined,
      getStackContext: () =>
        Promise.resolve(`  in CreateButton (at ${ROOT}/${FILE})`),
      getSource: () => Promise.resolve(null),
    } as unknown as ReactGrabAPI;
    for (let i = 0; i < 8; i++) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    const written = stubExecCommand();

    click('.copyall');

    expect(written['text/plain']).toContain(
      `> ⚛️ in CreateButton (at ${FILE})`,
    );
  });
});
