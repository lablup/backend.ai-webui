import { useSuspendedBackendaiClient } from '../../hooks';
import { useCurrentUserRole } from '../../hooks/backendai';
import { useBAISettingUserState } from '../../hooks/useBAISetting';
import usePrimaryColors from '../../hooks/usePrimaryColors';
import BAIMenu from '../BAIMenu';
import BaseWebUISider, {
  BaseWebUISiderProps,
  MenuItem,
} from '../BaseWebUISider';
import WebUILink from '../WebUILink';
import { PluginPage, WebUIPluginType } from './MainLayout';
import {
  ApiOutlined,
  BarChartOutlined,
  CloudUploadOutlined,
  DashboardOutlined,
  HddOutlined,
  MessageOutlined,
  PlayCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { theme, MenuProps, Typography, ConfigProvider } from 'antd';
import { MenuItemType } from 'antd/lib/menu/interface';
import {
  filterOutEmpty,
  BAIEndpointsIcon,
  BAIModelStoreIcon,
  BAIMyEnvironmentsIcon,
  BAIPipelinesIcon,
  BAISessionsIcon,
  BAIFlex,
} from 'backend.ai-ui';
import _ from 'lodash';
import { BotMessageSquare, ExternalLinkIcon, LinkIcon } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

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
  | 'data'
  | 'my-environment'
  | 'agent-summary'
  | 'statistics'
  | 'pipeline'
  // adminMenu keys
  | 'credential'
  | 'environment'
  | 'scheduler'
  | 'resource-policy'
  | 'reservoir'
  // superAdminMenu keys
  | 'admin-dashboard'
  | 'agent'
  | 'settings'
  | 'maintenance'
  | 'information';

interface WebUIGeneralMenuItemType extends MenuItemType {
  group: GroupName;
  key: MenuKeys;
}

interface WebUISiderProps extends BaseWebUISiderProps {
  webuiplugins?: WebUIPluginType;
}

const WebUISider: React.FC<WebUISiderProps> = (props) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const currentUserRole = useCurrentUserRole();
  const location = useLocation();
  const baiClient = useSuspendedBackendaiClient();
  const primaryColors = usePrimaryColors();

  const isHideAgents = baiClient?._config?.hideAgents ?? true;
  const fasttrackEndpoint = baiClient?._config?.fasttrackEndpoint ?? null;
  const blockList = baiClient?._config?.blockList ?? null;
  const inactiveList = baiClient?._config?.inactiveList ?? null;

  const [classic_session_list] = useBAISettingUserState('classic_session_list');
  const [experimentalAIAgents] = useBAISettingUserState(
    'experimental_ai_agents',
  );
  const [isClassicDashboardPage] = useBAISettingUserState(
    'classic_dashboard_page',
  );

  const generalMenu = filterOutEmpty<WebUIGeneralMenuItemType>([
    {
      label: <WebUILink to="/start">{t('webui.menu.Start')}</WebUILink>,
      icon: <PlayCircleOutlined style={{ color: token.colorPrimary }} />,
      key: 'start',
      group: 'none',
    },
    !isClassicDashboardPage && {
      label: <WebUILink to="/dashboard">{t('webui.menu.Dashboard')}</WebUILink>,
      icon: <DashboardOutlined style={{ color: token.colorPrimary }} />,
      key: 'dashboard',
      group: 'none',
    },
    isClassicDashboardPage && {
      label: <WebUILink to="/summary">{t('webui.menu.Summary')}</WebUILink>,
      icon: <DashboardOutlined style={{ color: token.colorPrimary }} />,
      key: 'summary',
      group: 'none',
    },
    {
      label: (
        <WebUILink to={classic_session_list ? '/job' : '/session'}>
          {t('webui.menu.Sessions')}
        </WebUILink>
      ),
      icon: <BAISessionsIcon style={{ color: token.colorPrimary }} />,
      key: 'job',
      group: 'workload',
    },
    {
      label: <WebUILink to="/serving">{t('webui.menu.Serving')}</WebUILink>,
      icon: <BAIEndpointsIcon style={{ color: token.colorPrimary }} />,
      key: 'serving',
      group: 'service',
    },
    {
      label: <WebUILink to="/model-store">{t('data.ModelStore')}</WebUILink>,
      icon: <BAIModelStoreIcon style={{ color: token.colorPrimary }} />,
      key: 'model-store',
      group: 'service',
    },
    experimentalAIAgents && {
      label: <WebUILink to="/ai-agent">{t('webui.menu.AIAgents')}</WebUILink>,
      icon: <BotMessageSquare style={{ color: token.colorPrimary }} />,
      key: 'ai-agent',
      group: 'playground',
    },
    {
      label: <WebUILink to="/chat">{t('webui.menu.Chat')}</WebUILink>,
      icon: <MessageOutlined style={{ color: token.colorPrimary }} />,
      key: 'chat',
      group: 'playground',
    },
    {
      label: <WebUILink to="/data">{t('webui.menu.Data')}</WebUILink>,
      icon: <CloudUploadOutlined style={{ color: token.colorPrimary }} />,
      key: 'data',
      group: 'storage',
    },
    {
      label: (
        <WebUILink to="/my-environment">
          {t('webui.menu.MyEnvironments')}
        </WebUILink>
      ),
      icon: <BAIMyEnvironmentsIcon style={{ color: token.colorPrimary }} />,
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
      icon: <BAIPipelinesIcon style={{ color: token.colorPrimary }} />,
      key: 'pipeline',
      onClick: () => {
        window.open(fasttrackEndpoint, '_blank', 'noopener noreferrer');
      },
      group: 'mlops',
    },
  ]);

  const adminMenu: MenuProps['items'] = filterOutEmpty([
    {
      label: <WebUILink to="/credential">{t('webui.menu.Settings')}</WebUILink>,
      icon: <SettingOutlined style={{ color: token.colorInfo }} />,
      key: 'admin-settings',
    },
  ]);

  const pluginMap: Record<string, MenuProps['items']> = {
    'menuitem-user': generalMenu,
  };

  const pluginIconMap: {
    [key: string]: React.ReactNode;
  } = {
    link: <LinkIcon />,
    externalLink: <ExternalLinkIcon />,
  };

  // Add plugin pages according to the user role.
  // Iterates over own enumerable string keyed properties of an object and invokes iteratee for each property.
  // Only menu items for 'menuitem-user' are added here.
  _.forOwn(props.webuiplugins, (value, key) => {
    // Check if the `pluginMap` object has the current key using the `_.has` function.
    if (_.has(pluginMap, key)) {
      const menu = pluginMap[key as keyof typeof pluginMap] as MenuItem[];
      const pluginPages = props?.webuiplugins?.page;
      _.map(value, (name) => {
        // Find page item belonging to each of menuitem-user in webuiplugins.page
        const page = _.find(pluginPages, { name: name }) as PluginPage;
        // if menuitem is empty, skip adding menu item
        if (page && page.menuitem) {
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

  _.forEach([generalMenu, adminMenu], (menu) => {
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
          <BAIFlex
            style={{
              borderBottom: `1px solid ${token.colorBorder}`,
            }}
          >
            {!props.collapsed && (
              <Typography.Text type="secondary" ellipsis>
                {aliasGroupNameMap[group as GroupName] ?? group}
              </Typography.Text>
            )}
          </BAIFlex>
        ),
        children: items,
      };
    })
    .flatten()
    .sort((a, b) => {
      const groupOrder: Array<GroupName | undefined> = [
        undefined,
        'none',
        'storage',
        'workload',
        'playground',
        'service',
        'mlops',
        'metrics',
      ];

      const getWeight = (item: any) => {
        if (item?.type !== 'group') return -1;
        const idx = groupOrder.indexOf(item.name as GroupName | undefined);
        return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
      };

      return getWeight(a) - getWeight(b);
    })
    .value();

  return (
    <BaseWebUISider {...props} className="webui-sider">
      <BAIMenu
        collapsed={props.collapsed}
        selectedKeys={[
          location.pathname.split('/')[1] || 'start',
          location.pathname.split('/')[1] === 'storage-settings' ? 'agent' : '',
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
              location.pathname.split('/')[1] === 'storage-settings'
                ? 'agent'
                : '',
              location.pathname.split('/')[1] === 'session' ? 'job' : '',
            ]}
            items={
              currentUserRole === 'superadmin' || currentUserRole === 'admin'
                ? [
                    {
                      type: 'group',
                      label: (
                        <BAIFlex
                          style={{
                            borderBottom: `1px solid ${token.colorBorder}`,
                          }}
                        >
                          {!props.collapsed && (
                            <Typography.Text type="secondary" ellipsis>
                              {t('webui.menu.Administration')}
                            </Typography.Text>
                          )}
                        </BAIFlex>
                      ),
                      children: [...adminMenu],
                    },
                  ]
                : []
            }
          />
        </ConfigProvider>
      )}
    </BaseWebUISider>
  );
};

export default WebUISider;
