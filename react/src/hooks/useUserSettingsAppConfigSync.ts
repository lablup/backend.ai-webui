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
import type { useMyAppConfigFragments } from './useAppConfig';
import { refreshSettingAtoms } from './useBAISetting';
import { useBAILogger } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { useEffect, useEffectEvent } from 'react';

type UpsertMyAppConfigFragments = ReturnType<
  typeof useMyAppConfigFragments
>['upsertMyAppConfigFragments'];

/**
 * After sign-in: mirrors `userConfig.settings` into localStorage (or copies
 * this browser's values up once when the account holds none), then sends
 * account setting changes to the server until unmount (ADR 0032). The caller
 * passes the `userConfig` read it already holds, so the document is read once.
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

  const start = useEffectEvent(() => {
    if (_.isPlainObject(serverSettings)) {
      mirrorAccountUserSettings(
        localStorage,
        serverSettings as Record<string, unknown>,
      );
      refreshSettingAtoms();
    } else {
      const local = readLocalAccountUserSettings(localStorage);
      // `current` is this tab's store copy, so this keeps settings only another
      // write of this tab added first; it is no guard against another device.
      writeSettings((current) =>
        _.isPlainObject(current) ? current : local,
      ).catch((error) =>
        logger.error('Failed to copy user settings to userConfig', error),
      );
    }
    // The copy is queued first on the same per-user write queue, so it runs before any batch.
    startUserSettingsSync(
      async (batch) => {
        await writeSettings((current) =>
          applyUserSettingChanges(current, batch),
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
