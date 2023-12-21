import { useLocalStorageState } from 'ahooks';

export const useThemeMode = () => {
  /*todo: Implement useLocalStorage() custom hook*/
  const [themeMode, setThemeMode] = useLocalStorageState(
    'backendaiwebui.theme',
    {
      defaultValue: 'system',
    },
  );

  return {
    themeMode: 'light',
    setThemeMode,
  };
};
