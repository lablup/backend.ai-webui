/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DeploymentConfigurationSection_deployment$key } from '../__generated__/DeploymentConfigurationSection_deployment.graphql';
import { useWebUINavigate } from '../hooks';
import { CheckOutlined, CloseOutlined, EditOutlined } from '@ant-design/icons';
import { Descriptions, Tag, Typography, theme } from 'antd';
import { DescriptionsItemType } from 'antd/es/descriptions';
import {
  filterOutEmpty,
  BAIButton,
  BAICard,
  BAIFlex,
  toLocalId,
} from 'backend.ai-ui';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface DeploymentConfigurationSectionProps {
  deploymentFrgmt: DeploymentConfigurationSection_deployment$key;
}

const DeploymentConfigurationSection: React.FC<
  DeploymentConfigurationSectionProps
> = ({ deploymentFrgmt }) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();
  const webuiNavigate = useWebUINavigate();

  const deployment = useFragment(
    graphql`
      fragment DeploymentConfigurationSection_deployment on ModelDeployment {
        id
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
            runtimeVariant
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
        }
      }
    `,
    deploymentFrgmt,
  );

  const deploymentId = toLocalId(deployment.id);
  const currentRevision = deployment.currentRevision;
  const clusterConfig = currentRevision?.clusterConfig;
  const resourceConfig = currentRevision?.resourceConfig;
  const runtimeConfig = currentRevision?.modelRuntimeConfig;
  const mountConfig = currentRevision?.modelMountConfig;
  const projectName =
    deployment.metadata.projectV2?.basicInfo?.name ??
    deployment.metadata.projectId;

  const renderFallback = () => (
    <Typography.Text type="secondary">-</Typography.Text>
  );

  const environEntries = runtimeConfig?.environ?.entries ?? [];
  const tags = deployment.metadata.tags ?? [];

  const items: DescriptionsItemType[] = filterOutEmpty([
    {
      key: 'name',
      label: t('deployment.Name'),
      children: deployment.metadata.name ? (
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
      children: deployment.metadata.domainName || renderFallback(),
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
      children: runtimeConfig?.runtimeVariant || renderFallback(),
    },
    {
      key: 'image',
      label: t('deployment.Image'),
      children:
        currentRevision?.imageV2?.identity?.canonicalName || renderFallback(),
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
      key: 'desired-replicas',
      label: t('deployment.DesiredReplicas'),
      children:
        deployment.replicaState?.desiredReplicaCount ?? renderFallback(),
    },
    {
      key: 'open-to-public',
      label: t('deployment.OpenToPublic'),
      children: deployment.networkAccess.openToPublic ? (
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
      key: 'environ',
      label: t('deployment.EnvironmentVariables'),
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

  return (
    <BAICard
      title={t('deployment.Configuration')}
      extra={
        <BAIButton
          type="primary"
          icon={<EditOutlined />}
          onClick={() => {
            webuiNavigate(`/deployments/${deploymentId}/edit`);
          }}
        >
          {t('deployment.EditConfiguration')}
        </BAIButton>
      }
    >
      <Descriptions
        bordered
        column={{ xxl: 3, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
        style={{
          backgroundColor: token.colorBgBase,
        }}
        items={items}
      />
    </BAICard>
  );
};

export default DeploymentConfigurationSection;
