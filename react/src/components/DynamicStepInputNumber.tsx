import useControllableState from '../hooks/useControllableState';
import { InputNumber, InputNumberProps } from 'antd';
import { useFetchKey } from 'backend.ai-ui';
import _ from 'lodash';
import React, { useEffect } from 'react';

export interface DynamicInputNumberProps
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
  // onChange,
  ...inputNumberProps
}) => {
  const [value, setValue] = useControllableState<number>(inputNumberProps, {
    defaultValue: dynamicSteps[0],
  });

  // FIXME: this is a workaround to fix the issue that the value is not updated when the value is controlled
  const [key, updateKey] = useFetchKey();
  useEffect(() => {
    setTimeout(() => {
      updateKey(value.toString());
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <InputNumber
      {...inputNumberProps}
      key={key}
      value={value}
      onChange={(newValue) => {
        // @ts-ignore
        setValue(newValue);
      }}
      step={0}
      onStep={(afterStepValue, info) => {
        const index = _.sortedIndex(_.sortBy(dynamicSteps), value);
        let nextIndex: number;
        if (info.type === 'up') {
          if (value === dynamicSteps[index]) {
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
          setValue(nextValue);
        }
      }}
    />
  );
};

export default DynamicInputNumber;
