/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 antd `DatePicker showTime` -> Astryx `DateTimeInput` (MAPPING §3.13, which
 CORRECTS ticket 04's "no Date family" — `DateInput` / `DateTimeInput` /
 `DateRangeInput` / `TimeInput` / `Calendar` all ship in core 0.3.0).

 FRONTIER: this component exists precisely to be the dayjs<->string boundary,
 and that is now also the dayjs<->`ISODateTimeString` boundary. The PUBLIC prop
 surface stays what the single consumer (`SessionLauncherPage`, inside a
 `Form.Item name={['batch','scheduleDate']}`) already passes — `disabled`,
 `showTime`, `localFormat`, `disabledDate(dayjs)` — so that file stays at zero
 diff. antd's `PickerProps<Dayjs>` / `GetRef` type imports are gone with the
 render (§6: a type-only antd import is still an antd import).

 PILOT-DECISIONs:
  - `showTime` becomes a NO-OP prop. `DateTimeInput` always renders the time
    portion; the antd picker needed telling. Kept for source compatibility
    rather than editing the consumer (frontier rule).
  - `localFormat` keeps its meaning — it selects between `dayjs().format()`
    (local, with offset) and `.tz().toISOString()` (UTC) on the way OUT. On the
    way IN the ISO string is parsed by dayjs either way.
  - antd's `ref` (a `GetRef<typeof DatePicker>` imperative handle) is DROPPED.
    Astryx uses a `handleRef` convention rather than `ref` + `GetRef`
    (MAPPING §6.2), and no consumer holds this ref.
  - `disabledDate(dayjs)` is translated, not re-typed: Astryx's
    `dateConstraints` receives a native `Date`, which is wrapped back into a
    `dayjs` before the consumer's predicate sees it. antd's semantics ("return
    true to DISABLE") are identical to Astryx's, so the predicate ports as-is.
*/
import { DateTimeInput } from '@astryxdesign/core/DateTimeInput';
import type { ISODateTimeString } from '@astryxdesign/core/DateTimeInput';
import { useControllableValue } from 'backend.ai-ui';
import dayjs, { Dayjs } from 'dayjs';
import * as _ from 'lodash-es';
import React from 'react';

export interface DatePickerISOProps {
  /** ISO string in, ISO string out — the reason this wrapper exists. */
  value?: string | undefined | null;
  onChange?: (value: string | undefined) => void;
  /** Emit `dayjs().format()` (local + offset) instead of a UTC ISO string. */
  localFormat?: boolean;
  /** Accessible name. Defaults to a generic one when inside a `Form.Item`. */
  label?: string;
  isLabelHidden?: boolean;
  disabled?: boolean;
  placeholder?: string;
  /** No-op — `DateTimeInput` always shows the time portion. See the header. */
  showTime?: boolean;
  /** antd's predicate: return `true` to DISABLE that date. */
  disabledDate?: (date: Dayjs) => boolean;
  'data-testid'?: string;
}

const DatePickerISO: React.FC<DatePickerISOProps> = ({
  value,
  onChange,
  localFormat,
  label,
  isLabelHidden = true,
  disabled,
  placeholder,
  showTime: _showTime,
  disabledDate,
  ...rest
}) => {
  'use memo';
  const [, setControllableValue] = useControllableValue({
    value,
    onChange,
  });

  return (
    <DateTimeInput
      // `DateTimeInput` wants `YYYY-MM-DDTHH:MM[:SS]`, which is what dayjs
      // emits without the offset suffix; the offset/UTC choice belongs to the
      // OUTBOUND conversion below, not to what the control displays.
      value={
        value
          ? (dayjs(value).format('YYYY-MM-DDTHH:mm') as ISODateTimeString)
          : undefined
      }
      onChange={(next) => {
        if (_.isNil(next) || next === '') {
          setControllableValue(undefined);
          return;
        }
        const parsed = dayjs(next);
        setControllableValue(
          localFormat ? parsed.format() : parsed.tz().toISOString(),
        );
      }}
      label={label ?? ''}
      isLabelHidden={isLabelHidden}
      isDisabled={disabled}
      placeholder={placeholder}
      hourFormat="24h"
      hasClear
      width="100%"
      dateConstraints={
        disabledDate ? [(date: Date) => disabledDate(dayjs(date))] : undefined
      }
      {...rest}
    />
  );
};

DatePickerISO.displayName = 'DatePickerISO';
export default DatePickerISO;
