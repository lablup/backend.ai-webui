import { ServiceLauncherPageContentFragment$key } from '../__generated__/ServiceLauncherPageContentFragment.graphql';
import { ServiceLauncherPageContentModifyMutation } from '../__generated__/ServiceLauncherPageContentModifyMutation.graphql';
import { ServiceLauncherPageContent_UserInfoQuery } from '../__generated__/ServiceLauncherPageContent_UserInfoQuery.graphql';
import { ServiceLauncherPageContent_UserResourcePolicyQuery } from '../__generated__/ServiceLauncherPageContent_UserResourcePolicyQuery.graphql';
import {
  baiSignedRequestWithPromise,
  compareNumberWithUnits,
  convertToBinaryUnit,
  useBaiSignedRequestWithPromise,
} from '../helper';
import {
  useCurrentDomainValue,
  useSuspendedBackendaiClient,
  useWebUINavigate,
} from '../hooks';
import { KnownAcceleratorResourceSlotName } from '../hooks/backendai';
import { useSuspenseTanQuery, useTanMutation } from '../hooks/reactQueryAlias';
import { useCurrentResourceGroupState } from '../hooks/useCurrentProject';
import { useValidateServiceName } from '../hooks/useValidateServiceName';
import EnvVarFormList, {
  sanitizeSensitiveEnv,
  EnvVarFormListValue,
} from './EnvVarFormList';
import ImageEnvironmentSelectFormItems, {
  ImageEnvironmentFormInput,
} from './ImageEnvironmentSelectFormItems';
import InputNumberWithSlider from './InputNumberWithSlider';
import ResourceNumber from './ResourceNumber';
import ResourceAllocationFormItems, {
  AUTOMATIC_DEFAULT_SHMEM,
  RESOURCE_ALLOCATION_INITIAL_FORM_VALUES,
  ResourceAllocationFormValue,
} from './SessionFormItems/ResourceAllocationFormItems';
import VFolderLazyView from './VFolderLazyView';
import VFolderSelect from './VFolderSelect';
import VFolderTableFormItem from './VFolderTableFormItem';
import { MinusOutlined } from '@ant-design/icons';
import { useDebounceFn } from 'ahooks';
import {
  App,
  Button,
  Card,
  Form,
  Input,
  Skeleton,
  Select,
  Switch,
  theme,
  Tooltip,
  Tag,
  Alert,
} from 'antd';
import {
  BAIModal,
  BAIFlex,
  ESMClientErrorResponse,
  filterOutNullAndUndefined,
  useErrorMessageResolver,
} from 'backend.ai-ui';
import _ from 'lodash';
import React, { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  graphql,
  useFragment,
  useLazyLoadQuery,
  useMutation,
} from 'react-relay';
import {
  JsonParam,
  StringParam,
  useQueryParams,
  withDefault,
} from 'use-query-params';

const ServiceValidationView = React.lazy(
  () => import('./ServiceValidationView'),
);

type ClusterMode = 'single-node' | 'multi-node';

interface ServiceCreateConfigResourceOptsType {
  shmem?: number | string;
}

type ServiceCreateConfigResourceType = {
  cpu: number | string;
  mem: string;
} & {
  [key in KnownAcceleratorResourceSlotName]?: number | string;
};
export interface MountOptionType {
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
  desired_session_count?: number;
  replicas?: number;
  image: string;
  runtime_variant: string;
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
interface ServiceLauncherInput extends ImageEnvironmentFormInput {
  serviceName: string;
  vFolderID: string;
  replicas: number;
  openToPublic: boolean;
  modelMountDestination: string;
  modelDefinitionPath: string;
  mount_id_map: Record<string, string>;
  mount_ids?: Array<string>;
  envvars: EnvVarFormListValue[];
  runtimeVariant: string;
}

export type ServiceLauncherFormValue = ServiceLauncherInput &
  ImageEnvironmentFormInput &
  ResourceAllocationFormValue;

interface ServiceLauncherPageContentProps {
  endpointFrgmt?: ServiceLauncherPageContentFragment$key | null;
}

const ServiceLauncherPageContent: React.FC<ServiceLauncherPageContentProps> = ({
  endpointFrgmt = null,
}) => {
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const { t } = useTranslation();

  // Setup query parameters for URL synchronization
  const FormValuesParam = withDefault(JsonParam, {});
  const [{ model, formValues: formValuesFromQueryParams }, setQuery] =
    useQueryParams({
      model: StringParam,
      formValues: FormValuesParam,
    });

  const webuiNavigate = useWebUINavigate();
  const baiClient = useSuspendedBackendaiClient();
  const baiRequestWithPromise = useBaiSignedRequestWithPromise();
  const currentDomain = useCurrentDomainValue();
  const validationRules = useValidateServiceName();
  const [isOpenServiceValidationModal, setIsOpenServiceValidationModal] =
    useState(false);

  const [form] = Form.useForm<ServiceLauncherFormValue>();
  const [wantToChangeResource, setWantToChangeResource] = useState(false);
  const [currentGlobalResourceGroup, setCurrentGlobalResourceGroup] =
    useCurrentResourceGroupState();

  const { getErrorMessage } = useErrorMessageResolver();

  const endpoint = useFragment(
    graphql`
      fragment ServiceLauncherPageContentFragment on Endpoint {
        endpoint_id
        desired_session_count @deprecatedSince(version: "24.12.0")
        replicas @since(version: "24.12.0")
        resource_group
        resource_slots
        resource_opts
        cluster_mode
        cluster_size
        open_to_public
        model
        model_mount_destination @since(version: "24.03.4")
        model_definition_path @since(version: "24.03.4")
        environ
        runtime_variant @since(version: "24.03.5") {
          name
          human_readable_name
        }
        extra_mounts @since(version: "24.03.4") {
          row_id
          name
        }
        image_object @since(version: "23.09.9") {
          name @deprecatedSince(version: "24.12.0")
          namespace @since(version: "24.12.0")
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

  const { data: availableRuntimes } = useSuspenseTanQuery<{
    runtimes: { name: string; human_readable_name: string }[];
  }>({
    queryKey: ['baiClient.modelService.runtime.list'],
    queryFn: () => {
      return baiRequestWithPromise({
        method: 'GET',
        url: `/services/_/runtimes`,
      });
    },
    staleTime: 1000,
  });

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
        : formInput.environments.version?.split('@')[0]) as string,
      architecture: (isManualImageEnabled
        ? formInput.environments.manual?.split('@')[1]
        : formInput.environments.image?.architecture) as string,
    };
  };

  const mutationToCreateService = useTanMutation<
    unknown,
    ESMClientErrorResponse | undefined,
    ServiceLauncherFormValue
  >({
    mutationFn: (values) => {
      const environ: { [key: string]: string } = {};
      if (values.envvars) {
        values.envvars.forEach((v) => (environ[v.variable] = v.value));
      }
      const body: ServiceCreateType = {
        name: values.serviceName,
        // REST API does not support `replicas` field. To use `replicas` field, we need `create_endpoint` mutation.
        desired_session_count: values.replicas,
        ...getImageInfoFromInputInCreating(
          checkManualImageAllowed(
            baiClient._config.allow_manual_image_name_for_session,
            values.environments?.manual,
          ),
          values,
        ),
        runtime_variant: values.runtimeVariant,
        group: baiClient.current_group, // current Project Group,
        domain: currentDomain, // current Domain Group,
        cluster_size: values.cluster_size,
        cluster_mode: values.cluster_mode,
        open_to_public: values.openToPublic,
        config: {
          model: values.vFolderID,
          model_version: 1, // FIXME: hardcoded. change it with option later
          extra_mounts: _.reduce(
            values.mount_ids,
            (acc, key: string) => {
              acc[key] = {
                ...(values.mount_id_map[key] && {
                  mount_destination: values.mount_id_map[key],
                }),
                type: 'bind', // FIXME: hardcoded. change it with option later
              };
              return acc;
            },
            {} as Record<string, MountOptionType>,
          ),
          model_definition_path: values.modelDefinitionPath,
          model_mount_destination:
            values.modelMountDestination !== ''
              ? values.modelMountDestination
              : '/models',
          environ, // FIXME: hardcoded. change it with option later
          scaling_group: values.resourceGroup,
          resources: {
            // FIXME: manually convert to string since server-side only allows [str,str] tuple
            cpu: values.resource.cpu?.toString(),
            mem: values.resource.mem,
            ...(values.resource.accelerator > 0
              ? {
                  [values.resource.acceleratorType]:
                    // FIXME: manually convert to string since server-side only allows [str,str] tuple
                    values.resource.accelerator?.toString(),
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

  const { user } = useLazyLoadQuery<ServiceLauncherPageContent_UserInfoQuery>(
    graphql`
      query ServiceLauncherPageContent_UserInfoQuery(
        $domain_name: String
        $email: String
      ) {
        user(domain_name: $domain_name, email: $email) {
          id
          # https://github.com/lablup/backend.ai/pull/1354
          resource_policy @since(version: "23.09.0")
        }
      }
    `,
    {
      domain_name: useCurrentDomainValue(),
      email: baiClient?.email,
    },
  );

  const { user_resource_policy } =
    useLazyLoadQuery<ServiceLauncherPageContent_UserResourcePolicyQuery>(
      graphql`
        query ServiceLauncherPageContent_UserResourcePolicyQuery(
          $user_RP_name: String
        ) {
          user_resource_policy(name: $user_RP_name) @since(version: "23.09.6") {
            max_session_count_per_model_session
          }
        }
      `,
      {
        user_RP_name: user?.resource_policy,
      },
    );

  const [
    commitModifyEndpoint,
    // inInFlightCommitModifyEndpoint
  ] = useMutation<ServiceLauncherPageContentModifyMutation>(graphql`
    mutation ServiceLauncherPageContentModifyMutation(
      $endpoint_id: UUID!
      $props: ModifyEndpointInput!
    ) {
      modify_endpoint(endpoint_id: $endpoint_id, props: $props) {
        ok
        msg
        endpoint {
          endpoint_id
          desired_session_count @deprecatedSince(version: "24.12.0")
          replicas @since(version: "24.12.0")
          resource_group
          resource_slots
          resource_opts
          cluster_mode
          cluster_size
          open_to_public
          model
          image_object @since(version: "23.09.9") {
            name @deprecatedSince(version: "24.12.0")
            namespace @since(version: "24.12.0")
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
          model_definition_path @since(version: "24.03.4")
          model_mount_destination @since(version: "24.03.4")
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
          runtime_variant @since(version: "24.03.5") {
            name
            human_readable_name
          }
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
          const mutationVariables: ServiceLauncherPageContentModifyMutation['variables'] =
            {
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
                resource_opts: JSON.stringify({
                  shmem: values.resource.shmem,
                }),
                // FIXME: temporarily convert cluster mode string according to server-side type
                cluster_mode:
                  'single-node' === values.cluster_mode
                    ? 'SINGLE_NODE'
                    : 'MULTI_NODE',
                cluster_size: values.cluster_size,
                ...(baiClient.supports('replicas')
                  ? { replicas: values.replicas }
                  : {
                      desired_session_count: values.replicas,
                    }),
                ...getImageInfoFromInputInEditing(
                  checkManualImageAllowed(
                    baiClient._config.allow_manual_image_name_for_session,
                    values.environments?.manual,
                  ),
                  values,
                ),
                extra_mounts: _.map(values.mount_ids, (vfolder) => {
                  return {
                    vfolder_id: vfolder,
                    ...(values.mount_id_map[vfolder] && {
                      mount_destination: values.mount_id_map[vfolder],
                    }),
                  };
                }),
                name: values.serviceName,
                resource_group: values.resourceGroup,
                model_definition_path: values.modelDefinitionPath,
                runtime_variant: values.runtimeVariant,
              },
            };
          const newEnvirons: { [key: string]: string } = {};
          if (values.envvars) {
            values.envvars.forEach((v) => (newEnvirons[v.variable] = v.value));
          }
          mutationVariables.props.environ = JSON.stringify(newEnvirons);
          commitModifyEndpoint({
            variables: mutationVariables,
            onCompleted: (res, errors) => {
              if (res.modify_endpoint?.ok) {
                const updatedEndpoint = res.modify_endpoint?.endpoint;
                message.success(
                  t('modelService.ServiceUpdated', {
                    name: updatedEndpoint?.name,
                  }),
                );
                webuiNavigate(`/serving/${endpoint?.endpoint_id}`);
                return;
              }

              if (res.modify_endpoint?.msg) {
                message.error(res.modify_endpoint?.msg);
              } else if (errors && errors?.length > 0) {
                const errorMsgList = _.map(errors, (error) => error.message);
                for (const error of errorMsgList) {
                  message.error(error);
                }
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
          // create service
          mutationToCreateService.mutate(values, {
            onSuccess: () => {
              // After creating service, navigate to serving page and set current resource group
              setCurrentGlobalResourceGroup(values.resourceGroup);
              // FIXME: temporally refer to mutate input to message
              message.success(
                t('modelService.ServiceCreated', { name: values.serviceName }),
              );
              webuiNavigate('/serving');
            },
            onError: (error) => {
              let defaultErrorMessage = endpoint
                ? t('modelService.FailedToUpdateService')
                : t('modelService.FailedToStartService');
              message.error(getErrorMessage(error, defaultErrorMessage));
            },
          });
        }
      })
      .catch((err) => {
        // Form has `scrollToFirstError` prop, but it doesn't work. So, we need to scroll manually.
        err?.errorFields?.[0]?.name &&
          form.scrollToField(err.errorFields[0].name, {
            behavior: 'smooth',
            block: 'center',
          });
        // this catch function only for form validation error and unhandled error in `form.validateFields()..then()`.
        // It's not for error handling in mutation.
      });
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

  const { run: syncFormToURLWithDebounce } = useDebounceFn(
    () => {
      // To sync the latest form values to URL,
      // 'trailing' is set to true, and get the form values here.
      const currentValue = form.getFieldsValue();
      setQuery(
        {
          formValues: _.assign(
            _.omit(currentValue, [
              'environments.image',
              'environments.customizedTag',
              'vfoldersAliasMap',
              'envvars',
            ]),
            {
              envvars: sanitizeSensitiveEnv(currentValue.envvars),
            },
          ),
        },
        'replaceIn',
      );
    },
    {
      leading: false,
      wait: 500,
      trailing: true,
    },
  );

  const INITIAL_FORM_VALUES = endpoint
    ? {
        serviceName: endpoint?.name,
        resourceGroup: endpoint?.resource_group,
        allocationPreset: 'custom',
        replicas: endpoint?.replicas ?? endpoint?.desired_session_count ?? 1,
        // FIXME: memory doesn't applied to resource allocation
        resource: {
          cpu: parseInt(JSON.parse(endpoint?.resource_slots || '{}')?.cpu),
          mem: convertToBinaryUnit(
            JSON.parse(endpoint?.resource_slots || '{}')?.mem,
            'g',
            3,
            true,
          )?.value,
          shmem: convertToBinaryUnit(
            JSON.parse(endpoint?.resource_opts || '{}')?.shmem ||
              AUTOMATIC_DEFAULT_SHMEM,
            'g',
            3,
            true,
          )?.value,
          ...getAIAcceleratorWithStringifiedKey(
            _.omit(JSON.parse(endpoint?.resource_slots || '{}'), [
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
          environment:
            endpoint?.image_object?.namespace ?? endpoint?.image_object?.name,
          version: `${endpoint?.image_object?.registry}/${endpoint?.image_object?.namespace ?? endpoint?.image_object?.name}:${endpoint?.image_object?.tag}@${endpoint?.image_object?.architecture}`,
          image: endpoint?.image_object,
        },
        vFolderID: endpoint?.model,
        mount_ids: _.map(endpoint?.extra_mounts, (item) =>
          item?.row_id?.replaceAll('-', ''),
        ),
        // TODO: implement mount_id_map. Now, it's impossible to get mount_destination from backend
        modelMountDestination: endpoint?.model_mount_destination,
        modelDefinitionPath: endpoint?.model_definition_path,
        runtimeVariant: endpoint?.runtime_variant?.name,
        envvars: _.map(
          JSON.parse(endpoint?.environ || '{}'),
          (value, variable) => ({ variable, value }),
        ),
      }
    : {
        replicas: 1,
        runtimeVariant: 'custom',
        ...RESOURCE_ALLOCATION_INITIAL_FORM_VALUES,
        ...(baiClient._config?.default_session_environment && {
          environments: {
            environment: baiClient._config?.default_session_environment,
          },
        }),
        vFolderID: model
          ? model
          : _.get(formValuesFromQueryParams, 'vFolderID') || undefined,
        resourceGroup: currentGlobalResourceGroup,
        allocationPreset: 'auto-select',
        // Initialize empty mount configuration for new services
        mount_ids: [],
        mount_id_map: {},
      };

  const mergedInitialValues = _.merge(
    {},
    INITIAL_FORM_VALUES,
    formValuesFromQueryParams,
  );

  return (
    <>
      <BAIFlex
        direction="column"
        align="stretch"
        style={{ justifyContent: 'revert' }}
      >
        <BAIFlex direction="row" gap="md" align="start">
          <BAIFlex
            direction="column"
            align="stretch"
            style={{ flex: 1, maxWidth: 700 }}
            wrap="nowrap"
          >
            {_.filter(
              filterOutNullAndUndefined(endpoint?.extra_mounts),
              (vf) => vf?.name && !vf?.name.startsWith('.'),
            ).length > 0 && (
              <Alert
                message={t('modelService.ExtraMountsWarning')}
                type="warning"
                showIcon
                style={{ marginBottom: token.marginMD }}
              />
            )}
            <Form.Provider
              onFormChange={(name, info) => {
                // use OnFormChange instead of Form's onValuesChange,
                // because onValuesChange will not be triggered when form is changed programmatically
                syncFormToURLWithDebounce();
              }}
            >
              <Form
                form={form}
                disabled={mutationToCreateService.isPending}
                layout="vertical"
                labelCol={{ span: 12 }}
                initialValues={mergedInitialValues}
              >
                <BAIFlex direction="column" gap={'md'} align="stretch">
                  <Card>
                    {(baiClient.supports('modify-endpoint') || !endpoint) && (
                      <>
                        <Form.Item
                          label={t('modelService.ServiceName')}
                          name="serviceName"
                          validateDebounce={500}
                          rules={!!endpoint ? [] : validationRules}
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
                            name={'vFolderID'}
                            label={t('session.launcher.ModelStorageToMount')}
                            rules={[
                              {
                                required: true,
                              },
                            ]}
                          >
                            <VFolderSelect
                              filter={(vf) =>
                                vf.usage_mode === 'model' &&
                                vf.status === 'ready' &&
                                vf.ownership_type !== 'group'
                              }
                              valuePropName="id"
                              autoSelectDefault={
                                !model && !formValuesFromQueryParams.vFolderID
                              }
                              disabled={!!endpoint}
                              allowFolderExplorer
                              allowCreateFolder
                            />
                          </Form.Item>
                        ) : (
                          endpoint?.model && (
                            <Form.Item
                              name={'vFolderID'}
                              label={t('session.launcher.ModelStorageToMount')}
                              required
                            >
                              <Suspense fallback={<Skeleton.Input active />}>
                                <VFolderLazyView uuid={endpoint?.model} />
                              </Suspense>
                            </Form.Item>
                          )
                        )}
                        <Form.Item
                          name={'runtimeVariant'}
                          required
                          label={t('modelService.RuntimeVariant')}
                        >
                          <Select
                            defaultActiveFirstOption
                            showSearch
                            options={_.map(
                              availableRuntimes?.runtimes,
                              (runtime) => {
                                return {
                                  value: runtime.name,
                                  label: runtime.human_readable_name,
                                };
                              },
                            )}
                          />
                        </Form.Item>
                        <Form.Item dependencies={['runtimeVariant']} noStyle>
                          {({ getFieldValue }) =>
                            getFieldValue('runtimeVariant') === 'custom' && (
                              <BAIFlex
                                direction="row"
                                gap={'xxs'}
                                align="stretch"
                                justify="between"
                              >
                                <Form.Item
                                  name={'modelMountDestination'}
                                  label={t(
                                    'modelService.ModelMountDestination',
                                  )}
                                  style={{ width: '50%' }}
                                  labelCol={{ style: { flex: 1 } }}
                                >
                                  <Input
                                    allowClear
                                    placeholder={'/models'}
                                    disabled={!!endpoint}
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
                                  labelCol={{ style: { flex: 1 } }}
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
                              </BAIFlex>
                            )
                          }
                        </Form.Item>
                        <Form.Item noStyle dependencies={['vFolderID']}>
                          {({ getFieldValue }) => {
                            return (
                              <VFolderTableFormItem
                                rowKey={'id'}
                                label={t('modelService.AdditionalMounts')}
                                rowFilter={(vf) =>
                                  vf.id !== getFieldValue('vFolderID') &&
                                  vf.status === 'ready' &&
                                  vf.usage_mode !== 'model' &&
                                  !vf.name?.startsWith('.')
                                }
                                tableProps={{
                                  size: 'small',
                                }}
                              />
                            );
                          }}
                        </Form.Item>
                      </>
                    )}
                  </Card>
                  <Card>
                    {(baiClient.supports('modify-endpoint') || !endpoint) && (
                      <>
                        <Form.Item
                          label={t('modelService.NumberOfReplicas')}
                          name={'replicas'}
                          rules={[
                            {
                              required: true,
                            },
                            {
                              type: 'number',
                              min: 0,
                            },
                            {
                              type: 'number',
                              max:
                                user_resource_policy?.max_session_count_per_model_session ??
                                0,
                            },
                          ]}
                        >
                          <InputNumberWithSlider
                            inputContainerMinWidth={190}
                            min={0}
                            max={
                              user_resource_policy?.max_session_count_per_model_session ??
                              0
                            }
                            inputNumberProps={{
                              //TODO: change unit based on resource limit
                              addonAfter: '#',
                            }}
                            step={1}
                          />
                        </Form.Item>
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
                        {endpoint &&
                          !wantToChangeResource &&
                          !baiClient._config.allowCustomResourceAllocation && (
                            <Form.Item
                              label={
                                <>
                                  {t('modelService.Resources')}
                                  <Button
                                    type="link"
                                    onClick={() => {
                                      form.setFieldsValue({
                                        allocationPreset: 'auto-select',
                                      });
                                      setWantToChangeResource(true);
                                    }}
                                  >
                                    {t('general.Change')}
                                  </Button>
                                </>
                              }
                              required
                            >
                              <BAIFlex gap={'xs'}>
                                <Tooltip title={t('session.ResourceGroup')}>
                                  <Tag>{endpoint?.resource_group}</Tag>
                                </Tooltip>
                                {_.map(
                                  JSON.parse(endpoint?.resource_slots || '{}'),
                                  (value: string, type) => {
                                    return (
                                      <ResourceNumber
                                        key={type}
                                        type={type}
                                        value={value}
                                        opts={JSON.parse(
                                          endpoint?.resource_opts || '{}',
                                        )}
                                      />
                                    );
                                  },
                                )}
                              </BAIFlex>
                            </Form.Item>
                          )}
                        <div
                          style={{
                            display:
                              endpoint &&
                              !wantToChangeResource &&
                              !baiClient._config.allowCustomResourceAllocation
                                ? 'none'
                                : 'block',
                          }}
                        >
                          <ResourceAllocationFormItems enableResourcePresets />
                        </div>
                        <Form.Item
                          label={t('session.launcher.EnvironmentVariable')}
                        >
                          <EnvVarFormList
                            name={'envvars'}
                            formItemProps={{
                              validateTrigger: ['onChange', 'onBlur'],
                            }}
                          />
                        </Form.Item>
                      </>
                    )}
                  </Card>
                  <BAIFlex
                    direction="row"
                    justify="between"
                    align="end"
                    gap={'xs'}
                  >
                    <BAIFlex>
                      <Button
                        onClick={() => {
                          form
                            .validateFields()
                            .then((values) => {
                              setValidateServiceData(values);
                              setIsOpenServiceValidationModal(true);
                            })
                            .catch((err) => {
                              console.log(err.message);
                              message.error(
                                t('modelService.FormValidationFailed'),
                              );
                            });
                        }}
                      >
                        {t('modelService.Validate')}
                      </Button>
                    </BAIFlex>
                    <BAIFlex gap={'sm'}>
                      <Button type="primary" onClick={handleOk}>
                        {endpoint ? t('button.Update') : t('button.Create')}
                      </Button>
                    </BAIFlex>
                  </BAIFlex>
                </BAIFlex>
              </Form>
            </Form.Provider>
          </BAIFlex>
        </BAIFlex>
      </BAIFlex>
      <BAIModal
        width={1000}
        title={t('modelService.ValidationInfo')}
        open={isOpenServiceValidationModal}
        destroyOnHidden
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
    </>
  );
};

export default ServiceLauncherPageContent;
