/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DeploymentConfigurationSectionQuery } from '../__generated__/DeploymentConfigurationSectionQuery.graphql';
import { DeploymentConfigurationSection_deployment$key } from '../__generated__/DeploymentConfigurationSection_deployment.graphql';
import { useWebUINavigate } from '../hooks';
import SourceCodeView from './SourceCodeView';
import {
  CheckCircleOutlined,
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Tag,
  Typography,
  theme,
} from 'antd';
import { DescriptionsItemType } from 'antd/es/descriptions';
import {
  filterOutEmpty,
  filterOutNullAndUndefined,
  BAIButton,
  BAICard,
  BAIFetchKeyButton,
  BAIFlex,
  BAIModal,
  toLocalId,
} from 'backend.ai-ui';
import React, { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

interface DeploymentConfigurationSectionProps {
  deploymentFrgmt: DeploymentConfigurationSection_deployment$key;
  deploymentId: string;
  isDeploymentDestroying?: boolean;
}

const DeploymentConfigurationSection: React.FC<
  DeploymentConfigurationSectionProps
> = ({ deploymentFrgmt, deploymentId, isDeploymentDestroying = false }) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();
  const webuiNavigate = useWebUINavigate();
  const [isPendingRefetch, startRefetchTransition] = useTransition();
  const [fetchKey, setFetchKey] = useState(0);
  const [isCurrentRevisionModalOpen, setIsCurrentRevisionModalOpen] =
    useState(false);

  useFragment(
    graphql`
      fragment DeploymentConfigurationSection_deployment on ModelDeployment {
        id
      }
    `,
    deploymentFrgmt,
  );

  const { deployment } = useLazyLoadQuery<DeploymentConfigurationSectionQuery>(
    graphql`
      query DeploymentConfigurationSectionQuery($deploymentId: ID!) {
        deployment(id: $deploymentId) {
          metadata {
            name
            tags
            projectId
            domainName
            projectV2 @since(version: "26.4.3") {
              basicInfo {
                name
              }
            }
          }
          networkAccess {
            openToPublic
            endpointUrl
          }
          defaultDeploymentStrategy {
            type
          }
          replicaState {
            desiredReplicaCount
          }
          currentRevision @since(version: "26.4.3") {
            id
            name
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
          revisionHistory(
            limit: 1
            orderBy: [{ field: CREATED_AT, direction: DESC }]
          ) {
            edges {
              node {
                id
                name
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
          }
        }
      }
    `,
    { deploymentId },
    { fetchKey, fetchPolicy: 'network-only' },
  );

  const deploymentLocalId = toLocalId(deploymentId);
  const currentRevision = deployment?.currentRevision;
  const clusterConfig = currentRevision?.clusterConfig;
  const resourceConfig = currentRevision?.resourceConfig;
  const runtimeConfig = currentRevision?.modelRuntimeConfig;
  const mountConfig = currentRevision?.modelMountConfig;
  const projectName =
    deployment?.metadata.projectV2?.basicInfo?.name ??
    deployment?.metadata.projectId;

  const renderFallback = () => (
    <Typography.Text type="secondary">-</Typography.Text>
  );

  const environEntries = runtimeConfig?.environ?.entries ?? [];
  const tags = deployment?.metadata.tags ?? [];

  const descriptionsProps = {
    bordered: true,
    column: { xxl: 3, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 },
    style: { backgroundColor: token.colorBgBase },
  } as const;

  // ─── Deployment-level items ───────────────────────────────────────────────
  const deploymentItems: DescriptionsItemType[] = filterOutEmpty([
    {
      key: 'name',
      label: t('deployment.Name'),
      children: deployment?.metadata.name ? (
        <Typography.Text copyable>{deployment.metadata.name}</Typography.Text>
      ) : (
        renderFallback()
      ),
    },
    {
      key: 'project',
      label: t('deployment.Project'),
      children: projectName || renderFallback(),
    },
    {
      key: 'domain',
      label: t('deployment.Domain'),
      children: deployment?.metadata.domainName || renderFallback(),
    },
    {
      key: 'endpoint-url',
      label: t('deployment.EndpointUrl'),
      children: deployment?.networkAccess.endpointUrl ? (
        <Typography.Text copyable>
          {deployment.networkAccess.endpointUrl}
        </Typography.Text>
      ) : (
        renderFallback()
      ),
    },
    {
      key: 'open-to-public',
      label: t('deployment.OpenToPublic'),
      children: deployment?.networkAccess.openToPublic ? (
        <CheckOutlined />
      ) : (
        <CloseOutlined />
      ),
    },
    {
      key: 'tags',
      label: t('deployment.Tags'),
      children:
        tags.length > 0 ? (
          <BAIFlex direction="row" wrap="wrap" gap="xxs">
            {tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </BAIFlex>
        ) : (
          renderFallback()
        ),
    },
    {
      key: 'desired-replicas',
      label: t('deployment.DesiredReplicas'),
      children:
        deployment?.replicaState?.desiredReplicaCount ?? renderFallback(),
    },
  ]);

  // ─── Current-revision config items ───────────────────────────────────────
  const revisionItems: DescriptionsItemType[] = filterOutEmpty([
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
          <Typography.Text>{mountConfig.vfolder.name}</Typography.Text>
          {mountConfig.mountDestination && (
            <Typography.Text type="secondary">
              {mountConfig.mountDestination}
            </Typography.Text>
          )}
        </BAIFlex>
      ) : (
        renderFallback()
      ),
    },
    {
      key: 'model-version',
      label: t('deployment.ModelVersion'),
      children: currentRevision?.name || renderFallback(),
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
      children: currentRevision?.imageV2?.identity?.canonicalName ? (
        <Typography.Text copyable>
          {currentRevision.imageV2.identity.canonicalName}
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
      span: { xl: 2 },
    },
  ]);

  // ─── Model definition items (ported from EndpointDetailPage) ─────────────
  const buildModelDefinitionItems = (
    rawModels:
      | ReadonlyArray<{
          readonly name: string | null | undefined;
          readonly modelPath: string | null | undefined;
          readonly service?: {
            readonly startCommand: unknown;
            readonly port: number | null | undefined;
            readonly healthCheck?: {
              readonly path: string | null | undefined;
              readonly initialDelay: number | null | undefined;
              readonly maxRetries: number | null | undefined;
            } | null;
          } | null;
        } | null>
      | null
      | undefined,
  ): DescriptionsItemType[] => {
    const models = filterOutNullAndUndefined(rawModels);
    if (!models || models.length === 0) return [];
    return models.flatMap((model, idx) => {
      const prefix = models.length > 1 ? `[${idx}] ` : '';
      const modelItems: DescriptionsItemType[] = [
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
                span: { xl: 2 },
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
                        model.service.healthCheck.maxRetries ??
                        renderFallback(),
                    },
                  ] as DescriptionsItemType[])
                : []),
            ] as DescriptionsItemType[])
          : []),
      ];
      return modelItems;
    });
  };

  const currentModelDefItems = buildModelDefinitionItems(
    currentRevision?.modelDefinition?.models,
  );
  const latestModelDefItems = buildModelDefinitionItems(
    deployment?.revisionHistory?.edges?.[0]?.node?.modelDefinition?.models,
  );
  const currentRevisionName = currentRevision?.name;
  const latestRevisionName =
    deployment?.revisionHistory?.edges?.[0]?.node?.name;
  const isRevisionMismatch =
    currentRevision?.id != null &&
    deployment?.revisionHistory?.edges?.[0]?.node?.id != null &&
    currentRevision.id !== deployment.revisionHistory.edges[0].node.id;

  // Latest revision: prefer latest model def items; current revision config always comes from currentRevision
  const displayRevisionName =
    latestModelDefItems.length > 0 ? latestRevisionName : currentRevisionName;
  const displayRevisionItems = [
    ...revisionItems,
    ...(latestModelDefItems.length > 0
      ? latestModelDefItems
      : currentModelDefItems),
  ];
  const currentRevisionAllItems = [...revisionItems, ...currentModelDefItems];

  const handleRefetch = () => {
    startRefetchTransition(() => {
      setFetchKey((k) => k + 1);
    });
  };

  return (
    <>
      <BAICard
        title={t('deployment.Overview')}
        extra={
          <BAIFlex gap="xs" align="center">
            <BAIFetchKeyButton
              loading={isPendingRefetch}
              value=""
              onChange={handleRefetch}
            />
            <BAIButton
              type="primary"
              icon={<EditOutlined />}
              disabled={isDeploymentDestroying}
              onClick={() => {
                webuiNavigate(`/deployments/${deploymentLocalId}/edit`);
              }}
            >
              {t('deployment.EditConfiguration')}
            </BAIButton>
          </BAIFlex>
        }
      >
        <Descriptions {...descriptionsProps} items={deploymentItems} />
      </BAICard>
      {currentRevision && (
        <Card title={t('modelService.RevisionInfo')}>
          {isRevisionMismatch && (
            <Alert
              type="info"
              icon={<LoadingOutlined spin />}
              showIcon
              title={t('modelService.NextRevisionApplying')}
              action={
                <Button onClick={() => setIsCurrentRevisionModalOpen(true)}>
                  {t('modelService.ViewCurrentRevision')}
                </Button>
              }
              style={{ marginBottom: token.marginMD }}
            />
          )}
          <Descriptions
            {...descriptionsProps}
            items={[
              {
                key: 'revision-id',
                label: t('modelService.RevisionID'),
                children: displayRevisionName || renderFallback(),
              },
              ...displayRevisionItems,
            ]}
          />
        </Card>
      )}
      <BAIModal
        open={isCurrentRevisionModalOpen}
        onCancel={() => setIsCurrentRevisionModalOpen(false)}
        title={t('modelService.CurrentRevisionTitle')}
        footer={null}
        width={800}
      >
        <Alert
          type="info"
          icon={<CheckCircleOutlined />}
          showIcon
          title={t('modelService.CurrentlyApplied')}
          style={{ marginBottom: token.marginMD }}
        />
        <Descriptions
          {...descriptionsProps}
          items={[
            {
              key: 'current-revision-id',
              label: t('modelService.RevisionID'),
              children: currentRevisionName || renderFallback(),
            },
            ...currentRevisionAllItems,
          ]}
        />
      </BAIModal>
    </>
  );
};

export default DeploymentConfigurationSection;
