import AnnouncementAlert from './components/AnnouncementAlert';
import BAIErrorBoundary, { ErrorView } from './components/BAIErrorBoundary';
import {
  DefaultProvidersForReactRoot,
  RoutingEventHandler,
} from './components/DefaultProviders';
import Flex from './components/Flex';
import LocationStateBreadCrumb from './components/LocationStateBreadCrumb';
import MainLayout from './components/MainLayout/MainLayout';
import { useSuspendedBackendaiClient, useWebUINavigate } from './hooks';
import { useBAISettingUserState } from './hooks/useBAISetting';
import Page401 from './pages/Page401';
import Page404 from './pages/Page404';
import VFolderListPage from './pages/VFolderListPage';
import { Skeleton, theme } from 'antd';
import React, { Suspense } from 'react';
import { FC } from 'react';
import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
} from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';

const Information = React.lazy(() => import('./components/Information'));
const ServingPage = React.lazy(() => import('./pages/ServingPage'));
const EndpointDetailPage = React.lazy(
  () => import('./pages/EndpointDetailPage'),
);
// const SummaryPage = React.lazy(() => import('./pages/SummaryPage'));
const StartPage = React.lazy(() => import('./pages/StartPage'));
const EnvironmentPage = React.lazy(() => import('./pages/EnvironmentPage'));
const MyEnvironmentPage = React.lazy(() => import('./pages/MyEnvironmentPage'));
const StorageHostSettingPage = React.lazy(
  () => import('./pages/StorageHostSettingPage'),
);
const UserSettingsPage = React.lazy(() => import('./pages/UserSettingsPage'));
// const SessionListPage = React.lazy(() => import('./pages/SessionListPage'));
const NeoSessionPage = React.lazy(() => import('./pages/NeoSessionPage'));
const SessionLauncherPage = React.lazy(
  () => import('./pages/SessionLauncherPage'),
);
const NeoSessionLauncherSwitchAlert = React.lazy(
  () => import('./components/NeoSessionLauncherSwitchAlert'),
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

const RedirectToSummary = () => {
  useSuspendedBackendaiClient();
  const pathName = '/summary';
  document.dispatchEvent(
    new CustomEvent('move-to-from-react', {
      detail: {
        path: pathName,
        // params: options?.params,
      },
    }),
  );
  return <Navigate to="/summary" replace />;
};

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
    handle: { labelKey: 'webui.menu.Summary' },
    children: [
      {
        path: '/',
        element: <RedirectToSummary />,
      },
      {
        //for electron dev mode
        path: '/build/electron-app/app/index.html',
        element: <RedirectToSummary />,
      },
      {
        //for electron prod mode
        path: '/app/index.html',
        element: <RedirectToSummary />,
      },
      {
        path: '/start',
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
              <StartPage />
            </>
          );
        },
        handle: { labelKey: 'webui.menu.Summary' },
      },
      {
        path: '/job',
        handle: { labelKey: 'webui.menu.Sessions' },
        Component: () => {
          const { token } = theme.useToken();
          useSuspendedBackendaiClient(); // make sure the client is ready
          return (
            <NeoSessionLauncherSwitchAlert
              style={{ marginBottom: token.paddingContentVerticalLG }}
            />
          );
        },
      },
      {
        path: '/serving',
        element: (
          <BAIErrorBoundary>
            <ServingPage />
          </BAIErrorBoundary>
        ),
        handle: { labelKey: 'webui.menu.Serving' },
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
      {
        path: '/service',
        handle: { labelKey: 'webui.menu.Serving' },
        children: [
          {
            path: '',
            element: <Navigate to="/serving" replace />,
          },
          {
            path: 'start',
            handle: { labelKey: 'modelService.StartNewService' },
            element: (
              <BAIErrorBoundary>
                <ServiceLauncherCreatePage />
              </BAIErrorBoundary>
            ),
          },
          {
            path: 'update/:endpointId',
            handle: { labelKey: 'modelService.UpdateService' },
            element: (
              <BAIErrorBoundary>
                <ServiceLauncherUpdatePage />
              </BAIErrorBoundary>
            ),
          },
        ],
      },
      {
        path: '/import',
        handle: { labelKey: 'webui.menu.Import&Run' },
        Component: () => {
          const { token } = theme.useToken();
          const [is2409Launcher] = useBAISettingUserState(
            'use_2409_session_launcher',
          );
          return (
            <BAIErrorBoundary>
              <NeoSessionLauncherSwitchAlert
                style={{ marginBottom: token.paddingContentVerticalLG }}
              />
              {is2409Launcher ? null : <ImportAndRunPage />}
              {/* @ts-ignore */}
              <backend-ai-import-view
                active
                class="page"
                name="import"
                sessionLauncherType={is2409Launcher ? 'classic' : 'neo'}
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
        handle: { labelKey: 'webui.menu.ComputationResources' },
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
        handle: { labelKey: 'webui.menu.Environments&Presets' },
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
        handle: { labelKey: 'webui.UNAUTHORIZEDACCESS' },
        Component: Page401,
      },
      {
        path: '/session',
        handle: { labelKey: 'webui.menu.Sessions' },
        Component: NeoSessionPage,
        // Component: SessionListPage,
      },
      {
        path: '/session/start',
        handle: { labelKey: 'session.launcher.StartNewSession' },
        Component: () => {
          const webuiNavigate = useWebUINavigate();
          const { token } = theme.useToken();
          return (
            <Flex
              direction="column"
              gap={token.paddingContentVerticalLG}
              align="stretch"
              style={{ paddingBottom: token.paddingContentVerticalLG }}
            >
              <NeoSessionLauncherSwitchAlert
                onChange={(value) => {
                  if (value === 'current') {
                    webuiNavigate('/job');
                  }
                }}
              />
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
