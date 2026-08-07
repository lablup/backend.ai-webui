import { BAIVFolderDeleteButtonFragment$key } from '../../__generated__/BAIVFolderDeleteButtonFragment.graphql';
import { theme } from '../../theme-shim';
import BAIButton from '../BAIButton';
import { type ButtonProps } from 'antd';
import * as _ from 'lodash-es';
import { Trash } from 'lucide-react';
import { graphql, useFragment } from 'react-relay';

export interface BAIVFolderDeleteButtonProps extends ButtonProps {
  vfolderFrgmt: BAIVFolderDeleteButtonFragment$key;
}

const BAIVFolderDeleteButton = ({
  vfolderFrgmt,
  ...buttonProps
}: BAIVFolderDeleteButtonProps) => {
  const { token } = theme.useToken();
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
      icon={<Trash style={{ color: token.colorError }} size="1em" />}
      disabled={buttonProps.disabled || !isDeletable}
      {..._.omit(buttonProps, ['disabled'])}
    />
  );
};

export default BAIVFolderDeleteButton;
