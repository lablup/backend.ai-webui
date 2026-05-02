/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { AdminDeploymentPresetSettingPageContentImageQuery } from '../__generated__/AdminDeploymentPresetSettingPageContentImageQuery.graphql';
import type { AdminDeploymentPresetSettingPageContent_preset$key } from '../__generated__/AdminDeploymentPresetSettingPageContent_preset.graphql';
import EnvVarFormList from '../components/EnvVarFormList';
import SourceCodeView from '../components/SourceCodeView';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import { ResourceNumbersOfSession } from '../pages/SessionLauncherPage';
import {
  DoubleRightOutlined,
  DownOutlined,
  LeftOutlined,
  MinusCircleOutlined,
  PlusOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { useDebounceFn, useToggle } from 'ahooks';
import {
  AutoComplete,
  Button,
  Checkbox,
  Descriptions,
  Form,
  Grid,
  Input,
  InputNumber,
  Select,
  Space,
  Steps,
  Tag,
  Tour,
  Typography,
  theme,
} from 'antd';
import type { FormInstance, StepsProps, TourProps } from 'antd';
import {
  BAIAdminImageSelect,
  BAIButton,
  BAICard,
  BAIDynamicUnitInputNumber,
  BAIFlex,
  toLocalId,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { parseAsJson, parseAsStringLiteral, useQueryStates } from 'nuqs';
import React, {
  Suspense,
  useEffect,
  useEffectEvent,
  useMemo,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

// ---------------------------------------------------------------------------
// Step keys (URL-synced)
// ---------------------------------------------------------------------------

const STEP_KEYS = ['basic', 'model', 'review'] as const;
type StepKey = (typeof STEP_KEYS)[number];

// ---------------------------------------------------------------------------
// Form value type
// ---------------------------------------------------------------------------

export type ModelHealthCheckFormValue = {
  path: string;
  interval?: number;
  maxRetries?: number;
  maxWaitTime?: number;
  expectedStatusCode?: number;
  initialDelay?: number;
};

export type PreStartActionFormValue = {
  action: string;
  args: string; // JSON string
};

export type ModelServiceFormValue = {
  port?: number;
  shell?: string;
  startCommand?: string;
  preStartActions?: PreStartActionFormValue[];
  enableHealthCheck?: boolean;
  healthCheck?: ModelHealthCheckFormValue;
};

export type ModelMetadataFormValue = {
  author?: string;
  title?: string;
  version?: string;
  description?: string;
  task?: string;
  category?: string;
  architecture?: string;
  framework?: string[];
  label?: string[];
  license?: string;
};

export type ModelConfigFormValue = {
  name: string;
  modelPath: string;
  enableService?: boolean;
  service?: ModelServiceFormValue;
  enableMetadata?: boolean;
  metadata?: ModelMetadataFormValue;
};

export type ModelDefinitionFormValue = {
  models?: ModelConfigFormValue[];
};

export type AdminDeploymentPresetFormValue = {
  name: string;
  description?: string;
  /** UUID of the selected runtime variant (create mode only — read-only in edit). */
  runtimeVariantId: string;
  /** UUID of the selected image. */
  imageId: string;
  /** Required CPU allocation (e.g. "4"). */
  cpu: string;
  /** Required memory allocation (e.g. "16"). */
  mem: string;
  clusterMode?: 'SINGLE_NODE' | 'MULTI_NODE';
  clusterSize?: number;
  startupCommand?: string;
  bootstrapScript?: string;
  environ?: Array<{ variable: string; value: string }>;
  resourceSlots?: Array<{ resourceType: string; quantity: string }>;
  resourceOpts?: Array<{ name: string; value: string }>;
  modelDefinition?: ModelDefinitionFormValue;
  openToPublic?: boolean;
  replicaCount?: number;
  revisionHistoryLimit?: number;
};

// ---------------------------------------------------------------------------
// Component props
// ---------------------------------------------------------------------------

export type ResourceSlotTypeInfo = {
  id: string;
  slotName: string;
  slotType: string;
  displayName: string;
  displayUnit: string;
  numberFormat?: {
    binary: boolean;
    roundLength: number;
  } | null;
};

export interface AdminDeploymentPresetSettingPageContentProps {
  mode: 'create' | 'edit';
  form: FormInstance<AdminDeploymentPresetFormValue>;
  presetFrgmt?: AdminDeploymentPresetSettingPageContent_preset$key | null;
  /** Runtime variants fetched by the parent page layout. */
  runtimeVariants?: ReadonlyArray<{ id: string; name: string }>;
  /** Resource slot type definitions for dynamic slot key selector. */
  resourceSlotTypes?: ReadonlyArray<ResourceSlotTypeInfo>;
  onCancel?: () => void;
  onSubmit?: () => Promise<void>;
  isSubmitting?: boolean;
}

// ---------------------------------------------------------------------------
// ImageSelectField — thin Suspense wrapper around BAIAdminImageSelect
// ---------------------------------------------------------------------------

const ImageSelectField: React.FC<{
  value?: string;
  onChange?: (value: string) => void;
}> = ({ value, onChange }) => {
  'use memo';
  const { t } = useTranslation();
  return (
    <Suspense fallback={<Select disabled placeholder={t('general.Loading')} />}>
      <BAIAdminImageSelect value={value} onChange={onChange} />
    </Suspense>
  );
};

// ---------------------------------------------------------------------------
// InputNumberWithUnit — InputNumber in Space.Compact with an addon unit.
// Form.Item injects value/onChange into this component directly.
// ---------------------------------------------------------------------------

const InputNumberWithUnit: React.FC<
  React.ComponentProps<typeof InputNumber> & { unit?: string }
> = ({ unit, ...props }) => {
  'use memo';
  if (!unit) return <InputNumber {...props} />;
  return (
    <Space.Compact block style={{ display: 'flex' }}>
      <InputNumber {...props} style={{ width: '100%', ...props.style }} />
      <Space.Addon>{unit}</Space.Addon>
    </Space.Compact>
  );
};

// ---------------------------------------------------------------------------
// ResourceSlotRow — one row in the resourceSlots Form.List
// Selects slot type from a dropdown and renders quantity input dynamically.
// ---------------------------------------------------------------------------

const ResourceSlotRow: React.FC<{
  listItemName: number;
  restField: object;
  resourceSlotTypes: ReadonlyArray<ResourceSlotTypeInfo>;
  onRemove: () => void;
}> = ({ listItemName, restField, resourceSlotTypes, onRemove }) => {
  'use memo';

  const selectedSlotName = Form.useWatch([
    'resourceSlots',
    listItemName,
    'resourceType',
  ]);
  const slotType = resourceSlotTypes.find(
    (s) => s.slotName === selectedSlotName,
  );

  const slotOptions = resourceSlotTypes
    .filter((s) => s.slotName !== 'cpu' && s.slotName !== 'mem')
    .map((s) => ({
      value: s.slotName,
      label: s.displayName,
    }));

  const isNumericType =
    slotType?.slotType === 'count' ||
    slotType?.slotType === 'unique-count' ||
    slotType?.slotType === 'bytes';
  const precision = slotType?.numberFormat?.roundLength ?? 0;

  return (
    <BAIFlex direction="row" align="baseline" gap="xs">
      <Form.Item
        {...restField}
        name={[listItemName, 'resourceType']}
        style={{ marginBottom: 0, flex: 1 }}
        rules={[{ required: true, message: '' }]}
      >
        <Select
          options={slotOptions}
          showSearch={{
            filterOption: (input, option) =>
              String(option?.label ?? '')
                .toLowerCase()
                .includes(input.toLowerCase()),
          }}
        />
      </Form.Item>
      <Form.Item
        {...restField}
        name={[listItemName, 'quantity']}
        style={{ marginBottom: 0, flex: 1 }}
        rules={[{ required: true, message: '' }]}
        getValueFromEvent={(v: number | null) => (v != null ? String(v) : '')}
        getValueProps={(v: string) => ({
          value: v !== '' && v != null ? Number(v) : undefined,
        })}
      >
        {isNumericType ? (
          <InputNumberWithUnit
            min={0}
            precision={precision}
            step={precision > 0 ? Math.pow(10, -precision) : 1}
            unit={slotType?.displayUnit || undefined}
          />
        ) : (
          <Input />
        )}
      </Form.Item>
      <MinusCircleOutlined onClick={onRemove} />
    </BAIFlex>
  );
};

// ---------------------------------------------------------------------------
// FixedResourceSlotField — non-removable required resource slot (cpu / mem)
// ---------------------------------------------------------------------------

const FixedResourceSlotField: React.FC<{
  slotName: 'cpu' | 'mem';
  resourceSlotTypes: ReadonlyArray<ResourceSlotTypeInfo>;
  required?: boolean;
}> = ({ slotName, resourceSlotTypes, required = true }) => {
  'use memo';
  const { token } = theme.useToken();
  const slotType = resourceSlotTypes.find((s) => s.slotName === slotName);
  const precision = slotType?.numberFormat?.roundLength ?? 0;

  return (
    <BAIFlex direction="row" align="baseline" gap="xs">
      <Form.Item style={{ marginBottom: 0, flex: 1 }}>
        <Input
          readOnly
          value={slotName.toUpperCase()}
          style={{ borderStyle: 'dashed', cursor: 'default' }}
        />
      </Form.Item>
      {slotName === 'mem' ? (
        <Form.Item
          name={slotName}
          style={{ marginBottom: 0, flex: 1 }}
          required={required}
          rules={[{ required, message: '' }]}
        >
          <BAIDynamicUnitInputNumber style={{ width: '100%' }} />
        </Form.Item>
      ) : (
        <Form.Item
          name={slotName}
          style={{ marginBottom: 0, flex: 1 }}
          required={required}
          rules={[{ required, message: '' }]}
          getValueFromEvent={(v: number | null) => (v != null ? String(v) : '')}
          getValueProps={(v: string) => ({
            value: v !== '' && v != null ? Number(v) : undefined,
          })}
        >
          <InputNumberWithUnit
            min={0}
            precision={precision}
            step={precision > 0 ? Math.pow(10, -precision) : 1}
            unit={slotType?.displayUnit || undefined}
          />
        </Form.Item>
      )}
      {/* Spacer matching the MinusCircleOutlined delete icon in ResourceSlotRow */}
      <span style={{ visibility: 'hidden', fontSize: token.fontSize }}>
        <MinusCircleOutlined />
      </span>
    </BAIFlex>
  );
};

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

  // Pass `form` explicitly so useWatch subscribes to the store even without a
  // registered Form.Item for these boolean flags.
  const formEnableService = Form.useWatch(
    ['modelDefinition', 'models', listItemName, 'enableService'],
    form,
  );
  const formEnableMetadata = Form.useWatch(
    ['modelDefinition', 'models', listItemName, 'enableMetadata'],
    form,
  );
  const enableHealthCheck = Form.useWatch(
    ['modelDefinition', 'models', listItemName, 'service', 'enableHealthCheck'],
    form,
  );

  // Initialise from the form store so that edit-mode values (set via Form
  // initialValues before this component mounts) are visible on the first render,
  // rather than waiting for the formEnableService watcher to fire.
  const [serviceOpen, { toggle: toggleServiceState, set: setServiceOpen }] =
    useToggle<boolean>(
      !!(form as FormInstance).getFieldValue([
        'modelDefinition',
        'models',
        listItemName,
        'enableService',
      ]),
    );
  const [metadataOpen, { toggle: toggleMetadataState, set: setMetadataOpen }] =
    useToggle<boolean>(
      !!(form as FormInstance).getFieldValue([
        'modelDefinition',
        'models',
        listItemName,
        'enableMetadata',
      ]),
    );

  // Sync form store → local toggle when the form is (re-)initialised (edit mode).
  const onSyncService = useEffectEvent(() =>
    setServiceOpen(!!formEnableService),
  );
  const onSyncMetadata = useEffectEvent(() =>
    setMetadataOpen(!!formEnableMetadata),
  );
  useEffect(() => {
    onSyncService();
  }, [formEnableService]);
  useEffect(() => {
    onSyncMetadata();
  }, [formEnableMetadata]);

  const toggleService = () => {
    toggleServiceState();
    // `NamePath<AdminDeploymentPresetFormValue>` is truncated by TypeScript before
    // reaching depth-4 array element fields; cast to the unparameterised FormInstance
    // (which uses NamePath<any>) to keep the call site fully typed without `any`.
    (form as FormInstance).setFieldValue(
      ['modelDefinition', 'models', listItemName, 'enableService'],
      !serviceOpen,
    );
  };

  const toggleMetadata = () => {
    toggleMetadataState();
    (form as FormInstance).setFieldValue(
      ['modelDefinition', 'models', listItemName, 'enableMetadata'],
      !metadataOpen,
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

        {/* ── Configure Service (collapsible inner card) ── */}
        <BAICard
          size="small"
          type="inner"
          showDivider={serviceOpen}
          title={t('adminDeploymentPreset.modelDef.EnableService')}
          style={{ marginTop: token.marginSM }}
          styles={{ body: { display: serviceOpen ? undefined : 'none' } }}
          extra={
            <Button
              type="text"
              size="small"
              icon={serviceOpen ? <DownOutlined /> : <RightOutlined />}
              onClick={toggleService}
            />
          }
        >
          {serviceOpen && (
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
                            <Input placeholder="{}" />
                          </Form.Item>
                          <MinusCircleOutlined onClick={() => remove(name)} />
                        </BAIFlex>
                      ))}
                      <Form.Item noStyle>
                        <Button
                          type="dashed"
                          onClick={() => add({ action: '', args: '{}' })}
                          icon={<PlusOutlined />}
                          block
                        >
                          {t(
                            'adminDeploymentPreset.modelDef.AddPreStartAction',
                          )}
                        </Button>
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
                    label={t('adminDeploymentPreset.modelDef.HealthCheckPath')}
                    rules={[{ required: true, message: '' }]}
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
                      rules={[{ required: true }]}
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
                      rules={[{ required: true }]}
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
                      rules={[{ required: true }]}
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
                      rules={[{ required: true }]}
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
                      rules={[{ required: true }]}
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
          )}
        </BAICard>

        {/* ── Add Metadata (collapsible inner card) ── */}
        <BAICard
          size="small"
          type="inner"
          showDivider={metadataOpen}
          title={t('adminDeploymentPreset.modelDef.EnableMetadata')}
          style={{ marginTop: token.marginSM }}
          styles={{ body: { display: metadataOpen ? undefined : 'none' } }}
          extra={
            <Button
              type="text"
              size="small"
              icon={metadataOpen ? <DownOutlined /> : <RightOutlined />}
              onClick={toggleMetadata}
            />
          }
        >
          {metadataOpen && (
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
          )}
        </BAICard>
      </BAICard>
      <MinusCircleOutlined
        style={{ cursor: 'pointer', paddingTop: token.paddingSM }}
        onClick={onRemove}
      />
    </BAIFlex>
  );
};

// ---------------------------------------------------------------------------
// Image canonical name resolver (for review step)
// ---------------------------------------------------------------------------

const ImageCanonicalName: React.FC<{ imageId: string }> = ({ imageId }) => {
  'use memo';
  const data =
    useLazyLoadQuery<AdminDeploymentPresetSettingPageContentImageQuery>(
      graphql`
        query AdminDeploymentPresetSettingPageContentImageQuery($id: UUID!) {
          adminImagesV2(filter: { id: { equals: $id } }, limit: 1) {
            edges {
              node {
                identity {
                  canonicalName
                }
              }
            }
          }
        }
      `,
      { id: imageId },
      { fetchPolicy: 'store-or-network' },
    );
  const canonicalName =
    data.adminImagesV2?.edges?.[0]?.node?.identity?.canonicalName ?? imageId;
  return (
    <Typography.Text
      code
      style={{ wordBreak: 'break-all' }}
      copyable={{ text: canonicalName }}
    >
      {canonicalName}
    </Typography.Text>
  );
};

// ---------------------------------------------------------------------------
// Main content component
// ---------------------------------------------------------------------------

const AdminDeploymentPresetSettingPageContent: React.FC<
  AdminDeploymentPresetSettingPageContentProps
> = ({
  mode,
  form,
  presetFrgmt,
  runtimeVariants = [],
  resourceSlotTypes = [],
  onSubmit,
  isSubmitting,
}) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();
  const screens = Grid.useBreakpoint();

  const preset = useFragment(
    graphql`
      fragment AdminDeploymentPresetSettingPageContent_preset on DeploymentRevisionPreset {
        id
        name
        description
        runtimeVariantId
        runtimeVariant {
          name
        }
        cluster {
          clusterMode
          clusterSize
        }
        execution {
          imageId
          startupCommand
          bootstrapScript
          environ {
            key
            value
          }
        }
        resource {
          resourceOpts {
            name
            value
          }
        }
        resourceSlots {
          slotName
          quantity
        }
        deploymentDefaults {
          openToPublic
          replicaCount
          revisionHistoryLimit
          deploymentStrategy
        }
        modelDefinition {
          models {
            name
            modelPath
            service {
              preStartActions {
                action
                args
              }
              startCommand
              shell
              port
              healthCheck {
                interval
                path
                maxRetries
                maxWaitTime
                expectedStatusCode
                initialDelay
              }
            }
            metadata {
              author
              title
              version
              created
              lastModified
              description
              task
              category
              architecture
              framework
              label
              license
              minResource
            }
          }
        }
      }
    `,
    presetFrgmt ?? null,
  );
  // URL-synced step + form values (create mode only; sensitive fields excluded)
  const [{ step: currentStepKey, formValues: formValuesFromURL }, setQuery] =
    useQueryStates({
      step: parseAsStringLiteral(STEP_KEYS).withDefault('basic'),
      formValues: parseAsJson<Partial<AdminDeploymentPresetFormValue>>(
        (v) => v as Partial<AdminDeploymentPresetFormValue>,
      ).withDefault({} as Partial<AdminDeploymentPresetFormValue>),
    });

  const currentStepIndex = STEP_KEYS.indexOf(currentStepKey);
  const isLastStep = currentStepIndex === STEP_KEYS.length - 1;
  const isFirstStep = currentStepIndex === 0;

  const runtimeVariantOptions = runtimeVariants.map((rt) => ({
    value: toLocalId(rt.id),
    label: rt.name,
  }));

  const initialValues: Partial<AdminDeploymentPresetFormValue> = useMemo(() => {
    if (mode === 'edit' && preset) {
      return {
        name: preset.name,
        description: preset.description ?? undefined,
        runtimeVariantId: preset.runtimeVariantId,
        imageId: preset.execution?.imageId ?? undefined,
        clusterMode:
          (preset.cluster?.clusterMode as
            | 'SINGLE_NODE'
            | 'MULTI_NODE'
            | undefined) ?? undefined,
        clusterSize: preset.cluster?.clusterSize ?? undefined,
        ...(() => {
          const slots = preset.resourceSlots ?? [];
          const cpuSlot = slots.find((s) => s?.slotName === 'cpu');
          const memSlot = slots.find((s) => s?.slotName === 'mem');
          const otherSlots = slots.filter(
            (s) => s && s.slotName !== 'cpu' && s.slotName !== 'mem',
          );
          const cpuQty = cpuSlot?.quantity
            ? String(parseFloat(cpuSlot.quantity))
            : undefined;
          let memQty: string | undefined;
          if (memSlot?.quantity) {
            const bytes = parseFloat(memSlot.quantity);
            const gib = bytes / 1073741824;
            memQty = Number.isInteger(gib)
              ? `${gib}g`
              : `${Math.round(bytes / 1048576)}m`;
          }
          return {
            cpu: cpuQty,
            mem: memQty,
            resourceSlots: otherSlots
              .filter((s) => s != null)
              .map((s) => ({
                resourceType: s!.slotName,
                quantity: String(parseFloat(s!.quantity)),
              })),
          };
        })(),
        startupCommand: preset.execution?.startupCommand ?? undefined,
        bootstrapScript: preset.execution?.bootstrapScript ?? undefined,
        environ:
          preset.execution?.environ?.map((e) => ({
            variable: e.key,
            value: e.value,
          })) ?? [],
        resourceOpts:
          preset.resource?.resourceOpts?.map((o) => ({
            name: o.name,
            value: o.value,
          })) ?? [],
        openToPublic: preset.deploymentDefaults?.openToPublic ?? undefined,
        replicaCount: preset.deploymentDefaults?.replicaCount ?? undefined,
        revisionHistoryLimit:
          preset.deploymentDefaults?.revisionHistoryLimit ?? undefined,
        modelDefinition: preset.modelDefinition?.models?.length
          ? {
              models: preset.modelDefinition.models.map((m) => ({
                name: m.name,
                modelPath: m.modelPath,
                enableService: !!m.service,
                service: m.service
                  ? {
                      port: m.service.port,
                      shell: m.service.shell ?? undefined,
                      startCommand:
                        m.service.startCommand?.join(' ') ?? undefined,
                      enableHealthCheck: !!m.service.healthCheck,
                      healthCheck: m.service.healthCheck
                        ? {
                            path: m.service.healthCheck.path,
                            interval: m.service.healthCheck.interval,
                            maxRetries: m.service.healthCheck.maxRetries,
                            maxWaitTime: m.service.healthCheck.maxWaitTime,
                            expectedStatusCode:
                              m.service.healthCheck.expectedStatusCode,
                            initialDelay: m.service.healthCheck.initialDelay,
                          }
                        : undefined,
                      preStartActions:
                        m.service.preStartActions?.map((a) => ({
                          action: a.action,
                          args: JSON.stringify(a.args),
                        })) ?? [],
                    }
                  : undefined,
                enableMetadata: !!m.metadata,
                metadata: m.metadata
                  ? {
                      author: m.metadata.author ?? undefined,
                      title: m.metadata.title ?? undefined,
                      version:
                        m.metadata.version != null
                          ? String(m.metadata.version)
                          : undefined,
                      description: m.metadata.description ?? undefined,
                      task: m.metadata.task ?? undefined,
                      category: m.metadata.category ?? undefined,
                      architecture: m.metadata.architecture ?? undefined,
                      framework: m.metadata.framework
                        ? [...m.metadata.framework]
                        : undefined,
                      label: m.metadata.label
                        ? [...m.metadata.label]
                        : undefined,
                      license: m.metadata.license ?? undefined,
                    }
                  : undefined,
              })),
            }
          : undefined,
      };
    }
    return {
      clusterMode: 'MULTI_NODE' as const,
      clusterSize: 1,
    };
  }, [mode, preset]);

  const applyInitialValues = useEffectEvent(() => {
    // In edit mode, skip applying until the preset data is available.
    if (mode === 'edit' && !preset) return;
    if (mode === 'create') {
      // Create mode: merge URL-synced values on top of defaults.
      form.resetFields();
      form.setFieldsValue(_.merge({}, initialValues, formValuesFromURL));
    } else {
      // Edit mode: form already has initialValues from <Form initialValues>,
      // so only call setFieldsValue (no resetFields to avoid clearing briefly).
      form.setFieldsValue(initialValues);
    }
  });

  useEffect(() => {
    applyInitialValues();
  }, [preset]);

  // Debounced URL sync — create mode only; exclude sensitive / large fields.
  const { run: syncFormToURL } = useDebounceFn(
    () => {
      if (mode !== 'create') return;
      const currentValue = form.getFieldsValue();
      setQuery(
        {
          formValues: _.omit(currentValue, [
            'environ',
            'modelDefinition',
          ]) as Partial<AdminDeploymentPresetFormValue>,
        },
        { history: 'replace' },
      );
    },
    { leading: false, wait: 500, trailing: true },
  );

  const [validationTourOpen, setValidationTourOpen] = useState(false);
  const [reviewHasError, setReviewHasError] = useState(false);
  const [errorFieldNames, setErrorFieldNames] = useState<string[]>([]);

  // Trigger full form validation and update review-step error state.
  // Called both when navigating to the review step (synchronous, before render)
  // and in a useEffect as a safety net for URL-based navigation.
  const triggerValidation = () => {
    form
      .validateFields()
      .then(() => {
        setReviewHasError(false);
        setErrorFieldNames([]);
      })
      .catch((errorInfo) => {
        const hasErrors = (errorInfo?.errorFields?.length ?? 0) > 0;
        const names: string[] = (errorInfo?.errorFields ?? []).map(
          (ef: { name: (string | number)[] }) => String(ef.name[0]),
        );
        setValidationTourOpen(hasErrors);
        setReviewHasError(hasErrors);
        setErrorFieldNames(names);
      });
  };

  const onEnterReview = useEffectEvent(() => {
    triggerValidation();
  });

  useEffect(() => {
    if (currentStepKey === 'review') {
      onEnterReview();
    }
  }, [currentStepKey]);

  const setCurrentStep = (nextKey: StepKey) => {
    setQuery({ step: nextKey }, { history: 'push' });
  };

  const goToStep = (nextIndex: number) => {
    const clamped = _.clamp(nextIndex, 0, STEP_KEYS.length - 1);
    const nextKey = STEP_KEYS[clamped];
    if (nextKey) {
      if (nextKey === 'review') {
        // Validate before navigating so errors are visible on first render.
        triggerValidation();
      }
      setCurrentStep(nextKey);
    }
  };

  const stepHasError = (fields: string[]) =>
    fields.some((f) => form.getFieldError(f as never).length > 0);

  const stepErrors = [
    stepHasError([
      'name',
      'runtimeVariantId',
      'imageId',
      'cpu',
      'mem',
      'clusterMode',
      'clusterSize',
      'replicaCount',
    ]),
    stepHasError(['startupCommand', 'bootstrapScript']) ||
      errorFieldNames.includes('modelDefinition'),
    reviewHasError,
  ];

  const stepItems: NonNullable<StepsProps['items']> = [
    { title: t('adminDeploymentPreset.step.BasicInfo') },
    { title: t('adminDeploymentPreset.step.ModelAndExecution') },
    {
      title: (
        <span style={reviewHasError ? { color: token.colorError } : undefined}>
          {t('adminDeploymentPreset.step.Review')}
        </span>
      ),
    },
  ];

  return (
    <BAIFlex direction="row" gap="md" align="start" style={{ width: '100%' }}>
      <BAIFlex
        direction="column"
        align="stretch"
        style={{ flex: 1, maxWidth: 800 }}
      >
        <Form<AdminDeploymentPresetFormValue>
          form={form}
          initialValues={initialValues}
          layout="vertical"
          onValuesChange={() => syncFormToURL()}
          scrollToFirstError
        >
          {/* ----------------------------------------------------------------
              Step 1 — Basic Info
          ---------------------------------------------------------------- */}
          <BAICard
            id="preset-form-card-basic"
            title={t('adminDeploymentPreset.step.BasicInfo')}
            style={{ display: currentStepKey === 'basic' ? 'block' : 'none' }}
            showDivider
          >
            <Form.Item
              name="name"
              label={t('adminDeploymentPreset.Name')}
              rules={[
                {
                  required: true,
                  message: t('adminDeploymentPreset.NameRequired'),
                },
              ]}
            >
              <Input placeholder={t('adminDeploymentPreset.NamePlaceholder')} />
            </Form.Item>
            <Form.Item
              name="description"
              label={t('adminDeploymentPreset.Description')}
            >
              <Input.TextArea
                rows={2}
                placeholder={t('adminDeploymentPreset.DescriptionPlaceholder')}
              />
            </Form.Item>
            {mode === 'edit' ? (
              <Form.Item label={t('adminDeploymentPreset.Runtime')}>
                <Typography.Text>
                  {preset?.runtimeVariant?.name ?? preset?.runtimeVariantId}
                </Typography.Text>
              </Form.Item>
            ) : (
              <Form.Item
                name="runtimeVariantId"
                label={t('adminDeploymentPreset.Runtime')}
                rules={[
                  {
                    required: true,
                    message: t('adminDeploymentPreset.RuntimeRequired'),
                  },
                ]}
              >
                <Select
                  options={runtimeVariantOptions}
                  placeholder={t('adminDeploymentPreset.SelectRuntimeVariant')}
                  showSearch={{
                    filterOption: (input, option) =>
                      String(option?.label ?? '')
                        .toLowerCase()
                        .includes(input.toLowerCase()),
                  }}
                />
              </Form.Item>
            )}
            <Form.Item
              name="imageId"
              label={t('adminDeploymentPreset.Image')}
              rules={[{ required: true }]}
            >
              <ImageSelectField />
            </Form.Item>
          </BAICard>

          {/* ----------------------------------------------------------------
              Step 1 (cont.) — Resources card
          ---------------------------------------------------------------- */}
          <BAICard
            id="preset-form-card-resources"
            title={t('adminDeploymentPreset.step.Resources')}
            style={{
              display: currentStepKey === 'basic' ? 'block' : 'none',
              marginTop: token.marginMD,
            }}
            showDivider
          >
            <Form.Item
              label={t('adminDeploymentPreset.ResourceSlots')}
              style={{ marginBottom: 0 }}
              required
            >
              <BAIFlex direction="column" gap="xs" align="stretch">
                <FixedResourceSlotField
                  slotName="cpu"
                  resourceSlotTypes={resourceSlotTypes}
                  required={mode === 'create'}
                />
                <FixedResourceSlotField
                  slotName="mem"
                  resourceSlotTypes={resourceSlotTypes}
                  required={mode === 'create'}
                />
                <Form.List name="resourceSlots">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...rest }) => (
                        <ResourceSlotRow
                          key={key}
                          listItemName={name}
                          restField={rest}
                          resourceSlotTypes={resourceSlotTypes}
                          onRemove={() => remove(name)}
                        />
                      ))}
                      <Form.Item noStyle>
                        <Button
                          type="dashed"
                          onClick={() => add()}
                          icon={<PlusOutlined />}
                          block
                        >
                          {t('adminDeploymentPreset.AddResourceSlot')}
                        </Button>
                      </Form.Item>
                    </>
                  )}
                </Form.List>
              </BAIFlex>
            </Form.Item>
            <Form.Item
              label={t('adminDeploymentPreset.ResourceOpts')}
              style={{ marginBottom: 0, marginTop: token.marginMD }}
            >
              <Form.List name="resourceOpts">
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
                          name={[name, 'name']}
                          style={{ marginBottom: 0, flex: 1 }}
                          rules={[{ required: true, message: '' }]}
                        >
                          <AutoComplete
                            options={[{ value: 'shmem' }]}
                            filterOption={(input, option) =>
                              String(option?.value ?? '')
                                .toLowerCase()
                                .includes(input.toLowerCase())
                            }
                            placeholder="shmem"
                          />
                        </Form.Item>
                        <Form.Item
                          {...rest}
                          name={[name, 'value']}
                          style={{ marginBottom: 0, flex: 1 }}
                          rules={[{ required: true, message: '' }]}
                        >
                          <Input placeholder="64m" />
                        </Form.Item>
                        <MinusCircleOutlined onClick={() => remove(name)} />
                      </BAIFlex>
                    ))}
                    <Form.Item noStyle>
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        icon={<PlusOutlined />}
                        block
                      >
                        {t('adminDeploymentPreset.AddResourceOpt')}
                      </Button>
                    </Form.Item>
                  </BAIFlex>
                )}
              </Form.List>
            </Form.Item>
            <BAIFlex
              gap="md"
              wrap="wrap"
              style={{ alignItems: 'flex-end', marginTop: token.marginMD }}
            >
              <Form.Item
                name="clusterMode"
                label={t('adminDeploymentPreset.ClusterMode')}
                style={{ flex: 1, minWidth: 160 }}
                required
                rules={[
                  {
                    required: true,
                    message: t('adminDeploymentPreset.ClusterModeRequired'),
                  },
                ]}
              >
                <Select
                  placeholder={t('adminDeploymentPreset.SelectClusterMode')}
                  options={[
                    {
                      value: 'SINGLE_NODE',
                      label: t('adminDeploymentPreset.SingleNode'),
                    },
                    {
                      value: 'MULTI_NODE',
                      label: t('adminDeploymentPreset.MultiNode'),
                    },
                  ]}
                />
              </Form.Item>
              <Form.Item
                name="clusterSize"
                label={t('adminDeploymentPreset.ClusterSize')}
                style={{ flex: 1, minWidth: 120 }}
                required
                rules={[
                  {
                    required: true,
                    message: t('adminDeploymentPreset.ClusterSizeRequired'),
                  },
                ]}
              >
                <InputNumber
                  min={1}
                  style={{ width: '100%' }}
                  placeholder={t(
                    'adminDeploymentPreset.ClusterSizePlaceholder',
                  )}
                />
              </Form.Item>
            </BAIFlex>
          </BAICard>

          {/* ----------------------------------------------------------------
              Step 2 — Model & Execution
          ---------------------------------------------------------------- */}
          <BAICard
            id="preset-form-card-model"
            title={t('adminDeploymentPreset.step.ModelAndExecution')}
            style={{
              display: currentStepKey === 'model' ? 'block' : 'none',
            }}
            showDivider
          >
            <Form.Item
              name="startupCommand"
              label={t('adminDeploymentPreset.StartupCommand')}
            >
              <Input.TextArea
                rows={2}
                placeholder={t(
                  'adminDeploymentPreset.StartupCommandPlaceholder',
                )}
              />
            </Form.Item>
            <Form.Item
              name="bootstrapScript"
              label={t('adminDeploymentPreset.BootstrapScript')}
            >
              <Input.TextArea
                rows={3}
                placeholder={t(
                  'adminDeploymentPreset.BootstrapScriptPlaceholder',
                )}
              />
            </Form.Item>
            <Form.Item
              label={t('adminDeploymentPreset.EnvironmentVariables')}
              style={{ marginBottom: 0 }}
            >
              <EnvVarFormList name="environ" />
            </Form.Item>
            <Form.Item
              label={t('adminDeploymentPreset.ModelDefinition')}
              style={{ marginTop: token.marginMD, marginBottom: 0 }}
            >
              <Form.List name={['modelDefinition', 'models']}>
                {(fields, { add, remove }) => (
                  <BAIFlex direction="column" align="stretch" gap="sm">
                    {fields.map(({ key, name, ...rest }) => (
                      <ModelConfigItem
                        key={key}
                        listItemName={name}
                        restField={rest}
                        onRemove={() => remove(name)}
                      />
                    ))}
                    <Button
                      type="dashed"
                      onClick={() => add({ name: '', modelPath: '' })}
                      icon={<PlusOutlined />}
                      block
                    >
                      {t('adminDeploymentPreset.modelDef.AddModel')}
                    </Button>
                  </BAIFlex>
                )}
              </Form.List>
            </Form.Item>
          </BAICard>

          {/* ----------------------------------------------------------------
              Step 1 (cont.) — Deployment Defaults card (within basic step)
          ---------------------------------------------------------------- */}
          <BAICard
            id="preset-form-card-deployment"
            title={t('adminDeploymentPreset.step.Deployment')}
            style={{
              display: currentStepKey === 'basic' ? 'block' : 'none',
              marginTop: token.marginMD,
            }}
            showDivider
          >
            <BAIFlex gap="md" wrap="wrap" style={{ alignItems: 'flex-end' }}>
              <Form.Item
                name="replicaCount"
                label={t('adminDeploymentPreset.Replicas')}
                style={{ flex: 1, minWidth: 120 }}
                rules={[{ required: true }]}
              >
                <InputNumber
                  min={1}
                  style={{ width: '100%' }}
                  placeholder={t('adminDeploymentPreset.ReplicasPlaceholder')}
                />
              </Form.Item>
              <Form.Item
                name="revisionHistoryLimit"
                label={t('adminDeploymentPreset.RevisionHistoryLimit')}
                style={{ flex: 1, minWidth: 120 }}
              >
                <InputNumber
                  min={1}
                  style={{ width: '100%' }}
                  placeholder={t(
                    'adminDeploymentPreset.RevisionHistoryLimitPlaceholder',
                  )}
                />
              </Form.Item>
            </BAIFlex>
            <Form.Item name="openToPublic" valuePropName="checked">
              <Checkbox>{t('adminDeploymentPreset.OpenToPublic')}</Checkbox>
            </Form.Item>
          </BAICard>

          {/* ----------------------------------------------------------------
              Step 3 — Review
          ---------------------------------------------------------------- */}
          {currentStepKey === 'review' && (
            <Form.Item noStyle shouldUpdate>
              {() => (
                <PresetReviewSummary
                  form={form}
                  mode={mode}
                  onGoToStep={goToStep}
                  runtimeVariants={runtimeVariants}
                  errorFieldNames={errorFieldNames}
                />
              )}
            </Form.Item>
          )}

          {/* ----------------------------------------------------------------
              Footer navigation — mirrors DeploymentLauncherPageContent.
              No Cancel; Previous / Next + SkipToReview / Submit.
          ---------------------------------------------------------------- */}
          <BAIFlex
            direction="row"
            justify="end"
            gap="sm"
            style={{ marginTop: token.marginMD }}
            data-test-id="deployment-preset-step-navigation"
          >
            {!isFirstStep && (
              <Button
                icon={<LeftOutlined />}
                onClick={() => goToStep(currentStepIndex - 1)}
              >
                {t('button.Previous')}
              </Button>
            )}
            {isLastStep ? (
              onSubmit && (
                <BAIButton
                  type="primary"
                  loading={isSubmitting}
                  disabled={reviewHasError}
                  action={onSubmit}
                >
                  {mode === 'edit' ? t('button.Update') : t('button.Create')}
                </BAIButton>
              )
            ) : (
              <>
                <Button
                  type="primary"
                  ghost
                  onClick={() => goToStep(currentStepIndex + 1)}
                >
                  {t('button.Next')} <RightOutlined />
                </Button>
                <Button onClick={() => goToStep(STEP_KEYS.length - 1)}>
                  {t('adminDeploymentPreset.nav.SkipToReview')}
                  <DoubleRightOutlined />
                </Button>
              </>
            )}
          </BAIFlex>
        </Form>
      </BAIFlex>

      {/* Right-side vertical Steps panel — mirrors DeploymentLauncherPageContent.
          Hidden below lg so the form gets the full viewport width on small screens. */}
      {screens.lg && (
        <BAIFlex style={{ position: 'sticky', top: 80 }}>
          <Steps
            size="small"
            orientation="vertical"
            current={currentStepIndex}
            onChange={(nextIndex) => goToStep(nextIndex)}
            items={stepItems.map((item, idx) => ({
              ...item,
              // Review step (last) uses title color for error feedback — no 'error' icon.
              status:
                stepErrors[idx] && idx !== STEP_KEYS.length - 1
                  ? 'error'
                  : idx === currentStepIndex
                    ? 'process'
                    : 'wait',
            }))}
          />
        </BAIFlex>
      )}

      {currentStepKey === 'review' && (
        <PresetValidationTour
          open={validationTourOpen}
          onClose={() => setValidationTourOpen(false)}
        />
      )}
    </BAIFlex>
  );
};

// ---------------------------------------------------------------------------
// PresetReviewSummary — read-only summary of all form fields on the review step
// ---------------------------------------------------------------------------

const BASIC_INFO_FIELDS = ['name', 'runtimeVariantId', 'imageId'] as const;
const RESOURCES_FIELDS = ['cpu', 'mem', 'clusterMode', 'clusterSize'] as const;
const DEPLOYMENT_FIELDS = ['replicaCount'] as const;
const STEP2_FIELDS = [
  'startupCommand',
  'bootstrapScript',
  'modelDefinition',
] as const;

const PresetReviewSummary: React.FC<{
  form: FormInstance<AdminDeploymentPresetFormValue>;
  mode: 'create' | 'edit';
  onGoToStep: (index: number) => void;
  runtimeVariants: ReadonlyArray<{ id: string; name: string }>;
  errorFieldNames: string[];
}> = ({ form, mode, onGoToStep, runtimeVariants, errorFieldNames }) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  // Pass `true` to include values set via setFieldValue (e.g. enableService,
  // enableMetadata) that have no registered Form.Item. The `true` overload
  // returns `any`; annotate the variable explicitly to restore type safety.
  const values: AdminDeploymentPresetFormValue = form.getFieldsValue(true);

  const basicInfoHasError = BASIC_INFO_FIELDS.some((f) =>
    errorFieldNames.includes(f),
  );
  const resourcesHasError = RESOURCES_FIELDS.some((f) =>
    errorFieldNames.includes(f),
  );
  const deploymentHasError = DEPLOYMENT_FIELDS.some((f) =>
    errorFieldNames.includes(f),
  );
  const step2HasError = STEP2_FIELDS.some((f) => errorFieldNames.includes(f));

  const runtimeName =
    runtimeVariants.find((r) => toLocalId(r.id) === values.runtimeVariantId)
      ?.name ?? values.runtimeVariantId;

  const editLink = (stepIndex: number, cardId: string) => (
    <Button
      type="link"
      size="small"
      onClick={() => {
        onGoToStep(stepIndex);
        setTimeout(() => {
          document
            .getElementById(cardId)
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
      }}
    >
      {t('button.Edit')}
    </Button>
  );

  return (
    <BAIFlex direction="column" gap="md" align="stretch">
      {/* Basic Info */}
      <BAICard
        size="small"
        className={basicInfoHasError ? 'bai-card-error' : ''}
        style={
          basicInfoHasError ? { borderColor: token.colorError } : undefined
        }
        title={t('adminDeploymentPreset.step.BasicInfo')}
        extra={editLink(0, 'preset-form-card-basic')}
      >
        <Descriptions column={1} size="small">
          <Descriptions.Item label={t('adminDeploymentPreset.Name')}>
            <Typography.Text strong>{values.name || '-'}</Typography.Text>
          </Descriptions.Item>
          {values.description && (
            <Descriptions.Item label={t('adminDeploymentPreset.Description')}>
              {values.description}
            </Descriptions.Item>
          )}
          {mode === 'create' && (
            <Descriptions.Item label={t('adminDeploymentPreset.Runtime')}>
              {runtimeName || '-'}
            </Descriptions.Item>
          )}
          <Descriptions.Item label={t('adminDeploymentPreset.Image')}>
            {values.imageId ? (
              <Suspense
                fallback={
                  <Typography.Text code style={{ wordBreak: 'break-all' }}>
                    {values.imageId}
                  </Typography.Text>
                }
              >
                <ImageCanonicalName imageId={values.imageId} />
              </Suspense>
            ) : (
              '-'
            )}
          </Descriptions.Item>
        </Descriptions>
      </BAICard>

      {/* Resources */}
      <BAICard
        size="small"
        className={resourcesHasError ? 'bai-card-error' : ''}
        style={
          resourcesHasError ? { borderColor: token.colorError } : undefined
        }
        title={t('adminDeploymentPreset.step.Resources')}
        extra={editLink(0, 'preset-form-card-resources')}
      >
        <Descriptions column={1} size="small">
          <Descriptions.Item label={t('adminDeploymentPreset.ResourceSlots')}>
            <BAIFlex direction="row" align="start" gap="sm" wrap="wrap">
              <ResourceNumbersOfSession
                resource={
                  {
                    ...(values.cpu ? { cpu: Number(values.cpu) } : {}),
                    ...(values.mem ? { mem: values.mem } : {}),
                    ...Object.fromEntries(
                      (values.resourceSlots ?? []).map((s) => [
                        s.resourceType,
                        s.quantity,
                      ]),
                    ),
                  } as any
                }
              />
            </BAIFlex>
          </Descriptions.Item>
          <Descriptions.Item label={t('adminDeploymentPreset.ClusterMode')}>
            {values.clusterMode === 'SINGLE_NODE'
              ? t('adminDeploymentPreset.SingleNode')
              : values.clusterMode === 'MULTI_NODE'
                ? t('adminDeploymentPreset.MultiNode')
                : '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('adminDeploymentPreset.ClusterSize')}>
            {values.clusterSize != null ? values.clusterSize : '-'}
          </Descriptions.Item>
        </Descriptions>
      </BAICard>

      {/* Deployment */}
      <BAICard
        size="small"
        className={deploymentHasError ? 'bai-card-error' : ''}
        style={
          deploymentHasError ? { borderColor: token.colorError } : undefined
        }
        title={t('adminDeploymentPreset.step.Deployment')}
        extra={editLink(0, 'preset-form-card-deployment')}
      >
        <Descriptions column={2} size="small">
          <Descriptions.Item label={t('adminDeploymentPreset.Replicas')}>
            {values.replicaCount ?? '-'}
          </Descriptions.Item>
          <Descriptions.Item
            label={t('adminDeploymentPreset.RevisionHistoryLimit')}
          >
            {values.revisionHistoryLimit ?? '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('adminDeploymentPreset.OpenToPublic')}>
            {values.openToPublic == null
              ? '-'
              : values.openToPublic
                ? t('button.Yes')
                : t('button.No')}
          </Descriptions.Item>
        </Descriptions>
      </BAICard>

      {/* Model & Execution */}
      <BAICard
        size="small"
        className={step2HasError ? 'bai-card-error' : ''}
        style={step2HasError ? { borderColor: token.colorError } : undefined}
        title={t('adminDeploymentPreset.step.ModelAndExecution')}
        extra={editLink(1, 'preset-form-card-model')}
      >
        <Descriptions column={1} size="small">
          <Descriptions.Item label={t('adminDeploymentPreset.StartupCommand')}>
            {values.startupCommand ? (
              <Typography.Text code style={{ whiteSpace: 'pre-wrap' }}>
                {values.startupCommand}
              </Typography.Text>
            ) : (
              '-'
            )}
          </Descriptions.Item>
          <Descriptions.Item
            label={t('adminDeploymentPreset.EnvironmentVariables')}
          >
            {values.environ?.length ? (
              <SourceCodeView language="shell">
                {_.map(
                  values.environ,
                  (e) => `${e.variable ?? ''}="${e.value ?? ''}"`,
                ).join('\n')}
              </SourceCodeView>
            ) : (
              '-'
            )}
          </Descriptions.Item>
        </Descriptions>
        {values.modelDefinition?.models?.length ? (
          <BAIFlex
            direction="column"
            align="stretch"
            gap="xs"
            style={{ marginTop: token.marginSM }}
          >
            <Typography.Text
              type="secondary"
              style={{ fontSize: token.fontSizeSM }}
            >
              {t('adminDeploymentPreset.ModelDefinition')}
            </Typography.Text>
            {values.modelDefinition.models.map((m, i) => (
              <BAICard key={i} size="small" title={m.name}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item
                    label={t('adminDeploymentPreset.modelDef.ModelPath')}
                  >
                    <Typography.Text code style={{ wordBreak: 'break-all' }}>
                      {m.modelPath || '-'}
                    </Typography.Text>
                  </Descriptions.Item>
                  {m.enableService && m.service?.port != null && (
                    <Descriptions.Item
                      label={t('adminDeploymentPreset.modelDef.Port')}
                    >
                      {m.service.port}
                    </Descriptions.Item>
                  )}
                  {m.enableService && m.service?.shell && (
                    <Descriptions.Item
                      label={t('adminDeploymentPreset.modelDef.Shell')}
                    >
                      <Typography.Text code>{m.service.shell}</Typography.Text>
                    </Descriptions.Item>
                  )}
                  {m.enableService && m.service?.startCommand && (
                    <Descriptions.Item
                      label={t('adminDeploymentPreset.modelDef.StartCommand')}
                    >
                      <Typography.Text code>
                        {m.service.startCommand}
                      </Typography.Text>
                    </Descriptions.Item>
                  )}
                  {m.enableService &&
                    (m.service?.preStartActions?.length ?? 0) > 0 && (
                      <Descriptions.Item
                        label={t(
                          'adminDeploymentPreset.modelDef.PreStartActions',
                        )}
                      >
                        {m.service?.preStartActions?.map((a, ai) => (
                          <Typography.Text
                            key={ai}
                            code
                            style={{ display: 'block' }}
                          >
                            {a.action}
                          </Typography.Text>
                        ))}
                      </Descriptions.Item>
                    )}
                  {m.enableService &&
                    m.service?.enableHealthCheck &&
                    m.service.healthCheck?.path && (
                      <>
                        <Descriptions.Item
                          label={t(
                            'adminDeploymentPreset.modelDef.HealthCheckPath',
                          )}
                        >
                          <Typography.Text code>
                            {m.service.healthCheck.path}
                          </Typography.Text>
                        </Descriptions.Item>
                        {m.service.healthCheck.interval != null && (
                          <Descriptions.Item
                            label={t(
                              'adminDeploymentPreset.modelDef.HealthCheckInterval',
                            )}
                          >
                            {m.service.healthCheck.interval}
                          </Descriptions.Item>
                        )}
                        {m.service.healthCheck.maxRetries != null && (
                          <Descriptions.Item
                            label={t(
                              'adminDeploymentPreset.modelDef.HealthCheckMaxRetries',
                            )}
                          >
                            {m.service.healthCheck.maxRetries}
                          </Descriptions.Item>
                        )}
                        {m.service.healthCheck.maxWaitTime != null && (
                          <Descriptions.Item
                            label={t(
                              'adminDeploymentPreset.modelDef.HealthCheckMaxWaitTime',
                            )}
                          >
                            {m.service.healthCheck.maxWaitTime}
                          </Descriptions.Item>
                        )}
                        {m.service.healthCheck.expectedStatusCode != null && (
                          <Descriptions.Item
                            label={t(
                              'adminDeploymentPreset.modelDef.HealthCheckExpectedStatus',
                            )}
                          >
                            {m.service.healthCheck.expectedStatusCode}
                          </Descriptions.Item>
                        )}
                        {m.service.healthCheck.initialDelay != null && (
                          <Descriptions.Item
                            label={t(
                              'adminDeploymentPreset.modelDef.HealthCheckInitialDelay',
                            )}
                          >
                            {m.service.healthCheck.initialDelay}
                          </Descriptions.Item>
                        )}
                      </>
                    )}
                  {m.enableMetadata && m.metadata?.title && (
                    <Descriptions.Item
                      label={t('adminDeploymentPreset.modelDef.Title')}
                    >
                      {m.metadata.title}
                    </Descriptions.Item>
                  )}
                  {m.enableMetadata && m.metadata?.author && (
                    <Descriptions.Item
                      label={t('adminDeploymentPreset.modelDef.Author')}
                    >
                      {m.metadata.author}
                    </Descriptions.Item>
                  )}
                  {m.enableMetadata && m.metadata?.version && (
                    <Descriptions.Item
                      label={t('adminDeploymentPreset.modelDef.Version')}
                    >
                      {m.metadata.version}
                    </Descriptions.Item>
                  )}
                  {m.enableMetadata && m.metadata?.description && (
                    <Descriptions.Item
                      label={t('adminDeploymentPreset.modelDef.Description')}
                    >
                      {m.metadata.description}
                    </Descriptions.Item>
                  )}
                  {m.enableMetadata && m.metadata?.task && (
                    <Descriptions.Item
                      label={t('adminDeploymentPreset.modelDef.Task')}
                    >
                      {m.metadata.task}
                    </Descriptions.Item>
                  )}
                  {m.enableMetadata && m.metadata?.category && (
                    <Descriptions.Item
                      label={t('adminDeploymentPreset.modelDef.Category')}
                    >
                      {m.metadata.category}
                    </Descriptions.Item>
                  )}
                  {m.enableMetadata && m.metadata?.architecture && (
                    <Descriptions.Item
                      label={t('adminDeploymentPreset.modelDef.Architecture')}
                    >
                      {m.metadata.architecture}
                    </Descriptions.Item>
                  )}
                  {m.enableMetadata &&
                    (m.metadata?.framework?.length ?? 0) > 0 && (
                      <Descriptions.Item
                        label={t('adminDeploymentPreset.modelDef.Framework')}
                      >
                        <Space size="small" wrap>
                          {m.metadata!.framework!.map((f, fi) => (
                            <Tag key={fi}>{f}</Tag>
                          ))}
                        </Space>
                      </Descriptions.Item>
                    )}
                  {m.enableMetadata && (m.metadata?.label?.length ?? 0) > 0 && (
                    <Descriptions.Item
                      label={t('adminDeploymentPreset.modelDef.Label')}
                    >
                      <Space size="small" wrap>
                        {m.metadata!.label!.map((l, li) => (
                          <Tag key={li}>{l}</Tag>
                        ))}
                      </Space>
                    </Descriptions.Item>
                  )}
                  {m.enableMetadata && m.metadata?.license && (
                    <Descriptions.Item
                      label={t('adminDeploymentPreset.modelDef.License')}
                    >
                      {m.metadata.license}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </BAICard>
            ))}
          </BAIFlex>
        ) : null}
      </BAICard>
    </BAIFlex>
  );
};

// ---------------------------------------------------------------------------
// PresetValidationTour — tour shown when review step has validation errors
// ---------------------------------------------------------------------------

interface PresetValidationTourProps extends Omit<TourProps, 'steps'> {}

const PresetValidationTour: React.FC<PresetValidationTourProps> = ({
  open,
  onClose,
  ...otherProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const [hasOpened, setHasOpened] = useBAISettingUserState(
    'has_opened_tour_deployment_preset_validation',
  );

  const steps: TourProps['steps'] = [
    {
      title: t('tourGuide.deploymentPreset.ValidationErrorTitle'),
      description: t('tourGuide.deploymentPreset.ValidationErrorText'),
      target: () =>
        document.getElementsByClassName('bai-card-error')?.[0] as HTMLElement,
    },
    {
      title: t('tourGuide.deploymentPreset.ValidationErrorTitle'),
      description: t('tourGuide.deploymentPreset.FixErrorFieldByModifyButton'),
      target: () =>
        (
          document.getElementsByClassName('bai-card-error')?.[0] as HTMLElement
        )?.querySelector('.ant-card-extra') as HTMLElement,
    },
    {
      title: t('tourGuide.deploymentPreset.ValidationErrorTitle'),
      description: t('tourGuide.deploymentPreset.FixErrorAndTryAgainText'),
      target: () =>
        document.querySelector(
          '[data-test-id="deployment-preset-step-navigation"]',
        ) as HTMLElement,
    },
  ];

  return (
    <Tour
      steps={steps}
      open={!hasOpened && open}
      onClose={(e) => {
        onClose?.(e);
        setHasOpened(true);
      }}
      scrollIntoViewOptions
      {...otherProps}
    />
  );
};

export default AdminDeploymentPresetSettingPageContent;
