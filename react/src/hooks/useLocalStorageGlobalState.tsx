/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  useLocalStorageState,
  type UseStorageStateOptions,
} from 'backend.ai-ui';
import { useEffect } from 'react';

/**
 * A storage-backed state whose instances in one document stay in sync. Call it
 * at module scope with a `createUseStorageState` hook (localStorage, sessionStorage, …).
 */
export const createGlobalStorageStateHook = (
  useStorageState: typeof useLocalStorageState,
) =>
  function useGlobalStorageState<T>(key: string, defaultValue: T) {
    'use memo';
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

    const setGlobalValue = (value: T) => {
      document.dispatchEvent(new CustomEvent(eventName, { detail: value }));
    };

    return [storageValue, setGlobalValue] as const;
  };

// Read at call time: tests that mock `backend.ai-ui` without it still import this module.
function useLocalStorageStateAtCall<T>(
  key: string,
  options?: UseStorageStateOptions<T>,
) {
  return useLocalStorageState<T>(key, options);
}

export const useLocalStorageGlobalState = createGlobalStorageStateHook(
  useLocalStorageStateAtCall,
);
