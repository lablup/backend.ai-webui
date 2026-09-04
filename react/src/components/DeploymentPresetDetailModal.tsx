/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DeploymentPresetDetailModalFragment$key } from '../__generated__/DeploymentPresetDetailModalFragment.graphql';
import { useSuspendedBackendaiClient } from '../hooks';
import { ResourceNumbersOfSession } from '../pages/SessionLauncherPage';
import { ResourceAllocationFormValue } from './SessionFormItems/ResourceAllocationFormItems';
import { Heading } from '@astryxdesign/core/Heading';
import { MetadataListItem } from '@astryxdesign/core/MetadataList';
import { Text } from '@astryxdesign/core/Text';
import {
  BAICard,
  BAIFlex,
  BAIMetadataList,
  BAIModal,
  BAIModalProps,
  BAIText,
} from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface DeploymentPresetDetailModalProps extends BAIModalProps {
  /**
   * Fragment reference for the preset to display. May be `null`/`undefined`
   * when the modal is mounted but no preset is active (e.g., during the
   * close animation under `BAIUnmountAfterClose`). In that case the modal
   * renders the "preset not found" placeholder. Callers typically obtain
   * the fragment by spreading `DeploymentPresetDetailModalFragment` on a
   * preset node from an existing list query, or by wrapping a tiny
   * `useLazyLoadQuery` loader for paginated cases where the preset isn't
   * already in the local list.
   */
  presetFrgmt: DeploymentPresetDetailModalFragment$key | null | undefined;
}

const DeploymentPresetDetailModal: React.FC<
  DeploymentPresetDetailModalProps
> = ({ presetFrgmt, ...modalProps }) => {
  'use memo';

  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  const supportsModelDefinition = baiClient.supports('preset-model-definition');

  const preset = useFragment(
    graphql`
      fragment DeploymentPresetDetailModalFragment on DeploymentRevisionPreset {
        id
        name
        description
        runtimeVariantId
        runtimeVariant {
          id
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
        image @since(version: "26.4.4") {
          id
          identity {
            canonicalName
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
        modelDefinition @since(version: "26.4.4") {
          models {
            name
            service {
              healthCheck {
                # TODO: change to "26.4.4" once the 26.4.4 release is out
                enable @since(version: "26.4.4rc7")
                interval
                path
                maxRetries
                maxWaitTime
                expectedStatusCode
                initialDelay
              }
            }
          }
        }
      }
    `,
    presetFrgmt ?? null,
  );

  // `image` is gated by @since(26.4.4); on older managers it is null, so the
  // Image row falls back to "-". This replaces the previous secondary
  // useImageCanonicalName(imageId) lookup now that the preset exposes the
  // resolved image directly (BA-5952).
  const imageCanonicalName = preset?.image?.identity?.canonicalName;

  const shmem = preset?.resource?.resourceOpts?.find(
    (opt) => opt.name === 'shmem',
  )?.value;

  const healthCheck = preset?.modelDefinition?.models?.find(
    (m) => m.service?.healthCheck,
  )?.service?.healthCheck;
  // On 26.4.4rc7+ `enable` is authoritative; on older managers `enable` is
  // stripped (undefined), so fall back to presence of the object.
  const isHealthCheckEnabled = healthCheck?.enable ?? !!healthCheck;
  const hasServiceConfig =
    supportsModelDefinition &&
    (preset?.modelDefinition?.models?.length ?? 0) > 0;

  return (
    <BAIModal
      centered
      title={t('modelService.DeploymentPresetDetail')}
      destroyOnHidden
      footer={null}
      width={720}
      {...modalProps}
    >
      {!preset ? (
        <Text color="secondary">{t('modelService.PresetNotFound')}</Text>
      ) : (
        <BAIFlex direction="column" align="stretch" gap="sm">
          {/* PILOT-DECISION: antd Descriptions `size="small"` has no
              MetadataList equivalent — dropped throughout this modal;
              Astryx's default density is the design. */}
          <Heading level={5}>{preset.name}</Heading>
          {preset.description && (
            <Text color="secondary">{preset.description}</Text>
          )}
          <BAICard
            size="small"
            title={t('adminDeploymentPreset.SectionImage')}
            styles={{ body: { paddingTop: 0 } }}
          >
            <BAIMetadataList columns={1}>
              <MetadataListItem label={t('adminDeploymentPreset.Image')}>
                {imageCanonicalName ? (
                  <BAIText copyable>{imageCanonicalName}</BAIText>
                ) : (
                  '-'
                )}
              </MetadataListItem>
              <MetadataListItem label={t('adminDeploymentPreset.Runtime')}>
                {preset.runtimeVariant?.name ?? preset.runtimeVariantId}
              </MetadataListItem>
            </BAIMetadataList>
          </BAICard>
          <BAICard
            size="small"
            title={t('adminDeploymentPreset.SectionCluster')}
            styles={{ body: { paddingTop: 0 } }}
          >
            <BAIMetadataList columns={2}>
              <MetadataListItem label={t('adminDeploymentPreset.ClusterMode')}>
                {preset.cluster?.clusterMode || '-'}
              </MetadataListItem>
              <MetadataListItem label={t('adminDeploymentPreset.ClusterSize')}>
                {preset.cluster?.clusterSize ?? '-'}
              </MetadataListItem>
            </BAIMetadataList>
          </BAICard>
          <BAICard
            size="small"
            title={t('adminDeploymentPreset.SectionResources')}
            styles={{ body: { paddingTop: 0 } }}
          >
            <BAIFlex direction="column" align="stretch" gap="xs">
              <ResourceNumbersOfSession
                resource={
                  {
                    ...Object.fromEntries(
                      (preset.resourceSlots ?? []).map((s) =>
                        s.slotName === 'cpu'
                          ? [s.slotName, parseFloat(s.quantity)]
                          : [s.slotName, s.quantity],
                      ),
                    ),
                    ...(shmem ? { shmem } : {}),
                  } as ResourceAllocationFormValue['resource']
                }
              />
              {(preset.resource?.resourceOpts?.filter((o) => o.name !== 'shmem')
                .length ?? 0) > 0 && (
                <BAIMetadataList columns={2}>
                  {(preset.resource?.resourceOpts ?? [])
                    .filter((opt) => opt.name !== 'shmem')
                    .map((opt) => (
                      <MetadataListItem key={opt.name} label={opt.name}>
                        {opt.value}
                      </MetadataListItem>
                    ))}
                </BAIMetadataList>
              )}
            </BAIFlex>
          </BAICard>
          <BAICard
            size="small"
            title={t('adminDeploymentPreset.SectionDeploymentDefaults')}
            styles={{ body: { paddingTop: 0 } }}
          >
            <BAIMetadataList columns={2}>
              <MetadataListItem label={t('adminDeploymentPreset.Replicas')}>
                {preset.deploymentDefaults?.replicaCount ?? '-'}
              </MetadataListItem>
              <MetadataListItem
                label={t('adminDeploymentPreset.RevisionHistoryLimit')}
              >
                {preset.deploymentDefaults?.revisionHistoryLimit ?? '-'}
              </MetadataListItem>
              <MetadataListItem label={t('adminDeploymentPreset.Strategy')}>
                {preset.deploymentDefaults?.deploymentStrategy ?? '-'}
              </MetadataListItem>
              <MetadataListItem label={t('adminDeploymentPreset.OpenToPublic')}>
                {preset.deploymentDefaults?.openToPublic != null
                  ? preset.deploymentDefaults.openToPublic
                    ? t('button.Yes')
                    : t('button.No')
                  : '-'}
              </MetadataListItem>
            </BAIMetadataList>
          </BAICard>
          {hasServiceConfig && (
            <BAICard
              size="small"
              title={t('adminDeploymentPreset.SectionHealthCheck')}
              styles={{ body: { paddingTop: 0 } }}
            >
              <BAIMetadataList columns={isHealthCheckEnabled ? 2 : 1}>
                <MetadataListItem
                  label={t('adminDeploymentPreset.modelDef.EnableHealthCheck')}
                >
                  {isHealthCheckEnabled
                    ? t('general.Enabled')
                    : t('general.Disabled')}
                </MetadataListItem>
                {isHealthCheckEnabled && (
                  <>
                    <MetadataListItem
                      label={t(
                        'adminDeploymentPreset.modelDef.HealthCheckPath',
                      )}
                    >
                      {healthCheck?.path ?? '-'}
                    </MetadataListItem>
                    <MetadataListItem
                      label={t(
                        'adminDeploymentPreset.modelDef.HealthCheckInterval',
                      )}
                    >
                      {healthCheck?.interval ?? '-'}
                    </MetadataListItem>
                    <MetadataListItem
                      label={t(
                        'adminDeploymentPreset.modelDef.HealthCheckMaxRetries',
                      )}
                    >
                      {healthCheck?.maxRetries ?? '-'}
                    </MetadataListItem>
                    <MetadataListItem
                      label={t(
                        'adminDeploymentPreset.modelDef.HealthCheckMaxWaitTime',
                      )}
                    >
                      {healthCheck?.maxWaitTime ?? '-'}
                    </MetadataListItem>
                    <MetadataListItem
                      label={t(
                        'adminDeploymentPreset.modelDef.HealthCheckExpectedStatus',
                      )}
                    >
                      {healthCheck?.expectedStatusCode ?? '-'}
                    </MetadataListItem>
                    <MetadataListItem
                      label={t(
                        'adminDeploymentPreset.modelDef.HealthCheckInitialDelay',
                      )}
                    >
                      {healthCheck?.initialDelay ?? '-'}
                    </MetadataListItem>
                  </>
                )}
              </BAIMetadataList>
            </BAICard>
          )}
        </BAIFlex>
      )}
    </BAIModal>
  );
};

export default DeploymentPresetDetailModal;
