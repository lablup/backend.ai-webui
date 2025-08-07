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
import { Column, ColumnConfig } from '@ant-design/charts';
import { Card } from 'antd';
import { createStyles } from 'antd-style';
import { BAIFlex } from 'backend.ai-ui';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

const useStyles = createStyles(({ css, token }) => ({
  graphCard: css`
    .g2-tooltip {
      background-color: ${token.colorBgSpotlight} !important;
      border: none !important;
    }
    .g2-tooltip-title {
      color: ${token.colorTextLightSolid} !important;
    }
    .g2-tooltip-list-item-name {
      color: ${token.colorTextLightSolid} !important;
    }
    .g2-tooltip-list-item-value {
      color: ${token.colorTextLightSolid} !important;
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

interface getColumnConfigParams {
  data: UserStatsData[];
  key: UserStatsDataKey;
  period: Period;
  targetUnit: SizeUnit | 'count';
  displayUnit: ByteUnit | DecimalUnit | 'count';
  unitType: 'byte' | 'decimal' | 'count';
  isDarkMode: boolean;
}

const getColumnConfig = ({
  data,
  key,
  period,
  targetUnit,
  displayUnit,
  unitType,
  isDarkMode,
}: getColumnConfigParams): ColumnConfig => {
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

  return {
    data: data
      .filter(
        (_, i) =>
          data.length - (period === '1D' ? DAY_LENGTH : WEEK_LENGTH) <= i,
      )
      .map((d) => ({
        date: dayjs(d.date * 1000).format('MMM DD HH:mm'),
        value: formatValue(d[key].value),
      })),
    xField: 'date',
    yField: 'value',
    axis: {
      x: {
        labelAutoHide: true,
        tickFilter: (_: any, index: any) =>
          index % (period === '1D' ? 12 : 48) === 0,
      },
      y: {
        title: displayUnit,
      },
    },
    animate: { enter: { type: 'growInY' } },
    theme: isDarkMode ? 'dark' : 'light',
  };
};

interface AllocationHistoryStatisticsProps {
  period: Period;
  fetchKey?: string;
}

const AllocationHistoryStatistics: React.FC<
  AllocationHistoryStatisticsProps
> = ({ period, fetchKey }) => {
  const { t } = useTranslation();
  const { data } = useUserUsageStats({
    fetchKey,
  });
  const { isDarkMode } = useThemeMode();
  const { styles } = useStyles();
  const baiClient = useSuspendedBackendaiClient();

  return (
    <BAIFlex
      className={styles.graphCard}
      direction="column"
      align="start"
      gap="md"
    >
      <GraphCard title="Sessions" tooltipText={t('statistics.SessionsDesc')}>
        <Column
          height={200}
          {...getColumnConfig({
            data,
            key: 'num_sessions',
            period,
            targetUnit: 'count',
            displayUnit: 'count',
            unitType: 'count',
            isDarkMode,
          })}
        />
      </GraphCard>
      <GraphCard title="CPU" tooltipText={t('statistics.CPUDesc')}>
        <Column
          height={200}
          {...getColumnConfig({
            data,
            key: 'cpu_allocated',
            period,
            targetUnit: 'count',
            displayUnit: 'count',
            unitType: 'count',
            isDarkMode,
          })}
        />
      </GraphCard>
      <GraphCard title="Memory" tooltipText={t('statistics.MemoryDesc')}>
        <Column
          height={200}
          {...getColumnConfig({
            data,
            key: 'mem_allocated',
            period,
            targetUnit: 'g',
            displayUnit: 'GiB',
            unitType: 'byte',
            isDarkMode,
          })}
        />
      </GraphCard>
      <GraphCard title="GPU" tooltipText={t('statistics.GPUDesc')}>
        <Column
          height={200}
          {...getColumnConfig({
            data,
            key: 'gpu_allocated',
            period,
            targetUnit: 'count',
            displayUnit: 'count',
            unitType: 'count',
            isDarkMode,
          })}
        />
      </GraphCard>
      {!baiClient?.supports('user-metrics') ? (
        <>
          <GraphCard title="IO-Read" tooltipText={t('statistics.IOReadDesc')}>
            <Column
              height={200}
              {...getColumnConfig({
                data,
                key: 'io_read_bytes',
                period,
                targetUnit: 'm',
                displayUnit: 'MiB',
                unitType: 'decimal',
                isDarkMode,
              })}
            />
          </GraphCard>
          <GraphCard title="IO-Write" tooltipText={t('statistics.IOWriteDesc')}>
            <Column
              height={200}
              {...getColumnConfig({
                data,
                key: 'io_write_bytes',
                period,
                targetUnit: 'm',
                displayUnit: 'MiB',
                unitType: 'decimal',
                isDarkMode,
              })}
            />
          </GraphCard>
        </>
      ) : null}
    </BAIFlex>
  );
};

export default AllocationHistoryStatistics;
