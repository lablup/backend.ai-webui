/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useLocalStorageGlobalState } from './useLocalStorageGlobalState';
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react';

type themeModeValue = 'system' | 'dark' | 'light';

/**
 * Custom hook for managing theme mode in the application.
 * This hook handles the theme mode based on user preferences and settings.
 * For styles before React rendering, please refer to the index.html related to `dark-theme` class name of body.
 * This hook only takes effect after React rendering.
 *
 * @returns An object containing the current theme mode, whether it is dark mode or not,
 * and a function to set the theme mode.
 */

type ThemeModeContextType = {
  themeMode: themeModeValue;
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
  setThemeMode: (value: themeModeValue) => void;
};

const ThemeModeContext = createContext<ThemeModeContextType | undefined>(
  undefined,
);

export const ThemeModeProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [themeMode, setThemeMode] = useLocalStorageGlobalState<themeModeValue>(
    'backendaiwebui.settings.themeMode',
    'system',
  );

  const [isDarkMode, _setIsDarkMode] = useLocalStorageGlobalState<boolean>(
    'backendaiwebui.settings.isDarkMode',
    window.matchMedia('(prefers-color-scheme: dark)').matches,
  );

  const setIsDarkMode = useCallback(
    (value: boolean) => {
      _setIsDarkMode(value);
      if (value) {
        document.body.classList.add('dark-theme');
      } else {
        document.body.classList.remove('dark-theme');
      }
      globalThis.isDarkMode = value;

      document.dispatchEvent(
        new CustomEvent('change:backendaiwebui.setting.isDarkMode', {
          detail: value,
        }),
      );
    },
    [_setIsDarkMode],
  );
  useEffect(() => {
    if (themeMode === 'system') {
      // set current system theme mode if isDarkMode is not set
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      // listen for changes
      const handler = (event: any) => {
        setIsDarkMode(event.matches);
      };
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      const nextIsDarkMode = themeMode === 'dark';
      setIsDarkMode(nextIsDarkMode);
    }
  }, [themeMode, setIsDarkMode]);

  const value = useMemo(() => {
    return {
      themeMode,
      setThemeMode,
      isDarkMode,
      setIsDarkMode,
    } as ThemeModeContextType;
  }, [themeMode, setThemeMode, isDarkMode, setIsDarkMode]);
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
