import BAICard from './components/BAICard';
import BAIErrorBoundary, { ErrorView } from './components/BAIErrorBoundary';
import {
  DefaultProvidersForReactRoot,
  RoutingEventHandler,
} from './components/DefaultProviders';
import Flex from './components/Flex';
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
import React, { Suspense } from 'react';
import { FC } from 'react';
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
const AIAgentIFramePage = React.lazy(() => import('./pages/AIAgentIFramePage'));

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
        <Suspense fallback={null}>
          <FolderExplorerOpener />
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
        path: '/chat',
        handle: { labelKey: 'webui.menu.Chat' },
        Component: () => {
          const { t } = useTranslation();
          useSuspendedBackendaiClient();
          return (
            <Suspense
              fallback={<BAICard title={t('webui.menu.Chat')} loading />}
            >
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
              <DashboardPage />
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
                <Flex
                  direction="column"
                  gap={token.paddingContentVerticalLG}
                  align="stretch"
                  style={{ paddingBottom: token.paddingContentVerticalLG }}
                >
                  <LocationStateBreadCrumb />
                  <Suspense
                    fallback={
                      <Flex direction="column" style={{ maxWidth: 700 }}>
                        <Skeleton active />
                      </Flex>
                    }
                  >
                    <SessionLauncherPage />
                  </Suspense>
                </Flex>
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
                    <Flex direction="column" style={{ maxWidth: 700 }}>
                      <Skeleton active />
                    </Flex>
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
                    <Flex direction="column" style={{ maxWidth: 700 }}>
                      <Skeleton active />
                    </Flex>
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
                <Flex direction="column" style={{ maxWidth: 700 }}>
                  <Skeleton active />
                </Flex>
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
          const [classicSessionLauncher] = useBAISettingUserState(
            'classic_session_launcher',
          );
          return (
            <BAIErrorBoundary>
              {classicSessionLauncher ? null : <ImportAndRunPage />}
              {/* @ts-ignore */}
              <backend-ai-import-view
                active
                class="page"
                name="import"
                sessionLauncherType={classicSessionLauncher ? 'classic' : 'neo'}
              />
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
                  <Flex direction="column" style={{ maxWidth: 700 }}>
                    <Skeleton active />
                  </Flex>
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
        Component: Page404,
      },
      {
        path: '/unauthorized',
        handle: { labelKey: 'webui.UnauthorizedAccess' },
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
      {
        path: '/ai-agent/external',
        handle: { labelKey: 'webui.menu.AIAgents' },
        Component: () => (
          <Suspense fallback={<Skeleton active />}>
            <AIAgentIFramePage />
          </Suspense>
        ),
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
