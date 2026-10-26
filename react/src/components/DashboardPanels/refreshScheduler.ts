/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { RefreshInterval } from './types';
import * as _ from 'lodash-es';

/** Timer jitter tolerated when checking a subscriber's minimum interval. */
const TICK_TOLERANCE_MS = 500;

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
  /** The shortest gap between two automatic refreshes of this subscriber. */
  minMs: number;
  /** Called with the refresh time; must start the refetch, not await it. */
  refresh: (at: number) => void;
}

export interface RefreshSchedulerOptions {
  now?: () => number;
}

export const refreshIntervalMs = (interval: RefreshInterval) =>
  refreshToMs(interval) ?? 0;

/**
 * The dashboard's refresh fan-out. The dashboard's refresh control calls
 * `tick` on its interval and `refreshAll` on a click; a tick refreshes only
 * the subscribers whose `minMs` has elapsed since their last refresh.
 */
export class RefreshScheduler {
  private readonly subscribers = new Map<string, RefreshSubscriber>();
  private readonly lastRefreshAt = new Map<string, number>();
  private readonly listeners = new Set<() => void>();
  private readonly now: () => number;
  private lastTickAt: number;

  constructor(options: RefreshSchedulerOptions = {}) {
    this.now = options.now ?? Date.now;
    this.lastTickAt = this.now();
  }

  /** Adds a subscriber; its first automatic refresh waits a full `minMs`. */
  register(id: string, subscriber: RefreshSubscriber): () => void {
    this.subscribers.set(id, subscriber);
    if (!this.lastRefreshAt.has(id)) this.lastRefreshAt.set(id, this.now());
    return () => {
      if (this.subscribers.get(id) === subscriber) {
        this.subscribers.delete(id);
        this.lastRefreshAt.delete(id);
      }
    };
  }

  /** Refreshes the subscribers that are due. */
  tick() {
    const at = this.now();
    this.subscribers.forEach((subscriber, id) => {
      const last = this.lastRefreshAt.get(id) ?? 0;
      if (at - last + TICK_TOLERANCE_MS >= subscriber.minMs) {
        this.lastRefreshAt.set(id, at);
        subscriber.refresh(at);
      }
    });
    this.markTicked(at);
  }

  /** Refreshes every subscriber now. */
  refreshAll() {
    const at = this.now();
    this.subscribers.forEach((subscriber, id) => {
      this.lastRefreshAt.set(id, at);
      subscriber.refresh(at);
    });
    this.markTicked(at);
  }

  getLastTickAt() {
    return this.lastTickAt;
  }

  /** Notifies after every tick or manual refresh. */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private markTicked(at: number) {
    this.lastTickAt = at;
    this.listeners.forEach((listener) => listener());
  }
}
