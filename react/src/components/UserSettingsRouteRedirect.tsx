/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  buildUserSettingsSearch,
  coerceUserSettingsCategory,
  peekNonSettingsLocation,
  USER_SETTINGS_PARAM,
  USER_SETTINGS_ROUTE,
} from '../helper/userSettingsModal';
import WebUINavigate from './WebUINavigate';
import React from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Route element for `/usersettings`. The settings UI is a modal now, so this
 * only resolves the category — from `?settings=`, or the legacy `?tab=` deep
 * link — and hands off to `UserSettingsModalOpener`.
 *
 * When a background page was visited in this session the modal reopens over it,
 * which is what keeps a palette hit or a notification link from throwing the
 * user off the page they were on. On a cold load there is no such page, so it
 * stays here and paints the dialog over the empty shell.
 */
const UserSettingsRouteRedirect: React.FC = () => {
  'use memo';
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const category =
    coerceUserSettingsCategory(params.get(USER_SETTINGS_PARAM)) ??
    coerceUserSettingsCategory(params.get('tab')) ??
    'general';

  const background = peekNonSettingsLocation();
  // Nothing to move the modal onto, and the param is already in its final
  // form — the opener owns it from here, so redirecting again would loop.
  if (!background && params.get(USER_SETTINGS_PARAM) === category) return null;

  // `hash` and `state` travel with the background: the session list keeps its
  // already-fetched detail fragment in `state`, and dropping it puts the drawer
  // back on its fetch fallback.
  // `replace`: a push would make Back bounce through here and reopen the modal.
  return (
    <WebUINavigate
      to={{
        pathname: background?.pathname ?? USER_SETTINGS_ROUTE,
        search: buildUserSettingsSearch(
          background?.search ?? '',
          category,
          params,
        ),
        hash: background?.hash ?? location.hash,
      }}
      state={background?.state}
      replace
    />
  );
};

export default UserSettingsRouteRedirect;
