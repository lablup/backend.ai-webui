import { InputNumber, InputNumberProps, Select } from 'antd';
import _ from 'lodash';
import React, { useMemo, useState } from 'react';

interface DynamicInputNumberProps extends Omit<InputNumberProps, 'step'> {
  dynamicSteps?: number[];
  // disableAutoUnit?: boolean;
}

const DynamicInputNumber: React.FC<DynamicInputNumberProps> = ({
  // dynamicSteps = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024],
  dynamicSteps = [
    0, 0.0625, 0.125, 0.25, 0.5, 0.75, 1, 2, 4, 8, 16, 32, 64, 128, 256, 512,
    1024, 2048, 4096, 8192, 16384, 32768, 65536,
  ],
  ...inputNumberProps
}) => {
  const [value, setValue] = useState<number>(dynamicSteps[0]);

  // const units = ['M', 'G', 'T'];
  return (
    <InputNumber
      {...inputNumberProps}
      value={value}
      // @ts-ignore
      onChange={(newValue) => setValue(newValue)}
      // addonAfter={
      //   <Select
      //     defaultValue={'G'}
      //     options={_.map(units, (unit) => ({
      //       label: unit,
      //       value: unit,
      //     }))}
      //   />
      // }
      step={1} // this step applies when onStep doesn't setValue
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
