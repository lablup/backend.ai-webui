/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DeploymentConfigurationSectionQuery } from '../__generated__/DeploymentConfigurationSectionQuery.graphql';
import type { DeploymentRevisionDetail_revision$key } from '../__generated__/DeploymentRevisionDetail_revision.graphql';
import DeploymentRevisionDetail from './DeploymentRevisionDetail';
import DeploymentRevisionDetailDrawer from './DeploymentRevisionDetailDrawer';
import DeploymentRevisionHistoryTab from './DeploymentRevisionHistoryTab';
import DeploymentSettingModal from './DeploymentSettingModal';
import DeploymentTagChips from './DeploymentTagChips';
import ErrorBoundaryWithNullFallback from './ErrorBoundaryWithNullFallback';
import { EditOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons';
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
  BAIId,
  BAIText,
  BAIUnmountAfterClose,
  BooleanTag,
  INITIAL_FETCH_KEY,
  filterOutEmpty,
  useInterval,
} from 'backend.ai-ui';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import React, { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

interface DeploymentConfigurationSectionProps {
  deploymentId: string;
  isDeploymentDestroying?: boolean;
  fetchKey: string;
  revisionFetchKey: string;
  isPendingRefetch: boolean;
  onRefetch: () => void;
  onAddRevision: () => void;
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
      label: t('deployment.NameAndID'),
      children: deployment?.metadata.name ? (
        <>
          <BAIText copyable>{deployment.metadata.name}</BAIText>
          &nbsp;(
          <BAIId globalId={deployment.id} />)
        </>
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
      key: 'visibility',
      label: t('deployment.Visibility'),
      children: (
        <BooleanTag
          value={deployment?.networkAccess.openToPublic}
          trueLabel={t('deployment.Public')}
          falseLabel={t('deployment.Private')}
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
> = ({
  deploymentId,
  isDeploymentDestroying = false,
  fetchKey,
  revisionFetchKey,
  isPendingRefetch,
  onRefetch,
  onAddRevision,
}) => {
  'use memo';

  const { t } = useTranslation();
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

  const overviewExtra = (
    <BAIFlex gap="xs" align="center">
      <BAIFetchKeyButton
        loading={isPendingRefetch}
        value=""
        onChange={onRefetch}
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
          onAddRevision={onAddRevision}
          isDeploymentDestroying={isDeploymentDestroying}
          onRefetch={onRefetch}
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
  onAddRevision: () => void;
  isDeploymentDestroying?: boolean;
  onRefetch: () => void;
}> = ({
  deploymentId,
  fetchKey,
  revisionFetchKey,
  overviewExtra,
  onShowRevisionDrawer,
  onAddRevision,
  isDeploymentDestroying = false,
  onRefetch,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();

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

  const { deployment } = useLazyLoadQuery<DeploymentConfigurationSectionQuery>(
    graphql`
      query DeploymentConfigurationSectionQuery($deploymentId: ID!) {
        deployment(id: $deploymentId) {
          id
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

  const currentRevision = deployment?.currentRevision;
  const deployingRevision = deployment?.deployingRevision;
  const isDeployingDifferentRevision =
    !!deployingRevision && deployingRevision.id !== currentRevision?.id;

  // While a different revision is being applied, poll so the UI moves off
  // the "applying" state once the deployment finishes rolling out. We don't
  // know up-front how long the rollout takes, so we keep refetching until
  // the deploying revision matches the current revision.
  useInterval(onRefetch, isDeployingDifferentRevision ? 5000 : null);

  return (
    <>
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
            onClick={onAddRevision}
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
    </>
  );
};

export default DeploymentConfigurationSection;
