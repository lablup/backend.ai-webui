import {
  baiSignedRequestWithPromise,
  filterEmptyItem,
  filterNonNullItems,
  transformSorterToOrderString,
} from '../helper';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../hooks';
import { useCurrentUserInfo, useCurrentUserRole } from '../hooks/backendai';
import { useBAIPaginationOptionState } from '../hooks/reactPaginationQueryOptions';
// import { getSortOrderByName } from '../hooks/reactPaginationQueryOptions';
import { useTanMutation } from '../hooks/reactQueryAlias';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { useHiddenColumnKeysSetting } from '../hooks/useHiddenColumnKeysSetting';
import BAIPropertyFilter from './BAIPropertyFilter';
import BAIRadioGroup from './BAIRadioGroup';
import BAITable from './BAITable';
import EndpointOwnerInfo from './EndpointOwnerInfo';
import EndpointStatusTag from './EndpointStatusTag';
import Flex from './Flex';
import TableColumnsSettingModal from './TableColumnsSettingModal';
import {
  EndpointListQuery,
  EndpointListQuery$data,
} from './__generated__/EndpointListQuery.graphql';
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useToggle } from 'ahooks';
import { Button, Typography, theme, App, Tooltip } from 'antd';
import { ColumnType } from 'antd/lib/table';
import graphql from 'babel-plugin-relay/macro';
import { default as dayjs } from 'dayjs';
import _ from 'lodash';
import { InfoIcon } from 'lucide-react';
import React, { PropsWithChildren, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';
import { Link } from 'react-router-dom';
import { StringParam, useQueryParam } from 'use-query-params';

export type Endpoint = NonNullable<
  NonNullable<
    NonNullable<NonNullable<EndpointListQuery$data>['endpoint_list']>['items']
  >[0]
>;

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

type LifecycleStage = 'created&destroying' | 'destroyed';

interface EndpointListProps extends PropsWithChildren {
  style?: React.CSSProperties;
  fetchKey?: string;
  onDeleted?: (endpoint: Endpoint) => void;
}
const EndpointList: React.FC<EndpointListProps> = ({
  style,
  fetchKey,
  onDeleted,
  children,
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message, modal } = App.useApp();
  const [visibleColumnSettingModal, { toggle: toggleColumnSettingModal }] =
    useToggle();
  const [selectedLifecycleStage, setSelectedLifecycleStage] =
    useState<LifecycleStage>('created&destroying');

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionState({
    current: 1,
    pageSize: 10,
  });
  const lifecycleStageFilter =
    selectedLifecycleStage === 'created&destroying'
      ? `lifecycle_stage == "created" | lifecycle_stage == "destroying"`
      : `lifecycle_stage == "${selectedLifecycleStage}"`;

  const [isFilterPending, startFilterTransition] = useTransition();
  const [isPendingPageChange, startPageChangeTransition] = useTransition();
  const [optimisticDeletingId, setOptimisticDeletingId] = useState<
    string | null
  >();

  const [filterStr, setFilterStr] = useQueryParam('filter', StringParam);
  const [order, setOrder] = useState<string>();
  const [currentUser] = useCurrentUserInfo();
  const currentUserRole = useCurrentUserRole();
  const curProject = useCurrentProjectValue();
  const baiClient = useSuspendedBackendaiClient();
  const webuiNavigate = useWebUINavigate();

  const columns = filterEmptyItem<ColumnType<Endpoint>>([
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
      render: (text, row) => (
        <Flex direction="row" align="stretch">
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
                  setOptimisticDeletingId(row?.endpoint_id);
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
                      onError: (err) => {
                        message.error(
                          t('modelService.FailedToTerminateService'),
                        );
                      },
                    });
                },
              });
            }}
          />
        </Flex>
      ),
    },
    {
      title: t('modelService.Status'),
      key: 'status',
      render: (text, row) => <EndpointStatusTag endpointFrgmt={row} />,
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
      defaultSortOrder: 'descend',
      sortDirections: ['descend', 'ascend', 'descend'],
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
        <Flex direction="row" align="center" gap={'xs'}>
          {t('modelService.RoutingsCount')}
          <Tooltip title={t('modelService.Active/Total')}>
            <InfoIcon />
          </Tooltip>
          {/* <br />
          <Typography.Text type="secondary" style={{ fontWeight: 'normal' }}>
            ({t('modelService.Active/Total')})
          </Typography.Text> */}
        </Flex>
      ),
      // dataIndex: "active_route_count",
      key: 'routingCount',
      render: (text, row) => {
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
      render: (text, row) =>
        row.open_to_public ? (
          <CheckOutlined style={{ color: token.colorSuccess }} />
        ) : (
          <CloseOutlined style={{ color: token.colorTextSecondary }} />
        ),
    },
  ]);
  const [hiddenColumnKeys, setHiddenColumnKeys] =
    useHiddenColumnKeysSetting('EndpointListPage');

  const { endpoint_list: modelServiceList } =
    useLazyLoadQuery<EndpointListQuery>(
      graphql`
        query EndpointListQuery(
          $offset: Int!
          $limit: Int!
          $projectID: UUID
          $filter: String
          $order: String
        ) {
          endpoint_list(
            offset: $offset
            limit: $limit
            project: $projectID
            filter: $filter
            order: $order
          ) {
            total_count
            items {
              name
              endpoint_id
              model
              domain
              status
              project
              resource_group
              resource_slots
              url
              open_to_public
              created_at @since(version: "23.09.0")
              desired_session_count @deprecatedSince(version: "24.12.0")
              replicas @since(version: "24.12.0")
              routings {
                routing_id
                endpoint
                session
                traffic_ratio
                status
              }
              runtime_variant @since(version: "24.03.5") {
                name
                human_readable_name
              }
              created_user_email @since(version: "23.09.8")
              ...EndpointOwnerInfoFragment
              ...EndpointStatusTagFragment
            }
          }
        }
      `,
      {
        offset: baiPaginationOption.offset,
        limit: baiPaginationOption.limit,
        projectID: curProject.id,
        filter: baiClient.supports('endpoint-lifecycle-stage-filter')
          ? [lifecycleStageFilter, filterStr]
              .filter(Boolean)
              .map((v) => `(${v})`)
              .join(' & ')
          : undefined,
        order,
      },
      {
        fetchPolicy: 'network-only',
        fetchKey,
      },
    );

  // FIXME: struggling with sending data when active tab changes!
  // const runningModelServiceList = modelServiceList?.filter(
  //   (item: any) => item.desired_session_count >= 0
  // );

  // const terminatedModelServiceList = modelServiceList?.filter(
  //   (item: any) => item.desired_session_count < 0
  // );

  const terminateModelServiceMutation = useTanMutation<
    {
      success?: boolean;
    },
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

  return (
    <Flex direction="column" align="stretch" style={style} gap={'sm'}>
      <Flex
        direction="row"
        justify="between"
        align="start"
        wrap="wrap"
        gap={'xs'}
      >
        <Flex
          direction="row"
          gap={'sm'}
          align="start"
          wrap="wrap"
          style={{ flexShrink: 1 }}
        >
          {baiClient.supports('endpoint-lifecycle-stage-filter') && (
            <>
              <BAIRadioGroup
                value={selectedLifecycleStage}
                onChange={(e) => {
                  startPageChangeTransition(() => {
                    setSelectedLifecycleStage(e.target?.value);
                    setTablePaginationOption({
                      current: 1,
                      pageSize: 10,
                    });
                  });
                }}
                optionType="button"
                buttonStyle="solid"
                options={[
                  {
                    label: 'Active',
                    value: 'created&destroying',
                  },
                  {
                    label: 'Destroyed',
                    value: 'destroyed',
                  },
                ]}
              />
              <BAIPropertyFilter
                value={filterStr || undefined}
                onChange={(v) => {
                  startFilterTransition(() => {
                    setFilterStr(v, 'replaceIn');
                  });
                }}
                loading={isFilterPending}
                filterProperties={filterEmptyItem([
                  // https://github.com/lablup/backend.ai/blob/main/src/ai/backend/manager/models/endpoint.py#L766-L773
                  {
                    key: 'name',
                    type: 'string',
                    propertyLabel: t('modelService.EndpointName'),
                  },
                  {
                    key: 'url',
                    type: 'string',
                    propertyLabel: t('modelService.ServiceEndpoint'),
                  },
                  currentUserRole === 'admin' ||
                  currentUserRole === 'superadmin'
                    ? {
                        key: 'created_user_email',
                        type: 'string',
                        propertyLabel: t('modelService.Owner'),
                      }
                    : undefined,
                  // not supported yet
                  // {
                  //   key: 'open_to_public',
                  //   propertyLabel: t('modelService.Public'),
                  //   type: 'boolean',
                  //   options: [
                  //     {
                  //       value: 'true',
                  //     },
                  //     {
                  //       value:'false'
                  //     }
                  //   ]
                  // }
                ])}
              />
            </>
          )}
        </Flex>
      </Flex>
      <Flex direction="column" align="stretch">
        <BAITable
          neoStyle
          size="small"
          loading={isFilterPending || isPendingPageChange}
          scroll={{ x: 'max-content' }}
          rowKey={'endpoint_id'}
          dataSource={filterNonNullItems(modelServiceList?.items)}
          columns={_.filter(
            columns,
            (column) => !_.includes(hiddenColumnKeys, _.toString(column?.key)),
          )}
          sortDirections={['descend', 'ascend', 'descend']}
          pagination={{
            pageSize: tablePaginationOption.pageSize,
            current: tablePaginationOption.current,
            pageSizeOptions: ['10', '20', '50'],
            total: modelServiceList?.total_count || 0,
            showSizeChanger: true,
            style: { marginRight: token.marginXS },
          }}
          onChange={({ pageSize, current }, filter, sorter) => {
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
        />
        <Flex justify="end">
          <Button
            type="text"
            icon={<SettingOutlined />}
            onClick={() => {
              toggleColumnSettingModal();
            }}
          />
        </Flex>
        <TableColumnsSettingModal
          open={visibleColumnSettingModal}
          onRequestClose={(values) => {
            values?.selectedColumnKeys &&
              setHiddenColumnKeys(
                _.difference(
                  columns.map((column) => _.toString(column.key)),
                  values?.selectedColumnKeys,
                ),
              );
            toggleColumnSettingModal();
          }}
          columns={columns}
          hiddenColumnKeys={hiddenColumnKeys}
        />
      </Flex>
    </Flex>
  );
};

export default EndpointList;
