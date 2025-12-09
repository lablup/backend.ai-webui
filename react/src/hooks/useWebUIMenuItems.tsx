import { useSuspendedBackendaiClient } from '.';
import { useBAISettingUserState } from './useBAISetting';
import { PluginPage, useWebUIPluginValue } from './useWebUIPluginState';
import {
  PlayCircleOutlined,
  DashboardOutlined,
  MessageOutlined,
  CloudUploadOutlined,
  HddOutlined,
  BarChartOutlined,
  UserOutlined,
  FileDoneOutlined,
  SolutionOutlined,
  ControlOutlined,
  ToolOutlined,
  InfoCircleOutlined,
  ApiOutlined,
} from '@ant-design/icons';
import { MenuProps, theme, Typography } from 'antd';
import { MenuItemType } from 'antd/lib/menu/interface';
import {
  BAIEndpointsIcon,
  BAIFlex,
  BAIModelStoreIcon,
  BAIMyEnvironmentsIcon,
  BAIPipelinesIcon,
  BAISessionsIcon,
  filterOutEmpty,
} from 'backend.ai-ui';
import { t } from 'i18next';
import _ from 'lodash';
import {
  BotMessageSquare,
  ClipboardClock,
  PackagePlus,
  LinkIcon,
  ExternalLinkIcon,
} from 'lucide-react';
import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import WebUILink from 'src/components/WebUILink';

export type MenuGroupName =
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

type MenuItem = {
  label: ReactNode;
  icon: React.ReactNode;
  group?: string;
  key: string;
};

interface WebUIGeneralMenuItemType extends MenuItemType {
  group: MenuGroupName;
  key: MenuKeys;
}

export interface UseWebUIMenuItemsProps {
  hideGroupName?: boolean;
}

export const useWebUIMenuItems = ({
  hideGroupName,
}: UseWebUIMenuItemsProps) => {
  'use memo';

  const plugins = useWebUIPluginValue();

  const location = useLocation();
  const baiClient = useSuspendedBackendaiClient();
  const isHideAgents = baiClient?._config?.hideAgents ?? true;
  const fasttrackEndpoint = baiClient?._config?.fasttrackEndpoint ?? null;
  const blockList = baiClient?._config?.blockList ?? null;
  const inactiveList = baiClient?._config?.inactiveList ?? null;
  const { token } = theme.useToken();

  const [experimentalAIAgents] = useBAISettingUserState(
    'experimental_ai_agents',
  );

  const generalMenu = filterOutEmpty<WebUIGeneralMenuItemType>([
    {
      label: <WebUILink to="/start">{t('webui.menu.Start')}</WebUILink>,
      icon: <PlayCircleOutlined style={{ color: token.colorPrimary }} />,
      key: 'start',
      group: 'none',
    },
    {
      label: <WebUILink to="/dashboard">{t('webui.menu.Dashboard')}</WebUILink>,
      icon: <DashboardOutlined style={{ color: token.colorPrimary }} />,
      key: 'dashboard',
      group: 'none',
    },
    {
      label: <WebUILink to={'/session'}>{t('webui.menu.Sessions')}</WebUILink>,
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
    // TODO: Enable the menu item when the page is ready.
    // WARN: Currently only superadmins can access AdminDashboardPage.
    // To place the Admin Dashboard menu item at the top of adminMenu,
    // add it to adminMenu instead of superAdminMenu:
    // currentUserRole === 'superadmin' && {
    //   label: (
    //     <WebUILink to="/admin-dashboard">
    //       {t('webui.menu.AdminDashboard')}
    //     </WebUILink>
    //   ),
    //   icon: <DashboardOutlined style={{ color: token.colorInfo }} />,
    //   key: 'admin-dashboard',
    // },
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
    baiClient?.supports('pending-session-list') && {
      label: <WebUILink to="/scheduler">{t('webui.menu.Scheduler')}</WebUILink>,
      icon: <ClipboardClock style={{ color: token.colorInfo }} />,
      key: 'scheduler',
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
    baiClient?.supports('reservoir') &&
      baiClient?._config.enableReservoir && {
        label: (
          <WebUILink to="/reservoir">{t('webui.menu.Reservoir')}</WebUILink>
        ),
        icon: <PackagePlus style={{ color: token.colorInfo }} />,
        key: 'reservoir',
      },
  ]);

  const superAdminMenu: MenuProps['items'] = filterOutEmpty([
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
  ]);

  const pluginMap: Record<string, MenuProps['items']> = {
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
  _.forOwn(plugins, (value, key) => {
    // Check if the `pluginMap` object has the current key using the `_.has` function.
    if (_.has(pluginMap, key)) {
      const menu = pluginMap[key as keyof typeof pluginMap] as MenuItem[];
      const pluginPages = plugins?.page;
      _.map(value, (name) => {
        // Find page item belonging to each of menuitem-user, menuitem-admin, menuitem-superadmin in webuiplugins.page
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
    [key in MenuGroupName]: string;
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
            {!hideGroupName && (
              <Typography.Text type="secondary" ellipsis>
                {aliasGroupNameMap[group as MenuGroupName] ?? group}
              </Typography.Text>
            )}
          </BAIFlex>
        ),
        children: items,
      };
    })
    .flatten()
    .sort((a, b) => {
      const groupOrder: Array<MenuGroupName | undefined> = [
        undefined,
        'none',
        'storage',
        'workload',
        'playground',
        'service',
        'mlops',
        'metrics',
      ];

      // if item is not group type, place it at the beginning
      // if item is group type but not in the groupOrder, place it at the end
      const getWeight = (item: any) => {
        if (item?.type !== 'group') return -1; // non-group items first
        const idx = groupOrder.indexOf(item.name as MenuGroupName | undefined);
        return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
      };

      return getWeight(a) - getWeight(b);
    })
    .value();

  const isSelectedAdminCategoryMenu =
    _.some([...adminMenu, ...superAdminMenu], (item) => {
      if (item && 'key' in item) {
        return item.key === location.pathname.split('/')[1];
      }
      return false;
    }) || 'storage-settings' === location.pathname.split('/')[1];

  return {
    generalMenu,
    adminMenu,
    superAdminMenu,
    groupedGeneralMenu,
    isSelectedAdminCategoryMenu,
  };
};
