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

/** Boot the overlay on a `#bai=v3` link to `[data-testid="create"]`. */
async function openPin(over: Partial<AnchorV3> = {}): Promise<string> {
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
  history.replaceState({}, '', `/#bai=v3.${ID}.${anchorB64}`);
  window.__REACT_GRAB__ = {
    activate: () => undefined,
    deactivate: () => undefined,
    isActive: () => false,
    registerPlugin: (_plugin: Plugin) => undefined,
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
  // The state gate, the anchor inflate, the locate ladder and the stack read.
  for (let i = 0; i < 12; i++) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  return anchorB64;
}

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
    // `at` is this copy's own instant; the id is what carries the identity.
    expect(lines[5]).toMatch(
      new RegExp(`^<!-- bai-review v3 id=${ID} pr=42 at=\\S+ -->$`),
    );
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
});
