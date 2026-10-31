/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Adapter over ui-common `BoardItemTitle` (FR-4054): keeps `extra` and the
 CircleHelp tooltip glyph. In an untitled `BAIBoard` item, the first one renders
 in the item's header row (ui-common `Board`); `inline` keeps it in the body.
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
