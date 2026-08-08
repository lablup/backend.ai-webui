/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AstryxAdminTheme } from '../../astryx-theme';
import { useWebUINavigate } from '../../hooks';
import { useResourceSlotsDetails } from '../../hooks/backendai';
import { useBAISettingUserState } from '../../hooks/useBAISetting';
import useKeyboardShortcut from '../../hooks/useKeyboardShortcut';
import { useLogoutEventListeners } from '../../hooks/useLogout';
import usePrimaryColors from '../../hooks/usePrimaryColors';
import { useRouteAccessDecision } from '../../hooks/useRouteAccess';
import { useCurrentMenuKey, useRouteScope } from '../../hooks/useRouteScope';
import { useSetupWebUIPluginEffect } from '../../hooks/useWebUIPluginState';
import { theme } from '../../theme-shim';
import BAIContentWithDrawerArea from '../BAIContentWithDrawerArea';
import BAIErrorBoundary from '../BAIErrorBoundary';
import { commonAppProps } from '../DefaultProviders';
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
import WebUISider from './WebUISider';
import { App, ConfigProvider } from 'antd';
import { BAIFlex, BAIResourceSlotsProvider } from 'backend.ai-ui';
import { atom, useSetAtom } from 'jotai';
import * as _ from 'lodash-es';
import React, {
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Outlet, useMatches, useLocation } from 'react-router-dom';

// Z-index for header in MainLayout. Should be higher than any other elements in the page content.
// Since fixed column z-index in antd table is dynamically calculated based on the number of columns,
// we use a safe fixed value of 100. See: https://github.com/react-component/table/blob/master/src/utils/fixUtil.ts
export const HEADER_Z_INDEX_IN_MAIN_LAYOUT = 100;

export const mainContentDivRefState = atom<React.RefObject<HTMLElement | null>>(
  {
    current: null,
  },
);

function MainLayout() {
  'use memo';
  const navigate = useWebUINavigate();
  const [compactSidebarActive] = useBAISettingUserState('compact_sidebar');
  const [sideCollapsed, setSideCollapsed] =
    useState<boolean>(!!compactSidebarActive);

  const matches = useMatches();
  // @ts-ignore
  const isHiddenBreadcrumb = _.last(matches)?.handle?.hideBreadcrumb ?? false;

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

  // const currentDomainName = useCurrentDomainValue();
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
    <LayoutWithPageTestId>
      <CSSTokenVariables />
      <Suspense fallback={null}>
        <DismissSplashOnMount />
        <WebUISider
          collapsed={sideCollapsed}
          onBreakpoint={(broken) => {
            if (broken) {
              setSideCollapsed(true);
            } else {
              !compactSidebarActive && setSideCollapsed(false);
            }
          }}
          onCollapse={(collapsed, type) => {
            type === 'clickTrigger' && setSideCollapsed(collapsed);
          }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 'auto',
            minWidth: 0,
            backgroundColor: 'transparent',
          }}
        >
          <BAIContentWithDrawerArea drawerWidth={DRAWER_WIDTH}>
            <BAIFlex
              ref={contentScrollFlexRef}
              direction="column"
              align="stretch"
              style={{
                paddingLeft: token.paddingContentHorizontalLG,
                paddingRight: token.paddingContentHorizontalLG,
                paddingBottom: token.paddingContentVertical,
                height: '100vh',
                overflow: 'auto',
              }}
            >
              <BAIErrorBoundary>
                <div
                  style={{
                    margin: `0 -${token.paddingContentHorizontalLG}px 0 -${token.paddingContentHorizontalLG}px`,
                    position: 'sticky',
                    top: 0,
                    zIndex: HEADER_Z_INDEX_IN_MAIN_LAYOUT,
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
                    <WebUIHeader
                      onClickMenuIcon={() => setSideCollapsed((v) => !v)}
                    />
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
                <Suspense>
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
          </BAIContentWithDrawerArea>
        </div>
      </Suspense>
    </LayoutWithPageTestId>
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

  const primaryColors = usePrimaryColors();
  // Apply the admin primary color on any non-project scope (global `admin` and
  // `projectAdmin`). Derived from the matched route handle via `useRouteScope`
  // rather than the role-filtered `isSelectedAdminCategoryMenu`, so the admin
  // theming is driven by the URL scope itself — correct under the
  // scope-prefixed routes and independent of which admin menu items the
  // current user's role happens to surface.
  const isAdminScope = useRouteScope() !== 'project';
  if (isAdminScope) {
    return (
      // `AstryxAdminTheme` is the Astryx half of this accent swap (ticket 02);
      // the antd `ConfigProvider` + `App` pair below is the antd half and
      // STAYS until the Form engine and the remaining antd surfaces go
      // (ticket 35) — the two switches are independent (MAPPING §5), so both
      // must be driven for an admin page to look right in either library.
      <AstryxAdminTheme>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: primaryColors.admin,
            },
          }}
        >
          {/* `display: contents` removes App's structural div from layout so
              admin-scope Outlet content participates in the same flex context
              as the other scopes (keeps route-error screens centered). */}
          <App {...commonAppProps} style={{ display: 'contents' }}>
            {children}
          </App>
        </ConfigProvider>
      </AstryxAdminTheme>
    );
  }

  return children;
};

/**
 * PILOT-DECISION (the frame): antd `Layout` → a plain flex row, and Astryx
 * **`AppShell` is deliberately NOT adopted** even though MAPPING §5 names it
 * as `Layout`'s destination. `AppShell` is an opinionated frame, not a
 * translation of this one:
 *
 *  - It owns the scroll containers and renders its own `<main>`. This layout
 *    publishes ITS scroll container through a jotai atom
 *    (`mainContentDivRefState`) that pages read for scroll-to-top and
 *    infinite scroll, and it relies on that same element being the scroll
 *    parent for the sticky header. `AppShell` exposes no ref to its scroller,
 *    so adopting it would mean nesting a second scroll container inside
 *    `main` — which breaks the sticky header outright.
 *  - Its `topNav` slot spans the FULL width, above the side nav. This app's
 *    header spans only the content column, beside the sider's own branded
 *    logo band. Moving it into `topNav` would relocate the brand bar, i.e.
 *    change the layout rather than port it (original-fidelity rule).
 *  - `BAIContentWithDrawerArea` shifts the content region when the
 *    notification drawer opens; there is no `AppShell` slot for that.
 *
 * `SideNav` — the other half of the §5 recipe — IS adopted (see `BAISider`).
 * Revisit `AppShell` at ticket 35, when the notification drawer and the
 * scroll-ref consumers have themselves moved.
 */
const LayoutWithPageTestId: React.FC<{
  children?: React.ReactNode;
}> = (props) => {
  'use memo';
  const location = useLocation();
  // Prefer the scope-aware menu key (route handle) so the page test id stays
  // stable across the scope-prefixed URLs (e.g. `/project/<name>/session` and
  // `/admin/session` both yield `page-session` / `page-admin-session` rather
  // than leaking the project name into the selector). Fall back to the cleaned
  // pathname for routes without a feature handle (login utils, error, etc.).
  const currentMenuKey = useCurrentMenuKey();
  const cleanPath = location.pathname.replace(/^\//, '').replace(/\//g, '-');
  const pageTest = currentMenuKey
    ? `page-${currentMenuKey}`
    : cleanPath
      ? `page-${cleanPath}`
      : 'page-root';
  return (
    <div
      {...props}
      style={{ display: 'flex', flexDirection: 'row', minHeight: '100vh' }}
      data-testid={pageTest}
    />
  );
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

  useLayoutEffect(() => {
    const root = document.documentElement;
    const bridged: Record<string, string> = {
      '--token-colorPrimary': colorPrimary,
      '--token-colorBgBase': colorBgBase,
      '--token-colorBgContainer': colorBgContainer,
      '--token-colorBorder': colorBorder,
    };
    _.forEach(bridged, (value, name) => root.style.setProperty(name, value));
    return () => {
      _.forEach(bridged, (_value, name) => root.style.removeProperty(name));
    };
  }, [colorPrimary, colorBgBase, colorBgContainer, colorBorder]);

  return null;
};

/**
 * Dismisses the HTML splash overlay when mounted.
 * Placed inside the outer Suspense boundary so it only fires after
 * the layout (sider, header) has actually rendered.
 */
const DismissSplashOnMount = () => {
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
