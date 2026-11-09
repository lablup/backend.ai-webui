/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  DEFAULT_RANGE,
  RANGE_LABEL_KEYS,
  RANGE_PRESETS,
  type RangePreset,
  isRangePreset,
} from './panelSettings';
import {
  MAX_WINDOW_DAYS,
  checkWindow,
  fixedWindowOf,
  parseTimeRange,
  windowRange,
} from './timeRange';
import {
  BAIDateTimeRangeInput,
  type BAIDateTimeRangeInputPreset,
  type BAIDateTimeRangeInputProps,
  type BAIDateTimeRangeInputValue,
  BAISelect,
  useIntervalValue,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import React from 'react';
import { useTranslation } from 'react-i18next';

const DAY = 24 * 60 * 60 * 1000;

type RangePresetOption = BAIDateTimeRangeInputPreset & { range: RangePreset };

/** The control's local `YYYY-MM-DDTHH:MM`. */
const toLocal = (time: dayjs.ConfigType) =>
  dayjs(time).format('YYYY-MM-DDTHH:mm') as BAIDateTimeRangeInputValue['start'];

const durationOf = (range: string) => {
  const parsed = parseTimeRange(range);
  return parsed?.kind === 'relative' ? parsed.durationMs : 0;
};

/** The last `durationMs` up to `now`. */
const lastSpan = (
  durationMs: number,
  now: number,
): BAIDateTimeRangeInputValue => ({
  start: toLocal(now - durationMs),
  end: toLocal(now),
});

/** A preset as the span it covers now, a fixed window as its own ends. */
const toInputValue = (
  range: string,
  now: number,
): BAIDateTimeRangeInputValue | null => {
  const window = fixedWindowOf(range);
  if (window)
    return { start: toLocal(window.after), end: toLocal(window.before) };
  const durationMs = durationOf(range);
  return durationMs ? lastSpan(durationMs, now) : null;
};

export interface PanelRangeSelectProps extends Omit<
  BAIDateTimeRangeInputProps,
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
  // One clock for `max`, the presets and the value, so a preset still matches its span after the minute turns.
  const now = useIntervalValue(
    () => dayjs().startOf('minute').valueOf(),
    10_000,
  );
  const range = value ?? DEFAULT_RANGE;
  const presets: Array<RangePresetOption> = RANGE_PRESETS.map((preset) => ({
    range: preset,
    label: t(RANGE_LABEL_KEYS[preset]),
    getRange: () => lastSpan(durationOf(preset), now),
    isRelative: true,
  }));

  if (maxDays <= 0) {
    // Presets only: no calendar to pick a window from.
    return (
      <BAISelect
        showSearch={false}
        size={inputProps.size === 'sm' ? 'small' : undefined}
        id={inputProps.id}
        aria-label={inputProps['aria-label']}
        disabled={inputProps.disabled || inputProps.isDisabled}
        options={presets.map((preset) => ({
          value: preset.range,
          label: preset.label,
        }))}
        value={isRangePreset(range) ? range : DEFAULT_RANGE}
        onChange={(next: string | null) => {
          if (next) onChange?.(next);
        }}
      />
    );
  }

  return (
    <BAIDateTimeRangeInput
      {...inputProps}
      // A new value from outside (reset) drops the preset label the control kept.
      key={range}
      showTime
      hasClear={false}
      presets={presets}
      max={toLocal(now)}
      maxDuration={maxDays * DAY}
      value={toInputValue(range, now)}
      onChange={(next, preset) => {
        // A preset is stored as its rolling range, so the card keeps moving with now.
        if (preset) {
          onChange?.((preset as RangePresetOption).range);
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
