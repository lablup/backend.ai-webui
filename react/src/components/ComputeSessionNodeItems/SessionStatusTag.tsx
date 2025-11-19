import {
  SessionStatusTagFragment$data,
  SessionStatusTagFragment$key,
} from '../../__generated__/SessionStatusTagFragment.graphql';
import { statusInfoTagColor } from './SessionStatusDetailModal';
import { LoadingOutlined } from '@ant-design/icons';
import { Tag, Tooltip, theme } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import _ from 'lodash';
import { CircleAlertIcon } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface SessionStatusTagProps {
  sessionFrgmt?: SessionStatusTagFragment$key | null;
  showInfo?: boolean;
  showQueuePosition?: boolean;
  showTooltip?: boolean;
}
export const statusTagColor = {
  //prepare
  RESTARTING: 'blue',
  PREPARING: 'blue',
  PREPARED: 'blue',
  CREATING: 'blue',
  PULLING: 'blue',
  PENDING: 'blue',
  SCHEDULED: 'blue',
  //running
  RUNNING: 'green',
  //error
  ERROR: 'red',
  //finished return undefined
};

const isTransitional = (session: SessionStatusTagFragment$data) => {
  return [
    'SCHEDULED',
    'RESTARTING',
    'TERMINATING',
    'PENDING',
    'PREPARING',
    'PREPARED',
    'CREATING',
    'PULLING',
  ].includes(session?.status || '');
};

const SessionStatusTag: React.FC<SessionStatusTagProps> = ({
  sessionFrgmt,
  showInfo,
  showQueuePosition = true,
  showTooltip = true,
}) => {
  const { token } = theme.useToken();
  const { t } = useTranslation();

  const session = useFragment(
    graphql`
      fragment SessionStatusTagFragment on ComputeSessionNode {
        id
        status
        status_info
        status_data
        queue_position @since(version: "25.13.0")
      }
    `,
    sessionFrgmt,
  );

  const displayQuePosition =
    showQueuePosition && _.isNumber(session?.queue_position)
      ? session?.queue_position + 1
      : undefined;
  return session ? (
    _.isEmpty(session.status_info) || !showInfo ? (
      <BAIFlex wrap="nowrap">
        <Tooltip title={showTooltip ? session.status_info : undefined}>
          <Tag
            color={
              session.status ? _.get(statusTagColor, session.status) : undefined
            }
            icon={
              isTransitional(session) ? <LoadingOutlined spin /> : undefined
            }
            // Comment out to match the legacy tag style temporarily
            style={{
              borderRadius: 11,
              paddingLeft: token.paddingSM,
              paddingRight: token.paddingSM,
            }}
          >
            {session.status || ' '}
            {session.status_info && isTransitional(session) ? (
              <CircleAlertIcon
                style={{
                  marginLeft: token.marginXXS,
                  color: token.colorError,
                }}
              />
            ) : null}
          </Tag>
        </Tooltip>
        {displayQuePosition ? (
          <Tooltip title={t('session.PendingPosition')}>
            <Tag
              style={{
                borderRadius: 11,
                margin: 0,
              }}
            >{`#${displayQuePosition}`}</Tag>
          </Tooltip>
        ) : null}
      </BAIFlex>
    ) : (
      <BAIFlex gap={'xs'}>
        <BAIFlex>
          <Tag
            style={{
              margin: 0,
              zIndex: 1,
              paddingLeft: token.paddingSM,
              borderTopLeftRadius: 11,
              borderBottomLeftRadius: 11,
            }}
            icon={
              isTransitional(session) ? <LoadingOutlined spin /> : undefined
            }
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
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              width: 80,
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
            title={session.status_info || undefined}
          >
            {session.status_info}
          </Tag>
        </BAIFlex>
        {displayQuePosition ? (
          <Tooltip title={t('session.PendingPosition')}>
            <Tag
              style={{
                borderRadius: 11,
                margin: 0,
              }}
            >{`#${displayQuePosition}`}</Tag>
          </Tooltip>
        ) : null}
      </BAIFlex>
    )
  ) : null;
};

export default SessionStatusTag;
