/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { AdminDeploymentPresetSettingPageContent_preset$key } from '../__generated__/AdminDeploymentPresetSettingPageContent_preset.graphql';
import EnvVarFormList from '../components/EnvVarFormList';
import {
  STEP_KEYS,
  type AdminDeploymentPresetFormValue,
  type ResourceSlotTypeInfo,
  type StepKey,
} from './AdminDeploymentPresetFormTypes';
import ModelConfigItem from './AdminDeploymentPresetModelConfigItem';
import {
  FixedResourceSlotField,
  ResourceSlotRow,
} from './AdminDeploymentPresetResourceFields';
import PresetReviewSummary from './AdminDeploymentPresetReviewSummary';
import PresetValidationTour from './AdminDeploymentPresetValidationTour';
import {
  DoubleRightOutlined,
  LeftOutlined,
  MinusCircleOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { useDebounceFn } from 'ahooks';
import {
  AutoComplete,
  Button,
  Checkbox,
  Form,
  Grid,
  Input,
  InputNumber,
  Select,
  Steps,
  Typography,
  theme,
} from 'antd';
import type { FormInstance, StepsProps } from 'antd';
import {
  BAIAdminImageSelect,
  BAIButton,
  BAICard,
  BAIFlex,
  toLocalId,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { PlusIcon } from 'lucide-react';
import { parseAsJson, parseAsStringLiteral, useQueryStates } from 'nuqs';
import React, {
  Suspense,
  useEffect,
  useEffectEvent,
  useMemo,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

// Re-export form types for backward compatibility with existing consumers.
export type {
  AdminDeploymentPresetFormValue,
  ModelConfigFormValue,
  ModelDefinitionFormValue,
  ModelHealthCheckFormValue,
  ModelMetadataFormValue,
  ModelServiceFormValue,
  PreStartActionFormValue,
  ResourceSlotTypeInfo,
} from './AdminDeploymentPresetFormTypes';

// ---------------------------------------------------------------------------
// Component props
// ---------------------------------------------------------------------------

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
                        <BAIButton
                          type="dashed"
                          onClick={() => add()}
                          icon={<PlusIcon />}
                          block
                        >
                          {t('adminDeploymentPreset.AddResourceSlot')}
                        </BAIButton>
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
                      <BAIButton
                        type="dashed"
                        onClick={() => add()}
                        icon={<PlusIcon />}
                        block
                      >
                        {t('adminDeploymentPreset.AddResourceOpt')}
                      </BAIButton>
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
                    <BAIButton
                      type="dashed"
                      onClick={() => add({ name: '', modelPath: '' })}
                      icon={<PlusIcon />}
                      block
                    >
                      {t('adminDeploymentPreset.modelDef.AddModel')}
                    </BAIButton>
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

export default AdminDeploymentPresetSettingPageContent;
