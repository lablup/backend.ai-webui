import { Button, ConfigProvider, Modal, Table, Tabs, Tag, theme } from "antd";
import React, {
  PropsWithChildren,
  Suspense,
  useState,
  useTransition,
} from "react";
import Flex from "../components/Flex";
import { useTranslation } from "react-i18next";
import ServingList, { ServingListInfo } from "../components/ServingList";
import ServiceLauncherModal from "../components/ServiceLauncherModal";
import {
  useCurrentProjectValue,
  useSuspendedBackendaiClient,
  useUpdatableState,
} from "../hooks";
import { baiSignedRequestWithPromise } from "../helper";
import { useTanMutation, useTanQuery } from "../hooks/reactQueryAlias";
import ModelServiceSettingModal from "../components/ModelServiceSettingModal";
import { useRafInterval } from "ahooks";
import graphql from "babel-plugin-relay/macro";
import { useLazyLoadQuery } from "react-relay";
import {
  ServingListPageQuery,
  ServingListPageQuery$data,
} from "./__generated__/ServingListPageQuery.graphql";
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import _ from "lodash";

// FIXME: need to apply filtering type of service later
type TabKey = "services"; //  "running" | "finished" | "others";

type Endpoint = NonNullable<
  NonNullable<
    NonNullable<
      NonNullable<ServingListPageQuery$data>["endpoint_list"]
    >["items"]
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

  const [isRefetchPending, startRefetchTransition] = useTransition();
  const [
    isOpenModelServiceTerminatingModal,
    setIsOpenModelServiceTerminatingModal,
  ] = useState(false);
  const [servicesFetchKey, updateServicesFetchKey] = useUpdatableState("init");
  // FIXME: need to apply filtering type of service later
  const [selectedTab, setSelectedTab] = useState<TabKey>("services");
  // const [selectedGeneration, setSelectedGeneration] = useState<
  //   "current" | "next"
  // >("next");

  useRafInterval(() => {
    startRefetchTransition(() => {
      updateServicesFetchKey();
    });
  }, 7000);

  // const { data: modelServiceList } = useTanQuery({
  //   queryKey: ["modelService", servicesFetchKey],
  //   queryFn: () => {
  //     return baiSignedRequestWithPromise({
  //       method: "GET",
  //       url: "/services",
  //       client: baiClient,
  //     });
  //   },
  //   refetchOnMount: true,
  //   staleTime: 5000,
  //   suspense: true,
  // });

  const { endpoint_list: modelServiceList } =
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
            order: "-name"
          ) {
            items {
              name
              endpoint_id
              image
              model
              domain
              project
              resource_group
              resource_slots
              url
              open_to_public
              desired_session_count @required(action: NONE)
              routings {
                routing_id
                endpoint
                session
                traffic_ratio
                status
              }
              ...ModelServiceSettingModal_endpoint
            }
          }
        }
      `,
      {
        offset: 0,
        limit: 10,
        projectID: curProject.id,
      },
      {
        fetchPolicy: "store-and-network",
        fetchKey: servicesFetchKey,
      }
    );

  console.log(modelServiceList);

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
        method: "DELETE",
        url: "/services/" + selectedModelService?.endpoint_id,
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
            <ConfigProvider
              theme={{
                algorithm: theme.darkAlgorithm,
                components: {
                  Tabs: {
                    colorPrimary: "#92E868",
                  },
                },
              }}
            >
              <Tabs
                // type="card"
                activeKey={selectedTab}
                onChange={(key) => setSelectedTab(key as TabKey)}
                tabBarStyle={{ marginBottom: 0 }}
                style={{
                  width: "100%",
                  backgroundColor: "#2A2C30",
                  paddingLeft: token.paddingMD,
                  paddingRight: token.paddingMD,
                  borderTopLeftRadius: token.borderRadius,
                  borderTopRightRadius: token.borderRadius,
                }}
                items={[
                  { key: "services", label: t("modelService.Services") },
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
                    <Flex direction="row" gap={"sm"}>
                      {/* <Tooltip title={t("session.exportCSV")}>
                      <Button icon={<DownloadOutlined />} type="ghost" />
                    </Tooltip> */}
                      {/* @ts-ignore */}
                      <Button
                        type="primary"
                        onClick={() => {
                          setIsOpenServiceLauncher(true);
                        }}
                      >
                        Start Service
                      </Button>
                      {/* <ServiceLauncherModal></ServiceLauncherModal> */}
                    </Flex>
                  ),
                }}
              />
            </ConfigProvider>
            {/* <Button type="ghost" icon={<MoreOutlined />} /> */}
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
              dataSource={(modelServiceList?.items || []) as Endpoint[]}
              columns={[
                {
                  title: "Endpoint ID",
                  dataIndex: "endpoint_id",
                  fixed: "left",
                  render: (endpoint_id, row) => (
                    <Link to={"/serving/" + endpoint_id}>{row.name}</Link>
                  ),
                },
                {
                  title: "Service Id",
                  dataIndex: "id",
                },
                {
                  title: "Controls",
                  dataIndex: "controls",
                  render: (text, row) => (
                    <Flex direction="row" align="stretch">
                      <Button
                        type="text"
                        icon={<SettingOutlined />}
                        style={
                          row.desired_session_count > 0
                            ? {
                                color: "#29b6f6",
                              }
                            : undefined
                        }
                        disabled={row.desired_session_count < 0}
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
                              row.desired_session_count > 0
                                ? {
                                    color: token.colorError,
                                  }
                                : undefined
                            }
                          />
                        }
                        disabled={row.desired_session_count < 0}
                        onClick={() => {
                          setIsOpenModelServiceTerminatingModal(true);
                          setSelectedModelService(row);
                        }}
                      />
                    </Flex>
                  ),
                },
                {
                  title: "Status",
                  dataIndex: "status",
                  render: (text, row) => (
                    <Tag
                      color={applyStatusColor(
                        row.desired_session_count > 0 ? "RUNNING" : "TERMINATED"
                      )}
                    >
                      {row.desired_session_count > 0 ? "RUNNING" : "TERMINATED"}
                    </Tag>
                  ),
                },
                {
                  title: "Desired Session Count",
                  dataIndex: "desired_session_count",
                  render: (desired_session_count) => {
                    return desired_session_count < 0
                      ? "-"
                      : desired_session_count;
                  },
                },
                {
                  title: "Routings Count(active/total)",
                  // dataIndex: "active_route_count",
                  render: (text, row) => {
                    return (
                      _.filter(row.routings, (r) => r?.status === "healthy")
                        .length +
                      " / " +
                      row.routings?.length
                    );
                    // [r for r in endpoint.routings if r.status == RouteStatus.HEALTHY]
                  },
                },
                {
                  title: "Open To Public",
                  render: (text, row) =>
                    row.open_to_public ? <CheckOutlined /> : <CloseOutlined />,
                },
              ]}
            />
          </Suspense>
        </Flex>
      </Flex>
      <Modal
        open={isOpenModelServiceTerminatingModal}
        // TODO: translation
        title={t("dialog.title.LetsDouble-Check")}
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
              console.log("terminateModelServiceMutation Error", err);
            },
          });
        }}
        onCancel={() => {
          setIsOpenModelServiceTerminatingModal(false);
        }}
      >
        <Flex direction="column" align="stretch" justify="center">
          <p>
            {"You are about to terminate " +
              (selectedModelService?.name || "") +
              "."}
          </p>
          <p>{t("dialog.ask.DoYouWantToProceed")}</p>
        </Flex>
      </Modal>
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

const applyStatusColor = (status = "") => {
  let color = "default";
  switch (status.toUpperCase()) {
    case "RUNNING":
      color = "success";
      break;
    // case 'TERMINATED':
    //   color = 'default';
    //   break;
  }
  return color;
};

export default ServingListPage;
