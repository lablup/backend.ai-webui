import {
  createNavigationGuard,
  hasLegacyFragment,
  MAX_SET_PINS,
  parseFragment,
  parseFragments,
  pathNeedsChange,
  pinSetFragment,
  pinSetUrl,
  pinUrl,
  readablePath,
  retryUntil,
} from './deeplink.js';
import type { AnchorV3, SetPin } from './types.js';
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

  // The pin can ride inside a fragment the app already uses — which is why the
  // parser accepts `&bai=v3` at all.
  it('keeps the fragment the app was already using', () => {
    expect(
      pinUrl(anchor(), 'c_zdv3rhz', 'QUJDREVGR0g', '#tab=general&x=1'),
    ).toBe('/session#tab=general&x=1&bai=v3.c_zdv3rhz.QUJDREVGR0g');
  });

  it('replaces a pin already in the fragment rather than stacking one', () => {
    expect(
      pinUrl(anchor(), 'c_new', 'QUJD', '#tab=general&bai=v3.c_old.WkhH'),
    ).toBe('/session#tab=general&bai=v3.c_new.QUJD');
  });

  it('leaves a fragment that is only a pin as one pin', () => {
    expect(pinUrl(anchor(), 'c_new', 'QUJD', '#bai=v3.c_old.WkhH')).toBe(
      '/session#bai=v3.c_new.QUJD',
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

describe('parseFragments', () => {
  const A = 'QUJDREVGR0g';
  const B = 'SUpLTU5PUFE';

  it('reads a set as its parts, in link order', () => {
    expect(
      parseFragments(`#bai=v3.c_zdv3rhz.${A}&bai=v3.c_abcdef2.${B}`),
    ).toEqual([
      { id: 'c_zdv3rhz', anchorB64: A },
      { id: 'c_abcdef2', anchorB64: B },
    ]);
  });

  it('keeps the app’s own fragment out of the list', () => {
    expect(parseFragments(`#tab=logs&bai=v3.c_zdv3rhz.${A}`)).toEqual([
      { id: 'c_zdv3rhz', anchorB64: A },
    ]);
  });

  it('is the one part `parseFragment` reports for a single pin', () => {
    expect(parseFragment(`#bai=v3.c_zdv3rhz.${A}`)).toEqual({
      kind: 'v3',
      ...parseFragments(`#bai=v3.c_zdv3rhz.${A}`)[0],
    });
  });

  it('has no state to carry between calls', () => {
    const hash = `#bai=v3.c_zdv3rhz.${A}&bai=v3.c_abcdef2.${B}`;
    expect(parseFragments(hash)).toEqual(parseFragments(hash));
  });

  // A pasted hash is untrusted: one unreadable part must not cost the others.
  it('skips a part the grammar refuses and keeps the rest', () => {
    expect(
      parseFragments(
        `#bai=v3.c_zdv3rhz.${'A'.repeat(4000)}&bai=v3.c_abcdef2.${B}`,
      ),
    ).toEqual([{ id: 'c_abcdef2', anchorB64: B }]);
    expect(parseFragments(`#bai=v3.nope.${A}&bai=v3.c_abcdef2.${B}`)).toEqual([
      { id: 'c_abcdef2', anchorB64: B },
    ]);
  });

  // Every part costs a decode and a drawn view, and the set cap is what a
  // producer may write — the reader may be handed anything.
  it('stops at the set cap, however many parts were pasted', () => {
    const ids = 'abcdefghijklmnopqrstuvwxyz234567'.split('');
    const hash = `#${ids
      .flatMap((c) => [
        `bai=v3.c_${c.repeat(7)}.${A}`,
        `bai=v3.c_${c}zzzzzz.${B}`,
      ])
      .join('&')}`;
    expect(parseFragments(hash)).toHaveLength(MAX_SET_PINS);
    expect(parseFragments(hash)[0]).toEqual({ id: 'c_aaaaaaa', anchorB64: A });
  });

  it('is empty for a fragment with no pin in it', () => {
    expect(parseFragments('#section-2')).toEqual([]);
    expect(parseFragments('')).toEqual([]);
  });
});

describe('hasLegacyFragment', () => {
  it('recognises a v1 link, and nothing else', () => {
    expect(hasLegacyFragment('#bai-review=eJyrVkrLz1eyUlAqSS0uUaoFAB')).toBe(
      true,
    );
    expect(hasLegacyFragment('#bai=v3.c_zdv3rhz.QUJDREVGR0g')).toBe(false);
    expect(hasLegacyFragment('')).toBe(false);
  });
});

describe('pinSetFragment', () => {
  it('repeats the part after `&`, in set order', () => {
    expect(
      pinSetFragment([
        { id: 'c_zdv3rhz', anchorB64: 'QUJD' },
        { id: 'c_abcdef2', anchorB64: 'WkhH' },
      ]),
    ).toBe('bai=v3.c_zdv3rhz.QUJD&bai=v3.c_abcdef2.WkhH');
  });

  it('emits a pin once, at its first place in the set', () => {
    expect(
      pinSetFragment([
        { id: 'c_zdv3rhz', anchorB64: 'QUJD' },
        { id: 'c_abcdef2', anchorB64: 'WkhH' },
        { id: 'c_zdv3rhz', anchorB64: 'QUJD' },
      ]),
    ).toBe('bai=v3.c_zdv3rhz.QUJD&bai=v3.c_abcdef2.WkhH');
  });

  it('is empty for an empty set', () => {
    expect(pinSetFragment([])).toBe('');
  });
});

describe('pinSetUrl', () => {
  type PickedPin = Extract<SetPin, { origin: 'pick' }>;
  const setPin = (over: Partial<PickedPin> = {}): PickedPin => ({
    id: 'c_zdv3rhz',
    origin: 'pick',
    anchor: anchor(),
    anchorB64: 'QUJDREVGR0g',
    label: '',
    appHash: '',
    stack: [],
    at: '2026-09-04T00:00:00Z',
    pr: 9400,
    ...over,
  });

  // A set may span pages; the link opens on the first pin's page, whatever
  // the others say.
  it('takes path, query and the app fragment from the first pin', () => {
    expect(
      pinSetUrl([
        setPin({
          anchor: anchor({ q: 'status=RUNNING' }),
          appHash: 'tab=logs',
        }),
        setPin({
          id: 'c_abcdef2',
          anchorB64: 'WkhHSUpLTA',
          anchor: anchor({ p: '/start', q: 'x=1' }),
          appHash: 'tab=other',
        }),
      ]),
    ).toBe(
      '/session?status=RUNNING#tab=logs&bai=v3.c_zdv3rhz.QUJDREVGR0g&bai=v3.c_abcdef2.WkhHSUpLTA',
    );
  });

  it('is byte-identical to the single-pin link for a set of one', () => {
    for (const hash of ['', '#tab=logs&x=1']) {
      expect(pinSetUrl([setPin({ appHash: hash.replace(/^#/, '') })])).toBe(
        pinUrl(anchor(), 'c_zdv3rhz', 'QUJDREVGR0g', hash),
      );
    }
  });

  it('has no link to build for an empty set', () => {
    expect(pinSetUrl([])).toBe('');
  });
});
