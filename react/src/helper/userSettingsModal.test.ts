/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  buildUserSettingsSearch,
  coerceUserSettingsCategory,
  forgetNonSettingsLocation,
  isUserSettingsPath,
  peekNonSettingsLocation,
  rememberNonSettingsLocation,
  USER_SETTINGS_ROUTE,
} from './userSettingsModal';
import { beforeEach, describe, expect, it } from 'vitest';

describe('coerceUserSettingsCategory', () => {
  it('treats an absent param as closed', () => {
    expect(coerceUserSettingsCategory(null)).toBeNull();
    expect(coerceUserSettingsCategory(undefined)).toBeNull();
    expect(coerceUserSettingsCategory('')).toBeNull();
  });

  it('passes every known category through', () => {
    expect(coerceUserSettingsCategory('general')).toBe('general');
    expect(coerceUserSettingsCategory('logs')).toBe('logs');
    expect(coerceUserSettingsCategory('login-sessions')).toBe('login-sessions');
    expect(coerceUserSettingsCategory('login-history')).toBe('login-history');
  });

  it('falls back to general for an unknown value, as the old tab parser did', () => {
    expect(coerceUserSettingsCategory('bogus')).toBe('general');
  });
});

describe('buildUserSettingsSearch', () => {
  it("keeps the page's own query string, including its tab", () => {
    expect(buildUserSettingsSearch('?tab=running&order=name', 'logs')).toBe(
      '?tab=running&order=name&settings=logs',
    );
  });

  it('builds a search from nothing', () => {
    expect(buildUserSettingsSearch('', 'general')).toBe('?settings=general');
  });

  it('overwrites an existing category', () => {
    expect(buildUserSettingsSearch('?settings=logs', 'login-history')).toBe(
      '?settings=login-history',
    );
  });

  it("carries the caller's extra params but not its tab or category", () => {
    const carried = new URLSearchParams(
      '?tab=general&settings=general&setting=userSettings.AutoLogout',
    );
    expect(buildUserSettingsSearch('?order=name', 'logs', carried)).toBe(
      '?order=name&setting=userSettings.AutoLogout&settings=logs',
    );
  });
});

describe('isUserSettingsPath', () => {
  // React Router matches the route case-insensitively and with a trailing
  // slash, so the guards that read `location.pathname` have to as well.
  it.each([
    '/usersettings',
    '/usersettings/',
    '/UserSettings',
    '/USERSETTINGS//',
  ])('recognises %s', (pathname) => {
    expect(isUserSettingsPath(pathname)).toBe(true);
  });

  it.each(['/usersettings2', '/admin/usersettings', '/session', '/'])(
    'rejects %s',
    (pathname) => {
      expect(isUserSettingsPath(pathname)).toBe(false);
    },
  );
});

describe('background location tracking', () => {
  beforeEach(() => {
    forgetNonSettingsLocation();
  });

  it('starts empty so a cold load can be detected', () => {
    expect(peekNonSettingsLocation()).toBeNull();
  });

  it('remembers a normal page', () => {
    rememberNonSettingsLocation({
      pathname: '/session',
      search: '?tab=running',
      hash: '#top',
      state: { drawerFrgmt: 'cached' },
    });
    expect(peekNonSettingsLocation()).toEqual({
      pathname: '/session',
      search: '?tab=running',
      hash: '#top',
      // Kept so reopening over the page does not drop its prefetched data.
      state: { drawerFrgmt: 'cached' },
    });
  });

  it.each([USER_SETTINGS_ROUTE, '/UserSettings', '/usersettings/'])(
    'ignores the settings route itself (%s)',
    (pathname) => {
      forgetNonSettingsLocation();
      rememberNonSettingsLocation({
        pathname: '/session',
        search: '',
        hash: '',
        state: null,
      });
      rememberNonSettingsLocation({
        pathname,
        search: '?tab=logs',
        hash: '',
        state: null,
      });
      expect(peekNonSettingsLocation()).toEqual({
        pathname: '/session',
        search: '',
        hash: '',
        state: null,
      });
    },
  );
});
