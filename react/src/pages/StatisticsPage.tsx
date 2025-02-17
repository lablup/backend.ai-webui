import BAICard from '../components/BAICard';
import Flex from '../components/Flex';
import useUserStats, { Period, UsageHistoryKey } from '../hooks/useUserStats';
import { Column, ColumnConfig, Line, LineConfig } from '@ant-design/charts';
import { Alert, Select, theme, Typography } from 'antd';
import { format } from 'date-fns';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StringParam, useQueryParam, withDefault } from 'use-query-params';

interface GraphContainerProps {
  title: string;
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
  const { token } = theme.useToken();
  return (
    <>
      <Typography.Title level={5} style={{ marginBottom: token.marginLG }}>
        {title}
      </Typography.Title>
      <div style={{ width: '100%' }}>
        {graph === 'line' ? (
          <Line height={height} {...(config as LineConfig)} />
        ) : (
          <Column height={height} {...(config as ColumnConfig)} />
        )}
      </div>
    </>
  );
};

const lineConfig = (data: any, period: Period, color: string): LineConfig => ({
  data,
  xField: 'date',
  yField: 'value',
  point: {
    shapeField: 'circle',
    sizeField: 3,
    style: {
      fill: color,
      stroke: color,
    },
  },
  interaction: {
    tooltip: {
      marker: false,
    },
  },
  style: {
    lineWidth: 2,
    stroke: color,
  },
  axis: {
    x: {
      labelAutoHide: true,
      tickFilter: (_: any, index: any) =>
        index % (period === '1D' ? 12 : 48) === 0,
    },
  },
});

const columnConfig = (
  data: any,
  period: Period,
  color: string,
): ColumnConfig => ({
  data,
  xField: 'date',
  yField: 'value',
  style: {
    fill: color,
  },
  axis: {
    x: {
      labelAutoHide: true,
      tickFilter: (_: any, index: any) =>
        index % (period === '1D' ? 12 : 48) === 0,
    },
  },
  animate: { enter: { type: 'growInY' } },
});

const UsageHistoryStatistics = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [period] = useQueryParam('period', periodParam);
  console.log(period);
  const keys: Partial<{
    [key in UsageHistoryKey]: {
      type: 'line' | 'column';
      color: string;
    };
  }> = {
    num_sessions: {
      type: 'column',
      color: '#ec407a',
    },
    cpu_allocated: {
      type: 'column',
      color: '#9ccc65',
    },
    mem_allocated: {
      type: 'line',
      color: '#ffa726',
    },
    gpu_allocated: {
      type: 'line',
      color: '#26c6da',
    },
    io_read_bytes: {
      type: 'line',
      color: '#3677eb',
    },
    io_write_bytes: {
      type: 'line',
      color: '#003f5c',
    },
  };
  const { data: userStats } = useUserStats(
    Object.keys(keys) as UsageHistoryKey[],
    period as Period,
  );

  return (
    <Flex
      direction="column"
      style={{
        padding: token.paddingContentHorizontal,
      }}
      align="start"
    >
      <Alert showIcon message={t('statistics.UsageHistoryNote')} type="info" />
      {Object.entries(keys).map(([key, { type, color }]) => {
        const data = userStats.map((d) => {
          return {
            date: format(d.date.toString(), 'MMM dd HH:mm'),
            value: d.data[key].value,
          };
        });

        return (
          <GraphContainer
            key={key}
            title={key}
            graph={type}
            config={
              type === 'line'
                ? lineConfig(data, period as Period, color)
                : columnConfig(data, period as Period, color)
            }
          />
        );
      })}
    </Flex>
  );
};

type TabKey = 'usageHistory';

const tabParam = withDefault(StringParam, 'usageHistory');
const periodParam = withDefault(StringParam, '1D');

const StatisticsPage = () => {
  const { t } = useTranslation();
  const [curTabKey, setCurTabKey] = useQueryParam('tab', tabParam);
  const [period, setPeriod] = useQueryParam('period', periodParam);
  console.log(period);

  return (
    <BAICard
      activeTabKey="usageHistory"
      title={t('webui.menu.Statistics')}
      onTabChange={(key) => setCurTabKey(key as TabKey)}
      tabList={[
        {
          key: 'usageHistory',
          tab: t('statistics.UsageHistory'),
        },
      ]}
      styles={{ body: { padding: 0 } }}
      extra={
        <Select
          popupMatchSelectWidth={false}
          options={[
            { label: '1D', value: '1D' },
            { label: '1W', value: '1W' },
          ]}
          value={period}
          onChange={(value) => setPeriod(value)}
        />
      }
    >
      {curTabKey === 'usageHistory' && <UsageHistoryStatistics />}
    </BAICard>
  );
};

export default StatisticsPage;
