/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useWebUINavigate } from '../../hooks';
import { useCurrentUserRole } from '../../hooks/backendai';
import { useProjectPath } from '../../hooks/useRouteScope';
import ActiveAgents from '../ActiveAgents';
import AgentStats from '../AgentStats';
import MyResource from '../MyResource';
import MyResourceWithinResourceGroup from '../MyResourceWithinResourceGroup';
import QuotaPerStorageVolumeDashboardItem from '../QuotaPerStorageVolumeDashboardItem';
import RecentlyCreatedSession from '../RecentlyCreatedSession';
import SessionCountDashboardItem from '../SessionCountDashboardItem';
import StorageStatusPanelCard from '../StorageStatusPanelCard';
import TotalResourceWithinResourceGroup from '../TotalResourceWithinResourceGroup';
import { useDashboardRefreshQuery } from './DashboardRefreshContext';
import { DEFAULT_PANEL_LAYOUTS, presetKey } from './defaults';
import { resourceKeys, resourceRegistry } from './resourceRegistry';
import type {
  PanelComponentProps,
  PanelDefinition,
  PanelPage,
  PanelSize,
  PanelType,
} from './types';
import {
  superadminResourceGroupAtom,
  useDashboardFilterContext,
  useDashboardProject,
} from './useDashboardFilters';
import { useTheme } from '@lablup/ui-common/theme';
import {
  BAIBoardItemErrorBoundary,
  BAIScopedResourceGroupSelect,
  BAISkeleton,
} from 'backend.ai-ui';
import { useSetAtom } from 'jotai';
import React, { Suspense, useTransition } from 'react';
import { useTranslation } from 'react-i18next';

// The built-in cards as catalog components, each wrapped exactly as the pages
// wrapped it before the catalog existed.

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

const MySessionPanel: React.FC<PanelComponentProps> = ({ queryRefs }) => {
  'use memo';
  const { t } = useTranslation();
  const userRole = useCurrentUserRole();
  return queryRefs.sessionCountQueryRef ? (
    <Suspense fallback={<InlineSkeleton />}>
      <SessionCountDashboardItem
        queryRef={queryRefs.sessionCountQueryRef}
        title={
          userRole === 'superadmin'
            ? t('session.ActiveSessions')
            : t('session.MySessions')
        }
      />
    </Suspense>
  ) : null;
};

const ActiveSessionsPanel: React.FC<PanelComponentProps> = ({ queryRefs }) => {
  'use memo';
  const { t } = useTranslation();
  return queryRefs.sessionCountQueryRef ? (
    <Suspense fallback={<InlineSkeleton />}>
      <SessionCountDashboardItem
        queryRef={queryRefs.sessionCountQueryRef}
        title={t('session.ActiveSessions')}
      />
    </Suspense>
  ) : null;
};

const MyResourcePanel: React.FC<PanelComponentProps> = ({
  fetchKey,
  isRefetching,
}) => {
  'use memo';
  const { t } = useTranslation();
  return (
    <BAIBoardItemErrorBoundary
      title={t('webui.menu.MyResources')}
      status="error"
    >
      <Suspense fallback={<PaddedSkeleton />}>
        <MyResource
          fetchKey={fetchKey}
          refetching={isRefetching}
          hideRefreshButton
        />
      </Suspense>
    </BAIBoardItemErrorBoundary>
  );
};

const MyResourceWithinResourceGroupPanel: React.FC<PanelComponentProps> = ({
  fetchKey,
  isRefetching,
}) => {
  'use memo';
  const { t } = useTranslation();
  return (
    <BAIBoardItemErrorBoundary
      title={t('webui.menu.MyResourcesInResourceGroup')}
      status="error"
    >
      <Suspense fallback={<PaddedSkeleton />}>
        <MyResourceWithinResourceGroup
          fetchKey={fetchKey}
          refetching={isRefetching}
          hideRefreshButton
        />
      </Suspense>
    </BAIBoardItemErrorBoundary>
  );
};

const FolderStatusPanel: React.FC<PanelComponentProps> = ({ fetchKey }) => {
  'use memo';
  const { t } = useTranslation();
  const webuiNavigate = useWebUINavigate();
  const buildProjectPath = useProjectPath();
  return (
    <BAIBoardItemErrorBoundary title={t('data.FolderStatus')} status="error">
      <Suspense fallback={<PaddedSkeleton />}>
        <StorageStatusPanelCard
          fetchKey={fetchKey}
          onRequestBadgeClick={() => {
            webuiNavigate({
              pathname: buildProjectPath('data'),
              search: new URLSearchParams({ invitation: 'true' }).toString(),
            });
          }}
        />
      </Suspense>
    </BAIBoardItemErrorBoundary>
  );
};

const QuotaPerStorageVolumePanel: React.FC<PanelComponentProps> = () => {
  'use memo';
  const { t } = useTranslation();
  useDashboardRefreshQuery(['vhostInfo']);
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

const TotalResourceWithinResourceGroupPanel: React.FC<PanelComponentProps> = ({
  queryRefs,
  isRefetching,
  scope,
}) => {
  'use memo';
  const { t } = useTranslation();
  const filters = useDashboardFilterContext();
  const setSuperadminResourceGroup = useSetAtom(superadminResourceGroupAtom);
  const [isPending, startTransition] = useTransition();
  // The superadmin page has no header project: its picker lists the whole domain.
  const domainScope =
    scope.kind === 'projects' && scope.projectIds === 'all'
      ? scope.domain
      : null;
  return queryRefs.totalResourceQueryRef ? (
    <TotalResourceWithinResourceGroup
      queryRef={queryRefs.totalResourceQueryRef}
      refetching={isRefetching || isPending}
      hideRefreshButton
      {...(domainScope
        ? {
            resourceGroup: filters?.currentResourceGroup ?? undefined,
            resourceGroupSelect: (
              <BAIScopedResourceGroupSelect
                label={t('general.ResourceGroup')}
                isLabelHidden
                scope={{ domain: [{ value: domainScope.id }] }}
                value={filters?.currentResourceGroup ?? null}
                onChange={(value) =>
                  startTransition(() =>
                    setSuperadminResourceGroup(
                      typeof value === 'string' ? value : null,
                    ),
                  )
                }
              />
            ),
          }
        : {})}
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
  return queryRefs.recentSessionsQueryRef ? (
    <RecentlyCreatedSession
      queryRef={queryRefs.recentSessionsQueryRef}
      project={project}
    />
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

/** The cards the project and admin dashboards hard-coded before the catalog. */
const BUILTIN_PANELS: ReadonlyArray<PanelDefinition> = [
  {
    key: 'mySession',
    page: ['project'],
    group: 'session',
    titleKey: 'session.MySessions',
    superadminTitleKey: 'session.ActiveSessions',
    kind: 'custom',
    Component: MySessionPanel,
    defaultSize: size(2, 2),
    minSize: size(2, 2),
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
  },
  {
    key: 'myResource',
    page: ['project'],
    group: 'resource',
    titleKey: 'webui.menu.MyResources',
    kind: 'custom',
    Component: MyResourcePanel,
    defaultSize: size(2, 2),
    minSize: size(2, 2),
  },
  {
    key: 'myResourceWithinResourceGroup',
    page: ['project'],
    group: 'resource',
    titleKey: 'webui.menu.MyResourcesInResourceGroup',
    kind: 'custom',
    Component: MyResourceWithinResourceGroupPanel,
    defaultSize: size(2, 2),
    minSize: size(2, 2),
  },
  {
    key: 'folderStatus',
    page: ['project'],
    group: 'resource',
    titleKey: 'data.FolderStatus',
    kind: 'custom',
    Component: FolderStatusPanel,
    defaultSize: size(2, 2),
    minSize: size(2, 2),
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
  },
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
  },
  {
    key: 'recentlyCreatedSession',
    page: ['project', 'admin'],
    group: 'session',
    titleKey: 'session.RecentlyCreatedSessions',
    kind: 'custom',
    Component: RecentlyCreatedSessionPanel,
    defaultSize: size(4, 3),
    minSize: size(2, 2),
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
  ...BUILTIN_PANELS,
  ...PRESET_PANELS,
];
