import {
  filterEmptyItem,
  filterNonNullItems,
  iSizeToSize,
  localeCompare,
  transformSorterToOrderString,
} from '../helper';
import { useSuspendedBackendaiClient, useUpdatableState } from '../hooks';
import { useBAIPaginationOptionState } from '../hooks/reactPaginationQueryOptions';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import BAIIntervalText from './BAIIntervalText';
import DoubleTag from './DoubleTag';
import Flex from './Flex';
import ResourceNumber from './ResourceNumber';
import SessionListTemplate from './SessionListTemplate';
import { NeoSessionListQuery } from './__generated__/NeoSessionListQuery.graphql';
import { SearchOutlined } from '@ant-design/icons';
import { Input, Progress, Radio, Table, Tag, theme, Typography } from 'antd';
import { AnyObject } from 'antd/es/_util/type';
import { ColumnType, TableRowSelection } from 'antd/lib/table/interface';
import graphql from 'babel-plugin-relay/macro';
import dayjs from 'dayjs';
import _ from 'lodash';
import React, { useTransition } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';

interface NeoSessionListProps {
  sessionType: string;
}

const NeoSessionList: React.FC<NeoSessionListProps> = ({
  sessionType: type,
  ...props
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { id: projectId } = useCurrentProjectValue();
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
  const [
    ,
    // isPendingPageChange
    startPageChangeTransition,
  ] = useTransition();
  const [order, setOrder] = useState<string>();
  // TODO: refactor with useControllableState
  const [selectedRowKeys, setSelectedRowKeys] = useState<Array<React.Key>>([]);
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const rowSelection: TableRowSelection<AnyObject> = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  const [radioValue, setRadioValue] = useState('running');
  const [inputValue, setInputValue] = useState('');

  const statusTagColor = {
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

  // if (
  //   !baiClient.supports('avoid-hol-blocking') &&
  //   status.includes('SCHEDULED')
  // ) {
  //   status = status?.filter((e) => e !== 'SCHEDULED');
  // }

  const { compute_session_list } = useLazyLoadQuery<NeoSessionListQuery>(
    graphql`
      query NeoSessionListQuery(
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
            terminated_at
            containers {
              live_stat
              last_stat
            }
            status
            occupied_slots
            resource_opts
          }
          total_count
        }
      }
    `,
    {
      limit: baiPaginationOption.limit,
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

  const columns = filterEmptyItem<ColumnType<any>>([
    {
      key: 'index',
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
      key: 'name',
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
      key: 'status',
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
      key: 'utils',
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
      key: 'accelerator',
      title: t('session.launcher.AIAccelerator'),
      render: (value, record) => (
        <Flex gap="xxs">
          {record.occupied_slots &&
            _.map(JSON.parse(record.occupied_slots), (value, type) => {
              if (_.includes(['cpu', 'mem'], type)) {
                return '-';
              }
              return (
                <ResourceNumber
                  key={type}
                  // @ts-ignore
                  type={type}
                  value={_.toString(value)}
                  opts={{
                    shmem: _.sum(
                      _.map(JSON.parse(record.resource_opts), (item) => {
                        return item.shmem;
                      }),
                    ),
                  }}
                />
              );
            })}
        </Flex>
      ),
    },
    {
      key: 'cpu',
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
      key: 'mem',
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
      key: 'elapsed',
      title: 'Elapsed',
      dataIndex: 'created_at',
      // @ts-ignore
      render: (value, record) => {
        return (
          <Flex direction="column" gap="xs">
            <BAIIntervalText
              callback={() => {
                return baiClient.utils.elapsedTime(value, record.terminated_at);
              }}
              delay={1000}
            />
          </Flex>
        );
      },
    },
  ]);

  return (
    <Flex direction="column" align="stretch" gap={'lg'}>
      <Flex gap={'lg'} direction="row">
        <Radio.Group
          options={[
            { label: t('session.Running'), value: 'running' },
            { label: t('session.Finished'), value: 'finished' },
          ]}
          optionType="button"
          buttonStyle="solid"
          defaultValue="running"
          value={radioValue}
          onChange={(e) => setRadioValue(e.target.value)}
        />
        <Input
          style={{ width: 222 }}
          placeholder={t('propertyFilter.placeHolder')}
          suffix={<SearchOutlined />}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
      </Flex>
      <SessionListTemplate
        dataSource={filterNonNullItems(
          _.filter(compute_session_list?.items, (item) => {
            const runningStatuses = [
              'RESTARTING',
              'PREPARING',
              'PULLING',
              'RUNNING',
              'RUNNING_DEGRADED',
              'PENDING',
              'SCHEDULED',
              'TERMINATING',
            ];
            const finishedStatuses = ['TERMINATED'];

            const isRunning = radioValue === 'running';
            const statusMatch = isRunning
              ? runningStatuses.includes(item?.status as string)
              : finishedStatuses.includes(item?.status as string);

            switch (type) {
              case 'all':
                return statusMatch;
              case 'interactive':
              case 'batch':
              case 'inference':
              case 'system':
                return (
                  statusMatch &&
                  item?.type?.toUpperCase() === type.toUpperCase()
                );
              default:
                return true;
            }
          }),
        )}
        columns={columns}
      ></SessionListTemplate>
      {/* <Table
        scroll={{ x: 'max-content' }}
        showSorterTooltip={false}
        sortDirections={['descend', 'ascend', 'descend']}
        dataSource={filterNonNullItems(compute_session_list?.items)}
        rowKey={'id'}
        rowSelection={rowSelection}
        pagination={{
          pageSize: tablePaginationOption.pageSize,
          total: compute_session_list?.total_count,
          current: tablePaginationOption.current,
          style: { marginRight: token.marginXS },
        }}
        onChange={({ pageSize, current }, filters, sorter) => {
          startPageChangeTransition(() => {
            if (_.isNumber(current) && _.isNumber(pageSize)) {
              setTablePaginationOption({
                current,
                pageSize,
              });
            }
            setOrder(transformSorterToOrderString(sorter));
          });
        }}
        columns={[
          {
            title: '#',
            fixed: 'left',
            render: (id, record, index) => {
              return (
                index +
                1 +
                (tablePaginationOption.current - 1) *
                  tablePaginationOption.pageSize
              );
            },
          },
          {
            title: 'Name',
            dataIndex: 'name',
            sorter: (a, b) => localeCompare(a.name, b.name),
            render: (value) => (
              <Typography.Text style={{ maxWidth: 122 }} ellipsis>
                {value}
              </Typography.Text>
            ),
          },
          {
            title: t('session.Status'),
            dataIndex: 'status',
            sorter: (a, b) => localeCompare(a.status, b.status),
            render: (value) => (
              <Tag color={_.get(statusTagColor, value)}>{value}</Tag>
            ),
          },
          {
            title: 'Utils.',
            render: () => (
              <Flex direction="column" justify="start" gap={4}>
                <Progress
                  percent={5}
                  strokeLinecap="butt"
                  size={[107, 11]}
                  strokeColor="#999"
                />
                <Progress
                  percent={100}
                  strokeLinecap="butt"
                  status="normal"
                  size={[107, 11]}
                  strokeColor="#999"
                />
                <Progress
                  percent={22}
                  strokeLinecap="butt"
                  size={[107, 11]}
                  strokeColor="#999"
                />
              </Flex>
            ),
          },
          {
            title: t('session.launcher.AIAccelerator'),
            render: () => 'CUDA FGPU',
          },
          {
            title: t('session.CPU'),
            // FIXME: parse occupied slots initially
            dataIndex: 'occupied_slots',
            render: (value) => {
              return _.get(JSON.parse(value), 'cpu', '-');
            },
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
            render: (value) => {
              const mem = _.get(JSON.parse(value), 'mem', '-');
              return mem === '-'
                ? mem
                : iSizeToSize(mem, 'G')?.numberUnit + 'iB';
            },
            sorter: (a, b) => {
              return (
                _.get(JSON.parse(a.occupied_slots), 'mem', 0) -
                _.get(JSON.parse(b.occupied_slots), 'mem', 0)
              );
            },
          },
          {
            title: 'Elapsed',
            render: (value, record) => {
              const createdAt = dayjs(record.created_at);
              const terminatedAt = dayjs(record.terminated_at);
              const diff = terminatedAt.diff(createdAt, 'second');
              const diffDuration = dayjs.duration(diff);
              const formattedDiff = `${diffDuration.hours().toString().padStart(2, '0')}:${diffDuration.minutes().toString().padStart(2, '0')}:${diffDuration.seconds().toString().padStart(2, '0')}`;
              return formattedDiff;
            },
          },
        ]}
      /> */}
    </Flex>
  );
};

export default NeoSessionList;
