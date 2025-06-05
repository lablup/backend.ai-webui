import { VFolderPermissionTag_VFolder$key } from '../__generated__/VFolderPermissionTag_VFolder.graphql';
import DoubleTag, { DoubleTagObjectValue } from './DoubleTag';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React from 'react';
import { useFragment } from 'react-relay';

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
  const tagValues: DoubleTagObjectValue[] = _.chain({
    r: 'green',
    w: 'blue',
    d: 'red',
  })
    .map((color, perm) => {
      if (hasPermission(vFolder?.permission || permission, perm)) {
        return {
          label: perm.toUpperCase(),
          color,
        };
      }
      return undefined;
    })
    .compact()
    .value();

  return <DoubleTag values={tagValues} />;
};

export default VFolderPermissionTag;
