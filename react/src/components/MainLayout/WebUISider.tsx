import { filterEmptyItem } from '../../helper';
import { useCustomThemeConfig } from '../../helper/customThemeConfig';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../../hooks';
import { useCurrentUserRole } from '../../hooks/backendai';
import { useThemeMode } from '../../hooks/useThemeMode';
import BAIMenu from '../BAIMenu';
import BAIModal from '../BAIModal';
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
  BarsOutlined,
  CloudUploadOutlined,
  ControlOutlined,
  DashboardOutlined,
  ExportOutlined,
  FileDoneOutlined,
  HddOutlined,
  InfoCircleOutlined,
  PlayCircleOutlined,
  RocketOutlined,
  SolutionOutlined,
  ToolOutlined,
  UserOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useToggle } from 'ahooks';
import {
  theme,
  MenuProps,
  Typography,
  Button,
  ConfigProvider,
  Tooltip,
} from 'antd';
import { ItemType } from 'antd/lib/menu/interface';
import _ from 'lodash';
import React, { useState } from 'react';
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

  const fasttrackEndpoint = baiClient?._config?.fasttrackEndpoint ?? null;
  const blockList = baiClient?._config?.blockList ?? null;
  const inactiveList = baiClient?._config?.inactiveList ?? null;
  const siteDescription = baiClient?._config?.siteDescription ?? null;
  const supportServing = baiClient?.supports('model-serving') ?? false;
  const supportUserCommittedImage =
    baiClient?.supports('user-committed-image') ?? false;

  const menuInPreparation = [
    'my-environment',
    'examples',
    'serving',
    'models',
    'pipeline',
    'trails',
    'credential',
    'environment',
    'resource-policy',
    'agent',
    'settings',
    'maintenance',
    'information',
  ];

  const [isOpenSignoutModal, { toggle: toggleSignoutModal }] = useToggle(false);
  const [isOpenPreparationMenuModal, setIsOpenPreparationMenuModal] =
    useState(false);

  const generalMenu = filterEmptyItem<ItemType>([
    {
      label: 'Start', // t('webui.menu.Summary'),
      icon: <PlayCircleOutlined style={{ color: token.colorPrimaryBg }} />,
      key: 'start', // 'summary',
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
          label: (
            <Tooltip
              placement="right"
              title="Work In Progress..."
              color={'#333333'}
            >
              {t('webui.menu.MyEnvironments')}
            </Tooltip>
          ),
          icon: <FileDoneOutlined style={{ color: token.colorPrimaryBg }} />,
          key: 'my-environment',
        },
        {
          label: (
            <Tooltip
              placement="right"
              title="Work In Progress..."
              color={'#333333'}
            >
              {'Examples'}
            </Tooltip>
          ),
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
          label: (
            <Tooltip
              placement="right"
              title="Work In Progress..."
              color={'#333'}
            >
              {'Endpoints'}
            </Tooltip>
          ),
          icon: <EndpointsIcon style={{ color: token.colorPrimaryBg }} />, // <RocketOutlined />,
          key: 'serving',
        },
        {
          label: (
            <Tooltip
              placement="right"
              title="Work In Progress..."
              color={'#333333'}
            >
              {'Models'}
            </Tooltip>
          ),
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
          label: (
            <Tooltip
              placement="right"
              title="Work In Progress..."
              color={'#333333'}
            >
              {'Pipelines'}
            </Tooltip>
          ),
          icon: <ExportOutlined style={{ color: token.colorPrimaryBg }} />, // TODO: change to custom Pipelines icon
          key: 'pipeline',
          onClick: () => {
            window.open(fasttrackEndpoint, '_blank', 'noopener noreferrer');
          },
        },
        {
          label: (
            <Tooltip
              placement="right"
              title="Work In Progress..."
              color={'#333333'}
            >
              {'Trails'}
            </Tooltip>
          ),
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
      label: (
        <Tooltip
          placement="right"
          title="Work In Progress..."
          color={'#333333'}
        >
          {t('webui.menu.Users')}
        </Tooltip>
      ),
      icon: <UserOutlined style={{ color: token.colorSuccess }} />,
      key: 'credential',
    },
    {
      label: (
        <Tooltip
          placement="right"
          title="Work In Progress..."
          color={'#333333'}
        >
          {t('webui.menu.Environments')}
        </Tooltip>
      ),
      icon: <FileDoneOutlined style={{ color: token.colorSuccess }} />,
      key: 'environment',
    },
    {
      label: (
        <Tooltip
          placement="right"
          title="Work In Progress..."
          color={'#333333'}
        >
          {t('webui.menu.ResourcePolicy')}
        </Tooltip>
      ),
      icon: <SolutionOutlined style={{ color: token.colorSuccess }} />,
      key: 'resource-policy',
    },
  ];

  const superAdminMenu: MenuProps['items'] = [
    {
      label: (
        <Tooltip
          placement="right"
          title="Work In Progress..."
          color={'#333333'}
        >
          {t('webui.menu.Resources')}
        </Tooltip>
      ),
      icon: <HddOutlined style={{ color: token.colorSuccess }} />,
      key: 'agent',
    },
    {
      label: (
        <Tooltip
          placement="right"
          title="Work In Progress..."
          color={'#333333'}
        >
          {t('webui.menu.Configurations')}
        </Tooltip>
      ),
      icon: <ControlOutlined style={{ color: token.colorSuccess }} />,
      key: 'settings',
    },
    {
      label: (
        <Tooltip
          placement="right"
          title="Work In Progress..."
          color={'#333333'}
        >
          {t('webui.menu.Maintenance')}
        </Tooltip>
      ),
      icon: <ToolOutlined style={{ color: token.colorSuccess }} />,
      key: 'maintenance',
    },
    {
      label: (
        <Tooltip
          placement="right"
          title="Work In Progress..."
          color={'#333333'}
        >
          {t('webui.menu.Information')}
        </Tooltip>
      ),
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
    <>
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
            onClick={() => webuiNavigate(themeConfig?.logo?.href || '/start')} // '/summary')}
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
            onClick={() => webuiNavigate(themeConfig?.logo?.href || '/start')} // '/summary')}
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
          isAdminMenu={false}
          selectedKeys={[
            location.pathname.split('/')[1] || 'start',
            // TODO: After matching first path of 'storage-settings' and 'agent', remove this code
            location.pathname.split('/')[1] === 'storage-settings'
              ? 'agent'
              : '',
            // TODO: After 'SessionListPage' is completed and used as the main page, remove this code
            //       and change 'job' key to 'session'
            location.pathname.split('/')[1] === 'session' ? 'job' : '',
          ]}
          items={[...generalMenu]}
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
            if (_.some(keyPath, (key) => menuInPreparation.includes(key))) {
              // setIsOpenPreparationMenuModal(true);
              // DO NOTHING
            } else {
              webuiNavigate('/' + keyPath.join('/'));
            }
          }}
        />
        <BAIMenu
          isAdminMenu={true}
          selectedKeys={[
            location.pathname.split('/')[1] || 'start',
            // TODO: After matching first path of 'storage-settings' and 'agent', remove this code
            location.pathname.split('/')[1] === 'storage-settings'
              ? 'agent'
              : '',
            // TODO: After 'SessionListPage' is completed and used as the main page, remove this code
            //       and change 'job' key to 'session'
            location.pathname.split('/')[1] === 'session' ? 'job' : '',
          ]}
          items={
            // TODO: add plugin menu
            currentUserRole === 'superadmin'
              ? [
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
                : []
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
            if (_.some(keyPath, (key) => menuInPreparation.includes(key))) {
              // DO NOTHING
            } else {
              webuiNavigate('/' + keyPath.join('/'));
            }
          }}
        />
      </BAISider>
      <ConfigProvider
        theme={{
          components: {
            Button: {
              defaultBorderColor: 'none',
              defaultColor: '#FFF6E8',
              defaultBg: token.colorPrimaryBg,
              defaultHoverColor: token.colorPrimary,
              defaultHoverBorderColor: token.colorPrimary,
            },
          },
        }}
      >
        {/* <BAIModal
          open={isOpenPreparationMenuModal}
          title={
            <Flex direction="row" align="center" gap="sm">
              <WarningOutlined
                style={{ fontSize: 24, color: token.colorPrimary }}
              />
              <Typography.Title level={4} style={{ margin: 0 }}>
                {'Work In Progress...'}
              </Typography.Title>
            </Flex>
          }
          footer={[
            <Button
              onClick={() => {
                webuiNavigate('/start');
                setIsOpenPreparationMenuModal(false);
              }}
            >
              Go Back to Start Page
            </Button>,
          ]}
        >
          <Typography.Text>
            {
              'Currently this page is working in progress. Please click the button below.'
            }
          </Typography.Text>
        </BAIModal> */}
      </ConfigProvider>
    </>
  );
};
export default WebUISider;
