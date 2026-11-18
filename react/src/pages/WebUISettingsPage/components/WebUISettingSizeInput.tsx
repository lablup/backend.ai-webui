/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { convertToBinaryUnit } from '../../../helper';
import type { WebUISizeSetting } from '../../../helper/webuiSettings';
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

  const toSizeString = (stored: number) => {
    const auto = convertToBinaryUnit(`${stored}${size.storedUnit}`, 'auto');
    const unit = _.includes(size.units, auto?.unit)
      ? auto?.unit
      : size.units[0];
    return convertToBinaryUnit(
      `${stored}${size.storedUnit}`,
      unit as (typeof size.units)[number],
    )?.value;
  };
  const toStored = (sizeString: string) =>
    Math.round(
      convertToBinaryUnit(sizeString, size.storedUnit, 6)?.number ?? 0,
    );

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
            : toSizeString(value)
        }
        onChange={(next) => {
          const stored = _.isEmpty(next) ? 0 : toStored(next);
          if (stored > 0) onChange(stored);
        }}
      />
    </BAIFlex>
  );
};

export default WebUISettingSizeInput;
