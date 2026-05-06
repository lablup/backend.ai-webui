import { useSiderCollapsed } from './useSiderCollapsed';
import { act, renderHook } from '@testing-library/react';

const KEY = 'test.sideCollapsed';

describe('useSiderCollapsed', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('initializes from defaultValue when nothing is persisted', () => {
    const { result } = renderHook(() => useSiderCollapsed(KEY, false));
    expect(result.current.collapsed).toBe(false);
  });

  it('reads persisted value from localStorage', () => {
    window.localStorage.setItem(KEY, 'true');
    const { result } = renderHook(() => useSiderCollapsed(KEY, false));
    expect(result.current.collapsed).toBe(true);
  });

  it('setCollapsed persists to localStorage', () => {
    const { result } = renderHook(() => useSiderCollapsed(KEY, false));
    act(() => result.current.setCollapsed(true));
    expect(result.current.collapsed).toBe(true);
    expect(window.localStorage.getItem(KEY)).toBe('true');
  });

  it('setCollapsedTransient updates state but does NOT persist', () => {
    // Regression test for B3: breakpoint-driven collapse must not overwrite
    // the user's manual choice.
    window.localStorage.setItem(KEY, 'false');
    const { result } = renderHook(() => useSiderCollapsed(KEY, false));
    act(() => result.current.setCollapsedTransient(true));
    expect(result.current.collapsed).toBe(true);
    expect(window.localStorage.getItem(KEY)).toBe('false');
  });

  it('restorePersisted snaps state back to whatever is in localStorage', () => {
    window.localStorage.setItem(KEY, 'false');
    const { result } = renderHook(() => useSiderCollapsed(KEY, false));
    act(() => result.current.setCollapsedTransient(true));
    expect(result.current.collapsed).toBe(true);
    act(() => result.current.restorePersisted());
    expect(result.current.collapsed).toBe(false);
  });
});
