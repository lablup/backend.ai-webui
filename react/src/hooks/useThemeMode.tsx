import { useLocalStorageGlobalState } from './useLocalStorageGlobalState';
import { useEffect } from 'react';

type themeModeValue = 'system' | 'dark' | 'light';

export const useThemeMode = () => {
  const [themeMode, setThemeMode] = useLocalStorageGlobalState<themeModeValue>(
    'backendaiwebui.settings.themeMode',
    'system',
  );
  // TODO: remove this when all components are ready
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      } else {
        setIsDarkMode(false);
      }
    }
  }, [themeMode, setIsDarkMode]);

  return {
    themeMode,
    isDarkMode: false, //TODO: use isDarkMode when all components are ready
    setThemeMode: (value: themeModeValue) => {
      setThemeMode(value);
    },
  };
};
