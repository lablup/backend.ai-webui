/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  applyUserSettingChanges,
  isAccountUserSetting,
  mirrorAccountUserSettings,
  queueUserSettingWrite,
  readLocalAccountUserSettings,
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
    ]) {
      expect(isAccountUserSetting(name)).toBe(false);
    }
  });
});

describe('localStorage mirror', () => {
  beforeEach(() => localStorage.clear());

  it('reads only account keys with a value, an explicit null included', () => {
    localStorage.setItem(P + 'compact_sidebar', 'true');
    localStorage.setItem(P + 'session_monitor_rows', '5');
    localStorage.setItem(P + 'fetchKeyAutoUpdateDelay.list', 'null');
    localStorage.setItem(P + 'preserve_login', 'true');
    localStorage.setItem(P + 'resource_panel_type', '');
    localStorage.setItem('backendaiwebui.settings.general.language', 'ko');
    expect(readLocalAccountUserSettings(localStorage)).toEqual({
      compact_sidebar: true,
      session_monitor_rows: 5,
      'fetchKeyAutoUpdateDelay.list': null,
    });
  });

  it('writes the account keys the document holds and keeps the rest', () => {
    localStorage.setItem(P + 'has_opened_tour_back_to_user_view', 'true');
    localStorage.setItem(P + 'session_monitor_sort', 'newest');
    localStorage.setItem(P + 'preserve_login', 'true');
    mirrorAccountUserSettings(localStorage, {
      'table_column_overrides.SessionList': { name: { hidden: true } },
      'fetchKeyAutoUpdateDelay.list': null,
      session_monitor_sort: 'name',
      preserve_login: false,
    });
    expect(localStorage.getItem(P + 'session_monitor_sort')).toBe('name');
    expect(
      JSON.parse(
        localStorage.getItem(P + 'table_column_overrides.SessionList')!,
      ),
    ).toEqual({ name: { hidden: true } });
    expect(localStorage.getItem(P + 'fetchKeyAutoUpdateDelay.list')).toBe(
      'null',
    );
    // A seeded key the document lacks stays; a device-local key is untouched.
    expect(localStorage.getItem(P + 'has_opened_tour_back_to_user_view')).toBe(
      'true',
    );
    expect(localStorage.getItem(P + 'preserve_login')).toBe('true');
  });
});

describe('applyUserSettingChanges', () => {
  it('sets, removes and keeps null on top of the current document', () => {
    expect(
      applyUserSettingChanges(
        { compact_sidebar: true, session_monitor_rows: 5 },
        new Map<string, unknown>([
          ['compact_sidebar', undefined],
          ['session_monitor_sort', 'name'],
          ['fetchKeyAutoUpdateDelay.list', null],
        ]),
      ),
    ).toEqual({
      session_monitor_rows: 5,
      session_monitor_sort: 'name',
      'fetchKeyAutoUpdateDelay.list': null,
    });
  });

  it('starts from an empty document when there is none', () => {
    expect(
      applyUserSettingChanges(undefined, new Map([['compact_sidebar', true]])),
    ).toEqual({ compact_sidebar: true });
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
});
