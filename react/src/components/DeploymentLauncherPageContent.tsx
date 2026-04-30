/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DeploymentLauncherPageContentPresetSummaryQuery } from '../__generated__/DeploymentLauncherPageContentPresetSummaryQuery.graphql';
import { DeploymentLauncherPageContent_deployment$key } from '../__generated__/DeploymentLauncherPageContent_deployment.graphql';
import { parseCliCommand } from '../helper/parseCliCommand';
import {
  mergeExtraArgs,
  reverseMapExtraArgs,
} from '../helper/runtimeExtraArgsParser';
import { useSuspendedBackendaiClient } from '../hooks';
import { ResourceSlotName, useResourceSlots } from '../hooks/backendai';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import {
  buildArgsSchemaKeySet,
  buildDefaultsMap,
  flattenPresets,
  getAllExtraArgsEnvVarNames,
  getExtraArgsEnvVarName,
  type RuntimeParameterGroup,
} from '../hooks/useRuntimeParameterSchema';
import ErrorBoundaryWithNullFallback from './ErrorBoundaryWithNullFallback';
import ImageEnvironmentSelectFormItems, {
  ImageEnvironmentFormInput,
} from './ImageEnvironmentSelectFormItems';
import ResourcePresetSelect from './ResourcePresetSelect';
import RuntimeParameterFormSection, {
  RuntimeParameterValues,
} from './RuntimeParameterFormSection';
import SourceCodeView from './SourceCodeView';
import VFolderLazyView from './VFolderLazyView';
import VFolderSelect from './VFolderSelect';
import {
  DoubleRightOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { useDebounceFn } from 'ahooks';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Descriptions,
  Form,
  Grid,
  Input,
  InputNumber,
  Segmented,
  Select,
  Steps,
  Tag,
  Tour,
  Typography,
  theme,
} from 'antd';
import type { FormInstance, StepsProps } from 'antd';
import {
  BAIButton,
  BAICard,
  BAIFlex,
  BAIProjectResourceGroupSelect,
  BAIResourceNumberWithIcon,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import {
  parseAsJson,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from 'nuqs';
import React, {
  Suspense,
  useCallback,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
} from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

/**
 * URL-synced step keys for the multi-step deployment launcher.
 * Step order is meaningful: basic → model → resources → review.
 */
const STEP_KEYS = ['basic', 'model', 'resources', 'review'] as const;
type StepKey = (typeof STEP_KEYS)[number];

/**
 * Cluster modes that the ModelRevision schema accepts.
 * (Matches `ClusterMode` in data/schema.graphql.)
 */
type ClusterMode = 'SINGLE_NODE' | 'MULTI_NODE';

/** Model-definition authoring mode, mirroring ServiceLauncherPageContent. */
export type CustomDefinitionMode = 'command' | 'file';

/**
 * Form value shape. Field names mirror the Strawberry GraphQL inputs
 * (`CreateDeploymentInput` + `AddRevisionInput`) so that FR-2675's
 * mutation wiring can serialize these values directly without
 * renaming. Keep this interface in sync with the schema.
 */
export type DeploymentLauncherFormValue = ImageEnvironmentFormInput & {
  // Step 1 — Basic Info
  name: string;
  tags: string[];
  openToPublic: boolean;

  // Step 2 — Model & Runtime
  /** vfolder UUID stored by VFolderSelect (valuePropName="id"). */
  modelFolderId: string;
  runtimeVariant: string;
  /** UUID of the selected runtime variant — populated automatically when runtimeVariant changes. */
  runtimeVariantId?: string;
  /** Whether the model definition is authored as a CLI command or a config file. */
  customDefinitionMode?: CustomDefinitionMode;
  startCommand?: string;
  commandPort?: number;
  commandHealthCheck?: string;
  commandModelMount?: string;
  commandInitialDelay?: number;
  commandMaxRetries?: number;
  /** Used in file mode only. */
  modelDefinitionPath?: string;
  /** Used in file mode only. */
  modelMountDestination?: string;
  clusterMode: ClusterMode;
  clusterSize: number;

  // Step 3 — Resources & Replicas
  resourceGroup: string;
  resourcePresetId?: string;
  desiredReplicaCount: number;
  autoScalingEnabled: boolean;
};

export interface DeploymentLauncherPageContentProps {
  mode: 'create' | 'edit';
  form: FormInstance<DeploymentLauncherFormValue>;
  /**
   * Only required (and only used) when `mode === 'edit'`.
   * Provides the deployment snapshot used to pre-fill the form.
   */
  deploymentFrgmt?: DeploymentLauncherPageContent_deployment$key | null;
  /** Available runtime variants fetched by the parent page layout. */
  runtimeVariants?: ReadonlyArray<{ name: string; rowId: string }>;
  /**
   * Optional change observer forwarded to the underlying antd `<Form>`.
   * Useful for parent pages that want to persist the draft state
   * (e.g. a URL JSON param) without having to read from the form
   * instance on every keystroke.
   */
  onValuesChange?: (
    changed: Partial<DeploymentLauncherFormValue>,
    all: DeploymentLauncherFormValue,
  ) => void;
  /** Called when the user clicks the Cancel button in the footer. */
  onCancel?: () => void;
  /** Called when the user clicks the submit button on the review step. */
  onSubmit?: () => Promise<void>;
  /** When true the submit button shows a loading spinner and is disabled. */
  isSubmitting?: boolean;
  /**
   * Ref populated by this component so the parent page can call
   * `serializeRuntimeParamsToEnviron` at submit time to wire runtime
   * parameter UI values into the mutation's `environ` entries.
   */
  serializerRef?: React.MutableRefObject<{
    serializeRuntimeParamsToEnviron: (
      environ: Record<string, string>,
      runtimeVariant: string,
    ) => void;
  } | null>;
}

/**
 * Default values applied when neither `deploymentFrgmt` nor
 * `preFilledModel` is provided. Also used as the merge base for
 * edit-mode pre-fill so that un-populated fields get safe defaults.
 */
const DEFAULT_FORM_VALUES: DeploymentLauncherFormValue = {
  name: '',
  tags: [],
  openToPublic: false,
  modelFolderId: '',
  runtimeVariant: 'custom',
  customDefinitionMode: 'command',
  startCommand: undefined,
  commandPort: 8000,
  commandHealthCheck: '/health',
  commandModelMount: '/models',
  commandInitialDelay: 60,
  commandMaxRetries: 10,
  modelDefinitionPath: 'model-definition.yaml',
  modelMountDestination: '/models',
  clusterMode: 'SINGLE_NODE',
  clusterSize: 1,
  resourceGroup: '',
  resourcePresetId: undefined,
  desiredReplicaCount: 1,
  autoScalingEnabled: false,
  environments: {
    environment: '',
    version: '',
    image: undefined,
  },
};

/**
 * DeploymentLauncherPageContent — multi-step deployment launcher form body.
 *
 * This component is **the form body only**. The outer page (route handler,
 * header, submit wiring, and GQL mutations) is owned by `DeploymentLauncherPage`
 * (FR-2675). That page owns the `FormInstance` and passes it in via the
 * `form` prop so it can call `form.validateFields()` + submit on its own.
 *
 * URL sync: the current step is persisted to the `?step=` query param via nuqs
 * (`basic | model | resources | review`). Invalid values fall back to `basic`.
 *
 * Pre-fill:
 *  - `mode === 'edit'`: read `deploymentFrgmt` and merge into initial values.
 *  - `mode === 'create'`: if `preFilledModel` is set, pre-select the model folder.
 */
const DeploymentLauncherPageContent: React.FC<
  DeploymentLauncherPageContentProps
> = ({
  mode,
  form,
  deploymentFrgmt,
  runtimeVariants = [],
  onValuesChange,
  onCancel,
  onSubmit,
  isSubmitting,
  serializerRef,
}) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();
  const screens = Grid.useBreakpoint();
  // Debounced CLI command parser — auto-fills port/health/mount from the
  // pasted command, mirroring ServiceLauncherPageContent behaviour.
  const { run: parseCommandWithDebounce } = useDebounceFn(
    (command: string) => {
      const parsed = parseCliCommand(command);
      form.setFieldsValue({
        commandPort: parsed.port,
        commandHealthCheck: parsed.healthCheckPath,
        commandModelMount: parsed.modelMountDestination,
      });
    },
    { wait: 400 },
  );

  const currentProject = useCurrentProjectValue();

  // Refs for runtime parameter UI values. Kept outside form state so that
  // slider/input changes don't re-render the whole page. Read at submit time.
  const runtimeParamValuesRef = useRef<RuntimeParameterValues>({});
  const runtimeParamTouchedKeysRef = useRef<Set<string>>(new Set());
  const runtimeParamGroupsRef = useRef<RuntimeParameterGroup[] | null>(null);

  const handleGroupsLoaded = useCallback(
    (groups: RuntimeParameterGroup[] | null) => {
      runtimeParamGroupsRef.current = groups;
    },
    [],
  );
  const handleRuntimeParamChange = useCallback(
    (values: RuntimeParameterValues) => {
      runtimeParamValuesRef.current = {
        ...runtimeParamValuesRef.current,
        ...values,
      };
    },
    [],
  );
  const handleTouchedKeysChange = useCallback((keys: Set<string>) => {
    runtimeParamTouchedKeysRef.current = keys;
  }, []);

  // Serialize runtime parameter UI values into an environ map.
  // Mirrors ServiceLauncherPageContent.serializeRuntimeParamsToEnviron.
  const serializeRuntimeParamsToEnviron = (
    environ: Record<string, string>,
    runtimeVariant: string,
  ) => {
    const groups = runtimeParamGroupsRef.current;
    if (!groups || Object.keys(runtimeParamValuesRef.current).length === 0)
      return;

    const extraArgsEnvVar = getExtraArgsEnvVarName(runtimeVariant);
    for (const envName of getAllExtraArgsEnvVarNames()) {
      if (envName !== extraArgsEnvVar) delete environ[envName];
    }

    const touchedValues: Record<string, string> = {};
    for (const [key, val] of Object.entries(runtimeParamValuesRef.current)) {
      if (runtimeParamTouchedKeysRef.current.has(key)) touchedValues[key] = val;
    }

    const presets = flattenPresets(groups);
    const presetMap = new Map(presets.map((p) => [p.key, p]));
    const defaults = buildDefaultsMap(groups);
    const argsValues: Record<string, string> = {};
    const envValues: Record<string, string> = {};

    for (const [key, val] of Object.entries(touchedValues)) {
      if (val === '' || val === undefined) continue;
      const preset = presetMap.get(key);
      if (!preset) continue;
      if (preset.presetTarget === 'ENV') envValues[key] = val;
      else argsValues[key] = val;
    }

    const argsSchemaKeys = buildArgsSchemaKeySet(groups);
    if (environ[extraArgsEnvVar] && argsSchemaKeys.size > 0) {
      const { unmappedText } = reverseMapExtraArgs(
        environ[extraArgsEnvVar],
        argsSchemaKeys,
      );
      if (unmappedText) environ[extraArgsEnvVar] = unmappedText;
      else delete environ[extraArgsEnvVar];
    }

    for (const preset of presets) {
      if (preset.presetTarget === 'ENV') delete environ[preset.key];
    }

    if (Object.keys(argsValues).length > 0) {
      const manualArgs = environ[extraArgsEnvVar] ?? '';
      const merged = mergeExtraArgs(argsValues, manualArgs, defaults);
      if (merged) environ[extraArgsEnvVar] = merged;
      else delete environ[extraArgsEnvVar];
    }

    for (const [key, val] of Object.entries(envValues)) {
      const preset = presetMap.get(key);
      if (preset?.defaultValue !== null && preset?.defaultValue === val)
        continue;
      environ[key] = val;
    }
  };

  useEffect(() => {
    if (serializerRef) {
      serializerRef.current = { serializeRuntimeParamsToEnviron };
    }
  });

  // Snapshot of runtime param state, populated when entering the review step.
  // Using state (not refs) so DeploymentReviewSummary can read it during render.
  const [runtimeParamSnapshot, setRuntimeParamSnapshot] = React.useState<{
    values: RuntimeParameterValues;
    touchedKeys: Set<string>;
    groups: RuntimeParameterGroup[] | null;
  } | null>(null);

  const captureSnapshot = useEffectEvent(() => {
    setRuntimeParamSnapshot({
      values: { ...runtimeParamValuesRef.current },
      touchedKeys: new Set(runtimeParamTouchedKeysRef.current),
      groups: runtimeParamGroupsRef.current,
    });
  });

  // Deployment fragment — used for edit-mode pre-fill. Fields mirror the
  // Field mapping documented in .specs/FR-1368-endpoint-deployment-migration/spec.md.
  // Only fields the form needs are selected here to keep the query minimal.
  const deployment = useFragment(
    graphql`
      fragment DeploymentLauncherPageContent_deployment on ModelDeployment {
        id
        metadata {
          name
          tags
        }
        networkAccess {
          openToPublic
        }
        replicaState {
          desiredReplicaCount
        }
        currentRevision @since(version: "26.4.3") {
          id
          clusterConfig {
            mode
            size
          }
          resourceConfig {
            resourceGroupName
          }
          modelRuntimeConfig {
            runtimeVariantId
            runtimeVariant {
              name
            }
          }
          modelMountConfig {
            vfolderId
            mountDestination
            definitionPath
          }
          imageV2 @since(version: "26.4.3") {
            id
            identity {
              canonicalName
            }
          }
        }
      }
    `,
    deploymentFrgmt ?? null,
  );

  // URL-synced step and pre-fill params. nuqs manages all four so that
  // step navigation (setQuery({ step: … })) never strips the pre-fill
  // params from the URL, and so the content component reads them
  // directly without relying on prop drilling through the Suspense boundary.
  const [
    {
      step: currentStepKey,
      model: urlModel,
      resourceGroup: urlResourceGroup,
      resourcePresetId: urlResourcePresetId,
      formValues: formValuesFromURL,
    },
    setQuery,
  ] = useQueryStates({
    step: parseAsStringLiteral(STEP_KEYS).withDefault('basic'),
    model: parseAsString,
    resourceGroup: parseAsString,
    resourcePresetId: parseAsString,
    formValues: parseAsJson<Partial<DeploymentLauncherFormValue>>(
      (v) => v as Partial<DeploymentLauncherFormValue>,
    ).withDefault({} as Partial<DeploymentLauncherFormValue>),
  });

  const currentStepIndex = STEP_KEYS.indexOf(currentStepKey);
  const isLastStep = currentStepIndex === STEP_KEYS.length - 1;
  const isFirstStep = currentStepIndex === 0;

  // Compute initial values once per mount. In edit mode we read every
  // mapped field from the deployment fragment; in create mode we merge
  // URL pre-fill params (model, resourceGroup, resourcePresetId) on top
  // of DEFAULT_FORM_VALUES so any unspecified field keeps its safe default.
  const initialValues: DeploymentLauncherFormValue = useMemo(() => {
    if (mode === 'edit' && deployment) {
      const revision = deployment.currentRevision;
      return _.merge({}, DEFAULT_FORM_VALUES, {
        name: deployment.metadata.name,
        tags: [...(deployment.metadata.tags ?? [])],
        openToPublic: deployment.networkAccess.openToPublic,
        modelFolderId: revision?.modelMountConfig?.vfolderId ?? '',
        modelDefinitionPath:
          revision?.modelMountConfig?.definitionPath ??
          DEFAULT_FORM_VALUES.modelDefinitionPath,
        modelMountDestination:
          revision?.modelMountConfig?.mountDestination ??
          DEFAULT_FORM_VALUES.modelMountDestination,
        runtimeVariant:
          revision?.modelRuntimeConfig?.runtimeVariant?.name ??
          DEFAULT_FORM_VALUES.runtimeVariant,
        runtimeVariantId:
          revision?.modelRuntimeConfig?.runtimeVariantId ?? undefined,
        clusterMode: (revision?.clusterConfig?.mode ??
          DEFAULT_FORM_VALUES.clusterMode) as ClusterMode,
        clusterSize:
          revision?.clusterConfig?.size ?? DEFAULT_FORM_VALUES.clusterSize,
        resourceGroup: revision?.resourceConfig?.resourceGroupName ?? '',
        desiredReplicaCount: deployment.replicaState.desiredReplicaCount,
      } satisfies Partial<DeploymentLauncherFormValue>);
    }
    return _.merge({}, DEFAULT_FORM_VALUES, {
      ...(urlModel && { modelFolderId: urlModel }),
      ...(urlResourceGroup && { resourceGroup: urlResourceGroup }),
      ...(urlResourcePresetId && { resourcePresetId: urlResourcePresetId }),
    });
  }, [mode, deployment, urlModel, urlResourceGroup, urlResourcePresetId]);

  // Apply initial values to the parent-owned form instance exactly once
  // per mount / deployment change. Using `useEffectEvent` keeps the
  // latest `form` reference without turning it into a re-sync trigger;
  // the synchronization key is intentionally just the deployment id
  // (or the pre-filled model) so the form doesn't reset on unrelated
  // prop identity changes.
  const applyInitialValues = useEffectEvent(() => {
    // In create mode, merge persisted form state from URL on top of the
    // computed initial values. formValuesFromURL is read here via
    // useEffectEvent so it always reflects the latest URL state without
    // polluting the effect's dependency array.
    const merged =
      mode === 'create'
        ? _.merge({}, initialValues, formValuesFromURL)
        : initialValues;

    // In create mode, skip setting an empty resourceGroup so that
    // BAIProjectResourceGroupSelect.autoSelectDefault can pick the first option.
    // Child effects (auto-select) run before parent effects (this one), so
    // passing '' here would override the already-selected value.
    form.setFieldsValue(
      mode === 'create' && !merged.resourceGroup
        ? _.omit(merged, 'resourceGroup')
        : merged,
    );
  });

  // Debounced URL sync — only in create mode to avoid clobbering
  // deployment-specific deep-link params set by VFolderDeployModal.
  // Excludes image object and customizedTag (complex / non-serializable).
  const { run: syncFormToURL } = useDebounceFn(
    () => {
      if (mode !== 'create') return;
      const currentValue = form.getFieldsValue();
      setQuery(
        {
          formValues: _.omit(currentValue, [
            'environments.image',
            'environments.customizedTag',
          ]) as Partial<DeploymentLauncherFormValue>,
        },
        { history: 'replace' },
      );
    },
    { leading: false, wait: 500, trailing: true },
  );

  useEffect(() => {
    applyInitialValues();
  }, [deployment?.id, urlModel, urlResourceGroup, urlResourcePresetId]);

  const setCurrentStep = (nextKey: StepKey) => {
    setQuery({ step: nextKey }, { history: 'push' });
  };

  const goToStep = (nextIndex: number) => {
    const clamped = _.clamp(nextIndex, 0, STEP_KEYS.length - 1);
    const nextKey = STEP_KEYS[clamped];
    if (nextKey) setCurrentStep(nextKey);
  };

  // Trigger full form validation and snapshot runtime params when reaching review.
  // No need to clear the snapshot on step-back: the review component only mounts
  // when currentStepKey === 'review', so a stale snapshot is never visible.
  useEffect(() => {
    if (currentStepIndex === STEP_KEYS.length - 1) {
      form.validateFields().catch(() => {});
      captureSnapshot();
    }
  }, [currentStepIndex, form]);

  // Step metadata. Titles come straight from the FR-2666 keys
  // (`deployment.step.*`) so copy changes land in one place.
  const stepItems: NonNullable<StepsProps['items']> = [
    { title: t('deployment.step.BasicInfo') },
    { title: t('deployment.step.ModelAndRuntime') },
    { title: t('deployment.step.ResourcesAndReplicas') },
    { title: t('deployment.step.ReviewAndCreate') },
  ];

  const runtimeVariantOptions = _.map(runtimeVariants, (rt) => ({
    value: rt.name,
    label: rt.name,
  }));

  return (
    <BAIFlex direction="row" gap="md" align="start" style={{ width: '100%' }}>
      <BAIFlex
        direction="column"
        align="stretch"
        style={{ flex: 1, maxWidth: 800 }}
      >
        {mode === 'edit' && (
          <Alert
            type="info"
            showIcon
            title={t('deployment.EditModeBanner')}
            style={{ marginBottom: token.marginMD }}
          />
        )}

        <Form<DeploymentLauncherFormValue>
          form={form}
          layout="vertical"
          initialValues={initialValues}
          onValuesChange={(changed, all) => {
            onValuesChange?.(changed, all);
            syncFormToURL();
          }}
          scrollToFirstError
        >
          {/* --- Step 1: Basic Info --- */}
          <Card
            title={t('deployment.step.BasicInfo')}
            style={{
              display: currentStepKey === 'basic' ? 'block' : 'none',
            }}
          >
            <Form.Item
              name="name"
              label={t('deployment.Name')}
              rules={[
                {
                  required: true,
                  message: t('deployment.NameRequired'),
                },
              ]}
            >
              <Input
                placeholder={t('deployment.NamePlaceholder')}
                // In edit mode the deployment name is immutable — edits go
                // through new revisions, not metadata renames.
                disabled={mode === 'edit'}
              />
            </Form.Item>
            <Form.Item name="tags" label={t('deployment.Tags')}>
              <Select
                mode="tags"
                tokenSeparators={[',']}
                placeholder={t('deployment.TagsPlaceholder')}
                notFoundContent={null}
                allowClear
              />
            </Form.Item>
            <Form.Item name="openToPublic" valuePropName="checked">
              <Checkbox>{t('deployment.OpenToPublic')}</Checkbox>
            </Form.Item>
          </Card>

          {/* --- Step 2: Model & Runtime --- */}
          <Card
            title={t('deployment.step.ModelAndRuntime')}
            style={{
              display: currentStepKey === 'model' ? 'block' : 'none',
            }}
          >
            {/* Model folder — stores UUID (valuePropName="id"); antd Select
                displays the folder name as label while the form value stays
                as the UUID for mutation wiring. */}
            <Form.Item
              name="modelFolderId"
              label={t('deployment.ModelFolder')}
              rules={[{ required: true }]}
            >
              <VFolderSelect
                valuePropName="id"
                filter={(vf) =>
                  vf.usage_mode === 'model' &&
                  vf.status === 'ready' &&
                  vf.ownership_type !== 'group'
                }
                disabled={mode === 'edit'}
                showOpenButton
                showCreateButton
                showRefreshButton
              />
            </Form.Item>

            {/* Runtime variant — fetched from /services/_/runtimes */}
            <Form.Item
              name="runtimeVariant"
              label={t('modelService.RuntimeVariant')}
              rules={[{ required: true }]}
            >
              <Select
                options={runtimeVariantOptions}
                defaultActiveFirstOption
                showSearch
              />
            </Form.Item>

            {/* Environment / image selector */}
            <Suspense fallback={null}>
              <ImageEnvironmentSelectFormItems />
            </Suspense>

            {/* Runtime parameter section — shown only for non-custom variants */}
            <Form.Item dependencies={['runtimeVariant']} noStyle>
              {({ getFieldValue }) => {
                const variant = getFieldValue('runtimeVariant');
                if (!variant || variant === 'custom') return null;
                // TODO(needs-backend): reverse-map existing environ for edit mode once wiring lands
                void getExtraArgsEnvVarName;
                return (
                  <Suspense fallback={null}>
                    <RuntimeParameterFormSection
                      runtimeVariant={variant}
                      onChange={handleRuntimeParamChange}
                      onTouchedKeysChange={handleTouchedKeysChange}
                      onGroupsLoaded={handleGroupsLoaded}
                      initialExtraArgs=""
                      initialEnvVars={undefined}
                    />
                  </Suspense>
                );
              }}
            </Form.Item>

            {/* Model definition — command vs. config-file mode */}
            <Form.Item dependencies={['runtimeVariant']} noStyle>
              {({ getFieldValue }) =>
                getFieldValue('runtimeVariant') === 'custom' && (
                  <Card
                    size="small"
                    title={t('modelService.ModelDefinition')}
                    style={{ marginBottom: token.marginMD }}
                  >
                    <Form.Item name="customDefinitionMode" noStyle>
                      <Segmented
                        options={[
                          {
                            label: t('modelService.EnterCommand'),
                            value: 'command',
                          },
                          {
                            label: t('modelService.UseConfigFile'),
                            value: 'file',
                          },
                        ]}
                        style={{ marginBottom: token.marginMD }}
                      />
                    </Form.Item>

                    <Form.Item dependencies={['customDefinitionMode']} noStyle>
                      {({ getFieldValue: getField }) =>
                        getField('customDefinitionMode') === 'command' ? (
                          <>
                            <Form.Item
                              name="startCommand"
                              label={t('modelService.StartCommand')}
                              tooltip={t('modelService.StartCommandTooltip')}
                              rules={[{ required: true, whitespace: true }]}
                            >
                              <Input.TextArea
                                placeholder={t(
                                  'modelService.StartCommandPlaceholder',
                                )}
                                autoSize={{ minRows: 2 }}
                                onChange={(e) =>
                                  parseCommandWithDebounce(e.target.value)
                                }
                              />
                            </Form.Item>
                            <Form.Item
                              name="commandModelMount"
                              label={t('modelService.ModelMountDestination')}
                              tooltip={t('modelService.ModelMountTooltip')}
                            >
                              <Input placeholder="/models" />
                            </Form.Item>
                            <BAIFlex direction="row" gap="sm" align="end">
                              <Form.Item
                                name="commandPort"
                                label={t('modelService.Port')}
                                tooltip={t('modelService.PortTooltip')}
                                style={{ flex: 1 }}
                                labelCol={{ style: { width: '100%' } }}
                              >
                                <InputNumber
                                  min={1}
                                  max={65535}
                                  style={{ width: '100%' }}
                                />
                              </Form.Item>
                              <Form.Item
                                name="commandHealthCheck"
                                label={t('modelService.HealthCheck')}
                                tooltip={t('modelService.HealthCheckTooltip')}
                                style={{ flex: 1 }}
                                labelCol={{ style: { width: '100%' } }}
                              >
                                <Input placeholder="/health" />
                              </Form.Item>
                            </BAIFlex>
                            <BAIFlex direction="row" gap="sm" align="end">
                              <Form.Item
                                name="commandInitialDelay"
                                label={t('modelService.InitialDelay')}
                                tooltip={t('modelService.InitialDelayTooltip')}
                                style={{ flex: 1 }}
                                labelCol={{ style: { width: '100%' } }}
                              >
                                <InputNumber
                                  min={0}
                                  step={0.5}
                                  style={{ width: '100%' }}
                                />
                              </Form.Item>
                              <Form.Item
                                name="commandMaxRetries"
                                label={t('modelService.MaxRetries')}
                                tooltip={t('modelService.MaxRetriesTooltip')}
                                style={{ flex: 1 }}
                                labelCol={{ style: { width: '100%' } }}
                              >
                                <InputNumber
                                  min={0}
                                  style={{ width: '100%' }}
                                />
                              </Form.Item>
                            </BAIFlex>
                          </>
                        ) : (
                          <>
                            <Form.Item
                              name="modelMountDestination"
                              label={t('modelService.ModelMountDestination')}
                              tooltip={t('modelService.ModelMountTooltip')}
                            >
                              <Input allowClear placeholder="/models" />
                            </Form.Item>
                            <Form.Item
                              name="modelDefinitionPath"
                              label={t('modelService.ModelDefinitionPath')}
                              tooltip={t(
                                'modelService.ModelDefinitionPathTooltip',
                              )}
                            >
                              <Input
                                allowClear
                                placeholder="model-definition.yaml"
                              />
                            </Form.Item>
                          </>
                        )
                      }
                    </Form.Item>
                  </Card>
                )
              }
            </Form.Item>
          </Card>

          {/* --- Step 3: Resources & Replicas --- */}
          <Card
            title={t('deployment.step.ResourcesAndReplicas')}
            style={{
              display: currentStepKey === 'resources' ? 'block' : 'none',
            }}
          >
            <Form.Item
              name="resourceGroup"
              label={t('session.ResourceGroup')}
              rules={[{ required: true }]}
            >
              <BAIProjectResourceGroupSelect
                projectName={currentProject.name ?? ''}
                autoSelectDefault
                showSearch
              />
            </Form.Item>
            <Form.Item dependencies={['resourceGroup']} noStyle>
              {({ getFieldValue }) => (
                <Form.Item
                  name="resourcePresetId"
                  label={t('resourcePreset.ResourcePresets')}
                >
                  <ResourcePresetSelect
                    resourceGroup={getFieldValue('resourceGroup')}
                    autoSelectDefault
                    showSearch
                  />
                </Form.Item>
              )}
            </Form.Item>
            <Form.Item
              name="desiredReplicaCount"
              label={t('deployment.DesiredReplicas')}
              rules={[{ required: true }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="autoScalingEnabled" valuePropName="checked">
              <Checkbox>{t('deployment.AutoScaling')}</Checkbox>
            </Form.Item>
          </Card>

          {/* --- Step 4: Review & Create --- */}
          {currentStepKey === 'review' && (
            <Form.Item noStyle shouldUpdate>
              {() => (
                <DeploymentReviewSummary
                  form={form}
                  mode={mode}
                  onGoToStep={goToStep}
                  runtimeParamSnapshot={runtimeParamSnapshot}
                />
              )}
            </Form.Item>
          )}

          {/* --- Footer navigation ---
            Single row of nav controls shared across every step, per
            FR-1368 Flow 2 spec. Layout mirrors SessionLauncherPage:
            Cancel on the left, Previous / Next / Submit on the right.
            "Skip to Review" is hidden on the last step; Previous is
            hidden on the first step. */}
          <BAIFlex
            direction="row"
            justify="between"
            gap="sm"
            style={{ marginTop: token.marginMD }}
            data-test-id="deployment-launcher-tour-step-navigation"
          >
            <BAIFlex gap="sm">
              {onCancel && (
                <Button onClick={onCancel} disabled={isSubmitting}>
                  {t('button.Cancel')}
                </Button>
              )}
            </BAIFlex>
            <BAIFlex direction="row" gap="sm">
              {!isFirstStep && (
                <Button
                  icon={<LeftOutlined />}
                  onClick={() => goToStep(currentStepIndex - 1)}
                >
                  {t('deployment.nav.Previous')}
                </Button>
              )}
              {isLastStep ? (
                onSubmit && (
                  <BAIButton
                    type="primary"
                    loading={isSubmitting}
                    action={onSubmit}
                  >
                    {mode === 'edit'
                      ? t('deployment.UpdateDeployment')
                      : t('deployment.CreateDeployment')}
                  </BAIButton>
                )
              ) : (
                <>
                  <Button
                    type="primary"
                    ghost
                    onClick={() => goToStep(currentStepIndex + 1)}
                  >
                    {t('deployment.nav.Next')} <RightOutlined />
                  </Button>
                  <Button onClick={() => goToStep(STEP_KEYS.length - 1)}>
                    {t('deployment.nav.SkipToReview')}
                    <DoubleRightOutlined />
                  </Button>
                </>
              )}
            </BAIFlex>
          </BAIFlex>
        </Form>
      </BAIFlex>

      {/* Right-side vertical Steps panel — hidden below `lg` so the
        form gets the full viewport width on small screens. The panel
        is sticky so long forms keep the step indicator in view as the
        user scrolls through fields. Pattern mirrors
        `SessionLauncherPage`. */}
      {screens.lg && (
        <BAIFlex style={{ position: 'sticky', top: 80 }}>
          <Steps
            size="small"
            orientation="vertical"
            current={currentStepIndex}
            onChange={(nextIndex) => goToStep(nextIndex)}
            items={stepItems.map((item, idx) => ({
              ...item,
              status: idx === currentStepIndex ? 'process' : 'wait',
            }))}
          />
        </BAIFlex>
      )}

      {/* Validation tour — shown once when the user lands on the review
          step and there are outstanding validation errors. */}
      <Form.Item noStyle shouldUpdate>
        {() => (
          <DeploymentLauncherValidationTour
            form={form}
            isReview={currentStepKey === 'review'}
          />
        )}
      </Form.Item>
    </BAIFlex>
  );
};

/**
 * Validation tour — shown once (per setting key) when the review step has
 * outstanding field errors. Mirrors SessionLauncherValidationTour but targets
 * the deployment-specific navigation element.
 */
const DeploymentLauncherValidationTour: React.FC<{
  form: FormInstance<DeploymentLauncherFormValue>;
  isReview: boolean;
}> = ({ form, isReview }) => {
  const { t } = useTranslation();
  const [hasOpened, setHasOpened] = useBAISettingUserState(
    'has_opened_tour_neo_deployment_validation',
  );

  const hasError =
    (['name'] as const).some((f) => form.getFieldError(f).length > 0) ||
    (['modelFolderId', 'runtimeVariant', 'startCommand'] as const).some(
      (f) => form.getFieldError(f).length > 0,
    ) ||
    (['resourceGroup', 'desiredReplicaCount'] as const).some(
      (f) => form.getFieldError(f).length > 0,
    );

  const open = isReview && hasError && !hasOpened;

  const steps = [
    {
      title: t('tourGuide.neoDeploymentLauncher.ValidationErrorTitle'),
      description: t('tourGuide.neoDeploymentLauncher.ValidationErrorText'),
      target: () =>
        document.getElementsByClassName('bai-card-error')?.[0] as HTMLElement,
    },
    {
      title: t('tourGuide.neoDeploymentLauncher.ValidationErrorTitle'),
      description: t(
        'tourGuide.neoDeploymentLauncher.FixErrorFieldByModifyButton',
      ),
      target: () =>
        (
          document.getElementsByClassName('bai-card-error')?.[0] as HTMLElement
        )?.querySelector('.ant-card-head') as HTMLElement,
    },
    {
      title: t('tourGuide.neoDeploymentLauncher.ValidationErrorTitle'),
      description: t('tourGuide.neoDeploymentLauncher.FixErrorAndTryAgainText'),
      target: () =>
        document.querySelector(
          '[data-test-id="deployment-launcher-tour-step-navigation"]',
        ) as HTMLElement,
    },
  ];

  return <Tour steps={steps} open={open} onClose={() => setHasOpened(true)} />;
};

const ResourcePresetReviewDisplay: React.FC<{ presetName: string }> = ({
  presetName,
}) => {
  'use memo';

  const [resourceSlots] = useResourceSlots();

  const { resource_presets } =
    useLazyLoadQuery<DeploymentLauncherPageContentPresetSummaryQuery>(
      graphql`
        query DeploymentLauncherPageContentPresetSummaryQuery {
          resource_presets {
            name
            resource_slots
            shared_memory
          }
        }
      `,
      {},
      { fetchPolicy: 'store-and-network' },
    );

  const preset = (resource_presets ?? []).find((p) => p?.name === presetName);
  const slotsInfo: Record<string, string> = JSON.parse(
    preset?.resource_slots || '{}',
  );
  const visibleSlots = _.omitBy(slotsInfo, (_v, key) =>
    _.isEmpty(resourceSlots[key as ResourceSlotName]),
  );

  return (
    <BAIFlex
      direction="row"
      gap="xs"
      align="center"
      style={{ flexWrap: 'wrap' }}
    >
      {presetName}
      {preset && Object.keys(visibleSlots).length > 0 && (
        <BAIFlex direction="row" gap="xxs">
          {_.map(visibleSlots, (slot, key) => (
            <BAIResourceNumberWithIcon
              key={key}
              // @ts-ignore
              type={key}
              value={slot}
              opts={
                key === 'mem' && preset.shared_memory
                  ? { shmem: preset.shared_memory }
                  : {}
              }
            />
          ))}
        </BAIFlex>
      )}
    </BAIFlex>
  );
};

/**
 * Review step — one BAICard per form step showing a Descriptions summary.
 * Each card has an "Edit" link that navigates back to the corresponding step,
 * and shows 'error' status when that step contains validation errors.
 *
 * Must NOT use 'use memo' — the enclosing Form.Item shouldUpdate triggers
 * re-renders on every value change, but the React Compiler would memoize
 * on the stable `form` ref and serve stale values.
 */
const DeploymentReviewSummary: React.FC<{
  form: FormInstance<DeploymentLauncherFormValue>;
  mode: 'create' | 'edit';
  onGoToStep: (index: number) => void;
  runtimeParamSnapshot: {
    values: RuntimeParameterValues;
    touchedKeys: Set<string>;
    groups: RuntimeParameterGroup[] | null;
  } | null;
}> = ({ form, mode: _mode, onGoToStep, runtimeParamSnapshot }) => {
  const { t } = useTranslation();
  const values = form.getFieldsValue();

  const step1HasError = (['name'] as const).some(
    (f) => form.getFieldError(f).length > 0,
  );
  const step2HasError = (
    ['modelFolderId', 'runtimeVariant', 'startCommand'] as const
  ).some((f) => form.getFieldError(f).length > 0);
  const step3HasError = (
    ['resourceGroup', 'desiredReplicaCount'] as const
  ).some((f) => form.getFieldError(f).length > 0);

  const editLink = (stepIndex: number) => (
    <Button type="link" size="small" onClick={() => onGoToStep(stepIndex)}>
      {t('button.Edit')}
    </Button>
  );

  return (
    <BAIFlex direction="column" gap="md" align="stretch">
      {/* Basic Info */}
      <BAICard
        size="small"
        title={t('deployment.step.BasicInfo')}
        extra={editLink(0)}
        status={step1HasError ? 'error' : undefined}
        showDivider
      >
        <Descriptions column={1} size="small">
          <Descriptions.Item label={t('deployment.Name')}>
            <Typography.Text strong>{values.name || '-'}</Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label={t('deployment.Tags')}>
            {values.tags?.length ? (
              <BAIFlex direction="row" gap="xxs" wrap="wrap">
                {values.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </BAIFlex>
            ) : (
              '-'
            )}
          </Descriptions.Item>
          <Descriptions.Item label={t('deployment.OpenToPublic')}>
            {values.openToPublic ? t('button.Yes') : t('button.No')}
          </Descriptions.Item>
        </Descriptions>
      </BAICard>

      {/* Model & Runtime */}
      <BAICard
        size="small"
        title={t('deployment.step.ModelAndRuntime')}
        extra={editLink(1)}
        status={step2HasError ? 'error' : undefined}
        showDivider
      >
        <Descriptions column={1} size="small">
          <Descriptions.Item label={t('deployment.ModelFolder')}>
            {values.modelFolderId ? (
              <Suspense
                fallback={
                  <Typography.Text code>{values.modelFolderId}</Typography.Text>
                }
              >
                <ErrorBoundaryWithNullFallback>
                  <VFolderLazyView uuid={values.modelFolderId} clickable />
                </ErrorBoundaryWithNullFallback>
              </Suspense>
            ) : (
              '-'
            )}
          </Descriptions.Item>
          {(values.environments?.image?.name ||
            values.environments?.manual) && (
            <Descriptions.Item label={t('modelService.Image')}>
              <Typography.Text code style={{ wordBreak: 'break-all' }}>
                {values.environments?.manual ||
                  values.environments?.image?.name}
              </Typography.Text>
            </Descriptions.Item>
          )}
          <Descriptions.Item label={t('modelService.RuntimeVariant')}>
            {values.runtimeVariant || '-'}
          </Descriptions.Item>
          {/* Runtime parameters — only keys the user explicitly modified */}
          {runtimeParamSnapshot?.groups &&
            runtimeParamSnapshot.touchedKeys.size > 0 &&
            runtimeParamSnapshot.groups
              .flatMap((g) => g.params)
              .filter((p) => runtimeParamSnapshot.touchedKeys.has(p.key))
              .map((param) => (
                <Descriptions.Item
                  key={param.key}
                  label={param.displayName || param.name}
                >
                  <Typography.Text code>
                    {runtimeParamSnapshot.values[param.key]}
                  </Typography.Text>
                </Descriptions.Item>
              ))}
          {values.startCommand && (
            <Descriptions.Item label={t('modelService.StartCommand')}>
              <SourceCodeView language="shell">
                {values.startCommand}
              </SourceCodeView>
            </Descriptions.Item>
          )}
          {values.commandModelMount && (
            <Descriptions.Item label={t('modelService.ModelMountDestination')}>
              <Typography.Text code>{values.commandModelMount}</Typography.Text>
            </Descriptions.Item>
          )}
          {values.commandPort != null && (
            <Descriptions.Item label={t('modelService.Port')}>
              {values.commandPort}
            </Descriptions.Item>
          )}
          {values.commandHealthCheck && (
            <Descriptions.Item label={t('modelService.HealthCheck')}>
              <Typography.Text code>
                {values.commandHealthCheck}
              </Typography.Text>
            </Descriptions.Item>
          )}
          {values.commandInitialDelay != null && (
            <Descriptions.Item label={t('modelService.InitialDelay')}>
              {values.commandInitialDelay}s
            </Descriptions.Item>
          )}
          {values.commandMaxRetries != null && (
            <Descriptions.Item label={t('modelService.MaxRetries')}>
              {values.commandMaxRetries}
            </Descriptions.Item>
          )}
          {values.modelMountDestination && (
            <Descriptions.Item label={t('modelService.ModelMountDestination')}>
              <Typography.Text code>
                {values.modelMountDestination}
              </Typography.Text>
            </Descriptions.Item>
          )}
          {values.modelDefinitionPath && (
            <Descriptions.Item label={t('modelService.ModelDefinitionPath')}>
              <Typography.Text code>
                {values.modelDefinitionPath}
              </Typography.Text>
            </Descriptions.Item>
          )}
        </Descriptions>
      </BAICard>

      {/* Resources & Replicas */}
      <BAICard
        size="small"
        title={t('deployment.step.ResourcesAndReplicas')}
        extra={editLink(2)}
        status={step3HasError ? 'error' : undefined}
        showDivider
      >
        <Descriptions column={1} size="small">
          <Descriptions.Item label={t('session.ResourceGroup')}>
            {values.resourceGroup || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('resourcePreset.ResourcePresets')}>
            {values.resourcePresetId ? (
              <Suspense fallback={<>{values.resourcePresetId}</>}>
                <ErrorBoundaryWithNullFallback>
                  <ResourcePresetReviewDisplay
                    presetName={values.resourcePresetId}
                  />
                </ErrorBoundaryWithNullFallback>
              </Suspense>
            ) : (
              '-'
            )}
          </Descriptions.Item>
          <Descriptions.Item label={t('deployment.DesiredReplicas')}>
            {String(values.desiredReplicaCount ?? '-')}
          </Descriptions.Item>
          <Descriptions.Item label={t('deployment.AutoScaling')}>
            {values.autoScalingEnabled ? t('button.Yes') : t('button.No')}
          </Descriptions.Item>
        </Descriptions>
      </BAICard>
    </BAIFlex>
  );
};

export default DeploymentLauncherPageContent;
