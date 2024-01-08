import AnnouncementAlert from './components/AnnouncementAlert';
import DefaultProviders, {
  DefaultProviders2,
  RoutingEventHandler,
} from './components/DefaultProviders';
import Flex from './components/Flex';
import Information from './components/Information';
import MainLayout from './components/MainLayout/MainLayout';
import ServingListPage from './pages/ServingListPage';
import React, { FC } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';

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
