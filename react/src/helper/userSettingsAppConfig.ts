/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  createWriteQueue,
  type WriteBatch,
} from '../components/DashboardPanels/writeQueue';
import * as _ from 'lodash-es';

/**
 * Personal settings that follow the account (ADR 0032): stored flat under
 * `userConfig.settings` and held in memory after sign-in, never in
 * localStorage. Every other user setting stays device-local.
 */
export const USER_SETTINGS_CONFIG_KEY = 'settings';
export const USER_SETTING_STORAGE_PREFIX = 'backendaiwebui.settings.user.';

const ACCOUNT_USER_SETTING_KEYS: ReadonlySet<string> = new Set([
  'session_monitor_sort',
  'session_monitor_rows',
  'session_monitor_condition',
  'session_monitor_chip_items',
  'compact_sidebar',
  'experimental_ai_agents',
  'experimental_import_from_huggingface',
  'experimental_session_resource_grid',
  'experimental_session_monitor',
  'session_metrics_board_items',
  'resource_panel_type',
  'deploymentRevisionCreationMode',
  'schedulingHistoryExpandMode',
  'chat_intro_alert_dismissed',
  'show_accelerator_dedicated_images_first',
  'has_opened_tour_neo_session_validation',
  'has_opened_tour_deployment_preset_validation',
  'has_opened_tour_back_to_user_view',
  'has_opened_tour_back_to_admin_settings',
]);

const ACCOUNT_USER_SETTING_PREFIXES: ReadonlyArray<string> = [
  'hiddenColumnKeys.',
  'table_column_overrides.',
  'fetchKeyAutoUpdateDelay.',
];

/** Whether the user setting `name` is stored in `userConfig.settings`. */
export const isAccountUserSetting = (name: string): boolean =>
  ACCOUNT_USER_SETTING_KEYS.has(name) ||
  ACCOUNT_USER_SETTING_PREFIXES.some((prefix) => name.startsWith(prefix));

const isJson = (str: string) => {
  try {
    JSON.parse(str);
  } catch {
    return false;
  }
  return true;
};

/** A localStorage string as the setting value it stores; `null` when unset. */
export const rawToSetting = (value: string | null): any => {
  // An older setter stored `undefined` as the string "undefined": unset, too.
  if (value === null || value === '' || value === '""' || value === 'undefined')
    return null;
  if (value === 'false') return false;
  if (value === 'true') return true;
  return isJson(value) ? JSON.parse(value) : value;
};

export const settingToRaw = (settingValue: any): string => {
  if (typeof settingValue === 'boolean') {
    return settingValue ? 'true' : 'false';
  }
  if (typeof settingValue === 'object') {
    return JSON.stringify(settingValue);
  }
  return settingValue;
};

const accountStorageKeys = (storage: Storage): Array<string> =>
  _.range(storage.length)
    .map((i) => storage.key(i))
    .filter(
      (key): key is string =>
        !!key &&
        key.startsWith(USER_SETTING_STORAGE_PREFIX) &&
        isAccountUserSetting(key.slice(USER_SETTING_STORAGE_PREFIX.length)),
    );

/** The account settings this browser stored before ADR 0032, for the one-time copy. */
export const readLocalAccountUserSettings = (
  storage: Storage,
): Record<string, unknown> => {
  const settings: Record<string, unknown> = {};
  for (const key of accountStorageKeys(storage)) {
    const raw = storage.getItem(key);
    const value = rawToSetting(raw);
    // A stored `null` or empty string is a choice (auto-refresh off, no
    // condition), unlike an unset key.
    if (value !== null || raw === 'null' || raw === '' || raw === '""') {
      settings[key.slice(USER_SETTING_STORAGE_PREFIX.length)] = value;
    }
  }
  return settings;
};

/** Drops the pre-ADR 0032 localStorage copies once the account holds them. */
export const removeLocalAccountUserSettings = (storage: Storage): void => {
  accountStorageKeys(storage).forEach((key) => storage.removeItem(key));
};

export const USER_SETTINGS_WRITE_DELAY_MS = 500;

type UserSettingsWriter = (batch: WriteBatch<string, unknown>) => Promise<void>;

let writer: UserSettingsWriter | null = null;
let onWriteError: (error: unknown) => void = () => {};

const queue = createWriteQueue<string, unknown>({
  delay: USER_SETTINGS_WRITE_DELAY_MS,
  // Reported here, once per failed batch; the waiters of that batch reject with it too.
  write: async (batch) => {
    try {
      await writer?.(batch);
    } catch (error) {
      onWriteError(error);
      throw error;
    }
  },
});

/** Sends account settings changes to `write` from now on, until `stop`. */
export const startUserSettingsSync = (
  write: UserSettingsWriter,
  onError: (error: unknown) => void,
): void => {
  writer = write;
  onWriteError = onError;
};

/** Writes what is queued, then stops sending changes (sign-out, unmount). */
export const stopUserSettingsSync = async (): Promise<void> => {
  const stopping = writer;
  await queue.flush().catch(() => {});
  // A start that ran during the flush (StrictMode remount) keeps its writer.
  if (writer === stopping) writer = null;
};

export const flushUserSettingsSync = (): Promise<void> =>
  queue.flush().catch(() => {});

/**
 * Queues a changed user setting for `userConfig.settings`. A no-op for a
 * device-local setting and before the signed-in sync has started.
 */
export const queueUserSettingWrite = (name: string, value: unknown): void => {
  if (!writer || !isAccountUserSetting(name)) return;
  // The queue's write already reported a failure.
  queue.schedule(name, value).catch(() => {});
};
