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
import { useUpdatableState } from '../hooks';
import { useBAIPaginationOptionState } from '../hooks/reactPaginationQueryOptions';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { DashboardPageSessionListQuery } from './__generated__/DashboardPageSessionListQuery.graphql';
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
import React, { useTransition } from 'react';
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
                        3
                      </Typography.Title>
                      <Typography.Text
                        style={{ fontSize: 16, marginBottom: 3 }}
                      >
                        {' / 5'}
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
                        {'hello world'}
                      </Typography.Text>
                    </Flex>
                  }
                  prefix={
                    <Flex direction="row" align="end" justify="start">
                      <Typography.Title
                        level={1}
                        style={{ margin: 0, color: token.colorLinkHover }}
                      >
                        2
                      </Typography.Title>
                      <Typography.Text
                        style={{ fontSize: 16, marginBottom: 3 }}
                      >
                        {' / 3'}
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
                        {'hello world'}
                      </Typography.Text>
                    </Flex>
                  }
                  prefix={
                    <Flex direction="row" align="end" justify="start">
                      <Typography.Title
                        level={1}
                        style={{ margin: 0, color: token.colorLinkHover }}
                      >
                        1
                      </Typography.Title>
                      <Typography.Text
                        style={{ fontSize: 16, marginBottom: 3 }}
                      >
                        {' / 1'}
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
                />
              }
              style={{ width: 1146, height: 360 }}
            >
              <SessionListTemplate
                dataSource={filterNonNullItems(compute_session_list?.items)}
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
                      {
                        label: 'Rebellions ATOM',
                        value: 'atom.device',
                      },
                    ]}
                  ></Select>
                  <Button
                    type="text"
                    icon={<SyncOutlined />}
                    style={{ color: 'inherit' }}
                  />
                </Flex>
              }
              style={{ width: 1146, height: 360 }}
            >
              <SessionListTemplate
                dataSource={filterNonNullItems(compute_session_list?.items)}
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
