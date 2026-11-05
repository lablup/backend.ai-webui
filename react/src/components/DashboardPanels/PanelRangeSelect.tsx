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
  rangeToDateTimeFilter,
  windowRange,
} from './timeRange';
import type { ISODateTimeString } from '@lablup/ui-common/DateTimeInput';
import {
  BAIDateTimeRangeInput,
  type BAIDateTimeRangeInputProps,
  type BAIDateTimeRangeInputValue,
  useIntervalValue,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';

const MINUTE = 60_000;
const MAX_DURATION_MS = MAX_WINDOW_DAYS * 24 * 60 * MINUTE;

const toInput = (time: number | string) =>
  dayjs(time).format('YYYY-MM-DDTHH:mm') as ISODateTimeString;

/** The range's window as of `now`, in the input's local minute strings. */
export const inputValueOf = (
  range: string,
  now: number,
): BAIDateTimeRangeInputValue => {
  const window = rangeToDateTimeFilter(range, now);
  return { start: toInput(window.after), end: toInput(window.before) };
};

const isSameRange = (
  a: BAIDateTimeRangeInputValue | undefined,
  b: BAIDateTimeRangeInputValue,
) => a?.start === b.start && a?.end === b.end;

/**
 * The setting for a picked range: the preset it equals (as offered, or as of
 * `now`), else a fixed window; null for one `checkWindow` rejects.
 */
export const storedRangeOf = (
  next: BAIDateTimeRangeInputValue,
  now: number,
  offered: ReadonlyMap<RangePreset, BAIDateTimeRangeInputValue> = new Map(),
): string | null => {
  const preset = RANGE_PRESETS.find(
    (candidate) =>
      isSameRange(offered.get(candidate), next) ||
      isSameRange(inputValueOf(candidate, now), next),
  );
  if (preset) return preset;
  const result = checkWindow(
    dayjs(next.start).valueOf(),
    dayjs(next.end).valueOf(),
    Date.now(),
  );
  return 'window' in result ? windowRange(result.window) : null;
};

export interface PanelRangeSelectProps extends Omit<
  BAIDateTimeRangeInputProps,
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'presets'
  | 'min'
  | 'max'
  | 'maxDuration'
  | 'hasClear'
> {
  /** A preset (`now-24h`) or a fixed window (`windowRange`). */
  value?: string;
  onChange?: (range: string) => void;
}

/**
 * A card's time range as a date-time range input. A pick equal to a preset
 * stores the preset, so it keeps rolling; any other pick stores a fixed window.
 */
const PanelRangeSelect: React.FC<PanelRangeSelectProps> = ({
  value,
  onChange,
  ...inputProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const range = value ?? DEFAULT_RANGE;
  // The current minute, so presets, the end cap and a rolling value agree.
  const now = useIntervalValue(
    () => Math.floor(Date.now() / MINUTE) * MINUTE,
    10_000,
  );
  // What each preset last offered, to recognise it when it comes back in onChange.
  const offeredRef = useRef(new Map<RangePreset, BAIDateTimeRangeInputValue>());

  return (
    <BAIDateTimeRangeInput
      hourFormat="24h"
      {...inputProps}
      value={inputValueOf(range, now)}
      max={toInput(now)}
      maxDuration={MAX_DURATION_MS}
      hasClear={false}
      presets={RANGE_PRESETS.map((preset) => ({
        label: t(RANGE_LABEL_KEYS[preset]),
        getRange: () => {
          const offered = inputValueOf(preset, now);
          offeredRef.current.set(preset, offered);
          return offered;
        },
      }))}
      onChange={(next) => {
        const stored = next && storedRangeOf(next, now, offeredRef.current);
        if (stored) onChange?.(stored);
      }}
    />
  );
};

export default PanelRangeSelect;
