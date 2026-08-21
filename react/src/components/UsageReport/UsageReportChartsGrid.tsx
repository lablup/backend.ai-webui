/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import UsageReportEmptySection from './UsageReportEmptySection';
import { UsageReportDailyPoint } from './types';
import { BAICard } from 'backend.ai-ui';
import dayjs from 'dayjs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts';

// Chart stroke/fill literals are acceptable per theme-shim precedent.
const CHART_COLORS = {
  cpu: '#4C7DFA',
  gpu: '#F2A93B',
  mem: '#43B79B',
  sessions: '#7A6FF0',
};

const CHART_HEIGHT = 170;

interface ChartPoint extends UsageReportDailyPoint {
  label: string;
}

const hasAny = (
  series: ChartPoint[],
  keys: Array<keyof UsageReportDailyPoint>,
) => series.some((p) => keys.some((k) => p[k] != null));

const UtilizationChart: React.FC<{ series: ChartPoint[] }> = ({ series }) => {
  'use memo';
  return (
    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
      <AreaChart
        data={series}
        margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.4} />
        <XAxis dataKey="label" fontSize={11} />
        <YAxis unit="%" domain={[0, 100]} fontSize={11} />
        <ChartTooltip />
        <Area
          dataKey="cpuUtilPercent"
          name="CPU"
          stroke={CHART_COLORS.cpu}
          fill={CHART_COLORS.cpu}
          fillOpacity={0.15}
          connectNulls={false}
        />
        <Area
          dataKey="gpuUtilPercent"
          name="GPU"
          stroke={CHART_COLORS.gpu}
          fill={CHART_COLORS.gpu}
          fillOpacity={0.15}
          connectNulls={false}
        />
        <Area
          dataKey="memUtilPercent"
          name="MEM"
          stroke={CHART_COLORS.mem}
          fill={CHART_COLORS.mem}
          fillOpacity={0.12}
          connectNulls={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

const DailyBarChart: React.FC<{
  series: ChartPoint[];
  dataKey: 'gpuHours' | 'cpuHours' | 'sessions';
  color: string;
  name: string;
}> = ({ series, dataKey, color, name }) => {
  'use memo';
  return (
    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
      <BarChart
        data={series}
        margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.4} />
        <XAxis dataKey="label" fontSize={11} />
        <YAxis fontSize={11} />
        <ChartTooltip />
        <Bar dataKey={dataKey} name={name} fill={color} radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

interface UsageReportChartsGridProps {
  dailySeries: UsageReportDailyPoint[];
}

const UsageReportChartsGrid: React.FC<UsageReportChartsGridProps> = ({
  dailySeries,
}) => {
  'use memo';
  const { t } = useTranslation();
  const series: ChartPoint[] = dailySeries.map((p) => ({
    ...p,
    label: dayjs(p.date).format('MM-DD'),
  }));

  const barCharts = [
    {
      key: 'gpuHours' as const,
      title: t('usageReport.GPUHoursPerDay'),
      color: CHART_COLORS.gpu,
    },
    {
      key: 'cpuHours' as const,
      title: t('usageReport.CPUHoursPerDay'),
      color: CHART_COLORS.cpu,
    },
    {
      key: 'sessions' as const,
      title: t('usageReport.SessionsPerDay'),
      color: CHART_COLORS.sessions,
    },
  ];

  return (
    <div className="usage-report-grid">
      <BAICard
        className="usage-report-card usage-report-chart"
        size="small"
        title={t('usageReport.UtilizationPercent')}
      >
        {hasAny(series, [
          'cpuUtilPercent',
          'gpuUtilPercent',
          'memUtilPercent',
        ]) ? (
          <UtilizationChart series={series} />
        ) : (
          <UsageReportEmptySection height={CHART_HEIGHT} />
        )}
      </BAICard>
      {barCharts.map(({ key, title, color }) => (
        <BAICard
          key={key}
          className="usage-report-card usage-report-chart"
          size="small"
          title={title}
        >
          {hasAny(series, [key]) ? (
            <DailyBarChart
              series={series}
              dataKey={key}
              color={color}
              name={title}
            />
          ) : (
            <UsageReportEmptySection height={CHART_HEIGHT} />
          )}
        </BAICard>
      ))}
    </div>
  );
};

export default UsageReportChartsGrid;
