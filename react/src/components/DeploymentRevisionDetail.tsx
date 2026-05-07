/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DeploymentRevisionDetail_revision$key } from '../__generated__/DeploymentRevisionDetail_revision.graphql';
import { convertToBinaryUnit } from '../helper';
import FolderLink from './FolderLink';
import SourceCodeView from './SourceCodeView';
import { LoadingOutlined } from '@ant-design/icons';
import { Descriptions, Grid, Typography, theme } from 'antd';
import { DescriptionsItemType } from 'antd/es/descriptions';
import {
  BAIFlex,
  BAIResourceNumberWithIcon,
  BAITag,
  filterOutEmpty,
  filterOutNullAndUndefined,
  toLocalId,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

const renderFallback = () => (
  <Typography.Text type="secondary">-</Typography.Text>
);

const DeploymentRevisionDetail: React.FC<{
  revisionFrgmt: DeploymentRevisionDetail_revision$key;
  status?: 'current' | 'deploying' | 'none';
}> = ({ revisionFrgmt, status = 'none' }) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const screens = Grid.useBreakpoint();

  const revision = useFragment(
    graphql`
      fragment DeploymentRevisionDetail_revision on ModelRevision {
        id
        name
        createdAt
        clusterConfig {
          mode
          size
        }
        resourceConfig {
          resourceGroupName
        }
        resourceSlots @since(version: "26.4.2") {
          slotName
          quantity
        }
        modelRuntimeConfig {
          runtimeVariant {
            name
          }
          environ {
            entries {
              name
              value
            }
          }
        }
        modelMountConfig {
          vfolderId
          mountDestination
          definitionPath
          vfolder {
            id
            name
          }
        }
        extraMounts {
          vfolderId
          mountDestination
          mountPerm
          vfolder {
            id
            name
            ...FolderLink_vfolderNode
          }
        }
        imageV2 @since(version: "26.4.3") {
          id
          identity {
            canonicalName
          }
        }
        modelDefinition {
          models {
            name
            modelPath
            service {
              startCommand
              port
              healthCheck {
                path
                initialDelay
                maxRetries
              }
            }
          }
        }
      }
    `,
    revisionFrgmt,
  );

  const clusterConfig = revision.clusterConfig;
  const resourceConfig = revision.resourceConfig;
  const runtimeConfig = revision.modelRuntimeConfig;
  const mountConfig = revision.modelMountConfig;
  const extraMounts = revision.extraMounts ?? [];
  const environEntries = runtimeConfig?.environ?.entries ?? [];
  const resourceSlots = revision.resourceSlots ?? [];

  const descriptionsProps = {
    bordered: true,
    column: screens.md ? 2 : 1,
    style: { backgroundColor: token.colorBgBase },
  } as const;

  const baseItems: DescriptionsItemType[] = filterOutEmpty([
    {
      key: 'revision-name',
      label: t('modelService.RevisionID'),
      children: revision.name ? (
        <BAIFlex gap="xs" align="center">
          <Typography.Text>{revision.name}</Typography.Text>
          {status === 'current' && (
            <BAITag color="success">{t('deployment.Current')}</BAITag>
          )}
          {status === 'deploying' && (
            <BAITag color="warning" icon={<LoadingOutlined spin />}>
              {t('deployment.Deploying')}
            </BAITag>
          )}
        </BAIFlex>
      ) : (
        renderFallback()
      ),
    },
    {
      key: 'created-at',
      label: t('general.CreatedAt'),
      children: revision.createdAt
        ? dayjs(revision.createdAt).format('lll')
        : renderFallback(),
    },
    {
      key: 'resource-group',
      label: t('deployment.ResourceGroup'),
      children: resourceConfig?.resourceGroupName || renderFallback(),
    },
    {
      key: 'resource-slots',
      label: t('session.launcher.ResourceAllocation'),
      children:
        resourceSlots.length > 0 ? (
          <BAIFlex gap="sm" wrap="wrap">
            {resourceSlots
              .filter(
                (slot): slot is typeof slot & { slotName: string } =>
                  !!slot.slotName,
              )
              .map((slot) => {
                const rawValue = String(slot.quantity);
                const value =
                  slot.slotName === 'mem'
                    ? String(convertToBinaryUnit(rawValue, '')?.number ?? 0)
                    : String(parseFloat(rawValue));
                return (
                  <BAIResourceNumberWithIcon
                    key={slot.slotName}
                    type={slot.slotName}
                    value={value}
                  />
                );
              })}
          </BAIFlex>
        ) : (
          renderFallback()
        ),
    },
    {
      key: 'model-folder',
      label: t('deployment.ModelFolder'),
      children: mountConfig?.vfolder?.name ? (
        <BAIFlex direction="column" align="start">
          <FolderLink
            folderId={toLocalId(mountConfig.vfolder.id) ?? ''}
            folderName={mountConfig.vfolder.name}
            showIcon
          />
          {mountConfig.mountDestination && (
            <Typography.Text type="secondary">
              {mountConfig.mountDestination}
            </Typography.Text>
          )}
        </BAIFlex>
      ) : mountConfig?.vfolderId ? (
        <Typography.Text type="secondary">
          {mountConfig.vfolderId}
        </Typography.Text>
      ) : (
        renderFallback()
      ),
    },
    {
      key: 'model-definition-path',
      label: t('deployment.ModelDefinitionPath'),
      children: mountConfig?.definitionPath || renderFallback(),
    },
    {
      key: 'extra-mounts',
      label: t('deployment.AdditionalMounts'),
      children:
        extraMounts.length > 0 ? (
          <BAIFlex direction="column" align="start" gap="xs">
            {extraMounts.map((mount, idx) => (
              <BAIFlex
                key={mount.vfolderId ?? idx}
                direction="column"
                align="start"
              >
                {mount.vfolder ? (
                  <FolderLink vfolderNodeFragment={mount.vfolder} showIcon />
                ) : (
                  <Typography.Text type="secondary">
                    {mount.vfolderId}
                  </Typography.Text>
                )}
                {mount.mountDestination && (
                  <Typography.Text type="secondary">
                    {mount.mountDestination}
                  </Typography.Text>
                )}
              </BAIFlex>
            ))}
          </BAIFlex>
        ) : (
          renderFallback()
        ),
      span: 2,
    },
    {
      key: 'runtime-variant',
      label: t('deployment.RuntimeVariant'),
      children: runtimeConfig?.runtimeVariant?.name || renderFallback(),
    },
    {
      key: 'image',
      label: t('deployment.Image'),
      children: revision.imageV2?.identity?.canonicalName ? (
        <Typography.Text copyable>
          {revision.imageV2.identity.canonicalName}
        </Typography.Text>
      ) : (
        renderFallback()
      ),
    },
    {
      key: 'cluster-mode',
      label: t('deployment.ClusterMode'),
      children: clusterConfig ? (
        <Typography.Text>
          {clusterConfig.mode} / {clusterConfig.size}
        </Typography.Text>
      ) : (
        renderFallback()
      ),
    },
    {
      key: 'environ',
      label: t('deployment.Environ'),
      children:
        environEntries.length > 0 ? (
          <BAIFlex direction="column" align="start">
            {environEntries.map((entry) => (
              <Typography.Text key={entry.name} code>
                {entry.name}={entry.value}
              </Typography.Text>
            ))}
          </BAIFlex>
        ) : (
          renderFallback()
        ),
      span: 2,
    },
  ]);

  const rawModels = revision.modelDefinition?.models;
  const models = filterOutNullAndUndefined(rawModels);
  const modelItems: DescriptionsItemType[] = models.flatMap((model, idx) => {
    const prefix = models.length > 1 ? `[${idx}] ` : '';
    const items: DescriptionsItemType[] = filterOutEmpty([
      {
        key: `model-name-${idx}`,
        label: `${prefix}${t('modelStore.ModelName')}`,
        children: model.name || renderFallback(),
      },
      {
        key: `model-path-${idx}`,
        label: `${prefix}${t('modelStore.ModelPath')}`,
        children: model.modelPath || renderFallback(),
      },
      ...(model.service
        ? ([
            {
              key: `model-start-command-${idx}`,
              label: `${prefix}${t('modelService.StartCommand')}`,
              children: model.service.startCommand ? (
                <SourceCodeView language="shell">
                  {typeof model.service.startCommand === 'string'
                    ? model.service.startCommand
                    : JSON.stringify(model.service.startCommand, null, 2)}
                </SourceCodeView>
              ) : (
                renderFallback()
              ),
              span: 2,
            },
            {
              key: `model-port-${idx}`,
              label: `${prefix}${t('modelService.Port')}`,
              children: model.service.port ?? renderFallback(),
            },
            ...(model.service.healthCheck
              ? ([
                  {
                    key: `model-healthcheck-path-${idx}`,
                    label: `${prefix}${t('modelService.HealthCheck')}`,
                    children:
                      model.service.healthCheck.path || renderFallback(),
                  },
                  {
                    key: `model-initial-delay-${idx}`,
                    label: `${prefix}${t('modelService.InitialDelay')}`,
                    children:
                      model.service.healthCheck.initialDelay ??
                      renderFallback(),
                  },
                  {
                    key: `model-max-retries-${idx}`,
                    label: `${prefix}${t('modelService.MaxRetries')}`,
                    children:
                      model.service.healthCheck.maxRetries ?? renderFallback(),
                  },
                ] as DescriptionsItemType[])
              : []),
          ] as DescriptionsItemType[])
        : []),
    ]);
    return items;
  });

  return (
    <Descriptions
      {...descriptionsProps}
      items={[...baseItems, ...modelItems]}
    />
  );
};

export default DeploymentRevisionDetail;
