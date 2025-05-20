import {
  baiSignedRequestWithPromise,
  compareNumberWithUnits,
  useBaiSignedRequestWithPromise,
} from '../helper';
import { generateRandomString } from '../helper';
import {
  useCurrentDomainValue,
  useSuspendedBackendaiClient,
  useUpdatableState,
} from '../hooks';
import { useSuspenseTanQuery, useTanMutation } from '../hooks/reactQueryAlias';
import { useSetBAINotification } from '../hooks/useBAINotification';
import { useCurrentResourceGroupValue } from '../hooks/useCurrentProject';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { ModelConfigMeta } from '../hooks/useModelConfig';
import Flex from './Flex';
import {
  ServiceCreateType,
  ServiceLauncherFormValue,
} from './ServiceLauncherPageContent';
import { VFolder } from './VFolderSelect';
import { theme, Button } from 'antd';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface ModelTryContentButtonProps {
  modelStorageHost?: string;
  modelConfigItem?: ModelConfigMeta | null;
  modelName?: string;
  title?: string;
}

const ModelTryContentButton: React.FC<ModelTryContentButtonProps> = ({
  modelName,
  modelConfigItem,
  modelStorageHost,
  title,
  ...props
}) => {
  const { t } = useTranslation();
  // const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();
  const baiRequestWithPromise = useBaiSignedRequestWithPromise();
  const currentDomain = useCurrentDomainValue();
  const currentProject = useCurrentProjectValue();
  const currentResourceGroupByProject = useCurrentResourceGroupValue();
  // const [fetchKey, updateFetchKey] = useUpdatableState('first');
  const { upsertNotification } = useSetBAINotification();

  const { data: allFolderList } = useSuspenseTanQuery({
    queryKey: ['allFolderList', '', currentProject.id],
    queryFn: (): Promise<VFolder[]> => {
      const search = new URLSearchParams();
      search.set('group_id', currentProject.id);
      return baiRequestWithPromise({
        method: 'GET',
        url: `/folders?${search.toString()}`,
      }) as Promise<VFolder[]>;
    },
    staleTime: 1000,
  });

  // const { data: accessibleStorageHostList } = useSuspenseTanQuery({
  //   queryKey: ['accessibleStorageHostList', fetchKey, currentProject.id],
  //   queryFn: () => {
  //     return baiRequestWithPromise({
  //       method: 'GET',
  //       url: `/folders/_/hosts`,
  //     });
  //   },
  //   staleTime: 1000,
  // });

  // FIXME: need to check if the modelStorageHost is accessible
  // const lowestUsageHost = _.minBy(
  //   _.map(accessibleStorageHostList?.allowed, (host) => ({
  //     host,
  //     volume_info: accessibleStorageHostList?.volume_info?.[host],
  //   })),
  //   'volume_info.usage.percentage',
  // )?.host;

  const myModelStoreList = _.filter(
    allFolderList,
    (vFolder) =>
      vFolder.ownership_type === 'user' && vFolder.usage_mode === 'model',
  );

  const filteredModelStoreList = myModelStoreList.filter((vFolder) =>
    vFolder.name.includes(
      modelName === 'Talkativot UI' ? 'talkativot-standalone' : modelName || '',
    ),
  );

  const mutationToClone = useTanMutation<
    {
      bgtask_id: string;
      id: string;
    },
    { type?: string; title?: string; message?: string },
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
        // FIXME: hardcode this part by selected option (vLLM, NIM, Custom)
        // ...getImageInfoFromInputInCreating(
        //   checkManualImageAllowed(
        //     baiClient._config.allow_manual_image_name_for_session,
        //     values.environments?.manual,
        //   ),
        //   values,
        // ),
        runtime_variant: values.runtimeVariant,
        group: baiClient.current_group, // current Project Group,
        domain: currentDomain, // current Domain Group,
        cluster_size: values.cluster_size,
        cluster_mode: values.cluster_mode,
        open_to_public: values.openToPublic,
        config: {
          model: values.vFolderID,
          model_version: 1, // FIXME: hardcoded. change it with option later
          model_mount_destination: '/models', // FIXME: hardcoded. change it with option later
          environ, // FIXME: hardcoded. change it with option later
          scaling_group: currentResourceGroupByProject ?? '', // FIXME: hardcoded. change it with option later as well, values.resourceGroup,
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

  const getServiceInputByRuntimeVariant = (
    runtimeVariant: string,
    vfolderID: string,
  ): ServiceLauncherFormValue => {
    const model = modelConfigItem?.name || modelName;
    return {
      serviceName: `${model}-${generateRandomString(4)}`,
      replicas: 1,
      environments: modelConfigItem?.environments || {
        environment: '',
        version: '',
        image: null,
      },
      // FIXME: temporally hard-coded runtime variant
      runtimeVariant: modelConfigItem?.runtimeVariant || 'custom',
      cluster_size: 1,
      cluster_mode: 'single-node',
      openToPublic: true,
      resourceGroup: currentResourceGroupByProject as string,
      resource: modelConfigItem?.resource || {
        cpu: 4,
        mem: '32g',
        accelerator: 10,
        acceleratorType: 'cuda.shares',
        shmem: '1g',
      },
      vFolderID: vfolderID, // TODO: add cloned folder result
      modelMountDestination: '/models',
      modelDefinitionPath: '',
      vfoldersAliasMap: {},
      envvars: modelConfigItem?.envvars || [],
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
    if (filteredModelStoreList.length < 1) {
      mutationToClone.mutate(
        {
          input: {
            // FIXME: hardcoded
            cloneable: true,
            permission: 'wd', // write-delete permission
            target_host: modelStorageHost, // lowestUsageHost, // clone to accessible and lowest usage storage host
            target_name: `${modelConfigItem?.serviceName || modelName}`, // TODO: add suffix to avoid name conflict
            usage_mode: 'model',
          },
          name: `${modelName === 'Talkativot UI' ? 'talkativot-standalone' : modelName}`,
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
                  pending: 'Downloading model is in progress...', // t('data.folders.FolderClonePending'),
                  resolved: 'Successfully downloaded model.', // t('data.folders.FolderCloned'),
                  rejected:
                    'Downloading model failed. Please check storage quota and try again.', // t('data.folders.FolderCloneFailed'),
                },
                onResolve: () => {
                  mutationToCreateService.mutate(
                    getServiceInputByRuntimeVariant(
                      modelConfigItem?.runtimeVariant || 'custom',
                      `${modelName}-1`,
                    ),
                    {
                      onSuccess: (result: any) => {
                        upsertNotification({
                          key: result?.endpoint_id,
                          open: true,
                          message: 'Starting model service...',
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
                                  const routingStatus =
                                    await baiRequestWithPromise({
                                      method: 'GET',
                                      url: `/services/${result?.endpoint_id}`,
                                    });
                                  if (routingStatus.active_routes.length > 0) {
                                    clearInterval(interval);
                                    return resolve();
                                  }
                                  if (progress >= 100) {
                                    throw new Error(
                                      'Model service failed to start. Please check the service status.',
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
                            onResolve: () => {
                              upsertNotification({
                                open: true,
                                duration: 0,
                                key: result?.endpoint_id,
                                backgroundTask: {
                                  status: 'resolved',
                                  percent: 100,
                                },
                                message: '',
                                to: `/playground?endpointId=${result?.endpoint_id}&modelId=vllm-model`, // PATH to playground page
                                toText: 'Play your model now!',
                              });
                            },
                            onFailed: () => {
                              upsertNotification({
                                key: result?.endpoint_id,
                                duration: 0,
                                backgroundTask: {
                                  status: 'rejected',
                                  percent: 99,
                                },
                                message: '',
                                to: `/serving/${result?.endpoint_id}`,
                                toText: 'Go to service detail page',
                              });
                            },
                          },
                        });
                      },
                      onError: () => {
                        // TODO: show a notification to go to service detail page
                      },
                    },
                  );
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
      mutationToCreateService.mutate(
        getServiceInputByRuntimeVariant(
          runtimeVariant,
          filteredModelStoreList[0].id,
        ),
        {
          onSuccess: (result: any) => {
            upsertNotification({
              key: result?.endpoint_id,
              open: true,
              message: 'Starting model service...',
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
                          'Model service failed to start. Please check the service status.',
                        );
                      }
                    } catch (error) {
                      clearInterval(interval);
                      return reject();
                    }
                  }, 5000);
                }),
                onChange: {
                  pending: 'Model service is starting...',
                  resolved: (_data, _notification) => {
                    return {
                      duration: 0,
                      open: true,
                      key: result?.endpoint_id,
                      backgroundTask: {
                        status: 'resolved',
                        percent: 100,
                      },
                      message: 'Model service is successfully started.',
                      to: `/chat?endpointId=${result?.endpoint_id}&modelId=${modelId}`, // PATH to playground page
                      toText: 'Play your model now!',
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
                      message:
                        'Model service failed to start. Please check the service status.',
                      to: `/serving/${result?.endpoint_id}`,
                      toText: 'Go to service detail page',
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
        cloneOrCreateModelService(modelConfigItem?.runtimeVariant || 'custom');
      }}
      style={{
        width: 'auto',
      }}
    >
      {t('modelService.TryModelOnYourOwn')}
    </Button>
  );
};

export default ModelTryContentButton;
