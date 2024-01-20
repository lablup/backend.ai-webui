import { useLocalStorageState } from 'ahooks';
import { useEffect } from 'react';

export const useLocalStorageGlobalState = <T extends unknown>(
  key: string,
  defaultValue: T,
) => {
  const [storageValue, setStorageValue] = useLocalStorageState<T>(key, {
    defaultValue: defaultValue,
  });
  const eventName = 'useLocalStorageGlobalState:' + key;

  useEffect(() => {
    const handler = (event: any) => {
      setStorageValue(event.detail);
    };
    document.addEventListener(eventName, handler);
    return () => document.removeEventListener(eventName, handler);
  }, [setStorageValue, eventName]);

  return [
    storageValue,
    (value: T) => {
      document.dispatchEvent(
        new CustomEvent(eventName, {
          detail: value,
        }),
      );
    },
  ] as const;
};
