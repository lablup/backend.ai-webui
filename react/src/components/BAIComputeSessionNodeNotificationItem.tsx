import SessionActionButtons from './ComputeSessionNodeItems/SessionActionButtons';
import SessionStatusTag from './ComputeSessionNodeItems/SessionStatusTag';
import { useUpdateEffect } from 'ahooks';
import { BAIFlex, BAILink, BAINotificationItem } from 'backend.ai-ui';
import dayjs from 'dayjs';
import React, { useEffect, useEffectEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useRefetchableFragment } from 'react-relay';
import { BAIComputeSessionNodeNotificationItemFragment$key } from 'src/__generated__/BAIComputeSessionNodeNotificationItemFragment.graphql';
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
  'use memo';
  const { destroyNotification, upsertNotification } = useSetBAINotification();
  const { t } = useTranslation();
  const [node, refetch] = useRefetchableFragment(
    graphql`
      fragment BAIComputeSessionNodeNotificationItemFragment on ComputeSessionNode
      @refetchable(
        queryName: "BAIComputeSessionNodeNotificationItemFragment_RefetchQuery"
      ) {
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

  const closeNotificationWithProgress = useEffectEvent(() => {
    if (notification.open) {
      upsertNotification({
        key: notification.key,
        pauseOnHover: true,
        showProgress: true,
        duration: 10,
      });
    }
  });

  useEffect(() => {
    if (node?.status === 'RUNNING') {
      closeNotificationWithProgress();
    }
  }, [node?.status]);

  useUpdateEffect(() => {
    if (node?.status === 'TERMINATED' || node?.status === 'CANCELLED') {
      setTimeout(() => {
        destroyNotification(notification.key);
      }, 3000);
    }
  }, [node?.status]);

  const delay = ['TERMINATED', 'CANCELLED', null, undefined].includes(
    node?.status,
  )
    ? null
    : node?.status === 'RUNNING'
      ? 15000
      : 3000;
  useInterval(() => {
    refetch(
      {},
      {
        fetchPolicy: 'store-and-network',
      },
    );
  }, delay);

  return (
    node && (
      <BAINotificationItem
        title={
          <span>
            {t('general.Session')}:&nbsp;
            <BAILink
              style={{
                fontWeight: 'normal',
              }}
              to={{
                pathname: '/session',
                search: node.row_id
                  ? new URLSearchParams({
                      sessionDetail: node.row_id,
                    }).toString()
                  : undefined,
              }}
              onClick={() => {
                destroyNotification(notification.key);
              }}
            >{`${node.name}`}</BAILink>
          </span>
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
