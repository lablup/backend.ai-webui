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
import BAIModal, { BAIModalProps } from './BAIModal';
import Flex from './Flex';
import FlexActivityIndicator from './FlexActivityIndicator';
import ImageEnvironmentSelectFormItems, {
  ImageEnvironmentFormInput,
} from './ImageEnvironmentSelectFormItems';
import InputNumberWithSlider from './InputNumberWithSlider';
import SliderInputFormItem from './SliderInputFormItem';
import VFolderSelect from './VFolderSelect';
import { ServiceLauncherModalFragment$key } from './__generated__/ServiceLauncherModalFragment.graphql';
import { ServiceLauncherModalModifyMutation } from './__generated__/ServiceLauncherModalModifyMutation.graphql';
import { Card, Form, Input, theme, Switch, message, Button, Space } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useFragment, useMutation } from 'react-relay';

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

interface ServiceLauncherProps extends Omit<BAIModalProps, 'onOK'> {
  endpointFrgmt?: ServiceLauncherModalFragment$key | null;
  extraP?: boolean;
  onRequestClose: (success?: boolean) => void;
}
interface ServiceLauncherInput extends ImageEnvironmentFormInput {
  serviceName: string;
  vFolderName: string;
  desiredRoutingCount: number;
  openToPublic: boolean;
}

type ServiceLauncherFormValue = ServiceLauncherInput &
  ImageEnvironmentFormInput &
  ResourceAllocationFormValue;

const ServiceLauncherModal: React.FC<ServiceLauncherProps> = ({
  extraP,
  endpointFrgmt = null,
  onRequestClose,
  ...modalProps
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();
  const currentDomain = useCurrentDomainValue();
  const [form] = Form.useForm<ServiceLauncherFormValue>();
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
        image
        image_row {
          name
          humanized_name
          tag
          registry
          architecture
          supported_accelerators
          digest
          installed
          resource_limits {
            key
            min
            max
          }
          labels {
            key
            value
          }
        }
        architecture
        name
      }
    `,
    endpointFrgmt,
  );

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

  const mutationToCreateService = useTanMutation<
    unknown,
    {
      message?: string;
    },
    ServiceLauncherFormValue
  >({
    mutationFn: (values) => {
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
          model_mount_destination: '/models', // FIXME: hardcoded. change it with option later
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
          image
          architecture
          name
        }
      }
    }
  `);

  // Apply any operation after clicking OK button
  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        if (endpoint) {
          const mutationVariables = {
            endpoint_id: endpoint?.endpoint_id || '',
            props: {
              resource_slots: JSON.stringify({
                cpu: values.resource.cpu.toString(),
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
              name: values.serviceName,
              resource_group: values.resourceGroup,
            },
          };
          commitModifyEndpoint({
            variables: mutationVariables,
            onCompleted: (res, error) => {
              const updatedEndpoint = res.modify_endpoint?.endpoint;
              message.success(
                t('modelService.ServiceUpdated', {
                  name: updatedEndpoint?.name,
                }),
              );
              if (error) {
                message.error(t('dialog.ErrorOccurred'));
              } else {
                onRequestClose(true);
              }
            },
            onError: (error) => {
              message.error(t('dialog.ErrorOccurred'));
            },
          });
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
    form.resetFields();
    onRequestClose();
  };

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
    <BAIModal
      title={
        endpoint
          ? t('modelService.EditModelService')
          : t('modelService.StartNewServing')
      }
      destroyOnClose
      maskClosable={false}
      footer={() => (
        <Flex direction="row" justify="end" align="end">
          <Space size="small">
            <Button onClick={handleCancel}>{t('button.Cancel')}</Button>
            <Button type="primary" onClick={handleOk}>
              {endpoint ? t('button.Update') : t('button.Create')}
            </Button>
          </Space>
        </Flex>
      )}
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
                    environment: endpoint?.image_row?.name,
                    version: `${endpoint?.image}@${endpoint?.image_row?.architecture}`,
                    image: endpoint?.image_row,
                  },
                }
              : {
                  desiredRoutingCount: 1,
                  ...RESOURCE_ALLOCATION_INITIAL_FORM_VALUES,
                }
          }
          requiredMark="optional"
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
            <Input disabled={endpoint ? true : false} />
          </Form.Item>
          <Form.Item
            name="openToPublic"
            label={t('modelService.OpenToPublic')}
            valuePropName="checked"
          >
            <Switch disabled={endpoint ? true : false}></Switch>
          </Form.Item>
          {/* <VFolderTableFromItem /> */}
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
              disabled={endpoint ? true : false}
            />
          </Form.Item>
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
        </Form>
      </Suspense>
    </BAIModal>
  );
};

export default ServiceLauncherModal;
