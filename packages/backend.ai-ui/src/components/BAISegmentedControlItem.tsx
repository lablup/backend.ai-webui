/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Astryx types `SegmentedControlItem.label` as `string` but renders it straight
 through as children; it only reaches an attribute via `isLabelHidden`, so a
 hidden label must stay a string and a ReactNode label is never hidden.
*/
import type { SegmentedControlItemProps } from '@lablup/ui-common/SegmentedControl';
import { SegmentedControlItem } from '@lablup/ui-common/SegmentedControl';
import React from 'react';

type ItemBaseProps = Omit<SegmentedControlItemProps, 'label' | 'isLabelHidden'>;

export type BAISegmentedControlItemProps =
  | (ItemBaseProps & {
      /** Widened from Astryx's `string` — see the file header. */
      label: React.ReactNode;
      isLabelHidden?: false;
    })
  | (ItemBaseProps & {
      /** The accessible name of an icon-only segment. */
      label: string;
      isLabelHidden: true;
    });

const BAISegmentedControlItem: React.FC<BAISegmentedControlItemProps> = ({
  label,
  isLabelHidden,
  ...itemProps
}) => {
  'use memo';
  return (
    <SegmentedControlItem
      {...itemProps}
      label={label as unknown as string}
      isLabelHidden={isLabelHidden}
    />
  );
};

export default BAISegmentedControlItem;
