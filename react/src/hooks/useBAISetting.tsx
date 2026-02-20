/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { BAIBoardItem } from '../components/BAIBoard';
import { jotaiStore } from '../components/DefaultProviders';
import { backendaiOptions } from '../global-stores';
import { BAITableColumnOverrideRecord } from 'backend.ai-ui';
import { atom, useAtom } from 'jotai';
import { atomFamily } from 'jotai-family';
import { SetStateAction } from 'react';
import { CustomThemeConfig } from 'src/helper/customThemeConfig';

interface UserSettings {
  has_opened_tour_neo_session_validation?: boolean;
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
  session_metrics_board_items?: Array<Omit<BAIBoardItem, 'data'>>;
  dashboard_board_items?: Array<Omit<BAIBoardItem, 'data'>>;
  admin_dashboard_board_items?: Array<Omit<BAIBoardItem, 'data'>>;
  resource_panel_type?:
    | 'MyResource'
    | 'MyResourceWithinResourceGroup'
    | 'TotalResourceWithinResourceGroup';
  [key: `hiddenColumnKeys.${string}`]: Array<string>;
  [key: `table_column_overrides.${string}`]: BAITableColumnOverrideRecord;

  max_concurrent_uploads?: number;
  container_log_auto_refresh_enabled?: boolean;
  container_log_auto_refresh_interval?: number;
  custom_theme_config?: CustomThemeConfig;
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
