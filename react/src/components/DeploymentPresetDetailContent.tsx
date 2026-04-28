/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DeploymentPresetDetailContentFragment$key } from '../__generated__/DeploymentPresetDetailContentFragment.graphql';
import type { DeploymentPresetDetailContentImageQuery } from '../__generated__/DeploymentPresetDetailContentImageQuery.graphql';
import { ResourceNumbersOfSession } from '../pages/SessionLauncherPage';
import { ResourceAllocationFormValue } from './SessionFormItems/ResourceAllocationFormItems';
import { Descriptions, Skeleton, Typography } from 'antd';
import { BAICard, BAIFlex } from 'backend.ai-ui';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

const ImageCanonicalName: React.FC<{ imageId: string }> = ({ imageId }) => {
  'use memo';
  const data = useLazyLoadQuery<DeploymentPresetDetailContentImageQuery>(
    graphql`
      query DeploymentPresetDetailContentImageQuery($id: ID!) {
        imageV2(id: $id) {
          identity {
            canonicalName
          }
        }
      }
    `,
    { id: imageId },
    { fetchPolicy: 'store-or-network' },
  );
  return (
    <Typography.Text copyable>
      {data.imageV2?.identity.canonicalName ?? imageId}
    </Typography.Text>
  );
};

interface DeploymentPresetDetailContentProps {
  presetFrgmt: DeploymentPresetDetailContentFragment$key | null | undefined;
}

const DeploymentPresetDetailContent: React.FC<
  DeploymentPresetDetailContentProps
> = ({ presetFrgmt }) => {
  'use memo';

  const { t } = useTranslation();

  const preset = useFragment(
    graphql`
      fragment DeploymentPresetDetailContentFragment on DeploymentRevisionPreset {
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
        presetValues {
          presetId
          value
        }
      }
    `,
    presetFrgmt,
  );

  if (!preset) return null;

  const shmem = preset.resource?.resourceOpts?.find(
    (opt) => opt.name === 'shmem',
  )?.value;

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <Typography.Title level={5} style={{ margin: 0 }}>
        {preset.name}
      </Typography.Title>
      {preset.description && (
        <Typography.Text type="secondary">{preset.description}</Typography.Text>
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
              children: preset.execution?.imageId ? (
                <Suspense fallback={<Skeleton.Input size="small" active />}>
                  <ImageCanonicalName imageId={preset.execution.imageId} />
                </Suspense>
              ) : (
                '-'
              ),
            },
            {
              label: t('adminDeploymentPreset.Runtime'),
              children: preset.runtimeVariant?.name ?? preset.runtimeVariantId,
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
            (preset.resource?.resourceOpts?.filter((o) => o.name !== 'shmem')
              .length ?? 0) > 0) && (
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
              children: preset.deploymentDefaults?.revisionHistoryLimit ?? '-',
            },
            {
              label: t('adminDeploymentPreset.Strategy'),
              children: preset.deploymentDefaults?.deploymentStrategy ?? '-',
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
    </BAIFlex>
  );
};

export default DeploymentPresetDetailContent;
