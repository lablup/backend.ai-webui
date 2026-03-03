/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { FolderLink_vfolderNode$key } from '../__generated__/FolderLink_vfolderNode.graphql';
import { useFolderExplorerOpener } from './FolderExplorerOpener';
import { FolderOutlined } from '@ant-design/icons';
import { BAILink, BAILinkProps } from 'backend.ai-ui';
import { graphql, useFragment } from 'react-relay';

interface FolderLinkBase extends BAILinkProps {
  showIcon?: boolean;
}

interface FolderLinkWithFragment extends FolderLinkBase {
  vfolderNodeFragment: FolderLink_vfolderNode$key;
  folderId?: never;
  folderName?: never;
}

interface FolderLinkWithIdAndName extends FolderLinkBase {
  vfolderNodeFragment?: never;
  folderId: string;
  folderName: string;
}

type FolderLinkProps = FolderLinkWithFragment | FolderLinkWithIdAndName;

const FolderLink = ({
  vfolderNodeFragment,
  folderId,
  folderName,
  showIcon,
  ...baiLinkProps
}: FolderLinkProps) => {
  const { generateFolderPath } = useFolderExplorerOpener();
  const vfolderNode = useFragment(
    graphql`
      fragment FolderLink_vfolderNode on VirtualFolderNode {
        row_id
        name
      }
    `,
    vfolderNodeFragment,
  );

  return (
    <BAILink
      to={generateFolderPath(folderId ?? vfolderNode?.row_id ?? '')}
      style={{ wordBreak: 'break-all' }}
      {...baiLinkProps}
    >
      {showIcon && (
        <>
          <FolderOutlined /> &nbsp;
        </>
      )}
      {folderName ?? vfolderNode?.name ?? ''}
    </BAILink>
  );
};

export default FolderLink;
