/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  SessionMetricGraphQuery,
  SessionMetricGraphQuery$data,
} from '../__generated__/SessionMetricGraphQuery.graphql';
import {
  convertToBinaryUnit,
  convertToDecimalUnit,
  toFixedFloorWithoutTrailingZeros,
} from '../helper';
import { useResourceSlotsDetails } from '../hooks/backendai';
import { theme } from '../theme-shim';
import './SessionMetricGraph.css';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { Heading } from '@astryxdesign/core/Heading';
import {
  BAIQuestionIconWithTooltip,
  BAIFlex,
  BAISkeleton,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { Suspense, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip as ChartTooltip,
} from 'recharts';

type MetricData = NonNullable<
  NonNullable<SessionMetricGraphQuery$data['current_metric']>['metrics']
>;

interface PrometheusMetricGraphProps {
  queryProps: {
    startDate: string;
    endDate: string;
    metricName: string;
    userId: string;
    dayDiff: number;
  };
  fetchKey: string;
  tooltip?: string | React.ReactNode;
}

// Split in two (FR-3682): the board item has no card chrome of its own, so
// the title lives inside this component — and this component is also the one
// that suspends. A boundary above it therefore unmounts the header on every
// fetch. The shell below never suspends; only the body does.
const SessionMetricGraph: React.FC<PrometheusMetricGraphProps> = (props) => {
  'use memo';
  const {
    queryProps: { metricName },
    tooltip,
  } = props;
  const { token } = theme.useToken();
  const { mergedResourceSlots } = useResourceSlotsDetails();

  const resourceSlotKey = useMemo(() => {
    const parts = _.split(metricName, '_');
    const devicePrefix =
      parts.length > 1 ? parts.slice(0, -1).join('-') : parts[0];
    return (
      _.find(
        _.keys(mergedResourceSlots),
        (slotKey) =>
          _.startsWith(slotKey, devicePrefix + '.') || slotKey === devicePrefix,
      ) ?? ''
    );
  }, [mergedResourceSlots, metricName]);
  const deviceDescription = mergedResourceSlots[resourceSlotKey]?.description;

  const getMetricTitle = () => {
    const [, ...rest] = _.split(metricName, '_');
    const restLabel = _.startCase(rest.join(' '));

    // TODO: Modify to use display name when display name is added to device metadata.
    // Currently, cuda and rocm have the same human_readable_name in device_metadata.
    if (deviceDescription) {
      return `${deviceDescription} ${restLabel}`;
    } else if (_.includes(metricName.toLowerCase(), 'io')) {
      return `${_.startCase(metricName.replaceAll('io', 'IO').replaceAll('_', ' '))}`;
    } else {
      return `${_.startCase(metricName.replaceAll('_', ' '))}`;
    }
  };

  return (
    <BAIFlex
      direction="column"
      align="stretch"
      gap="sm"
      style={{
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <BAIFlex align="center" style={{ height: 56, marginLeft: 52 }} gap="xs">
        <Heading level={5}>{getMetricTitle()}</Heading>
        {tooltip ? <BAIQuestionIconWithTooltip title={tooltip} /> : null}
      </BAIFlex>
      <Suspense
        fallback={
          // BAISkeleton spreads `style` onto every line box in paragraph
          // mode, so the inset has to ride on a wrapper.
          <BAIFlex
            direction="column"
            align="stretch"
            style={{ padding: token.marginMD }}
          >
            <BAISkeleton />
          </BAIFlex>
        }
      >
        <SessionMetricGraphBody {...props} />
      </Suspense>
    </BAIFlex>
  );
};

const SessionMetricGraphBody: React.FC<PrometheusMetricGraphProps> = ({
  queryProps: { startDate, endDate, metricName, userId, dayDiff },
  fetchKey,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const { capacity_metric, current_metric } =
    useLazyLoadQuery<SessionMetricGraphQuery>(
      graphql`
        query SessionMetricGraphQuery(
          $user_id: UUID!
          $capacityProps: UserUtilizationMetricQueryInput!
          $currentProps: UserUtilizationMetricQueryInput!
        ) {
          capacity_metric: user_utilization_metric(
            user_id: $user_id
            props: $capacityProps
          ) {
            user_id
            metrics {
              metric_name
              value_type
              values {
                timestamp
                value
              }
              max_value
              avg_value
            }
          }
          current_metric: user_utilization_metric(
            user_id: $user_id
            props: $currentProps
          ) {
            user_id
            metrics {
              metric_name
              value_type
              values {
                timestamp
                value
              }
              max_value
              avg_value
            }
          }
        }
      `,
      {
        user_id: userId,
        capacityProps: {
          metric_name: metricName,
          start: startDate,
          end: endDate,
          step: dayDiff < 7 ? '5m' : dayDiff < 30 ? '1h' : '1d',
          value_type: 'capacity',
        },
        currentProps: {
          metric_name: metricName,
          start: startDate,
          end: endDate,
          step: dayDiff < 7 ? '5m' : dayDiff < 30 ? '1h' : '1d',
          value_type: 'current',
        },
      },
      {
        fetchPolicy: 'store-and-network',
        fetchKey,
      },
    );

  const convertMetricFunction: Record<
    string,
    (value: string) => number | string
  > = {
    cpu_util: (value: string) => _.toNumber(value) / 10,
  };

  const metricData = getMetricData(
    capacity_metric?.metrics ?? [],
    current_metric?.metrics ?? [],
    startDate,
    endDate,
    dayDiff < 7 ? '5m' : dayDiff < 30 ? '1h' : '1d',
    convertMetricFunction[metricName] ?? undefined,
  );

  return (
    <>
      {_.isEmpty(capacity_metric?.metrics) &&
      _.isEmpty(current_metric?.metrics) ? (
        <EmptyState isCompact title={t('autoScalingRule.NoDataAvailable')} />
      ) : (
        <ResponsiveContainer style={{ paddingRight: token.marginXL }}>
          <LineChart
            data={metricData}
            className="session-metric-graph-recharts"
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" minTickGap={token.marginMD} />
            <YAxis domain={[0, 'dataMax']} />
            <ChartTooltip
              formatter={(value) => {
                return `${value}${convertMetricUnit(undefined, metricName).numberUnit}`;
              }}
            />
            <Legend />
            <ReferenceLine
              y={
                convertMetricUnit(
                  current_metric?.metrics?.[0]?.avg_value,
                  current_metric?.metrics?.[0]?.metric_name,
                ).number
              }
              label="Avg Used"
              stroke={token.red}
              strokeWidth={0.6}
              strokeDasharray="6 6"
            />
            <Line
              type="monotone"
              dataKey="capacity"
              stroke={token.colorSuccess}
              dot={{ r: 0 }}
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="used"
              stroke={token.colorError}
              strokeWidth={2}
              dot={{ r: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </>
  );
};

export default SessionMetricGraph;

const getMetricData = (
  capacityMetric: MetricData,
  currentMetric: MetricData,
  start: string,
  end: string,
  step: string,
  convertValueFunction?: (value: string) => number | string,
) => {
  // orders by capacity, current
  const transformedData = _.zip(
    capacityMetric[0]?.values ||
      Array(currentMetric[0]?.values?.length).fill(0),
    currentMetric[0]?.values,
  ).map(([capacity, current]) => {
    return {
      timestamp: current?.timestamp,
      capacity: convertValueFunction
        ? convertValueFunction(capacity?.value)
        : capacity?.value,
      used: convertValueFunction
        ? convertValueFunction(current?.value)
        : current?.value,
    };
  });

  const timeUnits = { s: 1, m: 60, h: 3600, d: 86400 };
  const stepUnit = step.slice(-1) as keyof typeof timeUnits;
  const stepValue = parseInt(step.slice(0, -1), 10);
  const stepSeconds = stepValue * timeUnits[stepUnit];

  const filledData = [];
  for (let i = Number(start); i < Number(end); i += stepSeconds) {
    const timestamp = i;
    const existData = _.find(
      transformedData,
      (data) => data.timestamp === timestamp,
    );
    filledData.push({
      timestamp: dayjs(timestamp * 1000).format('lll'),
      capacity: convertMetricUnit(
        existData?.capacity,
        currentMetric[0]?.metric_name,
      ).number,
      used: convertMetricUnit(existData?.used, currentMetric[0]?.metric_name)
        .number,
    });
  }

  return filledData;
};

const convertMetricUnit = (
  value: string | undefined | null,
  metricName: string | undefined | null,
) => {
  let number: number | undefined = undefined;
  let numberUnit: string | undefined = undefined;

  if (!metricName)
    return {
      number,
      numberUnit,
    };

  if (_.includes(metricName.toLowerCase(), 'util')) {
    number = Number(toFixedFloorWithoutTrailingZeros(value ?? 0, 1));
    numberUnit = '%';
  } else if (_.includes(metricName.toLowerCase(), 'used')) {
    number = Number((Number(value) / 1000).toFixed(1));
    numberUnit = 's';
  } else {
    const decimalUnitMetrics = ['io', 'net'];
    const isDecimalUnitMetric = _.some(decimalUnitMetrics, (unit) =>
      _.includes(_.toLower(metricName), unit),
    );
    number = _.toNumber(
      isDecimalUnitMetric
        ? convertToDecimalUnit(value ?? '0', 'g')?.numberFixed
        : convertToBinaryUnit(value ?? '0', 'g')?.numberFixed,
    );
    numberUnit = isDecimalUnitMetric ? 'GB' : 'GiB';
  }

  if (_.includes(_.toLower(metricName), 'net')) {
    numberUnit = 'GB/s';
  }
  number = value ? number : undefined;

  return {
    number,
    numberUnit,
  };
};
