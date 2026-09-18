/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { VFolderPermissionCellV2Fragment$key } from '../__generated__/VFolderPermissionCellV2Fragment.graphql';
import { HStack } from '@astryxdesign/core/Stack';
import { BAIText } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { useMemo } from 'react';
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

  const vfolderData = useFragment(
    graphql`
      fragment VFolderPermissionCellV2Fragment on VFolder {
        accessControl {
          permission
        }
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
      none: {
        label: t('data.NotMountable'),
        icon: '',
      },
    };
    // NONE mounts to nobody; RW_DELETE mounts as READ_WRITE (backend.ai#14679).
    const perm =
      vfolderData?.accessControl?.permission === 'NONE'
        ? 'none'
        : vfolderData?.accessControl?.permission === 'READ_ONLY'
          ? 'ro'
          : 'rw';
    return {
      permissionInfo: permissionMap[perm],
    };
  }, [vfolderData, t]);

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

export default VFolderPermissionCellV2;
