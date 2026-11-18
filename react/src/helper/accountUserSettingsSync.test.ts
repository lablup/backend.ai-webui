/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  getAccountUserSettings,
  setAccountUserSettings,
} from '../hooks/useBAISetting';
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

// Stands in for the `set` of useMyAppConfig on a held `settings` sub-key.
const createUpsert = (initial: unknown) => {
  const held = { settings: initial };
  const upsert = vi.fn(async (update: (current: unknown) => unknown) => {
    held.settings = update(held.settings);
  });
  return { held, upsert };
};

const start = (serverSettings: unknown, upsert: unknown) =>
  startAccountUserSettingsSync({
    serverSettings,
    setServerSettings: upsert as never,
    onError: vi.fn(),
  });

describe('startAccountUserSettingsSync', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    setAccountUserSettings({});
    actAs.target = null;
  });
  afterEach(() => vi.useRealTimers());

  it('holds the account settings in memory and leaves localStorage alone', () => {
    const { upsert } = createUpsert({ compact_sidebar: true });
    const stop = start({ compact_sidebar: true }, upsert);
    expect(getAccountUserSettings()).toEqual({ compact_sidebar: true });
    expect(localStorage.length).toBe(0);
    expect(upsert).not.toHaveBeenCalled();
    stop();
  });

  it('copies the pre-ADR 0032 local values once, then drops them', async () => {
    localStorage.setItem(P + 'compact_sidebar', 'true');
    localStorage.setItem(P + 'has_opened_tour_back_to_user_view', 'true');
    const { held, upsert } = createUpsert(undefined);
    const stop = start(undefined, upsert);
    expect(getAccountUserSettings()).toEqual({ compact_sidebar: true });
    await vi.advanceTimersByTimeAsync(0);
    expect(held.settings).toEqual({ compact_sidebar: true });
    expect(localStorage.getItem(P + 'compact_sidebar')).toBeNull();
    // A tour flag is device-local, so it stays.
    expect(localStorage.getItem(P + 'has_opened_tour_back_to_user_view')).toBe(
      'true',
    );
    stop();
  });

  it('rebuilds a batch on a document without settings from memory', async () => {
    const { held, upsert } = createUpsert(undefined);
    const stop = start({ session_monitor_rows: 5 }, upsert);
    // A stale read put the document back to one without settings.
    held.settings = undefined;
    document.dispatchEvent(
      new CustomEvent('backendaiwebui.settings:set', {
        detail: { namespace: 'user', name: 'compact_sidebar', value: true },
      }),
    );
    await vi.advanceTimersByTimeAsync(USER_SETTINGS_WRITE_DELAY_MS);
    expect(held.settings).toEqual({
      session_monitor_rows: 5,
      compact_sidebar: true,
    });
    expect(localStorage.length).toBe(0);
    stop();
  });

  it("drops this browser's pre-0032 values when the account has settings", () => {
    localStorage.setItem(P + 'compact_sidebar', 'true');
    localStorage.setItem(P + 'has_opened_tour_back_to_user_view', 'true');
    const { upsert } = createUpsert({ session_monitor_rows: 5 });
    const stop = start({ session_monitor_rows: 5 }, upsert);
    expect(getAccountUserSettings()).toEqual({ session_monitor_rows: 5 });
    expect(localStorage.getItem(P + 'compact_sidebar')).toBeNull();
    expect(localStorage.getItem(P + 'has_opened_tour_back_to_user_view')).toBe(
      'true',
    );
    expect(upsert).not.toHaveBeenCalled();
    stop();
  });

  it('carries a failed batch in the next write', async () => {
    const { held, upsert } = createUpsert({});
    upsert.mockRejectedValueOnce(new Error('refused'));
    const stop = start({}, upsert);
    document.dispatchEvent(
      new CustomEvent('backendaiwebui.settings:set', {
        detail: { namespace: 'user', name: 'compact_sidebar', value: true },
      }),
    );
    await vi.advanceTimersByTimeAsync(USER_SETTINGS_WRITE_DELAY_MS);
    expect(held.settings).toEqual({});
    document.dispatchEvent(
      new CustomEvent('backendaiwebui.settings:set', {
        detail: { namespace: 'user', name: 'session_monitor_rows', value: 7 },
      }),
    );
    await vi.advanceTimersByTimeAsync(USER_SETTINGS_WRITE_DELAY_MS);
    expect(held.settings).toEqual({
      compact_sidebar: true,
      session_monitor_rows: 7,
    });
    stop();
  });

  it('saves nothing to the account in an act-as tab', async () => {
    actAs.target = { userId: 'u', email: 'x@y', name: 'x' };
    localStorage.setItem(P + 'compact_sidebar', 'true');
    const { upsert } = createUpsert(undefined);
    const stop = start(undefined, upsert);
    // This browser's own local values are not shown as the target's.
    expect(getAccountUserSettings()).toEqual({});
    queueUserSettingWrite('session_monitor_rows', 9);
    await vi.advanceTimersByTimeAsync(USER_SETTINGS_WRITE_DELAY_MS);
    expect(upsert).not.toHaveBeenCalled();
    stop();
  });
});
