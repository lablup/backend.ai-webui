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
  const isSuperAdmin = useCurrentUserRole() === 'superadmin';

  const { fetchKey } = useDashboardFetchKey('page-query');
  const deferredFetchKey = useDeferredValue(fetchKey);
  const isRefetching = fetchKey !== deferredFetchKey;

  const queryRef = useLazyLoadQuery<AdminDashboardPageQuery>(
    graphql`
      query AdminDashboardPageQuery(
        $scopeId: ScopeField
        $isSuperAdmin: Boolean!
        $aliveAgentFilter: String!
        $schedulableAgentFilter: String!
      ) {
        ...SessionCountDashboardItemFragment @arguments(scopeId: $scopeId)
        ...RecentlyCreatedSessionFragment @arguments(scopeId: $scopeId)
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
      scopeId: project
        ? `project:${project.id}`
        : `domain:${currentDomainName}`,
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
        queryRefs={{
          queryRef,
          agentStatsQueryRef: queryRef.AgentStatsFragment,
        }}
      />
      {/* TODO(FR-2944): open the session detail here once a v2 detail flow exists; the v1
          compute_session_node path gives a project admin no rights on other members' sessions. */}
      {page === 'admin' ? (
        <SessionDetailAndContainerLogOpenerLegacy project={project} />
      ) : null}
    </>
  );
};

const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ page }) => (
  <DashboardRefreshProvider>
    <AdminDashboardPageContent page={page} />
  </DashboardRefreshProvider>
);

export default AdminDashboardPage;
