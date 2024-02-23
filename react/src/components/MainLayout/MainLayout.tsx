import BAIContentWithDrawerArea from '../BAIContentWithDrawerArea';
import BAISider from '../BAISider';
import Flex from '../Flex';
import { DRAWER_WIDTH } from '../WEBUINotificationDrawer';
import WebUIHeader from './WebUIHeader';
import WebUISider from './WebUISider';
import { useLocalStorageState } from 'ahooks';
import { App, Layout, theme } from 'antd';
import _ from 'lodash';
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

function MainLayout() {
  const navigate = useNavigate();

  const [compactSidebarActive] = useLocalStorageState<boolean | undefined>(
    'backendaiwebui.settings.user.compact_sidebar',
  );
  const [sideCollapsed, setSideCollapsed] =
    useState<boolean>(!!compactSidebarActive);

  // const currentDomainName = useCurrentDomainValue();
  const { token } = theme.useToken();
  const webUIRef = useRef<HTMLElement>(null);
  const contentScrollFlexRef = useRef<HTMLDivElement>(null);
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

  // Add antd token styles to react root for web components
  _.forEach(token, (value, key) => {
    document.documentElement.style.setProperty(
      `--general-${key}`,
      value?.toString() ?? '',
    );
  });

  return (
    <Layout>
      <style>
        {`
          /* Scrollbar stylings */
          /* Works on Firefox */
          * {
            scrollbar-width: 2px;
            scrollbar-color: var(--general-colorBorderSecondary, #464646)
              var(--general-colorBgContainer, transparent);
          }

          /* Works on Chrome, Edge, and Safari */
          *::-webkit-scrollbar {
            max-width: 2px;
            background-color: var(--general-colorBgContainer, transparent);
          }

          *::-webkit-scrollbar-track {
            background: var(--general-colorBgContainer, transparent);
          }

          *::-webkit-scrollbar-thumb {
            background-color: var(--general-colorBorderSecondary, #464646);
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
              // height: `calc(100vh - ${HEADER_HEIGHT}px)`,
              overflow: 'auto',
            }}
          >
            <Suspense
              fallback={
                <div>
                  <Layout.Header style={{ visibility: 'hidden', height: 62 }} />
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
              </div>
            </Suspense>
            {/* <Flex direction="column"> */}

            {/* TODO: Breadcrumb */}
            {/* {location.pathname.split("/").length > 3 && (
            <Breadcrumb
              items={matches.map((match, index) => {
                return {
                  key: match.id,
                  href:
                    _.last(matches) === match
                      ? undefined
                      : // @ts-ignore
                        match?.handle?.altPath || match.pathname,
                  //@ts-ignore
                  title: match?.handle?.title,
                  onClick:
                    _.last(matches) === match
                      ? undefined
                      : (e) => {
                          e.preventDefault();
                          // @ts-ignore
                          navigate(match?.handle?.altPath || match.pathname);
                        },
                };
              })}
            />
          )} */}
            <Suspense>
              <Outlet />
            </Suspense>
            {/* To match paddig to 16 (2+14) */}
            {/* </Flex> */}
            {/* @ts-ignore */}
            <backend-ai-webui id="webui-shell" ref={webUIRef} />
          </Flex>
        </BAIContentWithDrawerArea>
      </Layout>
    </Layout>
  );
}

const NotificationForAnonymous = () => {
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

export default MainLayout;
