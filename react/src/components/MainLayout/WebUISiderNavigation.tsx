/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AstryxAdminTheme } from '../../astryx-theme';
import { useWebUINavigate } from '../../hooks';
import { useRouteAccessDecision } from '../../hooks/useRouteAccess';
import {
  getRouteScopeAndKey,
  rewriteProjectNameInPath,
  useActiveProjectName,
  useCurrentMenuKey,
} from '../../hooks/useRouteScope';
import {
  getPathFromMenuKey,
  useWebUIMenuItems,
} from '../../hooks/useWebUIMenuItems';
import { theme } from '../../theme-shim';
import BAIMenu from '../BAIMenu';
import { IconButton } from '@astryxdesign/core/IconButton';
import { HStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { filterOutEmpty, useSessionStorageState } from 'backend.ai-ui';
import { ArrowLeftIcon, ShieldUserIcon } from 'lucide-react';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

interface WebUISiderNavigationProps {
  /** Rail-collapsed rendering (group names hidden, admin heading dropped). */
  collapsed?: boolean;
}

/**
 * The general/admin menu block shared by the sider rail and the mobile nav
 * drawer (FR-3612). Exactly one instance is mounted at a time — the rail above
 * the mobile breakpoint, the drawer below it — so the `goBackPath` recording
 * effect stays single-owner.
 */
const WebUISiderNavigation: React.FC<WebUISiderNavigationProps> = ({
  collapsed,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const webuiNavigate = useWebUINavigate();
  const location = useLocation();
  // Scope-aware current menu key (route handle), correct under the
  // `/project/:name/<feature>` and `/admin/<feature>` URL shapes where the
  // first pathname segment is the scope prefix, not the feature key.
  const currentMenuKey = useCurrentMenuKey();
  // Active project NAME (URL `:projectName` if present, else current project
  // atom). Used to build the scope-aware admin-settings link and to rewrite the
  // stored `goBackPath` to the current project on read.
  const activeProjectName = useActiveProjectName();

  const {
    groupedGeneralMenu,
    groupedAdminMenu,
    isSelectedAdminCategoryMenu,
    isCurrentPathAdminCategory,
    firstAvailableAdminMenuItem,
    defaultMenuPath,
  } = useWebUIMenuItems({
    hideGroupName: collapsed,
  });
  // Route-handle-declared access decision (FR-3383): when the current admin
  // page is unauthorized for this user, the sider falls back to the general
  // menu (the admin sider would be empty/misleading).
  const isCurrentPageUnauthorized = useRouteAccessDecision() === 'unauthorized';

  const [goBackPath, setGoBackPath] = useSessionStorageState<string>(
    'backendaiwebui.last_visited_general_path',
  );

  // Store the last visited general (non-admin) menu path so the admin header's
  // "go back" button can return the user to where they were. Use the role-
  // independent `isCurrentPathAdminCategory` instead of
  // `isSelectedAdminCategoryMenu`: the latter is role-filtered and would
  // misclassify an admin page as "general" for users whose admin menu
  // excludes that page (e.g. superadmin on `/project-admin-users`), which
  // would pollute `goBackPath` with an admin path and make a later go-back
  // navigate to the same page.
  useEffect(() => {
    if (!isCurrentPathAdminCategory) {
      setGoBackPath(location.pathname);
    }
    // `location` is from react-router useLocation() — pathname is reactive across navigations.
    // react-doctor-disable-next-line react-doctor/no-mutable-in-deps
  }, [setGoBackPath, location.pathname, isCurrentPathAdminCategory]);

  // The row must occupy the same box a `side-nav-item` row does (40px height,
  // 2px block margin, icon at 32–48px, label at 56px) or toggling between the
  // general and the admin menu makes the top row appear to jump. Geometry
  // rationale + measurements: FR-3482 ticket 24, POLISH-3 item 3.
  const adminHeader = (
    <HStack
      align="center"
      gap={0}
      height={40}
      style={{
        paddingInlineStart: collapsed ? undefined : 'var(--spacing-4)',
        // `--spacing-0-5` = 2px = `SIDE_NAV_DENSITY`'s `side-nav-item`
        // `marginBlock`.
        marginBlock: 'var(--spacing-0-5)',
      }}
    >
      <IconButton
        variant="ghost"
        label={t('webui.menu.GoBack')}
        tooltip={t('webui.menu.GoBack')}
        icon={<ArrowLeftIcon size="1em" />}
        onClick={() => {
          // `goBackPath` stores the last visited general (project-scoped)
          // path, e.g. `/project/<oldName>/session`. If the user switched
          // projects while in admin mode, rewrite its `:projectName` segment
          // to the current project so "go back" lands on the active project,
          // not the stale one. Non-project paths pass through unchanged.
          //
          // Healing guard: a stored path that itself parses to an admin
          // scope (e.g. `/admin` polluted by the pre-fix bare-scope-root
          // bug, possibly persisted in sessionStorage from an older build)
          // would make "go back" a no-op loop — fall back to the default
          // general page instead of navigating back into admin.
          const storedTarget = goBackPath
            ? rewriteProjectNameInPath(goBackPath, activeProjectName)
            : undefined;
          const isStoredTargetAdmin =
            !!storedTarget &&
            getRouteScopeAndKey(storedTarget).scope !== 'project';
          webuiNavigate(
            storedTarget && !isStoredTargetAdmin
              ? storedTarget
              : defaultMenuPath,
          );
        }}
      />
      {!collapsed && (
        <Text type="large" weight="semibold">
          {t('webui.menu.AdminSettings')}
        </Text>
      )}
    </HStack>
  );

  return (
    <>
      {(!isSelectedAdminCategoryMenu || isCurrentPageUnauthorized) && (
        <BAIMenu
          hideGroupName={collapsed}
          selectedKeys={filterOutEmpty([
            currentMenuKey || 'start',
            // TODO: After 'SessionListPage' is completed and used as the main page, remove this code
            //       and change 'job' key to 'session'
            currentMenuKey === 'session' ? 'job' : '',
          ])}
          items={filterOutEmpty([
            firstAvailableAdminMenuItem && {
              // Go to first page of admin setting pages.
              key: 'admin-settings',
              labelText: t('webui.menu.AdminSettings'),
              to: getPathFromMenuKey(
                firstAvailableAdminMenuItem.key,
                activeProjectName,
              ),
              icon: <ShieldUserIcon style={{ color: token.colorInfo }} />,
            },
            ...groupedGeneralMenu,
          ])}
        />
      )}
      {firstAvailableAdminMenuItem && isSelectedAdminCategoryMenu && (
        // The admin region carries its own accent; `AstryxAdminTheme`
        // (FR-3482 ticket 02) re-passes `mode` explicitly because a nested
        // `<Theme>` otherwise falls back to `system` (MAPPING §5).
        <AstryxAdminTheme>
          {adminHeader}
          <BAIMenu
            hideGroupName={collapsed}
            selectedKeys={currentMenuKey ? [currentMenuKey] : []}
            items={groupedAdminMenu}
          />
        </AstryxAdminTheme>
      )}
    </>
  );
};

export default WebUISiderNavigation;
