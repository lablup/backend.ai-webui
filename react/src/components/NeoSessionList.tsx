import {
  filterNonNullItems,
  iSizeToSize,
  localeCompare,
  transformSorterToOrderString,
} from '../helper';
import { useUpdatableState } from '../hooks';
import { useBAIPaginationOptionState } from '../hooks/reactPaginationQueryOptions';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import Flex from './Flex';
import { NeoSessionListQuery } from './__generated__/NeoSessionListQuery.graphql';
import { SearchOutlined } from '@ant-design/icons';
import { Input, Progress, Radio, Table, Tag, theme, Typography } from 'antd';
import { AnyObject } from 'antd/es/_util/type';
import { TableRowSelection } from 'antd/es/table/interface';
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
  sessionType: status,
  ...props
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { id: projectId } = useCurrentProjectValue();

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

  return (
    <Flex direction="column" align="stretch" gap={16}>
      <Flex gap={16} direction="row">
        <Radio.Group
          options={[
            { label: t('session.Running'), value: 'running' },
            { label: t('session.Finished'), value: 'finished' },
          ]}
          optionType="button"
          buttonStyle="solid"
          defaultValue="running"
        />
        <Input
          style={{ width: 222 }}
          placeholder={t('propertyFilter.placeHolder')}
          suffix={<SearchOutlined />}
        />
      </Flex>
      <Table
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
      />
    </Flex>
  );
};

export default NeoSessionList;
