import { useBAISettingUserState } from '../../hooks/useBAISetting';
import { useCustomThemeConfig } from '../../hooks/useCustomThemeConfig';
import useKeyboardShortcut from '../../hooks/useKeyboardShortcut';
import { useThemeMode } from '../../hooks/useThemeMode';
import Page401 from '../../pages/Page401';
import Page404 from '../../pages/Page404';
import BAIContentWithDrawerArea from '../BAIContentWithDrawerArea';
import BAIErrorBoundary from '../BAIErrorBoundary';
import BAISider from '../BAISider';
import ErrorBoundaryWithNullFallback from '../ErrorBoundaryWithNullFallback';
import ForceTOTPChecker from '../ForceTOTPChecker';
import LoadingCurtain from '../LoadingCurtain';
import NetworkStatusBanner from '../NetworkStatusBanner';
import NoResourceGroupAlert from '../NoResourceGroupAlert';
import PasswordChangeRequestAlert from '../PasswordChangeRequestAlert';
import PluginLoader from '../PluginLoader';
import ThemePreviewModeAlert from '../ThemePreviewModeAlert';
import { DRAWER_WIDTH } from '../WEBUINotificationDrawer';
import WebUIBreadcrumb from '../WebUIBreadcrumb';
import WebUIHeader from './WebUIHeader';
import WebUISider from './WebUISider';
import { App, ConfigProvider, Layout, type LayoutProps, theme } from 'antd';
import { createStyles } from 'antd-style';
import { BAIFlex } from 'backend.ai-ui';
import { atom, useSetAtom } from 'jotai';
import _ from 'lodash';
import React, {
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNavigate, Outlet, useMatches, useLocation } from 'react-router-dom';
import usePrimaryColors from 'src/hooks/usePrimaryColors';
import { useWebUIMenuItems } from 'src/hooks/useWebUIMenuItems';
import { useSetupWebUIPluginEffect } from 'src/hooks/useWebUIPluginState';

const SplashModal = React.lazy(() => import('../SplashModal'));

// Z-index for header in MainLayout. Should be higher than any other elements in the page content.
// Since fixed column z-index in antd table is dynamically calculated based on the number of columns,
// we use a safe fixed value of 100. See: https://github.com/react-component/table/blob/master/src/utils/fixUtil.ts
export const HEADER_Z_INDEX_IN_MAIN_LAYOUT = 100;

export const mainContentDivRefState = atom<React.RefObject<HTMLElement | null>>(
  {
    current: null,
  },
);

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
  const navigate = useNavigate();
  const [compactSidebarActive] = useBAISettingUserState('compact_sidebar');
  const [sideCollapsed, setSideCollapsed] =
    useState<boolean>(!!compactSidebarActive);

  const matches = useMatches();
  // @ts-ignore
  const isHiddenBreadcrumb = _.last(matches)?.handle?.hideBreadcrumb ?? false;
  const { styles } = useStyle();

  useEffect(() => {
    if (sideCollapsed !== compactSidebarActive) {
      setSideCollapsed(!!compactSidebarActive);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compactSidebarActive]);

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
  const webUIRef = useRef<HTMLElement>(null);
  const contentScrollFlexRef = useRef<HTMLDivElement>(null);
  const setMainContentDivRefState = useSetAtom(mainContentDivRefState);
  useEffect(() => {
    setMainContentDivRefState(contentScrollFlexRef);
  }, [contentScrollFlexRef, setMainContentDivRefState]);

  // Setup listener for 'backend-ai-plugin-config' event from Lit shell.
  // This stores the plugin config string in Jotai state for PluginLoader to consume.
  useSetupWebUIPluginEffect();

  // Splash/About modal state - handles 'backend-ai-show-splash' event from Electron menu
  const [isOpenSplashDialog, setIsOpenSplashDialog] = useState(false);
  useEffect(() => {
    const handleShowSplash = () => {
      setIsOpenSplashDialog(true);
    };
    document.addEventListener('backend-ai-show-splash', handleShowSplash);
    return () => {
      document.removeEventListener('backend-ai-show-splash', handleShowSplash);
    };
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

  return (
    <LayoutWithPageTestId>
      <LoadingCurtain />
      <CSSTokenVariables />
      <style>
        {`
          /* Scrollbar stylings */
          /* Works on Firefox */
          * {
            scrollbar-width: 2px;
            scrollbar-color: var(--token-colorBorderSecondary, ${token.colorBorderSecondary},  #464646)
              var(--token-colorBgElevated, transparent);
          }

          /* Works on Chrome, Edge, and Safari */
          *::-webkit-scrollbar {
            max-width: 2px;
            background-color: var(--token-colorBgElevated, ${token.colorBgElevated}, transparent);
          }

          *::-webkit-scrollbar-track {
            background: var(--token-colorBgElevated, ${token.colorBgElevated}, transparent);
          }

          *::-webkit-scrollbar-thumb {
            background-color: var(--token-colorBorderSecondary, ${token.colorBorderSecondary}, #464646);
          }
        `}
      </style>
      <Suspense
        fallback={
          <>
            <BAISider style={{ visibility: 'hidden' }} />
            <NotificationForAnonymous />
          </>
        }
      >
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
      </Suspense>
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
              <Suspense
                fallback={
                  <div>
                    <Layout.Header
                      style={{ visibility: 'hidden', height: 62 }}
                    />
                  </div>
                }
              >
                <div
                  style={{
                    margin: `0 -${token.paddingContentHorizontalLG}px 0 -${token.paddingContentHorizontalLG}px`,
                    position: 'sticky',
                    top: 0,
                    zIndex: HEADER_Z_INDEX_IN_MAIN_LAYOUT,
                  }}
                >
                  <WebUIHeader
                    onClickMenuIcon={() => setSideCollapsed((v) => !v)}
                  />
                  {/* sticky Alert components with banner props */}
                  <ErrorBoundaryWithNullFallback>
                    <Suspense fallback={null}>
                      <NetworkStatusBanner />
                    </Suspense>
                  </ErrorBoundaryWithNullFallback>
                </div>
              </Suspense>
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
                    <PageAccessGuard>
                      <Outlet />
                    </PageAccessGuard>
                  </AutoAdminPrimaryColorProvider>
                </BAIErrorBoundary>
                <ErrorBoundaryWithNullFallback>
                  <PluginLoader />
                </ErrorBoundaryWithNullFallback>
              </Suspense>
              {/* @ts-ignore */}
              <backend-ai-webui id="webui-shell" ref={webUIRef} />
            </BAIErrorBoundary>
          </BAIFlex>
        </BAIContentWithDrawerArea>
      </Layout>
      <Suspense fallback={null}>
        <SplashModal
          open={isOpenSplashDialog}
          onRequestClose={() => setIsOpenSplashDialog(false)}
        />
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
  }, [location.pathname]);
  return <Layout {...props} data-testid={pageTest} />;
};

export const NotificationForAnonymous = () => {
  const app = App.useApp();
  useEffect(() => {
    const handler = (e: any) => {
      app.notification.open({
        ...e.detail,
        closeIcon: false,
        placement: 'bottomRight',
      });
    };
    document.addEventListener('add-bai-notification', handler);
    return () => {
      document.removeEventListener('add-bai-notification', handler);
    };
  }, [app.notification]);
  return null;
};

export const CSSTokenVariables = () => {
  const { token } = theme.useToken();
  const { isDarkMode } = useThemeMode(); // This is to make sure the theme mode is updated

  const themeConfig = useCustomThemeConfig();
  return (
    <style>
      {`
:root {
${Object.entries(token)
  .map(([key, value]) => {
    // Skip Component specific tokens
    if (key.charAt(0) === key.charAt(0).toUpperCase()) {
      return '';
    } else {
      return typeof value === 'number'
        ? `--token-${key}: ${value}px;`
        : `--token-${key}: ${value?.toString() ?? ''};`;
    }
  })
  .join('\n')}

  --theme-logo-url: url("${
    isDarkMode ? themeConfig?.logo.srcDark : themeConfig?.logo.src
  }");
      `}
    </style>
  );
};

export default MainLayout;
