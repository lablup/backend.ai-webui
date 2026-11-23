/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { WebUISettingDefinition } from '../../../helper/webuiSettings';
import { BAICheckboxInput, BAIFlex, BAINumberInput } from 'backend.ai-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface WebUISettingNumberInputProps {
  label: string;
  /** The saved number; `undefined` when unset, which shows `defaultValue` as the placeholder. */
  value: number | undefined;
  defaultValue: number | undefined;
  definition: WebUISettingDefinition;
  width: number;
  /** `undefined` when the field is cleared, which resets the row. */
  onChange: (value: number | undefined) => void;
}

/** A plain number setting, with an Unlimited toggle when the definition has `unlimitedValue`. */
const WebUISettingNumberInput: React.FC<WebUISettingNumberInputProps> = ({
  label,
  value: savedValue,
  defaultValue,
  definition,
  width,
  onChange,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { unlimitedValue } = definition;
  const hasToggle = unlimitedValue !== undefined;
  const value = savedValue ?? defaultValue;
  // Unticking Unlimited stores nothing until a number is entered.
  const [isEnteringLimit, setIsEnteringLimit] = useState(false);
  const [prevValue, setPrevValue] = useState(value);
  if (prevValue !== value) {
    setPrevValue(value);
    setIsEnteringLimit(false);
  }
  const isUnlimited = hasToggle && value === unlimitedValue && !isEnteringLimit;
  const isDefaultUnlimited = hasToggle && defaultValue === unlimitedValue;

  return (
    <BAIFlex direction="column" align="start" gap="xs">
      {hasToggle && (
        <BAICheckboxInput
          size="sm"
          value={isUnlimited}
          onChange={(checked) => {
            setIsEnteringLimit(!checked);
            if (checked) onChange(unlimitedValue);
          }}
        >
          {t('webuiSettings.Unlimited')}
        </BAICheckboxInput>
      )}
      {/* An unset setting shows its default as the placeholder, so the clear
          button empties the field instead of refilling the default. */}
      <BAINumberInput
        aria-label={label}
        width={width}
        disabled={isUnlimited}
        value={
          savedValue === undefined ||
          isUnlimited ||
          (hasToggle && value === unlimitedValue)
            ? null
            : savedValue
        }
        placeholder={
          isDefaultUnlimited ? undefined : String(defaultValue ?? '')
        }
        min={
          // Unlimited is reached only through the checkbox on a whole-number row.
          hasToggle && definition.isInteger && definition.min === unlimitedValue
            ? definition.min + 1
            : definition.min
        }
        max={definition.max}
        isIntegerOnly={definition.isInteger}
        units={definition.unit}
        onChange={(next) => {
          // A commit that leaves the stored value as it is still ends the entry.
          if (next === null || next === unlimitedValue) {
            setIsEnteringLimit(false);
          }
          onChange(next === null ? undefined : next);
        }}
      />
    </BAIFlex>
  );
};

export default WebUISettingNumberInput;
