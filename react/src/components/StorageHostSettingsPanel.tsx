import React, { useState, useDeferredValue } from "react";
import graphql from "babel-plugin-relay/macro";
import { useParams } from "react-router-dom";
import { StorageHostSettingsPanelQuery } from "./__generated__/StorageHostSettingsPanelQuery.graphql";
import { useLazyLoadQuery, useMutation } from "react-relay";
import { StorageHostSettingsPanelDeleteProjectResourcePolicyMutation } from "./__generated__/StorageHostSettingsPanelDeleteProjectResourcePolicyMutation.graphql";
import { StorageHostSettingsPanelDeleteUserResourcePolicyMutation } from "./__generated__/StorageHostSettingsPanelDeleteUserResourcePolicyMutation.graphql";
import { StorageHostSettingsPanelUnsetFolderQuotaMutation } from "./__generated__/StorageHostSettingsPanelUnsetFolderQuotaMutation.graphql";

import {
  Card,
  theme,
  Descriptions,
  Table,
  Dropdown,
  Button,
  ButtonProps,
  Empty,
  Popconfirm,
  Modal,
  message,
} from "antd";
import { EditFilled, DeleteFilled, ExclamationCircleOutlined } from "@ant-design/icons";
import { EllipsisOutlined, PlusOutlined, UndoOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useToggle } from "ahooks";
import { _humanReadableDecimalSize, QuotaScopeType, addQuotaScopeTypePrefix } from "../helper/index";
import { useDateISOState } from "../hooks";
import Flex from "./Flex";
import ProjectResourcePolicySettingModal from "./ProjectResourcePolicySettingModal";
import UserResourcePolicySettingModal from "./UserResourcePolicySettingModal";
import QuotaSettingModal from "./QuotaSettingModal";
import ProjectSelector from "./ProjectSelector";
import UserSelector from "./UserSelector";

interface StorageHostSettingsPanelProps {
  extraFetchKey?: string;
}
const StorageHostSettingsPanel: React.FC<
  StorageHostSettingsPanelProps
> = ({
  extraFetchKey = "",
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { storageHostId } = useParams<{
    storageHostId: string; // for `:storageHostId` on <Router path="/storage-settings:storageHostId" element={<StorageHostSettings />} />
  }>();

  const [currentSettingType, setCurrentSettingType] = useState<QuotaScopeType>("project");


  const [visibleProjectResourcePolicySettingModal, { toggle: toggleProjectResourcePolicySettingModal }] = useToggle(false);
  const [visibleUserResourcePolicySettingModal, { toggle: toggleUserResourcePolicySettingModal }] = useToggle(false);
  const [visibleQuotaSettingModal, { toggle: toggleQuotaSettingModal }] = useToggle(false);

  const [selectedProjectId, setSelectedProjectId] = useState<string>();
  const [selectedProjectResourcePolicy, setSelectedProjectResourcePolicy] = useState<string>();
  const [selectedUserId, setSelectedUserId] = useState<string>();
  const [selectedUserResourcePolicy, setSelectedUserResourcePolicy] = useState<string>();

  const [internalFetchKey, updateInternalFetchKey] = useDateISOState();
  const deferredMergedFetchKey = useDeferredValue(internalFetchKey + extraFetchKey);

  const quotaScopeId = (currentSettingType === "project" ? selectedProjectId : selectedUserId);
  const quotaScopeIdWithPrefix = (quotaScopeId === undefined || quotaScopeId === null) ? "" : addQuotaScopeTypePrefix(currentSettingType, quotaScopeId);

  const { project_resource_policy, user_resource_policy, folder_quota } = useLazyLoadQuery<StorageHostSettingsPanelQuery>(
    graphql`
      query StorageHostSettingsPanelQuery(
        $quota_scope_id: String!,
        $storage_host_name: String!,
        $project_resource_policy: String!,
        $user_resource_policy: String,
        $skipProjectResourcePolicy: Boolean!,
        $skipUserResourcePolicy: Boolean!,
        $skipFolderQuota: Boolean!,
      ) {
        project_resource_policy (
          name: $project_resource_policy,
        ) @skip(if: $skipProjectResourcePolicy) {
          max_vfolder_size
          ...ProjectResourcePolicySettingModalFragment
        }

        user_resource_policy (
          name: $user_resource_policy,
        ) @skip(if: $skipUserResourcePolicy) {
          max_vfolder_size
          ...UserResourcePolicySettingModalFragment
        }

        folder_quota (
          storage_host_name: $storage_host_name,
          quota_scope_id: $quota_scope_id,
        ) @skip(if: $skipFolderQuota) {
          id
          quota_scope_id
          storage_host_name
          details {
            hard_limit_bytes
          }
          ...QuotaSettingModalFragment
        }
    }
  `,
    {
      storage_host_name: storageHostId || "",
      quota_scope_id: quotaScopeIdWithPrefix,
      project_resource_policy: selectedProjectResourcePolicy || "",
      user_resource_policy: selectedUserResourcePolicy || "",
      skipProjectResourcePolicy: selectedProjectResourcePolicy === "",
      skipUserResourcePolicy: selectedUserResourcePolicy === "",
      skipFolderQuota: storageHostId === "" || quotaScopeId === "",
    },
    {
      fetchKey: deferredMergedFetchKey,
      fetchPolicy: "store-and-network",
    }
  );

  const [commitDeleteProjectResourcePolicy, isInFlightCommitDeleteProjectResourcePolicy] =
      useMutation<StorageHostSettingsPanelDeleteProjectResourcePolicyMutation>(graphql`
        mutation StorageHostSettingsPanelDeleteProjectResourcePolicyMutation(
          $name: String!,
        ) {
          delete_project_resource_policy(name: $name) {
            ok
            msg
          }
        }
      `);

  const [commitDeleteUserResourcePolicy, isInFlightCommitDeleteUserResourcePolicy] =
      useMutation<StorageHostSettingsPanelDeleteUserResourcePolicyMutation>(graphql`
        mutation StorageHostSettingsPanelDeleteUserResourcePolicyMutation(
          $name: String!,
        ) {
          delete_user_resource_policy(name: $name) {
            ok
            msg
          }
        }
      `);

  const [commitUnsetFolderQuota, isInFlightCommitUnsetFolderQuota] = useMutation<StorageHostSettingsPanelUnsetFolderQuotaMutation>(
    graphql`
      mutation StorageHostSettingsPanelUnsetFolderQuotaMutation(
        $quota_scope_id: String!,
        $storage_host_name: String!
      ) {
        unset_folder_quota (
          quota_scope_id: $quota_scope_id,
          storage_host_name: $storage_host_name,
        ) {
          folder_quota {
            id
            quota_scope_id
            storage_host_name
            details {
              hard_limit_bytes
            }
          }
        }
      }
    `,
  );

  const selectProjectOrUserFirst = (
    <Empty
      style={{ width: '100%' }}
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={
        <div>
          {t("storageHost.quotaSettings.SelectFirst")}
        </div>
      }
    />
  );

  const addQuotaConfigsWhenEmpty = (
    <Empty
      style={{ width: '100%' }}
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={
        <>
          <div style={{ margin: 10 }}>
            {t("storageHost.quotaSettings.ClickSettingButton")}
          </div>
          <Button
            icon={<PlusOutlined />}
            onClick={() => toggleQuotaSettingModal()}
          >
            {t("storageHost.quotaSettings.AddQuotaConfigs")}
          </Button>
        </>
      }
    />
  );

  const confirmDeleteResourcePolicy = () => {
    Modal.confirm({
      title: t('storageHost.DeleteResourcePolicy'),
      content: t('storageHost.AreYouSureYouWantToDelete'),
      icon: <ExclamationCircleOutlined />,
      okText: t('button.Confirm'),
      okType: 'danger',
      onOk() {
        if (currentSettingType === "project" && selectedProjectResourcePolicy) {
          commitDeleteProjectResourcePolicy({
            variables: {
              name: selectedProjectResourcePolicy,
            },
            onCompleted(response) {
              if (!response.delete_project_resource_policy?.ok) {
                message.error(response.delete_project_resource_policy?.msg);
              } else {
                message.success(t("storageHost.ResourcePolicySuccessfullyDeleted"));
              }
            },
            onError(error) {
              console.log(error);
              message.error(error.message);
            },
          });
        } else if (currentSettingType === "user" && selectedUserResourcePolicy) {
          commitDeleteUserResourcePolicy({
            variables: {
              name: selectedUserResourcePolicy,
            },
            onCompleted(response) {
              if (!response.delete_user_resource_policy?.ok) {
                message.error(response.delete_user_resource_policy?.msg);
              } else {
                message.success(t("storageHost.ResourcePolicySuccessfullyDeleted"));
              }
            },
            onError(error) {
              console.log(error);
              message.error(error.message);
            },
          });
        } else {
          message.error(t("storageHost.SelectProjectOrUserFirst"));
        }
      }
    });
  }

  interface UnsetButtonProps extends ButtonProps {}
  const UnsetButton: React.FC<UnsetButtonProps> = ({
    ...props
  }) => {
    const { t } = useTranslation();
    return (
      <Popconfirm
        title={t("storageHost.quotaSettings.UnsetCustomSettings")}
        description={t("storageHost.quotaSettings.ConfirmUnsetCustomQuota")}
        placement="bottom"
        onConfirm={() => {
          if (quotaScopeId && storageHostId) {
            commitUnsetFolderQuota({
              variables: {
                quota_scope_id: quotaScopeId,
                storage_host_name: storageHostId,
              },
              onCompleted() {
                message.success(t("storageHost.quotaSettings.FolderQuotaSuccessfullyUpdated"));
              },
              onError(error) {
                message.error(error?.message);
              },
            });
          }
        }}
      >
        <Button 
        {...props}
        danger
        icon={<DeleteFilled />}
        >
        {t("button.Unset")}
      </Button>
    </Popconfirm>
  );
};

  return (
    <Flex
      direction="column"
      align="stretch"
      style={{ margin: token.marginSM, gap: token.margin }}
    >
      <Card
        title={t("storageHost.Settings")}
        tabList={[
          {
            key: "project",
            tab: t("storageHost.ForProject"),
          },
          {
            key: "user",
            tab: t("storageHost.ForUser"),
          },
        ]}
        activeTabKey={currentSettingType}
        // eslint-disable-next-line
        //@ts-ignore
        onTabChange={setCurrentSettingType}
      >
        <Flex justify="between">
          {currentSettingType === "project" ? (
            <ProjectSelector
              style={{ width: '30vw', marginBottom: 10 }}
              onSelectProject={(project: any) => {
                setSelectedProjectId(project?.projectId);
                setSelectedProjectResourcePolicy(project?.projectResourcePolicy);
              }}
            />
          ) : (
            <UserSelector
              style={{ width: '30vw', marginBottom: 10 }}
              onSelectUser={(user: any) => {
                setSelectedUserId(user?.userId);
                setSelectedUserResourcePolicy(user?.userResourcePolicy);
              }}
              />
          )}
        </Flex>
        <Card
          extra={ quotaScopeId &&
            <Dropdown
              placement="bottomRight"
              menu={{
                items: [
                  {
                    key: "edit",
                    label: t("button.Edit"),
                    icon: <EditFilled />,
                    onClick: () => {
                      currentSettingType === "project" ?
                        toggleProjectResourcePolicySettingModal()
                        :
                        toggleUserResourcePolicySettingModal();
                    },
                  },
                  // {
                  //   key: "delete",
                  //   label: t("button.Delete"),
                  //   icon: <DeleteFilled />,
                  //   danger: true,
                  //   onClick: () => confirmDeleteResourcePolicy(),
                  // },
                  // {
                  //   key: "unset",
                  //   label: t("button.Unset"),
                  //   icon: <UndoOutlined />,
                  //   danger: true,
                  // }
                ],
              }}
            >
              <EllipsisOutlined />
            </Dropdown>
          }
          title={t("storageHost.ResourcePolicy")}
          bordered={false}
          headStyle={{ borderBottom: "none" }}
          style={{ marginBottom: 10 }}
        >
          <Descriptions>
            {(currentSettingType === "project" && selectedProjectId) || (currentSettingType === "user" && selectedUserId) ? (
              <Descriptions.Item label={t("storageHost.MaxFolderSize")}>
                {currentSettingType === "project" ? (
                    project_resource_policy && project_resource_policy?.max_vfolder_size !== -1 ? _humanReadableDecimalSize(project_resource_policy?.max_vfolder_size) : t('storageHost.NoConfigs')
                  ) : (
                    user_resource_policy && user_resource_policy?.max_vfolder_size !== -1 ? _humanReadableDecimalSize(user_resource_policy?.max_vfolder_size) : t('storageHost.NoConfigs')
                )}
              </Descriptions.Item>
            ) : (
              <Descriptions.Item>
                {selectProjectOrUserFirst}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>
        <Card bordered={false}>
          <Table
            columns={[
              {
                title: "ID",
                dataIndex: "quota_scope_id",
                key: "quota_scope_id",
              },
              // {
              //   title: t("storageHost.HardLimit") + " (bytes)",
              //   // dataIndex: "[\"details\", \"hard_limit_bytes\"]",
              //   dataIndex: "details[\"hard_limit_bytes\"]",
              //   key: "hard_limit_bytes",
              // },
              {
                title: t("general.Control"),
                key: "control",
                render: () => (
                  <>
                    <Button
                      type="text"
                      icon={<EditFilled />}
                      onClick={() => toggleQuotaSettingModal()}
                    >
                      {t("button.Edit")}
                    </Button>
                    <UnsetButton type="text" />
                  </>
                ),
              },
            ]}
            dataSource={storageHostId && (selectedProjectId || selectedUserId) && folder_quota ? [folder_quota] : []}
            locale={{ emptyText: (selectedProjectId || selectedUserId) ? addQuotaConfigsWhenEmpty : selectProjectOrUserFirst }}
            pagination={false}
          />
        </Card>
      </Card>
      <ProjectResourcePolicySettingModal
        open={visibleProjectResourcePolicySettingModal}
        destroyOnClose={true}
        onCancel={toggleProjectResourcePolicySettingModal}
        onOk={toggleProjectResourcePolicySettingModal}
        projectResourcePolicy={selectedProjectResourcePolicy || ""}
        resourcePolicyFrgmt={project_resource_policy || null}
        onRequestClose={() => {
          updateInternalFetchKey();
          toggleProjectResourcePolicySettingModal();
        }}
      />
      <UserResourcePolicySettingModal
        open={visibleUserResourcePolicySettingModal}
        destroyOnClose={true}
        onCancel={toggleUserResourcePolicySettingModal}
        onOk={toggleUserResourcePolicySettingModal}
        userResourcePolicy={selectedUserResourcePolicy || ""}
        resourcePolicyFrgmt={user_resource_policy || null}
        onRequestClose={() => {
          updateInternalFetchKey();
          toggleUserResourcePolicySettingModal();
        }}
      />
      <QuotaSettingModal
        open={visibleQuotaSettingModal}
        destroyOnClose={true}
        onCancel={toggleQuotaSettingModal}
        onOk={toggleQuotaSettingModal}
        quotaScopeId={quotaScopeId}
        storageHostName={storageHostId}
        currentSettingType={currentSettingType}
        folderQuotaFrgmt={folder_quota || null}
        onRequestClose={() => {
          updateInternalFetchKey();
          toggleQuotaSettingModal();
        }}
      />
    </Flex>
  );
};

export default StorageHostSettingsPanel;
