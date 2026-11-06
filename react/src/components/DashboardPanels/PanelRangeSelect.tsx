/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  DEFAULT_RANGE,
  RANGE_LABEL_KEYS,
  RANGE_PRESETS,
  formatWindowLabel,
} from './panelSettings';
import { BAISelect, type BAISelectProps } from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface PanelRangeSelectProps extends Omit<
  BAISelectProps,
  'value' | 'onChange' | 'options' | 'mode'
> {
  /** A preset (`now-24h`) or a stored fixed window (`windowRange`). */
  value?: string;
  onChange?: (range: string) => void;
}

/** A card's time range: the presets, plus a fixed window the board already holds. */
const PanelRangeSelect: React.FC<PanelRangeSelectProps> = ({
  value,
  onChange,
  ...selectProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const range = value ?? DEFAULT_RANGE;
  const windowLabel = formatWindowLabel(range);

  return (
    <BAISelect
      showSearch={false}
      {...selectProps}
      options={[
        ...RANGE_PRESETS.map((preset) => ({
          value: preset,
          label: t(RANGE_LABEL_KEYS[preset]),
        })),
        ...(windowLabel ? [{ value: range, label: windowLabel }] : []),
      ]}
      value={range}
      onChange={(next: string | null) => {
        if (next) onChange?.(next);
      }}
    />
  );
};

export default PanelRangeSelect;
