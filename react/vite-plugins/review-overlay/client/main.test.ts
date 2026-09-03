/**
 * The one thing `main.ts` owns that `deeplink.ts` cannot be asked about: which
 * hash the navigation target is built from.
 */
import type { AnchorV3 } from './types.js';
import { describe, expect, it, vi } from 'vitest';

const ID = 'c_zdv3rhz';
const B64 = 'AAAAAAAA';
const APPLIED_KEY = 'bai-review-applied';

// The SPA's own redirect rewrites the hash while the anchor is still
// inflating — which is the case `BOOT_HASH` was captured for.
vi.mock('./codec.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./codec.js')>();
  return {
    ...actual,
    decodeAnchor: async (): Promise<AnchorV3> => {
      history.replaceState({}, '', '/a?x=1');
      return { v: 3, s: '#target', p: '/b', txt: 'Create' };
    },
  };
});

describe('a deep link that has to change route', () => {
  it('keeps the fragment the link arrived with, not the live one', async () => {
    sessionStorage.clear();
    history.replaceState({}, '', `/a?x=1#tab=logs&bai=v3.${ID}.${B64}`);
    vi.stubGlobal('fetch', () =>
      Promise.resolve({ json: () => Promise.resolve({ pr: 1 }) }),
    );

    await import('./main.js');
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(sessionStorage.getItem(APPLIED_KEY)).toBe(
      `${ID} /b#tab=logs&bai=v3.${ID}.${B64}`,
    );
  });
});
