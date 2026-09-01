/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { VFolderPermissionTag_VFolder$key } from '../__generated__/VFolderPermissionTag_VFolder.graphql';
import { BAIDoubleTag, DoubleTagObjectValue } from 'backend.ai-ui';
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

type VFolderPermissionTagProps =
  | {
      vFolderFrgmt?: never;
      permission: string;
    }
  | {
      vFolderFrgmt: VFolderPermissionTag_VFolder$key;
      permission?: never;
    };

const VFolderPermissionTag: React.FC<VFolderPermissionTagProps> = ({
  vFolderFrgmt = null,
  permission,
}) => {
  const vFolder = useFragment(
    graphql`
      fragment VFolderPermissionTag_VFolder on VirtualFolder {
        permission
      }
    `,
    vFolderFrgmt,
  );
  const tagValues: DoubleTagObjectValue[] = _.compact(
    _.map(
      {
        r: 'green',
        w: 'blue',
        d: 'red',
      },
      (color, perm) => {
        if (hasPermission(vFolder?.permission || permission, perm)) {
          return {
            label: perm.toUpperCase(),
            color,
          };
        }
        return undefined;
      },
    ),
  );

  return <BAIDoubleTag values={tagValues} />;
};

export default VFolderPermissionTag;
