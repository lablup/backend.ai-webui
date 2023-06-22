import { useState } from "react";
import {
  Typography,
  Card,
  theme,
  Progress,
  Descriptions,
  Table,
  Dropdown,
  Input,
  Button,
  Form,
  Spin
} from "antd";
import type { ColumnsType } from 'antd/es/table';
import { useForm } from "antd/es/form/Form";
import { 
  EllipsisOutlined,
  ControlFilled,
  PlusOutlined,
} from '@ant-design/icons';
import { useTranslation } from "react-i18next";
import { useToggle } from "ahooks";
import { useSuspendedBackendaiClient } from "../hooks";
import { StorageHostSettingData } from "../hooks/backendai";
import { useQuery } from "react-query";
import { _humanReadableFileSize } from "../helper/index";
import Flex from "./Flex";
import StorageHostQuotaSettingModal from "./StorageHostQuotaSettingModal";

const { Meta } = Card;

const usageIndicatorColor = (percentage:number) => {
  return percentage < 70 ? 'rgba(58, 178, 97, 1)' : percentage < 90 ? 'rgb(223, 179, 23)' : '#ef5350';
};

interface StorageHostSettingsProps {}
const StorageHostSettings: React.FC<StorageHostSettingsProps> = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const storageHostId = window.location.href.split('/').pop()?? "";

  const baiClient = useSuspendedBackendaiClient();

  let { data: storageInfo, isLoading: isLoadingStorageInfo } = useQuery<{
    storage_volume: {
      id: string,
      backend: string,
      capabilities: string[],
      path: string,
      fsprefix: string,
      performance_metric: string,
      usage: string,
    },
  }>(
    "storageInfo",
    () => {
      return baiClient.storageproxy.detail(storageHostId, ['id', 'backend', 'capabilities', 'path', 'fsprefix', 'performance_metric', 'usage'])
    },
    {
      // for to render even this fail query failed
      suspense: false,
    }
  );

  if (!storageInfo) {
    storageInfo = {
      storage_volume: {
        id: t('storageHost.CannotRead'),
        backend: t('storageHost.CannotRead'),
        capabilities: [],
        path: t('storageHost.CannotRead'),
        fsprefix: t('storageHost.CannotRead'),
        performance_metric: t('storageHost.CannotRead'),
        usage: '{}',
      },
    };
  }

  const [currentMode, setCurrentMode] = useState<"project" | "user">("project");

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const [visibleQuotaSettingModal, { toggle: toggleQuotaSettingModal }] = useToggle(false);

  const [search, setSearch] = useState<string>();
  const [searchForm] = useForm<{
    search: string;
  }>();

  const parsedUsage = JSON.parse(storageInfo?.storage_volume.usage || '{}');
  const usedBytes = parsedUsage?.used_bytes;
  const capacityBytes = parsedUsage?.capacity_bytes;
  const usageRatio = capacityBytes > 0 ? usedBytes / capacityBytes : 0;
  const storageUsage = {
    used_bytes: usedBytes,
    capacity_bytes: capacityBytes,
    percent: Number((usageRatio  * 100).toFixed(1)),
  };
  
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
          <Button type="text" danger>{t('button.Delete')}</Button>
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

  return (
    <Flex
      direction="column"
      align="stretch"
      style={{ margin: token.marginSM, gap: token.margin }}
    >
      <Typography.Title level={2}>{storageInfo?.storage_volume.id}</Typography.Title>
      <Card
        title={t('storageHost.Resource')}
        extra={
          <Dropdown
            placement="bottomRight"
            menu={{
              items: [
                {
                  key: 'control',
                  label: t('storageHost.Control'),
                  icon: <ControlFilled />
                },
              ],
            }}>
              <EllipsisOutlined/>
            </Dropdown>
        }>
          <Flex>
            <Card bordered={false}>
              <Meta title={t('storageHost.Usage')}></Meta>
              <Flex
                style={{ margin: token.marginSM, gap: token.margin }}>
                  {storageUsage.percent < 100 ? (
                    <Progress type="circle" size={120} strokeWidth={15} percent={storageUsage.percent} strokeColor={usageIndicatorColor(storageUsage.percent)}></Progress>
                  ) : (
                    <Progress type="circle" size={120} strokeWidth={15} percent={storageUsage.percent} status="exception"></Progress>
                  )
                  } 
                  <Descriptions column={1} style={{ marginLeft: 20 }}>
                    <Descriptions.Item label={t('storageHost.Total')}>{_humanReadableFileSize(storageUsage.used_bytes)}</Descriptions.Item>
                    <Descriptions.Item label={t('storageHost.Used')}>{_humanReadableFileSize(storageUsage.capacity_bytes)}</Descriptions.Item>
                  </Descriptions>
              </Flex>
            </Card>
            <Card bordered={false}>
              <Meta title={t('storageHost.Detail')}></Meta>
              <Spin spinning={isLoadingStorageInfo}>
                <Descriptions column={1} style={{ marginTop: 20 }}>
                  <Descriptions.Item label={t('agent.Endpoint')}>{storageInfo?.storage_volume.path}</Descriptions.Item>
                  <Descriptions.Item label={t('agent.BackendType')}>{storageInfo?.storage_volume.backend}</Descriptions.Item>
                  <Descriptions.Item label={t('agent.Capabilities')}>{storageInfo?.storage_volume.capabilities?.join(',')}</Descriptions.Item>
                </Descriptions>
              </Spin>
            </Card>
          </Flex>
      </Card>
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
                    key: 'control',
                    label: 'Control',
                    icon: <ControlFilled />
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
            <Descriptions.Item label={t('storageHost.VendorOptions')}>{}</Descriptions.Item>
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
              onClick={() => {
                toggleQuotaSettingModal();
              }}  
            ></Button>
          </Flex>
          <Table rowSelection={rowSelection} columns={columns} dataSource={storageData}></Table>
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

export default StorageHostSettings;
