import Flex from '../Flex';
import SessionStatusDetailModal, {
  statusInfoTagColor,
} from './SessionStatusDetailModal';
import {
  SessionStatusTagFragment$data,
  SessionStatusTagFragment$key,
} from './__generated__/SessionStatusTagFragment.graphql';
import { LoadingOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Tag, Tooltip, theme } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React, { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFragment } from 'react-relay';

interface SessionStatusTagProps {
  sessionFrgmt?: SessionStatusTagFragment$key | null;
  showInfo?: boolean;
}
export const statusTagColor = {
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

const SessionStatusTag: React.FC<SessionStatusTagProps> = ({
  sessionFrgmt,
  showInfo,
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [openStatusDetailModal, setOpenStatusDetailModal] =
    useState<boolean>(false);

  const session = useFragment(
    graphql`
      fragment SessionStatusTagFragment on ComputeSessionNode {
        id
        status
        status_info
        status_data

        ...SessionStatusDetailModalFragment
      }
    `,
    sessionFrgmt,
  );

  const hasDetail = session?.status_data && session?.status_data !== '{}';

  return session ? (
    _.isEmpty(session.status_info) || !showInfo ? (
      <Tag
        color={
          session.status ? _.get(statusTagColor, session.status) : undefined
        }
        icon={isTransitional(session) ? <LoadingOutlined spin /> : undefined}
        // Comment out to match the legacy tag style temporarily
        // style={{
        //   borderRadius: 11,
        //   paddingLeft: token.paddingSM,
        //   paddingRight: token.paddingSM,
        // }}
      >
        {session.status || ' '}
      </Tag>
    ) : (
      <Flex>
        <Tooltip
          title={hasDetail ? t('button.ClickForMoreDetails') : undefined}
        >
          <Tag
            color={
              session.status ? _.get(statusTagColor, session.status) : undefined
            }
            icon={hasDetail ? <QuestionCircleOutlined /> : undefined}
            style={{
              margin: 0,
              zIndex: 1,
              cursor: hasDetail ? 'pointer' : 'auto',
            }}
            onClick={() => {
              if (hasDetail) {
                setOpenStatusDetailModal(true);
              }
            }}
          >
            {session.status}
          </Tag>
        </Tooltip>
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
        <Suspense fallback={null}>
          <SessionStatusDetailModal
            sessionFrgmt={session}
            open={openStatusDetailModal}
            onCancel={() => setOpenStatusDetailModal(false)}
          />
        </Suspense>
      </Flex>
    )
  ) : null;
};

export default SessionStatusTag;
