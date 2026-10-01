/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 V2 counterpart of `BAIVFolderDeleteButton` for pages whose selection rows
 are the V2 `VFolder` GraphQL type (`ProjectAdminDataPage`). The button stays
 disabled unless one selected folder grants the caller `SOFT_DELETE`.

 P8: Astryx forces a real accessible `label`; the antd original was
 icon-only and relied on a wrapping Tooltip for its name.
*/
import { BAIVFolderDeleteButtonV2Fragment$key } from '../__generated__/BAIVFolderDeleteButtonV2Fragment.graphql';
import { IconButton } from '@astryxdesign/core/IconButton';
import * as _ from 'lodash-es';
import { TrashIcon } from 'lucide-react';
import React from 'react';
import { graphql, useFragment } from 'react-relay';

export interface BAIVFolderDeleteButtonV2Props {
  vfolderFrgmt: BAIVFolderDeleteButtonV2Fragment$key;
  /** Accessible name — required by Astryx, absent in the antd original (P8). */
  label: string;
  tooltip?: string;
  isDisabled?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

const BAIVFolderDeleteButtonV2: React.FC<BAIVFolderDeleteButtonV2Props> = ({
  vfolderFrgmt,
  label,
  tooltip,
  isDisabled,
  onClick,
  size = 'md',
}) => {
  'use memo';
  const vfolders = useFragment<BAIVFolderDeleteButtonV2Fragment$key>(
    graphql`
      fragment BAIVFolderDeleteButtonV2Fragment on VFolder
      @relay(plural: true) {
        id
        permissions
      }
    `,
    vfolderFrgmt,
  );

  const isDeletable = _.some(vfolders, (vfolder) =>
    _.includes(vfolder.permissions, 'SOFT_DELETE'),
  );

  return (
    <IconButton
      label={label}
      tooltip={tooltip ?? label}
      icon={<TrashIcon />}
      variant="ghost"
      size={size}
      className="bai-name-action-cell-danger"
      isDisabled={isDisabled || !isDeletable}
      onClick={onClick}
    />
  );
};

export default BAIVFolderDeleteButtonV2;
