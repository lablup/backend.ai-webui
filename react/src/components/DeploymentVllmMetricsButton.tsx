/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DeploymentVllmMetricsButtonPresetsQuery } from '../__generated__/DeploymentVllmMetricsButtonPresetsQuery.graphql';
import { DeploymentVllmMetricsButtonResultQuery } from '../__generated__/DeploymentVllmMetricsButtonResultQuery.graphql';
import { DeploymentVllmMetricsButton_deployment$key } from '../__generated__/DeploymentVllmMetricsButton_deployment.graphql';
import { toFixedFloorWithoutTrailingZeros } from '../helper';
import { App, DatePicker, Empty, Tooltip, Typography, theme } from 'antd';
import { createStyles } from 'antd-style';
import {
  BAIButton,
  BAIFetchKeyButton,
  BAIFlex,
  BAIModal,
  BAIUnmountAfterClose,
  toLocalId,
} from 'backend.ai-ui';
import dayjs, { Dayjs } from 'dayjs';
import * as _ from 'lodash-es';
import { ChartLineIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  fetchQuery,
  graphql,
  useFragment,
  useRelayEnvironment,
} from 'react-relay';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { IEnvironment } from 'relay-runtime';

const VLLM_PRESET_CATEGORY = 'vllm-inference';
const VLLM_RUNTIME_VARIANT = 'vllm';
// Seeded preset names end with the aggregation variant, e.g. "vLLM Queued
// Requests (avg)"; the captured token becomes the chart series key.
const VARIANT_SUFFIX_REGEX = /\((avg|max|min)\)\s*$/i;
// Step ladder aiming for ~100 data points per chart regardless of range.
const STEP_CHOICES_SECONDS = [60, 300, 900, 3600, 21600, 86400];
const CHART_HEIGHT = 240;

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

interface MetricChartData {
  metricName: string;
  title: string;
  seriesKeys: string[];
  points: Array<{ timestamp: number } & Record<string, number>>;
}

const presetsQuery = graphql`
  query DeploymentVllmMetricsButtonPresetsQuery {
    prometheusQueryPresets(limit: 100) {
      edges {
        node {
          id
          name
          metricName
          rank
          category @since(version: "26.4.3") {
            name
          }
        }
      }
    }
  }
`;

const resultQuery = graphql`
  query DeploymentVllmMetricsButtonResultQuery(
    $presetId: ID!
    $timeRange: QueryTimeRangeInput
    $options: ExecuteQueryDefinitionOptionsInput
  ) {
    prometheusQueryPresetResult(
      id: $presetId
      timeRange: $timeRange
      options: $options
    ) {
      status
      result {
        values {
          timestamp
          value
        }
      }
    }
  }
`;

const loadMetricCharts = async (
  relayEnvironment: IEnvironment,
  deploymentId: string,
  range: [Dayjs, Dayjs],
): Promise<MetricChartData[]> => {
  const presetsData = await fetchQuery<DeploymentVllmMetricsButtonPresetsQuery>(
    relayEnvironment,
    presetsQuery,
    {},
    { networkCacheConfig: { force: true } },
  ).toPromise();

  const presets = _.sortBy(
    _.compact(
      _.map(presetsData?.prometheusQueryPresets?.edges, (edge) => edge?.node),
    ).filter((node) => node.category?.name === VLLM_PRESET_CATEGORY),
    'rank',
  );

  const durationSeconds = Math.max(range[1].diff(range[0], 'second'), 60);
  const stepSeconds =
    STEP_CHOICES_SECONDS.find((step) => durationSeconds / step <= 100) ??
    _.last(STEP_CHOICES_SECONDS);
  const timeRange = {
    start: range[0].toISOString(),
    end: range[1].toISOString(),
    step: `${stepSeconds}s`,
  };
  // The result resolver rejects null label arrays (pydantic list validation),
  // so both filterLabels and groupLabels must always be sent as arrays.
  const options = {
    filterLabels: [{ key: 'deployment_id', value: deploymentId }],
    groupLabels: ['deployment_id'],
  };

  const results = await Promise.all(
    presets.map((preset) =>
      fetchQuery<DeploymentVllmMetricsButtonResultQuery>(
        relayEnvironment,
        resultQuery,
        {
          // The resolver expects the raw UUID, not the Relay global ID.
          presetId: toLocalId(preset.id),
          timeRange,
          options,
        },
        { networkCacheConfig: { force: true } },
      )
        .toPromise()
        .then((data) => ({ preset, data })),
    ),
  );

  const orderedMetricNames = _.uniq(_.map(presets, 'metricName'));
  return orderedMetricNames.map((metricName) => {
    const group = results.filter(
      ({ preset }) => preset.metricName === metricName,
    );
    const title = group[0].preset.name.replace(VARIANT_SUFFIX_REGEX, '').trim();
    const seriesKeys: string[] = [];
    const pointMap = new Map<number, Record<string, number>>();
    group.forEach(({ preset, data }) => {
      const suffixMatch = preset.name.match(VARIANT_SUFFIX_REGEX);
      const seriesKey = suffixMatch
        ? suffixMatch[1].toLowerCase()
        : preset.name;
      seriesKeys.push(seriesKey);
      // With the deployment_id filter + grouping there is at most one series.
      const values =
        data?.prometheusQueryPresetResult?.result?.[0]?.values ?? [];
      values.forEach((point) => {
        const timestampMs = point.timestamp * 1000;
        const merged = pointMap.get(timestampMs) ?? {};
        merged[seriesKey] = parseFloat(point.value);
        pointMap.set(timestampMs, merged);
      });
    });
    const points = _.sortBy([...pointMap.entries()], ([timestampMs]) =>
      _.toNumber(timestampMs),
    ).map(([timestampMs, values]) => ({ timestamp: timestampMs, ...values }));
    return { metricName, title, seriesKeys, points };
  });
};

interface MetricChartPanelProps {
  chart: MetricChartData;
  range: [Dayjs, Dayjs];
}

const MetricChartPanel: React.FC<MetricChartPanelProps> = ({
  chart,
  range,
}) => {
  'use memo';
  const { token } = theme.useToken();
  const { styles } = useStyle();
  const seriesPalette = [
    token.colorPrimary,
    token.colorError,
    token.colorSuccess,
  ];
  const spansMultipleDays = !range[0].isSame(range[1], 'day');

  return (
    <BAIFlex direction="column" align="stretch" gap="xs">
      <Typography.Text strong>{chart.title}</Typography.Text>
      {chart.points.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ height: CHART_HEIGHT, alignContent: 'center' }}
        />
      ) : (
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <LineChart data={chart.points} className={styles.recharts}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              type="number"
              scale="time"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(timestampMs) =>
                dayjs(timestampMs).format(
                  spansMultipleDays ? 'MM-DD HH:mm' : 'HH:mm',
                )
              }
              minTickGap={token.marginMD}
            />
            <YAxis domain={[0, 'auto']} width={56} />
            <ChartTooltip
              labelFormatter={(timestampMs) =>
                dayjs(timestampMs as number).format('YYYY-MM-DD HH:mm:ss')
              }
              formatter={(value) =>
                _.isNumber(value)
                  ? toFixedFloorWithoutTrailingZeros(value, 4)
                  : value
              }
            />
            <Legend />
            {chart.seriesKeys.map((seriesKey, index) => (
              <Line
                key={seriesKey}
                type="monotone"
                dataKey={seriesKey}
                stroke={seriesPalette[index % seriesPalette.length]}
                strokeWidth={2}
                dot={{ r: 0 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </BAIFlex>
  );
};

interface DeploymentVllmMetricsModalProps {
  open: boolean;
  initialCharts: MetricChartData[];
  initialRange: [Dayjs, Dayjs];
  loadCharts: (range: [Dayjs, Dayjs]) => Promise<MetricChartData[]>;
  onRequestClose: () => void;
}

const DeploymentVllmMetricsModal: React.FC<DeploymentVllmMetricsModalProps> = ({
  open,
  initialCharts,
  initialRange,
  loadCharts,
  onRequestClose,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const [charts, setCharts] = useState(initialCharts);
  const [range, setRange] = useState(initialRange);
  const [isReloading, setIsReloading] = useState(false);

  const reload = async (nextRange: [Dayjs, Dayjs]) => {
    setIsReloading(true);
    try {
      setCharts(await loadCharts(nextRange));
    } catch {
      message.error(t('deployment.FailedToLoadInferenceMetrics'));
    } finally {
      setIsReloading(false);
    }
  };

  return (
    <BAIModal
      open={open}
      onCancel={onRequestClose}
      title={t('deployment.InferenceMetrics')}
      width={1100}
      footer={null}
    >
      <BAIFlex direction="column" align="stretch" gap="md">
        <BAIFlex justify="between" align="center" gap="sm" wrap="wrap">
          <DatePicker.RangePicker
            showTime
            allowClear={false}
            value={range}
            onChange={(dates) => {
              if (dates?.[0] && dates?.[1]) {
                const nextRange: [Dayjs, Dayjs] = [dates[0], dates[1]];
                setRange(nextRange);
                reload(nextRange);
              }
            }}
          />
          <BAIFetchKeyButton
            loading={isReloading}
            value=""
            onChange={() => reload(range)}
          />
        </BAIFlex>
        {charts.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))',
              gap: token.margin,
              opacity: isReloading ? 0.5 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            {charts.map((chart) => (
              <MetricChartPanel
                key={chart.metricName}
                chart={chart}
                range={range}
              />
            ))}
          </div>
        )}
      </BAIFlex>
    </BAIModal>
  );
};

interface DeploymentVllmMetricsButtonProps {
  deploymentFrgmt: DeploymentVllmMetricsButton_deployment$key;
}

const DeploymentVllmMetricsButton: React.FC<
  DeploymentVllmMetricsButtonProps
> = ({ deploymentFrgmt }) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const relayEnvironment = useRelayEnvironment();
  const deployment = useFragment(
    graphql`
      fragment DeploymentVllmMetricsButton_deployment on ModelDeployment {
        id
        currentRevision @since(version: "26.4.3") {
          modelRuntimeConfig {
            runtimeVariant {
              name
            }
          }
        }
      }
    `,
    deploymentFrgmt,
  );

  const [modalState, setModalState] = useState<{
    initialCharts: MetricChartData[];
    initialRange: [Dayjs, Dayjs];
  } | null>(null);

  if (
    deployment.currentRevision?.modelRuntimeConfig?.runtimeVariant?.name !==
    VLLM_RUNTIME_VARIANT
  ) {
    return null;
  }

  const loadCharts = (range: [Dayjs, Dayjs]) =>
    loadMetricCharts(relayEnvironment, toLocalId(deployment.id), range);

  return (
    <>
      <Tooltip title={t('deployment.InferenceMetricsTooltip')}>
        <BAIButton
          icon={<ChartLineIcon />}
          action={async () => {
            const range: [Dayjs, Dayjs] = [dayjs().startOf('day'), dayjs()];
            try {
              const initialCharts = await loadCharts(range);
              setModalState({ initialCharts, initialRange: range });
            } catch {
              message.error(t('deployment.FailedToLoadInferenceMetrics'));
            }
          }}
        />
      </Tooltip>
      <BAIUnmountAfterClose>
        <DeploymentVllmMetricsModal
          open={!!modalState}
          initialCharts={modalState?.initialCharts ?? []}
          initialRange={
            modalState?.initialRange ?? [dayjs().startOf('day'), dayjs()]
          }
          loadCharts={loadCharts}
          onRequestClose={() => setModalState(null)}
        />
      </BAIUnmountAfterClose>
    </>
  );
};

export default DeploymentVllmMetricsButton;
