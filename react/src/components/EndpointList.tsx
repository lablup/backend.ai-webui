/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  EndpointListFragment$data,
  EndpointListFragment$key,
} from '../__generated__/EndpointListFragment.graphql';
import { baiSignedRequestWithPromise } from '../helper';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../hooks';
import { useCurrentUserInfo } from '../hooks/backendai';
import { useTanMutation } from '../hooks/reactQueryAlias';
import EndpointOwnerInfo from './EndpointOwnerInfo';
import EndpointStatusTag from './EndpointStatusTag';
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import {
  Button,
  Typography,
  theme,
  App,
  TablePaginationConfig,
  Tooltip,
} from 'antd';
import type { ColumnType } from 'antd/lib/table';
import {
  filterOutEmpty,
  filterOutNullAndUndefined,
  BAITable,
  BAITableProps,
  BAIFlex,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import _ from 'lodash';
import { InfoIcon } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';
import { Link } from 'react-router-dom';

type Endpoint = EndpointListFragment$data[number];

interface EndpointListProps extends Omit<
  BAITableProps<Endpoint>,
  'dataSource' | 'columns'
> {
  endpointsFrgmt: EndpointListFragment$key;
  loading?: boolean;
  pagination: TablePaginationConfig;
  onDeleted?: (endpoint: Endpoint) => void;
}

export const isEndpointInDestroyingCategory = (
  endpoint?: {
    desired_session_count: number | null | undefined;
    replicas: number | null | undefined;
    status: string | null | undefined;
  } | null,
) => {
  const count = endpoint?.replicas ?? endpoint?.desired_session_count;
  const status = endpoint?.status;
  return (
    (count ?? 0) < 0 || _.includes(['DESTROYED', 'DESTROYING'], status ?? '')
  );
};

const EndpointList: React.FC<EndpointListProps> = ({
  endpointsFrgmt,
  loading,
  pagination,
  // onPaginationChange,
  // onOrderChange,
  onDeleted,
  ...tableProps
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message, modal } = App.useApp();
  const [currentUser] = useCurrentUserInfo();
  const baiClient = useSuspendedBackendaiClient();
  const [optimisticDeletingId, setOptimisticDeletingId] = useState<string>();
  const webuiNavigate = useWebUINavigate();

  const endpoints = useFragment(
    graphql`
      fragment EndpointListFragment on Endpoint @relay(plural: true) {
        name
        endpoint_id
        status
        url
        open_to_public
        created_at
        replicas @since(version: "24.12.0")
        desired_session_count
        routings {
          status
        }
        created_user_email
        ...EndpointOwnerInfoFragment
        ...EndpointStatusTagFragment
      }
    `,
    endpointsFrgmt,
  );

  const terminateModelServiceMutation = useTanMutation<
    { success?: boolean },
    unknown,
    string
  >({
    mutationFn: (endpoint_id) => {
      return baiSignedRequestWithPromise({
        method: 'DELETE',
        url: '/services/' + endpoint_id,
        client: baiClient,
      });
    },
  });

  const columns = filterOutEmpty<ColumnType<Endpoint>>([
    {
      title: t('modelService.EndpointName'),
      key: 'endpointName',
      dataIndex: 'name',
      fixed: 'left',
      render: (name, row) => (
        <Link to={'/serving/' + row.endpoint_id}>{name}</Link>
      ),
      sorter: true,
    },
    {
      title: t('modelService.EndpointId'),
      dataIndex: 'endpoint_id',
      key: 'endpoint_id',
      width: 310,
      render: (endpoint_id) => (
        <Typography.Text code>{endpoint_id}</Typography.Text>
      ),
    },
    {
      title: t('modelService.ServiceEndpoint'),
      dataIndex: 'url',
      key: 'url',
      render: (url) =>
        url ? (
          <Typography.Link copyable href={url} target="_blank">
            {url}
          </Typography.Link>
        ) : (
          '-'
        ),
    },
    {
      title: t('modelService.Controls'),
      dataIndex: 'controls',
      key: 'controls',
      render: (_text, row) => (
        <BAIFlex direction="row" align="stretch">
          <Button
            type="text"
            icon={<SettingOutlined />}
            style={
              isEndpointInDestroyingCategory(row) ||
              (!!row.created_user_email &&
                row.created_user_email !== currentUser.email)
                ? {
                    color: token.colorTextDisabled,
                  }
                : {
                    color: token.colorInfo,
                  }
            }
            disabled={
              isEndpointInDestroyingCategory(row) ||
              (!!row.created_user_email &&
                row.created_user_email !== currentUser.email)
            }
            onClick={() => {
              webuiNavigate('/service/update/' + row.endpoint_id);
            }}
          />
          <Button
            type="text"
            icon={
              <DeleteOutlined
                style={
                  isEndpointInDestroyingCategory(row)
                    ? undefined
                    : {
                        color: token.colorError,
                      }
                }
              />
            }
            loading={
              terminateModelServiceMutation.isPending &&
              optimisticDeletingId === row.endpoint_id
            }
            disabled={isEndpointInDestroyingCategory(row)}
            onClick={() => {
              modal.confirm({
                title: t('dialog.ask.DoYouWantToDeleteSomething', {
                  name: row.name,
                }),
                content: t('dialog.warning.CannotBeUndone'),
                okText: t('button.Delete'),
                okButtonProps: {
                  danger: true,
                  type: 'primary',
                },
                onOk: () => {
                  setOptimisticDeletingId(row?.endpoint_id || undefined);
                  // FIXME: any better idea for handling result?
                  row.endpoint_id &&
                    terminateModelServiceMutation.mutate(row?.endpoint_id, {
                      onSuccess: (res) => {
                        onDeleted?.(row);
                        // FIXME: temporally refer to mutate input to message
                        if (res.success) {
                          message.success(
                            t('modelService.ServiceTerminated', {
                              name: row?.name,
                            }),
                          );
                        } else {
                          message.error(
                            t('modelService.FailedToTerminateService'),
                          );
                        }
                      },
                      onError: () => {
                        message.error(
                          t('modelService.FailedToTerminateService'),
                        );
                      },
                    });
                },
              });
            }}
          />
        </BAIFlex>
      ),
    },
    {
      title: t('modelService.Status'),
      key: 'status',
      render: (_text, row) => <EndpointStatusTag endpointFrgmt={row} />,
    },
    baiClient.is_admin && {
      title: t('modelService.Owner'),
      // created_user_email is referred by EndpointOwnerInfoFragment
      dataIndex: 'created_user_email',
      key: 'session_owner',
      render: (_: string, endpoint_info: Endpoint) => (
        <EndpointOwnerInfo endpointFrgmt={endpoint_info} />
      ),
    },
    {
      title: t('modelService.CreatedAt'),
      dataIndex: 'created_at',
      key: 'createdAt',
      render: (created_at) => {
        return dayjs(created_at).format('ll LT');
      },
      sorter: (a, b) => {
        const date1 = dayjs(a.created_at);
        const date2 = dayjs(b.created_at);
        return date1.diff(date2);
      },
    },
    {
      title: t('modelService.NumberOfReplicas'),
      dataIndex: baiClient.supports('replicas')
        ? 'replicas'
        : 'desired_session_count',
      key: 'desiredSessionCount',
      render: (desired_session_count: number) => {
        return desired_session_count < 0 ? '-' : desired_session_count;
      },
    },
    {
      title: (
        <BAIFlex direction="row" align="center" gap={'xs'}>
          {t('modelService.RoutingsCount')}
          <Tooltip title={t('modelService.Active/Total')}>
            <InfoIcon />
          </Tooltip>
          {/* <br />
          <Typography.Text type="secondary" style={{ fontWeight: 'normal' }}>
            ({t('modelService.Active/Total')})
          </Typography.Text> */}
        </BAIFlex>
      ),
      // dataIndex: "active_route_count",
      key: 'routingCount',
      render: (_text, row) => {
        return (
          _.filter(row.routings, (r) => r?.status === 'HEALTHY').length +
          ' / ' +
          row.routings?.length
        );
        // [r for r in endpoint.routings if r.status == RouteStatus.HEALTHY]
      },
    },
    {
      title: t('modelService.Public'),
      key: 'public',
      render: (_text, row) =>
        row.open_to_public ? (
          <CheckOutlined style={{ color: token.colorSuccess }} />
        ) : (
          <CloseOutlined style={{ color: token.colorTextSecondary }} />
        ),
    },
  ]);

  return (
    <BAITable
      size="small"
      loading={loading}
      scroll={{ x: 'max-content' }}
      rowKey={'endpoint_id'}
      dataSource={filterOutNullAndUndefined(endpoints)}
      columns={columns}
      pagination={pagination}
      {...tableProps}
    />
  );
};

export default EndpointList;
