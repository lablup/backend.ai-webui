import Flex from '../Flex';
import {
  SessionStatusTagFragment$data,
  SessionStatusTagFragment$key,
} from './__generated__/SessionStatusTagFragment.graphql';
import { LoadingOutlined } from '@ant-design/icons';
import { Tag, theme, Tooltip } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React from 'react';
import { useFragment } from 'react-relay';

interface SessionStatusTagProps {
  sessionFrgmt?: SessionStatusTagFragment$key | null;
  showInfo?: boolean;
}
const statusTagColor = {
  //prepare
  RESTARTING: 'blue',
  PREPARING: 'blue',
  PREPARED: 'blue',
  CREATING: 'blue',
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
    `PREPARING`,
    'CREATING',
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
  showInfo,
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
    _.isEmpty(session.status_info) || !showInfo ? (
      <Tooltip title={session.status_info}>
        <Tag
          color={
            session.status ? _.get(statusTagColor, session.status) : undefined
          }
          icon={isTransitional(session) ? <LoadingOutlined spin /> : undefined}
          // Comment out to match the legacy tag style temporarily
          style={{
            borderRadius: 11,
            paddingLeft: token.paddingSM,
            paddingRight: token.paddingSM,
          }}
        >
          {session.status || ' '}
        </Tag>
      </Tooltip>
    ) : (
      <Flex>
        <Tag
          style={{
            margin: 0,
            zIndex: 1,
            paddingLeft: token.paddingSM,
            borderTopLeftRadius: 11,
            borderBottomLeftRadius: 11,
          }}
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
            paddingRight: token.paddingSM,
            borderTopRightRadius: 11,
            borderBottomRightRadius: 11,
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
