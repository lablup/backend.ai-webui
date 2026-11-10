/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  applyUserSettingChanges,
  flushUserSettingsSync,
  mirrorAccountUserSettings,
  readLocalAccountUserSettings,
  startUserSettingsSync,
  stopUserSettingsSync,
  USER_SETTINGS_CONFIG_KEY,
} from '../helper/userSettingsAppConfig';
import { useMyAppConfig, useUpdateMyUserAppConfig } from './useAppConfig';
import { refreshSettingAtoms } from './useBAISetting';
import { useBAILogger } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { useEffect, useEffectEvent } from 'react';

/**
 * After sign-in: mirrors `userConfig.settings` into localStorage (or copies
 * this browser's values up once when the account holds none), then sends
 * account setting changes to the server until unmount (ADR 0032). Suspends.
 */
export const useUserSettingsAppConfigSync = () => {
  'use memo';
  const serverSettings = useMyAppConfig<unknown>(USER_SETTINGS_CONFIG_KEY);
  const updateMyUserAppConfig = useUpdateMyUserAppConfig();
  const { logger } = useBAILogger();

  const start = useEffectEvent(() => {
    let copied: Promise<unknown> = Promise.resolve();
    if (_.isPlainObject(serverSettings)) {
      mirrorAccountUserSettings(
        localStorage,
        serverSettings as Record<string, unknown>,
      );
      refreshSettingAtoms();
    } else {
      const local = readLocalAccountUserSettings(localStorage);
      // Another tab may have copied first; its document wins.
      copied = updateMyUserAppConfig(
        USER_SETTINGS_CONFIG_KEY,
        (current: unknown) => (_.isPlainObject(current) ? current : local),
      ).catch((error) =>
        logger.error('Failed to copy user settings to userConfig', error),
      );
    }
    startUserSettingsSync(
      async (batch) => {
        await copied;
        await updateMyUserAppConfig(
          USER_SETTINGS_CONFIG_KEY,
          (current: unknown) => applyUserSettingChanges(current, batch),
        );
      },
      (error) => logger.error('Failed to save user settings', error),
    );
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
