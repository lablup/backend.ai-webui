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
import NvidiaIcon from './BAIIcons/Nvidia';
import VLLMIcon from './BAIIcons/VLLMIcon';
import {
  ServiceCreateType,
  ServiceLauncherFormValue,
} from './ServiceLauncherPageContent';
import { VFolder } from './VFolderSelect';
import { BuildOutlined } from '@ant-design/icons';
import { theme, Typography, Button } from 'antd';
import _ from 'lodash';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface ModelTryContentProps {
  modelStorageHost?: string;
  modelName?: string;
  minAIAcclResource: number;
  title?: string;
}

const ModelTryContent: React.FC<ModelTryContentProps> = ({
  modelName,
  modelStorageHost,
  minAIAcclResource,
  title,
  ...props
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();
  const baiRequestWithPromise = useBaiSignedRequestWithPromise();
  const currentDomain = useCurrentDomainValue();
  const currentProject = useCurrentProjectValue();
  const currentResourceGroupByProject = useCurrentResourceGroupValue();
  const [fetchKey, updateFetchKey] = useUpdatableState('first');
  const { upsertNotification } = useSetBAINotification();

  const { data: allFolderList } = useSuspenseTanQuery({
    queryKey: ['allFolderList', fetchKey, currentProject.id],
    queryFn: () => {
      const search = new URLSearchParams();
      search.set('group_id', currentProject.id);
      return baiRequestWithPromise({
        method: 'GET',
        url: `/folders?${search.toString()}`,
      }) as Promise<VFolder[]>;
    },
    staleTime: 1000,
  });

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

  const { data: availableRuntimes } = useSuspenseTanQuery<{
    runtimes: { name: string; human_readable_name: string }[];
  }>({
    queryKey: ['baiClient.modelService.runtime.list'],
    queryFn: () => {
      return baiClient.isManagerVersionCompatibleWith('24.03.5')
        ? baiRequestWithPromise({
            method: 'GET',
            url: `/services/_/runtimes`,
          })
        : Promise.resolve({
            runtimes: [
              {
                name: 'custom',
                human_readable_name: 'Custom (Default)',
              },
            ],
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
          scaling_group: 'nvidia-H100', // FIXME: hardcoded. change it with option later as well, values.resourceGroup,
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
    const model = modelName?.includes('stable-diffusion-3-medium')
      ? 'stable-diffusion-3m'
      : modelName?.includes('Llama-3.2-11B-Vision-Instruct')
        ? 'llama-vision-11b'
        : modelName?.includes('Talkativot UI')
          ? 'talkativot'
          : modelName;
    return {
      serviceName: `${model}-${generateRandomString(4)}`,
      replicas: 1,
      // FIXME: hard-coded images for vLLM, NIM, Custom
      environments: {
        image: {
          registry: 'cr.backend.ai',
          name: (() => {
            if (['stable-diffusion', 'phi-4'].includes(modelName as string)) {
              return 'testing/ngc-pytorch';
            }
            switch (runtimeVariant) {
              case 'nim':
                return 'testing/ngc-nim';
              case 'vllm':
              case 'custom':
              default:
                return 'testing/vllm';
            }
          })(),
          tag: (() => {
            if (['stable-diffusion', 'phi-4'].includes(modelName as string)) {
              return '24.07-pytorch2.4-py310-cuda12.5';
            }
            switch (runtimeVariant) {
              case 'vllm':
              case 'custom':
              default:
                return '0.6.6-cuda12.4-ubuntu22.04'; // '0.6.2-cuda12.1-ubuntu22.04';
              case 'nim':
                return 'ngc-nim:1.0.0-llama3.8b-h100x1-fp16';
            }
          })(),
          architecture: 'x86_64',
          base_image_name: undefined,
          digest: undefined,
          humanized_name: undefined,
          id: undefined,
          installed: undefined,
          labels: undefined,
          namespace: undefined,
          resource_limits: undefined,
          tags: undefined,
          version: undefined,
        },
        // FIXME: temporarily hard-coded environment variable
        environment: modelName?.includes('Talkativot UI')
          ? '[{"tokenLimit":1024,"vision":false,"apiEndpoint":"https://llama_kor_bllossom.asia03.app.backend.ai","id":"Llama-3.2-Korean-Bllossom-3B","name":"Llama-3.2-Korean-Bllossom-3B"},{"tokenLimit":2048,"vision":false,"apiEndpoint":"https://gemma2_9b.asia03.app.backend.ai/","id":"gemma-2-9b-it","name":"gemma-2-9b-it"},{"tokenLimit":4096,"vision":true,"apiEndpoint":"https://llama-vision.asia03.app.backend.ai/","id":"Llama-3.2-11B-Vision-Instruct","name":"Llama-3.2-11B-Vision-Instruct"}]'
          : '',
        version: '',
      },
      // FIXME: temporally hard-coded runtime variant
      runtimeVariant: ['stable-diffusion', 'phi-4'].includes(
        modelName as string,
      )
        ? 'custom'
        : runtimeVariant,
      cluster_size: 1,
      cluster_mode: 'single-node',
      openToPublic: true,
      resourceGroup: currentResourceGroupByProject as string,
      resource: {
        cpu: 4,
        mem: '32g',
        accelerator: modelName?.includes('Talkativot UI')
          ? 0
          : minAIAcclResource,
        acceleratorType: 'cuda.shares',
        shmem: '1g',
      },
      vFolderID: vfolderID, // TODO: add cloned folder result
      modelMountDestination: '/models',
      modelDefinitionPath: '',
      vfoldersAliasMap: {},
      envvars: [],
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
            target_name: `${modelName === 'Talkativot UI' ? 'talkativot-standalone-1' : modelName}`,
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
                    getServiceInputByRuntimeVariant('vllm', `${modelName}-1`),
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
                                  progress += 5;
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
                      progress += 5;
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
                  resolved: 'Model service is now ready!',
                  rejected:
                    'Model service failed to start. Please check the service status.',
                },
                status: 'pending',
                percent: 0,
                onResolve: () => {
                  upsertNotification({
                    duration: 0,
                    key: result?.endpoint_id,
                    backgroundTask: {
                      status: 'resolved',
                      percent: 100,
                    },
                    message: '',
                    to: `/playground?endpointId=${result?.endpoint_id}&modelId=${modelId}`, // PATH to playground page
                    toText: 'Play your model now!',
                  });
                },
                onFailed: () => {
                  upsertNotification({
                    duration: 0,
                    key: result?.endpoint_id,
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
    }
  };

  return (
    <>
      {title && (
        <Typography.Title level={5} style={{ marginTop: 0 }}>
          {title}
        </Typography.Title>
      )}
      <Button
        type="primary"
        disabled={
          modelName?.includes('stable-diffusion') ||
          modelName?.includes('Talkativot UI') ||
          modelName?.includes('phi-4')
        }
        onClick={() => {
          cloneOrCreateModelService('vllm');
        }}
        icon={<VLLMIcon size={token.sizeLG} />}
        style={{
          height: token.sizeXXL,
        }}
      >
        vLLM
      </Button>
      <Button
        disabled={
          modelName?.includes('stable-diffusion') ||
          modelName?.includes('gemma-2-27b-it') ||
          modelName?.includes('Llama-3.2-11B-Vision-Instruct') ||
          modelName?.includes('Talkativot UI') ||
          modelName?.includes('phi-4')
        }
        type="primary"
        onClick={() => {
          cloneOrCreateModelService('nim');
        }}
        style={{
          height: token.sizeXXL,
        }}
        icon={<NvidiaIcon size={token.sizeLG} />}
      >
        NIM
      </Button>
      <Button
        type="primary"
        onClick={() => {
          cloneOrCreateModelService('custom');
        }}
        style={{
          height: token.sizeXXL,
        }}
        icon={<BuildOutlined style={{ fontSize: token.sizeLG }} />}
      >
        Custom
      </Button>
    </>
  );
};

export default ModelTryContent;
