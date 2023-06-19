import { ReactNode, useState } from "react";
import {
  Typography,
  Card,
  theme,
  Spin,
  Row,
  Col,
  Progress,
  Descriptions,
  Tabs,
  Table,
  Dropdown,
  Input,
  Button,
} from "antd";
import type { ColumnsType } from 'antd/es/table';
import { 
  EllipsisOutlined,
  ControlFilled,
  SearchOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useTranslation } from "react-i18next";
import Flex from "./Flex";
import { useToggle } from "ahooks";
import { useQuery } from "react-query";
import { newLineToBrElement } from "../helper";
import { useSuspendedBackendaiClient } from "../hooks";
import { StorageHostSettingData } from "../hooks/backendai";
import StorageHostQuotaSettingModal from "./StorageHostQuotaSettingModal";

const { Meta } = Card;

const usageIndicatorColor = (percentage:number) => {
  return percentage < 70 ? 'rgba(58, 178, 97, 1)' : percentage < 90 ? 'rgb(223, 179, 23)' : '#ef5350';
};

interface StorageHostSettingsProps {
  // storageHostId: string;
}
const StorageHostSettings: React.FC<StorageHostSettingsProps> = ({}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [usage, setUsage] = useState({percent: 60});
  const [currentMode, setCurrentMode] = useState<"project" | "user">("project");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [visibleQuotaSettingModal, { toggle: toggleQuotaSettingModal }] = useToggle(false);

  // TODO: move data and columns to external
  const data = [
    {
      key: 'local:volume1',
      name: 'local:volume1',
      id: 'foo',
      max_file_count: 200,
      soft_limit: 100,
      hard_limit: 300,
      vendor_options: {},
    },
  ];

  const columns: ColumnsType<StorageHostSettingData> = [
    {
      title: t('storageHost.Name'),
      dataIndex: 'name',
    },
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: t('storageHost.MaxFileCount'),
      dataIndex: 'max_file_count',
    },
    {
      title: t('storageHost.SoftLimit'),
      dataIndex: 'soft_limit',
    },
    {
      title: t('storageHost.HardLimit'),
      dataIndex: 'hard_limit',
    },
    {
      title: t('storageHost.VendorOptions'),
      dataIndex: 'vendor_options'
    },
  ];

  const baiClient = useSuspendedBackendaiClient();

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
      <Typography.Title level={2}>local:volume1</Typography.Title>
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
                  {usage.percent < 100 ? (
                    <Progress type="circle" size={120} strokeWidth={15} percent={usage.percent} strokeColor={usageIndicatorColor(usage.percent)}></Progress>
                  ) : (
                    <Progress type="circle" size={120} strokeWidth={15} percent={usage.percent} status="exception"></Progress>
                  )
                  } 
                  <Descriptions column={1} style={{ marginLeft: 20 }}>
                    <Descriptions.Item label={t('storageHost.Total')}>125 GB</Descriptions.Item>
                    <Descriptions.Item label={t('storageHost.Used')}>75 GB</Descriptions.Item>
                  </Descriptions>
              </Flex>
            </Card>
            <Card bordered={false}>
              <Meta title={t('storageHost.Detail')}></Meta>
              <Descriptions column={1} style={{ marginTop: 20 }}>
                <Descriptions.Item label={t('agent.Endpoint')}>/Users/sujinkim/lablup/backend.ai/vfroot/local</Descriptions.Item>
                <Descriptions.Item label={t('agent.BackendType')}>vfs</Descriptions.Item>
                <Descriptions.Item label={t('agent.Capabilities')}>vfolder</Descriptions.Item>
              </Descriptions>
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
            <Descriptions.Item label={t('storageHost.SoftLimit')}>100</Descriptions.Item>
            <Descriptions.Item label={t('storageHost.HardLimit')}>300</Descriptions.Item>
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
            <Input 
              prefix={<SearchOutlined />}
              placeholder={t('storageHost.Search') || "Search"}
              style={{ marginBottom: 10, width: '30%' }}
            />
            <Button 
              icon={<PlusOutlined />}
              onClick={() => {
                toggleQuotaSettingModal();
              }}  
            ></Button>
          </Flex>
          <Table rowSelection={rowSelection} columns={columns} dataSource={data}></Table>
        </Card>
        </Card>
        <StorageHostQuotaSettingModal
          open={visibleQuotaSettingModal}
          destroyOnClose
          onRequestClose={(envs) => {
            toggleQuotaSettingModal();
          }}
        />
    </Flex>
  );
};

export default StorageHostSettings;
