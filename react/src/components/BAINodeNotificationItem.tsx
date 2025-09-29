import {
  NotificationState,
  useSetBAINotification,
} from '../hooks/useBAINotification';
import SessionActionButtons from './ComputeSessionNodeItems/SessionActionButtons';
import SessionStatusTag from './ComputeSessionNodeItems/SessionStatusTag';
import { BAIFlex, BAILink, BAINotificationItem } from 'backend.ai-ui';
import dayjs from 'dayjs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useRefetchableFragment } from 'react-relay';
import { BAINodeNotificationItemFragment$key } from 'src/__generated__/BAINodeNotificationItemFragment.graphql';

const BAINodeNotificationItem: React.FC<{
  notification: NotificationState;
  nodeFrgmt: BAINodeNotificationItemFragment$key | null;
  showDate?: boolean;
}> = ({ notification, nodeFrgmt, showDate }) => {
  const { destroyNotification } = useSetBAINotification();
  const { t } = useTranslation();
  const [node] = useRefetchableFragment(
    graphql`
      fragment BAINodeNotificationItemFragment on Node
      @refetchable(queryName: "BAINodeNotificationItemRefetchQuery") {
        ... on ComputeSessionNode {
          __typename
          status
          name
          row_id
          ...SessionActionButtonsFragment @alias(as: "sessionFrgmt")
          ...SessionStatusTagFragment @alias(as: "sessionTagFrgmt")
        }
        ... on VirtualFolderNode {
          __typename
          status
        }
      }
    `,
    nodeFrgmt,
  );

  if (node?.__typename === 'ComputeSessionNode') {
    return (
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
              sessionFrgmt={node.sessionTagFrgmt || null}
              showQueuePosition={false}
              showTooltip={false}
            />
            <SessionActionButtons
              compact
              size="small"
              sessionFrgmt={node.sessionFrgmt || null}
              hiddenButtonKeys={['containerCommit']}
            />
          </BAIFlex>
        }
        footer={
          showDate ? dayjs(notification.created).format('lll') : undefined
        }
      />
    );
  } else if (node?.__typename === 'VirtualFolderNode') {
  } else {
    // console.warn('Unknown node type in BAINodeNotificationItem:', node);
    return null;
  }
};

export default BAINodeNotificationItem;
