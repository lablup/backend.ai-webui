/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { VFolderLazyViewQuery } from '../__generated__/VFolderLazyViewQuery.graphql';
import { useFolderExplorerOpener } from './FolderExplorerOpener';
import VFolderNodeIdenticon from './VFolderNodeIdenticon';
import { Link } from '@astryxdesign/core/Link';
import { Text } from '@astryxdesign/core/Text';
import { BAIFlex, toGlobalId, toLocalId } from 'backend.ai-ui';
import React from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

interface VFolderLazyViewProps {
  uuid: string;
  clickable?: boolean;
}
const VFolderLazyView: React.FC<VFolderLazyViewProps> = ({
  uuid,
  clickable,
}) => {
  const { open: openFolderExplorer } = useFolderExplorerOpener();

  const { vfolder_node } = useLazyLoadQuery<VFolderLazyViewQuery>(
    graphql`
      query VFolderLazyViewQuery($id: String!) {
        vfolder_node(id: $id) {
          id @required(action: THROW)
          name
          ...VFolderNodeIdenticonFragment
        }
      }
    `,
    { id: toGlobalId('VirtualFolderNode', uuid) },
  );

  return (
    <>
      {vfolder_node && (
        <BAIFlex align="center" gap="xs">
          <VFolderNodeIdenticon vfolderNodeIdenticonFrgmt={vfolder_node} />
          {clickable ? (
            // p3-a D3: a pure-`onClick` link renders link-styled button
            // semantics on Astryx `Link` (antd emitted a destination-less
            // `<a>`), which is what this folder-explorer opener actually is.
            <Link
              onClick={() => openFolderExplorer(toLocalId(vfolder_node.id))}
            >
              {vfolder_node.name}
            </Link>
          ) : (
            <Text>{vfolder_node.name}</Text>
          )}
        </BAIFlex>
      )}
    </>
  );
};

export default VFolderLazyView;
