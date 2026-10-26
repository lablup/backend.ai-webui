/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import ActiveAgents from '../ActiveAgents';
import AgentStats from '../AgentStats';
import QuotaPerStorageVolumeDashboardItem from '../QuotaPerStorageVolumeDashboardItem';
import RecentlyCreatedSession from '../RecentlyCreatedSession';
import SessionCountDashboardItem from '../SessionCountDashboardItem';
import TotalResourceWithinResourceGroup from '../TotalResourceWithinResourceGroup';
import { useDashboardRefreshQuery } from './DashboardRefreshContext';
import { DEFAULT_PANEL_LAYOUTS, presetKey } from './defaults';
import MyActivityPanel from './memberCards/MyActivityPanel';
import MyDeploymentsPanel from './memberCards/MyDeploymentsPanel';
import MyFoldersPanel from './memberCards/MyFoldersPanel';
import MyRecentSessionsPanel from './memberCards/MyRecentSessionsPanel';
import MyResourcesPanel from './memberCards/MyResourcesPanel';
import MySessionsPanel from './memberCards/MySessionsPanel';
import ResourceGroupTotalPanel from './memberCards/ResourceGroupTotalPanel';
import ResourcePresetsPanel from './memberCards/ResourcePresetsPanel';
import {
  CreateFolderPanel,
  StartBatchSessionPanel,
  StartDeploymentPanel,
  StartFromURLPanel,
  StartSessionPanel,
} from './memberCards/StartActionPanels';
import { resourceKeys, resourceRegistry } from './resourceRegistry';
import type {
  PanelComponentProps,
  PanelDefinition,
  PanelPage,
  PanelSize,
  PanelType,
} from './types';
import { useDashboardProject } from './useDashboardFilters';
import { useTheme } from '@lablup/ui-common/theme';
import { BAIBoardItemErrorBoundary, BAISkeleton } from 'backend.ai-ui';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

// The admin pages' built-in cards, each wrapped as the page wrapped it before
// the catalog existed; the member cards live in `memberCards/`.

const InlineSkeleton: React.FC = () => {
  'use memo';
  const { token } = useTheme();
  return <BAISkeleton style={{ padding: `0px ${token('--spacing-5')}` }} />;
};

const PaddedSkeleton: React.FC = () => {
  'use memo';
  const { token } = useTheme();
  return <BAISkeleton style={{ padding: token('--spacing-5') }} />;
};

const ActiveSessionsPanel: React.FC<PanelComponentProps> = ({ queryRefs }) => {
  'use memo';
  const { t } = useTranslation();
  return queryRefs.queryRef ? (
    <Suspense fallback={<InlineSkeleton />}>
      <SessionCountDashboardItem
        queryRef={queryRefs.queryRef}
        title={t('session.ActiveSessions')}
      />
    </Suspense>
  ) : null;
};

const QuotaPerStorageVolumePanel: React.FC<PanelComponentProps> = () => {
  'use memo';
  const { t } = useTranslation();
  useDashboardRefreshQuery(['vhostInfo'], '5m');
  return (
    <BAIBoardItemErrorBoundary
      title={t('data.QuotaPerStorageVolume')}
      status="error"
    >
      <Suspense fallback={<PaddedSkeleton />}>
        <QuotaPerStorageVolumeDashboardItem />
      </Suspense>
    </BAIBoardItemErrorBoundary>
  );
};

const TotalResourceWithinResourceGroupPanel: React.FC<PanelComponentProps> = (
  props,
) => {
  'use memo';
  const { queryRefs, isRefetching, scope } = props;
  // The member page follows the filter bar's resource groups with its own query.
  if (scope.kind === 'mine') return <ResourceGroupTotalPanel {...props} />;
  return queryRefs.totalResourceQueryRef ? (
    <TotalResourceWithinResourceGroup
      queryRef={queryRefs.totalResourceQueryRef}
      refetching={isRefetching}
      hideRefreshButton
    />
  ) : null;
};

const AgentStatsPanel: React.FC<PanelComponentProps> = ({ queryRefs }) => {
  'use memo';
  return queryRefs.agentStatsQueryRef ? (
    <Suspense fallback={<InlineSkeleton />}>
      <AgentStats queryRef={queryRefs.agentStatsQueryRef} />
    </Suspense>
  ) : null;
};

const ActiveAgentsPanel: React.FC<PanelComponentProps> = ({
  fetchKey,
  onRefresh,
}) => {
  'use memo';
  return (
    <Suspense fallback={<InlineSkeleton />}>
      <ActiveAgents fetchKey={fetchKey} onChangeFetchKey={() => onRefresh()} />
    </Suspense>
  );
};

const RecentlyCreatedSessionPanel: React.FC<PanelComponentProps> = ({
  queryRefs,
}) => {
  'use memo';
  const project = useDashboardProject();
  return queryRefs.queryRef ? (
    <RecentlyCreatedSession queryRef={queryRefs.queryRef} project={project} />
  ) : null;
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

const START_SIZE = { defaultSize: size(1, 3), minSize: size(1, 2) };

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
    refresh: { min: '10m' },
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
    refresh: { min: '10m' },
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
    refresh: { min: '10m' },
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
    refresh: { min: '10m' },
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
    refresh: { min: '10m' },
  },
  {
    key: 'mySession',
    page: ['project'],
    group: 'session',
    titleKey: 'session.MySessions',
    kind: 'custom',
    Component: MySessionsPanel,
    defaultSize: size(2, 3),
    minSize: size(2, 2),
    refresh: { min: '15s' },
  },
  {
    key: 'activeSessions',
    page: ['projectAdmin', 'admin'],
    group: 'session',
    titleKey: 'session.ActiveSessions',
    kind: 'custom',
    Component: ActiveSessionsPanel,
    defaultSize: size(2, 2),
    minSize: size(2, 2),
    refresh: { min: '15s' },
  },
  {
    key: 'myRecentSessions',
    page: ['project'],
    group: 'session',
    titleKey: 'dashboard.card.MyRecentSessions',
    kind: 'custom',
    Component: MyRecentSessionsPanel,
    defaultSize: size(4, 3),
    minSize: size(2, 2),
    refresh: { min: '1m' },
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
    refresh: { min: '30s' },
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
    refresh: { min: '30s' },
  },
  {
    key: 'totalResourceWithinResourceGroup',
    page: ['project', 'admin'],
    group: 'resource',
    titleKey: 'webui.menu.TotalResourcesInResourceGroup',
    requires: {
      // Superadmins read `agent_nodes` even with hideAgents; others need `agent_summary_list`.
      config: (config, role) => role === 'superadmin' || !config.hideAgents,
    },
    kind: 'custom',
    Component: TotalResourceWithinResourceGroupPanel,
    defaultSize: size(2, 2),
    minSize: size(2, 2),
    refresh: { min: '30s' },
  },
  {
    key: 'folderStatus',
    page: ['project'],
    group: 'resource',
    titleKey: 'data.MyFolders',
    kind: 'custom',
    Component: MyFoldersPanel,
    defaultSize: size(2, 2),
    minSize: size(2, 2),
    refresh: { min: '5m' },
  },
  {
    key: 'quotaPerStorageVolume',
    page: ['project'],
    group: 'resource',
    titleKey: 'data.QuotaPerStorageVolume',
    kind: 'custom',
    Component: QuotaPerStorageVolumePanel,
    defaultSize: size(2, 2),
    minSize: size(2, 2),
    refresh: { min: '5m' },
  },
  {
    key: 'myDeployments',
    page: ['project'],
    group: 'deployment',
    titleKey: 'dashboard.card.MyDeployments',
    requires: { menuKey: 'deployments' },
    kind: 'custom',
    Component: MyDeploymentsPanel,
    defaultSize: size(2, 3),
    minSize: size(2, 2),
    refresh: { min: '30s' },
  },
  {
    key: 'myActivity',
    page: ['project'],
    group: 'activity',
    titleKey: 'dashboard.card.MyActivity',
    kind: 'custom',
    Component: MyActivityPanel,
    defaultSize: size(4, 3),
    minSize: size(2, 2),
    refresh: { min: '1m' },
  },
];

/** The admin pages' remaining built-in cards. */
const ADMIN_PANELS: ReadonlyArray<PanelDefinition> = [
  {
    key: 'agentStats',
    page: ['admin'],
    group: 'resource',
    titleKey: 'agentStats.AgentStats',
    requires: { role: 'superadmin' },
    kind: 'custom',
    Component: AgentStatsPanel,
    defaultSize: size(2, 2),
    minSize: size(2, 2),
    refresh: { min: '30s' },
  },
  {
    key: 'activeAgents',
    page: ['admin'],
    group: 'resource',
    titleKey: 'activeAgent.ActiveAgents',
    requires: { role: 'superadmin' },
    kind: 'custom',
    Component: ActiveAgentsPanel,
    defaultSize: size(4, 4),
    minSize: size(4, 3),
    refresh: { min: '15s' },
  },
  {
    key: 'recentlyCreatedSession',
    page: ['admin'],
    group: 'session',
    titleKey: 'session.RecentlyCreatedSessions',
    kind: 'custom',
    Component: RecentlyCreatedSessionPanel,
    defaultSize: size(4, 3),
    minSize: size(2, 2),
    refresh: { min: '1m' },
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
      refresh: { min: '1m' },
    };
  },
);

export const PANEL_CATALOG: ReadonlyArray<PanelDefinition> = [
  ...MEMBER_PANELS,
  ...ADMIN_PANELS,
  ...PRESET_PANELS,
];
