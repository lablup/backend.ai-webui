import { Skeleton, theme } from 'antd';
import React, { Suspense } from 'react';
import { StringParam, useQueryParams } from 'use-query-params';

const AIAgentIFramePage: React.FC = () => {
  const { token } = theme.useToken();
  const [{ url }] = useQueryParams({
    url: StringParam,
  });

  return (
    <Suspense
      fallback={<Skeleton active style={{ padding: token.paddingMD }} />}
    >
      {url && (
        <iframe
          src={url}
          title="AI Agent Content"
          style={{
            width: '100%',
            height: '100vh',
            border: 'none',
            borderRadius: token.borderRadius,
          }}
        />
      )}
    </Suspense>
  );
};

export default AIAgentIFramePage;
