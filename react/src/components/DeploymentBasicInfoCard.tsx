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
import { App } from '../app-shim';
import { useWebUINavigate } from '../hooks';
import { useProjectPath } from '../hooks/useRouteScope';
import DeploymentSchedulingHistoryModal, {
  DeploymentSchedulingHistoryQuery,
} from './DeploymentSchedulingHistoryModal';
import DeploymentSettingModal from './DeploymentSettingModal';
import { ButtonGroup } from '@astryxdesign/core/ButtonGroup';
import { DropdownMenu } from '@astryxdesign/core/DropdownMenu';
import { IconButton } from '@astryxdesign/core/IconButton';
import { MetadataListItem } from '@astryxdesign/core/MetadataList';
import { Text } from '@astryxdesign/core/Text';
import {
  BAIButton,
  BAICard,
  BAIDeleteConfirmModal,
  BAIDeploymentStatusTag,
  BAIDeploymentTagChips,
  BAIFetchKeyButton,
  BAIFlex,
  BAIId,
  BAIMetadataList,
  BAIText,
  BAIUnmountAfterClose,
  BooleanTag,
  isDeploymentInStoppedCategory,
  safeDecodeUuid,
  toLocalId,
  useBAILogger,
  useConnectedBAIClient,
} from 'backend.ai-ui';
import type { BAIDeploymentStatus } from 'backend.ai-ui';
import { Trash2, History, EllipsisVertical, SquarePenIcon } from 'lucide-react';
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
  DeploymentBasicInfoCard_deployment$data | null | undefined;

const renderFallback = () => <Text color="secondary">-</Text>;

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

  // PILOT-DECISION: antd Descriptions `bordered` and its responsive column
  // map ({xs:1..xxl:2}) have no MetadataList equivalent — Astryx's flat list
  // is the design, and the container-driven layout handles narrow widths.
  // Rendered with the wide-case `columns={2}`.
  return (
    <BAIMetadataList columns={2}>
      <MetadataListItem label={t('deployment.Lifecycle')}>
        {deployment?.metadata.status ? (
          <BAIFlex align="center" gap="xs">
            <BAIDeploymentStatusTag
              status={deployment.metadata.status as BAIDeploymentStatus}
            />
            {onClickSchedulingHistory && (
              // Same control as the session drawer's Status row: an accent
              // icon button, not a default-tinted link (FR-3482 Q-37 / FR-3572).
              <IconButton
                className="bai-action-accent"
                variant="ghost"
                size="sm"
                icon={<History size="1em" />}
                label={t('deployment.SchedulingHistory')}
                tooltip={t('deployment.SchedulingHistory')}
                clickAction={async () => {
                  await onClickSchedulingHistory();
                }}
              />
            )}
          </BAIFlex>
        ) : (
          renderFallback()
        )}
      </MetadataListItem>
      <MetadataListItem label={t('deployment.DeploymentId')}>
        {deployment?.id ? (
          <BAIId
            globalId={deployment.id}
            copyable
            ellipsis={false}
            style={{ maxWidth: 'none' }}
          />
        ) : (
          renderFallback()
        )}
      </MetadataListItem>
      <MetadataListItem label={t('deployment.Project')}>
        {projectName || renderFallback()}
      </MetadataListItem>
      <MetadataListItem label={t('deployment.Domain')}>
        {deployment?.metadata.domainName || renderFallback()}
      </MetadataListItem>
      <MetadataListItem label={t('modelStore.ResourceGroup')}>
        {deployment?.metadata.resourceGroupName || renderFallback()}
      </MetadataListItem>
      <MetadataListItem label={t('deployment.EndpointUrl')}>
        {deployment?.networkAccess.endpointUrl ? (
          <BAIText copyable>{deployment.networkAccess.endpointUrl}</BAIText>
        ) : (
          renderFallback()
        )}
      </MetadataListItem>
      <MetadataListItem label={t('deployment.Visibility')}>
        <BooleanTag
          value={deployment?.networkAccess.openToPublic}
          trueLabel={t('deployment.Public')}
          falseLabel={t('deployment.Private')}
          fallback={renderFallback()}
        />
      </MetadataListItem>
      <MetadataListItem label={t('deployment.DesiredReplicas')}>
        {deployment?.replicaState?.desiredReplicaCount ?? renderFallback()}
      </MetadataListItem>
      <MetadataListItem label={t('deployment.Tags')}>
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
      </MetadataListItem>
    </BAIMetadataList>
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
            <ButtonGroup label={t('general.Control')}>
              <BAIButton
                icon={<SquarePenIcon />}
                disabled={isDeploymentInStoppedCategory(deploymentStatus)}
                action={async () => {
                  setSettingModalOpen(true);
                }}
              >
                {t('button.Edit')}
              </BAIButton>
              {/* PILOT-DECISION: antd menu-item `danger: true` (red tint on
                  the Delete entry) has no DropdownMenu equivalent — dropped. */}
              <DropdownMenu
                button={{
                  label: t('button.More'),
                  icon: <EllipsisVertical size="1em" />,
                  isIconOnly: true,
                }}
                hasChevron={false}
                items={[
                  {
                    label: t('deployment.DeleteDeployment'),
                    icon: <Trash2 size="1em" />,
                    isDisabled:
                      isDeploymentInStoppedCategory(deploymentStatus) ||
                      isInFlightDeleteMutation,
                    onClick: () => setIsDeleteModalOpen(true),
                  },
                ]}
              />
            </ButtonGroup>
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
      {/* Edit-only call site: the deployment already belongs to a project, so
          the props union rejects a `project` here entirely (ADR-0001). That
          member requires a non-null fragment, hence the guard. */}
      {deployment != null && (
        <DeploymentSettingModal
          open={settingModalOpen}
          deploymentFrgmt={deployment}
          onRequestClose={(success) => {
            setSettingModalOpen(false);
            if (success) onRefetch();
          }}
        />
      )}
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
