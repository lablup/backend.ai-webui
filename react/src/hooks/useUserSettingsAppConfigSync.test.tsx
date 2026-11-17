/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  queueUserSettingWrite,
  USER_SETTING_STORAGE_PREFIX,
  USER_SETTINGS_WRITE_DELAY_MS,
} from '../helper/userSettingsAppConfig';
import {
  getAccountUserSettings,
  setAccountUserSettings,
} from './useBAISetting';
import { useUserSettingsAppConfigSync } from './useUserSettingsAppConfigSync';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const actAs = vi.hoisted(() => ({ target: null as unknown }));
vi.mock('../helper/actAs', () => ({ getActAsTarget: () => actAs.target }));
vi.mock('backend.ai-ui', () => ({
  useBAILogger: () => ({ logger: { error: vi.fn() } }),
}));

const P = USER_SETTING_STORAGE_PREFIX;

// Stands in for upsertMyAppConfigFragments on a held `settings` sub-key.
const createUpsert = (initial: unknown) => {
  const held = { settings: initial };
  const upsert = vi.fn(
    async ({ value }: { value: (current: unknown) => unknown }) => {
      held.settings = value(held.settings);
      return {} as never;
    },
  );
  return { held, upsert };
};

const mount = (serverSettings: unknown, upsert: unknown) =>
  renderHook(() =>
    useUserSettingsAppConfigSync(serverSettings, upsert as never),
  );

describe('useUserSettingsAppConfigSync', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    setAccountUserSettings({});
    actAs.target = null;
  });
  afterEach(() => vi.useRealTimers());

  it('holds the account settings in memory and leaves localStorage alone', () => {
    const { upsert } = createUpsert({ compact_sidebar: true });
    const { unmount } = mount({ compact_sidebar: true }, upsert);
    expect(getAccountUserSettings()).toEqual({ compact_sidebar: true });
    expect(localStorage.length).toBe(0);
    expect(upsert).not.toHaveBeenCalled();
    unmount();
  });

  it('copies the pre-ADR 0032 local values once, then drops them', async () => {
    localStorage.setItem(P + 'compact_sidebar', 'true');
    localStorage.setItem(P + 'has_opened_tour_back_to_user_view', 'true');
    const { held, upsert } = createUpsert(undefined);
    const { unmount } = mount(undefined, upsert);
    expect(getAccountUserSettings()).toEqual({ compact_sidebar: true });
    await act(() => vi.advanceTimersByTimeAsync(0));
    expect(held.settings).toEqual({ compact_sidebar: true });
    expect(localStorage.getItem(P + 'compact_sidebar')).toBeNull();
    // A tour flag is device-local, so it stays.
    expect(localStorage.getItem(P + 'has_opened_tour_back_to_user_view')).toBe(
      'true',
    );
    unmount();
  });

  it('rebuilds a batch on a document without settings from memory', async () => {
    const { held, upsert } = createUpsert(undefined);
    const { unmount } = mount({ session_monitor_rows: 5 }, upsert);
    // A stale read put the document back to one without settings.
    held.settings = undefined;
    document.dispatchEvent(
      new CustomEvent('backendaiwebui.settings:set', {
        detail: { namespace: 'user', name: 'compact_sidebar', value: true },
      }),
    );
    await act(() => vi.advanceTimersByTimeAsync(USER_SETTINGS_WRITE_DELAY_MS));
    expect(held.settings).toEqual({
      session_monitor_rows: 5,
      compact_sidebar: true,
    });
    expect(localStorage.length).toBe(0);
    unmount();
  });

  it('saves nothing to the account in an act-as tab', async () => {
    actAs.target = { userId: 'u', email: 'x@y', name: 'x' };
    localStorage.setItem(P + 'compact_sidebar', 'true');
    const { upsert } = createUpsert(undefined);
    const { unmount } = mount(undefined, upsert);
    queueUserSettingWrite('session_monitor_rows', 9);
    await act(() => vi.advanceTimersByTimeAsync(USER_SETTINGS_WRITE_DELAY_MS));
    expect(upsert).not.toHaveBeenCalled();
    unmount();
  });
});
