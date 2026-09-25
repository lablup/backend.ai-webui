/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `BAIDynamicStepInputNumber` — adapter over ui-common `StepNumberInput`
 (FR-4087). It keeps the names its call sites pass: `dynamicSteps` (with its
 default ladder), `disabled`, and `addonAfter`, a unit string shown as
 `units`. Without a `label`, the field is named by its placeholder, then by
 the translated "Select", and the label is hidden.
*/
import { nodeToAccessibleLabel } from '../helper/astryxLabel';
import { useBAIi18n } from '../hooks/useBAIi18n';
import {
  StepNumberInput,
  type StepNumberInputProps,
} from '@lablup/ui-common/components/StepNumberInput';
import React from 'react';
import type { ReactNode } from 'react';

const DEFAULT_STEPS = [
  0, 0.0625, 0.125, 0.25, 0.5, 0.75, 1, 2, 4, 8, 16, 32, 64, 128, 256, 512,
  1024, 2048, 4096, 8192, 16384, 32768, 65536,
];

export interface BAIDynamicStepInputNumberProps extends Omit<
  StepNumberInputProps,
  | 'steps'
  | 'label'
  | 'isDisabled'
  | 'units'
  | 'value'
  | 'onChange'
  | 'className'
  | 'style'
> {
  dynamicSteps?: Array<number>;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  /** A unit string, shown in the field. */
  addonAfter?: ReactNode;
  /** Accessible name. Hidden when absent (the field usually sits under one). */
  label?: string;
  /** Accepted and ignored, as before the move. */
  style?: React.CSSProperties;
  /** Accepted and ignored, as before the move. */
  className?: string;
  [key: `data-${string}`]: string | undefined;
}

const BAIDynamicStepInputNumber: React.FC<BAIDynamicStepInputNumberProps> = ({
  dynamicSteps = DEFAULT_STEPS,
  value,
  onChange,
  min,
  max,
  placeholder,
  disabled,
  addonAfter,
  label,
  isLabelHidden,
  increaseLabel,
  decreaseLabel,
  defaultValue,
}) => {
  'use memo';
  const { t } = useBAIi18n();
  return (
    <StepNumberInput
      steps={dynamicSteps}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      min={min}
      max={max}
      placeholder={placeholder}
      isDisabled={disabled}
      units={
        addonAfter === undefined ? undefined : nodeToAccessibleLabel(addonAfter)
      }
      label={label ?? placeholder ?? t('general.Select')}
      isLabelHidden={isLabelHidden ?? label === undefined}
      increaseLabel={increaseLabel}
      decreaseLabel={decreaseLabel}
    />
  );
};

export default BAIDynamicStepInputNumber;
