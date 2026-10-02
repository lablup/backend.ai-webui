/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Adapter over ui-common `BoardItemTitle` (FR-4054): keeps `extra` and the
 CircleHelp tooltip glyph. `style` and other div attributes reach the row. The
 sticky row's z-index is ui-common's default 50: above a table's fixed columns,
 below `BAI_Z_INDEX.appHeader`.
*/
import {
  BoardItemTitle,
  type BoardItemTitleProps,
} from '@lablup/ui-common/components/BoardItemTitle';
import { CircleHelp } from 'lucide-react';
import React from 'react';

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
  return (
    <BoardItemTitle
      {...titleProps}
      tooltipIcon={tooltipIcon}
      endContent={extra}
    />
  );
};

BAIBoardItemTitle.displayName = 'BAIBoardItemTitle';
export default BAIBoardItemTitle;
