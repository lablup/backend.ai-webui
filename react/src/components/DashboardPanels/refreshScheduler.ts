/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { refreshToMs } from './dashboardFilterUrl';
import type { RefreshInterval } from './types';

/** Timer jitter tolerated when checking a subscriber's minimum interval. */
const TICK_TOLERANCE_MS = 500;

export interface RefreshSubscriber {
  /** The shortest gap between two automatic refreshes of this subscriber. */
  minMs: number;
  /** Called with the refresh time; must start the refetch, not await it. */
  refresh: (at: number) => void;
}

export interface RefreshSchedulerOptions {
  now?: () => number;
  isHidden?: () => boolean;
  /** Subscribes to visibility changes; returns the unsubscribe. */
  onVisibilityChange?: (listener: () => void) => () => void;
}

const browserIsHidden = () =>
  typeof document !== 'undefined' && document.hidden;

const browserOnVisibilityChange = (listener: () => void) => {
  if (typeof document === 'undefined') return () => {};
  document.addEventListener('visibilitychange', listener);
  return () => document.removeEventListener('visibilitychange', listener);
};

export const refreshIntervalMs = (interval: RefreshInterval) =>
  refreshToMs(interval) ?? 0;

/**
 * The dashboard's one refresh timer. Each tick refreshes only the
 * subscribers whose `minMs` has elapsed since their last refresh; the timer
 * stops while the tab is hidden and ticks once when it comes back.
 */
export class RefreshScheduler {
  private readonly subscribers = new Map<string, RefreshSubscriber>();
  private readonly lastRefreshAt = new Map<string, number>();
  private readonly listeners = new Set<() => void>();
  private readonly now: () => number;
  private readonly isHidden: () => boolean;
  private readonly onVisibilityChange: (listener: () => void) => () => void;
  private intervalMs: number | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private stopVisibility: (() => void) | null = null;
  private lastTickAt: number;

  constructor(options: RefreshSchedulerOptions = {}) {
    this.now = options.now ?? Date.now;
    this.isHidden = options.isHidden ?? browserIsHidden;
    this.onVisibilityChange =
      options.onVisibilityChange ?? browserOnVisibilityChange;
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

  /** Sets the tick interval; null stops automatic refresh. */
  setInterval(intervalMs: number | null) {
    const next = intervalMs && intervalMs > 0 ? intervalMs : null;
    if (next === this.intervalMs) return;
    this.intervalMs = next;
    this.restartTimer();
  }

  getInterval() {
    return this.intervalMs;
  }

  /** Starts watching visibility; returns the cleanup. */
  start(): () => void {
    this.stopVisibility?.();
    this.stopVisibility = this.onVisibilityChange(() => {
      if (!this.isHidden() && this.intervalMs) this.tick();
      this.restartTimer();
    });
    this.restartTimer();
    return () => this.stop();
  }

  stop() {
    this.stopVisibility?.();
    this.stopVisibility = null;
    this.clearTimer();
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

  /** Refreshes every subscriber now and restarts the countdown. */
  refreshAll() {
    const at = this.now();
    this.subscribers.forEach((subscriber, id) => {
      this.lastRefreshAt.set(id, at);
      subscriber.refresh(at);
    });
    this.markTicked(at);
    this.restartTimer();
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

  private clearTimer() {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private restartTimer() {
    this.clearTimer();
    if (!this.intervalMs || !this.stopVisibility || this.isHidden()) return;
    this.timer = setInterval(() => this.tick(), this.intervalMs);
  }
}
