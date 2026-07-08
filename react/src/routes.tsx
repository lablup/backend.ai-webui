/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import BAIErrorBoundary, { ErrorView } from './components/BAIErrorBoundary';
import {
  DefaultProvidersForReactRoot,
  RoutingEventHandler,
} from './components/DefaultProviders';
import ErrorBoundaryWithNullFallback from './components/ErrorBoundaryWithNullFallback';
import FlexActivityIndicator from './components/FlexActivityIndicator';
import LocationStateBreadCrumb from './components/LocationStateBreadCrumb';
import LoginView from './components/LoginView';
import AdminScopeLayout from './components/MainLayout/AdminScopeLayout';
import MainLayout from './components/MainLayout/MainLayout';
import ProjectScopeLayout from './components/MainLayout/ProjectScopeLayout';
import { STokenLoginBoundary } from './components/STokenLoginBoundary';
import StorageHostFetchErrorBoundary from './components/StorageHostFetchErrorBoundary';
import WebUINavigate from './components/WebUINavigate';
import { persistPostLoginState } from './helper/loginSessionAuth';
import { useSuspendedBackendaiClient } from './hooks';
import { useAutoDiagnostics } from './hooks/useAutoDiagnostics';
import { useBAISettingUserState } from './hooks/useBAISetting';
import { LogoutEventHandler } from './hooks/useLogout';
import { useSToken } from './hooks/useSToken';
import {
  useWebUIMenuItems,
  populateRouterPaths,
} from './hooks/useWebUIMenuItems';
import { pluginApiEndpointState } from './hooks/useWebUIPluginState';
import { AdminRedirect, ProjectScopedRedirect } from './legacyRedirects';
// High priority to import the component
import ComputeSessionListPage from './pages/ComputeSessionListPage';
import Page404 from './pages/Page404';
import VFolderNodeListPage from './pages/VFolderNodeListPage';
import { Skeleton, theme } from 'antd';
import { BAIFlex, BAICard } from 'backend.ai-ui';
import { useSetAtom } from 'jotai';
import { parseAsString, useQueryStates } from 'nuqs';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { RouteObject, useParams } from 'react-router-dom';

const LoginViewLazy = React.lazy(() => import('./components/LoginView'));

const Information = React.lazy(() => import('./components/Information'));
const StartPage = React.lazy(() => import('./pages/StartPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const AdminDashboardPage = React.lazy(
  () => import('./pages/AdminDashboardPage'),
);
const EnvironmentPage = React.lazy(() => import('./pages/EnvironmentPage'));
const MyEnvironmentPage = React.lazy(() => import('./pages/MyEnvironmentPage'));
const UserSettingsPage = React.lazy(() => import('./pages/UserSettingsPage'));
const SessionLauncherPage = React.lazy(
  () => import('./pages/SessionLauncherPage'),
);
const ResourcePolicyPage = React.lazy(
  () => import('./pages/ResourcePolicyPage'),
);
const ResourcesPage = React.lazy(() => import('./pages/ResourcesPage'));
const FolderExplorerOpener = React.lazy(
  () => import('./components/FolderExplorerOpener'),
);
const FolderInvitationResponseModalOpener = React.lazy(
  () => import('./components/FolderInvitationResponseModalOpener'),
);
const FileUploadManager = React.lazy(
  () => import('./components/FileUploadManager'),
);

const DeploymentListPage = React.lazy(
  () => import('./pages/DeploymentListPage'),
);
const DeploymentDetailPage = React.lazy(
  () => import('./pages/DeploymentDetailPage'),
);
const AdminDeploymentListPage = React.lazy(
  () => import('./pages/AdminDeploymentListPage'),
);
const InteractiveLoginPage = React.lazy(
  () => import('./pages/InteractiveLoginPage'),
);
const AdminUsersPage = React.lazy(() => import('./pages/AdminUsersPage'));

const AgentSummaryPage = React.lazy(() => import('./pages/AgentSummaryPage'));
const MaintenancePage = React.lazy(() => import('./pages/MaintenancePage'));
const DiagnosticsPage = React.lazy(() => import('./pages/DiagnosticsPage'));
const StatisticsPage = React.lazy(() => import('./pages/StatisticsPage'));
const ConfigurationsPage = React.lazy(
  () => import('./pages/ConfigurationsPage'),
);
const SessionDetailAndContainerLogOpenerLegacy = React.lazy(
  () => import('./components/SessionDetailAndContainerLogOpenerLegacy'),
);
const ProjectPage = React.lazy(() => import('./pages/ProjectPage'));

const ChatPage = React.lazy(() => import('./pages/ChatPage'));

const AIAgentPage = React.lazy(() => import('./pages/AIAgentPage'));
const ReservoirPage = React.lazy(() => import('./pages/ReservoirPage'));
const ReservoirArtifactDetailPage = React.lazy(
  () => import('./pages/ReservoirArtifactDetailPage'),
);

const SchedulerPage = React.lazy(() => import('./pages/SchedulerPage'));
const BrandingPage = React.lazy(() => import('./pages/BrandingPage'));
const RBACManagementPage = React.lazy(
  () => import('./pages/RBACManagementPage'),
);
const AdminSessionPage = React.lazy(() => import('./pages/AdminSessionPage'));
const AdminDeploymentPresetSettingPage = React.lazy(
  () => import('./pages/AdminDeploymentPresetSettingPage'),
);
const AdminVFolderNodeListPage = React.lazy(
  () => import('./pages/AdminVFolderNodeListPage'),
);
const ProjectAdminUsersPage = React.lazy(
  () => import('./pages/ProjectAdminUsersPage'),
);
const ProjectAdminDataPage = React.lazy(
  () => import('./pages/ProjectAdminDataPage'),
);
const ProjectAdminDeploymentsPage = React.lazy(
  () => import('./pages/ProjectAdminDeploymentsPage'),
);
const ProjectAdminSessionPage = React.lazy(
  () => import('./pages/ProjectAdminSessionPage'),
);
const EmailVerificationPage = React.lazy(
  () => import('./pages/EmailVerificationPage'),
);
const ChangePasswordPage = React.lazy(
  () => import('./pages/ChangePasswordPage'),
);
const EduAppLauncherPage = React.lazy(
  () => import('./pages/EduAppLauncherPage'),
);
const ModelStoreListPageV2 = React.lazy(
  () => import('./pages/ModelStoreListPageV2'),
);

const DefaultMenuRedirect: React.FC = () => {
  const { defaultMenuPath } = useWebUIMenuItems();
  return <WebUINavigate to={defaultMenuPath} replace />;
};

/**
 * MainLayout children routes - these are the actual page routes
 */
export const mainLayoutChildRoutes: RouteObject[] = [
  {
    // Redirect to first available menu when accessing root path
    index: true,
    Component: DefaultMenuRedirect,
  },
  {
    //for electron dev mode
    path: '/build/electron-app/app/index.html',
    Component: DefaultMenuRedirect,
  },
  {
    //for electron prod mode
    path: '/app/index.html',
    Component: DefaultMenuRedirect,
  },
  // --- New scope-aware subtrees ---
  // Project scope subtree: `/project/:projectName/*` (general user menu) plus
  // the nested `admin` segment for project-admin pages. Relative child paths +
  // `handle.{scope,menuKey}` metadata drive the scope-aware primitives
  // (`useRouteScope`, `useCurrentMenuKey`).
  {
    path: 'project/:projectName',
    element: <ProjectScopeLayout />,
    children: [
      {
        path: 'start',
        element: (
          <Suspense fallback={<Skeleton active />}>
            <StartPage />
          </Suspense>
        ),
        handle: {
          scope: 'project',
          menuKey: 'start',
          labelKey: 'webui.menu.Start',
        },
      },
      {
        path: 'dashboard',
        Component: () => {
          return (
            <BAIErrorBoundary>
              <Suspense fallback={<Skeleton active />}>
                <DashboardPage />
              </Suspense>
            </BAIErrorBoundary>
          );
        },
        handle: {
          scope: 'project',
          menuKey: 'dashboard',
          labelKey: 'webui.menu.Dashboard',
        },
      },
      {
        path: 'session',
        handle: {
          scope: 'project',
          menuKey: 'session',
          labelKey: 'webui.menu.Sessions',
        },
        children: [
          {
            index: true,
            Component: () => {
              useSuspendedBackendaiClient();
              return (
                <Suspense fallback={<Skeleton active />}>
                  <ComputeSessionListPage />
                  <SessionDetailAndContainerLogOpenerLegacy />
                </Suspense>
              );
            },
            handle: { scope: 'project', menuKey: 'session' },
          },
          {
            path: 'start',
            Component: () => {
              const { token } = theme.useToken();
              return (
                <BAIFlex
                  direction="column"
                  gap={token.paddingContentVerticalLG}
                  align="stretch"
                  style={{ paddingBottom: token.paddingContentVerticalLG }}
                >
                  <LocationStateBreadCrumb />
                  <StorageHostFetchErrorBoundary>
                    <Suspense
                      fallback={
                        <BAIFlex direction="column" style={{ maxWidth: 700 }}>
                          <Skeleton active />
                        </BAIFlex>
                      }
                    >
                      <SessionLauncherPage />
                    </Suspense>
                  </StorageHostFetchErrorBoundary>
                </BAIFlex>
              );
            },
            handle: {
              scope: 'project',
              menuKey: 'session',
              labelKey: 'session.launcher.StartNewSession',
            },
          },
        ],
      },
      {
        path: 'deployments',
        handle: {
          scope: 'project',
          menuKey: 'deployments',
          labelKey: 'webui.menu.Deployments',
        },
        children: [
          {
            index: true,
            Component: () => {
              const { t } = useTranslation();
              useSuspendedBackendaiClient();
              return (
                <Suspense
                  fallback={
                    <BAICard title={t('webui.menu.Deployments')} loading />
                  }
                >
                  <DeploymentListPage />
                </Suspense>
              );
            },
            handle: { scope: 'project', menuKey: 'deployments' },
          },
          {
            path: ':deploymentId',
            element: (
              <Suspense fallback={<Skeleton active />}>
                <DeploymentDetailPage />
              </Suspense>
            ),
            handle: {
              scope: 'project',
              menuKey: 'deployments',
              labelKey: 'webui.menu.DeploymentDetail',
            },
          },
        ],
      },
      {
        path: 'model-store',
        Component: () => (
          <Suspense fallback={<Skeleton active />}>
            <ModelStoreListPageV2 />
          </Suspense>
        ),
        handle: {
          scope: 'project',
          menuKey: 'model-store',
          labelKey: 'data.ModelStore',
        },
      },
      {
        path: 'chat/:id?',
        Component: () => {
          useSuspendedBackendaiClient();
          return (
            <Suspense fallback={<FlexActivityIndicator spinSize="large" />}>
              <ChatPage />
            </Suspense>
          );
        },
        handle: {
          scope: 'project',
          menuKey: 'chat',
          labelKey: 'webui.menu.Chat',
        },
      },
      {
        path: 'data',
        Component: () => {
          return <VFolderNodeListPage />;
        },
        handle: {
          scope: 'project',
          menuKey: 'data',
          labelKey: 'webui.menu.Data',
        },
      },
      {
        path: 'my-environment',
        element: (
          <Suspense fallback={<Skeleton active />}>
            <MyEnvironmentPage />
          </Suspense>
        ),
        handle: {
          scope: 'project',
          menuKey: 'my-environment',
          labelKey: 'webui.menu.MyEnvironments',
        },
      },
      {
        path: 'agent-summary',
        element: (
          <Suspense fallback={<Skeleton active />}>
            <AgentSummaryPage />
          </Suspense>
        ),
        handle: {
          scope: 'project',
          menuKey: 'agent-summary',
          labelKey: 'webui.menu.AgentSummary',
        },
      },
      {
        path: 'statistics',
        Component: () => {
          useSuspendedBackendaiClient();
          return (
            <Suspense
              fallback={
                <BAIFlex direction="column" style={{ maxWidth: 700 }}>
                  <Skeleton active />
                </BAIFlex>
              }
            >
              <StatisticsPage />
            </Suspense>
          );
        },
        handle: {
          scope: 'project',
          menuKey: 'statistics',
          labelKey: 'webui.menu.Statistics',
        },
      },
      {
        path: 'ai-agent',
        Component: () => {
          const [experimentalAIAgents] = useBAISettingUserState(
            'experimental_ai_agents',
          );
          return experimentalAIAgents ? (
            <Suspense fallback={<Skeleton active />}>
              <AIAgentPage />
            </Suspense>
          ) : (
            <WebUINavigate to={'/start'} replace />
          );
        },
        handle: {
          scope: 'project',
          menuKey: 'ai-agent',
          labelKey: 'webui.menu.AIAgents',
        },
      },
      // --- project-admin scope: /project/:projectName/admin/* ---
      {
        path: 'admin',
        children: [
          {
            path: 'session',
            Component: () => {
              useSuspendedBackendaiClient();
              return (
                <Suspense fallback={<Skeleton active />}>
                  <ProjectAdminSessionPage />
                </Suspense>
              );
            },
            handle: {
              scope: 'projectAdmin',
              menuKey: 'project-admin-session',
              labelKey: 'webui.menu.ProjectSessions',
            },
          },
          {
            path: 'deployments',
            handle: {
              scope: 'projectAdmin',
              menuKey: 'project-admin-deployments',
              labelKey: 'webui.menu.ProjectDeployments',
            },
            children: [
              {
                index: true,
                Component: () => {
                  useSuspendedBackendaiClient();
                  return (
                    <Suspense fallback={<Skeleton active />}>
                      <ProjectAdminDeploymentsPage />
                    </Suspense>
                  );
                },
                handle: {
                  scope: 'projectAdmin',
                  menuKey: 'project-admin-deployments',
                },
              },
              {
                path: ':deploymentId',
                element: (
                  <Suspense fallback={<Skeleton active />}>
                    <DeploymentDetailPage />
                  </Suspense>
                ),
                handle: {
                  scope: 'projectAdmin',
                  menuKey: 'project-admin-deployments',
                  labelKey: 'webui.menu.DeploymentDetail',
                },
              },
            ],
          },
          {
            path: 'data',
            Component: () => {
              useSuspendedBackendaiClient();
              return (
                <Suspense fallback={<Skeleton active />}>
                  <ProjectAdminDataPage />
                </Suspense>
              );
            },
            handle: {
              scope: 'projectAdmin',
              menuKey: 'project-data',
              labelKey: 'webui.menu.Data',
            },
          },
          {
            path: 'users',
            Component: () => {
              useSuspendedBackendaiClient();
              return (
                <Suspense fallback={<Skeleton active />}>
                  <ProjectAdminUsersPage />
                </Suspense>
              );
            },
            handle: {
              scope: 'projectAdmin',
              menuKey: 'project-admin-users',
              labelKey: 'webui.menu.ProjectMembers',
            },
          },
        ],
      },
    ],
  },
  // Global admin subtree: `/admin/*`. Segment names follow the confirmed scope
  // decisions (e.g. `credential -> users`, `admin-session -> session`,
  // `admin-data -> data`). `handle.menuKey` preserves the legacy menu key so
  // role gating / sider highlighting keep working unchanged.
  {
    path: 'admin',
    element: <AdminScopeLayout />,
    children: [
      {
        path: 'session',
        element: (
          <Suspense fallback={<Skeleton active />}>
            <AdminSessionPage />
          </Suspense>
        ),
        handle: {
          scope: 'admin',
          menuKey: 'admin-session',
          labelKey: 'webui.menu.Sessions',
        },
      },
      {
        path: 'deployments',
        handle: {
          scope: 'admin',
          menuKey: 'admin-deployments',
          labelKey: 'webui.menu.Serving',
        },
        children: [
          {
            index: true,
            Component: () => {
              return (
                <BAIErrorBoundary>
                  <Suspense fallback={<BAICard loading />}>
                    <AdminDeploymentListPage />
                  </Suspense>
                </BAIErrorBoundary>
              );
            },
            handle: { scope: 'admin', menuKey: 'admin-deployments' },
          },
          {
            path: 'deployment-presets/new',
            element: (
              <BAIErrorBoundary>
                <Suspense fallback={<Skeleton active />}>
                  <AdminDeploymentPresetSettingPage />
                </Suspense>
              </BAIErrorBoundary>
            ),
            handle: {
              scope: 'admin',
              menuKey: 'admin-deployments',
              labelKey: 'adminDeploymentPreset.CreatePreset',
            },
          },
          {
            path: 'deployment-presets/:presetId/edit',
            element: (
              <BAIErrorBoundary>
                <Suspense fallback={<Skeleton active />}>
                  <AdminDeploymentPresetSettingPage />
                </Suspense>
              </BAIErrorBoundary>
            ),
            handle: {
              scope: 'admin',
              menuKey: 'admin-deployments',
              labelKey: 'adminDeploymentPreset.EditPreset',
            },
          },
          {
            path: ':deploymentId',
            element: (
              <Suspense fallback={<Skeleton active />}>
                <DeploymentDetailPage />
              </Suspense>
            ),
            handle: {
              scope: 'admin',
              menuKey: 'admin-deployments',
              labelKey: 'webui.menu.DeploymentDetail',
            },
          },
        ],
      },
      {
        path: 'data',
        Component: () => {
          useSuspendedBackendaiClient();
          return (
            <Suspense fallback={<Skeleton active />}>
              <AdminVFolderNodeListPage />
            </Suspense>
          );
        },
        handle: {
          scope: 'admin',
          menuKey: 'admin-data',
          labelKey: 'webui.menu.Data',
        },
      },
      {
        path: 'dashboard',
        Component: () => {
          return (
            <BAIErrorBoundary>
              <Suspense fallback={<Skeleton active />}>
                <AdminDashboardPage />
              </Suspense>
            </BAIErrorBoundary>
          );
        },
        handle: {
          scope: 'admin',
          menuKey: 'admin-dashboard',
          labelKey: 'webui.menu.AdminDashboard',
        },
      },
      {
        path: 'users',
        element: (
          <Suspense fallback={<Skeleton active />}>
            <AdminUsersPage />
          </Suspense>
        ),
        handle: {
          scope: 'admin',
          menuKey: 'credential',
          labelKey: 'webui.menu.UserCredentials&Policies',
        },
      },
      {
        path: 'environment',
        element: (
          <Suspense fallback={<Skeleton active />}>
            <EnvironmentPage />
          </Suspense>
        ),
        handle: {
          scope: 'admin',
          menuKey: 'environment',
          labelKey: 'webui.menu.Environments',
        },
      },
      {
        path: 'resource-policy',
        element: (
          <Suspense fallback={<Skeleton active />}>
            <ResourcePolicyPage />
          </Suspense>
        ),
        handle: {
          scope: 'admin',
          menuKey: 'resource-policy',
          labelKey: 'webui.menu.ResourcePolicies',
        },
      },
      {
        path: 'reservoir',
        handle: {
          scope: 'admin',
          menuKey: 'reservoir',
          labelKey: 'webui.menu.Reservoir',
        },
        children: [
          {
            index: true,
            Component: () => {
              const baiClient = useSuspendedBackendaiClient();
              return baiClient?.supports('reservoir') ? (
                <Suspense
                  fallback={
                    <BAIFlex direction="column" style={{ maxWidth: 700 }}>
                      <Skeleton active />
                    </BAIFlex>
                  }
                >
                  <ReservoirPage />
                </Suspense>
              ) : (
                <WebUINavigate to={'/error'} replace />
              );
            },
            handle: { scope: 'admin', menuKey: 'reservoir' },
          },
          {
            path: ':artifactId',
            Component: () => {
              const baiClient = useSuspendedBackendaiClient();
              return baiClient?.supports('reservoir') ? (
                <Suspense fallback={<Skeleton active />}>
                  <ReservoirArtifactDetailPage />
                </Suspense>
              ) : (
                <WebUINavigate to={'/error'} replace />
              );
            },
            handle: {
              scope: 'admin',
              menuKey: 'reservoir',
              labelKey: 'webui.menu.ArtifactDetails',
            },
          },
        ],
      },
      {
        path: 'scheduler',
        Component: () => {
          const baiClient = useSuspendedBackendaiClient();
          return baiClient?.supports('fair-share-scheduling') ? (
            <Suspense fallback={<Skeleton active />}>
              <SchedulerPage />
              <SessionDetailAndContainerLogOpenerLegacy />
            </Suspense>
          ) : (
            <WebUINavigate to={'/error'} replace />
          );
        },
        handle: {
          scope: 'admin',
          menuKey: 'scheduler',
          labelKey: 'webui.menu.Scheduler',
        },
      },
      {
        path: 'agent',
        element: (
          <Suspense fallback={<Skeleton active />}>
            <ResourcesPage />
          </Suspense>
        ),
        handle: {
          scope: 'admin',
          menuKey: 'agent',
          labelKey: 'webui.menu.Resources',
        },
      },
      {
        path: 'project',
        element: (
          <BAIErrorBoundary>
            <Suspense fallback={<Skeleton active />}>
              <ProjectPage />
            </Suspense>
          </BAIErrorBoundary>
        ),
        handle: {
          scope: 'admin',
          menuKey: 'project',
          labelKey: 'webui.menu.Projects',
        },
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<Skeleton active />}>
            <ConfigurationsPage />
          </Suspense>
        ),
        handle: {
          scope: 'admin',
          menuKey: 'settings',
          labelKey: 'webui.menu.Configurations',
        },
      },
      {
        path: 'maintenance',
        element: (
          <Suspense fallback={<Skeleton active />}>
            <MaintenancePage />
          </Suspense>
        ),
        handle: {
          scope: 'admin',
          menuKey: 'maintenance',
          labelKey: 'webui.menu.Maintenance',
        },
      },
      {
        path: 'diagnostics',
        element: (
          <Suspense fallback={<Skeleton active />}>
            <DiagnosticsPage />
          </Suspense>
        ),
        handle: {
          scope: 'admin',
          menuKey: 'diagnostics',
          labelKey: 'webui.menu.Diagnostics',
        },
      },
      {
        path: 'rbac',
        Component: () => {
          const baiClient = useSuspendedBackendaiClient();
          return baiClient?.supports('rbac') ? (
            <Suspense fallback={<Skeleton active />}>
              <RBACManagementPage />
            </Suspense>
          ) : (
            <WebUINavigate to={'/error'} replace />
          );
        },
        handle: {
          scope: 'admin',
          menuKey: 'rbac',
          labelKey: 'webui.menu.RBACManagement',
        },
      },
      {
        path: 'branding',
        element: (
          <Suspense fallback={<Skeleton active />}>
            <BrandingPage />
          </Suspense>
        ),
        handle: {
          scope: 'admin',
          menuKey: 'branding',
          labelKey: 'webui.menu.Branding',
        },
      },
      {
        path: 'information',
        element: (
          <Suspense fallback={<Skeleton active />}>
            <Information />
          </Suspense>
        ),
        handle: {
          scope: 'admin',
          menuKey: 'information',
          labelKey: 'webui.menu.Information',
        },
      },
    ],
  },
  // --- Backward-compat redirect shims (old flat URLs -> canonical) ---
  // Legacy flat redirect shims. Old, project-less URLs `replace`-redirect to
  // the new canonical scope-aware paths so deep links / bookmarks / external
  // `react-navigate` events keep working.
  //
  // Class A (static admin): no runtime project needed.
  // Class B (runtime project): inject the current project NAME via
  // `useActiveProjectName()`; fall back to `/start` when none is resolvable.
  // --- Class B: user (project) scope ---
  {
    path: '/start',
    Component: () => (
      <ProjectScopedRedirect scope="project" featureKey="start" />
    ),
    handle: { labelKey: 'webui.menu.Start' },
  },
  {
    path: '/dashboard',
    Component: () => (
      <ProjectScopedRedirect scope="project" featureKey="dashboard" />
    ),
    handle: { labelKey: 'webui.menu.Dashboard' },
  },
  {
    // alias -> dashboard
    path: '/summary',
    Component: () => (
      <ProjectScopedRedirect scope="project" featureKey="dashboard" />
    ),
    handle: { labelKey: 'webui.menu.Summary' },
  },
  {
    path: '/session',
    handle: { labelKey: 'webui.menu.Sessions' },
    children: [
      {
        index: true,
        Component: () => (
          <ProjectScopedRedirect scope="project" featureKey="session" />
        ),
      },
      {
        path: '/session/start',
        Component: () => (
          <ProjectScopedRedirect
            scope="project"
            featureKey="session"
            options={{ subPath: 'start' }}
          />
        ),
        handle: { labelKey: 'session.launcher.StartNewSession' },
      },
    ],
  },
  {
    // alias -> session
    path: '/job',
    Component: () => (
      <ProjectScopedRedirect scope="project" featureKey="session" />
    ),
    handle: { labelKey: 'webui.menu.Sessions' },
  },
  {
    path: '/deployments',
    handle: { labelKey: 'webui.menu.Deployments' },
    children: [
      {
        index: true,
        Component: () => (
          <ProjectScopedRedirect scope="project" featureKey="deployments" />
        ),
      },
      {
        path: ':deploymentId',
        Component: () => (
          <ProjectScopedRedirect
            scope="project"
            featureKey="deployments"
            options={{ param: 'deploymentId' }}
          />
        ),
      },
    ],
  },
  {
    // FR-2664 — Legacy /serving fallback -> project deployments.
    path: '/serving',
    handle: { labelKey: 'webui.menu.Deployments' },
    children: [
      {
        index: true,
        Component: () => (
          <ProjectScopedRedirect scope="project" featureKey="deployments" />
        ),
      },
      {
        path: ':serviceId',
        Component: () => (
          <ProjectScopedRedirect
            scope="project"
            featureKey="deployments"
            options={{ param: 'serviceId' }}
          />
        ),
      },
    ],
  },
  {
    path: '/service',
    handle: { labelKey: 'webui.menu.Serving' },
    children: [
      {
        index: true,
        Component: () => (
          <ProjectScopedRedirect scope="project" featureKey="deployments" />
        ),
      },
      {
        path: ':endpointId',
        Component: () => (
          <ProjectScopedRedirect
            scope="project"
            featureKey="deployments"
            options={{ param: 'endpointId' }}
          />
        ),
      },
    ],
  },
  {
    path: '/model-store',
    Component: () => (
      <ProjectScopedRedirect scope="project" featureKey="model-store" />
    ),
    handle: { labelKey: 'data.ModelStore' },
  },
  {
    path: '/chat/:id?',
    Component: () => {
      const { id } = useParams<{ id: string }>();
      return (
        <ProjectScopedRedirect
          scope="project"
          featureKey={id ? `chat/${id}` : 'chat'}
        />
      );
    },
    handle: { labelKey: 'webui.menu.Chat' },
  },
  {
    path: '/data',
    Component: () => (
      <ProjectScopedRedirect scope="project" featureKey="data" />
    ),
    handle: { labelKey: 'webui.menu.Data' },
  },
  {
    path: '/my-environment',
    Component: () => (
      <ProjectScopedRedirect scope="project" featureKey="my-environment" />
    ),
    handle: { labelKey: 'webui.menu.MyEnvironments' },
  },
  {
    path: '/agent-summary',
    Component: () => (
      <ProjectScopedRedirect scope="project" featureKey="agent-summary" />
    ),
    handle: { labelKey: 'webui.menu.AgentSummary' },
  },
  {
    path: '/statistics',
    Component: () => (
      <ProjectScopedRedirect scope="project" featureKey="statistics" />
    ),
    handle: { labelKey: 'webui.menu.Statistics' },
  },
  {
    path: '/ai-agent',
    Component: () => (
      <ProjectScopedRedirect scope="project" featureKey="ai-agent" />
    ),
    handle: { labelKey: 'webui.menu.AIAgents' },
  },
  // legacy aliases that historically pointed at /start
  {
    path: '/import',
    Component: () => (
      <ProjectScopedRedirect scope="project" featureKey="start" />
    ),
  },
  {
    path: '/github',
    Component: () => (
      <ProjectScopedRedirect scope="project" featureKey="start" />
    ),
  },
  // --- Class B: project-admin scope ---
  {
    path: '/project-admin-session',
    Component: () => (
      <ProjectScopedRedirect scope="projectAdmin" featureKey="session" />
    ),
    handle: { labelKey: 'webui.menu.ProjectSessions' },
  },
  {
    path: '/project-data',
    Component: () => (
      <ProjectScopedRedirect scope="projectAdmin" featureKey="data" />
    ),
    handle: { labelKey: 'webui.menu.Data' },
  },
  {
    path: '/project-admin-users',
    Component: () => (
      <ProjectScopedRedirect scope="projectAdmin" featureKey="users" />
    ),
    handle: { labelKey: 'webui.menu.ProjectMembers' },
  },
  {
    path: '/project-admin-deployments',
    handle: { labelKey: 'webui.menu.ProjectDeployments' },
    children: [
      {
        index: true,
        Component: () => (
          <ProjectScopedRedirect
            scope="projectAdmin"
            featureKey="deployments"
          />
        ),
      },
      {
        path: ':deploymentId',
        Component: () => (
          <ProjectScopedRedirect
            scope="projectAdmin"
            featureKey="deployments"
            options={{ param: 'deploymentId' }}
          />
        ),
      },
    ],
  },
  // --- Class A: global admin scope ---
  {
    path: '/admin-session',
    Component: () => <AdminRedirect featureKey="session" />,
    handle: { labelKey: 'webui.menu.Sessions' },
  },
  {
    path: '/admin-deployments',
    handle: { labelKey: 'webui.menu.Serving' },
    children: [
      {
        index: true,
        Component: () => <AdminRedirect featureKey="deployments" />,
      },
      {
        path: 'deployment-presets/new',
        Component: () => (
          <AdminRedirect
            featureKey="deployments"
            options={{ subPath: 'deployment-presets/new' }}
          />
        ),
      },
      {
        path: 'deployment-presets/:presetId/edit',
        Component: () => {
          const { presetId } = useParams<{ presetId: string }>();
          return (
            <AdminRedirect
              featureKey="deployments"
              options={{ subPath: `deployment-presets/${presetId}/edit` }}
            />
          );
        },
      },
      {
        path: ':deploymentId',
        Component: () => (
          <AdminRedirect
            featureKey="deployments"
            options={{ param: 'deploymentId' }}
          />
        ),
      },
    ],
  },
  {
    // FR-2664 — Legacy /admin-serving fallback -> admin deployments.
    path: '/admin-serving',
    handle: { labelKey: 'webui.menu.Serving' },
    children: [
      {
        index: true,
        Component: () => <AdminRedirect featureKey="deployments" />,
      },
      {
        path: ':serviceId',
        Component: () => (
          <AdminRedirect
            featureKey="deployments"
            options={{ param: 'serviceId' }}
          />
        ),
      },
    ],
  },
  {
    path: '/admin-data',
    Component: () => <AdminRedirect featureKey="data" />,
    handle: { labelKey: 'webui.menu.Data' },
  },
  {
    path: '/admin-dashboard',
    Component: () => <AdminRedirect featureKey="dashboard" />,
    handle: { labelKey: 'webui.menu.AdminDashboard' },
  },
  {
    path: '/credential',
    Component: () => <AdminRedirect featureKey="users" />,
    handle: { labelKey: 'webui.menu.UserCredentials&Policies' },
  },
  {
    path: '/environment',
    Component: () => <AdminRedirect featureKey="environment" />,
    handle: { labelKey: 'webui.menu.Environments' },
  },
  {
    path: '/resource-policy',
    Component: () => <AdminRedirect featureKey="resource-policy" />,
    handle: { labelKey: 'webui.menu.ResourcePolicies' },
  },
  {
    path: '/reservoir',
    handle: { labelKey: 'webui.menu.Reservoir' },
    children: [
      {
        index: true,
        Component: () => <AdminRedirect featureKey="reservoir" />,
      },
      {
        path: '/reservoir/:artifactId',
        Component: () => (
          <AdminRedirect
            featureKey="reservoir"
            options={{ param: 'artifactId' }}
          />
        ),
        handle: { labelKey: 'webui.menu.ArtifactDetails' },
      },
    ],
  },
  {
    path: '/scheduler',
    Component: () => <AdminRedirect featureKey="scheduler" />,
    handle: { labelKey: 'webui.menu.Scheduler' },
  },
  {
    path: '/agent',
    Component: () => <AdminRedirect featureKey="agent" />,
    handle: { labelKey: 'webui.menu.Resources' },
  },
  {
    path: '/project',
    Component: () => <AdminRedirect featureKey="project" />,
    handle: { labelKey: 'webui.menu.Projects' },
  },
  {
    path: '/settings',
    Component: () => <AdminRedirect featureKey="settings" />,
    handle: { labelKey: 'webui.menu.Configurations' },
  },
  {
    path: '/maintenance',
    Component: () => <AdminRedirect featureKey="maintenance" />,
    handle: { labelKey: 'webui.menu.Maintenance' },
  },
  {
    path: '/diagnostics',
    Component: () => <AdminRedirect featureKey="diagnostics" />,
    handle: { labelKey: 'webui.menu.Diagnostics' },
  },
  {
    path: '/rbac',
    Component: () => <AdminRedirect featureKey="rbac" />,
    handle: { labelKey: 'webui.menu.RBACManagement' },
  },
  {
    path: '/branding',
    Component: () => <AdminRedirect featureKey="branding" />,
    handle: { labelKey: 'webui.menu.Branding' },
  },
  {
    path: '/information',
    Component: () => <AdminRedirect featureKey="information" />,
    handle: { labelKey: 'webui.menu.Information' },
  },
  {
    path: '/storage-settings/:hostname',
    element: <WebUINavigate to="/admin/agent?tab=storages" replace />,
  },
  // --- Global, no-prefix, unchanged ---
  {
    path: '/usersettings',
    handle: { labelKey: 'webui.menu.Settings&Logs' },
    element: (
      <Suspense fallback={<Skeleton active />}>
        <UserSettingsPage />
      </Suspense>
    ),
  },
  {
    path: '/logs',
    handle: { labelKey: 'webui.menu.Logs' },
  },
  {
    path: '/error',
    handle: { hideBreadcrumb: true },
    Component: Page404,
  },
  // Catch-all route for unknown paths
  // Returns empty element to allow Lit components to handle plugin pages.
  // The PageAccessGuard in MainLayout checks if the current path is valid
  // and shows Page404 for truly unknown paths after plugins are loaded.
  {
    path: '*',
    element: <></>,
  },
];

/**
 * Component that runs auto-diagnostics checks after login and shows
 * a notification if any critical issues are detected.
 * Wraps the hook in a Suspense boundary so it won't block rendering.
 */
const AutoDiagnosticsEffect = () => {
  useAutoDiagnostics();
  return null;
};

/**
 * Route-level gate that delegates to `STokenLoginBoundary` when an sToken
 * is present in the URL (transparently passes through otherwise). Sourced
 * here so the regular `LoginView` + `MainLayout` tree never re-reads the
 * URL query for authentication — see the spec "URL 파라미터 파싱 규약
 * (nuqs)" section for the invariant.
 *
 * On boundary success, the route-level `onSuccess` persists the login
 * state (`last_login`, `login_attempt`, saved-credential cleanup,
 * `api_endpoint`, `client.ready`) and nulls both `sToken` / `stoken` keys
 * from the URL via the nuqs setter so the token doesn't leak into browser
 * history or referer headers.
 */
const STokenGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  'use memo';
  const [sToken, clearSToken] = useSToken();
  const setPluginApiEndpoint = useSetAtom(pluginApiEndpointState);
  if (!sToken) {
    return <>{children}</>;
  }
  return (
    <STokenLoginBoundary
      sToken={sToken}
      onSuccess={(client) => {
        persistPostLoginState(client);
        // Mirror LoginView's postConnectSetup so `PluginLoader` (which gates
        // on this atom) loads plugins on the sToken entry paths too. Without
        // this set, Electron and plugin-enabled deployments would leave
        // plugins permanently unloaded on any sToken-based login.
        const endpoint = (client as { _config?: { endpoint?: unknown } })
          ?._config?.endpoint;
        if (typeof endpoint === 'string' && endpoint) {
          setPluginApiEndpoint(endpoint);
        }
        clearSToken(null);
      }}
    >
      {children}
    </STokenLoginBoundary>
  );
};

/**
 * nuqs parser spec for the EduAppLauncher URL query parameters (every
 * key except `sToken` / `stoken`, which `useSToken` owns). Covers the
 * full set consumed by `EduAppLauncher._launch` and `_createEduSession`,
 * and forwarded verbatim to `client.token_login(sToken, extraParams)`.
 * Any new URL param expected by the launcher or a backend auth hook
 * must be added here so nuqs surfaces it as a typed value.
 */
const eduAppExtraParamSpec = {
  app: parseAsString,
  session_id: parseAsString,
  session_template: parseAsString,
  sessionTemplate: parseAsString,
  cpu: parseAsString,
  mem: parseAsString,
  shmem: parseAsString,
  'cuda-shares': parseAsString,
  'cuda-device': parseAsString,
  // LMS signing envelope: the upstream launcher URL carries these alongside
  // `sToken` and the manager-side auth hook validates the signature against
  // them. Dropping any of them causes token_login to reject as tampered.
  api_version: parseAsString,
  date: parseAsString,
  endpoint: parseAsString,
};

/**
 * Root routes configuration
 */
export const routes: RouteObject[] = [
  {
    path: '/interactive-login',
    errorElement: <ErrorView />,
    element: (
      <BAIErrorBoundary>
        <DefaultProvidersForReactRoot>
          <STokenGuard>
            <Suspense>
              <LoginView waitForMainLayout={false} />
            </Suspense>
            <LogoutEventHandler />
            <Suspense fallback={<Skeleton active />}>
              <InteractiveLoginPage />
            </Suspense>
          </STokenGuard>
        </DefaultProvidersForReactRoot>
      </BAIErrorBoundary>
    ),
  },
  {
    path: '/verify-email',
    errorElement: <ErrorView />,
    element: (
      <BAIErrorBoundary>
        <DefaultProvidersForReactRoot>
          <Suspense fallback={<Skeleton active />}>
            <EmailVerificationPage />
          </Suspense>
        </DefaultProvidersForReactRoot>
      </BAIErrorBoundary>
    ),
  },
  {
    path: '/change-password',
    errorElement: <ErrorView />,
    element: (
      <BAIErrorBoundary>
        <DefaultProvidersForReactRoot>
          <Suspense fallback={<Skeleton active />}>
            <ChangePasswordPage />
          </Suspense>
        </DefaultProvidersForReactRoot>
      </BAIErrorBoundary>
    ),
  },
  {
    path: '/edu-applauncher',
    errorElement: <ErrorView />,
    Component: () => {
      'use memo';
      const [sToken] = useSToken();
      const [rawExtraParams] = useQueryStates(eduAppExtraParamSpec);
      // Narrow via type-guard reducer so `extraParams` is inferred as
      // `Record<string, string>` without a type assertion. Non-string values
      // are dropped defensively — nuqs parsers can emit `null`, and future
      // schema changes might add non-string shapes that shouldn't silently
      // leak into `client.token_login` via `extraParams`.
      const extraParams = Object.entries(rawExtraParams).reduce<
        Record<string, string>
      >((accumulator, [key, value]) => {
        if (typeof value === 'string') {
          accumulator[key] = value;
        }
        return accumulator;
      }, {});

      return (
        <BAIErrorBoundary>
          <DefaultProvidersForReactRoot>
            <STokenLoginBoundary
              sToken={sToken ?? ''}
              extraParams={extraParams}
              // URL is intentionally NOT stripped on success here —
              // EduAppLauncher's `_createEduSession` still reads
              // `sToken` (for the customer-specific
              // `eduApp.get_user_credential` call) and other URL params
              // drive the launch sequence. The edu token URL is issued
              // by the integrating LMS, so leaking it into browser
              // history is considered acceptable in this flow.
              onSuccess={persistPostLoginState}
            >
              <Suspense fallback={<Skeleton active />}>
                <EduAppLauncherPage sToken={sToken} extraParams={extraParams} />
              </Suspense>
            </STokenLoginBoundary>
          </DefaultProvidersForReactRoot>
        </BAIErrorBoundary>
      );
    },
  },
  {
    path: '/applauncher',
    errorElement: <ErrorView />,
    Component: () => {
      'use memo';
      const [sToken] = useSToken();
      const [rawExtraParams] = useQueryStates(eduAppExtraParamSpec);
      // Narrow via type-guard reducer so `extraParams` is inferred as
      // `Record<string, string>` without a type assertion. Non-string values
      // are dropped defensively — nuqs parsers can emit `null`, and future
      // schema changes might add non-string shapes that shouldn't silently
      // leak into `client.token_login` via `extraParams`.
      const extraParams = Object.entries(rawExtraParams).reduce<
        Record<string, string>
      >((accumulator, [key, value]) => {
        if (typeof value === 'string') {
          accumulator[key] = value;
        }
        return accumulator;
      }, {});

      return (
        <BAIErrorBoundary>
          <DefaultProvidersForReactRoot>
            <STokenLoginBoundary
              sToken={sToken ?? ''}
              extraParams={extraParams}
              // URL retained — see comment on `/edu-applauncher`.
              onSuccess={persistPostLoginState}
            >
              <Suspense fallback={<Skeleton active />}>
                <EduAppLauncherPage sToken={sToken} extraParams={extraParams} />
              </Suspense>
            </STokenLoginBoundary>
          </DefaultProvidersForReactRoot>
        </BAIErrorBoundary>
      );
    },
  },
  {
    path: '/',
    errorElement: <ErrorView />,
    element: (
      <BAIErrorBoundary>
        <DefaultProvidersForReactRoot>
          <STokenGuard>
            <Suspense>
              <LoginView />
            </Suspense>
            {/*FYI, MainLayout has ErrorBoundaryWithNullFallback for <Outlet/> */}
            <MainLayout />
            <ErrorBoundaryWithNullFallback>
              <RoutingEventHandler />
            </ErrorBoundaryWithNullFallback>
            <Suspense>
              <ErrorBoundaryWithNullFallback>
                <AutoDiagnosticsEffect />
              </ErrorBoundaryWithNullFallback>
            </Suspense>
            <Suspense>
              <ErrorBoundaryWithNullFallback>
                <LoginViewLazy />
              </ErrorBoundaryWithNullFallback>
              <ErrorBoundaryWithNullFallback>
                <FolderExplorerOpener />
              </ErrorBoundaryWithNullFallback>
              <ErrorBoundaryWithNullFallback>
                <FolderInvitationResponseModalOpener />
              </ErrorBoundaryWithNullFallback>
              <ErrorBoundaryWithNullFallback>
                <FileUploadManager />
              </ErrorBoundaryWithNullFallback>
            </Suspense>
          </STokenGuard>
        </DefaultProvidersForReactRoot>
      </BAIErrorBoundary>
    ),
    children: mainLayoutChildRoutes,
  },
];

/**
 * Extract all valid route paths from the route configuration.
 * This includes both static paths and dynamic route patterns.
 */
function extractRoutePaths(
  routeObjects: RouteObject[],
  parentPath = '',
): { staticPaths: Set<string>; dynamicPatterns: RegExp[] } {
  const staticPaths = new Set<string>();
  const dynamicPatterns: RegExp[] = [];

  for (const route of routeObjects) {
    if (!route.path) {
      // Index routes or routes without path
      if (route.children) {
        const childResult = extractRoutePaths(route.children, parentPath);
        childResult.staticPaths.forEach((p) => staticPaths.add(p));
        dynamicPatterns.push(...childResult.dynamicPatterns);
      }
      continue;
    }

    // Skip catch-all routes
    if (route.path === '*') continue;

    // Build full path
    let fullPath = route.path;
    if (!fullPath.startsWith('/') && parentPath) {
      fullPath = `${parentPath}/${fullPath}`;
    }
    // Remove leading slash for consistency with currentPathKey comparison
    const normalizedPath = fullPath.replace(/^\//, '');

    // Check if path has dynamic segments (e.g., :id, :hostname)
    if (normalizedPath.includes(':')) {
      // Convert route pattern to regex
      // e.g., "serving/:serviceId" -> /^serving\/[^/]+$/
      // e.g., "chat/:id?" -> /^chat(\/[^/]+)?$/
      const regexPattern = normalizedPath
        .split('/')
        .map((segment) => {
          if (segment.startsWith(':') && segment.endsWith('?')) {
            // Optional parameter (e.g., :id?)
            return `(\\/[^/]+)?`;
          }
          if (segment.startsWith(':')) {
            // Required parameter (e.g., :id)
            return '[^/]+';
          }
          // Static segment
          return segment;
        })
        .join('\\/');
      dynamicPatterns.push(new RegExp(`^${regexPattern}$`));
    } else {
      // Static path - extract first segment for comparison
      const firstSegment = normalizedPath.split('/')[0];
      if (firstSegment) {
        staticPaths.add(firstSegment);
      }
    }

    // Recursively process children
    if (route.children) {
      const childResult = extractRoutePaths(route.children, fullPath);
      childResult.staticPaths.forEach((p) => staticPaths.add(p));
      dynamicPatterns.push(...childResult.dynamicPatterns);
    }
  }

  return { staticPaths, dynamicPatterns };
}

// Populate the shared routerPaths registry so useWebUIMenuItems can read
// valid paths without importing routes.tsx directly (which would create a
// circular dependency: routes → useWebUIMenuItems → routes).
//
// IMPORTANT (scope-aware routing): the registry must contain the FEATURE
// segment (e.g. `session`, `data`, `users`, `deployments/:deploymentId`), NOT
// the scope prefix (`project`/`admin`). `useWebUIMenuItems` derives the current
// feature/menu key via `useCurrentMenuKey()` (route handle) and validates it
// against this registry, so feeding it the raw first segment (`project`/
// `admin`) would break 404 detection. We therefore run `extractRoutePaths` over
// the un-nested feature route arrays (relative paths == feature keys) plus the
// legacy redirect shims (so old flat URLs remain "valid" during the transition).
//
// The feature route arrays are read back out of the inline `mainLayoutChildRoutes`
// tree: the `project/:projectName` and `admin` scope subtrees' own `children`
// (relative feature paths), and the legacy redirect shims that sit between the
// `admin` subtree and the global `/usersettings` route.
const projectScopeChildren =
  mainLayoutChildRoutes.find((route) => route.path === 'project/:projectName')
    ?.children ?? [];
const adminScopeChildren =
  mainLayoutChildRoutes.find((route) => route.path === 'admin')?.children ?? [];
const legacyRedirectStartIndex =
  mainLayoutChildRoutes.findIndex((route) => route.path === 'admin') + 1;
const legacyRedirectEndIndex = mainLayoutChildRoutes.findIndex(
  (route) => route.path === '/usersettings',
);
const legacyRedirectRoutes = mainLayoutChildRoutes.slice(
  legacyRedirectStartIndex,
  legacyRedirectEndIndex,
);
const staticPaths = new Set<string>();
const dynamicPatterns: RegExp[] = [];
[projectScopeChildren, adminScopeChildren, legacyRedirectRoutes].forEach(
  (routeArray) => {
    const result = extractRoutePaths(routeArray);
    result.staticPaths.forEach((p) => staticPaths.add(p));
    dynamicPatterns.push(...result.dynamicPatterns);
  },
);
populateRouterPaths(staticPaths, dynamicPatterns);
