/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RefreshScheduler } from './refreshScheduler';

const createScheduler = () => {
  let hidden = false;
  const listeners = new Set<() => void>();
  const scheduler = new RefreshScheduler({
    now: () => Date.now(),
    isHidden: () => hidden,
    onVisibilityChange: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  });
  const setHidden = (next: boolean) => {
    hidden = next;
    listeners.forEach((listener) => listener());
  };
  return { scheduler, setHidden };
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-26T00:00:00Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('RefreshScheduler', () => {
  it('refreshes a subscriber only after its minimum interval', () => {
    const { scheduler } = createScheduler();
    const fast = vi.fn();
    const slow = vi.fn();
    scheduler.register('fast', { minMs: 5_000, refresh: fast });
    scheduler.register('slow', { minMs: 15_000, refresh: slow });
    scheduler.setInterval(5_000);
    const stop = scheduler.start();

    vi.advanceTimersByTime(5_000);
    expect(fast).toHaveBeenCalledTimes(1);
    expect(slow).not.toHaveBeenCalled();

    vi.advanceTimersByTime(10_000);
    expect(fast).toHaveBeenCalledTimes(3);
    expect(slow).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(15_000);
    expect(fast).toHaveBeenCalledTimes(6);
    expect(slow).toHaveBeenCalledTimes(2);
    stop();
  });

  it('uses the slower of the bar interval and the minimum', () => {
    const { scheduler } = createScheduler();
    const card = vi.fn();
    scheduler.register('card', { minMs: 15_000, refresh: card });
    scheduler.setInterval(60_000);
    scheduler.start();

    vi.advanceTimersByTime(59_000);
    expect(card).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1_000);
    expect(card).toHaveBeenCalledTimes(1);
    scheduler.stop();
  });

  it('passes the refresh time to the subscriber', () => {
    const { scheduler } = createScheduler();
    const card = vi.fn();
    scheduler.register('card', { minMs: 5_000, refresh: card });
    scheduler.setInterval(5_000);
    scheduler.start();
    vi.advanceTimersByTime(5_000);
    expect(card).toHaveBeenCalledWith(Date.now());
    scheduler.stop();
  });

  it('pauses while the tab is hidden and catches up when it returns', () => {
    const { scheduler, setHidden } = createScheduler();
    const card = vi.fn();
    scheduler.register('card', { minMs: 10_000, refresh: card });
    scheduler.setInterval(10_000);
    scheduler.start();

    setHidden(true);
    vi.advanceTimersByTime(60_000);
    expect(card).not.toHaveBeenCalled();

    setHidden(false);
    expect(card).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(10_000);
    expect(card).toHaveBeenCalledTimes(2);
    scheduler.stop();
  });

  it('does not tick when auto refresh is off', () => {
    const { scheduler, setHidden } = createScheduler();
    const card = vi.fn();
    scheduler.register('card', { minMs: 5_000, refresh: card });
    scheduler.setInterval(null);
    scheduler.start();
    vi.advanceTimersByTime(120_000);
    setHidden(true);
    setHidden(false);
    expect(card).not.toHaveBeenCalled();
    scheduler.stop();
  });

  it('refreshes every subscriber by hand and restarts the countdown', () => {
    const { scheduler } = createScheduler();
    const fast = vi.fn();
    const slow = vi.fn();
    const ticked = vi.fn();
    scheduler.register('fast', { minMs: 5_000, refresh: fast });
    scheduler.register('slow', { minMs: 600_000, refresh: slow });
    scheduler.subscribe(ticked);
    scheduler.setInterval(30_000);
    scheduler.start();

    vi.advanceTimersByTime(20_000);
    scheduler.refreshAll();
    expect(fast).toHaveBeenCalledTimes(1);
    expect(slow).toHaveBeenCalledTimes(1);
    expect(ticked).toHaveBeenCalledTimes(1);
    expect(scheduler.getLastTickAt()).toBe(Date.now());

    vi.advanceTimersByTime(10_000);
    expect(fast).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(20_000);
    expect(fast).toHaveBeenCalledTimes(2);
    expect(slow).toHaveBeenCalledTimes(1);
    scheduler.stop();
  });

  it('stops refreshing an unregistered subscriber', () => {
    const { scheduler } = createScheduler();
    const card = vi.fn();
    const unregister = scheduler.register('card', {
      minMs: 5_000,
      refresh: card,
    });
    scheduler.setInterval(5_000);
    scheduler.start();
    unregister();
    vi.advanceTimersByTime(30_000);
    expect(card).not.toHaveBeenCalled();
    scheduler.stop();
  });

  it('applies a new interval at once', () => {
    const { scheduler } = createScheduler();
    const card = vi.fn();
    scheduler.register('card', { minMs: 5_000, refresh: card });
    scheduler.setInterval(60_000);
    scheduler.start();
    scheduler.setInterval(5_000);
    vi.advanceTimersByTime(5_000);
    expect(card).toHaveBeenCalledTimes(1);
    scheduler.stop();
  });
});
