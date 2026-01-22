import { routes } from './routes';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v6';
import {
  IndexRouteObject,
  RouterProvider,
  createBrowserRouter,
} from 'react-router-dom';

interface CustomHandle {
  title?: string;
  labelKey?: string;
}
export interface WebUIRouteObject extends IndexRouteObject {
  handle: CustomHandle;
}

const router = createBrowserRouter(routes);

const App: React.FC = () => {
  return (
    <NuqsAdapter
      defaultOptions={{
        // nuqs uses 'shallow: true' by default. In this case, since react-router's navigate is not used,
        // setting searchParam via navigate elsewhere may not function correctly.
        // https://github.com/47ng/nuqs/blob/5d9557ddd2e34a42cf3a0e769cd74c9c607eda84/packages/e2e/react-router/v6/src/layout.tsx#L23-L41
        shallow: false,
      }}
    >
      <RouterProvider router={router} />
    </NuqsAdapter>
  );
};

export default App;
