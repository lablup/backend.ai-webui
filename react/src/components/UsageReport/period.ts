/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { UsageReportPeriod, UsageReportPeriodType } from './types';
import dayjs, { Dayjs } from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);

const unitOf = (periodType: UsageReportPeriodType) =>
  periodType === 'weekly' ? 'isoWeek' : ('month' as const);

/** Start of the last complete calendar week/month (spec §1: default anchor). */
export const getDefaultPeriodStart = (
  periodType: UsageReportPeriodType,
): Dayjs =>
  dayjs()
    .startOf(unitOf(periodType))
    .subtract(1, periodType === 'weekly' ? 'week' : 'month');

export const resolvePeriod = (
  periodType: UsageReportPeriodType,
  periodStartParam: string | null,
): UsageReportPeriod => {
  const parsed = periodStartParam ? dayjs(periodStartParam) : null;
  const anchor = parsed?.isValid() ? parsed : getDefaultPeriodStart(periodType);
  const start = anchor.startOf(unitOf(periodType));
  const end = start.endOf(unitOf(periodType));
  return {
    periodType,
    startDate: start.format('YYYY-MM-DD'),
    endDate: end.format('YYYY-MM-DD'),
  };
};

export const shiftPeriodStart = (
  period: UsageReportPeriod,
  offset: 1 | -1,
): string =>
  dayjs(period.startDate)
    .add(offset, period.periodType === 'weekly' ? 'week' : 'month')
    .format('YYYY-MM-DD');

/** True when `period` is at (or past) the last complete week/month. */
export const isLastCompletePeriod = (period: UsageReportPeriod): boolean =>
  !dayjs(period.startDate).isBefore(getDefaultPeriodStart(period.periodType));

export const formatPeriodLabel = (period: UsageReportPeriod): string => {
  const start = dayjs(period.startDate);
  const end = dayjs(period.endDate);
  return period.periodType === 'weekly'
    ? `${start.isoWeekYear()} W${start.isoWeek()} (${start.format('ll')} – ${end.format('ll')})`
    : start.format('MMMM YYYY');
};
