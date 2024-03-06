import _ from 'lodash';
import { useCallback } from 'react';
import {
  AtomEffect,
  atom,
  selector,
  selectorFamily,
  useRecoilValue,
  useSetRecoilState,
} from 'recoil';

export const localStorageEffect =
  (key: string): AtomEffect<any> =>
  ({ setSelf, onSet }) => {
    const savedValue = localStorage.getItem(key);
    if (savedValue != null) {
      setSelf(JSON.parse(savedValue));
    }
    onSet((newValue, _, isReset) => {
      isReset
        ? localStorage.removeItem(key)
        : localStorage.setItem(key, JSON.stringify(newValue));
    });
  };

interface UserSettings {
  use_2409_session_launcher?: boolean;
  // 'desktop_notification': boolean;
  // 'compact_sidebar': boolean;
  // 'preserve_login': boolean;
  // 'language': string;
  // 'automatic_update_check': boolean;
  // 'custom_ssh_port': string;
  // 'beta_feature': boolean;
}
const _userSettingsState = atom<UserSettings>({
  key: 'webui/userSettingsState',
  default: selector({
    key: 'settingsState/default',
    get: () => {
      const settings = localStorage.getItem('backendaiwebui.settings.user');
      return {
        use_2409_session_launcher: false,
        ...(settings ? JSON.parse(settings) : {}),
      };
    },
  }),
  effects: [localStorageEffect('backendaiwebui.settings.user')],
});

const _userSetting = selectorFamily({
  key: 'webui/userSetting',
  get:
    (name: keyof UserSettings) =>
    ({ get }) => {
      return get(_userSettingsState)[name];
    },
});

const _useSetWebUISetting = (namespace: 'user') => {
  const setUserSettings = useSetRecoilState(_userSettingsState);

  const set = useCallback(
    (name: string, value: any) => {
      if (namespace === 'user') {
        setUserSettings((prev) => {
          return { ...prev, [name]: value };
        });
      } else {
        throw new Error('Not implemented');
      }
    },
    [setUserSettings, namespace],
  );

  const deleteItem = useCallback(
    (name: string) => {
      if (namespace === 'user') {
        setUserSettings((prev) => {
          return _.omit(prev, name);
        });
      } else {
        throw new Error('Not implemented');
      }
    },
    [setUserSettings, namespace],
  );

  return { set, deleteItem };
};

/**
 * Custom hook that returns the user settings state and a function to set the web UI setting for the user.
 * @returns An array containing the user settings state and the function to set the web UI setting for the user.
 */
export const useWebUIAllUserSettingsState = () => {
  return [
    useRecoilValue(_userSettingsState),
    _useSetWebUISetting('user'),
  ] as const;
};

export const useWebUIUserSettingState = (name: keyof UserSettings) => {
  const { set } = useSetWebUIUserSetting(name);
  return [useWebUIUserSettingValue(name), set] as const;
};

/**
 * Custom hook for setting a specific user setting in the web UI.
 * @param name - The name of the user setting.
 * @returns An object containing the `set` and `deleteItem` functions.
 */
export const useSetWebUIUserSetting = (name: keyof UserSettings) => {
  const { set, deleteItem } = _useSetWebUISetting('user');

  return {
    set: useCallback((value: any) => set(name, value), [set, name]),
    deleteItem: useCallback(() => deleteItem(name), [deleteItem, name]),
  };
};

/**
 * Retrieves the value of a specific user setting from Recoil state.
 *
 * @param name - The name of the user setting.
 * @returns The value of the user setting.
 */
export const useWebUIUserSettingValue = (name: keyof UserSettings) => {
  return useRecoilValue(_userSetting(name));
};
