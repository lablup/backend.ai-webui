import { useUpdatableState } from '../hooks';
import BAIFetchKeyButton from './BAIFetchKeyButton';
import Flex from './Flex';
import PrometheusMetricList from './PrometheusMetricList';
import { DatePicker, Skeleton, theme } from 'antd';
import dayjs from 'dayjs';
import { Suspense, useTransition } from 'react';
import { StringParam, useQueryParam, withDefault } from 'use-query-params';

interface PrometheusMetricProps {}

const PrometheusMetric: React.FC<PrometheusMetricProps> = () => {
  const { token } = theme.useToken();
  const { RangePicker } = DatePicker;

  const [startDate, setStartDate] = useQueryParam(
    'startDate',
    withDefault(StringParam, dayjs().format('YYYY-MM-DD')),
  );
  const [endDate, setEndDate] = useQueryParam(
    'endDate',
    withDefault(StringParam, dayjs().format('YYYY-MM-DD')),
  );

  const [usageFetchKey, updateUsageFetchKey] = useUpdatableState('first');
  const [isPendingUsageTransition, startUsageTransition] = useTransition();

  return (
    <Flex
      direction="column"
      align="stretch"
      gap="md"
      style={{ padding: token.paddingMD }}
    >
      <Flex align="stretch" justify="between">
        <RangePicker
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
        <PrometheusMetricList
          startDate={startDate}
          endDate={endDate}
          fetchKey={usageFetchKey}
        />
      </Suspense>
    </Flex>
  );
};

export default PrometheusMetric;
