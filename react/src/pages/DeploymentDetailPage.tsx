/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DeploymentDetailPageQuery } from '../__generated__/DeploymentDetailPageQuery.graphql';
import { ErrorWithGraphQL } from '../components/BAIErrorBoundary';
import DeploymentAccessTokensCard from '../components/DeploymentAccessTokensCard';
import DeploymentAddRevisionModal, {
  type DeploymentAddRevisionModalCreatedRevision,
} from '../components/DeploymentAddRevisionModal';
import DeploymentAutoScalingCard from '../components/DeploymentAutoScalingCard';
import DeploymentBasicInfoCard from '../components/DeploymentBasicInfoCard';
import DeploymentReplicasCard from '../components/DeploymentReplicasCard';
import DeploymentRevisionCard from '../components/DeploymentRevisionCard';
import DeploymentRevisionDetailDrawer from '../components/DeploymentRevisionDetailDrawer';
import SwitchToProjectButton from '../components/SwitchToProjectButton';
import { buildPath } from '../helper/pathBuilder';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../hooks';
import { useCurrentUserInfo } from '../hooks/backendai';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { useActiveProjectName } from '../hooks/useRouteScope';
import {
  getPathFromMenuKey,
  useWebUIMenuItems,
} from '../hooks/useWebUIMenuItems';
import { useToggle } from 'ahooks';
import { Alert, Button, Result, Typography, theme } from 'antd';
import {
  BAIButton,
  BAIDeploymentStatus,
  BAIDeploymentStatusTag,
  BAIFlex,
  BAIUnmountAfterClose,
  INITIAL_FETCH_KEY,
  isDeploymentInStoppedCategory,
  toGlobalId,
  useFetchKey,
} from 'backend.ai-ui';
import type { GraphQLFormattedError } from 'graphql';
import { BotMessageSquareIcon, PlusIcon } from 'lucide-react';
import React, { useRef, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useParams } from 'react-router-dom';

// Poll interval (ms) for refreshing the page query while a revision rollout is
// in progress, so the deployment state moves off the "applying" banner once the
// rollout settles.
const REVISION_ROLLOUT_POLL_INTERVAL = 5000;

const DeploymentDetailPage: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [currentUser] = useCurrentUserInfo();
  const webuiNavigate = useWebUINavigate();
  const baiClient = useSuspendedBackendaiClient();
  const currentProject = useCurrentProjectValue();
  const activeProjectName = useActiveProjectName();
  const isChatBlocked = !!baiClient?._config?.blockList?.includes('chat');

  const { deploymentId: deploymentIdParam } = useParams<{
    deploymentId: string;
  }>();
  const deploymentId = deploymentIdParam ?? '';
  const deploymentGlobalId = toGlobalId('ModelDeployment', deploymentId);

  const [isPendingRefetch, startRefetchTransition] = useTransition();
  const [fetchKey, updateFetchKey] = useFetchKey();
  const [revisionFetchKey, updateRevisionFetchKey] = useFetchKey();
  const [replicaFetchKey, updateReplicaFetchKey] = useFetchKey();
  const [
    addRevisionOpen,
    { setLeft: closeAddRevision, setRight: openAddRevision },
  ] = useToggle(false);
  // Lifted here so the "Private deployment" alert can open the same
  // create-access-token modal that DeploymentAccessTokensCard owns — the alert
  // CTA and the section's "+" button share one flow.
  const [
    createAccessTokenOpen,
    { setLeft: closeCreateAccessToken, setRight: openCreateAccessToken },
  ] = useToggle(false);

  const revisionsSectionRef = useRef<HTMLDivElement>(null);
  const accessTokensSectionRef = useRef<HTMLDivElement>(null);
  // Fragment ref of the revision just created via the Add Revision modal.
  // When set, its detail drawer opens automatically so the user can confirm
  // the configuration that was actually persisted (FR-3005) — notably fields
  // like "Initial Delay" that the form prefills but does not echo back.
  const [createdRevisionFrgmt, setCreatedRevisionFrgmt] =
    useState<DeploymentAddRevisionModalCreatedRevision | null>(null);

  const { deployment: deploymentResult } =
    useLazyLoadQuery<DeploymentDetailPageQuery>(
      graphql`
        query DeploymentDetailPageQuery($deploymentId: ID!) {
          # @catch turns a partial-success response (e.g. RBAC denial that
          # comes back as { deployment: null, errors: [...] }) into a
          # Result<T, unknown> we can inspect inline: permission errors
          # render the "deleted or no permission" UI below; other errors
          # bubble up to the surrounding BAIErrorBoundary by re-throwing.
          deployment(id: $deploymentId) @catch {
            id
            metadata {
              name
              status
              projectId
            }
            networkAccess {
              openToPublic
              endpointUrl
            }
            replicaState {
              desiredReplicaCount
            }
            runningReplicas: replicas(filter: { status: { equals: RUNNING } }) {
              count
            }
            accessTokens {
              count
            }
            currentRevision @since(version: "26.4.3") {
              id
            }
            deployingRevision @since(version: "26.4.3") {
              id
            }
            creator @since(version: "26.4.3") {
              basicInfo {
                email
              }
            }
            ...DeploymentAddRevisionModal_deployment
            ...DeploymentBasicInfoCard_deployment
            ...DeploymentRevisionCard_deployment
            ...DeploymentReplicasCard_deployment
            ...DeploymentAccessTokensCard_deployment
            ...DeploymentAutoScalingCard_deployment
          }
        }
      `,
      {
        deploymentId: deploymentGlobalId,
      },
      {
        fetchKey,
        fetchPolicy:
          fetchKey === INITIAL_FETCH_KEY ? 'store-and-network' : 'network-only',
      },
    );

  if (!deploymentResult.ok) {
    // The manager returns a partial-success GraphQL response for RBAC
    // denials ("Insufficient permission ... lacks permission read on ...")
    // and for deleted deployments. Treat both as "user can't see this
    // deployment" and render the inaccessible UI inline. Anything else
    // (schema errors, network-mapped server errors surfacing as field
    // errors, etc.) is a real bug — re-throw so the outer BAIErrorBoundary
    // gets it.
    const errors =
      deploymentResult.errors as ReadonlyArray<GraphQLFormattedError>;
    const isInaccessible = errors.some((error) =>
      /Insufficient permission/i.test(error?.message ?? ''),
    );
    if (isInaccessible) {
      return <DeploymentInaccessibleResult />;
    }
    const messages = errors
      .map((error) => error?.message ?? '')
      .filter(Boolean);
    const error: ErrorWithGraphQL = new Error(
      messages.join('; ') || 'DeploymentDetailPageQuery failed.',
    );
    error.errors = errors;
    throw error;
  }

  // `value` is typed as `T | null | undefined` because `@catch` does not
  // require non-null. The manager always returns either a populated object
  // or an error, so the non-null assertion is safe — and if the invariant
  // ever breaks, the resulting null-access TypeError propagates to the
  // outer BAIErrorBoundary anyway.
  const deployment = deploymentResult.value!;

  const deploymentName = deployment.metadata.name;
  const deploymentStatus = deployment.metadata.status as BAIDeploymentStatus;
  const isDeploymentReady = deploymentStatus === 'READY';
  // The deployment belongs to a different project than the currently
  // selected one — surface a project-mismatch alert (with a switch shortcut)
  // and suppress the "add revision" call-to-action below, which the user
  // cannot act on without switching projects anyway.
  const deploymentProjectId = deployment.metadata.projectId ?? null;
  const isProjectMismatch =
    !!deploymentProjectId && deploymentProjectId !== currentProject.id;
  // Hide the "no revision" warning while a first revision is being applied —
  // the rollout is in flight, the user already knows about it from the
  // "Applying revision …" Alert in the Configuration section, and the
  // warning would otherwise contradict that state.
  const hasNoRevision =
    !deployment.currentRevision && !deployment.deployingRevision;
  // A different revision is rolling out. Drive the page query's auto-refresh
  // (through the always-mounted BasicInfoCard refresh button) while this is
  // true so the rollout state keeps refreshing no matter which revision
  // sub-tab is active. Previously this poll lived in the Current revision tab,
  // which stopped polling once the user switched tabs and unmounted it.
  const isDeployingDifferentRevision =
    !!deployment.deployingRevision &&
    deployment.deployingRevision.id !== deployment.currentRevision?.id;
  const hasEndpointUrl = !!deployment.networkAccess.endpointUrl;
  const hasAccessTokens = (deployment.accessTokens?.count ?? 0) > 0;
  const isDeploymentDestroying =
    isDeploymentInStoppedCategory(deploymentStatus);
  const hasNoDesiredReplicas =
    (deployment.replicaState?.desiredReplicaCount ?? 0) === 0;
  const hasNoRunningReplicas =
    !hasNoDesiredReplicas && (deployment.runningReplicas?.count ?? 0) === 0;
  const hasNoActiveReplicas = hasNoDesiredReplicas || hasNoRunningReplicas;
  // The private-deployment alert prompts the user to create a token so the
  // endpoint is actually reachable. Suppress it when the endpoint has not
  // been issued yet (creating a token would be premature) or when the user
  // has already created at least one token.
  const isPrivateDeployment =
    deployment.networkAccess.openToPublic === false &&
    !isDeploymentDestroying &&
    hasEndpointUrl &&
    !hasAccessTokens;

  const creatorEmail = deployment.creator?.basicInfo?.email ?? null;
  const isOwnedByCurrentUser =
    !creatorEmail || creatorEmail === currentUser.email;

  const handleRefetch = () => {
    startRefetchTransition(() => updateFetchKey());
  };

  const handleAddRevisionRequestClose = (
    success?: boolean,
    createdRevision?: DeploymentAddRevisionModalCreatedRevision | null,
  ) => {
    closeAddRevision();
    if (success) {
      // Open the detail drawer for the revision that was just created so the
      // user immediately sees the persisted configuration (FR-3005). The
      // mutation response carries the full revision fragment, so the drawer
      // can render from the Relay store without waiting on the refetch.
      if (createdRevision) {
        setCreatedRevisionFrgmt(createdRevision);
      }
      startRefetchTransition(() => {
        updateFetchKey();
        updateRevisionFetchKey();
        // A new revision spawns new replicas — refresh the replicas list so
        // they appear immediately instead of waiting for the next manual
        // refresh or a tab re-mount.
        updateReplicaFetchKey();
      });
      if (revisionsSectionRef.current) {
        revisionsSectionRef.current.style.scrollMarginTop = `${token.Layout?.headerHeight ?? 60}px`;
        revisionsSectionRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }
  };

  const cannotUseModelServiceAlert = () => {
    if (hasNoDesiredReplicas) {
      return (
        <Alert
          type="warning"
          showIcon
          title={t('deployment.NoDesiredReplicas')}
        />
      );
    }
    if (hasNoRunningReplicas) {
      return (
        <Alert
          type="warning"
          showIcon
          title={t('deployment.NoRunningReplicas')}
        />
      );
    }
  };

  return (
    <BAIFlex direction="column" align="stretch" gap="md">
      {isProjectMismatch && deploymentProjectId && (
        <Alert
          type="warning"
          showIcon
          title={t('deployment.NotInProject')}
          action={<SwitchToProjectButton projectId={deploymentProjectId} />}
        />
      )}
      {hasNoActiveReplicas &&
        !hasNoRevision &&
        !isDeploymentDestroying &&
        cannotUseModelServiceAlert()}
      {isDeploymentReady && !hasNoRevision && !hasNoActiveReplicas && (
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
                    pathname: buildPath('project', 'chat', activeProjectName),
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
      {/* Also suppress the "no revision" warning once the deployment is
          stopping/stopped/terminated: its only call-to-action ("Add Revision")
          is already disabled in that state, so the warning is just noise the
          user cannot act on. */}
      {hasNoRevision &&
        !isProjectMismatch &&
        !isDeploymentInStoppedCategory(deploymentStatus) && (
          <Alert
            type="warning"
            showIcon
            title={t('deployment.NoCurrentRevisionDeployed')}
            action={
              <BAIButton
                type="primary"
                icon={<PlusIcon />}
                // `action` (not `onClick`) wraps the open state update in
                // `startTransition` so the page stays interactive while
                // the modal mounts.
                action={async () => {
                  openAddRevision();
                }}
              >
                {t('deployment.AddRevision')}
              </BAIButton>
            }
          />
        )}
      {isPrivateDeployment && (
        <Alert
          type="info"
          showIcon
          title={t('deployment.PrivateDeploymentAlertTitle')}
          action={
            <BAIButton
              type="primary"
              icon={<PlusIcon />}
              // `action` (not `onClick`) defers the mount in a transition
              // so the page stays interactive.
              action={async () => {
                openCreateAccessToken();
              }}
              disabled={isDeploymentDestroying}
            >
              {t('deployment.AddAccessToken')}
            </BAIButton>
          }
        />
      )}
      <BAIFlex direction="row" align="center" gap="sm">
        <Typography.Title level={3} style={{ margin: 0 }}>
          {deploymentName}
        </Typography.Title>
        <BAIDeploymentStatusTag status={deploymentStatus} />
      </BAIFlex>
      <DeploymentBasicInfoCard
        deploymentFrgmt={deployment}
        isPendingRefetch={isPendingRefetch}
        onRefetch={handleRefetch}
        autoUpdateDelay={
          isDeployingDifferentRevision ? REVISION_ROLLOUT_POLL_INTERVAL : null
        }
      />
      <DeploymentRevisionCard
        deploymentFrgmt={deployment}
        revisionFetchKey={revisionFetchKey}
        onAddRevision={openAddRevision}
        revisionCardRef={revisionsSectionRef}
        isAddRevisionDisabled={isDeploymentDestroying || isProjectMismatch}
      />
      <DeploymentReplicasCard
        deploymentFrgmt={deployment}
        deploymentId={deploymentGlobalId}
        replicaFetchKey={replicaFetchKey}
      />
      <DeploymentAutoScalingCard deploymentFrgmt={deployment} />
      <DeploymentAccessTokensCard
        cardRef={accessTokensSectionRef}
        deploymentFrgmt={deployment}
        deploymentId={deploymentGlobalId}
        isOwnedByCurrentUser={isOwnedByCurrentUser}
        isDeploymentDestroying={isDeploymentDestroying}
        isCreateModalOpen={createAccessTokenOpen}
        onCreateModalOpenChange={(open) => {
          if (open) {
            openCreateAccessToken();
          } else {
            closeCreateAccessToken();
          }
        }}
        onTokenCreated={() => {
          // Refresh the page-level query so `accessTokens.count` updates;
          // otherwise the "Private deployment" alert (which is gated on
          // `hasAccessTokens === false`) stays visible after creation.
          handleRefetch();
          if (accessTokensSectionRef.current) {
            accessTokensSectionRef.current.style.scrollMarginTop = `${token.Layout?.headerHeight ?? 60}px`;
            accessTokensSectionRef.current.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
          }
        }}
      />
      {/* No page-level Suspense boundary needed: the modal renders its chrome
          from a non-suspending `useFragment` and each lazy `*Select` (model
          folder / preset / runtime variant) catches its own suspense at the
          `Form.Item` level with a skeleton, so opening the modal never blanks
          this region. */}
      <BAIUnmountAfterClose>
        <DeploymentAddRevisionModal
          open={addRevisionOpen}
          onRequestClose={handleAddRevisionRequestClose}
          deploymentFrgmt={deployment}
        />
      </BAIUnmountAfterClose>
      {/* Detail drawer auto-opened right after a revision is created. It
          renders from the mutation response fragment held in
          `createdRevisionFrgmt`, independent of the configuration section's
          own drawer. */}
      <BAIUnmountAfterClose>
        <DeploymentRevisionDetailDrawer
          revisionFrgmt={createdRevisionFrgmt}
          open={!!createdRevisionFrgmt}
          onClose={() => setCreatedRevisionFrgmt(null)}
        />
      </BAIUnmountAfterClose>
    </BAIFlex>
  );
};

/**
 * Renders the warning Result shown when the deployment is deleted or the
 * current user lacks permission to read it. Mirrors `BAIErrorBoundary`'s
 * fallback layout (centered warning Result + primary action button) so
 * the visual treatment is consistent across error states.
 */
const DeploymentInaccessibleResult: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const webuiNavigate = useWebUINavigate();
  const { firstAvailableMenuItem } = useWebUIMenuItems();
  const activeProjectName = useActiveProjectName();
  // Mirror Page401 — route to the user's first available menu item so the
  // button takes them somewhere actionable instead of bouncing through the
  // index redirect.
  const defaultPagePath = firstAvailableMenuItem
    ? getPathFromMenuKey(firstAvailableMenuItem.key, activeProjectName)
    : '/start';
  const defaultPageTitle =
    firstAvailableMenuItem?.labelText ?? t('webui.menu.FirstPageNameAlias');
  return (
    <BAIFlex style={{ margin: 'auto' }} justify="center" align="center">
      <Result
        status="warning"
        title={t('deployment.NotAccessibleOrDeleted')}
        extra={
          <Button
            type="primary"
            onClick={() => {
              webuiNavigate(defaultPagePath);
            }}
          >
            {t('button.GoBackToStartPage', { title: defaultPageTitle })}
          </Button>
        }
      />
    </BAIFlex>
  );
};

export default DeploymentDetailPage;
