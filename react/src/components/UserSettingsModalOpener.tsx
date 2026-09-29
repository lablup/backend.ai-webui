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

// Category switches and closing replace history so Back closes the modal in one
// press; `useUserSettingsModal` opts into push for the opening transition.
const settingsParam = parseAsString.withOptions({ history: 'replace' });

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
  const [rawCategory, setRawCategory] = useQueryState(
    USER_SETTINGS_PARAM,
    settingsParam,
  );
  const category = coerceUserSettingsCategory(rawCategory);

  useEffect(
    function trackBackgroundLocation() {
      rememberNonSettingsLocation(location);
    },
    [location],
  );

  const close = () => {
    // A cold deep link leaves the modal over an empty shell; closing there has
    // to land on a real page.
    if (isUserSettingsPath(location.pathname)) {
      navigate(defaultMenuPath, { replace: true });
      return;
    }
    setRawCategory(null);
  };

  // `BAIDialog` keeps its children mounted while closed, so the gate is here:
  // no Relay loaders and no chunk fetch until the modal is actually open.
  if (category === null) return null;

  return (
    <Suspense fallback={null}>
      <UserSettingsModal
        category={category}
        onCategoryChange={(next) => setRawCategory(next)}
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
