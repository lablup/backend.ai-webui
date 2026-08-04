/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Collapse, Form, Input, Select, theme } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

// The UI exposes only one model (index 0); the form keeps the
// `modelDefinition.models` array shape for the submit mutation.
const ModelConfigItem: React.FC<{
  listItemName: number;
  restField: object;
}> = ({ listItemName, restField }) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();

  // Rendered only when the model-definition switch is ON, so sub-fields are
  // unconditionally required here; the switch lives in the parent card.
  return (
    <BAIFlex direction="column" align="stretch" gap="md">
      <BAIFlex gap="md" wrap="wrap">
        <Form.Item
          {...restField}
          name={[listItemName, 'name']}
          label={t('adminDeploymentPreset.modelDef.ModelName')}
          style={{ flex: 1, minWidth: 160 }}
          rules={[{ required: true }]}
        >
          <Input
            placeholder={t(
              'adminDeploymentPreset.modelDef.ModelNamePlaceholder',
            )}
          />
        </Form.Item>
        <Form.Item
          {...restField}
          name={[listItemName, 'modelPath']}
          label={t('adminDeploymentPreset.modelDef.ModelPath')}
          style={{ flex: 2, minWidth: 200 }}
          rules={[{ required: true }]}
        >
          <Input
            placeholder={t(
              'adminDeploymentPreset.modelDef.ModelPathPlaceholder',
            )}
          />
        </Form.Item>
      </BAIFlex>

      <Collapse
        defaultActiveKey={['metadata']}
        style={{ marginTop: token.marginSM }}
        items={[
          {
            key: 'metadata',
            label: t('adminDeploymentPreset.modelDef.EnableMetadata'),
            children: (
              <BAIFlex direction="column" align="stretch" gap="xs">
                <BAIFlex gap="md" wrap="wrap">
                  <Form.Item
                    {...restField}
                    name={[listItemName, 'metadata', 'title']}
                    label={t('adminDeploymentPreset.modelDef.Title')}
                    style={{ flex: 1, minWidth: 160 }}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[listItemName, 'metadata', 'author']}
                    label={t('adminDeploymentPreset.modelDef.Author')}
                    style={{ flex: 1, minWidth: 160 }}
                  >
                    <Input />
                  </Form.Item>
                </BAIFlex>
                <BAIFlex gap="md" wrap="wrap">
                  <Form.Item
                    {...restField}
                    name={[listItemName, 'metadata', 'version']}
                    label={t('adminDeploymentPreset.modelDef.Version')}
                    style={{ flex: 1, minWidth: 120 }}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[listItemName, 'metadata', 'license']}
                    label={t('adminDeploymentPreset.modelDef.License')}
                    style={{ flex: 1, minWidth: 120 }}
                  >
                    <Input />
                  </Form.Item>
                </BAIFlex>
                <Form.Item
                  {...restField}
                  name={[listItemName, 'metadata', 'description']}
                  label={t('adminDeploymentPreset.modelDef.Description')}
                >
                  <Input.TextArea rows={2} />
                </Form.Item>
                <BAIFlex gap="md" wrap="wrap">
                  <Form.Item
                    {...restField}
                    name={[listItemName, 'metadata', 'task']}
                    label={t('adminDeploymentPreset.modelDef.Task')}
                    style={{ flex: 1, minWidth: 120 }}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[listItemName, 'metadata', 'category']}
                    label={t('adminDeploymentPreset.modelDef.Category')}
                    style={{ flex: 1, minWidth: 120 }}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[listItemName, 'metadata', 'architecture']}
                    label={t('adminDeploymentPreset.modelDef.Architecture')}
                    style={{ flex: 1, minWidth: 120 }}
                  >
                    <Input />
                  </Form.Item>
                </BAIFlex>
                <BAIFlex gap="md" wrap="wrap">
                  <Form.Item
                    {...restField}
                    name={[listItemName, 'metadata', 'framework']}
                    label={t('adminDeploymentPreset.modelDef.Framework')}
                    style={{ flex: 1, minWidth: 160 }}
                  >
                    <Select
                      mode="tags"
                      tokenSeparators={[',']}
                      placeholder={t(
                        'adminDeploymentPreset.modelDef.FrameworkPlaceholder',
                      )}
                      style={{ width: '100%' }}
                      allowClear
                    />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[listItemName, 'metadata', 'label']}
                    label={t('adminDeploymentPreset.modelDef.Label')}
                    style={{ flex: 1, minWidth: 160 }}
                  >
                    <Select
                      mode="tags"
                      tokenSeparators={[',']}
                      placeholder={t(
                        'adminDeploymentPreset.modelDef.LabelPlaceholder',
                      )}
                      style={{ width: '100%' }}
                      allowClear
                    />
                  </Form.Item>
                </BAIFlex>
              </BAIFlex>
            ),
          },
        ]}
      />
    </BAIFlex>
  );
};

export default ModelConfigItem;
