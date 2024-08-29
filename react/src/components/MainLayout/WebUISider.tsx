import { filterEmptyItem } from '../../helper';
import { useCustomThemeConfig } from '../../helper/customThemeConfig';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../../hooks';
import { useCurrentUserRole } from '../../hooks/backendai';
import { useThemeMode } from '../../hooks/useThemeMode';
import BAIMenu from '../BAIMenu';
import BAISider, { BAISiderProps } from '../BAISider';
import Flex from '../Flex';
import SignoutModal from '../SignoutModal';
import EndpointsIcon from '../icons/EndpointsIcon';
import ExamplesIcon from '../icons/ExamplesIcon';
import ModelsIcon from '../icons/ModelsIcon';
import TrailsIcon from '../icons/TrailsIcon';
import { PluginPage, WebUIPluginType } from './MainLayout';
import {
  ApiOutlined,
  BarChartOutlined,
  BarsOutlined,
  CloudUploadOutlined,
  ControlOutlined,
  ExportOutlined,
  FileDoneOutlined,
  HddOutlined,
  InfoCircleOutlined,
  PlayCircleOutlined,
  RocketOutlined,
  SolutionOutlined,
  ToolOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useToggle } from 'ahooks';
import { theme, MenuProps, Typography } from 'antd';
import { ItemType } from 'antd/lib/menu/interface';
import _ from 'lodash';
import { PlayIcon } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

type MenuItem = {
  label: string;
  icon: React.ReactNode;
  key: string;
};
interface WebUISiderProps
  extends Pick<BAISiderProps, 'collapsed' | 'collapsedWidth' | 'onBreakpoint'> {
  webuiplugins?: WebUIPluginType;
}
const WebUISider: React.FC<WebUISiderProps> = (props) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const themeConfig = useCustomThemeConfig();
  const { isDarkMode } = useThemeMode();
  const mergedSiderTheme = themeConfig?.sider?.theme
    ? themeConfig.sider.theme
    : isDarkMode
      ? 'dark'
      : 'light';

  const currentUserRole = useCurrentUserRole();
  const webuiNavigate = useWebUINavigate();
  const location = useLocation();
  const baiClient = useSuspendedBackendaiClient();

  const isHideAgents = baiClient?._config?.hideAgents ?? true;
  const fasttrackEndpoint = baiClient?._config?.fasttrackEndpoint ?? null;
  const blockList = baiClient?._config?.blockList ?? null;
  const inactiveList = baiClient?._config?.inactiveList ?? null;
  const siteDescription = baiClient?._config?.siteDescription ?? null;
  const supportServing = baiClient?.supports('model-serving') ?? false;
  const supportUserCommittedImage =
    baiClient?.supports('user-committed-image') ?? false;

  const [isOpenSignoutModal, { toggle: toggleSignoutModal }] = useToggle(false);

  const generalMenu = filterEmptyItem<ItemType>([
    {
      label: 'Start', // t('webui.menu.Summary'),
      icon: <PlayCircleOutlined style={{ color: token.colorPrimaryBg }} />,
      key: 'summary', // 'summary',
    },
    {
      label: 'Dashboard',
      icon: <DashboardOutlined style={{ color: token.colorPrimaryBg }} />,
      key: 'dashboard',
    },
    {
      key: 'storage',
      label: 'Storage',
      type: 'group',
      children: [
        {
          label: t('webui.menu.Data&Storage'),
          icon: <CloudUploadOutlined style={{ color: token.colorPrimaryBg }} />,
          key: 'data',
        },
      ],
    },
    {
      key: 'workload',
      label: 'Workload',
      type: 'group',
      children: [
        {
          label: t('webui.menu.Sessions'),
          icon: <BarsOutlined style={{ color: token.colorPrimaryBg }} />,
          key: 'session',
        },
        supportUserCommittedImage && {
          label: t('webui.menu.MyEnvironments'),
          icon: <FileDoneOutlined style={{ color: token.colorPrimaryBg }} />,
          key: 'my-environment',
        },
        {
          label: 'Examples',
          icon: <ExamplesIcon style={{ color: token.colorPrimaryBg }} />,
          key: 'examples',
        },
      ],
    },
    {
      key: 'service',
      label: 'Service',
      type: 'group',
      children: [
        supportServing && {
          label: 'Endpoints', //t('webui.menu.Serving'),
          icon: <EndpointsIcon style={{ color: token.colorPrimaryBg }} />, // <RocketOutlined />,
          key: 'serving',
        },
        {
          label: 'Models',
          icon: <ModelsIcon style={{ color: token.colorPrimaryBg }} />,
          key: 'models',
        },
      ],
    },
    {
      key: 'fasttrack',
      label: 'FastTrack',
      type: 'group',
      children: [
        !!fasttrackEndpoint && {
          label: 'Pipelines', // t('webui.menu.FastTrack'),
          icon: <ExportOutlined style={{ color: token.colorPrimaryBg }} />, // TODO: change to custom Pipelines icon
          key: 'pipeline',
          onClick: () => {
            window.open(fasttrackEndpoint, '_blank', 'noopener noreferrer');
          },
        },
        {
          label: 'Trails',
          icon: <TrailsIcon style={{ color: token.colorPrimaryBg }} />,
          key: 'trails',
        },
      ],
    },
    // {
    //   label: t('webui.menu.Import&Run'),
    //   icon: <PlayIcon />,
    //   key: 'import',
    // },
    // !isHideAgents && {
    //   label: t('webui.menu.AgentSummary'),
    //   icon: <HddOutlined />,
    //   key: 'agent-summary',
    // },
    // {
    //   label: t('webui.menu.Statistics'),
    //   icon: <BarChartOutlined />,
    //   key: 'statistics',
    // },
  ]);

  const adminMenu: MenuProps['items'] = [
    {
      label: 'System Dashboard',
      icon: <DashboardOutlined style={{ color: token.colorSuccess }} />,
      key: 'system_overview',
    },
    {
      label: t('webui.menu.Users'),
      icon: <UserOutlined style={{ color: token.colorSuccess }} />,
      key: 'credential',
    },
    {
      label: t('webui.menu.Environments'),
      icon: <FileDoneOutlined style={{ color: token.colorSuccess }} />,
      key: 'environment',
    },
    {
      label: t('webui.menu.ResourcePolicy'),
      icon: <SolutionOutlined style={{ color: token.colorSuccess }} />,
      key: 'resource-policy',
    },
  ];

  const superAdminMenu: MenuProps['items'] = [
    {
      label: t('webui.menu.Resources'),
      icon: <HddOutlined style={{ color: token.colorSuccess }} />,
      key: 'agent',
    },
    {
      label: t('webui.menu.Configurations'),
      icon: <ControlOutlined style={{ color: token.colorSuccess }} />,
      key: 'settings',
    },
    {
      label: t('webui.menu.Maintenance'),
      icon: <ToolOutlined style={{ color: token.colorSuccess }} />,
      key: 'maintenance',
    },
    {
      label: t('webui.menu.Information'),
      icon: <InfoCircleOutlined style={{ color: token.colorSuccess }} />,
      key: 'information',
    },
  ];

  const pluginMap: Record<string, MenuProps['items']> = {
    'menuitem-user': generalMenu,
    'menuitem-admin': adminMenu,
    'menuitem-superadmin': superAdminMenu,
  };

  // Add plugin pages according to the user role.
  // Iterates over own enumerable string keyed properties of an object and invokes iteratee for each property.
  _.forOwn(props.webuiplugins, (value, key) => {
    // Check if the `pluginMap` object has the current key using the `_.has` function.
    if (_.has(pluginMap, key)) {
      const menu = pluginMap[key as keyof typeof pluginMap] as MenuItem[];
      const pluginPages = props?.webuiplugins?.page;
      _.map(value, (name) => {
        // Find page item belonging to each of menuitem-user, menuitem-admin, menuitem-superadmin in webuiplugins.page
        const page = _.find(pluginPages, { name: name }) as PluginPage;
        if (page) {
          const menuItem: MenuItem = {
            label: page?.menuitem,
            icon: <ApiOutlined />,
            key: page?.url,
          };
          menu?.push(menuItem);
        }
      });
    }
  });

  _.forEach([generalMenu, adminMenu, superAdminMenu], (menu) => {
    // Remove menu items that are in blockList
    _.remove(menu, (item) => _.includes(blockList, item?.key));
    // Disable menu items that are in inactiveList
    _.forEach(menu, (item) => {
      if (_.includes(inactiveList, item?.key)) {
        _.extend(item, { disabled: true });
      }
    });
  });

  return (
    <BAISider
      logo={
        <img
          className="logo-wide"
          alt={themeConfig?.logo?.alt || 'Backend.AI Logo'}
          src={
            mergedSiderTheme === 'dark' && themeConfig?.logo?.srcDark
              ? themeConfig?.logo?.srcDark ||
                '/manifest/backend.ai-text-bgdark.svg'
              : themeConfig?.logo?.src || '/manifest/backend.ai-text.svg'
          }
          style={{
            width: themeConfig?.logo?.size?.width || 191,
            height: themeConfig?.logo?.size?.height || 32,
            cursor: 'pointer',
          }}
          onClick={() => webuiNavigate(themeConfig?.logo?.href || '/summary')}
        />
      }
      theme={mergedSiderTheme}
      logoCollapsed={
        <img
          className="logo-collapsed"
          alt={themeConfig?.logo?.alt || 'Backend.AI Logo'}
          src={
            mergedSiderTheme === 'dark' && themeConfig?.logo?.srcCollapsedDark
              ? themeConfig?.logo?.srcCollapsedDark ||
                '/manifest/backend.ai-brand-simple-bgdark.svg'
              : themeConfig?.logo?.srcCollapsed ||
                '/manifest/backend.ai-brand-simple.svg'
          }
          style={{
            width: themeConfig?.logo?.sizeCollapsed?.width || 48,
            height: themeConfig?.logo?.sizeCollapsed?.height || 32,
            cursor: 'pointer',
          }}
          onClick={() => webuiNavigate(themeConfig?.logo?.href || '/summary')}
        />
      }
      logoTitle={themeConfig?.logo?.logoTitle || siteDescription || 'WebUI'}
      logoTitleCollapsed={
        themeConfig?.logo?.logoTitleCollapsed || siteDescription || 'WebUI'
      }
      bottomText={
        props.collapsed ? null : (
          <>
            <div className="terms-of-use">
              <Flex
                wrap="wrap"
                style={{ fontSize: token.sizeXS }}
                justify="center"
              >
                <Typography.Link
                  type="secondary"
                  style={{ fontSize: 11 }}
                  onClick={() => {
                    document.dispatchEvent(
                      new CustomEvent('show-TOS-agreement'),
                    );
                  }}
                >
                  {t('webui.menu.TermsOfService')}
                </Typography.Link>
                &nbsp;·&nbsp;
                <Typography.Link
                  type="secondary"
                  style={{ fontSize: 11 }}
                  onClick={() => {
                    document.dispatchEvent(
                      new CustomEvent('show-PP-agreement'),
                    );
                  }}
                >
                  {t('webui.menu.PrivacyPolicy')}
                </Typography.Link>
                &nbsp;·&nbsp;
                <Typography.Link
                  type="secondary"
                  style={{ fontSize: 11 }}
                  onClick={() => {
                    document.dispatchEvent(
                      new CustomEvent('show-about-backendai'),
                    );
                  }}
                >
                  {t('webui.menu.AboutBackendAI')}
                </Typography.Link>
                {!!baiClient?._config?.allowSignout && (
                  <>
                    &nbsp;·&nbsp;
                    <Typography.Link
                      type="secondary"
                      style={{ fontSize: 11 }}
                      onClick={toggleSignoutModal}
                    >
                      {t('webui.menu.LeaveService')}
                    </Typography.Link>
                    <SignoutModal
                      open={isOpenSignoutModal}
                      onRequestClose={toggleSignoutModal}
                    />
                  </>
                )}
              </Flex>
            </div>
            <address>
              <small className="sidebar-footer">
                {themeConfig?.branding?.companyName || 'Lablup Inc.'}
              </small>
              &nbsp;
              <small
                className="sidebar-footer"
                style={{ fontSize: token.sizeXS }}
              >
                {/* @ts-ignore */}
                {`${global.packageVersion}.${globalThis.buildNumber}`}
              </small>
            </address>
          </>
        )
      }
      {...props}
    >
      <BAIMenu
        selectedKeys={[
          location.pathname.split('/')[1] || 'summary',
          // TODO: After matching first path of 'storage-settings' and 'agent', remove this code
          location.pathname.split('/')[1] === 'storage-settings' ? 'agent' : '',
          // TODO: After 'SessionListPage' is completed and used as the main page, remove this code
          //       and change 'job' key to 'session'
          location.pathname.split('/')[1] === 'session' ? 'job' : '',
        ]}
        items={
          // TODO: add plugin menu
          currentUserRole === 'superadmin'
            ? [
                ...generalMenu,
                {
                  type: 'group',
                  label: (
                    <Flex>
                      {!props.collapsed && (
                        <Typography.Text type="secondary" ellipsis>
                          {t('webui.menu.Administration')}
                        </Typography.Text>
                      )}
                    </Flex>
                  ),
                  children: [...adminMenu, ...superAdminMenu],
                },
              ]
            : currentUserRole === 'admin'
              ? [
                  ...generalMenu,
                  {
                    type: 'group',
                    label: (
                      <Flex
                        style={{
                          borderBottom: `1px solid ${token.colorBorder}`,
                        }}
                      >
                        {!props.collapsed && (
                          <Typography.Text type="secondary" ellipsis>
                            {t('webui.menu.Administration')}
                          </Typography.Text>
                        )}
                      </Flex>
                    ),
                    children: [...adminMenu],
                  },
                ]
              : [...generalMenu]
        }
        /**
         * Etc menu
         */
        // {
        //   label: '404',
        //   icon: <QuestionOutlined />,
        //   key: '404',
        // },
        // ]}
        onClick={({ key, keyPath }) => {
          webuiNavigate('/' + keyPath.join('/'));
        }}
      />
    </BAISider>
  );
};
export default WebUISider;
