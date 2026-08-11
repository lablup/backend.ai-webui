import useThrottleFn from './useThrottleFn';
import { renderHook, act } from '@testing-library/react';

describe('useThrottleFn', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('fires on the leading edge and coalesces the rest into one trailing call', () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useThrottleFn(fn, { wait: 100 }));

    act(() => {
      result.current.run(1);
      result.current.run(2);
      result.current.run(3);
    });
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(1);

    act(() => vi.advanceTimersByTime(100));
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith(3);
  });

  it('drops the trailing call with trailing: false (the ResourcePresetSelect shape)', () => {
    const fn = vi.fn();
    const { result } = renderHook(() =>
      useThrottleFn(fn, { wait: 3000, trailing: false, leading: true }),
    );

    act(() => {
      result.current.run();
      result.current.run();
      result.current.run();
    });
    expect(fn).toHaveBeenCalledTimes(1);

    act(() => vi.advanceTimersByTime(3000));
    expect(fn).toHaveBeenCalledTimes(1);

    act(() => result.current.run());
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('always invokes the callback from the latest render', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { result, rerender } = renderHook(
      ({ fn }) => useThrottleFn(fn, { wait: 100, leading: false }),
      { initialProps: { fn: first } },
    );

    act(() => result.current.run());
    rerender({ fn: second });
    act(() => vi.advanceTimersByTime(100));

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('cancels pending calls on unmount', () => {
    const fn = vi.fn();
    const { result, unmount } = renderHook(() =>
      useThrottleFn(fn, { wait: 100, leading: false }),
    );

    act(() => result.current.run());
    unmount();
    act(() => vi.advanceTimersByTime(100));
    expect(fn).not.toHaveBeenCalled();
  });
});
