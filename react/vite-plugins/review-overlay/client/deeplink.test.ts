import {
  createNavigationGuard,
  parseFragment,
  pathNeedsChange,
  pinUrl,
  readablePath,
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
  it('reads the self-contained form', () => {
    expect(parseFragment('#bai=v3.c_zdv3rhz.QUJDREVGR0g')).toEqual({
      kind: 'v3',
      id: 'c_zdv3rhz',
      anchorB64: 'QUJDREVGR0g',
    });
  });

  it('finds the pin inside a compound fragment', () => {
    expect(
      parseFragment('#tab=logs&bai=v3.c_zdv3rhz.QUJDREVGR0g'),
    ).toMatchObject({ id: 'c_zdv3rhz' });
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

  // The id-only form resolved against a pin list that no longer exists.
  it('ignores a link that carries no anchor', () => {
    expect(parseFragment('#bai=v3.c_zdv3rhz')).toBeNull();
  });

  it('refuses an anchor longer than any real one, rather than inflating it', () => {
    expect(parseFragment(`#bai=v3.c_zdv3rhz.${'A'.repeat(4000)}`)).toBeNull();
  });

  it('ignores a malformed id', () => {
    expect(parseFragment('#bai=v3.zdv3rhz.QUJDREVGR0g')).toBeNull();
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

describe('readablePath', () => {
  it('shows the path a human typed, not its percent-encoding', () => {
    expect(readablePath('/project/a%ED%95%9C%EA%B5%AD%EC%96%B4/start')).toBe(
      '/project/a한국어/start',
    );
  });

  it('leaves a path that is not valid percent-encoding alone', () => {
    expect(readablePath('/100%off')).toBe('/100%off');
  });
});

describe('createNavigationGuard', () => {
  const fakeStorage = (): Storage => {
    const map = new Map<string, string>();
    return {
      getItem: (key) => map.get(key) ?? null,
      setItem: (key, value) => void map.set(key, value),
      removeItem: (key) => void map.delete(key),
      clear: () => map.clear(),
      key: () => null,
      get length() {
        return map.size;
      },
    } as Storage;
  };
  const target = '/start#bai=v3.c_zdv3rhz.QUJDREVGR0g';

  it('navigates once per document', () => {
    const guard = createNavigationGuard(fakeStorage());
    expect(guard.shouldNavigate('c_zdv3rhz', target)).toBe(true);
    expect(guard.shouldNavigate('c_zdv3rhz', target)).toBe(false);
  });

  // The assign reloads the page, so the loop guard has to outlive the document.
  it('does not retry a navigation the previous document already tried', () => {
    const storage = fakeStorage();
    expect(
      createNavigationGuard(storage).shouldNavigate('c_zdv3rhz', target),
    ).toBe(true);
    expect(
      createNavigationGuard(storage).shouldNavigate('c_zdv3rhz', target),
    ).toBe(false);
  });

  // The bug: keyed on the id alone, opening the link a second time from
  // another page skipped path/query application and pinned whatever was there.
  it('navigates again once the link’s own page has been reached', () => {
    const storage = fakeStorage();
    createNavigationGuard(storage).shouldNavigate('c_zdv3rhz', target);
    const landing = createNavigationGuard(storage);
    landing.landed();
    expect(
      createNavigationGuard(storage).shouldNavigate('c_zdv3rhz', target),
    ).toBe(true);
  });

  it('navigates for a different target of the same link', () => {
    const guard = createNavigationGuard(fakeStorage());
    guard.shouldNavigate('c_zdv3rhz', target);
    guard.reset();
    expect(
      guard.shouldNavigate(
        'c_zdv3rhz',
        '/session?tab=logs#bai=v3.c_zdv3rhz.QQ',
      ),
    ).toBe(true);
  });

  it('still follows the link when storage is unavailable', () => {
    const guard = createNavigationGuard(null);
    expect(guard.shouldNavigate('c_zdv3rhz', target)).toBe(true);
    guard.reset();
    expect(guard.shouldNavigate('c_zdv3rhz', target)).toBe(true);
  });
});
