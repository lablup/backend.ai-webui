/**
 * The served head is cached on its OWN short TTL (FR-3950). The PR a dev
 * server belongs to is fixed for its life, but HEAD moves under it — a rebase,
 * a `gh stack sync`, a checkout — and a banner comparing against a boot-time
 * sha would lie for the rest of the session.
 */
import { createHeadCache, HEAD_TTL_MS } from './served-head.js';
import { describe, expect, it, vi } from 'vitest';

const A = 'a'.repeat(40);
const B = 'b'.repeat(40);

describe('createHeadCache', () => {
  it('answers a changed HEAD once the TTL is past', async () => {
    let head = A;
    const read = vi.fn(() => Promise.resolve(head));
    let now = 1_000;
    const servedHead = createHeadCache({ read, ttlMs: 100, now: () => now });

    expect(await servedHead()).toBe(A);
    head = B;
    // Inside the window the cached answer stands.
    now += 50;
    expect(await servedHead()).toBe(A);
    expect(read).toHaveBeenCalledTimes(1);

    now += 60;
    expect(await servedHead()).toBe(B);
    expect(read).toHaveBeenCalledTimes(2);
  });

  it('shares one read between concurrent misses', async () => {
    const read = vi.fn(() => Promise.resolve(A));
    const servedHead = createHeadCache({ read, now: () => 0 });

    expect(
      await Promise.all([servedHead(), servedHead(), servedHead()]),
    ).toEqual([A, A, A]);
    expect(read).toHaveBeenCalledTimes(1);
  });

  it('answers null when the read fails, and retries after the TTL', async () => {
    let fail = true;
    const read = vi.fn(() =>
      fail ? Promise.reject(new Error('not a checkout')) : Promise.resolve(A),
    );
    let now = 0;
    const servedHead = createHeadCache({ read, ttlMs: 10, now: () => now });

    expect(await servedHead()).toBeNull();
    fail = false;
    now += 20;
    expect(await servedHead()).toBe(A);
  });

  it('keeps the default window short enough to be true', () => {
    expect(HEAD_TTL_MS).toBeLessThanOrEqual(10_000);
  });
});
