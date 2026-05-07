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
import MainLayout from './components/MainLayout/MainLayout';
import { STokenLoginBoundary } from './components/STokenLoginBoundary';
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
import { RouteObject, useLocation, useParams } from 'react-router-dom';

const LoginViewLazy = React.lazy(() => import('./components/LoginView'));

const Information = React.lazy(() => import('./components/Information'));
const StartPage = React.lazy(() => import('./pages/StartPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const AdminDashboardPage = React.lazy(
  () => import('./pages/AdminDashboardPage'),
);
const EnvironmentPage = React.lazy(() => import('./pages/EnvironmentPage'));
const MyEnvironmentPage = React.lazy(() => import('./pages/MyEnvironmentPage'));
const StorageHostSettingPage = React.lazy(
  () => import('./pages/StorageHostSettingPage'),
);
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
// FR-2675 — The legacy `ServiceLauncherCreatePage` / `ServiceLauncherUpdatePage`
// routes have been redirected to the new Deployment launcher below so the
// new `/deployments/start` + `/deployments/:deploymentId/edit` paths are the
// sole launcher entry points. The underlying `ServiceLauncherPageContent`
// component is still imported transitively (by `useModelServiceLauncher`,
// `LegacyModelTryContentButton`, etc.) and is scheduled for removal in a
// follow-up cleanup once those call sites migrate to the new hook.

const DeploymentListPage = React.lazy(
  () => import('./pages/DeploymentListPage'),
);
const DeploymentLauncherPage = React.lazy(
  () => import('./pages/DeploymentLauncherPage'),
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
const UserCredentialsPage = React.lazy(
  () => import('./pages/UserCredentialsPage'),
);

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
const LegacyModelStoreListPage = React.lazy(
  () => import('./pages/LegacyModelStoreListPage'),
);

/**
 * MainLayout children routes - these are the actual page routes
 */
export const mainLayoutChildRoutes: RouteObject[] = [
  {
    // Redirect to first available menu when accessing root path
    index: true,
    Component: () => {
      const { defaultMenuPath } = useWebUIMenuItems();
      return <WebUINavigate to={defaultMenuPath} replace />;
    },
  },
  {
    //for electron dev mode
    path: '/build/electron-app/app/index.html',
    Component: () => {
      const { defaultMenuPath } = useWebUIMenuItems();
      return <WebUINavigate to={defaultMenuPath} replace />;
    },
  },
  {
    //for electron prod mode
    path: '/app/index.html',
    Component: () => {
      const { defaultMenuPath } = useWebUIMenuItems();
      return <WebUINavigate to={defaultMenuPath} replace />;
    },
  },
  {
    path: '/start',
    element: (
      <Suspense fallback={<Skeleton active />}>
        <StartPage />
      </Suspense>
    ),
    handle: { labelKey: 'webui.menu.Start' },
  },
  {
    path: '/chat/:id?',
    handle: { labelKey: 'webui.menu.Chat' },
    Component: () => {
      useSuspendedBackendaiClient();
      return (
        <Suspense fallback={<FlexActivityIndicator spinSize="large" />}>
          <ChatPage />
        </Suspense>
      );
    },
  },
  {
    path: '/dashboard',
    handle: { labelKey: 'webui.menu.Dashboard' },
    Component: () => {
      return (
        <BAIErrorBoundary>
          <Suspense fallback={<Skeleton active />}>
            <DashboardPage />
          </Suspense>
        </BAIErrorBoundary>
      );
    },
  },
  {
    // TODO: For the convenience of existing users, this path will be retained. It is scheduled for deletion in the future.
    path: '/summary',
    Component: () => {
      const location = useLocation();
      return <WebUINavigate to={'/dashboard' + location.search} replace />;
    },
    handle: { labelKey: 'webui.menu.Summary' },
  },
  {
    // TODO: For the convenience of existing users, this path will be retained. It is scheduled for deletion in the future.
    path: '/job',
    handle: { labelKey: 'webui.menu.Sessions' },
    Component: () => {
      const location = useLocation();
      return <WebUINavigate to={'/session' + location.search} replace />;
    },
  },
  {
    path: '/session',
    handle: { labelKey: 'webui.menu.Sessions' },
    children: [
      {
        path: '',
        Component: () => {
          useSuspendedBackendaiClient();

          return (
            <Suspense fallback={<Skeleton active />}>
              <ComputeSessionListPage />
              <SessionDetailAndContainerLogOpenerLegacy />
            </Suspense>
          );
        },
      },
      {
        path: '/session/start',
        // handle: { labelKey: 'session.launcher.StartNewSession' },
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
              <Suspense
                fallback={
                  <BAIFlex direction="column" style={{ maxWidth: 700 }}>
                    <Skeleton active />
                  </BAIFlex>
                }
              >
                <SessionLauncherPage />
              </Suspense>
            </BAIFlex>
          );
        },
        handle: { labelKey: 'session.launcher.StartNewSession' },
      },
    ],
  },
  {
    // FR-2664 — New Deployment UI routes. Replaces the legacy /serving
    // routes (see fallback redirects below).
    path: '/deployments',
    handle: { labelKey: 'webui.menu.Serving' },
    children: [
      {
        path: '',
        Component: () => {
          const { t } = useTranslation();
          useSuspendedBackendaiClient();
          return (
            <Suspense
              fallback={<BAICard title={t('webui.menu.Serving')} loading />}
            >
              <DeploymentListPage />
            </Suspense>
          );
        },
      },
      {
        path: 'start',
        handle: { labelKey: 'modelService.StartNewService' },
        element: (
          <Suspense
            fallback={
              <BAIFlex direction="column" style={{ maxWidth: 700 }}>
                <Skeleton active />
              </BAIFlex>
            }
          >
            <DeploymentLauncherPage />
          </Suspense>
        ),
      },
      {
        path: ':deploymentId',
        handle: { labelKey: 'modelService.RoutingInfo' },
        element: (
          <Suspense fallback={<Skeleton active />}>
            <DeploymentDetailPage />
          </Suspense>
        ),
      },
      {
        path: ':deploymentId/edit',
        handle: { labelKey: 'modelService.UpdateService' },
        element: (
          <Suspense
            fallback={
              <BAIFlex direction="column" style={{ maxWidth: 700 }}>
                <Skeleton active />
              </BAIFlex>
            }
          >
            <DeploymentLauncherPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    // FR-2664 — Legacy /serving fallback. Transient redirect; remove once
    // all internal links + external references have been migrated.
    path: '/serving',
    handle: { labelKey: 'webui.menu.Serving' },
    children: [
      {
        path: '',
        Component: () => {
          const location = useLocation();
          return (
            <WebUINavigate to={'/deployments' + location.search} replace />
          );
        },
      },
      {
        path: ':serviceId',
        Component: () => {
          const { serviceId } = useParams<{ serviceId: string }>();
          const location = useLocation();
          return (
            <WebUINavigate
              to={`/deployments/${serviceId}${location.search}`}
              replace
            />
          );
        },
      },
    ],
  },
  {
    path: '/service',
    handle: { labelKey: 'webui.menu.Serving' },
    children: [
      {
        path: '',
        element: <WebUINavigate to="/deployments" replace />,
      },
      {
        // FR-2675 — Legacy `/service/start` → new `/deployments/start`.
        path: 'start',
        Component: () => {
          const location = useLocation();
          return (
            <WebUINavigate
              to={'/deployments/start' + location.search}
              replace
            />
          );
        },
      },
      {
        // FR-2675 — Legacy `/service/update/:endpointId` →
        // `/deployments/:deploymentId/edit`.
        path: 'update/:endpointId',
        Component: () => {
          const { endpointId } = useParams<{ endpointId: string }>();
          const location = useLocation();
          return (
            <WebUINavigate
              to={`/deployments/${endpointId}/edit${location.search}`}
              replace
            />
          );
        },
      },
      {
        // FR-2664 — Legacy fallback: /service/:endpointId → /deployments/:deploymentId
        path: ':endpointId',
        Component: () => {
          const { endpointId } = useParams<{ endpointId: string }>();
          const location = useLocation();
          return (
            <WebUINavigate
              to={`/deployments/${endpointId}${location.search}`}
              replace
            />
          );
        },
      },
      {
        // FR-2664 — Legacy fallback: /service/:endpointId/edit → /deployments/:deploymentId/edit
        path: ':endpointId/edit',
        Component: () => {
          const { endpointId } = useParams<{ endpointId: string }>();
          const location = useLocation();
          return (
            <WebUINavigate
              to={`/deployments/${endpointId}/edit${location.search}`}
              replace
            />
          );
        },
      },
    ],
  },
  {
    path: '/model-store',
    handle: { labelKey: 'data.ModelStore' },
    Component: () => {
      const baiClient = useSuspendedBackendaiClient();
      return baiClient?.supports('model-card-v2') ? (
        <Suspense fallback={<Skeleton active />}>
          <ModelStoreListPageV2 />
        </Suspense>
      ) : (
        <Suspense fallback={<Skeleton active />}>
          <LegacyModelStoreListPage />
        </Suspense>
      );
    },
  },
  // Redirect paths for backward compatibility
  {
    path: '/import',
    Component: () => {
      const location = useLocation();
      return <WebUINavigate to={'/start' + location.search} replace />;
    },
  },
  // Redirect paths for legacy support
  {
    path: '/github',
    Component: () => {
      const location = useLocation();
      return <WebUINavigate to={'/start' + location.search} replace />;
    },
  },
  {
    path: '/data',
    handle: { labelKey: 'webui.menu.Data' },
    Component: VFolderNodeListPage,
  },
  {
    path: '/my-environment',
    element: (
      <Suspense fallback={<Skeleton active />}>
        <MyEnvironmentPage />
      </Suspense>
    ),
    handle: { labelKey: 'webui.menu.MyEnvironments' },
  },
  {
    path: '/agent-summary',
    element: (
      <Suspense fallback={<Skeleton active />}>
        <AgentSummaryPage />
      </Suspense>
    ),
    handle: { labelKey: 'webui.menu.AgentSummary' },
  },
  {
    path: '/statistics',
    handle: { labelKey: 'webui.menu.Statistics' },
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
  },
  {
    path: '/admin-session',
    handle: { labelKey: 'webui.menu.Sessions' },
    element: (
      <Suspense fallback={<Skeleton active />}>
        <AdminSessionPage />
      </Suspense>
    ),
  },
  {
    // FR-2664 — New admin deployment list route. Replaces the legacy
    // /admin-serving route (see fallback redirect below).
    path: '/admin-deployments',
    handle: { labelKey: 'webui.menu.Serving' },
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
      },
      {
        path: 'deployment-presets/new',
        handle: { labelKey: 'adminDeploymentPreset.CreatePreset' },
        element: (
          <BAIErrorBoundary>
            <Suspense fallback={<Skeleton active />}>
              <AdminDeploymentPresetSettingPage />
            </Suspense>
          </BAIErrorBoundary>
        ),
      },
      {
        path: 'deployment-presets/:presetId/edit',
        handle: { labelKey: 'adminDeploymentPreset.EditPreset' },
        element: (
          <BAIErrorBoundary>
            <Suspense fallback={<Skeleton active />}>
              <AdminDeploymentPresetSettingPage />
            </Suspense>
          </BAIErrorBoundary>
        ),
      },
    ],
  },
  {
    // FR-2664 — Legacy /admin-serving fallback. Transient redirect; remove
    // once all internal links + external references have been migrated.
    path: '/admin-serving',
    handle: { labelKey: 'webui.menu.Serving' },
    children: [
      {
        index: true,
        Component: () => {
          const location = useLocation();
          return (
            <WebUINavigate
              to={'/admin-deployments' + location.search}
              replace
            />
          );
        },
      },
      {
        // /admin-deployments has no nested detail route — the deployment
        // detail page is shared at /deployments/:deploymentId regardless
        // of the viewer's role.
        path: ':serviceId',
        Component: () => {
          const { serviceId } = useParams<{ serviceId: string }>();
          const location = useLocation();
          return (
            <WebUINavigate
              to={`/deployments/${serviceId}${location.search}`}
              replace
            />
          );
        },
      },
    ],
  },
  {
    path: '/admin-data',
    handle: { labelKey: 'webui.menu.Data' },
    Component: () => {
      useSuspendedBackendaiClient();
      return (
        <Suspense fallback={<Skeleton active />}>
          <AdminVFolderNodeListPage />
        </Suspense>
      );
    },
  },
  {
    path: '/project-admin-users',
    handle: { labelKey: 'webui.menu.ProjectMembers' },
    Component: () => {
      useSuspendedBackendaiClient();
      return (
        <Suspense fallback={<Skeleton active />}>
          <ProjectAdminUsersPage />
        </Suspense>
      );
    },
  },
  {
    path: '/project-data',
    handle: { labelKey: 'webui.menu.Data' },
    Component: () => {
      useSuspendedBackendaiClient();
      return (
        <Suspense fallback={<Skeleton active />}>
          <ProjectAdminDataPage />
        </Suspense>
      );
    },
  },
  {
    path: '/project-admin-deployments',
    handle: { labelKey: 'webui.menu.ProjectDeployments' },
    Component: () => {
      useSuspendedBackendaiClient();
      return (
        <Suspense fallback={<Skeleton active />}>
          <ProjectAdminDeploymentsPage />
        </Suspense>
      );
    },
  },
  {
    path: '/environment',
    handle: { labelKey: 'webui.menu.Environments' },
    element: (
      <Suspense fallback={<Skeleton active />}>
        <EnvironmentPage />
      </Suspense>
    ),
  },
  {
    path: '/scheduler',
    handle: { labelKey: 'webui.menu.Scheduler' },
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
  },
  {
    path: '/agent',
    handle: { labelKey: 'webui.menu.Resources' },
    element: (
      <Suspense fallback={<Skeleton active />}>
        <ResourcesPage />
      </Suspense>
    ),
  },
  {
    path: '/resource-policy',
    handle: { labelKey: 'webui.menu.ResourcePolicies' },
    element: (
      <Suspense fallback={<Skeleton active />}>
        <ResourcePolicyPage />
      </Suspense>
    ),
  },
  {
    path: '/reservoir',
    handle: { labelKey: 'webui.menu.Reservoir' },
    children: [
      {
        path: '',
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
      },
      {
        path: '/reservoir/:artifactId',
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
        handle: { labelKey: 'webui.menu.ArtifactDetails' },
      },
    ],
  },
  {
    path: '/settings',
    element: (
      <Suspense fallback={<Skeleton active />}>
        <ConfigurationsPage />
      </Suspense>
    ),
    handle: { labelKey: 'webui.menu.Configurations' },
  },
  {
    path: '/maintenance',
    element: (
      <Suspense fallback={<Skeleton active />}>
        <MaintenancePage />
      </Suspense>
    ),
    handle: { labelKey: 'webui.menu.Maintenance' },
  },
  {
    path: '/diagnostics',
    element: (
      <Suspense fallback={<Skeleton active />}>
        <DiagnosticsPage />
      </Suspense>
    ),
    handle: { labelKey: 'webui.menu.Diagnostics' },
  },
  {
    path: '/rbac',
    handle: { labelKey: 'webui.menu.RBACManagement' },
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
  },
  {
    path: '/branding',
    element: (
      <Suspense fallback={<Skeleton active />}>
        <BrandingPage />
      </Suspense>
    ),
    handle: { labelKey: 'webui.menu.Branding' },
  },
  {
    path: '/project',
    element: (
      <BAIErrorBoundary>
        <Suspense fallback={<Skeleton active />}>
          <ProjectPage />
        </Suspense>
      </BAIErrorBoundary>
    ),
    handle: { labelKey: 'webui.menu.Projects' },
  },
  {
    path: '/storage-settings/:hostname',
    handle: { labelKey: 'storageHost.StorageSetting' },
    element: (
      <Suspense fallback={<Skeleton active />}>
        <StorageHostSettingPage />
      </Suspense>
    ),
  },
  {
    path: '/information',
    handle: { labelKey: 'webui.menu.Information' },
    element: (
      <Suspense fallback={<Skeleton active />}>
        <Information />
      </Suspense>
    ),
  },
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
    path: '/admin-dashboard',
    handle: { labelKey: 'webui.menu.AdminDashboard' },
    Component: () => {
      return (
        <BAIErrorBoundary>
          <Suspense fallback={<Skeleton active />}>
            <AdminDashboardPage />
          </Suspense>
        </BAIErrorBoundary>
      );
    },
  },
  {
    path: '/credential',
    handle: { labelKey: 'webui.menu.UserCredentials&Policies' },
    element: (
      <Suspense fallback={<Skeleton active />}>
        <UserCredentialsPage />
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
  {
    path: '/ai-agent',
    handle: { labelKey: 'webui.menu.AIAgents' },
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
const { staticPaths, dynamicPatterns } = extractRoutePaths(
  mainLayoutChildRoutes,
);
populateRouterPaths(staticPaths, dynamicPatterns);
