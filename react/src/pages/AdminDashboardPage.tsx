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
import SessionDetailAndContainerLogOpenerLegacy from '../components/SessionDetailAndContainerLogOpenerLegacy';
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
  const isSuperAdmin = useCurrentUserRole() === 'superadmin';

  const { fetchKey } = useDashboardFetchKey('page-query', '30s');
  const deferredFetchKey = useDeferredValue(fetchKey);
  const isRefetching = fetchKey !== deferredFetchKey;

  const queryRef = useLazyLoadQuery<AdminDashboardPageQuery>(
    graphql`
      query AdminDashboardPageQuery(
        $isSuperAdmin: Boolean!
        $aliveAgentFilter: String!
        $schedulableAgentFilter: String!
      ) {
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
      isSuperAdmin,
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
    <>
      <DashboardPanelBoard
        page={page}
        project={project}
        catalog={PANEL_CATALOG}
        isRefetching={isRefetching}
        queryRefs={{ agentStatsQueryRef: queryRef.AgentStatsFragment }}
      />
      {/* Session names in the cards open the drawer through `sessionDetail`. */}
      <SessionDetailAndContainerLogOpenerLegacy project={project} />
    </>
  );
};

const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ page }) => (
  <DashboardRefreshProvider>
    <AdminDashboardPageContent page={page} />
  </DashboardRefreshProvider>
);

export default AdminDashboardPage;
