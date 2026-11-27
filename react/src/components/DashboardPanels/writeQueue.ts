/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */

export type WriteBatch<K extends string, V> = ReadonlyMap<K, V>;

export interface WriteQueue<K extends string, V> {
  /**
   * Queues `value` under `key`, combined with an unwritten value for the same key.
   * Resolves when a write carrying it (or a later value for the key) succeeds.
   */
  schedule: (
    key: K,
    value: V,
    options?: { immediate?: boolean },
  ) => Promise<void>;
  /** Writes whatever is queued now instead of after the debounce. */
  flush: () => Promise<void>;
}

interface Waiter {
  resolve: () => void;
  reject: (error: unknown) => void;
}

/**
 * Debounced, serialized writes: values queued within `delay` of each other are
 * coalesced per key into one batch, and a batch starts only after the previous
 * one settled, so read-modify-write upserts never interleave.
 */
export const createWriteQueue = <K extends string, V>({
  write,
  delay,
  combine = (_previous, next) => next,
}: {
  write: (batch: WriteBatch<K, V>) => Promise<void>;
  delay: number;
  /** Merges a queued value with a newer one for the same key; the newer wins by default. */
  combine?: (previous: V, next: V) => V;
}): WriteQueue<K, V> => {
  let pending = new Map<K, V>();
  let waiters: Array<Waiter> = [];
  let timer: ReturnType<typeof setTimeout> | null = null;
  let inFlight: Promise<void> | null = null;

  const run = () => {
    timer = null;
    if (inFlight || pending.size === 0) return;
    const batch = pending;
    const batchWaiters = waiters;
    pending = new Map();
    waiters = [];
    inFlight = Promise.resolve()
      .then(() => write(batch))
      .then(
        () => batchWaiters.forEach((waiter) => waiter.resolve()),
        (error) => batchWaiters.forEach((waiter) => waiter.reject(error)),
      )
      .finally(() => {
        inFlight = null;
        // A value queued during the flight whose debounce already ran.
        if (pending.size > 0 && !timer) run();
      });
  };

  const schedule: WriteQueue<K, V>['schedule'] = (key, value, options) =>
    new Promise<void>((resolve, reject) => {
      const previous = pending.get(key);
      pending.set(
        key,
        previous === undefined ? value : combine(previous, value),
      );
      waiters.push({ resolve, reject });
      if (timer) clearTimeout(timer);
      if (options?.immediate) {
        run();
      } else {
        timer = setTimeout(run, delay);
      }
    });

  const flush = async () => {
    if (timer) clearTimeout(timer);
    run();
    while (inFlight) await inFlight;
  };

  return { schedule, flush };
};
