import { useCurrentDomainValue, useSuspendedBackendaiClient } from '../hooks';
import BAIMenu from './BAIMenu';
import BAISider from './BAISider';
import Flex from './Flex';
import FlexActivityIndicator from './FlexActivityIndicator';
import ProjectSelector from './ProjectSelector';
import {
  BarChartOutlined,
  BarsOutlined,
  BellOutlined,
  CaretRightOutlined,
  CloudUploadOutlined,
  ControlOutlined,
  DashboardOutlined,
  ExperimentOutlined,
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
import { Avatar, Button, Dropdown, Layout, Typography, theme } from 'antd';
import { Header } from 'antd/es/layout/layout';
import _ from 'lodash';
import { Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useNavigate,
  useLocation,
  Outlet,
  useMatches,
  Link,
} from 'react-router-dom';

const { Text } = Typography;

const { Content } = Layout;

function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const matches = useMatches();
  const formRef = useRef<HTMLFormElement>(null);
  // console.log(_.last(matches));

  const [sideCollapsed, setSideCollapsed] = useState<boolean>(false);
  const [compactSidebarActive] = useLocalStorageState<boolean | undefined>(
    'compactSidebarActive',
  );
  const [collapsedWidth, setCollapsedWidth] = useState(88);
  const [isOpenPreferences, { toggle: toggleIsOpenPreferences }] = useToggle();

  // const currentDomainName = useCurrentDomainValue();
  const { token } = theme.useToken();
  const { t } = useTranslation();

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

  const logout = () => {
    formRef.current?.submit();
  };

  return (
    <Layout>
      <BAISider
        collapsed={sideCollapsed}
        collapsedWidth={collapsedWidth}
        onBreakpoint={(broken) => {
          broken ? setCollapsedWidth(0) : setCollapsedWidth(88);
          setSideCollapsed(broken);
        }}
        logo={
          <img
            alt="Backend.AI Logo"
            className="logo-wide"
            src={'/manifest/backend.ai-text.svg'}
            style={{ width: 218, height: 55 }}
          />
        }
        logoCollapsed={
          <img
            alt="Backend.AI Logo"
            className="logo-square"
            src={'/manifest/backend.ai-brand-simple.svg'}
            style={{ width: 55, height: 55 }}
          />
        }
        logoTitle="WebUI"
        logoTitleCollapsed="WebUI"
        bottomText={
          <>
            <div className="terms-of-use">
              <Flex style={{ fontSize: token.sizeXS }}>
                <>{t('webui.menu.TermsOfService')}</>&nbsp;·&nbsp;
                <>{t('webui.menu.PrivacyPolicy')}</>&nbsp;·&nbsp;
                <>{t('webui.menu.AboutBackendAI')}</>
              </Flex>
            </div>
            <address>
              <small className="sidebar-footer">Lablup Inc.</small>
              <small
                className="sidebar-footer"
                style={{ fontSize: token.sizeXS }}
              >
                {/* {window.ManagerHub?.version} */}
              </small>
            </address>
          </>
        }
        // bottomText={<>Lablup Inc. {window.ManagerHub?.version}</>}
      >
        {/* <Flex justify="center" align="center">
          <Button
            icon={<MenuOutlined />}
            type="text"
            onClick={() => {
              setSideCollapsed((v) => !v);
            }}
          />
        </Flex> */}
        <BAIMenu
          selectedKeys={[location.pathname.split('/')[1] || 'dashboard']}
          items={[
            /**
             * General menu
             */
            {
              label: t('webui.menu.Summary'),
              icon: <DashboardOutlined />,
              key: 'summary',
            },
            {
              label: t('webui.menu.Sessions'),
              icon: <BarsOutlined />,
              key: 'job',
              title: t('webui.menu.Sessions'),
            },
            {
              label: t('webui.menu.Serving'),
              icon: <RocketOutlined />,
              key: 'serving',
            },
            {
              label: t('webui.menu.Experiments'),
              icon: <ExperimentOutlined />,
              key: 'experiment',
            },
            {
              label: t('webui.menu.Import&Run'),
              icon: <CaretRightOutlined />,
              key: 'import',
            },
            {
              label: t('webui.menu.Data&Storage'),
              icon: <CloudUploadOutlined />,
              key: 'data',
            },
            {
              label: t('webui.menu.AgentSummary'),
              icon: <HddOutlined />,
              key: 'agent-summary',
            },
            {
              label: t('webui.menu.Statistics'),
              icon: <BarChartOutlined />,
              key: 'statistics',
            },
            {
              label: <Link to={'/'}>{t('webui.menu.FastTrack')}</Link>,
              icon: <ExportOutlined />,
              key: 'fasttrack',
            },
            /**
             * Plugin menu
             */
            /**
             * Admin menu
             */
            {
              label: <>{t('webui.menu.Administration')}</>,
              type: 'group',
            },
            { type: 'divider' },
            {
              label: t('webui.menu.Users'),
              icon: <UserOutlined />,
              key: 'credential',
            },
            {
              label: t('webui.menu.Environments'),
              icon: <FileDoneOutlined />,
              key: 'environment',
            },
            /**
             * Superadmin menu
             */
            {
              label: t('webui.menu.Resources'),
              icon: <HddOutlined />,
              key: 'agent',
            },
            {
              label: t('webui.menu.Configurations'),
              icon: <ControlOutlined />,
              key: 'settings',
            },
            {
              label: t('webui.menu.Maintenance'),
              icon: <ToolOutlined />,
              key: 'maintenance',
            },
            {
              label: t('webui.menu.Information'),
              icon: <InfoCircleOutlined />,
              key: 'information',
            },
            /**
             * Admin plugin menu
             */
            /**
             * Etc menu
             */
            // {
            //   label: '404',
            //   icon: <QuestionOutlined />,
            //   key: '404',
            // },
          ]}
          onClick={({ keyPath }) => {
            navigate(keyPath.join('/'));
            document.dispatchEvent(
              new CustomEvent('move-to-from-react', {
                detail: '/' + keyPath.join('/'),
              }),
            );
          }}
        />
      </BAISider>
      <Layout>
        <Content
          style={{
            // padding: token.padding,
            paddingTop: 0,
            backgroundColor: token.colorBgContainer,
          }}
        >
          {/* <Flex direction="column"> */}
          <Header
            title={'Serving'}
            style={{
              position: 'sticky',
              height: 64,
              top: 0,
              zIndex: 1,
              // width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: token.marginMD,
              paddingRight: token.marginMD,
              // margin: token.marginMD * -1,
              backgroundColor: token.colorBgContainer,
              // borderBottom: `1px solid ${token.colorBorder}`,
            }}
          >
            <Flex direction="row" gap={'sm'}>
              <Button
                icon={<MenuOutlined />}
                type="text"
                onClick={() => {
                  setSideCollapsed((v) => !v);
                }}
              />
              <Typography.Title level={5} style={{ margin: 0 }}>
                {/* @ts-ignore */}
                {/* {_.last(matches)?.handle?.title || ''} */}
                Serving
              </Typography.Title>
            </Flex>
            <Flex gap={'xs'}>
              {/* <Suspense>
                <ProjectSelector domain={currentDomainName} />
              </Suspense> */}
              <Button size="large" icon={<BellOutlined />} type="text"></Button>
              <Dropdown
                menu={{
                  items: [
                    {
                      label: 'Preferences',
                      icon: <HolderOutlined />,
                      key: 'preferences',
                      onClick: () => toggleIsOpenPreferences(),
                    },
                    {
                      label: 'Log out',
                      icon: <LogoutOutlined />,
                      key: 'logout',
                      onClick: () => logout(),
                    },
                  ],
                }}
                trigger={['click']}
              >
                {/* to fix "react-dom.development.js:86 Warning: findDOMNode is deprecated in StrictMode.", it seems like a bug of ant.d dropdown */}
                <Flex
                  direction="row"
                  gap={token.marginXS}
                  style={{ cursor: 'pointer' }}
                >
                  <Avatar
                    size="small"
                    icon={<UserOutlined />}
                    style={{ backgroundColor: '#BFBFBF' }}
                  />
                  <Text>
                    {/* {window?.ManagerHub?.user?.name}{' '}
                    {window?.ManagerHub?.user?.email} */}
                  </Text>
                  {/* <DownOutlined
                    style={{
                      fontSize: 12,
                      color: token.colorTextSecondary,
                    }}
                  /> */}
                </Flex>
              </Dropdown>
            </Flex>
          </Header>
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
