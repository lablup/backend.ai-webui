import { baiSignedRequestWithPromise } from '../helper';
import {
  useSuspendedBackendaiClient,
  useUpdatableState,
  useCurrentProjectValue,
} from '../hooks';
import { useTanMutation } from '../hooks/reactQueryAlias';
import Flex from './Flex';
import {
  EndpointTokenListQuery,
  EndpointTokenListQuery$data,
} from './__generated__/EndpointTokenListQuery.graphql';
import {
  CheckOutlined,
  CloseOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  SettingOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import {
  Breadcrumb,
  Button,
  Card,
  Descriptions,
  Popover,
  Table,
  Tag,
  Tooltip,
  Typography,
  theme,
} from 'antd';
import graphql from 'babel-plugin-relay/macro';
import { default as dayjs } from 'dayjs';
import React, { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';

type EndpointToken = NonNullable<
  NonNullable<
    NonNullable<
      NonNullable<EndpointTokenListQuery$data>['endpoint_token_list']
    >['items']
  >[0]
>;

export interface EndpointTokenListProps {
  endpoint_id: string;
}

const dayDiff = (a: EndpointToken, b: EndpointToken) => {
  const date1 = dayjs(a.created_at);
  const date2 = dayjs(b.created_at);
  return date1.diff(date2);
};

const isExpired = (date: any) => {
  const timeFromNow = dayjs();
  const expiredDate = dayjs(date);
  return timeFromNow.diff(expiredDate) > 0;
};

const EndpointTokenList: React.FC<EndpointTokenListProps> = ({
  endpoint_id,
}) => {
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  const { token } = theme.useToken();
  const [paginationState] = useState<{
    current: number;
    pageSize: number;
  }>({
    current: 1,
    pageSize: 100,
  });
  const { Paragraph, Text } = Typography;
  const [servicesFetchKey, updateServicesFetchKey] =
    useUpdatableState('initial-fetch');

  const { endpoint_token_list } = useLazyLoadQuery<EndpointTokenListQuery>(
    graphql`
      query EndpointTokenListQuery(
        $offset: Int!
        $limit: Int!
        $endpointID: UUID!
      ) {
        endpoint_token_list(
          offset: $offset
          limit: $limit
          endpoint_id: $endpointID
        ) {
          total_count
          items {
            id
            token
            endpoint_id
            domain
            project
            session_owner
            created_at
            valid_until
          }
        }
      }
    `,
    {
      offset: (paginationState.current - 1) * paginationState.pageSize,
      limit: paginationState.pageSize,
      endpointID: endpoint_id,
    },
    {
      fetchPolicy:
        servicesFetchKey === 'initial-fetch'
          ? 'store-and-network'
          : 'network-only',
      fetchKey: servicesFetchKey,
    },
  );

  return (
    <Table
      scroll={{ x: 'max-content' }}
      columns={[
        {
          title: '#',
          render: (id, record, index) => {
            ++index;
            return index;
          },
          showSorterTooltip: false,
        },
        {
          title: 'Token',
          dataIndex: 'token',
          fixed: 'left',
          render: (text, row) => (
            <Text ellipsis copyable style={{ width: 150 }}>
              {row.token}
            </Text>
          ),
        },
        {
          title: 'Status',
          render: (text, row) => (
            <Tag color={isExpired(row.valid_until) ? 'red' : 'green'}>
              {isExpired(row.valid_until) ? 'Expired' : 'Valid'}
            </Tag>
          ),
        },
        {
          title: 'Valid Until',
          dataIndex: 'valid_until',
          render: (text, row) => (
            <span>
              {dayjs(row.valid_until).format('YYYY/MM/DD ddd HH:MM:ss')}
            </span>
          ),
          defaultSortOrder: 'descend',
          sortDirections: ['descend', 'ascend', 'descend'],
          sorter: dayDiff,
        },
        {
          title: 'Created at',
          dataIndex: 'created_at',
          render: (text, row) => (
            <span>
              {dayjs(row.created_at).format('YYYY/MM/DD ddd HH:MM:ss')}
            </span>
          ),
          defaultSortOrder: 'descend',
          sortDirections: ['descend', 'ascend', 'descend'],
          sorter: dayDiff,
        },
      ]}
      pagination={false}
      dataSource={endpoint_token_list?.items as EndpointToken[]}
    ></Table>
  );
};

export default EndpointTokenList;
