import AllocatedResourcesCard from '../components/AllocatedResourcesCard';
import BAILayoutCard from '../components/BAILayoutCard';
import Flex from '../components/Flex';
import SessionListTemplate from '../components/SessionListTemplate';
import {
  filterEmptyItem,
  filterNonNullItems,
  iSizeToSize,
  localeCompare,
} from '../helper';
import {
  useCurrentDomainValue,
  useSuspendedBackendaiClient,
  useUpdatableState,
} from '../hooks';
import { useCurrentKeyPairResourcePolicyLazyLoadQuery } from '../hooks/hooksUsingRelay';
import { useBAIPaginationOptionState } from '../hooks/reactPaginationQueryOptions';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { DashboardPageSessionListQuery } from './__generated__/DashboardPageSessionListQuery.graphql';
import { DashboardPage_EndpointListQuery } from './__generated__/DashboardPage_EndpointListQuery.graphql';
import { DashboardPage_UserInfoQuery } from './__generated__/DashboardPage_UserInfoQuery.graphql';
import { DashboardPage_UserResourcePolicyQuery } from './__generated__/DashboardPage_UserResourcePolicyQuery.graphql';
import { QuestionCircleOutlined, SyncOutlined } from '@ant-design/icons';
import {
  Button,
  ConfigProvider,
  Divider,
  Progress,
  Select,
  Table,
  Tag,
  theme,
  Typography,
} from 'antd';
import { Statistic } from 'antd/lib';
import { AnyObject } from 'antd/lib/_util/type';
import { ColumnType, TableRowSelection } from 'antd/lib/table/interface';
import graphql from 'babel-plugin-relay/macro';
import dayjs from 'dayjs';
import _ from 'lodash';
import React, { useDeferredValue, useTransition } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';

interface DashboardPageProps {}

export const statusTagColor = {
  //prepare
  RESTARTING: 'magenta',
  PREPARING: 'magenta',
  PULLING: 'magenta',
  //running and pending
  RUNNING: 'success',
  RUNNING_DEGRADED: 'success',
  PENDING: 'success',
  SCHEDULED: 'success',
  //error
  ERROR: 'error',
  //finished return undefined
};

const DashboardPage: React.FC<DashboardPageProps> = (props) => {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  const [
    sessionFetchKey,
    // setSessionFetchKey
  ] = useUpdatableState('initial-fetch');
  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionState({
    current: 1,
    pageSize: 10,
  });
  const { id: projectId } = useCurrentProjectValue();
  const [servicesFetchKey, updateServicesFetchKey] =
    useUpdatableState('initial-fetch');

  const [{ keypair, keypairResourcePolicy }] =
    useCurrentKeyPairResourcePolicyLazyLoadQuery();

  const { user } = useLazyLoadQuery<DashboardPage_UserInfoQuery>(
    graphql`
      query DashboardPage_UserInfoQuery($domain_name: String, $email: String) {
        user(domain_name: $domain_name, email: $email) {
          id
          # https://github.com/lablup/backend.ai/pull/1354
          resource_policy @since(version: "23.09.0")
        }
      }
    `,
    {
      domain_name: useCurrentDomainValue(),
      email: baiClient?.email,
    },
  );

  const { user_resource_policy } =
    useLazyLoadQuery<DashboardPage_UserResourcePolicyQuery>(
      graphql`
        query DashboardPage_UserResourcePolicyQuery($user_RP_name: String) {
          user_resource_policy(name: $user_RP_name) @since(version: "23.09.6") {
            max_session_count_per_model_session
          }
        }
      `,
      {
        user_RP_name: user?.resource_policy,
      },
    );

  // TODO: refactor with useControllableState
  const [selectedRowKeys, setSelectedRowKeys] = useState<Array<React.Key>>([]);
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const rowSelection: TableRowSelection<AnyObject> = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  const [order, setOrder] = useState<string>();
  const [paginationState, setPaginationState] = useState<{
    current: number;
    pageSize: number;
  }>({
    current: 1,
    pageSize: 10,
  });
  const { compute_session_list } =
    useLazyLoadQuery<DashboardPageSessionListQuery>(
      graphql`
        query DashboardPageSessionListQuery(
          $limit: Int!
          $offset: Int!
          $group_id: String
          $status: String
          $order: String
        ) {
          compute_session_list(
            limit: $limit
            offset: $offset
            group_id: $group_id
            status: $status
            order: $order
          ) {
            items {
              id
              type
              session_id
              name
              created_at
              containers {
                live_stat
                last_stat
              }
              terminated_at
              status
              occupied_slots
              resource_opts
            }
            total_count
          }
        }
      `,
      {
        limit: 2, //baiPaginationOption.limit,
        offset: baiPaginationOption.offset,
        group_id: projectId,
        order,
      },
      {
        fetchKey:
          sessionFetchKey === 'initial-fetch'
            ? 'store-and-network'
            : 'network-only',
        fetchPolicy: 'network-only',
      },
    );

  const { endpoint_list: modelServiceList } =
    useLazyLoadQuery<DashboardPage_EndpointListQuery>(
      graphql`
        query DashboardPage_EndpointListQuery(
          $offset: Int!
          $projectID: UUID
          $limit: Int!
          $filter: String
        ) {
          endpoint_list(
            offset: $offset
            limit: $limit
            project: $projectID
            filter: $filter
          ) {
            total_count
          }
        }
      `,
      {
        offset: baiPaginationOption.offset,
        limit: 10,
        projectID: projectId,
        filter: null,
      },
      {
        fetchPolicy: 'network-only',
        fetchKey: servicesFetchKey,
      },
    );

  const columns = filterEmptyItem<ColumnType<any>>([
    {
      title: '#',
      fixed: 'left',
      // @ts-ignore
      render: (id, record, index) => {
        return (
          index +
          1 +
          (tablePaginationOption.current - 1) * tablePaginationOption.pageSize
        );
      },
    },
    {
      title: 'Name',
      dataIndex: 'name',
      // @ts-ignore
      sorter: (a, b) => localeCompare(a.name, b.name),
      // @ts-ignore
      render: (value) => (
        <Typography.Text style={{ maxWidth: 122 }} ellipsis>
          {value}
        </Typography.Text>
      ),
    },
    {
      title: t('session.Status'),
      dataIndex: 'status',
      // @ts-ignore
      sorter: (a, b) => localeCompare(a.status, b.status),
      // @ts-ignore
      render: (value) => (
        <Tag color={_.get(statusTagColor, value)}>{value}</Tag>
      ),
    },
    {
      title: 'Utils.',
      dataIndex: 'containers',
      render: (value) => {
        const aggregatedLiveStat: {
          [key: string]: { capacity: number; current: number; ratio: number };
        } = {
          cpu_util: { capacity: 0, current: 0, ratio: 0 },
          mem: { capacity: 0, current: 0, ratio: 0 },
        };

        value.forEach((container: { live_stat: any }) => {
          const parsedLiveStat = _.isEmpty(container.live_stat)
            ? null
            : JSON.parse(container.live_stat);

          if (parsedLiveStat) {
            Object.keys(parsedLiveStat).forEach((statKey) => {
              if (
                statKey === 'cpu_util' ||
                statKey === 'cpu_used' ||
                statKey === 'mem' ||
                statKey === 'io_read' ||
                statKey === 'io_write' ||
                statKey === 'io_scratch_size' ||
                statKey === 'net_rx' ||
                statKey === 'net_tx'
              ) {
                if (!aggregatedLiveStat[statKey]) {
                  aggregatedLiveStat[statKey] = {
                    capacity: 0,
                    current: 0,
                    ratio: 0,
                  };
                }
                aggregatedLiveStat[statKey].current += parseFloat(
                  parsedLiveStat[statKey].current,
                );
                aggregatedLiveStat[statKey].capacity += parseFloat(
                  parsedLiveStat[statKey].capacity,
                );
                return;
              }
              if (statKey.includes('_util') || statKey.includes('_mem')) {
                if (!aggregatedLiveStat[statKey]) {
                  aggregatedLiveStat[statKey] = {
                    capacity: 0,
                    current: 0,
                    ratio: 0,
                  };
                }
                aggregatedLiveStat[statKey].current += parseFloat(
                  parsedLiveStat[statKey].current,
                );
                aggregatedLiveStat[statKey].capacity += parseFloat(
                  parsedLiveStat[statKey].capacity,
                );
              }
            });
          }
        });

        // Calculate utilization ratios
        if (aggregatedLiveStat.cpu_util) {
          aggregatedLiveStat.cpu_util.ratio =
            aggregatedLiveStat.cpu_util.current /
              aggregatedLiveStat.cpu_util.capacity || 0;
        }
        if (aggregatedLiveStat.mem) {
          aggregatedLiveStat.mem.ratio =
            aggregatedLiveStat.mem.current / aggregatedLiveStat.mem.capacity ||
            0;
        }

        Object.keys(aggregatedLiveStat).forEach((statKey) => {
          if (statKey === 'cpu_util' || statKey === 'mem') return;
          if (
            statKey.indexOf('_util') !== -1 &&
            aggregatedLiveStat[statKey].capacity > 0
          ) {
            aggregatedLiveStat[statKey].ratio =
              aggregatedLiveStat[statKey].current / 100 || 0;
          }
          if (
            statKey.indexOf('_mem') !== -1 &&
            aggregatedLiveStat[statKey].capacity > 0
          ) {
            aggregatedLiveStat[statKey].ratio =
              aggregatedLiveStat[statKey].current /
                aggregatedLiveStat[statKey].capacity || 0;
          }
        });

        return (
          <Flex direction="column" justify="start" gap={4}>
            {Object.entries(
              _.pickBy(
                aggregatedLiveStat,
                (_value: any, key: string) =>
                  key === 'cpu_util' || key === 'mem' || key.includes('_util'),
              ),
            ).map(([key, value]) => {
              return (
                <Progress
                  key={key}
                  percent={_.round(aggregatedLiveStat[key]?.ratio, 2) || 0}
                  strokeLinecap="butt"
                  size={[107, 11]}
                  strokeColor="#999"
                />
              );
            })}
          </Flex>
        );
      },
    },
    {
      title: t('session.launcher.AIAccelerator'),
      render: () => 'CUDA FGPU',
    },
    {
      title: t('session.CPU'),
      // FIXME: parse occupied slots initially
      dataIndex: 'occupied_slots',
      render: (value: string) => {
        return _.get(JSON.parse(value), 'cpu', '-');
      },
      // @ts-ignore
      sorter: (a, b) => {
        return (
          _.get(JSON.parse(a.occupied_slots), 'cpu', 0) -
          _.get(JSON.parse(b.occupied_slots), 'cpu', 0)
        );
      },
    },
    {
      title: 'RAM',
      // FIXME: parse occupied slots initially
      dataIndex: 'occupied_slots',
      render: (value: string) => {
        const mem = _.get(JSON.parse(value), 'mem', '-');
        return mem === '-' ? mem : iSizeToSize(mem, 'G')?.numberUnit + 'iB';
      },
      // @ts-ignore
      sorter: (a, b) => {
        return (
          _.get(JSON.parse(a.occupied_slots), 'mem', 0) -
          _.get(JSON.parse(b.occupied_slots), 'mem', 0)
        );
      },
    },
    {
      title: 'Elapsed',
      // @ts-ignore
      render: (value, record) => {
        const createdAt = dayjs(record.created_at);
        const terminatedAt = dayjs(record.terminated_at);
        const diff = terminatedAt.diff(createdAt, 'second');
        const diffDuration = dayjs.duration(diff);
        const formattedDiff = `${diffDuration.hours().toString().padStart(2, '0')}:${diffDuration.minutes().toString().padStart(2, '0')}:${diffDuration.seconds().toString().padStart(2, '0')}`;
        return formattedDiff;
      },
    },
  ]);

  return (
    <>
      <ConfigProvider
        theme={{
          components: {
            Button: {
              fontSize: 24, // icon size
              onlyIconSize: 20,
              colorText: '#999',
            },
            Statistic: {
              colorTextDescription: '#333',
              contentFontSize: 16,
            },
          },
        }}
      >
        <Flex direction="column" align="start" justify="start" gap={'lg'}>
          <Flex direction="row" align="center" justify="around" gap={'lg'}>
            <BAILayoutCard
              title={
                <Flex direction="row" align="center" justify="start" gap={'xs'}>
                  <Typography.Title level={4} style={{ margin: 0 }}>
                    {'My Session'}
                  </Typography.Title>
                  <Button type="text" icon={<QuestionCircleOutlined />} />
                </Flex>
              }
              extra={
                <Button
                  type="text"
                  icon={<SyncOutlined />}
                  style={{ color: 'inherit' }}
                />
              }
              style={{ width: 444, height: 192 }}
            >
              <Flex direction="row" align="start" justify="between" gap={'lg'}>
                <Statistic
                  style={{ fontSize: 16 }}
                  title={
                    <Flex direction="column" align="start">
                      <Typography.Title level={5} style={{ margin: 0 }}>
                        General
                      </Typography.Title>
                      <Typography.Text style={{ fontSize: 10 }}>
                        {'(Interactive/Batch)'}
                      </Typography.Text>
                    </Flex>
                  }
                  prefix={
                    <Flex direction="row" align="end" justify="start">
                      <Typography.Title
                        level={1}
                        style={{ margin: 0, color: token.colorLinkHover }}
                      >
                        {
                          _.filter(
                            compute_session_list?.items,
                            (item) => item?.status !== 'TERMINATED',
                          ).length
                        }
                      </Typography.Title>
                      <Typography.Text
                        style={{ fontSize: 16, marginBottom: 3 }}
                      >
                        {`/ ${keypairResourcePolicy.max_concurrent_sessions}`}
                      </Typography.Text>
                    </Flex>
                  }
                  value={' '}
                />
                <Divider type="vertical" style={{ height: 90 }} />
                <Statistic
                  title={
                    <Flex direction="column" align="start">
                      <Typography.Title level={5} style={{ margin: 0 }}>
                        Service
                      </Typography.Title>
                      <Typography.Text
                        style={{ fontSize: 10, color: 'rgba(0,0,0,0)' }}
                      >
                        {'blank'}
                      </Typography.Text>
                    </Flex>
                  }
                  prefix={
                    <Flex direction="row" align="end" justify="start">
                      <Typography.Title
                        level={1}
                        style={{ margin: 0, color: token.colorLinkHover }}
                      >
                        {modelServiceList?.total_count ?? 0}
                      </Typography.Title>
                      <Typography.Text
                        style={{ fontSize: 16, marginBottom: 3 }}
                      >
                        {`/ ${user_resource_policy?.max_session_count_per_model_session}`}
                      </Typography.Text>
                    </Flex>
                  }
                  value={' '}
                />
                <Divider type="vertical" style={{ height: 90 }} />
                <Statistic
                  title={
                    <Flex direction="column" align="start">
                      <Typography.Title level={5} style={{ margin: 0 }}>
                        System
                      </Typography.Title>
                      <Typography.Text
                        style={{ fontSize: 10, color: 'rgba(0,0,0,0)' }}
                      >
                        {'blank'}
                      </Typography.Text>
                    </Flex>
                  }
                  prefix={
                    <Flex direction="row" align="end" justify="start">
                      <Typography.Title
                        level={1}
                        style={{ margin: 0, color: token.colorLinkHover }}
                      >
                        {
                          _.filter(
                            compute_session_list?.items,
                            (item) => item?.type === 'SYSTEM',
                          ).length
                        }
                      </Typography.Title>
                      <Typography.Text
                        style={{ fontSize: 16, marginBottom: 3 }}
                      >
                        {` / ${keypairResourcePolicy?.max_concurrent_sftp_sessions}`}
                      </Typography.Text>
                    </Flex>
                  }
                  value={' '}
                />
              </Flex>
            </BAILayoutCard>
            <AllocatedResourcesCard />
          </Flex>
          <Flex direction="column" align="center" justify="around" gap={'lg'}>
            <BAILayoutCard
              title={
                <Flex direction="row" align="center" justify="start" gap={'xs'}>
                  <Typography.Title level={4} style={{ margin: 0 }}>
                    {'Recently Created Session'}
                  </Typography.Title>
                  <Button type="text" icon={<QuestionCircleOutlined />} />
                </Flex>
              }
              extra={
                <Button
                  type="text"
                  icon={<SyncOutlined />}
                  style={{ color: 'inherit' }}
                  onClick={() => {}}
                />
              }
              style={{ width: 1146, height: 360 }}
            >
              <SessionListTemplate
                dataSource={filterNonNullItems(
                  _.filter(
                    compute_session_list?.items,
                    (item) => item?.status !== 'TERMINATED',
                  ),
                )}
                columns={columns}
              ></SessionListTemplate>
            </BAILayoutCard>
            <BAILayoutCard
              title={
                <Flex direction="row" align="center" justify="start" gap={'xs'}>
                  <Typography.Title level={4} style={{ margin: 0 }}>
                    {'Most Resource allocated Sessions'}
                  </Typography.Title>
                  <Button type="text" icon={<QuestionCircleOutlined />} />
                </Flex>
              }
              extra={
                <Flex direction="row" align="center" justify="start" gap={'lg'}>
                  <Select
                    // TODO: show AI Accelerator
                    variant="borderless"
                    style={{ width: '100%' }}
                    defaultValue={'cuda.shares'}
                    options={[
                      {
                        label: 'NVIDIA CUDA FGPU',
                        value: 'cuda.shares',
                      },
                      // {
                      //   label: 'Rebellions ATOM',
                      //   value: 'atom.device',
                      // },
                    ]}
                  ></Select>
                  <Button
                    type="text"
                    icon={<SyncOutlined />}
                    style={{ color: 'inherit' }}
                    onClick={() => {}}
                  />
                </Flex>
              }
              style={{ width: 1146, height: 360 }}
            >
              <SessionListTemplate
                dataSource={filterNonNullItems(
                  _.filter(
                    compute_session_list?.items,
                    (item) => item?.status !== 'TERMINATED',
                  ),
                )}
                columns={columns}
              ></SessionListTemplate>
            </BAILayoutCard>
            {/* <BAILayoutCard
              title={
                <Flex direction="row" align="center" justify="start" gap={'xs'}>
                  <Typography.Title level={4} style={{ margin: 0 }}>
                    {'Pipeline Status'}
                  </Typography.Title>
                  <Button type="text" icon={<QuestionCircleOutlined />} />
                </Flex>
              }
              extra={
                <Button
                  type="text"
                  icon={<SyncOutlined />}
                  style={{ color: 'inherit' }}
                />
              }
              style={{ width: 1146, height: 329 }}
            ></BAILayoutCard> */}
          </Flex>
        </Flex>
      </ConfigProvider>
    </>
  );
};

export default DashboardPage;
