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
  defaultValue: number;
  size: WebUISizeSetting;
  width: number;
  /** `undefined` when the field is cleared, which resets the row. */
  onChange: (value: number | undefined) => void;
}

/** A stored size number edited as `"<n><unit>"`, with an optional server-limit or Automatic toggle. */
const WebUISettingSizeInput: React.FC<WebUISettingSizeInputProps> = ({
  label,
  value: savedValue,
  defaultValue,
  size,
  width,
  onChange,
}) => {
  'use memo';
  const { t } = useTranslation();
  const value = savedValue ?? defaultValue;
  // Unticking Unlimited stores nothing until a size is entered.
  const [isEnteringLimit, setIsEnteringLimit] = useState(false);
  const [prevValue, setPrevValue] = useState(value);
  if (prevValue !== value) {
    setPrevValue(value);
    setIsEnteringLimit(false);
  }
  const hasToggle = size.unlimitedValue !== undefined && !!size.toggleLabel;
  const isUnlimited =
    hasToggle && value === size.unlimitedValue && !isEnteringLimit;

  return (
    <BAIFlex direction="column" align="start" gap="xs">
      {hasToggle && (
        <BAICheckboxInput
          size="sm"
          value={isUnlimited}
          onChange={(checked) => {
            setIsEnteringLimit(!checked);
            if (checked) onChange(size.unlimitedValue as number);
          }}
        >
          {t(`webuiSettings.${size.toggleLabel}`)}
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
          (hasToggle && value === size.unlimitedValue)
            ? null
            : toSizeString(value, size)
        }
        placeholder={
          hasToggle && defaultValue === size.unlimitedValue
            ? undefined
            : toPlaceholder(defaultValue, size)
        }
        onChange={(next) => {
          const stored = toStoredSize(next, size);
          if (stored > 0) onChange(stored);
          else if (_.isEmpty(next)) onChange(undefined);
        }}
      />
    </BAIFlex>
  );
};

export default WebUISettingSizeInput;
