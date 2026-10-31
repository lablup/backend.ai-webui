/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import DashboardPanelBoard from '../components/DashboardPanels/DashboardPanelBoard';
import { DashboardRefreshProvider } from '../components/DashboardPanels/DashboardRefreshContext';
import { PANEL_CATALOG } from '../components/DashboardPanels/panelCatalog';
import ErrorBoundaryWithNullFallback from '../components/ErrorBoundaryWithNullFallback';
import FolderInvitationNotifier from '../components/FolderInvitationNotifier';
import SessionDetailAndContainerLogOpenerLegacy from '../components/SessionDetailAndContainerLogOpenerLegacy';
import StartFromURLDeepLinkOpener from '../components/StartFromURLDeepLinkOpener';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { toProjectContext } from '../types/projectContext';
import { Suspense } from 'react';

/** The member dashboard: every card owns its query and follows the filter bar. */
const DashboardPage: React.FC = () => {
  'use memo';
  const project = toProjectContext(useCurrentProjectValue());
  return (
    <DashboardRefreshProvider>
      <DashboardPanelBoard
        page="project"
        project={project}
        catalog={PANEL_CATALOG}
        isRefetching={false}
        queryRefs={{}}
      />
      {/* The session cards and the custom session panels open the drawer through `sessionDetail`. */}
      <SessionDetailAndContainerLogOpenerLegacy project={project} />
      <StartFromURLDeepLinkOpener />
      <ErrorBoundaryWithNullFallback>
        <Suspense fallback={null}>
          <FolderInvitationNotifier />
        </Suspense>
      </ErrorBoundaryWithNullFallback>
    </DashboardRefreshProvider>
  );
};

export default DashboardPage;
