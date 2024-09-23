import { filterEmptyItem } from '../../helper';
import { useCustomThemeConfig } from '../../helper/customThemeConfig';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../../hooks';
import { useCurrentUserRole } from '../../hooks/backendai';
import usePrimaryColors from '../../hooks/usePrimaryColors';
import EndpointsIcon from '../BAIIcons/EndpointsIcon';
import MyEnvironmentsIcon from '../BAIIcons/MyEnvironmentsIcon';
import SessionsIcon from '../BAIIcons/SessionsIcon';
import BAIMenu from '../BAIMenu';
import BAISider, { BAISiderProps } from '../BAISider';
import Flex from '../Flex';
import ReverseThemeProvider from '../ReverseThemeProvider';
import SiderToggleButton from '../SiderToggleButton';
import SignoutModal from '../SignoutModal';
import WebUILink from '../WebUILink';
import { PluginPage, WebUIPluginType } from './MainLayout';
import {
  ApiOutlined,
  BarChartOutlined,
  BarsOutlined,
  CloudUploadOutlined,
  ControlOutlined,
  DashboardOutlined,
  ExportOutlined,
  FileDoneOutlined,
  HddOutlined,
  InfoCircleOutlined,
  RocketOutlined,
  SolutionOutlined,
  ToolOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useHover, useToggle } from 'ahooks';
import {
  theme,
  MenuProps,
  Typography,
  ConfigProvider,
  Divider,
  Grid,
} from 'antd';
import { ItemType } from 'antd/lib/menu/interface';
import _ from 'lodash';
import { PlayIcon } from 'lucide-react';
import React, { useContext, useRef } from 'react';
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
  onCollapse?: (collapsed: boolean) => void;
}
const WebUISider: React.FC<WebUISiderProps> = (props) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const themeConfig = useCustomThemeConfig();

  const config = useContext(ConfigProvider.ConfigContext);
  const currentSiderTheme =
    config.theme?.algorithm === theme.darkAlgorithm ? 'dark' : 'light';

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

  const siderRef = useRef<HTMLDivElement>(null);
  const isSiderHover = useHover(siderRef);
  const gridBreakpoint = Grid.useBreakpoint();
  const primaryColors = usePrimaryColors();

  const generalMenu = filterEmptyItem<ItemType>([
    // {
    //   label: t('webui.menu.Summary'),
    //   icon: <DashboardOutlined />,
    //   key: 'summary',
    // },
    // {
    //   label: t('webui.menu.Sessions'),
    //   icon: <BarsOutlined />,
    //   key: 'job',
    // },
    {
      label: t('modelserving.menu.ModelList'), //t('webui.menu.Data&Storage'),
      icon: <BarsOutlined />, // <CloudUploadOutlined />,
      key: 'data',
    },
    supportServing && {
      label: t('modelserving.menu.ModelServices'), //t('webui.menu.Serving'),
      icon: <RocketOutlined />,
      key: 'serving',
    },
    // {
    //   label: t('webui.menu.Import&Run'),
    //   icon: <PlayIcon />,
    //   key: 'import',
    // },

    // supportUserCommittedImage && {
    //   label: t('webui.menu.MyEnvironments'),
    //   icon: <FileDoneOutlined />,
    //   key: 'my-environment',
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
    // !!fasttrackEndpoint && {
    //   label: t('webui.menu.FastTrack'),
    //   icon: <ExportOutlined />,
    //   key: 'pipeline',
    //   onClick: () => {
    //     window.open(fasttrackEndpoint, '_blank', 'noopener noreferrer');
    //   },
    // },
  ]);

  const adminMenu: MenuProps['items'] = [
    // {
    //   label: t('webui.menu.Users'),
    //   icon: <UserOutlined />,
    //   key: 'credential',
    // },
    // {
    //   label: t('webui.menu.Environments'),
    //   icon: <FileDoneOutlined />,
    //   key: 'environment',
    // },
    // {
    //   label: t('webui.menu.ResourcePolicy'),
    //   icon: <SolutionOutlined />,
    //   key: 'resource-policy',
    // },
  ];

  const superAdminMenu: MenuProps['items'] = [
    // {
    //   label: t('webui.menu.Resources'),
    //   icon: <HddOutlined />,
    //   key: 'agent',
    // },
    // {
    //   label: t('webui.menu.Configurations'),
    //   icon: <ControlOutlined />,
    //   key: 'settings',
    // },
    // {
    //   label: t('webui.menu.Maintenance'),
    //   icon: <ToolOutlined />,
    //   key: 'maintenance',
    // },
    // {
    //   label: t('webui.menu.Information'),
    //   icon: <InfoCircleOutlined />,
    //   key: 'information',
    // },
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
      ref={siderRef}
      logo={
        <img
          className="logo-wide"
          alt={themeConfig?.logo?.alt || 'Backend.AI Logo'}
          src={
            currentSiderTheme === 'dark' && themeConfig?.logo?.srcDark
              ? themeConfig?.logo?.srcDark ||
                '/manifest/backend.ai-white-text.svg'
              : themeConfig?.logo?.src || '/manifest/backend.ai-white-text.svg'
          }
          style={{
            width: themeConfig?.logo?.size?.width || 159,
            height: themeConfig?.logo?.size?.height || 24,
            cursor: 'pointer',
          }}
          onClick={() => webuiNavigate(themeConfig?.logo?.href || '/serving')}
        />
      }
      theme={currentSiderTheme}
      logoCollapsed={
        <img
          className="logo-collapsed"
          alt={themeConfig?.logo?.alt || 'Backend.AI Logo'}
          src={
            currentSiderTheme === 'dark' && themeConfig?.logo?.srcCollapsedDark
              ? themeConfig?.logo?.srcCollapsedDark ||
                '/manifest/backend.ai-brand-simple-bgdark.svg'
              : themeConfig?.logo?.srcCollapsed ||
                '/manifest/backend.ai-brand-simple.svg'
          }
          style={{
            width: themeConfig?.logo.sizeCollapsed?.width ?? 24,
            height: themeConfig?.logo.sizeCollapsed?.height ?? 24,
            cursor: 'pointer',
          }}
          onClick={() => webuiNavigate(themeConfig?.logo?.href || '/data')}
        />
      }
      logoTitle={
        themeConfig?.logo?.logoTitle || siteDescription || 'Model Player'
      }
      logoTitleCollapsed={
        themeConfig?.logo?.logoTitleCollapsed ||
        siteDescription ||
        'Model Player'
      }
      {...props}
    >
      <SiderToggleButton
        collapsed={props.collapsed}
        buttonTop={68}
        // buttonTop={18}
        onClick={(collapsed) => {
          props.onCollapse?.(collapsed);
        }}
        hidden={!gridBreakpoint.sm || !isSiderHover}
      />
      <Flex
        direction="column"
        align="stretch"
        justify="start"
        style={{
          flex: 1,
          overflowY: 'auto',
          paddingTop: token.paddingLG,
          paddingBottom: token.paddingSM,
        }}
      >
        <BAIMenu
          collapsed={props.collapsed}
          selectedKeys={[
            location.pathname.split('/')[1] || 'summary',
            // TODO: After matching first path of 'storage-settings' and 'agent', remove this code
            location.pathname.split('/')[1] === 'storage-settings'
              ? 'agent'
              : '',
            // TODO: After 'SessionListPage' is completed and used as the main page, remove this code
            //       and change 'job' key to 'session'
            location.pathname.split('/')[1] === 'session' ? 'job' : '',
          ]}
          items={generalMenu}
        />
        {(currentUserRole === 'superadmin' || currentUserRole === 'admin') && (
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: primaryColors.admin,
              },
            }}
          >
            <BAIMenu
              collapsed={props.collapsed}
              selectedKeys={[
                location.pathname.split('/')[1] || 'summary',
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
                        children: [...adminMenu, ...superAdminMenu],
                      },
                    ]
                  : currentUserRole === 'admin'
                    ? [
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
            />
          </ConfigProvider>
        )}
      </Flex>
      {props.collapsed ? null : (
        <Flex
          justify="center"
          direction="column"
          style={{
            width: '100%',
            padding: 30,
            paddingTop: 0,
            textAlign: 'center',
          }}
        >
          <Typography.Text
            type="secondary"
            style={{
              fontSize: '12px',
              wordBreak: 'normal',
            }}
          >
            <div className="terms-of-use">
              <Divider style={{ marginTop: 0, marginBottom: token.margin }} />
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
          </Typography.Text>
        </Flex>
      )}
    </BAISider>
  );
};

const WebUISiderWithCustomTheme: React.FC<WebUISiderProps> = (props) => {
  const themeConfig = useCustomThemeConfig();
  const config = useContext(ConfigProvider.ConfigContext);
  const isParentDark = config.theme?.algorithm === theme.darkAlgorithm;

  const shouldReverse =
    (isParentDark && themeConfig.sider?.theme === 'light') ||
    (!isParentDark && themeConfig.sider?.theme === 'dark');

  return shouldReverse ? (
    <ReverseThemeProvider>
      <WebUISider {...props} />
    </ReverseThemeProvider>
  ) : (
    <WebUISider {...props} />
  );
};

export default WebUISiderWithCustomTheme;
