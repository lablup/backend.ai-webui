/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  buildUserSettingsSearch,
  coerceUserSettingsCategory,
  forgetNonSettingsLocation,
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
    });
    expect(peekNonSettingsLocation()).toEqual({
      pathname: '/session',
      search: '?tab=running',
    });
  });

  it('ignores the settings route itself', () => {
    rememberNonSettingsLocation({ pathname: '/session', search: '' });
    rememberNonSettingsLocation({
      pathname: USER_SETTINGS_ROUTE,
      search: '?tab=logs',
    });
    expect(peekNonSettingsLocation()).toEqual({
      pathname: '/session',
      search: '',
    });
  });
});
