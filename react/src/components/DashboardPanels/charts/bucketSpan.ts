/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DateTimeWindow } from '../timeRange';
import dayjs from 'dayjs';

/** A bucket's time span for a tooltip; the end repeats the date only when the bucket crosses midnight. */
export const formatBucketSpan = (window: DateTimeWindow): string => {
  const from = dayjs(window.after);
  const to = dayjs(window.before);
  return `${from.format('lll')} - ${to.format(from.isSame(to, 'day') ? 'LT' : 'lll')}`;
};
