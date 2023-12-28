import AnnouncementAlert from './components/AnnouncementAlert';
import DefaultProviders, {
  DefaultProviders2,
  RoutingEventHandler,
} from './components/DefaultProviders';
import MainLayout from './components/MainLayout';
import ServingListPage from './pages/ServingListPage';
import React, { FC } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
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
    children: [
      {
        path: '/summary',
        element: <AnnouncementAlert />,
      },
      {
        path: '/job',
        element: (
          // @ts-ignore
          <></>
        ),
      },
      {
        path: '/serving',
        element: <ServingListPage />,
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
