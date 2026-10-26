/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DEFAULT_BOARD_VARS } from './dashboardConfig';
import { createDashboardWriter } from './dashboardStore';
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
  const pageConfig = (title: string): DashboardPageConfig => ({
    boards: [
      {
        id: 'default',
        title,
        vars: { ...DEFAULT_BOARD_VARS },
        panels: [],
        knownKeys: [],
      },
    ],
    active: 'default',
    migrated: true,
  });

  const setup = () => {
    const upsert = fakeUpsert();
    const writer = createDashboardWriter({
      write: upsert.write as (
        batch: WriteBatch<PanelPage, DashboardPageConfig>,
      ) => Promise<void>,
      delay: DELAY,
    });
    return { upsert, writer };
  };

  it('clears localStorage only after the migration upsert succeeded', async () => {
    const { upsert, writer } = setup();
    const clearLocal = vi.fn();
    const migration = pageConfig('migrated');
    const done = writer.migrate('project', migration, clearLocal);
    await flushMicrotasks();
    expect(upsert.calls).toEqual([{ project: migration }]);
    expect(clearLocal).not.toHaveBeenCalled();

    upsert.pending[0].resolve();
    await done;
    expect(clearLocal).toHaveBeenCalledTimes(1);
  });

  it('keeps localStorage when the migration upsert fails', async () => {
    const { upsert, writer } = setup();
    const clearLocal = vi.fn();
    const done = writer.migrate('project', pageConfig('migrated'), clearLocal);
    await flushMicrotasks();
    upsert.pending[0].reject(new Error('denied'));
    await done;
    expect(clearLocal).not.toHaveBeenCalled();
  });

  it('starts a page migration once, even after a failure', async () => {
    const { upsert, writer } = setup();
    const clearLocal = vi.fn();
    const first = writer.migrate('admin', pageConfig('a'), clearLocal);
    await flushMicrotasks();
    upsert.pending[0].reject(new Error('denied'));
    await first;
    expect(writer.migrate('admin', pageConfig('b'), clearLocal)).toBeNull();
    expect(
      writer.migrate('project', pageConfig('c'), clearLocal),
    ).not.toBeNull();
  });

  it('lets an edit made during the migration supersede it without losing the clear', async () => {
    const { upsert, writer } = setup();
    const clearLocal = vi.fn();
    writer.save('admin', pageConfig('other page'));
    writer.save('admin', pageConfig('other page 2'));
    await vi.advanceTimersByTimeAsync(DELAY);
    const done = writer.migrate('project', pageConfig('migrated'), clearLocal);
    const edited = pageConfig('edited');
    writer.save('project', edited);
    await vi.advanceTimersByTimeAsync(DELAY);
    upsert.pending[0].resolve();
    await flushMicrotasks();
    expect(upsert.calls[1]).toEqual({ project: edited });
    upsert.pending[1].resolve();
    await done;
    expect(clearLocal).toHaveBeenCalledTimes(1);
  });
});
