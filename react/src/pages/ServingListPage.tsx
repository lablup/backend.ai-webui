import BAIModal from '../components/BAIModal';
import EndpointOwnerInfo from '../components/EndpointOwnerInfo';
import EndpointStatusTag from '../components/EndpointStatusTag';
import Flex from '../components/Flex';
import ServiceLauncherModal from '../components/ServiceLauncherModal';
import ServiceSettingModal from '../components/ServiceSettingModal';
import TableColumnsSettingModal from '../components/TableColumnsSettingModal';
import { baiSignedRequestWithPromise } from '../helper';
import {
  useCurrentProjectValue,
  useSuspendedBackendaiClient,
  useUpdatableState,
} from '../hooks';
// import { getSortOrderByName } from '../hooks/reactPaginationQueryOptions';
import { useTanMutation } from '../hooks/reactQueryAlias';
import {
  ServingListPageQuery,
  ServingListPageQuery$data,
} from './__generated__/ServingListPageQuery.graphql';
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useRafInterval } from 'ahooks';
import { useLocalStorageState } from 'ahooks';
import { Button, Table, Tabs, Typography, theme, message } from 'antd';
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

// FIXME: need to apply filtering type of service later
type TabKey = 'services'; //  "running" | "finished" | "others";

export type Endpoint = NonNullable<
  NonNullable<
    NonNullable<
      NonNullable<ServingListPageQuery$data>['endpoint_list']
    >['items']
  >[0]
>;

const ServingListPage: React.FC<PropsWithChildren> = ({ children }) => {
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  const { token } = theme.useToken();
  const curProject = useCurrentProjectValue();
  const [isOpenServiceLauncher, setIsOpenServiceLauncher] = useState(false);
  const [isOpenColumnsSetting, setIsOpenColumnsSetting] = useState(false);
  const [selectedModelService, setSelectedModelService] = useState<Endpoint>();
  const [isOpenServiceSettingModal, setIsOpenServiceSettingModal] =
    useState(false);

  // const [paginationState, setPaginationState] = useState<{
  const [paginationState] = useState<{
    current: number;
    pageSize: number;
  }>({
    current: 1,
    pageSize: 100,
  });

  const [isRefetchPending, startRefetchTransition] = useTransition();
  const [
    isOpenModelServiceTerminatingModal,
    setIsOpenModelServiceTerminatingModal,
  ] = useState(false);
  const [servicesFetchKey, updateServicesFetchKey] =
    useUpdatableState('initial-fetch');
  // FIXME: need to apply filtering type of service later
  const [selectedTab, setSelectedTab] = useState<TabKey>('services');
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
              row.status?.toLowerCase() === 'destroying'
                ? undefined
                : {
                    color: '#29b6f6',
                  }
            }
            disabled={
              row.desired_session_count < 0 ||
              row.status?.toLowerCase() === 'destroying'
            }
            onClick={() => {
              setIsOpenServiceSettingModal(true);
              setSelectedModelService(row);
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
            disabled={
              row.desired_session_count < 0 ||
              row.status?.toLowerCase() === 'destroying'
            }
            onClick={() => {
              setIsOpenModelServiceTerminatingModal(true);
              setSelectedModelService(row);
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
            // created_user_email is refered by EndpointOwnerInfoFragment
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
    'backendaiwebui.ServingListPage.displayedColumnKeys',
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
    useLazyLoadQuery<ServingListPageQuery>(
      graphql`
        query ServingListPageQuery(
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
              image
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
              ...ServiceSettingModal_endpoint
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

  const terminateModelServiceMutation = useTanMutation<
    unknown,
    {
      message?: string;
    }
  >({
    mutationFn: () => {
      return baiSignedRequestWithPromise({
        method: 'DELETE',
        url: '/services/' + selectedModelService?.endpoint_id,
        client: baiClient,
      });
    },
  });
  // const { data, refetch } = useTanQuery({
  //   queryKey: "terminateModelService",
  //   queryFn: () => {
  //     return baiSignedRequestWithPromise({
  //       method: "DELETE",
  //       url: "/services/" + selectedModelService?.id,
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
      <Flex
        direction="column"
        align="stretch"
        style={{ padding: token.padding }}
        gap={'xs'}
      >
        {/* <Card bordered title={t("summary.ResourceStatistics")}>
          <p>SessionList</p>
        </Card> */}
        {/* <Card bodyStyle={{ paddingTop: 0 }}> */}
        <Flex direction="column" align="stretch">
          <Flex style={{ flex: 1 }}>
            <Tabs
              // type="card"
              activeKey={selectedTab}
              onChange={(key) => setSelectedTab(key as TabKey)}
              tabBarStyle={{ marginBottom: 0 }}
              style={{
                width: '100%',
                paddingLeft: token.paddingMD,
                paddingRight: token.paddingMD,
                borderTopLeftRadius: token.borderRadius,
                borderTopRightRadius: token.borderRadius,
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
            {/* <Button type="text" icon={<MoreOutlined />} /> */}
          </Flex>
          {/* <Button type="primary" icon={<PoweroffOutlined />}>
          시작
        </Button> */}

          {/* @ts-ignore */}
          {/* <backend-ai-session-launcher
        location="session"
        id="session-launcher"
        active
      /> */}
          <Suspense fallback={<div>loading..</div>}>
            {/* <ServingList
              loading={isRefetchPending}
              projectId={curProject.id}
              status={[]}
              extraFetchKey={""}
              dataSource={modelServiceList}
              onClickEdit={(row) => {
                setIsOpenServiceSettingModal(true);
                setSelectedModelService(row);
              }}
              onClickTerminate={(row) => {
                setIsOpenModelServiceTerminatingModal(true);
                setSelectedModelService(row);
              }}
            /> */}
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
          </Suspense>
        </Flex>
        <Flex justify="end">
          <Button
            type="text"
            icon={<SettingOutlined />}
            onClick={() => {
              setIsOpenColumnsSetting(true);
            }}
          />
        </Flex>
      </Flex>
      <BAIModal
        open={isOpenModelServiceTerminatingModal}
        title={t('dialog.title.LetsDouble-Check')}
        okButtonProps={{
          loading: terminateModelServiceMutation.isLoading,
        }}
        onOk={() => {
          // FIXME: any better idea for handling result?
          terminateModelServiceMutation.mutate(undefined, {
            onSuccess: (res) => {
              startRefetchTransition(() => {
                updateServicesFetchKey();
              });
              setIsOpenModelServiceTerminatingModal(false);
            },
            onError: (err) => {
              if (err?.message) {
                message.error(
                  _.truncate(err?.message, {
                    length: 200,
                  }),
                );
              } else {
                message.error(t('modelService.FailedToTerminateService'));
              }
            },
          });
        }}
        onCancel={() => {
          setIsOpenModelServiceTerminatingModal(false);
        }}
      >
        <Flex direction="column" align="stretch" justify="center">
          <p>
            {t('modelService.YouAreAboutToTerminate') +
              (selectedModelService?.name || '') +
              '.'}
          </p>
          <p>{t('dialog.ask.DoYouWantToProceed')}</p>
        </Flex>
      </BAIModal>
      <ServiceSettingModal
        open={isOpenServiceSettingModal}
        onRequestClose={(success) => {
          setIsOpenServiceSettingModal(false);
          if (success) {
            startRefetchTransition(() => {
              updateServicesFetchKey();
            });
          }
        }}
        endpointFrgmt={selectedModelService || null}
      />
      <ServiceLauncherModal
        open={isOpenServiceLauncher}
        onRequestClose={(success) => {
          setIsOpenServiceLauncher(!isOpenServiceLauncher);
          if (success) {
            startRefetchTransition(() => {
              updateServicesFetchKey();
            });
          }
        }}
      />
      <TableColumnsSettingModal
        open={isOpenColumnsSetting}
        onRequestClose={(values) => {
          values?.selectedColumnKeys &&
            setDisplayedColumnKeys(values?.selectedColumnKeys);
          setIsOpenColumnsSetting(false);
        }}
        columns={columns}
        displayedColumnKeys={displayedColumnKeys ? displayedColumnKeys : []}
      />
    </>
  );
};

export default ServingListPage;
