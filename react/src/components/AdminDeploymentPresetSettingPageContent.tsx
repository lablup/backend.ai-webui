/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { AdminDeploymentPresetSettingPageContent_preset$key } from '../__generated__/AdminDeploymentPresetSettingPageContent_preset.graphql';
import EnvVarFormList from '../components/EnvVarFormList';
import { formatShellCommand } from '../helper/parseCliCommand';
import {
  buildRuntimeVariantPresetValues,
  collectTouchedRuntimePresetParams,
  type RuntimeParameterGroup,
  type RuntimeVariantPresetValueEntry,
} from '../hooks/useRuntimeParameterSchema';
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
import RuntimeParameterFormSection, {
  RUNTIME_PARAMS_NAMESPACE,
  type RuntimeParameterValues,
} from './RuntimeParameterFormSection';
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
  Skeleton,
  Steps,
  Switch,
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
  useRef,
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
  /**
   * Populated with a getter that returns the current runtime-variant preset
   * values (`{ presetId, value }`). Runtime parameter state is owned here (so
   * it can be URL-synced and shown in the review step); the parent page reads
   * the collected values at submit time through this ref without re-rendering
   * on every slider/input change.
   */
  collectRuntimePresetValuesRef?: React.RefObject<
    () => RuntimeVariantPresetValueEntry[]
  >;
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
// URL state sanitization
// ---------------------------------------------------------------------------

/**
 * Sanitize the preset form values before writing them to the (shareable) URL.
 *
 * The URL persists the form *structure* and non-secret config so a half-filled
 * form survives a reload or can be shared, but it must never carry secret-prone
 * free-text. We keep field names / ids / resource shape / model + service config
 * / metadata, and blank out the values that could hold credentials or tokens:
 *   - `environ[].value`            → blanked (variable name kept)
 *   - `modelDefinition` per model  → `service.preStartActions[].args` blanked
 *                                    (action kept)
 *
 * `service.startCommand` is kept: it is the model launch command (service
 * config), not a credential, so persisting it lets a shared link restore the
 * full service definition.
 */
const sanitizeFormValuesForURL = (
  values: Partial<AdminDeploymentPresetFormValue>,
): Partial<AdminDeploymentPresetFormValue> => {
  const next = _.cloneDeep(values);
  if (next.environ) {
    next.environ = next.environ.map((e) => ({
      variable: e?.variable ?? '',
      value: '',
    }));
  }
  if (next.modelDefinition?.models) {
    next.modelDefinition = {
      ...next.modelDefinition,
      models: next.modelDefinition.models.map((m) =>
        m
          ? {
              ...m,
              service: m.service
                ? {
                    ...m.service,
                    preStartActions: (m.service.preStartActions ?? []).map(
                      (a) => ({ action: a?.action ?? '', args: '' }),
                    ),
                  }
                : m.service,
            }
          : m,
      ),
    };
  }
  return next;
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
  collectRuntimePresetValuesRef,
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
        presetValues @since(version: "26.4.4rc9") {
          presetId
          value
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
                enable @since(version: "26.4.4rc7")
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
  const [
    {
      step: currentStepKey,
      formValues: formValuesFromURL,
      runtimeParams: runtimeParamsFromURL,
    },
    setQuery,
  ] = useQueryStates({
    step: parseAsStringLiteral(STEP_KEYS).withDefault('basic'),
    formValues: parseAsJson<Partial<AdminDeploymentPresetFormValue>>(
      (v) => v as Partial<AdminDeploymentPresetFormValue>,
    ).withDefault({} as Partial<AdminDeploymentPresetFormValue>),
    // Runtime-variant preset values ({ presetId, value }) live outside the antd
    // form, so they get their own URL key (create mode only).
    runtimeParams: parseAsJson<RuntimeVariantPresetValueEntry[]>(
      (v) => v as RuntimeVariantPresetValueEntry[],
    ).withDefault([] as RuntimeVariantPresetValueEntry[]),
  });

  const currentStepIndex = STEP_KEYS.indexOf(currentStepKey);
  const isLastStep = currentStepIndex === STEP_KEYS.length - 1;
  const isFirstStep = currentStepIndex === 0;

  const runtimeVariantOptions = runtimeVariants.map((rt) => ({
    value: toLocalId(rt.id),
    label: rt.name,
  }));

  // Snapshot the create-mode URL values once at mount (lazy state initializer).
  // Later edits flow through the section's own state and re-write the URL, so
  // re-seeding from the live URL value would fight the user's input.
  const [initialRuntimeParamsFromURL] = useState(() => runtimeParamsFromURL);

  // Seed the runtime parameters section: in edit mode from the preset's saved
  // values, in create mode from the URL snapshot. Both are `{ presetId, value
  // }`, the shape the section's `initialPresetValues` expects. No explicit
  // useMemo — the React Compiler ('use memo') memoizes this derivation.
  const initialRuntimePresetValues:
    | ReadonlyArray<RuntimeVariantPresetValueEntry>
    | undefined =
    mode === 'edit'
      ? (preset?.presetValues?.map((pv) => ({
          presetId: pv.presetId,
          value: pv.value,
        })) ?? undefined)
      : initialRuntimeParamsFromURL.length > 0
        ? initialRuntimeParamsFromURL
        : undefined;

  // Runtime parameter state. The values themselves live in the enclosing antd
  // form under the `runtimeParams` namespace (written by the section); only the
  // touched-keys set and the loaded preset groups are tracked here in refs so
  // they can be read at submit/review time without forcing re-renders.
  const runtimeParamTouchedKeysRef = useRef<Set<string>>(new Set());
  const runtimeParamGroupsRef = useRef<RuntimeParameterGroup[] | null>(null);

  // Read the form's runtime parameter namespace (native-typed values) and
  // stringify each touched, non-empty value into the API's string encoding,
  // the shape the schema helpers operate on.
  const readRuntimeParamStringValues = (): Record<string, string> => {
    const runtimeParams = form.getFieldValue([RUNTIME_PARAMS_NAMESPACE]) as
      | RuntimeParameterValues
      | undefined;
    const stringValues: Record<string, string> = {};
    if (!runtimeParams) return stringValues;
    for (const [key, val] of Object.entries(runtimeParams)) {
      if (val === undefined || val === null || val === '') continue;
      stringValues[key] = String(val);
    }
    return stringValues;
  };

  // Collect the touched, non-default runtime parameter values as a standalone
  // list keyed by preset id. Exposed to the parent page (for submit) via ref.
  const collectRuntimePresetValues = (): RuntimeVariantPresetValueEntry[] => {
    const groups = runtimeParamGroupsRef.current;
    if (!groups) return [];
    return buildRuntimeVariantPresetValues(
      groups,
      readRuntimeParamStringValues(),
      runtimeParamTouchedKeysRef.current,
    );
  };
  // Expose the collector to the parent page via ref (assigned in an effect — a
  // ref must not be mutated during render). The collector reads refs lazily at
  // call time, so a per-render reassignment is harmless.
  useEffect(() => {
    if (collectRuntimePresetValuesRef) {
      collectRuntimePresetValuesRef.current = collectRuntimePresetValues;
    }
  });

  // Human-readable rows (label + value) for the touched, non-default runtime
  // parameters, used by the review summary. Read from the refs at render time
  // (the section stays mounted across steps, so the refs are current when the
  // review step renders).
  const getRuntimeParamReviewRows = (): Array<{
    key: string;
    label: string;
    value: string;
  }> => {
    const groups = runtimeParamGroupsRef.current;
    if (!groups) return [];
    return collectTouchedRuntimePresetParams(
      groups,
      readRuntimeParamStringValues(),
      runtimeParamTouchedKeysRef.current,
    ).map(({ param, value }) => ({
      key: param.key,
      label: param.displayName ?? param.name,
      value,
    }));
  };

  // Model definition is gated by a switch; when off the card shows only its
  // header (no divider, no body).
  const modelDefinitionEnabled = Form.useWatch(
    ['modelDefinition', 'enabled'],
    form,
  );

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
              enabled: true,
              models: preset.modelDefinition.models.map((m) => ({
                name: m.name,
                modelPath: m.modelPath,
                service: m.service
                  ? {
                      port: m.service.port,
                      shell: m.service.shell,
                      startCommand: formatShellCommand(
                        m.service.startCommand ?? [],
                      ),
                      // 26.4.4rc7+: `enable` is authoritative; older managers
                      // omit it, so fall back to the object's presence.
                      enableHealthCheck:
                        m.service.healthCheck?.enable ??
                        !!m.service.healthCheck,
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
          : // No model on the preset → switch off, but seed one empty model so
            // it is ready when the switch is turned on.
            {
              enabled: false,
              models: [{ name: '', modelPath: '' }],
            },
      };
    }
    return {
      clusterMode: 'MULTI_NODE' as const,
      clusterSize: 1,
      // Model definition is off by default (optional). Seed one empty model so
      // it renders once the switch is turned on.
      modelDefinition: {
        enabled: false,
        models: [{ name: '', modelPath: '' }],
      },
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

  // Debounced URL sync — create mode only. Strips secret-prone values
  // (env-var values, model command/args) via sanitizeFormValuesForURL so a
  // shared link restores the layout without leaking secrets. Also persists
  // runtime-variant preset values (read from the refs) so a shared/reloaded
  // URL restores the configured runtime parameters.
  const { run: syncFormToURL } = useDebounceFn(
    () => {
      if (mode !== 'create') return;
      const currentValue = form.getFieldsValue();
      setQuery(
        {
          formValues: _.omit(sanitizeFormValuesForURL(currentValue), [
            // Runtime params are persisted separately below as { presetId,
            // value } entries; exclude the raw form namespace to avoid
            // double-storing and a conflicting restore path.
            RUNTIME_PARAMS_NAMESPACE,
          ]) as Partial<AdminDeploymentPresetFormValue>,
          runtimeParams: collectRuntimePresetValues(),
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
            <Form.Item
              name="runtimeVariantId"
              label={t('adminDeploymentPreset.Runtime')}
              tooltip={t('adminDeploymentPreset.RuntimeTooltip')}
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

            {/* Runtime parameters — appear once a (non-custom) runtime variant
                is selected, directly under the Runtime selector and before the
                Image field. Reuses the Add Revision modal's section so the
                preset can pre-seed runtime-variant preset values; values live
                in the section's own state and are read at submit time. */}
            <Form.Item dependencies={['runtimeVariantId']} noStyle>
              {({
                getFieldValue,
              }: FormInstance<AdminDeploymentPresetFormValue>) => {
                const variantId = getFieldValue('runtimeVariantId');
                const variantName = runtimeVariants.find(
                  (rt) => toLocalId(rt.id) === variantId,
                )?.name;
                if (!variantName || variantName === 'custom') return null;
                return (
                  // Pull the section up under the Runtime selector (the
                  // selector's default Form.Item marginBottom leaves too large a
                  // gap) and restore a normal field gap before the Image field.
                  <div
                    style={{
                      marginTop: -token.margin,
                      marginBottom: token.marginLG,
                    }}
                  >
                    <Suspense fallback={<Skeleton active />}>
                      <RuntimeParameterFormSection
                        runtimeVariant={variantName}
                        onTouchedKeysChange={(keys) => {
                          runtimeParamTouchedKeysRef.current = keys;
                          syncFormToURL();
                        }}
                        onGroupsLoaded={(groups) => {
                          runtimeParamGroupsRef.current = groups;
                          syncFormToURL();
                        }}
                        initialPresetValues={initialRuntimePresetValues}
                      />
                    </Suspense>
                  </div>
                );
              }}
            </Form.Item>

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
                            placeholder={t('general.Example', {
                              value: 'shmem',
                            })}
                          />
                        </Form.Item>
                        <Form.Item
                          {...rest}
                          name={[name, 'value']}
                          style={{ marginBottom: 0, flex: 1 }}
                          rules={[{ required: true, message: '' }]}
                        >
                          <Input
                            placeholder={t('general.Example', { value: '64m' })}
                          />
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
              tooltip={t('modelService.StartCommandTooltip')}
              extra={t('modelService.StartCommandHelperShell')}
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
          </BAICard>

          {/* ----------------------------------------------------------------
              Step 2 (cont.) — Model Definition (its own card; single model)
          ---------------------------------------------------------------- */}
          <BAICard
            id="preset-form-card-model-definition"
            title={t('adminDeploymentPreset.ModelDefinition')}
            style={{
              display: currentStepKey === 'model' ? 'block' : 'none',
              marginTop: token.marginMD,
              // `.ant-card` clips with overflow:hidden, which cuts the header
              // switch's focus glow. Allow it to render fully.
              overflow: 'visible',
            }}
            extra={
              <Form.Item
                name={['modelDefinition', 'enabled']}
                valuePropName="checked"
                noStyle
              >
                <Switch />
              </Form.Item>
            }
            // When off, show only the header: hide the divider and zero-pad the
            // (still-mounted) body to avoid a toggle flicker. `title` overflow
            // stays visible so the switch's focus glow isn't clipped.
            showDivider={!!modelDefinitionEnabled}
            styles={{
              title: { overflow: 'visible' },
              ...(modelDefinitionEnabled ? {} : { body: { padding: 0 } }),
            }}
          >
            {modelDefinitionEnabled ? (
              <Form.List name={['modelDefinition', 'models']}>
                {(fields) => {
                  const firstField = fields[0];
                  if (!firstField) return null;
                  const { key, name, ...rest } = firstField;
                  return (
                    <ModelConfigItem
                      key={key}
                      listItemName={name}
                      restField={rest}
                    />
                  );
                }}
              </Form.List>
            ) : null}
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
                tooltip={t('adminDeploymentPreset.ReplicasTooltip')}
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
                tooltip={t('adminDeploymentPreset.RevisionHistoryLimitTooltip')}
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
            <Form.Item
              name="openToPublic"
              valuePropName="checked"
              tooltip={t('adminDeploymentPreset.OpenToPublicTooltip')}
            >
              <Checkbox>{t('adminDeploymentPreset.OpenToPublic')}</Checkbox>
            </Form.Item>
          </BAICard>

          {/* ----------------------------------------------------------------
              Step 3 — Review
          ---------------------------------------------------------------- */}
          {currentStepKey === 'review' && (
            <Form.Item noStyle shouldUpdate>
              {() => (
                <Suspense fallback={<Skeleton active />}>
                  <PresetReviewSummary
                    form={form}
                    mode={mode}
                    onGoToStep={goToStep}
                    runtimeVariants={runtimeVariants}
                    errorFieldNames={errorFieldNames}
                    runtimeParamRows={getRuntimeParamReviewRows()}
                  />
                </Suspense>
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
