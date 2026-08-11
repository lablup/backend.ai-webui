import useDebounce from './useDebounce';
import { renderHook, act } from '@testing-library/react';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('adopts the initial value synchronously', () => {
    const { result } = renderHook(() => useDebounce('a', { wait: 100 }));
    expect(result.current).toBe('a');
  });

  it('only settles on the last value of a burst', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, { wait: 100 }),
      { initialProps: { value: 'a' } },
    );

    rerender({ value: 'b' });
    act(() => vi.advanceTimersByTime(50));
    rerender({ value: 'c' });
    act(() => vi.advanceTimersByTime(50));
    expect(result.current).toBe('a');

    act(() => vi.advanceTimersByTime(50));
    expect(result.current).toBe('c');
  });

  it('emits immediately with leading: true, then again on the trailing edge (the NetworkStatusBanner shape)', () => {
    const { result, rerender } = renderHook(
      ({ value }) =>
        useDebounce(value, { wait: 5000, leading: true, trailing: true }),
      { initialProps: { value: false } },
    );

    // The mount effect consumes the leading edge, so the *first* change after
    // mount lands on the trailing edge.
    rerender({ value: true });
    act(() => vi.advanceTimersByTime(5000));
    expect(result.current).toBe(true);

    // A change after the window has closed takes the leading edge again.
    rerender({ value: false });
    expect(result.current).toBe(false);
  });

  it('defaults to a 1000ms wait', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: 1 },
    });

    rerender({ value: 2 });
    act(() => vi.advanceTimersByTime(999));
    expect(result.current).toBe(1);

    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe(2);
  });

  it('does not update after unmount', () => {
    const { rerender, unmount } = renderHook(
      ({ value }) => useDebounce(value, { wait: 100 }),
      { initialProps: { value: 'a' } },
    );
    rerender({ value: 'b' });
    unmount();
    expect(() => act(() => vi.advanceTimersByTime(100))).not.toThrow();
  });
});
