/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 antd `Slider` → Astryx `Slider` (MAPPING §4). This wrapper has **no** call
 sites left in `react/src`, `packages/backend.ai-ui/src` or `e2e` (grepped, not
 guessed), so the frontier rule does not apply and the props are re-based on
 Astryx's `SliderSingleProps` rather than antd's.

 PILOT-DECISIONs:
 - antd `marks` was `Record<number, ReactNode>`; Astryx takes
   `{value, label?: string}[]` with a **string** label. The blank `' '` spacer
   marks the antd version emitted for the in-between steps become marks with no
   label at all, which is what they always meant.
 - antd `tooltip={{formatter}}` → `formatValue` + `valueDisplay="tooltip"`
   (the Astryx default). `tooltip.open` / `tooltip.placement` have no
   equivalent and no consumer.
 - Astryx `Slider.label` is a required string the control renders itself; the
   wrapper surfaces it so a future call site must name the control.
*/
import useControllableState_deprecated from '../hooks/useControllableState';
import { Slider } from '@astryxdesign/core/Slider';
import type { SliderSingleProps } from '@astryxdesign/core/Slider';
import * as _ from 'lodash-es';
import React from 'react';

export type StepType =
  | {
      value: number | string;
      label: string;
    }
  | number
  | string;
interface NonLinearSliderProps extends Omit<
  SliderSingleProps,
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'marks'
  | 'formatValue'
  | 'min'
  | 'max'
> {
  steps: StepType[];
  value?: number | string;
  defaultValue?: number | string;
  onChange?: (value: number | string, label: string) => void;
}
const NonLinearSlider: React.FC<NonLinearSliderProps> = ({
  value,
  defaultValue,
  onChange,
  steps,
  ...sliderProps
}) => {
  const normalizedSteps = steps.map((step) => {
    if (_.isNumber(step) || _.isString(step)) {
      return {
        value: step,
        label: step.toString(),
      };
    }
    return step;
  });

  const [controlledValue, setControlledValue] = useControllableState_deprecated(
    {
      value,
      defaultValue: defaultValue ?? normalizedSteps[0]?.value,
      onChange,
    },
  );

  const isFirstAndLast = (index: number) =>
    index === 0 || index === normalizedSteps.length - 1;

  // Only the first and last steps carry a visible label; the rest are bare
  // ticks (antd needed a `' '` placeholder for that, Astryx does not).
  const allMarks = normalizedSteps.map((step, index) => ({
    value: index,
    label: isFirstAndLast(index) ? step.label : undefined,
  }));

  return (
    <Slider
      {...sliderProps}
      marks={allMarks}
      value={_.findIndex(normalizedSteps, { value: controlledValue })}
      min={0}
      max={normalizedSteps.length - 1}
      formatValue={(rawValue: number) => normalizedSteps[rawValue]?.label ?? ''}
      onChange={(rawValue: number) => {
        setControlledValue(
          normalizedSteps[rawValue]?.value,
          normalizedSteps[rawValue]?.label,
        );
      }}
    />
  );
};

export default NonLinearSlider;
