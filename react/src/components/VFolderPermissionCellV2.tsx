/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { VFolderPermissionCellV2Fragment$key } from '../__generated__/VFolderPermissionCellV2Fragment.graphql';
import { HStack } from '@lablup/ui-common/Stack';
import { BAIQuestionIconWithTooltip, BAIText } from 'backend.ai-ui';
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
    };
    // RW_DELETE folds into RW; NONE (no mount permission) renders `-`.
    const permission = vfolderData?.accessControl?.permission;
    const perm =
      permission === 'READ_ONLY'
        ? 'ro'
        : permission === 'READ_WRITE' || permission === 'RW_DELETE'
          ? 'rw'
          : undefined;
    return {
      permissionInfo: perm ? permissionMap[perm] : undefined,
    };
  }, [vfolderData, t]);

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

export default VFolderPermissionCellV2;
