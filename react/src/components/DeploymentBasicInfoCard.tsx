/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DeploymentBasicInfoCardDeleteMutation } from '../__generated__/DeploymentBasicInfoCardDeleteMutation.graphql';
import type {
  DeploymentBasicInfoCard_deployment$data,
  DeploymentBasicInfoCard_deployment$key,
} from '../__generated__/DeploymentBasicInfoCard_deployment.graphql';
import { DeploymentSchedulingHistoryModalQuery } from '../__generated__/DeploymentSchedulingHistoryModalQuery.graphql';
import { useWebUINavigate } from '../hooks';
import { useProjectPath } from '../hooks/useRouteScope';
import DeploymentSchedulingHistoryModal, {
  DeploymentSchedulingHistoryQuery,
} from './DeploymentSchedulingHistoryModal';
import DeploymentSettingModal from './DeploymentSettingModal';
import {
  DeleteFilled,
  EditOutlined,
  HistoryOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import {
  App,
  Button,
  Descriptions,
  Divider,
  Dropdown,
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
  isDeploymentInStoppedCategory,
  safeDecodeUuid,
  toLocalId,
  useBAILogger,
  useConnectedBAIClient,
} from 'backend.ai-ui';
import type { BAIDeploymentStatus } from 'backend.ai-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation, useQueryLoader } from 'react-relay';

interface DeploymentBasicInfoCardProps {
  deploymentFrgmt: DeploymentBasicInfoCard_deployment$key | null;
  isPendingRefetch: boolean;
  onRefetch: () => void;
  /**
   * Auto-refresh interval (ms) for the page query's refresh button, or `null`
   * to disable. The page sets this to a poll interval while a revision rollout
   * is in flight so the deployment state keeps refreshing regardless of which
   * revision sub-tab is active (the rollout poll used to live in the Current
   * revision tab, which stopped polling once unmounted — FR-3104 review).
   */
  autoUpdateDelay?: number | null;
}

type DeploymentSectionData =
  | DeploymentBasicInfoCard_deployment$data
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
  const buildProjectPath = useProjectPath();

  const projectName =
    deployment?.metadata.projectV2?.basicInfo?.name ??
    deployment?.metadata.projectId;

  const deploymentItems = filterOutEmpty([
    {
      key: 'lifecycle',
      label: t('deployment.Lifecycle'),
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
            // from (admin / project-admin / user `deployments`) so breadcrumb /
            // back navigation remain coherent — see FR-2847 (admin) and
            // FR-2930 (project admin) for the per-scope detail-route precedent.
            // The current scope (from the route handle) plus the active project
            // name yield the correct scope-aware list path via `useProjectPath`.
            const targetPathname = buildProjectPath('deployments');
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

/**
 * DeploymentBasicInfoCard — top-level "Basic Information" card on the
 * Deployment detail page. Shows the overview descriptions and owns the
 * deployment-level actions (Edit settings, Delete, Scheduling history).
 */
const DeploymentBasicInfoCard: React.FC<DeploymentBasicInfoCardProps> = ({
  deploymentFrgmt,
  isPendingRefetch,
  onRefetch,
  autoUpdateDelay = null,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { logger } = useBAILogger();
  const webuiNavigate = useWebUINavigate();
  const buildProjectPath = useProjectPath();

  const deployment = useFragment(
    graphql`
      fragment DeploymentBasicInfoCard_deployment on ModelDeployment {
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
      }
    `,
    deploymentFrgmt,
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
    useMutation<DeploymentBasicInfoCardDeleteMutation>(graphql`
      mutation DeploymentBasicInfoCardDeleteMutation(
        $input: DeleteDeploymentInput!
      ) {
        deleteModelDeployment(input: $input) {
          id
        }
      }
    `);

  const deploymentName = deployment?.metadata.name ?? '';
  // Derive the stopped-category guard locally from this component's own
  // fragment status (rather than threading a boolean prop down from the page).
  const deploymentStatus = deployment?.metadata.status;
  // Scope-aware deployment-list path for back navigation. The current route
  // scope (admin / projectAdmin / project, from the route handle) plus the
  // active project name produce the correct list URL via `useProjectPath`.
  const listPath = buildProjectPath('deployments');

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
              autoUpdateDelay={autoUpdateDelay}
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
                      limit: 10,
                      offset: 0,
                    },
                    { fetchPolicy: 'store-and-network' },
                  );
                  setHistoryModalOpen(true);
                }
              : undefined
          }
        />
      </BAICard>
      <DeploymentSettingModal
        open={settingModalOpen}
        deploymentFrgmt={deployment}
        onRequestClose={(success) => {
          setSettingModalOpen(false);
          if (success) onRefetch();
        }}
      />
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

export default DeploymentBasicInfoCard;
