/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `BAIDynamicUnitInputNumber` — the `"<number><unit>"` size field (`"4g"`).
 It stays in BUI (FR-4087): the value is Backend.AI's size notation and the
 units are its binary memory units (`convertToBinaryUnit`, `m`/`g`/`t`/`p`
 shown as MiB/GiB/…), which are not a product-neutral contract.

 The stepper is ui-common's `NumberStepper`, on a non-linear ladder with a
 unit carry: stepping past the top of `dynamicSteps` moves to the next unit
 up, past the bottom to the next unit down. `handleKeyDown` runs the same
 ladder for ArrowUp/ArrowDown (NumberInput's own stepping is linear) and
 switches the unit when a unit letter is typed. `handleBlur` clamps an
 out-of-range entry, which `NumberInput` would otherwise reject outright.
*/
import { convertToBinaryUnit, parseValueWithUnit, SizeUnit } from '../helper';
import { useControllableValue, usePrevious } from '../hooks';
import { useBAIi18n } from '../hooks/useBAIi18n';
import { InputGroup, InputGroupText } from '@lablup/ui-common/InputGroup';
import { NumberInput } from '@lablup/ui-common/NumberInput';
import { Selector } from '@lablup/ui-common/Selector';
import {
  NumberStepper,
  getNextStepIndex,
  type StepDirection,
} from '@lablup/ui-common/components/StepNumberInput';
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
    const nextIndex = getNextStepIndex(
      dynamicSteps,
      numValueNotNull,
      direction,
    );
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
   * antd drove BOTH of this component's keyboard affordances; `NumberInput`
   * drives neither, so they are reinstated here.
   *
   *  - ↑/↓ ran `onStep` with `step={0}`, i.e. the LADDER — `NumberInput`'s
   *    own keyboard stepping would instead add/subtract 1. `preventDefault`
   *    cancels it before it can fire an `input` event.
   *  - a unit letter (`m`, `g`, `t`, `p`, …) switched the unit in place.
   *    `preventDefault` keeps the letter out of the numeric text.
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
      className={className}
      label={accessibleLabel}
      isLabelHidden={isLabelHidden ?? label === undefined}
      isDisabled={disabled}
      size={size ? ASTRYX_SIZE[size] : undefined}
      style={style}
    >
      {addonPrefix ? <InputGroupText>{addonPrefix}</InputGroupText> : null}
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
      <NumberStepper onStep={handleStep} isDisabled={disabled} />
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
          // Measured: in a group the trigger resolves to `width: 100%`, so it
          // claims the whole row and the number field shrinks to its flex basis.
          // Size the unit to its own content and let the number field take the
          // rest — antd's `Select` in a `Space.Compact` behaved this way.
          style={{ flex: '0 0 auto', width: 'auto' }}
        />
      ) : (
        <InputGroupText>{`${unit.toUpperCase()}iB`}</InputGroupText>
      )}
      {addonSuffix ? <InputGroupText>{addonSuffix}</InputGroupText> : null}
    </InputGroup>
  );
};

export default BAIDynamicUnitInputNumber;
