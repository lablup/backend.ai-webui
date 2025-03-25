import { useCustomThemeConfig } from '../../helper/customThemeConfig';
import { useBAISettingUserState } from '../../hooks/useBAISetting';
import useKeyboardShortcut from '../../hooks/useKeyboardShortcut';
import { useThemeMode } from '../../hooks/useThemeMode';
import BAIContentWithDrawerArea from '../BAIContentWithDrawerArea';
import BAIErrorBoundary from '../BAIErrorBoundary';
import BAISider from '../BAISider';
import Flex from '../Flex';
import ForceTOTPChecker from '../ForceTOTPChecker';
import NetworkStatusBanner from '../NetworkStatusBanner';
import NoResourceGroupBanner from '../NoResourceGroupBanner';
import PasswordChangeRequestAlert from '../PasswordChangeRequestAlert';
import { DRAWER_WIDTH } from '../WEBUINotificationDrawer';
import WebUIBreadcrumb from '../WebUIBreadcrumb';
import WebUIHeader from './WebUIHeader';
import WebUISider from './WebUISider';
import { App, Layout, theme } from 'antd';
import { atom, useSetAtom } from 'jotai';
import { Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';

export const HEADER_Z_INDEX_IN_MAIN_LAYOUT = 5;
export type PluginPage = {
  name: string;
  url: string;
  menuitem: string;
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

function MainLayout() {
  const navigate = useNavigate();
  const [compactSidebarActive] = useBAISettingUserState('compact_sidebar');
  const [sideCollapsed, setSideCollapsed] =
    useState<boolean>(!!compactSidebarActive);

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
    <Layout>
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
          onCollapse={(collapsed) => {
            setSideCollapsed(collapsed);
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
          <Flex
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
                    containerElement={contentScrollFlexRef.current}
                  />
                  <NetworkStatusBanner />
                  <NoResourceGroupBanner />
                </div>
              </Suspense>
              <Suspense>
                <PasswordChangeRequestAlert
                  showIcon
                  icon={undefined}
                  banner={false}
                  style={{ marginBottom: token.paddingContentVerticalLG }}
                  closable
                />
              </Suspense>
              <Suspense>
                <ForceTOTPChecker />
              </Suspense>
              <Suspense>
                <WebUIBreadcrumb
                  style={{
                    marginBottom: token.marginMD,
                    marginLeft: token.paddingContentHorizontalLG * -1,
                    marginRight: token.paddingContentHorizontalLG * -1,
                  }}
                />
                <Outlet />
              </Suspense>
              {/* To match paddig to 16 (2+14) */}
              {/* </Flex> */}
              {/* @ts-ignore */}
              <backend-ai-webui id="webui-shell" ref={webUIRef} />
            </BAIErrorBoundary>
          </Flex>
        </BAIContentWithDrawerArea>
      </Layout>
    </Layout>
  );
}

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
