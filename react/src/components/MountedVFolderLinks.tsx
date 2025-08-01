import { MountedVFolderLinksFragment$key } from '../__generated__/MountedVFolderLinksFragment.graphql';
import { MountedVFolderLinksLegacyLazyFolderLinkFragment$key } from '../__generated__/MountedVFolderLinksLegacyLazyFolderLinkFragment.graphql';
import { MountedVFolderLinksQuery } from '../__generated__/MountedVFolderLinksQuery.graphql';
import { useSuspendedBackendaiClient } from '../hooks';
import FolderLink from './FolderLink';
import { Skeleton } from 'antd';
import _ from 'lodash';
import React, { Suspense } from 'react';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

interface MountedVFolderLinksProps {
  sessionFrgmt: MountedVFolderLinksFragment$key; // Replace with actual type if available
}

const MountedVFolderLinks: React.FC<MountedVFolderLinksProps> = ({
  sessionFrgmt,
}) => {
  const baiClient = useSuspendedBackendaiClient();

  const session = useFragment(
    graphql`
      fragment MountedVFolderLinksFragment on ComputeSessionNode {
        row_id
        vfolder_nodes @since(version: "25.4.0") {
          edges {
            node {
              ...FolderLink_vfolderNode
            }
          }
        }
        ...MountedVFolderLinksLegacyLazyFolderLinkFragment
      }
    `,
    sessionFrgmt,
  );

  return baiClient.supports('vfolder_nodes_in_session_node') ? (
    _.map(session.vfolder_nodes?.edges, (vfolder, idx) => {
      return (
        vfolder?.node && (
          <FolderLink
            key={`mounted-vfolder-${idx}`}
            showIcon
            vfolderNodeFragment={vfolder.node}
            // TODO: For now, disable state using VirtualFolderNode permissions in FolderLink component.
            // Currently shows Alert.error in Folder Explorer instead due to related bugs
          />
        )
      );
    })
  ) : session.row_id ? (
    // TODO: This part can be removed once compatibility with v25.4.0 is no longer needed.
    <Suspense fallback={<Skeleton.Input size="small" active block />}>
      <LegacyLazyMountedVFolderLinks sessionFrgmt={session} />
    </Suspense>
  ) : null;
};

export default MountedVFolderLinks;

const LegacyLazyMountedVFolderLinks: React.FC<{
  sessionFrgmt: MountedVFolderLinksLegacyLazyFolderLinkFragment$key;
}> = ({ sessionFrgmt }) => {
  const baiClient = useSuspendedBackendaiClient();
  const session = useFragment(
    graphql`
      fragment MountedVFolderLinksLegacyLazyFolderLinkFragment on ComputeSessionNode {
        row_id
        vfolder_mounts
      }
    `,
    sessionFrgmt,
  );

  const { legacy_session } = useLazyLoadQuery<MountedVFolderLinksQuery>(
    graphql`
      query MountedVFolderLinksQuery($uuid: UUID!) {
        legacy_session: compute_session(id: $uuid) {
          mounts
        }
      }
    `,
    {
      uuid: session.row_id || '',
    },
    {
      fetchPolicy: session.row_id ? 'store-and-network' : 'store-only',
    },
  );

  return baiClient.supports('vfolder-mounts')
    ? _.map(
        // compute_session_node query's vfolder_mounts is not include name.
        // To provide vfolder name in compute_session_node, schema must be changed.
        // legacy_session.mounts (name) and session.vfolder_mounts (id) give vfolder information in same order.
        _.zip(legacy_session?.mounts, session?.vfolder_mounts),
        (mountInfo) => {
          const [name, id] = mountInfo;
          return (
            <FolderLink
              key={id}
              folderId={id ?? ''}
              folderName={name ?? ''}
              showIcon
            />
          );
        },
      )
    : legacy_session?.mounts?.join(', ');
};
