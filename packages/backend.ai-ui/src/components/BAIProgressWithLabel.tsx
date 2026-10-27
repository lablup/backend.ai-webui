/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 ui-common `ProgressWithLabel` under its BUI name (FR-4096): `title` →
 `label`, `percent` → `value`, `showInfo` → `hasValueLabel`, `strokeColor` →
 `color`, `progressStyle` → `style`, antd sizes → sm / md / lg.
 BAIProgressWithLabel.css keeps the WebUI's 3px frame corner.
*/
import './BAIProgressWithLabel.css';
import {
  ProgressWithLabel,
  type ProgressWithLabelProps,
} from '@lablup/ui-common/components/ProgressWithLabel';
import React from 'react';

export interface BAIProgressWithLabelProps extends Pick<
  ProgressWithLabelProps,
  'valueLabel' | 'width' | 'labelStyle'
> {
  /** Whether the value label shows; its space stays reserved. */
  showInfo?: boolean;
  title?: React.ReactNode;
  percent?: number;
  strokeColor?: string;
  progressStyle?: React.CSSProperties;
  size?: 'small' | 'middle' | 'large';
}

const SIZE: Record<
  NonNullable<BAIProgressWithLabelProps['size']>,
  ProgressWithLabelProps['size']
> = {
  small: 'sm',
  middle: 'md',
  large: 'lg',
};

const BAIProgressWithLabel: React.FC<BAIProgressWithLabelProps> = ({
  title,
  valueLabel,
  percent,
  width,
  strokeColor,
  labelStyle,
  progressStyle,
  showInfo = true,
  size = 'small',
}) => (
  <ProgressWithLabel
    className="bai-progress-with-label"
    label={title}
    valueLabel={valueLabel}
    value={percent}
    hasValueLabel={showInfo}
    color={strokeColor}
    width={width}
    size={SIZE[size]}
    style={progressStyle}
    labelStyle={labelStyle}
  />
);

export default BAIProgressWithLabel;
