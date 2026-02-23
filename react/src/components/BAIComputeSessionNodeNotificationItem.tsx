/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import SessionActionButtons, {
  PrimaryAppOption,
} from './ComputeSessionNodeItems/SessionActionButtons';
import SessionStatusTag from './ComputeSessionNodeItems/SessionStatusTag';
import { useUpdateEffect } from 'ahooks';
import {
  BAIFlex,
  BAILink,
  BAINotificationItem,
  BAIText,
  useInterval,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  fetchQuery,
  graphql,
  useFragment,
  useRelayEnvironment,
  useSubscription,
} from 'react-relay';
import { useNavigate } from 'react-router-dom';
import { BAIComputeSessionNodeNotificationItemFragment$key } from 'src/__generated__/BAIComputeSessionNodeNotificationItemFragment.graphql';
import { BAIComputeSessionNodeNotificationItemRefreshQuery } from 'src/__generated__/BAIComputeSessionNodeNotificationItemRefreshQuery.graphql';
import { useSuspendedBackendaiClient } from 'src/hooks';
import {
  NotificationState,
  useSetBAINotification,
} from 'src/hooks/useBAINotification';

interface BAINodeNotificationItemProps {
  notification: NotificationState;
  sessionFrgmt: BAIComputeSessionNodeNotificationItemFragment$key | null;
  showDate?: boolean;
  primaryAppOption?: PrimaryAppOption;
}

const BAIComputeSessionNodeNotificationItem: React.FC<
  BAINodeNotificationItemProps
> = ({ sessionFrgmt, showDate, notification, primaryAppOption }) => {
  const { closeNotification } = useSetBAINotification();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const baiClient = useSuspendedBackendaiClient();
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

  useUpdateEffect(() => {
    if (node?.status === 'TERMINATED' || node?.status === 'CANCELLED') {
      setTimeout(() => {
        closeNotification(notification.key);
      }, 3000);
    }
  }, [node?.status]);

  return (
    node && (
      <>
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
                  closeNotification(notification.key);
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
                primaryAppOption={primaryAppOption}
              />
            </BAIFlex>
          }
          footer={
            showDate ? dayjs(notification.created).format('lll') : undefined
          }
        />
        {baiClient.isManagerVersionCompatibleWith('25.16.0') && node.row_id ? (
          <SessionStatusRefresherUsingSubscription sessionRowId={node.row_id} />
        ) : node.row_id && node.status ? (
          <UNSAFE_SessionStatusRefresher
            id={node.row_id}
            status={node.status}
          />
        ) : null}
      </>
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

const SessionStatusRefresherUsingSubscription: React.FC<{
  sessionRowId: string;
}> = ({ sessionRowId }) => {
  'use memo';
  useSubscription({
    subscription: graphql`
      subscription BAIComputeSessionNodeNotificationItemSubscription(
        $session_id: ID!
      ) {
        schedulingEventsBySession(sessionId: $session_id) {
          reason
          session {
            status
            ...BAIComputeSessionNodeNotificationItemFragment
            ...SessionNodesFragment
            ...SessionDetailContentFragment
          }
        }
      }
    `,
    variables: { session_id: sessionRowId },
  });
  return null;
};

const UNSAFE_SessionStatusRefresher: React.FC<{
  id: string;
  status: string;
}> = ({ id, status }) => {
  // TODO: delete this when Status subscription is implemented
  const [delay, setDelay] = useState<number | null>(null);
  UNSAFE_useAutoRefreshInterval(id || '', delay);
  useEffect(() => {
    if (!status || status === 'TERMINATED' || status === 'CANCELLED') {
      setDelay(null);
    } else if (status === 'RUNNING') {
      setDelay(15000);
    } else {
      setDelay(3000);
    }
  }, [status]);
  // ---

  return null;
};
