import { useUpdatableState } from '../hooks';
import useControllableState from '../hooks/useControllableState';
import Flex from './Flex';
import { InputNumber, Slider, InputNumberProps, SliderSingleProps } from 'antd';
import { SliderRangeProps } from 'antd/es/slider';
import _ from 'lodash';
import React, { useEffect } from 'react';

type OmitControlledProps<T> = Omit<T, 'value' | 'onChange'>;

interface InputNumberWithSliderProps {
  min?: number;
  max?: number;
  step?: number | null;
  disabled?: boolean;
  value?: number;
  allowNegative?: boolean;
  onChange?: (value: number) => void;
  inputNumberProps?: OmitControlledProps<InputNumberProps>;
  sliderProps?:
    | OmitControlledProps<SliderSingleProps>
    | OmitControlledProps<SliderRangeProps>;
}
const InputNumberWithSlider: React.FC<InputNumberWithSliderProps> = ({
  min,
  max,
  step,
  disabled,
  inputNumberProps,
  sliderProps,
  allowNegative,
  ...otherProps
}) => {
  const [value, setValue] = useControllableState(otherProps);
  const inputRef = React.useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!allowNegative) {
      // when step is 1, make sure the value is integer
      if (step === 1 && value % 1 !== 0) {
        setValue(_.max([Math.round(value), min]));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // FIXME: this is a workaround to fix the issue that the value is not updated when the value is controlled
  const [key, updateKey] = useUpdatableState('first');
  useEffect(() => {
    if (!allowNegative) {
      setTimeout(() => {
        updateKey(value);
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Flex direction="row" gap={'md'}>
      <Flex
        style={{ flex: 2, minWidth: 190 }}
        align="stretch"
        direction="column"
      >
        <InputNumber
          key={key}
          ref={inputRef}
          max={max}
          min={min}
          step={step ?? undefined}
          disabled={disabled}
          value={value}
          onChange={setValue}
          onBlur={() => {
            if (_.isNumber(step) && step > 0) {
              if (
                _.isNumber(max) &&
                max < _.toNumber(inputRef.current?.value || '0')
              ) {
                return; // do not update value if it is greater than max
              }
              const decimalCount = step.toString().split('.')[1]?.length || 0;
              setValue(
                _.max([
                  _.toNumber(
                    (
                      Math.round(
                        _.toNumber(inputRef.current?.value || '0') / step,
                      ) * step
                    ).toFixed(decimalCount),
                  ),
                  min,
                ]),
              );
            }
          }}
          {...inputNumberProps}
        />
      </Flex>
      <Flex direction="column" align="stretch" style={{ flex: 3 }}>
        <Slider
          max={max}
          min={min}
          step={step}
          disabled={disabled}
          value={value}
          onChange={(value: any) => {
            if (min !== undefined && value < min) {
              return;
            } else {
              setValue(value);
            }
          }}
          {...sliderProps}
          // remove marks that are greater than max
          marks={_.omitBy(sliderProps?.marks, (option, key) => {
            return _.isNumber(max) ? _.parseInt(key) > max : false;
          })}
        />
      </Flex>
    </Flex>
  );
};

export default InputNumberWithSlider;
