/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DeploymentLauncherPageContent_deployment$key } from '../__generated__/DeploymentLauncherPageContent_deployment.graphql';
import VFolderSelect from './VFolderSelect';
import {
  DoubleRightOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
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
import { BAIFlex, useBAILogger } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import React, { useEffect, useEffectEvent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

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

/**
 * Form value shape. Field names mirror the Strawberry GraphQL inputs
 * (`CreateDeploymentInput` + `AddRevisionInput`) so that FR-2675's
 * mutation wiring can serialize these values directly without
 * renaming. Keep this interface in sync with the schema.
 */
export interface DeploymentLauncherFormValue {
  // Step 1 — Basic Info
  name: string;
  tags: string[];
  openToPublic: boolean;

  // Step 2 — Model & Runtime
  modelFolderId: string;
  modelVersion: number;
  modelDefinitionPath: string;
  modelMountDestination: string;
  runtimeVariant: string;
  image?: string;
  command?: string;
  environ: Record<string, string>;
  clusterMode: ClusterMode;
  clusterSize: number;

  // Step 3 — Resources & Replicas
  resourceGroup: string;
  resourcePresetId?: string;
  desiredReplicaCount: number;
  autoScalingEnabled: boolean;
}

export interface DeploymentLauncherPageContentProps {
  mode: 'create' | 'edit';
  form: FormInstance<DeploymentLauncherFormValue>;
  /**
   * Only required (and only used) when `mode === 'edit'`.
   * Provides the deployment snapshot used to pre-fill the form.
   */
  deploymentFrgmt?: DeploymentLauncherPageContent_deployment$key | null;
  /**
   * Only used when `mode === 'create'`. Partial form values to pre-fill
   * from the entry point (e.g. model store split button or VFolderDeployModal).
   * Merged on top of DEFAULT_FORM_VALUES so any unspecified field keeps its
   * default. Parsed from URL params by DeploymentLauncherCreateView.
   */
  preFilledValues?: Partial<DeploymentLauncherFormValue>;
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
  modelVersion: 1,
  modelDefinitionPath: 'model-definition.yaml',
  modelMountDestination: '/models',
  runtimeVariant: 'custom',
  image: undefined,
  command: undefined,
  environ: {},
  clusterMode: 'SINGLE_NODE',
  clusterSize: 1,
  resourceGroup: '',
  resourcePresetId: undefined,
  desiredReplicaCount: 1,
  autoScalingEnabled: false,
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
> = ({ mode, form, deploymentFrgmt, preFilledValues, onValuesChange }) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();
  const screens = Grid.useBreakpoint();
  const { logger } = useBAILogger();

  // Deployment fragment — used for edit-mode pre-fill. Fields mirror the
  // `폼 필드 매핑` table in .specs/FR-1368-endpoint-deployment-migration/spec.md.
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
            runtimeVariant
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

  // URL-synced step. `parseAsStringLiteral` narrows unknown values back
  // to the default so deep-links with stale/invalid step values still
  // render a usable form instead of a blank screen.
  const [{ step: currentStepKey }, setQuery] = useQueryStates({
    step: parseAsStringLiteral(STEP_KEYS).withDefault('basic'),
    model: parseAsString,
  });

  const currentStepIndex = STEP_KEYS.indexOf(currentStepKey);
  const isLastStep = currentStepIndex === STEP_KEYS.length - 1;
  const isFirstStep = currentStepIndex === 0;

  // Compute initial values once per mount. In edit mode we read every
  // mapped field from the deployment fragment; in create mode we only
  // pre-fill the model folder (if provided via `?model=…`). The merge
  // order lets undefined schema fields (e.g. on older backends) fall
  // through to the safe DEFAULT_FORM_VALUES baseline.
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
          revision?.modelRuntimeConfig?.runtimeVariant ??
          DEFAULT_FORM_VALUES.runtimeVariant,
        image: revision?.imageV2?.identity?.canonicalName ?? undefined,
        clusterMode: (revision?.clusterConfig?.mode ??
          DEFAULT_FORM_VALUES.clusterMode) as ClusterMode,
        clusterSize:
          revision?.clusterConfig?.size ?? DEFAULT_FORM_VALUES.clusterSize,
        resourceGroup: revision?.resourceConfig?.resourceGroupName ?? '',
        desiredReplicaCount: deployment.replicaState.desiredReplicaCount,
      } satisfies Partial<DeploymentLauncherFormValue>);
    }
    return _.merge({}, DEFAULT_FORM_VALUES, preFilledValues ?? {});
  }, [mode, deployment, preFilledValues]);

  // Apply initial values to the parent-owned form instance exactly once
  // per mount / deployment change. Using `useEffectEvent` keeps the
  // latest `form` reference without turning it into a re-sync trigger;
  // the synchronization key is intentionally just the deployment id
  // (or the pre-filled model) so the form doesn't reset on unrelated
  // prop identity changes.
  const applyInitialValues = useEffectEvent(() => {
    form.setFieldsValue(initialValues);
    logger.debug('DeploymentLauncherPageContent: initial values applied', {
      mode,
      deploymentId: deployment?.id,
    });
  });

  useEffect(() => {
    applyInitialValues();
  }, [
    deployment?.id,
    preFilledValues?.modelFolderId,
    preFilledValues?.resourceGroup,
    preFilledValues?.resourcePresetId,
  ]);

  const setCurrentStep = (nextKey: StepKey) => {
    setQuery({ step: nextKey }, { history: 'push' });
  };

  const goToStep = (nextIndex: number) => {
    const clamped = _.clamp(nextIndex, 0, STEP_KEYS.length - 1);
    const nextKey = STEP_KEYS[clamped];
    if (nextKey) setCurrentStep(nextKey);
  };

  // Step metadata. Titles come straight from the FR-2666 keys
  // (`deployment.step.*`) so copy changes land in one place.
  const stepItems: NonNullable<StepsProps['items']> = [
    { title: t('deployment.step.BasicInfo') },
    { title: t('deployment.step.ModelAndRuntime') },
    { title: t('deployment.step.ResourcesAndReplicas') },
    { title: t('deployment.step.ReviewAndCreate') },
  ];

  // Runtime variants shown in the selector. These are the values the
  // backend accepts via `ModelRuntimeConfigInput.runtimeVariant`; the
  // full list comes from the `/services/_/runtimes` REST endpoint at
  // runtime (see FR-2675). For now we expose the three canonical
  // options plus `custom` so the form is usable without that fetch.
  const runtimeVariantOptions = [
    { value: 'vllm', label: 'vLLM' },
    { value: 'sglang', label: 'SGLang' },
    { value: 'custom', label: t('deployment.RuntimeVariant') + ' — custom' },
  ];

  const clusterModeOptions = [
    { value: 'SINGLE_NODE' as const, label: 'Single Node' },
    { value: 'MULTI_NODE' as const, label: 'Multi Node' },
  ];

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
          onValuesChange={onValuesChange}
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
                placeholder={t('deployment.Tags')}
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
            <Form.Item
              name="modelFolderId"
              label={t('deployment.ModelFolder')}
              rules={[{ required: true }]}
            >
              <VFolderSelect
                filter={(vf) =>
                  vf.usage_mode === 'model' &&
                  vf.status === 'ready' &&
                  vf.ownership_type !== 'group'
                }
                valuePropName="id"
                // In edit mode the mount vfolder is fixed for the current
                // revision; creating a new one via rollback/reconfigure
                // is handled through a dedicated flow, not by swapping
                // model folders on an existing deployment.
                disabled={mode === 'edit'}
                showOpenButton
                showCreateButton
                showRefreshButton
              />
            </Form.Item>
            <Form.Item name="modelVersion" label={t('deployment.ModelVersion')}>
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="modelDefinitionPath"
              label={t('deployment.ModelDefinitionPath')}
            >
              <Input placeholder="model-definition.yaml" />
            </Form.Item>
            <Form.Item
              name="modelMountDestination"
              label={t('deployment.ModelMountDestination')}
            >
              <Input placeholder="/models" />
            </Form.Item>
            <Form.Item
              name="runtimeVariant"
              label={t('deployment.RuntimeVariant')}
              rules={[{ required: true }]}
            >
              <Select options={runtimeVariantOptions} showSearch />
            </Form.Item>
            <Form.Item name="image" label={t('deployment.Image')}>
              <Input placeholder="registry/namespace/image:tag" />
            </Form.Item>
            <Form.Item name="command" label={t('deployment.Command')}>
              <Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} />
            </Form.Item>
            <Form.Item name="clusterMode" label={t('deployment.ClusterMode')}>
              <Select options={clusterModeOptions} />
            </Form.Item>
            <Form.Item name="clusterSize" label={t('deployment.ClusterSize')}>
              <InputNumber min={1} style={{ width: '100%' }} />
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
              label={t('deployment.ResourceGroup')}
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="resourcePresetId"
              label={t('deployment.ResourcePreset')}
            >
              <Input />
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
          <Card
            title={t('deployment.step.ReviewAndCreate')}
            style={{
              display: currentStepKey === 'review' ? 'block' : 'none',
            }}
          >
            <Form.Item noStyle shouldUpdate>
              {() => <ReviewSummary form={form} />}
            </Form.Item>
          </Card>

          {/* --- Footer navigation ---
            Single row of nav controls shared across every step, per
            FR-1368 Flow 2 spec. "Skip to Review" is hidden on the last
            step; Previous is hidden on the first; the submit button is
            owned by the parent page, not this form body. */}
          <BAIFlex
            direction="row"
            justify="end"
            gap="sm"
            style={{ marginTop: token.marginMD }}
          >
            {!isFirstStep && (
              <Button
                icon={<LeftOutlined />}
                onClick={() => goToStep(currentStepIndex - 1)}
              >
                {t('deployment.nav.Previous')}
              </Button>
            )}
            {!isLastStep && (
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
    </BAIFlex>
  );
};

/**
 * Review step summary. Reads the current form values via
 * `form.getFieldsValue()` so every field change is reflected without
 * subscribing to individual `Form.useWatch` calls. The enclosing
 * `<Form.Item noStyle shouldUpdate>` handles the re-render trigger.
 */
const ReviewSummary: React.FC<{
  form: FormInstance<DeploymentLauncherFormValue>;
}> = ({ form }) => {
  'use memo';
  const { t } = useTranslation();
  const values = form.getFieldsValue();

  const rows: Array<[string, React.ReactNode]> = [
    [t('deployment.Name'), values.name || '-'],
    [t('deployment.Tags'), values.tags?.join(', ') || '-'],
    [
      t('deployment.OpenToPublic'),
      values.openToPublic ? t('button.Yes') : t('button.No'),
    ],
    [t('deployment.ModelFolder'), values.modelFolderId || '-'],
    [t('deployment.ModelVersion'), String(values.modelVersion ?? '-')],
    [t('deployment.ModelDefinitionPath'), values.modelDefinitionPath || '-'],
    [
      t('deployment.ModelMountDestination'),
      values.modelMountDestination || '-',
    ],
    [t('deployment.RuntimeVariant'), values.runtimeVariant || '-'],
    [t('deployment.Image'), values.image || '-'],
    [t('deployment.Command'), values.command || '-'],
    [t('deployment.ClusterMode'), values.clusterMode || '-'],
    [t('deployment.ClusterSize'), String(values.clusterSize ?? '-')],
    [t('deployment.ResourceGroup'), values.resourceGroup || '-'],
    [t('deployment.ResourcePreset'), values.resourcePresetId || '-'],
    [
      t('deployment.DesiredReplicas'),
      String(values.desiredReplicaCount ?? '-'),
    ],
    [
      t('deployment.AutoScaling'),
      values.autoScalingEnabled ? t('button.Yes') : t('button.No'),
    ],
  ];

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <Typography.Title level={5} style={{ marginTop: 0 }}>
        {t('deployment.ConfigurationSummary')}
      </Typography.Title>
      {rows.map(([label, value]) => (
        <BAIFlex key={label} direction="row" justify="between" gap="sm">
          <Typography.Text type="secondary">{label}</Typography.Text>
          <Typography.Text>{value}</Typography.Text>
        </BAIFlex>
      ))}
    </BAIFlex>
  );
};

export default DeploymentLauncherPageContent;
