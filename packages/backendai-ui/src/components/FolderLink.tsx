// import { FolderLink_vfolderNode$key } from './__generated__/FolderLink_vfolderNode.graphql';
import { FolderLinkItem_vfolderNode$key } from '../__generated__/FolderLinkItem_vfolderNode.graphql';
import { graphql } from 'react-relay';
import { useFragment } from 'react-relay';

interface FolderLinkBase {
  showIcon?: boolean;
}

interface FolderLinkWithFragment extends FolderLinkBase {
  vfolderNodeFragment: FolderLinkItem_vfolderNode$key;
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
}: FolderLinkProps) => {
  const vfolderNode = useFragment(
    graphql`
      fragment FolderLinkItem_vfolderNode on VirtualFolderNode {
        row_id
        name
      }
    `,
    vfolderNodeFragment,
  );

  return (
    <li
      style={{
        wordBreak: 'break-all',
      }}
    >
      {showIcon && <>ICON&nbsp;</>}
      {folderName ?? vfolderNode?.name ?? ''}
    </li>
  );
};

export default FolderLink;
