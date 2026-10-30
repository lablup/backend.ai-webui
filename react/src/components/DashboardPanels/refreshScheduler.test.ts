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
  it('refreshes every visible subscriber on each tick', () => {
    const scheduler = new RefreshScheduler();
    const first = vi.fn();
    const second = vi.fn();
    scheduler.register('first', { refresh: first });
    scheduler.register('second', { refresh: second });

    vi.advanceTimersByTime(1_000);
    scheduler.tick();
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1_000);
    scheduler.tick();
    expect(first).toHaveBeenCalledTimes(2);
    expect(second).toHaveBeenCalledTimes(2);
  });

  it('passes the refresh time to the subscriber', () => {
    const scheduler = new RefreshScheduler();
    const card = vi.fn();
    scheduler.register('card', { refresh: card });
    vi.advanceTimersByTime(5_000);
    scheduler.tick();
    expect(card).toHaveBeenCalledWith(Date.now(), false);
  });

  it('refreshes every subscriber by hand, visible or not', () => {
    const scheduler = new RefreshScheduler();
    const shown = vi.fn();
    const offscreen = vi.fn();
    const ticked = vi.fn();
    scheduler.register('shown', { refresh: shown });
    scheduler.register('offscreen', { refresh: offscreen });
    scheduler.setVisible('offscreen', false);
    scheduler.subscribe(ticked);

    vi.advanceTimersByTime(1_000);
    scheduler.refreshAll();
    expect(shown).toHaveBeenCalledWith(Date.now(), true);
    expect(offscreen).toHaveBeenCalledWith(Date.now(), true);
    expect(ticked).toHaveBeenCalledTimes(1);
    expect(scheduler.getLastTickAt()).toBe(Date.now());
  });

  it('stops refreshing an unregistered subscriber', () => {
    const scheduler = new RefreshScheduler();
    const card = vi.fn();
    const unregister = scheduler.register('card', { refresh: card });
    unregister();
    vi.advanceTimersByTime(30_000);
    scheduler.tick();
    scheduler.refreshAll();
    expect(card).not.toHaveBeenCalled();
  });

  it('skips a hidden subscriber on a tick', () => {
    const scheduler = new RefreshScheduler();
    const shown = vi.fn();
    const offscreen = vi.fn();
    scheduler.register('shown', { refresh: shown });
    scheduler.register('offscreen', { refresh: offscreen });
    scheduler.setVisible('offscreen', false);

    vi.advanceTimersByTime(5_000);
    scheduler.tick();
    expect(shown).toHaveBeenCalledTimes(1);
    expect(offscreen).not.toHaveBeenCalled();
  });

  it('refreshes a subscriber that comes back into view once its last refresh is older than the interval', () => {
    const scheduler = new RefreshScheduler();
    scheduler.setIntervalMs(60_000);
    const card = vi.fn();
    scheduler.register('card', { refresh: card });
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

  it('does not refresh a returning subscriber while automatic refresh is off', () => {
    const scheduler = new RefreshScheduler();
    scheduler.setIntervalMs(null);
    const card = vi.fn();
    scheduler.register('card', { refresh: card });
    scheduler.setVisible('card', false);

    vi.advanceTimersByTime(600_000);
    scheduler.setVisible('card', true);
    expect(card).not.toHaveBeenCalled();
  });

  it('skips a subscriber on a tick while its previous refresh is in flight', () => {
    const scheduler = new RefreshScheduler();
    const slow = vi.fn();
    const fast = vi.fn();
    scheduler.register('slow', { refresh: slow });
    scheduler.register('fast', { refresh: fast });
    const listener = vi.fn();
    scheduler.subscribe(listener);

    scheduler.setPending('slow', true);
    expect(scheduler.isRefreshing()).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);
    scheduler.tick();
    expect(slow).not.toHaveBeenCalled();
    expect(fast).toHaveBeenCalledTimes(1);

    scheduler.setPending('slow', false);
    expect(scheduler.isRefreshing()).toBe(false);
    scheduler.tick();
    expect(slow).toHaveBeenCalledTimes(1);
  });
});
