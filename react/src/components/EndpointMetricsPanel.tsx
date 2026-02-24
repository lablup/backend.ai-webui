/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  useEndpointLiveStat,
  type InferenceMetric,
  type TimeSeriesDataPoint,
} from '../hooks/useEndpointLiveStat';
import { Empty, Select, Tag, Typography, theme } from 'antd';
import { createStyles } from 'antd-style';
import { BAIFlex } from 'backend.ai-ui';
import _ from 'lodash';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
} from 'recharts';

const useStyle = createStyles(({ css, token }) => ({
  recharts: css`
    .recharts-cartesian-axis-line {
      stroke: ${token.colorBorder};
    }
    .recharts-cartesian-axis-tick-line {
      stroke: ${token.colorBorder};
    }
    .recharts-cartesian-axis-tick-value {
      fill: ${token.colorTextDescription};
    }
    .recharts-default-tooltip {
      background-color: ${token.colorBgBase} !important;
      border: 1px solid ${token.colorBorderSecondary} !important;
      color: ${token.colorText} !important;
    }
  `,
}));

interface EndpointMetricsPanelProps {
  endpointId: string;
  enabled: boolean;
}

const metricTypeColor: Record<string, string> = {
  GAUGE: 'blue',
  COUNTER: 'green',
  ACCUMULATION: 'green',
  HISTOGRAM: 'orange',
};

const EndpointMetricsPanel: React.FC<EndpointMetricsPanelProps> = ({
  endpointId,
  enabled,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { styles } = useStyle();
  const { currentStat, timeSeries, metricNames, isLoading } =
    useEndpointLiveStat(endpointId, enabled);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  // Auto-select first metric if none selected
  const activeMetric = selectedMetric ?? metricNames[0] ?? null;
  const activeMetricData: InferenceMetric | null =
    activeMetric && currentStat ? (currentStat[activeMetric] ?? null) : null;

  const lineChartData = useMemo(() => {
    if (!activeMetric) return [];
    return timeSeries
      .map((point: TimeSeriesDataPoint) => {
        const metric = point.metrics[activeMetric];
        if (!metric || metric.__type === 'HISTOGRAM') return null;
        return {
          time: new Date(point.timestamp).toLocaleTimeString(),
          value: parseFloat(metric.current) || 0,
        };
      })
      .filter(Boolean);
  }, [timeSeries, activeMetric]);

  const activeMetricCurrent = activeMetricData?.current;
  const histogramData = useMemo(() => {
    if (!activeMetricData || activeMetricData.__type !== 'HISTOGRAM') return [];
    return Object.entries(activeMetricCurrent as Record<string, string>).map(
      ([bucket, count]) => ({
        bucket,
        count: parseInt(count) || 0,
      }),
    );
  }, [activeMetricData, activeMetricCurrent]);

  if (!currentStat && !isLoading) {
    return <Empty description={t('modelService.NoMetricsAvailable')} />;
  }

  return (
    <BAIFlex direction="column" gap="md" style={{ width: '100%' }}>
      <BAIFlex gap="sm" align="center">
        <Select
          style={{ minWidth: 200 }}
          placeholder={t('modelService.SelectMetric')}
          value={activeMetric}
          onChange={setSelectedMetric}
          options={metricNames.map((name) => ({
            label: name,
            value: name,
          }))}
        />
        {activeMetricData && (
          <Tag color={metricTypeColor[activeMetricData.__type] ?? 'default'}>
            {activeMetricData.__type}
          </Tag>
        )}
        {activeMetricData && activeMetricData.__type !== 'HISTOGRAM' && (
          <Typography.Text>
            {t('modelService.MetricValue')}:{' '}
            <Typography.Text strong>{activeMetricData.current}</Typography.Text>
            {activeMetricData.unit_hint && (
              <Typography.Text type="secondary">
                {' '}
                {activeMetricData.unit_hint}
              </Typography.Text>
            )}
          </Typography.Text>
        )}
      </BAIFlex>

      <div className={styles.recharts}>
        {activeMetricData?.__type === 'HISTOGRAM' ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={histogramData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bucket" />
              <YAxis />
              <ChartTooltip />
              <Bar
                dataKey="count"
                fill={token.colorPrimary}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <ChartTooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke={token.colorPrimary}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* TODO(needs-backend): FR-2112 - Historical time-series API would allow
          querying metrics with configurable time ranges instead of client-side polling buffer */}
    </BAIFlex>
  );
};

export default EndpointMetricsPanel;
