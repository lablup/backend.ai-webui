import {
  convertBinarySizeUnit,
  toFixedFloorWithoutTrailingZeros,
} from '../helper';
import { useResourceSlotsDetails } from '../hooks/backendai';
import BAICard from './BAICard';
import {
  SessionMetricGraphQuery,
  SessionMetricGraphQuery$data,
} from './__generated__/SessionMetricGraphQuery.graphql';
import { Empty, theme } from 'antd';
import { createStyles } from 'antd-style';
import graphql from 'babel-plugin-relay/macro';
import dayjs from 'dayjs';
import _ from 'lodash';
import { useLazyLoadQuery } from 'react-relay';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

const useStyle = createStyles(({ css, token }) => ({
  recharts: css`
    .recharts-label {
      fill: ${token.colorTextDescription};
    }
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
      background-color: ${token.colorBgSpotlight} !important;
      border: none !important;
      color: ${token.colorTextLightSolid} !important;
    }
  `,
}));

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
}

const SessionMetricGraph: React.FC<PrometheusMetricGraphProps> = ({
  queryProps: { startDate, endDate, metricName, userId, dayDiff },
  fetchKey,
}) => {
  const { token } = theme.useToken();
  const { styles } = useStyle();
  const { mergedResourceSlots } = useResourceSlotsDetails();

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

  const metricData = getMetricData(
    capacity_metric?.metrics ?? [],
    current_metric?.metrics ?? [],
    startDate,
    endDate,
    dayDiff < 7 ? '5m' : dayDiff < 30 ? '1h' : '1d',
  );

  const getMetricTitle = () => {
    const [key, ...rest] = _.split(metricName, '_');
    const restLabel = _.startCase(rest.join(' '));

    if (_.has(mergedResourceSlots, key)) {
      return `${mergedResourceSlots[key]?.human_readable_name} ${restLabel}`;
    }
    if (_.includes(metricName, 'io')) {
      return `${_.upperCase(key)} ${restLabel}`;
    }
    return `${_.startCase(metricName.replaceAll('_', ' '))}`;
  };

  return (
    <BAICard
      title={getMetricTitle()}
      type="inner"
      styles={{
        body: {
          padding: `${token.marginMD}px ${token.marginMD}px ${token.marginXS}px ${token.marginMD}px`,
        },
      }}
    >
      {_.isEmpty(capacity_metric?.metrics) &&
      _.isEmpty(current_metric?.metrics) ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={metricData} className={styles.recharts}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" minTickGap={token.marginMD} />
            <YAxis domain={[0, 'dataMax']} />
            <Tooltip
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
              stroke={token.colorPrimary}
              strokeWidth={2}
              dot={{ r: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </BAICard>
  );
};

export default SessionMetricGraph;

const getMetricData = (
  capacityMetric: MetricData,
  currentMetric: MetricData,
  start: string,
  end: string,
  step: string,
) => {
  // orders by capacity, current
  const transformedData = _.zip(
    capacityMetric[0]?.values ||
      Array(currentMetric[0]?.values?.length).fill(0),
    currentMetric[0]?.values,
  ).map(([capacity, current]) => {
    return {
      timestamp: current?.timestamp,
      capacity: capacity?.value,
      used: current?.value,
    };
  });

  const timeUnits = { s: 1, m: 60, h: 3600, d: 86400 };
  const stepUnit = step.slice(-1) as keyof typeof timeUnits;
  const stepValue = parseInt(step.slice(0, -1));
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

  if (metricName.includes('util')) {
    number = Number(toFixedFloorWithoutTrailingZeros(value ?? 0, 1));
    numberUnit = '%';
  } else if (metricName.includes('used')) {
    number = Number((Number(value) / 1000).toFixed(1));
    numberUnit = 's';
  } else {
    number = Number(convertBinarySizeUnit(value ?? '0', 'g')?.numberFixed);
    numberUnit = 'GiB';
  }

  if (metricName.includes('net')) {
    numberUnit = 'GiB/s';
  }
  number = value ? number : undefined;

  return {
    number,
    numberUnit,
  };
};
