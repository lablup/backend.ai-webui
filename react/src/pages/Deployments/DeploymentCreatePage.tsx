import { useWebUINavigate } from '../../hooks';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Typography,
  Alert,
  Space,
} from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface DeploymentCreateFormValues {
  name: string;
  domain?: string;
  mode: 'simple' | 'expert';
}

const DeploymentCreatePage: React.FC = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm<DeploymentCreateFormValues>();
  const webuiNavigate = useWebUINavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: DeploymentCreateFormValues) => {
    setIsSubmitting(true);
    try {
      // Mock API call - replace with actual implementation
      console.log('Creating deployment:', values);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Navigate to deployment detail page after creation
      webuiNavigate(`/deployment/mock-id`);
    } catch (error) {
      console.error('Failed to create deployment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    webuiNavigate('/deployment');
  };

  return (
    <BAIFlex
      direction="column"
      align="stretch"
      gap="md"
      style={{ maxWidth: 600 }}
    >
      <Typography.Title level={3}>
        {t('deployment.CreateDeployment')}
      </Typography.Title>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            mode: 'simple',
          }}
        >
          <Form.Item
            label={t('deployment.DeploymentName')}
            name="name"
            rules={[
              {
                required: true,
                message: t('deployment.DeploymentNameRequired'),
              },
            ]}
          >
            <Input placeholder={t('deployment.DeploymentNamePlaceholder')} />
          </Form.Item>

          <Form.Item
            label={t('deployment.Domain')}
            name="domain"
            help={t('deployment.DomainHelp')}
          >
            <Input placeholder={t('deployment.DomainPlaceholder')} />
          </Form.Item>

          <Form.Item
            label={t('deployment.Mode')}
            name="mode"
            rules={[
              {
                required: true,
                message: t('deployment.ModeRequired'),
              },
            ]}
          >
            <Select
              options={[
                {
                  value: 'simple',
                  label: (
                    <Space>
                      <span>{t('deployment.SimpleMode')}</span>
                      <Typography.Text
                        type="secondary"
                        style={{ fontSize: '12px' }}
                      >
                        {t('deployment.SimpleModeDescription')}
                      </Typography.Text>
                    </Space>
                  ),
                },
                {
                  value: 'expert',
                  label: (
                    <Space>
                      <span>{t('deployment.ExpertMode')}</span>
                      <Typography.Text
                        type="secondary"
                        style={{ fontSize: '12px' }}
                      >
                        {t('deployment.ExpertModeDescription')}
                      </Typography.Text>
                    </Space>
                  ),
                },
              ]}
            />
          </Form.Item>

          <Alert
            message={t('deployment.ModeWarning')}
            description={t('deployment.ModeWarningDescription')}
            type="warning"
            icon={<ExclamationCircleOutlined />}
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form.Item>
            <BAIFlex justify="end" gap="sm">
              <Button onClick={handleCancel}>{t('button.Cancel')}</Button>
              <Button type="primary" htmlType="submit" loading={isSubmitting}>
                {t('button.Create')}
              </Button>
            </BAIFlex>
          </Form.Item>
        </Form>
      </Card>
    </BAIFlex>
  );
};

export default DeploymentCreatePage;
