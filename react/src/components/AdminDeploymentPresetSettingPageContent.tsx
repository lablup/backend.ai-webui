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
  LeftOutlined,
  MinusCircleOutlined,
  PlusOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { useDebounceFn } from 'ahooks';
import {
  AutoComplete,
  Button,
  Card,
  Checkbox,
  Descriptions,
  Form,
  Grid,
  Input,
  InputNumber,
  Select,
  Space,
  Steps,
  Tour,
  Typography,
  theme,
} from 'antd';
import type { FormInstance, StepsProps, TourProps } from 'antd';
import {
  BAIButton,
  BAIDynamicUnitInputNumber,
  BAIFlex,
  BAIImageSelect,
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

const STEP_KEYS = ['basic', 'model', 'deployment', 'review'] as const;
type StepKey = (typeof STEP_KEYS)[number];

// ---------------------------------------------------------------------------
// Form value type
// ---------------------------------------------------------------------------

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
  modelDefinition?: string;
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
// ImageSelectField — thin Suspense wrapper around BAIImageSelect
// ---------------------------------------------------------------------------

const ImageSelectField: React.FC<{
  value?: string;
  onChange?: (value: string) => void;
}> = ({ value, onChange }) => {
  'use memo';
  const { t } = useTranslation();
  return (
    <Suspense fallback={<Select disabled placeholder={t('general.Loading')} />}>
      <BAIImageSelect value={value} onChange={onChange} />
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
// Image canonical name resolver (for review step)
// ---------------------------------------------------------------------------

const ImageCanonicalName: React.FC<{ imageId: string }> = ({ imageId }) => {
  'use memo';
  const data =
    useLazyLoadQuery<AdminDeploymentPresetSettingPageContentImageQuery>(
      graphql`
        query AdminDeploymentPresetSettingPageContentImageQuery($id: ID!) {
          imageV2(id: $id) {
            identity {
              canonicalName
            }
          }
        }
      `,
      { id: imageId },
      { fetchPolicy: 'store-or-network' },
    );
  return <>{data.imageV2?.identity.canonicalName ?? imageId}</>;
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
          edges {
            node {
              slotName
              quantity
            }
          }
        }
        deploymentDefaults {
          openToPublic
          replicaCount
          revisionHistoryLimit
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
        imageId: preset.execution?.imageId
          ? toLocalId(preset.execution.imageId)
          : undefined,
        clusterMode:
          (preset.cluster?.clusterMode as
            | 'SINGLE_NODE'
            | 'MULTI_NODE'
            | undefined) ?? undefined,
        clusterSize: preset.cluster?.clusterSize ?? undefined,
        ...(() => {
          const slots = preset.resourceSlots?.edges?.map((e) => e?.node) ?? [];
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
        modelDefinition: preset.modelDefinition
          ? JSON.stringify(preset.modelDefinition, null, 2)
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
    const merged =
      mode === 'create'
        ? _.merge({}, initialValues, formValuesFromURL)
        : initialValues;
    form.resetFields();
    form.setFieldsValue(merged);
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
            'bootstrapScript',
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

  // Trigger full validation every time the review step is entered.
  // form.getFieldsError() only covers mounted fields, so we track the review-step
  // result in a dedicated state that persists across re-renders.
  const triggerValidation = useEffectEvent(() => {
    form
      .validateFields()
      .then(() => {
        setReviewHasError(false);
      })
      .catch((errorInfo) => {
        const hasErrors = (errorInfo?.errorFields?.length ?? 0) > 0;
        setValidationTourOpen(hasErrors);
        setReviewHasError(hasErrors);
      });
  });

  useEffect(() => {
    if (currentStepKey === 'review') {
      triggerValidation();
    }
  }, [currentStepKey]);

  const setCurrentStep = (nextKey: StepKey) => {
    setQuery({ step: nextKey }, { history: 'push' });
  };

  const goToStep = (nextIndex: number) => {
    const clamped = _.clamp(nextIndex, 0, STEP_KEYS.length - 1);
    const nextKey = STEP_KEYS[clamped];
    if (nextKey) setCurrentStep(nextKey);
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
    ]),
    stepHasError(['startupCommand', 'bootstrapScript', 'modelDefinition']),
    stepHasError(['replicaCount', 'revisionHistoryLimit']),
    reviewHasError,
  ];

  const stepItems: NonNullable<StepsProps['items']> = [
    { title: t('adminDeploymentPreset.step.BasicInfo') },
    { title: t('adminDeploymentPreset.step.ModelAndExecution') },
    { title: t('adminDeploymentPreset.step.Deployment') },
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
          layout="vertical"
          onValuesChange={() => syncFormToURL()}
          scrollToFirstError
        >
          {/* ----------------------------------------------------------------
              Step 1 — Basic Info
          ---------------------------------------------------------------- */}
          <Card
            title={t('adminDeploymentPreset.step.BasicInfo')}
            style={{ display: currentStepKey === 'basic' ? 'block' : 'none' }}
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
          </Card>

          {/* ----------------------------------------------------------------
              Step 1 (cont.) — Resources card
          ---------------------------------------------------------------- */}
          <Card
            title={t('adminDeploymentPreset.step.Resources')}
            style={{
              display: currentStepKey === 'basic' ? 'block' : 'none',
              marginTop: token.marginMD,
            }}
          >
            <Form.Item
              label={t('adminDeploymentPreset.ResourceSlots')}
              style={{ marginBottom: 0 }}
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
          </Card>

          {/* ----------------------------------------------------------------
              Step 2 — Model & Execution
          ---------------------------------------------------------------- */}
          <Card
            title={t('adminDeploymentPreset.step.ModelAndExecution')}
            style={{
              display: currentStepKey === 'model' ? 'block' : 'none',
            }}
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
              name="modelDefinition"
              label={t('adminDeploymentPreset.ModelDefinition')}
              style={{ marginTop: token.marginMD }}
              rules={[
                {
                  validator: async (_rule, value) => {
                    if (!value) return;
                    try {
                      JSON.parse(value);
                    } catch {
                      return Promise.reject(
                        t('adminDeploymentPreset.ModelDefinitionInvalidJson'),
                      );
                    }
                  },
                },
              ]}
            >
              <Input.TextArea
                rows={4}
                placeholder={t(
                  'adminDeploymentPreset.ModelDefinitionPlaceholder',
                )}
              />
            </Form.Item>
          </Card>

          {/* ----------------------------------------------------------------
              Step 3 — Deployment Defaults
          ---------------------------------------------------------------- */}
          <Card
            title={t('adminDeploymentPreset.step.Deployment')}
            style={{
              display: currentStepKey === 'deployment' ? 'block' : 'none',
            }}
          >
            <BAIFlex gap="md" wrap="wrap" style={{ alignItems: 'flex-end' }}>
              <Form.Item
                name="replicaCount"
                label={t('adminDeploymentPreset.Replicas')}
                style={{ flex: 1, minWidth: 120 }}
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
          </Card>

          {/* ----------------------------------------------------------------
              Step 5 — Review
          ---------------------------------------------------------------- */}
          {currentStepKey === 'review' && (
            <Form.Item noStyle shouldUpdate>
              {() => (
                <PresetReviewSummary
                  form={form}
                  mode={mode}
                  onGoToStep={goToStep}
                  runtimeVariants={runtimeVariants}
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

const PresetReviewSummary: React.FC<{
  form: FormInstance<AdminDeploymentPresetFormValue>;
  mode: 'create' | 'edit';
  onGoToStep: (index: number) => void;
  runtimeVariants: ReadonlyArray<{ id: string; name: string }>;
}> = ({ form, mode, onGoToStep, runtimeVariants }) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const values = form.getFieldsValue();

  const step1HasError = (
    [
      'name',
      'runtimeVariantId',
      'imageId',
      'cpu',
      'mem',
      'clusterMode',
      'clusterSize',
    ] as const
  ).some((f) => form.getFieldError(f).length > 0);
  const step2HasError = (['startupCommand', 'bootstrapScript'] as const).some(
    (f) => form.getFieldError(f).length > 0,
  );
  const step3HasError = (
    ['replicaCount', 'revisionHistoryLimit'] as const
  ).some((f) => form.getFieldError(f).length > 0);

  const runtimeName =
    runtimeVariants.find((r) => toLocalId(r.id) === values.runtimeVariantId)
      ?.name ?? values.runtimeVariantId;

  const editLink = (stepIndex: number) => (
    <Button type="link" size="small" onClick={() => onGoToStep(stepIndex)}>
      {t('button.Edit')}
    </Button>
  );

  return (
    <BAIFlex direction="column" gap="md" align="stretch">
      {/* Basic Info */}
      <Card
        size="small"
        className={step1HasError ? 'bai-card-error' : ''}
        style={step1HasError ? { borderColor: token.colorError } : undefined}
        title={t('adminDeploymentPreset.step.BasicInfo')}
        extra={editLink(0)}
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
            <Typography.Text code style={{ wordBreak: 'break-all' }}>
              {values.imageId ? (
                <Suspense fallback={values.imageId}>
                  <ImageCanonicalName imageId={values.imageId} />
                </Suspense>
              ) : (
                '-'
              )}
            </Typography.Text>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Resources */}
      <Card
        size="small"
        className={step1HasError ? 'bai-card-error' : ''}
        style={step1HasError ? { borderColor: token.colorError } : undefined}
        title={t('adminDeploymentPreset.step.Resources')}
        extra={editLink(0)}
      >
        <Descriptions column={1} size="small">
          <Descriptions.Item label={t('adminDeploymentPreset.ResourceSlots')}>
            <BAIFlex direction="row" align="start" gap="sm" wrap="wrap">
              <ResourceNumbersOfSession
                resource={{
                  cpu: values.cpu ? Number(values.cpu) : 0,
                  mem: values.mem || '0g',
                  ...Object.fromEntries(
                    (values.resourceSlots ?? []).map((s) => [
                      s.resourceType,
                      s.quantity,
                    ]),
                  ),
                }}
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
      </Card>

      {/* Model & Execution */}
      <Card
        size="small"
        className={step2HasError ? 'bai-card-error' : ''}
        style={step2HasError ? { borderColor: token.colorError } : undefined}
        title={t('adminDeploymentPreset.step.ModelAndExecution')}
        extra={editLink(1)}
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
      </Card>

      {/* Deployment */}
      <Card
        size="small"
        className={step3HasError ? 'bai-card-error' : ''}
        style={step3HasError ? { borderColor: token.colorError } : undefined}
        title={t('adminDeploymentPreset.step.Deployment')}
        extra={editLink(2)}
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
      </Card>
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
