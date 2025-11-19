import { useCustomThemeConfig } from '../../helper/customThemeConfig';
import { useBAISettingUserState } from '../../hooks/useBAISetting';
import useKeyboardShortcut from '../../hooks/useKeyboardShortcut';
import { useThemeMode } from '../../hooks/useThemeMode';
import BAIContentWithDrawerArea from '../BAIContentWithDrawerArea';
import BAIErrorBoundary from '../BAIErrorBoundary';
import BAISider from '../BAISider';
import ErrorBoundaryWithNullFallback from '../ErrorBoundaryWithNullFallback';
import ForceTOTPChecker from '../ForceTOTPChecker';
import NetworkStatusBanner from '../NetworkStatusBanner';
import NoResourceGroupAlert from '../NoResourceGroupAlert';
import PasswordChangeRequestAlert from '../PasswordChangeRequestAlert';
import ThemePreviewModeAlert from '../ThemePreviewModeAlert';
import { DRAWER_WIDTH } from '../WEBUINotificationDrawer';
import WebUIBreadcrumb from '../WebUIBreadcrumb';
import WebUIHeader from './WebUIHeader';
import WebUISider from './WebUISider';
import { App, Layout, LayoutProps, theme } from 'antd';
import { createStyles } from 'antd-style';
import { BAIFlex } from 'backend.ai-ui';
import { atom, useSetAtom } from 'jotai';
import _ from 'lodash';
import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNavigate, Outlet, useMatches, useLocation } from 'react-router-dom';

export const HEADER_Z_INDEX_IN_MAIN_LAYOUT = 6;
export type PluginPage = {
  name: string;
  url: string;
  menuitem: string;
  icon?: string;
  group?: string;
};

export type WebUIPluginType = {
  page: PluginPage[];
  menuitem: string[];
  'menuitem-user': string[];
  'menuitem-admin': string[];
  'menuitem-superadmin': string[];
};

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

  const [webUIPlugins, setWebUIPlugins] = useState<
    WebUIPluginType | undefined
  >();

  useEffect(() => {
    const handler = () => {
      // @ts-ignore
      setWebUIPlugins(webUIRef.current?.plugins);
    };
    document.addEventListener('backend-ai-config-loaded', handler);
    return () => {
      document.removeEventListener('backend-ai-config-loaded', handler);
    };
  }, [webUIRef]);

  useLayoutEffect(() => {
    const handleNavigate = (e: any) => {
      const { detail } = e;
      navigate(detail);
    };
    document.addEventListener('react-navigate', handleNavigate);

    return () => {
      document.removeEventListener('react-navigate', handleNavigate);
    };
  }, [navigate]);

  return (
    <LayoutWithPageTestId>
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
          webuiplugins={webUIPlugins}
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
                  <ThemePreviewModeAlert />
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
                </ErrorBoundaryWithNullFallback>
                <BAIErrorBoundary>
                  <Outlet />
                </BAIErrorBoundary>
              </Suspense>
              {/* @ts-ignore */}
              <backend-ai-webui id="webui-shell" ref={webUIRef} />
            </BAIErrorBoundary>
          </BAIFlex>
        </BAIContentWithDrawerArea>
      </Layout>
    </LayoutWithPageTestId>
  );
}

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
