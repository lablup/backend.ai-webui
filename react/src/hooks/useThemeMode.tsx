import { useLocalStorageGlobalState } from './useLocalStorageGlobalState';
import {
  PropsWithChildren,
  createContext,
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

  const [isDarkMode, setIsDarkMode] = useLocalStorageGlobalState<boolean>(
    'backendaiwebui.settings.isDarkMode',
    window.matchMedia('(prefers-color-scheme: dark)').matches,
  );

  useEffect(() => {
    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setIsDarkMode(mediaQuery.matches);
      const handler = (event: any) => {
        setIsDarkMode(event.matches);
      };
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      if (themeMode === 'dark') {
        setIsDarkMode(true);
        document.body.classList.add('dark-theme');
        // @ts-ignore
        globalThis.isDarkMode = true;
      } else {
        setIsDarkMode(false);
        document.body.classList.remove('dark-theme');
        // @ts-ignore
        globalThis.isDarkMode = false;
      }
    }
  }, [themeMode, setIsDarkMode]);

  const value = useMemo(() => {
    return {
      themeMode,
      isDarkMode,
      setThemeMode: (value: themeModeValue) => {
        setThemeMode(value);
      },
    } as ThemeModeContextType;
  }, [themeMode, isDarkMode, setThemeMode]);
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
