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

 PILOT-DECISION — **`onStep` is replaced by explicit ladder controls PLUS a
 keydown handler.** Same call as the sibling `BAIDynamicStepInputNumber`; the
 rationale (Astryx's native spinner would silently linearise the ladder AND the
 unit carry) is written up in `astryxNumberStepper.tsx`. antd's `onStep` fired
 for BOTH the spinner click and ↑/↓, so the buttons alone were only half of it:
 `handleKeyDown` below cancels the browser's own linear step and runs the same
 ladder, which is what makes ↑ from `4g` land on `8g` and ↑ from `512g` carry
 to `1t`.

 RESTORED — **typing a unit letter switches the unit.** antd's `InputNumber` is
 a TEXT field, so `"512m"` reached a raw `input` listener that re-parsed it. A
 native `<input type="number">` discards the letter before any value-level
 listener can see it (which is why the original listener was deleted), but the
 KEY event still fires: `handleKeyDown` matches the character against `units`
 and re-serialises the current number under the new unit. Same affordance,
 reached through the only event that survives on a number field — and it now
 covers every unit in `units`, not just the `m|g` the old regex hard-coded.

 PILOT-DECISION — **`stringMode` is dropped, and nothing is lost here.**
 MAPPING §3.17 lists it as NONE. It existed so antd's `InputNumber` could hold
 big values without float error; this component already parses/serialises the
 string itself (`parseValueWithUnit`), and the numeric half is a size in a
 chosen unit — never large enough to exceed `Number.MAX_SAFE_INTEGER`.

 RESTORED — **an out-of-range entry is clamped on blur.** antd's `InputNumber`
 clamped to `min`/`max` when the field lost focus; Astryx's `NumberInput`
 instead REJECTS an out-of-range string outright (`parseNumberInput` returns
 `null` past either bound), so the entry silently reverted to the previous
 value and the user's intent was thrown away. `handleBlur` reads the raw field
 text — the only place the rejected entry still exists — and commits the
 clamped value, restoring antd's contract.
*/
import { convertToBinaryUnit, parseValueWithUnit, SizeUnit } from '../helper';
import { useControllableValue, usePrevious } from '../hooks';
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

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    // The raw field text is the only surviving trace of an entry Astryx's
    // `NumberInput` rejected for being out of range (antd would have clamped
    // it). React 19 does not pool events, so reading it here is safe.
    const rawText = (event.target as HTMLInputElement).value;
    const typed = rawText.trim() === '' ? NaN : Number(rawText);
    let committed = numValue;

    if (
      Number.isFinite(typed) &&
      typed !== numValue &&
      (_.isNumber(minNumValueForCurrentUnit) ||
        _.isNumber(maxNumValueForCurrentUnit))
    ) {
      const clamped = _.clamp(
        typed,
        _.isNumber(minNumValueForCurrentUnit)
          ? minNumValueForCurrentUnit
          : -Infinity,
        _.isNumber(maxNumValueForCurrentUnit)
          ? maxNumValueForCurrentUnit
          : Infinity,
      );
      if (clamped !== numValue) {
        committed = clamped;
        setValue(`${clamped}${unit}`);
      }
    }

    if (!_.isNumber(roundStep) || roundStep <= 0) return;
    const nextRoundedNumValue =
      Math.round((committed ?? 0) / roundStep) * roundStep;
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

  /**
   * antd drove BOTH of this component's keyboard affordances; a native
   * `<input type="number">` drives neither, so they are reinstated here.
   *
   *  - ↑/↓ ran `onStep` with `step={0}`, i.e. the LADDER — the browser would
   *    instead add/subtract 1. `preventDefault` cancels the native step before
   *    it can fire an `input` event.
   *  - a unit letter (`m`, `g`, `t`, `p`, …) switched the unit in place. The
   *    number field discards the character, so the KEY is what we match on.
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      handleStep(event.key === 'ArrowUp' ? 'up' : 'down');
      return;
    }
    // Modifier chords are shortcuts (Ctrl+V …), never unit entry.
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key.length !== 1) return;
    const typedUnit = _.find(
      units,
      (candidate) => candidate.toLowerCase() === event.key.toLowerCase(),
    );
    if (!typedUnit) return;
    event.preventDefault();
    if (typedUnit !== unit) {
      setValue(`${numValue ?? 0}${typedUnit}`);
    }
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
        onKeyDown={handleKeyDown}
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
        // QA-FINDINGS Q-34 — the unit Selector sits immediately to the right
        // of the number field, so the overlay behaviour Astryx applies when
        // `placement == null && !hasSearch` puts the option list on top of the
        // unit the user currently has selected. Name the placement so the panel
        // takes the standard layer position (below, offset 0).
        <Selector
          placement="below"
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
