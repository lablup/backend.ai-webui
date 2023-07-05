import React, { useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { QuotaScopeType, addQuotaScopeTypePrefix } from "../helper/index";

import { Card, Form, Spin } from "antd";

import Flex from "./Flex";
import ProjectSelector from "./ProjectSelector";
import DomainSelector from "./DomainSelector";
import UserSelector from "./UserSelector";
import ResourcePolicyCard from "./ResourcePolicyCard";
import QuotaScopeCard from "./QuotaScopeCard";
import { useFragment, useLazyLoadQuery } from "react-relay";

import graphql from "babel-plugin-relay/macro";
import { StorageHostSettingsPanel_storageVolumeFrgmt$key } from "./__generated__/StorageHostSettingsPanel_storageVolumeFrgmt.graphql";
import { StorageHostSettingsPanelQuery } from "./__generated__/StorageHostSettingsPanelQuery.graphql";
import QuotaSettingModal from "./QuotaSettingModal";
import { useToggle } from "ahooks";
import { useCurrentDomainValue, useUpdatableState } from "../hooks";

interface StorageHostSettingsPanelProps {
  extraFetchKey?: string;
  storageVolumeFrgmt: StorageHostSettingsPanel_storageVolumeFrgmt$key | null;
}
const StorageHostSettingsPanel: React.FC<StorageHostSettingsPanelProps> = ({
  storageVolumeFrgmt,
}) => {
  const { t } = useTranslation();
  const storageVolume = useFragment(
    graphql`
      fragment StorageHostSettingsPanel_storageVolumeFrgmt on StorageVolume {
        id
        capabilities
      }
    `,
    storageVolumeFrgmt
  );

  const [isPending, startTransition] = useTransition();
  const [currentSettingType, setCurrentSettingType] =
    useState<QuotaScopeType>("user");

  const [selectedDomainName, setSelectedDomainName] = useState<string>();
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

  const currentDomain = useCurrentDomainValue();

  const { project_resource_policy, user_resource_policy, quota_scope } =
    useLazyLoadQuery<StorageHostSettingsPanelQuery>(
      graphql`
        query StorageHostSettingsPanelQuery(
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
    <Flex direction="column" align="stretch">
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
        <Flex justify="between">
          {currentSettingType === "project" ? (
            <Flex style={{ marginBottom: 10 }}>
              <Form layout="inline">
                <Form.Item label={t("resourceGroup.Domain")}>
                  <DomainSelector
                    style={{ width: "20vw", marginRight: 10 }}
                    value={selectedDomainName}
                    onSelectDomain={(domain: any) => {
                      startTransition(() => {
                        setSelectedDomainName(domain?.domainName);
                        setSelectedProjectId(undefined);
                        setSelectedProjectResourcePolicy(undefined);
                      });
                    }}
                  />
                </Form.Item>
                <Form.Item label={t("webui.menu.Project")}>
                  <ProjectSelector
                    style={{ width: "20vw" }}
                    value={selectedProjectId}
                    disabled={!selectedDomainName}
                    domain={selectedDomainName || ""}
                    onSelectProject={(project: any) => {
                      startTransition(() => {
                        setSelectedProjectId(project?.projectId);
                        setSelectedProjectResourcePolicy(
                          project?.projectResourcePolicy
                        );
                      });
                    }}
                  />
                </Form.Item>
              </Form>
            </Flex>
          ) : (
            <Form layout="inline">
              <Form.Item label={t("data.User")}>
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
              </Form.Item>
            </Form>
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
              startTransition(() => {
                updateFetchKey();
              });
            }}
          />
          <QuotaScopeCard
            quotaScopeFrgmt={quota_scope || null}
            onClickEdit={() => {
              toggleQuotaSettingModal();
            }}
            showAddButtonWhenEmpty={
              (currentSettingType === "project" && !!selectedProjectId) ||
              (currentSettingType === "user" && !!selectedUserId)
            }
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
      </Card>
    </Flex>
  );
};

export default StorageHostSettingsPanel;
