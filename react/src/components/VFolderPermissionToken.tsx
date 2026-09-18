/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { VFolderPermissionToken_VFolder$key } from '../__generated__/VFolderPermissionToken_VFolder.graphql';
import {
  BAIDoubleToken,
  BAIDoubleTokenValue,
  tokenColorForStatus,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

const hasPermission = (permission: string | undefined, perm: string) => {
  if (permission?.includes(perm)) {
    return true;
  }
  if (permission?.includes('w') && perm === 'r') {
    return true;
  }
  return false;
};

type VFolderPermissionTokenProps =
  | {
      vFolderFrgmt?: never;
      permission: string;
    }
  | {
      vFolderFrgmt: VFolderPermissionToken_VFolder$key;
      permission?: never;
    };

const VFolderPermissionToken: React.FC<VFolderPermissionTokenProps> = ({
  vFolderFrgmt = null,
  permission,
}) => {
  const { t } = useTranslation();
  const vFolder = useFragment(
    graphql`
      fragment VFolderPermissionToken_VFolder on VirtualFolder {
        permission
      }
    `,
    vFolderFrgmt,
  );
  const resolvedPermission = vFolder?.permission || permission;
  // 'none' (or the legacy field's null) means the folder mounts to nobody.
  if (!resolvedPermission || resolvedPermission === 'none') {
    return (
      <BAIDoubleToken values={[{ label: t('data.NotMountable'), color: 'default' }]} />
    );
  }
  const tokenValues: BAIDoubleTokenValue[] = _.compact(
    _.map(['r', 'w', 'd'], (perm) =>
      hasPermission(resolvedPermission, perm)
        ? {
            label: perm.toUpperCase(),
            color: tokenColorForStatus('vfolderPermission', perm),
          }
        : undefined,
    ),
  );

  return <BAIDoubleToken values={tokenValues} />;
};

export default VFolderPermissionToken;
