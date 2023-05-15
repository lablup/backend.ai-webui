import { Button, Card, ConfigProvider, Table, Tabs, theme } from "antd";
import React, { PropsWithChildren, useState } from "react";
import Flex from "../components/Flex";
import { useTranslation } from "react-i18next";
import {
  DownloadOutlined,
  MoreOutlined,
  PoweroffOutlined,
} from "@ant-design/icons";
import { useSuspendedBackendaiClient } from "../components/BackendaiClientProvider";
import { useLazyLoadQuery } from "react-relay";
import graphql from "babel-plugin-relay/macro";
import { SessionListQuery } from "./__generated__/SessionListQuery.graphql";

const SessionList: React.FC<PropsWithChildren> = ({ children }) => {
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  const { token } = theme.useToken();

  const [selectedTab, setSelectedTab] = useState("running");

  const { compute_session_list } = useLazyLoadQuery<SessionListQuery>(
    graphql`
      query SessionListQuery(
        $limit: Int!
        $offset: Int!
        $ak: String
        $group_id: String
        $status: String
        $skipCodejong: Boolean!
      ) {
        compute_session_list(
          limit: $limit
          offset: $offset
          access_key: $ak
          group_id: $group_id
          status: $status
        ) {
          items {
            id
            # hello
            name @skipOnClient(if: $skipCodejong)
            # group_name @skip(if: $skipCodejong)
            # domain_name @required(action: LOG)
            # codejong
            # @graphql-ignore
            # hello @skip(if: true)

            # @ts-ignore

            # id session_id name image architecture created_at terminated_at status status_info service_ports mounts occupied_slots access_key starts_at type cluster_size cluster_mode status_data idle_checks inference_metrics scaling_group user_email containers {container_id agent occupied_slots live_stat last_stat} containers {agent}
          }
        }
      }
    `,
    {
      skipCodejong: true,
      limit: 50,
      offset: 0,
      status:
        "RUNNING,RESTARTING,TERMINATING,PENDING,SCHEDULED,PREPARING,PULLING",
      group_id: "2de2b969-1d04-48a6-af16-0bc8adb3c831",
    }
  );

  // console.log(compute_session_list?.items[0].);
  return (
    <Flex
      direction="column"
      align="stretch"
      style={{ padding: token.padding, gap: token.margin }}
    >
      {children}
      <Card bordered title={t("summary.ResourceStatistics")}>
        <p>SessionList</p>
      </Card>

      {/* <Card bodyStyle={{ paddingTop: 0 }}> */}
      <Flex direction="column" align="stretch">
        <Flex style={{ flex: 1 }}>
          <Tabs
            type="card"
            activeKey={selectedTab}
            onChange={(key) => setSelectedTab(key)}
            tabBarStyle={{ marginBottom: 0 }}
            style={{ width: "100%" }}
            items={[
              {
                key: "running",
                label: t("session.Running"),
              },
              {
                key: "interactive",
                label: t("session.Interactive"),
              },
              {
                key: "batch",
                label: t("session.Batch"),
              },
              ...(baiClient.supports("inference-workload")
                ? [
                    {
                      key: "inference",
                      label: t("session.Inference"),
                    },
                  ]
                : []),
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
                <React.Fragment>
                  {/* @ts-ignore */}
                  <backend-ai-session-launcher
                    location="session"
                    id="session-launcher"
                    active
                  />
                </React.Fragment>
              ),
            }}
          />
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
        <Table
          columns={[
            {
              title: "Name",
            },
            {
              title: "ID",
            },
          ]}
        />
      </Flex>
      {/* </Card> */}
    </Flex>
  );
};

export default SessionList;
