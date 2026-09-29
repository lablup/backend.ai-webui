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
  const vFolder = useFragment(
    graphql`
      fragment VFolderPermissionToken_VFolder on VirtualFolder {
        permission
      }
    `,
    vFolderFrgmt,
  );
  const tokenValues: BAIDoubleTokenValue[] = _.compact(
    _.map(['r', 'w', 'd'], (perm) =>
      hasPermission(vFolder?.permission || permission, perm)
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
