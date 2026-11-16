/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { MemoryInUseNoteMetricNamesQuery } from '../../../__generated__/MemoryInUseNoteMetricNamesQuery.graphql';
import type { MemoryInUseNoteQuery } from '../../../__generated__/MemoryInUseNoteQuery.graphql';
import { Text } from '@lablup/ui-common/Text';
import * as _ from 'lodash-es';
import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

type MetricValues =
  | {
      readonly metrics:
        | ReadonlyArray<
            | {
                readonly values:
                  | ReadonlyArray<
                      | { readonly value: string | null | undefined }
                      | null
                      | undefined
                    >
                  | null
                  | undefined;
              }
            | null
            | undefined
          >
        | null
        | undefined;
    }
  | null
  | undefined;

const lastValue = (metric: MetricValues) =>
  _.toNumber(
    // `_.toNumber(null)` is 0, so an empty sample must not count as a measurement.
    _.findLast(metric?.metrics?.[0]?.values ?? [], (point) =>
      point?.value ? _.isFinite(_.toNumber(point.value)) : false,
    )?.value,
  );

/** The memory metric of a resource slot: `mem` for memory, `<device>_mem` for an accelerator (`cuda.device` → `cuda_mem`). */
export const memoryMetricOf = (slotKey: string) =>
  slotKey === 'mem'
    ? 'mem'
    : `${slotKey.split('.')[0].replaceAll('-', '_')}_mem`;

/** The memory metrics the manager reports (`mem`, `cuda_mem`, …). */
export const useReportedMemoryMetrics = (): ReadonlySet<string> => {
  const { container_utilization_metric_metadata } =
    useLazyLoadQuery<MemoryInUseNoteMetricNamesQuery>(
      graphql`
        query MemoryInUseNoteMetricNamesQuery {
          container_utilization_metric_metadata {
            metric_names
          }
        }
      `,
      {},
      { fetchPolicy: 'store-or-network' },
    );
  return new Set(
    _.filter(
      _.compact(container_utilization_metric_metadata?.metric_names),
      (name) => name === 'mem' || name.endsWith('_mem'),
    ),
  );
};

interface MemoryInUseNoteProps {
  /** A metric the manager reports (see `useReportedMemoryMetrics`). */
  metricName: string;
  userId: string;
  fetchKey: string;
  /** The card's last refresh, which the 15-minute window ends at. */
  refreshedAt: number;
}

const MemoryInUseNoteContent: React.FC<MemoryInUseNoteProps> = ({
  metricName,
  userId,
  fetchKey,
  refreshedAt,
}) => {
  'use memo';
  const { t } = useTranslation();
  // The last 15 minutes before the refresh, in 5-minute steps: the newest points the manager has.
  const end = Math.floor(refreshedAt / 1000);
  const windowOf = (valueType: string) => ({
    metric_name: metricName,
    start: String(end - 15 * 60),
    end: String(end),
    step: '5m',
    value_type: valueType,
  });
  const data = useLazyLoadQuery<MemoryInUseNoteQuery>(
    graphql`
      query MemoryInUseNoteQuery(
        $userId: UUID!
        $capacityProps: UserUtilizationMetricQueryInput!
        $currentProps: UserUtilizationMetricQueryInput!
      ) {
        capacity: user_utilization_metric(
          user_id: $userId
          props: $capacityProps
        ) {
          metrics {
            values {
              value
            }
          }
        }
        current: user_utilization_metric(
          user_id: $userId
          props: $currentProps
        ) {
          metrics {
            values {
              value
            }
          }
        }
      }
    `,
    {
      userId,
      capacityProps: windowOf('capacity'),
      currentProps: windowOf('current'),
    },
    { fetchPolicy: 'network-only', fetchKey },
  );
  const allocated = lastValue(data.capacity);
  const used = lastValue(data.current);
  if (!(allocated > 0) || !_.isFinite(used)) return null;

  // A share, not GiB: the agents' measurement need not total the manager's allocation shown above it.
  const percent = Math.round(Math.min(100, (used / allocated) * 100));
  return (
    <Text
      size="sm"
      type={percent >= 80 ? undefined : 'supporting'}
      weight={percent >= 80 ? 'semibold' : undefined}
      // Close to the allocation, a session is about to run out of memory.
      style={
        percent >= 95
          ? { color: 'var(--color-error)' }
          : percent >= 80
            ? { color: 'var(--color-warning)' }
            : undefined
      }
    >
      {metricName === 'mem'
        ? t('dashboard.InUsePercent', { percent })
        : t('dashboard.MemoryInUsePercent', { percent })}
    </Text>
  );
};

/**
 * The share of a slot's allocated memory the viewer's sessions are using, as
 * a line under that slot's statistic. Nothing with nothing allocated; a failed
 * query shows nothing until the next refresh.
 */
const MemoryInUseNote: React.FC<MemoryInUseNoteProps> = (props) => (
  <ErrorBoundary fallbackRender={() => null} resetKeys={[props.fetchKey]}>
    <Suspense fallback={null}>
      <MemoryInUseNoteContent {...props} />
    </Suspense>
  </ErrorBoundary>
);

export default MemoryInUseNote;
