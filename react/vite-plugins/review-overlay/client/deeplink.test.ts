import {
  parseFragment,
  pinUrl,
  pathNeedsChange,
  retryUntil,
} from './deeplink.js';
import type { AnchorV3 } from './types.js';
import { afterEach, describe, expect, it, vi } from 'vitest';

const anchor = (over: Partial<AnchorV3> = {}): AnchorV3 => ({
  v: 3,
  s: 'button',
  p: '/session',
  ...over,
});

describe('parseFragment', () => {
  it('reads the full self-contained form', () => {
    expect(parseFragment('#bai=v3.c_zdv3rhz.QUJDREVGR0g')).toEqual({
      kind: 'v3',
      id: 'c_zdv3rhz',
      anchorB64: 'QUJDREVGR0g',
    });
  });

  it('reads the short id-only form Claude and humans write by hand', () => {
    expect(parseFragment('#bai=v3.c_zdv3rhz')).toEqual({
      kind: 'v3',
      id: 'c_zdv3rhz',
      anchorB64: null,
    });
  });

  it('finds the pin inside a compound fragment', () => {
    expect(parseFragment('#tab=logs&bai=v3.c_zdv3rhz')).toMatchObject({
      id: 'c_zdv3rhz',
    });
  });

  it('reports a v1 link so the overlay can say why it did nothing', () => {
    expect(parseFragment('#bai-review=eJyrVkrLz1eyUlAqSS0uUaoFAB')).toEqual({
      kind: 'legacy',
    });
  });

  it('ignores an unrelated fragment', () => {
    expect(parseFragment('#section-2')).toBeNull();
    expect(parseFragment('')).toBeNull();
  });

  it('drops an anchor longer than any real one, keeping the id', () => {
    expect(parseFragment(`#bai=v3.c_zdv3rhz.${'A'.repeat(4000)}`)).toEqual({
      kind: 'v3',
      id: 'c_zdv3rhz',
      anchorB64: null,
    });
  });

  it('ignores a malformed id', () => {
    expect(parseFragment('#bai=v3.zdv3rhz')).toBeNull();
  });
});

describe('pathNeedsChange', () => {
  it('is true when the anchor names another path', () => {
    expect(pathNeedsChange(anchor(), { pathname: '/start', search: '' })).toBe(
      true,
    );
  });

  it('is true when only the query differs — filters and tabs matter (R3.3)', () => {
    expect(
      pathNeedsChange(anchor({ q: 'status=RUNNING' }), {
        pathname: '/session',
        search: '',
      }),
    ).toBe(true);
  });

  it('is false when we are already there', () => {
    expect(
      pathNeedsChange(anchor({ q: 'status=RUNNING' }), {
        pathname: '/session',
        search: '?status=RUNNING',
      }),
    ).toBe(false);
  });

  it('is false for a path the codec would refuse to navigate to', () => {
    expect(
      pathNeedsChange(
        { v: 3, s: 'b', p: '//evil.example' },
        { pathname: '/', search: '' },
      ),
    ).toBe(false);
  });
});

describe('pinUrl', () => {
  it('rebuilds the link the block carried', () => {
    expect(
      pinUrl(anchor({ q: 'status=RUNNING' }), 'c_zdv3rhz', 'QUJDREVGR0g'),
    ).toBe('/session?status=RUNNING#bai=v3.c_zdv3rhz.QUJDREVGR0g');
  });

  it('keeps the short form short', () => {
    expect(pinUrl(anchor(), 'c_zdv3rhz', null)).toBe(
      '/session#bai=v3.c_zdv3rhz',
    );
  });
});

describe('retryUntil', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('stops as soon as the SPA has rendered the element', async () => {
    vi.useFakeTimers();
    const attempt = vi.fn().mockReturnValueOnce(false).mockReturnValue(true);
    const onGiveUp = vi.fn();
    retryUntil(attempt, { tries: 20, everyMs: 500, onGiveUp });
    await vi.advanceTimersByTimeAsync(1200);
    expect(attempt).toHaveBeenCalledTimes(2);
    expect(onGiveUp).not.toHaveBeenCalled();
  });

  it('gives up after the ladder runs out', async () => {
    vi.useFakeTimers();
    const onGiveUp = vi.fn();
    retryUntil(() => false, { tries: 3, everyMs: 500, onGiveUp });
    await vi.advanceTimersByTimeAsync(3000);
    expect(onGiveUp).toHaveBeenCalledTimes(1);
  });

  it('can be cancelled when a later deep link takes over', async () => {
    vi.useFakeTimers();
    const attempt = vi.fn().mockReturnValue(false);
    const cancel = retryUntil(attempt, { tries: 20, everyMs: 500 });
    cancel();
    await vi.advanceTimersByTimeAsync(3000);
    expect(attempt).toHaveBeenCalledTimes(1);
  });
});
