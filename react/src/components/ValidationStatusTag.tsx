import { Tag } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import React from 'react';

interface ValidationStatusTagProps {}

const ValidationStatusTag: React.FC<ValidationStatusTagProps> = ({}) => {
  let color = 'default';

  return (
    <Tag color={color}>
      Processing...
      {
        //  TODO: graphql fetching via server-side event
      }
    </Tag>
  );
};

export default ValidationStatusTag;
