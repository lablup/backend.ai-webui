import BAIModal from '../components/BAIModal';
import EndpointStatusTag from '../components/EndpointStatusTag';
import Flex from '../components/Flex';
import ModelServiceSettingModal from '../components/ModelServiceSettingModal';
import ServiceLauncherModal from '../components/ServiceLauncherModal';
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
import { Button, Table, Tabs, Typography, theme } from 'antd';
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

type Endpoint = NonNullable<
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
  const [selectedModelService, setSelectedModelService] = useState<Endpoint>();
  const [isOpenModelServiceSettingModal, setIsOpenModelServiceSettingModal] =
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
              created_at
              created_user
              desired_session_count @required(action: NONE)
              routings {
                routing_id
                endpoint
                session
                traffic_ratio
                status
              }
              ...ModelServiceSettingModal_endpoint
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
        style={{ padding: token.padding, gap: token.margin }}
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
                setIsOpenModelServiceSettingModal(true);
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
              columns={[
                {
                  title: t('modelService.EndpointName'),
                  dataIndex: 'endpoint_id',
                  fixed: 'left',
                  render: (endpoint_id, row) => (
                    <Link to={'/serving/' + endpoint_id}>{row.name}</Link>
                  ),
                },
                {
                  title: t('modelService.EndpointId'),
                  dataIndex: 'endpoint_id',
                  width: 310,
                  render: (endpoint_id) => (
                    <Typography.Text code>{endpoint_id}</Typography.Text>
                  ),
                },
                {
                  title: t('modelService.Controls'),
                  dataIndex: 'controls',
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
                          setIsOpenModelServiceSettingModal(true);
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
                  render: (text, row) => (
                    <EndpointStatusTag endpointFrgmt={row} />
                  ),
                },
                {
                  title: t('modelService.CreatedAt'),
                  dataIndex: 'created_at',
                  render: (created_at) => {
                    return dayjs(created_at).format('YYYY/MM/DD HH:mm:ss');
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
                  render: (desired_session_count) => {
                    return desired_session_count < 0
                      ? '-'
                      : desired_session_count;
                  },
                },
                {
                  title: (
                    <Flex direction="column" align="start">
                      {t('modelService.RoutingsCount')}
                      <br />
                      <Typography.Text
                        type="secondary"
                        style={{ fontWeight: 'normal' }}
                      >
                        ({t('modelService.Active/Total')})
                      </Typography.Text>
                    </Flex>
                  ),
                  // dataIndex: "active_route_count",
                  render: (text, row) => {
                    return (
                      _.filter(row.routings, (r) => r?.status === 'HEALTHY')
                        .length +
                      ' / ' +
                      row.routings?.length
                    );
                    // [r for r in endpoint.routings if r.status == RouteStatus.HEALTHY]
                  },
                },
                {
                  title: t('modelService.Public'),
                  render: (text, row) =>
                    row.open_to_public ? (
                      <CheckOutlined style={{ color: token.colorSuccess }} />
                    ) : (
                      <CloseOutlined
                        style={{ color: token.colorTextSecondary }}
                      />
                    ),
                },
              ]}
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
              console.log('terminateModelServiceMutation Error', err);
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
      <ModelServiceSettingModal
        open={isOpenModelServiceSettingModal}
        onRequestClose={(success) => {
          setIsOpenModelServiceSettingModal(false);
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
    </>
  );
};

export default ServingListPage;
