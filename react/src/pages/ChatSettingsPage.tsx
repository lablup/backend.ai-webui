import ErrorLogList from '../components/ErrorLogList';
import MyKeypairInfoModal from '../components/MyKeypairInfoModal';
import SSHKeypairManagementModal from '../components/SSHKeypairManagementModal';
import SettingList, { SettingGroup } from '../components/SettingList';
import ShellScriptEditModal from '../components/ShellScriptEditModal';
import {
  useBAISettingGeneralState,
  useBAISettingUserState,
} from '../hooks/useBAISetting';
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useToggle } from 'ahooks';
import {
  App,
  Button,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Switch,
  Table,
  Typography,
} from 'antd';
import Card from 'antd/es/card/Card';
import _ from 'lodash';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { StringParam, useQueryParam, withDefault } from 'use-query-params';

type TabKey = 'general' | 'logs';
export type ShellScriptType = 'bootstrap' | 'userconfig' | undefined;

interface CustomProvider {
  id: string;
  name: string;
  endpoint: string;
  apiKey: string;
  modelName: string;
  enabled: boolean;
}

const tabParam = withDefault(StringParam, 'general');

const CustomProviderForm = () => {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [providers, setProviders] = useState<CustomProvider[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<CustomProvider | null>(
    null,
  );

  const columns = [
    {
      title: t('chatSettings.ProviderName'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('chatSettings.Endpoint'),
      dataIndex: 'endpoint',
      key: 'endpoint',
      ellipsis: true,
    },
    {
      title: t('chatSettings.ModelName'),
      dataIndex: 'modelName',
      key: 'modelName',
    },
    {
      title: t('chatSettings.Status'),
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean, record: CustomProvider) => (
        <Switch
          checked={enabled}
          onChange={(checked) => toggleProvider(record.id, checked)}
          size="small"
        />
      ),
    },
    {
      title: t('chatSettings.Actions'),
      key: 'actions',
      render: (_: any, record: CustomProvider) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            danger
            size="small"
          />
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingProvider(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (provider: CustomProvider) => {
    setEditingProvider(provider);
    form.setFieldsValue(provider);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: t('chatSettings.DeleteProviderConfirm'),
      onOk: () => {
        setProviders(providers.filter((p) => p.id !== id));
        message.success(t('chatSettings.ProviderDeleted'));
      },
    });
  };

  const toggleProvider = (id: string, enabled: boolean) => {
    setProviders(providers.map((p) => (p.id === id ? { ...p, enabled } : p)));
    message.success(
      enabled
        ? t('chatSettings.ProviderEnabled')
        : t('chatSettings.ProviderDisabled'),
    );
  };

  const handleSubmit = (values: Omit<CustomProvider, 'id'>) => {
    if (editingProvider) {
      setProviders(
        providers.map((p) =>
          p.id === editingProvider.id ? { ...editingProvider, ...values } : p,
        ),
      );
      message.success(t('chatSettings.ProviderUpdated'));
    } else {
      const newProvider: CustomProvider = {
        ...values,
        id: Date.now().toString(),
      };
      setProviders([...providers, newProvider]);
      message.success(t('chatSettings.ProviderAdded'));
    }
    setIsModalOpen(false);
    form.resetFields();
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          {t('chatSettings.AddProvider')}
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={providers}
        rowKey="id"
        pagination={false}
        size="small"
        locale={{
          emptyText: t('chatSettings.NoProvidersConfigured'),
        }}
      />

      <Modal
        title={
          editingProvider
            ? t('chatSettings.EditProvider')
            : t('chatSettings.AddProvider')
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ enabled: true }}
        >
          <Form.Item
            name="name"
            label={t('chatSettings.ProviderName')}
            rules={[
              {
                required: true,
                message: t('chatSettings.ProviderNameRequired'),
              },
            ]}
          >
            <Input placeholder={t('chatSettings.ProviderNamePlaceholder')} />
          </Form.Item>

          <Form.Item
            name="endpoint"
            label={t('chatSettings.Endpoint')}
            rules={[
              { required: true, message: t('chatSettings.EndpointRequired') },
              { type: 'url', message: t('chatSettings.EndpointInvalid') },
            ]}
          >
            <Input placeholder="https://api.example.com/v1/chat/completions" />
          </Form.Item>

          <Form.Item
            name="apiKey"
            label={t('chatSettings.APIKey')}
            rules={[
              { required: true, message: t('chatSettings.APIKeyRequired') },
            ]}
          >
            <Input.Password placeholder={t('chatSettings.APIKeyPlaceholder')} />
          </Form.Item>

          <Form.Item
            name="modelName"
            label={t('chatSettings.ModelName')}
            rules={[
              { required: true, message: t('chatSettings.ModelNameRequired') },
            ]}
          >
            <Input placeholder="gpt-3.5-turbo" />
          </Form.Item>

          <Form.Item
            name="enabled"
            label={t('chatSettings.Enabled')}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>
                {t('button.Cancel')}
              </Button>
              <Button type="primary" htmlType="submit">
                {editingProvider ? t('button.Update') : t('button.Add')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

const UserPreferencesPage = () => {
  const { t } = useTranslation();
  const [curTabKey, setCurTabKey] = useQueryParam('tab', tabParam);

  const settingGroups: Array<SettingGroup> = [
    {
      title: t('chatSettings.CustomProvider'),
      settingItems: [
        {
          type: 'custom',
          title: t('chatSettings.CustomProviderTitle'),
          description: t('chatSettings.DescCustomProvider'),
          children: <CustomProviderForm />,
        },
      ],
    },
  ];

  return (
    <>
      <Card
        activeTabKey={curTabKey}
        onTabChange={(key) => setCurTabKey(key as TabKey)}
        tabList={[
          {
            key: 'general',
            label: t('chatSettings.General'),
          },
        ]}
        bodyStyle={{
          padding: 0,
        }}
      >
        <SettingList
          settingGroups={settingGroups}
          showChangedOptionFilter
          showResetButton
          showSearchBar
        />
      </Card>
    </>
  );
};

export default UserPreferencesPage;
