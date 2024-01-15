import AnnouncementAlert from './components/AnnouncementAlert';
import {
  DefaultProviders2,
  RoutingEventHandler,
} from './components/DefaultProviders';
import MainLayout from './components/MainLayout/MainLayout';
import React from 'react';
import { FC } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';

const Information = React.lazy(() => import('./components/Information'));
const ServingListPage = React.lazy(() => import('./pages/ServingListPage'));
const EnvironmentPage = React.lazy(() => import('./pages/EnvironmentPage'));

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
        Component: ServingListPage,
        handle: { labelKey: 'webui.menu.Serving' },
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
        path: '/credential',
        handle: { labelKey: 'webui.menu.Users' },
      },
      {
        path: '/environment',
        handle: { labelKey: 'webui.menu.Environments' },
        Component: EnvironmentPage,
      },
      {
        path: '/agent',
        handle: { labelKey: 'webui.menu.Resources' },
      },
      {
        path: '/settings',
        handle: { labelKey: 'webui.menu.Configurations' },
      },
      {
        path: '/maintenance',
        handle: { labelKey: 'webui.menu.Maintenance' },
      },
      {
        path: '/information',
        handle: { labelKey: 'webui.menu.Information' },
        Component: Information,
      },
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

// const App = () => {
//   // return (
//   //   <>
//   //     <h1>123</h1>
//   //     <h1>123</h1>
//   //     <h1>123</h1>
//   //     <h1>123</h1>
//   //     <h1>123</h1>
//   //     <h1>123</h1>
//   //   </>
//   // );
//   return (
//     // @ts-ignore

//     // <backend-ai-webui
//     //   id="webui-shell"
//     //   // style={{
//     //   //   backgroundColor: '#222222',
//     //   // }}
//     // />
//   );
// };

export default App;
