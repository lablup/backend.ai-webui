import BAICard from '../components/BAICard';
import Flex from '../components/Flex';
import { useSuspendedBackendaiClient } from '../hooks';
import { useSuspenseTanQuery } from '../hooks/reactQueryAlias';
import { useThemeMode } from '../hooks/useThemeMode';
import useUserStats, {
  Period,
  UsageHistoryKey,
  UnitHint,
} from '../hooks/useUserStats';
import { Column, ColumnConfig, Line, LineConfig } from '@ant-design/charts';
import { Alert, Card, Select, theme } from 'antd';
import { format } from 'date-fns';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StringParam, useQueryParam, withDefault } from 'use-query-params';

type UsageHistoryTitle =
  | 'Sessions'
  | 'CPU'
  | 'Memory'
  | 'GPU'
  | 'IO-Read'
  | 'IO-Write';
interface GraphContainerProps {
  title: UsageHistoryTitle;
  graph: 'line' | 'column';
  config: LineConfig | ColumnConfig;
  height?: number;
}
const GraphContainer = ({
  title,
  graph,
  config,
  height = 200,
}: GraphContainerProps) => {
  return (
    <Card type="inner" title={title} style={{ width: '100%' }}>
      {graph === 'line' ? (
        <Line height={height} {...(config as LineConfig)} />
      ) : (
        <Column height={height} {...(config as ColumnConfig)} />
      )}
    </Card>
  );
};

const lineConfig = (
  data: any,
  period: Period,
  unitHint: UnitHint,
  isDarkMode: boolean,
): LineConfig => ({
  data,
  xField: 'date',
  yField: 'value',
  point: {},
  interaction: {
    tooltip: {
      marker: false,
    },
  },
  style: {
    lineWidth: 2,
  },
  axis: {
    x: {
      labelAutoHide: true,
      tickFilter: (_: any, index: any) =>
        index % (period === '1D' ? 12 : 48) === 0,
    },
    y: {
      title: unitHint,
    },
  },
  theme: isDarkMode ? 'dark' : 'light',
});

const columnConfig = (
  data: any,
  period: Period,
  unitHint: UnitHint,
  isDarkMode: boolean,
): ColumnConfig => ({
  data,
  xField: 'date',
  yField: 'value',
  axis: {
    x: {
      labelAutoHide: true,
      tickFilter: (_: any, index: any) =>
        index % (period === '1D' ? 12 : 48) === 0,
    },
    y: {
      title: unitHint,
    },
  },
  animate: { enter: { type: 'growInY' } },
  theme: isDarkMode ? 'dark' : 'light',
});

const byteConverter = {
  toB: (bytes: number) => bytes,
  toKB: (bytes: number) => bytes / 1024,
  toMB: (bytes: number) => bytes / (1024 * 1024),
  toGB: (bytes: number) => bytes / (1024 * 1024 * 1024),
  toTB: (bytes: number) => bytes / (1024 * 1024 * 1024 * 1024),
  log1024: (n: number) => (n <= 0 ? 0 : Math.log(n) / Math.log(1024)),
  readableUnit: function (bytes: number) {
    return ['B', 'KB', 'MB', 'GB', 'TB'][Math.floor(this.log1024(bytes))];
  },
};

const periodParam = withDefault(StringParam, '1D');

const keys: Partial<{
  [key in UsageHistoryKey]: {
    type: 'line' | 'column';
    unitHint: UnitHint;
    title: UsageHistoryTitle;
  };
}> = {
  num_sessions: {
    type: 'column',
    unitHint: 'count',
    title: 'Sessions',
  },
  cpu_allocated: {
    type: 'column',
    unitHint: 'count',
    title: 'CPU',
  },
  mem_allocated: {
    type: 'line',
    unitHint: 'MB',
    title: 'Memory',
  },
  gpu_allocated: {
    type: 'line',
    unitHint: 'count',
    title: 'GPU',
  },
  io_read_bytes: {
    type: 'line',
    unitHint: 'MB',
    title: 'IO-Read',
  },
  io_write_bytes: {
    type: 'line',
    unitHint: 'MB',
    title: 'IO-Write',
  },
};
const usageHistoryKeys = Object.keys(keys) as UsageHistoryKey[];

const formatValue = (value: number, unitHint: UnitHint) => {
  if (unitHint === 'count') {
    return value;
  } else {
    return byteConverter[`to${unitHint}`](value);
  }
};
interface UsageHistoryStatisticsProps {
  period: Period;
}
const UsageHistoryStatistics = ({ period }: UsageHistoryStatisticsProps) => {
  const { token } = theme.useToken();
  const { isDarkMode } = useThemeMode();
  const { data: userStats } = useUserStats(usageHistoryKeys, period as Period);
  return (
    <Flex
      direction="column"
      style={{
        padding: token.paddingContentHorizontal,
      }}
      align="start"
      gap="md"
    >
      {Object.entries(keys).map(([key, { type, unitHint, title }]) => {
        const data = userStats.map((d) => {
          return {
            date: format(d.date.toString(), 'MMM dd HH:mm'),
            value: formatValue(d.data[key as UsageHistoryKey].value, unitHint),
          };
        });

        return (
          <GraphContainer
            key={key}
            title={title}
            graph={type}
            config={
              type === 'line'
                ? lineConfig(data, period as Period, unitHint, isDarkMode)
                : columnConfig(data, period as Period, unitHint, isDarkMode)
            }
          />
        );
      })}
    </Flex>
  );
};

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

  let periodOptions: [
    {
      label: string;
      value: Period;
    },
  ] = [
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
      title={t('statistics.UsageHistory')}
      styles={{ body: { padding: 0 } }}
      extra={
        <Select
          popupMatchSelectWidth={false}
          options={periodOptions}
          value={period}
          onChange={onChange}
        />
      }
    >
      <Alert
        showIcon
        message={`${t('statistics.UsageHistoryNote')} ${isUserOlderThan7Days ? '' : t('statistics.UsageHistoryNoteUnder7Days')}`}
        type="info"
        style={{
          marginInline: token.paddingContentHorizontal,
          marginTop: token.marginMD,
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
