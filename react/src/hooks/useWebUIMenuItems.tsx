/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '.';
import { useCurrentUserRole } from './backendai';
import { useDiagnosticsBadgeSeverity } from './useAutoDiagnostics';
import { useBAISettingUserState } from './useBAISetting';
import { useEffectiveAdminRole } from './useCurrentUserProjectRoles';
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
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useSessionStorageState } from 'ahooks';
import { Badge, theme, Typography } from 'antd';
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
import * as _ from 'lodash-es';
import {
  Activity,
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

// Mutable registry populated by routes.tsx at module initialization time.
// Using mutable objects (Set / Array) means importers share the same reference
// and see values added after their own import statement runs.
export const ROUTER_STATIC_PATHS = new Set<string>();
export const ROUTER_DYNAMIC_PATTERNS: RegExp[] = [];

export function populateRouterPaths(
  staticPaths: Set<string>,
  dynamicPatterns: RegExp[],
): void {
  ROUTER_STATIC_PATHS.clear();
  ROUTER_DYNAMIC_PATTERNS.length = 0;
  staticPaths.forEach((p) => ROUTER_STATIC_PATHS.add(p));
  dynamicPatterns.forEach((p) => ROUTER_DYNAMIC_PATTERNS.push(p));
}

export type MenuGroupName =
  | 'none'
  | 'playground'
  | 'storage'
  | 'workload'
  | 'service'
  | 'metrics'
  | 'mlops';

export type AdminMenuGroupName =
  | 'none'
  | 'admin-operations'
  | 'admin-infrastructure'
  | 'admin-system';

/**
 * Single source of truth for all valid menu keys.
 * MenuKeys type is derived from this array.
 */
export const VALID_MENU_KEYS = [
  // generalMenu keys
  'start',
  'dashboard',
  'summary', // alias to dashboard for backward compatibility
  'session',
  'job', // alias to session for backward compatibility
  'deployments',
  'model-store',
  'ai-agent',
  'chat',
  'data',
  'my-environment',
  'agent-summary',
  'statistics',
  'pipeline',
  // adminMenu keys
  'admin-session',
  'credential',
  'environment',
  'scheduler',
  'resource-policy',
  'reservoir',
  'admin-deployments',
  'admin-dashboard',
  'admin-data',
  'project-admin-users',
  'project-data',
  'project-admin-deployments',
  'agent',
  'project',
  'settings',
  'maintenance',
  'diagnostics',
  'branding',
  'rbac',
  'information',
] as const;

export type MenuKeys = (typeof VALID_MENU_KEYS)[number];

// All page keys that require at least admin role (not filtered by current user role).
// Used for 401 vs 404 distinction regardless of the current user's role-filtered menu.
const ALL_ADMIN_PAGE_KEYS: ReadonlySet<string> = new Set([
  'admin-session',
  'credential',
  'environment',
  'scheduler',
  'resource-policy',
  'reservoir',
  'admin-deployments',
  'admin-dashboard',
  'admin-data',
  'project-admin-users',
  'project-data',
  'project-admin-deployments',
  'agent',
  'project',
  'settings',
  'maintenance',
  'diagnostics',
  'branding',
  'rbac',
  'information',
]);

// Admin-category page keys reachable by a project admin (3-tier admin gating).
// Project admins see Sessions, Deployments, Data (vfolders) and Members within
// the admin category. Other admin pages remain visible only to domain admins or
// superadmins. Kept as a plain array so it can be exported and reused (e.g. for
// per-page route gating in follow-up PRs).
export const PROJECT_ADMIN_PAGE_KEYS = [
  // 'admin-session',
  // 'admin-deployments',
  // 'admin-data',
  'project-admin-users',
  'project-data',
  'project-admin-deployments',
] as const;

const PROJECT_ADMIN_PAGE_KEY_SET: ReadonlySet<string> = new Set(
  PROJECT_ADMIN_PAGE_KEYS,
);

// Page keys that additionally require superadmin role
const SUPERADMIN_ONLY_PAGE_KEYS: ReadonlySet<string> = new Set([
  'admin-deployments',
  'admin-dashboard',
  'admin-data',
  'agent',
  'project',
  'settings',
  'maintenance',
  'diagnostics',
  'branding',
  'rbac',
  'information',
]);

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

interface WebUIAdminMenuItemType extends MenuItemType {
  group: AdminMenuGroupName;
  key: MenuKeys;
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
  const effectiveAdminRole = useEffectiveAdminRole();

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

  const diagnosticsBadgeSeverity = useDiagnosticsBadgeSeverity();

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
      '/deployments',
      t('webui.menu.Deployments'),
      <BAIEndpointsIcon style={{ color: token.colorPrimary }} />,
      'deployments',
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

  const isSuperAdmin = currentUserRole === 'superadmin';

  const fullAdminMenu: Array<WebUIAdminMenuItemType> = filterOutEmpty([
    // --- Operations group ---
    {
      label: <WebUILink to="/credential">{t('webui.menu.Users')}</WebUILink>,
      icon: <UserOutlined style={{ color: token.colorInfo }} />,
      key: 'credential' as MenuKeys,
      group: 'admin-operations' as AdminMenuGroupName,
    },
    {
      label: (
        <WebUILink to="/project-admin-users">
          {t('webui.menu.ProjectMembers')}
        </WebUILink>
      ),
      icon: <TeamOutlined style={{ color: token.colorInfo }} />,
      key: 'project-admin-users' as MenuKeys,
      group: 'admin-operations' as AdminMenuGroupName,
    },
    {
      label: <WebUILink to="/project-data">{t('webui.menu.Data')}</WebUILink>,
      icon: <CloudUploadOutlined style={{ color: token.colorInfo }} />,
      key: 'project-data' as MenuKeys,
      group: 'admin-operations' as AdminMenuGroupName,
    },
    {
      label: (
        <WebUILink to="/project-admin-deployments">
          {t('webui.menu.ProjectDeployments')}
        </WebUILink>
      ),
      icon: <BAIEndpointsIcon style={{ color: token.colorInfo }} />,
      key: 'project-admin-deployments' as MenuKeys,
      group: 'admin-operations' as AdminMenuGroupName,
    },
    isSuperAdmin && {
      label: <WebUILink to="/project">{t('webui.menu.Projects')}</WebUILink>,
      icon: <TeamOutlined style={{ color: token.colorInfo }} />,
      key: 'project' as MenuKeys,
      group: 'admin-operations' as AdminMenuGroupName,
    },
    isSuperAdmin && {
      label: <WebUILink to="/admin-data">{t('webui.menu.Data')}</WebUILink>,
      icon: <CloudUploadOutlined style={{ color: token.colorInfo }} />,
      key: 'admin-data' as MenuKeys,
      group: 'admin-operations' as AdminMenuGroupName,
    },
    {
      label: (
        <WebUILink to="/admin-session">{t('webui.menu.Sessions')}</WebUILink>
      ),
      icon: <BAISessionsIcon style={{ color: token.colorInfo }} />,
      key: 'admin-session' as MenuKeys,
      group: 'admin-operations' as AdminMenuGroupName,
    },
    isSuperAdmin && {
      label: (
        <WebUILink to="/admin-deployments">
          {t('webui.menu.Deployments')}
        </WebUILink>
      ),
      icon: <BAIEndpointsIcon style={{ color: token.colorInfo }} />,
      key: 'admin-deployments' as MenuKeys,
      group: 'admin-operations' as AdminMenuGroupName,
    },
    {
      label: (
        <WebUILink to="/environment">{t('webui.menu.Environments')}</WebUILink>
      ),
      icon: <FileDoneOutlined style={{ color: token.colorInfo }} />,
      key: 'environment' as MenuKeys,
      group: 'admin-operations' as AdminMenuGroupName,
    },
    baiClient?.supports('reservoir') &&
      baiClient?._config.enableReservoir && {
        label: (
          <WebUILink to="/reservoir">{t('webui.menu.Reservoir')}</WebUILink>
        ),
        icon: <PackagePlus style={{ color: token.colorInfo }} />,
        key: 'reservoir' as MenuKeys,
        group: 'admin-operations' as AdminMenuGroupName,
      },
    baiClient?.supports('fair-share-scheduling') && {
      label: <WebUILink to="/scheduler">{t('webui.menu.Scheduler')}</WebUILink>,
      icon: <ClipboardClock style={{ color: token.colorInfo }} />,
      key: 'scheduler' as MenuKeys,
      group: 'admin-operations' as AdminMenuGroupName,
    },
    {
      label: (
        <WebUILink to="/resource-policy">
          {t('webui.menu.ResourcePolicies')}
        </WebUILink>
      ),
      icon: <SolutionOutlined style={{ color: token.colorInfo }} />,
      key: 'resource-policy' as MenuKeys,
      group: 'admin-operations' as AdminMenuGroupName,
    },
    // --- Infrastructure group (superadmin only) ---
    isSuperAdmin && {
      label: <WebUILink to="/agent">{t('webui.menu.Resources')}</WebUILink>,
      icon: <HddOutlined style={{ color: token.colorInfo }} />,
      key: 'agent' as MenuKeys,
      group: 'admin-infrastructure' as AdminMenuGroupName,
    },
    isSuperAdmin && {
      label: (
        <WebUILink to="/settings">{t('webui.menu.Configurations')}</WebUILink>
      ),
      icon: <ControlOutlined style={{ color: token.colorInfo }} />,
      key: 'settings' as MenuKeys,
      group: 'admin-infrastructure' as AdminMenuGroupName,
    },
    isSuperAdmin && {
      label: (
        <WebUILink to="/maintenance">{t('webui.menu.Maintenance')}</WebUILink>
      ),
      icon: <ToolOutlined style={{ color: token.colorInfo }} />,
      key: 'maintenance' as MenuKeys,
      group: 'admin-infrastructure' as AdminMenuGroupName,
    },
    isSuperAdmin && {
      label: (
        <WebUILink to="/diagnostics">{t('webui.menu.Diagnostics')}</WebUILink>
      ),
      icon: diagnosticsBadgeSeverity ? (
        <Badge
          dot
          offset={[-2, 2]}
          color={
            diagnosticsBadgeSeverity === 'critical'
              ? token.colorError
              : token.colorWarning
          }
        >
          <Activity style={{ color: token.colorInfo }} />
        </Badge>
      ) : (
        <Activity style={{ color: token.colorInfo }} />
      ),
      key: 'diagnostics' as MenuKeys,
      group: 'admin-infrastructure' as AdminMenuGroupName,
    },
    // --- System group (superadmin only) ---
    isSuperAdmin &&
      baiClient?.supports('rbac') && {
        label: (
          <WebUILink to="/rbac">{t('webui.menu.RBACManagement')}</WebUILink>
        ),
        icon: <SafetyCertificateOutlined style={{ color: token.colorInfo }} />,
        key: 'rbac' as MenuKeys,
        group: 'admin-system' as AdminMenuGroupName,
      },
    isSuperAdmin &&
      !isThemePreviewMode && {
        label: <WebUILink to="/branding">{t('webui.menu.Branding')}</WebUILink>,
        icon: <Palette style={{ color: token.colorInfo }} />,
        key: 'branding' as MenuKeys,
        group: 'admin-system' as AdminMenuGroupName,
      },
    isSuperAdmin && {
      label: (
        <WebUILink to="/information">{t('webui.menu.Information')}</WebUILink>
      ),
      icon: <InfoCircleOutlined style={{ color: token.colorInfo }} />,
      key: 'information' as MenuKeys,
      group: 'admin-system' as AdminMenuGroupName,
    },
  ]);

  // 3-tier admin gating:
  // - 'none': no admin items
  // - 'currentProjectAdmin': only PROJECT_ADMIN_PAGE_KEYS
  // - 'domainAdmin' / 'superadmin': full admin menu MINUS project-admin-only
  //   pages. Higher-tier admins have broader equivalents (e.g. `credential`
  //   covers users across the domain/system), so per-project admin pages would
  //   be redundant and confusing to show.
  const adminMenu: Array<WebUIAdminMenuItemType> =
    effectiveAdminRole === 'none'
      ? []
      : effectiveAdminRole === 'currentProjectAdmin'
        ? fullAdminMenu.filter((item) =>
            PROJECT_ADMIN_PAGE_KEY_SET.has(item.key as string),
          )
        : fullAdminMenu.filter(
            (item) => !PROJECT_ADMIN_PAGE_KEY_SET.has(item.key as string),
          );

  const pluginMap: Record<string, MenuItem[]> = {
    'menuitem-user': generalMenu as unknown as MenuItem[],
    'menuitem-admin': adminMenu as unknown as MenuItem[],
    // Only accept superadmin plugin items when user is actually superadmin,
    // to prevent superadmin-only plugin menus from being visible to admin users.
    ...(isSuperAdmin && {
      'menuitem-superadmin': adminMenu as unknown as MenuItem[],
    }),
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

  _.forEach(
    [generalMenu as MenuItem[], adminMenu as unknown as MenuItem[]],
    (menu) => {
      // Remove menu items that are in blockList
      _.remove(menu, (item) => _.includes(blockList, item?.key));
      // Disable menu items that are in inactiveList
      _.forEach(menu, (item) => {
        if (_.includes(inactiveList, item?.key)) {
          _.extend(item, { disabled: true });
        }
      });
    },
  );

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

  const aliasAdminGroupNameMap: {
    [key in AdminMenuGroupName]: string;
  } = {
    none: '',
    'admin-operations': t('webui.menu.groupName.superadmin.Operations'),
    'admin-infrastructure': t('webui.menu.groupName.superadmin.Infrastructure'),
    'admin-system': t('webui.menu.groupName.superadmin.System'),
  };
  const groupedGeneralMenu = _.map(
    _.groupBy(generalMenu, 'group'),
    (items, group) => {
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
    },
  )
    .flat()
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
    });

  const buildGroupedMenu = <T extends AdminMenuGroupName>(
    menu: Array<{ group?: T; key?: MenuKeys; [key: string]: any }>,
    groupNameMap: Record<T, string>,
    groupOrder: Array<T | undefined>,
  ) => {
    return _.map(_.groupBy(menu, 'group'), (items, group) => {
      if (group === 'none' || !group) {
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
                {groupNameMap[group as T] ?? group}
              </Typography.Text>
            )}
          </BAIFlex>
        ),
        children: items,
      };
    })
      .flat()
      .filter((item: any) => {
        // Filter out empty groups (e.g. when all children removed by blockList)
        if (item?.type === 'group' && 'children' in item) {
          return item.children.length > 0;
        }
        return true;
      })
      .sort((a: any, b: any) => {
        const getWeight = (item: any) => {
          if (item?.type !== 'group') return -1;
          const idx = groupOrder.indexOf(item.name as T | undefined);
          return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
        };
        return getWeight(a) - getWeight(b);
      });
  };

  const adminGroupOrder: Array<AdminMenuGroupName | undefined> = [
    undefined,
    'none',
    'admin-operations',
    'admin-infrastructure',
    'admin-system',
  ];

  const groupedAdminMenu = buildGroupedMenu(
    adminMenu,
    aliasAdminGroupNameMap,
    adminGroupOrder,
  );

  // First admin menu item reachable by the current user, after role filtering
  // (`adminMenu` is already narrowed by `effectiveAdminRole`) and blocklist /
  // inactive-list filtering. Treat this as the single source of truth for
  // "does the current user have any admin category page to enter?" — callers
  // should NOT combine this with a separate role check; a `null` value already
  // means the admin category is unreachable for this user.
  const firstAvailableAdminMenuItem = (() => {
    for (const item of groupedAdminMenu) {
      // Non-group item (direct menu item)
      if (item && 'key' in item && item.key && !item.disabled) {
        return item as WebUIAdminMenuItemType;
      }
      // Group item with children
      if (
        item &&
        'type' in item &&
        item.type === 'group' &&
        'children' in item
      ) {
        const firstActiveChild = _.find(
          item.children as Array<WebUIAdminMenuItemType>,
          (child) => child?.key && !child.disabled,
        );
        if (firstActiveChild) {
          return firstActiveChild;
        }
      }
    }
    return null;
  })();

  const isSelectedAdminCategoryMenu =
    _.some(adminMenu, (item) => {
      if (item && 'key' in item) {
        return item.key === location.pathname.split('/')[1];
      }
      return false;
    }) || 'storage-settings' === location.pathname.split('/')[1];

  // Role-independent variant: true when the current path is *any* admin
  // category page, regardless of whether the current user's effective role
  // can reach it. Callers that track "last visited general (non-admin) page"
  // must use this flag rather than `isSelectedAdminCategoryMenu`, which is
  // role-filtered and would otherwise classify an admin page as "general"
  // when the user's role excludes it from the admin menu (e.g. superadmin on
  // `/project-admin-users`, or a user switched into a project where they
  // lack admin rights).
  const currentPathFirstSegment = location.pathname.split('/')[1] || '';
  const isCurrentPathAdminCategory =
    ALL_ADMIN_PAGE_KEYS.has(currentPathFirstSegment) ||
    PROJECT_ADMIN_PAGE_KEY_SET.has(currentPathFirstSegment) ||
    currentPathFirstSegment === 'storage-settings';

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
    [generalMenu, adminMenu].forEach((menu) => {
      menu?.forEach((item) => {
        if (item && 'key' in item && item.key) {
          paths.add(item.key as string);
        }
      });
    });

    // Add all admin page keys regardless of role, so they are treated as
    // 401 (unauthorized) rather than 404 (not found) for unprivileged users.
    ALL_ADMIN_PAGE_KEYS.forEach((key) => paths.add(key));

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

  // Check if current page requires higher permission than user has.
  // Uses static key sets (not role-filtered adminMenu) to ensure correct 401 responses.
  // Gating is driven by the user's effective admin role (super/domain/project/none)
  // rather than the legacy `currentUserRole` string, so that project admins can reach
  // the subset of admin pages listed in PROJECT_ADMIN_PAGE_KEYS.
  const isCurrentPageUnauthorized = (() => {
    if (currentPathKey === '') return false;

    const isAdminPage =
      ALL_ADMIN_PAGE_KEYS.has(currentMenuKey) ||
      PROJECT_ADMIN_PAGE_KEY_SET.has(currentMenuKey);

    if (!isAdminPage) return false;

    // superadmin and domain admin can reach every admin page.
    if (
      effectiveAdminRole === 'superadmin' ||
      effectiveAdminRole === 'domainAdmin'
    ) {
      // Domain admin still cannot reach superadmin-only pages.
      if (
        effectiveAdminRole === 'domainAdmin' &&
        SUPERADMIN_ONLY_PAGE_KEYS.has(currentMenuKey) &&
        !PROJECT_ADMIN_PAGE_KEY_SET.has(currentMenuKey)
      ) {
        return true;
      }
      return false;
    }

    // Project admin: allow only pages explicitly reachable by project admins.
    if (effectiveAdminRole === 'currentProjectAdmin') {
      return !PROJECT_ADMIN_PAGE_KEY_SET.has(currentMenuKey);
    }

    // No admin role at all: all admin pages are unauthorized.
    return true;
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
    groupedGeneralMenu,
    groupedAdminMenu,
    isSelectedAdminCategoryMenu,
    isCurrentPathAdminCategory,
    firstAvailableMenuItem,
    firstAvailableAdminMenuItem,
    defaultMenuPath,
    isCurrentPageBlocked,
    isCurrentPageNotFound,
    isCurrentPageUnauthorized,
    isPluginLoaded,
    blockList,
  };
};
