import { atomFamily, useRecoilState } from 'recoil';

interface UserSettings {
  use_2409_session_launcher?: boolean;
  desktop_notification?: boolean;
  compact_sidebar?: boolean;
  preserve_login?: boolean;
  language?: string;
  current_language?: string;
  automatic_update_check?: boolean;
  custom_ssh_port?: string;
  beta_feature?: boolean;
  last_window_close_time?: number;
  endpoints?: string[];
}

interface GeneralSettings {
  last_login?: number;
  login_attempt?: number;
}

export const useBAISettingUserState = <K extends keyof UserSettings>(
  name: K,
): [UserSettings[K], (newValue: UserSettings[K]) => void] => {
  // @ts-ignore
  return useRecoilState(SettingStateFamily('user.' + name));
};
export const useBAISettingGeneralState = <K extends keyof GeneralSettings>(
  name: K,
): [GeneralSettings[K], (newValue: GeneralSettings[K]) => void] => {
  // @ts-ignore
  return useRecoilState(SettingStateFamily('general.' + name));
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

const SettingStateFamily = atomFamily({
  key: 'useBAISetting/UserSettingStateFamily',
  // default: null,
  effects: (param: string) => [
    ({ onSet, setSelf }) => {
      setSelf(
        rawToSetting(localStorage.getItem('backendaiwebui.settings.' + param)),
      );
      onSet((newValue, oldValue, isReset) => {
        isReset
          ? localStorage.removeItem('backendaiwebui.settings.' + param)
          : localStorage.setItem(
              'backendaiwebui.settings.' + param,
              settingToRaw(newValue),
            );
      });
    },
  ],
});
