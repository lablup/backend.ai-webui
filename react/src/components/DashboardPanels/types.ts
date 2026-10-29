/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { SessionGridViewParams } from '../../helper/sessionResourceGridData';
import type { UserRole } from '../../helper/userRole';
import type { MenuKeys } from '../../hooks/useWebUIMenuItems';
import type { PanelDetailLink, PanelDetailLinkContext } from './detailLink';
import type {
  BAIColumnsType,
  BAIGraphQLFilterProperty,
  FilterProperty,
  GraphQLFilter,
} from 'backend.ai-ui';
import type { TFunction } from 'i18next';
import type React from 'react';
import type { GraphQLTaggedNode, OperationType } from 'relay-runtime';

/** Data sources a custom panel can list. */
export const RESOURCE_KEYS = ['session', 'deployment', 'vfolder'] as const;
export type ResourceKey = (typeof RESOURCE_KEYS)[number];

/** Panel kinds the panel registry renders (table rows, a count, the session grid). */
export const PANEL_TYPES = [
  'resourceTable',
  'resourceCount',
  'sessionResourceGrid',
] as const;
export type PanelType = (typeof PANEL_TYPES)[number];

/**
 * Serializable per-panel configuration of a custom panel; it must survive a
 * JSON round-trip. The condition reaches users through the panel title.
 */
export interface PanelDescriptor {
  resourceType: ResourceKey;
  /** Overrides the panel header; falls back to the resource label. */
  title?: string;
  /** A `GraphQLFilter` for V2 resources, or the minilang string for `sessionNodes` ones. */
  filter?: GraphQLFilter | string | null;
  /** Sort order, e.g. `'-createdAt'`; falls back to the resource default. */
  order?: string | null;
  /** View settings of a `sessionResourceGrid` panel, null on other kinds. */
  gridView?: SessionGridViewParams | null;
  /** The panel's resource group setting, for sources that support one. */
  resourceGroups?: Array<string> | null;
}

/** The fields the panel modal collects when creating or editing a panel. */
export type PanelInput = Pick<
  PanelDescriptor,
  'resourceType' | 'filter' | 'title' | 'order' | 'gridView'
> & {
  panelType: PanelType;
};

/**
 * The custom-panel shape the panel modal and the edit sider read, and the
 * shape of the legacy `custom_dashboard_panels` localStorage value.
 */
export interface PersistedPanel {
  id: string;
  panelType: PanelType;
  descriptor: PanelDescriptor;
}

/** Dashboard pages a panel can be placed on. */
export type PanelPage = 'project' | 'projectAdmin' | 'admin';

/** Catalog groups, in the order the edit sider lists them. */
export const PANEL_GROUPS = [
  'start',
  'session',
  'resource',
  'deployment',
  'users',
  'activity',
  'other',
] as const;
export type PanelGroup = (typeof PANEL_GROUPS)[number];

/** How a preset panel draws its rows. */
export const VIZ_TYPES = ['table', 'stat', 'grid'] as const;
export type Viz = (typeof VIZ_TYPES)[number];

/** The current domain: `id` for `scoped*` scopes, `name` for fields keyed by name. */
export interface DashboardDomain {
  id: string;
  name: string;
}

/**
 * Whose data every card on a board reads, from the page alone. `mine` is the
 * member page: the viewer's own data in the header project. `projects` is an
 * admin page; `projectIds` is `'all'` only on the superadmin page, meaning
 * every project of `domain` (ADR 0012).
 */
export type DashboardScope =
  | {
      kind: 'mine';
      projectId: string | null;
    }
  | {
      kind: 'projects';
      projectIds: Array<string> | 'all';
      domain: DashboardDomain;
    };

/** What a card reads besides its scope: its own settings, resolved. */
export interface DashboardVars {
  /** The card's range setting, `now-24h` by default. */
  range: string;
  /**
   * `range` resolved at the card's last refresh, so it stays stable until the
   * next one. Filter with `withinWindow`, never as one `DateTimeFilter`.
   */
  timeRange: { after: string; before: string };
  /** The card's last refresh time, the `now` behind `timeRange`. */
  refreshedAt: number;
  /** The header's project and resource group, for cards that read one of each. */
  currentProjectId: string | null;
  currentResourceGroup: string | null;
  /** The card's resource group setting, else the header's current group. */
  resourceGroup: string | null;
}

/** The per-card settings a catalog entry can take, edited in edit mode. */
export const PANEL_SETTING_KINDS = ['resourceGroup', 'range'] as const;
export type PanelSettingKind = (typeof PANEL_SETTING_KINDS)[number];

/** A card's own settings; an absent field means the card's default. */
export interface PanelSettings {
  /**
   * The card's one resource group, stored as a one-item array; absent means the
   * card's default group. Older boards may hold several: the first one is read.
   */
  resourceGroups?: Array<string>;
  /** A relative range such as `now-24h`. */
  range?: string;
}

export interface PanelSize {
  columnSpan: number;
  rowSpan: number;
}

/**
 * One panel on a board, layout included. Plain JSON: it is persisted as is.
 * `id` equals `key` for single-instance panels, so layouts saved before the
 * catalog existed keep their positions.
 */
export interface PersistedPanelV2 {
  id: string;
  key: string;
  filter?: GraphQLFilter | string | null;
  viz?: Viz;
  order?: string | null;
  gridView?: SessionGridViewParams | null;
  title?: string;
  settings?: PanelSettings;
  columnSpan: number;
  rowSpan: number;
  columnOffset?: Record<number, number>;
}

export interface DashboardBoard {
  panels: Array<PersistedPanelV2>;
  /** Catalog keys this board has seen, so a removed panel stays removed while a new one appears. */
  knownKeys: Array<string>;
}

/** A board's dashboard-level values. */
export interface DashboardBoardVars {
  /** The auto refresh interval (`30s`, `5m`), or `off`. */
  refresh: string;
}

/** One saved board: its panels plus the refresh interval it opens with. */
export interface DashboardModel extends DashboardBoard {
  id: string;
  /** Empty for the default board, which the tabs label generically. */
  title: string;
  vars: DashboardBoardVars;
}

/** One page's boards in `userConfig.dashboard`. */
export interface DashboardPageConfig {
  boards: Array<DashboardModel>;
  active: string;
  /** Set on every write, so the localStorage migration never runs again. */
  migrated?: true;
}

/** `userConfig.dashboard`. */
export type DashboardConfig = Partial<Record<PanelPage, DashboardPageConfig>>;

/** `dashboardTemplates` in `domainConfig` / `publicConfigByDomain[domain]`. */
export type DashboardTemplates = Partial<Record<PanelPage, DashboardModel>>;

/** The parts of the WebUI config the catalog reads. */
export interface PanelCatalogConfig {
  blockList?: ReadonlyArray<string>;
  inactiveList?: ReadonlyArray<string>;
  hideAgents?: boolean;
  enableModelFolders?: boolean;
}

export interface PanelCatalogContext {
  page: PanelPage;
  role: UserRole | null | undefined;
  config: PanelCatalogConfig;
}

/** Fragment keys a page query hands its cards; every card now runs its own query. */
export type DashboardPageQueryRefs = Record<string, never>;

export interface PanelComponentProps {
  panel: PersistedPanelV2;
  scope: DashboardScope;
  vars: DashboardVars;
  fetchKey: string;
  /** Changes only on a manual refresh, for data that cannot change by itself. */
  manualFetchKey: string;
  isRefetching: boolean;
  queryRefs: DashboardPageQueryRefs;
  /** Refreshes every card now. */
  onRefresh: () => void;
  /** Saves the card's own filter on the board. */
  onChangeFilter?: (filter: PersistedPanelV2['filter']) => void;
  onEdit?: () => void;
  onRemove?: () => void;
}

/** One catalog entry: a dedicated card (`custom`) or a data source × filter × viz preset. */
export interface PanelDefinition {
  key: string;
  page: ReadonlyArray<PanelPage>;
  group: PanelGroup;
  titleKey: string;
  /** Replaces `titleKey` for a superadmin, whose card shows a wider range. */
  superadminTitleKey?: string;
  requires?: {
    role?: 'projectAdmin' | 'superadmin';
    /** `import` is a blockList key of its own, though it has no menu item. */
    menuKey?: MenuKeys | 'import';
    /** True drops the entry for this viewer: not listed and not rendered. */
    hidden?: (
      config: PanelCatalogConfig,
      role: UserRole | null | undefined,
    ) => boolean;
    /** False locks the entry: listed but disabled, and not rendered. */
    config?: (
      config: PanelCatalogConfig,
      role: UserRole | null | undefined,
    ) => boolean;
  };
  kind: 'preset' | 'custom';
  source?: ResourceKey;
  filter?: GraphQLFilter | string;
  viz?: Viz;
  Component?: React.FC<PanelComponentProps>;
  defaultSize: PanelSize;
  minSize: PanelSize;
  /** Per-viz sizes of a preset, overriding `defaultSize` / `minSize`. */
  sizeByViz?: Partial<
    Record<Viz, { defaultSize: PanelSize; minSize: PanelSize }>
  >;
  /** The settings the card reads; only these cards get a settings control. */
  settings?: ReadonlyArray<PanelSettingKind>;
  /** Like a BAITable column's `defaultHidden`: in the catalog, not on a new board; a page list limits it to those pages. */
  defaultHidden?: boolean | ReadonlyArray<PanelPage>;
  /** Where a new board of the page places the card; cards without one follow, in catalog order. */
  order?: Partial<Record<PanelPage, number>>;
  /** The list page behind the card, opened from its header; null on a page that has none. */
  detailLink?: (context: PanelDetailLinkContext) => PanelDetailLink | null;
}

/** Inputs the generic executor hands to a resource's `buildVariables`. */
export interface ResourceQueryArgs {
  filter?: GraphQLFilter | string;
  order?: string | null;
  limit: number;
  offset: number;
  /** Restricts the rows to these resource groups; absent or empty means all. */
  resourceGroups?: ReadonlyArray<string> | null;
  /** The page's project; `null` on the superadmin page, which reads the current domain. */
  projectId: string | null;
  domainName: string;
}

/** Normalized connection slice the executor renders. */
export interface ResourceConnectionResult<TNode> {
  count: number;
  nodes: ReadonlyArray<TNode>;
}

/**
 * Registry entry per {@link ResourceKey}: the statically compiled Relay query
 * plus the per-resource glue the generic panel needs.
 */
export interface ResourceConfig<
  TQuery extends OperationType = OperationType,
  TNode = unknown,
> {
  key: ResourceKey;
  /** i18n key for the resource's display label. */
  labelKey: string;
  query: GraphQLTaggedNode;
  /** Default sort order when the descriptor doesn't specify one. */
  defaultOrder: string;
  /** Minimum role the connection requires (schema-enforced); undefined = any project member. */
  minRole?: 'superadmin' | 'admin';
  /** The source can be narrowed to resource groups (the panel's setting). */
  supportsResourceGroup?: boolean;
  /** Render the list page's own table instead of the generic one. */
  kind?: 'sessionNodes' | 'deploymentNodes';
  getFilterProperties?: (
    t: TFunction,
  ) => ReadonlyArray<BAIGraphQLFilterProperty>;
  /** Properties for `BAIPropertyFilter` (string filter), `kind: 'sessionNodes'`. */
  getStringFilterProperties?: (t: TFunction) => Array<FilterProperty>;
  /** Columns for the generic table (unused for `kind: 'sessionNodes'`). */
  getColumns?: (t: TFunction) => BAIColumnsType<TNode>;
  buildVariables: (args: ResourceQueryArgs) => TQuery['variables'];
  selectConnection: (
    data: TQuery['response'],
  ) => ResourceConnectionResult<TNode> | null | undefined;
}
