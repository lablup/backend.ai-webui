import { API_VERSION, main, parsePins, parseResult } from './cli.js';
import { buildBlockFromCapture, buildSetText } from './client/block.js';
import { encodeAnchor } from './client/codec.js';
import { pinSetUrl } from './client/deeplink.js';
import { pinId } from './client/id.js';
import type { AnchorV3, SetPin } from './client/types.js';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';

// `new URL(..., import.meta.url)` is Vite's asset-reference pattern and gets
// rewritten in this file, so the sample paths are joined by hand.
const HERE = dirname(fileURLToPath(import.meta.url));
const samplePath = (name: string) => join(HERE, 'testdata', name);
const sample = (name: string) => readFileSync(samplePath(name), 'utf8');

const anchor: AnchorV3 = {
  v: 3,
  s: '[data-testid="page-start"] > button:nth-of-type(2)',
  p: '/project/default/session/start',
  q: 'tab=general',
  tag: 'button',
  txt: 'Create Deployment',
  tid: 'page-start',
};

describe('parse — the block samples the review skill reads today', () => {
  it('lifts both pins out of a two-block comment', async () => {
    const pins = await parsePins(sample('pin-block-sample.md'));
    expect(pins.map((pin) => pin.id)).toEqual(['c_ew7rxz4', 'c_6jcddj5']);
    expect(pins[0]).toMatchObject({
      label: 'Start › webui-header › button "Create Deployment"',
      note: 'Pin is 8px off and the tooltip is clipped.',
      pr: 9330,
      at: '2026-08-31T09:00:00Z',
      idVerified: true,
      stack: [
        'in ActionItemContent (at /src/components/ActionItemContent.tsx:47)',
        '  in Button (@astryxdesign/core)',
        '  in StartPage (at /src/pages/StartPage.tsx)',
      ],
    });
    expect(pins[0].anchor?.tid).toBe('webui-header');
    expect(pins[0].url).toContain('?tab=general#bai=v3.c_ew7rxz4.');
    // Two blocks in one comment must not steal each other's prose.
    expect(pins[1].note).toBe(
      'Placeholder still says "Search" after the filter is applied.',
    );
  });

  it('reads a block and a bare link from the same comment', async () => {
    const pins = await parsePins(sample('pin-block-noted-sample.md'));
    expect(pins.map((pin) => pin.id)).toEqual(['c_obk74wj', 'c_mlphw3p']);
    expect(pins[0].note).toBe(
      'The primary action drifts right of the filter row.\n' +
        'It should stay flush at 1280px and below.',
    );
    // The bare link has no block, so nothing proves its id and its note is
    // the capped copy the anchor carries.
    const bare = pins[1];
    expect(bare.idVerified).toBeNull();
    expect(bare.label).toBe('');
    expect(bare.stack).toEqual([]);
    expect(bare.note).toBe(bare.anchor?.n);
    expect(bare.anchor?.nt).toBe(1);
    expect(bare.url).toMatch(/^http:\/\/.+#bai=v3\.c_mlphw3p\./);
  });
});

describe('parse — links on their own', () => {
  it('finds a bare link with no block around it', async () => {
    const anchorB64 = await encodeAnchor(anchor);
    const pins = await parsePins(
      `have a look at https://fr-3855.localhost:1355/project/default/session/start?tab=general#bai=v3.c_abcdef2.${anchorB64} please`,
    );
    expect(pins).toHaveLength(1);
    expect(pins[0]).toMatchObject({
      id: 'c_abcdef2',
      label: '',
      note: '',
      pr: null,
      at: null,
      idVerified: null,
    });
    expect(pins[0].anchor).toEqual(anchor);
    expect(pins[0].url).toBe(
      `https://fr-3855.localhost:1355/project/default/session/start?tab=general#bai=v3.c_abcdef2.${anchorB64}`,
    );
  });

  it("decodes GitHub's quote-reply escaping of the link", async () => {
    const anchorB64 = await encodeAnchor(anchor);
    const quoted = `&gt; [Open on dev server](http://x/y%23bai%3Dv3.c_abcdef2.${anchorB64})`;
    const pins = await parsePins(quoted);
    expect(pins).toHaveLength(1);
    expect(pins[0].id).toBe('c_abcdef2');
    expect(pins[0].anchor).toEqual(anchor);
  });

  it('leaves a query the browser percent-encoded byte-identical', async () => {
    const encoded: AnchorV3 = { ...anchor, q: 'filter=a%20b' };
    const anchorB64 = await encodeAnchor(encoded);
    const url = `http://x/project/default/session/start?filter=a%20b#bai=v3.c_abcdef2.${anchorB64}`;
    const pins = await parsePins(url);
    expect(pins[0].url).toBe(url);
  });

  it('unescapes a query that arrived as HTML entities', async () => {
    const multi: AnchorV3 = { ...anchor, q: 'tab=general&status=RUNNING' };
    const anchorB64 = await encodeAnchor(multi);
    const pins = await parsePins(
      `look at http://x/project/default/session/start?tab=general&amp;status=RUNNING#bai=v3.c_abcdef2.${anchorB64} please`,
    );
    expect(pins[0].url).toContain('?tab=general&status=RUNNING#');
    expect(pins[0].url).not.toContain('&amp;');
  });

  it('prefers the link whose query matches, whichever came first', async () => {
    const anchorB64 = await encodeAnchor(anchor);
    const full = `http://x/project/default/session/start?tab=general#bai=v3.c_abcdef2.${anchorB64}`;
    // What "Quote reply" leaves: the anchor without the query it was made on.
    const degraded = `http://x/project/default/session/start#bai=v3.c_abcdef2.${anchorB64}`;
    for (const text of [`${degraded}\n\n${full}`, `${full}\n\n${degraded}`]) {
      const pins = await parsePins(text);
      expect(pins).toHaveLength(1);
      expect(pins[0].url).toBe(full);
    }
  });

  // Pin count breaks a tie inside a tier; a pasted link must not outrank the
  // matching one by carrying more parts than the tiebreak has room for.
  it('prefers the matching link over a longer set on another page', async () => {
    const anchorB64 = await encodeAnchor(anchor);
    const match = `http://x/project/default/session/start?tab=general#bai=v3.c_abcdef2.${anchorB64}`;
    const padding = Array.from(
      { length: 200 },
      (_, i) =>
        `&bai=v3.c_${'abcdefghijklmnopqrstuvwxyz234567'[i % 32].repeat(7)}.QUJDREVGR0g`,
    ).join('');
    const longer = `http://x/elsewhere#bai=v3.c_abcdef2.${anchorB64}${padding}`;
    for (const text of [`${match}\n\n${longer}`, `${longer}\n\n${match}`]) {
      const pins = await parsePins(text);
      expect(pins[0].url).toBe(match);
    }
  });

  it('is not a pin without an anchor', async () => {
    expect(await parsePins('see #bai=v3.c_abcdef2 for the details')).toEqual(
      [],
    );
  });
});

describe('parse — bounds on untrusted input', () => {
  it('refuses an anchor longer than the codec allows', async () => {
    const oversize = 'A'.repeat(2100);
    expect(await parsePins(`http://x/y#bai=v3.c_abcdef2.${oversize}`)).toEqual(
      [],
    );
  });

  it('keeps the pin but not the payload when the anchor inflates past the cap', async () => {
    // A few dozen base64 chars that inflate to 40 KB: within the link
    // grammar's bounds, past the decoder's.
    const bomb = await encodeAnchor({ ...anchor, s: 'x'.repeat(40_000) });
    expect(bomb.length).toBeLessThan(2048);
    const pins = await parsePins(`http://x/y#bai=v3.c_abcdef2.${bomb}`);
    expect(pins).toHaveLength(1);
    expect(pins[0].anchor).toBeNull();
    expect(pins[0].url).toBe(`http://x/y#bai=v3.c_abcdef2.${bomb}`);
  });
});

describe('parse — id verification', () => {
  const block = async (id: string, pr: number, at: string, anchorB64: string) =>
    [
      'the note',
      '',
      `> 📍 **Start › page-start › button "Create Deployment"** · \`${id}\``,
      '> ⚛️ in StartPage (at /src/pages/StartPage.tsx:120)',
      `> [Open on dev server](http://x/project/default/session/start?tab=general#bai=v3.${id}.${anchorB64})`,
      `<!-- bai-review v3 id=${id} pr=${pr} at=${at} -->`,
    ].join('\n');

  it('proves an id against the marker that claims it', async () => {
    const anchorB64 = await encodeAnchor(anchor);
    const at = '2026-09-04T00:00:00Z';
    const id = pinId(9400, anchorB64, at);
    const pins = await parsePins(await block(id, 9400, at, anchorB64));
    expect(pins).toHaveLength(1);
    expect(pins[0]).toMatchObject({ id, pr: 9400, at, idVerified: true });
    expect(pins[0].note).toBe('the note');
  });

  it('drops a pin whose marker disowns its anchor', async () => {
    const anchorB64 = await encodeAnchor(anchor);
    const at = '2026-09-04T00:00:00Z';
    const id = pinId(9400, anchorB64, at);
    // The same marker over a different payload: this id does not hash from it.
    const other = await encodeAnchor({ ...anchor, txt: 'Cancel' });
    expect(await parsePins(await block(id, 9400, at, other))).toEqual([]);
  });
});

describe('parse — round trip with the block producer', () => {
  it('reads back what buildBlockFromCapture wrote', async () => {
    const anchorB64 = await encodeAnchor(anchor);
    const built = buildBlockFromCapture(
      {
        anchor,
        anchorB64,
        stack: ['in StartPage (at /src/pages/StartPage.tsx:120)'],
      },
      {
        text: 'the primary action drifts right',
        pr: 9400,
        routeLabel: 'Start',
        at: '2026-09-04T00:00:00Z',
        origin: 'https://fr-3855.localhost:1355',
      },
    );
    const pins = await parsePins(built.block);
    expect(pins).toHaveLength(1);
    expect(pins[0]).toMatchObject({
      id: built.id,
      url: built.url,
      label: 'Start › page-start › button "Create Deployment"',
      note: 'the primary action drifts right',
      stack: ['in StartPage (at /src/pages/StartPage.tsx:120)'],
      pr: 9400,
      at: '2026-09-04T00:00:00Z',
      idVerified: true,
    });
  });

  it('merges the same pin quoted twice into one', async () => {
    const anchorB64 = await encodeAnchor(anchor);
    const built = buildBlockFromCapture(
      { anchor, anchorB64, stack: [] },
      { text: '', pr: 9400, routeLabel: 'Start', at: '2026-09-04T00:00:00Z' },
    );
    const pins = await parsePins(`${built.block}\n\nand again: ${built.url}`);
    expect(pins).toHaveLength(1);
    expect(pins[0].idVerified).toBe(true);
  });
});

describe('the envelope and the exit codes', () => {
  it('names its api version', async () => {
    const result = await parseResult(sample('pin-block-sample.md'));
    expect(result.apiVersion).toBe(API_VERSION);
    expect(result.pins).toHaveLength(2);
  });

  it('parses through the loader the package script runs', () => {
    const out = execFileSync(
      process.execPath,
      [
        '--import',
        join(HERE, 'register.mjs'),
        join(HERE, 'cli.ts'),
        'parse',
        '--json',
        samplePath('pin-block-sample.md'),
      ],
      { encoding: 'utf8' },
    );
    const result = JSON.parse(out);
    expect(result.apiVersion).toBe(API_VERSION);
    expect(result.pins).toHaveLength(2);
  });

  it('exits 0 with pins, 5 without, 2 on a bad invocation', async () => {
    const write = vi
      .spyOn(process.stdout, 'write')
      .mockImplementation(() => true);
    const errors = vi
      .spyOn(process.stderr, 'write')
      .mockImplementation(() => true);
    const file = samplePath('pin-block-sample.md');
    try {
      await expect(main(['parse', '--json', file])).resolves.toBe(0);
      expect(JSON.parse(String(write.mock.calls[0][0])).pins).toHaveLength(2);
      await expect(main(['parse', '/dev/null'])).resolves.toBe(5);
      await expect(main(['pins', file])).resolves.toBe(2);
      await expect(main(['parse', `${file}.missing`])).resolves.toBe(2);
    } finally {
      write.mockRestore();
      errors.mockRestore();
    }
  });
});

describe('parse — a pin set in one link', () => {
  type PickedPin = Extract<SetPin, { origin: 'pick' }>;
  const setPin = (over: Partial<PickedPin>): PickedPin => ({
    id: 'c_aaaaaa2',
    origin: 'pick',
    anchor,
    anchorB64: '',
    label: 'Start › page-start › button "Create Deployment"',
    appHash: '',
    stack: [],
    at: '2026-09-04T00:00:00Z',
    pr: 9400,
    ...over,
  });

  /** Three real anchors, each with the id its own marker would claim. */
  const threePins = async (): Promise<SetPin[]> => {
    const at = '2026-09-04T00:00:00Z';
    const anchors: AnchorV3[] = [
      { ...anchor, n: 'first' },
      { ...anchor, s: '#second', n: 'second' },
      { v: 3, s: '#third', p: '/start', tag: 'button', n: 'third' },
    ];
    const pins: SetPin[] = [];
    for (const each of anchors) {
      const anchorB64 = await encodeAnchor(each);
      pins.push(
        setPin({
          id: pinId(9400, anchorB64, at),
          anchor: each,
          anchorB64,
          stack: [],
        }),
      );
    }
    return pins;
  };

  it('reads every pin of a bare set link, and hands each the whole link', async () => {
    const pins = await threePins();
    const url = `https://fr-3856.localhost:1355${pinSetUrl(pins)}`;
    const parsed = await parsePins(`please look at ${url} — all three`);
    expect(parsed.map((pin) => pin.id)).toEqual(pins.map((pin) => pin.id));
    expect(parsed.map((pin) => pin.url)).toEqual([url, url, url]);
    // A bare link carries the note in the anchor and nothing to prove the id.
    expect(parsed.map((pin) => pin.note)).toEqual(['first', 'second', 'third']);
    expect(parsed.map((pin) => pin.idVerified)).toEqual([null, null, null]);
  });

  it('reads a set GitHub quote-escaped the `&` of', async () => {
    const pins = await threePins();
    const url = `http://x${pinSetUrl(pins)}`;
    const quoted = `&gt; [Open on dev server](${url
      .replace('#', '%23')
      .replace(/&/g, '%26')
      .replace(/=v3/g, '%3Dv3')})`;
    const parsed = await parsePins(quoted);
    expect(parsed.map((pin) => pin.id)).toEqual(pins.map((pin) => pin.id));
  });

  it('reads a set whose `&` arrived as an HTML entity', async () => {
    const pins = await threePins();
    const url = `http://x${pinSetUrl(pins)}`;
    const parsed = await parsePins(url.replace(/&/g, '&amp;'));
    expect(parsed.map((pin) => pin.id)).toEqual(pins.map((pin) => pin.id));
    // The escaped copy carries only the first pin, so the whole set wins.
    expect(parsed.map((pin) => pin.url)).toEqual([url, url, url]);
  });

  it('reads back the blocks the set producer wrote', async () => {
    const pins = await threePins();
    // Off a link: `at`/`pr` never travelled, so no marker may be written.
    const linkOnly: SetPin = {
      ...pins[2],
      origin: 'link',
      at: undefined,
      pr: undefined,
    };
    const text = buildSetText([pins[0], pins[1], linkOnly], {
      origin: 'https://fr-3856.localhost:1355',
    });
    const parsed = await parsePins(text);
    expect(parsed.map((pin) => pin.id)).toEqual(pins.map((pin) => pin.id));
    expect(parsed.map((pin) => pin.note)).toEqual(['first', 'second', 'third']);
    expect(parsed[0].label).toBe(
      'Start › page-start › button "Create Deployment"',
    );
    // The two picked pins carry markers; the link's pin has none to be proved
    // by, and its whole block still reads.
    expect(parsed.map((pin) => pin.idVerified)).toEqual([true, true, null]);
  });
});
