/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DeploymentPresetDetailContentFragment$key } from '../__generated__/DeploymentPresetDetailContentFragment.graphql';
import { Descriptions, Typography } from 'antd';
import { BAICard, BAIFlex } from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

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
        rank
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
          image
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
              children: preset.execution?.image || '-',
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
