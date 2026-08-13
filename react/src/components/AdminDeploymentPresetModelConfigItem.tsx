/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Form } from '../form-engine';
import type { FormInstance } from '../form-engine';
import { theme } from '../theme-shim';
import BAIFormItem from './BAIFormItem';
import {
  AstryxFormCheckbox,
  AstryxFormNumberInput,
  AstryxFormTagsInput,
  AstryxFormTextArea,
  AstryxFormTextInput,
} from './astryxFormControls';
import { Collapsible } from '@astryxdesign/core/Collapsible';
import { BAIButton, BAICard, BAIFlex } from 'backend.ai-ui';
import { CircleMinus, PlusIcon } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

// ---------------------------------------------------------------------------
// TagsField — the shared `AstryxFormTagsInput` under the name this file's two
// call sites already use. It replaced a local Tokenizer bridge that was the
// same component minus `tokenSeparators`, which antd had on both fields
// (`tokenSeparators={[',']}`) and which the adapter restores.
// ---------------------------------------------------------------------------

const TagsField: React.FC<{
  /** Injected by `Form.Item`. */
  value?: string[];
  /** Injected by `Form.Item`. */
  onChange?: (value: string[]) => void;
  /** Accessible name (visually hidden — BAIFormItem renders the visible one). */
  label: string;
  placeholder?: string;
}> = ({ value, onChange, label, placeholder }) => {
  'use memo';
  return (
    <AstryxFormTagsInput
      label={label}
      value={value}
      onChange={onChange}
      hasClear
      tokenSeparators={[',']}
      placeholder={placeholder}
    />
  );
};

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
        <BAIFormItem
          {...restField}
          name={[listItemName, 'name']}
          label={t('adminDeploymentPreset.modelDef.ModelName')}
          style={{ flex: 1, minWidth: 160 }}
          rules={[{ required: true }]}
        >
          <AstryxFormTextInput
            label={t('adminDeploymentPreset.modelDef.ModelName')}
            placeholder={t(
              'adminDeploymentPreset.modelDef.ModelNamePlaceholder',
            )}
          />
        </BAIFormItem>
        <BAIFormItem
          {...restField}
          name={[listItemName, 'modelPath']}
          label={t('adminDeploymentPreset.modelDef.ModelPath')}
          style={{ flex: 2, minWidth: 200 }}
          rules={[{ required: true }]}
        >
          <AstryxFormTextInput
            label={t('adminDeploymentPreset.modelDef.ModelPath')}
            placeholder={t(
              'adminDeploymentPreset.modelDef.ModelPathPlaceholder',
            )}
          />
        </BAIFormItem>
      </BAIFlex>

      <BAICard
        type="inner"
        title={t('adminDeploymentPreset.modelDef.EnableService')}
        style={{ marginTop: token.marginSM }}
        showDivider
      >
        <BAIFlex direction="column" align="stretch" gap="xs">
          {/*
            `shell` is intentionally not exposed here. It only affects the
            deprecated single-string `command` path; this form always submits
            the list `startCommand`, on which the backend silently ignores
            `shell` (see `_wrap_str_start_command_into_argv`). Showing a field
            that is a no-op in this flow — and whose value otherwise defaults to
            `/bin/bash` — is more confusing than helpful, so it stays hidden
            until the shell/command UX is decided. Any existing value still
            round-trips on edit via `form.getFieldsValue(true)`. (FR-3221)
          */}
          <BAIFormItem
            {...restField}
            name={[listItemName, 'service', 'port']}
            label={t('adminDeploymentPreset.modelDef.Port')}
            rules={[{ required: true }]}
          >
            <AstryxFormNumberInput
              label={t('adminDeploymentPreset.modelDef.Port')}
              // Backend `PresetModelServiceConfigInput.port` is `gt=1`
              // (exclusive), so the lowest accepted port is 2.
              min={2}
              max={65535}
              placeholder={t('general.Example', { value: '8080' })}
            />
          </BAIFormItem>
          <BAIFormItem
            {...restField}
            name={[listItemName, 'service', 'startCommand']}
            label={t('adminDeploymentPreset.modelDef.StartCommand')}
            tooltip={t('modelService.StartCommandTooltip')}
            extra={t('modelService.StartCommandHelperShell')}
            rules={[{ required: true }]}
          >
            <AstryxFormTextInput
              label={t('adminDeploymentPreset.modelDef.StartCommand')}
              placeholder={t(
                'adminDeploymentPreset.modelDef.StartCommandPlaceholder',
              )}
            />
          </BAIFormItem>

          <BAIFormItem
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
                      <BAIFormItem
                        {...rest}
                        name={[name, 'action']}
                        style={{ marginBottom: 0, flex: 1 }}
                        rules={[{ required: true, message: '' }]}
                      >
                        <AstryxFormTextInput
                          label={t('adminDeploymentPreset.modelDef.Action')}
                          placeholder={t(
                            'adminDeploymentPreset.modelDef.ActionPlaceholder',
                          )}
                        />
                      </BAIFormItem>
                      <BAIFormItem
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
                        <AstryxFormTextInput
                          label={t('adminDeploymentPreset.modelDef.Args')}
                          placeholder={t('general.Example', { value: '{}' })}
                        />
                      </BAIFormItem>
                      <CircleMinus size="1em" onClick={() => remove(name)} />
                    </BAIFlex>
                  ))}
                  <BAIFormItem noStyle>
                    <BAIButton
                      type="dashed"
                      onClick={() => add({ action: '', args: '{}' })}
                      icon={<PlusIcon />}
                      block
                    >
                      {t('adminDeploymentPreset.modelDef.AddPreStartAction')}
                    </BAIButton>
                  </BAIFormItem>
                </BAIFlex>
              )}
            </Form.List>
          </BAIFormItem>

          <BAIFormItem
            {...restField}
            name={[listItemName, 'service', 'enableHealthCheck']}
            valuePropName="checked"
            style={{ marginTop: token.marginXS, marginBottom: 0 }}
          >
            <AstryxFormCheckbox
              label={t('adminDeploymentPreset.modelDef.EnableHealthCheck')}
            />
          </BAIFormItem>

          <BAIFormItem
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
            {(formArg) =>
              (formArg as FormInstance).getFieldValue([
                'modelDefinition',
                'models',
                listItemName,
                'service',
                'enableHealthCheck',
              ]) ? (
                <BAIFlex direction="column" align="stretch" gap="xs">
                  <BAIFormItem
                    {...restField}
                    name={[listItemName, 'service', 'healthCheck', 'path']}
                    label={t('adminDeploymentPreset.modelDef.HealthCheckPath')}
                    tooltip={t('modelService.HealthCheckTooltip')}
                    rules={[{ required: true }]}
                  >
                    <AstryxFormTextInput
                      label={t(
                        'adminDeploymentPreset.modelDef.HealthCheckPath',
                      )}
                      placeholder={t('general.Example', { value: '/health' })}
                    />
                  </BAIFormItem>
                  <BAIFlex gap="md" wrap="wrap" align="end">
                    <BAIFormItem
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
                      <AstryxFormNumberInput
                        label={t(
                          'adminDeploymentPreset.modelDef.HealthCheckInterval',
                        )}
                        min={1}
                        placeholder={t('general.Example', { value: '10' })}
                        units={t('time.Sec')}
                      />
                    </BAIFormItem>
                    <BAIFormItem
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
                      <AstryxFormNumberInput
                        label={t(
                          'adminDeploymentPreset.modelDef.HealthCheckMaxRetries',
                        )}
                        min={1}
                        placeholder={t('general.Example', { value: '10' })}
                      />
                    </BAIFormItem>
                    <BAIFormItem
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
                      <AstryxFormNumberInput
                        label={t(
                          'adminDeploymentPreset.modelDef.HealthCheckMaxWaitTime',
                        )}
                        min={1}
                        placeholder={t('general.Example', { value: '15' })}
                        units={t('time.Sec')}
                      />
                    </BAIFormItem>
                  </BAIFlex>
                  <BAIFlex gap="md" wrap="wrap" align="end">
                    <BAIFormItem
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
                      <AstryxFormNumberInput
                        label={t(
                          'adminDeploymentPreset.modelDef.HealthCheckExpectedStatus',
                        )}
                        // Backend `expected_status_code` is `gt=100`
                        // (exclusive), so the lowest accepted code is 101.
                        min={101}
                        max={599}
                        placeholder={t('general.Example', { value: '200' })}
                      />
                    </BAIFormItem>
                    <BAIFormItem
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
                      <AstryxFormNumberInput
                        label={t(
                          'adminDeploymentPreset.modelDef.HealthCheckInitialDelay',
                        )}
                        min={0}
                        placeholder={t('general.Example', { value: '60' })}
                        units={t('time.Sec')}
                      />
                    </BAIFormItem>
                    <div style={{ flex: 1, minWidth: 160 }} />
                  </BAIFlex>
                </BAIFlex>
              ) : null
            }
          </BAIFormItem>
        </BAIFlex>
      </BAICard>

      {/* PILOT-DECISION: antd Collapse (items API) → Astryx Collapsible.
          `label`→`trigger`, `defaultActiveKey={['metadata']}`→`defaultIsOpen`;
          the single-panel accordion frame (bordered antd panel chrome) is
          replaced by Collapsible's flat default. */}
      <Collapsible
        trigger={t('adminDeploymentPreset.modelDef.EnableMetadata')}
        defaultIsOpen
        style={{ marginTop: token.marginSM }}
      >
        <BAIFlex direction="column" align="stretch" gap="xs">
          <BAIFlex gap="md" wrap="wrap">
            <BAIFormItem
              {...restField}
              name={[listItemName, 'metadata', 'title']}
              label={t('adminDeploymentPreset.modelDef.Title')}
              style={{ flex: 1, minWidth: 160 }}
            >
              <AstryxFormTextInput
                label={t('adminDeploymentPreset.modelDef.Title')}
              />
            </BAIFormItem>
            <BAIFormItem
              {...restField}
              name={[listItemName, 'metadata', 'author']}
              label={t('adminDeploymentPreset.modelDef.Author')}
              style={{ flex: 1, minWidth: 160 }}
            >
              <AstryxFormTextInput
                label={t('adminDeploymentPreset.modelDef.Author')}
              />
            </BAIFormItem>
          </BAIFlex>
          <BAIFlex gap="md" wrap="wrap">
            <BAIFormItem
              {...restField}
              name={[listItemName, 'metadata', 'version']}
              label={t('adminDeploymentPreset.modelDef.Version')}
              style={{ flex: 1, minWidth: 120 }}
            >
              <AstryxFormTextInput
                label={t('adminDeploymentPreset.modelDef.Version')}
              />
            </BAIFormItem>
            <BAIFormItem
              {...restField}
              name={[listItemName, 'metadata', 'license']}
              label={t('adminDeploymentPreset.modelDef.License')}
              style={{ flex: 1, minWidth: 120 }}
            >
              <AstryxFormTextInput
                label={t('adminDeploymentPreset.modelDef.License')}
              />
            </BAIFormItem>
          </BAIFlex>
          <BAIFormItem
            {...restField}
            name={[listItemName, 'metadata', 'description']}
            label={t('adminDeploymentPreset.modelDef.Description')}
          >
            <AstryxFormTextArea
              label={t('adminDeploymentPreset.modelDef.Description')}
              rows={2}
            />
          </BAIFormItem>
          <BAIFlex gap="md" wrap="wrap">
            <BAIFormItem
              {...restField}
              name={[listItemName, 'metadata', 'task']}
              label={t('adminDeploymentPreset.modelDef.Task')}
              style={{ flex: 1, minWidth: 120 }}
            >
              <AstryxFormTextInput
                label={t('adminDeploymentPreset.modelDef.Task')}
              />
            </BAIFormItem>
            <BAIFormItem
              {...restField}
              name={[listItemName, 'metadata', 'category']}
              label={t('adminDeploymentPreset.modelDef.Category')}
              style={{ flex: 1, minWidth: 120 }}
            >
              <AstryxFormTextInput
                label={t('adminDeploymentPreset.modelDef.Category')}
              />
            </BAIFormItem>
            <BAIFormItem
              {...restField}
              name={[listItemName, 'metadata', 'architecture']}
              label={t('adminDeploymentPreset.modelDef.Architecture')}
              style={{ flex: 1, minWidth: 120 }}
            >
              <AstryxFormTextInput
                label={t('adminDeploymentPreset.modelDef.Architecture')}
              />
            </BAIFormItem>
          </BAIFlex>
          <BAIFlex gap="md" wrap="wrap">
            <BAIFormItem
              {...restField}
              name={[listItemName, 'metadata', 'framework']}
              label={t('adminDeploymentPreset.modelDef.Framework')}
              style={{ flex: 1, minWidth: 160 }}
            >
              <TagsField
                label={t('adminDeploymentPreset.modelDef.Framework')}
                placeholder={t(
                  'adminDeploymentPreset.modelDef.FrameworkPlaceholder',
                )}
              />
            </BAIFormItem>
            <BAIFormItem
              {...restField}
              name={[listItemName, 'metadata', 'label']}
              label={t('adminDeploymentPreset.modelDef.Label')}
              style={{ flex: 1, minWidth: 160 }}
            >
              <TagsField
                label={t('adminDeploymentPreset.modelDef.Label')}
                placeholder={t(
                  'adminDeploymentPreset.modelDef.LabelPlaceholder',
                )}
              />
            </BAIFormItem>
          </BAIFlex>
        </BAIFlex>
      </Collapsible>
    </BAIFlex>
  );
};

export default ModelConfigItem;
