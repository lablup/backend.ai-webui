/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import QuotaPerStorageVolumeDashboardItem from '../QuotaPerStorageVolumeDashboardItem';
import { useDashboardRefreshQuery } from './DashboardRefreshContext';
import AuditLogPanel from './cards/AuditLogPanel';
import DeploymentStatusPanel from './cards/DeploymentStatusPanel';
import FoldersPanel from './cards/FoldersPanel';
import LongRunningSessionsPanel from './cards/LongRunningSessionsPanel';
import PendingSessionsPanel from './cards/PendingSessionsPanel';
import RecentSessionsPanel from './cards/RecentSessionsPanel';
import ResourceAllocationPanel from './cards/ResourceAllocationPanel';
import SessionStatusPanel from './cards/SessionStatusPanel';
import UsersPanel from './cards/UsersPanel';
import { DEFAULT_PANEL_LAYOUTS, presetKey } from './defaults';
import MyResourcesPanel from './memberCards/MyResourcesPanel';
import ResourceGroupTotalPanel from './memberCards/ResourceGroupTotalPanel';
import ResourcePresetsPanel from './memberCards/ResourcePresetsPanel';
import {
  CreateFolderPanel,
  StartBatchSessionPanel,
  StartDeploymentPanel,
  StartFromURLPanel,
  StartSessionPanel,
} from './memberCards/StartActionPanels';
import ResourceGroupCapacityPanel from './projectAdminCards/ResourceGroupCapacityPanel';
import { resourceKeys, resourceRegistry } from './resourceRegistry';
import AgentStatsPanel from './superadminCards/AgentStatsPanel';
import AgentsPanel from './superadminCards/AgentsPanel';
import ContainerRegistriesPanel from './superadminCards/ContainerRegistriesPanel';
import FailedLoginsPanel from './superadminCards/FailedLoginsPanel';
import FailuresByEntityTypePanel from './superadminCards/FailuresByEntityTypePanel';
import FairSharePanel from './superadminCards/FairSharePanel';
import ResourcePoliciesPanel from './superadminCards/ResourcePoliciesPanel';
import SchedulingFailuresPanel from './superadminCards/SchedulingFailuresPanel';
import TopProjectsUsagePanel from './superadminCards/TopProjectsUsagePanel';
import type {
  PanelComponentProps,
  PanelDefinition,
  PanelPage,
  PanelSize,
  PanelType,
} from './types';
import { BAIBoardItemErrorBoundary, BAISkeleton } from 'backend.ai-ui';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

// Cards that predate the catalog, each wrapped as its page wrapped it; the
// rest live in `cards/` (shared by pages), `memberCards/` and `superadminCards/`.

const QuotaPerStorageVolumePanel: React.FC<PanelComponentProps> = () => {
  'use memo';
  const { t } = useTranslation();
  useDashboardRefreshQuery(['vhostInfo']);
  return (
    <BAIBoardItemErrorBoundary
      title={t('data.QuotaPerStorageVolume')}
      status="error"
    >
      <Suspense fallback={<BAISkeleton />}>
        <QuotaPerStorageVolumeDashboardItem />
      </Suspense>
    </BAIBoardItemErrorBoundary>
  );
};

/** A card's list page, labelled by the destination menu of each page it opens from. */
const listLink =
  (
    feature: string,
    labelKeys: Partial<Record<PanelPage, string>>,
    query?: Readonly<Record<string, string>>,
  ): NonNullable<PanelDefinition['detailLink']> =>
  ({ page }) => {
    const labelKey = labelKeys[page];
    return labelKey ? { feature, labelKey, query } : null;
  };

const SESSIONS = {
  project: 'webui.menu.Sessions',
  projectAdmin: 'webui.menu.ProjectSessions',
  admin: 'webui.menu.Sessions',
} as const;
const RUNNING_SESSIONS = listLink('session', SESSIONS, {
  statusCategory: 'running',
});

/** Pending sessions have their own tab on the superadmin session page only. */
const pendingSessionsLink: NonNullable<PanelDefinition['detailLink']> = ({
  page,
  settings,
}) => {
  if (page !== 'admin') return null;
  const resourceGroup = settings?.resourceGroups?.[0];
  return {
    feature: 'session',
    labelKey: 'adminSession.PendingSessions',
    query: {
      tab: 'pending-sessions',
      ...(resourceGroup ? { resourceGroup } : {}),
    },
  };
};

const size = (columnSpan: number, rowSpan: number): PanelSize => ({
  columnSpan,
  rowSpan,
});

const ALL_PAGES: ReadonlyArray<PanelPage> = [
  'project',
  'projectAdmin',
  'admin',
];

const START_SIZE = { defaultSize: size(1, 2), minSize: size(1, 2) };
/** The member page's cards and the shared ones, in the order a new board places them. */
const MEMBER_PANELS: ReadonlyArray<PanelDefinition> = [
  {
    key: 'start.session',
    page: ['project'],
    group: 'start',
    titleKey: 'start.StartSession',
    requires: { menuKey: 'job' },
    kind: 'custom',
    Component: StartSessionPanel,
    ...START_SIZE,
  },
  {
    key: 'start.batchSession',
    page: ['project'],
    group: 'start',
    titleKey: 'start.StartBatchSession',
    requires: { menuKey: 'job' },
    kind: 'custom',
    Component: StartBatchSessionPanel,
    ...START_SIZE,
  },
  {
    key: 'start.folder',
    page: ['project'],
    group: 'start',
    titleKey: 'start.CreateFolder',
    requires: { menuKey: 'data' },
    kind: 'custom',
    Component: CreateFolderPanel,
    ...START_SIZE,
  },
  {
    key: 'start.deployment',
    page: ['project'],
    group: 'start',
    titleKey: 'start.StartDeployment',
    requires: {
      menuKey: 'deployments',
      config: (config) => !!config.enableModelFolders,
    },
    kind: 'custom',
    Component: StartDeploymentPanel,
    ...START_SIZE,
  },
  {
    key: 'start.url',
    page: ['project'],
    group: 'start',
    titleKey: 'start.StartFromURL',
    requires: { menuKey: 'import' },
    kind: 'custom',
    Component: StartFromURLPanel,
    ...START_SIZE,
  },
  {
    key: 'mySession',
    page: ['project'],
    group: 'session',
    titleKey: 'session.MySessions',
    kind: 'custom',
    Component: SessionStatusPanel,
    detailLink: RUNNING_SESSIONS,
    defaultSize: size(2, 2),
    minSize: size(2, 2),
  },
  {
    key: 'myRecentSessions',
    page: ['project'],
    group: 'session',
    titleKey: 'dashboard.card.MyRecentSessions',
    kind: 'custom',
    Component: RecentSessionsPanel,
    detailLink: listLink('session', SESSIONS),
    defaultSize: size(4, 3),
    minSize: size(2, 2),
  },
  {
    key: 'myResource',
    page: ['project'],
    group: 'resource',
    titleKey: 'webui.menu.MyResources',
    kind: 'custom',
    Component: MyResourcesPanel,
    defaultSize: size(2, 3),
    minSize: size(2, 2),
    settings: ['resourceGroup'],
  },
  {
    key: 'resourcePresets',
    page: ['project'],
    group: 'resource',
    titleKey: 'dashboard.card.ResourcePresets',
    kind: 'custom',
    Component: ResourcePresetsPanel,
    defaultSize: size(2, 3),
    minSize: size(2, 2),
    settings: ['resourceGroup'],
    defaultHidden: true,
  },
  {
    key: 'totalResourceWithinResourceGroup',
    page: ['project', 'admin'],
    group: 'resource',
    titleKey: 'webui.menu.TotalResourcesInResourceGroup',
    requires: {
      // Superadmins read `agent_nodes` even with hideAgents; others need `agent_summary_list`.
      config: (config, role) => role === 'superadmin' || !config.hideAgents,
      // Regular users never see it then; admins see it as unavailable.
      hidden: (config, role) =>
        !!config.hideAgents && role !== 'admin' && role !== 'superadmin',
    },
    kind: 'custom',
    Component: ResourceGroupTotalPanel,
    defaultSize: size(2, 2),
    minSize: size(2, 2),
    settings: ['resourceGroup'],
  },
  // TODO(needs-backend): BA-8719 - re-add `folderStatus` (FoldersPanel) once
  // the folders a user owns can be counted apart from those shared with them.
  {
    key: 'quotaPerStorageVolume',
    page: ['project'],
    group: 'resource',
    titleKey: 'data.QuotaPerStorageVolume',
    kind: 'custom',
    Component: QuotaPerStorageVolumePanel,
    defaultSize: size(2, 2),
    minSize: size(2, 2),
  },
  {
    key: 'myDeployments',
    page: ['project'],
    group: 'deployment',
    titleKey: 'dashboard.card.MyDeployments',
    requires: { menuKey: 'deployments' },
    kind: 'custom',
    Component: DeploymentStatusPanel,
    detailLink: listLink('deployments', { project: 'webui.menu.Deployments' }),
    defaultSize: size(2, 3),
    minSize: size(2, 2),
  },
  {
    key: 'myActivity',
    page: ['project'],
    group: 'activity',
    titleKey: 'dashboard.card.MyActivity',
    kind: 'custom',
    Component: AuditLogPanel,
    defaultSize: size(4, 3),
    minSize: size(2, 2),
    settings: ['range'],
  },
];

/** Where the superadmin page's default board places its cards. */
const ADMIN_ORDER = {
  projectSessionStatus: 1,
  pendingSessions: 2,
  schedulingFailures: 3,
  activeAgents: 4,
  agentStats: 5,
  failuresByEntityType: 6,
  projectAuditLog: 7,
  topProjectsUsage: 8,
  fairShare: 9,
} as const;

const adminOrder = (key: keyof typeof ADMIN_ORDER) => ({
  order: { admin: ADMIN_ORDER[key] },
});

/**
 * The admin pages' cards, in the order the project admin board places them.
 * A card on both pages is one component that reads the page's scope (ADR 0018).
 */
const PROJECT_ADMIN_PANELS: ReadonlyArray<PanelDefinition> = [
  {
    key: 'projectSessionStatus',
    page: ['projectAdmin', 'admin'],
    group: 'session',
    titleKey: 'dashboard.card.SessionStatus',
    kind: 'custom',
    Component: SessionStatusPanel,
    detailLink: RUNNING_SESSIONS,
    defaultSize: size(4, 3),
    minSize: size(2, 2),
    ...adminOrder('projectSessionStatus'),
  },
  {
    key: 'pendingSessions',
    page: ['projectAdmin', 'admin'],
    group: 'session',
    titleKey: 'dashboard.card.PendingSessions',
    kind: 'custom',
    Component: PendingSessionsPanel,
    detailLink: pendingSessionsLink,
    defaultSize: size(4, 3),
    minSize: size(2, 2),
    settings: ['resourceGroup'],
    ...adminOrder('pendingSessions'),
  },
  {
    key: 'longRunningSessions',
    page: ['projectAdmin', 'admin'],
    group: 'session',
    titleKey: 'dashboard.card.LongRunningSessions',
    kind: 'custom',
    Component: LongRunningSessionsPanel,
    detailLink: RUNNING_SESSIONS,
    defaultSize: size(4, 3),
    minSize: size(2, 2),
    settings: ['range'],
    defaultHidden: ['admin'],
  },
  {
    key: 'projectResourceAllocation',
    page: ['projectAdmin', 'admin'],
    group: 'resource',
    titleKey: 'dashboard.card.ResourceAllocation',
    kind: 'custom',
    Component: ResourceAllocationPanel,
    defaultSize: size(2, 2),
    minSize: size(2, 2),
    defaultHidden: ['admin'],
  },
  {
    key: 'projectDeployments',
    page: ['projectAdmin', 'admin'],
    group: 'deployment',
    titleKey: 'dashboard.card.DeploymentStatus',
    requires: { menuKey: 'deployments' },
    kind: 'custom',
    Component: DeploymentStatusPanel,
    detailLink: listLink('deployments', {
      projectAdmin: 'webui.menu.ProjectDeployments',
      admin: 'webui.menu.Deployments',
    }),
    defaultSize: size(2, 3),
    minSize: size(2, 2),
    defaultHidden: ['admin'],
  },
  {
    key: 'projectFolders',
    page: ['projectAdmin', 'admin'],
    group: 'resource',
    titleKey: 'general.Folders',
    kind: 'custom',
    Component: FoldersPanel,
    detailLink: listLink('data', {
      projectAdmin: 'webui.menu.Data',
      admin: 'webui.menu.Data',
    }),
    defaultSize: size(2, 2),
    minSize: size(2, 2),
    defaultHidden: ['admin'],
  },
  {
    key: 'projectUsers',
    page: ['projectAdmin', 'admin'],
    group: 'users',
    titleKey: 'webui.menu.Users',
    kind: 'custom',
    Component: UsersPanel,
    detailLink: listLink('users', {
      projectAdmin: 'webui.menu.ProjectMembers',
      admin: 'webui.menu.Users',
    }),
    defaultSize: size(2, 2),
    minSize: size(2, 2),
    defaultHidden: ['admin'],
  },
  {
    key: 'projectAuditLog',
    page: ['projectAdmin', 'admin'],
    group: 'activity',
    titleKey: 'auditLog.AuditLog',
    kind: 'custom',
    Component: AuditLogPanel,
    defaultSize: size(4, 4),
    minSize: size(2, 3),
    settings: ['range'],
    ...adminOrder('projectAuditLog'),
  },
  {
    key: 'resourceGroupCapacity',
    page: ['projectAdmin', 'admin'],
    group: 'resource',
    titleKey: 'dashboard.card.ResourceGroupCapacity',
    kind: 'custom',
    Component: ResourceGroupCapacityPanel,
    defaultSize: size(4, 2),
    minSize: size(2, 2),
    settings: ['resourceGroup'],
    defaultHidden: true,
  },
];

const SUPERADMIN_ONLY = { role: 'superadmin' } as const;

/** Cards only the superadmin page has: cluster-wide and superadmin-only fields. */
const SUPERADMIN_PANELS: ReadonlyArray<PanelDefinition> = [
  {
    key: 'schedulingFailures',
    page: ['admin'],
    group: 'session',
    titleKey: 'dashboard.card.SchedulingFailures',
    requires: SUPERADMIN_ONLY,
    kind: 'custom',
    Component: SchedulingFailuresPanel,
    defaultSize: size(4, 4),
    minSize: size(2, 3),
    settings: ['range'],
    ...adminOrder('schedulingFailures'),
  },
  {
    key: 'activeAgents',
    page: ['admin'],
    group: 'resource',
    titleKey: 'dashboard.card.Agents',
    requires: SUPERADMIN_ONLY,
    kind: 'custom',
    Component: AgentsPanel,
    detailLink: listLink(
      'agent',
      { admin: 'webui.menu.Resources' },
      { status: 'ALIVE' },
    ),
    defaultSize: size(4, 4),
    minSize: size(2, 3),
    ...adminOrder('activeAgents'),
  },
  {
    key: 'agentStats',
    page: ['admin'],
    group: 'resource',
    titleKey: 'agentStats.AgentStats',
    requires: SUPERADMIN_ONLY,
    kind: 'custom',
    Component: AgentStatsPanel,
    detailLink: listLink('agent', { admin: 'webui.menu.Resources' }),
    defaultSize: size(2, 2),
    minSize: size(2, 2),
    ...adminOrder('agentStats'),
  },
  {
    key: 'failuresByEntityType',
    page: ['admin'],
    group: 'activity',
    titleKey: 'dashboard.card.FailuresByEntityType',
    requires: SUPERADMIN_ONLY,
    kind: 'custom',
    Component: FailuresByEntityTypePanel,
    defaultSize: size(2, 3),
    minSize: size(2, 3),
    settings: ['range'],
    ...adminOrder('failuresByEntityType'),
  },
  {
    key: 'topProjectsUsage',
    page: ['admin'],
    group: 'resource',
    titleKey: 'dashboard.card.TopProjectsByUsage',
    requires: SUPERADMIN_ONLY,
    kind: 'custom',
    Component: TopProjectsUsagePanel,
    defaultSize: size(4, 3),
    minSize: size(2, 3),
    settings: ['resourceGroup'],
    ...adminOrder('topProjectsUsage'),
  },
  {
    key: 'fairShare',
    page: ['admin'],
    group: 'resource',
    titleKey: 'webui.menu.FairShare',
    requires: SUPERADMIN_ONLY,
    kind: 'custom',
    Component: FairSharePanel,
    detailLink: listLink('scheduler', { admin: 'webui.menu.Scheduler' }),
    defaultSize: size(4, 3),
    minSize: size(2, 3),
    settings: ['resourceGroup'],
    ...adminOrder('fairShare'),
  },
  {
    // The member page's My Recent Sessions over the domain; the key is the one stored boards already carry.
    key: 'recentlyCreatedSession',
    page: ['admin'],
    group: 'session',
    titleKey: 'session.RecentlyCreatedSessions',
    kind: 'custom',
    Component: RecentSessionsPanel,
    detailLink: listLink('session', SESSIONS),
    defaultSize: size(4, 3),
    minSize: size(2, 2),
    defaultHidden: true,
  },
  {
    key: 'resourcePolicies',
    page: ['admin'],
    group: 'resource',
    titleKey: 'dashboard.card.ResourcePolicies',
    requires: SUPERADMIN_ONLY,
    kind: 'custom',
    Component: ResourcePoliciesPanel,
    detailLink: listLink('resource-policy', {
      admin: 'webui.menu.ResourcePolicies',
    }),
    defaultSize: size(2, 2),
    minSize: size(2, 2),
    defaultHidden: true,
  },
  {
    key: 'failedLogins',
    page: ['admin'],
    group: 'users',
    titleKey: 'dashboard.card.FailedLogins',
    requires: SUPERADMIN_ONLY,
    kind: 'custom',
    Component: FailedLoginsPanel,
    detailLink: listLink(
      'users',
      { admin: 'webui.menu.Users' },
      { tab: 'credentials' },
    ),
    defaultSize: size(2, 3),
    minSize: size(2, 3),
    settings: ['range'],
    defaultHidden: true,
  },
  {
    key: 'containerRegistries',
    page: ['admin'],
    group: 'other',
    titleKey: 'dashboard.card.ContainerRegistries',
    requires: SUPERADMIN_ONLY,
    kind: 'custom',
    Component: ContainerRegistriesPanel,
    detailLink: listLink(
      'environment',
      { admin: 'webui.menu.Environments' },
      { tab: 'registry' },
    ),
    defaultSize: size(4, 3),
    minSize: size(2, 2),
    defaultHidden: true,
  },
];
const sizesOf = (panelType: PanelType) => {
  const layout = DEFAULT_PANEL_LAYOUTS[panelType];
  return {
    defaultSize: size(layout.columnSpan ?? 2, layout.rowSpan ?? 2),
    minSize: size(
      layout.definition?.minColumnSpan ?? 1,
      layout.definition?.minRowSpan ?? 2,
    ),
  };
};

/** The custom-panel family: one preset per data source, added through the panel modal. */
const PRESET_PANELS: ReadonlyArray<PanelDefinition> = resourceKeys.map(
  (source) => {
    const { labelKey, minRole } = resourceRegistry[source];
    return {
      key: presetKey(source),
      page: ALL_PAGES,
      group: 'other',
      titleKey: labelKey,
      ...(minRole
        ? {
            requires: {
              role: minRole === 'superadmin' ? 'superadmin' : 'projectAdmin',
            },
          }
        : {}),
      kind: 'preset',
      source,
      ...(resourceRegistry[source].supportsResourceGroup
        ? { settings: ['resourceGroup'] as const }
        : {}),
      viz: 'table',
      ...sizesOf('resourceTable'),
      sizeByViz: {
        table: sizesOf('resourceTable'),
        stat: sizesOf('resourceCount'),
        grid: sizesOf('sessionResourceGrid'),
      },
    };
  },
);

export const PANEL_CATALOG: ReadonlyArray<PanelDefinition> = [
  ...MEMBER_PANELS,
  ...PROJECT_ADMIN_PANELS,
  ...SUPERADMIN_PANELS,
  ...PRESET_PANELS,
];
