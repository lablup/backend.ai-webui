/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useWebUINavigate } from '../../hooks';
import { useBAISettingUserState } from '../../hooks/useBAISetting';
import useKeyboardShortcut from '../../hooks/useKeyboardShortcut';
import { useLogoutEventListeners } from '../../hooks/useLogout';
import usePrimaryColors from '../../hooks/usePrimaryColors';
import { useWebUIMenuItems } from '../../hooks/useWebUIMenuItems';
import { useSetupWebUIPluginEffect } from '../../hooks/useWebUIPluginState';
import Page401 from '../../pages/Page401';
import Page404 from '../../pages/Page404';
import BAIContentWithDrawerArea from '../BAIContentWithDrawerArea';
import BAIErrorBoundary from '../BAIErrorBoundary';
import { BAIMetaDataWrapper } from '../DefaultProviders';
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
import WebUIHeader from './WebUIHeader';
import WebUISider from './WebUISider';
import { ConfigProvider, Layout, type LayoutProps, theme } from 'antd';
import { createGlobalStyle, createStyles } from 'antd-style';
import { BAIFlex } from 'backend.ai-ui';
import { atom, useSetAtom } from 'jotai';
import * as _ from 'lodash-es';
import React, {
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
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

// Global scrollbar styling. antd-style's createGlobalStyle injects a nonce'd
// emotion <style> (via the <StyleProvider nonce> in DefaultProviders), so it
// survives a strict CSP style-src policy — unlike a raw <style> element.
const ScrollbarGlobalStyle = createGlobalStyle`
  /* Scrollbar stylings */
  /* Works on Firefox */
  * {
    scrollbar-width: 2px;
    scrollbar-color: ${({ theme }) => theme.colorBorderSecondary}
      ${({ theme }) => theme.colorBgElevated};
  }

  /* Works on Chrome, Edge, and Safari */
  *::-webkit-scrollbar {
    max-width: 2px;
    background-color: ${({ theme }) => theme.colorBgElevated};
  }

  *::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colorBgElevated};
  }

  *::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.colorBorderSecondary};
  }
`;

const useStyle = createStyles(({ css, token }) => ({
  alertWrapper: css`
    & > *:first-child {
      margin-top: ${token.margin}px;
    }
    & > *:last-child {
      margin-bottom: ${token.margin}px;
    }
  `,
}));

function MainLayout() {
  'use memo';
  const navigate = useWebUINavigate();
  const [compactSidebarActive] = useBAISettingUserState('compact_sidebar');
  const [sideCollapsed, setSideCollapsed] =
    useState<boolean>(!!compactSidebarActive);

  const matches = useMatches();
  // @ts-ignore
  const isHiddenBreadcrumb = _.last(matches)?.handle?.hideBreadcrumb ?? false;
  const { styles } = useStyle();

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
      <ScrollbarGlobalStyle />
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
        <Layout
          style={{
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
                    className={styles.alertWrapper}
                  >
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
                    <PageAccessGuard emptyErrorPage>
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
                    </PageAccessGuard>
                  </ErrorBoundaryWithNullFallback>
                  <BAIErrorBoundary>
                    <AutoAdminPrimaryColorProvider>
                      <BAIMetaDataWrapper>
                        <PageAccessGuard>
                          <Outlet />
                        </PageAccessGuard>
                      </BAIMetaDataWrapper>
                    </AutoAdminPrimaryColorProvider>
                  </BAIErrorBoundary>
                </Suspense>
                <ErrorBoundaryWithNullFallback>
                  <PluginLoader />
                </ErrorBoundaryWithNullFallback>
              </BAIErrorBoundary>
            </BAIFlex>
          </BAIContentWithDrawerArea>
        </Layout>
      </Suspense>
    </LayoutWithPageTestId>
  );
}

/**
 * Component that guards page access based on permissions and route validity.
 * - Unauthorized (401): User lacks permission (e.g., regular user accessing admin page)
 * - Blocked (404): Page is in the blocklist configuration (treated as not found)
 * - Not Found (404): Page path is not valid (not in menu, not a plugin page, not a static route)
 *
 * @param emptyErrorPage - If true, renders nothing instead of error pages (401/404)
 */
const PageAccessGuard = ({
  children,
  emptyErrorPage = false,
}: {
  children: React.ReactNode;
  emptyErrorPage?: boolean;
}) => {
  const {
    isCurrentPageBlocked,
    isCurrentPageNotFound,
    isCurrentPageUnauthorized,
  } = useWebUIMenuItems();

  const hasError =
    isCurrentPageUnauthorized || isCurrentPageBlocked || isCurrentPageNotFound;

  if (hasError && emptyErrorPage) {
    return null;
  }

  if (isCurrentPageUnauthorized) {
    return <Page401 />;
  }

  if (isCurrentPageBlocked || isCurrentPageNotFound) {
    return <Page404 />;
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
  const { isSelectedAdminCategoryMenu } = useWebUIMenuItems();
  if (isSelectedAdminCategoryMenu) {
    return (
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: primaryColors.admin,
          },
        }}
      >
        {children}
      </ConfigProvider>
    );
  }

  return children;
};

const LayoutWithPageTestId: React.FC<LayoutProps> = (props) => {
  const location = useLocation();
  const pageTest = useMemo(() => {
    const cleanPath = location.pathname.replace(/^\//, '').replace(/\//g, '-');
    return cleanPath ? `page-${cleanPath}` : 'page-root';
    // `location` is from react-router useLocation() — pathname is reactive across navigations.
    // react-doctor-disable-next-line react-doctor/no-mutable-in-deps
  }, [location.pathname]);
  return <Layout {...props} data-testid={pageTest} />;
};

type ThemeToken = ReturnType<typeof theme.useToken>['token'];

// Minimal `:root` bridge exposing only the antd tokens that OUT-OF-TREE global
// CSS still needs: `resources/webui.css` styles `body` (outside the React /
// antd cssVar scope), so it reads these via `var(--token-...)`. In-tree styles
// reference the antd token directly (createStyles / createGlobalStyle) and no
// longer depend on this bridge. createGlobalStyle injects it as a nonce'd
// <style>; `token` changes on theme switch, so the values stay in sync.
const TokenCssVariables = createGlobalStyle((props) => {
  const { token } = props as unknown as { token: ThemeToken };
  return `:root {
  --token-colorPrimary: ${token.colorPrimary};
  --token-colorBgBase: ${token.colorBgBase};
  --token-colorBgContainer: ${token.colorBgContainer};
  --token-colorBorder: ${token.colorBorder};
}`;
}) as unknown as React.FC<{ token: ThemeToken }>;

export const CSSTokenVariables = () => {
  const { token } = theme.useToken();

  return <TokenCssVariables token={token} />;
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
