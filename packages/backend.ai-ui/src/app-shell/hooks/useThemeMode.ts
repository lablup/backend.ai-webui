import type { ThemeMode } from '../types';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

interface ThemeModeContextValue {
  themeMode: ThemeMode;
  isDarkMode: boolean;
  setThemeMode: (mode: ThemeMode) => void;
}

export const ThemeModeContext = createContext<ThemeModeContextValue | null>(
  null,
);

export function useThemeMode(): ThemeModeContextValue {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) {
    throw new Error('useThemeMode must be used inside <AppShellProvider>');
  }
  return ctx;
}

function readStoredMode(key: string, fallback: ThemeMode): ThemeMode {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === 'light' || raw === 'dark' || raw === 'system') return raw;
  } catch {
    // localStorage unavailable
  }
  return fallback;
}

function systemPrefersDark(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function useThemeModeState(
  defaultMode: ThemeMode,
  storageKey: string,
): ThemeModeContextValue {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() =>
    readStoredMode(storageKey, defaultMode),
  );
  const [systemDark, setSystemDark] = useState<boolean>(systemPrefersDark);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const setThemeMode = useCallback(
    (mode: ThemeMode) => {
      setThemeModeState(mode);
      try {
        window.localStorage.setItem(storageKey, mode);
      } catch {
        // ignore
      }
    },
    [storageKey],
  );

  const isDarkMode =
    themeMode === 'dark' || (themeMode === 'system' && systemDark);

  return { themeMode, isDarkMode, setThemeMode };
}
