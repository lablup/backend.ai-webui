import Flex from './Flex';
import { useControllableValue } from 'ahooks';
import { InputNumber, Slider, InputNumberProps, SliderSingleProps } from 'antd';
import { SliderRangeProps } from 'antd/es/slider';
import React, { useEffect } from 'react';

type OmitControlledProps<T> = Omit<T, 'value' | 'onChange'>;

interface InputNumberWithSliderProps {
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  value?: number;
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
  ...otherProps
}) => {
  const [value, setValue] = useControllableValue(otherProps);
  useEffect(() => {
    // when step is 1, make sure the value is integer
    if (step === 1 && value % 1 !== 0) {
      setValue(Math.round(value));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);
  return (
    <Flex direction="row" gap={'md'}>
      <Flex direction="column" align="stretch" style={{ flex: 3 }}>
        <Slider
          max={max}
          min={0}
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
        />
      </Flex>
      <Flex
        style={{ flex: 2, minWidth: 130 }}
        align="stretch"
        direction="column"
      >
        <InputNumber
          max={max}
          min={min}
          step={step}
          disabled={disabled}
          value={value}
          onChange={setValue}
          {...inputNumberProps}
        />
      </Flex>
    </Flex>
  );
};

export default InputNumberWithSlider;
