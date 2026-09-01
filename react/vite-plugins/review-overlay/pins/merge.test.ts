import { encodeAnchor } from '../client/codec.js';
import type { AnchorV3 } from '../client/types.js';
import { normalizedText } from './extract.js';
import type { Occurrence } from './github.js';
import { attachAnchors, mergePins } from './merge.js';
import { describe, expect, it } from 'vitest';

const BLOCK = '📍 **Start › button "Login"** · `c_zdv3rhz`\noff by 8px';

const occurrence = (over: Partial<Occurrence> = {}): Occurrence => ({
  id: 'c_zdv3rhz',
  anchorB64: null,
  quoted: true,
  pr: 9337,
  channel: 'github',
  kind: 'comment',
  url: 'https://github.com/l/r/pull/9337#issuecomment-1',
  author: 'reviewer',
  createdAt: '2026-09-01T08:00:00Z',
  text: BLOCK,
  normalized: normalizedText(BLOCK),
  remainder: '',
  resolved: false,
  resolvedBy: null,
  outdated: false,
  hint: false,
  native: false,
  replies: [],
  ...over,
});

const reply = (over: Partial<Occurrence> = {}) =>
  occurrence({
    text: 'Fixed in abc1234 — padding.',
    normalized: normalizedText('Fixed in abc1234 — padding.'),
    createdAt: '2026-09-01T09:00:00Z',
    author: 'claude',
    ...over,
  });

describe('mergePins', () => {
  it('keys pins by id and numbers them by createdAt rank', () => {
    const pins = mergePins([
      occurrence({ id: 'c_bbbbbbb', createdAt: '2026-09-01T10:00:00Z' }),
      occurrence({ id: 'c_aaaaaaa', createdAt: '2026-09-01T08:00:00Z' }),
    ]);
    expect(pins.map((pin) => [pin.id, pin.number])).toEqual([
      ['c_aaaaaaa', 1],
      ['c_bbbbbbb', 2],
    ]);
  });

  it('folds the same block pasted again into a second source, not a reply', () => {
    const [pin] = mergePins([
      occurrence(),
      // A stack's lower layer, reformatted by the channel it went through.
      occurrence({
        pr: 9320,
        createdAt: '2026-09-01T08:30:00Z',
        text: `> ${BLOCK}`,
        url: 'https://github.com/l/r/pull/9320#issuecomment-2',
      }),
    ]);
    expect(pin.sources).toHaveLength(2);
    expect(pin.sources.map((source) => source.pr)).toEqual([9337, 9320]);
    expect(pin.replies).toEqual([]);
  });

  it('treats a later comment with different words as a reply', () => {
    const [pin] = mergePins([occurrence(), reply()]);
    expect(pin.replyCount).toBe(1);
    expect(pin.latestReply).toMatchObject({ author: 'claude' });
    // A reply is not also a source: the panel badges one PR once (R3.6).
    expect(pin.sources).toHaveLength(1);
  });

  it('reads a quote-reply as the block again plus its own answer', () => {
    const [pin] = mergePins([
      occurrence(),
      occurrence({
        pr: 9320,
        createdAt: '2026-09-01T09:00:00Z',
        author: 'claude',
        remainder: 'Fixed in abc1234 — padding.',
        url: 'https://github.com/l/r/pull/9320#issuecomment-2',
      }),
    ]);
    expect(pin.sources).toHaveLength(2);
    expect(pin.replyCount).toBe(1);
    expect(pin.latestReply).toMatchObject({
      author: 'claude',
      body: 'Fixed in abc1234 — padding.',
    });
  });

  it('badges one PR once however many copies it holds', () => {
    const [pin] = mergePins([
      occurrence(),
      occurrence({
        createdAt: '2026-09-01T08:30:00Z',
        url: 'https://github.com/l/r/pull/9337#issuecomment-2',
      }),
    ]);
    expect(pin.sources).toHaveLength(1);
  });

  it('carries a review thread’s own replies through', () => {
    const [pin] = mergePins([
      occurrence({
        kind: 'thread',
        native: true,
        replies: [
          {
            author: 'claude',
            body: 'Fixed in abc1234',
            createdAt: '2026-09-01T09:00:00Z',
            url: null,
          },
        ],
      }),
    ]);
    expect(pin.replyCount).toBe(1);
  });

  it('lets the native thread record win over an earlier quote-reply copy', () => {
    const [pin] = mergePins([
      occurrence({
        createdAt: '2026-09-01T07:00:00Z',
        url: 'https://github.com/l/r/pull/9337#issuecomment-1',
      }),
      occurrence({
        kind: 'thread',
        native: true,
        resolved: true,
        resolvedBy: 'owner',
        createdAt: '2026-09-01T08:00:00Z',
        url: 'https://github.com/l/r/pull/9337#discussion_r1',
      }),
    ]);
    expect(pin.sources[0].kind).toBe('thread');
    expect(pin.sourcePr).toBe(9337);
    expect(pin.createdAt).toBe('2026-09-01T08:00:00Z');
  });

  it('ORs resolved, outdated and hint across occurrences', () => {
    const [pin] = mergePins([
      occurrence(),
      occurrence({
        createdAt: '2026-09-01T08:30:00Z',
        resolved: true,
        resolvedBy: 'owner',
        outdated: true,
        hint: true,
      }),
    ]);
    expect(pin).toMatchObject({
      resolved: true,
      resolvedBy: 'owner',
      outdated: true,
      hint: true,
    });
  });

  it('keeps the anchor from whichever occurrence carried the full link', () => {
    const [pin] = mergePins([
      occurrence(),
      occurrence({
        createdAt: '2026-09-01T08:30:00Z',
        anchorB64: 'QUJDREVGR0g',
      }),
    ]);
    expect(pin.anchorB64).toBe('QUJDREVGR0g');
  });
});

describe('attachAnchors', () => {
  const anchor: AnchorV3 = { v: 3, s: 'button', p: '/', tag: 'button' };

  it('decodes a real anchor payload', async () => {
    const b64 = await encodeAnchor(anchor);
    const [pin] = await attachAnchors(
      mergePins([occurrence({ anchorB64: b64 })]),
    );
    expect(pin.anchor).toMatchObject({ v: 3, s: 'button', p: '/' });
  });

  it('drops an anchor that fails the field check', async () => {
    const b64 = await encodeAnchor({ v: 3, s: 'b', p: '//evil.example' });
    const [pin] = await attachAnchors(
      mergePins([occurrence({ anchorB64: b64 })]),
    );
    expect(pin.anchor).toBeNull();
    expect(pin.anchorB64).toBeNull();
  });

  it('leaves the short form alone', async () => {
    const [pin] = await attachAnchors(mergePins([occurrence()]));
    expect(pin.anchor).toBeNull();
  });
});
