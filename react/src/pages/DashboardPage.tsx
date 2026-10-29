/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DashboardPageQuery } from '../__generated__/DashboardPageQuery.graphql';
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
import { useIsAvailableTotalResourceWithinResourceGroup } from '../components/TotalResourceWithinResourceGroup';
import { useCurrentUserRole } from '../hooks/backendai';
import {
  useCurrentProjectValue,
  useCurrentResourceGroupValue,
} from '../hooks/useCurrentProject';
import { toProjectContext } from '../types/projectContext';
import { INITIAL_FETCH_KEY } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { useDeferredValue } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

const DashboardPageContent: React.FC = () => {
  'use memo';
  const currentProject = useCurrentProjectValue();
  const currentResourceGroup = useCurrentResourceGroupValue();
  const userRole = useCurrentUserRole();

  // The cards that still read this query refresh with it on the dashboard timer.
  const renderedKeys = useRenderedPanelKeys('project', PANEL_CATALOG);
  const { fetchKey } = useDashboardFetchKey('page-query');
  // Deferred so a refresh suspends in the background instead of dropping the
  // whole page into the route fallback (FR-3386).
  const deferredFetchKey = useDeferredValue(fetchKey);
  // Deferred so adding a card fetches its fragment without suspending the page.
  const fragmentsKey = pageQueryFragments(renderedKeys).join(',');
  const deferredFragmentsKey = useDeferredValue(fragmentsKey);
  const includes = (fragment: PageQueryFragment) =>
    deferredFragmentsKey.split(',').includes(fragment);
  // With no card reading the query, a tick has nothing to refresh.
  const queryFetchKey = fragmentsKey ? deferredFetchKey : INITIAL_FETCH_KEY;
  const isRefetching =
    fetchKey !== deferredFetchKey || fragmentsKey !== deferredFragmentsKey;

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
        $withSessionCount: Boolean!
        $withRecentSessions: Boolean!
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
      }
    `,
    {
      scopeId: `project:${currentProject.id}`,
      resourceGroup: currentResourceGroup || 'default',
      skipTotalResourceWithinResourceGroup:
        !isAvailableTotalResourcePanel || !includes('totalResource'),
      isSuperAdmin: _.isEqual(userRole, 'superadmin'),
      agentNodeFilter: `schedulable == true & status == "ALIVE" & scaling_group == "${currentResourceGroup}"`,
      withSessionCount: includes('sessionCount'),
      withRecentSessions: includes('recentSessions'),
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
      page="project"
      project={toProjectContext(currentProject)}
      catalog={PANEL_CATALOG}
      isRefetching={isRefetching}
      queryRefs={{
        sessionCountQueryRef: queryRef.SessionCountDashboardItemFragment,
        recentSessionsQueryRef: queryRef.RecentlyCreatedSessionFragment,
        totalResourceQueryRef:
          queryRef.TotalResourceWithinResourceGroupFragment,
      }}
    />
  );
};

const DashboardPage: React.FC = () => (
  <DashboardRefreshProvider>
    <DashboardPageContent />
  </DashboardRefreshProvider>
);

export default DashboardPage;
