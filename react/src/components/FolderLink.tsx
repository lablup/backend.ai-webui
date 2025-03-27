import BAILink from './BAILink';
import { FolderLink_vfolderNode$key } from './__generated__/FolderLink_vfolderNode.graphql';
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

const FolderLink = ({ vfolderNodeFragment }: FolderLinkProps) => {
  const vfolderNode = useFragment(
    graphql`
      fragment FolderLink_vfolderNode on VirtualFolderNode {
        id
        row_id
        name
      }
    `,
    vfolderNodeFragment,
  );
  console.log(vfolderNode);
  return <BAILink />;
};

export default FolderLink;
