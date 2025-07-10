import { BAIBoardItem } from '../components/BAIBoard';
import { jotaiStore } from '../components/DefaultProviders';
import { atom, useAtom } from 'jotai';
import { atomFamily } from 'jotai/utils';

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
  experimental_neo_session_list?: boolean;
  start_board_items?: Array<Omit<BAIBoardItem, 'data'>>;
  start_page_board_items?: Array<Omit<BAIBoardItem, 'data'>>;
  experimental_ai_agents?: boolean;
  experimental_dashboard?: boolean;
  session_metrics_board_items?: Array<Omit<BAIBoardItem, 'data'>>;
  [key: `hiddenColumnKeys.${string}`]: Array<string>;
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
): [UserSettings[K], (newValue: UserSettings[K]) => void] => {
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
  } catch (e) {
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
    (get, set, newValue: any) => {
      // const prev = get(SettingAtomFamily(param));
      const key = 'backendaiwebui.settings.' + param;
      localStorage.setItem(key, settingToRaw(newValue));
      const [namespace, name] = param.split('.', 2);

      // only for the reactivity
      const prev = get(settingAtom);
      set(settingAtom, {
        ...prev,
        [key]: newValue,
      });
      // @ts-ignore
      globalThis.backendaioptions?.set?.(name, newValue, namespace, true);
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
    localStorage.removeItem(
      'backendaiwebui.settings.' + detail.namespace + '.' + detail.name,
    );
    // jotaiStore.set(SettingAtomFamily(detail.namespace + '.' + detail.name), null);
  }
});
