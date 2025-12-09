import BAIErrorBoundary, { ErrorView } from './components/BAIErrorBoundary';
import {
  DefaultProvidersForReactRoot,
  RoutingEventHandler,
} from './components/DefaultProviders';
import ErrorBoundaryWithNullFallback from './components/ErrorBoundaryWithNullFallback';
import FlexActivityIndicator from './components/FlexActivityIndicator';
import LocationStateBreadCrumb from './components/LocationStateBreadCrumb';
import MainLayout from './components/MainLayout/MainLayout';
import WebUINavigate from './components/WebUINavigate';
import { useSuspendedBackendaiClient } from './hooks';
import { useBAISettingUserState } from './hooks/useBAISetting';
// High priority to import the component
import ComputeSessionListPage from './pages/ComputeSessionListPage';
import ModelStoreListPage from './pages/ModelStoreListPage';
import Page401 from './pages/Page401';
import Page404 from './pages/Page404';
import ServingPage from './pages/ServingPage';
import VFolderNodeListPage from './pages/VFolderNodeListPage';
import { Skeleton, theme } from 'antd';
import { BAIFlex, BAICard } from 'backend.ai-ui';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v6';
import React, { Suspense, FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IndexRouteObject,
  RouterProvider,
  createBrowserRouter,
  useLocation,
} from 'react-router-dom';

const Information = React.lazy(() => import('./components/Information'));
const EndpointDetailPage = React.lazy(
  () => import('./pages/EndpointDetailPage'),
);
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
const ServiceLauncherCreatePage = React.lazy(
  () => import('./components/ServiceLauncherPageContent'),
);
const ServiceLauncherUpdatePage = React.lazy(
  () => import('./pages/ServiceLauncherPage'),
);
const InteractiveLoginPage = React.lazy(
  () => import('./pages/InteractiveLoginPage'),
);
const UserCredentialsPage = React.lazy(
  () => import('./pages/UserCredentialsPage'),
);

const AgentSummaryPage = React.lazy(() => import('./pages/AgentSummaryPage'));
const MaintenancePage = React.lazy(() => import('./pages/MaintenancePage'));
const StatisticsPage = React.lazy(() => import('./pages/StatisticsPage'));
const ConfigurationsPage = React.lazy(
  () => import('./pages/ConfigurationsPage'),
);
const SessionDetailAndContainerLogOpenerLegacy = React.lazy(
  () => import('./components/SessionDetailAndContainerLogOpenerLegacy'),
);

const ChatPage = React.lazy(() => import('./pages/ChatPage'));

const AIAgentPage = React.lazy(() => import('./pages/AIAgentPage'));
const ReservoirPage = React.lazy(() => import('./pages/ReservoirPage'));
const ReservoirArtifactDetailPage = React.lazy(
  () => import('./pages/ReservoirArtifactDetailPage'),
);

const SchedulerPage = React.lazy(() => import('./pages/SchedulerPage'));

interface CustomHandle {
  title?: string;
  labelKey?: string;
}
export interface WebUIRouteObject extends IndexRouteObject {
  handle: CustomHandle;
}

const router = createBrowserRouter([
  {
    path: '/interactive-login',
    errorElement: <ErrorView />,
    element: (
      <BAIErrorBoundary>
        <DefaultProvidersForReactRoot>
          <InteractiveLoginPage />
        </DefaultProvidersForReactRoot>
      </BAIErrorBoundary>
    ),
  },
  {
    path: '/',
    errorElement: <ErrorView />,
    element: (
      <BAIErrorBoundary>
        <DefaultProvidersForReactRoot>
          {/*FYI, MainLayout has ErrorBoundaryWithNullFallback for <Outlet/> */}
          <MainLayout />
          <ErrorBoundaryWithNullFallback>
            <RoutingEventHandler />
          </ErrorBoundaryWithNullFallback>
          <Suspense>
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
        </DefaultProvidersForReactRoot>
      </BAIErrorBoundary>
    ),
    children: [
      {
        path: '/start',
        element: <StartPage />,
        handle: { labelKey: 'webui.menu.Start' },
      },
      {
        //for electron dev mode
        path: '/build/electron-app/app/index.html',
        element: <WebUINavigate to="/start" replace />,
      },
      {
        //for electron prod mode
        path: '/app/index.html',
        element: <WebUINavigate to="/start" replace />,
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
        // TODO: For the convenience of existing users, this path will be retained. It is scheduled for deletion in the future.
        path: '/summary',
        Component: () => {
          const location = useLocation();
          return <WebUINavigate to={'/dashboard' + location.search} replace />;
        },
        handle: { labelKey: 'webui.menu.Summary' },
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
        path: '/serving',

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
                  <ServingPage />
                </Suspense>
              );
            },
          },
          {
            path: '/serving/:serviceId',
            element: (
              <Suspense fallback={<Skeleton active />}>
                <EndpointDetailPage />
              </Suspense>
            ),
            handle: { labelKey: 'modelService.RoutingInfo' },
          },
        ],
      },
      {
        path: '/service',
        handle: { labelKey: 'webui.menu.Serving' },
        children: [
          {
            path: '',
            element: <WebUINavigate to="/serving" replace />,
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
                <ServiceLauncherCreatePage />
              </Suspense>
            ),
          },
          {
            path: 'update/:endpointId',
            handle: { labelKey: 'modelService.UpdateService' },
            element: (
              <Suspense
                fallback={
                  <BAIFlex direction="column" style={{ maxWidth: 700 }}>
                    <Skeleton active />
                  </BAIFlex>
                }
              >
                <ServiceLauncherUpdatePage />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: '/model-store',
        handle: { labelKey: 'data.ModelStore' },
        element: (
          <Suspense
            fallback={
              <BAIFlex direction="column" style={{ maxWidth: 700 }}>
                <Skeleton active />
              </BAIFlex>
            }
          >
            <ModelStoreListPage />
          </Suspense>
        ),
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
        Component: () => {
          return <VFolderNodeListPage />;
        },
      },
      {
        path: '/my-environment',
        element: <MyEnvironmentPage />,
        handle: { labelKey: 'webui.menu.MyEnvironments' },
      },
      {
        path: '/agent-summary',
        element: <AgentSummaryPage />,
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
        path: '/environment',
        handle: { labelKey: 'webui.menu.Environments' },
        Component: EnvironmentPage,
      },
      {
        path: '/scheduler',
        handle: { labelKey: 'webui.menu.Scheduler' },
        Component: () => {
          const baiClient = useSuspendedBackendaiClient();
          return baiClient?.supports('pending-session-list') ? (
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
        Component: ResourcesPage,
      },
      {
        path: '/resource-policy',
        handle: { labelKey: 'webui.menu.ResourcePolicy' },
        Component: ResourcePolicyPage,
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
        element: <ConfigurationsPage />,
        handle: { labelKey: 'webui.menu.Configurations' },
      },
      {
        path: '/maintenance',
        element: <MaintenancePage />,
        handle: { labelKey: 'webui.menu.Maintenance' },
      },
      {
        path: '/storage-settings/:hostname',
        handle: { labelKey: 'storageHost.StorageSetting' },
        Component: StorageHostSettingPage,
      },
      {
        path: '/information',
        handle: { labelKey: 'webui.menu.Information' },
        Component: Information,
      },
      {
        path: '/usersettings',
        handle: { labelKey: 'webui.menu.Settings&Logs' },
        Component: UserSettingsPage,
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
        Component: UserCredentialsPage,
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
      {
        path: '/unauthorized',
        handle: { hideBreadcrumb: true },
        Component: Page401,
      },
      // Leave empty tag for plugin pages.
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
    ],
  },
]);

const App: FC = () => {
  return (
    <NuqsAdapter>
      <RouterProvider router={router} />
    </NuqsAdapter>
  );
};

export default App;
