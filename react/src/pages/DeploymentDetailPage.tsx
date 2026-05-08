/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DeploymentDetailPageQuery } from '../__generated__/DeploymentDetailPageQuery.graphql';
import BAIErrorBoundary from '../components/BAIErrorBoundary';
import DeploymentAccessTokensTab from '../components/DeploymentAccessTokensTab';
import DeploymentAddRevisionModal from '../components/DeploymentAddRevisionModal';
import DeploymentAutoScalingTab from '../components/DeploymentAutoScalingTab';
import DeploymentConfigurationSection from '../components/DeploymentConfigurationSection';
import DeploymentReplicasTab from '../components/DeploymentReplicasTab';
import DeploymentStatusTag, {
  DeploymentStatus,
} from '../components/DeploymentStatusTag';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../hooks';
import { useCurrentUserInfo } from '../hooks/backendai';
import { PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useToggle } from 'ahooks';
import { Alert, Button, Skeleton, Tooltip, Typography, theme } from 'antd';
import {
  BAICard,
  BAIFlex,
  BAIUnmountAfterClose,
  toGlobalId,
  useFetchKey,
} from 'backend.ai-ui';
import { BotMessageSquareIcon } from 'lucide-react';
import React, { Suspense, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useParams } from 'react-router-dom';

const DeploymentDetailPage: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [currentUser] = useCurrentUserInfo();
  const webuiNavigate = useWebUINavigate();
  const baiClient = useSuspendedBackendaiClient();
  const isChatBlocked = !!baiClient?._config?.blockList?.includes('chat');

  const { deploymentId: deploymentIdParam } = useParams<{
    deploymentId: string;
  }>();
  const deploymentId = deploymentIdParam ?? '';
  const deploymentGlobalId = toGlobalId('ModelDeployment', deploymentId);

  const [isPendingRefetch, startRefetchTransition] = useTransition();
  const [fetchKey, updateFetchKey] = useFetchKey();
  const [revisionFetchKey, updateRevisionFetchKey] = useFetchKey();
  const [
    addRevisionOpen,
    { setLeft: closeAddRevision, setRight: openAddRevision },
  ] = useToggle(false);

  const { deployment } = useLazyLoadQuery<DeploymentDetailPageQuery>(
    graphql`
      query DeploymentDetailPageQuery($deploymentId: ID!) {
        deployment(id: $deploymentId) {
          id
          metadata {
            name
            status
          }
          networkAccess {
            openToPublic
          }
          currentRevision @since(version: "26.4.3") {
            id
          }
          creator @since(version: "26.4.3") {
            basicInfo {
              email
            }
          }
          ...DeploymentReplicasTab_deployment
          ...DeploymentAccessTokensTab_deployment
          ...DeploymentAutoScalingTab_deployment
        }
      }
    `,
    {
      deploymentId: deploymentGlobalId,
    },
    { fetchKey },
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
  const isDeploymentReady = deploymentStatus === 'READY';
  const hasNoRevision = !deployment.currentRevision;
  const isPrivateDeployment =
    deployment.networkAccess.openToPublic === false && !isDeploymentDestroying;

  const creatorEmail = deployment.creator?.basicInfo?.email ?? null;
  // When the creator email is unresolvable (e.g. manager versions < 26.4.3),
  // assume the current user owns the deployment so the UI does not
  // over-restrict editing capabilities.
  const isOwnedByCurrentUser =
    !creatorEmail || creatorEmail === currentUser.email;

  const handleRefetch = () => {
    startRefetchTransition(() => updateFetchKey());
  };

  const handleRevisionAdded = () => {
    closeAddRevision();
    startRefetchTransition(() => {
      updateFetchKey();
      updateRevisionFetchKey();
    });
  };

  const scrollToAccessTokens = () => {
    document
      .getElementById('deployment-access-tokens')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <BAIFlex direction="column" align="stretch" gap="md">
      <BAIFlex direction="row" align="center" gap="sm">
        <Typography.Title level={3} style={{ margin: 0 }}>
          {deploymentName}
        </Typography.Title>
        <DeploymentStatusTag status={deploymentStatus} />
      </BAIFlex>
      {isDeploymentReady && !hasNoRevision && (
        <Alert
          type="success"
          showIcon
          title={t('deployment.DeploymentReady')}
          action={
            !isChatBlocked && (
              <Button
                type="primary"
                icon={<BotMessageSquareIcon size={token.fontSizeLG} />}
                onClick={() => {
                  webuiNavigate({
                    pathname: '/chat',
                    search: new URLSearchParams({
                      endpointId: deploymentId,
                    }).toString(),
                  });
                }}
              >
                {t('deployment.StartChatTest')}
              </Button>
            )
          }
        />
      )}
      {hasNoRevision && (
        <Alert
          type="info"
          showIcon
          title={t('deployment.NoCurrentRevisionDeployed')}
          description={t('deployment.NoCurrentRevisionDeployedDescription')}
          action={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openAddRevision}
              disabled={isDeploymentDestroying}
            >
              {t('deployment.AddRevision')}
            </Button>
          }
        />
      )}
      {isPrivateDeployment && (
        <Alert
          type="info"
          showIcon
          title={t('deployment.PrivateDeploymentAlertTitle')}
          description={t('deployment.PrivateDeploymentAlertDescription')}
          action={
            <Button onClick={scrollToAccessTokens}>
              {t('deployment.ManageAccessTokens')}
            </Button>
          }
        />
      )}
      <DeploymentConfigurationSection
        deploymentId={deploymentGlobalId}
        isDeploymentDestroying={isDeploymentDestroying}
        fetchKey={fetchKey}
        revisionFetchKey={revisionFetchKey}
        isPendingRefetch={isPendingRefetch}
        onRefetch={handleRefetch}
        onAddRevision={openAddRevision}
      />
      <BAICard
        title={
          <BAIFlex gap="xs" align="center">
            {t('deployment.tab.Replicas')}
            <Tooltip title={t('deployment.tab.description.Replicas')}>
              <QuestionCircleOutlined
                style={{ color: token.colorTextDescription }}
              />
            </Tooltip>
          </BAIFlex>
        }
        styles={{ body: { paddingTop: 0 } }}
      >
        <BAIErrorBoundary>
          <Suspense fallback={<Skeleton active />}>
            <DeploymentReplicasTab
              deploymentFrgmt={deployment}
              deploymentId={deploymentGlobalId}
            />
          </Suspense>
        </BAIErrorBoundary>
      </BAICard>
      <DeploymentAutoScalingTab deploymentFrgmt={deployment} />
      <div id="deployment-access-tokens">
        <DeploymentAccessTokensTab
          deploymentFrgmt={deployment}
          deploymentId={deploymentGlobalId}
          isOwnedByCurrentUser={isOwnedByCurrentUser}
          isDeploymentDestroying={isDeploymentDestroying}
        />
      </div>
      <BAIUnmountAfterClose>
        <DeploymentAddRevisionModal
          open={addRevisionOpen}
          onCancel={closeAddRevision}
          onSuccess={handleRevisionAdded}
          deploymentId={deploymentGlobalId}
        />
      </BAIUnmountAfterClose>
    </BAIFlex>
  );
};

export default DeploymentDetailPage;
