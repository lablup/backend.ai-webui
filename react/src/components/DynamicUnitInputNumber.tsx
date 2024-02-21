import { iSizeToSize, parseUnit } from '../helper';
import { useControllableValue, usePrevious } from 'ahooks';
import { InputNumber, InputNumberProps, Select, Typography } from 'antd';
import _ from 'lodash';
import React, { useEffect, useRef } from 'react';

export interface DynamicUnitInputNumberProps
  extends Omit<
    InputNumberProps,
    'step' | 'max' | 'min' | 'value' | 'onChange'
  > {
  dynamicSteps?: number[];
  disableAutoUnit?: boolean;
  max?: string;
  min?: string;
  value?: string | null | undefined;
  units?: string[];
  roundStep?: number;
  onChange?: (value: string) => void;
}

const DynamicUnitInputNumber: React.FC<DynamicUnitInputNumberProps> = ({
  dynamicSteps = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512],
  units = ['m', 'g', 't', 'p'],
  disableAutoUnit = false,
  min = '0m',
  max = '300p',
  roundStep,
  ...inputNumberProps
}) => {
  const [value, setValue] = useControllableValue<string | null | undefined>(
    inputNumberProps,
    {
      defaultValue: '0g',
    },
  );
  const [numValue, _unitFromValue] =
    value === null || value === undefined ? [null, null] : parseUnit(value);
  const previousUnit = usePrevious(_unitFromValue);
  const unit = _unitFromValue || previousUnit || units[0];

  const [minNumValue, minUnit] = parseUnit(min);
  const [maxNumValue, maxUnit] = parseUnit(max);

  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) {
      const onInput = (e: Event) => {
        // @ts-ignore
        const value = e?.target?.value;
        if (/^\d+(g|m)$/.test(value)) {
          // const [newNumber, newUnit] = parseUnit(value);
          // if (newNumber === numValue && newUnit === unit) {
          //   e.target.value = numValue;
          // } else {
          setValue(value);
          // }
        }
      };
      const target = ref.current;
      target?.addEventListener('input', onInput);
      return () => {
        target?.removeEventListener('input', onInput);
      };
    }
  }, [ref, numValue, _unitFromValue, setValue]);

  return (
    <InputNumber
      ref={ref}
      {...inputNumberProps}
      onBlur={() => {
        if (_.isNumber(roundStep) && roundStep > 0) {
          const decimalCount = roundStep.toString().split('.')[1]?.length || 0;
          setValue(
            `${(Math.round(_.toNumber(ref.current?.value || '0') / roundStep) * roundStep).toFixed(decimalCount)}${unit}`,
          );
        }
      }}
      value={numValue}
      onChange={(newValue) => {
        if (newValue === null || newValue === undefined) {
          setValue(newValue);
        } else {
          setValue(`${newValue}${unit}`);
        }
      }}
      //TODO: When min and max have different units, they should be calculated and put in.
      // 입력의 초소단위 확인 0.4g 가 되는지 확인
      // @ts-ignore
      max={maxUnit === unit ? maxNumValue : iSizeToSize(max, unit).number}
      min={
        minUnit === unit
          ? minNumValue
          : // @ts-ignore
            iSizeToSize(min, unit).number
      }
      addonAfter={
        <Select
          tabIndex={-1}
          value={unit}
          onChange={(newUnit) => {
            setValue(`${numValue}${newUnit}`);
          }}
          onDropdownVisibleChange={(open) => {
            // A null or undefined value doesn't have a unit info, so we need to set the value before setting the unit.
            if ((open && value === null) || value === undefined) {
              setValue(`0${unit}`);
            }
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
          suffixIcon={units.length > 1 ? undefined : null}
          open={units.length > 1 ? undefined : false}
          style={{
            cursor: units.length > 1 ? undefined : 'default',
          }}
        />
      }
      step={0} // this step applies when onStep doesn't setValue
      onStep={(afterStepValue, info) => {
        const numValueNotNull =
          _.isNull(numValue) || _.isUndefined(numValue) ? 0 : numValue;
        const index = _.sortedIndex(_.sortBy(dynamicSteps), numValueNotNull);
        let nextIndex: number;
        if (info.type === 'up') {
          if (numValueNotNull === dynamicSteps[index]) {
            nextIndex = index + 1;
          } else {
            nextIndex = index;
          }
        } else {
          nextIndex = index - 1;
        }

        const currentUnitIndex = units.indexOf(unit);
        if (!disableAutoUnit && nextIndex < 0) {
          // WHEN MOVING TO MORE Smaller Unit: change unit and number
          if (currentUnitIndex === 0) {
            // if already at min unit, set to 0
            setValue(`0${unit}`);
          } else {
            const nextValue = dynamicSteps[dynamicSteps.length - 1];
            const nextUnit = units[currentUnitIndex - 1];
            setValue(`${nextValue}${nextUnit}`);
          }
        } else if (!disableAutoUnit && nextIndex > dynamicSteps.length - 1) {
          // WHEN MOVING TO MORE Bigger Unit: change unit and number
          //  if already at max unit, step up/down by 1
          if (currentUnitIndex === units.length - 1) {
            setValue(
              `${numValueNotNull + (info.type === 'up' ? 1 : -1)}${maxUnit}`,
            );
          } else {
            const nextValue = dynamicSteps[0];
            const nextUnit = units[currentUnitIndex + 1];
            setValue(`${nextValue}${nextUnit}`);
          }
        } else {
          // WHEN, DON'T NEED TO CHANGE UNIT
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

export default DynamicUnitInputNumber;
