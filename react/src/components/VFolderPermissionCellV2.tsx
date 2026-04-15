/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { VFolderPermissionCellV2Fragment$key } from '../__generated__/VFolderPermissionCellV2Fragment.graphql';
import { Typography } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface VFolderPermissionCellV2Props {
  vfolderFrgmt?: VFolderPermissionCellV2Fragment$key | null;
}

const VFolderPermissionCellV2: React.FC<VFolderPermissionCellV2Props> = ({
  vfolderFrgmt,
}) => {
  'use memo';
  const { t } = useTranslation();

  const vfolder = useFragment(
    graphql`
      fragment VFolderPermissionCellV2Fragment on VFolder {
        accessControl {
          permission
        }
      }
    `,
    vfolderFrgmt ?? null,
  );

  // READ_ONLY → R, READ_WRITE / RW_DELETE → RW
  const isReadOnly = vfolder?.accessControl?.permission === 'READ_ONLY';
  const label = isReadOnly ? t('data.ReadOnly') : t('data.ReadWrite');
  const icon = isReadOnly ? 'R' : 'RW';

  return (
    <BAIFlex gap={'xs'}>
      <Typography.Text>{label}</Typography.Text>
      <BAIFlex>
        {icon.split('').map((tag) => (
          <Typography.Text key={tag} code>
            {tag}
          </Typography.Text>
        ))}
      </BAIFlex>
    </BAIFlex>
  );
};

export default VFolderPermissionCellV2;
