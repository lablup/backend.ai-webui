/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { VFolderPermissionCellV2Fragment$key } from '../__generated__/VFolderPermissionCellV2Fragment.graphql';
import { HStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
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

  // Ticket 16 — FRONTIER conversion (same pattern as the V1 cell): the
  // external props are unchanged, only the internals move. antd
  // `Typography.Text code` becomes Astryx `Text type="code"`, and
  // `BAIFlex gap="xs"` becomes `HStack gap={2}` (BUI `xs` = 8px = step 2 by
  // VALUE, per P9).
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

export default VFolderPermissionCellV2;
