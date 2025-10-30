import SessionActionButtons from './ComputeSessionNodeItems/SessionActionButtons';
import SessionStatusTag from './ComputeSessionNodeItems/SessionStatusTag';
import { useUpdateEffect } from 'ahooks';
import { BAIFlex, BAILink, BAINotificationItem, BAIText } from 'backend.ai-ui';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  fetchQuery,
  graphql,
  useFragment,
  useRelayEnvironment,
} from 'react-relay';
import { useNavigate } from 'react-router-dom';
import { BAIComputeSessionNodeNotificationItemFragment$key } from 'src/__generated__/BAIComputeSessionNodeNotificationItemFragment.graphql';
import { BAIComputeSessionNodeNotificationItemRefreshQuery } from 'src/__generated__/BAIComputeSessionNodeNotificationItemRefreshQuery.graphql';
import {
  NotificationState,
  useSetBAINotification,
} from 'src/hooks/useBAINotification';
import { useInterval } from 'src/hooks/useIntervalValue';

interface BAINodeNotificationItemProps {
  notification: NotificationState;
  sessionFrgmt: BAIComputeSessionNodeNotificationItemFragment$key | null;
  showDate?: boolean;
}
const BAIComputeSessionNodeNotificationItem: React.FC<
  BAINodeNotificationItemProps
> = ({ sessionFrgmt, showDate, notification }) => {
  const { destroyNotification } = useSetBAINotification();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const node = useFragment(
    graphql`
      fragment BAIComputeSessionNodeNotificationItemFragment on ComputeSessionNode {
        row_id
        id
        name
        status
        ...SessionActionButtonsFragment
        ...SessionStatusTagFragment
      }
    `,
    sessionFrgmt,
  );

  // TODO: delete this when Status subscription is implemented
  const [delay, setDelay] = useState<number | null>(null);
  UNSAFE_useAutoRefreshInterval(node?.id || '', delay);
  useEffect(() => {
    if (
      !node?.status ||
      node?.status === 'TERMINATED' ||
      node?.status === 'CANCELLED'
    ) {
      setDelay(null);
    } else if (node?.status === 'RUNNING') {
      setDelay(15000);
    } else {
      setDelay(3000);
    }
  }, [node?.status]);
  // ---

  useUpdateEffect(() => {
    if (node?.status === 'TERMINATED' || node?.status === 'CANCELLED') {
      setTimeout(() => {
        destroyNotification(notification.key);
      }, 3000);
    }
  }, [node?.status]);

  return (
    node && (
      <BAINotificationItem
        title={
          <BAIText ellipsis>
            {t('general.Session')}:&nbsp;
            <BAILink
              style={{
                fontWeight: 'normal',
              }}
              title={node.name || ''}
              onClick={() => {
                navigate(
                  `/session${node.row_id ? `?${new URLSearchParams({ sessionDetail: node.row_id }).toString()}` : ''}`,
                );
                destroyNotification(notification.key);
              }}
            >
              {node.name}
            </BAILink>
          </BAIText>
        }
        description={
          <BAIFlex justify="between">
            <SessionStatusTag
              sessionFrgmt={node || null}
              showQueuePosition={false}
              showTooltip={false}
            />
            <SessionActionButtons
              compact
              size="small"
              sessionFrgmt={node || null}
              hiddenButtonKeys={['containerCommit']}
            />
          </BAIFlex>
        }
        footer={
          showDate ? dayjs(notification.created).format('lll') : undefined
        }
      />
    )
  );
};

export default BAIComputeSessionNodeNotificationItem;

const UNSAFE_useAutoRefreshInterval = (
  sessionId: string,
  delay: number | null,
) => {
  // const [delay, setDelay] = useState<number|null>(3000);
  const relayEnv = useRelayEnvironment();

  useInterval(() => {
    fetchQuery<BAIComputeSessionNodeNotificationItemRefreshQuery>(
      relayEnv,
      graphql`
        query BAIComputeSessionNodeNotificationItemRefreshQuery(
          $id: GlobalIDField!
        ) {
          compute_session_node(id: $id) {
            ...BAINodeNotificationItemFragment
          }
        }
      `,
      { id: sessionId },
    ).toPromise();
  }, delay);
};
