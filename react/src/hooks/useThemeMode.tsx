/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useLocalStorageGlobalState } from './useLocalStorageGlobalState';
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

type themeModeValue = 'system' | 'dark' | 'light';

/**
 * Custom hook for managing theme mode in the application.
 * This hook handles the theme mode based on user preferences and settings.
 * For styles before React rendering, please refer to the index.html related to `dark-theme` class name of body.
 * This hook only takes effect after React rendering.
 *
 * Only `themeMode` is persisted to localStorage. `isDarkMode` is derived from
 * `themeMode` and the OS media query preference — never stored separately.
 */

type ThemeModeContextType = {
  themeMode: themeModeValue;
  isDarkMode: boolean;
  setThemeMode: (value: themeModeValue) => void;
};

const ThemeModeContext = createContext<ThemeModeContextType | undefined>(
  undefined,
);

export const ThemeModeProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  'use memo';

  const [rawThemeMode, setThemeMode] =
    useLocalStorageGlobalState<themeModeValue>(
      'backendaiwebui.settings.themeMode',
      'system',
    );
  const themeMode: themeModeValue = rawThemeMode ?? 'system';

  const [systemIsDark, setSystemIsDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  );

  useEffect(() => {
    if (themeMode !== 'system') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (event: MediaQueryListEvent) => {
      setSystemIsDark(event.matches);
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [themeMode]);

  const isDarkMode =
    themeMode === 'dark' ? true : themeMode === 'light' ? false : systemIsDark;

  // Apply side effects whenever isDarkMode changes
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    globalThis.isDarkMode = isDarkMode;
    document.dispatchEvent(
      new CustomEvent('change:backendaiwebui.setting.isDarkMode', {
        detail: isDarkMode,
      }),
    );
  }, [isDarkMode]);

  const value: ThemeModeContextType = {
    themeMode,
    isDarkMode,
    setThemeMode,
  };

  return (
    <ThemeModeContext.Provider value={value}>
      {children}
    </ThemeModeContext.Provider>
  );
};

export const useThemeMode = () => {
  const context = useContext(ThemeModeContext);
  if (context === undefined) {
    throw new Error(
      'useThemeModeContext must be used within a ThemeModeProvider',
    );
  }
  return context;
};
