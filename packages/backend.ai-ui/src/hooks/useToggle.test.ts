import useToggle from './useToggle';
import { renderHook, act } from '@testing-library/react';

describe('useToggle', () => {
  it('defaults to false', () => {
    const { result } = renderHook(() => useToggle());
    expect(result.current[0]).toBe(false);
  });

  it('toggles between the two values', () => {
    const { result } = renderHook(() => useToggle(false));

    act(() => result.current[1].toggle());
    expect(result.current[0]).toBe(true);

    act(() => result.current[1].toggle());
    expect(result.current[0]).toBe(false);
  });

  it('supports setLeft / setRight / set', () => {
    const { result } = renderHook(() => useToggle(false));

    act(() => result.current[1].setRight());
    expect(result.current[0]).toBe(true);

    act(() => result.current[1].setRight());
    expect(result.current[0]).toBe(true);

    act(() => result.current[1].setLeft());
    expect(result.current[0]).toBe(false);

    act(() => result.current[1].set(true));
    expect(result.current[0]).toBe(true);
  });

  it('supports arbitrary left/right values', () => {
    const { result } = renderHook(() => useToggle('on', 'off'));
    expect(result.current[0]).toBe('on');

    act(() => result.current[1].toggle());
    expect(result.current[0]).toBe('off');

    act(() => result.current[1].toggle());
    expect(result.current[0]).toBe('on');
  });

  it('keeps a stable actions object and ignores later argument changes', () => {
    const { result, rerender } = renderHook(
      ({ initial }) => useToggle(initial),
      { initialProps: { initial: false } },
    );
    const actions = result.current[1];

    rerender({ initial: true });

    expect(result.current[1]).toBe(actions);
    // The state is still driven by the *first* defaultValue, as in ahooks.
    expect(result.current[0]).toBe(false);
    act(() => result.current[1].toggle());
    expect(result.current[0]).toBe(true);
  });
});
