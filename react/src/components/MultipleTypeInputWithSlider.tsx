// This is a draft version.
// It doesn't seem to be a good idea to compare using two inputs with different units by composition on parent.
import DynamicUnitInputNumberWithSlider from './DynamicUnitInputNumberWithSlider';
import InputNumberWithSlider, {
  InputNumberWithSliderProps,
} from './InputNumberWithSlider';
import { useControllableValue } from 'ahooks';
import React from 'react';

interface MultipleTypeInputWithSliderProps
  extends Omit<InputNumberWithSliderProps, 'min' | 'max' | 'step'> {
  type: 'number' | 'bytes';
  min?: number;
  max?: number;
}

const MultipleTypeInputWithSlider: React.FC<
  MultipleTypeInputWithSliderProps
> = ({
  type,
  inputNumberProps,
  sliderProps,
  min,
  max,
  value: _valueFromProps,
  onChange: _onChangeFromProps,
  ...props
}) => {
  const [value, setValue] = useControllableValue({
    value: _valueFromProps,
    onChange: _onChangeFromProps,
  });
  return type === 'bytes' ? (
    <DynamicUnitInputNumberWithSlider
      {...props}
      value={value}
      onChange={setValue}
      extraMarks={sliderProps?.marks}
    />
  ) : (
    <InputNumberWithSlider
      {...props}
      min={min}
      max={max}
      inputNumberProps={inputNumberProps}
      sliderProps={sliderProps}
      value={value}
      onChange={setValue}
    />
  );
};

export default MultipleTypeInputWithSlider;
