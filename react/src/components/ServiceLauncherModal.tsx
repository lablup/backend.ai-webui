import { baiSignedRequestWithPromise, iSizeToSize } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentDomainValue } from '../hooks';
import { useResourceSlots } from '../hooks/backendai';
import { useTanMutation } from '../hooks/reactQueryAlias';
import BAIModal, { BAIModalProps } from './BAIModal';
import FlexActivityIndicator from './FlexActivityIndicator';
import ImageEnvironmentSelectFormItems, {
  Image,
  ImageEnvironmentFormInput,
} from './ImageEnvironmentSelectFormItems';
import ResourceGroupSelect from './ResourceGroupSelect';
import { ACCELERATOR_UNIT_MAP } from './ResourceNumber';
import SliderInputItem from './SliderInputFormItem';
import VFolderSelect from './VFolderSelect';
import { Card, Form, Input, theme, Select, Switch, message } from 'antd';
import _ from 'lodash';
import React, { Suspense, useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';

type ClusterMode = 'single-node' | 'multi-node';

interface ServiceCreateConfigResourceOptsType {
  shmem?: number | string;
}
interface ServiceCreateConfigResourceType {
  cpu: number | string;
  mem: string;
  'cuda.device'?: number | string;
  'cuda.shares'?: number | string;
  'rocm.device'?: number | string;
  'tpu.device'?: number | string;
  'ipu.device'?: number | string;
  'atom.device'?: number | string;
  'warboy.device'?: number | string;
}

interface ServiceCreateConfigType {
  model: string;
  model_version?: string;
  model_mount_destination: string; // default == "/models"
  environ: object; // environment variable
  scaling_group: string;
  resources: ServiceCreateConfigResourceType;
  resource_opts?: ServiceCreateConfigResourceOptsType;
}
interface ServiceCreateType {
  name: string;
  desired_session_count: number;
  image: string;
  arch: string;
  group: string;
  domain: string;
  cluster_size: number;
  cluster_mode: ClusterMode;
  tag?: string;
  startup_command?: string;
  bootstrap_script?: string;
  owner_access_key?: string;
  open_to_public: boolean;
  config: ServiceCreateConfigType;
}

interface ServiceLauncherProps
  extends Omit<BAIModalProps, 'onOK' | 'onCancel'> {
  extraP?: boolean;
  onRequestClose: (success?: boolean) => void;
}
interface ServiceLauncherFormInput extends ImageEnvironmentFormInput {
  serviceName: string;
  // gpu: number;
  resource: AIAccelerator;
  cpu: number;
  mem: number;
  shmem: number;
  resourceGroup: string;
  vFolderName: string;
  desiredRoutingCount: number;
  openToPublic: boolean;
}

interface AIAccelerator {
  accelerator: number;
  acceleratorType: SelectUIType;
}

interface SelectUIType {
  value: string;
  label: string;
}

const ServiceLauncherModal: React.FC<ServiceLauncherProps> = ({
  extraP,
  onRequestClose,
  ...modalProps
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();
  // const [modalText, setModalText] = useState("Content of the modal");
  const currentDomain = useCurrentDomainValue();
  const [form] = Form.useForm<ServiceLauncherFormInput>();
  const [resourceSlots] = useResourceSlots();
  const currentImage = Form.useWatch(['environments', 'image'], form); //TODO: type // form.getFieldValue(['environments', 'image']);
  const currentAcceleratorType = form.getFieldValue([
    'resource',
    'acceleratorType',
  ]);
  const currentImageAcceleratorLimits = _.filter(
    currentImage?.resource_limits,
    (limit) =>
      limit ? !_.includes(['cpu', 'mem', 'shmem'], limit.key) : false,
  );
  const currentImageAcceleratorTypeName: string =
    // NOTE:
    // filter from resourceSlots since resourceSlots and supported image could be non-identical.
    // resourceSlots returns "all resources enable to allocate(including AI accelerator)"
    // imageAcceleratorLimit returns "all resources that is supported in the selected image"
    _.filter(currentImageAcceleratorLimits, (acceleratorInfo: any) =>
      _.keys(resourceSlots).includes(acceleratorInfo?.key),
    )[0]?.key || '';
  const acceleratorSlots = _.omit(resourceSlots, ['cpu', 'mem', 'shmem']);

  // change selected accelerator type according to currentImageAcceleratorTypeName
  useEffect(() => {
    form.setFieldValue(['resource', 'acceleratorType'], {
      value: currentImageAcceleratorTypeName,
      label: ACCELERATOR_UNIT_MAP[currentImageAcceleratorTypeName] || 'UNIT',
    });
  }, [currentImage]);

  const getLimitByAccelerator = (acceleratorName: string) => {
    // FIXME: temporally add hard-coded number when config is undefined
    const defaultAIAcceleratorMaxLimit = 8;
    switch (acceleratorName) {
      case 'cuda.device':
      default:
        return (
          baiClient._config.maxCUDADevicesPerContainer ||
          defaultAIAcceleratorMaxLimit
        );
      case 'cuda.shares':
        return (
          baiClient._config.maxCUDASharesPerContainer ||
          defaultAIAcceleratorMaxLimit
        );
      case 'rocm.device':
        return (
          baiClient._config.maxROCMDevicesPerContainer ||
          defaultAIAcceleratorMaxLimit
        );
      case 'tpu.device':
        return (
          baiClient._config.maxTPUDevicesPerContainer ||
          defaultAIAcceleratorMaxLimit
        );
      case 'ipu.device':
        return (
          baiClient._config.maxIPUDevicesPerContainer ||
          defaultAIAcceleratorMaxLimit
        );
      case 'atom.device':
        return (
          baiClient._config.maxATOMDevicesPerContainer ||
          defaultAIAcceleratorMaxLimit
        );
      case 'warboy.device':
        return (
          baiClient._config.maxWarboyDevicesPerContainer ||
          defaultAIAcceleratorMaxLimit
        );
    }
  };

  const mutationToCreateService = useTanMutation<
    unknown,
    {
      message?: string;
    },
    ServiceLauncherFormInput
  >({
    mutationFn: (values) => {
      const image: string = `${values.environments.image?.registry}/${values.environments.image?.name}:${values.environments.image?.tag}`;
      const body: ServiceCreateType = {
        name: values.serviceName,
        desired_session_count: values.desiredRoutingCount,
        image: image,
        arch: values.environments.image?.architecture as string,
        group: baiClient.current_group, // current Project Group,
        domain: currentDomain, // current Domain Group,
        cluster_size: 1, // FIXME: hardcoded. change it with option later
        cluster_mode: 'single-node', // FIXME: hardcoded. change it with option later
        open_to_public: values.openToPublic,
        config: {
          model: values.vFolderName,
          model_mount_destination: '/models', // FIXME: hardcoded. change it with option later
          environ: {}, // FIXME: hardcoded. change it with option later
          scaling_group: values.resourceGroup,
          resources: {
            cpu: values.cpu,
            mem: values.mem + 'G',
          },
        },
      };
      if (resourceSlots?.['cuda.shares']) {
        body['config'].resources['cuda.shares'] = values.gpu;
      }
      if (resourceSlots?.['cuda.device']) {
        body['config'].resources['cuda.device'] = values.gpu;
      }
      if (values.shmem && values.shmem > 0) {
        body['config'].resource_opts = {
          shmem: values.shmem + 'G',
        };
      }
      return baiSignedRequestWithPromise({
        method: 'POST',
        url: '/services',
        body,
        client: baiClient,
      });
    },
  });
  // const scalingGroupList = use;
  // modelStorageList: Record<string, any>[];
  // environmentList: Record<string, any>[];
  // name?: string;
  // cpu: number | string;
  // mem: number | string;
  // npu?: number | string;
  // shmem?: number | string;

  // Apply any operation after clicking OK button
  const handleOk = () => {
    // setModalText("Lorem Ipsum");
    // setConfirmLoading(true);
    // // TODO: send request to start service to manager server
    // setTimeout(() => {
    //   setConfirmLoading(false);
    // }, 2000);
    form
      .validateFields()
      .then((values) => {
        mutationToCreateService.mutate(values, {
          onSuccess: () => {
            onRequestClose(true);
          },
          onError: (error) => {
            if (error?.message) {
              message.error(
                _.truncate(error?.message, {
                  length: 200,
                }),
              );
            } else {
              message.error(t('modelService.FailedToStartService'));
            }
          },
        });
      })
      .catch((err) => {
        if (err.errorFields?.[0].errors?.[0]) {
          message.error(err.errorFields?.[0].errors?.[0]);
        } else {
          message.error(t('modelService.FormValidationFailed'));
        }
      });
  };

  // Apply any operation after clicking Cancel button
  const handleCancel = () => {
    // console.log("Clicked cancel button");
    onRequestClose();
  };

  return (
    <BAIModal
      title={t('modelService.StartNewServing')}
      onOk={handleOk}
      onCancel={handleCancel}
      destroyOnClose={true}
      maskClosable={false}
      confirmLoading={mutationToCreateService.isLoading}
      {...modalProps}
    >
      <Suspense fallback={<FlexActivityIndicator />}>
        <Form
          disabled={mutationToCreateService.isLoading}
          form={form}
          preserve={false}
          layout="vertical"
          labelCol={{ span: 12 }}
          initialValues={
            {
              cpu: 1,
              // gpu: 0,
              resource: {
                accelerator: 0,
              },
              mem: 0.25,
              shmem: 0,
              desiredRoutingCount: 1,
            } as ServiceLauncherFormInput
          }
        >
          <Form.Item
            label={t('modelService.ServiceName')}
            name="serviceName"
            rules={[
              {
                pattern: /^(?=.{4,24}$)\w[\w.-]*\w$/,
                message: t('modelService.ServiceNameRule'),
              },
              {
                required: true,
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="resourceGroup"
            label={t('session.ResourceGroup')}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <ResourceGroupSelect autoSelectDefault />
          </Form.Item>
          <Form.Item
            name="openToPublic"
            label={t('modelService.OpenToPublic')}
            valuePropName="checked"
          >
            <Switch></Switch>
          </Form.Item>
          <Form.Item
            name={'vFolderName'}
            label={t('session.launcher.ModelStorageToMount')}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <VFolderSelect
              filter={(vf) => vf.usage_mode === 'model'}
              autoSelectDefault
            />
          </Form.Item>
          <SliderInputItem
            label={t('modelService.DesiredRoutingCount')}
            name="desiredRoutingCount"
            rules={[
              {
                required: true,
              },
            ]}
            inputNumberProps={{
              //TODO: change unit based on resource limit
              addonAfter: '#',
            }}
            required
          />
          <Card
            style={{
              marginBottom: token.margin,
            }}
          >
            <ImageEnvironmentSelectFormItems
            // //TODO: test with real inference images
            // filter={(image) => {
            //   return !!_.find(image?.labels, (label) => {
            //     return (
            //       label?.key === "ai.backend.role" &&
            //       label.value === "INFERENCE" //['COMPUTE', 'INFERENCE', 'SYSTEM']
            //     );
            //   });
            // }}
            />
            <Form.Item
              noStyle
              shouldUpdate={(prev, cur) =>
                prev.environments?.image?.digest !==
                cur.environments?.image?.digest
              }
            >
              {({ getFieldValue }) => {
                // TODO: change min/max based on selected images resource limit and current user limit
                const currentImage: Image =
                  getFieldValue('environments')?.image;

                return (
                  <>
                    <SliderInputItem
                      name={'cpu'}
                      label={t('session.launcher.CPU')}
                      tooltip={<Trans i18nKey={'session.launcher.DescCPU'} />}
                      min={parseInt(
                        _.find(
                          currentImage?.resource_limits,
                          (i) => i?.key === 'cpu',
                        )?.min || '0',
                      )}
                      max={baiClient._config.maxCPUCoresPerContainer || 128}
                      inputNumberProps={{
                        addonAfter: t('session.launcher.Core'),
                      }}
                      required
                      rules={[
                        {
                          required: true,
                        },
                      ]}
                    />
                    <SliderInputItem
                      name={'mem'}
                      label={t('session.launcher.Memory')}
                      tooltip={
                        <Trans i18nKey={'session.launcher.DescMemory'} />
                      }
                      max={baiClient._config.maxMemoryPerContainer || 1536}
                      min={0}
                      inputNumberProps={{
                        addonAfter: 'GiB',
                      }}
                      step={0.25}
                      required
                      rules={[
                        {
                          required: true,
                        },
                        ({ getFieldValue }) => ({
                          validator(_form, value) {
                            const sizeGInfo = iSizeToSize(
                              _.find(
                                currentImage?.resource_limits,
                                (i) => i?.key === 'mem',
                              )?.min || '0B',
                              'G',
                            );

                            if (sizeGInfo.number > value) {
                              return Promise.reject(
                                new Error(
                                  t('session.launcher.MinMemory', {
                                    size: sizeGInfo.numberUnit,
                                  }),
                                ),
                              );
                            }
                            return Promise.resolve();
                          },
                        }),
                      ]}
                    />
                    <SliderInputItem
                      name={'shmem'}
                      label={t('session.launcher.SharedMemory')}
                      tooltip={
                        <Trans i18nKey={'session.launcher.DescSharedMemory'} />
                      }
                      max={baiClient._config.maxShmPerContainer || 8}
                      min={0}
                      step={0.25}
                      inputNumberProps={{
                        addonAfter: 'GiB',
                      }}
                      required
                      rules={[
                        {
                          required: true,
                        },
                      ]}
                    />
                  </>
                );
              }}
            </Form.Item>
            <Form.Item
              noStyle
              shouldUpdate={(prev, cur) =>
                prev.environments?.environment !== cur.environments?.environment
              }
            >
              {() => {
                return (
                  <SliderInputItem
                    name={['resource', 'accelerator']}
                    initialValue={0}
                    label={t(`session.launcher.AIAccelerator`)}
                    tooltip={
                      <Trans i18nKey={'session.launcher.DescAIAccelerator'} />
                    }
                    sliderProps={{
                      marks: {
                        0: 0,
                      },
                    }}
                    max={getLimitByAccelerator(currentImageAcceleratorTypeName)}
                    step={
                      _.endsWith(currentAcceleratorType, 'shares') ? 0.1 : 1
                    }
                    disabled={currentImageAcceleratorLimits.length <= 0}
                    inputNumberProps={{
                      addonAfter: (
                        <Form.Item
                          noStyle
                          name={['resource', 'acceleratorType']}
                          initialValue={currentImageAcceleratorTypeName}
                        >
                          <Select
                            disabled={currentImageAcceleratorLimits.length <= 0}
                            suffixIcon={
                              _.size(acceleratorSlots) > 1 ? undefined : null
                            }
                            open={
                              _.size(acceleratorSlots) > 1 ? undefined : false
                            }
                            popupMatchSelectWidth={false}
                            options={_.map(acceleratorSlots, (value, name) => {
                              return {
                                value: name,
                                label: ACCELERATOR_UNIT_MAP[name] || 'UNIT',
                                disabled:
                                  currentImageAcceleratorLimits.length > 0 &&
                                  !_.find(
                                    currentImageAcceleratorLimits,
                                    (limit) => {
                                      return limit?.key === name;
                                    },
                                  ),
                              };
                            })}
                          />
                        </Form.Item>
                      ),
                    }}
                    required
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                  />
                );
              }}
            </Form.Item>
          </Card>
        </Form>
      </Suspense>
    </BAIModal>
  );
};

export default ServiceLauncherModal;
