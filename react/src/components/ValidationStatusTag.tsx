import { LoadingOutlined } from '@ant-design/icons';
import { Spin, Tag } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import React, { Suspense } from 'react';

interface ValidationStatusTagProps {}

const ValidationStatusTag: React.FC<ValidationStatusTagProps> = ({}) => {
  let color = 'default';

  return (
    <Suspense fallback={<Spin indicator={<LoadingOutlined spin />} />}>
      <Tag color={color}>
        Processing...
        {
          //  TODO: graphql fetching via server-side event
        }
      </Tag>
    </Suspense>
  );
};

export default ValidationStatusTag;
