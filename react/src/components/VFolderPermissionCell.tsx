/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { VFolderPermissionCellFragment$key } from '../__generated__/VFolderPermissionCellFragment.graphql';
import { HStack } from '@lablup/ui-common/Stack';
import { BAIQuestionIconWithTooltip, BAIText } from 'backend.ai-ui';
import * as _ from 'lodash-es';
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
    // No mount verb means the folder has no mount permission (26.9 `none`).
    const perm = vfolderData
      ? _.some(['mount_rw', 'mount_wd'], (verb) =>
          _.includes(vfolderData.permissions, verb),
        )
        ? 'rw'
        : _.includes(vfolderData.permissions, 'mount_ro')
          ? 'ro'
          : undefined
      : permissionProp === 'wd'
        ? 'rw'
        : permissionProp || 'ro';
    return {
      permissionInfo: perm ? permissionMap[perm] : undefined,
    };
  }, [permissionProp, vfolderData, t]);

  if (!permissionInfo) {
    return (
      <HStack gap={2} {...props}>
        <BAIText>-</BAIText>
        <BAIQuestionIconWithTooltip
          title={t('data.folders.NoMountPermission')}
        />
      </HStack>
    );
  }

  return (
    <HStack gap={2} {...props}>
      <BAIText>{permissionInfo?.label}</BAIText>
      <HStack>
        {_.map(permissionInfo?.icon, (tag) => (
          <BAIText key={tag} code>
            {_.toUpper(tag)}
          </BAIText>
        ))}
      </HStack>
    </HStack>
  );
};

export default VFolderPermissionCell;
