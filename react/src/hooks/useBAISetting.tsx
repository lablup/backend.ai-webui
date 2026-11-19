/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { jotaiStore } from '../components/DefaultProviders';
import type { RecentSearchHit } from '../components/GlobalSearchPalette/types';
import { backendaiOptions } from '../global-stores';
import { BAIAppearanceConfig } from '../helper/customThemeConfig';
import {
  isAccountUserSetting,
  queueUserSettingWrite,
  rawToSetting,
  settingToRaw,
  USER_SETTING_STORAGE_PREFIX,
} from '../helper/userSettingsAppConfig';
import type { AgentEndpointBindings, AgentProfile } from './useAIAgent';
import { type BAIBoardItem, BAITableColumnOverrideRecord } from 'backend.ai-ui';
import { atom, useAtom, useAtomValue } from 'jotai';
import { atomFamily } from 'jotai-family';
import * as _ from 'lodash-es';
import { SetStateAction } from 'react';

export interface UserSettings {
  has_opened_tour_neo_session_validation?: boolean;
  has_opened_tour_deployment_preset_validation?: boolean;
  has_opened_tour_back_to_user_view?: boolean;
  has_opened_tour_back_to_admin_settings?: boolean;
  desktop_notification?: boolean;
  session_monitor_sort?: 'deadline' | 'newest' | 'name';
  session_monitor_rows?: number;
  /** Queryfilter on the watched sessions; unset means the role's default. */
  session_monitor_condition?: string;
  /** What the header chip shows besides the count; default none. */
  session_monitor_chip_items?: Array<
    'starting' | 'error' | 'resources' | 'idle'
  >;
  compact_sidebar?: boolean;
  preserve_login?: boolean;
  automatic_update_check?: boolean;
  last_window_close_time?: number;
  endpoints?: Array<string>;
  selected_language?: string;
  recentSessionHistory?: Array<SessionHistory>;
  pinnedSessionHistory?: Array<SessionHistory>;
  recentSearchHits?: Array<RecentSearchHit>;
  experimental_ai_agents?: boolean;
  experimental_import_from_huggingface?: boolean;
  experimental_session_resource_grid?: boolean;
  /** Header session monitor (chip, polling, idle alerts); default off. */
  experimental_session_monitor?: boolean;
  /** Floating WebUI Assistant chat; default off. */
  experimental_webui_assistant?: boolean;
  extra_ai_agents?: Array<AgentProfile>;
  agent_endpoints?: AgentEndpointBindings;
  session_metrics_board_items?: Array<Omit<BAIBoardItem, 'data'>>;
  resource_panel_type?:
    | 'MyResource'
    | 'MyResourceWithinResourceGroup'
    | 'TotalResourceWithinResourceGroup';
  [key: `hiddenColumnKeys.${string}`]: Array<string>;
  [key: `table_column_overrides.${string}`]: BAITableColumnOverrideRecord;
  [key: `projectGroup.${string}`]: string;
  // Per-consumer auto-refresh interval (ms) chosen via BAIFetchKeyButton's
  // interval dropdown. `null` (or absent) means auto-refresh is off. Keyed by a
  // stable consumer id (see AutoUpdateFetchKeyButton's `settingId`).
  [key: `fetchKeyAutoUpdateDelay.${string}`]: number | null;

  max_concurrent_uploads?: number;
  custom_theme_config?: BAIAppearanceConfig;
  deploymentRevisionCreationMode?: 'preset' | 'custom';
  // Session resource grid: per-session group-color overrides, keyed by
  // session id, valued by palette index (FR-3570).
  sessionResourceGridHueOverrides?: Record<string, number>;
  schedulingHistoryExpandMode?: 'expand-all' | 'collapse-all' | 'errors-only';
  chat_intro_alert_dismissed?: boolean;
  show_accelerator_dedicated_images_first?: boolean;
}

export type SessionHistory = {
  id: string;
  name?: string;
  params: string;
  createdAt: string;
};

interface GeneralSettings {
  language?: string;
}

export const useBAISettingUserState = <K extends keyof UserSettings>(
  name: K,
): [UserSettings[K], (newValue: SetStateAction<UserSettings[K]>) => void] => {
  return useAtom<UserSettings[K]>(SettingAtomFamily('user.' + name));
};

/**
 * Whether a user setting holds a value, an explicit `null` included.
 * `useBAISettingUserState` returns `null` for both "never set" and "set to
 * `null`", so a caller whose default applies only while unset (an auto-refresh
 * the user may turn off) reads this instead.
 */
export const useHasStoredUserSetting = <K extends keyof UserSettings>(
  name: K,
): boolean => useAtomValue(HasStoredSettingAtomFamily(name));

export const useBAISettingGeneralState = <K extends keyof GeneralSettings>(
  name: K,
): [GeneralSettings[K], (newValue: GeneralSettings[K]) => void] => {
  return useAtom(SettingAtomFamily('general.' + name));
};

const settingAtom = atom<{
  [key: string]: any;
}>({});

// Account settings (ADR 0032): seeded from `userConfig.settings` at sign-in.
const accountUserSettingsAtom = atom<Record<string, unknown>>({});

export const setAccountUserSettings = (settings: Record<string, unknown>) => {
  jotaiStore.set(accountUserSettingsAtom, settings);
};

export const getAccountUserSettings = (): Record<string, unknown> =>
  jotaiStore.get(accountUserSettingsAtom);

// Split at the first dot only: a setting name may itself contain dots.
const splitParam = (param: string) => {
  const separator = param.indexOf('.');
  return {
    namespace: param.slice(0, separator),
    name: param.slice(separator + 1),
  };
};

const isAccountParam = (param: string) => {
  const { namespace, name } = splitParam(param);
  return namespace === 'user' && isAccountUserSetting(name);
};

const accountSettingAtom = (name: string) =>
  atom(
    (get) => get(accountUserSettingsAtom)[name] ?? null,
    (get, set, newValueOrUpdater: any) => {
      const current = get(accountUserSettingsAtom);
      const newValue =
        typeof newValueOrUpdater === 'function'
          ? newValueOrUpdater(current[name] ?? null)
          : newValueOrUpdater;
      // An unchanged value (an absent key set to `undefined` included) writes nothing.
      if (
        _.isEqual(current[name], newValue) &&
        name in current === (newValue !== undefined)
      )
        return;
      const next = { ...current, [name]: newValue };
      if (newValue === undefined) delete next[name];
      set(accountUserSettingsAtom, next);
      queueUserSettingWrite(name, newValue);
    },
  );

const localSettingAtom = (param: string) =>
  atom(
    (get) => {
      const key = 'backendaiwebui.settings.' + param;
      get(settingAtom); // only for the reactivity
      return rawToSetting(localStorage.getItem(key));
    },
    (get, set, newValueOrUpdater: any) => {
      const key = 'backendaiwebui.settings.' + param;
      const currentValue = rawToSetting(localStorage.getItem(key));
      const newValue =
        typeof newValueOrUpdater === 'function'
          ? newValueOrUpdater(currentValue)
          : newValueOrUpdater;

      const { namespace, name } = splitParam(param);
      // `undefined` removes the key; writing it would store the string "undefined".
      if (newValue === undefined) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, settingToRaw(newValue));
      }

      // only for the reactivity
      const prev = get(settingAtom);
      set(settingAtom, {
        ...prev,
        [key]: newValue,
      });
      if (newValue === undefined) {
        backendaiOptions?.delete?.(name, namespace, true);
      } else {
        backendaiOptions?.set?.(name, newValue, namespace, true);
      }
    },
  );

const SettingAtomFamily = atomFamily((param: string) =>
  isAccountParam(param)
    ? accountSettingAtom(splitParam(param).name)
    : localSettingAtom(param),
);

const HasStoredSettingAtomFamily = atomFamily((name: string) =>
  atom((get) => {
    if (isAccountUserSetting(name)) {
      return name in get(accountUserSettingsAtom);
    }
    get(settingAtom); // only for the reactivity
    return localStorage.getItem(USER_SETTING_STORAGE_PREFIX + name) !== null;
  }),
);

document?.addEventListener('backendaiwebui.settings:set', (e: any) => {
  const { detail } = e;
  if (detail.namespace && detail.name) {
    jotaiStore.set(
      SettingAtomFamily(detail.namespace + '.' + detail.name),
      detail.value,
    );
  }
});

document?.addEventListener('backendaiwebui.settings:delete', (e: any) => {
  const { detail } = e;
  if (detail.namespace && detail.name) {
    const key = detail.namespace + '.' + detail.name;
    if (isAccountParam(key)) {
      jotaiStore.set(SettingAtomFamily(key), undefined);
      return;
    }
    // localStorage removal is now handled directly in BackendAISettingsStore.delete().
    // Trigger jotai reactivity so React components re-render.
    const prev = jotaiStore.get(settingAtom);
    jotaiStore.set(settingAtom, {
      ...prev,
      ['backendaiwebui.settings.' + key]: null,
    });
  }
});
