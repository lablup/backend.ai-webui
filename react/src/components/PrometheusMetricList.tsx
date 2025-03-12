import {
  baiSignedRequestWithPromise,
  convertBinarySizeUnit,
  toFixedFloorWithoutTrailingZeros,
} from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserInfo } from '../hooks/backendai';
import { useTanMutation } from '../hooks/reactQueryAlias';
import { usePainKiller } from '../hooks/usePainKiller';
import Flex from './Flex';
import { GraphCard } from './UsageHistoryStatistics';
import { Bullet } from '@ant-design/charts';
import dayjs from 'dayjs';
import _, { times } from 'lodash';
import { useEffect, useState } from 'react';

type metricsMetadata = {
  backendai_container_utilization: {
    labels: string[];
  };
  backendai_device_utilization: {
    labels: string[];
  };
};

interface MetricInfo {
  __name__: string;
  agent_id: string;
  instance: string;
  job: string;
  container_metric_name: string;
  value_type: string;
}
type MetricValue = [number, string];
interface MetricResponse {
  metric: MetricInfo;
  values: MetricValue[];
}

interface PrometheusResponse {
  status: string;
  data: {
    resultType: string;
    result: MetricResponse[];
  };
}

interface PrometheusCollection {
  items: {
    [key: string]: PrometheusResponse;
  };
}
interface MetricQuery {
  metric_name: string;
  labels: {
    container_metric_name: string;
    user_id: string;
  };
  time_range: {
    start: string | number;
    end: string | number;
    step: string;
  };
}

interface PrometheusMetricListProps {
  startDate: string;
  endDate: string;
  fetchKey: string;
}

const PrometheusMetricList: React.FC<PrometheusMetricListProps> = ({
  startDate,
  endDate,
  fetchKey,
}) => {
  const [metricData, setMetricData] = useState<{
    [category: string]: { [metric: string]: PrometheusResponse };
  } | null>(null);

  const baiClient = useSuspendedBackendaiClient();
  const painKiller = usePainKiller();
  const userInfo = useCurrentUserInfo();

  // const baiRequestWithPromise = useBaiSignedRequestWithPromise();

  // get prometheus metric metadata.
  // const { data: metricsInfo } = useSuspenseTanQuery({
  //   queryKey: ['KernelMetadataQuery', fetchKey],
  //   queryFn: () => {
  //     return baiRequestWithPromise({
  //       method: 'GET',
  //       url: '/metrics/user/metadata',
  //     }) as Promise<Partial<metricsMetadata>>;
  //   },
  //   staleTime: 0,
  // });

  // get user prometheus metric data
  const mutationForUserMetrics = useTanMutation<PrometheusCollection, any>({
    mutationFn: () => {
      // TODO: change metricName based on metricsInfo data. metricsInfo returns metricNames that can be possible to query.
      const metricName = ['gpu_pct', 'gpu_capacity', 'gpu_current'];
      const body = {
        queries: _.reduce(
          metricName,
          (result, metric, index) => {
            result[metric] = {
              metric_name: 'backendai_container_utilization',
              labels: {
                container_metric_name: metric,
                user_id: userInfo[0]?.uuid ?? '',
              },
              time_range: {
                start: startDate,
                end: endDate,
                step: '15m',
              },
            };
            return result;
          },
          {} as Record<string, MetricQuery>,
        ),
      };
      return baiSignedRequestWithPromise({
        method: 'POST',
        url: '',
        body,
        client: baiClient,
      });
    },
  });

  useEffect(() => {
    if (startDate && endDate) {
      // mutationForUserMetrics.mutate(undefined, {onSuccess: (data) => {
      //   setMetricData(data);
      // },
      // onError: (error) => {
      //   message.error(painKiller.relieve(error?.message));
      // }})

      // For Dummy Data
      const prometheusData: PrometheusCollection = {
        items: {
          gpu_pct: {
            status: 'success',
            data: {
              resultType: 'matrix',
              result: [
                {
                  metric: {
                    __name__: 'backendai_container_utilization',
                    agent_id: 'i-MacBookPro.office.lablup',
                    instance: 'host.docker.internal:6003',
                    job: 'backendai-half-agent',
                    container_metric_name: 'gpu_pct',
                    value_type: 'pct',
                  },
                  values: [
                    [1710324900, '82.69'],
                    [1710325800, '82.69'],
                    [1710326700, '82.69'],
                    [1710327600, '82.69'],
                  ],
                },
              ],
            },
          },
          gpu_capacity: {
            status: 'success',
            data: {
              resultType: 'matrix',
              result: [
                {
                  metric: {
                    __name__: 'backendai_container_utilization',
                    agent_id: 'i-MacBookPro.office.lablup',
                    instance: 'host.docker.internal:6003',
                    job: 'backendai-half-agent',
                    container_metric_name: 'gpu_capacity',
                    value_type: 'pct',
                  },
                  values: [
                    [1710324900, '17179869184'],
                    [1710325800, '17179869184'],
                    [1710326700, '17179869184'],
                    [1710327600, '17179869184'],
                  ],
                },
              ],
            },
          },
          gpu_current: {
            status: 'success',
            data: {
              resultType: 'matrix',
              result: [
                {
                  metric: {
                    __name__: 'backendai_container_utilization',
                    agent_id: 'i-MacBookPro.office.lablup',
                    instance: 'host.docker.internal:6003',
                    job: 'backendai-half-agent',
                    container_metric_name: 'gpu_current',
                    value_type: 'pct',
                  },
                  values: [
                    [1710324900, '14204993633'],
                    [1710325800, '14204993633'],
                    [1710326700, '14204993633'],
                    [1710327600, '14204993633'],
                  ],
                },
              ],
            },
          },
          cpu_pct: {
            status: 'success',
            data: {
              resultType: 'matrix',
              result: [
                {
                  metric: {
                    __name__: 'backendai_container_utilization',
                    agent_id: 'i-MacBookPro.office.lablup',
                    instance: 'host.docker.internal:6003',
                    job: 'backendai-half-agent',
                    container_metric_name: 'gpu_pct',
                    value_type: 'pct',
                  },
                  values: [
                    [1710324900, '82.69'],
                    [1710325800, '82.69'],
                    [1710326700, '82.69'],
                    [1710327600, '82.69'],
                  ],
                },
              ],
            },
          },
          cpu_capacity: {
            status: 'success',
            data: {
              resultType: 'matrix',
              result: [
                {
                  metric: {
                    __name__: 'backendai_container_utilization',
                    agent_id: 'i-MacBookPro.office.lablup',
                    instance: 'host.docker.internal:6003',
                    job: 'backendai-half-agent',
                    container_metric_name: 'gpu_capacity',
                    value_type: 'pct',
                  },
                  values: [
                    [1710324900, '17179869184'],
                    [1710325800, '17179869184'],
                    [1710326700, '17179869184'],
                    [1710327600, '17179869184'],
                  ],
                },
              ],
            },
          },
          cpu_current: {
            status: 'success',
            data: {
              resultType: 'matrix',
              result: [
                {
                  metric: {
                    __name__: 'backendai_container_utilization',
                    agent_id: 'i-MacBookPro.office.lablup',
                    instance: 'host.docker.internal:6003',
                    job: 'backendai-half-agent',
                    container_metric_name: 'gpu_current',
                    value_type: 'pct',
                  },
                  values: [
                    [1710324900, '14204993633'],
                    [1710325800, '14204993633'],
                    [1710326700, '14204993633'],
                    [1710327600, '14204993633'],
                  ],
                },
              ],
            },
          },
        },
      };

      const restructuredData: {
        [category: string]: { [metric: string]: PrometheusResponse };
      } = {};

      _.forEach(prometheusData.items, (value, key) => {
        const [metricName, metric] = key.split('_');
        restructuredData[metricName.toUpperCase()] = {
          ...restructuredData[metricName.toUpperCase()],
          [metric]: value,
        };
      });
      setMetricData(restructuredData);
    }
  }, [startDate, endDate]);

  console.log(metricData);

  return (
    <Flex direction="column" gap="sm" align="stretch">
      {_.map(metricData, (data, key) => {
        const a = _.chain(
          _.zip(
            data.pct.data.result[0].values,
            data.capacity.data.result[0].values,
            data.current.data.result[0].values,
          ),
        )
          .map(([pct, capacity, current]) => {
            return {
              title: dayjs.unix(pct?.[0] ?? 0).format('MMM DD HH:mm'),
              ranges: Number(
                toFixedFloorWithoutTrailingZeros(
                  convertBinarySizeUnit(capacity?.[1].toString() + 'B', 'G')
                    ?.number ?? 0,
                  2,
                ),
              ),
              measures: Number(
                toFixedFloorWithoutTrailingZeros(
                  convertBinarySizeUnit(current?.[1].toString() + 'B', 'G')
                    ?.number ?? 0,
                  2,
                ),
              ),
            };
          })
          .value();

        return (
          <Flex key={key} direction="column" gap={'xs'} align="stretch">
            <GraphCard title={key}>
              <Bullet layout="vertical" data={a} />
            </GraphCard>
          </Flex>
        );
      })}
    </Flex>
  );
};

export default PrometheusMetricList;
