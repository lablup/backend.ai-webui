import BAILink from './BAILink';
import { useFolderExplorerOpener } from './FolderExplorerOpener';
import { FolderLink_vfolderNode$key } from './__generated__/FolderLink_vfolderNode.graphql';
import { FolderOutlined } from '@ant-design/icons';
import graphql from 'babel-plugin-relay/macro';
import { useFragment } from 'react-relay';

interface FolderLinkBase {
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
      style={{
        wordBreak: 'break-all',
      }}
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
