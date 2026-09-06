/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { FormInstance } from '../form-engine';
import { resolvesReadsVfolderConfigFiles } from '../helper/modelServiceCommand';
import { useSuspendedBackendaiClient } from '../hooks';
import { useAdminImageReference } from '../hooks/hooksUsingRelay';
import { ResourceNumbersOfSession } from '../pages/SessionLauncherPage';
import type {
  AdminDeploymentPresetFormValue,
  ModelServiceFormValue,
} from './AdminDeploymentPresetFormTypes';
import SourceCodeView from './SourceCodeView';
import { Badge } from '@astryxdesign/core/Badge';
import { Button } from '@astryxdesign/core/Button';
import { Code } from '@astryxdesign/core/Code';
import { MetadataListItem } from '@astryxdesign/core/MetadataList';
import { HStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import {
  BAICard,
  BAIFlex,
  BAIMetadataList,
  badgeVariantForTagColor,
  BAIText,
  toLocalId,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { CircleX } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

// ---------------------------------------------------------------------------
// PresetReviewSummary — read-only summary of all form fields on the review step
// ---------------------------------------------------------------------------

// PILOT-DECISION: antd `Descriptions column={n} size="small"` converts to
// `MetadataList columns={n}`; `size="small"` has no MetadataList equivalent
// and is DROPPED everywhere below — the Astryx default density is the design.

const BASIC_INFO_FIELDS = ['name', 'runtimeVariantId', 'imageId'] as const;
const RESOURCES_FIELDS = [
  'cpu',
  'mem',
  'clusterMode',
  'clusterSize',
  'resourceOpts',
] as const;
const DEPLOYMENT_FIELDS = ['replicaCount'] as const;
// `environ` and `resourceOpts` are Form.Lists whose rows carry their own
// required rules, so they report errors under the list's own name.
const STEP2_FIELDS = [
  'startupCommand',
  'bootstrapScript',
  'modelDefinition',
  'environ',
] as const;

interface PresetReviewSummaryProps {
  form: FormInstance<AdminDeploymentPresetFormValue>;
  onGoToStep: (index: number) => void;
  runtimeVariants: ReadonlyArray<{
    id: string;
    name: string;
    // `readsVfolderConfigFiles` (26.8.0+) is stripped on older managers →
    // undefined; `resolvesReadsVfolderConfigFiles` falls back to the legacy
    // `name === 'custom'` heuristic.
    readsVfolderConfigFiles?: boolean | null;
  }>;
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
  const baiClient = useSuspendedBackendaiClient();
  /**
   * FR-3481: mirrors the input form's placement of Service
   * Configuration/Health Check/Pre-Start Actions — under Basic Info when
   * true (managers that can submit them independently of Model Definition),
   * nested under Model & Execution's Model Definition fields when false
   * (legacy managers, where they can only be submitted alongside a real
   * name/modelPath).
   */
  const supportsNullableModelDefinition = baiClient.supports(
    'preset-model-config-type',
  );
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

  const selectedRuntimeVariant = runtimeVariants.find(
    (r) => toLocalId(r.id) === values.runtimeVariantId,
  );
  const runtimeName = selectedRuntimeVariant?.name ?? values.runtimeVariantId;
  // FR-3481 review-parity fix: the Shell/Command/Port rows must only show
  // when the selected variant actually reads vfolder config files — the
  // form store preserves stale values after switching away from a
  // config-reading variant, but buildModelDefinitionInput() omits them from
  // the submit payload in that case, so Review must match.
  const readsVfolderConfigFiles = resolvesReadsVfolderConfigFiles(
    selectedRuntimeVariant,
  );

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

  // Shared between the two render sites below (Basic Info, on managers that
  // can submit these independently of Model Definition; nested under Model &
  // Execution's Model Definition rows otherwise) — see
  // `supportsNullableModelDefinition`, which decides which site calls this.
  const renderServiceConfigSummaryFields = (
    svc: ModelServiceFormValue | undefined,
    readsVfolderConfigFiles: boolean,
  ) => (
    <>
      {/* Shell/Command/Port are only relevant when the selected variant
          reads vfolder config files — the form store preserves stale
          values after switching away from a config-reading variant, but
          the submit payload omits them in that case (readsVfolderConfigFiles
          in buildModelDefinitionInput, AdminDeploymentPresetSettingPage.tsx),
          so Review must match. */}
      {readsVfolderConfigFiles && (
        <>
          {/* Exec mode sends `shell: null` regardless of what's typed
              in the (now-hidden) Shell input — resolveCommandShell()
              discards it. The field's stale value otherwise lingers in
              the form store after switching Execution away from
              Shell, so gate the display on the mode actually being
              submitted, not just on the raw value being present. */}
          {svc?.shell && svc?.execution !== 'exec' && (
            <MetadataListItem label={t('modelService.Shell')}>
              <Code>{svc.shell}</Code>
            </MetadataListItem>
          )}
          {svc?.startCommand && (
            <MetadataListItem label={t('modelService.Command')}>
              <SourceCodeView language="shell">
                {svc.startCommand}
              </SourceCodeView>
            </MetadataListItem>
          )}
          {svc?.port != null && (
            <MetadataListItem label={t('modelService.Port')}>
              {svc.port}
            </MetadataListItem>
          )}
        </>
      )}
      <MetadataListItem
        label={t('adminDeploymentPreset.modelDef.EnableHealthCheck')}
      >
        {svc?.enableHealthCheck ? t('general.Enabled') : t('general.Disabled')}
      </MetadataListItem>
      {svc?.enableHealthCheck && svc?.healthCheck && (
        <>
          {svc.healthCheck.path && (
            <MetadataListItem
              label={t('adminDeploymentPreset.modelDef.HealthCheckPath')}
            >
              <Code>{svc.healthCheck.path}</Code>
            </MetadataListItem>
          )}
          {svc.healthCheck.interval != null && (
            <MetadataListItem
              label={t('adminDeploymentPreset.modelDef.HealthCheckInterval')}
            >
              {svc.healthCheck.interval}
            </MetadataListItem>
          )}
          {svc.healthCheck.maxRetries != null && (
            <MetadataListItem
              label={t('adminDeploymentPreset.modelDef.HealthCheckMaxRetries')}
            >
              {svc.healthCheck.maxRetries}
            </MetadataListItem>
          )}
          {svc.healthCheck.maxWaitTime != null && (
            <MetadataListItem
              label={t('adminDeploymentPreset.modelDef.HealthCheckMaxWaitTime')}
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
    </>
  );

  // `status="error"` only tints the border. These cards pass a custom `extra`,
  // so they never reach BAICard's own error glyph — reuse its class hook.
  const extraSlot = (stepIndex: number, cardId: string, hasError: boolean) =>
    hasError ? (
      <BAIFlex gap="xs" align="center" className="bai-card-extra--error">
        <CircleX size="1em" aria-label={t('dialog.error.Error')} />
        {editLink(stepIndex, cardId)}
      </BAIFlex>
    ) : (
      editLink(stepIndex, cardId)
    );

  return (
    <BAIFlex direction="column" gap="md" align="stretch">
      {/* Basic Info */}
      <BAICard
        size="small"
        status={basicInfoHasError ? 'error' : undefined}
        title={t('adminDeploymentPreset.step.BasicInfo')}
        extra={extraSlot(0, 'preset-form-card-basic', basicInfoHasError)}
      >
        {/* Field order below mirrors the Basic Info step's actual input
            order (name → description → runtime → runtime params → service
            configuration → health check → pre-start actions → image), not
            the order fields were originally added to this summary — see
            AdminDeploymentPresetSettingPageContent.tsx's Basic Info card. */}
        <BAIMetadataList columns={1}>
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
          {/* Service Configuration fields — Basic Info only on managers that
              can submit them independently of Model Definition
              (`supportsNullableModelDefinition`). Legacy managers show these
              nested under Model & Execution's Model Definition fields
              instead (below), mirroring the input form (FR-3481). */}
          {supportsNullableModelDefinition &&
            renderServiceConfigSummaryFields(
              values.modelDefinition?.models?.[0]?.service,
              readsVfolderConfigFiles,
            )}
          <MetadataListItem label={t('adminDeploymentPreset.Image')}>
            {imageReference ? (
              <BAIText code copyable style={{ wordBreak: 'break-all' }}>
                {imageReference}
              </BAIText>
            ) : (
              '-'
            )}
          </MetadataListItem>
        </BAIMetadataList>
      </BAICard>

      {/* Resources */}
      <BAICard
        size="small"
        status={resourcesHasError ? 'error' : undefined}
        title={t('adminDeploymentPreset.step.Resources')}
        extra={extraSlot(0, 'preset-form-card-resources', resourcesHasError)}
      >
        <BAIMetadataList columns={1}>
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
        </BAIMetadataList>
      </BAICard>

      {/* Deployment */}
      <BAICard
        size="small"
        status={deploymentHasError ? 'error' : undefined}
        title={t('adminDeploymentPreset.step.Deployment')}
        extra={extraSlot(0, 'preset-form-card-deployment', deploymentHasError)}
      >
        {/* Multi-column MetadataList defaults its labels to position: top,
            which reads as a different (vertical) layout from every other
            card here — pin the inline label placement. */}
        <BAIMetadataList columns={2} label={{ position: 'start' }}>
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
        </BAIMetadataList>
      </BAICard>

      {/* Model & Execution */}
      <BAICard
        size="small"
        status={step2HasError ? 'error' : undefined}
        title={t('adminDeploymentPreset.step.ModelAndExecution')}
        extra={extraSlot(1, 'preset-form-card-model', step2HasError)}
      >
        <BAIMetadataList columns={1}>
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
          {/* Model Definition — flat rows like every other field here,
              rather than a separate card titled by the model name (FR-3481).
              Legacy managers additionally show Service
              Configuration/Health Check/Pre-Start Actions here (mirroring
              the input form's nesting), since those fields can only be
              submitted alongside a real name/modelPath pre-BA-7210. */}
          {values.modelDefinition?.enabled &&
            (() => {
              const m = values.modelDefinition.models?.[0];
              if (!m) return null;
              const svc = m.service;
              return (
                <>
                  <MetadataListItem
                    label={t('adminDeploymentPreset.modelDef.ModelName')}
                  >
                    {m.name || '-'}
                  </MetadataListItem>
                  <MetadataListItem
                    label={t('adminDeploymentPreset.modelDef.ModelPath')}
                  >
                    <Code style={{ wordBreak: 'break-all' }}>
                      {m.modelPath || '-'}
                    </Code>
                  </MetadataListItem>
                  {!supportsNullableModelDefinition &&
                    renderServiceConfigSummaryFields(
                      svc,
                      readsVfolderConfigFiles,
                    )}
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
                  {m.metadata?.license && (
                    <MetadataListItem
                      label={t('adminDeploymentPreset.modelDef.License')}
                    >
                      {m.metadata.license}
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
                </>
              );
            })()}
        </BAIMetadataList>
      </BAICard>
    </BAIFlex>
  );
};

export default PresetReviewSummary;
