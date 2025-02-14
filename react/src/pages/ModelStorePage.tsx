import { Skeleton, theme } from 'antd';
import React, { Suspense } from 'react';

const ModelStoreListPage = React.lazy(() => import('./ModelStoreListPage'));
const ModelStorePage: React.FC = () => {
  const { token } = theme.useToken();

  return (
    <Suspense
      fallback={<Skeleton active style={{ padding: token.paddingMD }} />}
    >
      <ModelStoreListPage />
    </Suspense>
  );
};

export default ModelStorePage;
