import { filterEmptyItem } from '../../helper';
import { useCustomThemeConfig } from '../../helper/customThemeConfig';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../../hooks';
import { useCurrentUserRole } from '../../hooks/backendai';
import { useBAISettingUserState } from '../../hooks/useBAISetting';
import usePrimaryColors from '../../hooks/usePrimaryColors';
import EndpointsIcon from '../BAIIcons/EndpointsIcon';
import ExampleStartIcon from '../BAIIcons/ExampleStart';
import ModelStoreIcon from '../BAIIcons/ModelStoreIcon';
import MyEnvironmentsIcon from '../BAIIcons/MyEnvironmentsIcon';
import PipelinesIcon from '../BAIIcons/PipelinesIcon';
import SessionsIcon from '../BAIIcons/SessionsIcon';
import BAIMenu from '../BAIMenu';
import BAISider, { BAISiderProps } from '../BAISider';
import Flex from '../Flex';
import ThemeReverseProvider from '../ReverseThemeProvider';
import SiderToggleButton from '../SiderToggleButton';
import SignoutModal from '../SignoutModal';
import WebUILink from '../WebUILink';
import { PluginPage, WebUIPluginType } from './MainLayout';
import {
  ApiOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  CloudUploadOutlined,
  ControlOutlined,
  DashboardOutlined,
  FileDoneOutlined,
  HddOutlined,
  InfoCircleOutlined,
  MessageOutlined,
  PlayCircleOutlined,
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
import { MenuItemType } from 'antd/lib/menu/interface';
import _ from 'lodash';
import { BotMessageSquare, ExternalLinkIcon, LinkIcon } from 'lucide-react';
import React, { ReactNode, useContext, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

type MenuItem = {
  label: ReactNode;
  icon: React.ReactNode;
  group?: string;
  key: string;
};
interface WebUISiderProps
  extends Pick<
    BAISiderProps,
    'collapsed' | 'collapsedWidth' | 'onBreakpoint' | 'onCollapse'
  > {
  webuiplugins?: WebUIPluginType;
}

type GroupName =
  | 'none'
  | 'playground'
  | 'storage'
  | 'workload'
  | 'service'
  | 'metrics'
  | 'mlops';

export type MenuKeys =
  // generalMenu keys
  | 'start'
  | 'dashboard'
  | 'summary'
  | 'job'
  | 'serving'
  | 'model-store'
  | 'ai-agent'
  | 'chat'
  | 'import'
  | 'data'
  | 'my-environment'
  | 'agent-summary'
  | 'statistics'
  | 'pipeline'
  // adminMenu keys
  | 'credential'
  | 'environment'
  | 'resource-policy'
  // superAdminMenu keys
  | 'agent'
  | 'settings'
  | 'maintenance'
  | 'information';

interface WebUIGeneralMenuItemType extends MenuItemType {
  group: GroupName;
  key: MenuKeys;
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
  const supportServing = baiClient?.supports('model-serving') ?? false;
  const supportUserCommittedImage =
    baiClient?.supports('user-committed-image') ?? false;

  const [isOpenSignoutModal, { toggle: toggleSignoutModal }] = useToggle(false);

  const siderRef = useRef<HTMLDivElement>(null);
  const isSiderHover = useHover(siderRef);
  const gridBreakpoint = Grid.useBreakpoint();
  const primaryColors = usePrimaryColors();

  const [experimentalNeoSessionList] = useBAISettingUserState(
    'experimental_neo_session_list',
  );
  const [experimentalAIAgents] = useBAISettingUserState(
    'experimental_ai_agents',
  );
  const [experimentalDashboard] = useBAISettingUserState(
    'experimental_dashboard',
  );
  const generalMenu = filterEmptyItem<WebUIGeneralMenuItemType>([
    /*
    {
      label: <WebUILink to="/start">{t('webui.menu.Start')}</WebUILink>,
      icon: <PlayCircleOutlined style={{ color: token.colorPrimary }} />,
      key: 'start',
      group: 'none',
    },
    experimentalDashboard && {
      label: <WebUILink to="/dashboard">{t('webui.menu.Dashboard')}</WebUILink>,
      icon: <DashboardOutlined style={{ color: token.colorPrimary }} />,
      key: 'dashboard',
      group: 'none',
    },
    !experimentalDashboard && {
      label: <WebUILink to="/summary">{t('webui.menu.Summary')}</WebUILink>,
      icon: <DashboardOutlined style={{ color: token.colorPrimary }} />,
      key: 'summary',
      group: 'none',
      label: (
        <WebUILink to="/playground">{t('webui.menu.Playground')}</WebUILink>
      ),
      icon: <MessageOutlined style={{ color: token.colorPrimary }} />,
      key: 'playground',
    },
    */
    {
      label: <WebUILink to="/chat">{t('webui.menu.Chat')}</WebUILink>,
      icon: <MessageOutlined style={{ color: token.colorPrimary }} />,
      key: 'chat',
    },
    {
      label: (
        <WebUILink to="/model-store">{t('webui.menu.ModelStore')}</WebUILink>
      ),
      icon: <AppstoreOutlined style={{ color: token.colorPrimary }} />,
      key: 'model-store',
    },
    supportServing && {
      label: (
        <WebUILink to="/serving">{t('modelserving.menu.MyServices')}</WebUILink>
      ),
      icon: <EndpointsIcon style={{ color: token.colorPrimary }} />,
      key: 'serving',
      group: 'service',
    },
    {
      label: <WebUILink to="/model-store">{t('data.ModelStore')}</WebUILink>,
      icon: <ModelStoreIcon style={{ color: token.colorPrimary }} />,
      key: 'model-store',
      group: 'service',
    },
    experimentalAIAgents && {
      label: <WebUILink to="/ai-agent">{t('webui.menu.AIAgents')}</WebUILink>,
      icon: <BotMessageSquare style={{ color: token.colorPrimary }} />,
      key: 'ai-agent',
      group: 'playground',
    },
    /*
    {
      label: <WebUILink to="/chat">{t('webui.menu.Chat')}</WebUILink>,
      icon: <MessageOutlined style={{ color: token.colorPrimary }} />,
      key: 'chat',
      group: 'playground',
    },
    {
      label: <WebUILink to="/import">{t('webui.menu.Import&Run')}</WebUILink>,
      icon: <ExampleStartIcon style={{ color: token.colorPrimary }} />,
      key: 'import',
      group: 'workload',
    },
    {
      label: <WebUILink to="/data">{t('webui.menu.Data')}</WebUILink>,
      icon: <CloudUploadOutlined style={{ color: token.colorPrimary }} />,
      key: 'data',
      group: 'storage',
    },
    supportUserCommittedImage && {
      label: (
        <WebUILink to="/my-environment">
          {t('webui.menu.MyEnvironments')}
        </WebUILink>
      ),
      icon: <MyEnvironmentsIcon style={{ color: token.colorPrimary }} />,
      key: 'my-environment',
      group: 'workload',
    },
    !isHideAgents && {
      label: (
        <WebUILink to="/agent-summary">
          {t('webui.menu.AgentSummary')}
        </WebUILink>
      ),
      icon: <HddOutlined style={{ color: token.colorPrimary }} />,
      key: 'agent-summary',
      group: 'metrics',
    },
    {
      label: (
        <WebUILink to="/statistics">{t('webui.menu.Statistics')}</WebUILink>
      ),
      icon: <BarChartOutlined style={{ color: token.colorPrimary }} />,
      key: 'statistics',
      group: 'metrics',
    },
    !!fasttrackEndpoint && {
      label: t('webui.menu.FastTrack'),
      icon: <PipelinesIcon style={{ color: token.colorPrimary }} />,
      key: 'pipeline',
      onClick: () => {
        window.open(fasttrackEndpoint, '_blank', 'noopener noreferrer');
      },
      group: 'mlops',
    },
    */
  ]);

  const adminMenu: MenuProps['items'] = [];
  /*[
    {
      label: <WebUILink to="/credential">{t('webui.menu.Users')}</WebUILink>,
      icon: <UserOutlined style={{ color: token.colorInfo }} />,
      key: 'credential',
    },
    {
      label: (
        <WebUILink to="/environment">{t('webui.menu.Environments')}</WebUILink>
      ),
      icon: <FileDoneOutlined style={{ color: token.colorInfo }} />,
      key: 'environment',
    },
    {
      label: (
        <WebUILink to="/resource-policy">
          {t('webui.menu.ResourcePolicy')}
        </WebUILink>
      ),
      icon: <SolutionOutlined style={{ color: token.colorInfo }} />,
      key: 'resource-policy',
    },
  ];
  */

  const superAdminMenu: MenuProps['items'] = [];
  /*[
    {
      label: <WebUILink to="/agent">{t('webui.menu.Resources')}</WebUILink>,
      icon: <HddOutlined style={{ color: token.colorInfo }} />,
      key: 'agent',
    },
    {
      label: (
        <WebUILink to="/settings">{t('webui.menu.Configurations')}</WebUILink>
      ),
      icon: <ControlOutlined style={{ color: token.colorInfo }} />,
      key: 'settings',
    },
    {
      label: (
        <WebUILink to="/maintenance">{t('webui.menu.Maintenance')}</WebUILink>
      ),
      icon: <ToolOutlined style={{ color: token.colorInfo }} />,
      key: 'maintenance',
    },
    {
      label: (
        <WebUILink to="/information">{t('webui.menu.Information')}</WebUILink>
      ),
      icon: <InfoCircleOutlined style={{ color: token.colorInfo }} />,
      key: 'information',
    },
  ]*/ const pluginMap: Record<string, MenuProps['items']> = {
    'menuitem-user': generalMenu,
    'menuitem-admin': adminMenu,
    'menuitem-superadmin': superAdminMenu,
  };

  const pluginIconMap: {
    [key: string]: React.ReactNode;
  } = {
    link: <LinkIcon />,
    externalLink: <ExternalLinkIcon />,
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
            label: <WebUILink to={`/${page?.url}`}>{page?.menuitem}</WebUILink>,
            icon: pluginIconMap[page.icon || ''] || <ApiOutlined />,
            key: page?.url,
            group: page.group || 'none',
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

  const aliasGroupNameMap: {
    [key in GroupName]: string;
  } = {
    none: '',
    storage: t('webui.menu.groupName.Storage'),
    workload: t('webui.menu.groupName.Workload'),
    playground: t('webui.menu.groupName.Playground'),
    service: t('webui.menu.groupName.Service'),
    mlops: t('webui.menu.groupName.Mlops'),
    metrics: t('webui.menu.groupName.Metrics'),
  };
  const groupedGeneralMenu = _.chain(generalMenu)
    .groupBy('group')
    .map((items, group) => {
      if (group === 'none') {
        return items;
      }
      return {
        type: 'group',
        name: group,
        label: (
          <Flex
            style={{
              borderBottom: `1px solid ${token.colorBorder}`,
            }}
          >
            {!props.collapsed && (
              <Typography.Text type="secondary" ellipsis>
                {aliasGroupNameMap[group as GroupName]}
              </Typography.Text>
            )}
          </Flex>
        ),
        children: items,
      };
    })
    .sort((a, b) => {
      const order: Array<GroupName> = [
        'none',
        'storage',
        'workload',
        'playground',
        'service',
        'mlops',
        'metrics',
      ];
      // @ts-ignore
      return order.indexOf(a.name) - order.indexOf(b.name);
    })
    .flatten()
    .value();

  return (
    <BAISider
      className="webui-sider"
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
          onClick={() => webuiNavigate(themeConfig?.logo?.href || '/chat')}
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
          onClick={() => webuiNavigate(themeConfig?.logo?.href || '/chat')}
        />
      }
      {...props}
    >
      <SiderToggleButton
        collapsed={props.collapsed}
        buttonTop={68}
        // buttonTop={18}
        onClick={(collapsed) => {
          props.onCollapse?.(collapsed, 'clickTrigger');
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
            location.pathname.split('/')[1] || 'start',
            // TODO: After matching first path of 'storage-settings' and 'agent', remove this code
            location.pathname.split('/')[1] === 'storage-settings'
              ? 'agent'
              : '',
            // TODO: After 'SessionListPage' is completed and used as the main page, remove this code
            //       and change 'job' key to 'session'
            location.pathname.split('/')[1] === 'session' ? 'job' : '',
          ]}
          // @ts-ignore
          items={groupedGeneralMenu}
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
                /*
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
                    */
                []
              }
            />
          </ConfigProvider>
        )}
      </Flex>
      {props.collapsed ? null : (
        <Flex
          justify="center"
          className="sider-footer-wrap"
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
    (isParentDark && themeConfig?.sider?.theme === 'light') ||
    (!isParentDark && themeConfig?.sider?.theme === 'dark');

  return shouldReverse ? (
    <ThemeReverseProvider>
      <WebUISider {...props} />
    </ThemeReverseProvider>
  ) : (
    <WebUISider {...props} />
  );
};

export default WebUISiderWithCustomTheme;
