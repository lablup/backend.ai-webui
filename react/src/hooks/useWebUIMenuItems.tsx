/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '.';
import { buildPath, MENU_KEY_TO_SCOPE_FEATURE } from '../helper/pathBuilder';
import { useCurrentUserRole } from './backendai';
import { useDiagnosticsBadgeSeverity } from './useAutoDiagnostics';
import { useBAISettingUserState } from './useBAISetting';
import { useEffectiveAdminRole } from './useCurrentUserProjectRoles';
import { useCustomThemeConfig } from './useCustomThemeConfig';
import {
  getRouteScopeAndKey,
  useActiveProjectName,
  useCurrentMenuKey,
} from './useRouteScope';
import {
  PluginPage,
  useWebUIPluginLoadedValue,
  useWebUIPluginValue,
} from './useWebUIPluginState';
import { useTheme } from '@astryxdesign/core/theme';
import {
  BAIBadgeCount,
  BAIEndpointsIcon,
  BAIModelStoreIcon,
  BAIMyEnvironmentsIcon,
  BAIPipelinesIcon,
  BAISessionsIcon,
  filterOutEmpty,
  useSessionStorageState,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import {
  CirclePlay,
  Gauge,
  MessageSquare,
  CloudUpload,
  HardDrive,
  ChartColumn,
  User,
  FileCheck,
  FileUser,
  SlidersHorizontal,
  Wrench,
  Info,
  Plug,
  Users,
  BadgeCheck,
  Activity,
  BotMessageSquare,
  ClipboardClock,
  PackagePlus,
  LinkIcon,
  ExternalLinkIcon,
  Palette,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

export type MenuGroupName =
  | 'none'
  | 'playground'
  | 'storage'
  | 'workload'
  | 'service'
  | 'metrics'
  | 'mlops';

export type AdminMenuGroupName =
  'none' | 'admin-operations' | 'admin-infrastructure' | 'admin-system';

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
  'project-admin-session',
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
  'admin-serving', // legacy redirect path; treat as admin so goBackPath is not polluted
  'admin-dashboard',
  'admin-data',
  'project-admin-users',
  'project-data',
  'project-admin-deployments',
  'project-admin-session',
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
const PROJECT_ADMIN_PAGE_KEYS = [
  // 'admin-session',
  // 'admin-deployments',
  // 'admin-data',
  'project-admin-users',
  'project-data',
  'project-admin-deployments',
  'project-admin-session',
] as const;

export const PROJECT_ADMIN_PAGE_KEY_SET: ReadonlySet<string> = new Set(
  PROJECT_ADMIN_PAGE_KEYS,
);

// Legacy flat path for a menu key (the pre-scope-aware URL, e.g. `/session`,
// `/project-data`, `/admin-session`). These flat paths are still mounted as
// backward-compat redirect shims (`legacyRedirects.tsx`), so emitting one is a
// safe fallback: the shim resolves it to the canonical scope-aware URL at
// runtime. Used when a project-scoped menu key has no resolvable project name
// (avoids producing an invalid `/project//<feature>` path).
const getLegacyFlatPath = (key: MenuKeys): string => {
  // 'job' is an alias for '/session' (backward compatibility)
  if (key === 'job') return '/session';
  if (key === 'summary') return '/dashboard';
  return `/${key}`;
};

// Convert a menu key to its scope-aware URL path.
//
// Delegates to `buildPath` via `MENU_KEY_TO_SCOPE_FEATURE` so a menu key like
// `session` (project scope) becomes `/project/<projectName>/session`,
// `project-data` (project-admin scope) becomes
// `/project/<projectName>/admin/data`, and `admin-session` (global admin)
// becomes `/admin/session`.
//
// `projectName` is required for project / projectAdmin scopes. When it is
// missing (e.g. the rare "no current project" edge case), we fall back to the
// legacy flat path which the redirect shims resolve, rather than building a
// broken `/project//...` URL. Admin-scope keys never need a project name.
export const getPathFromMenuKey = (
  key: MenuKeys,
  projectName?: string | null,
): string => {
  const scopeFeature = MENU_KEY_TO_SCOPE_FEATURE[key];
  if (!scopeFeature) {
    // Unknown key (e.g. a plugin url passed through): preserve legacy behavior.
    return getLegacyFlatPath(key);
  }
  const { scope, featureKey } = scopeFeature;
  if (scope !== 'admin' && !projectName) {
    return getLegacyFlatPath(key);
  }
  return buildPath(scope, featureKey, projectName);
};

/**
 * to-astryx ticket 24 — the menu model is now UI-library-neutral.
 *
 * It used to extend antd's `MenuItemType` and carry a `label` that was
 * already a rendered `<WebUILink>` element. Astryx `SideNavItem` takes a
 * **required `label: string`** plus `href` + `as` (the three universal
 * contracts, §1), so the link is built by the renderer (`BAIMenu`) from
 * `labelText` + `to` instead of being baked into the data.
 */
export interface WebUIMenuItemBase {
  key: MenuKeys;
  /** Accessible/visible label — a plain string, never JSX (P2). */
  labelText: string;
  icon: React.ReactNode;
  /** Router destination; absent for action-only entries (e.g. FastTrack). */
  to?: string;
  disabled?: boolean;
  onClick?: () => void;
}

type MenuItem = WebUIMenuItemBase & { group?: string };

export interface WebUIGeneralMenuItemType extends WebUIMenuItemBase {
  group: MenuGroupName;
}

export interface WebUIAdminMenuItemType extends WebUIMenuItemBase {
  group: AdminMenuGroupName;
}

/** A titled group of menu items (antd's `{type:'group'}` shape, de-antd'd). */
export interface WebUIMenuGroupType<T> {
  type: 'group';
  name: string;
  /** Plain string — `SideNavSection.title` is a required string. */
  labelText: string;
  children: Array<T>;
}

export interface UseWebUIMenuItemsProps {
  hideGroupName?: boolean;
}

export const useWebUIMenuItems = (props?: UseWebUIMenuItemsProps) => {
  'use memo';

  // `hideGroupName` is now consumed by the RENDERER (`BAIMenu` passes it
  // to `SideNavSection.isHeaderHidden`); the grouped data always carries
  // its title string. Kept on the props type for call-site compatibility.
  void props?.hideGroupName;
  const plugins = useWebUIPluginValue();
  const isPluginLoaded = useWebUIPluginLoadedValue();
  const currentUserRole = useCurrentUserRole();
  const effectiveAdminRole = useEffectiveAdminRole();

  // Scope-aware current menu key (legacy hyphenated key, e.g. 'admin-session',
  // 'project-data', 'session'). Derived from the matched route `handle.menuKey`
  // (with a pathname-parse fallback) so it stays correct under the new
  // `/project/:name/<feature>` and `/admin/<feature>` URL shapes, where
  // `location.pathname.split('/')[1]` would return the scope prefix
  // ('project'/'admin') instead of the feature key.
  const currentMenuKeyFromRoute = useCurrentMenuKey();
  const routerLocation = useLocation();
  // Active project NAME (URL `:projectName` if present, else current project
  // atom). Used to build scope-aware menu `to` paths via `getPathFromMenuKey` /
  // `buildPath` so every menu link points at `/project/<name>/<feature>` (or
  // `/admin/<feature>` for admin keys, where the name is ignored).
  const activeProjectName = useActiveProjectName();
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  const isHideAgents = baiClient?._config?.hideAgents ?? true;
  const fasttrackEndpoint = baiClient?._config?.fasttrackEndpoint ?? null;
  const blockList = baiClient?._config?.blockList ?? null;
  const inactiveList = baiClient?._config?.inactiveList ?? null;
  const { token } = useTheme();

  const [experimentalAIAgents] = useBAISettingUserState(
    'experimental_ai_agents',
  );

  const [isThemePreviewMode] = useSessionStorageState('isThemePreviewMode', {
    defaultValue: false,
  });

  const diagnosticsBadgeSeverity = useDiagnosticsBadgeSeverity();

  // Helper to create a menu item. The `to` path is derived from the menu `key`
  // via `getPathFromMenuKey` (scope-aware: `/project/<name>/<feature>` for
  // general keys), so call sites no longer hardcode the URL — a single source
  // of truth that stays correct under the scope-prefixed routing scheme.
  const createMenuItem = (
    labelText: string,
    icon: React.ReactNode,
    key: MenuKeys,
    group: MenuGroupName,
  ): WebUIGeneralMenuItemType => ({
    to: getPathFromMenuKey(key, activeProjectName),
    icon,
    key,
    group,
    labelText,
  });

  // Admin menu item builder — same scope-aware `to` derivation, with the admin
  // menu's info-color icons and admin group typing.
  const createAdminMenuItem = (
    labelText: string,
    icon: React.ReactNode,
    key: MenuKeys,
    group: AdminMenuGroupName,
  ): WebUIAdminMenuItemType => ({
    to: getPathFromMenuKey(key, activeProjectName),
    icon,
    key,
    group,
    labelText,
  });

  const generalMenu = filterOutEmpty<WebUIGeneralMenuItemType>([
    createMenuItem(
      t('webui.menu.Start'),
      <CirclePlay style={{ color: token('--color-accent') }} size="1em" />,
      'start',
      'none',
    ),
    createMenuItem(
      t('webui.menu.Dashboard'),
      <Gauge style={{ color: token('--color-accent') }} size="1em" />,
      'dashboard',
      'none',
    ),
    createMenuItem(
      t('webui.menu.Sessions'),
      <BAISessionsIcon style={{ color: token('--color-accent') }} />,
      'session',
      'workload',
    ),
    createMenuItem(
      t('webui.menu.Deployments'),
      <BAIEndpointsIcon style={{ color: token('--color-accent') }} />,
      'deployments',
      'service',
    ),
    createMenuItem(
      t('data.ModelStore'),
      <BAIModelStoreIcon style={{ color: token('--color-accent') }} />,
      'model-store',
      'service',
    ),
    experimentalAIAgents &&
      createMenuItem(
        t('webui.menu.AIAgents'),
        <BotMessageSquare style={{ color: token('--color-accent') }} />,
        'ai-agent',
        'playground',
      ),
    createMenuItem(
      t('webui.menu.Chat'),
      <MessageSquare style={{ color: token('--color-accent') }} size="1em" />,
      'chat',
      'playground',
    ),
    createMenuItem(
      t('webui.menu.Data'),
      <CloudUpload style={{ color: token('--color-accent') }} size="1em" />,
      'data',
      'storage',
    ),
    createMenuItem(
      t('webui.menu.MyEnvironments'),
      <BAIMyEnvironmentsIcon style={{ color: token('--color-accent') }} />,
      'my-environment',
      'workload',
    ),
    !isHideAgents &&
      createMenuItem(
        t('webui.menu.AgentSummary'),
        <HardDrive style={{ color: token('--color-accent') }} size="1em" />,
        'agent-summary',
        'metrics',
      ),
    createMenuItem(
      t('webui.menu.Statistics'),
      <ChartColumn style={{ color: token('--color-accent') }} size="1em" />,
      'statistics',
      'metrics',
    ),
    !!fasttrackEndpoint && {
      icon: <BAIPipelinesIcon style={{ color: token('--color-accent') }} />,
      key: 'pipeline' as MenuKeys,
      onClick: () => {
        window.open(fasttrackEndpoint, '_blank', 'noopener noreferrer');
      },
      group: 'mlops' as MenuGroupName,
      labelText: t('webui.menu.FastTrack'),
    },
  ]);

  const isSuperAdmin = currentUserRole === 'superadmin';

  // PILOT-DECISION: antd `Badge dot offset color` — a DOT OVERLAY on a child
  // — is MAPPING §3.8's explicit NONE ("no count overlay, no Badge.Ribbon;
  // self-build, build once"). The gap component built for exactly that in
  // ticket 08 is `BAIBadgeCount`, used here in its `dot` form. The
  // arbitrary `color={token('--color-error')|colorWarning}` becomes the component's
  // closed `variant` enum.
  const diagnosticsIcon = diagnosticsBadgeSeverity ? (
    <BAIBadgeCount
      hasDot
      offset={[-2, 2]}
      variant={diagnosticsBadgeSeverity === 'critical' ? 'error' : 'warning'}
      title={t('webui.menu.Diagnostics')}
    >
      <Activity style={{ color: token('--bai-color-info') }} />
    </BAIBadgeCount>
  ) : (
    <Activity style={{ color: token('--bai-color-info') }} />
  );

  const fullAdminMenu: Array<WebUIAdminMenuItemType> = filterOutEmpty([
    // --- Operations group ---
    createAdminMenuItem(
      t('webui.menu.Users'),
      <User style={{ color: token('--bai-color-info') }} size="1em" />,
      'credential',
      'admin-operations',
    ),
    createAdminMenuItem(
      t('webui.menu.ProjectMembers'),
      <Users style={{ color: token('--bai-color-info') }} size="1em" />,
      'project-admin-users',
      'admin-operations',
    ),
    createAdminMenuItem(
      t('webui.menu.Data'),
      <CloudUpload style={{ color: token('--bai-color-info') }} size="1em" />,
      'project-data',
      'admin-operations',
    ),
    createAdminMenuItem(
      t('webui.menu.ProjectSessions'),
      <BAISessionsIcon style={{ color: token('--bai-color-info') }} />,
      'project-admin-session',
      'admin-operations',
    ),
    createAdminMenuItem(
      t('webui.menu.ProjectDeployments'),
      <BAIEndpointsIcon style={{ color: token('--bai-color-info') }} />,
      'project-admin-deployments',
      'admin-operations',
    ),
    isSuperAdmin &&
      createAdminMenuItem(
        t('webui.menu.Projects'),
        <Users style={{ color: token('--bai-color-info') }} size="1em" />,
        'project',
        'admin-operations',
      ),
    isSuperAdmin &&
      createAdminMenuItem(
        t('webui.menu.Data'),
        <CloudUpload style={{ color: token('--bai-color-info') }} size="1em" />,
        'admin-data',
        'admin-operations',
      ),
    createAdminMenuItem(
      t('webui.menu.Sessions'),
      <BAISessionsIcon style={{ color: token('--bai-color-info') }} />,
      'admin-session',
      'admin-operations',
    ),
    isSuperAdmin &&
      createAdminMenuItem(
        t('webui.menu.Deployments'),
        <BAIEndpointsIcon style={{ color: token('--bai-color-info') }} />,
        'admin-deployments',
        'admin-operations',
      ),
    createAdminMenuItem(
      t('webui.menu.Environments'),
      <FileCheck style={{ color: token('--bai-color-info') }} size="1em" />,
      'environment',
      'admin-operations',
    ),
    baiClient?.supports('reservoir') &&
      baiClient?._config.enableReservoir &&
      createAdminMenuItem(
        t('webui.menu.Reservoir'),
        <PackagePlus style={{ color: token('--bai-color-info') }} />,
        'reservoir',
        'admin-operations',
      ),
    baiClient?.supports('fair-share-scheduling') &&
      createAdminMenuItem(
        t('webui.menu.Scheduler'),
        <ClipboardClock style={{ color: token('--bai-color-info') }} />,
        'scheduler',
        'admin-operations',
      ),
    createAdminMenuItem(
      t('webui.menu.ResourcePolicies'),
      <FileUser style={{ color: token('--bai-color-info') }} size="1em" />,
      'resource-policy',
      'admin-operations',
    ),
    // --- Infrastructure group (superadmin only) ---
    isSuperAdmin &&
      createAdminMenuItem(
        t('webui.menu.Resources'),
        <HardDrive style={{ color: token('--bai-color-info') }} size="1em" />,
        'agent',
        'admin-infrastructure',
      ),
    isSuperAdmin &&
      createAdminMenuItem(
        t('webui.menu.Configurations'),
        <SlidersHorizontal
          style={{ color: token('--bai-color-info') }}
          size="1em"
        />,
        'settings',
        'admin-infrastructure',
      ),
    isSuperAdmin &&
      createAdminMenuItem(
        t('webui.menu.Maintenance'),
        <Wrench style={{ color: token('--bai-color-info') }} size="1em" />,
        'maintenance',
        'admin-infrastructure',
      ),
    isSuperAdmin &&
      createAdminMenuItem(
        t('webui.menu.Diagnostics'),
        diagnosticsIcon,
        'diagnostics',
        'admin-infrastructure',
      ),
    // --- System group (superadmin only) ---
    isSuperAdmin &&
      baiClient?.supports('rbac') &&
      createAdminMenuItem(
        t('webui.menu.RBACManagement'),
        <BadgeCheck style={{ color: token('--bai-color-info') }} size="1em" />,
        'rbac',
        'admin-system',
      ),
    isSuperAdmin &&
      !isThemePreviewMode &&
      createAdminMenuItem(
        t('webui.menu.Branding'),
        <Palette style={{ color: token('--bai-color-info') }} />,
        'branding',
        'admin-system',
      ),
    isSuperAdmin &&
      createAdminMenuItem(
        t('webui.menu.Information'),
        <Info style={{ color: token('--bai-color-info') }} size="1em" />,
        'information',
        'admin-system',
      ),
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
            labelText: page?.menuitem,
            to: `/${page?.url}`,
            icon: pluginIconMap[page.icon || ''] || <Plug size="1em" />,
            key: page?.url as MenuKeys,
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
      // The group header used to be a JSX node (a bordered flex with a
      // secondary `Typography.Text`). `SideNavSection.title` is a required
      // string and the section renders its own header, so the group carries
      // only the STRING; `hideGroupName` (collapsed sider) is passed to
      // `SideNavSection.isHeaderHidden` by the renderer instead of blanking
      // the label here. The 1px bottom rule has no destination.
      return {
        type: 'group' as const,
        name: group,
        labelText: aliasGroupNameMap[group as MenuGroupName] ?? group,
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
    menu: Array<WebUIMenuItemBase & { group?: T }>,
    groupNameMap: Record<T, string>,
    groupOrder: Array<T | undefined>,
  ): Array<
    | (WebUIMenuItemBase & { group?: T })
    | WebUIMenuGroupType<WebUIMenuItemBase & { group?: T }>
  > => {
    return _.map(_.groupBy(menu, 'group'), (items, group) => {
      if (group === 'none' || !group) {
        return items;
      }
      return {
        type: 'group' as const,
        name: group,
        labelText: groupNameMap[group as T] ?? group,
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

  // First project-admin page in sider order that survives blocklist /
  // inactive-list filtering. Computed from the un-role-filtered fullAdminMenu
  // (super/domain admins' `adminMenu` excludes project-admin items, but they
  // can access all of them) — the redirect target for `/project/:name/admin`.
  // `undefined` when the config hides every project-admin page.
  const firstAvailableProjectAdminMenuKey = _.find(
    fullAdminMenu,
    (item) =>
      PROJECT_ADMIN_PAGE_KEY_SET.has(item.key as string) &&
      !_.includes(blockList, item.key) &&
      !_.includes(inactiveList, item.key),
  )?.key;

  const isSelectedAdminCategoryMenu = _.some(adminMenu, (item) => {
    if (item && 'key' in item) {
      return item.key === currentMenuKeyFromRoute;
    }
    return false;
  });

  // Role-independent variant: true when the current path is *any* admin
  // category page, regardless of whether the current user's effective role
  // can reach it. Callers that track "last visited general (non-admin) page"
  // must use this flag rather than `isSelectedAdminCategoryMenu`, which is
  // role-filtered and would otherwise classify an admin page as "general"
  // when the user's role excludes it from the admin menu (e.g. superadmin on
  // `/project-admin-users`, or a user switched into a project where they
  // lack admin rights).
  const currentPageMenuKey = currentMenuKeyFromRoute ?? '';
  // Also treat any admin-scoped URL as admin category, keyed on the URL scope
  // itself. The menu-key sets alone miss the bare scope roots (`/admin`,
  // `/project/:name/admin`): their feature key is empty during the index
  // redirect, which used to classify them as "general" and pollute the
  // sider's `goBackPath` with `/admin` — making "go back" a no-op loop
  // (FR-3388, deep-link-then-login repro).
  const currentUrlScope = getRouteScopeAndKey(routerLocation.pathname).scope;
  const isCurrentPathAdminCategory =
    ALL_ADMIN_PAGE_KEYS.has(currentPageMenuKey) ||
    PROJECT_ADMIN_PAGE_KEY_SET.has(currentPageMenuKey) ||
    currentUrlScope !== 'project';

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

  // Check if current page is in blocklist.
  // `currentMenuKeyFromRoute` is the scope-aware legacy menu key (from the
  // matched route handle), so it equals the feature key for general pages and
  // the hyphenated admin key for admin pages — exactly what
  // `ALL_ADMIN_PAGE_KEYS` and `PROJECT_ADMIN_PAGE_KEY_SET` are keyed on. Empty
  // (`''`) means "root / no feature matched" and is treated as always valid.
  const currentPathKey = currentMenuKeyFromRoute ?? '';
  const currentMenuKey = currentPathKey;
  // Root path '/' should not be blocked (it redirects to first available menu)
  const isCurrentPageBlocked =
    currentPathKey !== '' && _.includes(blockList, currentMenuKey);

  // Get theme config for custom logo href
  const { appearance } = useCustomThemeConfig();

  // Default menu path considering theme config's logo href.
  // Priority: appearance.branding.logo.href > firstAvailableMenuItem path > '/start'.
  // Project-aware: `getPathFromMenuKey` builds `/project/<name>/<feature>` for
  // the first general menu item using the active project name. When no project
  // is resolvable it falls back to the legacy flat path (e.g. `/start`), which
  // the redirect shims resolve to the canonical project URL at runtime.
  const defaultMenuPath =
    appearance?.branding?.logo?.href ||
    (firstAvailableMenuItem?.key
      ? getPathFromMenuKey(firstAvailableMenuItem.key, activeProjectName)
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
    firstAvailableProjectAdminMenuKey,
    defaultMenuPath,
    isCurrentPageBlocked,
    isPluginLoaded,
    blockList,
  };
};
