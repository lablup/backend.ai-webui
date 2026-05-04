/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useFolderExplorerOpener } from './FolderExplorerOpener';
import VFolderNodeIdenticon from './VFolderNodeIdenticon';
import { Typography } from 'antd';
import { BAIFlex, toGlobalId, toLocalId } from 'backend.ai-ui';
import React from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { VFolderLazyViewQuery } from 'src/__generated__/VFolderLazyViewQuery.graphql';

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
            <Typography.Link
              onClick={() => openFolderExplorer(toLocalId(vfolder_node.id))}
            >
              {vfolder_node.name}
            </Typography.Link>
          ) : (
            <Typography.Text>{vfolder_node.name}</Typography.Text>
          )}
        </BAIFlex>
      )}
    </>
  );
};

export default VFolderLazyView;
