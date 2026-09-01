import { createPoller } from './poll.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const setHidden = (hidden: boolean) => {
  Object.defineProperty(document, 'hidden', {
    configurable: true,
    get: () => hidden,
  });
  document.dispatchEvent(new Event('visibilitychange'));
};

beforeEach(() => {
  vi.useFakeTimers();
  Object.defineProperty(document, 'hidden', {
    configurable: true,
    get: () => false,
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('createPoller', () => {
  const poller = (load = vi.fn().mockResolvedValue({ pins: [] })) => {
    const onPayload = vi.fn();
    const onError = vi.fn();
    const instance = createPoller({
      load,
      onPayload,
      onError,
      visibleMs: 25_000,
      idleMs: 120_000,
      quietAfterMs: 300_000,
    });
    return { instance, load, onPayload, onError };
  };

  it('loads once on start and then every 25 s while visible', async () => {
    const { instance, load, onPayload } = poller();
    instance.start();
    await vi.advanceTimersByTimeAsync(0);
    expect(load).toHaveBeenCalledTimes(1);
    expect(onPayload).toHaveBeenCalledWith({ pins: [] });
    await vi.advanceTimersByTimeAsync(25_000);
    expect(load).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(25_000);
    expect(load).toHaveBeenCalledTimes(3);
    instance.stop();
  });

  it('backs off to 120 s once nothing has changed for the quiet period', async () => {
    const { instance, load } = poller();
    instance.start();
    // The back-off is decided when a poll finishes, so it takes hold on the
    // first tick AFTER the quiet period, not during it.
    await vi.advanceTimersByTimeAsync(325_001);
    const before = load.mock.calls.length;
    await vi.advanceTimersByTimeAsync(25_000);
    expect(load).toHaveBeenCalledTimes(before);
    await vi.advanceTimersByTimeAsync(95_001);
    expect(load).toHaveBeenCalledTimes(before + 1);
    instance.stop();
  });

  it('returns to the fast cadence when the payload changes', async () => {
    let pins: unknown[] = [];
    const load = vi.fn().mockImplementation(async () => ({ pins }));
    const { instance } = poller(load);
    instance.start();
    await vi.advanceTimersByTimeAsync(300_001);
    pins = [{ id: 'c_zdv3rhz' }];
    await vi.advanceTimersByTimeAsync(120_000);
    const after = load.mock.calls.length;
    await vi.advanceTimersByTimeAsync(25_000);
    expect(load).toHaveBeenCalledTimes(after + 1);
    instance.stop();
  });

  // The pins payload carries a server timestamp, which is not a change.
  it('still backs off when every answer carries a fresh timestamp', async () => {
    let at = 0;
    const load = vi
      .fn()
      .mockImplementation(async () => ({ pins: [], fetchedAt: ++at }));
    const onPayload = vi.fn();
    const onError = vi.fn();
    const instance = createPoller<{ pins: unknown[]; fetchedAt: number }>({
      load,
      onPayload,
      onError,
      visibleMs: 25_000,
      idleMs: 120_000,
      quietAfterMs: 300_000,
      signatureOf: (payload) => JSON.stringify(payload.pins),
    });
    instance.start();
    await vi.advanceTimersByTimeAsync(325_001);
    const before = load.mock.calls.length;
    await vi.advanceTimersByTimeAsync(25_000);
    expect(load).toHaveBeenCalledTimes(before);
    instance.stop();
  });

  it('stops while the tab is hidden and catches up when it comes back', async () => {
    const { instance, load } = poller();
    instance.start();
    await vi.advanceTimersByTimeAsync(0);
    setHidden(true);
    await vi.advanceTimersByTimeAsync(200_000);
    expect(load).toHaveBeenCalledTimes(1);
    setHidden(false);
    await vi.advanceTimersByTimeAsync(0);
    expect(load).toHaveBeenCalledTimes(2);
    instance.stop();
  });

  it('refetches on focus', async () => {
    const { instance, load } = poller();
    instance.start();
    await vi.advanceTimersByTimeAsync(0);
    window.dispatchEvent(new Event('focus'));
    await vi.advanceTimersByTimeAsync(0);
    expect(load).toHaveBeenCalledTimes(2);
    instance.stop();
  });

  it('reports a failure and keeps polling', async () => {
    const load = vi
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue({ pins: [] });
    const { instance, onError, onPayload } = poller(load);
    instance.start();
    await vi.advanceTimersByTimeAsync(0);
    expect(onError).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(25_000);
    expect(onPayload).toHaveBeenCalledTimes(1);
    instance.stop();
  });

  it('never runs two loads at once', async () => {
    let release: (value: unknown) => void = () => undefined;
    const load = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          release = resolve;
        }),
    );
    const { instance } = poller(load);
    instance.start();
    instance.refreshNow();
    window.dispatchEvent(new Event('focus'));
    await vi.advanceTimersByTimeAsync(0);
    expect(load).toHaveBeenCalledTimes(1);
    release({ pins: [] });
    instance.stop();
  });

  it('stops for good on stop()', async () => {
    const { instance, load } = poller();
    instance.start();
    await vi.advanceTimersByTimeAsync(0);
    instance.stop();
    await vi.advanceTimersByTimeAsync(200_000);
    expect(load).toHaveBeenCalledTimes(1);
  });
});
