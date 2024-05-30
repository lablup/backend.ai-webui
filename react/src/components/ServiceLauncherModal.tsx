import ResourceAllocationFormItems, {
  ResourceAllocationFormValue,
  AUTOMATIC_DEFAULT_SHMEM,
  RESOURCE_ALLOCATION_INITIAL_FORM_VALUES,
} from '../components/ResourceAllocationFormItems';
import {
  baiSignedRequestWithPromise,
  compareNumberWithUnits,
  iSizeToSize,
} from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentDomainValue } from '../hooks';
import { useTanMutation } from '../hooks/reactQueryAlias';
import BAIModal, { BAIModalProps, DEFAULT_BAI_MODAL_Z_INDEX } from './BAIModal';
import Flex from './Flex';
import FlexActivityIndicator from './FlexActivityIndicator';
import ImageEnvironmentSelectFormItems, {
  ImageEnvironmentFormInput,
} from './ImageEnvironmentSelectFormItems';
import InputNumberWithSlider from './InputNumberWithSlider';
import VFolderLazyView from './VFolderLazyView';
import VFolderSelect from './VFolderSelect';
import VFolderTableFormItem from './VFolderTableFormItem';
import { ServiceLauncherModalFragment$key } from './__generated__/ServiceLauncherModalFragment.graphql';
import { ServiceLauncherModalModifyMutation } from './__generated__/ServiceLauncherModalModifyMutation.graphql';
import { MinusOutlined } from '@ant-design/icons';
import {
  App,
  Button,
  Card,
  Form,
  Input,
  theme,
  Switch,
  FormInstance,
  Skeleton,
} from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React, {
  useState,
  Suspense,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useFragment, useMutation } from 'react-relay';

const ServiceValidationView = React.lazy(
  () => import('./ServiceValidationView'),
);

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
  'hyperaccel-lpu.device'?: number | string;
}
interface MountOptionType {
  mount_destination?: string;
  type?: string;
  permission?: string;
}

interface ServiceCreateConfigType {
  model: string;
  model_version?: number;
  model_mount_destination?: string; // default == "/models"
  model_definition_path?: string; // default == "model-definition.yaml"
  environ: object; // environment variable
  scaling_group: string;
  resources: ServiceCreateConfigResourceType;
  resource_opts?: ServiceCreateConfigResourceOptsType;
  extra_mounts?: Record<string, MountOptionType>;
}
export interface ServiceCreateType {
  name: string;
  desired_session_count: number;
  image: string;
  architecture: string;
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
  extends Omit<BAIModalProps, 'onOk' | 'onCancel'> {
  endpointFrgmt?: ServiceLauncherModalFragment$key | null;
  extraP?: boolean;
  onRequestClose: (success?: boolean) => void;
}
interface ServiceLauncherInput extends ImageEnvironmentFormInput {
  serviceName: string;
  vFolderName: string;
  desiredRoutingCount: number;
  openToPublic: boolean;
  modelMountDestination: string;
  modelDefinitionPath: string;
  vfoldersAliasMap: Record<string, string>;
  mounts: Array<string>;
}

export type ServiceLauncherFormValue = ServiceLauncherInput &
  ImageEnvironmentFormInput &
  ResourceAllocationFormValue;

const ServiceLauncherModal: React.FC<ServiceLauncherProps> = ({
  extraP,
  endpointFrgmt = null,
  onRequestClose,
  ...modalProps
}) => {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [isOpenServiceValidationModal, setIsOpenServiceValidationModal] =
    useState(false);
  const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();
  const currentDomain = useCurrentDomainValue();

  const formRef = useRef<FormInstance<ServiceLauncherFormValue>>(null);

  const endpoint = useFragment(
    graphql`
      fragment ServiceLauncherModalFragment on Endpoint {
        endpoint_id
        desired_session_count
        resource_group
        resource_slots
        resource_opts
        cluster_mode
        cluster_size
        open_to_public
        model
        model_mount_destination @since(version: "24.03.4")
        model_definition_path @since(version: "24.03.4")
        extra_mounts @since(version: "24.03.4") {
          row_id
          host
          quota_scope_id
          name
          user
          user_email
          group
          group_name
          creator
          unmanaged_path
          usage_mode
          permission
          ownership_type
          max_files
          max_size
          created_at
          last_used
          num_files
          cur_size
          cloneable
          status
        }
        image_object @since(version: "23.09.9") {
          name
          humanized_name
          tag
          registry
          architecture
          is_local
          digest
          resource_limits {
            key
            min
            max
          }
          labels {
            key
            value
          }
          size_bytes
          supported_accelerators
        }
        name
      }
    `,
    endpointFrgmt,
  );

  console.log(endpoint);

  const checkManualImageAllowed = (
    isConfigAllowed = false,
    manualImageInput = '',
  ): boolean => {
    return (isConfigAllowed &&
      manualImageInput &&
      !_.isEmpty(manualImageInput)) as boolean;
  };

  const getImageInfoFromInputInEditing = (
    isManualImageEnabled = false,
    formInput: ServiceLauncherInput,
  ) => {
    return {
      image: {
        name: (isManualImageEnabled
          ? formInput.environments.manual?.split('@')[0]
          : formInput.environments.version.split('@')[0]) as string,
        architecture: (isManualImageEnabled
          ? formInput.environments.manual?.split('@')[1]
          : formInput.environments.image?.architecture) as string,
        registry: (isManualImageEnabled
          ? formInput.environments.manual?.split('/')[0]
          : formInput.environments.image?.registry) as string,
      },
    };
  };

  const getImageInfoFromInputInCreating = (
    isManualImageEnabled = false,
    formInput: ServiceLauncherInput,
  ) => {
    return {
      image: (isManualImageEnabled
        ? formInput.environments.manual?.split('@')[0]
        : `${formInput.environments.image?.registry}/${formInput.environments.image?.name}:${formInput.environments.image?.tag}`) as string,
      architecture: (isManualImageEnabled
        ? formInput.environments.manual?.split('@')[1]
        : formInput.environments.image?.architecture) as string,
    };
  };

  const legacyMutationToUpdateService = useTanMutation({
    mutationFn: (values: ServiceLauncherFormValue) => {
      const body = {
        to: values.desiredRoutingCount,
      };
      return baiSignedRequestWithPromise({
        method: 'POST',
        url: `/services/${endpoint?.endpoint_id}/scale`,
        body,
        client: baiClient,
      });
    },
  });

  const mutationToCreateService = useTanMutation<
    unknown,
    {
      message?: string;
    },
    ServiceLauncherFormValue
  >({
    mutationFn: (values) => {
      console.log(values);
      const body: ServiceCreateType = {
        name: values.serviceName,
        desired_session_count: values.desiredRoutingCount,
        ...getImageInfoFromInputInCreating(
          checkManualImageAllowed(
            baiClient._config.allow_manual_image_name_for_session,
            values.environments?.manual,
          ),
          values,
        ),
        group: baiClient.current_group, // current Project Group,
        domain: currentDomain, // current Domain Group,
        cluster_size: values.cluster_size,
        cluster_mode: values.cluster_mode,
        open_to_public: values.openToPublic,
        config: {
          model: values.vFolderName,
          model_version: 1, // FIXME: hardcoded. change it with option later
          model_mount_destination: values.modelMountDestination,
          model_definition_path: values.modelDefinitionPath,
          extra_mounts: values.mounts.reduce(
            (acc, key: string) => {
              acc[key] = {
                ...(values.vfoldersAliasMap[key] && {
                  mount_destination: values.vfoldersAliasMap[key],
                }),
                type: 'bind', // FIXME: hardcoded. change it with option later
              };
              return acc;
            },
            {} as Record<string, MountOptionType>,
          ),
          environ: {}, // FIXME: hardcoded. change it with option later
          scaling_group: values.resourceGroup,
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

  const [
    commitModifyEndpoint,
    // inInFlightCommitModifyEndpoint
  ] = useMutation<ServiceLauncherModalModifyMutation>(graphql`
    mutation ServiceLauncherModalModifyMutation(
      $endpoint_id: UUID!
      $props: ModifyEndpointInput!
    ) {
      modify_endpoint(endpoint_id: $endpoint_id, props: $props) {
        ok
        msg
        endpoint {
          endpoint_id
          desired_session_count
          resource_group
          resource_slots
          resource_opts
          cluster_mode
          cluster_size
          open_to_public
          model
          image_object @since(version: "23.09.9") {
            name
            humanized_name
            tag
            registry
            architecture
            is_local
            digest
            resource_limits {
              key
              min
              max
            }
            labels {
              key
              value
            }
            size_bytes
            supported_accelerators
          }
          name
          model_definition_path
          model_mount_destination
          extra_mounts @since(version: "24.03.4") {
            id
            host
            quota_scope_id
            name
            user
            user_email
            group
            group_name
            creator
            unmanaged_path
            usage_mode
            permission
            ownership_type
            max_files
            max_size
            created_at
            last_used
            num_files
            cur_size
            cloneable
            status
          }
        }
      }
    }
  `);

  // Apply any operation after clicking OK button
  const handleOk = () => {
    formRef.current
      ?.validateFields()
      .then((values) => {
        if (endpoint) {
          if (baiClient.supports('modify-endpoint')) {
            const mutationVariables = {
              endpoint_id: endpoint?.endpoint_id || '',
              props: {
                resource_slots: JSON.stringify({
                  cpu: values.resource.cpu,
                  mem: values.resource.mem,
                  ...(values.resource.accelerator > 0
                    ? {
                        [values.resource.acceleratorType]:
                          values.resource.accelerator,
                      }
                    : undefined),
                }),
                resource_opts: JSON.stringify({ shmem: values.resource.shmem }),
                // FIXME: temporally convert cluster mode string according to server-side type
                cluster_mode:
                  'single-node' === values.cluster_mode
                    ? 'SINGLE_NODE'
                    : 'MULTI_NODE',
                cluster_size: values.cluster_size,
                desired_session_count: values.desiredRoutingCount,
                ...getImageInfoFromInputInEditing(
                  checkManualImageAllowed(
                    baiClient._config.allow_manual_image_name_for_session,
                    values.environments?.manual,
                  ),
                  values,
                ),
                extra_mounts: values.mounts.map((vfolder) => {
                  return {
                    vfolder_id: vfolder,
                    ...(values.vfoldersAliasMap[vfolder] && {
                      mount_destination: values.vfoldersAliasMap[vfolder],
                    }),
                  };
                }),
                name: values.serviceName,
                resource_group: values.resourceGroup,
                model_definition_path: values.modelDefinitionPath,
              },
            };
            commitModifyEndpoint({
              variables: mutationVariables,
              onCompleted: (res, errors) => {
                if (!res.modify_endpoint?.ok) {
                  message.error(res.modify_endpoint?.msg);
                  return;
                }
                if (errors && errors?.length > 0) {
                  const errorMsgList = errors.map((error) => error.message);
                  for (let error of errorMsgList) {
                    message.error(error, 2.5);
                  }
                } else {
                  const updatedEndpoint = res.modify_endpoint?.endpoint;
                  message.success(
                    t('modelService.ServiceUpdated', {
                      name: updatedEndpoint?.name,
                    }),
                  );
                  onRequestClose(true);
                }
              },
              onError: (error) => {
                if (error.message) {
                  message.error(error.message);
                } else {
                  message.error(t('modelService.FailedToUpdateService'));
                }
              },
            });
          } else {
            legacyMutationToUpdateService.mutate(values, {
              onSuccess: () => {
                message.success(
                  t('modelService.ServiceUpdated', {
                    name: endpoint.name, // FIXME: temporally get name from endpoint, not input value
                  }),
                );
                onRequestClose(true);
              },
              onError: (error) => {
                console.log(error);
                message.error(t('modelService.FailedToUpdateService'));
              },
            });
          }
        } else {
          // create service
          mutationToCreateService.mutate(values, {
            onSuccess: () => {
              // FIXME: temporally refer to mutate input to message
              message.success(
                t('modelService.ServiceCreated', { name: values.serviceName }),
              );
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
                if (endpoint) {
                  message.error(t('modelService.FailedToUpdateService'));
                } else {
                  message.error(t('modelService.FailedToStartService'));
                }
              }
            },
          });
        }
      })
      .catch((err: any) => {
        // error on input
        if (err.errorFields?.length > 0) {
          err.errorFields.forEach((error: any) => {
            message.error(error.errors);
          });
        } else if (err.message) {
          message.error(err.message);
        } else {
          message.error(t('modelService.FormValidationFailed'));
        }
      });
  };

  // Apply any operation after clicking Cancel or close button button
  const handleCancel = () => {
    formRef.current?.resetFields();
    onRequestClose();
  };

  const [validateServiceData, setValidateServiceData] = useState<any>();

  const getAIAcceleratorWithStringifiedKey = (resourceSlot: any) => {
    if (Object.keys(resourceSlot).length <= 0) {
      return undefined;
    }
    const keyName: string = Object.keys(resourceSlot)[0];
    return {
      acceleratorType: keyName,
      // FIXME: temporally convert to number if the typeof accelerator is string
      accelerator:
        typeof resourceSlot[keyName] === 'string'
          ? keyName === 'cuda.shares'
            ? parseFloat(resourceSlot[keyName])
            : parseInt(resourceSlot[keyName])
          : resourceSlot[keyName],
    };
  };

  return (
    <>
      <BAIModal
        title={
          endpoint
            ? t('modelService.EditModelService')
            : t('modelService.StartNewServing')
        }
        width={700}
        destroyOnClose
        onOk={handleOk}
        onCancel={handleCancel}
        maskClosable={false}
        confirmLoading={mutationToCreateService.isLoading}
        footer={() => (
          <Flex direction="row" justify="between" align="end" gap={'xs'}>
            <Flex>
              {baiClient.supports('model-service-validation') ? (
                <Button
                  onClick={() => {
                    formRef.current
                      ?.validateFields()
                      .then((values) => {
                        // FIXME: manually insert vfolderName when validation
                        setValidateServiceData({
                          ...values,
                          vFolderName: (endpoint?.model ??
                            formRef.current?.getFieldValue(
                              'vFolderName',
                            )) as string,
                        });
                        setIsOpenServiceValidationModal(true);
                      })
                      .catch((err) => {
                        console.log(err.message);
                        message.error(t('modelService.FormValidationFailed'));
                      });
                  }}
                >
                  {t('modelService.Validate')}
                </Button>
              ) : null}
            </Flex>
            <Flex gap={'sm'}>
              <Button onClick={handleCancel}>{t('button.Cancel')}</Button>

              <Button type="primary" onClick={handleOk}>
                {endpoint ? t('button.Update') : t('button.Create')}
              </Button>
            </Flex>
          </Flex>
        )}
        {...modalProps}
      >
        <Suspense fallback={<FlexActivityIndicator />}>
          <Form
            ref={formRef}
            disabled={mutationToCreateService.isLoading}
            preserve={false}
            layout="vertical"
            labelCol={{ span: 12 }}
            initialValues={
              endpoint
                ? {
                    serviceName: endpoint?.name,
                    resourceGroup: endpoint?.resource_group,
                    desiredRoutingCount: endpoint?.desired_session_count || 0,
                    // FIXME: memory doesn't applied to resource allocation
                    resource: {
                      cpu: parseInt(JSON.parse(endpoint?.resource_slots)?.cpu),
                      mem: iSizeToSize(
                        JSON.parse(endpoint?.resource_slots)?.mem + 'b',
                        'g',
                        3,
                        true,
                      )?.numberUnit,
                      shmem: iSizeToSize(
                        JSON.parse(endpoint?.resource_opts)?.shmem ||
                          AUTOMATIC_DEFAULT_SHMEM,
                        'g',
                        3,
                        true,
                      )?.numberUnit,
                      ...getAIAcceleratorWithStringifiedKey(
                        _.omit(JSON.parse(endpoint?.resource_slots), [
                          'cpu',
                          'mem',
                        ]),
                      ),
                    },
                    cluster_mode:
                      endpoint?.cluster_mode === 'MULTI_NODE'
                        ? 'multi-node'
                        : 'single-node',
                    cluster_size: endpoint?.cluster_size,
                    openToPublic: endpoint?.open_to_public,
                    environments: {
                      environment: endpoint?.image_object?.name,
                      version: `${endpoint?.image_object?.registry}/${endpoint?.image_object?.name}:${endpoint?.image_object?.tag}@${endpoint?.image_object?.architecture}`,
                      image: endpoint?.image_object,
                    },
                    vFolderName: endpoint?.model_mount_destination,
                    mounts: _.map(endpoint?.extra_mounts, (item) =>
                      item?.row_id?.replaceAll('-', ''),
                    ),
                    modelMountDestination: endpoint?.model_mount_destination,
                    modelDefinitionPath: endpoint?.model_definition_path,
                    // TODO: set mounts alias map according to extra_mounts if possible
                  }
                : {
                    desiredRoutingCount: 1,
                    ...RESOURCE_ALLOCATION_INITIAL_FORM_VALUES,
                    ...(baiClient._config?.default_session_environment && {
                      environments: {
                        environment:
                          baiClient._config?.default_session_environment,
                      },
                    }),
                  }
            }
            requiredMark="optional"
          >
            {(baiClient.supports('modify-endpoint') || !endpoint) && (
              <>
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
                  <Input disabled={!!endpoint} />
                </Form.Item>
                <Form.Item
                  name="openToPublic"
                  label={t('modelService.OpenToPublic')}
                  valuePropName="checked"
                >
                  <Switch disabled={!!endpoint}></Switch>
                </Form.Item>
                {!endpoint ? (
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
                      filter={(vf) =>
                        vf.usage_mode === 'model' && vf.status === 'ready'
                      }
                      autoSelectDefault
                      disabled={!!endpoint}
                    />
                  </Form.Item>
                ) : (
                  endpoint?.model && (
                    <Form.Item
                      name={'vFolderName'}
                      label={t('session.launcher.ModelStorageToMount')}
                      required
                    >
                      <Suspense fallback={<Skeleton.Input active />}>
                        <VFolderLazyView uuid={endpoint?.model} />
                      </Suspense>
                    </Form.Item>
                  )
                )}
                <Flex
                  direction="row"
                  gap={'xxs'}
                  align="stretch"
                  justify="between"
                >
                  <Form.Item
                    name={'modelMountDestination'}
                    label={t('modelService.ModelMountDestination')}
                    style={{ width: '50%' }}
                    labelCol={{ style: { width: 400 } }}
                  >
                    <Input
                      allowClear
                      placeholder={'/models'}
                      disabled={endpoint ? true : false}
                    />
                  </Form.Item>
                  <MinusOutlined
                    style={{
                      fontSize: token.fontSizeXL,
                      color: token.colorTextDisabled,
                    }}
                    rotate={290}
                  />
                  <Form.Item
                    name={'modelDefinitionPath'}
                    label={t('modelService.ModelDefinitionPath')}
                    style={{ width: '50%' }}
                    labelCol={{ style: { width: 300 } }}
                  >
                    <Input
                      allowClear
                      placeholder={
                        endpoint?.model_definition_path
                          ? endpoint?.model_definition_path
                          : 'model-definition.yaml'
                      }
                    />
                  </Form.Item>
                </Flex>
                <VFolderTableFormItem
                  rowKey={'id'}
                  label={t('modelService.AdditionalMounts')}
                  filter={(vf) =>
                    vf.name !== formRef.current?.getFieldValue('vFolderName') &&
                    vf.status === 'ready' &&
                    vf.usage_mode !== 'model'
                  }
                  tableProps={{
                    size: 'small',
                  }}
                />
              </>
            )}
            <Form.Item
              label={t('modelService.DesiredRoutingCount')}
              name="desiredRoutingCount"
              rules={[
                {
                  required: true,
                  min: 0,
                  max: 10,
                  type: 'number',
                },
              ]}
            >
              <InputNumberWithSlider
                min={0}
                max={10}
                inputNumberProps={{
                  //TODO: change unit based on resource limit
                  addonAfter: '#',
                }}
                step={1}
              />
            </Form.Item>
            {(baiClient.supports('modify-endpoint') || !endpoint) && (
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
                <ResourceAllocationFormItems />
              </Card>
            )}
          </Form>
        </Suspense>
      </BAIModal>
      {baiClient.supports('model-service-validation') ? (
        <BAIModal
          zIndex={DEFAULT_BAI_MODAL_Z_INDEX + 1}
          width={1000}
          title={t('modelService.ValidationInfo')}
          open={isOpenServiceValidationModal}
          destroyOnClose
          onCancel={() => {
            setIsOpenServiceValidationModal(!isOpenServiceValidationModal);
          }}
          okButtonProps={{
            style: { display: 'none' },
          }}
          cancelText={t('button.Close')}
          maskClosable={false}
        >
          <ServiceValidationView serviceData={validateServiceData} />
        </BAIModal>
      ) : null}
    </>
  );
};

export default ServiceLauncherModal;
