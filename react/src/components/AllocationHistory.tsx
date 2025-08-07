import { useUpdatableState } from '../hooks';
import AllocationHistoryStatistics from './AllocationHistoryStatistics';
import BAIFetchKeyButton from './BAIFetchKeyButton';
import { Alert, Form, Select, Skeleton } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import { Suspense, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { createEnumParam, useQueryParam, withDefault } from 'use-query-params';

export type Period = '1D' | '1W';
const periodParam = withDefault(createEnumParam<Period>(['1D', '1W']), '1D');

const AllocationHistory: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useQueryParam(
    'period',
    periodParam,
  );
  const { t } = useTranslation();

  const [usageFetchKey, updateUsageFetchKey] = useUpdatableState('first');
  const [isPendingUsageTransition, startUsageTransition] = useTransition();
  let periodOptions: Array<{
    label: string;
    value: Period;
  }> = [
    {
      label: t('statistics.1Day'),
      value: '1D',
    },
    {
      label: t('statistics.1Week'),
      value: '1W',
    },
  ];

  return (
    <BAIFlex direction="column" align="stretch" gap={'md'}>
      <Alert showIcon message={t('statistics.UsageHistoryNote')} type="info" />
      <BAIFlex gap={'sm'} justify="between">
        <Form.Item
          label={t('statistics.SelectPeriod')}
          style={{ marginBottom: 0 }}
        >
          <Select
            popupMatchSelectWidth={false}
            options={periodOptions}
            value={selectedPeriod}
            onChange={(value) => setSelectedPeriod(value)}
          />
        </Form.Item>
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
      <Suspense fallback={<Skeleton active />}>
        <AllocationHistoryStatistics
          period={selectedPeriod || '1D'}
          fetchKey={usageFetchKey}
        />
      </Suspense>
    </BAIFlex>
  );
};

export default AllocationHistory;
