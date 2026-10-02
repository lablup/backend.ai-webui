/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 ui-common `CountdownBorder` under its BUI name (FR-4096): `animated` →
 `isAnimated`, `paused` → `isPaused`.
*/
import {
  CountdownBorder,
  type CountdownBorderProps,
} from '@lablup/ui-common/components/CountdownBorder';
import React from 'react';

export interface BAICountdownBorderProps extends Omit<
  CountdownBorderProps,
  'isAnimated' | 'isPaused'
> {
  /** Whether the fill animation runs (and the border is drawn). Defaults to `true`. */
  animated?: boolean;
  /** Freezes the fill and hides the border, e.g. while a refresh is in flight. */
  paused?: boolean;
}

const BAICountdownBorder: React.FC<BAICountdownBorderProps> = ({
  animated,
  paused,
  ...countdownProps
}) => (
  <CountdownBorder
    {...countdownProps}
    isAnimated={animated}
    isPaused={paused}
  />
);

export default BAICountdownBorder;
