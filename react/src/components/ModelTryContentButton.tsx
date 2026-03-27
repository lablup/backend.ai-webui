/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ModelTryContentButtonVFolderFragment$key } from '../__generated__/ModelTryContentButtonVFolderFragment.graphql';
import { ModelTryContentButtonVFolderNodeListQuery } from '../__generated__/ModelTryContentButtonVFolderNodeListQuery.graphql';
import { useBaiSignedRequestWithPromise } from '../helper';
import { useCurrentDomainValue } from '../hooks';
import { useSetBAINotification } from '../hooks/useBAINotification';
import { useCurrentResourceGroupValue } from '../hooks/useCurrentProject';
import {
  createServiceInput,
  useModelServiceLauncher,
} from '../hooks/useModelServiceLauncher';
import { useMultiStepNotification } from '../hooks/useMultiStepNotification';
import { PlayCircleOutlined } from '@ant-design/icons';
import { App, Button, Tooltip } from 'antd';
import {
  toLocalId,
  generateRandomString,
  useSearchVFolderFiles,
  useUpdatableState,
  INITIAL_FETCH_KEY,
} from 'backend.ai-ui';
import _ from 'lodash';
import React, { useRef } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';
import { useCurrentUserInfo, useCurrentUserRole } from 'src/hooks/backendai';

const MAX_RETRIES = 12; // 12 retries * 5 seconds = 1 minute max
const RETRY_INTERVAL_MS = 5000;

interface ModelTryContentButtonProps {
  vfolderNode: ModelTryContentButtonVFolderFragment$key | null;
}

const ModelTryContentButton: React.FC<ModelTryContentButtonProps> = ({
  vfolderNode,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { modal } = App.useApp();
  const userRole = useCurrentUserRole();
  const baiRequestWithPromise = useBaiSignedRequestWithPromise();
  const currentDomain = useCurrentDomainValue();
  const [currentUser] = useCurrentUserInfo();
  const currentResourceGroupByProject = useCurrentResourceGroupValue();
  const [fetchKey] = useUpdatableState(INITIAL_FETCH_KEY);
  const { upsertNotification } = useSetBAINotification();

  const { mutationToClone, mutationToCreateService, isPending } =
    useModelServiceLauncher();

  const modelStoreVFolder =
    useFragment<ModelTryContentButtonVFolderFragment$key>(
      graphql`
        fragment ModelTryContentButtonVFolderFragment on VirtualFolderNode {
          id
          row_id
          name
          host
        }
      `,
      vfolderNode,
    );

  const folderName = modelStoreVFolder?.name;

  // Refs to pass runtime values into step executors
  const cloneInputRef = useRef<{
    name: string;
    host: string;
    targetName: string;
  } | null>(null);
  const clonedFolderIdRef = useRef<string>('');
  const directFolderIdRef = useRef<string>('');
  const endpointIdCloneRef = useRef<string>('');
  const endpointIdDirectRef = useRef<string>('');
  const modelIdRef = useRef<string>('vllm-model');

  /**
   * Polls service endpoint until active routes appear or max retries exceeded.
   * Rejects if signal is aborted (user cancelled).
   */
  const pollServiceReady = async (endpointId: string, signal: AbortSignal) => {
    for (let retryCount = 0; retryCount < MAX_RETRIES; retryCount++) {
      if (signal.aborted) throw new Error('Cancelled');
      const routingStatus = await baiRequestWithPromise({
        method: 'GET',
        url: `/services/${endpointId}`,
      });
      if (routingStatus?.active_routes?.length > 0) {
        return routingStatus;
      }
      if (retryCount < MAX_RETRIES - 1) {
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(resolve, RETRY_INTERVAL_MS);
          signal.addEventListener(
            'abort',
            () => {
              clearTimeout(timeout);
              reject(new Error('Cancelled'));
            },
            { once: true },
          );
        });
      }
    }
    throw new Error(t('modelService.ModelServiceFailedToStart'));
  };

  // ── Multi-step notification: clone path (4 steps) ─────────────────────────
  // Step 1 (Promise): Trigger vfolder clone → returns { bgtask_id }
  // Step 2 (SSE):     Listen to clone SSE progress
  // Step 3 (Promise): Create service
  // Step 4 (Promise): Poll until service has active routes
  const cloneThenCreateMultiStep = useMultiStepNotification({
    key: 'modelStore.try.clone',
    message: t('modelService.RunThisModel'),
    steps: [
      {
        label: t('modelService.CloningModelFolder'),
        type: 'promise',
        executor: async (_prevResult, _signal) => {
          const input = cloneInputRef.current;
          if (!input) throw new Error('Clone input not set');
          const result = await mutationToClone.mutateAsync({
            input: {
              permission: 'rw',
              target_host: input.host,
              target_name: input.targetName,
              usage_mode: 'model',
            },
            name: input.name,
          });
          clonedFolderIdRef.current = result.id;
          return { bgtask_id: result.bgtask_id };
        },
      },
      {
        label: t('modelService.CloningModelFolder'),
        type: 'sse',
        executor: (prevResult) => ({
          taskId: (prevResult as { bgtask_id: string }).bgtask_id,
        }),
      },
      {
        label: t('modelService.CreatingService'),
        type: 'promise',
        executor: async (_prevResult, _signal) => {
          const serviceInput = createServiceInput(
            folderName ?? '',
            clonedFolderIdRef.current,
            currentResourceGroupByProject as string,
          );
          const result =
            await mutationToCreateService.mutateAsync(serviceInput);
          endpointIdCloneRef.current = result.endpoint_id ?? '';
          return result;
        },
      },
      {
        label: t('modelService.WaitingForServiceReady'),
        type: 'promise',
        executor: async (_prevResult, signal) => {
          return pollServiceReady(endpointIdCloneRef.current, signal);
        },
        actionButtons: {
          rejected: {
            label: t('modelService.GoToServiceDetailPage'),
            onClick: () => {
              window.location.href = `/serving/${endpointIdCloneRef.current}`;
            },
          },
        },
      },
    ],
    onAllCompleted: {
      message: t('modelService.StartingModelService'),
      actionButtons: {
        primary: {
          label: t('modelService.PlayYourModelNow'),
          onClick: () => {
            window.location.href = `/chat?${new URLSearchParams({
              endpointId: endpointIdCloneRef.current,
              modelId: modelIdRef.current,
            }).toString()}`;
          },
        },
      },
    },
  });

  // ── Multi-step notification: direct path (2 steps, folder exists) ──────────
  // Step 1 (Promise): Create service
  // Step 2 (Promise): Poll until service has active routes
  const directCreateMultiStep = useMultiStepNotification({
    key: 'modelStore.try.direct',
    message: t('modelService.RunThisModel'),
    steps: [
      {
        label: t('modelService.CreatingService'),
        type: 'promise',
        executor: async (_prevResult, _signal) => {
          const serviceInput = createServiceInput(
            folderName ?? '',
            directFolderIdRef.current,
            currentResourceGroupByProject as string,
          );
          const result =
            await mutationToCreateService.mutateAsync(serviceInput);
          endpointIdDirectRef.current = result.endpoint_id ?? '';
          return result;
        },
      },
      {
        label: t('modelService.WaitingForServiceReady'),
        type: 'promise',
        executor: async (_prevResult, signal) => {
          return pollServiceReady(endpointIdDirectRef.current, signal);
        },
        actionButtons: {
          rejected: {
            label: t('modelService.GoToServiceDetailPage'),
            onClick: () => {
              window.location.href = `/serving/${endpointIdDirectRef.current}`;
            },
          },
        },
      },
    ],
    onAllCompleted: {
      message: t('modelService.StartingModelService'),
      actionButtons: {
        primary: {
          label: t('modelService.PlayYourModelNow'),
          onClick: () => {
            window.location.href = `/chat?${new URLSearchParams({
              endpointId: endpointIdDirectRef.current,
              modelId: modelIdRef.current,
            }).toString()}`;
          },
        },
      },
    },
  });

  const { modelStoreFolderNodes, currentUserFolderNodes } =
    useLazyLoadQuery<ModelTryContentButtonVFolderNodeListQuery>(
      graphql`
        query ModelTryContentButtonVFolderNodeListQuery(
          $modelStoreScopeId: ScopeField
          $modelStoreScopeFilter: String
          $permission: VFolderPermissionValueField
          $currentUserScopeId: ScopeField
          $currentUserScopeFilter: String
        ) {
          modelStoreFolderNodes: vfolder_nodes(
            scope_id: $modelStoreScopeId
            filter: $modelStoreScopeFilter
            permission: $permission
          ) {
            edges @required(action: THROW) {
              node @required(action: THROW) {
                id @required(action: THROW)
                status
                name
                row_id
              }
            }
            count
          }
          currentUserFolderNodes: vfolder_nodes(
            scope_id: $currentUserScopeId
            filter: $currentUserScopeFilter
            permission: $permission
          ) {
            edges @required(action: THROW) {
              node @required(action: THROW) {
                id @required(action: THROW)
                name
              }
            }
            count
          }
        }
      `,
      {
        modelStoreScopeId: `domain:${currentDomain}`,
        modelStoreScopeFilter: `usage_mode == "model" & status != "DELETE_PENDING" & status != "DELETE_ONGOING" & status != "DELETE_ERROR" & status != "DELETE_COMPLETE"${folderName ? ` & name like "${folderName}%"` : ''}`,
        permission: 'read_attribute',
        currentUserScopeId: `user:${currentUser.uuid}`,
        currentUserScopeFilter: `ownership_type == "user" & usage_mode == "model" & status != "DELETE_PENDING" & status != "DELETE_ONGOING" & status != "DELETE_ERROR" & status != "DELETE_COMPLETE"${folderName ? ` & name like "${folderName}%"` : ''}`,
      },
      {
        fetchPolicy:
          fetchKey === INITIAL_FETCH_KEY ? 'store-and-network' : 'network-only',
        fetchKey,
      },
    );

  // Get the first available vfolder from the query results
  const availableModelStoreFolder = modelStoreFolderNodes?.edges?.[0]?.node;

  // Find similar folder from current user's own folders
  // TODO: Find already cloned folder from API results.
  const alreadyClonedFolder = currentUserFolderNodes?.edges?.[0]?.node;

  // Check if definition files exist using useSearchVFolderFiles hook
  const { files: folderFiles } = useSearchVFolderFiles(
    availableModelStoreFolder?.id
      ? toLocalId(availableModelStoreFolder.id)
      : '',
  );

  // Check if required definition files exist in the folder files
  const hasModelDefinition = _.some(
    folderFiles?.items,
    (file) =>
      file?.name === 'model-definition.yaml' ||
      file?.name === 'model-definition.yml',
  );
  const hasServiceDefinition = _.some(
    folderFiles?.items,
    (file) => file?.name === 'service-definition.toml',
  );

  // Both files are required for the button to be enabled
  const definitionFilesExist = hasModelDefinition && hasServiceDefinition;

  /* TODO: Apply if cloning to another host is supported.
  const currentProject = useCurrentProjectValue();
  const { unitedAllowedPermissionByVolume } =
    useMergedAllowedStorageHostPermission(
      currentDomain,
      currentProject.id,
      baiClient?._config?.accessKey,
    );
  const { data: accessibleStorageHostList } = useSuspenseTanQuery({
    queryKey: ['accessibleStorageHostList', fetchKey, currentProject.id],
    queryFn: () => {
      return baiRequestWithPromise({
        method: 'GET',
        url: `/folders/_/hosts`,
      });
    },
    staleTime: 1000,
  });
  const mountableAndCloneableHosts = _.filter(
    accessibleStorageHostList?.allowed,
    (host) =>
      _.every(['clone', 'mount-in-session'], (permission) =>
        _.includes(unitedAllowedPermissionByVolume[host], permission),
      ),
  );
  const lowestUsageHost = _.minBy(
    _.map(mountableAndCloneableHosts, (host) => ({
      host,
      volume_info: accessibleStorageHostList?.volume_info?.[host],
    })),
    'volume_info.usage.percentage',
  )?.host;
  */

  // Main function to handle folder clone or service creation
  const cloneOrCreateModelService = async (runtimeVariant: string) => {
    // Validate modelName
    if (!folderName?.trim()) {
      upsertNotification({
        key: 'modelStore.error.noModelName',
        open: true,
        message: t('modelStore.InvalidModelName'),
        description: t('modelStore.ModelNameIsRequired'),
        type: 'error',
      });
      return;
    }

    let modelId = 'vllm-model';
    switch (runtimeVariant) {
      case 'vllm':
      default:
        break;
      case 'nim':
        modelId = 'nim-model';
        break;
      case 'custom':
        modelId = 'custom';
        break;
    }
    modelIdRef.current = modelId;

    const randomTargetName = `${folderName}-${generateRandomString(4)}`;

    if (!alreadyClonedFolder) {
      // No similar folder found - need to clone
      const confirmed = await modal.confirm({
        title: t('modelStore.CloneRequired'),
        content: (
          <Trans
            i18nKey={t('modelService.CloneModelFolderConfirm', {
              folderName: randomTargetName,
            })}
          />
        ),
      });

      if (!confirmed) return;

      // Set clone input for step executor
      cloneInputRef.current = {
        name: modelStoreVFolder?.row_id ?? '',
        host: modelStoreVFolder?.host ?? '',
        targetName: randomTargetName,
      };

      // Wire cancel/retry handlers into the notification before starting
      upsertNotification({
        key: 'modelStore.try.clone',
        onCancel: cloneThenCreateMultiStep.cancel,
        onRetry: cloneThenCreateMultiStep.retry,
      });
      cloneThenCreateMultiStep.start();
    } else {
      // Similar folder exists - skip cloning and directly create service
      const confirmed = await modal.confirm({
        title: t('modelService.AFolderWithSimilarNameExists'),
        content: t('modelService.UseExistingFolderConfirm', {
          folderName: alreadyClonedFolder.name,
        }),
      });

      if (!confirmed) {
        return;
      }

      // Set folder ID for step executor
      directFolderIdRef.current = toLocalId(alreadyClonedFolder?.id) || '';

      // Wire cancel/retry handlers into the notification before starting
      upsertNotification({
        key: 'modelStore.try.direct',
        onCancel: directCreateMultiStep.cancel,
        onRetry: directCreateMultiStep.retry,
      });
      directCreateMultiStep.start();
    }
  };

  return (
    <Tooltip
      title={
        !definitionFilesExist
          ? !hasModelDefinition && !hasServiceDefinition
            ? t('modelService.BothDefinitionFilesRequired')
            : !hasModelDefinition
              ? t('modelService.ModelDefinitionRequired')
              : t('modelService.ServiceDefinitionRequired')
          : ''
      }
    >
      <Button
        type="primary"
        disabled={
          !definitionFilesExist ||
          isPending
        }
        loading={isPending}
        onClick={() => cloneOrCreateModelService('vllm')}
        style={{
          width: 'auto',
          display:
            !definitionFilesExist && userRole === 'user' ? 'none' : undefined,
        }}
        icon={<PlayCircleOutlined />}
      >
        {t('modelService.RunThisModel')}
      </Button>
    </Tooltip>
  );
};

export default ModelTryContentButton;
