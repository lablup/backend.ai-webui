import { useSuspendedBackendaiClient } from '../hooks';
import BAIMenu from './BAIMenu';
import BAISider from './BAISider';
import Flex from './Flex';
import FlexActivityIndicator from './FlexActivityIndicator';
import UserDropdownMenu from './UserDropdownMenu';
import {
  AppstoreOutlined,
  BarChartOutlined,
  BellOutlined,
  CaretRightOutlined,
  CloudUploadOutlined,
  HddOutlined,
  ExperimentOutlined,
  ExportOutlined,
  FileDoneOutlined,
  MenuOutlined,
  RocketOutlined,
  UnorderedListOutlined,
  UserOutlined,
  ProfileOutlined,
  ControlOutlined,
  ToolOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useLocalStorageState } from 'ahooks';
import { Button, Layout, Tooltip, Typography, theme } from 'antd';
import { Header } from 'antd/es/layout/layout';
import _ from 'lodash';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation, Outlet, Link } from 'react-router-dom';

const { Content } = Layout;
const { Text } = Typography;

function MainLayout() {
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const navigate = useNavigate();
  const location = useLocation();
  const baiClient = useSuspendedBackendaiClient();

  const [sideCollapsed, setSideCollapsed] = useLocalStorageState<boolean>(
    'sideCollapsed',
    {
      defaultValue: false,
    },
  );
  return (
    <Layout>
      <BAISider
        collapsed={sideCollapsed}
        onCollapse={setSideCollapsed}
        logo={
          <img
            src="/manifest/backend.ai-text.svg"
            style={{
              width: 218,
              minHeight: 55,
            }}
          />
        }
        logoCollapsed={
          <img
            src={'/manifest/backend.ai-brand-simple.svg'}
            style={{
              width: 55,
              minHeight: 55,
            }}
          />
        }
        logoTitle={
          <>
            <div className="site-name">
              <span>Backend</span>.AI
            </div>
          </>
        }
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
                24.03.0-alpha.3.231120
              </small>
            </address>
          </>
        }
      >
        <Flex justify="center" align="center">
          <Button
            icon={<MenuOutlined />}
            type="text"
            onClick={() => {
              setSideCollapsed((v) => !v);
            }}
          />
          <Tooltip placement="bottom" title={t('webui.menu.Notifications')}>
            <Button icon={<BellOutlined />} type="text" onClick={() => {}} />
          </Tooltip>
          <Tooltip placement="bottom" title={t('webui.menu.Tasks')}>
            <Button icon={<ProfileOutlined />} type="text" />
          </Tooltip>
        </Flex>
        <BAIMenu
          selectedKeys={[location.pathname.split('/')[1]] || 'summary'}
          items={[
            /**
             * General menu
             */
            {
              label: <Link to={'/summary'}>{t('webui.menu.Summary')}</Link>,
              icon: <AppstoreOutlined />,
              key: 'summary',
            },
            {
              label: <Link to={'/job'}>{t('webui.menu.Sessions')}</Link>,
              icon: <UnorderedListOutlined />,
              key: 'jobs',
            },
            {
              label: <Link to={'/serving'}>{t('webui.menu.Serving')}</Link>,
              icon: <RocketOutlined />,
              key: 'serving',
            },
            {
              label: (
                <Link to={'/experiment'}>{t('webui.menu.Experiments')}</Link>
              ),
              icon: <ExperimentOutlined />,
              key: 'experiment',
            },
            {
              label: <Link to={'/import'}>{t('webui.menu.Import&Run')}</Link>,
              icon: <CaretRightOutlined />,
              key: 'import',
            },
            {
              label: <Link to={'/data'}>{t('webui.menu.Data&Storage')}</Link>,
              icon: <CloudUploadOutlined />,
              key: 'data',
            },
            {
              label: (
                <Link to={'/agent-summary'}>
                  {t('webui.menu.AgentSummary')}
                </Link>
              ),
              icon: <HddOutlined />,
              key: 'agent-summary',
            },
            {
              label: (
                <Link to={'/statistics'}>{t('webui.menu.Statistics')}</Link>
              ),
              icon: <BarChartOutlined />,
              key: 'statistics',
              disabled: _.includes(
                baiClient._config.menu?.inactivelist,
                'statistics',
              ),
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
              label: <Link to={'/credential'}>{t('webui.menu.Users')}</Link>,
              icon: <UserOutlined />,
              key: 'credential',
            },
            {
              label: (
                <Link to={'/environment'}>{t('webui.menu.Environments')}</Link>
              ),
              icon: <FileDoneOutlined />,
              key: 'environment',
            },
            /**
             * Superadmin menu
             */
            {
              label: <Link to={'/agent'}>{t('webui.menu.Resources')}</Link>,
              icon: <HddOutlined />,
              key: 'agent',
            },
            {
              label: (
                <Link to={'/settings'}>{t('webui.menu.Configurations')}</Link>
              ),
              icon: <ControlOutlined />,
              key: 'settings',
            },
            {
              label: (
                <Link to={'/maintenance'}>{t('webui.menu.Maintenance')}</Link>
              ),
              icon: <ToolOutlined />,
              key: 'maintenance',
            },
            {
              label: (
                <Link to={'/information'}>{t('webui.menu.Information')}</Link>
              ),
              icon: <InfoCircleOutlined />,
              key: 'information',
            },
            /**
             * Admin plugin menu
             */
          ]}
        />
      </BAISider>
      <Layout>
        <Header
          style={{
            position: 'sticky',
            height: 64,
            top: 0,
            zIndex: 1,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 0,
            paddingRight: token.marginMD,
            backgroundColor: token.colorBgContainer,
            borderBottom: `1px solid ${token.colorBorder}`,
          }}
        >
          <Flex direction="row">
            <Typography.Title
              level={5}
              style={{ margin: 0, marginLeft: token.marginMD }}
            >
              {_.upperFirst(location.pathname.split('/')[1]) ||
                t('webui.menu.Summary')}
            </Typography.Title>
          </Flex>
          <Flex gap={'xs'}>
            {/* @ts-ignore */}
            <backend-ai-project-switcher />
            <UserDropdownMenu />
          </Flex>
        </Header>
        <Content>
          <Suspense fallback={<FlexActivityIndicator />}>
            <div>
              {/* @ts-ignore */}
              <backend-ai-summary-view />
            </div>
          </Suspense>
        </Content>
      </Layout>
    </Layout>
  );
}

export default MainLayout;
