import { buildBlockText } from '../client/block.js';
import { encodeAnchor } from '../client/codec.js';
import type { AnchorV3 } from '../client/types.js';
import {
  extractPinLinks,
  isAnchorV3,
  normalizedText,
  pinText,
} from './extract.js';
import { describe, expect, it } from 'vitest';

const anchor: AnchorV3 = {
  v: 3,
  s: 'button:nth-of-type(1)',
  p: '/session',
  q: 'status=RUNNING',
  tag: 'button',
  txt: 'Login',
};

const block = async (id: string, text = 'Pin is 8px off.') =>
  buildBlockText({
    label: 'Start › page-start › button "Login"',
    id,
    stack: [],
    text,
    url: `http://dev.example/session?status=RUNNING#bai=v3.${id}.${await encodeAnchor(anchor)}`,
    pr: 9337,
    at: '2026-09-01T08:12:00Z',
  });

describe('extractPinLinks', () => {
  it('reads the id and the anchor out of a real block', async () => {
    const body = await block('c_zdv3rhz');
    const [link] = extractPinLinks(body);
    expect(link.id).toBe('c_zdv3rhz');
    expect(link.anchorB64).toBe(await encodeAnchor(anchor));
    expect(link.quoted).toBe(true);
  });

  it('matches after percent-decoding', () => {
    const body = 'see http://dev/x%23bai%3Dv3.c_abc2345.QUJDREVGR0g';
    expect(extractPinLinks(body)).toEqual([
      { id: 'c_abc2345', anchorB64: 'QUJDREVGR0g', quoted: false },
    ]);
  });

  it('matches after HTML-unescaping', () => {
    const body = '&gt; [x](http://dev/p#bai&#61;v3.c_abc2345&amp;t=1)';
    expect(extractPinLinks(body)[0].id).toBe('c_abc2345');
  });

  it('accepts the short id-only form', () => {
    expect(extractPinLinks('look at #bai=v3.c_zdv3rhz please')).toEqual([
      { id: 'c_zdv3rhz', anchorB64: null, quoted: false },
    ]);
  });

  it('collapses a duplicated id inside one body and keeps the anchor', async () => {
    const body = `${await block('c_zdv3rhz')}\n\nsame pin: #bai=v3.c_zdv3rhz`;
    const links = extractPinLinks(body);
    expect(links).toHaveLength(1);
    expect(links[0].anchorB64).toBeTruthy();
  });

  it('flags a pin that is not inside a quote block', () => {
    const body = 'no quote here #bai=v3.c_zdv3rhz.QUJDREVGR0g';
    expect(extractPinLinks(body)[0].quoted).toBe(false);
  });

  it('ignores v1 links and malformed ids', () => {
    expect(extractPinLinks('#bai-review=eJxxx and #bai=v3.zdv3rhz')).toEqual(
      [],
    );
  });
});

describe('pinText', () => {
  it('keeps the quote block and drops the link and the marker', async () => {
    const text = pinText(await block('c_zdv3rhz'));
    expect(text).toContain('📍 **Start › page-start › button "Login"**');
    expect(text).toContain('Pin is 8px off.');
    expect(text).not.toContain('Open on dev server');
    expect(text).not.toContain('bai-review v3');
  });

  it('falls back to the whole body when nothing is quoted', () => {
    expect(pinText('Fixed in abc1234 — padding.')).toBe(
      'Fixed in abc1234 — padding.',
    );
  });

  it('caps runaway bodies', () => {
    expect(pinText('x'.repeat(900))).toHaveLength(400);
  });
});

describe('normalizedText', () => {
  it('ignores the formatting a channel applies to the same block', () => {
    expect(normalizedText('> 📍 **Start › button** · `c_x`')).toBe(
      normalizedText('📍 Start button c_x'),
    );
  });

  it('separates a reply from the block it answers', () => {
    expect(normalizedText('Fixed in abc1234')).not.toBe(
      normalizedText('Pin is 8px off'),
    );
  });
});

describe('isAnchorV3', () => {
  it('accepts a full anchor', () => {
    expect(
      isAnchorV3({ ...anchor, rect: { x: 0, y: 0.5, w: 1, h: 0.2 } }),
    ).toBe(true);
  });

  it.each([
    ['a v1 payload', { v: 1, s: 'button', p: '/' }],
    ['no selector', { v: 3, p: '/' }],
    ['an off-origin path', { v: 3, s: 'button', p: '//evil.example' }],
    ['a query with a fragment', { v: 3, s: 'b', p: '/', q: 'a=1#x' }],
    ['a hostile tag', { v: 3, s: 'b', p: '/', tag: 'script[x]' }],
    ['a non-string testid', { v: 3, s: 'b', p: '/', tid: 7 }],
    ['a partial rect', { v: 3, s: 'b', p: '/', rect: { x: 0, y: 0 } }],
    [
      'a non-finite rect',
      { v: 3, s: 'b', p: '/', rect: { x: NaN, y: 0, w: 1, h: 1 } },
    ],
    [
      'a component that is not an object',
      { v: 3, s: 'b', p: '/', c: 'Button' },
    ],
  ])('rejects %s', (_label, value) => {
    expect(isAnchorV3(value)).toBe(false);
  });
});
