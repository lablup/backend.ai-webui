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
import { HStack } from '@astryxdesign/core/Stack';
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

  // With a fragment the level comes from the RBAC verb list; the `permission`
  // prop carries a REST / invitation level (`ro`, `rw`, `wd`, `none`).
  const perm = vfolderData?.permissions
    ? _.includes(vfolderData.permissions, 'mount_rw')
      ? 'rw'
      : 'ro'
    : (mountPermissionFromLegacy(permissionProp) ?? 'ro');
  const icons = VFOLDER_MOUNT_PERMISSION_ICONS[perm];

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
