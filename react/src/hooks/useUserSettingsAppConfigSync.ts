/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { getActAsTarget } from '../helper/actAs';
import {
  applyUserSettingChanges,
  flushUserSettingsSync,
  readLocalAccountUserSettings,
  removeLocalAccountUserSettings,
  startUserSettingsSync,
  stopUserSettingsSync,
  USER_SETTINGS_CONFIG_KEY,
} from '../helper/userSettingsAppConfig';
import type { useMyAppConfigFragments } from './useAppConfig';
import {
  getAccountUserSettings,
  setAccountUserSettings,
} from './useBAISetting';
import { useBAILogger } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { useEffect, useEffectEvent } from 'react';

type UpsertMyAppConfigFragments = ReturnType<
  typeof useMyAppConfigFragments
>['upsertMyAppConfigFragments'];

/**
 * After sign-in: holds `userConfig.settings` in memory, copies this browser's
 * pre-ADR 0032 localStorage values up once when the account has none, then
 * sends account setting changes to the server until unmount (ADR 0032).
 */
export const useUserSettingsAppConfigSync = (
  serverSettings: unknown,
  upsertMyAppConfigFragments: UpsertMyAppConfigFragments,
) => {
  'use memo';
  const { logger } = useBAILogger();

  const writeSettings = (update: (current: unknown) => unknown) =>
    upsertMyAppConfigFragments({
      configName: 'userConfig',
      subKey: USER_SETTINGS_CONFIG_KEY,
      value: update,
    });

  // A document without `settings` (no copy yet, or a stale read that landed
  // after it) is rebuilt from memory, so no batch drops the other settings.
  const baseOf = (current: unknown) =>
    _.isPlainObject(current) ? current : getAccountUserSettings();

  const start = useEffectEvent(() => {
    const hasServerSettings = _.isPlainObject(serverSettings);
    const local = hasServerSettings
      ? {}
      : readLocalAccountUserSettings(localStorage);
    setAccountUserSettings(
      hasServerSettings ? (serverSettings as Record<string, unknown>) : local,
    );
    // An act-as tab shows the target's settings and saves nothing to that account.
    if (getActAsTarget()) return;

    startUserSettingsSync(
      async (batch) => {
        await writeSettings((current) =>
          applyUserSettingChanges(baseOf(current), batch),
        );
      },
      (error) => logger.error('Failed to save user settings', error),
    );
    if (!_.isEmpty(local)) {
      // The local copies stay until the write succeeds, so a failure retries at the next sign-in.
      writeSettings(baseOf)
        .then(() => removeLocalAccountUserSettings(localStorage))
        .catch((error) =>
          logger.error('Failed to copy user settings to userConfig', error),
        );
    }
  });

  useEffect(() => {
    start();
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
  }, []);
};
