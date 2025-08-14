import { ImageEnvironmentFormInput } from '../components/ImageEnvironmentSelectFormItems';
import { mainContentDivRefState } from '../components/MainLayout/MainLayout';
import ResourceAllocationFormItems, {
  ResourceAllocationFormValue,
} from '../components/ResourceAllocationFormItems';
import { generateRandomString, getImageFullName } from '../helper';
import { useWebUINavigate } from '../hooks';
import { useSetBAINotification } from '../hooks/useBAINotification';
import {
  PlayCircleFilled,
  LeftOutlined,
  RightOutlined,
  DoubleRightOutlined,
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
  Typography,
  theme,
  Popconfirm,
  Tooltip,
} from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import { useAtomValue } from 'jotai';
import _ from 'lodash';
import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DeploymentInitialRevisionFormItem from 'src/components/DeploymentInitialRevisionFormItem';
import DeploymentLauncherPreview from 'src/components/DeploymentLauncherPreview';
import DeploymentMetadataFormItem from 'src/components/DeploymentMetadataFormItem';
import DeploymentNetworkAccessFormItem from 'src/components/DeploymentNetworkAccessFormItem';
import DeploymentStrategyFormItem from 'src/components/DeploymentStrategyFormItem';
import {
  JsonParam,
  NumberParam,
  StringParam,
  useQueryParams,
  withDefault,
} from 'use-query-params';

// GraphQL-aligned form value types
export interface DeploymentMetadataFormValues {
  metadata: {
    name: string;
    tags: string[];
  };
}

export interface DeploymentNetworkAccessFormValues {
  networkAccess: {
    preferredDomainName?: string;
    openToPublic: boolean;
  };
}

export interface DeploymentStrategyFormValues {
  deploymentStrategy: {
    type: 'ROLLING' | 'BLUE_GREEN' | 'CANARY';
  };
}

export interface DeploymentInitialRevisionFormValues {
  initialRevision: {
    deploymentId: string;
    name: string;
    image: {
      name: string;
      architecture: string;
    };
    modelRuntimeConfig: {
      runtimeVariant: string;
      serviceConfig?: Record<string, unknown>;
      environ?: Record<string, unknown>;
    };
    modelMountConfig: {
      vfolderId: string;
      mountDestination: string;
      definitionPath: string;
    };
  };
}

export interface CreateModelDeploymentInput {
  metadata: {
    name: string;
    tags?: string[];
  };
  networkAccess: {
    preferredDomainName?: string;
    openToPublic: boolean;
  };
  clusterConfig: {
    mode: 'SINGLE_NODE' | 'MULTI_NODE';
    size: number;
  };
  resourceConfig: {
    resourceGroup: {
      name: string;
    };
    resourceSlots: Record<string, number | string>;
    resourceOpts?: Record<string, unknown>;
  };
  deploymentStrategy: {
    type: 'ROLLING' | 'BLUE_GREEN' | 'CANARY';
  };
  initialRevision: {
    deploymentId: string; // TODO: remove this when schema changed
    name: string;
    image: {
      name: string;
      architecture: string;
    };
    modelRuntimeConfig: {
      runtimeVariant: string;
      serviceConfig?: Record<string, unknown>;
      environ?: Record<string, unknown>;
    };
    modelMountConfig: {
      vfolderId: string;
      mountDestination: string;
      definitionPath: string;
    };
  };
}

export type DeploymentLauncherFormValue = DeploymentMetadataFormValues &
  DeploymentNetworkAccessFormValues &
  DeploymentStrategyFormValues &
  DeploymentInitialRevisionFormValues &
  ResourceAllocationFormValue &
  ImageEnvironmentFormInput;

export type DeploymentLauncherStepKey =
  | 'metadata'
  | 'resources'
  | 'deployment'
  | 'review';

interface StepPropsWithKey extends StepProps {
  key: DeploymentLauncherStepKey;
}

export const DEPLOYMENT_LAUNCHER_NOTI_PREFIX = 'deployment-launcher:';

const DeploymentLauncherPage = () => {
  const mainContentDivRef = useAtomValue(mainContentDivRefState);

  const [isStartingDeployment, setIsStartingDeployment] = useState(false);

  const INITIAL_FORM_VALUES: DeploymentLauncherFormValue = useMemo(
    () => ({
      metadata: {
        name: '',
        tags: [],
      },
      networkAccess: {
        preferredDomainName: '',
        openToPublic: false,
      },
      deploymentStrategy: {
        type: 'ROLLING',
      },
      initialRevision: {
        deploymentId: '',
        name: '',
        image: {
          name: '',
          architecture: '',
        },
        modelRuntimeConfig: {
          runtimeVariant: '',
          serviceConfig: {},
          environ: {},
        },
        modelMountConfig: {
          vfolderId: '',
          mountDestination: '',
          definitionPath: '',
        },
      },
      resource: {
        cpu: 0,
        mem: '0g',
        shmem: '0g',
        accelerator: 0,
        acceleratorType: '',
      },
      resourceGroup: '',
      cluster_mode: 'single-node',
      cluster_size: 1,
      enabledAutomaticShmem: true,
      environments: {
        environment: '',
        version: '',
        image: undefined,
        manual: '',
        customizedTag: '',
      },
    }),
    [],
  );

  const StepParam = withDefault(NumberParam, 0);
  const FormValuesParam = withDefault(JsonParam, INITIAL_FORM_VALUES);
  const [
    { step: currentStep, formValues: formValuesFromQueryParams, redirectTo },
    setQuery,
  ] = useQueryParams({
    step: StepParam,
    formValues: FormValuesParam,
    redirectTo: StringParam,
  });

  const webuiNavigate = useWebUINavigate();
  const { upsertNotification } = useSetBAINotification();

  const { run: syncFormToURLWithDebounce } = useDebounceFn(
    () => {
      const currentValue = form.getFieldsValue();
      setQuery(
        {
          formValues: _.assign(_.omit(form.getFieldsValue(), []), currentValue),
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

  useEffect(() => {
    if (!_.isEmpty(formValuesFromQueryParams)) {
      form.validateFields().catch((e) => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mergedInitialValues = useMemo(() => {
    return _.merge({}, INITIAL_FORM_VALUES, formValuesFromQueryParams);
  }, [INITIAL_FORM_VALUES, formValuesFromQueryParams]);

  // ScrollTo top when step is changed
  useEffect(() => {
    mainContentDivRef.current?.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  const steps: Array<StepPropsWithKey> = [
    {
      title: t('deployment.launcher.MetadataAndNetwork'),
      key: 'metadata',
    },
    {
      title: t('deployment.launcher.ResourceAllocation'),
      key: 'resources',
    },
    {
      title: t('deployment.launcher.DeploymentStrategy'),
      key: 'deployment',
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

  // const [finalStepLastValidateTime, setFinalStepLastValidateTime] =
  //   useUpdatableState('first');

  // useEffect(() => {
  //   if (currentStep === steps.length - 1) {
  //     form
  //       .validateFields()
  //       .catch((error) => {})
  //       .finally(() => setFinalStepLastValidateTime());
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [currentStep, form, setFinalStepLastValidateTime, steps.length]);

  const startDeployment = () => {
    setIsStartingDeployment(true);
    // const usedSearchParams = search;

    form
      .validateFields()
      .then(async (values) => {
        const deploymentInput: CreateModelDeploymentInput = {
          metadata: {
            name: values.metadata.name,
            tags: values.metadata.tags,
          },
          networkAccess: {
            preferredDomainName: values.networkAccess.preferredDomainName,
            openToPublic: values.networkAccess.openToPublic,
          },
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
            resourceSlots: {
              cpu: values.resource.cpu,
              mem: values.resource.mem,
              ...(values.resource.accelerator > 0
                ? {
                    [values.resource.acceleratorType]:
                      values.resource.accelerator,
                  }
                : {}),
            },
            resourceOpts: {
              shmem: values.resource.shmem,
            },
          },
          deploymentStrategy: {
            type: values.deploymentStrategy.type,
          },
          initialRevision: {
            deploymentId: generateRandomString(),
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
            modelRuntimeConfig: values.initialRevision.modelRuntimeConfig,
            modelMountConfig: values.initialRevision.modelMountConfig,
          },
        };

        try {
          // TODO: Implement actual GraphQL mutation call
          // const result = await baiClient.mutate({
          //   mutation: CREATE_MODEL_DEPLOYMENT,
          //   variables: { input: deploymentInput },
          // });

          console.log('Creating deployment:', deploymentInput);

          // Simulate API delay
          await new Promise((resolve) => setTimeout(resolve, 2000));

          const deploymentName = deploymentInput.metadata.name;

          webuiNavigate(redirectTo || '/deployment');

          upsertNotification({
            key: DEPLOYMENT_LAUNCHER_NOTI_PREFIX + deploymentName,
            message: t('deployment.launcher.DeploymentCreated', {
              name: deploymentName,
            }),
            description: t('deployment.launcher.DeploymentCreatedDescription'),
            duration: 5,
            open: true,
          });
        } catch (error) {
          console.error('Failed to create deployment:', error);
          upsertNotification({
            key: DEPLOYMENT_LAUNCHER_NOTI_PREFIX + 'error',
            message: t('deployment.launcher.DeploymentFailed'),
            description:
              error instanceof Error
                ? error.message
                : t('deployment.launcher.UnknownError'),
            type: 'error',
            duration: 0,
            open: true,
          });
        }
      })
      .catch((e) => {
        console.log('validation errors', e);
      })
      .finally(() => {
        setIsStartingDeployment(false);
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
    >
      <BAIFlex direction="row" gap="md" align="start">
        <BAIFlex
          direction="column"
          align="stretch"
          style={{ flex: 1, maxWidth: 700 }}
        >
          <BAIFlex direction="row" justify="between">
            <Typography.Title level={4} style={{ marginTop: 0 }}>
              {t('deployment.launcher.CreateNewDeployment')}
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
            >
              <BAIFlex direction="column" align="stretch" gap="md">
                {/* Step 1: Metadata */}
                <Card
                  title={t('deployment.launcher.Metadata')}
                  style={{
                    display: currentStepKey === 'metadata' ? 'block' : 'none',
                  }}
                >
                  <DeploymentMetadataFormItem />
                </Card>

                {/* Step 1: Network Access */}
                <Card
                  title={t('deployment.launcher.NetworkAccess')}
                  style={{
                    display: currentStepKey === 'metadata' ? 'block' : 'none',
                  }}
                >
                  <DeploymentNetworkAccessFormItem />
                </Card>

                {/* Step 2: Resource and Cluster Configuration */}
                <Card
                  title={t('deployment.launcher.ResourceAllocation')}
                  style={{
                    display: currentStepKey === 'resources' ? 'block' : 'none',
                  }}
                >
                  <ResourceAllocationFormItems
                    enableResourcePresets
                    showRemainingWarning
                  />
                </Card>

                {/* Step 3: Deployment Strategy */}
                <Card
                  title={t('deployment.launcher.DeploymentStrategy')}
                  style={{
                    display: currentStepKey === 'deployment' ? 'block' : 'none',
                  }}
                >
                  <DeploymentStrategyFormItem />
                </Card>

                {/* Step 3: Initial Revision */}
                <Card
                  title={t('deployment.launcher.InitialRevision')}
                  style={{
                    display: currentStepKey === 'deployment' ? 'block' : 'none',
                  }}
                >
                  <DeploymentInitialRevisionFormItem />
                </Card>

                {/* Step 4: Review and Confirm */}
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
                        disabled={isStartingDeployment}
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
                          onClick={startDeployment}
                          loading={isStartingDeployment}
                        >
                          {t('deployment.launcher.CreateDeployment')}
                        </Button>
                      </Tooltip>
                    ) : (
                      <Button type="primary" ghost onClick={handleNext}>
                        {t('button.Next')} <RightOutlined />
                      </Button>
                    )}
                    {currentStep !== steps.length - 1 && (
                      <Button
                        onClick={() => {
                          setCurrentStep(steps.length - 1);
                        }}
                      >
                        {t('deployment.launcher.SkipToConfirmAndDeploy')}
                        <DoubleRightOutlined />
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
