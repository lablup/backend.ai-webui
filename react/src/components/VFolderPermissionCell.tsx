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

  // rwd is deprecated.
  const permissionMap: { [key: string]: { label: string; icon: string } } = {
    ro: {
      label: t('data.ReadOnly'),
      icon: 'R',
    },
    rw: {
      label: t('data.ReadWrite'),
      icon: 'RW',
    },
    wd: {
      label: t('data.ReadWrite'),
      icon: 'RW',
    },
  };

  const vfolder = useFragment(
    graphql`
      fragment VFolderPermissionCellFragment on VirtualFolderNode {
        permissions
      }
    `,
    vfolderFrgmt,
  );

  const permission = _.includes(vfolder?.permissions, 'mount_rw') ? 'rw' : 'ro';

  return (
    <Flex gap={'xs'}>
      <Typography.Text>{permissionMap[permission]?.label}</Typography.Text>
      <Flex>
        {_.map(permissionMap[permission]?.icon, (tag) => (
          <Typography.Text key={tag} code>
            {_.toUpper(tag)}
          </Typography.Text>
        ))}
      </Flex>
    </Flex>
  );
};

export default VFolderPermissionCell;
