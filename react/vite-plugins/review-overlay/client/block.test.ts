import { captureAnchorSignals } from './anchor.js';
import {
  buildBlock,
  buildBlockFromCapture,
  buildBlockHtml,
  buildBlockText,
  buildSetHtml,
  buildSetText,
  captureForBlock,
  landmarkLabel,
  LINK_LABEL,
  LINK_LABEL_HTML,
  resolveRouteLabel,
} from './block.js';
import { decodeAnchor } from './codec.js';
import { MAX_SET_PINS } from './deeplink.js';
import type { AnchorV3, SetPin } from './types.js';
import { describe, expect, it } from 'vitest';

const anchor: AnchorV3 = {
  v: 3,
  s: '[data-testid="login-button"]',
  p: '/session/start',
  tag: 'button',
  txt: 'Login',
  tid: 'login-button',
};

describe('resolveRouteLabel', () => {
  it('uses the app-published English label when present', () => {
    expect(resolveRouteLabel('/session/start', 'Sessions › Start')).toBe(
      'Sessions › Start',
    );
  });

  it('falls back to the raw pathname, with no capitalisation', () => {
    expect(resolveRouteLabel('/session/start')).toBe('/session/start');
    expect(resolveRouteLabel('/session/start', '')).toBe('/session/start');
    expect(resolveRouteLabel('/session/start', '   ')).toBe('/session/start');
    expect(resolveRouteLabel('/session/start', null)).toBe('/session/start');
    expect(resolveRouteLabel('/')).toBe('/');
  });

  // The label is read by a human on both branches of `anchorRouteLabel` —
  // the reader's own route as much as the anchor's.
  it('decodes the pathname it falls back to', () => {
    expect(
      resolveRouteLabel('/project/a%ED%95%9C%EA%B5%AD%EC%96%B4/start'),
    ).toBe('/project/a한국어/start');
    expect(resolveRouteLabel('/100%off')).toBe('/100%off');
  });
});

describe('landmarkLabel', () => {
  it('joins route › testid landmark › tag "text"', () => {
    expect(landmarkLabel('Sessions', anchor)).toBe(
      'Sessions › login-button › button "Login"',
    );
  });

  it('drops the landmark when the element has no testid ancestor', () => {
    expect(landmarkLabel('Sessions', { ...anchor, tid: undefined })).toBe(
      'Sessions › button "Login"',
    );
  });

  it('drops the quoted text when the element has none', () => {
    expect(landmarkLabel('Sessions', { ...anchor, txt: undefined })).toBe(
      'Sessions › login-button › button',
    );
  });

  // The element in a box select's anchor is the FRAME the region was measured
  // in, not the thing picked, so the label must not read as "this button".
  it('names a box select as a region in its frame', () => {
    expect(
      landmarkLabel('Sessions', {
        ...anchor,
        tag: 'div',
        sel: { x: 0.1, y: 0.2, w: 0.5, h: 0.3 },
      }),
    ).toBe('Sessions › login-button › region in div "Login"');
  });
});

describe('buildBlockText', () => {
  const base = {
    label: 'Sessions › login-button › button "Login"',
    id: 'c_abcdefg',
    stack: ['in LoginButton (at LoginView.tsx:12)', '  in LoginView'],
    text: 'The label is cut off\non narrow screens.',
    url: 'https://fr-3811.localhost:1355/session/start#bai=v3.c_abcdefg.PAYLOAD',
    pr: 9330,
    at: '2026-08-31T09:00:00Z',
  };

  // The note is the comment's own prose: it must not read as a quote of
  // something someone else said.
  it('leads with the verbatim UNQUOTED note, then the quoted generated lines', () => {
    expect(buildBlockText(base)).toBe(
      [
        'The label is cut off',
        'on narrow screens.',
        '',
        '> 📍 **Sessions › login-button › button "Login"** · `c_abcdefg`',
        '> ⚛️ in LoginButton (at LoginView.tsx:12)',
        '>   in LoginView',
        '> [Open on dev server](https://fr-3811.localhost:1355/session/start#bai=v3.c_abcdefg.PAYLOAD)',
        '<!-- bai-review v3 id=c_abcdefg pr=9330 at=2026-08-31T09:00:00Z -->',
      ].join('\n'),
    );
  });

  it('still produces a complete block when the note is empty', () => {
    const block = buildBlockText({ ...base, text: '', stack: [] });
    expect(block).toBe(
      [
        '> 📍 **Sessions › login-button › button "Login"** · `c_abcdefg`',
        '> [Open on dev server](https://fr-3811.localhost:1355/session/start#bai=v3.c_abcdefg.PAYLOAD)',
        '<!-- bai-review v3 id=c_abcdefg pr=9330 at=2026-08-31T09:00:00Z -->',
      ].join('\n'),
    );
  });

  it('keeps a one-line note on one line, with one blank line under it', () => {
    expect(
      buildBlockText({ ...base, text: 'Pin is 8px off.', stack: [] }),
    ).toBe(
      [
        'Pin is 8px off.',
        '',
        '> 📍 **Sessions › login-button › button "Login"** · `c_abcdefg`',
        '> [Open on dev server](https://fr-3811.localhost:1355/session/start#bai=v3.c_abcdefg.PAYLOAD)',
        '<!-- bai-review v3 id=c_abcdefg pr=9330 at=2026-08-31T09:00:00Z -->',
      ].join('\n'),
    );
  });

  // Markdown treats `>` as prose, so a note that itself starts with one is the
  // reviewer quoting someone, not the block quoting the reviewer.
  it('does not touch a note that already contains markdown', () => {
    expect(
      buildBlockText({ ...base, text: '> not our quote\n**bold**', stack: [] }),
    ).toContain('> not our quote\n**bold**\n\n> 📍');
  });

  it('renders the reserved image slot only when one is supplied', () => {
    expect(buildBlockText(base)).not.toContain('![screenshot]');
    expect(
      buildBlockText({ ...base, imageUrl: 'https://example.test/a.png' }),
    ).toContain('> ![screenshot](https://example.test/a.png)');
  });
});

describe('buildBlockHtml', () => {
  const base = {
    label: 'Sessions › login-button › button "Login"',
    id: 'c_abcdefg',
    stack: ['in LoginButton (at LoginView.tsx:12)', '  in LoginView'],
    text: 'The label is cut off\non narrow screens.',
    url: 'https://fr-3811.localhost:1355/session/start#bai=v3.c_abcdefg.PAYLOAD',
    pr: 9330,
    at: '2026-08-31T09:00:00Z',
  };

  it('renders the note as a paragraph and the generated half as a blockquote', () => {
    expect(buildBlockHtml(base)).toBe(
      [
        '<p>The label is cut off<br>on narrow screens.</p>',
        '<blockquote>📍 <b>Sessions › login-button › button &quot;Login&quot;</b> · <code>c_abcdefg</code>' +
          '<br>⚛️ in LoginButton (at LoginView.tsx:12)' +
          '<br>&nbsp;&nbsp;in LoginView' +
          '<br><a href="https://fr-3811.localhost:1355/session/start#bai=v3.c_abcdefg.PAYLOAD">Open on dev server ↗</a>' +
          '</blockquote>',
        '<!-- bai-review v3 id=c_abcdefg pr=9330 at=2026-08-31T09:00:00Z -->',
      ].join('\n'),
    );
  });

  it('drops the paragraph entirely when the note is empty', () => {
    const html = buildBlockHtml({ ...base, text: '', stack: [] });
    expect(html.startsWith('<blockquote>')).toBe(true);
    expect(html).not.toContain('<p>');
  });

  // The label carries text copied off the page; a `<` in it must not become
  // markup, and neither must anything the reviewer typed.
  it('escapes the note, the label and the id', () => {
    const html = buildBlockHtml({
      ...base,
      label: 'Start › a <b> & "quoted"',
      text: '<b>&"</b>',
      stack: ['in <Weird> & co'],
    });
    expect(html).toContain('<p>&lt;b&gt;&amp;&quot;&lt;/b&gt;</p>');
    expect(html).toContain(
      '<b>Start › a &lt;b&gt; &amp; &quot;quoted&quot;</b>',
    );
    expect(html).toContain('⚛️ in &lt;Weird&gt; &amp; co');
  });

  it('escapes the link href but keeps it a real anchor', () => {
    expect(
      buildBlockHtml({ ...base, url: 'http://h/p?a=1&b=2#bai=v3.x.Y' }),
    ).toContain('<a href="http://h/p?a=1&amp;b=2#bai=v3.x.Y">');
  });

  it('renders the reserved image slot only when one is supplied', () => {
    expect(buildBlockHtml(base)).not.toContain('<img');
    expect(
      buildBlockHtml({ ...base, imageUrl: 'https://example.test/a.png' }),
    ).toContain('<img src="https://example.test/a.png" alt="screenshot">');
  });

  // One model, two renderers — a line added to the block cannot land in one.
  it('carries every generated line of the markdown flavour', () => {
    const html = buildBlockHtml(base);
    for (const piece of ['📍', '⚛️', 'in LoginView', 'Open on dev server']) {
      expect(html).toContain(piece);
    }
    expect(html).toContain(
      '<!-- bai-review v3 id=c_abcdefg pr=9330 at=2026-08-31T09:00:00Z -->',
    );
  });
});

/**
 * GitHub's comment box runs `@github/paste-markdown`, whose HTML handler takes
 * `text/plain` as the base and rewrites every `text/html` anchor's own text
 * where it finds it there into `[text](href)`. This is the invariant that
 * keeps it from firing inside our markdown link and doubling it.
 */
describe('the two flavours cannot collide in a markdown paste target', () => {
  const base = {
    label: 'Sessions › login-button › button "Login"',
    id: 'c_abcdefg',
    stack: ['in LoginButton (at LoginView.tsx:12)'],
    text: 'The label is cut off.',
    url: 'https://fr-3811.localhost:1355/session/start#bai=v3.c_abcdefg.PAYLOAD',
    pr: 9330,
    at: '2026-08-31T09:00:00Z',
  };

  it('never puts the HTML anchor’s link text in the markdown flavour', () => {
    expect(buildBlockText(base)).not.toContain(LINK_LABEL_HTML);
  });

  it('still gives each flavour a readable label and the same href', () => {
    expect(buildBlockText(base)).toContain(`[${LINK_LABEL}](${base.url})`);
    expect(buildBlockHtml(base)).toContain(
      `<a href="${base.url}">${LINK_LABEL_HTML}</a>`,
    );
  });

  /** The mechanism itself, reduced to the one line of the library that fires. */
  it('leaves the markdown untouched under the library’s rewrite', () => {
    const plain = buildBlockText(base);
    const html = buildBlockHtml(base);
    const anchorText = html.slice(
      html.indexOf('">', html.indexOf('<a href=')) + 2,
      html.indexOf('</a>'),
    );
    expect(anchorText).toBe(LINK_LABEL_HTML);
    expect(plain.indexOf(anchorText)).toBe(-1);
  });
});

describe('buildBlock', () => {
  it('links a URL whose anchor decodes back to the captured payload', async () => {
    document.body.innerHTML =
      '<div data-testid="login-card"><button id="go">Login</button></div>';
    const target = document.querySelector('#go') as Element;

    const built = await buildBlock({
      target,
      text: 'note',
      pr: 9330,
      routeLabel: 'Sessions',
      stack: [],
      component: {
        name: 'LoginView',
        src: 'src/components/LoginView.tsx:12:4',
      },
      at: '2026-08-31T09:00:00Z',
      origin: 'https://fr-3811.localhost:1355',
    });

    const hash = new URL(built.url).hash;
    expect(hash).toBe(`#bai=v3.${built.id}.${built.anchorB64}`);

    const decoded = await decodeAnchor(built.anchorB64);
    expect(decoded).toMatchObject({
      v: 3,
      s: '#go',
      tag: 'button',
      txt: 'Login',
      tid: 'login-card',
      c: { name: 'LoginView', src: 'src/components/LoginView.tsx:12:4' },
    });
    expect(built.block).toContain(`\`${built.id}\``);
    expect(built.block).toContain(
      `<!-- bai-review v3 id=${built.id} pr=9330 at=2026-08-31T09:00:00Z -->`,
    );
  });

  /**
   * The overlay does the async half at PICK time and only renders inside the
   * copy gesture, so `execCommand('copy')` still sees the user activation on
   * the plain-http origin. Both routes must produce the same block.
   */
  it('accepts a precomputed capture instead of a target', async () => {
    document.body.innerHTML =
      '<div data-testid="login-card"><button id="go">Login</button></div>';
    const target = document.querySelector('#go') as Element;
    const options = {
      text: 'note',
      pr: 9330,
      routeLabel: 'Sessions',
      at: '2026-08-31T09:00:00Z',
      origin: 'https://fr-3811.localhost:1355',
    };

    const capture = await captureForBlock(
      captureAnchorSignals(target),
      ['in LoginButton'],
      { name: 'LoginView', src: 'src/components/LoginView.tsx:12:4' },
    );
    const fromCapture = await buildBlock({ ...options, capture });
    const fromTarget = await buildBlock({
      ...options,
      target,
      stack: ['in LoginButton'],
      component: {
        name: 'LoginView',
        src: 'src/components/LoginView.tsx:12:4',
      },
    });

    expect(fromCapture.block).toBe(fromTarget.block);
    expect(fromCapture.html).toBe(fromTarget.html);
    expect(fromCapture.anchor.c?.name).toBe('LoginView');
    expect(fromCapture.block).toContain('> ⚛️ in LoginButton');
  });

  it('renders synchronously from a capture — no await before the copy', async () => {
    document.body.innerHTML = '<button id="go">Login</button>';
    const capture = await captureForBlock(
      captureAnchorSignals(document.querySelector('#go') as Element),
      [],
    );
    const built = buildBlockFromCapture(capture, {
      text: '',
      pr: 9330,
      routeLabel: 'Sessions',
      at: '2026-08-31T09:00:00Z',
      origin: 'https://fr-3811.localhost:1355',
    });
    expect(built.url).toBe(
      `https://fr-3811.localhost:1355/#bai=v3.${built.id}.${built.anchorB64}`,
    );
    // Both flavours come out of the one synchronous render.
    expect(built.html).toContain(
      `<a href="${built.url}">${LINK_LABEL_HTML}</a>`,
    );
  });

  it('refuses to build without a target or a capture', async () => {
    await expect(
      buildBlock({ text: '', pr: 1, routeLabel: 'Sessions' }),
    ).rejects.toThrow(/target.*capture/);
  });
});

/**
 * The id fingerprints the encoded anchor, which now contains the note — so it
 * moves when the note does. Everything the reviewer pastes has to move with it.
 */
describe('a block whose anchor carries the note', () => {
  const options = {
    pr: 9330,
    routeLabel: 'Sessions',
    at: '2026-08-31T09:00:00Z',
    origin: 'https://fr-3811.localhost:1355',
    noteInAnchor: true,
  };

  const build = (text: string) => {
    document.body.innerHTML = '<button id="go">Login</button>';
    return buildBlock({
      ...options,
      text,
      target: document.querySelector('#go') as Element,
      stack: [],
    });
  };

  it('carries the note to the pin, and the same id everywhere', async () => {
    const built = await build(
      'The button is misaligned.\nIt should sit flush.',
    );
    await expect(decodeAnchor(built.anchorB64)).resolves.toMatchObject({
      n: 'The button is misaligned.\nIt should sit flush.',
    });
    // Block body, marker and link: one id, or the reviewer's paste is a lie.
    expect(built.block).toContain(`\`${built.id}\``);
    expect(built.block).toContain(`id=${built.id} `);
    expect(built.url).toContain(`#bai=v3.${built.id}.`);
    expect(built.html).toContain(built.id);
  });

  it('gives the same id for the same note, and a new one when it changes', async () => {
    const first = await build('same note');
    const again = await build('same note');
    const edited = await build('edited note');
    expect(again.id).toBe(first.id);
    expect(again.anchorB64).toBe(first.anchorB64);
    expect(edited.id).not.toBe(first.id);
  });

  it('carries no note key when the reviewer typed nothing', async () => {
    const built = await build('   ');
    const decoded = await decodeAnchor(built.anchorB64);
    expect(decoded && 'n' in decoded).toBe(false);
  });

  it('caps the anchor copy while the block keeps the whole note', async () => {
    const long = 'x'.repeat(400);
    const built = await build(long);
    const decoded = await decodeAnchor(built.anchorB64);
    expect(decoded?.n).toHaveLength(280);
    expect(decoded?.nt).toBe(1);
    expect(built.block).toContain(long);
  });
});

/**
 * The set format. A pin set of one has to stay byte-identical to what the
 * overlay has been copying, or every link and block already in the wild reads
 * differently from the ones written next.
 */
describe('a pin set', () => {
  const ORIGIN = 'https://fr-3856.localhost:1355';

  const first = (): SetPin => ({
    id: 'c_aaaaaa2',
    origin: 'pick',
    anchor: {
      v: 3,
      s: '#login',
      p: '/session/start',
      q: 'tab=general',
      n: 'The label is cut off.',
    },
    anchorB64: 'PAYLOAD1',
    label: 'Sessions › login-button › button "Login"',
    appHash: '',
    stack: ['in LoginButton (at LoginView.tsx:12)'],
    at: '2026-08-31T09:00:00Z',
    pr: 9330,
  });

  const second = (): SetPin => ({
    id: 'c_bbbbbb3',
    origin: 'pick',
    anchor: {
      v: 3,
      s: '#search',
      p: '/session/start',
      q: 'tab=general',
      n: 'Placeholder is stale.',
    },
    anchorB64: 'PAYLOAD2',
    label: 'Sessions › filter-row › input "Search"',
    appHash: '',
    stack: [],
    at: '2026-08-31T09:01:00Z',
    pr: 9330,
  });

  /** Off a link: no `at`/`pr` ever travelled, so no marker may be emitted. */
  const third = (): SetPin => ({
    id: 'c_cccccc4',
    origin: 'link',
    anchor: { v: 3, s: '#create', p: '/start' },
    anchorB64: 'PAYLOAD3',
    label: 'Start › page-start › button',
    appHash: '',
    stack: ['in StartPage'],
  });

  describe('of one', () => {
    it('is the block the overlay copies today', () => {
      expect(buildSetText([first()], { origin: ORIGIN })).toBe(
        [
          'The label is cut off.',
          '',
          '> 📍 **Sessions › login-button › button "Login"** · `c_aaaaaa2`',
          '> ⚛️ in LoginButton (at LoginView.tsx:12)',
          `> [Open on dev server](${ORIGIN}/session/start?tab=general#bai=v3.c_aaaaaa2.PAYLOAD1)`,
          '<!-- bai-review v3 id=c_aaaaaa2 pr=9330 at=2026-08-31T09:00:00Z -->',
        ].join('\n'),
      );
    });

    it('keeps the app fragment the pin was made under', () => {
      expect(
        buildSetText([{ ...first(), appHash: 'tab=logs' }], { origin: ORIGIN }),
      ).toContain(
        `> [Open on dev server](${ORIGIN}/session/start?tab=general#tab=logs&bai=v3.c_aaaaaa2.PAYLOAD1)`,
      );
    });

    it('is one blockquote, with nothing separating it from itself', () => {
      const html = buildSetHtml([first()], { origin: ORIGIN });
      expect(html).not.toContain('<p></p>');
      expect(html).toBe(
        [
          '<p>The label is cut off.</p>',
          '<blockquote>📍 <b>Sessions › login-button › button &quot;Login&quot;</b> · <code>c_aaaaaa2</code>' +
            '<br>⚛️ in LoginButton (at LoginView.tsx:12)' +
            `<br><a href="${ORIGIN}/session/start?tab=general#bai=v3.c_aaaaaa2.PAYLOAD1">Open on dev server ↗</a>` +
            '</blockquote>',
          '<!-- bai-review v3 id=c_aaaaaa2 pr=9330 at=2026-08-31T09:00:00Z -->',
        ].join('\n'),
      );
    });
  });

  describe('of three', () => {
    const pins = () => [first(), second(), third()];
    const HASH =
      '#bai=v3.c_aaaaaa2.PAYLOAD1&bai=v3.c_bbbbbb3.PAYLOAD2&bai=v3.c_cccccc4.PAYLOAD3';
    const URL = `${ORIGIN}/session/start?tab=general${HASH}`;
    const OWN1 = `${ORIGIN}/session/start?tab=general#bai=v3.c_aaaaaa2.PAYLOAD1`;
    const OWN2 = `${ORIGIN}/session/start?tab=general#bai=v3.c_bbbbbb3.PAYLOAD2`;
    const OWN3 = `${ORIGIN}/start#bai=v3.c_cccccc4.PAYLOAD3`;

    // A block is pasted on its own as often as the set is, and a block without
    // a link carries no anchor at all — but the SET's link in every block is
    // what made the comment grow as N².
    it('gives every block its own link, and the set link once', () => {
      const text = buildSetText(pins(), { origin: ORIGIN });
      for (const own of [OWN1, OWN2, OWN3]) {
        expect(text.split(`[Open on dev server](${own})`)).toHaveLength(2);
      }
      expect(
        text.split(`[Open all 3 pins on dev server](${URL})`),
      ).toHaveLength(2);
    });

    it('separates the markdown blocks with one blank line', () => {
      const text = buildSetText(pins(), { origin: ORIGIN });
      expect(text).toContain(
        '<!-- bai-review v3 id=c_aaaaaa2 pr=9330 at=2026-08-31T09:00:00Z -->\n\nPlaceholder is stale.',
      );
      // A link's pin has no marker to close its block with.
      expect(text).not.toContain('id=c_cccccc4');
      expect(text.trimEnd().endsWith(')')).toBe(true);
    });

    it('renders the rich flavour verbatim', () => {
      const href = URL.replace(/&/g, '&amp;');
      expect(buildSetHtml(pins(), { origin: ORIGIN })).toBe(
        [
          '<p>The label is cut off.</p>',
          '<blockquote>📍 <b>Sessions › login-button › button &quot;Login&quot;</b> · <code>c_aaaaaa2</code>' +
            '<br>⚛️ in LoginButton (at LoginView.tsx:12)' +
            `<br><a href="${OWN1}">Open on dev server ↗</a>` +
            '</blockquote>',
          '<!-- bai-review v3 id=c_aaaaaa2 pr=9330 at=2026-08-31T09:00:00Z -->',
          '<p></p>',
          '<p>Placeholder is stale.</p>',
          '<blockquote>📍 <b>Sessions › filter-row › input &quot;Search&quot;</b> · <code>c_bbbbbb3</code>' +
            `<br><a href="${OWN2}">Open on dev server ↗</a>` +
            '</blockquote>',
          '<!-- bai-review v3 id=c_bbbbbb3 pr=9330 at=2026-08-31T09:01:00Z -->',
          '<p></p>',
          '<blockquote>📍 <b>Start › page-start › button</b> · <code>c_cccccc4</code>' +
            '<br>⚛️ in StartPage' +
            `<br><a href="${OWN3}">Open on dev server ↗</a>` +
            '</blockquote>',
          `<p><a href="${href}">Open all 3 pins on dev server ↗</a></p>`,
        ].join('\n'),
      );
    });

    // `@github/paste-markdown` rewrites an HTML anchor whose text it finds in
    // the plain flavour; the ↗ keeps the set link out of its reach too.
    it('keeps the rich set label out of the markdown flavour', () => {
      const text = buildSetText(pins(), { origin: ORIGIN });
      expect(text).not.toContain('Open all 3 pins on dev server ↗');
    });

    // The link de-duplicates by id, so the blocks must too — two blocks for
    // one link part is two markers claiming one pin.
    it('emits a pin once, however often it was added', () => {
      const text = buildSetText([first(), second(), first()], {
        origin: ORIGIN,
      });
      expect(text.split('📍')).toHaveLength(3);
      expect(text.match(/id=c_aaaaaa2 /g)).toHaveLength(1);
      // Once in its own block's link, once in the set link at the end.
      expect(text.split('bai=v3.c_aaaaaa2.PAYLOAD1')).toHaveLength(3);
      expect(
        buildSetHtml([first(), second(), first()], { origin: ORIGIN }).split(
          '<p></p>',
        ),
      ).toHaveLength(2);
    });
  });

  /**
   * Repeating the set's own URL — which grows with N — in each of the N blocks
   * made the comment quadratic: 30 pins came to 371 KB, and GitHub refuses a
   * body over 65,536 characters from about 12 pins on. One link per block plus
   * one set link is linear, so the D9 cap of 30 is a size the reviewer can
   * actually paste.
   */
  describe('grows linearly with the number of pins', () => {
    const B64 = 'P'.repeat(380);
    const many = (count: number): SetPin[] =>
      Array.from({ length: count }, (_unused, i) => ({
        ...first(),
        id: `c_${'abcdefg'.slice(0, 6)}${i.toString(36)}`,
        anchorB64: `${B64}${i}`,
      }));
    const size = (count: number) =>
      buildSetText(many(count), { origin: ORIGIN }).length;

    it('fits a full set in a GitHub comment body', () => {
      expect(many(MAX_SET_PINS)).toHaveLength(30);
      expect(size(MAX_SET_PINS)).toBeLessThan(65536);
      expect(
        buildSetHtml(many(MAX_SET_PINS), { origin: ORIGIN }).length,
      ).toBeLessThan(65536);
    });

    it('doubles, not quadruples, when the set doubles', () => {
      // Quadratic growth put this ratio near 4; the constant term keeps it
      // just under 2 here, and the bound catches any return to N².
      expect(size(20) / size(10)).toBeLessThan(2.2);
    });
  });

  describe('with a note longer than the link carries', () => {
    const long = `${'x'.repeat(300)} and the rest of what was typed`;
    const short = `${long.slice(0, 279)}…`;

    /** `withNote` caps `anchor.n` at `NOTE_MAX` and flags it with `nt`. */
    const capped = (): SetPin => {
      const pin = first();
      return { ...pin, anchor: { ...pin.anchor, n: short, nt: 1 }, note: long };
    };

    it('leads the block with the whole note, not the shortened one', () => {
      const text = buildSetText([capped()], { origin: ORIGIN });

      expect(text.split('\n')[0]).toBe(long);
      expect(text).toContain(
        `> [Open on dev server](${ORIGIN}/session/start?tab=general#bai=v3.c_aaaaaa2.PAYLOAD1)`,
      );
    });

    // A link's pin never travelled with the note the reviewer typed; the
    // shortened one the anchor carries is all there is.
    it('falls back to the anchor for a pin that came off a link', () => {
      const pin = capped();
      const fromLink: SetPin = {
        id: pin.id,
        origin: 'link',
        anchor: pin.anchor,
        anchorB64: pin.anchorB64,
        label: pin.label,
        appHash: '',
        stack: [],
      };

      expect(buildSetText([fromLink], { origin: ORIGIN }).split('\n')[0]).toBe(
        short,
      );
    });
  });
});

describe('the marker a block may not claim', () => {
  const base = {
    label: 'Sessions › login-button › button "Login"',
    id: 'c_abcdefg',
    stack: [],
    text: '',
    url: 'https://dev.test/#bai=v3.c_abcdefg.PAYLOAD1',
    pr: 0,
    at: '',
    marker: false,
  };

  // The id hashes from `pr` + anchor + `at`; a fabricated marker would name
  // an id that does not verify against itself.
  it('is left off both flavours when the pin has no pr/at of its own', () => {
    expect(buildBlockText(base)).not.toContain('<!-- bai-review');
    expect(buildBlockHtml(base)).not.toContain('<!-- bai-review');
  });
});

/**
 * The write side used to drop the app's own fragment while the read side kept
 * it, so a copy made on `#tab=logs` reopened on the wrong tab. One builder now,
 * and it is the read side's behaviour that survived.
 */
describe('the link a fresh pick copies', () => {
  const build = async (appHash?: string) => {
    document.body.innerHTML = '<button id="go">Login</button>';
    const capture = await captureForBlock(
      captureAnchorSignals(document.querySelector('#go') as Element),
      [],
    );
    return buildBlockFromCapture(capture, {
      text: '',
      pr: 9330,
      routeLabel: 'Sessions',
      at: '2026-08-31T09:00:00Z',
      origin: 'https://dev.test',
      appHash,
    });
  };

  it('keeps the fragment it was handed', async () => {
    const built = await build('#tab=logs');
    expect(built.url).toBe(
      `https://dev.test/#tab=logs&bai=v3.${built.id}.${built.anchorB64}`,
    );
  });

  it('reads the live fragment otherwise, without the pin already in it', async () => {
    history.replaceState({}, '', '/#tab=logs&bai=v3.c_zdv3rhz.QUJDREVGR0g');
    try {
      const built = await build();
      expect(built.url).toBe(
        `https://dev.test/#tab=logs&bai=v3.${built.id}.${built.anchorB64}`,
      );
    } finally {
      history.replaceState({}, '', '/');
    }
  });
});
