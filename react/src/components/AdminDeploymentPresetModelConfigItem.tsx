/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { MinusCircleOutlined } from '@ant-design/icons';
import {
  Checkbox,
  Collapse,
  Form,
  Input,
  InputNumber,
  Select,
  theme,
} from 'antd';
import { BAIButton, BAICard, BAIFlex } from 'backend.ai-ui';
import { PlusIcon } from 'lucide-react';
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

      <BAICard
        type="inner"
        title={t('adminDeploymentPreset.modelDef.EnableService')}
        style={{ marginTop: token.marginSM }}
        showDivider
      >
        <BAIFlex direction="column" align="stretch" gap="xs">
          <BAIFlex gap="md" wrap="wrap">
            <Form.Item
              {...restField}
              name={[listItemName, 'service', 'port']}
              label={t('adminDeploymentPreset.modelDef.Port')}
              style={{ flex: 1, minWidth: 100 }}
              rules={[{ required: true }]}
            >
              <InputNumber
                // Backend `PresetModelServiceConfigInput.port` is `gt=1`
                // (exclusive), so the lowest accepted port is 2.
                min={2}
                max={65535}
                style={{ width: '100%' }}
                placeholder={t('general.Example', { value: '8080' })}
              />
            </Form.Item>
            <Form.Item
              {...restField}
              name={[listItemName, 'service', 'shell']}
              label={t('adminDeploymentPreset.modelDef.Shell')}
              style={{ flex: 2, minWidth: 160 }}
            >
              <Input
                placeholder={t('general.Example', { value: '/bin/bash' })}
              />
            </Form.Item>
          </BAIFlex>
          <Form.Item
            {...restField}
            name={[listItemName, 'service', 'startCommand']}
            label={t('adminDeploymentPreset.modelDef.StartCommand')}
            tooltip={t('modelService.StartCommandTooltip')}
            extra={t('modelService.StartCommandHelperShell')}
            rules={[{ required: true }]}
          >
            <Input
              placeholder={t(
                'adminDeploymentPreset.modelDef.StartCommandPlaceholder',
              )}
            />
          </Form.Item>

          <Form.Item
            label={t('adminDeploymentPreset.modelDef.PreStartActions')}
            style={{ marginBottom: 0 }}
          >
            <Form.List name={[listItemName, 'service', 'preStartActions']}>
              {(fields, { add, remove }) => (
                <BAIFlex direction="column" gap="xs" align="stretch">
                  {fields.map(({ key, name, ...rest }) => (
                    <BAIFlex
                      key={key}
                      direction="row"
                      align="baseline"
                      gap="xs"
                    >
                      <Form.Item
                        {...rest}
                        name={[name, 'action']}
                        style={{ marginBottom: 0, flex: 1 }}
                        rules={[{ required: true, message: '' }]}
                      >
                        <Input
                          placeholder={t(
                            'adminDeploymentPreset.modelDef.ActionPlaceholder',
                          )}
                        />
                      </Form.Item>
                      <Form.Item
                        {...rest}
                        name={[name, 'args']}
                        style={{ marginBottom: 0, flex: 2 }}
                        rules={[
                          { required: true, message: '' },
                          {
                            validator: async (_, v) => {
                              if (!v) return;
                              try {
                                JSON.parse(v);
                              } catch {
                                return Promise.reject('');
                              }
                            },
                          },
                        ]}
                      >
                        <Input
                          placeholder={t('general.Example', { value: '{}' })}
                        />
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(name)} />
                    </BAIFlex>
                  ))}
                  <Form.Item noStyle>
                    <BAIButton
                      type="dashed"
                      onClick={() => add({ action: '', args: '{}' })}
                      icon={<PlusIcon />}
                      block
                    >
                      {t('adminDeploymentPreset.modelDef.AddPreStartAction')}
                    </BAIButton>
                  </Form.Item>
                </BAIFlex>
              )}
            </Form.List>
          </Form.Item>

          <Form.Item
            {...restField}
            name={[listItemName, 'service', 'enableHealthCheck']}
            valuePropName="checked"
            style={{ marginTop: token.marginXS, marginBottom: 0 }}
          >
            <Checkbox>
              {t('adminDeploymentPreset.modelDef.EnableHealthCheck')}
            </Checkbox>
          </Form.Item>

          <Form.Item
            noStyle
            dependencies={[
              [
                'modelDefinition',
                'models',
                listItemName,
                'service',
                'enableHealthCheck',
              ],
            ]}
          >
            {({ getFieldValue }) =>
              getFieldValue([
                'modelDefinition',
                'models',
                listItemName,
                'service',
                'enableHealthCheck',
              ]) ? (
                <BAIFlex direction="column" align="stretch" gap="xs">
                  <Form.Item
                    {...restField}
                    name={[listItemName, 'service', 'healthCheck', 'path']}
                    label={t('adminDeploymentPreset.modelDef.HealthCheckPath')}
                    tooltip={t('modelService.HealthCheckTooltip')}
                    rules={[{ required: true }]}
                  >
                    <Input
                      placeholder={t('general.Example', { value: '/health' })}
                    />
                  </Form.Item>
                  <BAIFlex gap="md" wrap="wrap" align="end">
                    <Form.Item
                      {...restField}
                      name={[
                        listItemName,
                        'service',
                        'healthCheck',
                        'interval',
                      ]}
                      label={t(
                        'adminDeploymentPreset.modelDef.HealthCheckInterval',
                      )}
                      tooltip={t('modelService.IntervalTooltip')}
                      style={{ flex: 1, minWidth: 160 }}
                      rules={[{ required: true }]}
                    >
                      <InputNumber
                        min={1}
                        placeholder={t('general.Example', { value: '10' })}
                        suffix={t('time.Sec')}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[
                        listItemName,
                        'service',
                        'healthCheck',
                        'maxRetries',
                      ]}
                      label={t(
                        'adminDeploymentPreset.modelDef.HealthCheckMaxRetries',
                      )}
                      tooltip={t('modelService.MaxRetriesTooltip')}
                      style={{ flex: 1, minWidth: 160 }}
                      rules={[{ required: true }]}
                    >
                      <InputNumber
                        min={1}
                        placeholder={t('general.Example', { value: '10' })}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[
                        listItemName,
                        'service',
                        'healthCheck',
                        'maxWaitTime',
                      ]}
                      label={t(
                        'adminDeploymentPreset.modelDef.HealthCheckMaxWaitTime',
                      )}
                      tooltip={t('modelService.MaxWaitTimeTooltip')}
                      style={{ flex: 1, minWidth: 160 }}
                      rules={[{ required: true }]}
                    >
                      <InputNumber
                        min={1}
                        placeholder={t('general.Example', { value: '15' })}
                        suffix={t('time.Sec')}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </BAIFlex>
                  <BAIFlex gap="md" wrap="wrap" align="end">
                    <Form.Item
                      {...restField}
                      name={[
                        listItemName,
                        'service',
                        'healthCheck',
                        'expectedStatusCode',
                      ]}
                      label={t(
                        'adminDeploymentPreset.modelDef.HealthCheckExpectedStatus',
                      )}
                      tooltip={t('modelService.ExpectedStatusTooltip')}
                      style={{ flex: 1, minWidth: 160 }}
                      rules={[{ required: true }]}
                    >
                      <InputNumber
                        // Backend `expected_status_code` is `gt=100`
                        // (exclusive), so the lowest accepted code is 101.
                        min={101}
                        max={599}
                        placeholder={t('general.Example', { value: '200' })}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[
                        listItemName,
                        'service',
                        'healthCheck',
                        'initialDelay',
                      ]}
                      label={t(
                        'adminDeploymentPreset.modelDef.HealthCheckInitialDelay',
                      )}
                      tooltip={t('modelService.InitialDelayTooltip')}
                      style={{ flex: 1, minWidth: 160 }}
                      rules={[{ required: true }]}
                    >
                      <InputNumber
                        min={0}
                        placeholder={t('general.Example', { value: '60' })}
                        suffix={t('time.Sec')}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                    <div style={{ flex: 1, minWidth: 160 }} />
                  </BAIFlex>
                </BAIFlex>
              ) : null
            }
          </Form.Item>
        </BAIFlex>
      </BAICard>

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
