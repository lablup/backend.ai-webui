/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DeploymentConfigurationSectionQuery } from '../__generated__/DeploymentConfigurationSectionQuery.graphql';
import DeploymentAddRevisionModal from './DeploymentAddRevisionModal';
import DeploymentRevisionDetailDrawer from './DeploymentRevisionDetailDrawer';
import DeploymentSettingModal from './DeploymentSettingModal';
import FolderLink from './FolderLink';
import SourceCodeView from './SourceCodeView';
import {
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { useToggle } from 'ahooks';
import {
  Alert,
  Button,
  Descriptions,
  Empty,
  Skeleton,
  Tag,
  Typography,
  theme,
} from 'antd';
import { DescriptionsItemType } from 'antd/es/descriptions';
import {
  BAICard,
  BAIFetchKeyButton,
  BAIFlex,
  BAIUnmountAfterClose,
  INITIAL_FETCH_KEY,
  filterOutEmpty,
  filterOutNullAndUndefined,
  toLocalId,
  useFetchKey,
} from 'backend.ai-ui';
import React, { Suspense, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

interface DeploymentConfigurationSectionProps {
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
  column: { xs: 1, sm: 1, md: 2, lg: 2, xl: 2, xxl: 2 },
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

type DeploymentSectionData =
  DeploymentConfigurationSectionQuery['response']['deployment'];

const DeploymentOverviewContent: React.FC<{
  deployment: DeploymentSectionData;
}> = ({ deployment }) => {
  'use memo';
  const { t } = useTranslation();

  const projectName =
    deployment?.metadata.projectV2?.basicInfo?.name ??
    deployment?.metadata.projectId;
  const tags = (deployment?.metadata.tags ?? []).flatMap((tag) =>
    tag
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
  );

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
  deployment: DeploymentSectionData;
  onShowRevisionDrawer: (revisionId: string) => void;
}> = ({ deployment, onShowRevisionDrawer }) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const currentRevision = deployment?.currentRevision;
  const deployingRevision = deployment?.deployingRevision;

  if (!currentRevision) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={t('deployment.NoCurrentRevisionDeployed')}
      />
    );
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
    // `image` and `environ` are intentionally placed last with a full-row
    // span. antd v6's Descriptions truncates a span when there isn't
    // enough room left in the row instead of wrapping the item to a new
    // row, so a span-2 item that lands in column 2 silently shrinks back
    // to a single column. Putting these items at row boundaries (an even
    // number of single-column items precedes them, including the leading
    // `revision-id`) lets their span actually take effect.
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
      span: { xxl: 3, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 },
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
    },
  ]);

  const currentModelDefItems = buildModelDefinitionItems(
    currentRevision.modelDefinition?.models,
    t,
  );

  // Only show the "deploying" banner while the deploying revision is
  // actually different from the active one. The server can leave
  // `deployingRevision` populated for a brief window after promotion
  // (until the reconciler clears it), in which case current === deploying
  // means the rollout has already finished and no banner is needed.
  const isDeployingDifferentRevision =
    !!deployingRevision && deployingRevision.id !== currentRevision.id;

  return (
    <>
      {isDeployingDifferentRevision && (
        <Alert
          type="info"
          icon={<LoadingOutlined spin />}
          showIcon
          title={t('deployment.DeployingRevisionApplying', {
            name: deployingRevision.name ?? '',
          })}
          action={
            <Button onClick={() => onShowRevisionDrawer(deployingRevision.id)}>
              {t('deployment.ViewRevision')}
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
> = ({ deploymentId, isDeploymentDestroying = false }) => {
  'use memo';

  const { t } = useTranslation();
  const [isPendingRefetch, startRefetchTransition] = useTransition();
  const [fetchKey, updateFetchKey] = useFetchKey();
  const [drawerState, setDrawerState] = useState<{
    revisionId: string;
    currentRevisionId: string | null;
  } | null>(null);
  const [
    addRevisionOpen,
    { setLeft: closeAddRevision, setRight: openAddRevision },
  ] = useToggle(false);

  const handleShowRevisionDrawer = (
    revisionId: string,
    currentRevisionId: string | null,
  ) => {
    setDrawerState({ revisionId, currentRevisionId });
  };

  const handleRefetch = () => {
    startRefetchTransition(() => updateFetchKey());
  };

  const overviewExtra = (
    <BAIFlex gap="xs" align="center">
      <BAIFetchKeyButton
        loading={isPendingRefetch}
        value=""
        onChange={handleRefetch}
      />
    </BAIFlex>
  );

  return (
    <>
      <Suspense
        fallback={
          <>
            <BAICard
              title={t('deployment.Overview')}
              extra={overviewExtra}
              styles={{ body: { paddingTop: 0 } }}
            >
              <Skeleton active />
            </BAICard>
            <BAICard
              title={t('modelService.RevisionInfo')}
              styles={{ body: { paddingTop: 0 } }}
            >
              <Skeleton active />
            </BAICard>
          </>
        }
      >
        <DeploymentConfigurationCards
          deploymentId={deploymentId}
          fetchKey={fetchKey}
          overviewExtra={overviewExtra}
          onShowRevisionDrawer={handleShowRevisionDrawer}
          onAddRevision={openAddRevision}
          isDeploymentDestroying={isDeploymentDestroying}
          onRefetch={handleRefetch}
        />
      </Suspense>
      <BAIUnmountAfterClose>
        <DeploymentRevisionDetailDrawer
          revisionId={drawerState?.revisionId}
          currentRevisionId={drawerState?.currentRevisionId}
          open={!!drawerState}
          onClose={() => setDrawerState(null)}
        />
      </BAIUnmountAfterClose>
      <DeploymentAddRevisionModal
        open={addRevisionOpen}
        onClose={closeAddRevision}
        onSuccess={() => {
          closeAddRevision();
          handleRefetch();
        }}
        deploymentId={deploymentId}
      />
    </>
  );
};

/**
 * Wrapper that issues the single combined query for both Overview and
 * RevisionInfo cards. The two cards used to fire separate queries; merging
 * them removes a redundant network roundtrip and keeps the GraphQL surface
 * area in one place. The Suspense boundary lives above this wrapper (in
 * the parent section), and the parent's fallback renders the same card
 * chrome with skeletons so the visual layout is preserved during loading.
 */
const DeploymentConfigurationCards: React.FC<{
  deploymentId: string;
  fetchKey: string;
  overviewExtra: React.ReactNode;
  onShowRevisionDrawer: (
    revisionId: string,
    currentRevisionId: string | null,
  ) => void;
  onAddRevision: () => void;
  isDeploymentDestroying?: boolean;
  onRefetch: () => void;
}> = ({
  deploymentId,
  fetchKey,
  overviewExtra,
  onShowRevisionDrawer,
  onAddRevision,
  isDeploymentDestroying = false,
  onRefetch,
}) => {
  'use memo';
  const { t } = useTranslation();
  const [
    settingModalOpen,
    { setLeft: closeSettingModal, setRight: openSettingModal },
  ] = useToggle(false);

  const { deployment } = useLazyLoadQuery<DeploymentConfigurationSectionQuery>(
    graphql`
      query DeploymentConfigurationSectionQuery($deploymentId: ID!) {
        deployment(id: $deploymentId) {
          ...DeploymentSettingModal_deployment
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
          deployingRevision @since(version: "26.4.3") {
            id
            name
          }
        }
      }
    `,
    { deploymentId },
    {
      fetchKey,
      fetchPolicy:
        fetchKey === INITIAL_FETCH_KEY ? 'store-and-network' : 'network-only',
    },
  );

  const hasNoRevision = !deployment?.currentRevision;

  return (
    <>
      {hasNoRevision && (
        <Alert
          type="info"
          showIcon
          title={t('deployment.NoCurrentRevisionDeployed')}
          description={t('deployment.NoCurrentRevisionDeployedDescription')}
          action={
            <Button onClick={onAddRevision} disabled={isDeploymentDestroying}>
              {t('deployment.AddRevision')}
            </Button>
          }
        />
      )}
      <BAICard
        title={t('deployment.Overview')}
        extra={
          <BAIFlex gap="xs" align="center">
            {overviewExtra}
            <Button
              type="primary"
              icon={<EditOutlined />}
              disabled={isDeploymentDestroying}
              onClick={openSettingModal}
            >
              {t('deployment.EditDeployment')}
            </Button>
          </BAIFlex>
        }
        styles={{ body: { paddingTop: 0 } }}
      >
        <DeploymentOverviewContent deployment={deployment} />
      </BAICard>
      <BAICard
        title={t('modelService.RevisionInfo')}
        styles={{ body: { paddingTop: 0 } }}
      >
        <DeploymentRevisionInfoContent
          deployment={deployment}
          onShowRevisionDrawer={(revisionId) =>
            onShowRevisionDrawer(
              revisionId,
              deployment?.currentRevision?.id ?? null,
            )
          }
        />
      </BAICard>
      <DeploymentSettingModal
        open={settingModalOpen}
        deploymentFrgmt={deployment}
        onRequestClose={(success) => {
          closeSettingModal();
          if (success) onRefetch();
        }}
      />
    </>
  );
};

export default DeploymentConfigurationSection;
