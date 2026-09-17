/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { MountedVFolderLinksFragment$key } from '../__generated__/MountedVFolderLinksFragment.graphql';
import FolderLink from './FolderLink';
import * as _ from 'lodash-es';
import React from 'react';
import { graphql, useFragment } from 'react-relay';

interface MountedVFolderLinksProps {
  sessionFrgmt: MountedVFolderLinksFragment$key;
}

const MountedVFolderLinks: React.FC<MountedVFolderLinksProps> = ({
  sessionFrgmt,
}) => {
  // TODO(needs-backend): the FR-2619 V2 migration cannot reach this surface
  // because `ComputeSessionNode` only exposes the V1 `vfolder_nodes`
  // (`VirtualFolderConnection`) field — there is no V2 `VFolder` connection
  // on the session type. Migrate `MountedVFolderLinks`, `FolderLink`, and the
  // session query in `SessionDetailContent` to a V2 fragment once the backend
  // adds a `VFolder` (Strawberry V2) connection on `ComputeSessionNode`.
  const session = useFragment(
    graphql`
      fragment MountedVFolderLinksFragment on ComputeSessionNode {
        vfolder_nodes {
          edges {
            node {
              ...FolderLink_vfolderNode
            }
          }
        }
      }
    `,
    sessionFrgmt,
  );

  return _.map(session.vfolder_nodes?.edges, (vfolder, idx) => {
    return (
      vfolder?.node && (
        <FolderLink
          key={`mounted-vfolder-${idx}`}
          vfolderNodeFragment={vfolder.node}
          // TODO: For now, disable state using VirtualFolderNode permissions in FolderLink component.
          // Currently shows Alert.error in Folder Explorer instead due to related bugs
        />
      )
    );
  });
};

export default MountedVFolderLinks;
