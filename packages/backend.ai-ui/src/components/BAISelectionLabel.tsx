/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Adapter over ui-common `SelectionLabel` (FR-4054): keeps `onClearSelection`
 and the CircleX clear glyph. The strings come from ui-common's catalog.
*/
import {
  SelectionLabel,
  type SelectionLabelProps,
} from '@lablup/ui-common/components/SelectionLabel';
import { CircleXIcon } from 'lucide-react';
import React from 'react';

export interface BAISelectionLabelProps extends Omit<
  SelectionLabelProps,
  'onClear'
> {
  onClearSelection?: () => void;
}

const BAISelectionLabel: React.FC<BAISelectionLabelProps> = ({
  onClearSelection,
  clearIcon = <CircleXIcon />,
  ...selectionLabelProps
}) => {
  'use memo';
  return (
    <SelectionLabel
      {...selectionLabelProps}
      clearIcon={clearIcon}
      onClear={onClearSelection}
    />
  );
};

export default BAISelectionLabel;
