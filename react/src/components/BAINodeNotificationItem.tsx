/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { BAINodeNotificationItemFragment$key } from '../__generated__/BAINodeNotificationItemFragment.graphql';
import { NotificationState } from '../hooks/useBAINotification';
import BAIVirtualFolderNodeNotificationItem from './BAIVirtualFolderNodeNotificationItem';
import BAIVirtualFolderNodeNotificationItemV2 from './BAIVirtualFolderNodeNotificationItemV2';
import { BAINotificationItem, BAIText } from 'backend.ai-ui';
import dayjs from 'dayjs';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useRefetchableFragment } from 'react-relay';

// Session action buttons (and the log viewer behind them) load on first use.
const BAIComputeSessionNodeNotificationItem = React.lazy(
  () => import('./BAIComputeSessionNodeNotificationItem'),
);

// `... on VFolder` is the V2 (Strawberry GraphQL, FR-2573) branch and the
// preferred path for new VFolder list/mutation flows.
// `... on VirtualFolderNode` is the legacy V1 branch and is **deprecated** —
// kept here only so callers that still hold V1 fragments keep rendering. It
// will be removed once all VFolder callers migrate to V2 `VFolder`.
const nodeFragmentOperation = graphql`
  fragment BAINodeNotificationItemFragment on Node
  @refetchable(queryName: "BAINodeNotificationItemRefetchQuery") {
    ... on ComputeSessionNode {
      __typename
      status
      name
      row_id
      ...BAIComputeSessionNodeNotificationItemFragment
        @alias(as: "sessionFrgmt")
    }
    ... on VFolder {
      __typename
      ...BAIVirtualFolderNodeNotificationItemV2Fragment
        @alias(as: "vfolderFrgmt")
    }
    ... on VirtualFolderNode {
      __typename
      status
      ...BAIVirtualFolderNodeNotificationItemFragment
        @alias(as: "virtualFolderNodeFrgmt")
    }
  }
`;

const BAINodeNotificationItem: React.FC<{
  notification: NotificationState;
  nodeFrgmt: BAINodeNotificationItemFragment$key | null;
  showDate?: boolean;
}> = ({ notification, nodeFrgmt, showDate }) => {
  'use memo';
  const { t } = useTranslation();
  const [node] = useRefetchableFragment(nodeFragmentOperation, nodeFrgmt);

  if (node?.__typename === 'ComputeSessionNode') {
    return (
      <Suspense
        fallback={
          <BAINotificationItem
            className="bai-node-notification-item"
            title={
              <BAIText ellipsis>
                {t('general.Session')}:&nbsp;{node.name}
              </BAIText>
            }
            footer={
              showDate ? dayjs(notification.created).format('lll') : undefined
            }
          />
        }
      >
        <BAIComputeSessionNodeNotificationItem
          notification={notification}
          sessionFrgmt={node.sessionFrgmt || null}
          showDate={showDate}
          primaryAppOption={notification.extraData}
        />
      </Suspense>
    );
  } else if (node?.__typename === 'VFolder') {
    return (
      <BAIVirtualFolderNodeNotificationItemV2
        notification={notification}
        vfolderFrgmt={node.vfolderFrgmt || null}
        showDate={showDate}
      />
    );
  } else if (node?.__typename === 'VirtualFolderNode') {
    // @deprecated Renders the legacy V1 VFolder notification. Will be removed
    // once all V1 callers are gone — see the matching note on the V2 branch
    // above.
    return (
      <BAIVirtualFolderNodeNotificationItem
        notification={notification}
        virtualFolderNodeFrgmt={node.virtualFolderNodeFrgmt || null}
        showDate={showDate}
      />
    );
  } else {
    // console.warn('Unknown node type in BAINodeNotificationItem:', node);
    return null;
  }
};

export default BAINodeNotificationItem;
