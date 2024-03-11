import BAIAreaChart from '../components/BAIAreaChart';
import BAIColumnChart from '../components/BAIColumnChart';
import BAIGaugeChart from '../components/BAIGaugeChart';
import Flex from '../components/Flex';
import { useBaiSignedRequestWithPromise } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { useTanQuery } from '../hooks/reactQueryAlias';
import { theme } from 'antd';
import { Card, Statistic } from 'antd';
import { Typography } from 'antd';
import { Button, Segmented, Space, Table, message } from 'antd/lib';
import { Suspense, useEffect, useRef, useState } from 'react';
import { CSVLink } from 'react-csv';
import { useTranslation } from 'react-i18next';

const StatisticsPage: React.FC = () => {
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  const baiRequestWithPromise = useBaiSignedRequestWithPromise();
  const { token } = theme.useToken();

  const myList = [
    {
      project: '20TF-V100',
      '2024-03-01': '80%',
      '2024-03-02': '45%',
      '2024-03-03': '25%',
      '2024-03-04': '15%',
    },
  ];
  const componentRef = useRef<any>();
  const columns = [
    {
      title: 'Project',
      dataIndex: 'project',
      key: 'project',
    },
    {
      title: '2024-03-01',
      dataIndex: '2024-03-01',
      key: '2024-03-01',
    },
    {
      title: '2024-03-02',
      dataIndex: '2024-03-02',
      key: '2024-03-02',
    },
    {
      title: '2024-03-03',
      dataIndex: '2024-03-03',
      key: '2024-03-03',
    },
    {
      title: '2024-03-04',
      dataIndex: '2024-03-04',
      key: '2024-03-04',
    },
  ];
  // const { data: maxCPUResourceUsage } = useTanQuery({
  //   queryKey: ['Statistics'],
  //   queryFn: () => {
  //       return baiRequestWithPromise({
  //           method: 'POST',
  //           url: `/statistics/query?query=max_over_time((100 - (avg (rate(node_cpu_seconds_total{mode='idle', job='node-exporter'}[1h])) * 100))[1d:])`,
  //       });
  //   },
  //   staleTime: 1000,
  //   suspense: true,
  // });

  const oneDay = 24 * 60 * 60 * 1000;
  const now = new Date().toISOString();
  const yesterday = new Date(Date.now() - oneDay).toISOString();
  const weekAgo = new Date(Date.now() - 7 * oneDay).toISOString();
  const [currentCPUusage, setCurrentCPUUsage] = useState(0);

  const { data: currentCPUResourceUsage } = useTanQuery({
    queryKey: ['current-cpu-resource-usage'],
    queryFn: () => {
      return baiRequestWithPromise({
        method: 'POST',
        url: `/statistics/query?query=100 - (avg(irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)`,
      });
    },
    staleTime: 1000,
    suspense: true,
    // refetchInterval: 5000,
  });

  const currentCPUResource = currentCPUResourceUsage.data.result.map(
    (instance: any) => {
      return parseFloat(instance.value[1]);
    },
  );

  const { data: totalMemory } = useTanQuery({
    queryKey: ['total-memory-amount'],
    queryFn: () => {
      return baiRequestWithPromise({
        method: 'POST',
        url: `/statistics/query?query=sum(node_memory_MemTotal_bytes)`,
      });
    },
    staleTime: 1000,
    suspense: true,
  });

  const humanizedTotalMemory = totalMemory.data.result.map((instance: any) => {
    return parseFloat(instance.value[1]) / 2 ** 30;
  });

  const { data: usedMemory } = useTanQuery({
    queryKey: ['used-memory-amount'],
    queryFn: () => {
      return baiRequestWithPromise({
        method: 'POST',
        url: `/statistics/query?query=sum(node_memory_MemTotal_bytes - node_memory_MemFree_bytes - node_memory_Buffers_bytes - node_memory_Cached_bytes)`,
      });
    },
    staleTime: 1000,
    suspense: true,
  });

  const humanizedUsedMemory = usedMemory.data.result.map((instance: any) => {
    return parseFloat(instance.value[1]) / 2 ** 30;
  });

  const { data: maxMemoryUsedInWeek } = useTanQuery({
    queryKey: ['max-used-memory-amount-in-a-week'],
    queryFn: () => {
      return baiRequestWithPromise({
        method: 'POST',
        url: `/statistics/query_range?query=max_over_time((node_memory_MemTotal_bytes - node_memory_MemFree_bytes - node_memory_Buffers_bytes - node_memory_Cached_bytes)[7d:1h])&start=${weekAgo}&end=${now}&step=1d`,
      });
    },
    staleTime: 1000,
    suspense: true,
  });

  const { data: avgMemoryUsedInWeek } = useTanQuery({
    queryKey: ['avg-used-memory-amount-in-a-week'],
    queryFn: () => {
      return baiRequestWithPromise({
        method: 'POST',
        url: `/statistics/query_range?query=avg_over_time((node_memory_MemTotal_bytes - node_memory_MemFree_bytes - node_memory_Buffers_bytes - node_memory_Cached_bytes)[7d:1h])&start=${weekAgo}&end=${now}&step=1d`,
      });
    },
    staleTime: 1000,
    suspense: true,
  });

  const { data: minMemoryUsedInWeek } = useTanQuery({
    queryKey: ['min-used-memory-amount-in-a-week'],
    queryFn: () => {
      return baiRequestWithPromise({
        method: 'POST',
        url: `/statistics/query_range?query=min_over_time((node_memory_MemTotal_bytes - node_memory_MemFree_bytes - node_memory_Buffers_bytes - node_memory_Cached_bytes)[7d:1h])&start=${weekAgo}&end=${now}&step=1d`,
      });
    },
    staleTime: 1000,
    suspense: true,
  });

  const { data: dailyCPUResourceUsage } = useTanQuery({
    queryKey: ['daily-cpu-resource-usage'],
    queryFn: () => {
      return baiRequestWithPromise({
        method: 'POST',
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
        method: 'POST',
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

  const maxMemoryUsedInWeekPerInstance = maxMemoryUsedInWeek.data.result.map(
    (instance: any) => {
      return {
        [instance.metric.instance]: instance.values.map((value: any) => {
          return {
            name: 'max',
            date: new Date(value[0] * 1000).toLocaleDateString(),
            utilization: parseFloat(value[1]),
          };
        }),
      };
    },
  );

  const avgMemoryUsedInWeekPerInstance = avgMemoryUsedInWeek.data.result.map(
    (instance: any) => {
      return {
        [instance.metric.instance]: instance.values.map((value: any) => {
          return {
            name: 'avg',
            date: new Date(value[0] * 1000).toLocaleDateString(),
            utilization: parseFloat(value[1]),
          };
        }),
      };
    },
  );

  const minMemoryUsedInWeekPerInstance = minMemoryUsedInWeek.data.result.map(
    (instance: any) => {
      return {
        [instance.metric.instance]: instance.values.map((value: any) => {
          return {
            name: 'min',
            date: new Date(value[0] * 1000).toLocaleDateString(),
            utilization: parseFloat(value[1]),
          };
        }),
      };
    },
  );
  const instanceList = dailyCPUResourceUsagePerInstance
    .map((instance: any) => Object.keys(instance))
    .flat(1);

  const minMaxAvgMemoryUsedInWeekPerInstance = [
    ...minMemoryUsedInWeekPerInstance[0][instanceList[0]],
    ...avgMemoryUsedInWeekPerInstance[0][instanceList[0]],
    ...maxMemoryUsedInWeekPerInstance[0][instanceList[0]],
  ];

  return (
    <Suspense fallback={<div>loading...</div>}>
      <Flex direction="row" align="center" wrap="wrap" gap={'xs'}>
        <Flex
          direction="row"
          align="stretch"
          justify="end"
          gap={'xxl'}
          style={{ width: '100%' }}
        >
          <Segmented
            options={['Daily', 'Weekly', 'Monthly']}
            onChange={(value) => {
              console.log(value); // string
            }}
          />
        </Flex>
        <Flex
          direction="row"
          align="stretch"
          gap={'xs'}
          style={{ width: '100%' }}
        >
          <Card bordered={false} style={{ width: '25%' }}>
            <Flex
              direction="column"
              align="stretch"
              gap={'xs'}
              style={{ width: '100%' }}
            >
              <Statistic
                title="GPU utilization"
                value={15.6}
                precision={2}
                // valueStyle={{ color: '#3f8600' }}
                suffix="%"
              />
              <BAIGaugeChart
                id="gpu-utilization-per-period"
                data={{
                  value: {
                    target: 15.6,
                    total: 100,
                    name: 'gpu-utilization-per-period',
                  },
                }}
              ></BAIGaugeChart>
            </Flex>
          </Card>
          <Card bordered={false} style={{ width: '75%' }}>
            <Statistic
              title={`Average GPU utilization during ${new Date(Date.now() - 7 * oneDay).toISOString().slice(0, 10)} ~ ${new Date(Date.now()).toISOString().slice(0, 10)}`}
              value={15.6}
              precision={2}
              // valueStyle={{ color: '#3f8600' }}
              suffix="%"
            />
            <BAIColumnChart
              id="per-week-min-max-avg-memory-usage"
              title=""
              data={minMaxAvgMemoryUsedInWeekPerInstance}
            ></BAIColumnChart>
          </Card>
          {/* <Card bordered={false} style={{width: "100%"}}>
            <Statistic
              title="Using Memory"
              value={`${humanizedUsedMemory[0]}`}
              precision={2}
              // valueStyle={{ color: '#3f8600' }}
              suffix="GiB"
            />
            <Statistic
              title="Total Memory"
              value={`${humanizedTotalMemory[0]}`}
              precision={2}
              // valueStyle={{ color: '#3f8600' }}
              suffix="GiB"
            />
          </Card>
          <Card bordered={false} style={{width: "100%"}}>
            <Statistic
              title="Memory usage (current)"
              value={(humanizedUsedMemory[0] / humanizedTotalMemory[0]) * 100}
              precision={2}
              valueStyle={{  }} 
              // color: '#cf1322'
              // prefix={}
              suffix="%"
            />
          </Card> */}
        </Flex>
        <Card bordered={false} style={{ width: '100%' }}>
          <Flex
            direction="row"
            align="start"
            justify="center"
            gap={'lg'}
            style={{ width: '100%' }}
          >
            <Statistic
              title="Total FGPU"
              value={3}
              precision={2}
              // valueStyle={{ color: '#3f8600' }}
              suffix=""
              style={{ width: '100%' }}
            />
            <Statistic
              title="Current GPU utilization (last 5min)"
              value={12.1}
              precision={2}
              // valueStyle={{ color: '#3f8600' }}
              suffix="%"
              style={{ width: '100%' }}
            />
            <Statistic
              title="GPU Allocated Session(s)"
              value={3}
              precision={0}
              // valueStyle={{ color: '#3f8600' }}
              suffix=""
              style={{ width: '100%' }}
            />
            <Statistic
              title="Used days"
              value={131}
              precision={0}
              // valueStyle={{ color: '#3f8600' }}
              suffix="day(s)"
              style={{ width: '100%' }}
            />
          </Flex>
        </Card>
        <Card bordered={false} style={{ width: '100%' }}>
          <Flex
            direction="column"
            align="stretch"
            gap={'xs'}
            style={{ width: '100%' }}
          >
            <Flex
              direction="row"
              align="stretch"
              gap={'xs'}
              style={{ width: '100%' }}
            >
              <Typography.Title
                level={4}
                style={{
                  margin: 0,
                  padding: 0,
                  width: '100%',
                  color: '#00000073',
                }}
              >
                GPU utilization logs
              </Typography.Title>
              <Button type="primary">
                <CSVLink
                  filename={'Expense_Table.csv'}
                  data={myList}
                  onClick={() => {
                    message.info('Export CSV on process...');
                  }}
                >
                  {t('session.exportCSV')}
                </CSVLink>
              </Button>
            </Flex>
            <div ref={componentRef}>
              {myList && (
                <Table
                  columns={columns}
                  dataSource={myList}
                  scroll={{ x: 'max-content' }}
                />
              )}
            </div>
          </Flex>
        </Card>

        {/* <BAIColumnChart
          id="per-week-min-max-avg-memory-usage"
          title="Per week Min/Max/Avg memory usage"
          data={minMaxAvgMemoryUsedInWeekPerInstance}></BAIColumnChart>
        <BAIAreaChart
          id="daily-cpu-resource-usage"
          title="CPU Usage (Daily)"
          data={dailyCPUResourceUsagePerInstance[0][instanceList[0]]}
        ></BAIAreaChart>
        <BAIAreaChart
          id="daily-memory-resource-usage"
          title="Memory Usage (Daily)"
          data={dailyMemoryResourceUsagePerInstance[0][instanceList[0]]}
        ></BAIAreaChart> */}
      </Flex>
    </Suspense>
  );
};

export default StatisticsPage;
