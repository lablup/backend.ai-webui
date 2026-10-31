/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AdminDashboardPageQuery } from '../__generated__/AdminDashboardPageQuery.graphql';
import DashboardPanelBoard from '../components/DashboardPanels/DashboardPanelBoard';
import {
  DashboardRefreshProvider,
  useDashboardFetchKey,
} from '../components/DashboardPanels/DashboardRefreshContext';
import {
  pageQueryFragments,
  type PageQueryFragment,
} from '../components/DashboardPanels/pageQuery';
import { PANEL_CATALOG } from '../components/DashboardPanels/panelCatalog';
import { useRenderedPanelKeys } from '../components/DashboardPanels/useDashboardBoard';
import { usePageResourceGroup } from '../components/DashboardPanels/useDashboardFilters';
import { useIsAvailableTotalResourceWithinResourceGroup } from '../components/TotalResourceWithinResourceGroup';
import { useCurrentDomainValue } from '../hooks';
import { useCurrentUserRole } from '../hooks/backendai';
import { useUrlProjectValidity } from '../hooks/useUrlProjectValidity';
import type { ProjectContextOrNull } from '../types/projectContext';
import { INITIAL_FETCH_KEY } from 'backend.ai-ui';
import { useDeferredValue } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

export interface AdminDashboardPageProps {
  /** `projectAdmin` at `/project/:projectName/admin/dashboard`, `admin` at `/admin/dashboard`. */
  page: 'projectAdmin' | 'admin';
}

const AdminDashboardPageContent: React.FC<AdminDashboardPageProps> = ({
  page,
}) => {
  'use memo';
  // The project admin page takes its project from the URL only (ADR 0001); the
  // superadmin page has none and reads the current domain (ADR 0012).
  const { urlProjectName, resolvedId } = useUrlProjectValidity();
  const project: ProjectContextOrNull =
    page === 'projectAdmin' && urlProjectName && resolvedId
      ? { id: resolvedId, name: urlProjectName }
      : null;
  const currentDomainName = useCurrentDomainValue();
  const currentResourceGroup = usePageResourceGroup(page);
  const isSuperAdmin = useCurrentUserRole() === 'superadmin';

  const renderedKeys = useRenderedPanelKeys(page, PANEL_CATALOG);
  const { fetchKey, isPending } = useDashboardFetchKey('page-query');
  const deferredFetchKey = useDeferredValue(fetchKey);
  // Deferred so adding a card fetches its fragment without suspending the page.
  const fragmentsKey = pageQueryFragments(renderedKeys).join(',');
  const deferredFragmentsKey = useDeferredValue(fragmentsKey);
  const includes = (fragment: PageQueryFragment) =>
    deferredFragmentsKey.split(',').includes(fragment);
  // With no card reading the query, a tick has nothing to refresh.
  const queryFetchKey = fragmentsKey ? deferredFetchKey : INITIAL_FETCH_KEY;
  const isRefetching = isPending || fragmentsKey !== deferredFragmentsKey;

  const isAvailableTotalResourcePanel =
    useIsAvailableTotalResourceWithinResourceGroup();

  const queryRef = useLazyLoadQuery<AdminDashboardPageQuery>(
    graphql`
      query AdminDashboardPageQuery(
        $scopeId: ScopeField
        $resourceGroup: String
        $skipTotalResourceWithinResourceGroup: Boolean!
        $isSuperAdmin: Boolean!
        $agentNodeFilter: String!
        $aliveAgentFilter: String!
        $schedulableAgentFilter: String!
        $withSessionCount: Boolean!
        $withRecentSessions: Boolean!
        $withAgentStats: Boolean!
      ) {
        ...SessionCountDashboardItemFragment
          @include(if: $withSessionCount)
          @alias
          @arguments(scopeId: $scopeId)
        ...RecentlyCreatedSessionFragment
          @include(if: $withRecentSessions)
          @alias
          @arguments(scopeId: $scopeId)
        ...TotalResourceWithinResourceGroupFragment
          @skip(if: $skipTotalResourceWithinResourceGroup)
          @alias
          @arguments(
            resourceGroup: $resourceGroup
            isSuperAdmin: $isSuperAdmin
            agentNodeFilter: $agentNodeFilter
          )
        ...AgentStatsFragment
          @include(if: $withAgentStats)
          @alias
          @arguments(
            aliveAgentFilter: $aliveAgentFilter
            schedulableAgentFilter: $schedulableAgentFilter
          )
      }
    `,
    {
      scopeId: project
        ? `project:${project.id}`
        : `domain:${currentDomainName}`,
      resourceGroup: currentResourceGroup || 'default',
      skipTotalResourceWithinResourceGroup:
        !isAvailableTotalResourcePanel || !includes('totalResource'),
      isSuperAdmin,
      agentNodeFilter: `schedulable == true & status == "ALIVE" & scaling_group == "${currentResourceGroup}"`,
      aliveAgentFilter: 'status == "ALIVE"',
      schedulableAgentFilter: 'status == "ALIVE" & schedulable == true',
      withSessionCount: includes('sessionCount'),
      withRecentSessions: includes('recentSessions'),
      // The catalog shows the agent stats card to superadmins only.
      withAgentStats: isSuperAdmin && includes('agentStats'),
    },
    {
      fetchPolicy:
        queryFetchKey === INITIAL_FETCH_KEY
          ? 'store-and-network'
          : 'network-only',
      fetchKey: queryFetchKey,
    },
  );

  return (
    <DashboardPanelBoard
      page={page}
      project={project}
      catalog={PANEL_CATALOG}
      isRefetching={isRefetching}
      queryRefs={{
        sessionCountQueryRef: queryRef.SessionCountDashboardItemFragment,
        recentSessionsQueryRef: queryRef.RecentlyCreatedSessionFragment,
        totalResourceQueryRef:
          queryRef.TotalResourceWithinResourceGroupFragment,
        agentStatsQueryRef: queryRef.AgentStatsFragment,
      }}
    />
  );
};

const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ page }) => {
  'use memo';
  return (
    <DashboardRefreshProvider>
      <AdminDashboardPageContent page={page} />
    </DashboardRefreshProvider>
  );
};

export default AdminDashboardPage;
