import { InputNumber, InputNumberProps } from 'antd';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';

interface DynamicInputNumberProps
  extends Omit<InputNumberProps, 'step' | 'value' | 'onChange'> {
  dynamicSteps?: number[];
  value: number;
  onChange: (value: number) => void;
}

const DynamicInputNumber: React.FC<DynamicInputNumberProps> = ({
  // dynamicSteps = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024],
  dynamicSteps = [
    0, 0.0625, 0.125, 0.25, 0.5, 0.75, 1, 2, 4, 8, 16, 32, 64, 128, 256, 512,
    1024, 2048, 4096, 8192, 16384, 32768, 65536,
  ],
  // value,
  onChange,
  ...inputNumberProps
}) => {
  const [internalValue, setInternalValue] = useState<number>(dynamicSteps[0]);

  useEffect(() => {
    if (_.isNumber(inputNumberProps.value)) {
      setInternalValue(inputNumberProps.value);
    }
  }, [inputNumberProps.value]);
  // const units = ['M', 'G', 'T'];
  return (
    <InputNumber
      {...inputNumberProps}
      value={internalValue}
      onChange={(newValue) => {
        // @ts-ignore
        setInternalValue(newValue);
        // @ts-ignore
        onChange && onChange(newValue);
      }}
      step={0}
      onStep={(afterStepValue, info) => {
        const index = _.sortedIndex(_.sortBy(dynamicSteps), internalValue);
        let nextIndex: number;
        if (info.type === 'up') {
          if (internalValue === dynamicSteps[index]) {
            nextIndex = index + 1;
          } else {
            nextIndex = index;
          }
        } else {
          nextIndex = index - 1;
        }
        if (nextIndex >= 0 && nextIndex < dynamicSteps.length) {
          let nextValue = dynamicSteps[nextIndex];
          if (
            _.isNumber(inputNumberProps?.min) &&
            nextValue < inputNumberProps.min
          ) {
            nextValue = inputNumberProps.min;
          } else if (
            _.isNumber(inputNumberProps?.max) &&
            nextValue > inputNumberProps.max
          ) {
            nextValue = inputNumberProps.max;
          }
          setInternalValue(nextValue);
        }
      }}
    />
  );
};

export default DynamicInputNumber;
