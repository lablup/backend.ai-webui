import React, { useState, useTransition } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { QuotaScopeType, addQuotaScopeTypePrefix } from "../helper/index";

import { Card, Empty, Spin, theme } from "antd";

import Flex from "./Flex";
import ProjectSelector from "./ProjectSelector";
import UserSelector from "./UserSelector";
import ResourcePolicyCard from "./ResourcePolicyCard";
import QuotaScopeCard from "./QuotaScopeCard";
import { useFragment, useLazyLoadQuery } from "react-relay";

import graphql from "babel-plugin-relay/macro";
import { StorageHostSettingsPanel_storageVolumeFrgmt$key } from "./__generated__/StorageHostSettingsPanel_storageVolumeFrgmt.graphql";
import { StorageHostSettingsPanelQuery } from "./__generated__/StorageHostSettingsPanelQuery.graphql";
import QuotaSettingModal from "./QuotaSettingModal";
import { useToggle } from "ahooks";
import { useUpdatableState } from "../hooks";

interface StorageHostSettingsPanelProps {
  extraFetchKey?: string;
  storageVolumeFrgmt: StorageHostSettingsPanel_storageVolumeFrgmt$key | null;
}
const StorageHostSettingsPanel: React.FC<StorageHostSettingsPanelProps> = ({
  // isQuotaSupported = false,
  extraFetchKey = "",
  storageVolumeFrgmt,
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const storageVolume = useFragment(
    graphql`
      fragment StorageHostSettingsPanel_storageVolumeFrgmt on StorageVolume {
        id
        capabilities
      }
    `,
    storageVolumeFrgmt
  );

  const isQuotaSupported =
    storageVolume?.capabilities?.includes("quota") ?? false;

  const [isPending, startTransition] = useTransition();
  const [currentSettingType, setCurrentSettingType] =
    useState<QuotaScopeType>("user");

  const [selectedProjectId, setSelectedProjectId] = useState<string>();
  const [selectedProjectResourcePolicy, setSelectedProjectResourcePolicy] =
    useState<string>();
  const [selectedUserId, setSelectedUserId] = useState<string>();
  const [selectedUserResourcePolicy, setSelectedUserResourcePolicy] =
    useState<string>();

  const quotaScopeId = addQuotaScopeTypePrefix(
    currentSettingType,
    (currentSettingType === "project" ? selectedProjectId : selectedUserId) ||
      ""
  );

  const [isOpenQuotaSettingModal, { toggle: toggleQuotaSettingModal }] =
    useToggle(false);
  const [fetchKey, updateFetchKey] = useUpdatableState("default");

  console.log(fetchKey);
  const { project_resource_policy, user_resource_policy, quota_scope } =
    useLazyLoadQuery<StorageHostSettingsPanelQuery>(
      graphql`
        query StorageHostSettingsPanelQuery(
          # $storageVolumeId: ID!
          $project_resource_policy_name: String!
          $skipProjectResourcePolicy: Boolean!
          $user_resource_policy_name: String
          $skipUserResourcePolicy: Boolean!
          $quota_scope_id: String!
          $storage_host_name: String!
          $skipQuotaScope: Boolean!
        ) {
          project_resource_policy(name: $project_resource_policy_name)
            @skip(if: $skipProjectResourcePolicy) {
            max_vfolder_size
            ...ResourcePolicyCard_project_resource_policy
          }

          user_resource_policy(name: $user_resource_policy_name)
            @skip(if: $skipUserResourcePolicy) {
            max_vfolder_size
            ...ResourcePolicyCard_user_resource_policy
          }

          quota_scope(
            storage_host_name: $storage_host_name
            quota_scope_id: $quota_scope_id
          ) @skip(if: $skipQuotaScope) {
            ...QuotaSettingModalFragment
            ...QuotaScopeCardFragment
          }
        }
      `,
      {
        // project policy
        project_resource_policy_name: selectedProjectResourcePolicy || "",
        skipProjectResourcePolicy:
          selectedProjectResourcePolicy === "" ||
          selectedProjectResourcePolicy === undefined,

        // user policy
        user_resource_policy_name: selectedUserResourcePolicy || "",
        skipUserResourcePolicy:
          selectedUserResourcePolicy === "" ||
          selectedUserResourcePolicy === undefined,

        // quota scope
        quota_scope_id: quotaScopeId,
        skipQuotaScope: quotaScopeId === undefined || quotaScopeId === "",
        storage_host_name: storageVolume?.id || "",
      },
      {
        fetchPolicy: "network-only",
        fetchKey: fetchKey,
      }
    );

  return (
    <Flex
      direction="column"
      align="stretch"
      style={{ margin: token.marginSM, gap: token.margin }}
    >
      <Card
        title={t("storageHost.QuotaSettings")}
        tabList={[
          {
            key: "user",
            tab: t("storageHost.ForUser"),
          },
          {
            key: "project",
            tab: t("storageHost.ForProject"),
          },
        ]}
        activeTabKey={currentSettingType}
        // eslint-disable-next-line
        //@ts-ignore
        onTabChange={(v) => {
          startTransition(() => {
            setCurrentSettingType(v as QuotaScopeType);
          });
        }}
      >
        {isQuotaSupported ? (
          <>
            <Flex justify="between">
              {currentSettingType === "project" ? (
                <ProjectSelector
                  style={{ width: "30vw", marginBottom: 10 }}
                  value={selectedProjectId}
                  onSelectProject={(project: any) => {
                    startTransition(() => {
                      setSelectedProjectId(project?.projectId);
                      setSelectedProjectResourcePolicy(
                        project?.projectResourcePolicy
                      );
                    });
                  }}
                />
              ) : (
                <UserSelector
                  style={{ width: "30vw", marginBottom: 10 }}
                  value={selectedUserId}
                  onSelectUser={(user: any) => {
                    startTransition(() => {
                      setSelectedUserId(user?.userId);
                      setSelectedUserResourcePolicy(user?.userResourcePolicy);
                    });
                  }}
                />
              )}
            </Flex>
            <Spin spinning={isPending}>
              <ResourcePolicyCard
                projectResourcePolicyFrgmt={
                  currentSettingType === "project"
                    ? project_resource_policy || null
                    : null
                }
                userResourcePolicyFrgmt={
                  currentSettingType === "user"
                    ? user_resource_policy || null
                    : null
                }
                onChangePolicy={() => {
                  startTransition(() => {});
                  updateFetchKey();
                }}
              />
              <QuotaScopeCard
                quotaScopeFrgmt={quota_scope || null}
                onClickEdit={() => {
                  toggleQuotaSettingModal();
                }}
                showAddButtonWhenEmpty={!!(selectedProjectId || selectedUserId)}
              />
            </Spin>
            <QuotaSettingModal
              open={isOpenQuotaSettingModal}
              quotaScopeFrgmt={quota_scope || null}
              resourcePolicyMaxVFolderSize={
                currentSettingType === "project"
                  ? project_resource_policy?.max_vfolder_size
                  : user_resource_policy?.max_vfolder_size
              }
              onRequestClose={() => {
                toggleQuotaSettingModal();
              }}
            />
          </>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t("storageHost.QuotaDoesNotSupported")}
          />
        )}
      </Card>
    </Flex>
  );
};

export default StorageHostSettingsPanel;
