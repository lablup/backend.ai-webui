/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useWebUINavigate } from '.';
import {
  isUserViewPath,
  rewriteProjectNameInPath,
  useActiveProjectName,
} from './useRouteScope';
import { useWebUIMenuItems } from './useWebUIMenuItems';
import { useSessionStorageState } from 'backend.ai-ui';

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
    // A path persisted by an older build may redirect back into admin.
    webuiNavigate(
      storedTarget && isUserViewPath(storedTarget)
        ? storedTarget
        : defaultMenuPath,
    );
  };
};
