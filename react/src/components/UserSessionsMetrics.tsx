import { useUpdatableState } from '../hooks';
import BAIFetchKeyButton from './BAIFetchKeyButton';
import Flex from './Flex';
import SessionMetricGraph from './SessionMetricGraph';
import { UserSessionsMetricsQuery } from './__generated__/UserSessionsMetricsQuery.graphql';
import { Alert, DatePicker, Empty, Skeleton, theme } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import dayjs from 'dayjs';
import _ from 'lodash';
import { Suspense, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';
import { StringParam, useQueryParam, withDefault } from 'use-query-params';

interface PrometheusMetricProps {}

const UserSessionsMetrics: React.FC<PrometheusMetricProps> = () => {
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

  return (
    <Flex
      direction="column"
      align="stretch"
      gap="md"
      style={{ padding: token.paddingMD }}
    >
      <Flex align="stretch" justify="between">
        <RangePicker
          showTime={{ format: 'HH:mm' }}
          maxDate={dayjs()}
          onChange={(_, [startDate, endDate]) => {
            setStartDate(startDate);
            setEndDate(endDate);
          }}
          defaultValue={[dayjs(startDate), dayjs(endDate)]}
          presets={[
            {
              label: 'Last 7 Days',
              value: [
                dayjs().subtract(7, 'days'),
                dayjs().subtract(1, 'second'),
              ],
            },
            {
              label: 'Last 14 Days',
              value: [
                dayjs().subtract(14, 'days'),
                dayjs().subtract(1, 'second'),
              ],
            },
            {
              label: 'Last 30 Days',
              value: [
                dayjs().subtract(30, 'days'),
                dayjs().subtract(1, 'second'),
              ],
            },
            {
              label: 'Last 90 Days',
              value: [
                dayjs().subtract(90, 'days'),
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
      </Flex>
      {dayDiff > 30 && (
        <Alert
          showIcon
          message={t('statistics.prometheus.DataMissingInLowUsageDesc')}
        />
      )}
      <Suspense fallback={<Skeleton active />}>
        {_.isEmpty(container_utilization_metric_metadata?.metric_names) ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t('statistics.prometheus.noMetricsToDisplay')}
          />
        ) : (
          _.map(
            _.omit(container_utilization_metric_metadata?.metric_names),
            (metric) => {
              return metric ? (
                <SessionMetricGraph
                  startDate={dayjs(startDate).unix().toString()}
                  endDate={dayjs(endDate).unix().toString()}
                  metricName={metric}
                  fetchKey={usageFetchKey}
                />
              ) : null;
            },
          )
        )}
      </Suspense>
    </Flex>
  );
};

export default UserSessionsMetrics;
