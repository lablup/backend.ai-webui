/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DeploymentConfigurationSectionCurrentRevisionModalQuery } from '../__generated__/DeploymentConfigurationSectionCurrentRevisionModalQuery.graphql';
import { DeploymentConfigurationSectionOverviewQuery } from '../__generated__/DeploymentConfigurationSectionOverviewQuery.graphql';
import { DeploymentConfigurationSectionRevisionInfoQuery } from '../__generated__/DeploymentConfigurationSectionRevisionInfoQuery.graphql';
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
  Descriptions,
  Skeleton,
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
  BAIUnmountAfterClose,
  toLocalId,
} from 'backend.ai-ui';
import React, { Suspense, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

interface DeploymentConfigurationSectionProps {
  deploymentFrgmt: DeploymentConfigurationSection_deployment$key;
  deploymentId: string;
  isDeploymentDestroying?: boolean;
}

type ModelDef = {
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
};

const descriptionsProps = {
  bordered: true,
  column: { xxl: 3, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 },
} as const;

const renderFallback = () => (
  <Typography.Text type="secondary">-</Typography.Text>
);

const buildModelDefinitionItems = (
  rawModels: ReadonlyArray<ModelDef | null> | null | undefined,
  t: (key: string) => string,
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
                      model.service.healthCheck.maxRetries ?? renderFallback(),
                  },
                ] as DescriptionsItemType[])
              : []),
          ] as DescriptionsItemType[])
        : []),
    ];
    return modelItems;
  });
};

const DeploymentOverviewContent: React.FC<{
  deploymentId: string;
  fetchKey: number;
}> = ({ deploymentId, fetchKey }) => {
  'use memo';
  const { t } = useTranslation();

  const { deployment } =
    useLazyLoadQuery<DeploymentConfigurationSectionOverviewQuery>(
      graphql`
        query DeploymentConfigurationSectionOverviewQuery($deploymentId: ID!) {
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
            replicaState {
              desiredReplicaCount
            }
          }
        }
      `,
      { deploymentId },
      { fetchKey, fetchPolicy: 'network-only' },
    );

  const projectName =
    deployment?.metadata.projectV2?.basicInfo?.name ??
    deployment?.metadata.projectId;
  const tags = deployment?.metadata.tags ?? [];

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

  return <Descriptions {...descriptionsProps} items={deploymentItems} />;
};

const DeploymentRevisionInfoContent: React.FC<{
  deploymentId: string;
  fetchKey: number;
  onShowCurrentRevisionModal: () => void;
}> = ({ deploymentId, fetchKey, onShowCurrentRevisionModal }) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const { deployment } =
    useLazyLoadQuery<DeploymentConfigurationSectionRevisionInfoQuery>(
      graphql`
        query DeploymentConfigurationSectionRevisionInfoQuery(
          $deploymentId: ID!
        ) {
          deployment(id: $deploymentId) {
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

  const currentRevision = deployment?.currentRevision;
  if (!currentRevision) {
    return null;
  }

  const clusterConfig = currentRevision.clusterConfig;
  const resourceConfig = currentRevision.resourceConfig;
  const runtimeConfig = currentRevision.modelRuntimeConfig;
  const mountConfig = currentRevision.modelMountConfig;
  const environEntries = runtimeConfig?.environ?.entries ?? [];

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
      children: currentRevision.name || renderFallback(),
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
      children: currentRevision.imageV2?.identity?.canonicalName ? (
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

  const currentModelDefItems = buildModelDefinitionItems(
    currentRevision.modelDefinition?.models,
    t,
  );
  const latestModelDefItems = buildModelDefinitionItems(
    deployment?.revisionHistory?.edges?.[0]?.node?.modelDefinition?.models,
    t,
  );
  const currentRevisionName = currentRevision.name;
  const latestRevisionName =
    deployment?.revisionHistory?.edges?.[0]?.node?.name;
  const isRevisionMismatch =
    currentRevision.id != null &&
    deployment?.revisionHistory?.edges?.[0]?.node?.id != null &&
    currentRevision.id !== deployment.revisionHistory.edges[0].node.id;

  const displayRevisionName =
    latestModelDefItems.length > 0 ? latestRevisionName : currentRevisionName;
  const displayRevisionItems = [
    ...revisionItems,
    ...(latestModelDefItems.length > 0
      ? latestModelDefItems
      : currentModelDefItems),
  ];

  return (
    <>
      {isRevisionMismatch && (
        <Alert
          type="info"
          icon={<LoadingOutlined spin />}
          showIcon
          title={t('modelService.NextRevisionApplying')}
          action={
            <Button onClick={onShowCurrentRevisionModal}>
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
    </>
  );
};

const DeploymentCurrentRevisionModalContent: React.FC<{
  deploymentId: string;
  fetchKey: number;
}> = ({ deploymentId, fetchKey }) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const { deployment } =
    useLazyLoadQuery<DeploymentConfigurationSectionCurrentRevisionModalQuery>(
      graphql`
        query DeploymentConfigurationSectionCurrentRevisionModalQuery(
          $deploymentId: ID!
        ) {
          deployment(id: $deploymentId) {
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
          }
        }
      `,
      { deploymentId },
      { fetchKey, fetchPolicy: 'store-and-network' },
    );

  const currentRevision = deployment?.currentRevision;
  if (!currentRevision) {
    return null;
  }

  const clusterConfig = currentRevision.clusterConfig;
  const resourceConfig = currentRevision.resourceConfig;
  const runtimeConfig = currentRevision.modelRuntimeConfig;
  const mountConfig = currentRevision.modelMountConfig;
  const environEntries = runtimeConfig?.environ?.entries ?? [];

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
      children: currentRevision.name || renderFallback(),
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
      children: currentRevision.imageV2?.identity?.canonicalName ? (
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

  const currentModelDefItems = buildModelDefinitionItems(
    currentRevision.modelDefinition?.models,
    t,
  );

  return (
    <>
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
            children: currentRevision.name || renderFallback(),
          },
          ...revisionItems,
          ...currentModelDefItems,
        ]}
      />
    </>
  );
};

const DeploymentConfigurationSection: React.FC<
  DeploymentConfigurationSectionProps
> = ({ deploymentFrgmt, deploymentId, isDeploymentDestroying = false }) => {
  'use memo';

  const { t } = useTranslation();
  const webuiNavigate = useWebUINavigate();
  const [isPendingRefetch, startRefetchTransition] = useTransition();
  const [fetchKey, setFetchKey] = useState(0);
  const [isCurrentRevisionModalOpen, setIsCurrentRevisionModalOpen] =
    useState(false);

  const deployment = useFragment(
    graphql`
      fragment DeploymentConfigurationSection_deployment on ModelDeployment {
        id
        currentRevision @since(version: "26.4.3") {
          id
        }
      }
    `,
    deploymentFrgmt,
  );

  const deploymentLocalId = toLocalId(deploymentId);
  const hasCurrentRevision = !!deployment?.currentRevision?.id;

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
        styles={{ body: { paddingTop: 0 } }}
      >
        <Suspense fallback={<Skeleton active />}>
          <DeploymentOverviewContent
            deploymentId={deploymentId}
            fetchKey={fetchKey}
          />
        </Suspense>
      </BAICard>
      {hasCurrentRevision && (
        <BAICard
          title={t('modelService.RevisionInfo')}
          styles={{ body: { paddingTop: 0 } }}
        >
          <Suspense fallback={<Skeleton active />}>
            <DeploymentRevisionInfoContent
              deploymentId={deploymentId}
              fetchKey={fetchKey}
              onShowCurrentRevisionModal={() =>
                setIsCurrentRevisionModalOpen(true)
              }
            />
          </Suspense>
        </BAICard>
      )}
      <BAIUnmountAfterClose>
        <BAIModal
          open={isCurrentRevisionModalOpen}
          onCancel={() => setIsCurrentRevisionModalOpen(false)}
          title={t('modelService.CurrentRevisionTitle')}
          footer={null}
          width={800}
        >
          <Suspense fallback={<Skeleton active />}>
            <DeploymentCurrentRevisionModalContent
              deploymentId={deploymentId}
              fetchKey={fetchKey}
            />
          </Suspense>
        </BAIModal>
      </BAIUnmountAfterClose>
    </>
  );
};

export default DeploymentConfigurationSection;
