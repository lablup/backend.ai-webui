import {
  convertBinarySizeUnit,
  toFixedFloorWithoutTrailingZeros,
} from '../helper';
import { useCurrentUserInfo } from '../hooks/backendai';
import BAICard from './BAICard';
import {
  PrometheusMetricGraphQuery,
  PrometheusMetricGraphQuery$data,
} from './__generated__/PrometheusMetricGraphQuery.graphql';
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
  `,
}));

type MetricData = NonNullable<
  NonNullable<
    PrometheusMetricGraphQuery$data['user_utilization_metric']
  >['metrics']
>;

interface PrometheusMetricGraphProps {
  startDate: string;
  endDate: string;
  metricName: string;
  fetchKey: string;
}

const PrometheusMetricGraph: React.FC<PrometheusMetricGraphProps> = ({
  startDate,
  endDate,
  metricName,
  fetchKey,
}) => {
  const { token } = theme.useToken();
  const { styles } = useStyle();
  const userInfo = useCurrentUserInfo();
  const dayDiff = dayjs(Number(endDate) * 1000).diff(
    dayjs(Number(startDate) * 1000),
    'day',
  );

  const { user_utilization_metric } =
    useLazyLoadQuery<PrometheusMetricGraphQuery>(
      graphql`
        query PrometheusMetricGraphQuery(
          $user_id: UUID!
          $props: UserUtilizationMetricQueryInput!
        ) {
          user_utilization_metric(user_id: $user_id, props: $props) {
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
        user_id: userInfo[0]?.uuid ?? '',
        props: {
          metric_name: metricName,
          start: startDate,
          end: endDate,
          step: dayDiff < 7 ? '5m' : dayDiff < 30 ? '1h' : '1d',
        },
      },
      {
        fetchPolicy: 'store-and-network',
        fetchKey,
      },
    );

  const metricData = getMetricData(
    user_utilization_metric?.metrics ?? [],
    startDate,
    endDate,
    dayDiff < 7 ? '5m' : dayDiff < 30 ? '1h' : '1d',
  );

  return (
    <BAICard
      title={_.startCase(metricName.replaceAll('_', ' '))}
      type="inner"
      styles={{
        body: {
          padding: `${token.marginMD}px ${token.marginMD}px ${token.marginXS}px ${token.marginMD}px`,
        },
      }}
    >
      {_.isEmpty(user_utilization_metric?.metrics) ? (
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
                  user_utilization_metric?.metrics?.[1]?.avg_value,
                  user_utilization_metric?.metrics?.[1]?.metric_name,
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
              stroke={token.geekblue6}
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

export default PrometheusMetricGraph;

const getMetricData = (
  metrics: MetricData,
  start: string,
  end: string,
  step: string,
) => {
  if (_.isEmpty(metrics)) return [];

  // orders by capacity, current, utilization
  const transformedData = _.zip(
    metrics[0]?.values,
    metrics[1]?.values,
    metrics[2]?.values,
  ).map(([capacity, current, pct]) => {
    return {
      timestamp: capacity?.timestamp,
      capacity: capacity?.value,
      used: current?.value,
      pct: pct?.value,
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
      timestamp: dayjs(timestamp * 1000).format('YYYY-MM-DD HH:mm:ss'),
      capacity: convertMetricUnit(existData?.capacity, metrics[0]?.metric_name)
        .number,
      used: convertMetricUnit(existData?.used, metrics[0]?.metric_name).number,
      pct: existData?.pct,
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
