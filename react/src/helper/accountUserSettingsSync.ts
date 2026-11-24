/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { jotaiStore } from '../components/DefaultProviders';
import {
  applyMyUserConfig,
  myAppConfigState,
  sendMyUserConfig,
} from '../hooks/useAppConfig';
import { getActAsTarget } from './actAs';
import {
  flushUserSettingsSync,
  readLocalAccountUserSettings,
  removeLocalAccountUserSettings,
  startUserSettingsSync,
  stopUserSettingsSync,
  USER_SETTINGS_CONFIG_KEY,
} from './userSettingsAppConfig';
import * as _ from 'lodash-es';

type JotaiStore = typeof jotaiStore;

let stopRunning: (() => void) | null = null;

/**
 * Runs at sign-in, after `setMyAppConfigs` (ADR 0035): copies this browser's
 * pre-ADR 0035 localStorage values up once when the account has no
 * `settings` (never in an act-as tab), and sends account setting changes
 * until the returned stop runs.
 */
export const startAccountUserSettingsSync = ({
  store = jotaiStore,
  send = () => sendMyUserConfig(store),
  onError,
}: {
  store?: JotaiStore;
  send?: () => Promise<void>;
  onError: (message: string, error: unknown) => void;
}): (() => void) => {
  stopRunning?.();
  const { status, configs } = store.get(myAppConfigState);
  // A failed sign-in read leaves no document to build on: defaults show and nothing is saved.
  if (status !== 'loaded') return () => {};
  // An act-as tab saves to the target's account but never touches this browser's
  // localStorage, which belongs to the super admin.
  const isActingAs = !!getActAsTarget();

  const hasServerSettings = _.isPlainObject(
    configs.userConfig?.[USER_SETTINGS_CONFIG_KEY],
  );
  if (hasServerSettings && !isActingAs) {
    // The account holds them already; on a shared browser they would reach the next account.
    removeLocalAccountUserSettings(localStorage);
  }
  startUserSettingsSync(send, (error) =>
    onError('Failed to save user settings', error),
  );
  const local =
    hasServerSettings || isActingAs
      ? {}
      : readLocalAccountUserSettings(localStorage);
  if (!_.isEmpty(local)) {
    applyMyUserConfig(store, [USER_SETTINGS_CONFIG_KEY], local);
    // The local copies stay until the write succeeds, so a failure retries at the next sign-in.
    send()
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
  const stop = () => {
    document.removeEventListener('visibilitychange', flushWhenHidden);
    window.removeEventListener('pagehide', flushUserSettingsSync);
    stopUserSettingsSync();
    if (stopRunning === stop) stopRunning = null;
  };
  stopRunning = stop;
  return stop;
};

/** Stops the running sync, if any (joining another server). */
export const stopAccountUserSettingsSync = () => stopRunning?.();
