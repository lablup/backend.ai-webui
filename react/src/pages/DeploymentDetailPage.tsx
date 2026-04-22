/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DeploymentDetailPageDeleteMutation } from '../__generated__/DeploymentDetailPageDeleteMutation.graphql';
import { DeploymentDetailPageQuery } from '../__generated__/DeploymentDetailPageQuery.graphql';
import DeploymentAccessTokensTab from '../components/DeploymentAccessTokensTab';
import DeploymentAutoScalingTab from '../components/DeploymentAutoScalingTab';
import DeploymentConfigurationSection from '../components/DeploymentConfigurationSection';
import DeploymentReplicasTab from '../components/DeploymentReplicasTab';
import DeploymentRevisionHistoryTab from '../components/DeploymentRevisionHistoryTab';
import DeploymentStatusTag, {
  DeploymentStatus,
} from '../components/DeploymentStatusTag';
import { useWebUINavigate } from '../hooks';
import { useCurrentUserInfo } from '../hooks/backendai';
import { DeleteOutlined } from '@ant-design/icons';
import { App, Skeleton, Tabs, Typography, theme } from 'antd';
import { BAIButton, BAIFlex, toGlobalId, useBAILogger } from 'backend.ai-ui';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';
import { useParams } from 'react-router-dom';

const tabValues = ['replicas', 'revisions', 'tokens', 'autoscaling'] as const;
type TabKey = (typeof tabValues)[number];

const DeploymentDetailPage: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message, modal } = App.useApp();
  const { logger } = useBAILogger();
  const webuiNavigate = useWebUINavigate();
  const [currentUser] = useCurrentUserInfo();

  const { deploymentId: deploymentIdParam } = useParams<{
    deploymentId: string;
  }>();
  const deploymentId = deploymentIdParam ?? '';

  const [activeTab, setActiveTab] = useQueryState(
    'tab',
    parseAsStringLiteral(tabValues).withDefault('replicas'),
  );

  const { deployment } = useLazyLoadQuery<DeploymentDetailPageQuery>(
    graphql`
      query DeploymentDetailPageQuery($deploymentId: ID!) {
        deployment(id: $deploymentId) {
          id
          metadata {
            name
            status
          }
          creator @since(version: "26.4.3") {
            basicInfo {
              email
            }
          }
          ...DeploymentConfigurationSection_deployment
          ...DeploymentReplicasTab_deployment
          ...DeploymentRevisionHistoryTab_deployment
          ...DeploymentAccessTokensTab_deployment
          ...DeploymentAutoScalingTab_deployment
        }
      }
    `,
    {
      deploymentId: toGlobalId('ModelDeployment', deploymentId),
    },
  );

  const [commitDeleteMutation, isInFlightDeleteMutation] =
    useMutation<DeploymentDetailPageDeleteMutation>(graphql`
      mutation DeploymentDetailPageDeleteMutation(
        $input: DeleteDeploymentInput!
      ) {
        deleteModelDeployment(input: $input) {
          id
        }
      }
    `);

  if (!deployment) {
    return <Skeleton active />;
  }

  const deploymentName = deployment.metadata.name;
  const deploymentStatus = deployment.metadata.status as DeploymentStatus;
  // Terminal lifecycle states — Delete should be disabled once the deployment
  // is already winding down or gone.
  const isDeploymentDestroying =
    deploymentStatus === 'STOPPING' ||
    deploymentStatus === 'STOPPED' ||
    deploymentStatus === 'TERMINATED';

  const creatorEmail = deployment.creator?.basicInfo?.email ?? null;
  // When the creator email is unresolvable (e.g. manager versions < 26.4.3),
  // assume the current user owns the deployment so the UI does not
  // over-restrict editing/deletion capabilities.
  const isOwnedByCurrentUser =
    !creatorEmail || creatorEmail === currentUser.email;

  const handleDelete = () => {
    modal.confirm({
      title: t('deployment.DeleteDeployment'),
      content: t('deployment.ConfirmDeleteDeployment', {
        name: deploymentName,
      }),
      okText: t('button.Delete'),
      okButtonProps: { danger: true },
      onOk: () =>
        new Promise<void>((resolve) => {
          commitDeleteMutation({
            variables: {
              input: { id: deployment.id },
            },
            onCompleted: (_response, errors) => {
              resolve();
              if (errors && errors.length > 0) {
                logger.error('Failed to delete deployment', errors);
                message.error(t('deployment.FailedToDeleteDeployment'));
                return;
              }
              message.success(t('deployment.DeploymentDeleted'));
              webuiNavigate('/deployments');
            },
            onError: (error) => {
              resolve();
              logger.error('Failed to delete deployment', error);
              message.error(t('deployment.FailedToDeleteDeployment'));
            },
          });
        }),
    });
  };

  return (
    <BAIFlex direction="column" align="stretch" gap="md">
      <BAIFlex direction="row" justify="between" align="center" gap="sm">
        <BAIFlex direction="row" align="center" gap="sm">
          <Typography.Title level={3} style={{ margin: 0 }}>
            {deploymentName}
          </Typography.Title>
          <DeploymentStatusTag status={deploymentStatus} />
        </BAIFlex>
        <BAIButton
          danger
          icon={<DeleteOutlined />}
          loading={isInFlightDeleteMutation}
          disabled={isDeploymentDestroying || !isOwnedByCurrentUser}
          onClick={handleDelete}
        >
          {t('deployment.DeleteDeployment')}
        </BAIButton>
      </BAIFlex>
      <DeploymentConfigurationSection deploymentFrgmt={deployment} />
      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key as TabKey);
        }}
        destroyOnHidden
        items={[
          {
            key: 'replicas',
            label: t('deployment.tab.Replicas'),
            children: <DeploymentReplicasTab deploymentFrgmt={deployment} />,
          },
          {
            key: 'revisions',
            label: t('deployment.tab.RevisionHistory'),
            children: (
              <DeploymentRevisionHistoryTab deploymentFrgmt={deployment} />
            ),
          },
          {
            key: 'tokens',
            label: t('deployment.tab.AccessTokens'),
            children: (
              <DeploymentAccessTokensTab
                deploymentFrgmt={deployment}
                isOwnedByCurrentUser={isOwnedByCurrentUser}
                isDeploymentDestroying={isDeploymentDestroying}
              />
            ),
          },
          {
            key: 'autoscaling',
            label: t('deployment.tab.AutoScaling'),
            children: <DeploymentAutoScalingTab deploymentFrgmt={deployment} />,
          },
        ]}
        style={{ marginTop: token.marginSM }}
      />
    </BAIFlex>
  );
};

export default DeploymentDetailPage;
