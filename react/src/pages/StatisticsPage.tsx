import BAIAreaChart from '../components/BAIAreaChart';
import Flex from '../components/Flex';
import { useBaiSignedRequestWithPromise } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { useTanQuery } from '../hooks/reactQueryAlias';
import { theme } from 'antd';
import { random } from 'lodash';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

const StatisticsPage: React.FC = () => {
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  const baiRequestWithPromise = useBaiSignedRequestWithPromise();
  const { token } = theme.useToken();
  // const { data: maxCPUResourceUsage } = useTanQuery({
  //   queryKey: ['Statistics'],
  //   queryFn: () => {
  //       return baiRequestWithPromise({
  //           method: 'GET',
  //           url: `/statistics/query?query=max_over_time((100 - (avg (rate(node_cpu_seconds_total{mode='idle', job='node-exporter'}[1h])) * 100))[1d:])`,
  //       });
  //   },
  //   staleTime: 1000,
  //   suspense: true,
  // });

  const now = new Date().toISOString();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: dailyCPUResourceUsage } = useTanQuery({
    queryKey: ['daily-cpu-resource-usage'],
    queryFn: () => {
      return baiRequestWithPromise({
        method: 'GET',
        url: `/statistics/query_range?query=100-(avg by(instance)(rate(node_cpu_seconds_total{mode='idle'}[5m]))*100)&start=${yesterday}&end=${now}&step=1h`,
      });
    },
    staleTime: 1000,
    suspense: true,
  });

  const { data: dailyMemoryResourceUsage } = useTanQuery({
    queryKey: ['daily-memory-resource-usage'],
    queryFn: () => {
      return baiRequestWithPromise({
        method: 'GET',
        url: `/statistics/query_range?query=(1-(node_memory_MemAvailable_bytes/node_memory_MemTotal_bytes))*100&start=${yesterday}&end=${now}&step=1h`,
      });
    },
    staleTime: 1000,
    suspense: true,
  });

  const dailyCPUResourceUsagePerInstance =
    dailyCPUResourceUsage.data.result.map((instance: any) => {
      return {
        [instance.metric.instance]: instance.values.map((value: any) => {
          return {
            date: new Date(value[0] * 1000).toLocaleString(),
            utilization: parseFloat(value[1]),
          };
        }),
      };
    });

  const dailyMemoryResourceUsagePerInstance =
    dailyMemoryResourceUsage.data.result.map((instance: any) => {
      return {
        [instance.metric.instance]: instance.values.map((value: any) => {
          return {
            date: new Date(value[0] * 1000).toLocaleString(),
            utilization: parseFloat(value[1]),
          };
        }),
      };
    });

  const instanceList = dailyCPUResourceUsagePerInstance
    .map((instance: any) => Object.keys(instance))
    .flat(1);

  return (
    <Suspense fallback={<div>loading...</div>}>
      <Flex direction="row" align="center" wrap="wrap" gap={'xs'}>
        <BAIAreaChart
          id="daily-cpu-resource-usage"
          title="CPU Usage (Daily)"
          data={dailyCPUResourceUsagePerInstance[0][instanceList[0]]}
        ></BAIAreaChart>
        <BAIAreaChart
          id="daily-memory-resource-usage"
          title="Memory Usage (Daily)"
          data={dailyMemoryResourceUsagePerInstance[0][instanceList[0]]}
        ></BAIAreaChart>
      </Flex>
    </Suspense>
  );
};

export default StatisticsPage;
