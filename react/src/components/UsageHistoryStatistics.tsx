import { convertBinarySizeUnit, SizeUnit } from '../helper';
import { useThemeMode } from '../hooks/useThemeMode';
import useUserStats, { Period, UsageHistoryKey } from '../hooks/useUserStats';
import Flex from './Flex';
import { Column, ColumnConfig } from '@ant-design/charts';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Button, Card, theme, Tooltip } from 'antd';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

type Unit = 'B' | 'KiB' | 'MiB' | 'GiB' | 'TiB' | 'PiB' | 'EiB';

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
  unitHint: Unit | 'count',
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

const keys: Partial<{
  [key in UsageHistoryKey]: {
    unitHint: SizeUnit | 'count';
    unit: 'count' | Unit;
    title: UsageHistoryTitle;
  };
}> = {
  num_sessions: {
    unitHint: 'count',
    unit: 'count',
    title: 'Sessions',
  },
  cpu_allocated: {
    unitHint: 'count',
    unit: 'count',
    title: 'CPU',
  },
  mem_allocated: {
    unitHint: 'G',
    unit: 'GiB',
    title: 'Memory',
  },
  gpu_allocated: {
    unitHint: 'count',
    unit: 'count',
    title: 'GPU',
  },
  io_read_bytes: {
    unitHint: 'M',
    unit: 'MiB',
    title: 'IO-Read',
  },
  io_write_bytes: {
    unitHint: 'M',
    unit: 'MiB',
    title: 'IO-Write',
  },
};
const usageHistoryKeys = Object.keys(keys) as UsageHistoryKey[];

const formatValue = (value: number, unitHint: SizeUnit | 'count') => {
  if (unitHint === 'count') {
    return value;
  } else {
    return convertBinarySizeUnit(value.toString() + 'B', unitHint)?.number ?? 0;
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
      {Object.entries(keys).map(([key, { unitHint, title, unit }]) => {
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
            config={columnConfig(data, period as Period, unit, isDarkMode)}
          />
        );
      })}
    </Flex>
  );
};

export default UsageHistoryStatistics;
