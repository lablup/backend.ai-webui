/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  DEFAULT_RANGE,
  RANGE_LABEL_KEYS,
  RANGE_PRESETS,
  type RangePreset,
} from './panelSettings';
import {
  MAX_WINDOW_DAYS,
  checkWindow,
  fixedWindowOf,
  parseTimeRange,
  windowRange,
} from './timeRange';
import {
  DateTimeRangeInput,
  type DateTimeRangeInputPreset,
  type DateTimeRangeInputProps,
  type DateTimeRangeInputValue,
} from '@lablup/ui-common/components/DateTimeRangeInput';
import dayjs from 'dayjs';
import React from 'react';
import { useTranslation } from 'react-i18next';

const DAY = 24 * 60 * 60 * 1000;

/** The control's local `YYYY-MM-DDTHH:MM`. */
const toLocal = (time: dayjs.ConfigType) =>
  dayjs(time).format('YYYY-MM-DDTHH:mm') as DateTimeRangeInputValue['start'];

const durationOf = (range: string) => {
  const parsed = parseTimeRange(range);
  return parsed?.kind === 'relative' ? parsed.durationMs : 0;
};

/** The last `durationMs` up to now, to the minute. */
const lastSpan = (durationMs: number): DateTimeRangeInputValue => {
  const end = dayjs().startOf('minute');
  return {
    start: toLocal(end.subtract(durationMs, 'ms')),
    end: toLocal(end),
  };
};

/** A preset as the span it covers now, a fixed window as its own ends. */
const toInputValue = (range: string): DateTimeRangeInputValue | null => {
  const window = fixedWindowOf(range);
  if (window)
    return { start: toLocal(window.after), end: toLocal(window.before) };
  const durationMs = durationOf(range);
  return durationMs ? lastSpan(durationMs) : null;
};

export interface PanelRangeSelectProps extends Omit<
  DateTimeRangeInputProps,
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'presets'
  | 'showTime'
  | 'max'
  | 'maxDuration'
  | 'hasClear'
> {
  /** A preset (`now-24h`) or a stored fixed window (`windowRange`). */
  value?: string;
  onChange?: (range: string) => void;
  /** The longest custom range, in days. */
  maxDays?: number;
}

/** A card's time range: a rolling preset, or a fixed window of at most `maxDays`. */
const PanelRangeSelect: React.FC<PanelRangeSelectProps> = ({
  value,
  onChange,
  maxDays = MAX_WINDOW_DAYS,
  ...inputProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const presets: Array<DateTimeRangeInputPreset & { range: RangePreset }> =
    RANGE_PRESETS.map((range) => ({
      range,
      label: t(RANGE_LABEL_KEYS[range]),
      getRange: () => lastSpan(durationOf(range)),
      isRelative: true,
    }));

  return (
    <DateTimeRangeInput
      {...inputProps}
      showTime
      hasClear={false}
      presets={presets}
      max={toLocal(dayjs())}
      maxDuration={maxDays * DAY}
      value={toInputValue(value ?? DEFAULT_RANGE)}
      onChange={(next, preset) => {
        // A preset is stored as its rolling range, so the card keeps moving with now.
        const picked = preset && presets.find((p) => p.label === preset.label);
        if (picked) {
          onChange?.(picked.range);
          return;
        }
        if (!next) return;
        const checked = checkWindow(
          dayjs(next.start).valueOf(),
          dayjs(next.end).valueOf(),
          Date.now(),
          maxDays,
        );
        if ('window' in checked) onChange?.(windowRange(checked.window));
      }}
    />
  );
};

export default PanelRangeSelect;
