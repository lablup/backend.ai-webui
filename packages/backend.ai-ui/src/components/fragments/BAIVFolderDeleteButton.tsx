import { BAIVFolderDeleteButtonFragment$key } from '../../__generated__/BAIVFolderDeleteButtonFragment.graphql';
import { BAITrashBinIcon } from '../../icons';
import BAIButton from '../BAIButton';
import { ButtonProps, theme } from 'antd';
import _ from 'lodash';
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
      icon={<BAITrashBinIcon />}
      disabled={buttonProps.disabled || !isDeletable}
      style={{
        color:
          isDeletable && !buttonProps.disabled
            ? token.colorError
            : token.colorTextDisabled,
        backgroundColor:
          isDeletable && !buttonProps.disabled
            ? token.colorErrorBg
            : token.colorBgContainerDisabled,
        ...buttonProps.style,
      }}
      {..._.omit(buttonProps, ['style', 'disabled'])}
    />
  );
};

export default BAIVFolderDeleteButton;
