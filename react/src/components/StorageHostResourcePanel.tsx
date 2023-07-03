import { useFragment } from "react-relay";
import graphql from "babel-plugin-relay/macro";
import { StorageHostResourcePanelFragment$key } from "./__generated__/StorageHostResourcePanelFragment.graphql";

import { useTranslation } from "react-i18next";

import { theme, Progress, Card, Descriptions, Dropdown } from "antd";
import { EllipsisOutlined, ControlFilled } from "@ant-design/icons";

import { _humanReadableDecimalSize } from "../helper/index";
import Flex from "./Flex";
import { useWebComponentInfo } from "./DefaultProviders";

const { Meta } = Card;

const usageIndicatorColor = (percentage: number) => {
  return percentage < 70
    ? "rgba(58, 178, 97, 1)"
    : percentage < 90
    ? "rgb(223, 179, 23)"
    : "#ef5350";
};

const StorageHostResourcePanel: React.FC<{
  resourceFrgmt: StorageHostResourcePanelFragment$key | null;
}> = ({ resourceFrgmt }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const { moveTo } = useWebComponentInfo();

  const resource = useFragment(
    graphql`
      fragment StorageHostResourcePanelFragment on StorageVolume {
        id
        backend
        capabilities
        path
        usage
      }
    `,
    resourceFrgmt
  );

  const parsedUsage = JSON.parse(resource?.usage || "{}");
  const usedBytes = parsedUsage?.used_bytes;
  const capacityBytes = parsedUsage?.capacity_bytes;
  const usageRatio = capacityBytes > 0 ? usedBytes / capacityBytes : 0;
  const storageUsage = {
    used_bytes: usedBytes,
    capacity_bytes: capacityBytes,
    percent: Number((usageRatio * 100).toFixed(1)),
  };

  return (
    <Flex
      direction="column"
      align="stretch"
      style={{ margin: token.marginSM, gap: token.margin }}
    >
      <Card
        title={t("storageHost.Resource")}
        extra={
          <Dropdown
            placement="bottomRight"
            menu={{
              items: [
                {
                  key: "control",
                  label: t("storageHost.Control"),
                  icon: <ControlFilled />,
                  onClick: () => moveTo("/agent"),
                },
              ],
            }}
          >
            <EllipsisOutlined />
          </Dropdown>
        }
      >
        <Flex>
          <Card bordered={false}>
            <Meta title={t("storageHost.Usage")}></Meta>
            <Flex style={{ margin: token.marginSM, gap: token.margin }}>
              {storageUsage.percent < 100 ? (
                <Progress
                  type="circle"
                  size={120}
                  strokeWidth={15}
                  percent={storageUsage?.percent}
                  strokeColor={usageIndicatorColor(storageUsage?.percent)}
                ></Progress>
              ) : (
                <Progress
                  type="circle"
                  size={120}
                  strokeWidth={15}
                  percent={storageUsage?.percent}
                  status="exception"
                ></Progress>
              )}
              <Descriptions column={1} style={{ marginLeft: 20 }}>
                <Descriptions.Item label={t("storageHost.Total")}>
                  {_humanReadableDecimalSize(storageUsage?.used_bytes)}
                </Descriptions.Item>
                <Descriptions.Item label={t("storageHost.Used")}>
                  {_humanReadableDecimalSize(storageUsage?.capacity_bytes)}
                </Descriptions.Item>
              </Descriptions>
            </Flex>
          </Card>
          <Card bordered={false}>
            <Meta title={t("storageHost.Detail")}></Meta>
            <Descriptions column={1} style={{ marginTop: 20 }}>
              <Descriptions.Item label={t("agent.Endpoint")}>
                {resource?.path}
              </Descriptions.Item>
              <Descriptions.Item label={t("agent.BackendType")}>
                {resource?.backend}
              </Descriptions.Item>
              <Descriptions.Item label={t("agent.Capabilities")}>
                {resource?.capabilities?.join(",")}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Flex>
      </Card>
    </Flex>
  );
};

export default StorageHostResourcePanel;
