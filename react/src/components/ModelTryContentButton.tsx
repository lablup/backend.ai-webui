/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ModelTryContentButtonVFolderFragment$key } from '../__generated__/ModelTryContentButtonVFolderFragment.graphql';
import { ModelTryContentButtonVFolderNodeListQuery } from '../__generated__/ModelTryContentButtonVFolderNodeListQuery.graphql';
import { useCurrentDomainValue } from '../hooks';
import {
  useSetBAINotification,
  useBAINotificationState,
} from '../hooks/useBAINotification';
import { useCurrentResourceGroupValue } from '../hooks/useCurrentProject';
import {
  createServiceInput,
  useModelServiceLauncher,
} from '../hooks/useModelServiceLauncher';
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
import React, { useRef, useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';
import { useCurrentUserInfo, useCurrentUserRole } from 'src/hooks/backendai';

interface ModelTryContentButtonProps {
  vfolderNode: ModelTryContentButtonVFolderFragment$key | null;
}

const ModelTryContentButton: React.FC<ModelTryContentButtonProps> = ({
  vfolderNode,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { modal } = App.useApp();
  const currentDomain = useCurrentDomainValue();
  const [currentUser] = useCurrentUserInfo();
  const userRole = useCurrentUserRole();
  const currentResourceGroupByProject = useCurrentResourceGroupValue();
  const [fetchKey] = useUpdatableState(INITIAL_FETCH_KEY);
  const { upsertNotification } = useSetBAINotification();
  const [notifications] = useBAINotificationState();

  const {
    mutationToClone,
    mutationToCreateService,
    createServiceNotificationMsg,
    isPending,
  } = useModelServiceLauncher();

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

  // Track clone completion to trigger service creation
  const pendingCloneRef = useRef<{
    randomTargetName: string;
    clonedFolderId: string;
    modelId: string;
  } | null>(null);

  // Listen to clone notification completion and start service creation
  useEffect(() => {
    // Skip if no pending clone or mutation is already running
    if (!pendingCloneRef.current || mutationToCreateService.isPending) return;

    const cloneNotificationKey = `modelStore.clone.${pendingCloneRef.current.randomTargetName}`;
    const cloneNotification = _.find(notifications, {
      key: cloneNotificationKey,
    });

    if (cloneNotification?.backgroundTask?.status === 'resolved') {
      const { randomTargetName, clonedFolderId, modelId } =
        pendingCloneRef.current;

      // Clear the ref BEFORE starting mutation to prevent duplicate execution
      pendingCloneRef.current = null;

      // Start service creation
      mutationToCreateService.mutate(
        createServiceInput(
          folderName ?? '',
          clonedFolderId,
          currentResourceGroupByProject as string,
        ),
        {
          onSuccess: (result) => {
            // Close the clone notification
            upsertNotification({
              key: cloneNotificationKey,
              open: false,
            });
            // Create service notification with different key
            createServiceNotificationMsg(
              result,
              modelId,
              `modelStore.create.${randomTargetName}`,
            );
          },
          onError: (error) => {
            // Close the clone notification
            upsertNotification({
              key: cloneNotificationKey,
              open: false,
            });
            // Show service creation error with different key
            upsertNotification({
              key: `modelStore.create.${randomTargetName}`,
              open: true,
              message: t('modelService.ModelServiceFailedToStart'),
              description: error?.message || null,
              backgroundTask: {
                status: 'rejected',
                percent: 0,
              },
            });
          },
        },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications, folderName, currentResourceGroupByProject]);

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

      // Clone the model folder
      mutationToClone.mutate(
        {
          input: {
            permission: 'rw',
            target_host: modelStoreVFolder?.host ?? '', // lowestUsageHost, // clone to accessible and lowest usage storage host
            target_name: randomTargetName,
            usage_mode: 'model',
          },
          name: modelStoreVFolder?.row_id ?? '', // TODO: set the name of the cloned folder
        },
        {
          onSuccess: (data) => {
            // Store clone info for service creation after completion
            pendingCloneRef.current = {
              randomTargetName,
              clonedFolderId: data.id,
              modelId,
            };

            upsertNotification({
              key: `modelStore.clone.${randomTargetName}`,
              open: true,
              message: t('data.folders.FolderClonePending'),
              onClose: () => {
                upsertNotification({
                  key: `modelStore.clone.${randomTargetName}`,
                  open: false,
                  backgroundTask: {
                    percent: 0,
                    status: 'pending',
                  },
                  to: '',
                  toText: '',
                });
              },
              backgroundTask: {
                status: 'pending',
                percent: 50,
                taskId: data.bgtask_id,
                onChange: {
                  pending: t('data.folders.FolderClonePending'),
                  resolved: {
                    key: `modelStore.clone.${randomTargetName}`,
                    message: t('data.folders.FolderCloned'),
                    description: null,
                    open: true,
                    duration: 0,
                    backgroundTask: {
                      status: 'resolved',
                      percent: 100,
                    },
                    to: {
                      search: new URLSearchParams({
                        folder: data.id,
                      }).toString(),
                    },
                    toText: t('data.folders.OpenAFolder'),
                  },
                  rejected: t('data.folders.FolderCloneFailed'),
                },
              },
            });
          },
          onError: (error) => {
            upsertNotification({
              key: `modelStore.clone.${randomTargetName}`,
              open: true,
              message: t('data.folders.FolderCloneFailed'),
              description: error?.message || null,
              backgroundTask: {
                status: 'rejected',
                percent: 0,
              },
            });
          },
        },
      );
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

      // Create service with existing folder (skip cloning)
      mutationToCreateService.mutate(
        createServiceInput(
          folderName,
          toLocalId(alreadyClonedFolder?.id) || '',
          currentResourceGroupByProject as string,
        ),
        {
          onSuccess: (result) => {
            createServiceNotificationMsg(
              result,
              modelId,
              `modelStore.create.${randomTargetName}`,
            );
          },
          onError: (error) => {
            upsertNotification({
              key: `modelStore.create.${randomTargetName}`,
              open: true,
              message: t('modelService.ModelServiceFailedToStart'),
              description: error?.message || null,
              backgroundTask: {
                status: 'rejected',
                percent: 0,
              },
            });
          },
        },
      );
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
        disabled={!definitionFilesExist || isPending}
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
