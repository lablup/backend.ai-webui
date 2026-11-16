/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { Location } from 'react-router-dom';

/**
 * User settings live in a modal that opens over whatever page the user is on,
 * driven by this query param. `/usersettings` survives only as a redirect shim
 * for the legacy `?tab=` deep links (`UserSettingsRouteRedirect`).
 */
export const USER_SETTINGS_PARAM = 'settings';
export const USER_SETTINGS_ROUTE = '/usersettings';

export const USER_SETTINGS_CATEGORIES = [
  'general',
  'logs',
  'login-sessions',
  'login-history',
] as const;

export type UserSettingsCategory = (typeof USER_SETTINGS_CATEGORIES)[number];

/** Absent means closed; present-but-unknown falls back to the first category. */
export const coerceUserSettingsCategory = (
  raw: string | null | undefined,
): UserSettingsCategory | null =>
  raw == null || raw === ''
    ? null
    : (USER_SETTINGS_CATEGORIES as ReadonlyArray<string>).includes(raw)
      ? (raw as UserSettingsCategory)
      : 'general';

/**
 * Search string for the modal open at `category` over `pageSearch`, carrying
 * over anything else the caller sent (the search palette adds `?setting=` to
 * scroll to one row). The legacy `tab` key is dropped from `carried` only —
 * the page underneath keeps its own `?tab=`, and the help button reads the
 * category rather than `tab` while the modal is open.
 */
export const buildUserSettingsSearch = (
  pageSearch: string,
  category: UserSettingsCategory,
  carried?: URLSearchParams,
): string => {
  const params = new URLSearchParams(pageSearch);
  carried?.forEach((value, key) => {
    if (key !== 'tab' && key !== USER_SETTINGS_PARAM) params.set(key, value);
  });
  params.set(USER_SETTINGS_PARAM, category);
  return `?${params.toString()}`;
};

/**
 * React Router matches paths case-insensitively and tolerates a trailing slash,
 * while `location.pathname` keeps whatever the URL spelled. Comparing raw would
 * let `/UserSettings` slip past both guards below and trap the modal in a
 * close -> shim -> reopen loop.
 */
export const isUserSettingsPath = (pathname: string): boolean =>
  pathname.replace(/\/+$/, '').toLowerCase() === USER_SETTINGS_ROUTE;

/**
 * Last location that was not the settings route, so the redirect shim can put
 * the modal back over the page the user was actually looking at. A cache, not
 * state: `null` simply means "cold load".
 *
 * `hash` and `state` ride along because dropping them silently degrades the
 * page underneath — the session list carries its already-fetched detail
 * fragment in `state` (`ComputeSessionListPage`), so losing it puts the drawer
 * back on its fetch fallback.
 */
export type NonSettingsLocation = Pick<
  Location,
  'pathname' | 'search' | 'hash' | 'state'
>;

let lastNonSettingsLocation: NonSettingsLocation | null = null;

export const rememberNonSettingsLocation = (location: NonSettingsLocation) => {
  if (isUserSettingsPath(location.pathname)) return;
  lastNonSettingsLocation = {
    pathname: location.pathname,
    search: location.search,
    hash: location.hash,
    state: location.state,
  };
};

export const peekNonSettingsLocation = () => lastNonSettingsLocation;

export const forgetNonSettingsLocation = () => {
  lastNonSettingsLocation = null;
};
