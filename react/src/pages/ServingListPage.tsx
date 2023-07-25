import { Button, ConfigProvider, Tabs, theme } from "antd";
import React, { PropsWithChildren, Suspense, useState } from "react";
import Flex from "../components/Flex";
import { useTranslation } from "react-i18next";
import ServingList from "../components/ServingList";
import RoutingListPage from "./RoutingListPage";
import ServiceLauncherModal from "../components/ServiceLauncherModal";
import { useCurrentProjectValue, useSuspendedBackendaiClient } from "../hooks";
import { baiSignedRequestWithPromise } from "../helper";
import { useTanQuery } from "../hooks/reactQueryAlias";


// FIXME: need to apply filtering type of service later
type TabKey = "services" //  "running" | "finished" | "others";

const ServingListPage: React.FC<PropsWithChildren> = ({ children }) => {
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  const { token } = theme.useToken();
  const curProject = useCurrentProjectValue();

  const [isOpenServiceLauncher, setIsOpenServiceLauncher] = useState(false);

  // FIXME: need to apply filtering type of service later
  const [selectedTab, setSelectedTab] = useState<TabKey>("services");
  const [selectedGeneration, setSelectedGeneration] = useState<
    "current" | "next"
  >("next");

  // const listQuery = useTanQuery(
  //   ["modelService"], // key
  //   () => {}, // async function
  //   {
  //     // for to render even this query fails
  //   }
  // );

  const { data: modelServiceList } = useTanQuery({
    queryKey: "modelService",
    queryFn: () => {
      return baiSignedRequestWithPromise({
        method: "GET",
        url: "/services",
        client: baiClient,
      });
    },
    // for to render even this query fails
    suspense: true,
  });

// FIXME: struggling with sending data when active tab changes!
  const runningModelServiceList = modelServiceList?.filter(
    (item: any) => item.desired_session_count >= 0
  );

  const termiantedModelServiceList = modelServiceList?.filter(
    (item: any) => item.desired_session_count < 0
  );

  const { data: resource } = useTanQuery({
    queryKey: "modelService",
    queryFn: () => {
      return baiSignedRequestWithPromise({
        method: "GET",
        url: "/services",
        client: baiClient,
      });
    },
    // for to render even this query fails
    suspense: true,
  });

  return (
    <>
      <Flex
        direction="column"
        align="stretch"
        style={{ padding: token.padding, gap: token.margin }}
      >
        {false ? (
          <Suspense fallback={<div>loading..</div>}>
            <RoutingListPage
              projectId={curProject.id}
              status={[]}
              extraFetchKey={""}
            />
          </Suspense>
        ) : (
          <></>
        )}
        {children}
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
                  {key: "services",
                   label: t("modelService.Services")
                  }
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
            <ServingList
              projectId={curProject.id}
              status={[]}
              extraFetchKey={""}
              dataSource={modelServiceList}
            />
          </Suspense>
        </Flex>
      </Flex>
      <ServiceLauncherModal
        open={isOpenServiceLauncher}
        onRequestClose={(success) => {
          setIsOpenServiceLauncher(!isOpenServiceLauncher);
        }}
      />
    </>
  );
};

export default ServingListPage;
