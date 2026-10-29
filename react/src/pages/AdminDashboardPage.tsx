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
