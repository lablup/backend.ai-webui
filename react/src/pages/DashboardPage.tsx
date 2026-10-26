/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DashboardPageQuery } from '../__generated__/DashboardPageQuery.graphql';
import DashboardPanelBoard from '../components/DashboardPanels/DashboardPanelBoard';
import { PANEL_CATALOG } from '../components/DashboardPanels/panelCatalog';
import { useIsAvailableTotalResourceWithinResourceGroup } from '../components/TotalResourceWithinResourceGroup';
import { useCurrentUserRole } from '../hooks/backendai';
import {
  useCurrentProjectValue,
  useCurrentResourceGroupValue,
} from '../hooks/useCurrentProject';
import { INITIAL_FETCH_KEY, useFetchKey, useInterval } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { useDeferredValue, useTransition } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

const DashboardPage: React.FC = () => {
  'use memo';
  const currentProject = useCurrentProjectValue();
  const currentResourceGroup = useCurrentResourceGroupValue();
  const userRole = useCurrentUserRole();

  const [fetchKey, updateFetchKey] = useFetchKey();
  // Deferred so the interval refetch suspends in the background instead of
  // dropping the whole page into the route fallback every 15s (FR-3386).
  const deferredFetchKey = useDeferredValue(fetchKey);
  const [isPendingIntervalRefetch, startIntervalRefetchTransition] =
    useTransition();
  const isRefetching =
    isPendingIntervalRefetch || fetchKey !== deferredFetchKey;

  const isAvailableTotalResourcePanel =
    useIsAvailableTotalResourceWithinResourceGroup();

  const queryRef = useLazyLoadQuery<DashboardPageQuery>(
    graphql`
      query DashboardPageQuery(
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
          @include(if: $isSuperAdmin)
          @alias
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

  useInterval(() => {
    startIntervalRefetchTransition(() => {
      updateFetchKey();
    });
  }, 15_000);

  return (
    <DashboardPanelBoard
      page="project"
      catalog={PANEL_CATALOG}
      fetchKey={deferredFetchKey}
      isRefetching={isRefetching}
      queryRefs={{
        queryRef,
        totalResourceQueryRef:
          queryRef.TotalResourceWithinResourceGroupFragment,
        agentStatsQueryRef: queryRef.AgentStatsFragment,
      }}
      onRefresh={() => updateFetchKey()}
    />
  );
};

export default DashboardPage;
