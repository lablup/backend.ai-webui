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
import VFolderLazyView from './VFolderLazyView';
import VFolderSelect from './VFolderSelect';
import ValidationStatusTag from './ValidationStatusTag';
import { ServiceLauncherModalFragment$key } from './__generated__/ServiceLauncherModalFragment.graphql';
import { ServiceLauncherModalModifyMutation } from './__generated__/ServiceLauncherModalModifyMutation.graphql';
import { AnsiUp } from 'ansi_up';
import type { CollapseProps } from 'antd';
import {
  Button,
  Collapse,
  Card,
  Form,
  Input,
  theme,
  Switch,
  Tag,
  message,
  Space,
  FormInstance,
  Skeleton,
} from 'antd';
import graphql from 'babel-plugin-relay/macro';
import exp from 'constants';
import _ from 'lodash';
import React, { useState, Suspense, useRef } from 'react';
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
  'hyperaccel-lpu.device'?: number | string;
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
  const [validationStatus, setValidationStatus] = useState('');
  const [validationTime, setValidationTime] = useState('Before validation');
  const [containerLogSummary, setContainerLogSummary] = useState('loading...');
  const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();
  const currentDomain = useCurrentDomainValue();
  const mutationsToValidateService = useTanMutation<
    unknown,
    {
      message?: string;
    },
    ServiceLauncherFormValue
  >({
    mutationFn: (values) => {
      const image: string = `${values.environments.image?.registry}/${values.environments.image?.name}:${values.environments.image?.tag}`;
      const body: ServiceCreateType = {
        name: values.serviceName,
        desired_session_count: values.desiredRoutingCount,
        image: image,
        architecture: values.environments.image?.architecture as string,
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
                    values.resource.accelerator,
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
        url: '/services/_/try',
        body,
        client: baiClient,
      });
    },
  });

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

  const validateButtonInHeader = () => (
    <Flex direction="row" justify="between" align="stretch">
      <Button key="validate" type="primary" onClick={(e) => handleValidate(e)}>
        {t('modelService.Validate')}
      </Button>
    </Flex>
  );

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
        }
      }
    }
  `);

  // Apply any operation after clicking OK button
  const handleOk = () => {
    formRef.current?.validateFields().then((values) => {
      mutationToCreateService.mutate(values, {
        onSuccess: (resp) => {
          onRequestClose(true);
        },
        onError: (error) => {
          if (error?.message) {
            message.error(
              _.truncate(error?.message, {
                length: 200,
              }),
            );
          }
        },
      });
    });
  };

  // Apply any operation after clicking Cancel or close button button
  const handleCancel = () => {
    formRef.current?.resetFields();
    onRequestClose();
  };

  async function getLogs(sessionId: string) {
    return baiClient
      .get_logs(sessionId, baiClient._config.accessKey, 0)
      .then((req: any) => {
        const ansi_up = new AnsiUp();
        const logs = ansi_up.ansi_to_html(req.result.logs);
        return logs;
      });
  }

  // Apply any operation after clicking Validate button
  const handleValidate = (event: any) => {
    const validationDateTime = new Date().toUTCString();
    formRef.current
      ?.validateFields()
      .then((values) => {
        // FIXME: temporally insert vfolderName when validation
        values.vFolderName = endpoint?.model as string;
        mutationsToValidateService.mutate(values, {
          onSuccess: (data: any) => {
            setValidationTime(validationDateTime);
            setContainerLogSummary('loading...');
            const response = data;
            const sse: EventSource =
              baiClient.maintenance.attach_background_task(response['task_id']);
            sse.addEventListener('bgtask_updated', async (e) => {
              const data = JSON.parse(e['data']);
              const msg = JSON.parse(data.message);
              if (
                ['session_started', 'session_terminated'].includes(msg.event)
              ) {
                const logs = await getLogs(msg.session_id);
                setContainerLogSummary(logs);
                // temporally close sse manually when session is terminated
                if (msg.event === 'session_terminated') {
                  sse.close();
                  return;
                }
              }
              setValidationStatus('processing');
            });
            sse.addEventListener('bgtask_done', async (e) => {
              setValidationStatus('finished');
              sse.close();
            });
            sse.addEventListener('bgtask_failed', async (e) => {
              const data = JSON.parse(e['data']);
              const msg = JSON.parse(data.message);
              const logs = await getLogs(msg.session_id);
              setContainerLogSummary(logs);
              setValidationStatus('error');
              sse.close();
              throw new Error(e['data']);
            });
            sse.addEventListener('bgtask_cancelled', async (e) => {
              setValidationStatus('error');
              sse.close();
              throw new Error(e['data']);
            });
          },
          onError: (error) => {
            if (error?.message) {
              message.error(
                _.truncate(error?.message, {
                  length: 200,
                }),
              );
            } else {
              message.error(t('modelService.FormValidationFailed'));
            }
          },
        });
      })
      .catch((err) => {
        console.log(err.message);
        message.error(t('modelService.FormValidationFailed'));
      });
  };

  const getItems: () => CollapseProps['items'] = () => [
    {
      key: '1',
      label: t('modelService.ServiceInfo'),
      children: (
        <>
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
                      disabled={endpoint ? true : false}
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
        </>
      ),
    },
    {
      key: '2',
      label: t('modelService.ValidationInfo'),
      extra: validateButtonInHeader(),
      children: (
        <>
          <Flex direction="row" justify="between" align="center">
            <h3>{t('modelService.Result')}</h3>
            <ValidationStatusTag
              status={validationStatus}
            ></ValidationStatusTag>
          </Flex>
          <Flex direction="row" justify="between" align="center">
            <h3>{t('modelService.TimeStamp')}</h3>
            <Tag>{validationTime}</Tag>
          </Flex>
          <h3>{t('modelService.SeeContainerLogs')}</h3>
          <Flex
            direction="column"
            justify="start"
            align="start"
            style={{
              overflowX: 'scroll',
              color: 'white',
              backgroundColor: 'black',
              padding: 10,
              borderRadius: 5,
            }}
          >
            <pre dangerouslySetInnerHTML={{ __html: containerLogSummary }} />
          </Flex>
        </>
      ),
    },
  ];

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
      onOk={handleOk}
      onCancel={handleCancel}
      maskClosable={false}
      confirmLoading={mutationToCreateService.isLoading}
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
      {...modalProps}
    >
      <Suspense fallback={<FlexActivityIndicator />}>
        <Collapse defaultActiveKey={'1'} items={getItems()} accordion />
      </Suspense>
    </BAIModal>
  );
};

export default ServiceLauncherModal;
