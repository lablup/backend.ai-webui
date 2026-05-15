/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DeploymentRevisionDetail_revision$key } from '../__generated__/DeploymentRevisionDetail_revision.graphql';
import { convertToBinaryUnit } from '../helper';
import { formatShellCommand } from '../helper/parseCliCommand';
import FolderLink from './FolderLink';
import SourceCodeView from './SourceCodeView';
import { LoadingOutlined } from '@ant-design/icons';
import { Descriptions, Grid, Typography } from 'antd';
import { DescriptionsItemType } from 'antd/es/descriptions';
import {
  BAIFlex,
  BAIResourceNumberWithIcon,
  BAITag,
  BAIText,
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
  const screens = Grid.useBreakpoint();

  const revision = useFragment(
    graphql`
      fragment DeploymentRevisionDetail_revision on ModelRevision {
        id
        revisionNumber
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
                interval
                maxWaitTime
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
  // Drop empty / unnamed entries so the rendered shell block doesn't show
  // bare `="value"` lines if the backend ever returns one.
  const namedEnvironEntries = environEntries.filter(
    (entry): entry is typeof entry & { name: string } => !!entry.name,
  );
  const resourceSlots = revision.resourceSlots ?? [];

  const descriptionsProps = {
    bordered: true,
    column: screens.md ? 2 : 1,
  } as const;

  const baseItems: DescriptionsItemType[] = filterOutEmpty([
    {
      key: 'revision-number',
      label: t('deployment.RevisionNumber'),
      children:
        revision.revisionNumber != null ? (
          <BAIText>{`#${revision.revisionNumber}`}</BAIText>
        ) : (
          renderFallback()
        ),
    },
    {
      key: 'revision-id',
      label: t('modelService.RevisionID'),
      children: revision.id ? (
        <BAIFlex gap="xs" align="center">
          <BAIText copyable>{toLocalId(revision.id)}</BAIText>
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
        namedEnvironEntries.length > 0 ? (
          <SourceCodeView language="shell">
            {namedEnvironEntries
              .map((entry) => {
                // Render `KEY="VALUE"` with shell escaping so a value
                // containing a literal `"`, `\`, `$`, backtick, or newline
                // stays valid (and copy-pasteable) shell.
                const value = (entry.value ?? '')
                  .replace(/\\/g, '\\\\')
                  .replace(/"/g, '\\"')
                  .replace(/\$/g, '\\$')
                  .replace(/`/g, '\\`')
                  .replace(/\n/g, '\\n');
                return `${entry.name}="${value}"`;
              })
              .join('\n')}
          </SourceCodeView>
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
                  {/* Use the same shell-quoting as the Add Revision form's
                      prefill (see DeploymentAddRevisionModal), so a token
                      list with whitespace or shell-significant chars
                      round-trips to a valid shell command instead of being
                      flattened by a plain `.join(' ')`. */}
                  {Array.isArray(model.service.startCommand)
                    ? formatShellCommand(model.service.startCommand)
                    : typeof model.service.startCommand === 'string'
                      ? model.service.startCommand
                      : JSON.stringify(model.service.startCommand)}
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
                  {
                    key: `model-interval-${idx}`,
                    label: `${prefix}${t('modelService.Interval')}`,
                    children:
                      model.service.healthCheck.interval ?? renderFallback(),
                  },
                  {
                    key: `model-max-wait-time-${idx}`,
                    label: `${prefix}${t('modelService.MaxWaitTime')}`,
                    children:
                      model.service.healthCheck.maxWaitTime ?? renderFallback(),
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
