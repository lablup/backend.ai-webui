/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import * as _ from 'lodash-es';

/** Timer jitter tolerated when checking whether a card is due. */

/** The auto refresh choices, slowest last; `off` stops automatic refresh. */
export const REFRESH_OPTIONS = [
  'off',
  '5s',
  '10s',
  '15s',
  '30s',
  '1m',
  '5m',
  '10m',
] as const;
export type RefreshOption = (typeof REFRESH_OPTIONS)[number];

const REFRESH_UNIT_MS: Record<string, number> = { s: 1000, m: 60_000 };

/** `'30s'` → 30000, `'off'` or anything unparsable → null. */
export const refreshToMs = (
  value: string | null | undefined,
): number | null => {
  const match = /^(\d+)([sm])$/.exec(value ?? '');
  if (!match) return null;
  const ms = Number(match[1]) * REFRESH_UNIT_MS[match[2]];
  return ms > 0 ? ms : null;
};

/** The refresh choice for an interval in ms; `off` for null or an unoffered value. */
export const msToRefresh = (ms: number | null | undefined): RefreshOption =>
  _.find(REFRESH_OPTIONS, (option) => refreshToMs(option) === ms) ?? 'off';

export const isRefreshOption = (value: unknown): value is RefreshOption =>
  _.includes(REFRESH_OPTIONS, value);

/** The intervals the refresh control offers, in ms ("Off" is added by the control). */
export const REFRESH_DELAY_OPTIONS: ReadonlyArray<number> = _.compact(
  REFRESH_OPTIONS.map(refreshToMs),
);

export interface RefreshSubscriber {
  /** Called with the refresh time; must start the refetch, not await it. */
  refresh: (at: number, manual: boolean) => void;
}

export interface RefreshSchedulerOptions {
  now?: () => number;
}

/**
 * The dashboard's refresh fan-out. The dashboard's refresh control calls
 * `tick` on its interval and `refreshAll` on a click; a tick refreshes every
 * visible subscriber, so the whole dashboard re-queries together.
 */
export class RefreshScheduler {
  private readonly subscribers = new Map<string, RefreshSubscriber>();
  private readonly listeners = new Set<() => void>();
  private readonly hidden = new Set<string>();
  private readonly pending = new Set<string>();
  private readonly now: () => number;
  private lastTickAt: number;

  constructor(options: RefreshSchedulerOptions = {}) {
    this.now = options.now ?? Date.now;
    this.lastTickAt = this.now();
  }

  /** Adds a subscriber; its own first fetch is its first refresh. */
  register(id: string, subscriber: RefreshSubscriber): () => void {
    this.subscribers.set(id, subscriber);
    return () => {
      if (this.subscribers.get(id) === subscriber) {
        this.subscribers.delete(id);
      }
    };
  }

  /** Refreshes every visible subscriber whose previous refresh has finished. */
  tick() {
    const at = this.now();
    this.subscribers.forEach((subscriber, id) => {
      if (!this.hidden.has(id) && !this.pending.has(id)) {
        this.refresh(subscriber, at, false);
      }
    });
    this.markTicked(at);
  }

  /** Refreshes every subscriber now, visible or not. */
  refreshAll() {
    const at = this.now();
    this.subscribers.forEach((subscriber) =>
      this.refresh(subscriber, at, true),
    );
    this.markTicked(at);
  }

  /**
   * Ticks skip a hidden subscriber. One that comes back into view waits for
   * the next tick, so scrolling alone never reads again. Ids are visible until
   * reported otherwise.
   */
  setVisible(id: string, visible: boolean) {
    if (visible) this.hidden.delete(id);
    else this.hidden.add(id);
  }

  /** Marks a subscriber's refresh as in flight until reported otherwise. */
  setPending(id: string, pending: boolean) {
    if (pending === this.pending.has(id)) return;
    if (pending) this.pending.add(id);
    else this.pending.delete(id);
    this.notify();
  }

  isRefreshing() {
    return this.pending.size > 0;
  }

  getLastTickAt() {
    return this.lastTickAt;
  }

  /** Notifies after every tick or manual refresh, and when the in-flight state changes. */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private refresh(subscriber: RefreshSubscriber, at: number, manual: boolean) {
    subscriber.refresh(at, manual);
  }

  private markTicked(at: number) {
    this.lastTickAt = at;
    this.notify();
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }
}
