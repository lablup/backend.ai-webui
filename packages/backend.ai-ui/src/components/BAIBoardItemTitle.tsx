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
  const { title } = titleProps;
  return (
    <BoardItemTitle
      {...titleProps}
      title={
        typeof title === 'string' || title == null ? (
          title
        ) : (
          // A node title (often a `BAIFlex` row, which never shrinks) gets a block
          // that does, so the row wraps inside a narrow item instead of overflowing.
          <div style={{ flex: '0 1 auto', minWidth: 0 }}>{title}</div>
        )
      }
      tooltipIcon={tooltipIcon}
      endContent={extra}
    />
  );
};

BAIBoardItemTitle.displayName = 'BAIBoardItemTitle';
export default BAIBoardItemTitle;
