/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { FolderLink_vfolderNode$key } from '../__generated__/FolderLink_vfolderNode.graphql';
import { useFolderExplorerOpener } from './FolderExplorerOpener';
import VFolderNodeIdenticon from './VFolderNodeIdenticon';
import { FolderOutlined } from '@ant-design/icons';
import { BAIFlex, BAILink, BAILinkProps } from 'backend.ai-ui';
import { graphql, useFragment } from 'react-relay';

interface FolderLinkBase extends BAILinkProps {
  /**
   * Legacy fallback icon for the id+name form (no fragment available).
   * Has no effect when `vfolderNodeFragment` is provided — that form
   * always renders the VFolder identicon.
   */
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
        ...VFolderNodeIdenticonFragment
      }
    `,
    vfolderNodeFragment,
  );

  return (
    <BAIFlex gap="xs" align="start" style={{ minWidth: 0, maxWidth: '100%' }}>
      {vfolderNode ? (
        <VFolderNodeIdenticon
          vfolderNodeIdenticonFrgmt={vfolderNode}
          style={{ flexShrink: 0, marginTop: '0.25em' }}
        />
      ) : showIcon ? (
        <FolderOutlined style={{ flexShrink: 0, marginTop: '0.25em' }} />
      ) : null}
      <BAILink
        to={generateFolderPath(folderId ?? vfolderNode?.row_id ?? '')}
        style={{ wordBreak: 'break-all', minWidth: 0 }}
        {...baiLinkProps}
      >
        {folderName ?? vfolderNode?.name ?? ''}
      </BAILink>
    </BAIFlex>
  );
};

export default FolderLink;
