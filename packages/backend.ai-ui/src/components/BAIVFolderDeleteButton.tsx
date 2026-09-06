/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 PILOT PHASE 6 (cn-oss-removal / ticket 10, item 4) — `BAIVFolderDeleteButton`.

 BUI's version is `BAIButton` + `@ant-design/icons` `DeleteOutlined` coloured
 from `theme.useToken().colorError`, gated by a Relay fragment that checks the
 `delete_vfolder` permission across the selected folders.

 **Native** rebuild: the only consumer in the pilot graph is the page's bulk
 action row. The Relay fragment is redeclared here (a fragment must live in the
 module that reads it), so `AdminVFolderNodeListPageQuery` spreads
 `...BAIVFolderDeleteButtonFragment` instead of BUI's. The selection set
 is identical, so no extra data is fetched.

 PILOT-DECISIONs:
 - **The icon colour moves from a prop to a CSS var.** antd needed
   `style={{color: token.colorError}}`; Astryx `IconButton` has no `color` (P5),
   so the danger tint comes from the same
   `.bai-name-action-cell-danger` class the row actions use — one rule, one
   place, and it follows the theme.
 - **P8 handled**: BUI's button is icon-only with no accessible name (the page
   supplies one via a wrapping `Tooltip`). Astryx forces a `label`, so the
   control now carries a real translated name and the tooltip is redundant
   decoration rather than the only affordance.
*/
import { BAIVFolderDeleteButtonFragment$key } from '../__generated__/BAIVFolderDeleteButtonFragment.graphql';
import { IconButton } from '@astryxdesign/core/IconButton';
import { TrashIcon } from 'lucide-react';
import React from 'react';
import { graphql, useFragment } from 'react-relay';

export interface BAIVFolderDeleteButtonProps {
  vfolderFrgmt: BAIVFolderDeleteButtonFragment$key;
  /** Accessible name — required by Astryx, absent in the antd original (P8). */
  label: string;
  tooltip?: string;
  isDisabled?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

const BAIVFolderDeleteButton: React.FC<BAIVFolderDeleteButtonProps> = ({
  vfolderFrgmt,
  label,
  tooltip,
  isDisabled,
  onClick,
  size = 'md',
}) => {
  'use memo';
  const vfolders = useFragment<BAIVFolderDeleteButtonFragment$key>(
    graphql`
      fragment BAIVFolderDeleteButtonFragment on VirtualFolderNode
      @relay(plural: true) {
        permissions
      }
    `,
    vfolderFrgmt,
  );

  const isDeletable = vfolders.some((vfolder) =>
    vfolder.permissions?.includes('delete_vfolder'),
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

export default BAIVFolderDeleteButton;
