/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DeploymentRevisionDetailDrawerQuery } from '../__generated__/DeploymentRevisionDetailDrawerQuery.graphql';
import FolderLink from './FolderLink';
import SourceCodeView from './SourceCodeView';
import {
  Descriptions,
  Drawer,
  Grid,
  Skeleton,
  Tag,
  Typography,
  theme,
} from 'antd';
import { DescriptionsItemType } from 'antd/es/descriptions';
import { DrawerProps } from 'antd/lib';
import {
  BAIFlex,
  filterOutEmpty,
  filterOutNullAndUndefined,
  toLocalId,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

interface DeploymentRevisionDetailDrawerProps extends DrawerProps {
  revisionId?: string | null;
  currentRevisionId?: string | null;
}

const DeploymentRevisionDetailDrawerContent: React.FC<{
  revisionId: string;
  currentRevisionId?: string | null;
}> = ({ revisionId, currentRevisionId }) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { revision } = useLazyLoadQuery<DeploymentRevisionDetailDrawerQuery>(
    graphql`
      query DeploymentRevisionDetailDrawerQuery($revisionId: ID!) {
        revision(id: $revisionId) {
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
      }
    `,
    { revisionId },
    { fetchPolicy: 'network-only' },
  );

  const renderFallback = () => (
    <Typography.Text type="secondary">-</Typography.Text>
  );

  const screens = Grid.useBreakpoint();
  // `revision.id` is the Strawberry global id (`ModelRevision:<uuid>`
  // base64) and the `currentRevisionId` prop may come in either form
  // depending on the caller (some pass the local UUID from
  // `deployment.currentRevisionId`, others pass the global id from
  // `deployment.currentRevision.id`). Normalize both sides to local UUIDs
  // before comparing so the "currently applied" indicator works in either
  // case. `toLocalId` calls `atob` which throws on non-base64 input, so
  // fall back to the raw value when decoding fails.
  const safeToLocalId = (id: string | null | undefined): string | undefined => {
    if (!id) return undefined;
    try {
      return toLocalId(id) ?? id;
    } catch {
      return id;
    }
  };
  const isCurrent =
    !!revision?.id &&
    !!currentRevisionId &&
    safeToLocalId(revision.id) === safeToLocalId(currentRevisionId);
  const clusterConfig = revision?.clusterConfig;
  const resourceConfig = revision?.resourceConfig;
  const runtimeConfig = revision?.modelRuntimeConfig;
  const mountConfig = revision?.modelMountConfig;
  const environEntries = runtimeConfig?.environ?.entries ?? [];

  const descriptionsProps = {
    bordered: true,
    column: screens.md ? 2 : 1,
    style: { backgroundColor: token.colorBgBase },
  } as const;

  const baseItems: DescriptionsItemType[] = filterOutEmpty([
    {
      key: 'revision-name',
      label: t('modelService.RevisionID'),
      children: revision?.name ? (
        <BAIFlex gap="xs" align="center">
          <Typography.Text>{revision.name}</Typography.Text>
          {isCurrent && (
            <Tag color={token.colorPrimary}>{t('deployment.Current')}</Tag>
          )}
        </BAIFlex>
      ) : (
        renderFallback()
      ),
    },
    {
      key: 'created-at',
      label: t('general.CreatedAt'),
      children: revision?.createdAt
        ? dayjs(revision.createdAt).format('lll')
        : renderFallback(),
    },
    {
      key: 'resource-group',
      label: t('deployment.ResourceGroup'),
      children: resourceConfig?.resourceGroupName || renderFallback(),
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
      key: 'runtime-variant',
      label: t('deployment.RuntimeVariant'),
      children: runtimeConfig?.runtimeVariant?.name || renderFallback(),
    },
    {
      key: 'image',
      label: t('deployment.Image'),
      children: revision?.imageV2?.identity?.canonicalName ? (
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

  const rawModels = revision?.modelDefinition?.models;
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

const DeploymentRevisionDetailDrawer: React.FC<
  DeploymentRevisionDetailDrawerProps
> = ({ revisionId, currentRevisionId, ...drawerProps }) => {
  'use memo';
  const { t } = useTranslation();

  return (
    <Drawer
      title={t('deployment.RevisionDetail')}
      size="large"
      {...drawerProps}
    >
      {revisionId ? (
        <Suspense fallback={<Skeleton active />}>
          <DeploymentRevisionDetailDrawerContent
            revisionId={revisionId}
            currentRevisionId={currentRevisionId}
          />
        </Suspense>
      ) : (
        <Skeleton active />
      )}
    </Drawer>
  );
};

export default DeploymentRevisionDetailDrawer;
