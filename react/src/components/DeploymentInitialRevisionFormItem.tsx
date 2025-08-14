import ImageEnvironmentSelectFormItems from './ImageEnvironmentSelectFormItems';
import { Form, Input, Card } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface DeploymentInitialRevisionFormValues {
  initialRevision: {
    deploymentId: string;
    name: string;
    image: {
      name?: string;
      tag?: string;
    };
    modelRuntimeConfig: Record<string, any>;
    modelMountConfig: Record<string, any>;
  };
}

const DeploymentInitialRevisionFormItem: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Form.Item
        name={['initialRevision', 'name']}
        label={t('deployment.launcher.RevisionName')}
        rules={[
          {
            required: true,
            message: t('deployment.launcher.RevisionNameRequired'),
          },
        ]}
      >
        <Input placeholder={t('deployment.launcher.RevisionNamePlaceholder')} />
      </Form.Item>

      <Card
        title={t('deployment.launcher.ContainerImage')}
        size="small"
        style={{ marginBottom: 16 }}
      >
        <ImageEnvironmentSelectFormItems showPrivate />
      </Card>

      <Card
        title={t('deployment.launcher.ModelRuntimeConfig')}
        size="small"
        style={{ marginBottom: 16 }}
      >
        <Form.Item
          name={['initialRevision', 'modelRuntimeConfig', 'model_name']}
          label={t('deployment.launcher.ModelName')}
        >
          <Input placeholder={t('deployment.launcher.ModelNamePlaceholder')} />
        </Form.Item>

        <Form.Item
          name={['initialRevision', 'modelRuntimeConfig', 'model_version']}
          label={t('deployment.launcher.ModelVersion')}
        >
          <Input
            placeholder={t('deployment.launcher.ModelVersionPlaceholder')}
          />
        </Form.Item>
      </Card>

      <Card title={t('deployment.launcher.ModelMountConfig')} size="small">
        <Form.Item
          name={['initialRevision', 'modelMountConfig', 'mount_destination']}
          label={t('deployment.launcher.MountDestination')}
          rules={[
            {
              required: true,
              message: t('deployment.launcher.MountDestinationRequired'),
            },
          ]}
        >
          <Input
            placeholder={t('deployment.launcher.MountDestinationPlaceholder')}
          />
        </Form.Item>

        <Form.Item
          name={['initialRevision', 'modelMountConfig', 'definition_path']}
          label={t('deployment.launcher.DefinitionPath')}
        >
          <Input placeholder={'model-definition.yaml'} />
        </Form.Item>
      </Card>
    </>
  );
};

export default DeploymentInitialRevisionFormItem;
