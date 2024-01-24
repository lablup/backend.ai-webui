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
import { Card, Form, Input, theme, Switch, message, Button } from 'antd';
import _ from 'lodash';
import React, { Suspense } from 'react';
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
  const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();
  const currentDomain = useCurrentDomainValue();
  const [form] = Form.useForm<ServiceLauncherFormValue>();

  const mutationToCreateService = useTanMutation<
    unknown,
    {
      message?: string;
    },
    ServiceLauncherFormValue
  >({
    mutationFn: (values) => {
      const image: string =
        baiClient._config.allow_manual_image_name_for_session &&
        values.environments?.manual &&
        !_.isEmpty(values.environments.manual)
          ? values.environments.manual
          : `${values.environments.image?.registry}/${values.environments.image?.name}:${values.environments.image?.tag}`;
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

  // Apply any operation after clicking OK button
  const handleOk = () => {
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
    onRequestClose();
  };

  return (
    <BAIModal
      title={t('modelService.StartNewServing')}
      destroyOnClose={true}
      maskClosable={false}
      footer={() => (
        <Flex direction="row" justify="end">
          <Button onClick={handleCancel}>{t('button.Cancel')}</Button>
          <Button type="primary" onClick={handleOk}>
            {t('button.Create')}
          </Button>
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
          initialValues={{
            desiredRoutingCount: 1,
            ...RESOURCE_ALLOCATION_INITIAL_FORM_VALUES,
          }}
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
      </Suspense>
    </BAIModal>
  );
};

export default ServiceLauncherModal;
