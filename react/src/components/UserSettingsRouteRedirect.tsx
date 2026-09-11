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
 * only converts the legacy `?tab=` deep link into the `?settings=` param and
 * hands off to `UserSettingsModalOpener`.
 *
 * When a background page was visited in this session the modal reopens over it;
 * on a cold load it stays on `/usersettings` rather than pulling in the default
 * page, so an external deep link paints the dialog immediately.
 */
const UserSettingsRouteRedirect: React.FC = () => {
  'use memo';
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  // Already converted — the opener owns it from here, so redirecting again
  // would loop.
  if (params.get(USER_SETTINGS_PARAM)) return null;

  const category = coerceUserSettingsCategory(params.get('tab')) ?? 'general';
  // `hash` and `state` travel with the background: the session list keeps its
  // already-fetched detail fragment in `state`, and dropping it puts the drawer
  // back on its fetch fallback.
  const background = peekNonSettingsLocation();
  const target = background
    ? {
        pathname: background.pathname,
        search: buildUserSettingsSearch(background.search, category),
        hash: background.hash,
      }
    : {
        pathname: USER_SETTINGS_ROUTE,
        search: buildUserSettingsSearch('', category),
        hash: location.hash,
      };

  // `replace`: a push would make Back bounce through here and reopen the modal.
  return <WebUINavigate to={target} state={background?.state} replace />;
};

export default UserSettingsRouteRedirect;
