import { BAIVFolderDeleteButtonV2Fragment$key } from '../../__generated__/BAIVFolderDeleteButtonV2Fragment.graphql';
import BAIButton, { type BAIButtonProps } from '../BAIButton';
import { Trash } from 'lucide-react';
import { graphql, useFragment } from 'react-relay';

export interface BAIVFolderDeleteButtonV2Props extends BAIButtonProps {
  vfolderFrgmt: BAIVFolderDeleteButtonV2Fragment$key;
}

const BAIVFolderDeleteButtonV2 = ({
  vfolderFrgmt,
  ...buttonProps
}: BAIVFolderDeleteButtonV2Props) => {
  useFragment<BAIVFolderDeleteButtonV2Fragment$key>(
    graphql`
      fragment BAIVFolderDeleteButtonV2Fragment on VFolder
      @relay(plural: true) {
        id
      }
    `,
    vfolderFrgmt,
  );

  // TODO(needs-backend): V2 `VFolder` does not expose a per-user action
  // permission (legacy `VirtualFolderNode.permissions` had `delete_vfolder`).
  // `accessControl.permission` is a `VFolderMountPermission` enum (RO/RW/
  // RW_DELETE) describing the mount level, not a user's entity-level action
  // permission on the folder, so it cannot be used as a gate for delete.
  // Until a proper permission field is exposed, always treat the button as
  // enabled and let the backend reject unauthorized requests.
  return (
    <BAIButton
      icon={<Trash style={{ color: 'var(--color-error)' }} size="1em" />}
      {...buttonProps}
    />
  );
};

export default BAIVFolderDeleteButtonV2;
