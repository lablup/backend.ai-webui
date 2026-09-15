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

const entry = (updatedAt: string, payloadChars = 8): Entry => ({
  updatedAt,
  parts: [
    { type: 'text', text: 'hello' },
    {
      type: 'file',
      url: `data:image/png;base64,${'A'.repeat(payloadChars)}`,
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
      unpersistedKeys: [],
    });
    expect(lastWrittenValue(setItem)).toContain(
      'data:image/png;base64,AAAAAAAA',
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

    expect(result).toEqual({
      status: 'attachments-dropped',
      unpersistedKeys: [],
    });
    const persisted = JSON.parse(lastWrittenValue(setItem));
    expect(persisted[0][1].parts[1]).toEqual({
      type: 'file',
      url: '',
      mediaType: 'image/png',
      filename: 'shot.png',
    });
    // The live copy keeps the payload so the open conversation still renders.
    expect(cache.get('a')?.parts[1].url).toBe('data:image/png;base64,AAAAAAAA');
  });

  it('drops inlined attachments once they exceed the size budget, before the browser throws', () => {
    const cache = createLocalStorageCache<Entry>('test.cache', oldestFirst);

    const result = cache.set('a', entry('2026-01-01T00:00:00.000Z', 2_100_000));

    expect(result.status).toBe('attachments-dropped');
    expect(lastWrittenValue(setItem)).not.toContain('data:');
  });

  it('leaves the least recently updated entries out of the stored copy, but keeps them in memory', () => {
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
      status: 'entries-unpersisted',
      unpersistedKeys: ['old', 'mid'],
    });
    expect(
      JSON.parse(lastWrittenValue(setItem)).map(([key]: [string]) => key),
    ).toEqual(['new']);
    // The history sidebar must not lose conversations mid-session.
    expect(cache.getAll().map(({ id }) => id)).toEqual(['old', 'mid', 'new']);
  });

  it('never throws out of set(), and keeps the stored copy when nothing fits', () => {
    setItem.mockImplementation(() => {
      throw quotaError();
    });
    const cache = createLocalStorageCache<Entry>('test.cache', oldestFirst);

    expect(() =>
      cache.set('a', entry('2026-01-01T00:00:00.000Z')),
    ).not.toThrow();
    expect(cache.set('b', entry('2026-01-02T00:00:00.000Z'))).toEqual({
      status: 'failed',
      unpersistedKeys: [],
    });
    // A previously persisted, still-valid copy is never wiped.
    expect(removeItem).not.toHaveBeenCalled();
    expect(cache.getAll().map(({ id }) => id)).toEqual(['a', 'b']);
  });

  it('keeps the full payload path after a write failure that stored nothing', () => {
    setItem.mockImplementation(() => {
      throw quotaError();
    });
    const cache = createLocalStorageCache<Entry>('test.cache', oldestFirst);

    expect(cache.set('a', entry('2026-01-01T00:00:00.000Z')).status).toBe(
      'failed',
    );

    // Storage recovers: the next write must retry the full payload rather than
    // reporting `ok` while silently storing stripped attachments.
    setItem.mockImplementation(() => {});

    expect(cache.set('b', entry('2026-01-02T00:00:00.000Z'))).toEqual({
      status: 'ok',
      unpersistedKeys: [],
    });
    expect(lastWrittenValue(setItem)).toContain('data:image/png;base64,');
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

  it('lets a resumed conversation back into the stored copy', () => {
    const cache = createLocalStorageCache<Entry>('test.cache', oldestFirst);
    cache.set('old', entry('2026-01-01T00:00:00.000Z'));

    // Only a single entry fits from now on.
    setItem.mockImplementation((_key: string, value: string) => {
      if (JSON.parse(value).length > 1) {
        throw quotaError();
      }
    });
    expect(cache.set('new', entry('2026-01-02T00:00:00.000Z')).status).toBe(
      'entries-unpersisted',
    );

    // Resuming 'old' makes it the newest, so it is stored and 'new' is evicted.
    const result = cache.set('old', entry('2026-01-03T00:00:00.000Z'));

    expect(result).toEqual({
      status: 'entries-unpersisted',
      unpersistedKeys: ['new'],
    });
    expect(
      JSON.parse(lastWrittenValue(setItem)).map(([key]: [string]) => key),
    ).toEqual(['old']);
  });

  it('stores attachments again once the last chat is deleted', () => {
    setItem.mockImplementation((_key: string, value: string) => {
      if (value.includes('data:')) {
        throw quotaError();
      }
    });
    const cache = createLocalStorageCache<Entry>('test.cache', oldestFirst);
    cache.set('a', entry('2026-01-01T00:00:00.000Z'));

    // The UI removes chats one by one through delete(), never clear().
    cache.delete('a');
    setItem.mockImplementation(() => {});

    expect(cache.set('b', entry('2026-01-02T00:00:00.000Z'))).toEqual({
      status: 'ok',
      unpersistedKeys: [],
    });
    expect(lastWrittenValue(setItem)).toContain('data:image/png;base64,');
  });

  it('stores attachments again after clear()', () => {
    setItem.mockImplementation((_key: string, value: string) => {
      if (value.includes('data:')) {
        throw quotaError();
      }
    });
    const cache = createLocalStorageCache<Entry>('test.cache', oldestFirst);
    cache.set('a', entry('2026-01-01T00:00:00.000Z'));

    cache.clear();
    setItem.mockImplementation(() => {});

    expect(cache.set('b', entry('2026-01-02T00:00:00.000Z'))).toEqual({
      status: 'ok',
      unpersistedKeys: [],
    });
    expect(lastWrittenValue(setItem)).toContain('data:image/png;base64,');
  });
});
