/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DeploymentDetailPageQuery } from '../__generated__/DeploymentDetailPageQuery.graphql';
import BAIErrorBoundary, {
  ErrorWithGraphQL,
} from '../components/BAIErrorBoundary';
import DeploymentAccessTokensTab from '../components/DeploymentAccessTokensTab';
import DeploymentAddRevisionModal from '../components/DeploymentAddRevisionModal';
import DeploymentAutoScalingTab from '../components/DeploymentAutoScalingTab';
import DeploymentConfigurationSection from '../components/DeploymentConfigurationSection';
import DeploymentReplicasTab from '../components/DeploymentReplicasTab';
import SwitchToProjectButton from '../components/SwitchToProjectButton';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../hooks';
import { useCurrentUserInfo } from '../hooks/backendai';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import {
  getPathFromMenuKey,
  useWebUIMenuItems,
} from '../hooks/useWebUIMenuItems';
import { PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useToggle } from 'ahooks';
import {
  Alert,
  Button,
  Result,
  Skeleton,
  Tooltip,
  Typography,
  theme,
} from 'antd';
import {
  BAIButton,
  BAICard,
  BAIDeploymentStatus,
  BAIFlex,
  BAIUnmountAfterClose,
  INITIAL_FETCH_KEY,
  toGlobalId,
  useFetchKey,
} from 'backend.ai-ui';
import type { GraphQLFormattedError } from 'graphql';
import { BotMessageSquareIcon } from 'lucide-react';
import React, { Suspense, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useParams } from 'react-router-dom';

const scrollToElementId = (id: string) => {
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const DeploymentDetailPage: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [currentUser] = useCurrentUserInfo();
  const webuiNavigate = useWebUINavigate();
  const baiClient = useSuspendedBackendaiClient();
  const currentProject = useCurrentProjectValue();
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
  // Lifted here so the "Private deployment" alert can open the same
  // create-access-token modal that DeploymentAccessTokensTab owns — the alert
  // CTA and the section's "+" button share one flow.
  const [
    createAccessTokenOpen,
    { setLeft: closeCreateAccessToken, setRight: openCreateAccessToken },
  ] = useToggle(false);

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
            ...DeploymentConfigurationSection_deployment
            ...DeploymentReplicasTab_deployment
            ...DeploymentAccessTokensTab_deployment
            ...DeploymentAutoScalingTab_deployment
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
  const isDeploymentDestroying =
    deploymentStatus === 'STOPPING' ||
    deploymentStatus === 'STOPPED' ||
    deploymentStatus === 'TERMINATED';
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
  const hasEndpointUrl = !!deployment.networkAccess.endpointUrl;
  const hasAccessTokens = (deployment.accessTokens?.count ?? 0) > 0;
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
  // When the creator email is unresolvable (e.g. manager versions < 26.4.3),
  // assume the current user owns the deployment so the UI does not
  // over-restrict editing capabilities.
  const isOwnedByCurrentUser =
    !creatorEmail || creatorEmail === currentUser.email;

  const handleRefetch = () => {
    startRefetchTransition(() => updateFetchKey());
  };

  const handleAddRevisionRequestClose = (success?: boolean) => {
    closeAddRevision();
    if (success) {
      startRefetchTransition(() => {
        updateFetchKey();
        updateRevisionFetchKey();
      });
      scrollToElementId('deployment-revisions');
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
      {hasNoRevision && !isProjectMismatch && (
        <Alert
          type="warning"
          showIcon
          title={t('deployment.NoCurrentRevisionDeployed')}
          action={
            <BAIButton
              type="primary"
              icon={<PlusOutlined />}
              // `action` (not `onClick`) wraps the state update that mounts
              // `<DeploymentAddRevisionModal>` (which suspends on its Relay
              // queries) in `startTransition`, so the page stays interactive
              // instead of falling into its Suspense fallback.
              action={async () => {
                openAddRevision();
              }}
              disabled={isDeploymentDestroying}
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
              icon={<PlusOutlined />}
              // Match the Add-Revision CTA above: open the create modal
              // directly. `action` (not `onClick`) defers the mount in a
              // transition so the page stays interactive while the modal
              // suspends on its initial render.
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
      <DeploymentConfigurationSection
        deploymentFrgmt={deployment}
        isDeploymentDestroying={isDeploymentDestroying}
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
            scrollToElementId('deployment-access-tokens');
          }}
        />
      </div>
      {/* Local Suspense around the lazily-mounted modal so its initial
          `useLazyLoadQuery` doesn't bubble its suspend up to the page-level
          Suspense fallback and blank the deployment detail page. The mount
          itself is triggered from a `BAIButton.action` (transition), but
          `BAIUnmountAfterClose` defers the mount via `useLayoutEffect` —
          that state update is no longer inside the transition, so we still
          need an explicit Suspense boundary here. */}
      <Suspense fallback={null}>
        <BAIUnmountAfterClose>
          <DeploymentAddRevisionModal
            open={addRevisionOpen}
            onRequestClose={handleAddRevisionRequestClose}
            deploymentId={deploymentGlobalId}
          />
        </BAIUnmountAfterClose>
      </Suspense>
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
  // Mirror Page401 — route to the user's first available menu item so the
  // button takes them somewhere actionable instead of bouncing through the
  // index redirect.
  const defaultPagePath = firstAvailableMenuItem
    ? getPathFromMenuKey(firstAvailableMenuItem.key)
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
