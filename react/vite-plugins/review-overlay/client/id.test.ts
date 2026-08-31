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
