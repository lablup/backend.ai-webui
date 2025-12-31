import { UserSessionsMetricsQuery } from '../__generated__/UserSessionsMetricsQuery.graphql';
import { newLineToBrElement } from '../helper';
import { useCurrentUserInfo } from '../hooks/backendai';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import BAIBoard, { BAIBoardItem } from './BAIBoard';
import SessionMetricGraph from './SessionMetricGraph';
import { Alert, DatePicker, Empty, Skeleton, theme } from 'antd';
import {
  useUpdatableState,
  BAIFetchKeyButton,
  BAIFlex,
  filterOutEmpty,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import _ from 'lodash';
import { Suspense, useEffect, useMemo, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { StringParam, useQueryParam, withDefault } from 'use-query-params';

interface UserSessionsMetricsProps {}

const UserSessionsMetrics: React.FC<UserSessionsMetricsProps> = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { RangePicker } = DatePicker;

  const [usageFetchKey, updateUsageFetchKey] = useUpdatableState('first');
  const [isPendingUsageTransition, startUsageTransition] = useTransition();
  const [startDate, setStartDate] = useQueryParam(
    'startDate',
    withDefault(StringParam, dayjs().format('YYYY-MM-DD 00:00:00')),
  );
  const [endDate, setEndDate] = useQueryParam(
    'endDate',
    withDefault(StringParam, dayjs().format('YYYY-MM-DD 23:59:59')),
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
          const prefix = metric.split('_').slice(0, -1).join('_');
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
            <Suspense
              fallback={
                <Skeleton
                  active
                  style={{ padding: `0px ${token.marginMD}px` }}
                />
              }
            >
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

  useEffect(() => {
    setBoardItems(initialBoardItems);
  }, [initialBoardItems]);

  return (
    <BAIFlex direction="column" align="stretch" gap="md">
      <BAIFlex align="stretch" justify="between">
        <RangePicker
          allowClear={false}
          showTime={{ format: 'HH:mm' }}
          maxDate={dayjs()}
          onChange={(_, [startDate, endDate]) => {
            startUsageTransition(() => {
              setStartDate(startDate);
              setEndDate(endDate);
            });
          }}
          defaultValue={[dayjs(startDate), dayjs(endDate)]}
          presets={[
            {
              label: t('statistics.timeRange.Today'),
              value: [dayjs().startOf('day'), dayjs().endOf('day')],
            },
            {
              label: t('statistics.timeRange.LastHour'),
              value: [
                dayjs().subtract(1, 'hour'),
                dayjs().subtract(1, 'second'),
              ],
            },
            {
              label: t('statistics.timeRange.Last3Hours'),
              value: [
                dayjs().subtract(3, 'hours'),
                dayjs().subtract(1, 'second'),
              ],
            },
            {
              label: t('statistics.timeRange.Last12Hours'),
              value: [
                dayjs().subtract(12, 'hours'),
                dayjs().subtract(1, 'second'),
              ],
            },
            {
              label: t('statistics.timeRange.LastDay'),
              value: [
                dayjs().subtract(1, 'day'),
                dayjs().subtract(1, 'second'),
              ],
            },
            {
              label: t('statistics.timeRange.Last7Days'),
              value: [
                dayjs().subtract(7, 'days'),
                dayjs().subtract(1, 'second'),
              ],
            },
          ]}
        />
        <BAIFetchKeyButton
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
        <Alert
          showIcon
          title={t('statistics.prometheus.DataMissingInLowUsageDesc')}
        />
      )}
      {_.isEmpty(sortedMetricMetadata) ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t('statistics.prometheus.NoMetricsToDisplay')}
        />
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
                          <Suspense
                            fallback={
                              <Skeleton
                                active
                                style={{ padding: `0px ${token.marginMD}px` }}
                              />
                            }
                          >
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
