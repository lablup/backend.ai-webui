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
import { PANEL_CATALOG } from '../components/DashboardPanels/panelCatalog';
import { useIsAvailableTotalResourceWithinResourceGroup } from '../components/TotalResourceWithinResourceGroup';
import { useCurrentUserRole } from '../hooks/backendai';
import {
  useCurrentProjectValue,
  useCurrentResourceGroupValue,
} from '../hooks/useCurrentProject';
import { INITIAL_FETCH_KEY } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { useDeferredValue } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

const AdminDashboardPageContent: React.FC = () => {
  'use memo';
  const currentProject = useCurrentProjectValue();
  const currentResourceGroup = useCurrentResourceGroupValue();
  const userRole = useCurrentUserRole();

  const { fetchKey } = useDashboardFetchKey('page-query', '30s');
  const deferredFetchKey = useDeferredValue(fetchKey);
  const isRefetching = fetchKey !== deferredFetchKey;

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
      ) {
        ...SessionCountDashboardItemFragment @arguments(scopeId: $scopeId)
        ...RecentlyCreatedSessionFragment @arguments(scopeId: $scopeId)
        ...TotalResourceWithinResourceGroupFragment
          @skip(if: $skipTotalResourceWithinResourceGroup)
          @alias
          @arguments(
            resourceGroup: $resourceGroup
            isSuperAdmin: $isSuperAdmin
            agentNodeFilter: $agentNodeFilter
          )
        ...AgentStatsFragment
          @arguments(
            aliveAgentFilter: $aliveAgentFilter
            schedulableAgentFilter: $schedulableAgentFilter
          )
      }
    `,
    {
      scopeId: `project:${currentProject.id}`,
      resourceGroup: currentResourceGroup || 'default',
      skipTotalResourceWithinResourceGroup: !isAvailableTotalResourcePanel,
      isSuperAdmin: _.isEqual(userRole, 'superadmin'),
      agentNodeFilter: `schedulable == true & status == "ALIVE" & scaling_group == "${currentResourceGroup}"`,
      aliveAgentFilter: 'status == "ALIVE"',
      schedulableAgentFilter: 'status == "ALIVE" & schedulable == true',
    },
    {
      fetchPolicy:
        deferredFetchKey === INITIAL_FETCH_KEY
          ? 'store-and-network'
          : 'network-only',
      fetchKey: deferredFetchKey,
    },
  );

  return (
    <DashboardPanelBoard
      page="admin"
      catalog={PANEL_CATALOG}
      isRefetching={isRefetching}
      queryRefs={{
        queryRef,
        totalResourceQueryRef:
          queryRef.TotalResourceWithinResourceGroupFragment,
        agentStatsQueryRef: queryRef,
      }}
    />
  );
};

const AdminDashboardPage: React.FC = () => (
  <DashboardRefreshProvider>
    <AdminDashboardPageContent />
  </DashboardRefreshProvider>
);

export default AdminDashboardPage;
