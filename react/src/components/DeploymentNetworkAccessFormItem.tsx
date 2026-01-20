import { Form, Input, Switch } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface DeploymentNetworkAccessFormValues {
  networkAccess: {
    preferredDomainName?: string;
    openToPublic: boolean;
  };
}

const DeploymentNetworkAccessFormItem: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Form.Item
        name={['networkAccess', 'preferredDomainName']}
        label={t('deployment.launcher.PreferredDomainName')}
      >
        <Input
          placeholder={t('deployment.launcher.PreferredDomainNamePlaceholder')}
        />
      </Form.Item>

      <Form.Item
        name={['networkAccess', 'openToPublic']}
        label={t('deployment.launcher.OpenToPublic')}
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>
    </>
  );
};

export default DeploymentNetworkAccessFormItem;
