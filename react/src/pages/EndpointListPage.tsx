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
  ReloadOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useRafInterval } from 'ahooks';
import { useLocalStorageState } from 'ahooks';
import { Button, Table, Typography, theme, message, Popconfirm } from 'antd';
import { ColumnsType } from 'antd/es/table';
import graphql from 'babel-plugin-relay/macro';
import { default as dayjs } from 'dayjs';
import _ from 'lodash';
import React, {
  PropsWithChildren,
  Suspense,
  useState,
  useTransition,
  startTransition as startTransitionWithoutPendingState,
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

const EndpointListPage: React.FC<PropsWithChildren> = ({ children }) => {
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  const webuiNavigate = useWebUINavigate();
  const { token } = theme.useToken();
  const curProject = useCurrentProjectValue();
  const [isOpenColumnsSetting, setIsOpenColumnsSetting] = useState(false);
  const [terminatingModelService, setTerminatingModelService] =
    useState<Endpoint | null>(null);

  // const [paginationState, setPaginationState] = useState<{
  const [paginationState] = useState<{
    current: number;
    pageSize: number;
  }>({
    current: 1,
    pageSize: 100,
  });

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
          <Popconfirm
            title={t('dialog.ask.DoYouWantToDeleteSomething', {
              name: row.name,
            })}
            description={t('dialog.warning.CannotBeUndone')}
            okType="danger"
            okText={t('button.Delete')}
            onConfirm={() => {
              setOptimisticDeletingId(row.endpoint_id);
              // FIXME: any better idea for handling result?
              terminateModelServiceMutation.mutate(
                terminatingModelService?.endpoint_id || '',
                {
                  onSuccess: (res) => {
                    startRefetchTransition(() => {
                      updateServicesFetchKey();
                    });
                    // FIXME: temporally refer to mutate input to message
                    message.success(
                      t('modelService.ServiceTerminated', {
                        name: terminatingModelService?.name,
                      }),
                    );
                  },
                  onError: (err) => {
                    console.log(err);
                    message.error(t('modelService.FailedToTerminateService'));
                  },
                },
              );
            }}
          >
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
                terminateModelServiceMutation.isLoading &&
                optimisticDeletingId === row.endpoint_id
              }
              disabled={
                row.desired_session_count < 0 ||
                row.status?.toLowerCase() === 'destroying'
              }
              onClick={() => {
                setTerminatingModelService(row);
              }}
            />
          </Popconfirm>
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
    // TODO: need to convert LazyLoadQuery to pagination query with option
    useLazyLoadQuery<EndpointListPageQuery>(
      graphql`
        query EndpointListPageQuery(
          $offset: Int!
          $limit: Int!
          $projectID: UUID
        ) {
          endpoint_list(
            offset: $offset
            limit: $limit
            project: $projectID
            filter: "name != 'koalpaca-test'"
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
        offset: (paginationState.current - 1) * paginationState.pageSize,
        limit: paginationState.pageSize,
        projectID: curProject.id,
      },
      {
        fetchPolicy:
          servicesFetchKey === 'initial-fetch'
            ? 'store-and-network'
            : 'network-only',
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

  const terminateModelServiceMutation = useTanMutation({
    mutationFn: (endpoint_id: string) => {
      return baiSignedRequestWithPromise({
        method: 'DELETE',
        url: '/services/' + endpoint_id,
        client: baiClient,
      });
    },
  });
  // const { data, refetch } = useTanQuery({
  //   queryKey: "terminateModelService",
  //   queryFn: () => {
  //     return baiSignedRequestWithPromise({
  //       method: "DELETE",
  //       url: "/services/" + editingModelService?.id,
  //       client: baiClient,
  //     });
  //   },
  //   onSuccess: (res: any) => {
  //     console.log(res);
  //   },
  //   onError: (err: any) => {
  //     console.log(err);
  //   },
  //   enabled: false,
  //   // for to render even this query fails
  //   suspense: true,
  // });

  return (
    <>
      <Flex direction="column" align="stretch">
        {/* <Card bordered title={t("summary.ResourceStatistics")}>
          <p>SessionList</p>
        </Card> */}
        {/* <Card bodyStyle={{ paddingTop: 0 }}> */}
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
            <Typography.Text style={{ margin: 0, padding: 0 }}>
              {t('modelService.Services')}
            </Typography.Text>
          </Flex>
          <Flex
            direction="row"
            gap={'xs'}
            wrap="wrap"
            style={{ flexShrink: 1 }}
          >
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
        <Suspense fallback={<div>loading..</div>}>
          <Table
            loading={isRefetchPending}
            scroll={{ x: 'max-content' }}
            rowKey={'endpoint_id'}
            dataSource={(sortedEndpointList || []) as Endpoint[]}
            columns={columns.filter((column) =>
              displayedColumnKeys?.includes(_.toString(column.key)),
            )}
            // pagination={{
            //   pageSize: paginationState.pageSize,
            //   current: paginationState.current,
            //   total: modelServiceList?.total_count || 0,
            //   showSizeChanger: true,
            //   // showTotal(total, range) {
            //   //   return `${range[0]}-${range[1]} of ${total}`;
            //   // },
            //   onChange(page, pageSize) {
            //     startRefetchTransition(() => {
            //       setPaginationState({
            //         current: page,
            //         pageSize: pageSize || 100,
            //       });
            //     });
            //   },
            // }}
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
        </Suspense>
        {/* <Tabs
            // type="card"
            activeKey={selectedTab}
            onChange={(key) => setSelectedTab(key as TabKey)}
            tabBarStyle={{ marginBottom: 0 }}
            style={{
              width: '100%',
            }}
            items={[
              { key: 'services', label: t('modelService.Services') },
              // FIXME: need to apply filtering type of service later
              // {
              //   key: "running",
              //   label: t("session.Running"),
              // },
              // {
              //   key: "finished",
              //   label: t("session.Finished"),
              // },
              // {
              //   key: "others",
              //   label: t("session.Others"),
              // },
            ]}
            tabBarExtraContent={{
              right: (
                <Button
                  type="primary"
                  onClick={() => {
                    setIsOpenServiceLauncher(true);
                  }}
                >
                  {t('modelService.StartService')}
                </Button>
              ),
            }}
          />
          <Suspense fallback={<div>loading..</div>}>
            <Table
              loading={isRefetchPending}
              scroll={{ x: 'max-content' }}
              rowKey={'endpoint_id'}
              dataSource={(sortedEndpointList || []) as Endpoint[]}
              columns={columns.filter(
                (column) =>
                  displayedColumnKeys?.includes(_.toString(column.key)),
              )}
              pagination={false}
              // pagination={{
              //   pageSize: paginationState.pageSize,
              //   current: paginationState.current,
              //   total: modelServiceList?.total_count || 0,
              //   showSizeChanger: true,
              //   // showTotal(total, range) {
              //   //   return `${range[0]}-${range[1]} of ${total}`;
              //   // },
              //   onChange(page, pageSize) {
              //     startRefetchTransition(() => {
              //       setPaginationState({
              //         current: page,
              //         pageSize: pageSize || 100,
              //       });
              //     });
              //   },
              // }}
            />
          </Suspense> */}
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
    </>
  );
};

export default EndpointListPage;
