/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { useMyAppConfigFragments } from '../hooks/useAppConfig';
import {
  getAccountUserSettings,
  setAccountUserSettings,
} from '../hooks/useBAISetting';
import { getActAsTarget } from './actAs';
import {
  applyUserSettingChanges,
  flushUserSettingsSync,
  readLocalAccountUserSettings,
  removeLocalAccountUserSettings,
  startUserSettingsSync,
  stopUserSettingsSync,
  USER_SETTINGS_CONFIG_KEY,
} from './userSettingsAppConfig';
import * as _ from 'lodash-es';

type UpsertMyAppConfigFragments = ReturnType<
  typeof useMyAppConfigFragments
>['upsertMyAppConfigFragments'];

/**
 * Seeds the account settings from `userConfig.settings`, copies this browser's
 * pre-ADR 0032 localStorage values up once when the account has none, and
 * sends account setting changes to the server until the returned stop runs.
 */
export const startAccountUserSettingsSync = ({
  serverSettings,
  upsertMyAppConfigFragments,
  onError,
}: {
  serverSettings: unknown;
  upsertMyAppConfigFragments: UpsertMyAppConfigFragments;
  onError: (message: string, error: unknown) => void;
}): (() => void) => {
  const hasServerSettings = _.isPlainObject(serverSettings);
  const local = hasServerSettings
    ? {}
    : readLocalAccountUserSettings(localStorage);
  setAccountUserSettings(
    hasServerSettings ? (serverSettings as Record<string, unknown>) : local,
  );
  // An act-as tab shows the target's settings and saves nothing to that account.
  if (getActAsTarget()) return () => {};

  const writeSettings = (update: (current: unknown) => unknown) =>
    upsertMyAppConfigFragments({
      configName: 'userConfig',
      subKey: USER_SETTINGS_CONFIG_KEY,
      value: update,
    });
  // A document still without `settings` (the copy failed) is rebuilt from
  // memory, so a batch does not drop the other settings.
  const baseOf = (current: unknown) =>
    _.isPlainObject(current) ? current : getAccountUserSettings();

  startUserSettingsSync(
    async (batch) => {
      await writeSettings((current) =>
        applyUserSettingChanges(baseOf(current), batch),
      );
    },
    (error) => onError('Failed to save user settings', error),
  );
  if (!_.isEmpty(local)) {
    // The local copies stay until the write succeeds, so a failure retries at the next sign-in.
    writeSettings(baseOf)
      .then(() => removeLocalAccountUserSettings(localStorage))
      .catch((error) =>
        onError('Failed to copy user settings to userConfig', error),
      );
  }

  const flushWhenHidden = () => {
    if (document.visibilityState === 'hidden') flushUserSettingsSync();
  };
  document.addEventListener('visibilitychange', flushWhenHidden);
  window.addEventListener('pagehide', flushUserSettingsSync);
  return () => {
    document.removeEventListener('visibilitychange', flushWhenHidden);
    window.removeEventListener('pagehide', flushUserSettingsSync);
    stopUserSettingsSync();
  };
};
