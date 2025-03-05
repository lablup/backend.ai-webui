import { useThemeMode } from '../hooks/useThemeMode';
import useUserStats, {
  Period,
  UnitHint,
  UsageHistoryKey,
} from '../hooks/useUserStats';
import Flex from './Flex';
import { Column, ColumnConfig } from '@ant-design/charts';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Button, Card, theme, Tooltip } from 'antd';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

type UsageHistoryTitle =
  | 'Sessions'
  | 'CPU'
  | 'Memory'
  | 'GPU'
  | 'IO-Read'
  | 'IO-Write';
interface GraphContainerProps {
  title: UsageHistoryTitle;
  config: ColumnConfig;
  tooltipText: string;
  height?: number;
}
const GraphContainer = ({
  title,
  config,
  tooltipText,
  height = 200,
}: GraphContainerProps) => {
  return (
    <Card
      type="inner"
      title={
        <Flex>
          {title}
          <Tooltip title={tooltipText}>
            <Button type="link" size="middle" icon={<InfoCircleOutlined />} />
          </Tooltip>
        </Flex>
      }
      style={{ width: '100%' }}
    >
      <Column height={height} {...(config as ColumnConfig)} />
    </Card>
  );
};

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

const keys: Partial<{
  [key in UsageHistoryKey]: {
    unitHint: UnitHint;
    title: UsageHistoryTitle;
  };
}> = {
  num_sessions: {
    unitHint: 'count',
    title: 'Sessions',
  },
  cpu_allocated: {
    unitHint: 'count',
    title: 'CPU',
  },
  mem_allocated: {
    unitHint: 'MB',
    title: 'Memory',
  },
  gpu_allocated: {
    unitHint: 'count',
    title: 'GPU',
  },
  io_read_bytes: {
    unitHint: 'MB',
    title: 'IO-Read',
  },
  io_write_bytes: {
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
  const { t } = useTranslation();

  const desc: Partial<{
    [key in UsageHistoryKey]: string;
  }> = {
    num_sessions: t('statistics.SessionsDesc'),
    cpu_allocated: t('statistics.CPUDesc'),
    mem_allocated: t('statistics.MemoryDesc'),
    gpu_allocated: t('statistics.GPUDesc'),
    io_read_bytes: t('statistics.IOReadDesc'),
    io_write_bytes: t('statistics.IOWriteDesc'),
  };
  return (
    <Flex
      direction="column"
      style={{
        padding: token.paddingContentHorizontal,
      }}
      align="start"
      gap="md"
    >
      {Object.entries(keys).map(([key, { unitHint, title }]) => {
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
            tooltipText={desc[key as UsageHistoryKey] ?? ''}
            config={columnConfig(data, period as Period, unitHint, isDarkMode)}
          />
        );
      })}
    </Flex>
  );
};

export default UsageHistoryStatistics;
