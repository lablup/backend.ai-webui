import AnnouncementAlert from './components/AnnouncementAlert';
import {
  DefaultProviders2,
  RoutingEventHandler,
} from './components/DefaultProviders';
import MainLayout from './components/MainLayout/MainLayout';
import Page401 from './pages/Page401';
import Page404 from './pages/Page404';
import ServingListPagePreloaded from './pages/ServingListPagePreloaded';
import React from 'react';
import { FC } from 'react';
import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
} from 'react-router-dom';
import { RecoilRoot } from 'recoil';

const Information = React.lazy(() => import('./components/Information'));
const EnvironmentPage = React.lazy(() => import('./pages/EnvironmentPage'));
const StorageHostSettingPage = React.lazy(
  () => import('./pages/StorageHostSettingPage'),
);

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <>
        <MainLayout />
        <RoutingEventHandler />
      </>
    ),
    handle: { labelKey: 'webui.menu.Summary' },
    children: [
      {
        path: '/',
        element: <Navigate to="/summary" replace />,
      },
      {
        path: '/summary',
        Component: () => (
          <AnnouncementAlert
            showIcon
            icon={undefined}
            banner={false}
            style={{ marginBottom: 16 }}
            closable
          />
        ),
        handle: { labelKey: 'webui.menu.Summary' },
      },
      {
        path: '/job',
        handle: { labelKey: 'webui.menu.Sessions' },
      },
      {
        path: '/serving',
        // element: <ServingListPage />,
        Component: ServingListPagePreloaded,
        handle: { labelKey: 'webui.menu.Serving' },
        // loader: () => {
        //   // @ts-ignore
        //   // alert(globalThis.backendaiclient.current_group_id());
        //   return null;
        //   // return loadQuery(
        //   //   RelayEnvironment,
        //   //   ServingListPageQuery,
        //   //   {
        //   //     offset: 1,
        //   //     limit: 100,
        //   //     // @ts-ignore
        //   //     // projectID: globalThis.backendaiclient.current_group_id()
        //   //     projectID: '2de2b969-1d04-48a6-af16-0bc8adb3c831',
        //   //   },
        //   //   { fetchPolicy: 'store-or-network' },
        //   // );
        // },
      },
      {
        path: '/import',
        handle: { labelKey: 'webui.menu.Import&Run' },
      },
      {
        path: '/data',
        handle: { labelKey: 'webui.menu.Data&Storage' },
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
      },
      {
        path: '/session/start',
        handle: { labelKey: 'session.launcher.StartNewSession' },
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
    <RecoilRoot>
      <DefaultProviders2>
        {/* <QueryParamProvider
        adapter={ReactRouter6Adapter}
        options={
          {
            // searchStringToObject: queryString.parse,
            // objectToSearchString: queryString.stringify,
          }
        }
      > */}
        <RouterProvider router={router} />
        {/* </QueryParamProvider> */}
      </DefaultProviders2>
    </RecoilRoot>
  );
};

export default App;
