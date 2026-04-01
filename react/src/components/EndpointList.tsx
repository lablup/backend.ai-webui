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
import { Typography, theme, App, TablePaginationConfig } from 'antd';
import type { ColumnType } from 'antd/lib/table';
import {
  filterOutEmpty,
  filterOutNullAndUndefined,
  BAITable,
  BAITableProps,
  BAINameActionCell,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

type Endpoint = EndpointListFragment$data[number];

interface EndpointListProps extends Omit<
  BAITableProps<Endpoint>,
  'dataSource' | 'columns'
> {
  endpointsFrgmt: EndpointListFragment$key;
  loading?: boolean;
  pagination: TablePaginationConfig;
  onDeleted?: (endpoint: Endpoint) => void;
  /** Controls UI-level button visibility for admin users.
   * Backend enforces actual authorization on service modification endpoints. */
  isAdminMode?: boolean;
}

export const isEndpointInDestroyingCategory = (
  endpoint?: {
    replicas: number | null | undefined;
    status: string | null | undefined;
  } | null,
) => {
  const count = endpoint?.replicas;
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
  isAdminMode = false,
  ...tableProps
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message, modal } = App.useApp();
  const [currentUser] = useCurrentUserInfo();
  const baiClient = useSuspendedBackendaiClient();
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
        replicas
        desired_session_count
        project
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
        <BAINameActionCell
          title={name}
          showActions="always"
          to={(isAdminMode ? '/admin-serving/' : '/serving/') + row.endpoint_id}
          actions={[
            {
              key: 'settings',
              title: t('button.Settings'),
              icon: <SettingOutlined />,
              disabled:
                isEndpointInDestroyingCategory(row) ||
                (!isAdminMode &&
                  !!row.created_user_email &&
                  row.created_user_email !== currentUser.email),
              onClick: () => {
                webuiNavigate('/service/update/' + row.endpoint_id);
              },
            },
            {
              key: 'delete',
              title: t('button.Delete'),
              icon: <DeleteOutlined />,
              type: 'danger',
              disabled: isEndpointInDestroyingCategory(row),
              onClick: () => {
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
                    if (row.endpoint_id) {
                      return new Promise<void>((resolve) => {
                        terminateModelServiceMutation.mutate(row.endpoint_id!, {
                          onSuccess: (res) => {
                            onDeleted?.(row);
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
                            resolve();
                          },
                          onError: () => {
                            message.error(
                              t('modelService.FailedToTerminateService'),
                            );
                            resolve();
                          },
                        });
                      });
                    }
                  },
                });
              },
            },
          ]}
        />
      ),
      sorter: true,
    },
    {
      title: t('data.Project'),
      dataIndex: 'project',
      key: 'project',
      defaultHidden: !isAdminMode,
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
      dataIndex: 'replicas',
      key: 'replicas',
      render: (replicas: number) => {
        return replicas < 0 ? '-' : replicas;
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
