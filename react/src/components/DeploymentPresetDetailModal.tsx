/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DeploymentPresetDetailModalFragment$key } from '../__generated__/DeploymentPresetDetailModalFragment.graphql';
import { ResourceNumbersOfSession } from '../pages/SessionLauncherPage';
import { ResourceAllocationFormValue } from './SessionFormItems/ResourceAllocationFormItems';
import { Descriptions, Typography } from 'antd';
import { BAICard, BAIFlex, BAIModal, BAIModalProps } from 'backend.ai-ui';
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
        modelDefinition {
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
  const hasServiceConfig = (preset?.modelDefinition?.models?.length ?? 0) > 0;

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
        <Typography.Text type="secondary">
          {t('modelService.PresetNotFound')}
        </Typography.Text>
      ) : (
        <BAIFlex direction="column" align="stretch" gap="sm">
          <Typography.Title level={5} style={{ margin: 0 }}>
            {preset.name}
          </Typography.Title>
          {preset.description && (
            <Typography.Text type="secondary">
              {preset.description}
            </Typography.Text>
          )}
          <BAICard
            size="small"
            title={t('adminDeploymentPreset.SectionImage')}
            styles={{ body: { paddingTop: 0 } }}
          >
            <Descriptions
              size="small"
              column={1}
              items={[
                {
                  label: t('adminDeploymentPreset.Image'),
                  children: imageCanonicalName ? (
                    <Typography.Text copyable>
                      {imageCanonicalName}
                    </Typography.Text>
                  ) : (
                    '-'
                  ),
                },
                {
                  label: t('adminDeploymentPreset.Runtime'),
                  children:
                    preset.runtimeVariant?.name ?? preset.runtimeVariantId,
                },
              ]}
            />
          </BAICard>
          <BAICard
            size="small"
            title={t('adminDeploymentPreset.SectionCluster')}
            styles={{ body: { paddingTop: 0 } }}
          >
            <Descriptions
              size="small"
              column={2}
              items={[
                {
                  label: t('adminDeploymentPreset.ClusterMode'),
                  children: preset.cluster?.clusterMode || '-',
                },
                {
                  label: t('adminDeploymentPreset.ClusterSize'),
                  children: preset.cluster?.clusterSize ?? '-',
                },
              ]}
            />
          </BAICard>
          <BAICard
            size="small"
            title={t('adminDeploymentPreset.SectionResources')}
            styles={{ body: { paddingTop: 0 } }}
          >
            <BAIFlex direction="column" align="stretch" gap="xs">
              <ResourceNumbersOfSession
                resource={
                  Object.fromEntries(
                    (preset.resourceSlots ?? []).map((s) =>
                      s.slotName === 'cpu'
                        ? [s.slotName, parseFloat(s.quantity)]
                        : [s.slotName, s.quantity],
                    ),
                  ) as ResourceAllocationFormValue['resource']
                }
              />
              {(shmem ||
                (preset.resource?.resourceOpts?.filter(
                  (o) => o.name !== 'shmem',
                ).length ?? 0) > 0) && (
                <Descriptions
                  size="small"
                  column={2}
                  items={[
                    ...(shmem
                      ? [
                          {
                            label: t('adminDeploymentPreset.Shmem'),
                            children: `${shmem} GiB`,
                          },
                        ]
                      : []),
                    ...(preset.resource?.resourceOpts
                      ?.filter((opt) => opt.name !== 'shmem')
                      .map((opt) => ({
                        label: opt.name,
                        children: opt.value,
                      })) ?? []),
                  ]}
                />
              )}
            </BAIFlex>
          </BAICard>
          <BAICard
            size="small"
            title={t('adminDeploymentPreset.SectionDeploymentDefaults')}
            styles={{ body: { paddingTop: 0 } }}
          >
            <Descriptions
              size="small"
              column={2}
              items={[
                {
                  label: t('adminDeploymentPreset.Replicas'),
                  children: preset.deploymentDefaults?.replicaCount ?? '-',
                },
                {
                  label: t('adminDeploymentPreset.RevisionHistoryLimit'),
                  children:
                    preset.deploymentDefaults?.revisionHistoryLimit ?? '-',
                },
                {
                  label: t('adminDeploymentPreset.Strategy'),
                  children:
                    preset.deploymentDefaults?.deploymentStrategy ?? '-',
                },
                {
                  label: t('adminDeploymentPreset.OpenToPublic'),
                  children:
                    preset.deploymentDefaults?.openToPublic != null
                      ? preset.deploymentDefaults.openToPublic
                        ? t('button.Yes')
                        : t('button.No')
                      : '-',
                },
              ]}
            />
          </BAICard>
          {hasServiceConfig && (
            <BAICard
              size="small"
              title={t('adminDeploymentPreset.SectionHealthCheck')}
              styles={{ body: { paddingTop: 0 } }}
            >
              <Descriptions
                size="small"
                column={isHealthCheckEnabled ? 2 : 1}
                items={[
                  {
                    label: t(
                      'adminDeploymentPreset.modelDef.EnableHealthCheck',
                    ),
                    children: isHealthCheckEnabled
                      ? t('general.Enabled')
                      : t('general.Disabled'),
                  },
                  ...(isHealthCheckEnabled
                    ? [
                        {
                          label: t(
                            'adminDeploymentPreset.modelDef.HealthCheckPath',
                          ),
                          children: healthCheck?.path ?? '-',
                        },
                        {
                          label: t(
                            'adminDeploymentPreset.modelDef.HealthCheckInterval',
                          ),
                          children: healthCheck?.interval ?? '-',
                        },
                        {
                          label: t(
                            'adminDeploymentPreset.modelDef.HealthCheckMaxRetries',
                          ),
                          children: healthCheck?.maxRetries ?? '-',
                        },
                        {
                          label: t(
                            'adminDeploymentPreset.modelDef.HealthCheckMaxWaitTime',
                          ),
                          children: healthCheck?.maxWaitTime ?? '-',
                        },
                        {
                          label: t(
                            'adminDeploymentPreset.modelDef.HealthCheckExpectedStatus',
                          ),
                          children: healthCheck?.expectedStatusCode ?? '-',
                        },
                        {
                          label: t(
                            'adminDeploymentPreset.modelDef.HealthCheckInitialDelay',
                          ),
                          children: healthCheck?.initialDelay ?? '-',
                        },
                      ]
                    : []),
                ]}
              />
            </BAICard>
          )}
        </BAIFlex>
      )}
    </BAIModal>
  );
};

export default DeploymentPresetDetailModal;
