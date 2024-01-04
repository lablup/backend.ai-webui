import {
  useCurrentDomainValue,
  useSuspendedBackendaiClient,
} from '../../hooks';
import BAIMenu from '../BAIMenu';
import { BAIModalProps } from '../BAIModal';
import BAISider, { BAISiderProps } from '../BAISider';
import { useWebComponentInfo } from '../DefaultProviders';
import Flex from '../Flex';
import FlexActivityIndicator from '../FlexActivityIndicator';
import ProjectSelector from '../ProjectSelector';
import WebUIHeader from './WebUIHeader';
import WebUISider from './WebUISider';
import {
  BarChartOutlined,
  BarsOutlined,
  BellOutlined,
  CaretRightOutlined,
  CloudUploadOutlined,
  ControlOutlined,
  DashboardOutlined,
  ExportOutlined,
  FileDoneOutlined,
  HddOutlined,
  HolderOutlined,
  InfoCircleOutlined,
  LogoutOutlined,
  MenuOutlined,
  RocketOutlined,
  ToolOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useLocalStorageState, useToggle } from 'ahooks';
import {
  Avatar,
  Button,
  Dropdown,
  Layout,
  MenuProps,
  Typography,
  theme,
} from 'antd';
import _ from 'lodash';
import { Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation, Outlet, useMatches } from 'react-router-dom';

const { Text } = Typography;

const { Content } = Layout;

function MainLayout() {
  const navigate = useNavigate();
  // console.log(_.last(matches));

  const [sideCollapsed, setSideCollapsed] = useState<boolean>(false);
  const [compactSidebarActive] = useLocalStorageState<boolean | undefined>(
    'compactSidebarActive',
  );
  const [collapsedWidth, setCollapsedWidth] = useState(88);
  const [isOpenPreferences, { toggle: toggleIsOpenPreferences }] = useToggle();

  // const currentDomainName = useCurrentDomainValue();
  const { token } = theme.useToken();

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
    <Layout>
      <Suspense>
        <WebUISider
          collapsed={sideCollapsed}
          collapsedWidth={collapsedWidth}
          onBreakpoint={(broken) => {
            broken ? setCollapsedWidth(0) : setCollapsedWidth(88);
            setSideCollapsed(broken);
          }}
        />
      </Suspense>
      <Layout>
        <Content
          style={{
            // padding: token.padding,
            paddingTop: 0,
            backgroundColor: token.colorBgContainer,
          }}
        >
          {/* <Flex direction="column"> */}
          <Suspense>
            <WebUIHeader onClickMenuIcon={() => setSideCollapsed((v) => !v)} />
          </Suspense>
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
          <Suspense fallback={<FlexActivityIndicator />}>
            <Outlet />
          </Suspense>
          {/* @ts-ignore */}
          <backend-ai-webui
            id="webui-shell"
            // style={{
            //   backgroundColor: '#222222',
            // }}
          />
          {/* </Flex> */}
        </Content>
      </Layout>
    </Layout>
  );
}

export default MainLayout;
