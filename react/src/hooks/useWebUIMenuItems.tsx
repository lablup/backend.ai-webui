/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '.';
import { useCurrentUserRole } from './backendai';
import { useBAISettingUserState } from './useBAISetting';
import { useCustomThemeConfig } from './useCustomThemeConfig';
import {
  PluginPage,
  useWebUIPluginLoadedValue,
  useWebUIPluginValue,
} from './useWebUIPluginState';
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
  TeamOutlined,
} from '@ant-design/icons';
import { useSessionStorageState } from 'ahooks';
import { type MenuProps, theme, Typography } from 'antd';
import { GetProp } from 'antd/lib';
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
import _ from 'lodash';
import {
  BotMessageSquare,
  ClipboardClock,
  PackagePlus,
  LinkIcon,
  ExternalLinkIcon,
  Palette,
} from 'lucide-react';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import WebUILink from 'src/components/WebUILink';
import { ROUTER_STATIC_PATHS, ROUTER_DYNAMIC_PATTERNS } from 'src/routes';

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
  | 'summary' // 'alias to dashboard' for backward compatibility
  | 'session'
  | 'job' // 'alias to session' for backward compatibility
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
  | 'admin-session'
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
  | 'branding'
  | 'information';

// Convert menu key to URL path
// Most keys map directly to /${key}, with exceptions for backward compatibility
export const getPathFromMenuKey = (key: MenuKeys): string => {
  // 'job' is an alias for '/session' (backward compatibility)
  if (key === 'job') return '/session';
  if (key === 'summary') return '/dashboard';
  return `/${key}`;
};

type MenuItem = {
  label: ReactNode;
  icon: React.ReactNode;
  group?: string;
  key: string;
};

interface WebUIGeneralMenuItemType extends MenuItemType {
  group: MenuGroupName;
  key: MenuKeys;
  labelText: string;
}

export interface UseWebUIMenuItemsProps {
  hideGroupName?: boolean;
}

export const useWebUIMenuItems = (props?: UseWebUIMenuItemsProps) => {
  'use memo';

  const { hideGroupName = false } = props || {};
  const plugins = useWebUIPluginValue();
  const isPluginLoaded = useWebUIPluginLoadedValue();
  const currentUserRole = useCurrentUserRole();

  const location = useLocation();
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  const isHideAgents = baiClient?._config?.hideAgents ?? true;
  const fasttrackEndpoint = baiClient?._config?.fasttrackEndpoint ?? null;
  const blockList = baiClient?._config?.blockList ?? null;
  const inactiveList = baiClient?._config?.inactiveList ?? null;
  const { token } = theme.useToken();

  const [experimentalAIAgents] = useBAISettingUserState(
    'experimental_ai_agents',
  );

  const [isThemePreviewMode] = useSessionStorageState('isThemePreviewMode', {
    defaultValue: false,
  });

  // Helper to create menu item with labelText reused in label
  const createMenuItem = (
    to: GetProp<typeof WebUILink, 'to'>,
    labelText: string,
    icon: React.ReactNode,
    key: MenuKeys,
    group: MenuGroupName,
  ): WebUIGeneralMenuItemType => ({
    label: <WebUILink to={to}>{labelText}</WebUILink>,
    icon,
    key,
    group,
    labelText,
  });

  const generalMenu = filterOutEmpty<WebUIGeneralMenuItemType>([
    createMenuItem(
      '/start',
      t('webui.menu.Start'),
      <PlayCircleOutlined style={{ color: token.colorPrimary }} />,
      'start',
      'none',
    ),
    createMenuItem(
      '/dashboard',
      t('webui.menu.Dashboard'),
      <DashboardOutlined style={{ color: token.colorPrimary }} />,
      'dashboard',
      'none',
    ),
    createMenuItem(
      '/session',
      t('webui.menu.Sessions'),
      <BAISessionsIcon style={{ color: token.colorPrimary }} />,
      'session',
      'workload',
    ),
    createMenuItem(
      '/serving',
      t('webui.menu.Serving'),
      <BAIEndpointsIcon style={{ color: token.colorPrimary }} />,
      'serving',
      'service',
    ),
    createMenuItem(
      '/model-store',
      t('data.ModelStore'),
      <BAIModelStoreIcon style={{ color: token.colorPrimary }} />,
      'model-store',
      'service',
    ),
    experimentalAIAgents &&
      createMenuItem(
        '/ai-agent',
        t('webui.menu.AIAgents'),
        <BotMessageSquare style={{ color: token.colorPrimary }} />,
        'ai-agent',
        'playground',
      ),
    createMenuItem(
      '/chat',
      t('webui.menu.Chat'),
      <MessageOutlined style={{ color: token.colorPrimary }} />,
      'chat',
      'playground',
    ),
    createMenuItem(
      '/data',
      t('webui.menu.Data'),
      <CloudUploadOutlined style={{ color: token.colorPrimary }} />,
      'data',
      'storage',
    ),
    createMenuItem(
      '/my-environment',
      t('webui.menu.MyEnvironments'),
      <BAIMyEnvironmentsIcon style={{ color: token.colorPrimary }} />,
      'my-environment',
      'workload',
    ),
    !isHideAgents &&
      createMenuItem(
        '/agent-summary',
        t('webui.menu.AgentSummary'),
        <HddOutlined style={{ color: token.colorPrimary }} />,
        'agent-summary',
        'metrics',
      ),
    createMenuItem(
      '/statistics',
      t('webui.menu.Statistics'),
      <BarChartOutlined style={{ color: token.colorPrimary }} />,
      'statistics',
      'metrics',
    ),
    !!fasttrackEndpoint && {
      label: t('webui.menu.FastTrack'),
      icon: <BAIPipelinesIcon style={{ color: token.colorPrimary }} />,
      key: 'pipeline' as MenuKeys,
      onClick: () => {
        window.open(fasttrackEndpoint, '_blank', 'noopener noreferrer');
      },
      group: 'mlops' as MenuGroupName,
      labelText: t('webui.menu.FastTrack'),
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
      label: (
        <WebUILink to="/admin-session">{t('webui.menu.Sessions')}</WebUILink>
      ),
      icon: <BAISessionsIcon style={{ color: token.colorInfo }} />,
      key: 'admin-session',
    },
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
    baiClient?.supports('fair-share-scheduling') && {
      label: <WebUILink to="/scheduler">{t('webui.menu.Scheduler')}</WebUILink>,
      icon: <ClipboardClock style={{ color: token.colorInfo }} />,
      key: 'scheduler',
    },
    {
      label: (
        <WebUILink to="/resource-policy">
          {t('webui.menu.ResourcePolicies')}
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
      label: <WebUILink to="/project">{t('webui.menu.Projects')}</WebUILink>,
      icon: <TeamOutlined style={{ color: token.colorInfo }} />,
      key: 'project',
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
    !isThemePreviewMode && {
      label: <WebUILink to="/branding">{t('webui.menu.Branding')}</WebUILink>,
      icon: <Palette style={{ color: token.colorInfo }} />,
      key: 'branding',
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

  // Get the first available menu item from groupedGeneralMenu
  // (after blocklist filtering, excluding disabled/inactive items)
  // This reflects the actual order shown in the UI
  const firstAvailableMenuItem = (() => {
    for (const item of groupedGeneralMenu) {
      // Non-group item (direct menu item)
      if (item && 'key' in item && item.key && !item.disabled) {
        return item as WebUIGeneralMenuItemType;
      }
      // Group item with children
      if (
        item &&
        'type' in item &&
        item.type === 'group' &&
        'children' in item
      ) {
        // Find first non-disabled child
        const firstActiveChild = _.find(
          item.children as Array<WebUIGeneralMenuItemType>,
          (child) => child?.key && !child.disabled,
        );
        if (firstActiveChild) {
          return firstActiveChild;
        }
      }
    }
    return null;
  })();

  // Check if current page is in blocklist
  const currentPathKey = location.pathname.split('/')[1] || '';
  const currentMenuKey = currentPathKey;
  // Root path '/' should not be blocked (it redirects to first available menu)
  const isCurrentPageBlocked =
    currentPathKey !== '' && _.includes(blockList, currentMenuKey);

  // Compute all valid paths from menu items + plugins + static routes
  const allValidPaths = (() => {
    const paths = new Set<string>();

    // Add paths from all menus
    [generalMenu, adminMenu, superAdminMenu].forEach((menu) => {
      menu?.forEach((item) => {
        if (item && 'key' in item && item.key) {
          paths.add(item.key as string);
        }
      });
    });

    // Add plugin pages
    plugins?.page?.forEach((page) => {
      if (page?.url) {
        paths.add(page.url);
      }
    });

    // Add static routes from router configuration
    ROUTER_STATIC_PATHS.forEach((route) => paths.add(route));

    return paths;
  })();

  // Check if current page matches dynamic route patterns from router configuration
  const fullPath = location.pathname.slice(1); // Remove leading '/'
  const matchesDynamicRoute = ROUTER_DYNAMIC_PATTERNS.some((pattern) =>
    pattern.test(fullPath),
  );

  // Check if current page is not found
  // Only check after plugins are loaded to avoid false positives
  const isCurrentPageNotFound = (() => {
    // Root path is always valid (redirects to first available menu)
    if (currentPathKey === '') return false;

    // If plugins haven't loaded yet, assume page is valid to prevent flickering
    if (!isPluginLoaded) return false;

    // Check if path is in valid paths set
    if (allValidPaths.has(currentPathKey)) return false;

    // Check if path matches a dynamic route pattern
    if (matchesDynamicRoute) return false;

    return true;
  })();

  // Collect admin-only and superadmin-only page keys
  const adminOnlyPageKeys = new Set(
    adminMenu
      ?.filter((item): item is MenuItemType => item !== null && 'key' in item)
      .map((item) => item.key as string) ?? [],
  );
  const superAdminOnlyPageKeys = new Set(
    superAdminMenu
      ?.filter((item): item is MenuItemType => item !== null && 'key' in item)
      .map((item) => item.key as string) ?? [],
  );

  // Check if current page requires higher permission than user has
  // - Regular users cannot access admin or superadmin pages
  // - Admin users cannot access superadmin-only pages
  const isCurrentPageUnauthorized = (() => {
    if (currentPathKey === '') return false;

    const isAdminOnlyPage = adminOnlyPageKeys.has(currentMenuKey);
    const isSuperAdminOnlyPage = superAdminOnlyPageKeys.has(currentMenuKey);

    // Regular users (not admin, not superadmin) cannot access admin or superadmin pages
    if (
      currentUserRole !== 'admin' &&
      currentUserRole !== 'superadmin' &&
      (isAdminOnlyPage || isSuperAdminOnlyPage)
    ) {
      return true;
    }

    // Admin users cannot access superadmin-only pages
    if (currentUserRole === 'admin' && isSuperAdminOnlyPage) {
      return true;
    }

    return false;
  })();

  // Get theme config for custom logo href
  const themeConfig = useCustomThemeConfig();

  // Default menu path considering theme config's logo href
  // Priority: themeConfig.logo.href > firstAvailableMenuItem path > '/start'
  const defaultMenuPath =
    themeConfig?.logo?.href ||
    (firstAvailableMenuItem?.key
      ? getPathFromMenuKey(firstAvailableMenuItem.key)
      : '/start');

  return {
    generalMenu,
    adminMenu,
    superAdminMenu,
    groupedGeneralMenu,
    isSelectedAdminCategoryMenu,
    firstAvailableMenuItem,
    defaultMenuPath,
    isCurrentPageBlocked,
    isCurrentPageNotFound,
    isCurrentPageUnauthorized,
    isPluginLoaded,
    blockList,
  };
};
