import { VFolderPermissionCellFragment$key } from '../__generated__/VFolderPermissionCellFragment.graphql';
import Flex from './Flex';
import { Typography } from 'antd';
import _ from 'lodash';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface VFolderPermissionCellProps {
  vfolderFrgmt?: VFolderPermissionCellFragment$key;
  permission?: string;
}

const VFolderPermissionCell: React.FC<VFolderPermissionCellProps> = ({
  vfolderFrgmt,
  permission: permissionProp,
  ...props
}) => {
  const { t } = useTranslation();

  const vfolderData = useFragment(
    graphql`
      fragment VFolderPermissionCellFragment on VirtualFolderNode {
        permissions
      }
    `,
    vfolderFrgmt ?? null,
  );

  const { permissionInfo } = useMemo(() => {
    const permissionMap: { [key: string]: { label: string; icon: string } } = {
      ro: {
        label: t('data.ReadOnly'),
        icon: 'R',
      },
      rw: {
        label: t('data.ReadWrite'),
        icon: 'RW',
      },
      // wd is deprecated.
      wd: {
        label: t('data.ReadWrite'),
        icon: 'RW',
      },
    };
    const perm = vfolderData?.permissions
      ? _.includes(vfolderData.permissions, 'mount_rw')
        ? 'rw'
        : 'ro'
      : permissionProp === 'wd'
        ? 'rw'
        : permissionProp || 'ro';
    return {
      permissionInfo: permissionMap[perm],
    };
  }, [permissionProp, vfolderData, t]);

  return (
    <Flex gap={'xs'} {...props}>
      <Typography.Text>{permissionInfo?.label}</Typography.Text>
      <Flex>
        {_.map(permissionInfo?.icon, (tag) => (
          <Typography.Text key={tag} code>
            {_.toUpper(tag)}
          </Typography.Text>
        ))}
      </Flex>
    </Flex>
  );
};

export default VFolderPermissionCell;
