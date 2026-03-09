/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  AppConfigExtra,
  useAppConfig,
  useUpsertUserAppConfig,
  useUserAppConfig,
} from './useAppConfig';
import { useBAISettingUserState } from './useBAISetting';
import { useCallback, useState } from 'react';

/**
 * Keys in `AppConfigExtra` that have a matching key in `UserSettings` (localStorage).
 * Only these keys can be used with `useAppSetting`.
 */
type MigratableSettingKey = Extract<
  keyof AppConfigExtra,
  | 'selected_language'
  | 'compact_sidebar'
  | 'desktop_notification'
  | 'preserve_login'
  | 'auto_logout'
  | 'automatic_update_check'
  | 'experimental_ai_agents'
  | 'max_concurrent_uploads'
  | 'beta_feature'
  | 'resource_panel_type'
>;

/**
 * Bridge hook that reads from server-synced AppConfig with localStorage fallback.
 *
 * - Reads: server value takes priority; falls back to localStorage if server has no value
 * - Writes: updates both server (via GraphQL mutation) and localStorage (for backward compat)
 *
 * This hook suspends while loading — the component must be wrapped in a Suspense boundary.
 *
 * @example
 * ```tsx
 * const [compactSidebar, setCompactSidebar] = useAppSetting('compact_sidebar');
 * ```
 */
export const useAppSetting = <K extends MigratableSettingKey>(
  key: K,
): [AppConfigExtra[K], (newValue: AppConfigExtra[K]) => void] => {
  'use memo';

  // Server-synced config (merged domain + user)
  const [mergedConfig, { refresh: refreshMerged }] = useAppConfig();
  // User-only config (needed for partial updates since backend does full replacement)
  const [userConfig, { refresh: refreshUser }] = useUserAppConfig();
  // localStorage fallback
  const [localValue, setLocalValue] = useBAISettingUserState(key);
  // Mutation
  const [upsertConfig] = useUpsertUserAppConfig();

  // Optimistic local state for immediate UI feedback
  const [optimisticValue, setOptimisticValue] = useState<
    AppConfigExtra[K] | null
  >(null);

  // Server value takes priority; fall back to localStorage
  const serverValue = mergedConfig[key];
  const baseValue = serverValue !== undefined ? serverValue : localValue;
  // Optimistic value takes highest priority for immediate UI response
  const value = optimisticValue !== null ? optimisticValue : baseValue;

  const setValue = useCallback(
    (newValue: AppConfigExtra[K]) => {
      // Optimistically update UI immediately
      setOptimisticValue(newValue);

      // Write to localStorage for backward compatibility
      setLocalValue(newValue as any);

      // Write to server (full replacement — merge with existing user config)
      upsertConfig(
        {
          ...(userConfig ?? {}),
          [key]: newValue,
        },
        {
          onCompleted: () => {
            // Clear optimistic state and refresh queries so Relay cache is up-to-date
            setOptimisticValue(null);
            refreshMerged();
            refreshUser();
          },
          onError: () => {
            setOptimisticValue(null);
          },
        },
      );
    },
    [
      key,
      setLocalValue,
      setOptimisticValue,
      upsertConfig,
      userConfig,
      refreshMerged,
      refreshUser,
    ],
  );

  return [value as AppConfigExtra[K], setValue];
};
