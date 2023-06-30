import React, { useState, Suspense } from "react";
import { useParams } from "react-router-dom";
import { StorageHostSettingsPanelQuery } from "./__generated__/StorageHostSettingsPanelQuery.graphql";
// import { StorageHostSettingsPanelUnsetFolderQuotaMutation } from "./__generated__/StorageHostSettingsPanelUnsetFolderQuotaMutation.graphql";

import {
  Card,
  theme,
  Descriptions,
  Table,
  Dropdown,
  Button,
  Empty,
  Popconfirm,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { EditFilled, DeleteFilled } from "@ant-design/icons";
import { EllipsisOutlined, PlusOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useToggle } from "ahooks";
import Flex from "./Flex";
import StorageHostQuotaSettingModal from "./StorageHostQuotaSettingModal";
import { StorageHostSettingData } from "../hooks/backendai";
import { _humanReadableDecimalSize } from "../helper/index";
import ProjectSelector from "./ProjectSelector";
import UserSelector from "./UserSelector";
import { useLazyLoadQuery, useMutation } from "react-relay";
import graphql from "babel-plugin-relay/macro";

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


  const [visibleQuotaSettingModal, { toggle: toggleQuotaSettingModal }] = useToggle(false);

  const [editingQuota, setEditingQuota] = useState();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedProjectName, setSelectedProjectName] = useState<string>("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedUserName, setSelectedUserName] = useState<string>("");

  const { project_resource_policy, user_resource_policy, folder_quota } = useLazyLoadQuery<StorageHostSettingsPanelQuery>(
    graphql`
      query StorageHostSettingsPanelQuery(
        $quota_scope_id: String!,
        $storage_host_name: String!,
        $project_name: String!,
        $user_name: String,
      ) {
        project_resource_policy (
          name: $project_name,
        ) {
          max_vfolder_size
        }

        user_resource_policy (
          name: $user_name,
        ) {
          max_vfolder_size
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
            usage_bytes
            usage_count
          }
        }
    }
  `,
    {
      storage_host_name: storageHostId || "",
      quota_scope_id:
        currentSettingType === "project" ? selectedProjectId : selectedUserId,
      project_name: selectedProjectName,
      user_name: selectedUserName,
    }
  );

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

  const columns: ColumnsType<StorageHostSettingData> = [
    {
      title: "ID",
      dataIndex: "quota_scope_id",
      key: "quota_scope_id",
      sorter: (a, b) => a.quota_scope_id.localeCompare(b.quota_scope_id),
    },
    {
      title: t("storageHost.HardLimit") + " (bytes)",
      key: "hard_limit_bytes",
      dataIndex: ["details", "hard_limit_bytes"],
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
  ];

  const addUserWhenEmpty = (
    <Empty
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
        <Card
          extra={
            <Dropdown
              placement="bottomRight"
              menu={{
                items: [
                  {
                    key: "edit",
                    label: t("button.Edit"),
                    icon: <EditFilled />,
                    onClick: () => toggleQuotaSettingModal(),
                  },
                ],
              }}
            >
              <EllipsisOutlined />
            </Dropdown>
          }
          title={t("storageHost.DefaultSettings")}
          bordered={false}
          headStyle={{ borderBottom: "none" }}
          style={{ marginBottom: 20 }}
        >
          <Descriptions>
            <Descriptions.Item label={t("storageHost.HardLimit")}>
              {currentSettingType === "project" ? (
                  project_resource_policy && project_resource_policy?.max_vfolder_size !== -1 ? _humanReadableDecimalSize(project_resource_policy?.max_vfolder_size) : t('storageHost.NoConfigs')
                ) : (
                  user_resource_policy && user_resource_policy?.max_vfolder_size !== -1 ? _humanReadableDecimalSize(user_resource_policy?.max_vfolder_size) : t('storageHost.NoConfigs')
                )}
            </Descriptions.Item>
          </Descriptions>
        </Card>
        <Card bordered={false}>
          <Flex direction="column" gap="md" align="stretch">
            <Flex justify="between">
              {currentSettingType === "project" ? (
                <ProjectSelector
                  style={{ width: '30vw' }}
                  onSelectProject={(project: any) => {
                    setSelectedProjectId(project?.projectId);
                    setSelectedProjectName(project?.projectName);
                  }}
                />
              ) : (
                <UserSelector
                  style={{ width: '30vw' }}
                  onSelectUser={(user: any) => {
                    setSelectedUserId(user?.userId);
                    setSelectedUserName(user?.userName);
                  }}
                  />
              )}
            </Flex>
            <Table
              columns={columns}
              dataSource={storageHostId && (selectedProjectId || selectedUserId) && folder_quota ? [folder_quota] : []}
              locale={{ emptyText: addUserWhenEmpty }}
              pagination={false}
            />
          </Flex>
        </Card>
      </Card>
      <Suspense fallback={<div>loading...</div>}>
        <StorageHostQuotaSettingModal
          open={visibleQuotaSettingModal}
          destroyOnClose={true}
          onCancel={toggleQuotaSettingModal}
          onOk={toggleQuotaSettingModal}
          //@ts-ignore
          folderQuotaFrgmt={folder_quota}
        />
      </Suspense>
    </Flex>
  );
};

interface UnsetButtonProps {
  type?:
    | "default"
    | "link"
    | "text"
    | "ghost"
    | "primary"
    | "dashed"
    | undefined;
  buttonStyle?: object;
}
const UnsetButton: React.FC<UnsetButtonProps> = ({
  type = "default",
  buttonStyle = {},
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
      <Button type={type} danger icon={<DeleteFilled />} style={buttonStyle}>
        {t("button.Unset")}
      </Button>
    </Popconfirm>
  );
};

export default StorageHostSettingsPanel;
