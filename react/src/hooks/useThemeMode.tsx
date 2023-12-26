import { useGlobalLocalStorageState } from './useGlobalLocalStorageState';
import { useEffect } from 'react';

export const useThemeMode = () => {
  const [themeMode, setThemeMode] = useGlobalLocalStorageState(
    'backendaiwebui.settings.theme',
    'system',
  );
  const [isDarkMode, setIsDarkMode] = useGlobalLocalStorageState(
    'backendaiwebui.settings.themeColor',
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
      } else {
        setIsDarkMode(false);
      }
    }
  }, [themeMode, setIsDarkMode]);

  return {
    themeMode,
    isDarkMode,
    setThemeMode: (value: string) => {
      setThemeMode(value);
    },
  };
};
