import { SessionTypeTagFragment$key } from './__generated__/SessionTypeTagFragment.graphql';
import { Tag } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React from 'react';
import { useFragment } from 'react-relay';

const typeTagColor = {
  INTERACTIVE: 'green',
  BATCH: 'darkgreen',
  INFERENCE: 'blue',
};

interface SessionTypeTagProps {
  sessionFrgmt: SessionTypeTagFragment$key;
}

const SessionTypeTag: React.FC<SessionTypeTagProps> = ({ sessionFrgmt }) => {
  const session = useFragment(
    graphql`
      fragment SessionTypeTagFragment on ComputeSessionNode {
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

export default SessionTypeTag;
