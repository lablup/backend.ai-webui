/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DeploymentConfigurationSectionDeleteMutation } from '../__generated__/DeploymentConfigurationSectionDeleteMutation.graphql';
import type {
  DeploymentConfigurationSection_deployment$data,
  DeploymentConfigurationSection_deployment$key,
} from '../__generated__/DeploymentConfigurationSection_deployment.graphql';
import type { DeploymentRevisionDetail_revision$key } from '../__generated__/DeploymentRevisionDetail_revision.graphql';
import { useWebUINavigate } from '../hooks';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import DeploymentRevisionDetail from './DeploymentRevisionDetail';
import DeploymentRevisionDetailDrawer from './DeploymentRevisionDetailDrawer';
import DeploymentRevisionHistoryTab from './DeploymentRevisionHistoryTab';
import DeploymentSchedulingHistoryModal from './DeploymentSchedulingHistoryModal';
import DeploymentSettingModal from './DeploymentSettingModal';
import ErrorBoundaryWithNullFallback from './ErrorBoundaryWithNullFallback';
import {
  DeleteFilled,
  EditOutlined,
  HistoryOutlined,
  LoadingOutlined,
  MoreOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  Alert,
  App,
  Button,
  Descriptions,
  Divider,
  Dropdown,
  Empty,
  Skeleton,
  Space,
  Typography,
} from 'antd';
import {
  BAIButton,
  BAICard,
  BAIDeleteConfirmModal,
  BAIDeploymentStatusTag,
  BAIDeploymentTagChips,
  BAIFetchKeyButton,
  BAIFlex,
  BAIId,
  BAIUnmountAfterClose,
  BooleanTag,
  filterOutEmpty,
  safeDecodeUuid,
  toLocalId,
  useBAILogger,
  useConnectedBAIClient,
  useInterval,
} from 'backend.ai-ui';
import type { BAIDeploymentStatus } from 'backend.ai-ui';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import React, { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';
import { useLocation } from 'react-router-dom';

interface DeploymentConfigurationSectionProps {
  deploymentFrgmt: DeploymentConfigurationSection_deployment$key | null;
  isDeploymentDestroying?: boolean;
  revisionFetchKey: string;
  isPendingRefetch: boolean;
  onRefetch: () => void;
  onAddRevision: () => void;
}

type DeploymentSectionData =
  | DeploymentConfigurationSection_deployment$data
  | null
  | undefined;

const renderFallback = () => (
  <Typography.Text type="secondary">-</Typography.Text>
);

const DeploymentOverviewContent: React.FC<{
  deployment: DeploymentSectionData;
  onClickSchedulingHistory?: () => void;
}> = ({ deployment, onClickSchedulingHistory }) => {
  'use memo';
  const { t } = useTranslation();
  const webuiNavigate = useWebUINavigate();
  const location = useLocation();

  const projectName =
    deployment?.metadata.projectV2?.basicInfo?.name ??
    deployment?.metadata.projectId;

  const deploymentItems = filterOutEmpty([
    {
      key: 'status',
      label: t('deployment.Status'),
      children: deployment?.metadata.status ? (
        <BAIFlex align="center" gap="xs">
          <BAIDeploymentStatusTag
            status={deployment.metadata.status as BAIDeploymentStatus}
          />
          {onClickSchedulingHistory && (
            <>
              <Divider type="vertical" style={{ margin: 0 }} />
              <BAIButton
                type="link"
                size="small"
                icon={<HistoryOutlined />}
                onClick={onClickSchedulingHistory}
              >
                {t('deployment.SchedulingHistory')}
              </BAIButton>
            </>
          )}
        </BAIFlex>
      ) : (
        renderFallback()
      ),
    },
    {
      key: 'id',
      label: t('deployment.DeploymentId'),
      children: deployment?.id ? (
        <BAIId
          globalId={deployment.id}
          copyable
          ellipsis={false}
          style={{ maxWidth: 'none' }}
        />
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
      key: 'resource-group',
      label: t('modelStore.ResourceGroup'),
      children: deployment?.metadata.resourceGroupName || renderFallback(),
    },
    {
      key: 'endpoint-url',
      label: t('deployment.EndpointUrl'),
      children: deployment?.networkAccess.endpointUrl ? (
        <Typography.Text copyable style={{ wordBreak: 'break-all' }}>
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
        <BAIDeploymentTagChips
          metadataFrgmt={deployment?.metadata ?? null}
          onTagClick={(tag) => {
            // Stay within the same deployment-list URL space the user came
            // from (`/admin-deployments`, `/project-admin-deployments`, or
            // the user-facing `/deployments`) so breadcrumb / back navigation
            // remain coherent — see FR-2847 (admin) and FR-2930 (project
            // admin) for the per-scope detail-route precedent.
            const targetPathname = location.pathname.startsWith(
              '/admin-deployments',
            )
              ? '/admin-deployments'
              : location.pathname.startsWith('/project-admin-deployments')
                ? '/project-admin-deployments'
                : '/deployments';
            webuiNavigate({
              pathname: targetPathname,
              search: new URLSearchParams({
                filter: JSON.stringify({ tags: { iContains: tag } }),
              }).toString(),
            });
          }}
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
  deploymentFrgmt,
  isDeploymentDestroying = false,
  revisionFetchKey,
  isPendingRefetch,
  onRefetch,
  onAddRevision,
}) => {
  'use memo';

  const { t } = useTranslation();
  const { message } = App.useApp();
  const { logger } = useBAILogger();
  const webuiNavigate = useWebUINavigate();
  const location = useLocation();
  const currentProject = useCurrentProjectValue();

  const deployment = useFragment(
    graphql`
      fragment DeploymentConfigurationSection_deployment on ModelDeployment {
        id
        ...DeploymentSettingModal_deployment
        metadata {
          name
          projectId
          domainName
          status
          resourceGroupName
          projectV2 @since(version: "26.4.3") {
            basicInfo {
              name
            }
          }
          ...BAIDeploymentTagChips_metadata
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
          revisionNumber
          ...DeploymentRevisionDetail_revision
        }
        deployingRevision @since(version: "26.4.3") {
          id
          revisionNumber
          ...DeploymentRevisionDetail_revision
        }
        ...DeploymentRevisionHistoryTab_deployment
      }
    `,
    deploymentFrgmt,
  );

  const [drawerState, setDrawerState] = useState<{
    revisionFrgmt: DeploymentRevisionDetail_revision$key;
    status?: 'current' | 'deploying' | 'none';
    title?: string;
  } | null>(null);

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
  const [settingModalOpen, setSettingModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const baiClient = useConnectedBAIClient();
  const supportsDeploymentSchedulingHistory =
    baiClient?.supports('deployment-scheduling-history') ?? false;

  const [commitDeleteMutation, isInFlightDeleteMutation] =
    useMutation<DeploymentConfigurationSectionDeleteMutation>(graphql`
      mutation DeploymentConfigurationSectionDeleteMutation(
        $input: DeleteDeploymentInput!
      ) {
        deleteModelDeployment(input: $input) {
          id
        }
      }
    `);

  const deploymentName = deployment?.metadata.name ?? '';
  const listPath = location.pathname.startsWith('/admin-deployments')
    ? '/admin-deployments'
    : location.pathname.startsWith('/project-admin-deployments')
      ? '/project-admin-deployments'
      : '/deployments';

  // Resolve project mismatch directly here (rather than threading the flag
  // through props) so callers don't need to know about this guard. When the
  // viewer's current project differs from the deployment's, the Add Revision
  // call-to-action below is disabled — switching projects is required first.
  const deploymentProjectId = deployment?.metadata.projectId ?? null;
  const isProjectMismatch =
    !!deploymentProjectId && deploymentProjectId !== currentProject.id;

  const handleDelete = () => {
    if (!deployment?.id) return;
    commitDeleteMutation({
      variables: {
        input: {
          id: toLocalId(deployment.id) ?? deployment.id,
        },
      },
      onCompleted: (_response, errors) => {
        if (errors && errors.length > 0) {
          logger.error('Failed to delete deployment', errors);
          message.error(t('deployment.FailedToDeleteDeployment'));
          return;
        }
        message.success(t('deployment.DeploymentDeleted'));
        setIsDeleteModalOpen(false);
        webuiNavigate(listPath);
      },
      onError: (error) => {
        logger.error('Failed to delete deployment', error);
        message.error(t('deployment.FailedToDeleteDeployment'));
      },
    });
  };

  const handleShowRevisionDrawer = (
    frgmt: DeploymentRevisionDetail_revision$key,
    status?: 'current' | 'deploying' | 'none',
    title?: string,
  ) => {
    setDrawerState({ revisionFrgmt: frgmt, status, title });
  };

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
            <BAIFetchKeyButton
              loading={isPendingRefetch}
              value=""
              onChange={onRefetch}
            />
            <Space.Compact>
              <BAIButton
                icon={<EditOutlined />}
                disabled={isDeploymentDestroying}
                action={async () => {
                  setSettingModalOpen(true);
                }}
              >
                {t('button.Edit')}
              </BAIButton>
              <Dropdown
                trigger={['click']}
                menu={{
                  items: [
                    {
                      key: 'delete',
                      label: t('deployment.DeleteDeployment'),
                      icon: <DeleteFilled />,
                      danger: true,
                      disabled:
                        isDeploymentDestroying || isInFlightDeleteMutation,
                      onClick: () => setIsDeleteModalOpen(true),
                    },
                  ],
                }}
              >
                <Button icon={<MoreOutlined />} aria-label={t('button.More')} />
              </Dropdown>
            </Space.Compact>
          </BAIFlex>
        }
        styles={{ body: { paddingTop: 0 } }}
      >
        <DeploymentOverviewContent
          deployment={deployment}
          onClickSchedulingHistory={
            supportsDeploymentSchedulingHistory
              ? () => setHistoryModalOpen(true)
              : undefined
          }
        />
      </BAICard>
      {isDeployingDifferentRevision && (
        <Alert
          type="info"
          icon={<LoadingOutlined spin />}
          showIcon
          title={t('deployment.ApplyingRevision', {
            revisionNumber:
              deployingRevision.revisionNumber != null
                ? `#${deployingRevision.revisionNumber}`
                : (toLocalId(deployingRevision.id) ?? ''),
          })}
          action={
            <Button
              onClick={() =>
                handleShowRevisionDrawer(
                  deployingRevision,
                  'deploying',
                  t('deployment.ApplyingRevisionDetail'),
                )
              }
            >
              {t('deployment.ViewRevision')}
            </Button>
          }
        />
      )}
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
          <BAIFlex gap="xs" align="center">
            <BAIButton
              type="primary"
              icon={<PlusOutlined />}
              disabled={isDeploymentDestroying || isProjectMismatch}
              // `action` (not `onClick`) wraps the state update that mounts
              // `<DeploymentAddRevisionModal>` (which suspends on its Relay
              // queries) in `startTransition`, so the page stays interactive
              // instead of falling into its Suspense fallback. The button
              // itself shows a loading spinner until the modal renders.
              action={async () => {
                onAddRevision();
              }}
            >
              {t('deployment.AddRevision')}
            </BAIButton>
          </BAIFlex>
        }
      >
        {activeRevisionTab === 'currentRevision' && (
          <>
            {currentRevision ? (
              <DeploymentRevisionDetail
                revisionFrgmt={currentRevision}
                status="current"
              />
            ) : isDeployingDifferentRevision ? null : (
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
                deploymentId={deployment.id}
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
          setSettingModalOpen(false);
          if (success) onRefetch();
        }}
      />
      <BAIUnmountAfterClose>
        <DeploymentRevisionDetailDrawer
          revisionFrgmt={drawerState?.revisionFrgmt}
          status={drawerState?.status}
          title={drawerState?.title}
          open={!!drawerState}
          onClose={() => setDrawerState(null)}
        />
      </BAIUnmountAfterClose>
      <BAIDeleteConfirmModal
        open={isDeleteModalOpen}
        title={t('deployment.DeleteDeployment')}
        target={t('deployment.Deployment')}
        items={
          deploymentName ? [{ key: deploymentName, label: deploymentName }] : []
        }
        confirmText={deploymentName}
        requireConfirmInput
        inputProps={{ placeholder: deploymentName }}
        okButtonProps={{ loading: isInFlightDeleteMutation }}
        onOk={handleDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
      {deployment?.id && (
        <DeploymentSchedulingHistoryModal
          open={historyModalOpen}
          deploymentId={safeDecodeUuid(deployment.id) ?? deployment.id}
          onCancel={() => setHistoryModalOpen(false)}
        />
      )}
    </>
  );
};

export default DeploymentConfigurationSection;
