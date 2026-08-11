import useHover from './useHover';
import { renderHook, act } from '@testing-library/react';

describe('useHover', () => {
  let el: HTMLDivElement;

  beforeEach(() => {
    el = document.createElement('div');
    document.body.appendChild(el);
  });
  afterEach(() => {
    el.remove();
  });

  it('reports false before the pointer enters', () => {
    const { result } = renderHook(() => useHover(el));
    expect(result.current).toBe(false);
  });

  it('flips on mouseenter / mouseleave', () => {
    const { result } = renderHook(() => useHover(el));

    act(() => el.dispatchEvent(new MouseEvent('mouseenter')));
    expect(result.current).toBe(true);

    act(() => el.dispatchEvent(new MouseEvent('mouseleave')));
    expect(result.current).toBe(false);
  });

  it('invokes onEnter / onLeave / onChange', () => {
    const onEnter = vi.fn();
    const onLeave = vi.fn();
    const onChange = vi.fn();

    renderHook(() => useHover(el, { onEnter, onLeave, onChange }));

    act(() => el.dispatchEvent(new MouseEvent('mouseenter')));
    expect(onEnter).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(true);

    act(() => el.dispatchEvent(new MouseEvent('mouseleave')));
    expect(onLeave).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it('ignores mouseover bubbling from children (non-bubbling events only)', () => {
    const child = document.createElement('span');
    el.appendChild(child);

    const { result } = renderHook(() => useHover(el));

    act(() =>
      child.dispatchEvent(new MouseEvent('mouseover', { bubbles: true })),
    );
    expect(result.current).toBe(false);
  });
});
