import { InputNumber, InputNumberProps, Select, Typography } from 'antd';
import _ from 'lodash';
import React from 'react';

export interface DynamicUnitInputNumberProps
  extends Omit<
    InputNumberProps,
    'step' | 'max' | 'min' | 'value' | 'onChange'
  > {
  dynamicSteps?: number[];
  disableAutoUnit?: boolean;
  // max?: string;
  // min?: string;
  value?: string;
  onChange?: (value: string) => void;
}

const DynamicUnitInputNumber: React.FC<DynamicUnitInputNumberProps> = ({
  dynamicSteps = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512],
  disableAutoUnit = false,
  value,
  onChange,
  ...inputNumberProps
}) => {
  // const [numValue, setNumValue] = useState<number>(dynamicSteps[0]);
  // const [unit, setUnit] = useState('G');
  const [numValue, unit] = parseUnit(value || '0g');

  const units = ['m', 'g', 't', 'p'];

  return (
    <InputNumber
      {...inputNumberProps}
      value={numValue}
      onChange={(newValue) => {
        // @ts-ignore
        // setNumValue(newValue);
        onChange &&
          onChange(_.isNumber(newValue) ? `${newValue}${unit}` : `0${unit}`);
      }}
      addonAfter={
        <Select
          value={unit}
          onChange={(newUnit) => {
            onChange && onChange(`${numValue}${newUnit}`);
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

        const prevUnitIndex = units.indexOf(unit);
        if (!disableAutoUnit && nextIndex < 0) {
          if (prevUnitIndex === 0) {
            onChange && onChange(`0${unit}`);
          } else {
            const nextValue = dynamicSteps[dynamicSteps.length - 1];
            const nextUnit = units[prevUnitIndex - 1];
            onChange && onChange(`${nextValue}${nextUnit}`);
          }
        } else if (!disableAutoUnit && nextIndex > dynamicSteps.length - 1) {
          if (prevUnitIndex === units.length - 1) {
            //  already at max unit
          } else {
            const nextValue = dynamicSteps[0];
            const nextUnit = units[prevUnitIndex + 1];
            onChange && onChange(`${nextValue}${nextUnit}`);
          }
        } else {
          if (nextIndex >= 0 && nextIndex < dynamicSteps.length) {
            let nextValue = dynamicSteps[nextIndex];
            // if (
            //   _.isNumber(inputNumberProps?.min) &&
            //   nextValue < inputNumberProps.min
            // ) {
            //   nextValue = inputNumberProps.min;
            // } else if (
            //   _.isNumber(inputNumberProps?.max) &&
            //   nextValue > inputNumberProps.max
            // ) {
            //   nextValue = inputNumberProps.max;
            // }
            // setNumValue(nextValue);
            onChange && onChange(`${nextValue}${unit}`);
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
