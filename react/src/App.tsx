import BAIErrorBoundary, { ErrorView } from './components/BAIErrorBoundary';
import {
  DefaultProvidersForReactRoot,
  RoutingEventHandler,
} from './components/DefaultProviders';
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
import React, { Suspense, FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IndexRouteObject,
  RouterProvider,
  createBrowserRouter,
  useLocation,
} from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';

const Information = React.lazy(() => import('./components/Information'));
const EndpointDetailPage = React.lazy(
  () => import('./pages/EndpointDetailPage'),
);
const StartPage = React.lazy(() => import('./pages/StartPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
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
const ImportAndRunPage = React.lazy(() => import('./pages/ImportAndRunPage'));
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
      <QueryParamProvider adapter={ReactRouter6Adapter}>
        <InteractiveLoginPage />
      </QueryParamProvider>
    ),
  },
  {
    path: '/',
    errorElement: <ErrorView />,
    element: (
      <QueryParamProvider
        adapter={ReactRouter6Adapter}
        options={
          {
            // searchStringToObject: queryString.parse,
            // objectToSearchString: queryString.stringify,
          }
        }
      >
        <MainLayout />
        <RoutingEventHandler />
        <Suspense>
          <FolderExplorerOpener />
          <FolderInvitationResponseModalOpener />
          <FileUploadManager />
        </Suspense>
      </QueryParamProvider>
    ),
    children: [
      {
        path: '/start',
        element: (
          <BAIErrorBoundary>
            <StartPage />
          </BAIErrorBoundary>
        ),
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
        path: '/summary',
        Component: () => {
          const location = useLocation();
          const [experimentalDashboard] = useBAISettingUserState(
            'experimental_dashboard',
          );
          return experimentalDashboard ? (
            <WebUINavigate to={'/dashboard' + location.search} replace />
          ) : null;
        },
        handle: { labelKey: 'webui.menu.Summary' },
      },
      {
        path: '/dashboard',
        handle: { labelKey: 'webui.menu.Dashboard' },
        Component: () => {
          const location = useLocation();
          const [experimentalDashboard] = useBAISettingUserState(
            'experimental_dashboard',
          );
          return experimentalDashboard ? (
            <BAIErrorBoundary>
              <Suspense fallback={<Skeleton active />}>
                <DashboardPage />
              </Suspense>
            </BAIErrorBoundary>
          ) : (
            <WebUINavigate to={'/summary' + location.search} replace />
          );
        },
      },
      {
        path: '/job',
        handle: { labelKey: 'webui.menu.Sessions' },
        Component: () => {
          const location = useLocation();
          const [experimentalNeoSessionList] = useBAISettingUserState(
            'experimental_neo_session_list',
          );
          return experimentalNeoSessionList ? (
            <WebUINavigate to={'/session' + location.search} replace />
          ) : (
            <BAIErrorBoundary>
              <SessionDetailAndContainerLogOpenerLegacy />
            </BAIErrorBoundary>
          );
        },
      },
      {
        path: '/session',
        handle: { labelKey: 'webui.menu.Sessions' },
        children: [
          {
            path: '',
            Component: () => {
              const location = useLocation();
              const [experimentalNeoSessionList] = useBAISettingUserState(
                'experimental_neo_session_list',
              );

              useSuspendedBackendaiClient();

              return experimentalNeoSessionList ? (
                <BAIErrorBoundary>
                  <Suspense
                    fallback={
                      <Skeleton active />
                      // <BAICard title={t('webui.menu.Sessions')} loading />
                    }
                  >
                    <ComputeSessionListPage />
                    <SessionDetailAndContainerLogOpenerLegacy />
                  </Suspense>
                </BAIErrorBoundary>
              ) : (
                <WebUINavigate to={'/job' + location.search} replace />
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
                <BAIErrorBoundary>
                  <Suspense
                    fallback={
                      <BAICard title={t('webui.menu.Serving')} loading />
                    }
                  >
                    <ServingPage />
                  </Suspense>
                </BAIErrorBoundary>
              );
            },
          },
          {
            path: '/serving/:serviceId',
            element: (
              <BAIErrorBoundary>
                <Suspense fallback={<Skeleton active />}>
                  <EndpointDetailPage />
                </Suspense>
              </BAIErrorBoundary>
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
              <BAIErrorBoundary>
                <Suspense
                  fallback={
                    <BAIFlex direction="column" style={{ maxWidth: 700 }}>
                      <Skeleton active />
                    </BAIFlex>
                  }
                >
                  <ServiceLauncherCreatePage />
                </Suspense>
              </BAIErrorBoundary>
            ),
          },
          {
            path: 'update/:endpointId',
            handle: { labelKey: 'modelService.UpdateService' },
            element: (
              <BAIErrorBoundary>
                <Suspense
                  fallback={
                    <BAIFlex direction="column" style={{ maxWidth: 700 }}>
                      <Skeleton active />
                    </BAIFlex>
                  }
                >
                  <ServiceLauncherUpdatePage />
                </Suspense>
              </BAIErrorBoundary>
            ),
          },
        ],
      },
      {
        path: '/model-store',
        handle: { labelKey: 'data.ModelStore' },
        element: (
          <BAIErrorBoundary>
            <Suspense
              fallback={
                <BAIFlex direction="column" style={{ maxWidth: 700 }}>
                  <Skeleton active />
                </BAIFlex>
              }
            >
              <ModelStoreListPage />
            </Suspense>
          </BAIErrorBoundary>
        ),
      },
      {
        path: '/import',
        handle: { labelKey: 'webui.menu.Import&Run' },
        Component: () => {
          return (
            <BAIErrorBoundary>
              <ImportAndRunPage />
              {/* @ts-ignore */}
              <backend-ai-import-view active class="page" name="import" />
            </BAIErrorBoundary>
          );
        },
      },
      {
        path: '/data',
        handle: { labelKey: 'webui.menu.Data' },
        Component: () => {
          return (
            <BAIErrorBoundary>
              <VFolderNodeListPage />
            </BAIErrorBoundary>
          );
        },
      },
      {
        path: '/my-environment',
        element: (
          <BAIErrorBoundary>
            <MyEnvironmentPage />
          </BAIErrorBoundary>
        ),
        handle: { labelKey: 'webui.menu.MyEnvironments' },
      },
      {
        path: '/agent-summary',
        element: (
          <BAIErrorBoundary>
            <AgentSummaryPage />
          </BAIErrorBoundary>
        ),
        handle: { labelKey: 'webui.menu.AgentSummary' },
      },
      {
        path: '/statistics',
        handle: { labelKey: 'webui.menu.Statistics' },
        Component: () => {
          useSuspendedBackendaiClient();
          return (
            <BAIErrorBoundary>
              <Suspense
                fallback={
                  <BAIFlex direction="column" style={{ maxWidth: 700 }}>
                    <Skeleton active />
                  </BAIFlex>
                }
              >
                <StatisticsPage />
              </Suspense>
            </BAIErrorBoundary>
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
            <BAIErrorBoundary>
              <Suspense fallback={<Skeleton active />}>
                <SchedulerPage />
                <SessionDetailAndContainerLogOpenerLegacy />
              </Suspense>
            </BAIErrorBoundary>
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
        handle: { labelKey: 'Reservoir' },
        children: [
          {
            path: '',
            Component: () => {
              return (
                <BAIErrorBoundary>
                  <Suspense
                    fallback={
                      <BAIFlex direction="column" style={{ maxWidth: 700 }}>
                        <Skeleton active />
                      </BAIFlex>
                    }
                  >
                    <ReservoirPage />
                  </Suspense>
                </BAIErrorBoundary>
              );
            },
          },
          {
            path: '/reservoir/:artifactId',
            element: (
              <BAIErrorBoundary>
                <Suspense fallback={<Skeleton active />}>
                  <ReservoirPage />
                </Suspense>
              </BAIErrorBoundary>
            ),
            handle: { labelKey: 'Artifact Details' },
          },
        ],
      },
      {
        path: '/settings',
        element: (
          <BAIErrorBoundary>
            <ConfigurationsPage />
          </BAIErrorBoundary>
        ),
        handle: { labelKey: 'webui.menu.Configurations' },
      },
      {
        path: '/maintenance',
        element: (
          <BAIErrorBoundary>
            <MaintenancePage />
          </BAIErrorBoundary>
        ),
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
    <DefaultProvidersForReactRoot>
      <RouterProvider router={router} />
    </DefaultProvidersForReactRoot>
  );
};

export default App;
