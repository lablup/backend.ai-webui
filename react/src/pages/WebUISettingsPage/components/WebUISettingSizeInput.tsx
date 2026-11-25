/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { WebUISizeSetting } from '../../../helper/webuiSettings';
import {
  toPlaceholder,
  toSizeString,
  toStoredSize,
} from '../helper/sizeSetting';
import { useUnsetUnlimitedToggle } from '../hooks/useUnsetUnlimitedToggle';
import {
  BAICheckboxInput,
  BAIDynamicUnitInputNumber,
  BAIFlex,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface WebUISettingSizeInputProps {
  label: string;
  /** The saved number; `undefined` when unset, which shows `defaultValue` as the placeholder. */
  value: number | undefined;
  defaultValue: number | undefined;
  size: WebUISizeSetting;
  /** An Unlimited toggle that removes the key (`WebUISettingDefinition.isUnlimitedWhenUnset`). */
  isUnlimitedWhenUnset?: boolean;
  width: number;
  /** `undefined` when the field is cleared, which resets the row. */
  onChange: (value: number | undefined) => void;
}

/** A stored size number edited as `"<n><unit>"`, with an optional server-limit, Automatic or Unlimited toggle. */
const WebUISettingSizeInput: React.FC<WebUISettingSizeInputProps> = ({
  label,
  value: savedValue,
  defaultValue,
  size,
  isUnlimitedWhenUnset = false,
  width,
  onChange,
}) => {
  'use memo';
  const { t } = useTranslation();
  const value = savedValue ?? defaultValue;
  // Unticking a toggle stores nothing until a size is entered.
  const [isEnteringLimit, setIsEnteringLimit] = useState(false);
  const [prevValue, setPrevValue] = useState(value);
  if (prevValue !== value) {
    setPrevValue(value);
    setIsEnteringLimit(false);
  }
  const hasValueToggle =
    size.unlimitedValue !== undefined && !!size.toggleLabel;
  const unset = useUnsetUnlimitedToggle(isUnlimitedWhenUnset, value);
  const hasToggle = hasValueToggle || isUnlimitedWhenUnset;
  const isUnlimited = isUnlimitedWhenUnset
    ? unset.isUnlimited
    : hasValueToggle && value === size.unlimitedValue && !isEnteringLimit;

  return (
    <BAIFlex direction="column" align="start" gap="xs">
      {hasToggle && (
        <BAICheckboxInput
          size="sm"
          value={isUnlimited}
          onChange={(checked) => {
            if (isUnlimitedWhenUnset) {
              unset.toggle(checked);
              if (checked) onChange(undefined);
              return;
            }
            setIsEnteringLimit(!checked);
            if (checked) onChange(size.unlimitedValue as number);
          }}
        >
          {t(
            `webuiSettings.${isUnlimitedWhenUnset ? 'Unlimited' : size.toggleLabel}`,
          )}
        </BAICheckboxInput>
      )}
      <BAIDynamicUnitInputNumber
        label={label}
        isLabelHidden
        width={width}
        units={size.units}
        defaultUnit={size.defaultUnit}
        min={size.min}
        max={size.max}
        disabled={isUnlimited}
        value={
          savedValue === undefined ||
          isUnlimited ||
          (hasValueToggle && value === size.unlimitedValue)
            ? null
            : toSizeString(savedValue, size)
        }
        placeholder={
          defaultValue === undefined ||
          (hasValueToggle && defaultValue === size.unlimitedValue)
            ? undefined
            : toPlaceholder(defaultValue, size)
        }
        onChange={(next) => {
          const stored = toStoredSize(next, size);
          if (stored > 0) {
            onChange(stored);
            return;
          }
          // A commit that stores nothing ends the entry.
          unset.endEntry();
          if (_.isEmpty(next)) onChange(undefined);
        }}
      />
    </BAIFlex>
  );
};

export default WebUISettingSizeInput;
