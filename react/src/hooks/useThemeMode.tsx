import { useLocalStorageState } from 'ahooks';

export const useThemeMode = () => {
  const [themeMode, setThemeMode] = useLocalStorageState(
    'backendaiwebui.theme',
    {
      defaultValue: 'system',
    },
  );

  return {
    themeMode,
    onChangeThemeMode: (value: string) => {
      setThemeMode(value);
    },
  };
};
