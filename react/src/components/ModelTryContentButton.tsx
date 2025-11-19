import { ModelTryContentButtonVFolderFragment$key } from '../__generated__/ModelTryContentButtonVFolderFragment.graphql';
import { ModelTryContentButtonVFolderNodeListQuery } from '../__generated__/ModelTryContentButtonVFolderNodeListQuery.graphql';
import {
  baiSignedRequestWithPromise,
  compareNumberWithUnits,
  useBaiSignedRequestWithPromise,
} from '../helper';
import {
  useCurrentDomainValue,
  useSuspendedBackendaiClient,
  useUpdatableState,
} from '../hooks';
import { useSuspenseTanQuery, useTanMutation } from '../hooks/reactQueryAlias';
import { useSetBAINotification } from '../hooks/useBAINotification';
import {
  useCurrentProjectValue,
  useCurrentResourceGroupValue,
} from '../hooks/useCurrentProject';
import { ModelCard } from '../hooks/useModelCardMetadata';
import {
  ServiceCreateType,
  ServiceLauncherFormValue,
} from './ServiceLauncherPageContent';
import { Button } from 'antd';
import { ESMClientErrorResponse, generateRandomString } from 'backend.ai-ui';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

interface ModelTryContentButtonProps {
  modelStorageHost?: string;
  modelCardMetadata?: ModelCard | null;
  modelName?: string;
  title?: string;
  vfolderNode: ModelTryContentButtonVFolderFragment$key | null;
}

const ModelTryContentButton: React.FC<ModelTryContentButtonProps> = ({
  modelName,
  modelCardMetadata,
  modelStorageHost,
  vfolderNode,
}) => {
  const { t } = useTranslation();
  // const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();
  const baiRequestWithPromise = useBaiSignedRequestWithPromise();
  const currentDomain = useCurrentDomainValue();
  const currentProject = useCurrentProjectValue();
  const currentResourceGroupByProject = useCurrentResourceGroupValue();
  const [fetchKey] = useUpdatableState('first');
  const { upsertNotification } = useSetBAINotification();

  const { vfolder_nodes } =
    useLazyLoadQuery<ModelTryContentButtonVFolderNodeListQuery>(
      graphql`
        query ModelTryContentButtonVFolderNodeListQuery(
          $projectId: UUID!
          $filter: String
          $permission: VFolderPermissionValueField
        ) {
          vfolder_nodes(
            project_id: $projectId
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
        projectId: currentProject.id,
        filter: `usage_mode == "model" & status != "DELETE_PENDING" & status != "DELETE_ONGOING" & status != "DELETE_ERROR" & status != "DELETE_COMPLETE"${modelName ? ` & name ilike "%${modelName}%"` : ''}`,
        permission: 'read_attribute',
      },
      {
        fetchPolicy: 'network-only',
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

  console.log('ModelTryContentButton Debug:', {
    currentProject: currentProject,
    modelName: modelName,
    vfolder_nodes: vfolder_nodes,
  });

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
    {
      bgtask_id: string;
      id: string;
    },
    ESMClientErrorResponse,
    {
      input: any;
      name: string;
    }
  >({
    // @ts-ignore
    mutationFn: ({ input, name }: { input: any; name: string }) => {
      return baiClient.vfolder.clone(input, name);
    },
  });

  //@ts-ignore
  const { data: availableRuntimes } = useSuspenseTanQuery<{
    runtimes: { name: string; human_readable_name: string }[];
  }>({
    queryKey: ['baiClient.modelService.runtime.list'],
    //@ts-ignore
    queryFn: () => {
      return baiClient.isManagerVersionCompatibleWith('24.03.5')
        ? baiRequestWithPromise({
            method: 'GET',
            url: `/services/_/runtimes`,
          })
        : Promise.resolve({
            runtimes: _.map(availableRuntimes?.runtimes, (runtime) => {
              return {
                value: runtime.name,
                label: runtime.human_readable_name,
              };
            }),
          });
    },
    staleTime: 1000,
  });

  const mutationToCreateService = useTanMutation<
    unknown,
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
            ...(values.resource?.acceleratorType &&
            values.resource.accelerator &&
            values.resource.accelerator > 0
              ? {
                  [values.resource.acceleratorType]:
                    // FIXME: manually convert to string since server-side only allows [str,str] tuple
                    values.resource.accelerator.toString(),
                }
              : undefined),
          },
          ...(values.resource.shmem && {
            resource_opts: {
              shmem:
                compareNumberWithUnits(values.resource.mem, '4g') > 0 &&
                compareNumberWithUnits(values.resource.shmem, '1g') < 0
                  ? '1g'
                  : values.resource.shmem,
            },
          }),
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
      environments: modelCardMetadata?.environments || {
        environment: '',
        version: '',
        image: null,
      },
      runtimeVariant: modelCardMetadata?.runtimeVariant || 'custom',
      cluster_size: 1,
      cluster_mode: 'single-node',
      openToPublic: true,
      resourceGroup: currentResourceGroupByProject as string,
      resource: modelCardMetadata?.resource || {
        cpu: 4,
        mem: '32g',
        accelerator: 10,
        acceleratorType: 'cuda.shares',
        shmem: '1g',
      },
      vFolderID: vfolderID, // TODO: add cloned folder result
      modelMountDestination: '/models',
      modelDefinitionPath: '',
      mount_id_map: {},
      envvars: modelCardMetadata?.envvars || [],
      enabledAutomaticShmem: false,
    };
  };

  const cloneOrCreateModelService = (runtimeVariant: string) => {
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
    if (!vfolder_nodes || vfolder_nodes.edges.length === 0) {
      mutationToClone.mutate(
        {
          input: {
            permission: 'wd', // write-delete permission
            target_host: modelStorageHost, // lowestUsageHost, // clone to accessible and lowest usage storage host
            target_name: `${modelCardMetadata?.serviceName || modelName}`, // TODO: add suffix to avoid name conflict
            usage_mode: 'model',
          },
          name: modelStoreVFolder?.row_id ?? '', // TODO: set the name of the cloned folder
        },
        {
          onSuccess: (data) => {
            upsertNotification({
              key: `modelStore.clone. + ${modelName}-1`,
              open: true,
              onClose: () => {
                upsertNotification({
                  key: `modelStore.clone. + ${modelName}-1`,
                  open: false,
                  backgroundTask: {
                    percent: 0,
                    status: 'pending',
                  },
                  to: '',
                  toText: '',
                });
              },
              extraDescription: '(1 / 2)',
              backgroundTask: {
                status: 'pending',
                percent: 50,
                taskId: data.bgtask_id,
                onChange: {
                  pending: t('data.folders.DownloadingModel'),
                  resolved: (cloneData: any, _notification: any) => {
                    mutationToCreateService.mutate(
                      getServiceInputByModelNameAndVFolderId(
                        modelCardMetadata?.serviceName ?? '',
                        cloneData?.id || data?.id,
                      ),
                      {
                        onSuccess: (result: any) => {
                          upsertNotification({
                            key: result?.endpoint_id,
                            open: true,
                            message: t('modelService.StartingModelService'),
                            duration: 0,
                            backgroundTask: {
                              promise: new Promise<void>((resolve, reject) => {
                                let progress = 0;
                                const interval = setInterval(async () => {
                                  try {
                                    progress += _.random(2, 5);
                                    upsertNotification({
                                      key: result?.endpoint_id,
                                      backgroundTask: {
                                        status: 'pending',
                                        percent:
                                          progress > 100 ? 100 : progress,
                                      },
                                    });
                                    const routingStatus =
                                      await baiRequestWithPromise({
                                        method: 'GET',
                                        url: `/services/${result?.endpoint_id}`,
                                      });
                                    if (
                                      routingStatus.active_routes.length > 0
                                    ) {
                                      clearInterval(interval);
                                      return resolve();
                                    }
                                    if (progress >= 100) {
                                      throw new Error(
                                        t(
                                          'modelService.ModelServiceFailedToStart',
                                        ),
                                      );
                                    }
                                  } catch (error) {
                                    clearInterval(interval);
                                    return reject();
                                  }
                                }, 5000);
                              }),
                              status: 'pending',
                              percent: 0,
                              onChange: {
                                pending: t('modelService.StartingModelService'),
                                resolved: (_data, _notification) => ({
                                  open: true,
                                  duration: 0,
                                  key: result?.endpoint_id,
                                  backgroundTask: {
                                    status: 'resolved',
                                    percent: 100,
                                  },
                                  message: '',
                                  to: `/chat?${new URLSearchParams({
                                    endpointId: result?.endpoint_id ?? '',
                                    modelId: 'vllm-model',
                                  }).toString()}`,
                                  toText: t('modelService.PlayYourModelNow'),
                                }),
                                rejected: (_data, _notification) => ({
                                  key: result?.endpoint_id,
                                  duration: 0,
                                  backgroundTask: {
                                    status: 'rejected',
                                    percent: 99,
                                  },
                                  message: '',
                                  to: `/serving/${result?.endpoint_id}`,
                                  toText: t(
                                    'modelService.GoToServiceDetailPage',
                                  ),
                                }),
                              },
                            },
                          });
                        },
                        onError: () => {
                          // TODO: show a notification to go to service detail page
                        },
                      },
                    );
                    return {
                      duration: 0,
                      open: true,
                      key: data?.bgtask_id,
                      backgroundTask: {
                        status: 'resolved',
                        percent: 100,
                      },
                      message: '',
                      to: `/chat?${new URLSearchParams({
                        endpointId: data?.bgtask_id ?? '',
                        modelId: 'vllm-model',
                      }).toString()}`,
                      toText: t('modelService.PlayYourModelNow'),
                    };
                  },
                  rejected: t('data.folders.FolderCloneFailed'),
                },
              },
            });
          },
          onError: () => {
            // TODO: show a notification for clone error
          },
        },
      );
    } else {
      const availableVFolder = vfolder_nodes.edges[0]?.node;
      mutationToCreateService.mutate(
        getServiceInputByModelNameAndVFolderId(
          modelCardMetadata?.serviceName ?? '',
          availableVFolder?.id || '',
        ),
        {
          onSuccess: (result: any) => {
            upsertNotification({
              key: result?.endpoint_id,
              open: true,
              message: t('modelService.StartingModelService'),
              duration: 0,
              backgroundTask: {
                promise: new Promise<void>((resolve, reject) => {
                  let progress = 0;
                  const interval = setInterval(async () => {
                    try {
                      progress += _.random(2, 5);
                      upsertNotification({
                        key: result?.endpoint_id,
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
                        throw new Error(
                          t('modelService.ModelServiceFailedToStart'),
                        );
                      }
                    } catch (error) {
                      clearInterval(interval);
                      return reject();
                    }
                  }, 5000);
                }),
                onChange: {
                  pending: t('modelService.StartingModelService'),
                  resolved: (_data, _notification) => {
                    return {
                      duration: 0,
                      open: true,
                      key: result?.endpoint_id,
                      backgroundTask: {
                        status: 'resolved',
                        percent: 100,
                      },
                      message: '',
                      to: `/chat?${new URLSearchParams({
                        endpointId: result?.endpoint_id ?? '',
                        modelId: modelId,
                      }).toString()}`, // PATH to playground page
                      toText: t('modelService.PlayYourModelNow'),
                    };
                  },
                  rejected: (_data, _notification) => {
                    return {
                      duration: 0,
                      key: result?.endpoint_id,
                      backgroundTask: {
                        status: 'rejected',
                        percent: 99,
                      },
                      message: '',
                      to: `/serving/${result?.endpoint_id}`,
                      toText: t('modelService.GoToServiceDetailPage'),
                    };
                  },
                },
                status: 'pending',
                percent: 0,
              },
            });
          },
          onError: () => {
            // TODO: show a notification to go to service detail page
          },
        },
      );
    }
  };

  return (
    <Button
      type="primary"
      onClick={() => {
        cloneOrCreateModelService(
          modelCardMetadata?.runtimeVariant || 'custom',
        );
      }}
      style={{
        width: 'auto',
      }}
    >
      {t('modelService.RunThisModel')}
    </Button>
  );
};

export default ModelTryContentButton;
