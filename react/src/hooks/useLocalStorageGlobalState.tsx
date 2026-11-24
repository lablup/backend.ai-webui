/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useLocalStorageState } from 'backend.ai-ui';
import { useCallback, useEffect } from 'react';

/** `useStorageState` may be another `createUseStorageState` hook; it must not change between renders. */
export const useLocalStorageGlobalState = <T,>(
  key: string,
  defaultValue: T,
  useStorageState: typeof useLocalStorageState = useLocalStorageState,
) => {
  const [storageValue, setStorageValue] = useStorageState<T>(key, {
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
    useCallback(
      (value: T) => {
        document.dispatchEvent(
          new CustomEvent(eventName, {
            detail: value,
          }),
        );
      },
      [eventName],
    ),
  ] as const;
};
