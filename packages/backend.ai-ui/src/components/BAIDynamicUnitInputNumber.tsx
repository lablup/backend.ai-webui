/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `BAIDynamicUnitInputNumber` on Astryx (to-astryx phase 3, wave 2 / W2-D).

 The `"<number><unit>"` size field (e.g. `"4g"`). antd built it from
 `Space.Compact` + `InputNumber stringMode onStep` + `Select`; every one of
 those four pieces needed a different answer (MAPPING §3.17, §3.1, §4):

   `Space.Compact`            -> `InputGroup` (the welded input row)
   `InputNumber`              -> `NumberInput`
   `InputNumber.onStep`       -> NONE -> explicit ladder controls, see below
   `InputNumber.stringMode`   -> NONE -> the string lives in this component
   `Select` (unit)            -> `Selector` (static options, <5 of them)
   `Select.suffixIcon={null}` -> NONE -> the single-unit case renders no
                                 selector at all, which is what that hack meant
   `Space.Addon`              -> the addon nodes render inside the `InputGroup`

 The public contract is unchanged: `value` is still the `"4g"` string,
 `onChange` still emits one, and `dynamicSteps` / `units` / `min` / `max` /
 `roundStep` / `addonPrefix` / `addonSuffix` / `defaultUnit` / `disableAutoUnit`
 keep their meaning. The unit-carry arithmetic (step past the top of the ladder
 -> next unit up, past the bottom -> next unit down) is ported verbatim.

 PILOT-DECISION — **`onStep` is replaced by explicit ladder controls.** Same
 call as the sibling `BAIDynamicStepInputNumber`; the rationale (Astryx's
 native spinner would silently linearise the ladder AND the unit carry) is
 written up in `astryxNumberStepper.tsx`.

 PILOT-DECISION — **`stringMode` is dropped, and nothing is lost here.**
 MAPPING §3.17 lists it as NONE. It existed so antd's `InputNumber` could hold
 big values without float error; this component already parses/serialises the
 string itself (`parseValueWithUnit`), and the numeric half is a size in a
 chosen unit — never large enough to exceed `Number.MAX_SAFE_INTEGER`.

 PILOT-DECISION — **the `input`-event listener on the raw DOM node is
 deleted.** It watched for a user typing `"512m"` INTO the number field and
 re-parsed it. Astryx's `NumberInput` is a native `<input type="number">`,
 which rejects the trailing letter at the DOM level, so the listener could
 never fire; the unit is chosen in the adjacent `Selector`, which is the
 affordance that actually works.
*/
import { convertToBinaryUnit, parseValueWithUnit, SizeUnit } from '../helper';
import { useBAIi18n } from '../hooks/useBAIi18n';
import {
  AstryxNumberStepper,
  nextLadderIndex,
  type StepDirection,
} from './astryxNumberStepper';
import { InputGroup } from '@astryxdesign/core/InputGroup';
import { NumberInput } from '@astryxdesign/core/NumberInput';
import { Selector } from '@astryxdesign/core/Selector';
import { HStack } from '@astryxdesign/core/Stack';
import { useControllableValue, usePrevious } from 'ahooks';
import * as _ from 'lodash-es';
import React from 'react';
import type { CSSProperties, ReactNode } from 'react';

/** antd `SizeType` -> Astryx's control size scale. */
const ASTRYX_SIZE = {
  small: 'sm',
  middle: 'md',
  large: 'lg',
} as const;

export interface BAIDynamicUnitInputNumberProps {
  dynamicSteps?: Array<number>;
  disableAutoUnit?: boolean;
  max?: string;
  min?: string;
  value?: string | null | undefined;
  units?: Array<string>;
  roundStep?: number;
  onChange?: (value: string) => void;
  addonPrefix?: ReactNode;
  addonSuffix?: ReactNode;
  defaultUnit?: string;
  disabled?: boolean;
  placeholder?: string;
  /** antd's `SizeType`, kept for the call sites that already pass it. */
  size?: 'small' | 'middle' | 'large';
  /** Accessible name. Hidden when absent (the field usually sits under one). */
  label?: string;
  isLabelHidden?: boolean;
  style?: CSSProperties;
  className?: string;
  [key: `data-${string}`]: string | undefined;
}

const BAIDynamicUnitInputNumber: React.FC<BAIDynamicUnitInputNumberProps> = ({
  dynamicSteps = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512],
  units = ['m', 'g', 't', 'p'],
  disableAutoUnit = false,
  min = '0m',
  max = '300p',
  roundStep,
  addonPrefix,
  addonSuffix,
  defaultUnit,
  disabled,
  placeholder,
  size,
  label,
  isLabelHidden,
  style,
  className,
  ...restProps
}) => {
  const { t } = useBAIi18n();
  const [value, setValue] = useControllableValue<string | null | undefined>(
    restProps,
    {
      defaultValue: undefined,
    },
  );
  const [numValue, unitFromValue] =
    value === null || value === undefined
      ? [null, null]
      : parseValueWithUnit(value);
  const previousUnit = usePrevious(unitFromValue);
  const validDefaultUnit =
    defaultUnit && units.includes(defaultUnit) ? defaultUnit : undefined;
  const unit = unitFromValue || previousUnit || validDefaultUnit || units[0];

  const [minNumValue, minUnit] = parseValueWithUnit(min);
  const [maxNumValue, maxUnit] = parseValueWithUnit(max);

  const minNumValueForCurrentUnit = convertToBinaryUnit(
    min,
    unit as SizeUnit,
  )?.number;
  const maxNumValueForCurrentUnit = convertToBinaryUnit(
    max,
    unit as SizeUnit,
  )?.number;

  const handleStep = (direction: StepDirection) => {
    const numValueNotNull = _.isNil(numValue) ? 0 : numValue;
    const nextIndex = nextLadderIndex(dynamicSteps, numValueNotNull, direction);
    const currentUnitIndex = units.indexOf(unit);

    if (!disableAutoUnit && nextIndex < 0) {
      // WHEN MOVING TO A SMALLER UNIT: change unit and number
      if (currentUnitIndex === 0) {
        setValue(`0${unit}`);
      } else {
        setValue(
          `${dynamicSteps[dynamicSteps.length - 1]}${units[currentUnitIndex - 1]}`,
        );
      }
    } else if (!disableAutoUnit && nextIndex > dynamicSteps.length - 1) {
      // WHEN MOVING TO A BIGGER UNIT: change unit and number; at the top unit
      // there is nowhere to carry to, so step by 1.
      if (currentUnitIndex === units.length - 1) {
        setValue(
          `${numValueNotNull + (direction === 'up' ? 1 : -1)}${maxUnit}`,
        );
      } else {
        setValue(`${dynamicSteps[0]}${units[currentUnitIndex + 1]}`);
      }
    } else if (nextIndex >= 0 && nextIndex < dynamicSteps.length) {
      // WHEN THE UNIT DOES NOT CHANGE
      let nextNumValue = dynamicSteps[nextIndex];
      if (minUnit === unit && nextNumValue < minNumValue) {
        nextNumValue = minNumValue;
      } else if (maxUnit === unit && nextNumValue > maxNumValue) {
        nextNumValue = maxNumValue;
      }
      setValue(`${nextNumValue}${unit}`);
    }
  };

  const handleBlur = () => {
    if (!_.isNumber(roundStep) || roundStep <= 0) return;
    const nextRoundedNumValue =
      Math.round((numValue ?? 0) / roundStep) * roundStep;
    if (isNaN(nextRoundedNumValue)) return;
    if (
      (minNumValueForCurrentUnit &&
        minNumValueForCurrentUnit >= nextRoundedNumValue) ||
      (maxNumValueForCurrentUnit &&
        maxNumValueForCurrentUnit <= nextRoundedNumValue)
    ) {
      return;
    }
    const decimalCount = roundStep.toString().split('.')[1]?.length || 0;
    setValue(`${nextRoundedNumValue.toFixed(decimalCount)}${unit}`);
  };

  const accessibleLabel = label ?? placeholder ?? t('general.Select');

  return (
    <InputGroup
      className={['bai-number-stepper', className ?? ''].join(' ').trim()}
      label={accessibleLabel}
      isLabelHidden={isLabelHidden ?? label === undefined}
      isDisabled={disabled}
      size={size ? ASTRYX_SIZE[size] : undefined}
      style={style}
    >
      {addonPrefix ? <HStack align="center">{addonPrefix}</HStack> : null}
      <NumberInput
        label={accessibleLabel}
        isLabelHidden
        value={numValue}
        onChange={(next) =>
          setValue(_.isNil(next) ? undefined : `${next}${unit}`)
        }
        onBlur={handleBlur}
        // TODO: when min and max carry different units they should be
        // converted first — carried over from the antd implementation.
        max={
          maxUnit === unit
            ? maxNumValue
            : convertToBinaryUnit(max, unit as SizeUnit)?.number
        }
        min={
          minUnit === unit
            ? minNumValue
            : convertToBinaryUnit(min, unit as SizeUnit)?.number
        }
        placeholder={placeholder}
        isDisabled={disabled}
        width="100%"
      />
      <AstryxNumberStepper
        onStep={handleStep}
        isDisabled={disabled}
        increaseLabel={t('general.Increase')}
        decreaseLabel={t('general.Decrease')}
      />
      {/* A single available unit is a static label, not a choice — antd faked
          that with `suffixIcon={null} open={false}` on a Select. */}
      {units.length > 1 ? (
        <Selector
          label={t('general.Unit')}
          isLabelHidden
          value={unit}
          options={units.map((u) => ({
            value: u,
            label: `${u.toUpperCase()}iB`,
          }))}
          onChange={(newUnit) => setValue(`${numValue ?? 0}${newUnit}`)}
          isDisabled={disabled}
          width={96}
        />
      ) : (
        <HStack align="center">{`${unit.toUpperCase()}iB`}</HStack>
      )}
      {addonSuffix ? <HStack align="center">{addonSuffix}</HStack> : null}
    </InputGroup>
  );
};

export default BAIDynamicUnitInputNumber;
