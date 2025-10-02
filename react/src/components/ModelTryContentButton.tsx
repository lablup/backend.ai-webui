import { ModelTryContentButtonVFolderFragment$key } from '../__generated__/ModelTryContentButtonVFolderFragment.graphql';
import { ModelTryContentButtonVFolderNodeListQuery } from '../__generated__/ModelTryContentButtonVFolderNodeListQuery.graphql';
import {
  baiSignedRequestWithPromise,
  generateRandomString,
  useBaiSignedRequestWithPromise,
} from '../helper';
import {
  INITIAL_FETCH_KEY,
  useCurrentDomainValue,
  useSuspendedBackendaiClient,
  useUpdatableState,
} from '../hooks';
import { useSuspenseTanQuery, useTanMutation } from '../hooks/reactQueryAlias';
import {
  useSetBAINotification,
  NotificationStateForOnChange,
} from '../hooks/useBAINotification';
import {
  useCurrentProjectValue,
  useCurrentResourceGroupValue,
} from '../hooks/useCurrentProject';
import { FileItem } from './FolderExplorer';
import {
  ServiceCreateType,
  ServiceLauncherFormValue,
} from './ServiceLauncherPageContent';
import { PlayCircleOutlined } from '@ant-design/icons';
import { App, Button, Tooltip } from 'antd';
import {
  toLocalId,
  compareNumberWithUnits,
  ESMClientErrorResponse,
} from 'backend.ai-ui';
import _ from 'lodash';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';
import { useCurrentUserRole } from 'src/hooks/backendai';

interface ModelTryContentButtonProps {
  modelStorageHost?: string;
  modelName?: string;
  vfolderNode: ModelTryContentButtonVFolderFragment$key | null;
}

interface CloneVFolderInput {
  permission: string;
  target_host?: string;
  target_name: string;
  usage_mode: string;
  cloneable?: boolean;
}

interface CloneResponse {
  bgtask_id: string;
  id: string;
}

interface ServiceResult {
  endpoint_id?: string;
}

const ModelTryContentButton: React.FC<ModelTryContentButtonProps> = ({
  modelName,
  modelStorageHost,
  vfolderNode,
}) => {
  const { t } = useTranslation();
  const { modal } = App.useApp();
  const baiClient = useSuspendedBackendaiClient();
  const userRole = useCurrentUserRole();
  const baiRequestWithPromise = useBaiSignedRequestWithPromise();
  const currentDomain = useCurrentDomainValue();
  const currentProject = useCurrentProjectValue();
  const currentResourceGroupByProject = useCurrentResourceGroupValue();
  const [fetchKey] = useUpdatableState(INITIAL_FETCH_KEY);
  const { upsertNotification } = useSetBAINotification();

  const { vfolder_nodes } =
    useLazyLoadQuery<ModelTryContentButtonVFolderNodeListQuery>(
      graphql`
        query ModelTryContentButtonVFolderNodeListQuery(
          $scope_id: ScopeField
          $filter: String
          $permission: VFolderPermissionValueField
        ) {
          vfolder_nodes(
            scope_id: $scope_id
            filter: $filter
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
        }
      `,
      {
        scope_id: `project:${currentProject.id}`,
        filter: `usage_mode == "model" & status != "DELETE_PENDING" & status != "DELETE_ONGOING" & status != "DELETE_ERROR" & status != "DELETE_COMPLETE"${modelName ? ` & name like "%${modelName}%"` : ''}`,
        permission: 'read_attribute',
      },
      {
        fetchPolicy:
          fetchKey === INITIAL_FETCH_KEY ? 'store-and-network' : 'network-only',
        fetchKey,
      },
    );

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

  // Get the first available vfolder from the query results
  const availableVFolder = vfolder_nodes?.edges?.[0]?.node;

  // Check if definition files exist using query
  const { data: folderFiles } = useSuspenseTanQuery<Array<FileItem>>({
    queryKey: [
      'ModelTryContentButton',
      'folderFiles',
      availableVFolder?.row_id || modelStoreVFolder?.row_id,
    ],
    queryFn: () => {
      const folderId = availableVFolder?.row_id || modelStoreVFolder?.row_id;
      if (!folderId) {
        return [];
      }
      return baiClient.vfolder
        .list_files('.', folderId)
        .then((res: { items: Array<FileItem> }) => {
          return res.items || [];
        });
    },
    staleTime: 1000,
  });

  // Check if required definition files exist in the folder files
  const hasModelDefinition = _.some(
    folderFiles,
    (file: { name?: string }) => file?.name === 'model-definition.yaml',
  );
  const hasServiceDefinition = _.some(
    folderFiles,
    (file: { name?: string }) => file?.name === 'service-definition.toml',
  );

  // Both files are required for the button to be enabled
  const definitionFilesExist = hasModelDefinition && hasServiceDefinition;

  /* FIXME: need to check if the modelStorageHost is accessible & cloneable
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
  const lowestUsageHost = _.minBy(
    _.map(accessibleStorageHostList?.allowed, (host) => ({
      host,
      volume_info: accessibleStorageHostList?.volume_info?.[host],
    })),
    'volume_info.usage.percentage',
  )?.host;
  */

  const mutationToClone = useTanMutation<
    CloneResponse,
    ESMClientErrorResponse,
    {
      input: CloneVFolderInput;
      name: string;
    }
  >({
    mutationFn: ({
      input,
      name,
    }: {
      input: CloneVFolderInput;
      name: string;
    }) => {
      return baiClient.vfolder.clone(input, name);
    },
  });

  const mutationToCreateService = useTanMutation<
    ServiceResult,
    {
      message?: string;
    },
    ServiceLauncherFormValue
  >({
    mutationFn: (values) => {
      const environ: { [key: string]: string } = {};
      if (values.envvars) {
        values.envvars.forEach((v) => (environ[v.variable] = v.value));
      }
      // These fields are replaced with contents from service-definition.toml
      const body: ServiceCreateType = {
        name: values.serviceName,
        desired_session_count: values.replicas,
        image:
          `${values.environments.image?.registry}/${values.environments.image?.name}:${values.environments.image?.tag}` as string,
        architecture: values.environments.image?.architecture as string,
        runtime_variant: values.runtimeVariant,
        group: baiClient.current_group, // current Project Group,
        domain: currentDomain, // current Domain Group,
        cluster_size: values.cluster_size,
        cluster_mode: values.cluster_mode,
        open_to_public: values.openToPublic,
        config: {
          model: values.vFolderID,
          model_version: 1,
          model_mount_destination: '/models',
          environ,
          scaling_group: currentResourceGroupByProject ?? '',
          resources: {
            // FIXME: manually convert to string since server-side only allows [str,str] tuple
            cpu: values.resource.cpu.toString(),
            mem: values.resource.mem,
            ...(values.resource.accelerator > 0
              ? {
                  [values.resource.acceleratorType]:
                    // FIXME: manually convert to string since server-side only allows [str,str] tuple
                    values.resource.accelerator.toString(),
                }
              : undefined),
          },
          resource_opts: {
            shmem:
              compareNumberWithUnits(values.resource.mem, '4g') > 0 &&
              compareNumberWithUnits(values.resource.shmem, '1g') < 0
                ? '1g'
                : values.resource.shmem,
          },
        },
      };
      return baiSignedRequestWithPromise({
        method: 'POST',
        url: '/services',
        body,
        client: baiClient,
      });
    },
  });

  const getServiceInputByModelNameAndVFolderId = (
    modelName: string,
    vfolderID: string,
  ): ServiceLauncherFormValue => {
    return {
      serviceName: `${modelName}-${generateRandomString(4)}`,
      replicas: 1,
      environments: {
        environment: '',
        version: '',
        image: null,
      },
      runtimeVariant: 'vllm',
      cluster_size: 1,
      cluster_mode: 'single-node',
      openToPublic: true,
      resourceGroup: currentResourceGroupByProject as string,
      resource: {
        cpu: 4,
        mem: '32g',
        accelerator: 10,
        acceleratorType: 'cuda.shares',
        shmem: '1g',
      },
      vFolderID: vfolderID,
      modelMountDestination: '/models',
      modelDefinitionPath: '',
      mount_id_map: {},
      envvars: [],
      enabledAutomaticShmem: false,
    };
  };

  // Helper function to create service notification
  const createServiceNotification = (
    result: ServiceResult,
    modelId: string,
    notificationKey: string,
  ) => {
    upsertNotification({
      key: notificationKey,
      open: true,
      message: t('modelService.StartingModelService'),
      description: null,
      duration: 0,
      backgroundTask: {
        promise: new Promise<void>((resolve, reject) => {
          let progress = 0;
          const interval = setInterval(async () => {
            try {
              progress += _.random(2, 5);
              upsertNotification({
                key: notificationKey,
                backgroundTask: {
                  status: 'pending',
                  percent: progress > 100 ? 100 : progress,
                },
              });
              const routingStatus = await baiRequestWithPromise({
                method: 'GET',
                url: `/services/${result?.endpoint_id}`,
              });
              if (routingStatus.active_routes.length > 0) {
                clearInterval(interval);
                return resolve();
              }
              if (progress >= 100) {
                throw new Error(t('modelService.ModelServiceFailedToStart'));
              }
            } catch (error) {
              clearInterval(interval);
              return reject(error);
            }
          }, 5000);
        }),
        onChange: {
          pending: {
            message: t('modelService.StartingModelService'),
            description: null,
          },
          resolved: {
            duration: 0,
            open: true,
            key: notificationKey,
            backgroundTask: {
              status: 'resolved',
              percent: 100,
            },
            message: t('modelService.StartingModelService'),
            description: null,
            to: `/chat?${new URLSearchParams({
              endpointId: result?.endpoint_id ?? '',
              modelId: modelId,
            }).toString()}`,
            toText: t('modelService.PlayYourModelNow'),
          },
          rejected: {
            duration: 0,
            key: notificationKey,
            backgroundTask: {
              status: 'rejected',
              percent: 99,
            },
            message: t('modelService.StartingModelService'),
            description: null,
            to: `/serving/${result?.endpoint_id}`,
            toText: t('modelService.GoToServiceDetailPage'),
          },
        },
        status: 'pending',
        percent: 0,
      },
    });
  };

  // Main function to handle folder clone or service creation
  const cloneOrCreateModelService = async (runtimeVariant: string) => {
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

    const randomTargetName = `${modelName}-${generateRandomString(4)}`;

    if (!availableVFolder) {
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
            permission: 'wd', // write-delete permission
            target_host: modelStorageHost, // lowestUsageHost, // clone to accessible and lowest usage storage host
            target_name: randomTargetName,
            usage_mode: 'model',
          },
          name: modelStoreVFolder?.row_id ?? '', // TODO: set the name of the cloned folder
        },
        {
          onSuccess: (data) => {
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
                  pending: t('data.folders.DownloadingModel'),
                  resolved: (
                    __,
                    _notification: NotificationStateForOnChange,
                  ) => {
                    const clonedFolderId = data?.id; // Use the original clone response ID

                    if (!clonedFolderId) {
                      return {
                        key: `modelStore.clone.${randomTargetName}`,
                        open: true,
                        message: t('data.folders.FolderCloneFailed'),
                        backgroundTask: {
                          status: 'rejected',
                          percent: 0,
                        },
                      };
                    }

                    mutationToCreateService.mutate(
                      getServiceInputByModelNameAndVFolderId(
                        modelName ?? '',
                        clonedFolderId,
                      ),
                      {
                        onSuccess: (result: ServiceResult) => {
                          // Close the clone notification
                          upsertNotification({
                            key: `modelStore.clone.${randomTargetName}`,
                            open: false,
                          });
                          // Create service notification with different key
                          createServiceNotification(
                            result,
                            modelId,
                            `modelStore.create.${randomTargetName}`,
                          );
                        },
                        onError: (error) => {
                          // Close the clone notification
                          upsertNotification({
                            key: `modelStore.clone.${randomTargetName}`,
                            open: false,
                          });
                          // Show service creation error with different key
                          upsertNotification({
                            key: `modelStore.create.${randomTargetName}`,
                            open: true,
                            message: t(
                              'modelService.ModelServiceFailedToStart',
                            ),
                            description: error?.message || null,
                            backgroundTask: {
                              status: 'rejected',
                              percent: 0,
                            },
                          });
                        },
                      },
                    );
                    return {
                      key: `modelStore.clone.${randomTargetName}`,
                      open: true,
                      message: t('data.folders.FolderCloned'),
                      backgroundTask: {
                        status: 'resolved',
                        percent: 100,
                      },
                    };
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
          folderName: availableVFolder.name,
        }),
      });

      if (!confirmed) {
        return;
      }

      // Create service with existing folder (skip cloning)
      mutationToCreateService.mutate(
        getServiceInputByModelNameAndVFolderId(
          modelName ?? '',
          toLocalId(availableVFolder?.id) || '',
        ),
        {
          onSuccess: (result: ServiceResult) => {
            createServiceNotification(
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
        disabled={!definitionFilesExist}
        onClick={() => {
          cloneOrCreateModelService('vllm');
        }}
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
