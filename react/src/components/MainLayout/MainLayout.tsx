/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AstryxAdminTheme, AstryxReverseTheme } from '../../astryx-theme';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../../hooks';
import { useResourceSlotsDetails } from '../../hooks/backendai';
import { useBAISettingUserState } from '../../hooks/useBAISetting';
import useKeyboardShortcut from '../../hooks/useKeyboardShortcut';
import { useLogoutEventListeners } from '../../hooks/useLogout';
import { useRouteAccessDecision } from '../../hooks/useRouteAccess';
import { useCurrentMenuKey, useRouteScope } from '../../hooks/useRouteScope';
import { useSetupWebUIPluginEffect } from '../../hooks/useWebUIPluginState';
import { theme } from '../../theme-shim';
import AnnouncementBanner from '../AnnouncementBanner';
import BAIContentWithDrawerArea from '../BAIContentWithDrawerArea';
import BAIErrorBoundary from '../BAIErrorBoundary';
import { SIDER_WIDTH } from '../BAISider';
import DevApiEndpointMismatchAlert from '../DevApiEndpointMismatchAlert';
import ErrorBoundaryWithNullFallback from '../ErrorBoundaryWithNullFallback';
import ForceTOTPChecker from '../ForceTOTPChecker';
import NetworkStatusBanner from '../NetworkStatusBanner';
import NoResourceGroupAlert from '../NoResourceGroupAlert';
import PasswordChangeRequestAlert from '../PasswordChangeRequestAlert';
import PluginLoader from '../PluginLoader';
import ProjectAdminScopeAlert from '../ProjectAdminScopeAlert';
import ThemePreviewModeAlert from '../ThemePreviewModeAlert';
import { DRAWER_WIDTH } from '../WEBUINotificationDrawer';
import WebUIBreadcrumb from '../WebUIBreadcrumb';
import './MainLayout.css';
import WebUIHeader from './WebUIHeader';
import WebUISider, { useSiderThemeReversed } from './WebUISider';
import WebUISiderFooter from './WebUISiderFooter';
import WebUISiderLogo from './WebUISiderLogo';
import WebUISiderNavigation from './WebUISiderNavigation';
import {
  BAI_Z_INDEX,
  BAIAppShell,
  BAIFlex,
  BAIOverlayScrollbar,
  BAIResourceSlotsProvider,
  BAISkeleton,
} from 'backend.ai-ui';
import { atom, useSetAtom } from 'jotai';
import * as _ from 'lodash-es';
import React, {
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useMatches, useLocation } from 'react-router-dom';

export const mainContentDivRefState = atom<React.RefObject<HTMLElement | null>>(
  {
    current: null,
  },
);

/**
 * FR-3612: BUI's `BAIAppShell` (Astryx `AppShell` + mobile drawer) is the shell
 * frame. Two contracts must hold: the app's scroll container stays INSIDE the
 * main slot at `height: 100%` (pages and the sticky header depend on
 * `mainContentDivRefState`; AppShell's own scroller must never engage), and
 * `topNav` stays unused on purpose (the header lives in the content column).
 * Full rationale: PR #8935.
 */
function MainLayout() {
  'use memo';
  const { t } = useTranslation();
  const navigate = useWebUINavigate();
  const [compactSidebarActive] = useBAISettingUserState('compact_sidebar');
  const [sideCollapsed, setSideCollapsed] =
    useState<boolean>(!!compactSidebarActive);
  // The operator's `sider.theme` polarity override applies to the drawer's
  // navigation surface too.
  const shouldReverse = useSiderThemeReversed();

  const matches = useMatches();
  // @ts-ignore
  const isHiddenBreadcrumb = _.last(matches)?.handle?.hideBreadcrumb ?? false;
  const location = useLocation();
  const pageTestId = usePageTestId();

  const [prevCompactSidebarActive, setPrevCompactSidebarActive] =
    useState(compactSidebarActive);
  if (prevCompactSidebarActive !== compactSidebarActive) {
    setPrevCompactSidebarActive(compactSidebarActive);
    setSideCollapsed(!!compactSidebarActive);
  }

  useKeyboardShortcut(
    (event) => {
      if (event.key === '[') {
        event.preventDefault();
        setSideCollapsed((v) => !v);
      }
    },
    {
      skipShortcutOnMetaKey: true,
    },
  );

  const { token } = theme.useToken();
  const contentScrollFlexRef = useRef<HTMLDivElement>(null);
  const setMainContentDivRefState = useSetAtom(mainContentDivRefState);
  useEffect(() => {
    setMainContentDivRefState(contentScrollFlexRef);
  }, [contentScrollFlexRef, setMainContentDivRefState]);

  // Plugin config is now set directly by useInitializeConfig in LoginView.
  // useSetupWebUIPluginEffect is kept as a no-op for backward compatibility.
  useSetupWebUIPluginEffect();

  // Register logout/app-close/beforeunload event listeners at the app level.
  // These were previously in the Lit shell (backend-ai-webui.ts).
  useLogoutEventListeners();

  // Gates the title-bar-strip rules (BAISider.css, WebUIHeader.css,
  // AnnouncementBanner.css) to the desktop app, where main.js keeps the macOS
  // window controls always visible above the top band (FR-3828).
  useLayoutEffect(() => {
    if (globalThis.isElectron && /Mac/i.test(navigator.platform)) {
      document.body.classList.add('electron-macos');
      return () => document.body.classList.remove('electron-macos');
    }
  }, []);

  useLayoutEffect(() => {
    const handleNavigate = (e: Event) => {
      const { detail } = e as CustomEvent<string>;
      if (typeof detail === 'string') {
        navigate(detail);
      }
    };
    document.addEventListener('react-navigate', handleNavigate);

    return () => {
      document.removeEventListener('react-navigate', handleNavigate);
    };
  }, [navigate]);

  const headerHeight = Number(token.Layout?.headerHeight) || 60;

  return (
    <>
      <CSSTokenVariables />
      <Suspense fallback={null}>
        <DismissSplashOnMount />
        <BAIAppShell
          data-testid={pageTestId}
          // `wash` paints `--color-background-body` behind nav and content.
          // The `body`/splash backdrop is the same VALUE but declared as a
          // literal (index.html) — the token is unusable before the brand
          // theme registers; see the note in index.html's critical <style>.
          variant="wash"
          contentPadding={0}
          pathname={location.pathname}
          banner={
            <ErrorBoundaryWithNullFallback>
              <Suspense fallback={null}>
                <AnnouncementBanner />
              </Suspense>
            </ErrorBoundaryWithNullFallback>
          }
          sideNav={
            <WebUISider
              collapsed={sideCollapsed}
              onCollapse={(collapsed, type) => {
                type === 'clickTrigger' && setSideCollapsed(collapsed);
              }}
            />
          }
          drawer={{
            'data-testid': 'webui-mobile-nav',
            header: <WebUISiderLogo />,
            label: t('webui.menu.Menu'),
            // The rail's own width, so a menu row is the same size on both
            // surfaces.
            width: SIDER_WIDTH,
            wrap: (drawer) =>
              shouldReverse ? (
                <AstryxReverseTheme>{drawer}</AstryxReverseTheme>
              ) : (
                drawer
              ),
            children: (
              <>
                <WebUISiderNavigation />
                <WebUISiderFooter />
              </>
            ),
          }}
        >
          <BAIContentWithDrawerArea drawerWidth={DRAWER_WIDTH}>
            <BAIFlex
              ref={contentScrollFlexRef}
              direction="column"
              align="stretch"
              // Stable hook for e2e and page-level styles. The native scrollbar
              // is hidden by `BAIOverlayScrollbar` below (it sets
              // `data-bai-custom-scrollbar` on this element) and an overlay
              // thumb is painted instead, so content width never shifts with
              // scrollability.
              className="main-layout-content-scroll"
              style={{
                paddingLeft: token.paddingContentHorizontalLG,
                paddingRight: token.paddingContentHorizontalLG,
                paddingBottom: token.paddingContentVertical,
                height: '100%',
                overflow: 'auto',
              }}
            >
              <BAIErrorBoundary>
                <div
                  style={{
                    margin: `0 -${token.paddingContentHorizontalLG}px 0 -${token.paddingContentHorizontalLG}px`,
                    position: 'sticky',
                    top: 0,
                    zIndex: BAI_Z_INDEX.appHeader,
                  }}
                >
                  <Suspense
                    fallback={
                      <div
                        style={{
                          height: headerHeight,
                          backgroundColor: token.Layout?.headerBg,
                        }}
                      />
                    }
                  >
                    <WebUIHeader />
                  </Suspense>
                  {/* sticky Alert components with banner props */}
                  <ErrorBoundaryWithNullFallback>
                    <Suspense fallback={null}>
                      <NetworkStatusBanner />
                    </Suspense>
                  </ErrorBoundaryWithNullFallback>
                </div>
                {/* Non sticky Alert components */}
                <Suspense fallback={<div style={{ minHeight: '0px' }} />}>
                  <BAIFlex
                    direction="column"
                    gap={'sm'}
                    align="stretch"
                    className="main-layout-alert-wrapper"
                  >
                    {/* Dev-only: warn when the connected backend differs from
                        VITE_DEFAULT_API_ENDPOINT. Guarded by import.meta.env.DEV
                        so it is dead-code eliminated from production builds. */}
                    {import.meta.env.DEV && (
                      <ErrorBoundaryWithNullFallback>
                        <DevApiEndpointMismatchAlert />
                      </ErrorBoundaryWithNullFallback>
                    )}
                    <ErrorBoundaryWithNullFallback>
                      <ThemePreviewModeAlert />
                    </ErrorBoundaryWithNullFallback>
                    <ErrorBoundaryWithNullFallback>
                      <ProjectAdminScopeAlert />
                    </ErrorBoundaryWithNullFallback>
                    <ErrorBoundaryWithNullFallback>
                      <NoResourceGroupAlert />
                    </ErrorBoundaryWithNullFallback>
                    <ErrorBoundaryWithNullFallback>
                      <PasswordChangeRequestAlert
                        showIcon
                        icon={undefined}
                        banner={false}
                        closable
                      />
                    </ErrorBoundaryWithNullFallback>
                  </BAIFlex>
                </Suspense>
                <Suspense>
                  <ErrorBoundaryWithNullFallback>
                    {/* ForceTOTPChecker is a component for previous version of manager which don't support TOTP registration before login.  */}
                    {/* https://github.com/lablup/backend.ai/pull/4354 */}
                    <ForceTOTPChecker />
                  </ErrorBoundaryWithNullFallback>
                </Suspense>
                {/* Owns the breadcrumb AND the Outlet, so it is on screen for
                    the whole lazy-route fetch. With no fallback that window
                    rendered nothing — the shell with an empty body. */}
                <Suspense fallback={<BAISkeleton rows={4} />}>
                  <ErrorBoundaryWithNullFallback>
                    <RouteAccessBreadcrumbGate>
                      {isHiddenBreadcrumb ? (
                        <div
                          style={{
                            marginBottom: token.marginMD,
                          }}
                        />
                      ) : (
                        <WebUIBreadcrumb
                          style={{
                            marginBottom: token.marginMD,
                            marginLeft: token.paddingContentHorizontalLG * -1,
                            marginRight: token.paddingContentHorizontalLG * -1,
                          }}
                        />
                      )}
                    </RouteAccessBreadcrumbGate>
                  </ErrorBoundaryWithNullFallback>
                  {/* Fills the viewport space left below header/alerts/
                      breadcrumb so route-error screens (RouteErrorContent
                      `flex: 1`) center in the Outlet area, identically in
                      every scope. Taller pages still grow and scroll. */}
                  <BAIFlex
                    direction="column"
                    align="stretch"
                    style={{ flexGrow: 1 }}
                  >
                    <BAIErrorBoundary>
                      <AutoAdminPrimaryColorProvider>
                        <ResourceSlotsWrapper>
                          <Outlet />
                        </ResourceSlotsWrapper>
                      </AutoAdminPrimaryColorProvider>
                    </BAIErrorBoundary>
                  </BAIFlex>
                </Suspense>
                <ErrorBoundaryWithNullFallback>
                  <PluginLoader />
                </ErrorBoundaryWithNullFallback>
              </BAIErrorBoundary>
            </BAIFlex>
            <BAIOverlayScrollbar targetRef={contentScrollFlexRef} />
          </BAIContentWithDrawerArea>
        </BAIAppShell>
      </Suspense>
    </>
  );
}

/**
 * Feeds the server's resource slots to `backend.ai-ui`. Sits inside the routed
 * subtree because the fetch is authenticated; the static metadata stays
 * app-wide in `DefaultProvidersForReactRoot`.
 */
const ResourceSlotsWrapper = ({ children }: { children: React.ReactNode }) => {
  'use memo';
  const { resourceSlotsInRG } = useResourceSlotsDetails();

  return (
    <BAIResourceSlotsProvider resourceSlots={resourceSlotsInRG}>
      {children}
    </BAIResourceSlotsProvider>
  );
};

/**
 * Hides the breadcrumb row while a route-error screen owns the content area.
 * Access enforcement itself lives in `RouteAccessGuard` (a route element in
 * routes.tsx) which throws `Response` 401/404 into `RouteErrorBoundary`; this
 * gate only mirrors that decision for the breadcrumb, matching the
 * breadcrumb-less catch-all 404s (`handle.hideBreadcrumb`).
 */
const RouteAccessBreadcrumbGate = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  'use memo';
  const decision = useRouteAccessDecision();

  if (decision === 'unauthorized' || decision === 'blocked') {
    return null;
  }

  return children;
};

const AutoAdminPrimaryColorProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  'use memo';

  // Apply the admin primary color on any non-project scope (global `admin` and
  // `projectAdmin`). Derived from the matched route handle via `useRouteScope`
  // rather than the role-filtered `isSelectedAdminCategoryMenu`, so the admin
  // theming is driven by the URL scope itself — correct under the
  // scope-prefixed routes and independent of which admin menu items the
  // current user's role happens to surface.
  const isAdminScope = useRouteScope() !== 'project';
  if (isAdminScope) {
    return (
      // `AstryxAdminTheme` is the whole accent swap — the antd
      // `ConfigProvider` + `App` pairing it replaced went away with the final
      // switch (FR-3482 tickets 04/35).
      <AstryxAdminTheme>{children}</AstryxAdminTheme>
    );
  }

  return children;
};

/**
 * Stable page test id for e2e (`page-<menuKey>`), scope-aware so
 * `/project/<name>/session` and `/admin/session` don't leak the project name
 * into the selector; falls back to the cleaned pathname for routes without a
 * feature handle (login utils, error, etc.). Applied to the AppShell root.
 */
const usePageTestId = () => {
  'use memo';
  const location = useLocation();
  const currentMenuKey = useCurrentMenuKey();
  const cleanPath = location.pathname.replace(/^\//, '').replace(/\//g, '-');
  return currentMenuKey
    ? `page-${currentMenuKey}`
    : cleanPath
      ? `page-${cleanPath}`
      : 'page-root';
};

/**
 * Minimal `:root` bridge exposing only the antd tokens that OUT-OF-TREE global
 * CSS still needs: `resources/webui.css` styles `body` (outside the React /
 * antd cssVar scope), so it reads these via `var(--token-...)`. In-tree styles
 * reference Astryx custom properties directly (co-located CSS files, P17) and
 * no longer depend on this bridge.
 *
 * to-astryx ticket 33: this used to be an antd-style `createGlobalStyle` that
 * re-emitted a nonce'd `<style>` on every theme change. The values are now
 * written straight to `document.documentElement` through the CSSOM, which the
 * strict CSP does not intercept (`style-src` governs parsed `<style>` elements
 * and `style` ATTRIBUTES, not `CSSStyleDeclaration.setProperty`) — so the
 * nonce plumbing goes away with the last antd-style import.
 */
export const CSSTokenVariables = () => {
  const { token } = theme.useToken();
  const { colorPrimary, colorBgBase, colorBgContainer, colorBorder } = token;
  // The token may be a number or a CSS length string; only a number gets px.
  const rawHeaderHeight = token.Layout?.headerHeight ?? 60;
  const headerHeight =
    typeof rawHeaderHeight === 'number'
      ? `${rawHeaderHeight}px`
      : rawHeaderHeight;

  useLayoutEffect(() => {
    const root = document.documentElement;
    const bridged: Record<string, string> = {
      '--token-colorPrimary': colorPrimary,
      '--token-colorBgBase': colorBgBase,
      '--token-colorBgContainer': colorBgContainer,
      '--token-colorBorder': colorBorder,
      '--webui-header-height': headerHeight,
    };
    _.forEach(bridged, (value, name) => root.style.setProperty(name, value));
    return () => {
      _.forEach(bridged, (_value, name) => root.style.removeProperty(name));
    };
  }, [colorPrimary, colorBgBase, colorBgContainer, colorBorder, headerHeight]);

  return null;
};

/**
 * Dismisses the HTML splash overlay when mounted.
 * Suspends on the client itself rather than relying on a sibling to hold the
 * boundary: below the `md` breakpoint the sider renders into AppShell's drawer
 * (its own `Suspense`), so nothing else in this boundary suspends and the
 * splash was torn down before login had even finished.
 */
const DismissSplashOnMount = () => {
  'use memo';
  useSuspendedBackendaiClient();
  useEffect(() => {
    (globalThis as any).__dismissSplash?.();
    (globalThis as any).__mainLayoutReady = true;
    document.dispatchEvent(new CustomEvent('main-layout-ready'));
    return () => {
      (globalThis as any).__mainLayoutReady = false;
    };
  }, []);
  return null;
};

export default MainLayout;
