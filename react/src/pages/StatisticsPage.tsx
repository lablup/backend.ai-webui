import BAICard from '../components/BAICard';
import BAIFetchKeyButton from '../components/BAIFetchKeyButton';
// import BAITabs from '../components/BAITabs';
import Flex from '../components/Flex';
import UsageHistoryStatistics from '../components/UsageHistoryStatistics';
import { useUpdatableState } from '../hooks';
import { Alert, Form, Select, Skeleton } from 'antd';
import { Suspense, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { createEnumParam, useQueryParam, withDefault } from 'use-query-params';

export type Period = '1D' | '1W';
const periodParam = withDefault(createEnumParam<Period>(['1D', '1W']), '1D');

const StatisticsPage = () => {
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
    <BAICard activeTabKey="usageHistory" title={t('statistics.UsageHistory')}>
      <Flex direction="column" align="stretch" gap={'md'}>
        <Alert
          showIcon
          message={t('statistics.UsageHistoryNote')}
          type="info"
        />
        <Flex gap={'sm'} justify="between">
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
        </Flex>
        <Suspense fallback={<Skeleton active />}>
          <UsageHistoryStatistics
            period={selectedPeriod || '1D'}
            fetchKey={usageFetchKey}
          />
        </Suspense>
      </Flex>
      {/* <BAITabs
        items={[
          {
            label: t('statistics.UsageHistory'),
            key: 'usageHistory',
            children: (
            //  
            ),
          },
          {
            label: 'Live Stats',
            key: 'liveStats',
          },
        ]}
      /> */}
    </BAICard>
  );
};

export default StatisticsPage;
