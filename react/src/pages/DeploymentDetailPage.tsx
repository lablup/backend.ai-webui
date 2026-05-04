/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DeploymentDetailPageQuery } from '../__generated__/DeploymentDetailPageQuery.graphql';
import DeploymentAccessTokensTab from '../components/DeploymentAccessTokensTab';
import DeploymentAutoScalingTab from '../components/DeploymentAutoScalingTab';
import DeploymentConfigurationSection from '../components/DeploymentConfigurationSection';
import DeploymentReplicasTab from '../components/DeploymentReplicasTab';
import DeploymentRevisionHistoryTab from '../components/DeploymentRevisionHistoryTab';
import DeploymentStatusTag, {
  DeploymentStatus,
} from '../components/DeploymentStatusTag';
import { useCurrentUserInfo } from '../hooks/backendai';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Skeleton, Tooltip, Typography, theme } from 'antd';
import { BAICard, BAIFlex, toGlobalId } from 'backend.ai-ui';
import { parseAsString, useQueryState } from 'nuqs';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useParams } from 'react-router-dom';
import BAIErrorBoundary from 'src/components/BAIErrorBoundary';

const DeploymentDetailPage: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [currentUser] = useCurrentUserInfo();

  const { deploymentId: deploymentIdParam } = useParams<{
    deploymentId: string;
  }>();
  const deploymentId = deploymentIdParam ?? '';

  const [activeTab, setActiveTab] = useQueryState('tab', {
    ...parseAsString.withDefault('replicas'),
    history: 'replace',
    scroll: false,
  });

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

  if (!deployment) {
    return <Skeleton active />;
  }

  const deploymentName = deployment.metadata.name;
  const deploymentStatus = deployment.metadata.status as DeploymentStatus;
  const isDeploymentDestroying =
    deploymentStatus === 'STOPPING' ||
    deploymentStatus === 'STOPPED' ||
    deploymentStatus === 'TERMINATED';

  const creatorEmail = deployment.creator?.basicInfo?.email ?? null;
  // When the creator email is unresolvable (e.g. manager versions < 26.4.3),
  // assume the current user owns the deployment so the UI does not
  // over-restrict editing capabilities.
  const isOwnedByCurrentUser =
    !creatorEmail || creatorEmail === currentUser.email;

  return (
    <BAIFlex direction="column" align="stretch" gap="md">
      <BAIFlex direction="row" align="center" gap="sm">
        <Typography.Title level={3} style={{ margin: 0 }}>
          {deploymentName}
        </Typography.Title>
        <DeploymentStatusTag status={deploymentStatus} />
      </BAIFlex>
      <DeploymentConfigurationSection
        deploymentId={toGlobalId('ModelDeployment', deploymentId)}
        isDeploymentDestroying={isDeploymentDestroying}
      />
      <BAICard
        activeTabKey={activeTab}
        onTabChange={(key) => setActiveTab(key)}
        tabList={[
          {
            key: 'replicas',
            label: (
              <>
                {t('deployment.tab.Replicas')}
                <Tooltip title={t('deployment.tab.description.Replicas')}>
                  <QuestionCircleOutlined
                    style={{
                      marginLeft: token.marginXXS,
                      color: token.colorTextDescription,
                    }}
                  />
                </Tooltip>
              </>
            ),
          },
          {
            key: 'revisions',
            label: (
              <>
                {t('deployment.tab.Revision')}
                <Tooltip title={t('deployment.tab.description.Revision')}>
                  <QuestionCircleOutlined
                    style={{
                      marginLeft: token.marginXXS,
                      color: token.colorTextDescription,
                    }}
                  />
                </Tooltip>
              </>
            ),
          },
        ]}
      >
        {activeTab === 'replicas' && (
          <BAIErrorBoundary>
            <Suspense fallback={<Skeleton active />}>
              <DeploymentReplicasTab
                deploymentFrgmt={deployment}
                deploymentId={toGlobalId('ModelDeployment', deploymentId)}
              />
            </Suspense>
          </BAIErrorBoundary>
        )}
        {activeTab === 'revisions' && (
          <BAIErrorBoundary>
            <Suspense fallback={<Skeleton active />}>
              <DeploymentRevisionHistoryTab
                deploymentFrgmt={deployment}
                deploymentId={toGlobalId('ModelDeployment', deploymentId)}
                isDeploymentDestroying={isDeploymentDestroying}
              />
            </Suspense>
          </BAIErrorBoundary>
        )}
      </BAICard>
      <DeploymentAutoScalingTab deploymentFrgmt={deployment} />
      <DeploymentAccessTokensTab
        deploymentFrgmt={deployment}
        deploymentId={toGlobalId('ModelDeployment', deploymentId)}
        isOwnedByCurrentUser={isOwnedByCurrentUser}
        isDeploymentDestroying={isDeploymentDestroying}
      />
    </BAIFlex>
  );
};

export default DeploymentDetailPage;
