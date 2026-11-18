/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  isAccountUserSetting,
  queueUserSettingWrite,
  rawToSetting,
  readLocalAccountUserSettings,
  removeLocalAccountUserSettings,
  startUserSettingsSync,
  stopUserSettingsSync,
  USER_SETTING_STORAGE_PREFIX,
  USER_SETTINGS_WRITE_DELAY_MS,
} from './userSettingsAppConfig';

const P = USER_SETTING_STORAGE_PREFIX;

describe('isAccountUserSetting', () => {
  it('follows the account for preferences and prefixed per-table keys', () => {
    expect(isAccountUserSetting('compact_sidebar')).toBe(true);
    expect(isAccountUserSetting('table_column_overrides.SessionList')).toBe(
      true,
    );
    expect(isAccountUserSetting('hiddenColumnKeys.AgentList')).toBe(true);
  });

  it('keeps device-bound keys local', () => {
    for (const name of [
      'preserve_login',
      'endpoints',
      'last_window_close_time',
      'selected_language',
      'desktop_notification',
      'extra_ai_agents',
      'agent_endpoints',
      'projectGroup.abc',
      'custom_theme_config',
      // e2e and walkthrough runs seed the tour flags before sign-in.
      'has_opened_tour_back_to_user_view',
      'has_opened_tour_neo_session_validation',
      // Stored at the top level of userConfig by useRecentSessionHistory.
      'recentSessionHistory',
      'pinnedSessionHistory',
    ]) {
      expect(isAccountUserSetting(name)).toBe(false);
    }
  });
});

describe('pre-ADR 0032 localStorage copies', () => {
  beforeEach(() => localStorage.clear());

  it('reads only account keys with a value, an explicit null included', () => {
    localStorage.setItem(P + 'compact_sidebar', 'true');
    localStorage.setItem(P + 'session_monitor_rows', '5');
    localStorage.setItem(P + 'fetchKeyAutoUpdateDelay.list', 'null');
    localStorage.setItem(P + 'preserve_login', 'true');
    localStorage.setItem(P + 'resource_panel_type', '');
    localStorage.setItem(P + 'session_monitor_condition', 'undefined');
    localStorage.setItem('backendaiwebui.settings.general.language', 'ko');
    expect(readLocalAccountUserSettings(localStorage)).toEqual({
      compact_sidebar: true,
      session_monitor_rows: 5,
      'fetchKeyAutoUpdateDelay.list': null,
      resource_panel_type: null,
    });
  });

  it('copies a stored empty string as null, a choice like "no condition"', () => {
    localStorage.setItem(P + 'session_monitor_condition', '');
    localStorage.setItem(P + 'resource_panel_type', '""');
    expect(readLocalAccountUserSettings(localStorage)).toEqual({
      session_monitor_condition: null,
      resource_panel_type: null,
    });
  });

  it('removes the account keys and keeps device-local ones', () => {
    localStorage.setItem(P + 'compact_sidebar', 'true');
    localStorage.setItem(P + 'hiddenColumnKeys.AgentList', '["status"]');
    localStorage.setItem(P + 'has_opened_tour_back_to_user_view', 'true');
    localStorage.setItem(P + 'preserve_login', 'true');
    removeLocalAccountUserSettings(localStorage);
    expect(localStorage.getItem(P + 'compact_sidebar')).toBeNull();
    expect(localStorage.getItem(P + 'hiddenColumnKeys.AgentList')).toBeNull();
    expect(localStorage.getItem(P + 'has_opened_tour_back_to_user_view')).toBe(
      'true',
    );
    expect(localStorage.getItem(P + 'preserve_login')).toBe('true');
  });
});

describe('queueUserSettingWrite', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(async () => {
    await stopUserSettingsSync();
    vi.useRealTimers();
  });

  it('writes nothing before the sync starts', async () => {
    const write = vi.fn().mockResolvedValue(undefined);
    queueUserSettingWrite('compact_sidebar', true);
    startUserSettingsSync(write, vi.fn());
    await vi.advanceTimersByTimeAsync(USER_SETTINGS_WRITE_DELAY_MS);
    expect(write).not.toHaveBeenCalled();
  });

  it('coalesces account keys into one batch and skips device-local keys', async () => {
    const write = vi.fn().mockResolvedValue(undefined);
    startUserSettingsSync(write, vi.fn());
    queueUserSettingWrite('compact_sidebar', true);
    queueUserSettingWrite('compact_sidebar', false);
    queueUserSettingWrite('session_monitor_condition', undefined);
    queueUserSettingWrite('fetchKeyAutoUpdateDelay.list', null);
    queueUserSettingWrite('preserve_login', true);
    await vi.advanceTimersByTimeAsync(USER_SETTINGS_WRITE_DELAY_MS);
    expect(write).toHaveBeenCalledTimes(1);
    expect(Object.fromEntries(write.mock.calls[0][0])).toEqual({
      compact_sidebar: false,
      session_monitor_condition: undefined,
      'fetchKeyAutoUpdateDelay.list': null,
    });
  });

  it('reports a failed write', async () => {
    const error = new Error('refused');
    const onError = vi.fn();
    startUserSettingsSync(vi.fn().mockRejectedValue(error), onError);
    queueUserSettingWrite('compact_sidebar', true);
    await vi.advanceTimersByTimeAsync(USER_SETTINGS_WRITE_DELAY_MS);
    expect(onError).toHaveBeenCalledWith(error);
  });

  it('reports a failed batch once, however many changes it carried', async () => {
    const error = new Error('refused once');
    const onError = vi.fn();
    startUserSettingsSync(vi.fn().mockRejectedValue(error), onError);
    queueUserSettingWrite('compact_sidebar', true);
    queueUserSettingWrite('session_monitor_rows', 5);
    queueUserSettingWrite('hiddenColumnKeys.AgentList', ['status']);
    await vi.advanceTimersByTimeAsync(USER_SETTINGS_WRITE_DELAY_MS);
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('reports each failed batch, even with the same rejection value', async () => {
    const onError = vi.fn();
    startUserSettingsSync(vi.fn().mockRejectedValue('forbidden'), onError);
    queueUserSettingWrite('compact_sidebar', true);
    await vi.advanceTimersByTimeAsync(USER_SETTINGS_WRITE_DELAY_MS);
    queueUserSettingWrite('compact_sidebar', false);
    await vi.advanceTimersByTimeAsync(USER_SETTINGS_WRITE_DELAY_MS);
    expect(onError).toHaveBeenCalledTimes(2);
  });
});

describe('rawToSetting', () => {
  it('treats the legacy string "undefined" as unset', () => {
    expect(rawToSetting('undefined')).toBeNull();
    expect(rawToSetting('null')).toBeNull();
    expect(rawToSetting('true')).toBe(true);
  });
});
