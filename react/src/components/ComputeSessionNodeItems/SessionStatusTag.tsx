import Flex from '../Flex';
import {
  SessionStatusTagFragment$data,
  SessionStatusTagFragment$key,
} from './__generated__/SessionStatusTagFragment.graphql';
import { LoadingOutlined } from '@ant-design/icons';
import { Tag, theme } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React from 'react';
import { useFragment } from 'react-relay';

interface SessionStatusTagProps {
  sessionFrgmt?: SessionStatusTagFragment$key | null;
}
const statusTagColor = {
  //prepare
  RESTARTING: 'blue',
  PREPARED: 'blue',
  PREPARING: 'blue',
  PULLING: 'blue',
  //running
  RUNNING: 'green',
  PENDING: 'green',
  SCHEDULED: 'green',
  //error
  ERROR: 'red',
  //finished return undefined
};

const isTransitional = (session: SessionStatusTagFragment$data) => {
  return [
    'RESTARTING',
    'TERMINATING',
    'PENDING',
    'PREPARING',
    'PULLING',
  ].includes(session?.status || '');
};

const statusInfoTagColor = {
  // 'idle-timeout': undefined,
  // 'user-requested': undefined,
  // scheduled: undefined,
  // 'self-terminated': undefined,
  'no-available-instances': 'red',
  'failed-to-start': 'red',
  'creation-failed': 'red',
};
const SessionStatusTag: React.FC<SessionStatusTagProps> = ({
  sessionFrgmt,
}) => {
  const session = useFragment(
    graphql`
      fragment SessionStatusTagFragment on ComputeSessionNode {
        id
        name
        status
        status_info
      }
    `,
    sessionFrgmt,
  );
  const { token } = theme.useToken();

  return session ? (
    _.isEmpty(session.status_info) ? (
      <Tag
        color={
          session.status ? _.get(statusTagColor, session.status) : undefined
        }
        icon={isTransitional(session) ? <LoadingOutlined spin /> : undefined}
      >
        {session.status || ' '}
      </Tag>
    ) : (
      <Flex>
        <Tag
          style={{ margin: 0, zIndex: 1 }}
          color={
            session.status ? _.get(statusTagColor, session.status) : undefined
          }
        >
          {session.status}
        </Tag>
        <Tag
          style={{
            margin: 0,
            marginLeft: -1,
            borderStyle: 'dashed',
            color:
              session.status_info &&
              _.get(statusInfoTagColor, session.status_info)
                ? undefined
                : token.colorTextSecondary,
          }}
          color={
            session.status_info
              ? _.get(statusInfoTagColor, session.status_info)
              : undefined
          }
        >
          {session.status_info}
        </Tag>
      </Flex>
    )
  ) : null;
};

export default SessionStatusTag;
