/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { VFolderPermissionCellFragment$key } from '../__generated__/VFolderPermissionCellFragment.graphql';
import {
  VFOLDER_MOUNT_PERMISSION_ICONS,
  VFOLDER_MOUNT_PERMISSION_LABEL_KEYS,
  mountPermissionFromLegacy,
} from '../helper/vfolderMountPermission';
import { HStack } from '@lablup/ui-common/Stack';
import { Tooltip } from '@lablup/ui-common/Tooltip';
import { BAIText } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React from 'react';
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
  'use memo';
  const { t } = useTranslation();

  const vfolderData = useFragment(
    graphql`
      fragment VFolderPermissionCellFragment on VirtualFolderNode {
        permissions
      }
    `,
    vfolderFrgmt ?? null,
  );

  // With a fragment the level comes from the RBAC verb list, and no mount verb
  // means no mount permission; the `permission` prop carries a REST /
  // invitation level (`ro`, `rw`, `wd`, `none`).
  const perm = vfolderData
    ? _.some(['mount_rw', 'mount_wd'], (verb) =>
        _.includes(vfolderData.permissions, verb),
      )
      ? 'rw'
      : _.includes(vfolderData.permissions, 'mount_ro')
        ? 'ro'
        : null
    : (mountPermissionFromLegacy(permissionProp) ?? 'ro');
  const icons = perm ? VFOLDER_MOUNT_PERMISSION_ICONS[perm] : '';

  if (!perm) {
    return (
      <HStack gap={2} {...props}>
        <Tooltip content={t('data.folders.NoMountPermission')}>
          <BAIText>-</BAIText>
        </Tooltip>
      </HStack>
    );
  }

  return (
    <HStack gap={2} {...props}>
      <BAIText>{t(VFOLDER_MOUNT_PERMISSION_LABEL_KEYS[perm])}</BAIText>
      {icons && (
        <HStack>
          {_.map(icons, (tag) => (
            <BAIText key={tag} code>
              {tag}
            </BAIText>
          ))}
        </HStack>
      )}
    </HStack>
  );
};

export default VFolderPermissionCell;
