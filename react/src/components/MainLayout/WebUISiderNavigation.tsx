/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AstryxAdminTheme } from '../../astryx-theme';
import { useBackToUserView } from '../../hooks/useBackToUserView';
import { useRouteAccessDecision } from '../../hooks/useRouteAccess';
import { useCurrentMenuKey } from '../../hooks/useRouteScope';
import { useWebUIMenuItems } from '../../hooks/useWebUIMenuItems';
import BAIMenu from '../BAIMenu';
import { IconButton } from '@lablup/ui-common/IconButton';
import { HStack } from '@lablup/ui-common/Stack';
import { Text } from '@lablup/ui-common/Text';
import { useTheme } from '@lablup/ui-common/theme';
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
  const { token } = useTheme();
  const location = useLocation();
  // Scope-aware current menu key (route handle), correct under the
  // `/project/:name/<feature>` and `/admin/<feature>` URL shapes where the
  // first pathname segment is the scope prefix, not the feature key.
  const currentMenuKey = useCurrentMenuKey();

  const {
    groupedGeneralMenu,
    groupedAdminMenu,
    groupedProjectAdminMenu,
    isSelectedAdminCategoryMenu,
    isSelectedProjectAdminMenu,
    isCurrentPathAdminCategory,
    firstAvailableAdminMenuItem,
    firstAvailableProjectAdminMenuItem,
  } = useWebUIMenuItems({
    hideGroupName: collapsed,
  });
  // Route-handle-declared access decision (FR-3383): when the current admin
  // page is unauthorized for this user, the sider falls back to the general
  // menu (the admin sider would be empty/misleading).
  const isCurrentPageUnauthorized = useRouteAccessDecision() === 'unauthorized';

  const [, setGoBackPath] = useSessionStorageState<string>(
    'backendaiwebui.last_visited_general_path',
  );
  const backToUserView = useBackToUserView();

  // Store the last visited general (non-admin) menu path so "go back" (the
  // project-admin header, the user menu) can return the user. Use the role-
  // independent `isCurrentPathAdminCategory`: the role-filtered flags would
  // misclassify an admin page the user's menu excludes as "general" and
  // pollute `goBackPath` with an admin path.
  useEffect(() => {
    if (!isCurrentPathAdminCategory) {
      setGoBackPath(location.pathname);
    }
    // `location` is from react-router useLocation() — pathname is reactive across navigations.
    // react-doctor-disable-next-line react-doctor/no-mutable-in-deps
  }, [setGoBackPath, location.pathname, isCurrentPathAdminCategory]);

  const isProjectAdminView =
    isSelectedProjectAdminMenu && !isCurrentPageUnauthorized;
  const isSystemAdminView =
    !isProjectAdminView &&
    !!firstAvailableAdminMenuItem &&
    isSelectedAdminCategoryMenu &&
    !isCurrentPageUnauthorized;

  // The row must occupy the same box a `side-nav-item` row does (40px height,
  // 2px block margin, icon at 32–48px, label at 56px) or toggling between the
  // general and the admin menu makes the top row appear to jump. Geometry
  // rationale + measurements: FR-3482 ticket 24, POLISH-3 item 3.
  const renderAdminHeader = (title: string) => (
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
        onClick={backToUserView}
      />
      {!collapsed && (
        <Text type="large" weight="semibold">
          {title}
        </Text>
      )}
    </HStack>
  );

  return (
    <>
      {!isProjectAdminView && !isSystemAdminView && (
        <BAIMenu
          hideGroupName={collapsed}
          selectedKeys={filterOutEmpty([
            currentMenuKey || 'dashboard',
            // TODO: After 'SessionListPage' is completed and used as the main page, remove this code
            //       and change 'job' key to 'session'
            currentMenuKey === 'session' ? 'job' : '',
          ])}
          items={filterOutEmpty([
            firstAvailableProjectAdminMenuItem && {
              // System admin pages are entered from the user menu instead.
              key: 'project-settings',
              labelText: t('webui.menu.ProjectSettings'),
              to: firstAvailableProjectAdminMenuItem.to,
              icon: <ShieldUserIcon style={{ color: token('--color-info') }} />,
            },
            ...groupedGeneralMenu,
          ])}
        />
      )}
      {(isProjectAdminView || isSystemAdminView) && (
        // `AstryxAdminTheme` re-passes `mode`: a nested `<Theme>` otherwise
        // falls back to `system` (MAPPING §5).
        <AstryxAdminTheme>
          {/* System admin pages are left from the user menu only. */}
          {isProjectAdminView &&
            renderAdminHeader(t('webui.menu.ProjectSettings'))}
          <BAIMenu
            hideGroupName={collapsed}
            selectedKeys={currentMenuKey ? [currentMenuKey] : []}
            items={
              isProjectAdminView ? groupedProjectAdminMenu : groupedAdminMenu
            }
          />
        </AstryxAdminTheme>
      )}
    </>
  );
};

export default WebUISiderNavigation;
