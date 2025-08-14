import { sanitizeSensitiveEnv } from '../components/EnvVarFormList';
import ImageEnvironmentSelectFormItems, {
  ImageEnvironmentFormInput,
} from '../components/ImageEnvironmentSelectFormItems';
import { mainContentDivRefState } from '../components/MainLayout/MainLayout';
import {
  RESOURCE_ALLOCATION_INITIAL_FORM_VALUES,
  ResourceAllocationFormValue,
} from '../components/ResourceAllocationFormItems';
import { VFolderTableFormValues } from '../components/VFolderTableFormItem';
import { getImageFullName, serializeModelRuntimeConfig } from '../helper';
import { useWebUINavigate, useSuspendedBackendaiClient } from '../hooks';
import { useSetBAINotification } from '../hooks/useBAINotification';
import { useCurrentResourceGroupState } from '../hooks/useCurrentProject';
import {
  PlayCircleFilled,
  LeftOutlined,
  RightOutlined,
  PlayCircleOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { useDebounceFn } from 'ahooks';
import {
  Button,
  Card,
  Form,
  Grid,
  StepProps,
  Steps,
  theme,
  Popconfirm,
  Tooltip,
  Input,
  Typography,
} from 'antd';
import { BAIFlex, compareNumberWithUnits } from 'backend.ai-ui';
import { useAtomValue } from 'jotai';
import _ from 'lodash';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useMutation } from 'react-relay';
import {
  DeploymentLauncherPageCreateModelDeploymentMutation,
  DeploymentLauncherPageCreateModelDeploymentMutation$variables,
} from 'src/__generated__/DeploymentLauncherPageCreateModelDeploymentMutation.graphql';
import DeploymentLauncherPreview from 'src/components/DeploymentLauncherPreview';
import DeploymentMetadataFormItem from 'src/components/DeploymentMetadataFormItem';
import DeploymentNetworkAccessFormItem from 'src/components/DeploymentNetworkAccessFormItem';
import DeploymentRevisionRuntimeAndMountFormItem from 'src/components/DeploymentRevisionRuntimeAndMountFormItem';
import DeploymentStrategyFormItem from 'src/components/DeploymentStrategyFormItem';
import ResourceAllocationFormItems from 'src/components/ResourceAllocationFormItems';
import {
  JsonParam,
  NumberParam,
  StringParam,
  useQueryParams,
  withDefault,
} from 'use-query-params';

export type DeploymentLauncherFormValue =
  DeploymentLauncherPageCreateModelDeploymentMutation$variables['input'] &
    ImageEnvironmentFormInput &
    ResourceAllocationFormValue &
    VFolderTableFormValues;

export type DeploymentLauncherStepKey = 'deployment' | 'revisions' | 'review';

interface StepPropsWithKey extends StepProps {
  key: DeploymentLauncherStepKey;
}

export const DEPLOYMENT_LAUNCHER_NOTI_PREFIX = 'deployment-launcher:';

// Common default values
export const DEFAULT_INITIAL_REVISION = {
  name: undefined,
  image: { name: undefined, architecture: undefined },
  modelRuntimeConfig: {
    runtimeVariant: 'custom',
    inferenceRuntimeConfig: undefined,
    environ: undefined,
  },
  modelMountConfig: {
    vfolderId: '',
    mountDestination: '',
    definitionPath: '',
  },
  extraMounts: [],
};

export const DEFAULT_ENVIRONMENTS = {
  environment: '',
  version: '',
  image: undefined,
  manual: '',
  customizedTag: '',
};

interface DeploymentLauncherPageProps {}

const DeploymentLauncherPage: React.FC<DeploymentLauncherPageProps> = ({
  ...props
}) => {
  const mainContentDivRef = useAtomValue(mainContentDivRefState);

  const [currentGlobalResourceGroup] = useCurrentResourceGroupState();
  const baiClient = useSuspendedBackendaiClient();

  const webuiNavigate = useWebUINavigate();
  const { upsertNotification } = useSetBAINotification();

  const [commitCreateModelDeployment, isInFlightCreateModelDeployment] =
    useMutation<DeploymentLauncherPageCreateModelDeploymentMutation>(graphql`
      mutation DeploymentLauncherPageCreateModelDeploymentMutation(
        $input: CreateModelDeploymentInput!
      ) {
        createModelDeployment(input: $input) {
          deployment {
            id
            # metadata {
            #   name
            #   status
            # }
          }
        }
      }
    `);

  const StepParam = withDefault(NumberParam, 0);
  const FormValuesParam = withDefault(JsonParam, {});
  const [
    { step: currentStep, formValues: formValuesFromQueryParams, redirectTo },
    setQuery,
  ] = useQueryParams({
    step: StepParam,
    formValues: FormValuesParam,
    redirectTo: StringParam,
  });

  const deployment: any = undefined;

  // Build form values using lodash utilities
  const INITIAL_FORM_VALUES = _.merge({
    // Base defaults
    metadata: { name: '', tags: [] },
    networkAccess: { openToPublic: false },
    defaultDeploymentStrategy: { type: 'ROLLING' },
    desiredReplicaCount: 1,
    initialRevision: DEFAULT_INITIAL_REVISION,
    mount_ids: [],
    mount_id_map: {},
    resourceGroup: currentGlobalResourceGroup,
    ...RESOURCE_ALLOCATION_INITIAL_FORM_VALUES,
    environments: baiClient?._config?.default_session_environment
      ? _.assign({}, DEFAULT_ENVIRONMENTS, {
          environment: baiClient._config.default_session_environment,
        })
      : DEFAULT_ENVIRONMENTS,
    allocationPreset: 'auto-select',
  });

  // Process URL params with simplified lodash transform
  const processedFormValuesFromQueryParams = _.isEmpty(
    formValuesFromQueryParams,
  )
    ? {}
    : _.transform(
        formValuesFromQueryParams,
        (result: any, value, key: string) => {
          _.set(result, key, value);
        },
        {},
      );

  const mergedInitialValues = _.merge(
    {},
    INITIAL_FORM_VALUES,
    processedFormValuesFromQueryParams,
  );

  const { run: syncFormToURLWithDebounce } = useDebounceFn(
    () => {
      const currentValue = form.getFieldsValue();
      setQuery(
        {
          formValues: _.assign(
            _.omit(form.getFieldsValue(), [
              'environments.image',
              'environments.customizedTag',
              'initialRevision.modelRuntimeConfig.inferenceRuntimeConfig',
              'initialRevision.modelRuntimeConfig.environ',
            ]),
            {
              'initialRevision.modelRuntimeConfig.inferenceRuntimeConfig':
                sanitizeSensitiveEnv(
                  currentValue?.initialRevision?.modelRuntimeConfig
                    ?.inferenceRuntimeConfig ?? [],
                ),
              'initialRevision.modelRuntimeConfig.environ':
                sanitizeSensitiveEnv(
                  _.isArray(
                    currentValue?.initialRevision?.modelRuntimeConfig?.environ,
                  )
                    ? currentValue?.initialRevision?.modelRuntimeConfig?.environ
                    : JSON.parse(
                        currentValue?.initialRevision?.modelRuntimeConfig
                          ?.environ || '{}',
                      ),
                ),
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

  const setCurrentStep = (nextStep: number) => {
    setQuery(
      {
        step: nextStep,
      },
      'pushIn',
    );
  };

  const { token } = theme.useToken();
  const { t } = useTranslation();
  const screens = Grid.useBreakpoint();
  const [form] = Form.useForm<DeploymentLauncherFormValue>();

  // Validate form fields on mount
  useEffect(() => {
    form.validateFields().catch((e) => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ScrollTo top when step is changed
  useEffect(() => {
    mainContentDivRef.current?.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  const steps: Array<StepPropsWithKey> = [
    {
      title: t('deployment.launcher.Deployment'),
      key: 'deployment',
    },
    {
      title: t('deployment.launcher.InitialRevision'),
      key: 'revisions',
    },
    {
      title: t('deployment.launcher.ConfirmAndDeploy'),
      icon: <PlayCircleFilled />,
      key: 'review',
    },
  ];

  const currentStepKey = steps[currentStep]?.key;

  const hasError = _.some(
    form.getFieldsError(),
    (item) => item.errors.length > 0,
  );

  const createDeployment = () => {
    form
      .validateFields()
      .then(async (values) => {
        const deploymentInput: DeploymentLauncherPageCreateModelDeploymentMutation$variables['input'] =
          {
            metadata: {
              name: values.metadata.name,
              tags: values.metadata.tags,
            },
            networkAccess: {
              preferredDomainName: values.networkAccess.preferredDomainName,
              openToPublic: values.networkAccess.openToPublic,
            },
            defaultDeploymentStrategy: {
              type: values.defaultDeploymentStrategy.type,
            },
            desiredReplicaCount: values.desiredReplicaCount,
            initialRevision: {
              name: values.initialRevision.name,
              image: {
                name:
                  values.environments.manual ||
                  getImageFullName(values.environments.image) ||
                  values.initialRevision.image.name,
                architecture:
                  values.environments.image?.architecture ||
                  values.initialRevision.image.architecture ||
                  'x86_64',
              },
              modelRuntimeConfig: {
                runtimeVariant:
                  values.initialRevision.modelRuntimeConfig.runtimeVariant,
                inferenceRuntimeConfig: serializeModelRuntimeConfig(
                  values.initialRevision.modelRuntimeConfig
                    ?.inferenceRuntimeConfig,
                ),
                environ: serializeModelRuntimeConfig(
                  values.initialRevision.modelRuntimeConfig?.environ,
                ),
              },
              modelMountConfig: {
                ...values.initialRevision.modelMountConfig,
                mountDestination:
                  values.initialRevision.modelMountConfig.mountDestination ||
                  '/models',
                definitionPath:
                  values.initialRevision.modelMountConfig.definitionPath ||
                  'model-definition.yaml',
              },
              extraMounts:
                values.mount_ids?.map((vfolderId) => ({
                  vfolderId: vfolderId,
                  mountDestination:
                    values.mount_id_map?.[vfolderId] ||
                    `/home/work/${vfolderId}`,
                })) || [],
              clusterConfig: {
                mode:
                  values.cluster_mode === 'single-node'
                    ? 'SINGLE_NODE'
                    : 'MULTI_NODE',
                size: values.cluster_size,
              },
              resourceConfig: {
                resourceGroup: {
                  name: values.resourceGroup,
                },
                resourceSlots: JSON.stringify({
                  cpu: values.resource.cpu,
                  mem: values.resource.mem,
                  ...(values.resource.accelerator > 0
                    ? {
                        [values.resource.acceleratorType]:
                          values.resource.accelerator,
                      }
                    : undefined),
                }),
                resourceOpts: values.resource.shmem
                  ? JSON.stringify({
                      shmem:
                        compareNumberWithUnits(values.resource.mem, '4g') > 0 &&
                        compareNumberWithUnits(values.resource.shmem, '1g') < 0
                          ? '1g'
                          : values.resource.shmem,
                    })
                  : undefined,
              },
            },
          };

        const deploymentName = deploymentInput.metadata.name;

        commitCreateModelDeployment({
          variables: { input: deploymentInput },
          onCompleted: (res, errors) => {
            if (!res?.createModelDeployment?.deployment) {
              upsertNotification({
                key: DEPLOYMENT_LAUNCHER_NOTI_PREFIX + deploymentName,
                message: t('deployment.launcher.DeploymentFailed'),
                description: t('deployment.launcher.UnknownError'),
                type: 'error',
                duration: 0,
                open: true,
              });
              return;
            }
            if (errors && errors?.length > 0) {
              const errorMsgList = _.map(errors, (error) => error.message);
              for (const error of errorMsgList) {
                upsertNotification({
                  key:
                    DEPLOYMENT_LAUNCHER_NOTI_PREFIX + deploymentName + '_error',
                  message: t('deployment.launcher.DeploymentFailed'),
                  description: error,
                  type: 'error',
                  duration: 0,
                  open: true,
                });
              }
            } else {
              console.log('Deployment created successfully:', res);

              upsertNotification({
                key: DEPLOYMENT_LAUNCHER_NOTI_PREFIX + deploymentName,
                message: t('deployment.launcher.DeploymentCreated', {
                  name: deploymentName,
                }),
                description: t(
                  'deployment.launcher.DeploymentCreatedDescription',
                ),
                duration: 5,
                open: true,
              });

              webuiNavigate(redirectTo || '/deployment');
            }
          },
          onError: (err) => {
            console.error('Failed to create deployment:', err);
            upsertNotification({
              key: DEPLOYMENT_LAUNCHER_NOTI_PREFIX + deploymentName,
              message: t('deployment.launcher.DeploymentFailed'),
              description:
                err?.message || t('deployment.launcher.UnknownError'),
              type: 'error',
              duration: 0,
              open: true,
            });
          },
        });
      })
      .catch((e) => {
        console.log('validation errors', e);
      });
  };

  const [isQueryReset, setIsQueryReset] = useState(false);
  useLayoutEffect(() => {
    if (isQueryReset) {
      form.resetFields();
      setIsQueryReset(false);
    }
  }, [isQueryReset, form]);

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <BAIFlex
      direction="column"
      align="stretch"
      style={{
        justifyContent: 'revert',
      }}
      gap={'md'}
      {...props}
    >
      <BAIFlex direction="row" gap="md" align="start">
        <BAIFlex
          direction="column"
          align="stretch"
          style={{ flex: 1, maxWidth: 700 }}
        >
          <BAIFlex direction="row" justify="between">
            <Typography.Title level={4} style={{ marginTop: 0 }}>
              {deployment
                ? t('deployment.launcher.UpdateDeployment')
                : t('deployment.launcher.CreateNewDeployment')}
            </Typography.Title>
          </BAIFlex>

          <Form.Provider
            onFormChange={(name, info) => {
              syncFormToURLWithDebounce();
            }}
          >
            <Form
              form={form}
              layout="vertical"
              requiredMark="optional"
              initialValues={mergedInitialValues}
              disabled={isInFlightCreateModelDeployment}
            >
              <BAIFlex direction="column" align="stretch" gap="md">
                {/* Step 1: Metadata */}
                <Card
                  title={t('deployment.launcher.Metadata')}
                  style={{
                    display: currentStepKey === 'deployment' ? 'block' : 'none',
                  }}
                >
                  <DeploymentMetadataFormItem />
                </Card>

                {/* Step 1: Deployment Strategy */}
                <Card
                  title={t('deployment.launcher.DefaultDeploymentStrategy')}
                  style={{
                    display: currentStepKey === 'deployment' ? 'block' : 'none',
                  }}
                >
                  <DeploymentStrategyFormItem />
                </Card>

                {/* Step 1: Network Access */}
                <Card
                  title={t('deployment.launcher.NetworkAccess')}
                  style={{
                    display: currentStepKey === 'deployment' ? 'block' : 'none',
                  }}
                >
                  <DeploymentNetworkAccessFormItem />
                </Card>

                {/* Step 2: Initial Revision - Name and Environments */}
                <Card
                  title={t('deployment.launcher.NameAndEnvironments')}
                  style={{
                    display: currentStepKey === 'revisions' ? 'block' : 'none',
                  }}
                >
                  <Form.Item
                    name={['initialRevision', 'name']}
                    label={t('deployment.launcher.RevisionName')}
                  >
                    <Input
                      placeholder={t(
                        'deployment.launcher.RevisionNamePlaceholder',
                      )}
                    />
                  </Form.Item>
                  <ImageEnvironmentSelectFormItems showPrivate />
                </Card>
                <Card
                  title={t('deployment.launcher.RuntimeAndMountConfig')}
                  style={{
                    display: currentStepKey === 'revisions' ? 'block' : 'none',
                  }}
                >
                  {/* modelRuntimeConfig, modelMountConfig and extraMounts */}
                  <DeploymentRevisionRuntimeAndMountFormItem
                    initialVfolderId={
                      formValuesFromQueryParams?.initialRevision
                        ?.modelMountConfig?.vfolderId
                    }
                  />
                </Card>
                {/* clusterConfig and resourceConfig */}
                <Card
                  title={t('deployment.launcher.ResourceAllocation')}
                  style={{
                    display: currentStepKey === 'revisions' ? 'block' : 'none',
                  }}
                >
                  <ResourceAllocationFormItems enableResourcePresets />
                </Card>

                {/* Step 3: Review and Confirm */}
                {currentStepKey === 'review' && (
                  <DeploymentLauncherPreview
                    onClickEditStep={(stepKey) => {
                      const stepIndex = steps.findIndex(
                        (step) => step.key === stepKey,
                      );
                      if (stepIndex !== -1) {
                        setCurrentStep(stepIndex);
                      }
                    }}
                  />
                )}

                {/* Navigation Buttons */}
                <BAIFlex direction="row" justify="between">
                  <BAIFlex gap={'sm'}>
                    <Popconfirm
                      title={t('button.Reset')}
                      description={t('deployment.launcher.ResetFormConfirm')}
                      onConfirm={() => {
                        setQuery({}, 'replace');
                        setIsQueryReset(true);
                      }}
                      icon={
                        <QuestionCircleOutlined
                          style={{ color: token.colorError }}
                        />
                      }
                      okText={t('button.Reset')}
                      okButtonProps={{
                        danger: true,
                      }}
                    >
                      <Button
                        danger
                        type="link"
                        style={{ paddingRight: 0, paddingLeft: 0 }}
                      >
                        {t('button.Reset')}
                      </Button>
                    </Popconfirm>
                  </BAIFlex>
                  <BAIFlex direction="row" gap="sm">
                    {currentStep > 0 && (
                      <Button
                        onClick={handlePrevious}
                        icon={<LeftOutlined />}
                        disabled={isInFlightCreateModelDeployment}
                      >
                        {t('button.Previous')}
                      </Button>
                    )}
                    {currentStep === steps.length - 1 ? (
                      <Tooltip
                        title={
                          hasError
                            ? t('deployment.launcher.PleaseCompleteForm')
                            : undefined
                        }
                      >
                        <Button
                          type="primary"
                          icon={<PlayCircleOutlined />}
                          disabled={hasError}
                          onClick={createDeployment}
                          loading={isInFlightCreateModelDeployment}
                        >
                          {t('deployment.launcher.CreateDeployment')}
                        </Button>
                      </Tooltip>
                    ) : (
                      <Button type="primary" ghost onClick={handleNext}>
                        {t('button.Next')} <RightOutlined />
                      </Button>
                    )}
                  </BAIFlex>
                </BAIFlex>
              </BAIFlex>
            </Form>
          </Form.Provider>
        </BAIFlex>

        {screens.lg && (
          <BAIFlex style={{ position: 'sticky', top: 80 }}>
            <Steps
              size="small"
              direction="vertical"
              current={currentStep}
              onChange={(nextCurrent) => {
                setCurrentStep(nextCurrent);
              }}
              items={_.map(steps, (s, idx) => ({
                ...s,
                status: idx === currentStep ? 'process' : 'wait',
              }))}
            />
          </BAIFlex>
        )}
      </BAIFlex>
    </BAIFlex>
  );
};

export default DeploymentLauncherPage;
