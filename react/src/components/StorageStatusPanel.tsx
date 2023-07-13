import React, { useState, useTransition } from "react";
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
  Spin,
  Select,
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
import _ from "lodash";

const StorageStatusPanel: React.FC<{}> = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();
  const currentProject = useCurrentProjectValue();

  const [selectedStorageHost, setSelectedStorageHost] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const columnSetting: DescriptionsProps["column"] = {
    xxl: 4,
    xl: 4,
    lg: 2,
    md: 1,
    sm: 1,
    xs: 1,
  };

  const { data: vhostInfo, isLoading: isLoadingVhostInfo } = useQuery<{
    default: string;
    allowed: Array<string>;
    volume_info: any;
  }>(
    "vhostInfo",
    () => {
      return baiClient.vfolder.list_hosts();
    },
    {
      // for to render even this fail query failed
      suspense: false,
    }
  );
  const hosts = vhostInfo?.allowed;
  const isCurrentHostSupportQuota =
    (vhostInfo?.volume_info &&
      vhostInfo.volume_info[selectedStorageHost]?.capabilities?.includes(
        "quota"
      )) ??
    false;

  const { data: vfolders } = useQuery(
    "vfolders",
    () => {
      return baiClient.vfolder.list(currentProject?.id);
    },
    {
      // for to render even this fail query failed
      suspense: false,
    }
  );
  const createdCount = vfolders?.filter(
    (item: any) => item.is_owner && item.ownership_type === "user"
  ).length;
  const sharedCount = vfolders?.length - createdCount;
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
        storage_host_name: selectedStorageHost,
        skipQuotaScope:
          currentProject?.id === undefined ||
          user?.id === undefined ||
          selectedStorageHost === "",
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
      {isLoadingVhostInfo ? (
        <Skeleton active />
      ) : (
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
                  {t("data.Shared")}:
                </Typography.Text>
                {sharedCount}
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
            <Flex wrap="wrap" justify="between" direction="row">
              <Typography.Text type="secondary">
                {t("data.Host")}
              </Typography.Text>
              <Spin spinning={isLoadingVhostInfo}>
                <Select
                  filterOption={false}
                  placeholder={t("data.SelectStorageHost")}
                  onChange={(value) => {
                    startTransition(() => {
                      setSelectedStorageHost(value);
                    });
                  }}
                  style={{ minWidth: 165 }}
                  options={_.map(hosts, (host) => {
                    return {
                      value: host,
                      label: host,
                    };
                  })}
                />
              </Spin>
            </Flex>
            {isCurrentHostSupportQuota ? (
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
                  <UsageProgress
                    usageProgressFrgmt={user_quota_scope || null}
                  />
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
      )}
    </Card>
  );
};

export default StorageStatusPanel;
