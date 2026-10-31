/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import DashboardPanelBoard from '../components/DashboardPanels/DashboardPanelBoard';
import { DashboardRefreshProvider } from '../components/DashboardPanels/DashboardRefreshContext';
import { PANEL_CATALOG } from '../components/DashboardPanels/panelCatalog';
import SessionDetailAndContainerLogOpenerLegacy from '../components/SessionDetailAndContainerLogOpenerLegacy';
import { useUrlProjectValidity } from '../hooks/useUrlProjectValidity';
import type { ProjectContextOrNull } from '../types/projectContext';

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

  return (
    <>
      <DashboardPanelBoard
        page={page}
        project={project}
        catalog={PANEL_CATALOG}
        isRefetching={false}
        queryRefs={{}}
      />
      {/* TODO(FR-2944): open the session detail here once a v2 detail flow exists; the v1
          compute_session_node path gives a project admin no rights on other members' sessions. */}
      {page === 'admin' ? (
        <SessionDetailAndContainerLogOpenerLegacy project={project} />
      ) : null}
    </>
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
