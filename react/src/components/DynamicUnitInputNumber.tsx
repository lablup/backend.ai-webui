import { useControllableValue } from 'ahooks';
import { InputNumber, InputNumberProps, Select, Typography } from 'antd';
import _, { set } from 'lodash';
import React from 'react';

export interface DynamicUnitInputNumberProps
  extends Omit<
    InputNumberProps,
    'step' | 'max' | 'min' | 'value' | 'onChange'
  > {
  dynamicSteps?: number[];
  disableAutoUnit?: boolean;
  max?: string;
  min?: string;
  value?: string;
  onChange?: (value: string) => void;
}

const DynamicUnitInputNumber: React.FC<DynamicUnitInputNumberProps> = ({
  dynamicSteps = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512],
  disableAutoUnit = false,
  min,
  max,
  // value,
  // onChange,
  ...inputNumberProps
}) => {
  const [value, setValue] = useControllableValue<string>(inputNumberProps, {
    defaultValue: '0g',
  });
  const [numValue, unit] = parseUnit(value || '0g');
  const [minNumValue, minUnit] = parseUnit(min || '0m');
  const [maxNumValue, maxUnit] = parseUnit(max || '300p');

  const units = ['m', 'g', 't', 'p'];

  return (
    <InputNumber
      {...inputNumberProps}
      value={numValue}
      onChange={(newValue) => {
        setValue(_.isNumber(newValue) ? `${newValue}${unit}` : `0${unit}`);
      }}
      //TODO: When min and max have different units, they should be calculated and put in.
      // 입력의 초소단위 확인 0.4g 가 되는지 확인
      max={maxUnit === unit ? maxNumValue : undefined}
      min={minUnit === unit ? minNumValue : undefined}
      addonAfter={
        <Select
          value={unit}
          onChange={(newUnit) => {
            setValue(`${numValue}${newUnit}`);
            // onChange && onChange(`${numValue}${newUnit}`);
          }}
          options={_.map(units, (unit) => ({
            value: unit,
            label: (
              <Typography.Text
                style={{
                  fontFamily:
                    "'SFMono-Regular',Consolas,'Liberation Mono',Menlo,Courier,monospace",
                }}
              >
                {unit.toUpperCase() + 'iB'}
              </Typography.Text>
            ),
          }))}
        />
      }
      step={0} // this step applies when onStep doesn't setValue
      onStep={(afterStepValue, info) => {
        const index = _.sortedIndex(_.sortBy(dynamicSteps), numValue);
        let nextIndex: number;
        if (info.type === 'up') {
          if (numValue === dynamicSteps[index]) {
            nextIndex = index + 1;
          } else {
            nextIndex = index;
          }
        } else {
          nextIndex = index - 1;
        }

        const currentUnitIndex = units.indexOf(unit);
        if (!disableAutoUnit && nextIndex < 0) {
          if (currentUnitIndex === 0) {
            setValue(`0${unit}`);
          } else {
            const nextValue = dynamicSteps[dynamicSteps.length - 1];
            const nextUnit = units[currentUnitIndex - 1];
            setValue(`${nextValue}${nextUnit}`);
          }
        } else if (!disableAutoUnit && nextIndex > dynamicSteps.length - 1) {
          if (currentUnitIndex === units.length - 1) {
            //  already at max unit
          } else {
            const nextValue = dynamicSteps[0];
            const nextUnit = units[currentUnitIndex + 1];
            setValue(`${nextValue}${nextUnit}`);
          }
        } else {
          if (nextIndex >= 0 && nextIndex < dynamicSteps.length) {
            let nextNumValue = dynamicSteps[nextIndex];
            if (minUnit === unit && nextNumValue < minNumValue) {
              nextNumValue = minNumValue;
            } else if (maxUnit === unit && nextNumValue > maxNumValue) {
              nextNumValue = maxNumValue;
            }
            setValue(`${nextNumValue}${unit}`);
          }
        }
      }}
    />
  );
};

function parseUnit(str: string): [number, string] {
  const match = str.match(/^(\d+(?:\.\d+)?)([a-zA-Z]*)$/);
  if (!match) {
    throw new Error(`Invalid input: ${str}`);
  }
  const num = parseFloat(match[1]);
  const unit = match[2];
  return [num, unit];
}

export default DynamicUnitInputNumber;
