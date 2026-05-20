/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { convertToBinaryUnit, convertToDecimalUnit, SizeUnit } from '../helper';
import {
  UserStatsData,
  UserStatsDataKey,
  useSuspendedBackendaiClient,
} from '../hooks';
import { useThemeMode } from '../hooks/useThemeMode';
import useUserUsageStats from '../hooks/useUserUsageStats';
import { Period } from './AllocationHistory';
import QuestionIconWithTooltip from './QuestionIconWithTooltip';
import { Card, theme } from 'antd';
import { createStyles } from 'antd-style';
import { BAIFlex } from 'backend.ai-ui';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts';

const useStyles = createStyles(({ css, token }) => ({
  graphCard: css`
    .recharts-cartesian-axis-line {
      stroke: ${token.colorBorder};
    }
    .recharts-cartesian-axis-tick-line {
      stroke: ${token.colorBorder};
    }
    .recharts-cartesian-axis-tick-value {
      fill: ${token.colorTextDescription};
    }
    .recharts-label {
      fill: ${token.colorTextDescription};
    }
    .recharts-default-tooltip {
      background-color: ${token.colorBgBase} !important;
      border: 1px solid ${token.colorBorderSecondary} !important;
      color: ${token.colorText} !important;
    }
    .recharts-tooltip-label {
      color: ${token.colorText} !important;
    }
    .recharts-tooltip-item {
      color: ${token.colorText} !important;
    }
  `,
}));

type ByteUnit = 'B' | 'KiB' | 'MiB' | 'GiB' | 'TiB' | 'PiB' | 'EiB';
type DecimalUnit = 'B' | 'KB' | 'MB' | 'GB' | 'TB' | 'PB' | 'EB';

const DAY_LENGTH = 4 * 24;
const WEEK_LENGTH = DAY_LENGTH * 7;

interface GraphCardProps {
  title: string;
  tooltipText?: string;
  children: React.ReactNode;
}
export const GraphCard = ({ title, tooltipText, children }: GraphCardProps) => (
  <Card
    type="inner"
    title={
      <BAIFlex gap={'xxs'}>
        {title}
        {tooltipText ? <QuestionIconWithTooltip title={tooltipText} /> : null}
      </BAIFlex>
    }
    style={{ width: '100%' }}
  >
    {children}
  </Card>
);

interface UsageBarChartProps {
  data: UserStatsData[];
  dataKey: UserStatsDataKey;
  period: Period;
  targetUnit: SizeUnit | 'count';
  displayUnit: ByteUnit | DecimalUnit | 'count';
  unitType: 'byte' | 'decimal' | 'count';
  height?: number;
}

const UsageBarChart: React.FC<UsageBarChartProps> = ({
  data,
  dataKey,
  period,
  targetUnit,
  displayUnit,
  unitType,
  height = 200,
}) => {
  'use memo';
  const { token } = theme.useToken();
  const { styles } = useStyles();
  const { isDarkMode } = useThemeMode();

  const formatValue = (value: number) => {
    if (unitType === 'count') {
      return value;
    }
    if (unitType === 'byte') {
      return convertToBinaryUnit(value, targetUnit as SizeUnit)?.number ?? 0;
    }
    if (unitType === 'decimal') {
      return convertToDecimalUnit(value, targetUnit as SizeUnit)?.number ?? 0;
    }
    return value;
  };

  const windowLength = period === '1D' ? DAY_LENGTH : WEEK_LENGTH;
  // 1D: tick every 3 hours (12 * 15min) labeled as "HH:mm".
  // 1W: tick every 24 hours (96 * 15min) labeled as "MMM DD".
  const tickStep = period === '1D' ? 12 : 96;
  const tickFormat = period === '1D' ? 'HH:mm' : 'MMM DD';

  const chartData = data
    .filter((_, i) => data.length - windowLength <= i)
    .map((d, i) => {
      const m = dayjs(d.date * 1000);
      return {
        index: i,
        axisLabel: m.format(tickFormat),
        tooltipLabel: m.format('MMM DD HH:mm'),
        value: formatValue(d[dataKey].value),
      };
    });

  const tickValues = chartData
    .filter((d) => d.index % tickStep === 0)
    .map((d) => d.index);

  return (
    <ResponsiveContainer
      width="100%"
      height={height}
      className={styles.graphCard}
    >
      <BarChart
        data={chartData}
        margin={{ top: 24, right: 16, bottom: 8, left: 8 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={token.colorBorderSecondary}
        />
        <XAxis
          dataKey="index"
          type="number"
          domain={['dataMin', 'dataMax']}
          ticks={tickValues}
          interval={0}
          tickFormatter={(i: number) => chartData[i]?.axisLabel ?? ''}
        />
        <YAxis
          label={{
            value: displayUnit,
            position: 'top',
            offset: 12,
            fill: token.colorTextDescription,
          }}
        />
        <ChartTooltip
          cursor={{
            fill: isDarkMode
              ? token.colorFillSecondary
              : token.colorFillTertiary,
          }}
          labelFormatter={(i: number) => chartData[i]?.tooltipLabel ?? ''}
        />
        <Bar
          dataKey="value"
          name={displayUnit}
          fill={token.colorPrimary}
          isAnimationActive
          animationDuration={400}
          animationEasing="ease-out"
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

interface AllocationHistoryStatisticsProps {
  period: Period;
  fetchKey?: string;
}

const AllocationHistoryStatistics: React.FC<
  AllocationHistoryStatisticsProps
> = ({ period, fetchKey }) => {
  'use memo';
  const { t } = useTranslation();
  const { data } = useUserUsageStats({
    fetchKey,
  });
  const baiClient = useSuspendedBackendaiClient();

  return (
    <BAIFlex direction="column" align="start" gap="md">
      <GraphCard title="Sessions" tooltipText={t('statistics.SessionsDesc')}>
        <UsageBarChart
          data={data}
          dataKey="num_sessions"
          period={period}
          targetUnit="count"
          displayUnit="count"
          unitType="count"
        />
      </GraphCard>
      <GraphCard title="CPU" tooltipText={t('statistics.CPUDesc')}>
        <UsageBarChart
          data={data}
          dataKey="cpu_allocated"
          period={period}
          targetUnit="count"
          displayUnit="count"
          unitType="count"
        />
      </GraphCard>
      <GraphCard title="Memory" tooltipText={t('statistics.MemoryDesc')}>
        <UsageBarChart
          data={data}
          dataKey="mem_allocated"
          period={period}
          targetUnit="g"
          displayUnit="GiB"
          unitType="byte"
        />
      </GraphCard>
      <GraphCard title="GPU" tooltipText={t('statistics.GPUDesc')}>
        <UsageBarChart
          data={data}
          dataKey="gpu_allocated"
          period={period}
          targetUnit="count"
          displayUnit="count"
          unitType="count"
        />
      </GraphCard>
      {!baiClient?.supports('user-metrics') ? (
        <>
          <GraphCard title="IO-Read" tooltipText={t('statistics.IOReadDesc')}>
            <UsageBarChart
              data={data}
              dataKey="io_read_bytes"
              period={period}
              targetUnit="m"
              displayUnit="MiB"
              unitType="decimal"
            />
          </GraphCard>
          <GraphCard title="IO-Write" tooltipText={t('statistics.IOWriteDesc')}>
            <UsageBarChart
              data={data}
              dataKey="io_write_bytes"
              period={period}
              targetUnit="m"
              displayUnit="MiB"
              unitType="decimal"
            />
          </GraphCard>
        </>
      ) : null}
    </BAIFlex>
  );
};

export default AllocationHistoryStatistics;
