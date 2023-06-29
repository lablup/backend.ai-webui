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

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

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

  // const [storageData, setStorageData] = useState<StorageHostSettingData[]>([]);
  // const [storageData, setStorageData] = useState<StorageHostSettingData[]>([
  //   {
  //     key: "test1",
  //     name: "test1",
  //     id: "foo1",
  //     max_file_count: 200,
  //     soft_limit: 100,
  //     hard_limit: 300,
  //     vendor_options: {},
  //   },
  //   {
  //     key: "test2",
  //     name: "test2",
  //     id: "foo2",
  //     max_file_count: 500,
  //     soft_limit: 200,
  //     hard_limit: 250,
  //     vendor_options: {},
  //   },
  // ]);

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
  //   query StorageHostSettingsPanelQuery($storage_host_name: String!, $quota_scope_id: String!){

  //     removeFolderQuota (storage_host_name, quota_scope_id) {
  //         folder_quota {
  //         id
  //         quota_scope_id
  //         storage_host_name
  //         details {
  //           hard_limit_bytes
  //           usage_bytes
  //           usage_count
  //         }
  //         }
  //       }
  //   }
  // `,
  //   {
  //     storage_host_name: storageHostId,
  //     quota_scope_id:
  //       currentSettingType === "project" ? selectedProjectName : selectedUserId,
  //   }
  // );

  // const [commitSetFolderQuota, isInFlightCommitFolderQuota] = useMutation(graphql`
  //   mutation StorageHostSettingsPanelSetFolderQuotaMutation {
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
  // `);

  const columns: ColumnsType<StorageHostSettingData> = [
    {
      title: t("storageHost.Name"),
      dataIndex: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "ID",
      dataIndex: "id",
      sorter: (a, b) => a.id.localeCompare(b.id),
    },
    {
      title: t("storageHost.MaxFileCount"),
      dataIndex: "max_file_count",
      sorter: (a, b) => (a.max_file_count || 0) - (b.max_file_count || 0),
    },
    {
      title: t("storageHost.SoftLimit") + " (bytes)",
      dataIndex: "soft_limit",
      sorter: (a, b) => (a.soft_limit || 0) - (b.soft_limit || 0),
    },
    {
      title: t("storageHost.HardLimit") + " (bytes)",
      dataIndex: "hard_limit",
      sorter: (a, b) => (a.hard_limit || 0) - (b.hard_limit || 0),
    },
    {
      title: t("storageHost.VendorOptions"),
      dataIndex: "vendor_options",
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
          <DeleteCustomSettingButton type="text" />
        </>
      ),
    },
  ];

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    console.log("selectedRowKeys changed: ", newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  const hasSelected = selectedRowKeys.length > 0;

  const addUserWhenEmpty = (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={
        <>
          <div style={{ margin: 10 }}>
            {t("storageHost.quotaSettings.ClickCustomButton")}
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
            <Descriptions.Item label={t("storageHost.MaxFileCount")}>
              200
            </Descriptions.Item>
            <Descriptions.Item label={t("storageHost.SoftLimit") + " (bytes)"}>
              100
            </Descriptions.Item>
            <Descriptions.Item label={t("storageHost.HardLimit") + " (bytes)"}>
              300
            </Descriptions.Item>
          </Descriptions>
        </Card>
        <Card bordered={false}>
          <Flex direction="column" gap="md" align="stretch">
            <Flex justify="between">
              {/* <Form form={searchForm} style={{ marginBottom: 10 }}>
              <Form.Item name="search" noStyle>
                <Input.Search
                  placeholder={t("storageHost.Search") || "Search"}
                  allowClear
                  onSearch={(value) => {
                    setSearch(value);
                  }}
                />
              </Form.Item>
            </Form> */}
              {currentSettingType === "project" ? (
                <ProjectSelector
                  value={selectedProjectName}
                  style={{ width: 200 }}
                  onChange={setSelectedProjectName}
                />
              ) : (
                "UserSelect here"
              )}
              <div>
                <Button
                  icon={<PlusOutlined />}
                  onClick={() => toggleCustomQuotaAddingModal()}
                ></Button>
                {hasSelected && (
                  <DeleteCustomSettingButton buttonStyle={{ marginLeft: 5 }} />
                )}
              </div>
            </Flex>

            <Table
              rowSelection={rowSelection}
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

interface DeleteCustomSettingButtonProps {
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
const DeleteCustomSettingButton: React.FC<DeleteCustomSettingButtonProps> = ({
  type = "default",
  buttonStyle = {},
}) => {
  const { t } = useTranslation();
  return (
    <Popconfirm
      title={t("storageHost.quotaSettings.DeleteCustomSettings")}
      description={t("storageHost.quotaSettings.ConfirmDeleteCustomQuota")}
      placement="bottom"
    >
      <Button type={type} danger icon={<DeleteFilled />} style={buttonStyle}>
        {t("button.Delete")}
      </Button>
    </Popconfirm>
  );
};

export default StorageHostSettingsPanel;