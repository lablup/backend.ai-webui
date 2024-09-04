import EndpointOwnerInfo from '../components/EndpointOwnerInfo';
import EndpointStatusTag from '../components/EndpointStatusTag';
import Flex from '../components/Flex';
import TableColumnsSettingModal from '../components/TableColumnsSettingModal';
import { baiSignedRequestWithPromise } from '../helper';
import {
  useSuspendedBackendaiClient,
  useUpdatableState,
  useWebUINavigate,
} from '../hooks';
import { useCurrentUserInfo } from '../hooks/backendai';
// import { getSortOrderByName } from '../hooks/reactPaginationQueryOptions';
import { useTanMutation } from '../hooks/reactQueryAlias';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import {
  EndpointListPageQuery,
  EndpointListPageQuery$data,
} from './__generated__/EndpointListPageQuery.graphql';
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  LoadingOutlined,
  ReloadOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useRafInterval } from 'ahooks';
import { useLocalStorageState } from 'ahooks';
import { Button, Table, Typography, theme, Radio, App } from 'antd';
import { ColumnsType } from 'antd/es/table';
import graphql from 'babel-plugin-relay/macro';
import { default as dayjs } from 'dayjs';
import _ from 'lodash';
import React, {
  PropsWithChildren,
  useState,
  useTransition,
  startTransition as startTransitionWithoutPendingState,
  useDeferredValue,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';
import { Link } from 'react-router-dom';

export type Endpoint = NonNullable<
  NonNullable<
    NonNullable<
      NonNullable<EndpointListPageQuery$data>['endpoint_list']
    >['items']
  >[0]
>;

type LifecycleStage = 'created&destroying' | 'destroyed';

const EndpointListPage: React.FC<PropsWithChildren> = ({ children }) => {
  const { t } = useTranslation();
  const { message, modal } = App.useApp();
  const baiClient = useSuspendedBackendaiClient();
  const webuiNavigate = useWebUINavigate();
  const { token } = theme.useToken();
  const curProject = useCurrentProjectValue();
  const [isOpenColumnsSetting, setIsOpenColumnsSetting] = useState(false);
  const [selectedLifecycleStage, setSelectedLifecycleStage] =
    useState<LifecycleStage>('created&destroying');
  const deferredSelectedLifecycleStage = useDeferredValue(
    selectedLifecycleStage,
  );
  const [paginationState, setPaginationState] = useState<{
    current: number;
    pageSize: number;
  }>({
    current: 1,
    pageSize: 10,
  });

  const deferredPaginationState = useDeferredValue(paginationState);
  const isPendingPaginationAndFilter =
    selectedLifecycleStage !== deferredSelectedLifecycleStage ||
    paginationState !== deferredPaginationState;

  const [isRefetchPending, startRefetchTransition] = useTransition();
  const [servicesFetchKey, updateServicesFetchKey] =
    useUpdatableState('initial-fetch');
  const [optimisticDeletingId, setOptimisticDeletingId] = useState<
    string | null
  >();
  const [currentUser] = useCurrentUserInfo();

  // const [selectedGeneration, setSelectedGeneration] = useState<
  //   "current" | "next"
  // >("next");

  const columns: ColumnsType<Endpoint> = [
    {
      title: t('modelService.EndpointName'),
      dataIndex: 'endpoint_id',
      key: 'endpointName',
      fixed: 'left',
      render: (endpoint_id, row) => (
        <Link to={'/serving/' + endpoint_id}>{row.name}</Link>
      ),
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
      dataIndex: 'endpoint_id',
      key: 'url',
      render: (endpoint_id, row) =>
        row.url ? (
          <Typography.Link copyable href={row.url} target="_blank">
            {row.url}
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
              row.desired_session_count < 0 ||
              row.status?.toLowerCase() === 'destroying' ||
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
              row.desired_session_count < 0 ||
              row.status?.toLowerCase() === 'destroying' ||
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
                  row.desired_session_count < 0 ||
                  row.status?.toLowerCase() === 'destroying'
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
            disabled={
              row.desired_session_count < 0 ||
              row.status?.toLowerCase() === 'destroying'
            }
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
                  setOptimisticDeletingId(row.endpoint_id);
                  // FIXME: any better idea for handling result?
                  row.endpoint_id &&
                    terminateModelServiceMutation.mutate(row.endpoint_id, {
                      onSuccess: (res) => {
                        startRefetchTransition(() => {
                          updateServicesFetchKey();
                        });
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
    ...(baiClient.is_admin
      ? [
          {
            title: t('modelService.Owner'),
            // created_user_email is referred by EndpointOwnerInfoFragment
            dataIndex: 'created_user_email',
            key: 'session_owner',
            render: (_: string, endpoint_info: Endpoint) => (
              <EndpointOwnerInfo endpointFrgmt={endpoint_info} />
            ),
          },
        ]
      : []),
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
      title: t('modelService.DesiredSessionCount'),
      dataIndex: 'desired_session_count',
      key: 'desiredSessionCount',
      render: (desired_session_count) => {
        return desired_session_count < 0 ? '-' : desired_session_count;
      },
    },
    {
      title: (
        <Flex direction="column" align="start">
          {t('modelService.RoutingsCount')}
          <br />
          <Typography.Text type="secondary" style={{ fontWeight: 'normal' }}>
            ({t('modelService.Active/Total')})
          </Typography.Text>
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
  ];
  const [displayedColumnKeys, setDisplayedColumnKeys] = useLocalStorageState(
    'backendaiwebui.EndpointListPage.displayedColumnKeys',
    {
      defaultValue: columns.map((column) => _.toString(column.key)),
    },
  );

  useRafInterval(() => {
    startTransitionWithoutPendingState(() => {
      updateServicesFetchKey();
    });
  }, 7000);

  const { endpoint_list: modelServiceList } =
    useLazyLoadQuery<EndpointListPageQuery>(
      graphql`
        query EndpointListPageQuery(
          $offset: Int!
          $limit: Int!
          $projectID: UUID
          $filter: String
        ) {
          endpoint_list(
            offset: $offset
            limit: $limit
            project: $projectID
            filter: $filter
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
              desired_session_count @required(action: NONE)
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
        offset:
          (deferredPaginationState.current - 1) *
          deferredPaginationState.pageSize,
        limit: deferredPaginationState.pageSize,
        projectID: curProject.id,
        filter:
          deferredSelectedLifecycleStage === 'created&destroying'
            ? `lifecycle_stage == "created" | lifecycle_stage == "destroying"`
            : `lifecycle_stage == "${deferredSelectedLifecycleStage}"`,
      },
      {
        fetchPolicy: 'network-only',
        fetchKey: servicesFetchKey,
      },
    );
  const sortedEndpointList = _.sortBy(modelServiceList?.items, 'name');

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
    <Flex direction="column" align="stretch">
      <Flex
        direction="row"
        justify="between"
        wrap="wrap"
        gap={'xs'}
        style={{
          padding: token.paddingContentVertical,
          paddingLeft: token.paddingContentHorizontalSM,
          paddingRight: token.paddingContentHorizontalSM,
        }}
      >
        <Flex direction="column" align="start">
          <Radio.Group
            value={selectedLifecycleStage}
            onChange={(e) => {
              setSelectedLifecycleStage(e.target?.value);
              // reset pagination state when filter changes
              setPaginationState({
                current: 1,
                pageSize: paginationState.pageSize,
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
        </Flex>
        <Flex direction="row" gap={'xs'} wrap="wrap" style={{ flexShrink: 1 }}>
          <Flex gap={'xs'}>
            <Button
              icon={<ReloadOutlined />}
              loading={isRefetchPending}
              onClick={() => {
                startRefetchTransition(() => updateServicesFetchKey());
              }}
            />
            <Button
              type="primary"
              onClick={() => {
                webuiNavigate('/service/start');
              }}
            >
              {t('modelService.StartService')}
            </Button>
          </Flex>
        </Flex>
      </Flex>
      <Table
        loading={{
          spinning: isPendingPaginationAndFilter,
          indicator: <LoadingOutlined />,
        }}
        scroll={{ x: 'max-content' }}
        rowKey={'endpoint_id'}
        dataSource={(sortedEndpointList || []) as Endpoint[]}
        columns={columns.filter((column) =>
          displayedColumnKeys?.includes(_.toString(column.key)),
        )}
        pagination={{
          pageSize: paginationState.pageSize,
          current: paginationState.current,
          pageSizeOptions: ['10', '20', '50'],
          total: modelServiceList?.total_count || 0,
          showSizeChanger: true,
          onChange(page, pageSize) {
            setPaginationState({
              current: page,
              pageSize: pageSize,
            });
          },
          style: { marginRight: token.marginXS },
        }}
      />
      <Flex
        justify="end"
        style={{
          padding: token.paddingXXS,
        }}
      >
        <Button
          type="text"
          icon={<SettingOutlined />}
          onClick={() => {
            setIsOpenColumnsSetting(true);
          }}
        />
      </Flex>
      <TableColumnsSettingModal
        open={isOpenColumnsSetting}
        onRequestClose={(values) => {
          values?.selectedColumnKeys &&
            setDisplayedColumnKeys(values?.selectedColumnKeys);
          setIsOpenColumnsSetting(!isOpenColumnsSetting);
        }}
        columns={columns}
        displayedColumnKeys={displayedColumnKeys ? displayedColumnKeys : []}
      />
    </Flex>
  );
};

export default EndpointListPage;
