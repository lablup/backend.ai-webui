import { Skeleton, theme } from 'antd';
import React, { Suspense } from 'react';

const AgentsPage: React.FC = () => {
  const { token } = theme.useToken();

  return (
    <Suspense
      fallback={<Skeleton active style={{ padding: token.paddingMD }} />}
    >
      <div>Agents Page</div>
    </Suspense>
  );
};

export default AgentsPage;
