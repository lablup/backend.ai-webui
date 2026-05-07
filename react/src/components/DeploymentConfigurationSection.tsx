/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DeploymentConfigurationSectionQuery } from '../__generated__/DeploymentConfigurationSectionQuery.graphql';
import type { DeploymentRevisionDetail_revision$key } from '../__generated__/DeploymentRevisionDetail_revision.graphql';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../hooks';
import DeploymentAddRevisionModal from './DeploymentAddRevisionModal';
import DeploymentRevisionDetail from './DeploymentRevisionDetail';
import DeploymentRevisionDetailDrawer from './DeploymentRevisionDetailDrawer';
import DeploymentRevisionHistoryTab from './DeploymentRevisionHistoryTab';
import DeploymentSettingModal from './DeploymentSettingModal';
import DeploymentTagChips from './DeploymentTagChips';
import ErrorBoundaryWithNullFallback from './ErrorBoundaryWithNullFallback';
import {
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  LoadingOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useToggle } from 'ahooks';
import {
  Alert,
  Button,
  Descriptions,
  Empty,
  Skeleton,
  Typography,
  theme,
} from 'antd';
import {
  BAICard,
  BAIFetchKeyButton,
  BAIFlex,
  BAIUnmountAfterClose,
  INITIAL_FETCH_KEY,
  filterOutEmpty,
  toLocalId,
  useFetchKey,
  useInterval,
} from 'backend.ai-ui';
import { BotMessageSquareIcon } from 'lucide-react';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import React, { Suspense, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

interface DeploymentConfigurationSectionProps {
  deploymentId: string;
  isDeploymentDestroying?: boolean;
}

type DeploymentSectionData =
  DeploymentConfigurationSectionQuery['response']['deployment'];

const renderFallback = () => (
  <Typography.Text type="secondary">-</Typography.Text>
);

const DeploymentOverviewContent: React.FC<{
  deployment: DeploymentSectionData;
}> = ({ deployment }) => {
  'use memo';
  const { t } = useTranslation();

  const projectName =
    deployment?.metadata.projectV2?.basicInfo?.name ??
    deployment?.metadata.projectId;

  const deploymentItems = filterOutEmpty([
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
      children: (
        <DeploymentTagChips
          metadataFrgmt={deployment?.metadata ?? null}
          fallback={renderFallback()}
        />
      ),
    },
    {
      key: 'desired-replicas',
      label: t('deployment.DesiredReplicas'),
      children:
        deployment?.replicaState?.desiredReplicaCount ?? renderFallback(),
    },
  ]);

  return (
    <Descriptions
      bordered
      column={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 2, xxl: 2 }}
      items={deploymentItems}
    />
  );
};

const DeploymentConfigurationSection: React.FC<
  DeploymentConfigurationSectionProps
> = ({ deploymentId, isDeploymentDestroying = false }) => {
  'use memo';

  const { t } = useTranslation();
  const [isPendingRefetch, startRefetchTransition] = useTransition();
  const [fetchKey, updateFetchKey] = useFetchKey();
  const [revisionFetchKey, updateRevisionFetchKey] = useFetchKey();
  const [drawerState, setDrawerState] = useState<{
    revisionFrgmt: DeploymentRevisionDetail_revision$key;
    status?: 'current' | 'deploying' | 'none';
    title?: string;
  } | null>(null);

  const handleShowRevisionDrawer = (
    frgmt: DeploymentRevisionDetail_revision$key,
    status?: 'current' | 'deploying' | 'none',
    title?: string,
  ) => {
    setDrawerState({ revisionFrgmt: frgmt, status, title });
  };

  const handleRefetch = () => {
    startRefetchTransition(() => updateFetchKey());
  };

  const handleRevisionAdded = () => {
    startRefetchTransition(() => {
      updateFetchKey();
      updateRevisionFetchKey();
    });
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
              title={t('deployment.BasicInformation')}
              extra={overviewExtra}
              styles={{ body: { paddingTop: 0 } }}
            >
              <Skeleton active />
            </BAICard>
            <BAICard
              tabList={[
                {
                  key: 'currentRevision',
                  label: t('deployment.CurrentRevision'),
                },
                {
                  key: 'revisionHistory',
                  label: t('deployment.RevisionHistory'),
                },
              ]}
            >
              <Skeleton active />
            </BAICard>
          </>
        }
      >
        <DeploymentConfigurationCards
          deploymentId={deploymentId}
          fetchKey={fetchKey}
          revisionFetchKey={revisionFetchKey}
          overviewExtra={overviewExtra}
          onShowRevisionDrawer={handleShowRevisionDrawer}
          onRevisionAdded={handleRevisionAdded}
          isDeploymentDestroying={isDeploymentDestroying}
          onRefetch={handleRefetch}
        />
      </Suspense>
      <BAIUnmountAfterClose>
        <DeploymentRevisionDetailDrawer
          revisionFrgmt={drawerState?.revisionFrgmt}
          status={drawerState?.status}
          title={drawerState?.title}
          open={!!drawerState}
          onClose={() => setDrawerState(null)}
        />
      </BAIUnmountAfterClose>
    </>
  );
};

/**
 * Wrapper that issues the single combined query for both Overview and
 * RevisionInfo cards. The Suspense boundary lives above this wrapper (in
 * the parent section), and the parent's fallback renders the same card
 * chrome with skeletons so the visual layout is preserved during loading.
 */
const DeploymentConfigurationCards: React.FC<{
  deploymentId: string;
  fetchKey: string;
  revisionFetchKey: string;
  overviewExtra: React.ReactNode;
  onShowRevisionDrawer: (
    frgmt: DeploymentRevisionDetail_revision$key,
    status?: 'current' | 'deploying' | 'none',
    title?: string,
  ) => void;
  onRevisionAdded: () => void;
  isDeploymentDestroying?: boolean;
  onRefetch: () => void;
}> = ({
  deploymentId,
  fetchKey,
  revisionFetchKey,
  overviewExtra,
  onShowRevisionDrawer,
  onRevisionAdded,
  isDeploymentDestroying = false,
  onRefetch,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const webuiNavigate = useWebUINavigate();
  const baiClient = useSuspendedBackendaiClient();
  const isChatBlocked = !!baiClient?._config?.blockList?.includes('chat');

  const [activeRevisionTab, setActiveRevisionTab] = useQueryState(
    'revisionTab',
    {
      ...parseAsStringLiteral([
        'currentRevision',
        'revisionHistory',
      ] as const).withDefault('currentRevision'),
      history: 'replace' as const,
      scroll: false,
    },
  );
  const [
    settingModalOpen,
    { setLeft: closeSettingModal, setRight: openSettingModal },
  ] = useToggle(false);
  const [
    addRevisionOpen,
    { toggle: toggleAddRevision, setLeft: closeAddRevision },
  ] = useToggle(false);

  const { deployment } = useLazyLoadQuery<DeploymentConfigurationSectionQuery>(
    graphql`
      query DeploymentConfigurationSectionQuery($deploymentId: ID!) {
        deployment(id: $deploymentId) {
          ...DeploymentSettingModal_deployment
          metadata {
            name
            projectId
            domainName
            status
            projectV2 @since(version: "26.4.3") {
              basicInfo {
                name
              }
            }
            ...DeploymentTagChips_metadata
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
            ...DeploymentRevisionDetail_revision
          }
          deployingRevision @since(version: "26.4.3") {
            id
            name
            ...DeploymentRevisionDetail_revision
          }
          ...DeploymentRevisionHistoryTab_deployment
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
  const currentRevision = deployment?.currentRevision;
  const deployingRevision = deployment?.deployingRevision;
  const isDeployingDifferentRevision =
    !!deployingRevision && deployingRevision.id !== currentRevision?.id;
  const isDeploymentReady = deployment?.metadata.status === 'READY';

  // While a different revision is being applied, poll so the UI moves off
  // the "applying" state once the deployment finishes rolling out. We don't
  // know up-front how long the rollout takes, so we keep refetching until
  // the deploying revision matches the current revision.
  useInterval(onRefetch, isDeployingDifferentRevision ? 5000 : null);

  return (
    <>
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
                      endpointId: toLocalId(deploymentId),
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
              onClick={toggleAddRevision}
              disabled={isDeploymentDestroying}
            >
              {t('deployment.AddRevision')}
            </Button>
          }
        />
      )}
      <BAICard
        title={t('deployment.BasicInformation')}
        extra={
          <BAIFlex gap="xs" align="center">
            {overviewExtra}
            <Button
              icon={<EditOutlined />}
              disabled={isDeploymentDestroying}
              onClick={openSettingModal}
            >
              {t('button.Edit')}
            </Button>
          </BAIFlex>
        }
        styles={{ body: { paddingTop: 0 } }}
      >
        <DeploymentOverviewContent deployment={deployment} />
      </BAICard>
      <BAICard
        activeTabKey={activeRevisionTab}
        onTabChange={(key) => {
          if (key === 'currentRevision' || key === 'revisionHistory') {
            void setActiveRevisionTab(key);
          }
        }}
        tabList={[
          {
            key: 'currentRevision',
            label: t('deployment.CurrentRevision'),
          },
          {
            key: 'revisionHistory',
            label: t('deployment.RevisionHistory'),
          },
        ]}
        tabBarExtraContent={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            disabled={isDeploymentDestroying}
            onClick={toggleAddRevision}
          >
            {t('deployment.AddRevision')}
          </Button>
        }
      >
        {activeRevisionTab === 'currentRevision' && (
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
                  <Button
                    onClick={() =>
                      onShowRevisionDrawer(
                        deployingRevision,
                        'deploying',
                        t('deployment.DeployingRevisionDetail'),
                      )
                    }
                  >
                    {t('deployment.ViewRevision')}
                  </Button>
                }
                style={{ marginBottom: token.marginMD }}
              />
            )}
            {currentRevision ? (
              <DeploymentRevisionDetail
                revisionFrgmt={currentRevision}
                status="current"
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={t('deployment.NoCurrentRevisionDeployed')}
              />
            )}
          </>
        )}
        {activeRevisionTab === 'revisionHistory' && deployment && (
          <ErrorBoundaryWithNullFallback>
            <Suspense fallback={<Skeleton active paragraph={{ rows: 4 }} />}>
              <DeploymentRevisionHistoryTab
                deploymentFrgmt={deployment}
                deploymentId={deploymentId}
                isDeploymentDestroying={isDeploymentDestroying}
                fetchKey={revisionFetchKey}
              />
            </Suspense>
          </ErrorBoundaryWithNullFallback>
        )}
      </BAICard>
      <DeploymentSettingModal
        open={settingModalOpen}
        deploymentFrgmt={deployment}
        onRequestClose={(success) => {
          closeSettingModal();
          if (success) onRefetch();
        }}
      />
      <BAIUnmountAfterClose>
        <DeploymentAddRevisionModal
          open={addRevisionOpen}
          onCancel={closeAddRevision}
          onSuccess={() => {
            closeAddRevision();
            onRevisionAdded();
          }}
          deploymentId={deploymentId}
        />
      </BAIUnmountAfterClose>
    </>
  );
};

export default DeploymentConfigurationSection;
