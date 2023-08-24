import { Tag } from 'antd';
import React from 'react';
import { useFragment } from 'react-relay';
import { EndpointStatusTagFragment$key } from './__generated__/EndpointStatusTagFragment.graphql';
import graphql from 'babel-plugin-relay/macro';

interface EndpointStatusTagProps {
  endpointFrgmt: EndpointStatusTagFragment$key | null;
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
      color = 'success';
      break;
    // case 'TERMINATED':
    //   color = 'default';
    //   break;
  }

  return <Tag color={color}>{endpoint?.status}</Tag>;
};

export default EndpointStatusTag;
