/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '../hooks';
import type { AdminDeploymentPresetFormValue } from './AdminDeploymentPresetFormTypes';
import { MinusCircleOutlined } from '@ant-design/icons';
import { useToggle } from 'ahooks';
import {
  Checkbox,
  Collapse,
  Form,
  Input,
  InputNumber,
  Select,
  theme,
} from 'antd';
import type { FormInstance } from 'antd';
import { BAIButton, BAICard, BAIFlex } from 'backend.ai-ui';
import { PlusIcon } from 'lucide-react';
import React, { useEffect, useEffectEvent } from 'react';
import { useTranslation } from 'react-i18next';

// ---------------------------------------------------------------------------
// ModelConfigItem — one model entry card in the modelDefinition Form.List
// ---------------------------------------------------------------------------

const ModelConfigItem: React.FC<{
  listItemName: number;
  restField: object;
  onRemove: () => void;
}> = ({ listItemName, restField, onRemove }) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const form = Form.useFormInstance<AdminDeploymentPresetFormValue>();
  const baiClient = useSuspendedBackendaiClient();

  // Before 26.4.4rc7 the backend requires the health-check fields; on
  // 26.4.4rc7+ they are optional and the server seeds defaults (FR-3056),
  // so the fields are only enforced as required on older managers.
  const isHealthCheckFieldRequired = !baiClient.supports(
    'model-health-check-enable',
  );

  // Pass `form` explicitly so useWatch subscribes to the store even without a
  // registered Form.Item for these boolean flags.
  const formEnableMetadata = Form.useWatch(
    ['modelDefinition', 'models', listItemName, 'enableMetadata'],
    form,
  );
  const enableHealthCheck = Form.useWatch(
    ['modelDefinition', 'models', listItemName, 'service', 'enableHealthCheck'],
    form,
  );

  // Configure Service is collapsible and collapsed by default for a new model;
  // in edit mode it syncs open from `enableService` (set via Form initialValues
  // before mount). The expanded state drives the gating flag the submit
  // transform reads (collapsed = service excluded). `enableService` is a
  // setFieldValue-only flag, not a registered Form.Item — see
  // AdminDeploymentPresetSettingPageContent.
  const formEnableService = Form.useWatch(
    ['modelDefinition', 'models', listItemName, 'enableService'],
    form,
  );
  const [serviceOpen, { set: setServiceOpen }] = useToggle<boolean>(
    !!(form as FormInstance).getFieldValue([
      'modelDefinition',
      'models',
      listItemName,
      'enableService',
    ]),
  );
  const onSyncService = useEffectEvent(() =>
    setServiceOpen(!!formEnableService),
  );
  useEffect(() => {
    onSyncService();
  }, [formEnableService]);

  const onServicePanelChange = (keys: string | string[]) => {
    const open = (Array.isArray(keys) ? keys : [keys]).includes('service');
    setServiceOpen(open);
    (form as FormInstance).setFieldValue(
      ['modelDefinition', 'models', listItemName, 'enableService'],
      open,
    );
  };

  // Initialise from the form store so that edit-mode values (set via Form
  // initialValues before this component mounts) are visible on the first render,
  // rather than waiting for the formEnableMetadata watcher to fire.
  const [metadataOpen, { set: setMetadataOpen }] = useToggle<boolean>(
    !!(form as FormInstance).getFieldValue([
      'modelDefinition',
      'models',
      listItemName,
      'enableMetadata',
    ]),
  );

  // Sync form store → local open state when the form is (re-)initialised (edit mode).
  const onSyncMetadata = useEffectEvent(() =>
    setMetadataOpen(!!formEnableMetadata),
  );
  useEffect(() => {
    onSyncMetadata();
  }, [formEnableMetadata]);

  const onMetadataPanelChange = (keys: string | string[]) => {
    const open = (Array.isArray(keys) ? keys : [keys]).includes('metadata');
    setMetadataOpen(open);
    (form as FormInstance).setFieldValue(
      ['modelDefinition', 'models', listItemName, 'enableMetadata'],
      open,
    );
  };

  return (
    <BAIFlex direction="row" align="start" gap="xs">
      <BAICard size="small" style={{ flex: 1 }}>
        {/* ── Name + Path ── */}
        <BAIFlex gap="md" wrap="wrap">
          <Form.Item
            {...restField}
            name={[listItemName, 'name']}
            label={t('adminDeploymentPreset.modelDef.ModelName')}
            style={{ flex: 1, minWidth: 160 }}
            rules={[{ required: true, message: '' }]}
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
            rules={[{ required: true, message: '' }]}
          >
            <Input
              placeholder={t(
                'adminDeploymentPreset.modelDef.ModelPathPlaceholder',
              )}
            />
          </Form.Item>
        </BAIFlex>

        {/* ── Configure Service (collapsible, collapsed by default) ── */}
        <Collapse
          style={{ marginTop: token.marginSM }}
          activeKey={serviceOpen ? ['service'] : []}
          onChange={onServicePanelChange}
          items={[
            {
              key: 'service',
              label: t('adminDeploymentPreset.modelDef.EnableService'),
              children: (
                <BAIFlex direction="column" align="stretch" gap="xs">
                  <BAIFlex gap="md" wrap="wrap">
                    <Form.Item
                      {...restField}
                      name={[listItemName, 'service', 'port']}
                      label={t('adminDeploymentPreset.modelDef.Port')}
                      style={{ flex: 1, minWidth: 100 }}
                      rules={[{ required: true, message: '' }]}
                    >
                      <InputNumber
                        min={1}
                        max={65535}
                        style={{ width: '100%' }}
                        placeholder="8080"
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[listItemName, 'service', 'shell']}
                      label={t('adminDeploymentPreset.modelDef.Shell')}
                      style={{ flex: 2, minWidth: 160 }}
                    >
                      <Input placeholder="/bin/bash" />
                    </Form.Item>
                  </BAIFlex>
                  <Form.Item
                    {...restField}
                    name={[listItemName, 'service', 'startCommand']}
                    label={t('adminDeploymentPreset.modelDef.StartCommand')}
                  >
                    <Input
                      placeholder={t(
                        'adminDeploymentPreset.modelDef.StartCommandPlaceholder',
                      )}
                    />
                  </Form.Item>

                  {/* Pre-start actions */}
                  <Form.Item
                    label={t('adminDeploymentPreset.modelDef.PreStartActions')}
                    style={{ marginBottom: 0 }}
                  >
                    <Form.List
                      name={[listItemName, 'service', 'preStartActions']}
                    >
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
                                <Input placeholder="{}" />
                              </Form.Item>
                              <MinusCircleOutlined
                                onClick={() => remove(name)}
                              />
                            </BAIFlex>
                          ))}
                          <Form.Item noStyle>
                            <BAIButton
                              type="dashed"
                              onClick={() => add({ action: '', args: '{}' })}
                              icon={<PlusIcon />}
                              block
                            >
                              {t(
                                'adminDeploymentPreset.modelDef.AddPreStartAction',
                              )}
                            </BAIButton>
                          </Form.Item>
                        </BAIFlex>
                      )}
                    </Form.List>
                  </Form.Item>

                  {/* Health check */}
                  <Form.Item
                    {...restField}
                    name={[listItemName, 'service', 'enableHealthCheck']}
                    valuePropName="checked"
                    style={{
                      marginTop: token.marginXS,
                      marginBottom: enableHealthCheck ? token.marginSM : 0,
                    }}
                  >
                    <Checkbox>
                      {t('adminDeploymentPreset.modelDef.EnableHealthCheck')}
                    </Checkbox>
                  </Form.Item>

                  {enableHealthCheck && (
                    <BAIFlex direction="column" align="stretch" gap="xs">
                      <Form.Item
                        {...restField}
                        name={[listItemName, 'service', 'healthCheck', 'path']}
                        label={t(
                          'adminDeploymentPreset.modelDef.HealthCheckPath',
                        )}
                        rules={[
                          { required: isHealthCheckFieldRequired, message: '' },
                        ]}
                      >
                        <Input placeholder="/health" />
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
                          rules={[{ required: isHealthCheckFieldRequired }]}
                          style={{ flex: 1, minWidth: 160 }}
                        >
                          <InputNumber
                            min={1}
                            placeholder="10"
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
                          rules={[{ required: isHealthCheckFieldRequired }]}
                          style={{ flex: 1, minWidth: 160 }}
                        >
                          <InputNumber
                            min={1}
                            placeholder="10"
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
                          rules={[{ required: isHealthCheckFieldRequired }]}
                          style={{ flex: 1, minWidth: 160 }}
                        >
                          <InputNumber
                            min={1}
                            placeholder="15"
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
                          rules={[{ required: isHealthCheckFieldRequired }]}
                          style={{ flex: 1, minWidth: 160 }}
                        >
                          <InputNumber
                            min={100}
                            max={599}
                            placeholder="200"
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
                          rules={[{ required: isHealthCheckFieldRequired }]}
                          style={{ flex: 1, minWidth: 160 }}
                        >
                          <InputNumber
                            min={0}
                            placeholder="60"
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                        <div style={{ flex: 1, minWidth: 160 }} />
                      </BAIFlex>
                    </BAIFlex>
                  )}
                </BAIFlex>
              ),
            },
          ]}
        />

        {/* ── Add Metadata (collapsible) ── */}
        <Collapse
          style={{ marginTop: token.marginSM }}
          activeKey={metadataOpen ? ['metadata'] : []}
          onChange={onMetadataPanelChange}
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
      </BAICard>
      <MinusCircleOutlined
        style={{ cursor: 'pointer', paddingTop: token.paddingSM }}
        onClick={onRemove}
      />
    </BAIFlex>
  );
};

export default ModelConfigItem;
