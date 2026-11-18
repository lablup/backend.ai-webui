/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { WebUISizeSetting } from '../../../helper/webuiSettings';
import { toSizeString, toStoredSize } from '../helper/sizeSetting';
import {
  BAICheckboxInput,
  BAIDynamicUnitInputNumber,
  BAIFlex,
} from 'backend.ai-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface WebUISettingSizeInputProps {
  label: string;
  /** The effective stored number: the saved value, else the default. */
  value: number;
  size: WebUISizeSetting;
  width: number;
  onChange: (value: number) => void;
}

/** A stored size number edited as `"<n><unit>"`, with an Unlimited or Automatic toggle. */
const WebUISettingSizeInput: React.FC<WebUISettingSizeInputProps> = ({
  label,
  value,
  size,
  width,
  onChange,
}) => {
  'use memo';
  const { t } = useTranslation();
  // Unticking Unlimited stores nothing until a size is entered.
  const [isEnteringLimit, setIsEnteringLimit] = useState(false);
  const [prevValue, setPrevValue] = useState(value);
  if (prevValue !== value) {
    setPrevValue(value);
    setIsEnteringLimit(false);
  }
  const isUnlimited = value === size.unlimitedValue && !isEnteringLimit;

  return (
    <BAIFlex direction="column" align="start" gap="xs">
      <BAICheckboxInput
        size="sm"
        value={isUnlimited}
        onChange={(checked) => {
          setIsEnteringLimit(!checked);
          if (checked) onChange(size.unlimitedValue);
        }}
      >
        {t(`webuiSettings.${size.toggleLabel}`)}
      </BAICheckboxInput>
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
          isUnlimited || value === size.unlimitedValue
            ? null
            : toSizeString(value, size)
        }
        onChange={(next) => {
          const stored = toStoredSize(next, size);
          if (stored > 0) onChange(stored);
        }}
      />
    </BAIFlex>
  );
};

export default WebUISettingSizeInput;
