import { useCallback, useEffect, useState } from 'react';

function readStored(key: string, fallback: boolean): boolean {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === 'true') return true;
    if (raw === 'false') return false;
  } catch {
    // ignore
  }
  return fallback;
}

type SetCollapsed = (next: boolean | ((prev: boolean) => boolean)) => void;

export interface UseSiderCollapsedReturn {
  collapsed: boolean;
  /** Set collapsed and persist to localStorage. Use for explicit user action (toggle button, keyboard shortcut). */
  setCollapsed: SetCollapsed;
  /** Set collapsed without persisting. Use for transient effects like responsive breakpoint auto-collapse,
   *  so a brief narrow resize doesn't permanently overwrite the user's last manual choice. */
  setCollapsedTransient: SetCollapsed;
  /** Reset in-memory state to whatever's persisted in localStorage. Used to restore the user's last
   *  saved choice after a transient override (e.g. widening past the breakpoint). */
  restorePersisted: () => void;
}

export function useSiderCollapsed(
  storageKey: string,
  defaultValue: boolean = false,
): UseSiderCollapsedReturn {
  const [collapsed, setCollapsedState] = useState<boolean>(() =>
    readStored(storageKey, defaultValue),
  );

  const setCollapsed = useCallback<SetCollapsed>(
    (next) => {
      setCollapsedState((prev) => {
        const value = typeof next === 'function' ? next(prev) : next;
        try {
          window.localStorage.setItem(storageKey, String(value));
        } catch {
          // ignore
        }
        return value;
      });
    },
    [storageKey],
  );

  const setCollapsedTransient = useCallback<SetCollapsed>((next) => {
    setCollapsedState((prev) =>
      typeof next === 'function' ? next(prev) : next,
    );
  }, []);

  const restorePersisted = useCallback(() => {
    setCollapsedState(readStored(storageKey, defaultValue));
  }, [storageKey, defaultValue]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (e: StorageEvent) => {
      if (e.key !== storageKey || e.newValue === null) return;
      setCollapsedState(e.newValue === 'true');
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [storageKey]);

  return { collapsed, setCollapsed, setCollapsedTransient, restorePersisted };
}
