import { EndpointStatusTagFragment$key } from '../__generated__/EndpointStatusTagFragment.graphql';
import { Tag } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import React from 'react';
import { useFragment } from 'react-relay';

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
