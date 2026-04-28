/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DeploymentPresetDetailContentFragment$key } from '../__generated__/DeploymentPresetDetailContentFragment.graphql';
import { Descriptions, Divider, Typography } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
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
        rowId
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
            name
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
      <Descriptions
        size="small"
        column={2}
        items={[
          {
            label: t('adminDeploymentPreset.Rank'),
            children: preset.rank,
          },
          {
            label: t('adminDeploymentPreset.Runtime'),
            children: preset.runtimeVariant?.name ?? preset.runtimeVariantId,
          },
        ]}
      />

      <Divider
        style={{ margin: '4px 0' }}
        titlePlacement="left"
        orientationMargin={0}
      >
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {t('adminDeploymentPreset.SectionImage')}
        </Typography.Text>
      </Divider>
      <Descriptions
        size="small"
        column={1}
        items={[
          {
            label: t('adminDeploymentPreset.Image'),
            children: preset.execution?.image || '-',
          },
        ]}
      />

      <Divider
        style={{ margin: '4px 0' }}
        titlePlacement="left"
        orientationMargin={0}
      >
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {t('adminDeploymentPreset.SectionCluster')}
        </Typography.Text>
      </Divider>
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

      <Divider
        style={{ margin: '4px 0' }}
        titlePlacement="left"
        orientationMargin={0}
      >
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {t('adminDeploymentPreset.SectionResources')}
        </Typography.Text>
      </Divider>
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

      <Divider
        style={{ margin: '4px 0' }}
        titlePlacement="left"
        orientationMargin={0}
      >
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {t('adminDeploymentPreset.SectionDeploymentDefaults')}
        </Typography.Text>
      </Divider>
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
    </BAIFlex>
  );
};

export default DeploymentPresetDetailContent;
