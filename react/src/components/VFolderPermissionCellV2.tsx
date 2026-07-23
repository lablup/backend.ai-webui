/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { VFolderPermissionCellV2Fragment$key } from '../__generated__/VFolderPermissionCellV2Fragment.graphql';
import { Typography } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
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
    // V2 enum: READ_ONLY, READ_WRITE, RW_DELETE.
    // READ_ONLY  -> RO badge
    // READ_WRITE -> RW badge
    // RW_DELETE  -> RW badge (delete capability is surfaced via row actions)
    const perm =
      vfolderData?.accessControl?.permission === 'READ_ONLY' ? 'ro' : 'rw';
    return {
      permissionInfo: permissionMap[perm],
    };
  }, [vfolderData, t]);

  return (
    <BAIFlex gap={'xs'} {...props}>
      <Typography.Text>{permissionInfo?.label}</Typography.Text>
      <BAIFlex>
        {_.map(permissionInfo?.icon, (tag) => (
          <Typography.Text key={tag} code>
            {_.toUpper(tag)}
          </Typography.Text>
        ))}
      </BAIFlex>
    </BAIFlex>
  );
};

export default VFolderPermissionCellV2;
