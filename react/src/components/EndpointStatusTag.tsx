/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { EndpointStatusTagFragment$key } from '../__generated__/EndpointStatusTagFragment.graphql';
import { Tag } from 'antd';
import React from 'react';
import { graphql, useFragment } from 'react-relay';

interface EndpointStatusTagProps {
  endpointFrgmt: EndpointStatusTagFragment$key | null | undefined;
}
const EndpointStatusTag: React.FC<EndpointStatusTagProps> = ({
  endpointFrgmt,
}) => {
  const endpoint = useFragment(
    graphql`
      fragment EndpointStatusTagFragment on Endpoint {
        id
        status
      }
    `,
    endpointFrgmt,
  );
  let color = 'default';
  switch (endpoint?.status?.toUpperCase()) {
    case 'RUNNING':
    case 'HEALTHY':
      color = 'success';
      break;

    // case 'TERMINATED':
    //   color = 'default';
    //   break;
  }

  return <Tag color={color}>{endpoint?.status}</Tag>;
};

export default EndpointStatusTag;
