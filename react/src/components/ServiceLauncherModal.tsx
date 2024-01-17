import ResourceAllocationFormItems, {
  ResourceAllocationFormValue,
  RESOURCE_ALLOCATION_INITIAL_FORM_VALUES,
} from '../components/ResourceAllocationFormItems';
import { baiSignedRequestWithPromise, compareNumberWithUnits } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentDomainValue } from '../hooks';
import { useTanMutation } from '../hooks/reactQueryAlias';
import BAIModal, { BAIModalProps } from './BAIModal';
import Flex from './Flex';
import FlexActivityIndicator from './FlexActivityIndicator';
import ImageEnvironmentSelectFormItems, {
  ImageEnvironmentFormInput,
} from './ImageEnvironmentSelectFormItems';
import ResourceGroupSelect from './ResourceGroupSelect';
import SliderInputFormItem from './SliderInputFormItem';
import VFolderSelect from './VFolderSelect';
import ValidationStatusTag from './ValidationStatusTag';
import { AnsiUp } from 'ansi_up';
import type { CollapseProps } from 'antd';
import {
  Button,
  Card,
  Collapse,
  Descriptions,
  Form,
  Input,
  theme,
  Switch,
  Tag,
  message,
} from 'antd';
import _ from 'lodash';
import React, { useState, Suspense } from 'react';
import { useTranslation } from 'react-i18next';

// TODO: set initial form values for later use
// const INITIAL_FORM_VALUES: ServiceLauncherFormValue = {
// }

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
  const [form] = Form.useForm<ServiceLauncherFormValue>();
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
        arch: values.environments.image?.architecture as string,
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

  const mutationToCreateService = useTanMutation<
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
        arch: values.environments.image?.architecture as string,
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

  // Apply any operation after clicking OK button
  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
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

  // Apply any operation after clicking Cancel or close button button
  const handleCancel = () => {
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
    form
      .validateFields()
      .then((values) => {
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
        <Form
          disabled={mutationToCreateService.isLoading}
          form={form}
          preserve={false}
          layout="vertical"
          labelCol={{ span: 12 }}
          initialValues={{
            desiredRoutingCount: 1,
            ...RESOURCE_ALLOCATION_INITIAL_FORM_VALUES,
          }}
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
            />
          </Form.Item>
          <SliderInputFormItem
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
            <ResourceAllocationFormItems />
          </Card>
        </Form>
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

  return (
    <BAIModal
      title={t('modelService.StartNewServing')}
      onOk={handleOk}
      onCancel={handleCancel}
      destroyOnClose={true}
      maskClosable={false}
      confirmLoading={mutationToCreateService.isLoading}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          {t('modelService.Cancel')}
        </Button>,
        <Button key="ok" type="primary" onClick={handleOk}>
          {t('modelService.StartService')}
        </Button>,
      ]}
      {...modalProps}
    >
      <Suspense fallback={<FlexActivityIndicator />}>
        <Collapse defaultActiveKey={'1'} items={getItems()} accordion />
      </Suspense>
    </BAIModal>
  );
};

export default ServiceLauncherModal;
