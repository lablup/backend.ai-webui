/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { FormInstance } from '../form-engine';
import { useAdminImageReference } from '../hooks/hooksUsingRelay';
import { ResourceNumbersOfSession } from '../pages/SessionLauncherPage';
import { theme } from '../theme-shim';
import type { AdminDeploymentPresetFormValue } from './AdminDeploymentPresetFormTypes';
import SourceCodeView from './SourceCodeView';
import { Badge } from '@astryxdesign/core/Badge';
import { Button } from '@astryxdesign/core/Button';
import { Code } from '@astryxdesign/core/Code';
import {
  MetadataList,
  MetadataListItem,
} from '@astryxdesign/core/MetadataList';
import { HStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import {
  BAICard,
  BAIFlex,
  badgeVariantForTagColor,
  BAIText,
  toLocalId,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React from 'react';
import { useTranslation } from 'react-i18next';

// ---------------------------------------------------------------------------
// PresetReviewSummary — read-only summary of all form fields on the review step
// ---------------------------------------------------------------------------

// PILOT-DECISION: antd `Descriptions column={n} size="small"` converts to
// `MetadataList columns={n}`; `size="small"` has no MetadataList equivalent
// and is DROPPED everywhere below — the Astryx default density is the design.

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
      variant="ghost"
      size="sm"
      label={t('button.Edit')}
      onClick={() => {
        onGoToStep(stepIndex);
        setTimeout(() => {
          document
            .getElementById(cardId)
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
      }}
    />
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
        <MetadataList columns={1}>
          <MetadataListItem label={t('adminDeploymentPreset.Name')}>
            <Text weight="semibold">{values.name || '-'}</Text>
          </MetadataListItem>
          {values.description && (
            <MetadataListItem label={t('adminDeploymentPreset.Description')}>
              {values.description}
            </MetadataListItem>
          )}
          <MetadataListItem label={t('adminDeploymentPreset.Runtime')}>
            {runtimeName || '-'}
          </MetadataListItem>
          <MetadataListItem label={t('adminDeploymentPreset.Image')}>
            {imageReference ? (
              <BAIText code copyable style={{ wordBreak: 'break-all' }}>
                {imageReference}
              </BAIText>
            ) : (
              '-'
            )}
          </MetadataListItem>
          {runtimeParamRows.length > 0 && (
            <MetadataListItem label={t('modelService.RuntimeParamTitle')}>
              <BAIFlex direction="column" align="start" gap="xxs">
                {runtimeParamRows.map((r) => (
                  <Text key={r.key}>
                    - {r.label}: {r.value}
                  </Text>
                ))}
              </BAIFlex>
            </MetadataListItem>
          )}
          {/* Service Configuration fields (moved to Step 1) */}
          {(() => {
            const svc = values.modelDefinition?.models?.[0]?.service;
            return (
              <>
                {svc?.port != null && (
                  <MetadataListItem label={t('modelService.Port')}>
                    {svc.port}
                  </MetadataListItem>
                )}
                {svc?.startCommand && (
                  <MetadataListItem label={t('modelService.Command')}>
                    <SourceCodeView language="shell">
                      {svc.startCommand}
                    </SourceCodeView>
                  </MetadataListItem>
                )}
                {svc?.shell && (
                  <MetadataListItem label={t('modelService.Shell')}>
                    <Code>{svc.shell}</Code>
                  </MetadataListItem>
                )}
                {(svc?.preStartActions?.length ?? 0) > 0 && (
                  <MetadataListItem label={t('modelService.PreStartActions')}>
                    <BAIFlex direction="column" align="start" gap="xxs">
                      {svc?.preStartActions?.filter(Boolean).map((a, ai) => (
                        <Code key={ai} style={{ display: 'block' }}>
                          {a?.action}: {a?.args || '{}'}
                        </Code>
                      ))}
                    </BAIFlex>
                  </MetadataListItem>
                )}
                <MetadataListItem
                  label={t('adminDeploymentPreset.modelDef.EnableHealthCheck')}
                >
                  {svc?.enableHealthCheck
                    ? t('general.Enabled')
                    : t('general.Disabled')}
                </MetadataListItem>
                {svc?.enableHealthCheck && svc?.healthCheck && (
                  <>
                    {svc.healthCheck.path && (
                      <MetadataListItem
                        label={t(
                          'adminDeploymentPreset.modelDef.HealthCheckPath',
                        )}
                      >
                        <Code>{svc.healthCheck.path}</Code>
                      </MetadataListItem>
                    )}
                    {svc.healthCheck.interval != null && (
                      <MetadataListItem
                        label={t(
                          'adminDeploymentPreset.modelDef.HealthCheckInterval',
                        )}
                      >
                        {svc.healthCheck.interval}
                      </MetadataListItem>
                    )}
                    {svc.healthCheck.maxRetries != null && (
                      <MetadataListItem
                        label={t(
                          'adminDeploymentPreset.modelDef.HealthCheckMaxRetries',
                        )}
                      >
                        {svc.healthCheck.maxRetries}
                      </MetadataListItem>
                    )}
                    {svc.healthCheck.maxWaitTime != null && (
                      <MetadataListItem
                        label={t(
                          'adminDeploymentPreset.modelDef.HealthCheckMaxWaitTime',
                        )}
                      >
                        {svc.healthCheck.maxWaitTime}
                      </MetadataListItem>
                    )}
                    {svc.healthCheck.expectedStatusCode != null && (
                      <MetadataListItem
                        label={t(
                          'adminDeploymentPreset.modelDef.HealthCheckExpectedStatus',
                        )}
                      >
                        {svc.healthCheck.expectedStatusCode}
                      </MetadataListItem>
                    )}
                    {svc.healthCheck.initialDelay != null && (
                      <MetadataListItem
                        label={t(
                          'adminDeploymentPreset.modelDef.HealthCheckInitialDelay',
                        )}
                      >
                        {svc.healthCheck.initialDelay}
                      </MetadataListItem>
                    )}
                  </>
                )}
              </>
            );
          })()}
        </MetadataList>
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
        <MetadataList columns={1}>
          <MetadataListItem label={t('adminDeploymentPreset.ResourceSlots')}>
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
          </MetadataListItem>
          <MetadataListItem label={t('adminDeploymentPreset.ResourceOpts')}>
            {values.resourceOpts?.some((o) => o.name?.trim()) ? (
              <BAIFlex direction="row" align="start" gap="sm" wrap="wrap">
                {values.resourceOpts
                  .filter((o) => o.name?.trim())
                  .map((o, i) => (
                    <Code key={`${o.name?.trim()}-${i}`}>
                      {o.name?.trim()}: {o.value?.trim() || '-'}
                    </Code>
                  ))}
              </BAIFlex>
            ) : (
              '-'
            )}
          </MetadataListItem>
          <MetadataListItem label={t('adminDeploymentPreset.ClusterMode')}>
            {values.clusterMode === 'SINGLE_NODE'
              ? t('adminDeploymentPreset.SingleNode')
              : values.clusterMode === 'MULTI_NODE'
                ? t('adminDeploymentPreset.MultiNode')
                : '-'}
          </MetadataListItem>
          <MetadataListItem label={t('adminDeploymentPreset.ClusterSize')}>
            {values.clusterSize != null ? values.clusterSize : '-'}
          </MetadataListItem>
        </MetadataList>
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
        <MetadataList columns={2}>
          <MetadataListItem label={t('adminDeploymentPreset.Replicas')}>
            {values.replicaCount ?? '-'}
          </MetadataListItem>
          <MetadataListItem
            label={t('adminDeploymentPreset.RevisionHistoryLimit')}
          >
            {values.revisionHistoryLimit ?? '-'}
          </MetadataListItem>
          <MetadataListItem label={t('adminDeploymentPreset.OpenToPublic')}>
            {values.openToPublic == null
              ? '-'
              : values.openToPublic
                ? t('button.Yes')
                : t('button.No')}
          </MetadataListItem>
        </MetadataList>
      </BAICard>

      {/* Model & Execution */}
      <BAICard
        size="small"
        className={step2HasError ? 'bai-card-error' : ''}
        style={step2HasError ? { borderColor: token.colorError } : undefined}
        title={t('adminDeploymentPreset.step.ModelAndExecution')}
        extra={editLink(1, 'preset-form-card-model')}
      >
        <MetadataList columns={1}>
          <MetadataListItem label={t('adminDeploymentPreset.StartupCommand')}>
            {values.startupCommand ? (
              <SourceCodeView language="shell">
                {values.startupCommand}
              </SourceCodeView>
            ) : (
              '-'
            )}
          </MetadataListItem>
          <MetadataListItem label={t('adminDeploymentPreset.BootstrapScript')}>
            {values.bootstrapScript ? (
              <SourceCodeView language="shell">
                {values.bootstrapScript}
              </SourceCodeView>
            ) : (
              '-'
            )}
          </MetadataListItem>
          <MetadataListItem
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
          </MetadataListItem>
        </MetadataList>
        {values.modelDefinition?.enabled &&
        values.modelDefinition?.models?.length ? (
          <BAIFlex
            direction="column"
            align="stretch"
            gap="xs"
            style={{ marginTop: token.marginSM }}
          >
            <Text type="supporting">
              {t('adminDeploymentPreset.ModelDefinition')}
            </Text>
            {values.modelDefinition.models.filter(Boolean).map((m, i) => (
              <BAICard key={i} size="small" title={m.name}>
                <MetadataList columns={1}>
                  <MetadataListItem
                    label={t('adminDeploymentPreset.modelDef.ModelPath')}
                  >
                    <Code style={{ wordBreak: 'break-all' }}>
                      {m.modelPath || '-'}
                    </Code>
                  </MetadataListItem>
                  {m.metadata?.title && (
                    <MetadataListItem
                      label={t('adminDeploymentPreset.modelDef.Title')}
                    >
                      {m.metadata.title}
                    </MetadataListItem>
                  )}
                  {m.metadata?.author && (
                    <MetadataListItem
                      label={t('adminDeploymentPreset.modelDef.Author')}
                    >
                      {m.metadata.author}
                    </MetadataListItem>
                  )}
                  {m.metadata?.version && (
                    <MetadataListItem
                      label={t('adminDeploymentPreset.modelDef.Version')}
                    >
                      {m.metadata.version}
                    </MetadataListItem>
                  )}
                  {m.metadata?.description && (
                    <MetadataListItem
                      label={t('adminDeploymentPreset.modelDef.Description')}
                    >
                      {m.metadata.description}
                    </MetadataListItem>
                  )}
                  {m.metadata?.task && (
                    <MetadataListItem
                      label={t('adminDeploymentPreset.modelDef.Task')}
                    >
                      {m.metadata.task}
                    </MetadataListItem>
                  )}
                  {m.metadata?.category && (
                    <MetadataListItem
                      label={t('adminDeploymentPreset.modelDef.Category')}
                    >
                      {m.metadata.category}
                    </MetadataListItem>
                  )}
                  {m.metadata?.architecture && (
                    <MetadataListItem
                      label={t('adminDeploymentPreset.modelDef.Architecture')}
                    >
                      {m.metadata.architecture}
                    </MetadataListItem>
                  )}
                  {(m.metadata?.framework?.length ?? 0) > 0 && (
                    <MetadataListItem
                      label={t('adminDeploymentPreset.modelDef.Framework')}
                    >
                      <HStack gap={2} wrap="wrap">
                        {m.metadata!.framework!.map((f, fi) => (
                          <Badge
                            key={fi}
                            variant={badgeVariantForTagColor('default')}
                            label={f}
                          />
                        ))}
                      </HStack>
                    </MetadataListItem>
                  )}
                  {(m.metadata?.label?.length ?? 0) > 0 && (
                    <MetadataListItem
                      label={t('adminDeploymentPreset.modelDef.Label')}
                    >
                      <HStack gap={2} wrap="wrap">
                        {m.metadata!.label!.map((l, li) => (
                          <Badge
                            key={li}
                            variant={badgeVariantForTagColor('default')}
                            label={l}
                          />
                        ))}
                      </HStack>
                    </MetadataListItem>
                  )}
                  {m.metadata?.license && (
                    <MetadataListItem
                      label={t('adminDeploymentPreset.modelDef.License')}
                    >
                      {m.metadata.license}
                    </MetadataListItem>
                  )}
                </MetadataList>
              </BAICard>
            ))}
          </BAIFlex>
        ) : null}
      </BAICard>
    </BAIFlex>
  );
};

export default PresetReviewSummary;
