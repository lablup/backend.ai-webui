import useControllableState_deprecated from '../hooks/useControllableState';
import { Slider, type SliderSingleProps } from 'antd';
import _, { isNumber } from 'lodash';
import React from 'react';

export type StepType =
  | {
      value: number | string;
      label: string;
    }
  | number
  | string;
interface NonLinearSliderProps
  extends Omit<SliderSingleProps, 'value' | 'defaultValue' | 'onChange'> {
  steps: StepType[];
  value?: number | string;
  defaultValue?: number | string;
  // showAllMarkLabels?: boolean;
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

  const allMarks = _.fromPairs(
    normalizedSteps.map((step, index) => [
      index,
      isFirstAndLast(index) ? step.label : ' ',
    ]),
  );
  return (
    <Slider
      {...sliderProps}
      marks={allMarks}
      value={_.findIndex(normalizedSteps, { value: controlledValue })}
      min={0}
      tooltip={{
        formatter(value) {
          if (isNumber(value)) {
            return normalizedSteps[value]?.label;
          }
        },
        ...sliderProps.tooltip,
      }}
      max={normalizedSteps.length - 1}
      onChange={(rawValue) => {
        setControlledValue(
          normalizedSteps[rawValue]?.value,
          normalizedSteps[rawValue]?.label,
        );
      }}
    />
  );
};

export default NonLinearSlider;
