import {
  Alert,
  ConfigProvider,
  Segmented,
  Tabs,
  Typography,
  theme,
} from "antd";
import React, { PropsWithChildren, Suspense, useState } from "react";
import Flex from "../components/Flex";
import { useTranslation } from "react-i18next";
import { ThunderboltTwoTone } from "@ant-design/icons";
import ServingList from "../components/ServingList";
import RoutingList from "../components/RoutingList";
import ServiceLauncher from "../components/ServiceLauncher";
import { useCurrentProjectValue, useSuspendedBackendaiClient } from "../hooks";


type TabKey = 
  | "running"
  | "finished"
  | "others";

const ServingListPage: React.FC<PropsWithChildren> = ({ children }) => {
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  const { token } = theme.useToken();
  const curProject = useCurrentProjectValue();

  const [selectedTab, setSelectedTab] = useState<TabKey>("running");
  const [selectedGeneration, setSelectedGeneration] = useState<
    "current" | "next"
  >("next");

  // console.log(compute_session_list?.items[0].);
  return (
    <>
      <Flex
        direction="column"
        align="stretch"
        style={{ padding: token.padding, gap: token.margin }}
      >
      { false ? (
        <Suspense fallback={<div>loading..</div>}>
          <RoutingList
            projectId={curProject.id}
            status={[]}
            extraFetchKey={""}
          />
        </Suspense>
      ) : (<></>)}
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
                activeKey={""}
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
                  {
                    key: "running",
                    label: t("session.Running"),
                  },
                  {
                    key: "finished",
                    label: t("session.Finished"),
                  },
                  {
                    key: "others",
                    label: t("session.Others"),
                  },
                ]}
                tabBarExtraContent={{
                  right: (
                    <Flex direction="row" gap={"sm"}>
                      {/* <Tooltip title={t("session.exportCSV")}>
                      <Button icon={<DownloadOutlined />} type="ghost" />
                    </Tooltip> */}
                      {/* @ts-ignore */}
                      <ServiceLauncher></ServiceLauncher>
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
            />
          </Suspense>
        </Flex>
      </Flex>
    </>
  );
};

export default ServingListPage;