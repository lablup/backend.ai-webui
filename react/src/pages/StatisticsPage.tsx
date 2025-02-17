import BAICard from '../components/BAICard';
import Flex from '../components/Flex';
import InfoIconWithTooltip from '../components/InfoIconWithTooltip';
import UsageHistoryStatistics from '../components/UsageHistoryStatistics';
import { useSuspendedBackendaiClient } from '../hooks';
import { useTanQuery } from '../hooks/reactQueryAlias';
import { Alert, Form, Select, theme } from 'antd';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StringParam, useQueryParam, withDefault } from 'use-query-params';

export type Period = '1D' | '1W';
const periodParam = withDefault(StringParam, '1D');

const StatisticsPage = () => {
  const [period, setPeriod] = useQueryParam('period', periodParam);
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();
  const { data } = useTanQuery({
    queryKey: ['UserCreateAt', baiClient._config.accessKey],
    queryFn: () =>
      baiClient.keypair.info(baiClient._config.accessKey, ['created_at']),
    staleTime: 3 * 60 * 1000,
  });

  const isUserOlderThan7Days = useMemo(() => {
    if (!data?.keypair?.created_at) {
      return false;
    }
    const seconds = Math.floor(
      (new Date().getTime() - new Date(data.keypair.created_at).getTime()) /
        1000,
    );
    const days = Math.floor(seconds / (24 * 60 * 60));
    return days > 7;
  }, [data]);

  let periodOptions: Array<{
    label: string;
    value: Period;
  }> = [
    {
      label: t('statistics.1Day'),
      value: '1D',
    },
  ];

  if (isUserOlderThan7Days) {
    periodOptions.push({
      label: t('statistics.1Week'),
      value: '1W',
    });
  }

  return (
    <BAICard
      activeTabKey="usageHistory"
      title={
        <Flex gap={'xs'}>
          {t('statistics.UsageHistory')}
          <InfoIconWithTooltip title={t('statistics.UsageHistoryDesc')} />
        </Flex>
      }
      styles={{ body: { padding: 0 } }}
      extra={
        <Form.Item
          label={t('statistics.SelectPeriod')}
          style={{ marginBottom: 0 }}
        >
          <Select
            popupMatchSelectWidth={false}
            options={periodOptions}
            value={period}
            onChange={(value) => setPeriod(value)}
          />
        </Form.Item>
      }
    >
      <Alert
        showIcon
        message={`${t('statistics.UsageHistoryNote')} ${isUserOlderThan7Days ? '' : t('statistics.UsageHistoryNoteUnder7Days')}`}
        type="info"
        style={{
          marginInline: token.paddingContentHorizontal,
        }}
      />
      <UsageHistoryStatistics period={period as Period} />
    </BAICard>
  );
};

export default StatisticsPage;
