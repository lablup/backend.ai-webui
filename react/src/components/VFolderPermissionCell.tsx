/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { VFolderPermissionCellFragment$key } from '../__generated__/VFolderPermissionCellFragment.graphql';
import { HStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
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

  // PHASE 6 (item 4) — FRONTIER conversion. The external props are unchanged
  // (`vfolderFrgmt` / `permission`), so the five unmigrated consumers compile
  // untouched; only the internals move. antd `Typography.Text code` becomes
  // Astryx `Text type="code"`, and `BAIFlex gap="xs"` becomes `HStack gap={2}`
  // (BUI `xs` resolves to antd's `sizeXS` = 8px = Astryx step 2 — the Phase-3
  // corrected mapping, not the token NAME).
  return (
    <HStack gap={2} {...props}>
      <Text>{permissionInfo?.label}</Text>
      <HStack>
        {_.map(permissionInfo?.icon, (tag) => (
          <Text key={tag} type="code">
            {_.toUpper(tag)}
          </Text>
        ))}
      </HStack>
    </HStack>
  );
};

export default VFolderPermissionCell;
