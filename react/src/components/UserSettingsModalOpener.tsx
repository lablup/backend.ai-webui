/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  coerceUserSettingsCategory,
  isUserSettingsPath,
  rememberNonSettingsLocation,
  USER_SETTINGS_PARAM,
  type UserSettingsCategory,
} from '../helper/userSettingsModal';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../hooks';
import { useWebUIMenuItems } from '../hooks/useWebUIMenuItems';
import { parseAsString, useQueryState } from 'nuqs';
import React, { Suspense, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const UserSettingsModal = React.lazy(() => import('./UserSettingsModal'));

/**
 * Mounts the user-settings modal app-wide and drives it from `?settings=`, so
 * it opens over the current page instead of navigating to one.
 */
const UserSettingsModalOpener = () => {
  'use memo';
  // Mounted above the route tree, so without this gate a `?settings=` URL would
  // paint a dialog over the login screen.
  useSuspendedBackendaiClient();

  const location = useLocation();
  const navigate = useWebUINavigate();
  const { defaultMenuPath } = useWebUIMenuItems();
  // Read from the router, not nuqs: nuqs applies a URL change it did not make
  // in a transition, which React holds back while any async action is pending.
  const category = coerceUserSettingsCategory(
    new URLSearchParams(location.search).get(USER_SETTINGS_PARAM),
  );

  useEffect(
    function trackBackgroundLocation() {
      rememberNonSettingsLocation(location);
    },
    [location],
  );

  // Replaces history, so Back closes the modal in one press (the opening in
  // `useUserSettingsModal` pushed); `state` rides along because the page
  // underneath may keep fetched data in it.
  const setCategory = (next: UserSettingsCategory | null) => {
    const searchParams = new URLSearchParams(location.search);
    if (next === null) searchParams.delete(USER_SETTINGS_PARAM);
    else searchParams.set(USER_SETTINGS_PARAM, next);
    navigate(
      { search: searchParams.toString(), hash: location.hash },
      { replace: true, state: location.state },
    );
  };

  const close = () => {
    // A cold deep link leaves the modal over an empty shell; closing there has
    // to land on a real page.
    if (isUserSettingsPath(location.pathname)) {
      navigate(defaultMenuPath, { replace: true });
      return;
    }
    setCategory(null);
  };

  // A closed `BAIModal` keeps its children mounted, so the gate is here:
  // no Relay loaders and no chunk fetch until the modal is actually open.
  if (category === null) return null;

  return (
    <Suspense fallback={null}>
      <UserSettingsModal
        category={category}
        onCategoryChange={setCategory}
        onRequestClose={close}
      />
    </Suspense>
  );
};

export default UserSettingsModalOpener;

/** Entry point for in-app triggers. Pushes, so Back closes the modal. */
export const useUserSettingsModal = () => {
  'use memo';
  const [, setRawCategory] = useQueryState(
    USER_SETTINGS_PARAM,
    parseAsString.withOptions({ history: 'push' }),
  );

  return {
    open: (category: UserSettingsCategory = 'general') =>
      setRawCategory(category),
  };
};
