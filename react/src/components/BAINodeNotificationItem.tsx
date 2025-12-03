import { NotificationState } from '../hooks/useBAINotification';
import BAIComputeSessionNodeNotificationItem from './BAIComputeSessionNodeNotificationItem';
import BAIVirtualFolderNodeNotificationItem from './BAIVirtualFolderNodeNotificationItem';
import React from 'react';
import { graphql, useRefetchableFragment } from 'react-relay';
import { BAINodeNotificationItemFragment$key } from 'src/__generated__/BAINodeNotificationItemFragment.graphql';

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
  const [node] = useRefetchableFragment(nodeFragmentOperation, nodeFrgmt);

  if (node?.__typename === 'ComputeSessionNode') {
    return (
      <BAIComputeSessionNodeNotificationItem
        notification={notification}
        sessionFrgmt={node.sessionFrgmt || null}
        showDate={showDate}
        primaryAppOption={notification.extraData}
      />
    );
  } else if (node?.__typename === 'VirtualFolderNode') {
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
