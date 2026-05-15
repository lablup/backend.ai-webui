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
import DeploymentRevisionDetail from './DeploymentRevisionDetail';
import DeploymentRevisionDetailDrawer from './DeploymentRevisionDetailDrawer';
import DeploymentRevisionHistoryTab from './DeploymentRevisionHistoryTab';
import DeploymentSettingModal from './DeploymentSettingModal';
import DeploymentTagChips from './DeploymentTagChips';
import ErrorBoundaryWithNullFallback from './ErrorBoundaryWithNullFallback';
import {
  DeleteFilled,
  EditOutlined,
  LoadingOutlined,
  MoreOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useToggle } from 'ahooks';
import {
  Alert,
  App,
  Button,
  Descriptions,
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
  BAIConfirmModalWithInput,
  BAIFetchKeyButton,
  BAIFlex,
  BAIId,
  BAIText,
  BAIUnmountAfterClose,
  BooleanTag,
  filterOutEmpty,
  toLocalId,
  useBAILogger,
  useInterval,
} from 'backend.ai-ui';
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
        <BAIText copyable>{deployment.metadata.name}</BAIText>
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
  deploymentFrgmt,
  isDeploymentDestroying = false,
  revisionFetchKey,
  isPendingRefetch,
  onRefetch,
  onAddRevision,
}) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const { logger } = useBAILogger();
  const webuiNavigate = useWebUINavigate();
  const location = useLocation();

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
  const [
    settingModalOpen,
    { setLeft: closeSettingModal, setRight: openSettingModal },
  ] = useToggle(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
  const isAdminContext = location.pathname.startsWith('/admin-deployments');
  const listPath = isAdminContext ? '/admin-deployments' : '/deployments';

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
              <Button
                icon={<EditOutlined />}
                disabled={isDeploymentDestroying}
                onClick={openSettingModal}
              >
                {t('button.Edit')}
              </Button>
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
          <BAIFlex gap="xs" align="center">
            <BAIButton
              type="primary"
              icon={<PlusOutlined />}
              disabled={isDeploymentDestroying}
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
            {isDeployingDifferentRevision && (
              <Alert
                type="info"
                icon={<LoadingOutlined spin />}
                showIcon
                title={t('deployment.DeployingRevisionApplying', {
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
          closeSettingModal();
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
      <BAIConfirmModalWithInput
        open={isDeleteModalOpen}
        title={t('deployment.DeleteDeployment')}
        content={
          <BAIFlex direction="column" gap="md" align="stretch">
            <Alert type="warning" title={t('dialog.warning.CannotBeUndone')} />
            <BAIFlex>
              <Typography.Text style={{ marginRight: token.marginXXS }}>
                {t('dialog.TypeNameToConfirmDeletion')}
              </Typography.Text>
              (<Typography.Text code>{deploymentName}</Typography.Text>)
            </BAIFlex>
          </BAIFlex>
        }
        confirmText={deploymentName}
        inputProps={{ placeholder: deploymentName }}
        okText={t('button.Delete')}
        okButtonProps={{ loading: isInFlightDeleteMutation }}
        onOk={handleDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </>
  );
};

export default DeploymentConfigurationSection;
