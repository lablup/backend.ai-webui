import React, { useState, Suspense } from "react";
import graphql from "babel-plugin-relay/macro";
import { useParams } from "react-router-dom";
import { StorageHostSettingsPanelQuery } from "./__generated__/StorageHostSettingsPanelQuery.graphql";
import { useLazyLoadQuery, useMutation } from "react-relay";
import { StorageHostSettingsPanelDeleteProjectResourcePolicyMutation } from "./__generated__/StorageHostSettingsPanelDeleteProjectResourcePolicyMutation.graphql";
import { StorageHostSettingsPanelDeleteUserResourcePolicyMutation } from "./__generated__/StorageHostSettingsPanelDeleteUserResourcePolicyMutation.graphql";
// import { StorageHostSettingsPanelUnsetFolderQuotaMutation } from "./__generated__/StorageHostSettingsPanelUnsetFolderQuotaMutation.graphql";

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
import { EllipsisOutlined, PlusOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useToggle } from "ahooks";
import { _humanReadableDecimalSize } from "../helper/index";
import Flex from "./Flex";
import ProjectResourcePolicySettingModal from "./ProjectResourcePolicySettingModal";
import UserResourcePolicySettingModal from "./UserResourcePolicySettingModal";
import QuotaSettingModal from "./QuotaSettingModal";
import ProjectSelector from "./ProjectSelector";
import UserSelector from "./UserSelector";

interface StorageHostSettingsPanelProps {}
const StorageHostSettingsPanel: React.FC<
  StorageHostSettingsPanelProps
> = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { storageHostId } = useParams<{
    storageHostId: string; // for `:storageHostId` on <Router path="/storage-settings:storageHostId" element={<StorageHostSettings />} />
  }>();

  const [currentSettingType, setCurrentSettingType] = useState<
    "project" | "user"
  >("project");


  const [visibleProjectResourcePolicySettingModal, { toggle: toggleProjectResourcePolicySettingModal }] = useToggle(false);
  const [visibleUserResourcePolicySettingModal, { toggle: toggleUserResourcePolicySettingModal }] = useToggle(false);
  const [visibleQuotaSettingModal, { toggle: toggleQuotaSettingModal }] = useToggle(false);

  const [selectedProjectId, setSelectedProjectId] = useState<string>();
  const [selectedProjectResourcePolicy, setSelectedProjectResourcePolicy] = useState<string>();
  const [selectedUserId, setSelectedUserId] = useState<string>();
  const [selectedUserResourcePolicy, setSelectedUserResourcePolicy] = useState<string>();

  const quotaScopeId = (currentSettingType === "project" ? selectedProjectId : selectedUserId);

  const { project_resource_policy, user_resource_policy, folder_quota } = useLazyLoadQuery<StorageHostSettingsPanelQuery>(
    graphql`
      query StorageHostSettingsPanelQuery(
        $quota_scope_id: String!,
        $storage_host_name: String!,
        $project_resource_policy: String!,
        $user_resource_policy: String,
      ) {
        project_resource_policy (
          name: $project_resource_policy,
        ) {
          max_vfolder_size
          ...ProjectResourcePolicySettingModalFragment
        }

        user_resource_policy (
          name: $user_resource_policy,
        ) {
          max_vfolder_size
          ...UserResourcePolicySettingModalFragment
        }

        folder_quota (
          quota_scope_id: $quota_scope_id,
          storage_host_name: $storage_host_name,
        ) {
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
      quota_scope_id: quotaScopeId || "",
      project_resource_policy: selectedProjectResourcePolicy || "",
      user_resource_policy: selectedUserResourcePolicy || "",
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

  // const [commitUnsetFolderQuota, isInFlightCommitUnsetFolderQuota] = useMutation<StorageHostSettingsPanelUnsetFolderQuotaMutation>(
  //   graphql`
  //     mutation StorageHostSettingsPanelUnsetFolderQuotaMutation(
  //       $quota_scope_id: UUID!,
  //       $storage_host_name: String!
  //     ) {
  //       unset_folder_quota (
  //         quota_scope_id: $quota_scope_id,
  //         storage_host_name: $storage_host_name,
  //       ) {
  //         folder_quota {
  //           id
  //           quota_scope_id
  //           storage_host_name
  //           details {
  //             hard_limit_bytes
  //             usage_bytes
  //             usage_count
  //           }
  //         }
  //       }
  //     }
  //   `,
  // );

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
                  {
                    key: "delete",
                    label: t("button.Delete"),
                    icon: <DeleteFilled />,
                    danger: true,
                    onClick: () => confirmDeleteResourcePolicy(),
                  }
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
            {(selectedProjectId || selectedUserId) ? (
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
              {
                title: t("storageHost.HardLimit") + " (bytes)",
                dataIndex: "[\"details\", \"hard_limit_bytes\"]",
                key: "hard_limit_bytes",
              },
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
        resourcePolicyFrgmt={project_resource_policy}
        onRequestClose={(type, max_vfolder_size) => {
          if (type === "create" && max_vfolder_size) {
            // TODO: refetch
          }
          toggleProjectResourcePolicySettingModal();
        }}
      />
      <UserResourcePolicySettingModal
        open={visibleUserResourcePolicySettingModal}
        destroyOnClose={true}
        onCancel={toggleUserResourcePolicySettingModal}
        onOk={toggleUserResourcePolicySettingModal}
        userResourcePolicy={selectedUserResourcePolicy || ""}
        resourcePolicyFrgmt={user_resource_policy}
        onRequestClose={(type, max_vfolder_size) => {
          if (type === "create" && max_vfolder_size) {
            // TODO: refetch
          }
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
        folderQuotaFrgmt={folder_quota}
      />
    </Flex>
  );
};

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
        // commitUnsetFolderQuota({
          // variables: {
          //   quota_scope_id:
          //     currentSettingType === "project" ? selectedProjectId : selectedUserId,
          //   storage_host_name: storageHostId,
          // },
          // onCompleted(response) {
          //   message.success(response?.msg);
          //   // TODO: Check quota setting is changed.
          // },
          // onError(error) {
          //   message.error(error?.msg);
          // },
      //   });
      }}
    >
      <Button type={props.type} danger icon={<DeleteFilled />} style={props.style}>
        {t("button.Unset")}
      </Button>
    </Popconfirm>
  );
};

export default StorageHostSettingsPanel;
