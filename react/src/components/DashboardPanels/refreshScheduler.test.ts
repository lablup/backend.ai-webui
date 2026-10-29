/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  REFRESH_DELAY_OPTIONS,
  RefreshScheduler,
  isRefreshOption,
  msToRefresh,
  refreshToMs,
} from './refreshScheduler';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-26T00:00:00Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('refresh choices', () => {
  it('converts between choices and milliseconds', () => {
    expect(refreshToMs('30s')).toBe(30_000);
    expect(refreshToMs('5m')).toBe(300_000);
    expect(refreshToMs('off')).toBeNull();
    expect(refreshToMs('7x')).toBeNull();
    expect(msToRefresh(60_000)).toBe('1m');
    expect(msToRefresh(null)).toBe('off');
    expect(msToRefresh(7_000)).toBe('off');
  });

  it('offers every choice but off as an interval', () => {
    expect(REFRESH_DELAY_OPTIONS).toEqual([
      5_000, 10_000, 15_000, 30_000, 60_000, 300_000, 600_000,
    ]);
    expect(isRefreshOption('10m')).toBe(true);
    expect(isRefreshOption('2s')).toBe(false);
  });
});

describe('RefreshScheduler', () => {
  it('refreshes a subscriber on a tick only after its minimum interval', () => {
    const scheduler = new RefreshScheduler();
    const fast = vi.fn();
    const slow = vi.fn();
    scheduler.register('fast', { minMs: 5_000, refresh: fast });
    scheduler.register('slow', { minMs: 15_000, refresh: slow });

    vi.advanceTimersByTime(5_000);
    scheduler.tick();
    expect(fast).toHaveBeenCalledTimes(1);
    expect(slow).not.toHaveBeenCalled();

    vi.advanceTimersByTime(10_000);
    scheduler.tick();
    expect(fast).toHaveBeenCalledTimes(2);
    expect(slow).toHaveBeenCalledTimes(1);
  });

  it('passes the refresh time to the subscriber', () => {
    const scheduler = new RefreshScheduler();
    const card = vi.fn();
    scheduler.register('card', { minMs: 5_000, refresh: card });
    vi.advanceTimersByTime(5_000);
    scheduler.tick();
    expect(card).toHaveBeenCalledWith(Date.now(), false);
  });

  it('refreshes every subscriber by hand, whatever its minimum', () => {
    const scheduler = new RefreshScheduler();
    const fast = vi.fn();
    const slow = vi.fn();
    const ticked = vi.fn();
    scheduler.register('fast', { minMs: 5_000, refresh: fast });
    scheduler.register('slow', { minMs: 600_000, refresh: slow });
    scheduler.subscribe(ticked);

    vi.advanceTimersByTime(1_000);
    scheduler.refreshAll();
    expect(fast).toHaveBeenCalledTimes(1);
    expect(slow).toHaveBeenCalledWith(Date.now(), true);
    expect(ticked).toHaveBeenCalledTimes(1);
    expect(scheduler.getLastTickAt()).toBe(Date.now());

    // The manual refresh restarts each minimum.
    vi.advanceTimersByTime(3_000);
    scheduler.tick();
    expect(fast).toHaveBeenCalledTimes(1);
  });

  it('stops refreshing an unregistered subscriber', () => {
    const scheduler = new RefreshScheduler();
    const card = vi.fn();
    const unregister = scheduler.register('card', {
      minMs: 5_000,
      refresh: card,
    });
    unregister();
    vi.advanceTimersByTime(30_000);
    scheduler.tick();
    scheduler.refreshAll();
    expect(card).not.toHaveBeenCalled();
  });

  it('skips a hidden subscriber on a tick, but not on a manual refresh', () => {
    const scheduler = new RefreshScheduler();
    const shown = vi.fn();
    const offscreen = vi.fn();
    scheduler.register('shown', { minMs: 5_000, refresh: shown });
    scheduler.register('offscreen', { minMs: 5_000, refresh: offscreen });
    scheduler.setVisible('offscreen', false);

    vi.advanceTimersByTime(5_000);
    scheduler.tick();
    expect(shown).toHaveBeenCalledTimes(1);
    expect(offscreen).not.toHaveBeenCalled();

    scheduler.refreshAll();
    expect(offscreen).toHaveBeenCalledTimes(1);
  });

  it('refreshes a subscriber that comes back into view once it is due', () => {
    const scheduler = new RefreshScheduler();
    const card = vi.fn();
    scheduler.register('card', { minMs: 60_000, refresh: card });
    scheduler.setVisible('card', false);

    vi.advanceTimersByTime(30_000);
    scheduler.setVisible('card', true);
    expect(card).not.toHaveBeenCalled();

    scheduler.setVisible('card', false);
    vi.advanceTimersByTime(90_000);
    scheduler.tick();
    expect(card).not.toHaveBeenCalled();
    scheduler.setVisible('card', true);
    expect(card).toHaveBeenCalledTimes(1);
    expect(card).toHaveBeenCalledWith(Date.now(), false);

    // Already visible: reporting it again refreshes nothing.
    vi.advanceTimersByTime(60_000);
    scheduler.setVisible('card', true);
    expect(card).toHaveBeenCalledTimes(1);
  });
});
