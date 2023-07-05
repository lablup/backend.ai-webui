import { useFragment } from "react-relay";
import graphql from "babel-plugin-relay/macro";
import { StorageHostResourcePanelFragment$key } from "./__generated__/StorageHostResourcePanelFragment.graphql";

import { useTranslation } from "react-i18next";

import { Progress, Descriptions, Typography, Tag } from "antd";

import { _humanReadableDecimalSize } from "../helper/index";
import _ from "lodash";

const usageIndicatorColor = (percentage: number) => {
  return percentage < 70
    ? "rgba(58, 178, 97, 1)"
    : percentage < 90
    ? "rgb(223, 179, 23)"
    : "#ef5350";
};

const StorageHostResourcePanel: React.FC<{
  storageVolumeFrgmt: StorageHostResourcePanelFragment$key | null;
}> = ({ storageVolumeFrgmt: resourceFrgmt }) => {
  const { t } = useTranslation();

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
    <Descriptions size="small" bordered column={3}>
      <Descriptions.Item label={t("storageHost.Usage")} span={3}>
        {storageUsage?.percent < 100 ? (
          <Progress
            size={[200, 15]}
            percent={storageUsage?.percent}
            strokeColor={usageIndicatorColor(storageUsage?.percent)}
          ></Progress>
        ) : (
          <Progress
            size={[200, 15]}
            percent={storageUsage?.percent}
            status="exception"
          ></Progress>
        )}
        <Typography.Text type="secondary">
          {t("storageHost.Used")}:{" "}
        </Typography.Text>
        {_humanReadableDecimalSize(storageUsage?.used_bytes)}
        <Typography.Text type="secondary">{" / "}</Typography.Text>
        <Typography.Text type="secondary">
          {t("storageHost.Total")}:{" "}
        </Typography.Text>
        {_humanReadableDecimalSize(storageUsage?.capacity_bytes)}
      </Descriptions.Item>
      <Descriptions.Item label={t("agent.Endpoint")}>
        {resource?.path}
      </Descriptions.Item>
      <Descriptions.Item label={t("agent.BackendType")}>
        {resource?.backend}
      </Descriptions.Item>
      <Descriptions.Item label={t("agent.Capabilities")}>
        {_.map(resource?.capabilities, (cap) => (
          <Tag key={cap}>{cap}</Tag>
        ))}
      </Descriptions.Item>
    </Descriptions>
  );
};

export default StorageHostResourcePanel;
