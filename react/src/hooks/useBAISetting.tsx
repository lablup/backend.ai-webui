/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { BAIBoardItem } from '../components/BAIBoard';
import { jotaiStore } from '../components/DefaultProviders';
import { backendaiOptions } from '../global-stores';
import { CustomThemeConfig } from '../helper/customThemeConfig';
import type { AgentEndpointBindings, AgentProfile } from './useAIAgent';
import { BAITableColumnOverrideRecord } from 'backend.ai-ui';
import { atom, useAtom } from 'jotai';
import { atomFamily } from 'jotai-family';
import { SetStateAction } from 'react';

export interface UserSettings {
  has_opened_tour_neo_session_validation?: boolean;
  has_opened_tour_neo_deployment_validation?: boolean;
  has_opened_tour_deployment_preset_validation?: boolean;
  desktop_notification?: boolean;
  compact_sidebar?: boolean;
  preserve_login?: boolean;
  automatic_update_check?: boolean;
  custom_ssh_port?: string;
  beta_feature?: boolean;
  last_window_close_time?: number;
  endpoints?: Array<string>;
  auto_logout?: boolean;
  selected_language?: string;
  recentSessionHistory?: Array<SessionHistory>;
  pinnedSessionHistory?: Array<SessionHistory>;
  start_board_items?: Array<Omit<BAIBoardItem, 'data'>>;
  start_page_board_items?: Array<Omit<BAIBoardItem, 'data'>>;
  experimental_ai_agents?: boolean;
  extra_ai_agents?: Array<AgentProfile>;
  agent_endpoints?: AgentEndpointBindings;
  session_metrics_board_items?: Array<Omit<BAIBoardItem, 'data'>>;
  dashboard_board_items?: Array<Omit<BAIBoardItem, 'data'>>;
  admin_dashboard_board_items?: Array<Omit<BAIBoardItem, 'data'>>;
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
  custom_theme_config?: CustomThemeConfig;
  custom_primary_color?: { light?: string; dark?: string };
  deploymentRevisionCreationMode?: 'preset' | 'custom';
  schedulingHistoryExpandMode?: 'expand-all' | 'collapse-all' | 'errors-only';
  chat_intro_alert_dismissed?: boolean;
}

export type SessionHistory = {
  id: string;
  name?: string;
  params: string;
  createdAt: string;
};

interface GeneralSettings {
  last_login?: number;
  login_attempt?: number;
  language?: string;
}

export const useBAISettingUserState = <K extends keyof UserSettings>(
  name: K,
): [UserSettings[K], (newValue: SetStateAction<UserSettings[K]>) => void] => {
  return useAtom<UserSettings[K]>(SettingAtomFamily('user.' + name));
};

/**
 * Whether a user setting has ever been explicitly written to `localStorage`.
 * Needed because `useBAISettingUserState` collapses "never set" and
 * "explicitly set to `null`" into the same `null` return value — callers that
 * need a fallback-only-when-unset default (e.g. a per-consumer auto-refresh
 * interval where the user can legitimately choose "off") can't tell the two
 * apart from the hook's value alone.
 */
export const hasStoredUserSetting = <K extends keyof UserSettings>(
  name: K,
): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    window.localStorage.getItem('backendaiwebui.settings.user.' + name) !== null
  );
};

export const useBAISettingGeneralState = <K extends keyof GeneralSettings>(
  name: K,
): [GeneralSettings[K], (newValue: GeneralSettings[K]) => void] => {
  return useAtom(SettingAtomFamily('general.' + name));
};

const isJson = (str: any) => {
  try {
    JSON.parse(str);
  } catch {
    return false;
  }
  return true;
};

const rawToSetting = (value: string | null) => {
  if (value !== null && value !== '' && value !== '""') {
    if (value === 'false') {
      return false;
    } else if (value === 'true') {
      return true;
    } else if (isJson(value)) {
      return JSON.parse(value);
    } else {
      return value;
    }
  } else {
    return null;
  }
};

const settingToRaw = (settingValue: any) => {
  if (typeof settingValue === 'boolean') {
    return settingValue ? 'true' : 'false';
  } else if (typeof settingValue === 'object') {
    return JSON.stringify(settingValue);
  } else {
    return settingValue;
  }
};

const settingAtom = atom<{
  [key: string]: any;
}>({});
const SettingAtomFamily = atomFamily((param: string) => {
  return atom(
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

      localStorage.setItem(key, settingToRaw(newValue));
      const [namespace, name] = param.split('.', 2);

      // only for the reactivity
      const prev = get(settingAtom);
      set(settingAtom, {
        ...prev,
        [key]: newValue,
      });
      backendaiOptions?.set?.(name, newValue, namespace, true);
    },
  );
});

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
    // localStorage removal is now handled directly in BackendAISettingsStore.delete().
    // Trigger jotai reactivity so React components re-render.
    const prev = jotaiStore.get(settingAtom);
    jotaiStore.set(settingAtom, {
      ...prev,
      ['backendaiwebui.settings.' + key]: null,
    });
  }
});
