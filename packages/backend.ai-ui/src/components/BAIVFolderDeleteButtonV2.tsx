/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Ticket 16 (Data/VFolder pages) — V2 counterpart of
 `BAIVFolderDeleteButton` for pages whose selection rows are the V2
 `VFolder` GraphQL type (`ProjectAdminDataPage`).

 BUI's `BAIVFolderDeleteButtonV2` is `BAIButton` + a lucide `Trash` coloured
 from `useTheme().token('--color-error')`. Its fragment intentionally selects only
 `id`: V2 `VFolder` does not expose a per-user action permission
 (TODO(needs-backend) in the BUI original), so the button is always enabled
 and the backend rejects unauthorized requests. That contract is preserved.

 PILOT-DECISIONs (same as the V1 Astryx rebuild):
 - The icon colour moves from a `token('--color-error')` prop to the shared
   `.bai-name-action-cell-danger` CSS-var class — one rule, theme-following.
 - P8: Astryx forces a real accessible `label`; the antd original was
   icon-only and relied on a wrapping Tooltip for its name.
*/
import { BAIVFolderDeleteButtonV2Fragment$key } from '../__generated__/BAIVFolderDeleteButtonV2Fragment.graphql';
import { IconButton } from '@astryxdesign/core/IconButton';
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
  useFragment<BAIVFolderDeleteButtonV2Fragment$key>(
    graphql`
      fragment BAIVFolderDeleteButtonV2Fragment on VFolder
      @relay(plural: true) {
        id
      }
    `,
    vfolderFrgmt,
  );

  return (
    <IconButton
      label={label}
      tooltip={tooltip ?? label}
      icon={<TrashIcon />}
      variant="ghost"
      size={size}
      className="bai-name-action-cell-danger"
      isDisabled={isDisabled}
      onClick={onClick}
    />
  );
};

export default BAIVFolderDeleteButtonV2;
