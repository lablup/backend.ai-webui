/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Astryx types `SegmentedControlItem.label` as `string` but renders it straight
 through as children; it only reaches an attribute via `isLabelHidden`, which
 this wrapper drops so a ReactNode label can never become an `aria-label`.
*/
import type { SegmentedControlItemProps } from '@astryxdesign/core/SegmentedControl';
import { SegmentedControlItem } from '@astryxdesign/core/SegmentedControl';
import React from 'react';

export interface BAISegmentedControlItemProps extends Omit<
  SegmentedControlItemProps,
  'label' | 'isLabelHidden'
> {
  /** Widened from Astryx's `string` — see the file header. */
  label: React.ReactNode;
}

const BAISegmentedControlItem: React.FC<BAISegmentedControlItemProps> = ({
  label,
  ...itemProps
}) => {
  'use memo';
  return (
    <SegmentedControlItem {...itemProps} label={label as unknown as string} />
  );
};

export default BAISegmentedControlItem;
