import useNetwork from './useNetwork';
import { renderHook, act } from '@testing-library/react';

describe('useNetwork', () => {
  afterEach(() => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: true,
    });
  });

  it('seeds from navigator.onLine', () => {
    const { result } = renderHook(() => useNetwork());
    expect(result.current.online).toBe(navigator.onLine);
    expect(result.current.since).toBeUndefined();
  });

  it('reacts to offline / online events and stamps `since`', () => {
    const { result } = renderHook(() => useNetwork());

    act(() => window.dispatchEvent(new Event('offline')));
    expect(result.current.online).toBe(false);
    expect(result.current.since).toBeInstanceOf(Date);

    act(() => window.dispatchEvent(new Event('online')));
    expect(result.current.online).toBe(true);
  });

  it('stops listening after unmount', () => {
    const { result, unmount } = renderHook(() => useNetwork());
    unmount();
    act(() => window.dispatchEvent(new Event('offline')));
    expect(result.current.online).toBe(true);
  });
});
