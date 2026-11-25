/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { WebUISettingDefinition } from '../../../helper/webuiSettings';
import { useUnsetUnlimitedToggle } from '../hooks/useUnsetUnlimitedToggle';
import { BAICheckboxInput, BAIFlex, BAINumberInput } from 'backend.ai-ui';
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

/** A plain number setting, with an Unlimited toggle when the definition has `isUnlimitedWhenUnset`. */
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
  const hasToggle = !!definition.isUnlimitedWhenUnset;
  const value = savedValue ?? defaultValue;
  const { isUnlimited, toggle, endEntry } = useUnsetUnlimitedToggle(
    hasToggle,
    value,
  );

  return (
    <BAIFlex direction="column" align="start" gap="xs">
      {hasToggle && (
        <BAICheckboxInput
          size="sm"
          value={isUnlimited}
          onChange={(checked) => {
            toggle(checked);
            if (checked) onChange(undefined);
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
        value={savedValue === undefined || isUnlimited ? null : savedValue}
        placeholder={
          defaultValue === undefined ? undefined : String(defaultValue)
        }
        min={definition.min}
        max={definition.max}
        isIntegerOnly={definition.isInteger}
        units={definition.unit}
        onChange={(next) => {
          if (next === null) endEntry();
          onChange(next === null ? undefined : next);
        }}
      />
    </BAIFlex>
  );
};

export default WebUISettingNumberInput;
