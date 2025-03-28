import { useUpdatableState } from '../hooks';
import BAIFetchKeyButton from './BAIFetchKeyButton';
import Flex from './Flex';
import PrometheusMetricGraph from './PrometheusMetricGraph';
import { PrometheusMetricQuery } from './__generated__/PrometheusMetricQuery.graphql';
import { DatePicker, Empty, Skeleton, theme } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import dayjs from 'dayjs';
import _ from 'lodash';
import { Suspense, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';
import { StringParam, useQueryParam, withDefault } from 'use-query-params';

interface PrometheusMetricProps {}

const PrometheusMetric: React.FC<PrometheusMetricProps> = () => {
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

  const { container_utilization_metric_metadata } =
    useLazyLoadQuery<PrometheusMetricQuery>(
      graphql`
        query PrometheusMetricQuery {
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
                <PrometheusMetricGraph
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

export default PrometheusMetric;
