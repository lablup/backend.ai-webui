import BAISider from '../BAISider';
import Flex from '../Flex';
import WebUIHeader from './WebUIHeader';
import WebUISider from './WebUISider';
import { useLocalStorageState } from 'ahooks';
import { Layout, theme } from 'antd';
import { Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';

const { Content } = Layout;

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

  const [sideCollapsed, setSideCollapsed] = useState<boolean>(false);
  const [compactSidebarActive] = useLocalStorageState<boolean | undefined>(
    'compactSidebarActive',
  );
  const [collapsedWidth, setCollapsedWidth] = useState(88);
  // const [isOpenPreferences, { toggle: toggleIsOpenPreferences }] = useToggle();

  // const currentDomainName = useCurrentDomainValue();
  const { token } = theme.useToken();
  const webUIRef = useRef<HTMLElement>(null);
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

  useEffect(() => {
    if (compactSidebarActive !== undefined) {
      setSideCollapsed(compactSidebarActive);
    }
  }, [compactSidebarActive]);

  return (
    <Layout
      style={{
        backgroundColor: 'transparent',
      }}
    >
      <Suspense fallback={<BAISider style={{ visibility: 'hidden' }} />}>
        <WebUISider
          collapsed={sideCollapsed}
          collapsedWidth={collapsedWidth}
          onBreakpoint={(broken) => {
            broken ? setCollapsedWidth(0) : setCollapsedWidth(88);
            setSideCollapsed(broken);
          }}
          webuiplugins={webUIPlugins}
        />
      </Suspense>
      <Layout
        style={{
          backgroundColor: 'transparent',
        }}
      >
        <Content>
          <Suspense
            fallback={
              <Layout.Header style={{ visibility: 'hidden', height: 62 }} />
            }
          >
            <WebUIHeader onClickMenuIcon={() => setSideCollapsed((v) => !v)} />
          </Suspense>
          <Flex
            direction="column"
            align="stretch"
            style={{
              paddingLeft: token.paddingContentHorizontalLG,
              paddingRight: token.paddingContentHorizontalLG,
              paddingBottom: token.paddingContentVertical,
            }}
          >
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
        </Content>
      </Layout>
    </Layout>
  );
}

export default MainLayout;
