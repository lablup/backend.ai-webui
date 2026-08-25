/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { AdminDeploymentPresetSettingPageContent_preset$key } from '../__generated__/AdminDeploymentPresetSettingPageContent_preset.graphql';
import EnvVarFormList from '../components/EnvVarFormList';
import { Form } from '../form-engine';
import type { FormInstance } from '../form-engine';
import {
  DEFAULT_MODEL_SERVICE_SHELL,
  deriveCommandModeState,
  resolvesReadsVfolderConfigFiles,
} from '../helper/modelServiceCommand';
import { useSuspendedBackendaiClient } from '../hooks';
import {
  buildRuntimeVariantPresetValues,
  collectTouchedRuntimePresetParams,
  type RuntimeParameterGroup,
  type RuntimeVariantPresetValueEntry,
} from '../hooks/useRuntimeParameterSchema';
import { useCommonEnvVarConfigs } from '../hooks/useVariantConfigs';
import { theme, useBAIBreakpoint } from '../theme-shim';
import {
  STEP_KEYS,
  type AdminDeploymentPresetFormValue,
  type ModelConfigFormValue,
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
import BAIFormItem from './BAIFormItem';
import ModelServiceHealthCheckFormItems from './ModelServiceFormItems/ModelServiceHealthCheckFormItems';
import PreStartActionsFormList from './ModelServiceFormItems/PreStartActionsFormList';
import ServiceConfigurationFormItems from './ModelServiceFormItems/ServiceConfigurationFormItems';
import RuntimeParameterFormSection, {
  RUNTIME_PARAMS_NAMESPACE,
  type RuntimeParameterValues,
} from './RuntimeParameterFormSection';
import {
  AstryxFormCheckbox,
  AstryxFormNumberInput,
  AstryxFormSelector,
  AstryxFormSwitch,
  AstryxFormTextArea,
  AstryxFormTextInput,
} from './astryxFormControls';
import './collapsible-section.css';
import { Button } from '@astryxdesign/core/Button';
import { Selector } from '@astryxdesign/core/Selector';
import { Step, Stepper } from '@astryxdesign/lab';
import {
  BAISkeleton,
  BAIAdminImageSelect,
  BAIButton,
  BAICard,
  BAIFlex,
  toLocalId,
  useDebounceFn,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import {
  ChevronsRight,
  ChevronLeft,
  CircleMinus,
  ChevronRight,
  PlusIcon,
} from 'lucide-react';
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
  runtimeVariants?: ReadonlyArray<{
    id: string;
    name: string;
    // `readsVfolderConfigFiles` (26.8.0+) is stripped on older managers →
    // undefined; call sites fall back to the legacy `name === 'custom'`
    // heuristic — NEVER `?? false`.
    readsVfolderConfigFiles?: boolean | null;
  }>;
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
  // Widened to the Astryx sibling's emit type (`multiple` is off here, so the
  // array arm never occurs in practice) — `Form.Item` injects this untyped.
  onChange?: (value: string | Array<string> | undefined) => void;
}> = ({ value, onChange }) => {
  'use memo';
  const { t } = useTranslation();
  return (
    <Suspense
      fallback={
        <Selector
          label={t('general.Loading')}
          isLabelHidden
          isDisabled
          options={[]}
          placeholder={t('general.Loading')}
          width="100%"
        />
      }
    >
      <BAIAdminImageSelect
        label={t('adminDeploymentPreset.Image')}
        isLabelHidden
        value={value}
        onChange={onChange}
      />
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

// Seed model for an empty / disabled model definition. Used in both the
// "no existing preset" and "create" initial values so the form has a model
// entry ready when the model definition switch is turned on. `name`/
// `modelPath` are left unset (not `''`) — an empty string is a real value,
// distinct from "the user hasn't provided one".
const EMPTY_MODEL_SEED: ModelConfigFormValue = {
  service: { execution: 'shell', shell: DEFAULT_MODEL_SERVICE_SHELL },
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
  const screens = useBAIBreakpoint();
  const baiClient = useSuspendedBackendaiClient();
  // BA-7210 / FR-3481: managers this version+ resolve an omitted model
  // name/modelPath from the runtime variant baseline / model mount
  // destination at revision resolution, so the form can stop requiring them.
  const supportsNullableModelDefinition = baiClient.supports(
    'preset-model-config-type',
  );
  const commonEnvVars = useCommonEnvVarConfigs();

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
              command @since(version: "26.7.0")
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
    ReadonlyArray<RuntimeVariantPresetValueEntry> | undefined =
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
      RuntimeParameterValues | undefined;
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

  // Legacy managers (`PresetModelConfigInput.name`/`modelPath` are required,
  // non-empty strings pre-BA-7210) cannot submit Service Configuration
  // (Command/Port/etc.) independently of Model Definition — see
  // `buildModelDefinitionInput` in AdminDeploymentPresetSettingPage.tsx.
  // Used below to nest Service Configuration inside the Model Definition
  // card for legacy managers, instead of showing it in Step 1 where it
  // would silently be dropped on submit if the switch is off.
  const runtimeVariantIdWatched = Form.useWatch('runtimeVariantId', form);
  const selectedRuntimeVariantForServiceConfig = runtimeVariants.find(
    (rt) => toLocalId(rt.id) === runtimeVariantIdWatched,
  );
  const readsVfolderConfigFiles = resolvesReadsVfolderConfigFiles(
    selectedRuntimeVariantForServiceConfig,
  );

  // Shared between the two render sites below (Step 1 for nullable-capable
  // managers, nested in the Model Definition card for legacy managers).
  // Health Check and Pre-Start Actions have the same constraint as Service
  // Configuration — all three live inside `PresetModelServiceConfigInput`,
  // nested inside `PresetModelConfigInput` which requires a real name/
  // modelPath pre-BA-7210 — so all three move together.
  const renderServiceConfigurationFormItems = () => (
    <ServiceConfigurationFormItems
      namePrefix={['modelDefinition', 'models', 0, 'service']}
      placeholders={{
        command: t('adminDeploymentPreset.modelDef.StartCommandPlaceholder'),
        port: t('general.Example', { value: '8080' }),
      }}
      portTooltipExtra={
        supportsNullableModelDefinition
          ? t('adminDeploymentPreset.modelDef.PortInheritTooltip')
          : undefined
      }
    />
  );
  const renderHealthCheckAndPreStartActionsFormItems = () => (
    <>
      <ModelServiceHealthCheckFormItems
        namePrefix={['modelDefinition', 'models', 0, 'service']}
        placeholders={{
          path: t('general.Example', { value: '/health' }),
          interval: t('general.Example', { value: '10' }),
          maxRetries: t('general.Example', { value: '10' }),
          maxWaitTime: t('general.Example', { value: '15' }),
          expectedStatusCode: t('general.Example', { value: '200' }),
          initialDelay: t('general.Example', { value: '60' }),
        }}
      />
      <PreStartActionsFormList
        namePrefix={['modelDefinition', 'models', 0, 'service']}
      />
    </>
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
            'SINGLE_NODE' | 'MULTI_NODE' | undefined) ?? undefined,
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
              // The model definition switch gates name/path/metadata (Step 2).
              // A model that only carries service data (port, command, health
              // check) was created with the switch OFF — treat it as disabled
              // so the required name/path fields don't trigger validation.
              // BA-7210: a sparse preset can have name/modelPath both null
              // (inheriting from the variant baseline) while still carrying
              // metadata, so check that too — otherwise editing such a
              // preset shows the switch off, hides its metadata, and the
              // next save drops it.
              enabled: preset.modelDefinition.models.some(
                (m) => !!m.name || !!m.modelPath || !!m.metadata,
              ),
              models: preset.modelDefinition.models.map((m) => {
                // Start Command (FR-3205): reconstruct the raw command string
                // and Execution/Shell mode from whichever field the preset
                // carries — the new single-string `command` (26.7.0+) or the
                // deprecated `startCommand` token list.
                const commandModeState = deriveCommandModeState({
                  command: m.service?.command,
                  shell: m.service?.shell,
                  startCommand: m.service?.startCommand,
                });
                return {
                  // BA-7210 (26.9.0+): `name`/`modelPath` are nullable in the
                  // output now (a sparse preset omits them to inherit the
                  // variant baseline at revision resolution). Fall back to
                  // '' for prefill until the capability-gated "inherited"
                  // UX (FR-3481) lands; older managers never send null here.
                  name: m.name ?? '',
                  modelPath: m.modelPath ?? '',
                  service: m.service
                    ? {
                        port: m.service.port ?? undefined,
                        shell: commandModeState.shell,
                        startCommand: commandModeState.command,
                        execution: commandModeState.execution,
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
                };
              }),
            }
          : // No model on the preset → switch off, but seed one empty model so
            // it is ready when the switch is turned on.
            { enabled: false, models: [EMPTY_MODEL_SEED] },
      };
    }
    return {
      clusterMode: 'MULTI_NODE' as const,
      clusterSize: 1,
      // Model definition is off by default (optional). Seed one empty model so
      // it renders once the switch is turned on.
      modelDefinition: { enabled: false, models: [EMPTY_MODEL_SEED] },
    };
  }, [mode, preset]);

  const applyInitialValues = useEffectEvent(() => {
    if (mode === 'edit') {
      // Edit mode: `initialValues` is computed from the Relay fragment via
      // useMemo and passed as the Form's `initialValues` prop, which antd
      // applies on mount. resetFields() re-applies those values when the
      // preset data changes (e.g. after a Relay store update from a mutation).
      if (!preset) return;
      form.resetFields();
    } else {
      // Create mode: merge URL-synced values on top of defaults so a
      // half-filled form survives a reload.
      form.resetFields();
      form.setFieldsValue(_.merge({}, initialValues, formValuesFromURL));
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

  // `getFieldError` only reports MOUNTED fields, so a step the user has
  // navigated away from always read as clean; `errorFieldNames` comes from the
  // full `validateFields()` sweep and covers every step (FR-3520).
  const stepHasError = (fields: string[]) =>
    fields.some(
      (f) =>
        form.getFieldError(f as never).length > 0 ||
        errorFieldNames.includes(f),
    );

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
      'resourceOpts',
    ]),
    stepHasError([
      'startupCommand',
      'bootstrapScript',
      'modelDefinition',
      'environ',
    ]),
    reviewHasError,
  ];

  // PILOT-DECISION: antd Steps item titles could be ReactNodes, which let the
  // review step tint its title `colorError` without an error icon. Astryx
  // `Step.label` is a plain string, so the review step now reports errors the
  // same way as the other steps — `status="error"` on the Step (color + glyph;
  // note the *current* step always keeps its current-step indicator).
  const stepTitles: string[] = [
    t('adminDeploymentPreset.step.BasicInfo'),
    t('adminDeploymentPreset.step.ModelAndExecution'),
    t('adminDeploymentPreset.step.Review'),
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
          onValuesChange={() => {
            // No Basic/Advanced toggle: submit already ignores a stale Shell
            // value when Execution is Exec (resolveCommandShell()), and
            // PresetReviewSummary gates its Shell display on `execution !==
            // 'exec'` instead of relying on the stored value being cleared,
            // so there's nothing left to reset here.
            syncFormToURL();
          }}
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
            <BAIFormItem
              name="name"
              label={t('adminDeploymentPreset.Name')}
              rules={[
                {
                  required: true,
                  message: t('adminDeploymentPreset.NameRequired'),
                },
              ]}
            >
              <AstryxFormTextInput
                label={t('adminDeploymentPreset.Name')}
                placeholder={t('adminDeploymentPreset.NamePlaceholder')}
              />
            </BAIFormItem>
            <BAIFormItem
              name="description"
              label={t('adminDeploymentPreset.Description')}
            >
              <AstryxFormTextArea
                label={t('adminDeploymentPreset.Description')}
                rows={2}
                placeholder={t('adminDeploymentPreset.DescriptionPlaceholder')}
              />
            </BAIFormItem>
            <BAIFormItem
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
              {/* PILOT-DECISION: antd's custom `showSearch.filterOption`
                  (case-insensitive label match) dropped — Astryx Selector's
                  built-in `hasSearch` filtering covers the same UX. */}
              <AstryxFormSelector
                label={t('adminDeploymentPreset.Runtime')}
                options={runtimeVariantOptions}
                placeholder={t('adminDeploymentPreset.SelectRuntimeVariant')}
                hasSearch
              />
            </BAIFormItem>

            {/* Runtime parameters — appear once a (non-custom) runtime variant
                is selected, directly under the Runtime selector and before the
                Image field. Reuses the Add Revision modal's section so the
                preset can pre-seed runtime-variant preset values; values live
                in the section's own state and are read at submit time. */}
            <BAIFormItem dependencies={['runtimeVariantId']} noStyle>
              {(formArg) => {
                const { getFieldValue } =
                  formArg as FormInstance<AdminDeploymentPresetFormValue>;
                const variantId = getFieldValue('runtimeVariantId');
                const variant = runtimeVariants.find(
                  (rt) => toLocalId(rt.id) === variantId,
                );
                const variantName = variant?.name;
                // Runtime-parameter presets apply only to variants that do NOT
                // read the vfolder config files. `readsVfolderConfigFiles`
                // (26.8.0+) is stripped on older managers → undefined; fall back
                // to the legacy `name === 'custom'` heuristic — NEVER `?? false`.
                const reads =
                  variant?.readsVfolderConfigFiles ?? variantName === 'custom';
                if (!variantName || reads) return null;
                return (
                  // Pull the section up under the Runtime selector (the
                  // selector's default Form.Item marginBottom leaves too large a
                  // gap) and restore a normal field gap before the Image field.
                  <div
                    style={{
                      // Bottom gap comes from the component itself.
                      marginTop: -token.margin,
                    }}
                  >
                    <Suspense fallback={<BAISkeleton />}>
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
            </BAIFormItem>

            {/* Service Configuration (port, command, shell) — shown only when
                the selected runtime variant reads vfolder config files
                (custom) AND the manager supports submitting it independently
                of Model Definition (26.9.0+, `preset-model-config-type`).
                Legacy managers require a real name/modelPath alongside any
                service data (`PresetModelConfigInput.name`/`modelPath` were
                required, non-empty strings pre-BA-7210) — showing this here
                would let a user "set" values that silently never get
                submitted unless Model Definition is also on. For legacy
                managers it's rendered nested inside the Model Definition
                card instead (below). Matches the revision modal's Collapse
                pattern (FR-3205). Reuses the `readsVfolderConfigFiles`
                already watched above instead of re-deriving it here. */}
            {readsVfolderConfigFiles && supportsNullableModelDefinition && (
              <div
                style={{
                  marginTop: -token.margin,
                  marginBottom: token.marginLG,
                }}
              >
                {renderServiceConfigurationFormItems()}
              </div>
            )}

            {/* Health Check + Pre-Start Actions — regardless of runtime
                variant, but (like Service Configuration above) only
                independently of Model Definition on managers that can
                submit them without a real name/modelPath (26.9.0+). Legacy
                managers get these nested inside the Model Definition card
                instead (below). */}
            {supportsNullableModelDefinition &&
              renderHealthCheckAndPreStartActionsFormItems()}

            <BAIFormItem
              name="imageId"
              label={t('adminDeploymentPreset.Image')}
              rules={[{ required: true }]}
              style={{ marginTop: token.marginMD }}
            >
              <ImageSelectField />
            </BAIFormItem>
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
            <BAIFormItem
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
                      <BAIFormItem noStyle>
                        <BAIButton
                          type="dashed"
                          onClick={() => add()}
                          icon={<PlusIcon />}
                          block
                        >
                          {t('adminDeploymentPreset.AddResourceSlot')}
                        </BAIButton>
                      </BAIFormItem>
                    </>
                  )}
                </Form.List>
              </BAIFlex>
            </BAIFormItem>
            <BAIFormItem
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
                        <BAIFormItem
                          {...rest}
                          name={[name, 'name']}
                          style={{ marginBottom: 0, flex: 1 }}
                          rules={[{ required: true, message: '' }]}
                        >
                          {/* PILOT-DECISION: antd `AutoComplete` (free text +
                              one 'shmem' suggestion) has no Astryx equivalent;
                              converted to a plain text input — the placeholder
                              already shows the same example. */}
                          <AstryxFormTextInput
                            label={t('adminDeploymentPreset.ResourceOpts')}
                            placeholder={t('general.Example', {
                              value: 'shmem',
                            })}
                          />
                        </BAIFormItem>
                        <BAIFormItem
                          {...rest}
                          name={[name, 'value']}
                          style={{ marginBottom: 0, flex: 1 }}
                          rules={[{ required: true, message: '' }]}
                        >
                          <AstryxFormTextInput
                            label={t(
                              'session.launcher.EnvironmentVariableValue',
                            )}
                            placeholder={t('general.Example', { value: '64m' })}
                          />
                        </BAIFormItem>
                        <CircleMinus size="1em" onClick={() => remove(name)} />
                      </BAIFlex>
                    ))}
                    <BAIFormItem noStyle>
                      <BAIButton
                        type="dashed"
                        onClick={() => add()}
                        icon={<PlusIcon />}
                        block
                      >
                        {t('adminDeploymentPreset.AddResourceOpt')}
                      </BAIButton>
                    </BAIFormItem>
                  </BAIFlex>
                )}
              </Form.List>
            </BAIFormItem>
            <BAIFlex
              gap="md"
              wrap="wrap"
              style={{ alignItems: 'flex-end', marginTop: token.marginMD }}
            >
              <BAIFormItem
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
                <AstryxFormSelector
                  label={t('adminDeploymentPreset.ClusterMode')}
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
              </BAIFormItem>
              <BAIFormItem
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
                <AstryxFormNumberInput
                  label={t('adminDeploymentPreset.ClusterSize')}
                  min={1}
                  placeholder={t(
                    'adminDeploymentPreset.ClusterSizePlaceholder',
                  )}
                />
              </BAIFormItem>
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
            <BAIFormItem
              name="startupCommand"
              label={t('adminDeploymentPreset.StartupCommand')}
              tooltip={t('adminDeploymentPreset.StartupCommandTooltip')}
              extra={t('modelService.StartCommandHelperShell')}
            >
              <AstryxFormTextArea
                label={t('adminDeploymentPreset.StartupCommand')}
                rows={2}
                placeholder={t(
                  'adminDeploymentPreset.StartupCommandPlaceholder',
                )}
              />
            </BAIFormItem>
            <BAIFormItem
              name="bootstrapScript"
              label={t('adminDeploymentPreset.BootstrapScript')}
            >
              <AstryxFormTextArea
                label={t('adminDeploymentPreset.BootstrapScript')}
                rows={3}
                placeholder={t(
                  'adminDeploymentPreset.BootstrapScriptPlaceholder',
                )}
              />
            </BAIFormItem>
            <BAIFormItem
              label={t('adminDeploymentPreset.EnvironmentVariables')}
              style={{ marginBottom: 0 }}
            >
              <EnvVarFormList name="environ" optionalEnvVars={commonEnvVars} />
            </BAIFormItem>
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
              <BAIFormItem
                name={['modelDefinition', 'enabled']}
                valuePropName="checked"
                noStyle
              >
                <AstryxFormSwitch
                  label={t('adminDeploymentPreset.ModelDefinition')}
                />
              </BAIFormItem>
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
              <ModelConfigItem
                readsVfolderConfigFiles={readsVfolderConfigFiles}
              />
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
              <BAIFormItem
                name="replicaCount"
                label={t('adminDeploymentPreset.Replicas')}
                tooltip={t('adminDeploymentPreset.ReplicasTooltip')}
                style={{ flex: 1, minWidth: 120 }}
                rules={[{ required: true }]}
              >
                <AstryxFormNumberInput
                  label={t('adminDeploymentPreset.Replicas')}
                  min={1}
                  placeholder={t('adminDeploymentPreset.ReplicasPlaceholder')}
                />
              </BAIFormItem>
              <BAIFormItem
                name="revisionHistoryLimit"
                label={t('adminDeploymentPreset.RevisionHistoryLimit')}
                tooltip={t('adminDeploymentPreset.RevisionHistoryLimitTooltip')}
                style={{ flex: 1, minWidth: 120 }}
              >
                <AstryxFormNumberInput
                  label={t('adminDeploymentPreset.RevisionHistoryLimit')}
                  min={1}
                  placeholder={t(
                    'adminDeploymentPreset.RevisionHistoryLimitPlaceholder',
                  )}
                />
              </BAIFormItem>
            </BAIFlex>
            <BAIFormItem
              name="openToPublic"
              valuePropName="checked"
              tooltip={t('adminDeploymentPreset.OpenToPublicTooltip')}
            >
              <AstryxFormCheckbox
                label={t('adminDeploymentPreset.OpenToPublic')}
              />
            </BAIFormItem>
          </BAICard>

          {/* ----------------------------------------------------------------
              Step 3 — Review
          ---------------------------------------------------------------- */}
          {currentStepKey === 'review' && (
            <BAIFormItem noStyle shouldUpdate>
              {() => (
                <Suspense fallback={<BAISkeleton />}>
                  <PresetReviewSummary
                    form={form}
                    onGoToStep={goToStep}
                    runtimeVariants={runtimeVariants}
                    errorFieldNames={errorFieldNames}
                    runtimeParamRows={getRuntimeParamReviewRows()}
                  />
                </Suspense>
              )}
            </BAIFormItem>
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
                variant="secondary"
                icon={<ChevronLeft size="1em" />}
                label={t('button.Previous')}
                onClick={() => goToStep(currentStepIndex - 1)}
              />
            )}
            {isLastStep ? (
              onSubmit && (
                <BAIButton
                  type="primary"
                  loading={isSubmitting}
                  disabled={reviewHasError}
                  action={onSubmit}
                >
                  {mode === 'edit' ? t('button.Save') : t('button.Create')}
                </BAIButton>
              )
            ) : (
              <>
                {/* PILOT-DECISION: antd `type="primary" ghost` (outlined
                    primary) has no Astryx variant; `variant="primary"` is the
                    nearest expression — Next is the main action on non-final
                    steps, so solid primary reads correctly. */}
                <Button
                  variant="primary"
                  label={t('button.Next')}
                  endContent={<ChevronRight size="1em" />}
                  onClick={() => goToStep(currentStepIndex + 1)}
                />
                <Button
                  variant="secondary"
                  label={t('adminDeploymentPreset.nav.SkipToReview')}
                  endContent={<ChevronsRight size="1em" />}
                  onClick={() => goToStep(STEP_KEYS.length - 1)}
                />
              </>
            )}
          </BAIFlex>
        </Form>
      </BAIFlex>

      {/* Right-side vertical Steps panel — mirrors DeploymentLauncherPageContent.
          Hidden below lg so the form gets the full viewport width on small screens. */}
      {screens.lg && (
        <BAIFlex style={{ position: 'sticky', top: 80 }}>
          {/* PILOT-DECISION: antd Steps → lab Stepper. `current`→`activeStep`,
              `onChange`→`onStepClick`, `size="small"`→`density="compact"`;
              antd's explicit 'process'/'wait' statuses are derived
              automatically from `activeStep` and were dropped. Note Astryx
              only makes completed/current steps clickable — forward jumps go
              through the Next / Skip-to-Review buttons instead of the rail. */}
          <Stepper
            activeStep={currentStepIndex}
            orientation="vertical"
            density="compact"
            // FR-3596: on-track puts each indicator on the connector line.
            // Keep in sync with the Session Launcher rail this one mirrors.
            indicatorPosition="on-track"
            onStepClick={(nextIndex) => goToStep(nextIndex)}
          >
            {stepTitles.map((title, idx) => (
              <Step
                key={title}
                step={idx}
                label={title}
                status={stepErrors[idx] ? 'error' : undefined}
              />
            ))}
          </Stepper>
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
