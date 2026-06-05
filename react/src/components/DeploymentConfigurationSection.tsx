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
import { DeploymentSchedulingHistoryModalQuery } from '../__generated__/DeploymentSchedulingHistoryModalQuery.graphql';
import { useWebUINavigate } from '../hooks';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import DeploymentRevisionDetail from './DeploymentRevisionDetail';
import DeploymentRevisionDetailDrawer from './DeploymentRevisionDetailDrawer';
import DeploymentRevisionHistoryTab from './DeploymentRevisionHistoryTab';
import DeploymentSchedulingHistoryModal, {
  DeploymentSchedulingHistoryQuery,
} from './DeploymentSchedulingHistoryModal';
import DeploymentSettingModal from './DeploymentSettingModal';
import ErrorBoundaryWithNullFallback from './ErrorBoundaryWithNullFallback';
import {
  DeleteFilled,
  EditOutlined,
  HistoryOutlined,
  LoadingOutlined,
  MoreOutlined,
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
  theme,
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
  isDeploymentInStoppedCategory,
  safeDecodeUuid,
  toLocalId,
  useBAILogger,
  useConnectedBAIClient,
  useInterval,
} from 'backend.ai-ui';
import type { BAIDeploymentStatus } from 'backend.ai-ui';
import { PlusIcon } from 'lucide-react';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import React, { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation, useQueryLoader } from 'react-relay';
import { useLocation } from 'react-router-dom';

interface DeploymentConfigurationSectionProps {
  deploymentFrgmt: DeploymentConfigurationSection_deployment$key | null;
  revisionFetchKey: string;
  isPendingRefetch: boolean;
  onRefetch: () => void;
  onAddRevision: () => void;
  revisionCardRef?: React.RefObject<HTMLDivElement | null>;
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
  onClickSchedulingHistoryAction?: () => Promise<void>;
}> = ({
  deployment,
  onClickSchedulingHistoryAction: onClickSchedulingHistory,
}) => {
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
                style={{ padding: 0 }}
                action={async () => {
                  await onClickSchedulingHistory();
                }}
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
  revisionFetchKey,
  isPendingRefetch,
  onRefetch,
  onAddRevision,
  revisionCardRef,
}) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();
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
  const [deploymentHistoryQueryRef, loadDeploymentHistoryQuery] =
    useQueryLoader<DeploymentSchedulingHistoryModalQuery>(
      DeploymentSchedulingHistoryQuery,
    );
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
  // Derive the stopped-category guard locally from this component's own
  // fragment status (rather than threading a boolean prop down from the page),
  // consistent with the project-mismatch guard resolved below.
  const deploymentStatus = deployment?.metadata.status;
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
                disabled={isDeploymentInStoppedCategory(deploymentStatus)}
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
                        isDeploymentInStoppedCategory(deploymentStatus) ||
                        isInFlightDeleteMutation,
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
          onClickSchedulingHistoryAction={
            supportsDeploymentSchedulingHistory && deployment?.id
              ? async () => {
                  // Render-as-you-fetch: start the request in the open event.
                  const rawId = deployment.id;
                  if (!rawId) {
                    return;
                  }
                  loadDeploymentHistoryQuery(
                    {
                      scope: {
                        deploymentId: safeDecodeUuid(rawId) ?? rawId,
                      },
                      orderBy: [{ field: 'UPDATED_AT', direction: 'DESC' }],
                    },
                    { fetchPolicy: 'store-and-network' },
                  );
                  setHistoryModalOpen(true);
                }
              : undefined
          }
        />
      </BAICard>
      <BAICard
        ref={revisionCardRef}
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
              icon={<PlusIcon />}
              disabled={
                isDeploymentInStoppedCategory(deploymentStatus) ||
                isProjectMismatch
              }
              // `action` (not `onClick`) wraps the open state update in
              // `startTransition` so the page stays interactive while
              // the modal mounts. The button shows a loading spinner
              // until the transition completes.
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
            {isDeployingDifferentRevision && (
              <Alert
                type="info"
                icon={<LoadingOutlined spin />}
                showIcon
                style={{ marginBottom: token.marginMD }}
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
            {currentRevision ? (
              <DeploymentRevisionDetail
                revisionFrgmt={currentRevision}
                status="current"
              />
            ) : !isDeployingDifferentRevision ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={t('deployment.NoCurrentRevisionDeployed')}
              />
            ) : null}
          </>
        )}
        {activeRevisionTab === 'revisionHistory' && deployment && (
          <ErrorBoundaryWithNullFallback>
            <Suspense fallback={<Skeleton active paragraph={{ rows: 4 }} />}>
              <DeploymentRevisionHistoryTab
                deploymentFrgmt={deployment}
                deploymentId={deployment.id}
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
      {deploymentHistoryQueryRef != null && (
        <BAIUnmountAfterClose>
          <DeploymentSchedulingHistoryModal
            open={historyModalOpen}
            queryRef={deploymentHistoryQueryRef}
            onReload={loadDeploymentHistoryQuery}
            onCancel={() => setHistoryModalOpen(false)}
          />
        </BAIUnmountAfterClose>
      )}
    </>
  );
};

export default DeploymentConfigurationSection;
