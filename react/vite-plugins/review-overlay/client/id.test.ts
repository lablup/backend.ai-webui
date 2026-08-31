import { base32, pinId, sha256Bytes } from './id.js';
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';

describe('pin id', () => {
  it('matches Node’s sha256 for the pure-JS digest', () => {
    for (const input of ['', 'a', 'the quick brown fox', 'x'.repeat(200)]) {
      const bytes = new TextEncoder().encode(input);
      expect(Buffer.from(sha256Bytes(bytes)).toString('hex')).toBe(
        createHash('sha256').update(input).digest('hex'),
      );
    }
  });

  /**
   * The padding block is where a hand-rolled SHA-256 goes wrong: a message of
   * 56–63 bytes no longer leaves room for the 8-byte length in its own block,
   * so the digest needs one extra block. Cover both sides of every boundary in
   * BYTES (not characters — the digest is over the UTF-8 encoding).
   */
  it.each([0, 1, 54, 55, 56, 57, 63, 64, 65, 118, 119, 120, 121, 255])(
    'matches Node’s sha256 at a %i-byte message',
    (length) => {
      const bytes = new Uint8Array(length).map((_, i) => (i * 37 + 11) & 0xff);
      expect(Buffer.from(sha256Bytes(bytes)).toString('hex')).toBe(
        createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
      );
    },
  );

  it('matches Node’s sha256 for multi-byte UTF-8 across the boundary', () => {
    // 한국어 is 3 bytes per character, 📍 is 4 — so these straddle 55/64 bytes in
    // BYTES while looking far shorter in characters.
    for (const input of [
      '한국어',
      '📍⚛️',
      '한국어'.repeat(6),
      '한국어'.repeat(7),
      '📍'.repeat(16),
      'Sessions › page-start › button "시작하기"',
    ]) {
      const bytes = new TextEncoder().encode(input);
      expect(Buffer.from(sha256Bytes(bytes)).toString('hex')).toBe(
        createHash('sha256').update(input, 'utf8').digest('hex'),
      );
    }
  });

  it('is c_ + 7 lowercase base32 chars', () => {
    expect(pinId(9330, 'anchor-payload', '2026-08-31T00:00:00Z')).toMatch(
      /^c_[a-z2-7]{7}$/,
    );
  });

  it('is base32(sha256(pr + anchor + at))[:7]', () => {
    const pr = 9330;
    const anchorB64 = 'anchor-payload';
    const at = '2026-08-31T00:00:00Z';
    const digest = createHash('sha256')
      .update(`${pr}${anchorB64}${at}`)
      .digest();
    expect(pinId(pr, anchorB64, at)).toBe(
      `c_${base32(new Uint8Array(digest), 7)}`,
    );
  });

  it('is stable for the same inputs and differs for any change', () => {
    const a = pinId(1, 'anchor', '2026-08-31T00:00:00Z');
    expect(pinId(1, 'anchor', '2026-08-31T00:00:00Z')).toBe(a);
    expect(pinId(2, 'anchor', '2026-08-31T00:00:00Z')).not.toBe(a);
    expect(pinId(1, 'anchor2', '2026-08-31T00:00:00Z')).not.toBe(a);
    expect(pinId(1, 'anchor', '2026-08-31T00:00:01Z')).not.toBe(a);
  });
});
