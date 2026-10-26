/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useWebUINavigate } from '.';
import {
  getRouteScopeAndKey,
  rewriteProjectNameInPath,
  useActiveProjectName,
} from './useRouteScope';
import { useWebUIMenuItems } from './useWebUIMenuItems';
import { useSessionStorageState } from 'backend.ai-ui';

// The `RootRedirect` routes in `routes.tsx`.
const ROOT_REDIRECT_PATHS: ReadonlySet<string> = new Set([
  '/',
  '/build/electron-app/app/index.html',
  '/app/index.html',
]);

/**
 * Returns a callback that leaves an admin scope for the last visited general
 * page, which `WebUISiderNavigation` records, rewritten to the active project.
 */
export const useBackToUserView = () => {
  'use memo';
  const webuiNavigate = useWebUINavigate();
  const activeProjectName = useActiveProjectName();
  const { defaultMenuPath } = useWebUIMenuItems();
  const [goBackPath] = useSessionStorageState<string>(
    'backendaiwebui.last_visited_general_path',
    { listenStorageChange: true },
  );

  return () => {
    const storedTarget = goBackPath
      ? rewriteProjectNameInPath(goBackPath, activeProjectName)
      : undefined;
    // An admin path (persisted by an older build) or a root redirect path,
    // which sends a superadmin to the admin pages, would loop back into admin.
    const isUsableTarget =
      !!storedTarget &&
      getRouteScopeAndKey(storedTarget).scope === 'project' &&
      !ROOT_REDIRECT_PATHS.has(storedTarget.replace(/\/+$/, '') || '/');
    webuiNavigate(isUsableTarget ? storedTarget : defaultMenuPath);
  };
};
