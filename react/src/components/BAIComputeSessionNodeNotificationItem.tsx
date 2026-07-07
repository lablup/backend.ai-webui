/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { BAIComputeSessionNodeNotificationItemFragment$key } from '../__generated__/BAIComputeSessionNodeNotificationItemFragment.graphql';
import { useWebUINavigate } from '../hooks';
import {
  NotificationState,
  useSetBAINotification,
} from '../hooks/useBAINotification';
import { useProjectPath } from '../hooks/useRouteScope';
import SessionActionButtons, {
  PrimaryAppOption,
} from './ComputeSessionNodeItems/SessionActionButtons';
import SessionStatusTag from './ComputeSessionNodeItems/SessionStatusTag';
import { useUpdateEffect } from 'ahooks';
import { theme } from 'antd';
import {
  BAIFlex,
  BAILink,
  BAINotificationItem,
  BAIText,
  toLocalId,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useSubscription } from 'react-relay';

interface BAINodeNotificationItemProps {
  notification: NotificationState;
  sessionFrgmt: BAIComputeSessionNodeNotificationItemFragment$key | null;
  showDate?: boolean;
  primaryAppOption?: PrimaryAppOption;
}

const BAIComputeSessionNodeNotificationItem: React.FC<
  BAINodeNotificationItemProps
> = ({ sessionFrgmt, showDate, notification, primaryAppOption }) => {
  'use memo';
  const { closeNotification } = useSetBAINotification();
  const { t } = useTranslation();
  const navigate = useWebUINavigate();
  const { token } = theme.useToken();
  const buildProjectPath = useProjectPath();
  const node = useFragment(
    graphql`
      fragment BAIComputeSessionNodeNotificationItemFragment on ComputeSessionNode {
        id
        name
        status
        status_info
        status_data
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

  const errorDetail = (() => {
    if (!node?.status_data) return null;
    try {
      const parsed = JSON.parse(node.status_data);
      return (
        parsed?.error?.repr ?? parsed?.error?.collection?.[0]?.repr ?? null
      );
    } catch {
      return null;
    }
  })();

  const hasError =
    (node?.status === 'ERROR' || node?.status === 'CANCELLED') &&
    (!!errorDetail || !!node?.status_info);

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
                    `${buildProjectPath('session', { scope: 'project' })}${node.id ? `?${new URLSearchParams({ sessionDetail: toLocalId(node.id) }).toString()}` : ''}`,
                  );
                  closeNotification(notification.key);
                }}
              >
                {node.name}
              </BAILink>
            </BAIText>
          }
          description={
            <BAIFlex direction="column" gap="xs" style={{ width: '100%' }}>
              <BAIFlex justify="between" style={{ width: '100%' }}>
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
              {hasError && (
                <BAIFlex direction="column" gap="xs" style={{ width: '100%' }}>
                  <BAIText
                    type="secondary"
                    style={{
                      fontSize: token.fontSizeSM,
                      wordBreak: 'break-word',
                    }}
                  >
                    {errorDetail ?? node.status_info}
                  </BAIText>
                </BAIFlex>
              )}
            </BAIFlex>
          }
          footer={
            showDate ? dayjs(notification.created).format('lll') : undefined
          }
        />
        {node.id ? (
          <SessionStatusRefresherUsingSubscription
            sessionRowId={toLocalId(node.id)}
          />
        ) : null}
      </>
    )
  );
};

export default BAIComputeSessionNodeNotificationItem;

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
