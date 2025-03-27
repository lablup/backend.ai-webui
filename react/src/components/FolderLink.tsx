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
  id?: never;
  name?: never;
}

interface FolderLinkWithIdAndName extends FolderLinkBase {
  vfolderNodeFragment?: never;
  id: string;
  name: string;
}

type FolderLinkProps = FolderLinkWithFragment | FolderLinkWithIdAndName;

const FolderLink = ({
  vfolderNodeFragment,
  id,
  name,
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
    <BAILink to={generateFolderPath(id ?? vfolderNode?.row_id ?? '')}>
      {showIcon && <FolderOutlined />} &nbsp;
      {name ?? vfolderNode?.name ?? ''}
    </BAILink>
  );
};

export default FolderLink;
