import { useThemeModeState } from './useThemeMode';
import { act, renderHook } from '@testing-library/react';

const KEY = 'test.themeMode';

describe('useThemeModeState', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('initializes from defaultMode when nothing is persisted', () => {
    const { result } = renderHook(() => useThemeModeState('light', KEY));
    expect(result.current.themeMode).toBe('light');
  });

  it('reads persisted mode from localStorage', () => {
    window.localStorage.setItem(KEY, 'dark');
    const { result } = renderHook(() => useThemeModeState('light', KEY));
    expect(result.current.themeMode).toBe('dark');
    expect(result.current.isDarkMode).toBe(true);
  });

  it('isDarkMode is false when explicit mode is light, regardless of system preference', () => {
    const { result } = renderHook(() => useThemeModeState('light', KEY));
    expect(result.current.isDarkMode).toBe(false);
  });

  it('setThemeMode persists', () => {
    const { result } = renderHook(() => useThemeModeState('light', KEY));
    act(() => result.current.setThemeMode('dark'));
    expect(window.localStorage.getItem(KEY)).toBe('dark');
    expect(result.current.themeMode).toBe('dark');
  });

  it('rejects unknown stored values and falls back to defaultMode', () => {
    window.localStorage.setItem(KEY, 'banana' as never);
    const { result } = renderHook(() => useThemeModeState('light', KEY));
    expect(result.current.themeMode).toBe('light');
  });
});
