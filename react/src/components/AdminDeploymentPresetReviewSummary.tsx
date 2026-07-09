/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useAdminImageReference } from '../hooks/hooksUsingRelay';
import { ResourceNumbersOfSession } from '../pages/SessionLauncherPage';
import type { AdminDeploymentPresetFormValue } from './AdminDeploymentPresetFormTypes';
import SourceCodeView from './SourceCodeView';
import { Button, Descriptions, Space, Tag, Typography, theme } from 'antd';
import type { FormInstance } from 'antd';
import { BAICard, BAIFlex, toLocalId } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React from 'react';
import { useTranslation } from 'react-i18next';

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

interface PresetReviewSummaryProps {
  form: FormInstance<AdminDeploymentPresetFormValue>;
  mode: 'create' | 'edit';
  onGoToStep: (index: number) => void;
  runtimeVariants: ReadonlyArray<{ id: string; name: string }>;
  errorFieldNames: string[];
  /** Touched, non-default runtime-variant preset values (label + value). */
  runtimeParamRows?: ReadonlyArray<{
    key: string;
    label: string;
    value: string;
  }>;
}

const PresetReviewSummary: React.FC<PresetReviewSummaryProps> = ({
  form,
  mode,
  onGoToStep,
  runtimeVariants,
  errorFieldNames,
  runtimeParamRows = [],
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  // `true` includes untouched fields and arrays (e.g. modelDefinition.models)
  // that getFieldsValue() omits; its overload returns `any`, so annotate here.
  const values: AdminDeploymentPresetFormValue = form.getFieldsValue(true);
  const imageReference = useAdminImageReference(values.imageId);

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
        status={basicInfoHasError ? 'error' : undefined}
        title={t('adminDeploymentPreset.step.BasicInfo')}
        extra={editLink(0, 'preset-form-card-basic')}
        styles={{ body: { paddingTop: 0 } }}
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
            {imageReference ? (
              <Typography.Text
                code
                style={{ wordBreak: 'break-all' }}
                copyable={{ text: imageReference }}
              >
                {imageReference}
              </Typography.Text>
            ) : (
              '-'
            )}
          </Descriptions.Item>
          {runtimeParamRows.length > 0 && (
            <Descriptions.Item label={t('modelService.RuntimeParamTitle')}>
              <BAIFlex direction="column" align="start" gap="xxs">
                {runtimeParamRows.map((r) => (
                  <Typography.Text key={r.key}>
                    - {r.label}: {r.value}
                  </Typography.Text>
                ))}
              </BAIFlex>
            </Descriptions.Item>
          )}
        </Descriptions>
      </BAICard>

      {/* Resources */}
      <BAICard
        size="small"
        status={resourcesHasError ? 'error' : undefined}
        title={t('adminDeploymentPreset.step.Resources')}
        extra={editLink(0, 'preset-form-card-resources')}
        styles={{ body: { paddingTop: 0 } }}
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
                      (values.resourceSlots ?? [])
                        .filter(Boolean)
                        .map((s) => [s?.resourceType, s?.quantity]),
                    ),
                  } as any
                }
              />
            </BAIFlex>
          </Descriptions.Item>
          <Descriptions.Item label={t('adminDeploymentPreset.ResourceOpts')}>
            {values.resourceOpts?.some((o) => o.name?.trim()) ? (
              <BAIFlex direction="row" align="start" gap="sm" wrap="wrap">
                {values.resourceOpts
                  .filter((o) => o.name?.trim())
                  .map((o, i) => (
                    <Typography.Text key={`${o.name?.trim()}-${i}`} code>
                      {o.name?.trim()}: {o.value?.trim() || '-'}
                    </Typography.Text>
                  ))}
              </BAIFlex>
            ) : (
              '-'
            )}
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
        status={deploymentHasError ? 'error' : undefined}
        title={t('adminDeploymentPreset.step.Deployment')}
        extra={editLink(0, 'preset-form-card-deployment')}
        styles={{ body: { paddingTop: 0 } }}
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
        status={step2HasError ? 'error' : undefined}
        title={t('adminDeploymentPreset.step.ModelAndExecution')}
        extra={editLink(1, 'preset-form-card-model')}
        styles={{ body: { paddingTop: 0 } }}
      >
        <Descriptions column={1} size="small">
          <Descriptions.Item label={t('adminDeploymentPreset.StartupCommand')}>
            {values.startupCommand ? (
              <SourceCodeView language="shell">
                {values.startupCommand}
              </SourceCodeView>
            ) : (
              '-'
            )}
          </Descriptions.Item>
          <Descriptions.Item label={t('adminDeploymentPreset.BootstrapScript')}>
            {values.bootstrapScript ? (
              <SourceCodeView language="shell">
                {values.bootstrapScript}
              </SourceCodeView>
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
                  (e) => `${e?.variable ?? ''}="${e?.value ?? ''}"`,
                ).join('\n')}
              </SourceCodeView>
            ) : (
              '-'
            )}
          </Descriptions.Item>
        </Descriptions>
        {values.modelDefinition?.enabled &&
        values.modelDefinition?.models?.length ? (
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
            {values.modelDefinition.models.filter(Boolean).map((m, i) => (
              <BAICard
                key={i}
                size="small"
                title={m.name}
                styles={{ body: { paddingTop: 0 } }}
              >
                <Descriptions column={1} size="small">
                  <Descriptions.Item
                    label={t('adminDeploymentPreset.modelDef.ModelPath')}
                  >
                    <Typography.Text code style={{ wordBreak: 'break-all' }}>
                      {m.modelPath || '-'}
                    </Typography.Text>
                  </Descriptions.Item>
                  {m.service?.port != null && (
                    <Descriptions.Item
                      label={t('adminDeploymentPreset.modelDef.Port')}
                    >
                      {m.service.port}
                    </Descriptions.Item>
                  )}
                  {/* `shell` is not surfaced in this form (no-op on the list
                      `startCommand` path); see AdminDeploymentPresetModelConfigItem. */}
                  {m.service?.startCommand && (
                    <Descriptions.Item
                      label={t('adminDeploymentPreset.modelDef.StartCommand')}
                    >
                      <SourceCodeView language="shell">
                        {m.service.startCommand}
                      </SourceCodeView>
                    </Descriptions.Item>
                  )}
                  {(m.service?.preStartActions?.length ?? 0) > 0 && (
                    <Descriptions.Item
                      label={t(
                        'adminDeploymentPreset.modelDef.PreStartActions',
                      )}
                    >
                      {m.service?.preStartActions
                        ?.filter(Boolean)
                        .map((a, ai) => (
                          <Typography.Text
                            key={ai}
                            code
                            style={{ display: 'block' }}
                          >
                            {a?.action}
                          </Typography.Text>
                        ))}
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item
                    label={t(
                      'adminDeploymentPreset.modelDef.EnableHealthCheck',
                    )}
                  >
                    {m.service?.enableHealthCheck
                      ? t('general.Enabled')
                      : t('general.Disabled')}
                  </Descriptions.Item>
                  {m.service?.enableHealthCheck && (
                    <>
                      {m.service.healthCheck?.path && (
                        <Descriptions.Item
                          label={t(
                            'adminDeploymentPreset.modelDef.HealthCheckPath',
                          )}
                        >
                          <Typography.Text code>
                            {m.service.healthCheck.path}
                          </Typography.Text>
                        </Descriptions.Item>
                      )}
                      {m.service.healthCheck?.interval != null && (
                        <Descriptions.Item
                          label={t(
                            'adminDeploymentPreset.modelDef.HealthCheckInterval',
                          )}
                        >
                          {m.service.healthCheck.interval}
                        </Descriptions.Item>
                      )}
                      {m.service.healthCheck?.maxRetries != null && (
                        <Descriptions.Item
                          label={t(
                            'adminDeploymentPreset.modelDef.HealthCheckMaxRetries',
                          )}
                        >
                          {m.service.healthCheck.maxRetries}
                        </Descriptions.Item>
                      )}
                      {m.service.healthCheck?.maxWaitTime != null && (
                        <Descriptions.Item
                          label={t(
                            'adminDeploymentPreset.modelDef.HealthCheckMaxWaitTime',
                          )}
                        >
                          {m.service.healthCheck.maxWaitTime}
                        </Descriptions.Item>
                      )}
                      {m.service.healthCheck?.expectedStatusCode != null && (
                        <Descriptions.Item
                          label={t(
                            'adminDeploymentPreset.modelDef.HealthCheckExpectedStatus',
                          )}
                        >
                          {m.service.healthCheck.expectedStatusCode}
                        </Descriptions.Item>
                      )}
                      {m.service.healthCheck?.initialDelay != null && (
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
                  {m.metadata?.title && (
                    <Descriptions.Item
                      label={t('adminDeploymentPreset.modelDef.Title')}
                    >
                      {m.metadata.title}
                    </Descriptions.Item>
                  )}
                  {m.metadata?.author && (
                    <Descriptions.Item
                      label={t('adminDeploymentPreset.modelDef.Author')}
                    >
                      {m.metadata.author}
                    </Descriptions.Item>
                  )}
                  {m.metadata?.version && (
                    <Descriptions.Item
                      label={t('adminDeploymentPreset.modelDef.Version')}
                    >
                      {m.metadata.version}
                    </Descriptions.Item>
                  )}
                  {m.metadata?.description && (
                    <Descriptions.Item
                      label={t('adminDeploymentPreset.modelDef.Description')}
                    >
                      {m.metadata.description}
                    </Descriptions.Item>
                  )}
                  {m.metadata?.task && (
                    <Descriptions.Item
                      label={t('adminDeploymentPreset.modelDef.Task')}
                    >
                      {m.metadata.task}
                    </Descriptions.Item>
                  )}
                  {m.metadata?.category && (
                    <Descriptions.Item
                      label={t('adminDeploymentPreset.modelDef.Category')}
                    >
                      {m.metadata.category}
                    </Descriptions.Item>
                  )}
                  {m.metadata?.architecture && (
                    <Descriptions.Item
                      label={t('adminDeploymentPreset.modelDef.Architecture')}
                    >
                      {m.metadata.architecture}
                    </Descriptions.Item>
                  )}
                  {(m.metadata?.framework?.length ?? 0) > 0 && (
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
                  {(m.metadata?.label?.length ?? 0) > 0 && (
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
                  {m.metadata?.license && (
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

export default PresetReviewSummary;
