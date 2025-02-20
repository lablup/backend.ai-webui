import AnnouncementAlert from './components/AnnouncementAlert';
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
import { useBAISettingUserState } from './hooks/useBAISetting';
import Page401 from './pages/Page401';
import Page404 from './pages/Page404';
import VFolderListPage from './pages/VFolderListPage';
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
const ServingPage = React.lazy(() => import('./pages/ServingPage'));
const EndpointDetailPage = React.lazy(
  () => import('./pages/EndpointDetailPage'),
);
// const SummaryPage = React.lazy(() => import('./pages/SummaryPage'));
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

const ComputeSessionListPage = React.lazy(
  () => import('./pages/ComputeSessionListPage'),
);
const AgentSummaryPage = React.lazy(() => import('./pages/AgentSummaryPage'));
const MaintenancePage = React.lazy(() => import('./pages/MaintenancePage'));
const SessionDetailAndContainerLogOpenerLegacy = React.lazy(
  () => import('./components/SessionDetailAndContainerLogOpenerLegacy'),
);

const ChatPage = React.lazy(() => import('./pages/ChatPage'));

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
        path: '/',
        element: <WebUINavigate to="/summary" replace />,
      },
      {
        //for electron dev mode
        path: '/build/electron-app/app/index.html',
        element: <WebUINavigate to="/summary" replace />,
      },
      {
        //for electron prod mode
        path: '/app/index.html',
        element: <WebUINavigate to="/summary" replace />,
      },
      {
        path: '/chat',
        handle: { labelKey: 'webui.menu.Chat' },
        Component: ChatPage,
      },
      {
        path: '/summary',
        Component: () => {
          const { token } = theme.useToken();
          return (
            <>
              <AnnouncementAlert
                showIcon
                icon={undefined}
                banner={false}
                style={{ marginBottom: token.paddingContentVerticalLG }}
                closable
              />
              {/* <SummaryPage /> */}
            </>
          );
        },
        handle: { labelKey: 'webui.menu.Summary' },
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
              const { t } = useTranslation();

              return experimentalNeoSessionList ? (
                <BAIErrorBoundary>
                  <Suspense
                    fallback={
                      <BAICard title={t('webui.menu.Sessions')} loading />
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
            element: (
              <BAIErrorBoundary>
                <ServingPage />
              </BAIErrorBoundary>
            ),
          },
          {
            path: '/serving/:serviceId',
            element: (
              <BAIErrorBoundary>
                <EndpointDetailPage />
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
        handle: { labelKey: 'webui.menu.Data&Storage' },
        element: (
          <BAIErrorBoundary>
            <VFolderListPage />
          </BAIErrorBoundary>
        ),
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
