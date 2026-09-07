/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { createLocalStorageCache } from './ChatHistory';

interface Entry {
  updatedAt: string;
  parts: Array<Record<string, unknown>>;
}

const quotaError = () => {
  const error = new Error('The quota has been exceeded.');
  error.name = 'QuotaExceededError';
  return error;
};

const entry = (updatedAt: string): Entry => ({
  updatedAt,
  parts: [
    { type: 'text', text: 'hello' },
    {
      type: 'file',
      url: 'data:image/png;base64,AAAABBBB',
      mediaType: 'image/png',
      filename: 'shot.png',
    },
  ],
});

const oldestFirst = (a: Entry, b: Entry) =>
  new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();

type SetItemMock = ReturnType<
  typeof vi.fn<(key: string, value: string) => void>
>;

const lastWrittenValue = (setItem: SetItemMock) =>
  setItem.mock.calls.at(-1)?.[1] as string;

describe('createLocalStorageCache persistence', () => {
  let setItem: SetItemMock;
  let removeItem: ReturnType<typeof vi.fn<(key: string) => void>>;

  beforeEach(() => {
    localStorage.clear();
    setItem = vi.fn<(key: string, value: string) => void>();
    removeItem = vi.fn<(key: string) => void>();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(setItem);
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(removeItem);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('stores the full payload while it fits', () => {
    const cache = createLocalStorageCache<Entry>('test.cache', oldestFirst);

    expect(cache.set('a', entry('2026-01-01T00:00:00.000Z'))).toEqual({
      status: 'ok',
      evictedKeys: [],
    });
    expect(lastWrittenValue(setItem)).toContain(
      'data:image/png;base64,AAAABBBB',
    );
  });

  it('drops inlined attachments when the quota is exceeded', () => {
    setItem.mockImplementation((_key: string, value: string) => {
      if (value.includes('data:')) {
        throw quotaError();
      }
    });
    const cache = createLocalStorageCache<Entry>('test.cache', oldestFirst);

    const result = cache.set('a', entry('2026-01-01T00:00:00.000Z'));

    expect(result).toEqual({ status: 'attachments-dropped', evictedKeys: [] });
    const persisted = JSON.parse(lastWrittenValue(setItem));
    expect(persisted[0][1].parts[1]).toEqual({
      type: 'file',
      url: '',
      mediaType: 'image/png',
      filename: 'shot.png',
    });
    // The live copy keeps the payload so the open conversation still renders.
    expect(cache.get('a')?.parts[1].url).toBe('data:image/png;base64,AAAABBBB');
  });

  it('evicts the least recently updated entries when stripping is not enough', () => {
    const cache = createLocalStorageCache<Entry>('test.cache', oldestFirst);
    cache.set('old', entry('2026-01-01T00:00:00.000Z'));
    cache.set('mid', entry('2026-01-02T00:00:00.000Z'));

    // Only a single remaining entry fits from now on.
    setItem.mockImplementation((_key: string, value: string) => {
      if (JSON.parse(value).length > 1) {
        throw quotaError();
      }
    });

    const result = cache.set('new', entry('2026-01-03T00:00:00.000Z'));

    expect(result).toEqual({
      status: 'entries-evicted',
      evictedKeys: ['old', 'mid'],
    });
    expect(cache.getAll().map(({ id }) => id)).toEqual(['new']);
  });

  it('never throws out of set(), and clears the key when nothing fits', () => {
    setItem.mockImplementation(() => {
      throw quotaError();
    });
    const cache = createLocalStorageCache<Entry>('test.cache', oldestFirst);

    expect(() =>
      cache.set('a', entry('2026-01-01T00:00:00.000Z')),
    ).not.toThrow();
    expect(cache.set('b', entry('2026-01-02T00:00:00.000Z'))).toEqual({
      status: 'failed',
      evictedKeys: ['a'],
    });
    expect(removeItem).toHaveBeenCalledWith('test.cache');
  });

  it('does not throw out of delete()', () => {
    const cache = createLocalStorageCache<Entry>('test.cache', oldestFirst);
    cache.set('a', entry('2026-01-01T00:00:00.000Z'));

    setItem.mockImplementation(() => {
      throw quotaError();
    });

    expect(() => cache.delete('a')).not.toThrow();
    expect(cache.size()).toBe(0);
  });
});
