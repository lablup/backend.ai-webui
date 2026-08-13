import { BAIVFolderDeleteButtonFragment$key } from '../../__generated__/BAIVFolderDeleteButtonFragment.graphql';
import BAIButton, { type BAIButtonProps } from '../BAIButton';
import * as _ from 'lodash-es';
import { Trash } from 'lucide-react';
import { graphql, useFragment } from 'react-relay';

export interface BAIVFolderDeleteButtonProps extends BAIButtonProps {
  vfolderFrgmt: BAIVFolderDeleteButtonFragment$key;
}

const BAIVFolderDeleteButton = ({
  vfolderFrgmt,
  ...buttonProps
}: BAIVFolderDeleteButtonProps) => {
  const vfolders = useFragment<BAIVFolderDeleteButtonFragment$key>(
    graphql`
      fragment BAIVFolderDeleteButtonFragment on VirtualFolderNode
      @relay(plural: true) {
        permissions
      }
    `,
    vfolderFrgmt,
  );

  const isDeletable = vfolders.some((vfolder) =>
    vfolder.permissions?.includes('delete_vfolder'),
  );

  return (
    <BAIButton
      icon={<Trash style={{ color: 'var(--color-error)' }} size="1em" />}
      disabled={buttonProps.disabled || !isDeletable}
      {..._.omit(buttonProps, ['disabled'])}
    />
  );
};

export default BAIVFolderDeleteButton;
