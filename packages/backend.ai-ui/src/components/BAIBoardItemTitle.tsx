/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Adapter over ui-common `BoardItemTitle` (FR-4054): keeps `extra` and the
 CircleHelp tooltip glyph. Inside a `BAIBoard` item it renders into the item's
 title row, which the board pads and places; elsewhere, where it stands.
*/
import { useBAIBoardItemTitleTarget } from './BAIBoardItemTitleSlot';
import {
  BoardItemTitle,
  type BoardItemTitleProps,
} from '@lablup/ui-common/components/BoardItemTitle';
import { CircleHelp } from 'lucide-react';
import React from 'react';
import { createPortal } from 'react-dom';

export interface BAIBoardItemTitleProps extends Omit<
  BoardItemTitleProps,
  'endContent'
> {
  extra?: React.ReactNode;
}

const BAIBoardItemTitle: React.FC<BAIBoardItemTitleProps> = ({
  extra,
  tooltipIcon = <CircleHelp size="1em" />,
  ...titleProps
}) => {
  'use memo';
  const target = useBAIBoardItemTitleTarget();
  const row = (
    <BoardItemTitle
      {...titleProps}
      tooltipIcon={tooltipIcon}
      endContent={extra}
    />
  );
  if (target === undefined) return row;
  // The board's title row mounts with the item; until then there is nowhere to draw.
  return target ? createPortal(row, target) : null;
};

BAIBoardItemTitle.displayName = 'BAIBoardItemTitle';
export default BAIBoardItemTitle;
