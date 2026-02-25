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
import { useCallback } from 'react';

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
  const [mergedConfig] = useAppConfig();
  // User-only config (needed for partial updates since backend does full replacement)
  const [userConfig] = useUserAppConfig();
  // localStorage fallback
  const [localValue, setLocalValue] = useBAISettingUserState(key);
  // Mutation
  const [upsertConfig] = useUpsertUserAppConfig();

  // Server value takes priority; fall back to localStorage
  const serverValue = mergedConfig[key];
  const value = serverValue !== undefined ? serverValue : localValue;

  const setValue = useCallback(
    (newValue: AppConfigExtra[K]) => {
      // Write to localStorage for backward compatibility
      setLocalValue(newValue as any);

      // Write to server (full replacement — merge with existing user config)
      upsertConfig({
        ...(userConfig ?? {}),
        [key]: newValue,
      });
    },
    [key, setLocalValue, upsertConfig, userConfig],
  );

  return [value as AppConfigExtra[K], setValue];
};
