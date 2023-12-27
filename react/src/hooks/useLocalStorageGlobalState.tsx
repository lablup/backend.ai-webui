import { useLocalStorageState } from 'ahooks';
import { IFuncUpdater } from 'ahooks/lib/createUseStorageState';
import { useEffect } from 'react';

export const useLocalStorageGlobalState = <T extends {}>(
  key: string,
  defaultValue: T,
): [T | undefined, (value?: T | IFuncUpdater<T> | undefined) => void] => {
  const [storageValue, setStorageValue] = useLocalStorageState<T>(key, {
    defaultValue: defaultValue,
  });

  useEffect(() => {
    const handler = (event: any) => {
      setStorageValue(event.detail);
    };
    document.addEventListener(key, handler);
    return () =>
      document.removeEventListener(
        'useLocalStorageGlobalState:' + key,
        handler,
      );
  }, [key, setStorageValue]);

  return [
    storageValue,
    (value) => {
      document.dispatchEvent(
        new CustomEvent('useLocalStorageGlobalState:' + key, {
          detail: value,
        }),
      );
    },
  ];
};
