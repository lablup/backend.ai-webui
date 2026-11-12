/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { MemoryInUseMetricNamesQuery } from '../../../__generated__/MemoryInUseMetricNamesQuery.graphql';
import type { MemoryInUseQuery } from '../../../__generated__/MemoryInUseQuery.graphql';
import {
  useCurrentUserInfo,
  useResourceSlotsDetails,
} from '../../../hooks/backendai';
import {
  BAIRowWrapWithDividers,
  BAIStatistic,
  type BAIStatisticProps,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import React from 'react';
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

/** Used ÷ allocated in percent, or null with nothing allocated or no data. */
const percentOf = (capacity: MetricValues, current: MetricValues) => {
  const allocated = lastValue(capacity);
  const used = lastValue(current);
  return allocated > 0 && _.isFinite(used)
    ? Math.min(100, (used / allocated) * 100)
    : null;
};

const InUseStatistic: React.FC<
  Pick<BAIStatisticProps, 'title'> & { percent: number }
> = ({ title, percent }) => (
  <BAIStatistic
    title={title}
    current={Math.round(percent)}
    total={100}
    unit="%"
    precision={0}
    progressMode="normal"
    // Close to the allocation, a session is about to run out of memory.
    style={
      percent >= 95
        ? { color: 'var(--color-error)' }
        : percent >= 80
          ? { color: 'var(--color-warning)' }
          : undefined
    }
  />
);

/**
 * How much of the memory the viewer's sessions were allocated is in use, for
 * host memory and the accelerator memory the manager reports. A share, not
 * GiB: the metric is the agents' measurement, whose totals need not match
 * the manager's allocation the card shows above.
 */
const MemoryInUse: React.FC<{ fetchKey: string }> = ({ fetchKey }) => {
  'use memo';
  const { t } = useTranslation();
  const [userInfo] = useCurrentUserInfo();
  const { mergedResourceSlots } = useResourceSlotsDetails();
  const { container_utilization_metric_metadata } =
    useLazyLoadQuery<MemoryInUseMetricNamesQuery>(
      graphql`
        query MemoryInUseMetricNamesQuery {
          container_utilization_metric_metadata {
            metric_names
          }
        }
      `,
      {},
      { fetchPolicy: 'store-or-network' },
    );
  const names = _.compact(container_utilization_metric_metadata?.metric_names);
  // One accelerator family per cluster in practice; the first `*_mem` one.
  const acceleratorMetric = _.find(
    names,
    (name) => name.endsWith('_mem') && !name.startsWith('cpu'),
  );
  const hasMemory = _.includes(names, 'mem');

  // The last 15 minutes in 5-minute steps: the newest points the manager has.
  const end = dayjs().unix();
  const windowOf = (metricName: string, valueType: string) => ({
    metric_name: metricName,
    start: String(end - 15 * 60),
    end: String(end),
    step: '5m',
    value_type: valueType,
  });
  const data = useLazyLoadQuery<MemoryInUseQuery>(
    graphql`
      query MemoryInUseQuery(
        $userId: UUID!
        $memCapacity: UserUtilizationMetricQueryInput!
        $memCurrent: UserUtilizationMetricQueryInput!
        $accCapacity: UserUtilizationMetricQueryInput!
        $accCurrent: UserUtilizationMetricQueryInput!
        $hasMemory: Boolean!
        $hasAccelerator: Boolean!
      ) {
        memCapacity: user_utilization_metric(
          user_id: $userId
          props: $memCapacity
        ) @include(if: $hasMemory) {
          metrics {
            values {
              value
            }
          }
        }
        memCurrent: user_utilization_metric(
          user_id: $userId
          props: $memCurrent
        ) @include(if: $hasMemory) {
          metrics {
            values {
              value
            }
          }
        }
        accCapacity: user_utilization_metric(
          user_id: $userId
          props: $accCapacity
        ) @include(if: $hasAccelerator) {
          metrics {
            values {
              value
            }
          }
        }
        accCurrent: user_utilization_metric(
          user_id: $userId
          props: $accCurrent
        ) @include(if: $hasAccelerator) {
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
      memCapacity: windowOf('mem', 'capacity'),
      memCurrent: windowOf('mem', 'current'),
      accCapacity: windowOf(acceleratorMetric ?? 'mem', 'capacity'),
      accCurrent: windowOf(acceleratorMetric ?? 'mem', 'current'),
      hasMemory: hasMemory && !!userInfo.uuid,
      hasAccelerator: !!acceleratorMetric && !!userInfo.uuid,
    },
    { fetchPolicy: 'network-only', fetchKey },
  );

  const memoryPercent = percentOf(data.memCapacity, data.memCurrent);
  const acceleratorPercent = percentOf(data.accCapacity, data.accCurrent);
  const devicePrefix = acceleratorMetric?.split('_').slice(0, -1).join('-');
  const device =
    devicePrefix &&
    (_.find(mergedResourceSlots, (_slot, key) =>
      key.startsWith(devicePrefix + '.'),
    )?.description ??
      _.startCase(devicePrefix));

  if (memoryPercent === null && acceleratorPercent === null) return null;
  return (
    <BAIRowWrapWithDividers>
      {memoryPercent !== null && (
        <InUseStatistic
          title={t('dashboard.MemoryInUse')}
          percent={memoryPercent}
        />
      )}
      {acceleratorPercent !== null && (
        <InUseStatistic
          title={t('dashboard.DeviceMemoryInUse', { device })}
          percent={acceleratorPercent}
        />
      )}
    </BAIRowWrapWithDividers>
  );
};

export default MemoryInUse;
