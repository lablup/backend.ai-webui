import Flex from './Flex';
import { baiSignedRequestWithPromise } from '../helper';
import { useSuspendedBackendaiClient, useUpdatableState, useCurrentProjectValue } from '../hooks';
import { useTanMutation } from '../hooks/reactQueryAlias';
import { EndpointTokenListQuery, EndpointTokenListQuery$data } from './__generated__/EndpointTokenListQuery.graphql';

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
import React, { PropsWithChildren, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';
import { useNavigate, useParams } from 'react-router-dom';

type EndpointToken = NonNullable<NonNullable<NonNullable<NonNullable<EndpointTokenListQuery$data>['endpoint_token_list']>['items']>[0]>;

export interface EndpointTokenListProps {
  endpoint_id: string;
}

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
  const [servicesFetchKey, updateServicesFetchKey] = useUpdatableState('initial-fetch');

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
          endpoint_id: $endpointID)
          {
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
    scroll={{ x: 'max-content'}}
    columns={[
      {
        title: 'Token',
        dataIndex: 'token',
        fixed: 'left'
      },
      {
        title: 'Created at',
        dataIndex: 'created_at',
      },
      {
        title: 'Valid Until',
        dataIndex: 'valid_until',
      },
    ]}
    pagination={false}
    dataSource={ (endpoint_token_list?.items) as EndpointToken[]}>
    </Table>
  )
}

export default EndpointTokenList;
