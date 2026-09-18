/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { VFolderPermissionCellV2Fragment$key } from '../__generated__/VFolderPermissionCellV2Fragment.graphql';
import {
  VFOLDER_MOUNT_PERMISSION_ICONS,
  VFOLDER_MOUNT_PERMISSION_LABEL_KEYS,
  mountPermissionFromV2,
} from '../helper/vfolderMountPermission';
import { useCurrentUserInfo } from '../hooks/backendai';
import { HStack } from '@astryxdesign/core/Stack';
import { BAIText } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface VFolderPermissionCellV2Props {
  vfolderFrgmt?: VFolderPermissionCellV2Fragment$key;
}

const VFolderPermissionCellV2: React.FC<VFolderPermissionCellV2Props> = ({
  vfolderFrgmt,
  ...props
}) => {
  'use memo';
  const { t } = useTranslation();
  const [currentUser] = useCurrentUserInfo();

  const vfolderData = useFragment(
    graphql`
      fragment VFolderPermissionCellV2Fragment on VFolder {
        accessControl {
          permission
          ownershipType
        }
        ownership {
          userId
        }
      }
    `,
    vfolderFrgmt ?? null,
  );

  const level = mountPermissionFromV2(vfolderData?.accessControl?.permission);
  // `accessControl.permission` is the folder's DEFAULT level. A personal
  // folder's default is `none` (backend.ai#14679): its owner mounts it
  // read-write regardless and an invitee mounts at their own policy row, so
  // the default says nothing about the viewer — only the owner's level is known.
  const perm =
    level === 'none' && vfolderData?.accessControl?.ownershipType === 'USER'
      ? vfolderData?.ownership?.userId === currentUser?.uuid
        ? 'rw'
        : null
      : level;
  const icons = perm ? VFOLDER_MOUNT_PERMISSION_ICONS[perm] : '';

  return (
    <HStack gap={2} {...props}>
      <BAIText>
        {perm ? t(VFOLDER_MOUNT_PERMISSION_LABEL_KEYS[perm]) : '-'}
      </BAIText>
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

export default VFolderPermissionCellV2;
