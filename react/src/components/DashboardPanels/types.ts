/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { AgentStatsFragment$key } from '../../__generated__/AgentStatsFragment.graphql';
import type { RecentlyCreatedSessionFragment$key } from '../../__generated__/RecentlyCreatedSessionFragment.graphql';
import type { SessionCountDashboardItemFragment$key } from '../../__generated__/SessionCountDashboardItemFragment.graphql';
import type { TotalResourceWithinResourceGroupFragment$key } from '../../__generated__/TotalResourceWithinResourceGroupFragment.graphql';
import type { SessionGridViewParams } from '../../helper/sessionResourceGridData';
import type { UserRole } from '../../helper/userRole';
import type { MenuKeys } from '../../hooks/useWebUIMenuItems';
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
  'activity',
  'superadmin',
  'other',
] as const;
export type PanelGroup = (typeof PANEL_GROUPS)[number];

/** The dashboard refresh choices; `refresh.min` names the slowest one a panel accepts. */
export type RefreshInterval =
  '5s' | '10s' | '15s' | '30s' | '1m' | '5m' | '10m';

/** How a preset panel draws its rows. */
export const VIZ_TYPES = ['table', 'stat', 'grid'] as const;
export type Viz = (typeof VIZ_TYPES)[number];

/** Placeholder until the filter bar lands: every board follows the header's project and resource group. */
export interface DashboardVars {
  projectId: string | null;
  resourceGroup: string | null;
}

/** Placeholder for the request range a board resolves from the viewer's admin level. */
export type DashboardScope = { type: 'project'; projectId: string | null };

/** The per-card settings a catalog entry can take, edited in edit mode. */
export const PANEL_SETTING_KINDS = ['resourceGroup', 'range'] as const;
export type PanelSettingKind = (typeof PANEL_SETTING_KINDS)[number];

/** A card's own settings; an absent field means the card's default. */
export interface PanelSettings {
  /** Resource group names; absent means the card's default group. */
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

/** A board's last filter-bar values, `'all'` meaning no restriction. */
export interface DashboardBoardVars {
  project: Array<string> | 'all';
  rg: Array<string> | 'all';
  range: string;
  refresh: string;
}

/** One saved board: its panels plus the filter values and pins it opens with. */
export interface DashboardModel extends DashboardBoard {
  id: string;
  /** Empty for the default board, which the tabs label generically. */
  title: string;
  vars: DashboardBoardVars;
  /** Project ids the board is fixed to; the filter bar does not change them. */
  pinned?: { project?: Array<string> };
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
}

export interface PanelCatalogContext {
  page: PanelPage;
  role: UserRole | null | undefined;
  config: PanelCatalogConfig;
}

/** Fragment keys of the page queries the built-in cards still read (until they get their own queries). */
export interface DashboardPageQueryRefs {
  queryRef: SessionCountDashboardItemFragment$key &
    RecentlyCreatedSessionFragment$key;
  totalResourceQueryRef?: TotalResourceWithinResourceGroupFragment$key | null;
  agentStatsQueryRef?: AgentStatsFragment$key | null;
}

export interface PanelComponentProps {
  panel: PersistedPanelV2;
  scope: DashboardScope;
  vars: DashboardVars;
  fetchKey: string;
  isRefetching: boolean;
  queryRefs: DashboardPageQueryRefs;
  /** Asks the page to refetch every panel. */
  onRefresh: () => void;
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
    menuKey?: MenuKeys;
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
  refresh: { min: RefreshInterval };
  /** The settings the card reads; only these cards get a settings control. */
  settings?: ReadonlyArray<PanelSettingKind>;
  /** Like a BAITable column's `defaultHidden`: in the catalog, not on a new board. */
  defaultHidden?: boolean;
}

/** Inputs the generic executor hands to a resource's `buildVariables`. */
export interface ResourceQueryArgs {
  filter?: GraphQLFilter | string;
  order?: string | null;
  limit: number;
  offset: number;
  /** Restricts the rows to these resource groups; absent or empty means all. */
  resourceGroups?: ReadonlyArray<string> | null;
  /** Ambient project scope (ADR-0001) for project-scoped connections. */
  projectId: string;
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
