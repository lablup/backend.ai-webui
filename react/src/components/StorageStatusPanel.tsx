import React, { useDeferredValue, useState } from "react";
import { useQuery } from "react-query";
import graphql from "babel-plugin-relay/macro";
import { useLazyLoadQuery } from "react-relay";
import { StorageStatusPanelQuery } from "./__generated__/StorageStatusPanelQuery.graphql";
import { StorageStatusPanelKeypairQuery } from "./__generated__/StorageStatusPanelKeypairQuery.graphql";

import { useTranslation } from "react-i18next";
import {
  Progress,
  Card,
  Descriptions,
  DescriptionsProps,
  Typography,
  Empty,
  Divider,
  Skeleton,
  theme,
  Tooltip,
  Button,
} from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import Flex from "./Flex";
import {
  useCurrentDomainValue,
  useCurrentProjectValue,
  useSuspendedBackendaiClient,
} from "../hooks";
import { addQuotaScopeTypePrefix, usageIndicatorColor } from "../helper";
import UsageProgress from "./UsageProgress";
import StorageSelector, { VolumeInfo } from "./StorageSelector";
import FlexActivityIndicator from "./FlexActivityIndicator";

const StorageStatusPanel: React.FC<{
  fetchKey: string;
}> = ({ fetchKey }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();
  const currentProject = useCurrentProjectValue();

  const [selectedVolumeInfo, setSelectedVolumeInfo] = useState<VolumeInfo>();
  const deferredSelectedVolumeInfo = useDeferredValue(selectedVolumeInfo);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const columnSetting: DescriptionsProps["column"] = {
    xxl: 4,
    xl: 4,
    lg: 2,
    md: 1,
    sm: 1,
    xs: 1,
  };

  const { data: vfolders } = useQuery(
    ["vfolders", { deferredFetchKey }],
    () => {
      return baiClient.vfolder.list(currentProject?.id);
    }
  );
  const createdCount = vfolders?.filter(
    (item: any) => item.is_owner && item.ownership_type === "user"
  ).length;
  const projectFolderCount = vfolders?.filter(
    (item: any) => item.ownership_type === "group"
  ).length;
  const invitedCount = vfolders?.filter(
    (item: any) => !item.is_owner && item.ownership_type === "user"
  ).length;

  // TODO: Add resolver to enable subquery and modify to call useLazyLoadQuery only once.
  const { keypair, user } = useLazyLoadQuery<StorageStatusPanelKeypairQuery>(
    graphql`
      query StorageStatusPanelKeypairQuery(
        $domain_name: String
        $access_key: String
        $email: String
      ) {
        keypair(domain_name: $domain_name, access_key: $access_key) {
          resource_policy
        }
        user(domain_name: $domain_name, email: $email) {
          id
        }
      }
    `,
    {
      domain_name: useCurrentDomainValue(),
      access_key: baiClient?._config.accessKey,
      email: baiClient?.email,
    }
  );

  const { keypair_resource_policy, project_quota_scope, user_quota_scope } =
    useLazyLoadQuery<StorageStatusPanelQuery>(
      graphql`
        query StorageStatusPanelQuery(
          $keypair_resource_policy_name: String
          $project_quota_scope_id: String!
          $user_quota_scope_id: String!
          $storage_host_name: String!
          $skipQuotaScope: Boolean!
        ) {
          keypair_resource_policy(name: $keypair_resource_policy_name) {
            max_vfolder_count
          }
          project_quota_scope: quota_scope(
            quota_scope_id: $project_quota_scope_id
            storage_host_name: $storage_host_name
          ) @skip(if: $skipQuotaScope) {
            ...UsageProgressFragment_usageFrgmt
          }
          user_quota_scope: quota_scope(
            quota_scope_id: $user_quota_scope_id
            storage_host_name: $storage_host_name
          ) @skip(if: $skipQuotaScope) {
            ...UsageProgressFragment_usageFrgmt
          }
        }
      `,
      {
        keypair_resource_policy_name: keypair?.resource_policy,
        project_quota_scope_id: addQuotaScopeTypePrefix(
          "project",
          currentProject?.id
        ),
        user_quota_scope_id: addQuotaScopeTypePrefix("user", user?.id || ""),
        storage_host_name: deferredSelectedVolumeInfo?.id || "",
        skipQuotaScope:
          currentProject?.id === undefined ||
          user?.id === undefined ||
          !deferredSelectedVolumeInfo?.id,
      }
    );

  const maxVfolderCount = keypair_resource_policy?.max_vfolder_count || 0;
  const numberOfFolderPercent = (
    maxVfolderCount > 0
      ? ((createdCount / maxVfolderCount) * 100)?.toFixed(2)
      : 0
  ) as number;

  return (
    <Card
      size="small"
      title={t("data.StorageStatus")}
      style={{ margin: "3px 14px" }}
    >
      <Descriptions bordered column={columnSetting} size="small">
        <Descriptions.Item label={t("data.NumberOfFolders")}>
          <Progress
            size={[200, 15]}
            percent={numberOfFolderPercent}
            strokeColor={usageIndicatorColor(numberOfFolderPercent)}
            style={{ width: "95%" }}
            status={numberOfFolderPercent >= 100 ? "exception" : "normal"}
          ></Progress>
          <Flex direction="row" gap={token.marginXXS} wrap="wrap">
            <Typography.Text type="secondary">
              {t("data.Created")}:
            </Typography.Text>
            {createdCount}
            <Typography.Text type="secondary">{" / "}</Typography.Text>
            <Typography.Text type="secondary">
              {t("data.Limit")}:
            </Typography.Text>
            {maxVfolderCount}
          </Flex>
          <Divider style={{ margin: "12px auto" }} />
          <Flex direction="row" wrap="wrap" justify="between">
            <Flex gap={token.marginXXS}>
              <Typography.Text type="secondary">
                {t("data.ProjectFolder")}:
              </Typography.Text>
              {projectFolderCount}
            </Flex>
            <Flex gap={token.marginXXS} style={{ marginRight: 30 }}>
              <Typography.Text type="secondary">
                {t("data.Invited")}:
              </Typography.Text>
              {invitedCount}
            </Flex>
          </Flex>
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <div>
              {t("data.QuotaPerStorageVolume")}
              <Tooltip title={t("data.HostDetails")}>
                <Button type="link" icon={<InfoCircleOutlined />} />
              </Tooltip>
            </div>
          }
        >
          <Flex
            wrap="wrap"
            justify="between"
            direction="row"
            style={{ minWidth: "25vw" }}
          >
            <Typography.Text type="secondary">{t("data.Host")}</Typography.Text>
            <StorageSelector
              onChange={(value, info) => {
                setSelectedVolumeInfo(info);
              }}
              value={selectedVolumeInfo}
              autoSelectDefault
            />
          </Flex>
          {selectedVolumeInfo !== deferredSelectedVolumeInfo ? (
            <FlexActivityIndicator style={{ minHeight: 120 }} />
          ) : selectedVolumeInfo?.capabilities?.includes("quota") ? (
            <>
              <Flex
                style={{ margin: "15px auto" }}
                justify="between"
                wrap="wrap"
              >
                <Typography.Text
                  type="secondary"
                  style={{
                    wordBreak: "keep-all",
                    wordWrap: "break-word",
                  }}
                >
                  {t("data.Project")}
                  <br />({currentProject?.name})
                </Typography.Text>
                <UsageProgress
                  usageProgressFrgmt={project_quota_scope || null}
                />
              </Flex>
              <Flex justify="between" wrap="wrap">
                <Typography.Text
                  type="secondary"
                  style={{
                    wordBreak: "keep-all",
                    wordWrap: "break-word",
                  }}
                >
                  {t("data.User")}
                  <br />({baiClient?.email})
                </Typography.Text>
                <UsageProgress usageProgressFrgmt={user_quota_scope || null} />
              </Flex>
            </>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={t("storageHost.QuotaDoesNotSupported")}
              style={{ margin: "25px auto" }}
            />
          )}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export const StorageStatusPanelFallback = () => {
  const { t } = useTranslation();
  return (
    <Card
      size="small"
      title={t("data.StorageStatus")}
      style={{ margin: "3px 14px" }}
    >
      <Skeleton active />
    </Card>
  );
};

export default StorageStatusPanel;
