import { useState } from "react";
import { useParams } from "react-router-dom";

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
  const [selectedProjectName, setSelectedProjectName] = useState<string>();
  const [selectedUserId, setSelectedUserId] = useState<string>();
  // const [search, setSearch] = useState<string>();
  // const [searchForm] = useForm<{
  //   search: string;
  // }>();

  const folderQuota = {
    key: "test1",
    name: "test1",
    id: "foo1",
    max_file_count: 200,
    soft_limit: 100,
    hard_limit: 300,
    vendor_options: {},
  };

  // const folderQuota = useLazyLoadQuery(
  //   graphql`
  //   query StorageHostSettingsPanelQuery($storage_host_name: String!, $quota_scope_id: ID!){
  //     unsetFolderQuota (storage_host_name, quota_scope_id) {
  //         folder_quota {
  //         id
  //         quota_scope_id
  //         storage_host_name
  //         details {
  //           hard_limit_bytes
  //           usage_bytes
  //           usage_count
  //         }
  //       }
  //     }
  //   }
  // `,
  //   {
  //     storage_host_name: storageHostId,
  //     quota_scope_id:
  //       currentSettingType === "project" ? selectedProjectName : selectedUserId,
  //   }
  // );

  // const [commitSetFolderQuota, isInFlightCommitFolderQuota] = useMutation(graphql`
  //   mutation StorageHostSettingsPanelSetFolderQuotaMutation($storage_host_name: String!, $quota_scope_id: ID!, props: FolderQuotaInput!) {
  //     setFolderQuota(input: $input) {
  //       folder_quota {
  //         id
  //         quota_scope_id
  //         storage_host_name
  //         details {
  //           hard_limit_bytes
  //           usage_bytes
  //           usage_count
  //         }
  //       }
  //     }
  //   }
  // `,
  //   {
  //     storage_host_name: storageHostId,
  //     quota_scope_id:
  //       currentSettingType === "project" ? selectedProjectName : selectedUserId,
  //     props: {
  //       hard_limit_bytes: hardLimitBytes,
  //     }
  //   }
  // );

  const columns: ColumnsType<StorageHostSettingData> = [
    {
      title: "ID",
      dataIndex: "id",
      sorter: (a, b) => a.id.localeCompare(b.id),
    },
    {
      title: t("storageHost.HardLimit") + " (bytes)",
      dataIndex: "hard_limit",
    },
    {
      title: t("general.Control"),
      // dataIndex: "controls",
      render: (_, record) => (
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
              300
            </Descriptions.Item>
          </Descriptions>
        </Card>
        <Card bordered={false}>
          <Flex direction="column" gap="md" align="stretch">
            <Flex justify="between">
              {currentSettingType === "project" ? (
                <ProjectSelector
                  value={selectedProjectName}
                  style={{ width: '30vw' }}
                  onChange={setSelectedProjectName}
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
              dataSource={[folderQuota]}
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
    >
      <Button type={type} danger icon={<DeleteFilled />} style={buttonStyle}>
        {t("button.Unset")}
      </Button>
    </Popconfirm>
  );
};

export default StorageHostSettingsPanel;
