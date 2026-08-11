import usePrevious from './usePrevious';
import { renderHook } from '@testing-library/react';

describe('usePrevious', () => {
  it('is undefined on the first render', () => {
    const { result } = renderHook(() => usePrevious(1));
    expect(result.current).toBeUndefined();
  });

  it('returns the value from the previous accepted render', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: 1 },
    });

    rerender({ value: 2 });
    expect(result.current).toBe(1);

    rerender({ value: 3 });
    expect(result.current).toBe(2);
  });

  it('does not advance when the value is unchanged (Object.is)', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: 1 },
    });

    rerender({ value: 2 });
    rerender({ value: 2 });
    rerender({ value: 2 });

    expect(result.current).toBe(1);
  });

  it('honours a custom shouldUpdate comparator', () => {
    const shouldUpdate = (a?: { id: number }, b?: { id: number }) =>
      a?.id !== b?.id;

    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value, shouldUpdate),
      { initialProps: { value: { id: 1, label: 'a' } } },
    );

    // Same id, different object identity ⇒ not an update.
    rerender({ value: { id: 1, label: 'b' } });
    expect(result.current).toBeUndefined();

    rerender({ value: { id: 2, label: 'c' } });
    expect(result.current).toEqual({ id: 1, label: 'a' });
  });
});
