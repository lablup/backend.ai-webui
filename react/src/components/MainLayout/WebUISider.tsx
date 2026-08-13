/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AstryxAdminTheme, AstryxReverseTheme } from '../../astryx-theme';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../../hooks';
import { useCustomThemeConfig } from '../../hooks/useCustomThemeConfig';
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
import { theme, useBAIBreakpoint } from '../../theme-shim';
import AboutBackendAIModal from '../AboutBackendAIModal';
import BAIMenu from '../BAIMenu';
import BAISider from '../BAISider';
import PrivacyPolicyModal from '../PrivacyPolicyModal';
import SiderToggleButton from '../SiderToggleButton';
import SignoutModal from '../SignoutModal';
import TermsOfServiceModal from '../TermsOfServiceModal';
import { Divider } from '@astryxdesign/core/Divider';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Link } from '@astryxdesign/core/Link';
import { HStack, VStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { useTheme } from '@astryxdesign/core/theme';
import { colorVars } from '@astryxdesign/core/theme/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import {
  filterOutEmpty,
  useHover,
  useSessionStorageState,
  useToggle,
} from 'backend.ai-ui';
import { ArrowLeftIcon, ShieldUserIcon } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

const styles = stylex.create({
  // `Link`'s own `color` lands on the inner `Text` too, so a rest/hover pair
  // needs `color="inherit"` plus this override on the anchor. FR-3512.
  footerLink: {
    color: {
      default: colorVars['--color-text-secondary'],
      ':hover': colorVars['--color-text-accent'],
    },
  },
});

interface WebUISiderProps {
  collapsed?: boolean;
  onBreakpoint?: (broken: boolean) => void;
  onCollapse?: (collapsed: boolean, type: 'clickTrigger') => void;
}

const WebUISider: React.FC<WebUISiderProps> = (props) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { themeConfig } = useCustomThemeConfig();

  // PILOT-DECISION: the sider's own light/dark polarity used to be read off
  // the parent antd `ConfigProvider`'s `algorithm`; the Astryx equivalent is
  // the nearest ancestor `<Theme>`'s RESOLVED mode (MAPPING §5). This picks
  // the logo asset only — the actual polarity switch is applied by
  // `WebUISiderWithCustomTheme` below.
  const { mode } = useTheme();
  const currentSiderTheme = mode === 'dark' ? 'dark' : 'light';

  const webuiNavigate = useWebUINavigate();
  const location = useLocation();
  // Scope-aware current menu key (route handle), correct under the new
  // `/project/:name/<feature>` and `/admin/<feature>` URL shapes where the
  // first pathname segment is the scope prefix, not the feature key.
  const currentMenuKey = useCurrentMenuKey();
  // Active project NAME (URL `:projectName` if present, else current project
  // atom). Used to build the scope-aware admin-settings link and to rewrite the
  // stored `goBackPath` to the current project on read.
  const activeProjectName = useActiveProjectName();
  const baiClient = useSuspendedBackendaiClient();

  const [isOpenSignoutModal, { toggle: toggleSignoutModal }] = useToggle(false);
  const [isOpenTOSModal, { toggle: toggleTOSModal }] = useToggle(false);
  const [isOpenPrivacyPolicyModal, { toggle: togglePrivacyPolicyModal }] =
    useToggle(false);
  const [isOpenAboutBackendAIModal, { toggle: toggleAboutBackendAIModal }] =
    useToggle(false);

  const siderRef = useRef<HTMLElement>(null);
  const isSiderHover = useHover(siderRef);
  // RESPONSIVE-POLICY R3: antd `Grid.useBreakpoint()` → theme-shim hook.
  // This also replaces `Layout.Sider`'s own `breakpoint="md"` callback, which
  // Astryx `SideNav` has no equivalent for (MAPPING §3.9 — no breakpoint
  // system) — see the effect below.
  const gridBreakpoint = useBAIBreakpoint();
  const onBreakpoint = props.onBreakpoint;
  const isBelowMd = !gridBreakpoint.md;
  useEffect(() => {
    onBreakpoint?.(isBelowMd);
  }, [onBreakpoint, isBelowMd]);

  const {
    groupedGeneralMenu,
    groupedAdminMenu,
    isSelectedAdminCategoryMenu,
    isCurrentPathAdminCategory,
    firstAvailableAdminMenuItem,
    defaultMenuPath,
  } = useWebUIMenuItems({
    hideGroupName: props.collapsed,
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

  // PILOT-DECISION: antd `Tooltip` + circular `Button type="text" icon` →
  // Astryx `IconButton` with its own `tooltip` (MAPPING §3.3 / §4). The
  // `Typography` heading whose only job was to restate
  // `fontSizeLG`/`fontWeightStrong` goes away — Astryx `Text type="large"
  // weight="semibold"` carries both. The tooltip's `placement` no longer flips
  // with `collapsed`; the default placement is used.
  //
  // The legacy geometry, though, is load-bearing and comes back — expressed as
  // PROPS + spacing tokens rather than the hand-set `40×42 + marginLeft: 16 +
  // marginBottom: 4` box it used to be. Dropping it left the back arrow 16px
  // to the LEFT of every menu icon under it, which is what reads as "the back
  // button looks wrong":
  //
  //   `SideNav`'s scroll column contributes 8px, `SIDE_NAV_DENSITY` gives
  //   `side-nav-item` `paddingInline: 24px`, so a row's 16px icon occupies
  //   32–48px from the rail edge and its label starts at 56px. A 32px
  //   (`--size-element-md`) icon button offset by `--spacing-4` therefore puts
  //   its glyph at exactly 32–48, and `gap={0}` puts the heading at exactly 56
  //   — the icon→label gap is then the button's own padding, not a stack gap.
  //   `height={40}` restores the menu-item row height (the same 40px
  //   `SIDE_NAV_DENSITY` gives `side-nav-item`) without resizing the button.
  //
  // Collapsed, the offset is dropped: the 48px rail centers the button itself,
  // and 16px of inline padding would push it out of the rail.
  //
  // POLISH-3 item 3 — the row must occupy the SAME box a menu row does, or
  // toggling between the general and the admin menu makes the top row appear
  // to jump. `SIDE_NAV_DENSITY` gives `side-nav-item` `height: 40px` AND
  // `margin-block: 2px`; this row had the height but no margin, and instead
  // carried a 4px `padding-block-end` that pushed its content 4px up inside
  // its own 40px box. Measured before: the back arrow's centre sat at y=90
  // while the "Admin Settings" menu row's icon sat at y=94. Replacing the
  // bottom padding with the same 2px block margin makes the two boxes
  // identical (border box y=74..114, icon centre y=94, icon x=32,
  // label x=56) — the geometry is now stated once, as the menu-item metric.
  const adminHeader = (
    <HStack
      align="center"
      gap={0}
      height={40}
      style={{
        paddingInlineStart: props.collapsed ? undefined : 'var(--spacing-4)',
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
      {!props.collapsed && (
        <Text type="large" weight="semibold">
          {t('webui.menu.AdminSettings')}
        </Text>
      )}
    </HStack>
  );

  return (
    <BAISider
      className="webui-sider"
      ref={siderRef}
      collapsed={props.collapsed}
      onCollapse={(collapsed) => props.onCollapse?.(collapsed, 'clickTrigger')}
      // The hover-revealed collapse toggle protrudes past the rail's right
      // edge. `SideNav` clips both axes (`overflow: hidden` on the root,
      // `overflow-x: hidden` on the scroll column), so as a CHILD its outer
      // half was cut off. `overlay` renders it as a sibling of `SideNav`
      // inside BAISider's positioned shell — where antd's Sider had it.
      overlay={
        <SiderToggleButton
          collapsed={props.collapsed}
          buttonTop={68}
          onClick={(collapsed) => {
            props.onCollapse?.(collapsed, 'clickTrigger');
          }}
          hidden={!gridBreakpoint.sm || !isSiderHover}
        />
      }
      logo={
        <img
          className="logo-wide"
          alt={themeConfig?.logo?.alt || 'Backend.AI Logo'}
          src={
            currentSiderTheme === 'dark'
              ? themeConfig?.logo?.srcDark ||
                '/manifest/backend.ai-webui-white.svg'
              : themeConfig?.logo?.src || '/manifest/backend.ai-webui-white.svg'
          }
          style={{
            width: themeConfig?.logo?.size?.width || 159,
            height: themeConfig?.logo?.size?.height || 24,
            cursor: 'pointer',
            display: 'block',
          }}
          onClick={() => webuiNavigate(defaultMenuPath)}
        />
      }
      logoCollapsed={
        <img
          className="logo-collapsed"
          alt={themeConfig?.logo?.alt || 'Backend.AI Logo'}
          src={
            currentSiderTheme === 'dark'
              ? themeConfig?.logo?.srcCollapsedDark ||
                '/manifest/backend.ai-brand-simple-black.svg'
              : themeConfig?.logo?.srcCollapsed ||
                '/manifest/backend.ai-brand-simple-white.svg'
          }
          style={{
            width: themeConfig?.logo?.sizeCollapsed?.width ?? 24,
            height: themeConfig?.logo?.sizeCollapsed?.height ?? 24,
            cursor: 'pointer',
            display: 'block',
          }}
          onClick={() => webuiNavigate(defaultMenuPath)}
        />
      }
      footer={
        props.collapsed ? undefined : (
          // Chrome-level block: links stay at `supporting` size and secondary
          // tone at rest, taking the accent only on hover. FR-3512.
          <VStack
            gap={2}
            align="center"
            className="terms-of-use"
            style={{ textAlign: 'center', paddingBlockEnd: token.paddingSM }}
          >
            <Divider />
            <HStack gap={1} justify="center" wrap="wrap">
              <Link
                data-testid="button-terms-of-service"
                type="supporting"
                color="inherit"
                xstyle={styles.footerLink}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  toggleTOSModal();
                }}
              >
                {t('webui.menu.TermsOfService')}
              </Link>
              <Text type="supporting">·</Text>
              <Link
                data-testid="button-privacy-policy"
                type="supporting"
                color="inherit"
                xstyle={styles.footerLink}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  togglePrivacyPolicyModal();
                }}
              >
                {t('webui.menu.PrivacyPolicy')}
              </Link>
              <Text type="supporting">·</Text>
              <Link
                data-testid="button-about-backend-ai"
                type="supporting"
                color="inherit"
                xstyle={styles.footerLink}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  toggleAboutBackendAIModal();
                }}
              >
                {t('webui.menu.AboutBackendAI')}
              </Link>
              {!!baiClient?._config?.allowSignout && (
                <>
                  <Text type="supporting">·</Text>
                  <Link
                    data-testid="button-leave-service"
                    type="supporting"
                    color="inherit"
                    xstyle={styles.footerLink}
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleSignoutModal();
                    }}
                  >
                    {t('webui.menu.LeaveService')}
                  </Link>
                </>
              )}
            </HStack>
            <Text type="supporting" size="xsm" as="div">
              <address className="sidebar-footer">
                {themeConfig?.branding?.companyName || 'Lablup Inc.'}
                &nbsp;
                {/* @ts-ignore */}
                {`${globalThis.packageVersion}.${globalThis.buildNumber}`}
              </address>
            </Text>
          </VStack>
        )
      }
    >
      {(!isSelectedAdminCategoryMenu || isCurrentPageUnauthorized) && (
        <BAIMenu
          hideGroupName={props.collapsed}
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
        // The admin region carried its own accent through a nested antd
        // `ConfigProvider token.colorPrimary`; `AstryxAdminTheme` (ticket 02)
        // is the Astryx adapter for exactly that, and it re-passes `mode`
        // explicitly because a nested `<Theme>` otherwise falls back to
        // `system` (MAPPING §5).
        <AstryxAdminTheme>
          {adminHeader}
          <BAIMenu
            hideGroupName={props.collapsed}
            selectedKeys={currentMenuKey ? [currentMenuKey] : []}
            items={groupedAdminMenu}
          />
        </AstryxAdminTheme>
      )}
      <TermsOfServiceModal
        open={isOpenTOSModal}
        onRequestClose={toggleTOSModal}
      />
      <PrivacyPolicyModal
        open={isOpenPrivacyPolicyModal}
        onRequestClose={togglePrivacyPolicyModal}
      />
      <AboutBackendAIModal
        open={isOpenAboutBackendAIModal}
        onRequestClose={toggleAboutBackendAIModal}
      />
      <SignoutModal
        open={isOpenSignoutModal}
        onRequestClose={toggleSignoutModal}
      />
    </BAISider>
  );
};

/**
 * Applies the operator's `sider.theme` override. antd expressed "render this
 * subtree with the opposite polarity" as a nested `ConfigProvider` with the
 * flipped `algorithm` (`ReverseThemeProvider`); the Astryx expression is
 * `AstryxReverseTheme`, a nested `<Theme>` with the inverted resolved mode.
 */
const WebUISiderWithCustomTheme: React.FC<WebUISiderProps> = (props) => {
  'use memo';
  const { themeConfig } = useCustomThemeConfig();
  const { mode } = useTheme();
  const isParentDark = mode === 'dark';

  const shouldReverse =
    (isParentDark && themeConfig?.sider?.theme === 'light') ||
    (!isParentDark && themeConfig?.sider?.theme === 'dark');

  return shouldReverse ? (
    <AstryxReverseTheme>
      <WebUISider {...props} />
    </AstryxReverseTheme>
  ) : (
    <WebUISider {...props} />
  );
};

export default WebUISiderWithCustomTheme;
