/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { UserSessionsMetricsQuery } from '../__generated__/UserSessionsMetricsQuery.graphql';
import { newLineToBrElement } from '../helper';
import { useCurrentUserInfo } from '../hooks/backendai';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import AutoUpdateFetchKeyButton, {
  LONG_AUTO_UPDATE_DELAY_OPTIONS,
} from './AutoUpdateFetchKeyButton';
import BAIBoard, { BAIBoardItem } from './BAIBoard';
import SessionMetricGraph from './SessionMetricGraph';
import { Banner } from '@astryxdesign/core/Banner';
import type { ISODateString } from '@astryxdesign/core/Calendar';
import { DateRangeInput } from '@astryxdesign/core/DateRangeInput';
import type { DateRange } from '@astryxdesign/core/DateRangeInput';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import {
  BAISkeleton,
  useUpdatableState,
  BAIFlex,
  filterOutEmpty,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { parseAsString, useQueryState } from 'nuqs';
import { Suspense, useEffect, useMemo, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

interface UserSessionsMetricsProps {}

const UserSessionsMetrics: React.FC<UserSessionsMetricsProps> = () => {
  'use memo';
  const { t } = useTranslation();

  const [usageFetchKey, updateUsageFetchKey] = useUpdatableState('first');
  const [isPendingUsageTransition, startUsageTransition] = useTransition();
  const [startDate, setStartDate] = useQueryState(
    'startDate',
    parseAsString.withDefault(dayjs().format('YYYY-MM-DD 00:00:00')),
  );
  const [endDate, setEndDate] = useQueryState(
    'endDate',
    parseAsString.withDefault(dayjs().format('YYYY-MM-DD 23:59:59')),
  );
  const userInfo = useCurrentUserInfo();
  const dayDiff = dayjs(endDate).diff(dayjs(startDate), 'day');

  const { container_utilization_metric_metadata } =
    useLazyLoadQuery<UserSessionsMetricsQuery>(
      graphql`
        query UserSessionsMetricsQuery {
          container_utilization_metric_metadata {
            metric_names
          }
        }
      `,
      {},
      {
        fetchKey: usageFetchKey,
        fetchPolicy: 'store-and-network',
      },
    );

  const sortedMetricMetadata = useMemo(() => {
    const metrics = container_utilization_metric_metadata?.metric_names || [];

    const { cpuUtil, memory, acceleratorGroups, rest } = _.reduce(
      metrics,
      (acc, metric) => {
        if (!metric || metric === 'cpu_used' || metric === 'io_scratch_size')
          return acc;

        if (metric === 'cpu_util') {
          acc.cpuUtil.push(metric);
        } else if (metric === 'mem') {
          acc.memory.push(metric);
        } else if (
          (metric.endsWith('_util') || metric.endsWith('_mem')) &&
          !_.startsWith(metric, 'cpu') &&
          !_.startsWith(metric, 'mem')
        ) {
          const prefix = _.split(metric, '_').slice(0, -1).join('_');
          if (!acc.acceleratorGroups[prefix]) {
            acc.acceleratorGroups[prefix] = [];
          }
          acc.acceleratorGroups[prefix].push(metric);
        } else {
          acc.rest.push(metric);
        }
        return acc;
      },
      {
        cpuUtil: [] as string[],
        memory: [] as string[],
        acceleratorGroups: {} as Record<string, string[]>,
        rest: [] as string[],
      },
    );
    const sortedAccelMetrics = _.flatMap(_.values(acceleratorGroups), (group) =>
      _.sortBy(group, (metric) => (metric.endsWith('_util') ? 0 : 1)),
    );
    const sortedRest = _.sortBy(rest, (metric) =>
      metric.startsWith('net') ? 0 : 1,
    );

    return [...cpuUtil, ...memory, ...sortedAccelMetrics, ...sortedRest];
  }, [container_utilization_metric_metadata?.metric_names]);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [localStorageBoardItems, setLocalStorageBoardItems] =
    useBAISettingUserState('session_metrics_board_items');

  const tooltip: Record<string, React.ReactNode> = {
    cpu_util: newLineToBrElement(t('statistics.description.CPUUtilization')),
    net_rx: newLineToBrElement(t('statistics.description.NetworkRx')),
    net_tx: newLineToBrElement(t('statistics.description.NetworkTx')),
  };

  const initialBoardItems = useMemo(() => {
    const defaultBoardItem: Array<BAIBoardItem> = _.map(
      sortedMetricMetadata,
      (metric) => ({
        id: metric,
        rowSpan: 3,
        columnSpan: windowWidth > 2160 ? 3 : 2,
        data: {
          content: (
            <Suspense fallback={<BAISkeleton />}>
              <SessionMetricGraph
                key={metric}
                queryProps={{
                  startDate: dayjs(startDate).unix().toString(),
                  endDate: dayjs(endDate).unix().toString(),
                  metricName: metric,
                  userId: userInfo[0]?.uuid ?? '',
                  dayDiff: dayDiff,
                }}
                fetchKey={usageFetchKey}
                tooltip={tooltip[metric] || undefined}
              />
            </Suspense>
          ),
        },
      }),
    );

    if (localStorageBoardItems) {
      const boardItemsWithContent = _.map(localStorageBoardItems, (item) => {
        const initialItem = _.find(
          defaultBoardItem,
          (defaultItem) => defaultItem.id === item.id,
        );
        return initialItem ? { ...item, data: initialItem.data } : null;
      });

      return filterOutEmpty(boardItemsWithContent);
    }

    return defaultBoardItem;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    sortedMetricMetadata,
    startDate,
    endDate,
    usageFetchKey,
    dayDiff,
    windowWidth,
  ]);

  const [boardItems, setBoardItems] =
    useState<Array<BAIBoardItem>>(initialBoardItems);

  const [prevInitialBoardItems, setPrevInitialBoardItems] =
    useState(initialBoardItems);
  if (prevInitialBoardItems !== initialBoardItems) {
    setPrevInitialBoardItems(initialBoardItems);
    setBoardItems(initialBoardItems);
  }

  return (
    <BAIFlex direction="column" align="stretch" gap="md">
      <BAIFlex align="stretch" justify="between">
        {/* MAPPING §3.13: antd `DatePicker.RangePicker` -> `DateRangeInput`,
            which speaks ISO DATE strings (`{start, end}`), not dayjs. The
            dayjs boundary is the `toDayRange` bridge below.
            PILOT-DECISION: `showTime={{format:'HH:mm'}}` is dropped —
            Astryx has `DateTimeInput` but no date-TIME range input, and this
            filter's presets were already whole-day/relative spans. A picked
            range now covers whole days (00:00:00 -> 23:59:59), which is what
            the URL defaults already were. `maxDate={dayjs()}` -> `max`;
            `allowClear={false}` -> `hasClear={false}`; the six antd presets
            keep their labels, expressed as day-granular ranges. */}
        <DateRangeInput
          label={t('statistics.SelectPeriod')}
          isLabelHidden
          hasClear={false}
          max={dayjs().format('YYYY-MM-DD') as ISODateString}
          value={{
            start: dayjs(startDate).format('YYYY-MM-DD') as ISODateString,
            end: dayjs(endDate).format('YYYY-MM-DD') as ISODateString,
          }}
          onChange={(range: DateRange | null) => {
            if (!range) return;
            startUsageTransition(() => {
              setStartDate(dayjs(range.start).format('YYYY-MM-DD 00:00:00'));
              setEndDate(dayjs(range.end).format('YYYY-MM-DD 23:59:59'));
            });
          }}
          presets={[
            {
              label: t('statistics.timeRange.Today'),
              getRange: () => ({
                start: dayjs().format('YYYY-MM-DD') as ISODateString,
                end: dayjs().format('YYYY-MM-DD') as ISODateString,
              }),
            },
            {
              label: t('statistics.timeRange.LastDay'),
              getRange: () => ({
                start: dayjs()
                  .subtract(1, 'day')
                  .format('YYYY-MM-DD') as ISODateString,
                end: dayjs().format('YYYY-MM-DD') as ISODateString,
              }),
            },
            {
              label: t('statistics.timeRange.Last7Days'),
              getRange: () => ({
                start: dayjs()
                  .subtract(7, 'days')
                  .format('YYYY-MM-DD') as ISODateString,
                end: dayjs().format('YYYY-MM-DD') as ISODateString,
              }),
            },
          ]}
        />
        <AutoUpdateFetchKeyButton
          settingId="user-sessions-metrics"
          autoUpdateDelayOptions={LONG_AUTO_UPDATE_DELAY_OPTIONS}
          loading={isPendingUsageTransition}
          value={usageFetchKey}
          onChange={() => {
            startUsageTransition(() => {
              updateUsageFetchKey();
            });
          }}
        />
      </BAIFlex>
      {dayDiff > 30 && (
        // antd `Alert` -> `Banner` (MAPPING §4). No `type` was passed, so the
        // untyped antd default (`info`) becomes an explicit `status="info"`;
        // `showIcon` is dropped (Banner always shows its status icon).
        <Banner
          status="info"
          title={t('statistics.prometheus.DataMissingInLowUsageDesc')}
        />
      )}
      {_.isEmpty(sortedMetricMetadata) ? (
        // antd `Empty` -> `EmptyState`: `description` becomes the required
        // `title`; `PRESENTED_IMAGE_SIMPLE` has no counterpart and is dropped.
        <EmptyState title={t('statistics.prometheus.NoMetricsToDisplay')} />
      ) : (
        <BAIBoard
          movable
          resizable
          bordered
          items={boardItems}
          onItemsChange={(event) => {
            // FIXME: This is a workaround for the issue where the board items are not updated correctly when resizing.
            // ----- It should be fixed in the BAIBoard component. -----
            let changedItems = [...event.detail.items];
            if (event.detail.resizedItem) {
              const resizedItemId = event.detail.resizedItem.id;
              changedItems = changedItems.map((item) => {
                if (item.id === resizedItemId) {
                  const originalItem = initialBoardItems.find(
                    (orig) => orig.id === item.id,
                  );
                  if (originalItem) {
                    return {
                      ...item,
                      data: {
                        ...originalItem.data,
                        content: (
                          <Suspense fallback={<BAISkeleton />}>
                            <SessionMetricGraph
                              key={`${item.id}-${Date.now()}`}
                              queryProps={{
                                startDate: dayjs(startDate).unix().toString(),
                                endDate: dayjs(endDate).unix().toString(),
                                metricName: item.id,
                                userId: userInfo[0]?.uuid ?? '',
                                dayDiff: dayDiff,
                              }}
                              fetchKey={usageFetchKey}
                              tooltip={tooltip[item.id] || undefined}
                            />
                          </Suspense>
                        ),
                      },
                    };
                  }
                }
                return item;
              });
            }
            // ---------------------------------------------------------

            setBoardItems(changedItems);
            setLocalStorageBoardItems(
              _.map(changedItems, (item) => _.omit(item, 'data')),
            );
          }}
        />
      )}
    </BAIFlex>
  );
};

export default UserSessionsMetrics;
