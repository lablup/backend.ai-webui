import useDebounceFn from './useDebounceFn';
import { renderHook, act } from '@testing-library/react';

describe('useDebounceFn', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('defaults to a 1000ms trailing wait', () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useDebounceFn(fn));

    act(() => {
      result.current.run();
      result.current.run();
      result.current.run();
    });
    expect(fn).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(999));
    expect(fn).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('honours a custom wait and passes arguments through', () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useDebounceFn(fn, { wait: 200 }));

    act(() => result.current.run('a', 1));
    act(() => vi.advanceTimersByTime(200));

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('a', 1);
  });

  it('supports leading: true / trailing: false', () => {
    const fn = vi.fn();
    const { result } = renderHook(() =>
      useDebounceFn(fn, { wait: 100, leading: true, trailing: false }),
    );

    act(() => result.current.run(1));
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(1);

    act(() => result.current.run(2));
    act(() => vi.advanceTimersByTime(100));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('supports cancel and flush', () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useDebounceFn(fn, { wait: 100 }));

    act(() => result.current.run());
    act(() => result.current.cancel());
    act(() => vi.advanceTimersByTime(100));
    expect(fn).not.toHaveBeenCalled();

    act(() => result.current.run('flushed'));
    act(() => result.current.flush());
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('flushed');
  });

  it('always invokes the callback from the latest render', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { result, rerender } = renderHook(
      ({ fn }) => useDebounceFn(fn, { wait: 100 }),
      { initialProps: { fn: first } },
    );

    act(() => result.current.run());
    rerender({ fn: second });
    act(() => vi.advanceTimersByTime(100));

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('keeps a stable run identity and cancels pending calls on unmount', () => {
    const fn = vi.fn();
    const { result, rerender, unmount } = renderHook(() =>
      useDebounceFn(fn, { wait: 100 }),
    );
    const run = result.current.run;
    rerender();
    expect(result.current.run).toBe(run);

    act(() => result.current.run());
    unmount();
    act(() => vi.advanceTimersByTime(100));
    expect(fn).not.toHaveBeenCalled();
  });
});
