import BAICard from '../components/BAICard';
import Flex from '../components/Flex';
import UsageHistoryStatistics from '../components/UsageHistoryStatistics';
import { useSuspendedBackendaiClient } from '../hooks';
import { useSuspenseTanQuery } from '../hooks/reactQueryAlias';
import { Period } from '../hooks/useUserStats';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Alert, Button, Form, Select, theme, Tooltip } from 'antd';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StringParam, useQueryParam, withDefault } from 'use-query-params';

const periodParam = withDefault(StringParam, '1D');

interface StatisticsLayoutProps {
  children: React.ReactNode;
  period: Period;
  onChange: (value: Period) => void;
}
const StatisticsLayout = ({
  children,
  period,
  onChange,
}: StatisticsLayoutProps) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();

  const {
    data: {
      keypair: { created_at },
    },
  } = useSuspenseTanQuery({
    queryKey: ['UserCreateAt', baiClient._config.accessKey],
    queryFn: () =>
      baiClient.keypair.info(baiClient._config.accessKey, ['created_at']),
    staleTime: 3 * 60 * 1000,
  });

  const isUserOlderThan7Days = useMemo(() => {
    const seconds = Math.floor(
      (new Date().getTime() - new Date(created_at).getTime()) / 1000,
    );
    const days = Math.floor(seconds / (24 * 60 * 60));
    return days > 7;
  }, [created_at]);

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
        <Flex>
          {t('statistics.UsageHistory')}
          <Tooltip title={t('statistics.UsageHistoryDesc')}>
            <Button type="link" size="large" icon={<InfoCircleOutlined />} />
          </Tooltip>
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
            onChange={onChange}
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
      {children}
    </BAICard>
  );
};

const StatisticsPage = () => {
  const [period, setPeriod] = useQueryParam('period', periodParam);

  return (
    <StatisticsLayout
      period={period as Period}
      onChange={(value: Period) => setPeriod(value)}
    >
      <UsageHistoryStatistics period={period as Period} />
    </StatisticsLayout>
  );
};

export default StatisticsPage;
