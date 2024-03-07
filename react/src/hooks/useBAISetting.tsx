import _ from 'lodash';
import { useCallback } from 'react';
import {
  AtomEffect,
  atom,
  selectorFamily,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from 'recoil';

export const localStorageEffect =
  (
    key: string,
    onInitialize: (savedValue: any) => any = (v) => v,
  ): AtomEffect<any> =>
  ({ setSelf, onSet }) => {
    const savedValue = localStorage.getItem(key);
    setSelf(onInitialize(savedValue != null ? JSON.parse(savedValue) : null));
    onSet((newValue, _, isReset) => {
      isReset
        ? localStorage.removeItem(key)
        : localStorage.setItem(key, JSON.stringify(newValue));
    });
  };

/**
 * Custom hook for setting BAISettings for a specific namespace.
 * @param namespace - The namespace for which the settings are being set.
 * @returns An object containing the `setItem` and `deleteItem` functions for specific item of the namespace.
 */
const _useSetBAISettingsForSpecificNameSpace = (namespace: 'user') => {
  const setUserSettings = useSetRecoilState(_userSettingsState);

  const setItem = useCallback(
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
  return { setItem, deleteItem };
};

// ██╗   ██╗███████╗███████╗██████╗
// ██║   ██║██╔════╝██╔════╝██╔══██╗
// ██║   ██║███████╗█████╗  ██████╔╝
// ██║   ██║╚════██║██╔══╝  ██╔══██╗
// ╚██████╔╝███████║███████╗██║  ██║
//  ╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═╝

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

const DEFAULT_USER_SETTINGS: UserSettings = {
  use_2409_session_launcher: false,
};
const _userSettingsState = atom<UserSettings>({
  key: 'webui/userSettingsState',
  effects: [
    localStorageEffect('backendaiwebui.settings.user', (savedValue) => {
      // TODO: migrate to new settings
      return {
        ...DEFAULT_USER_SETTINGS,
        ...(_.isObject(savedValue) ? savedValue : {}),
      };
    }),
  ],
});

const _userSettingState = selectorFamily({
  key: 'webui/userSetting',
  get:
    (name: keyof UserSettings) =>
    ({ get }) => {
      return get(_userSettingsState)[name];
    },
});

export const useBAIUserSettingState = (name: keyof UserSettings) => {
  const { set } = useSetBAIUserSetting(name);
  return [useBAIUserSettingValue(name), set] as const;
};

/**
 * Custom hook for setting a specific user setting in the web UI.
 * @param name - The name of the user setting.
 * @returns An object containing the `set` and `deleteItem` functions.
 */
export const useSetBAIUserSetting = (name: keyof UserSettings) => {
  const { setItem, deleteItem } =
    _useSetBAISettingsForSpecificNameSpace('user');

  return {
    set: useCallback((value: any) => setItem(name, value), [setItem, name]),
    deleteItem: useCallback(() => deleteItem(name), [deleteItem, name]),
  };
};

/**
 * Retrieves the value of a specific user setting from Recoil state.
 *
 * @param name - The name of the user setting.
 * @returns The value of the user setting.
 */
export const useBAIUserSettingValue = (name: keyof UserSettings) => {
  return useRecoilValue(_userSettingState(name));
};

/**
 * Custom hook that returns the user settings state and a function to set the web UI setting for the user.
 * @returns An array containing the user settings state and the function to set the web UI setting for the user.
 */
export const useBAIUserNameSpaceSettingsState = () => {
  return useRecoilState(_userSettingsState);
};
