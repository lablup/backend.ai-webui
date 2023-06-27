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
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { EditFilled, DeleteFilled } from "@ant-design/icons";
import { useForm } from "antd/es/form/Form";
import { 
  EllipsisOutlined,
  ControlFilled,
  PlusOutlined,
} from '@ant-design/icons';
import { useTranslation } from "react-i18next";
import { useToggle } from "ahooks";
import Flex from "./Flex";
import StorageHostQuotaSettingModal from "./StorageHostQuotaSettingModal";
import { StorageHostSettingData } from "../hooks/backendai";

interface StorageHostSettingsPanelProps {}
const StorageHostSettingsPanel: React.FC<StorageHostSettingsPanelProps> = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const { storageHostId } = useParams<{
    storageHostId: string;  // for `:storageHostId` on <Router path="/storage-settings:storageHostId" element={<StorageHostSettings />} />
  }>();

  const [currentMode, setCurrentMode] = useState<"project" | "user">("project");

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const [visibleQuotaSettingModal, { toggle: toggleQuotaSettingModal }] = useToggle(false);

  const [search, setSearch] = useState<string>();
  const [searchForm] = useForm<{
    search: string;
  }>();
  // const [storageData, setStorageData] = useState<StorageHostSettingData[]>([]);
  const [storageData, setStorageData] = useState<StorageHostSettingData[]>([
    {
      key: 'test1',
      name: 'test1',
      id: 'foo1',
      max_file_count: 200,
      soft_limit: 100,
      hard_limit: 300,
      vendor_options: {},
    },
    {
      key: 'test2',
      name: 'test2',
      id: 'foo2',
      max_file_count: 500,
      soft_limit: 200,
      hard_limit: 250,
      vendor_options: {},
    },
  ]);

  const columns: ColumnsType<StorageHostSettingData> = [
    {
      title: t('storageHost.Name'),
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'ID',
      dataIndex: 'id',
      sorter: (a, b) => a.id.localeCompare(b.id),
    },
    {
      title: t('storageHost.MaxFileCount'),
      dataIndex: 'max_file_count',
      sorter: (a, b) => (a.max_file_count || 0) - (b.max_file_count || 0),
    },
    {
      title: t('storageHost.SoftLimit') + ' (bytes)',
      dataIndex: 'soft_limit',
      sorter: (a, b) => (a.soft_limit || 0) - (b.soft_limit || 0),
    },
    {
      title: t('storageHost.HardLimit') + ' (bytes)',
      dataIndex: 'hard_limit',
      sorter: (a, b) => (a.hard_limit || 0) - (b.hard_limit || 0),
    },
    {
      title: t('storageHost.VendorOptions'),
      dataIndex: 'vendor_options',
    },
    {
      title: t('general.Control'),
      dataIndex: 'controls',
      render: (_, record: { key: React.Key }) => 
        storageData.length >= 1 ? (
          <>
            <Button type="text" icon={<EditFilled />} onClick={() => toggleQuotaSettingModal()}>{t('button.Edit')}</Button>
            <Button type="text" danger icon={<DeleteFilled />}>{t('button.Delete')}</Button>
          </>
        ) : null,
    }
  ];

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    console.log('selectedRowKeys changed: ', newSelectedRowKeys);
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
      description={(
        <>
          <div
            style={{ margin: 10 }}>
            {t('storageHost.quotaSettings.ClickCustomButton')}
          </div> 
          <Button
            icon={<PlusOutlined />}>
            {currentMode === 'project' ? t('storageHost.quotaSettings.AddProject') : t('storageHost.quotaSettings.AddUser')}
          </Button>
        </>
      )}
    />
  );

  return (
    <Flex
      direction="column"
      align="stretch"
      style={{ margin: token.marginSM, gap: token.margin }}
    >
      <Card
        title={t('storageHost.Settings')}
        tabList={[
          {
            key: "project",
            tab: t('storageHost.ForProject'),
          },
          {
            key: "user",
            tab: t('storageHost.ForUser'),
          },
        ]}
        activeTabKey={currentMode}
        // eslint-disable-next-line
        //@ts-ignore
        onTabChange={setCurrentMode}
      >
        <Card 
          extra={
            <Dropdown
              placement="bottomRight"
              menu={{
                items: [
                  {
                    key: 'edit',
                    label: t('button.Edit'),
                    icon: <EditFilled />
                  },
                ],
              }}>
                <EllipsisOutlined/>
              </Dropdown>
          }
          title={t('storageHost.DefaultSettings')}
          bordered={false}
          headStyle={{ borderBottom: 'none' }}
          style={{ marginBottom: 20 }}
          >
          <Descriptions>
            <Descriptions.Item label={t('storageHost.MaxFileCount')}>200</Descriptions.Item>
            <Descriptions.Item label={t('storageHost.SoftLimit') + ' (bytes)'}>100</Descriptions.Item>
            <Descriptions.Item label={t('storageHost.HardLimit') + ' (bytes)'}>300</Descriptions.Item>
          </Descriptions>
        </Card>
        <Card
          bordered={false}
        >
          <Flex
            align="stretch"
            justify="between"
          >
            <Form form={searchForm} style={{ marginBottom: 10 }}>
              <Form.Item name="search" noStyle>
                <Input.Search
                  placeholder={t('storageHost.Search') || "Search"}
                  allowClear
                  onSearch={(value) => {
                    setSearch(value);
                  }}
                />
              </Form.Item>
            </Form>
            <Button 
              icon={<PlusOutlined />}
            ></Button>
          </Flex>
          <Table 
            rowSelection={rowSelection}
            columns={columns}
            dataSource={storageData}
            locale={{ emptyText: addUserWhenEmpty }}></Table>
        </Card>
        </Card>
        <StorageHostQuotaSettingModal
          open={visibleQuotaSettingModal}
          destroyOnClose
          onRequestClose={(settings) => {
            toggleQuotaSettingModal();
          }}
        />
    </Flex>
  );
};

export default StorageHostSettingsPanel;
