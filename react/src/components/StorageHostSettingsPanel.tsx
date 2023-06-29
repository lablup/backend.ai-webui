import { useState } from "react";
import { useParams } from "react-router-dom";
import { StorageHostSettingsPanelQuery } from "./__generated__/StorageHostSettingsPanelQuery.graphql";
// import { StorageHostSettingsPanelUnsetFolderQuotaMutation } from "./__generated__/StorageHostSettingsPanelUnsetFolderQuotaMutation.graphql";

import {
  Card,
  theme,
  Descriptions,
  Table,
  Dropdown,
  Input,
  Button,
  Form,
  Empty,
  message,
  Popconfirm,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { EditFilled, DeleteFilled } from "@ant-design/icons";
import { useForm } from "antd/es/form/Form";
import { EllipsisOutlined, PlusOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useToggle } from "ahooks";
import Flex from "./Flex";
import StorageHostQuotaSettingModal from "./StorageHostQuotaSettingModal";
import StorageHostCustomQuotaAddingModal from "./StorageHostCustomQuotaAddingModal";
import { StorageHostSettingData } from "../hooks/backendai";
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


  const [visibleQuotaSettingModal, { toggle: toggleQuotaSettingModal }] =
    useToggle(false);
  const [
    visibleCustomQuotaAddingModal,
    { toggle: toggleCustomQuotaAddingModal },
  ] = useToggle(false);

  const [editingQuota, setEditingQuota] = useState();
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");

  const folder_quota: StorageHostSettingData = {
    id: 'test1',
    quota_scope_id: 'test1',
    storage_host_name: 'localhost:volume1',
    details: {
      hard_limit_bytes: 300,
      usage_bytes: 200,
      usage_count: 100,
    },
  };

  // // const { project_resource_policies, user_resource_policies, folder_quota } = useLazyLoadQuery<StorageHostSettingsPanelQuery>(
  // const { folder_quota } = useLazyLoadQuery<StorageHostSettingsPanelQuery>(
  //   graphql`
  //     query StorageHostSettingsPanelQuery(
  //       $quota_scope_id: UUID!,
  //       $storage_host_name: String!,
  //     ) {
  //       # project_resource_policies {
  //       #   max_vfolder_size
  //       # }

  //       # user_resource_policies {
  //       #   max_vfolder_size
  //       # }

  //       folder_quota (
  //         quota_scope_id: $quota_scope_id,
  //         storage_host_name: $storage_host_name,
  //       ) {
  //         id
  //         quota_scope_id
  //         storage_host_name
  //         details {
  //           hard_limit_bytes
  //           usage_bytes
  //           usage_count
  //         }
  //       }
  //   }
  // `,
  //   {
  //     storage_host_name: storageHostId || "",
  //     quota_scope_id:
  //       currentSettingType === "project" ? selectedProjectId : selectedUserId,
  //   }
  // );

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
            onClick={() => toggleCustomQuotaAddingModal()}
          >
            {currentSettingType === "project"
              ? t("storageHost.quotaSettings.AddProject")
              : t("storageHost.quotaSettings.AddUser")}
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
            <Descriptions.Item label={t("storageHost.HardLimit") + " (bytes)"}>
              {/* {currentSettingType === "project" ? (
                project_resource_policies?.max_vfolder_size
                ) : (
                user_resource_policies?.max_vfolder_size
                )} */}
            </Descriptions.Item>
          </Descriptions>
        </Card>
        <Card bordered={false}>
          <Flex direction="column" gap="md" align="stretch">
            <Flex justify="between">
              {currentSettingType === "project" ? (
                <ProjectSelector
                  value={selectedProjectId}
                  style={{ width: '30vw' }}
                  onChange={setSelectedProjectId}
                />
              ) : (
                <UserSelector
                  value={selectedUserId}
                  style={{ width: '30vw' }}
                  onChange={setSelectedUserId}
                  />
              )}
            </Flex>

            <Table
              columns={columns}
              dataSource={folder_quota ? [folder_quota] : []}
              locale={{ emptyText: addUserWhenEmpty }}
              pagination={false}
            />
          </Flex>
        </Card>
      </Card>
      <StorageHostQuotaSettingModal
        open={!!editingQuota}
        // folderQuotaFrgmt={}
        destroyOnClose
        onRequestClose={(settings) => {
          toggleQuotaSettingModal();
        }}
      />
      <StorageHostCustomQuotaAddingModal
        currentMode={currentSettingType}
        open={visibleCustomQuotaAddingModal}
        destroyOnClose
        onRequestClose={() => {
          toggleCustomQuotaAddingModal();
        }}
      />
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
