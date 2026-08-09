import useEventListener from './useEventListener';
import { renderHook, act } from '@testing-library/react';
import { useRef } from 'react';

describe('useEventListener', () => {
  it('attaches to window by default', () => {
    const handler = vi.fn();
    renderHook(() => useEventListener('keydown', handler));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
    });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('detaches on unmount', () => {
    const handler = vi.fn();
    const { unmount } = renderHook(() => useEventListener('keydown', handler));
    unmount();

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
    });
    expect(handler).not.toHaveBeenCalled();
  });

  it('attaches to a ref target once the element exists', () => {
    const handler = vi.fn();
    const el = document.createElement('div');
    document.body.appendChild(el);

    const { unmount } = renderHook(() => {
      const ref = useRef<HTMLDivElement | null>(el);
      useEventListener('click', handler, { target: ref });
    });

    act(() => el.dispatchEvent(new MouseEvent('click')));
    expect(handler).toHaveBeenCalledTimes(1);

    unmount();
    act(() => el.dispatchEvent(new MouseEvent('click')));
    expect(handler).toHaveBeenCalledTimes(1);
    el.remove();
  });

  it('re-attaches when the resolved element changes without a dep change', () => {
    const handler = vi.fn();
    const first = document.createElement('div');
    const second = document.createElement('div');

    const { rerender } = renderHook(
      ({ el }) => useEventListener('click', handler, { target: el }),
      { initialProps: { el: first } },
    );

    act(() => first.dispatchEvent(new MouseEvent('click')));
    expect(handler).toHaveBeenCalledTimes(1);

    rerender({ el: second });
    act(() => first.dispatchEvent(new MouseEvent('click')));
    expect(handler).toHaveBeenCalledTimes(1);

    act(() => second.dispatchEvent(new MouseEvent('click')));
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('does not attach when enable is false, and attaches once it flips', () => {
    const handler = vi.fn();
    const { rerender } = renderHook(
      ({ enable }) => useEventListener('keydown', handler, { enable }),
      { initialProps: { enable: false } },
    );

    act(() => window.dispatchEvent(new KeyboardEvent('keydown')));
    expect(handler).not.toHaveBeenCalled();

    rerender({ enable: true });
    act(() => window.dispatchEvent(new KeyboardEvent('keydown')));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('calls the handler from the latest render without re-attaching', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(
      ({ handler }) => useEventListener('keydown', handler),
      { initialProps: { handler: first } },
    );

    rerender({ handler: second });
    act(() => window.dispatchEvent(new KeyboardEvent('keydown')));

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('honours the once option', () => {
    const handler = vi.fn();
    renderHook(() => useEventListener('keydown', handler, { once: true }));

    act(() => window.dispatchEvent(new KeyboardEvent('keydown')));
    act(() => window.dispatchEvent(new KeyboardEvent('keydown')));
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
