import { useWebUINavigate } from '../../hooks';
import { Form, Input, Button, Modal } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface DeploymentCreateFormValues {
  name: string;
  domain?: string;
  description?: string;
}

interface DeploymentCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const DeploymentCreateModal: React.FC<DeploymentCreateModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<DeploymentCreateFormValues>();
  const webuiNavigate = useWebUINavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const [isCheckingDomain, setIsCheckingDomain] = useState(false);
  const [domainCheckStatus, setDomainCheckStatus] = useState<
    'success' | 'error' | undefined
  >();

  const handleSubmit = async (values: DeploymentCreateFormValues) => {
    setIsSubmitting(true);
    try {
      // Mock API call - replace with actual implementation
      console.log('Creating deployment:', values);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Reset form and close modal
      form.resetFields();
      onClose();

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Navigate to deployment detail page after creation
      webuiNavigate(`/deployment/mock-id`);
    } catch (error) {
      console.error('Failed to create deployment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // const handleDomainCheck = async () => {
  //   const domain = form.getFieldValue('domain');
  //   if (!domain) {
  //     return;
  //   }

  //   setIsCheckingDomain(true);
  //   setDomainCheckStatus(undefined);

  //   try {
  //     // Mock API call - replace with actual domain check implementation
  //     console.log('Checking domain:', domain);

  //     // Simulate API delay
  //     await new Promise((resolve) => setTimeout(resolve, 1000));

  //     // Mock logic: domains starting with 'test' are considered duplicates
  //     const isDuplicate = domain.toLowerCase().startsWith('test');

  //     if (isDuplicate) {
  //       setDomainCheckStatus('error');
  //       form.setFields([
  //         {
  //           name: 'domain',
  //           errors: [t('deployment.DomainAlreadyExists')],
  //         },
  //       ]);
  //     } else {
  //       setDomainCheckStatus('success');
  //       form.setFields([
  //         {
  //           name: 'domain',
  //           errors: [],
  //         },
  //       ]);
  //     }
  //   } catch (error) {
  //     console.error('Failed to check domain:', error);
  //     setDomainCheckStatus('error');
  //   } finally {
  //     setIsCheckingDomain(false);
  //   }
  // };

  const handleCancel = () => {
    form.resetFields();
    setDomainCheckStatus(undefined);
    onClose();
  };

  return (
    <Modal
      title={t('deployment.CreateDeployment')}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
          validateStatus={domainCheckStatus}
        >
          <Input
            placeholder={t('deployment.DomainHelp')}
            addonAfter={'.backend.ai'}
            onChange={() => {
              // Reset domain check status when user types
              if (domainCheckStatus) {
                setDomainCheckStatus(undefined);
                form.setFields([
                  {
                    name: 'domain',
                    errors: [],
                  },
                ]);
              }
            }}
          />
        </Form.Item>

        <Form.Item label={t('deployment.Description')} name="description">
          <Input.TextArea
            placeholder={t('deployment.DescriptionPlaceholder')}
            rows={3}
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item>
          <BAIFlex justify="end" gap="sm">
            <Button onClick={handleCancel}>{t('button.Cancel')}</Button>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              {t('button.Create')}
            </Button>
          </BAIFlex>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DeploymentCreateModal;
