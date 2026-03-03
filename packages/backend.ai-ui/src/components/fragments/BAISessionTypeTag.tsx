import { BAISessionTypeTagFragment$key } from '../../__generated__/BAISessionTypeTagFragment.graphql';
import { Tag } from 'antd';
import _ from 'lodash';
import React from 'react';
import { useFragment, graphql } from 'react-relay';

const typeTagColor = {
  INTERACTIVE: 'geekblue',
  BATCH: 'cyan',
  INFERENCE: 'purple',
};

export interface BAISessionTypeTagProps {
  sessionFrgmt: BAISessionTypeTagFragment$key;
}

const BAISessionTypeTag: React.FC<BAISessionTypeTagProps> = ({
  sessionFrgmt,
}) => {
  const session = useFragment(
    graphql`
      fragment BAISessionTypeTagFragment on ComputeSessionNode {
        type
      }
    `,
    sessionFrgmt,
  );

  return (
    <Tag color={_.get(typeTagColor, _.toUpper(session.type || ''))}>
      {_.toUpper(session.type || '')}
    </Tag>
  );
};

export default BAISessionTypeTag;
