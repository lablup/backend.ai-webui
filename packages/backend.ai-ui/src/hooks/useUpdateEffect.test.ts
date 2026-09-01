import useUpdateEffect from './useUpdateEffect';
import { renderHook } from '@testing-library/react';

describe('useUpdateEffect', () => {
  it('does not run on mount', () => {
    const effect = vi.fn();
    renderHook(() => useUpdateEffect(effect, [1]));
    expect(effect).not.toHaveBeenCalled();
  });

  it('runs when a dependency changes', () => {
    const effect = vi.fn();
    const { rerender } = renderHook(
      ({ dep }) => useUpdateEffect(effect, [dep]),
      {
        initialProps: { dep: 1 },
      },
    );

    rerender({ dep: 2 });
    expect(effect).toHaveBeenCalledTimes(1);

    rerender({ dep: 3 });
    expect(effect).toHaveBeenCalledTimes(2);
  });

  it('does not run when the dependencies are unchanged', () => {
    const effect = vi.fn();
    const { rerender } = renderHook(
      ({ dep }) => useUpdateEffect(effect, [dep]),
      {
        initialProps: { dep: 1 },
      },
    );

    rerender({ dep: 1 });
    rerender({ dep: 1 });
    expect(effect).not.toHaveBeenCalled();
  });

  it('runs the returned cleanup before the next update', () => {
    const cleanup = vi.fn();
    const { rerender, unmount } = renderHook(
      ({ dep }) => useUpdateEffect(() => cleanup, [dep]),
      { initialProps: { dep: 1 } },
    );

    rerender({ dep: 2 });
    expect(cleanup).not.toHaveBeenCalled();

    rerender({ dep: 3 });
    expect(cleanup).toHaveBeenCalledTimes(1);

    unmount();
    expect(cleanup).toHaveBeenCalledTimes(2);
  });

  it('re-arms the mount guard after a remount', () => {
    const effect = vi.fn();
    const { unmount } = renderHook(() => useUpdateEffect(effect, [1]));
    unmount();

    const second = renderHook(() => useUpdateEffect(effect, [1]));
    expect(effect).not.toHaveBeenCalled();
    second.rerender();
    expect(effect).not.toHaveBeenCalled();
  });
});
