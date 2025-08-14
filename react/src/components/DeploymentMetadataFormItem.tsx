import { Form, Input, Select } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface DeploymentMetadataFormValues {
  metadata: {
    name: string;
    tags?: string[];
  };
}

const DeploymentMetadataFormItem: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Form.Item
        name={['metadata', 'name']}
        label={t('deployment.launcher.DeploymentName')}
        rules={[
          {
            required: true,
            message: t('deployment.launcher.DeploymentNameRequired'),
          },
        ]}
      >
        <Input
          placeholder={t('deployment.launcher.DeploymentNamePlaceholder')}
          maxLength={63}
        />
      </Form.Item>

      <Form.Item
        name={['metadata', 'tags']}
        label={t('deployment.launcher.Tags')}
      >
        <Select
          mode="tags"
          placeholder={t('deployment.launcher.TagsPlaceholder')}
          tokenSeparators={[',', ' ']}
          maxTagCount="responsive"
          open={false}
        />
      </Form.Item>
    </>
  );
};

export default DeploymentMetadataFormItem;
