/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DEFAULT_BOARD_VARS } from './dashboardConfig';
import {
  applyPageUpdate,
  createDashboardWriter,
  type PageWrite,
} from './dashboardStore';
import type { DashboardPageConfig, PanelPage } from './types';
import { createWriteQueue, type WriteBatch } from './writeQueue';

const DELAY = 800;

const deferred = () => {
  let resolve!: () => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

/** A fake upsert that records each batch and settles when the test says so. */
const fakeUpsert = () => {
  const calls: Array<Record<string, unknown>> = [];
  const pending: Array<ReturnType<typeof deferred>> = [];
  const write = vi.fn((batch: WriteBatch<string, unknown>) => {
    calls.push(Object.fromEntries(batch));
    const next = deferred();
    pending.push(next);
    return next.promise;
  });
  return { calls, pending, write };
};

const flushMicrotasks = () => vi.advanceTimersByTimeAsync(0);

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('createWriteQueue', () => {
  it('coalesces values queued within the debounce into one write of the latest value', async () => {
    const upsert = fakeUpsert();
    const queue = createWriteQueue({ write: upsert.write, delay: DELAY });
    const first = queue.schedule('project', 1);
    await vi.advanceTimersByTimeAsync(DELAY - 100);
    const second = queue.schedule('project', 2);
    queue.schedule('admin', 'x');
    await vi.advanceTimersByTimeAsync(DELAY - 100);
    expect(upsert.write).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(100);
    expect(upsert.calls).toEqual([{ project: 2, admin: 'x' }]);
    upsert.pending[0].resolve();
    await expect(first).resolves.toBeUndefined();
    await expect(second).resolves.toBeUndefined();
  });

  it('keeps one write in flight and sends what arrived meanwhile after it, in order', async () => {
    const upsert = fakeUpsert();
    const queue = createWriteQueue({ write: upsert.write, delay: DELAY });
    queue.schedule('project', 1);
    await vi.advanceTimersByTimeAsync(DELAY);
    expect(upsert.calls).toHaveLength(1);

    queue.schedule('project', 2);
    queue.schedule('project', 3);
    await vi.advanceTimersByTimeAsync(DELAY * 3);
    expect(upsert.calls).toHaveLength(1);

    upsert.pending[0].resolve();
    await flushMicrotasks();
    expect(upsert.calls).toEqual([{ project: 1 }, { project: 3 }]);
  });

  it('writes at once when asked, and flush skips the debounce', async () => {
    const upsert = fakeUpsert();
    const queue = createWriteQueue({ write: upsert.write, delay: DELAY });
    queue.schedule('project', 1, { immediate: true });
    await flushMicrotasks();
    expect(upsert.calls).toEqual([{ project: 1 }]);
    upsert.pending[0].resolve();

    queue.schedule('admin', 2);
    const flushed = queue.flush();
    await flushMicrotasks();
    expect(upsert.calls).toEqual([{ project: 1 }, { admin: 2 }]);
    upsert.pending[1].resolve();
    await expect(flushed).resolves.toBeUndefined();
  });

  it('combines values for a key with the given function', async () => {
    const upsert = fakeUpsert();
    const queue = createWriteQueue<string, Array<number>>({
      write: upsert.write,
      delay: DELAY,
      combine: (previous, next) => [...previous, ...next],
    });
    queue.schedule('project', [1]);
    queue.schedule('project', [2]);
    await vi.advanceTimersByTimeAsync(DELAY);
    expect(upsert.calls).toEqual([{ project: [1, 2] }]);
  });

  it('rejects the waiters of a failed write and still runs the next one', async () => {
    const upsert = fakeUpsert();
    const queue = createWriteQueue({ write: upsert.write, delay: DELAY });
    const failed = queue.schedule('project', 1, { immediate: true });
    const failedResult = expect(failed).rejects.toThrow('boom');
    await flushMicrotasks();
    const next = queue.schedule('project', 2, { immediate: true });
    upsert.pending[0].reject(new Error('boom'));
    await failedResult;
    await flushMicrotasks();
    expect(upsert.calls).toEqual([{ project: 1 }, { project: 2 }]);
    upsert.pending[1].resolve();
    await expect(next).resolves.toBeUndefined();
  });
});

describe('createDashboardWriter', () => {
  const pageConfig = (
    title: string,
    active = 'default',
  ): DashboardPageConfig => ({
    boards: [
      {
        id: 'default',
        title,
        vars: { ...DEFAULT_BOARD_VARS },
        panels: [],
        knownKeys: [],
      },
    ],
    active,
  });

  const setup = () => {
    const batches: Array<WriteBatch<PanelPage, PageWrite>> = [];
    const pending: Array<ReturnType<typeof deferred>> = [];
    const writer = createDashboardWriter({
      write: (batch) => {
        batches.push(batch);
        const next = deferred();
        pending.push(next);
        return next.promise;
      },
      delay: DELAY,
    });
    return { batches, pending, writer };
  };

  const pageWrite = (
    update: PageWrite['update'],
    optimistic: DashboardPageConfig,
  ): PageWrite => ({
    update,
    resolve: (stored) => (stored as DashboardPageConfig) ?? pageConfig(''),
    optimistic,
  });

  it('replays every queued edit, oldest first, on the value read at write time', async () => {
    const { batches, writer } = setup();
    const renamed = pageConfig('renamed');
    writer.save(
      'admin',
      pageWrite(
        (config) => ({
          ...config,
          boards: config.boards.map((board) => ({
            ...board,
            title: 'renamed',
          })),
        }),
        renamed,
      ),
    );
    const selected = { ...renamed, active: 'other' };
    writer.save(
      'admin',
      pageWrite((config) => ({ ...config, active: 'other' }), selected),
    );
    await vi.advanceTimersByTimeAsync(DELAY);

    const write = batches[0].get('admin')!;
    expect(write.optimistic).toBe(selected);
    // Another device saved a second board meanwhile; both edits land on top of it.
    const server: DashboardPageConfig = {
      ...pageConfig('server'),
      boards: [
        ...pageConfig('server').boards,
        { ...pageConfig('x').boards[0], id: 'other' },
      ],
    };
    const written = write.update(write.resolve(server));
    expect(written.active).toBe('other');
    expect(written.boards.map((board) => [board.id, board.title])).toEqual([
      ['default', 'renamed'],
      ['other', 'renamed'],
    ]);
  });

  it('flush writes a queued edit without waiting for the debounce', async () => {
    const { batches, pending, writer } = setup();
    writer.save(
      'project',
      pageWrite((config) => config, pageConfig('a')),
    );
    const flushed = writer.flush();
    await flushMicrotasks();
    expect(batches).toHaveLength(1);
    pending[0].resolve();
    await expect(flushed).resolves.toBeUndefined();
  });
});

describe('applyPageUpdate', () => {
  const config = {
    boards: [],
    active: 'a',
  } as unknown as DashboardPageConfig;

  it('returns null for an update that changes nothing', () => {
    expect(applyPageUpdate(config, (current) => ({ ...current }))).toBeNull();
    expect(applyPageUpdate(config, (current) => current)).toBeNull();
  });

  it('returns the updated config for a real change', () => {
    expect(
      applyPageUpdate(config, (current) => ({
        ...current,
        active: 'b',
      })),
    ).toEqual({ ...config, active: 'b' });
  });
});
