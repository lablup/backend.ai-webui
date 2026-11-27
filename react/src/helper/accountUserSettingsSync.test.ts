/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { jotaiStore } from '../components/DefaultProviders';
import {
  clearMyAppConfigs,
  myAppConfigState,
  setMyAppConfigs,
} from '../hooks/useAppConfig';
import { startAccountUserSettingsSync } from './accountUserSettingsSync';
import {
  queueUserSettingWrite,
  USER_SETTING_STORAGE_PREFIX,
  USER_SETTINGS_WRITE_DELAY_MS,
} from './userSettingsAppConfig';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const actAs = vi.hoisted(() => ({ target: null as unknown }));
vi.mock('./actAs', () => ({ getActAsTarget: () => actAs.target }));

const P = USER_SETTING_STORAGE_PREFIX;

const signIn = (userConfig: Record<string, unknown> | null) =>
  setMyAppConfigs(jotaiStore, [
    { configName: 'userConfig', config: userConfig },
  ]);

const accountSettings = () =>
  jotaiStore.get(myAppConfigState).configs.userConfig?.settings;

const changeSetting = (name: string, value: unknown) =>
  document.dispatchEvent(
    new CustomEvent('backendaiwebui.settings:set', {
      detail: { namespace: 'user', name, value },
    }),
  );

describe('startAccountUserSettingsSync', () => {
  let stop: () => void = () => {};
  const start = (send: () => Promise<void>, onError = vi.fn()) => {
    stop = startAccountUserSettingsSync({ send, onError });
    return onError;
  };

  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    clearMyAppConfigs(jotaiStore);
    actAs.target = null;
  });
  afterEach(() => {
    stop();
    vi.useRealTimers();
  });

  it('reads the account settings from the sign-in document and leaves localStorage alone', () => {
    signIn({ settings: { compact_sidebar: true } });
    const send = vi.fn().mockResolvedValue(undefined);
    start(send);
    expect(accountSettings()).toEqual({ compact_sidebar: true });
    expect(localStorage.length).toBe(0);
    expect(send).not.toHaveBeenCalled();
  });

  it('copies the pre-ADR 0035 local values once, then drops them', async () => {
    localStorage.setItem(P + 'compact_sidebar', 'true');
    localStorage.setItem(P + 'desktop_notification', 'true');
    signIn({ themeFamily: 'default' });
    const send = vi.fn().mockResolvedValue(undefined);
    start(send);
    expect(accountSettings()).toEqual({ compact_sidebar: true });
    expect(send).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(0);
    expect(localStorage.getItem(P + 'compact_sidebar')).toBeNull();
    // A device-local setting stays.
    expect(localStorage.getItem(P + 'desktop_notification')).toBe('true');
  });

  it('keeps the local copies when the copy fails, for the next sign-in', async () => {
    localStorage.setItem(P + 'compact_sidebar', 'true');
    signIn({});
    const onError = start(vi.fn().mockRejectedValue(new Error('refused')));
    await vi.advanceTimersByTimeAsync(0);
    expect(localStorage.getItem(P + 'compact_sidebar')).toBe('true');
    expect(onError).toHaveBeenCalledWith(
      'Failed to copy user settings to userConfig',
      expect.any(Error),
    );
  });

  it("drops this browser's pre-0035 values when the account has settings", () => {
    localStorage.setItem(P + 'compact_sidebar', 'true');
    localStorage.setItem(P + 'desktop_notification', 'true');
    signIn({ settings: { session_monitor_rows: 5 } });
    const send = vi.fn().mockResolvedValue(undefined);
    start(send);
    expect(accountSettings()).toEqual({ session_monitor_rows: 5 });
    expect(localStorage.getItem(P + 'compact_sidebar')).toBeNull();
    expect(localStorage.getItem(P + 'desktop_notification')).toBe('true');
    expect(send).not.toHaveBeenCalled();
  });

  it('shows a change at once and sends it after the debounce', async () => {
    signIn({ settings: {} });
    const send = vi.fn().mockResolvedValue(undefined);
    start(send);
    changeSetting('compact_sidebar', true);
    expect(accountSettings()).toEqual({ compact_sidebar: true });
    expect(send).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(USER_SETTINGS_WRITE_DELAY_MS);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it('reports a failed write', async () => {
    signIn({ settings: {} });
    const onError = start(vi.fn().mockRejectedValue(new Error('refused')));
    changeSetting('compact_sidebar', true);
    await vi.advanceTimersByTimeAsync(USER_SETTINGS_WRITE_DELAY_MS);
    expect(onError).toHaveBeenCalledWith(
      'Failed to save user settings',
      expect.any(Error),
    );
  });

  it("saves to the target's account in an act-as tab without copying this browser's values", async () => {
    actAs.target = { userId: 'u', email: 'x@y', name: 'x' };
    localStorage.setItem(P + 'compact_sidebar', 'true');
    signIn({ settings: { session_monitor_rows: 3 } });
    const send = vi.fn().mockResolvedValue(undefined);
    start(send);
    // The target's settings show; the super admin's local values stay where they are.
    expect(accountSettings()).toEqual({ session_monitor_rows: 3 });
    expect(localStorage.getItem(P + 'compact_sidebar')).toBe('true');
    queueUserSettingWrite('session_monitor_rows', 9);
    await vi.advanceTimersByTimeAsync(USER_SETTINGS_WRITE_DELAY_MS);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it('copies nothing up in an act-as tab when the target has no settings', async () => {
    actAs.target = { userId: 'u', email: 'x@y', name: 'x' };
    localStorage.setItem(P + 'compact_sidebar', 'true');
    signIn({});
    const send = vi.fn().mockResolvedValue(undefined);
    start(send);
    await vi.advanceTimersByTimeAsync(USER_SETTINGS_WRITE_DELAY_MS);
    expect(accountSettings()).toBeUndefined();
    expect(send).not.toHaveBeenCalled();
    expect(localStorage.getItem(P + 'compact_sidebar')).toBe('true');
  });

  it('starts nothing after a failed sign-in read', async () => {
    setMyAppConfigs(jotaiStore, null);
    const send = vi.fn().mockResolvedValue(undefined);
    start(send);
    changeSetting('compact_sidebar', true);
    await vi.advanceTimersByTimeAsync(USER_SETTINGS_WRITE_DELAY_MS);
    expect(jotaiStore.get(myAppConfigState).status).toBe('failed');
    expect(send).not.toHaveBeenCalled();
  });
});
