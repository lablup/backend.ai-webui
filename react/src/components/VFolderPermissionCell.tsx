import Flex from './Flex';
import { VFolderPermissionCellFragment$key } from './__generated__/VFolderPermissionCellFragment.graphql';
import { Typography } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useFragment } from 'react-relay';

interface VFolderPermissionCellProps {
  vfolderFrgmt: VFolderPermissionCellFragment$key;
}

const VFolderPermissionCell: React.FC<VFolderPermissionCellProps> = ({
  vfolderFrgmt,
  ...props
}) => {
  const { t } = useTranslation();

  const permissionLabel = {
    ro: t('data.ReadOnly'),
    rw: t('data.ReadWrite'),
  };

  const vfolder = useFragment(
    graphql`
      fragment VFolderPermissionCellFragment on VirtualFolderNode {
        permission
      }
    `,
    vfolderFrgmt,
  );

  const permission = vfolder?.permission || '';

  return (
    <Flex gap={'xs'}>
      <Typography.Text>
        {/* rwd is deprecated. */}
        {permissionLabel[permission as keyof typeof permissionLabel] ??
          t('data.ReadWrite')}
      </Typography.Text>
      <Flex>
        {_.map(permission === 'wd' ? 'rw' : permission, (tag) => (
          <Typography.Text key={tag} code>
            {_.toUpper(tag)}
          </Typography.Text>
        ))}
      </Flex>
    </Flex>
  );
};

export default VFolderPermissionCell;
