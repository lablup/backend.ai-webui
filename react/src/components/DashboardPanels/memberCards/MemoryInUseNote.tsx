/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { MemoryInUseNoteMetricNamesQuery } from '../../../__generated__/MemoryInUseNoteMetricNamesQuery.graphql';
import type { MemoryInUseNoteQuery } from '../../../__generated__/MemoryInUseNoteQuery.graphql';
import { useCurrentUserInfo } from '../../../hooks/backendai';
import ErrorBoundaryWithNullFallback from '../../ErrorBoundaryWithNullFallback';
import { Text } from '@lablup/ui-common/Text';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import React, { Suspense } from 'react';
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
    _.findLast(metric?.metrics?.[0]?.values ?? [], (point) =>
      _.isFinite(_.toNumber(point?.value)),
    )?.value,
  );

/** The memory metric of a resource slot: `mem` for memory, `<device>_mem` for an accelerator (`cuda.device` → `cuda_mem`). */
export const memoryMetricOf = (slotKey: string) =>
  slotKey === 'mem'
    ? 'mem'
    : `${slotKey.split('.')[0].replaceAll('-', '_')}_mem`;

const MemoryInUseNoteContent: React.FC<{
  metricName: string;
  isDevice: boolean;
  fetchKey: string;
}> = ({ metricName, isDevice, fetchKey }) => {
  'use memo';
  const { t } = useTranslation();
  const [userInfo] = useCurrentUserInfo();
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
  const isReported =
    !!userInfo.uuid &&
    _.includes(container_utilization_metric_metadata?.metric_names, metricName);
  // The last 15 minutes in 5-minute steps: the newest points the manager has.
  const end = dayjs().unix();
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
        $isReported: Boolean!
      ) {
        capacity: user_utilization_metric(
          user_id: $userId
          props: $capacityProps
        ) @include(if: $isReported) {
          metrics {
            values {
              value
            }
          }
        }
        current: user_utilization_metric(
          user_id: $userId
          props: $currentProps
        ) @include(if: $isReported) {
          metrics {
            values {
              value
            }
          }
        }
      }
    `,
    {
      userId: userInfo.uuid,
      capacityProps: windowOf('capacity'),
      currentProps: windowOf('current'),
      isReported,
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
      {isDevice
        ? t('dashboard.MemoryInUsePercent', { percent })
        : t('dashboard.InUsePercent', { percent })}
    </Text>
  );
};

/**
 * The share of a slot's allocated memory the viewer's sessions are using, as
 * a line under that slot's statistic. Nothing when the manager reports no
 * such metric, nothing is allocated, or the query fails.
 */
const MemoryInUseNote: React.FC<{ slotKey: string; fetchKey: string }> = ({
  slotKey,
  fetchKey,
}) => (
  <ErrorBoundaryWithNullFallback>
    <Suspense fallback={null}>
      <MemoryInUseNoteContent
        metricName={memoryMetricOf(slotKey)}
        isDevice={slotKey !== 'mem'}
        fetchKey={fetchKey}
      />
    </Suspense>
  </ErrorBoundaryWithNullFallback>
);

export default MemoryInUseNote;
