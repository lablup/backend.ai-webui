/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Adapter over ui-common `ColorPicker` (FR-4054): keeps the antd-shaped
 `onChangeComplete`, `showText`, `allowClear` and `disabled`. The value is a
 `#rrggbb` string on both edges; the strings come from ui-common's catalog.
*/
import {
  ColorPicker,
  toHexColor,
  type ColorPickerProps,
} from '@lablup/ui-common/components/ColorPicker';
import React from 'react';

export { toHexColor };

export interface BAIColorPickerProps extends Omit<
  ColorPickerProps,
  'onChange' | 'hasValueLabel' | 'hasClear' | 'isDisabled'
> {
  /** Fires with `#rrggbb` when the user settles on a colour. */
  onChangeComplete?: (hex: string) => void;
  /** Renders the hex next to the swatch on the trigger. */
  showText?: boolean;
  /** Offers a "clear" action inside the popover. */
  allowClear?: boolean;
  disabled?: boolean;
}

const BAIColorPicker: React.FC<BAIColorPickerProps> = ({
  onChangeComplete,
  showText,
  allowClear,
  disabled,
  ...colorPickerProps
}) => {
  'use memo';
  return (
    <ColorPicker
      {...colorPickerProps}
      onChange={onChangeComplete}
      hasValueLabel={showText}
      hasClear={allowClear}
      isDisabled={disabled}
    />
  );
};

export default BAIColorPicker;
