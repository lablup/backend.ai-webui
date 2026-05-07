/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { AdminDeploymentPresetReviewSummaryImageQuery } from '../__generated__/AdminDeploymentPresetReviewSummaryImageQuery.graphql';
import { ResourceNumbersOfSession } from '../pages/SessionLauncherPage';
import type { AdminDeploymentPresetFormValue } from './AdminDeploymentPresetFormTypes';
import SourceCodeView from './SourceCodeView';
import { Button, Descriptions, Space, Tag, Typography, theme } from 'antd';
import type { FormInstance } from 'antd';
import { BAICard, BAIFlex, toLocalId } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

// ---------------------------------------------------------------------------
// Image canonical name resolver (for review step)
// ---------------------------------------------------------------------------

const ImageCanonicalName: React.FC<{ imageId: string }> = ({ imageId }) => {
  'use memo';
  const data = useLazyLoadQuery<AdminDeploymentPresetReviewSummaryImageQuery>(
    graphql`
      query AdminDeploymentPresetReviewSummaryImageQuery($id: UUID!) {
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
}

const PresetReviewSummary: React.FC<PresetReviewSummaryProps> = ({
  form,
  mode,
  onGoToStep,
  runtimeVariants,
  errorFieldNames,
}) => {
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

export default PresetReviewSummary;
