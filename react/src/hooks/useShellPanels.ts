/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useBAISettingUserState } from './useBAISetting';
import { atom, useAtom } from 'jotai';
import type { SetStateAction } from 'react';

/**
 * Open/closed state of the two app-shell panels. Both used to live inside the
 * component that owns the `[` / `]` shortcut, which left the global search
 * palette unable to drive them from outside the layout.
 */
export const notificationDrawerOpenState = atom(false);

export const useNotificationDrawerState = () =>
  useAtom(notificationDrawerOpenState);

/** `null` follows the `compact_sidebar` setting; a boolean is a manual choice. */
const siderCollapsedOverrideState = atom<boolean | null>(null);

export const useSiderCollapsedState = (): [
  boolean,
  (value: SetStateAction<boolean>) => void,
] => {
  'use memo';

  const [compactSidebarActive] = useBAISettingUserState('compact_sidebar');
  const [override, setOverride] = useAtom(siderCollapsedOverrideState);

  return [
    override ?? !!compactSidebarActive,
    (value) =>
      setOverride((prev) =>
        typeof value === 'function'
          ? value(prev ?? !!compactSidebarActive)
          : value,
      ),
  ];
};
