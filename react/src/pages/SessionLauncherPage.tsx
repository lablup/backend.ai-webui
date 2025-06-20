import BAIIntervalView from '../components/BAIIntervalView';
import DatePickerISO from '../components/DatePickerISO';
import EnvVarFormList, {
  sanitizeSensitiveEnv,
  EnvVarFormListValue,
} from '../components/EnvVarFormList';
import Flex from '../components/Flex';
import ImageEnvironmentSelectFormItems, {
  ImageEnvironmentFormInput,
} from '../components/ImageEnvironmentSelectFormItems';
import { mainContentDivRefState } from '../components/MainLayout/MainLayout';
import PortSelectFormItem, {
  PortSelectFormValues,
  transformPortValuesToNumbers,
} from '../components/PortSelectFormItem';
import ResourceAllocationFormItems, {
  RESOURCE_ALLOCATION_INITIAL_FORM_VALUES,
  ResourceAllocationFormValue,
} from '../components/ResourceAllocationFormItems';
import ResourceNumber from '../components/ResourceNumber';
import SessionLauncherValidationTour from '../components/SessionLauncherErrorTourProps';
import SessionLauncherPreview from '../components/SessionLauncherPreview';
import SessionNameFormItem, {
  SessionNameFormItemValue,
} from '../components/SessionNameFormItem';
import SessionOwnerSetterCard, {
  SessionOwnerSetterFormValues,
} from '../components/SessionOwnerSetterCard';
import SessionTemplateModal from '../components/SessionTemplateModal';
import VFolderTableFormItem, {
  VFolderTableFormValues,
} from '../components/VFolderTableFormItem';
import {
  compareNumberWithUnits,
  formatDuration,
  generateRandomString,
  convertToBinaryUnit,
  filterEmptyItem,
} from '../helper';
import {
  useSuspendedBackendaiClient,
  useUpdatableState,
  useWebUINavigate,
} from '../hooks';
import { useCurrentUserRole } from '../hooks/backendai';
import { useSetBAINotification } from '../hooks/useBAINotification';
import {
  useCurrentProjectValue,
  useCurrentResourceGroupState,
} from '../hooks/useCurrentProject';
import { useRecentSessionHistory } from '../hooks/useRecentSessionHistory';
// @ts-ignore
import customCSS from './SessionLauncherPage.css?raw';
import {
  DoubleRightOutlined,
  LeftOutlined,
  PlayCircleFilled,
  PlayCircleOutlined,
  QuestionCircleOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { useDebounceFn, useToggle } from 'ahooks';
import {
  App,
  Button,
  Card,
  Checkbox,
  Col,
  Form,
  Grid,
  Input,
  InputNumber,
  Popconfirm,
  Radio,
  Row,
  Select,
  StepProps,
  Steps,
  Switch,
  Tooltip,
  Typography,
  theme,
} from 'antd';
import dayjs from 'dayjs';
import { useAtomValue } from 'jotai';
import _ from 'lodash';
import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Trans, useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import {
  JsonParam,
  NumberParam,
  StringParam,
  useQueryParams,
  withDefault,
} from 'use-query-params';

export interface SessionResources {
  group_name?: string;
  domain?: string;
  type?: 'interactive' | 'batch' | 'inference' | 'system';
  cluster_mode: 'single-node' | 'multi-node';
  cluster_size: number;
  maxWaitSeconds?: number;
  starts_at?: string;
  startupCommand?: string;
  bootstrap_script?: string;
  owner_access_key?: string;
  enqueueOnly?: boolean;
  config?: {
    resources?: {
      cpu: number;
      mem: string;
      [key: string]: number | string;
    };
    resource_opts?: {
      shmem?: string;
      allow_fractional_resource_fragmentation?: boolean;
    };
    mounts?: string[];
    mount_map?: {
      [key: string]: string;
    };
    environ?: {
      [key: string]: string;
    };
    scaling_group?: string;
    preopen_ports?: number[];
    agent_list?: string[];
  };
}

interface CreateSessionInfo {
  kernelName: string;
  sessionName: string;
  architecture: string;
  batchTimeout?: string;
  resources: SessionResources;
}

interface SessionLauncherValue {
  sessionType: 'interactive' | 'batch' | 'inference';
  batch: {
    enabled: boolean;
    scheduleDate?: string;
    command?: string;
    timeoutEnabled?: boolean;
    timeout?: string;
    timeoutUnit?: string;
  };
  allocationPreset: string;
  envvars: EnvVarFormListValue[];
  hpcOptimization: {
    autoEnabled: boolean;
    OMP_NUM_THREADS?: string;
    OPENBLAS_NUM_THREADS?: string;
  };
  bootstrap_script?: string;
}

export type SessionLauncherFormValue = SessionLauncherValue &
  SessionNameFormItemValue &
  ImageEnvironmentFormInput &
  ResourceAllocationFormValue &
  VFolderTableFormValues &
  PortSelectFormValues &
  SessionOwnerSetterFormValues;

type SessionMode = 'normal' | 'inference' | 'import';

export type AppOption = {
  'session-name'?: string;
  'session-uuid'?: string;
  'access-key'?: string;
  mode?: SessionMode;
  'app-services'?: Array<string>;
  runtime?: string;
  filename?: string;
  // [key in string]: any;
};

export type SessionLauncherStepKey =
  | 'sessionType'
  | 'environment'
  | 'storage'
  | 'network'
  | 'review';
interface StepPropsWithKey extends StepProps {
  key: SessionLauncherStepKey;
}

const SessionLauncherPage = () => {
  const app = App.useApp();
  let sessionMode: SessionMode = 'normal';

  const mainContentDivRef = useAtomValue(mainContentDivRefState);
  const baiClient = useSuspendedBackendaiClient();
  const currentUserRole = useCurrentUserRole();
  const [currentGlobalResourceGroup, setCurrentGlobalResourceGroup] =
    useCurrentResourceGroupState();

  const supportBatchTimeout = baiClient?.supports('batch-timeout') ?? false;

  const [isStartingSession, setIsStartingSession] = useState(false);
  const INITIAL_FORM_VALUES: DeepPartial<SessionLauncherFormValue> = useMemo(
    () => ({
      sessionType: 'interactive',
      // If you set `allocationPreset` to 'custom', `allocationPreset` is not changed automatically any more.
      allocationPreset: 'auto-select',
      hpcOptimization: {
        autoEnabled: true,
      },
      batch: {
        enabled: false,
        command: undefined,
        scheduleDate: undefined,
        ...(supportBatchTimeout && {
          timeoutEnabled: false,
          timeout: undefined,
          timeoutUnit: 's',
        }),
      },
      envvars: [],
      // set default_session_environment only if set
      ...(baiClient._config?.default_session_environment && {
        environments: {
          environment: baiClient._config?.default_session_environment,
        },
      }),
      ...RESOURCE_ALLOCATION_INITIAL_FORM_VALUES,
      resourceGroup: currentGlobalResourceGroup || undefined,
    }),
    [
      baiClient._config?.default_session_environment,
      currentGlobalResourceGroup,
      supportBatchTimeout,
    ],
  );
  const StepParam = withDefault(NumberParam, 0);
  const FormValuesParam = withDefault(JsonParam, INITIAL_FORM_VALUES);
  const AppOptionParam = withDefault(JsonParam, {});
  const [
    {
      step: currentStep,
      formValues: formValuesFromQueryParams,
      redirectTo,
      appOption: appOptionFromQueryParams,
    },
    setQuery,
  ] = useQueryParams({
    step: StepParam,
    formValues: FormValuesParam,
    redirectTo: StringParam,
    appOption: AppOptionParam,
  });
  const { search } = useLocation();

  // const { moveTo } = useWebComponentInfo();
  const webuiNavigate = useWebUINavigate();
  const currentProject = useCurrentProjectValue();

  const [isOpenTemplateModal, { toggle: toggleIsOpenTemplateModal }] =
    useToggle();
  const { upsertNotification } = useSetBAINotification();
  const [, { push: pushSessionHistory }] = useRecentSessionHistory();

  const { run: syncFormToURLWithDebounce } = useDebounceFn(
    () => {
      // console.log('syncFormToURLWithDebounce', form.getFieldsValue());
      // To sync the latest form values to URL,
      // 'trailing' is set to true, and get the form values here."
      const currentValue = form.getFieldsValue();
      setQuery(
        {
          // formValues: form.getFieldsValue(),
          formValues: _.extend(
            _.omit(
              form.getFieldsValue(),
              ['environments.image'],
              ['environments.customizedTag'],
              ['autoMountedFolderNames'],
              ['owner'],
              ['envvars'],
            ),
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

  const [form] = Form.useForm<SessionLauncherFormValue>();

  useEffect(() => {
    if (!_.isEmpty(formValuesFromQueryParams)) {
      form.validateFields().catch((e) => {});
    }
    // Run this memo only for the first time
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

  // before initialFormValues is set, use getFieldValue and useWatch will return undefined
  const sessionType =
    Form.useWatch('sessionType', { form, preserve: true }) ||
    form.getFieldValue('sessionType') ||
    formValuesFromQueryParams.sessionType;

  const steps: Array<StepPropsWithKey> = filterEmptyItem([
    {
      title: t('session.launcher.SessionType'),
      key: 'sessionType',
      // status: form.getFieldError('name').length > 0 ? 'error' : undefined,
    },
    {
      title: `${t('session.launcher.Environments')} & ${t(
        'session.launcher.ResourceAllocation',
      )} `,
      key: 'environment',
    },
    sessionType !== 'inference' && {
      title: t('webui.menu.Data&Storage'),
      key: 'storage',
    },
    {
      title: t('session.launcher.Network'),
      key: 'network',
    },
    {
      title: t('session.launcher.ConfirmAndLaunch'),
      icon: <PlayCircleFilled />,
      // @ts-ignore
      key: 'review',
    },
  ]);

  const currentStepKey = steps[currentStep]?.key;

  const hasError = _.some(
    form.getFieldsError(),
    (item) => item.errors.length > 0,
  );

  const [finalStepLastValidateTime, setFinalStepLastValidateTime] =
    useUpdatableState('first'); // Force re-render after validation in final step.

  useEffect(() => {
    if (currentStep === steps.length - 1) {
      form
        .validateFields()
        .catch((error) => {})
        .finally(() => setFinalStepLastValidateTime());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, form, setFinalStepLastValidateTime, steps.length]);

  useEffect(() => {
    if (finalStepLastValidateTime !== 'first') {
      if (hasError) {
        setValidationTourOpen(true);
      } else {
        setValidationTourOpen(false);
      }
    }
  }, [finalStepLastValidateTime, hasError]);

  const startSession = () => {
    // TODO: support inference mode, support import mode
    setIsStartingSession(true);
    const usedSearchParams = search;
    form
      .validateFields()
      .then(async (values) => {
        if (_.isEmpty(values.mounts) || values.mounts.length === 0) {
          const isConformed = await new Promise((resolve) => {
            app.modal.confirm({
              title: t('session.launcher.NoFolderMounted'),
              content: (
                <>
                  {t('session.launcher.HomeDirectoryDeletionDialog')}
                  <br />
                  <br />
                  {t('session.launcher.LaunchConfirmationDialog')}
                  <br />
                  <br />
                  {t('dialog.ask.DoYouWantToProceed')}
                </>
              ),
              onOk: () => {
                resolve(true);
              },
              okText: t('session.launcher.Start'),
              onCancel: () => {
                resolve(false);
              },
              closable: true,
            });
          });
          if (!isConformed) return;
        }

        // If manual image is selected, use it as kernelName
        const imageFullName =
          values.environments.manual || values.environments.version;
        let [kernelName, architecture] = imageFullName
          ? imageFullName.split('@')
          : ['', ''];

        const sessionName = _.isEmpty(values.sessionName)
          ? generateSessionId()
          : values.sessionName;

        const sessionInfo: CreateSessionInfo = {
          // Basic session information
          sessionName: sessionName,
          kernelName,
          architecture,
          resources: {
            // Project and domain settings
            group_name: values.owner?.enabled
              ? values.owner.project
              : currentProject.name,
            domain: values.owner?.enabled
              ? values.owner.domainName
              : baiClient._config.domainName,

            // Session configuration
            type: values.sessionType,
            cluster_mode: values.cluster_mode,
            cluster_size: values.cluster_size,
            maxWaitSeconds: 15,

            // Owner settings (optional)
            // FYI, `config.scaling_group` also changes based on owner settings
            ...(values.owner?.enabled
              ? {
                  owner_access_key: values.owner.accesskey,
                }
              : {}),

            // Batch mode settings (optional)
            ...(values.sessionType === 'batch'
              ? {
                  starts_at: values.batch.enabled
                    ? values.batch.scheduleDate
                    : undefined,
                  startupCommand: values.batch.command,
                }
              : {}),

            // Bootstrap script (optional)
            ...(values.bootstrap_script
              ? { bootstrap_script: values.bootstrap_script }
              : {}),

            // Batch timeout configuration (optional)
            ...(supportBatchTimeout &&
            values?.batch?.timeoutEnabled &&
            !_.isUndefined(values?.batch?.timeout)
              ? {
                  batchTimeout:
                    _.toString(values.batch.timeout) +
                    values?.batch?.timeoutUnit,
                }
              : undefined),

            config: {
              // Resource allocation
              resources: {
                cpu: values.resource.cpu,
                mem: values.resource.mem,
                // Add accelerator only if specified
                ...(values.resource.accelerator > 0
                  ? {
                      [values.resource.acceleratorType]:
                        values.resource.accelerator,
                    }
                  : undefined),
              },
              scaling_group: values.owner?.enabled
                ? values.owner.project
                : values.resourceGroup,
              resource_opts: {
                shmem:
                  compareNumberWithUnits(values.resource.mem, '4g') > 0 &&
                  compareNumberWithUnits(values.resource.shmem, '1g') < 0
                    ? '1g'
                    : values.resource.shmem,
                // allow_fractional_resource_fragmentation can be added here if needed
              },

              // Storage configuration
              mounts: values.mounts,
              mount_map: values.vfoldersAliasMap,

              // Environment variables
              environ: {
                ..._.fromPairs(
                  values.envvars.map((v) => [v.variable, v.value]),
                ),
                // set hpcOptimization options: "OMP_NUM_THREADS", "OPENBLAS_NUM_THREADS"
                ...(values.hpcOptimization.autoEnabled
                  ? {}
                  : _.omit(values.hpcOptimization, 'autoEnabled')),
              },

              // Networking
              preopen_ports: transformPortValuesToNumbers(values.ports),

              // Agent selection (optional)
              ...(baiClient.supports('agent-select') &&
              !baiClient?._config?.hideAgents &&
              values.agent !== 'auto'
                ? {
                    // Filter out undefined values
                    agent_list: [values.agent].filter(
                      (agent): agent is string => !!agent,
                    ),
                  }
                : undefined),
            },
          },
        };
        const sessionPromises = _.map(
          _.range(values.num_of_sessions || 1),
          (i) => {
            const formattedSessionName =
              (values.num_of_sessions || 1) > 1
                ? `${sessionInfo.sessionName}-${generateRandomString()}-${i}`
                : sessionInfo.sessionName;
            return baiClient
              .createIfNotExists(
                sessionInfo.kernelName,
                formattedSessionName,
                sessionInfo.resources,
                undefined,
                sessionInfo.architecture,
              )
              .then((res: { created: boolean; status: string }) => {
                // // When session is already created with the same name, the status code
                // // is 200, but the response body has 'created' field as false. For better
                // // user experience, we show the notification message.
                if (!res?.created) {
                  // message.warning(t('session.launcher.SessionAlreadyExists'));
                  throw new Error(t('session.launcher.SessionAlreadyExists'));
                }
                if (res?.status === 'CANCELLED') {
                  // Case about failed to start new session kind of "docker image not found" or etc.
                  throw new Error(
                    t('session.launcher.FailedToStartNewSession'),
                  );
                }
                return res;
              })
              .catch((err: any) => {
                if (err?.message?.includes('The session already exists')) {
                  throw new Error(t('session.launcher.SessionAlreadyExists'));
                } else {
                  throw err;
                }
              });
          },
        );
        // After sending a create request, navigate to job page and set current resource group
        setCurrentGlobalResourceGroup(values.resourceGroup);
        const backupTo = window.location.pathname + window.location.search;
        webuiNavigate(redirectTo || '/job');
        upsertNotification({
          key: 'session-launcher:' + sessionName,
          backgroundTask: {
            promise: Promise.all(sessionPromises),
            status: 'pending',
            onChange: {
              pending: t('session.PreparingSession'),
              resolved: t('eduapi.ComputeSessionPrepared'),
            },
          },
          duration: 0,
          message: t('general.Session') + ': ' + sessionName,
          open: true,
        });

        pushSessionHistory({
          params: usedSearchParams,
          name: sessionName,
        });

        await Promise.all(sessionPromises)
          .then(
            ([firstSession]: Array<{
              kernelId?: string;
              sessionId: string;
              sessionName: string;
              servicePorts: Array<{ name: string }>;
            }>) => {
              // After the session is created, add a "See Details" button to navigate to the session page.
              upsertNotification({
                key: 'session-launcher:' + sessionName,
                to: {
                  pathname: '/session',
                  search: new URLSearchParams({
                    sessionDetail: firstSession.sessionId,
                  }).toString(),
                },
              });
              if (
                values.num_of_sessions === 1 &&
                values.sessionType !== 'batch'
              ) {
                const res = firstSession;
                let appOptions: AppOption = _.cloneDeep(
                  appOptionFromQueryParams,
                );
                if ('kernelId' in res) {
                  // API v4
                  appOptions = _.extend(appOptions, {
                    'session-name': res.kernelId,
                    'access-key': '',
                    mode: sessionMode,
                    // mode: this.mode,
                  });
                } else {
                  // API >= v5
                  appOptions = _.extend(appOptions, {
                    'session-uuid': res.sessionId,
                    'session-name': res.sessionName,
                    'access-key': '',
                    mode: sessionMode,
                    // mode: this.mode,
                  });
                }
                const service_info = res.servicePorts;
                if (Array.isArray(service_info) === true) {
                  appOptions['app-services'] = service_info.map(
                    (a: { name: string }) => a.name,
                  );
                } else {
                  appOptions['app-services'] = [];
                }
                // TODO: support import and inference
                // if (sessionMode === 'import') {
                //   appOptions['runtime'] = 'jupyter';
                //   appOptions['filename'] = this.importFilename;
                // }
                // if (sessionMode === 'inference') {
                //   appOptions['runtime'] = appOptions['app-services'].find(
                //     (element: any) => !['ttyd', 'sshd'].includes(element),
                //   );
                // }

                // only launch app when it has valid service ports
                if (service_info.length > 0) {
                  // @ts-ignore
                  globalThis.appLauncher.showLauncher(appOptions);
                }
              }
            },
          )
          .catch(() => {
            upsertNotification({
              key: 'session-launcher:' + sessionName,
              to: backupTo,
              toText: t('button.Edit'),
            });
            // this.metadata_updating = false;
            // console.log(err);
            // if (err && err.message) {
            //   this.notification.text = PainKiller.relieve(err.message);
            //   if (err.description) {
            //     this.notification.text = PainKiller.relieve(err.description);
            //   } else {
            //     this.notification.detail = err.message;
            //   }
            //   this.notification.show(true, err);
            // } else if (err && err.title) {
            //   this.notification.text = PainKiller.relieve(err.title);
            //   this.notification.show(true, err);
            // }
            // const event = new CustomEvent('backend-ai-session-list-refreshed', {
            //   detail: 'running',
            // });
            // document.dispatchEvent(event);
            // this.launchButton.disabled = false;
            // this.launchButtonMessageTextContent = _text(
            //   'session.launcher.ConfirmAndLaunch',
            // );
          });
      })
      .catch((e) => {
        console.log('validation errors', e);
      })
      .finally(() => {
        setIsStartingSession(false);
      });
  };

  const [validationTourOpen, setValidationTourOpen] = useState(false);

  const [isQueryReset, setIsQueryReset] = useState(false);
  useLayoutEffect(() => {
    if (isQueryReset) {
      form.resetFields();
      setIsQueryReset(false);
    }
  }, [isQueryReset, form]);

  return (
    <Flex
      direction="column"
      align="stretch"
      style={{
        justifyContent: 'revert',
        // height: 500,
        // overflow: 'scroll',
      }}
      gap={'md'}
    >
      <style>{customCSS}</style>
      <Flex direction="row" gap="md" align="start">
        <Flex
          direction="column"
          align="stretch"
          style={{ flex: 1, maxWidth: 700 }}
        >
          <Flex direction="row" justify="between">
            <Typography.Title level={4} style={{ marginTop: 0 }}>
              {t('session.launcher.StartNewSession')}
            </Typography.Title>
            <Flex direction="row" gap={'sm'}>
              <Button
                type="link"
                // icon={<BlockOutlined />}
                // disabled
                style={{ paddingRight: 0, paddingLeft: 0 }}
                onClick={() => toggleIsOpenTemplateModal()}
              >
                {t('session.launcher.RecentHistory')}
              </Button>
            </Flex>
          </Flex>
          {/* <Suspense fallback={<FlexActivityIndicator />}> */}
          <Form.Provider
            onFormChange={(name, info) => {
              // console.log('###', name, info);
              // use OnFormChange instead of Form's onValuesChange,
              // because onValuesChange will not be triggered when form is changed programmatically
              syncFormToURLWithDebounce();
            }}
          >
            <Form
              form={form}
              layout="vertical"
              requiredMark="optional"
              initialValues={mergedInitialValues}
            >
              <Flex
                direction="column"
                align="stretch"
                gap="md"
                // style={{  }}
              >
                {/* Step 0 fields */}
                <Card
                  title={t('session.launcher.SessionType')}
                  style={{
                    display:
                      currentStepKey === 'sessionType' ? 'block' : 'none',
                  }}
                >
                  <Form.Item name="sessionType">
                    <Radio.Group
                      options={[
                        {
                          label: (
                            <>
                              <Typography.Text code>
                                {t('session.launcher.InteractiveMode')}
                              </Typography.Text>{' '}
                              <Typography.Text type="secondary">
                                {t('session.launcher.InteractiveModeDesc')}
                              </Typography.Text>
                            </>
                          ),
                          value: 'interactive',
                        },
                        {
                          label: (
                            <>
                              <Typography.Text code>
                                {t('session.launcher.BatchMode')}
                              </Typography.Text>{' '}
                              <Typography.Text type="secondary">
                                {t('session.launcher.BatchModeDesc')}
                              </Typography.Text>
                            </>
                          ),
                          value: 'batch',
                        },
                      ]}
                    />
                    {/* <Segmented
                      width={100}
                      options={[
                        {
                          label: (
                            <SessionTypeItem
                              title="🏃‍♀️ Make, test and run"
                              description="Interactive mode allows you to create, test and run code interactively via jupyter notebook, visual studio code, etc."
                            />
                          ),
                          value: 'interactive',
                        },
                        {
                          label: (
                            <SessionTypeItem
                              title="⌚️ Start an long-running task"
                              description="Batch mode runs your code with multiple node & clusters to scale your idea"
                            />
                          ),
                          value: 'batch',
                        },
                        // {
                        //   label: (
                        //     <SessionTypeItem
                        //       title="🤖 Run a inference service"
                        //       description="Inference allow you dynamically scale your mode service"
                        //     />
                        //   ),
                        //   value: 'inference',
                        // },
                      ]}
                    /> */}
                  </Form.Item>
                  <SessionNameFormItem />
                  <Form.Item
                    name="bootstrap_script"
                    label="Bootstrap Script"
                    hidden
                  >
                    <Input />
                  </Form.Item>
                </Card>

                {sessionType === 'batch' && (
                  <Card
                    title={t('session.launcher.BatchModeConfig')}
                    style={{
                      display:
                        currentStepKey === 'sessionType' ? 'block' : 'none',
                    }}
                  >
                    <Form.Item
                      label={t('session.launcher.StartUpCommand')}
                      name={['batch', 'command']}
                      rules={[
                        {
                          required: true,
                          type: 'string',
                        },
                      ]}
                    >
                      <Input.TextArea autoSize />
                    </Form.Item>
                    <Form.Item
                      noStyle
                      dependencies={[['batch', 'scheduleDate']]}
                    >
                      {() => {
                        const scheduleDate = form.getFieldValue([
                          'batch',
                          'scheduleDate',
                        ]);
                        return (
                          <BAIIntervalView
                            delay={1000}
                            callback={() => {
                              const scheduleDate = form.getFieldValue([
                                'batch',
                                'scheduleDate',
                              ]);
                              if (scheduleDate) {
                                if (dayjs(scheduleDate).isBefore(dayjs())) {
                                  if (
                                    form.getFieldError([
                                      'batch',
                                      'scheduleDate',
                                    ]).length === 0
                                  ) {
                                    form.validateFields([
                                      ['batch', 'scheduleDate'],
                                    ]);
                                  }
                                  return undefined;
                                } else {
                                  return dayjs(scheduleDate).fromNow();
                                }
                              } else {
                                return undefined;
                              }
                            }}
                            triggerKey={scheduleDate ? scheduleDate : 'none'}
                            render={(time) => {
                              return (
                                <Form.Item
                                  label={t('session.launcher.SessionStartTime')}
                                  extra={time}
                                >
                                  <Flex direction="row" gap={'xs'}>
                                    <Form.Item
                                      noStyle
                                      name={['batch', 'enabled']}
                                      valuePropName="checked"
                                    >
                                      <Checkbox
                                        onChange={(e) => {
                                          if (
                                            e.target.checked &&
                                            _.isEmpty(
                                              form.getFieldValue([
                                                'batch',
                                                'scheduleDate',
                                              ]),
                                            )
                                          ) {
                                            form.setFieldValue(
                                              ['batch', 'scheduleDate'],
                                              dayjs()
                                                .add(2, 'minutes')
                                                .toISOString(),
                                            );
                                          } else if (
                                            e.target.checked === false
                                          ) {
                                            form.setFieldValue(
                                              ['batch', 'scheduleDate'],
                                              undefined,
                                            );
                                          }
                                          form.validateFields([
                                            ['batch', 'scheduleDate'],
                                          ]);
                                        }}
                                      >
                                        {t('session.launcher.Enable')}
                                      </Checkbox>
                                    </Form.Item>
                                    <Form.Item
                                      noStyle
                                      // dependencies={[['batch', 'enabled']]}
                                      shouldUpdate={(prev, next) => {
                                        return (
                                          // @ts-ignore
                                          prev.batch?.enabled !==
                                          next.batch?.enabled
                                        );
                                      }}
                                    >
                                      {() => {
                                        const disabled =
                                          form.getFieldValue('batch')
                                            ?.enabled !== true;
                                        return (
                                          <>
                                            <Form.Item
                                              name={['batch', 'scheduleDate']}
                                              noStyle
                                              rules={[
                                                {
                                                  // required: true,
                                                  validator: async (
                                                    rule,
                                                    value,
                                                  ) => {
                                                    if (
                                                      value &&
                                                      dayjs(value).isBefore(
                                                        dayjs(),
                                                      )
                                                    ) {
                                                      return Promise.reject(
                                                        t(
                                                          'session.launcher.StartTimeMustBeInTheFuture',
                                                        ),
                                                      );
                                                    }
                                                    return Promise.resolve();
                                                  },
                                                },
                                              ]}
                                            >
                                              <DatePickerISO
                                                disabled={disabled}
                                                showTime
                                                localFormat
                                                disabledDate={(value) => {
                                                  return value.isBefore(
                                                    dayjs().startOf('day'),
                                                  );
                                                }}
                                              />
                                            </Form.Item>
                                            {/* <Form.Item
                                              noStyle
                                              name={['batch', 'scheduleTime']}
                                            >
                                              <TimePicker disabled={disabled} />
                                            </Form.Item> */}
                                          </>
                                        );
                                      }}
                                    </Form.Item>
                                  </Flex>
                                </Form.Item>
                              );
                            }}
                          />
                        );
                      }}
                    </Form.Item>

                    {supportBatchTimeout ? (
                      <Form.Item
                        noStyle
                        dependencies={[
                          ['batch', 'timeoutEnabled'],
                          ['batch', 'timeoutUnit'],
                        ]}
                      >
                        {() => {
                          const timeout = form.getFieldValue([
                            'batch',
                            'timeout',
                          ]);
                          const unit = form.getFieldValue([
                            'batch',
                            'timeoutUnit',
                          ]);

                          const timeDuration = dayjs.duration(
                            timeout,
                            unit ?? 's',
                          );

                          const formattedDuration = formatDuration(
                            timeDuration,
                            t,
                          );

                          const durationText =
                            !_.isNull(timeout) && _.toFinite(timeout) > 0
                              ? formattedDuration
                              : null;
                          return (
                            <Form.Item
                              label={t(
                                'session.launcher.BatchJobTimeoutDuration',
                              )}
                              tooltip={t(
                                'session.launcher.BatchJobTimeoutDurationDesc',
                              )}
                              // extra={durationText}
                              help={durationText}
                            >
                              <Flex direction="row" gap={'xs'}>
                                <Form.Item
                                  noStyle
                                  name={['batch', 'timeoutEnabled']}
                                  valuePropName="checked"
                                >
                                  <Checkbox
                                    onChange={(e) => {
                                      if (e.target.checked === false) {
                                        form.setFieldValue(
                                          ['batch', 'timeout'],
                                          undefined,
                                        );
                                      }
                                      form.validateFields([
                                        ['batch', 'timeout'],
                                      ]);
                                    }}
                                  >
                                    {t('session.launcher.Enable')}
                                  </Checkbox>
                                </Form.Item>
                                <Form.Item
                                  noStyle
                                  dependencies={[['batch', 'timeoutEnabled']]}
                                >
                                  {() => {
                                    const disabled =
                                      form.getFieldValue([
                                        'batch',
                                        'timeoutEnabled',
                                      ]) !== true;
                                    return (
                                      <>
                                        <Form.Item
                                          name={['batch', 'timeout']}
                                          label={t(
                                            'session.launcher.BatchJobTimeoutDuration',
                                          )}
                                          noStyle
                                          rules={[
                                            {
                                              min: 0,
                                              type: 'number',
                                              message: t(
                                                'error.AllowsPositiveNumberOnly',
                                              ),
                                            },
                                            {
                                              required: !disabled,
                                            },
                                          ]}
                                        >
                                          <InputNumber
                                            disabled={disabled}
                                            min={1}
                                            addonAfter={
                                              <Form.Item
                                                noStyle
                                                name={['batch', 'timeoutUnit']}
                                              >
                                                <Select
                                                  tabIndex={-1}
                                                  style={{ minWidth: 75 }}
                                                  options={[
                                                    {
                                                      label: t('time.Sec'),
                                                      value: 's',
                                                    },
                                                    {
                                                      label: t('time.Min'),
                                                      value: 'm',
                                                    },
                                                    {
                                                      label: t('time.Hour'),
                                                      value: 'h',
                                                    },
                                                    {
                                                      label: t('time.Day'),
                                                      value: 'd',
                                                    },
                                                    {
                                                      label: t('time.Week'),
                                                      value: 'w',
                                                    },
                                                  ]}
                                                />
                                              </Form.Item>
                                            }
                                          />
                                        </Form.Item>
                                      </>
                                    );
                                  }}
                                </Form.Item>
                              </Flex>
                            </Form.Item>
                          );
                        }}
                      </Form.Item>
                    ) : null}
                  </Card>
                )}

                {(currentUserRole === 'admin' ||
                  currentUserRole === 'superadmin') && (
                  <SessionOwnerSetterCard
                    style={{
                      display:
                        currentStepKey === 'sessionType' ? 'block' : 'none',
                    }}
                  />
                )}

                {sessionType === 'inference' && (
                  <Card title="Inference Mode Configuration">
                    <Form.Item
                      name={['inference', 'vFolderName']}
                      label={t('session.launcher.ModelStorageToMount')}
                      rules={[
                        {
                          required: true,
                        },
                      ]}
                    >
                      <Select />
                      {/* <VFolderSelect
                          filter={(vf) => vf.usage_mode === 'model'}
                          autoSelectDefault
                          /> */}
                    </Form.Item>
                  </Card>
                )}

                {/* Step Start*/}
                <Card
                  title={t('session.launcher.Environments')}
                  style={{
                    display:
                      currentStepKey === 'environment' ? 'block' : 'none',
                  }}
                >
                  <ErrorBoundary
                    fallbackRender={(e) => {
                      console.log(e);
                      return null;
                    }}
                  >
                    <ImageEnvironmentSelectFormItems />
                  </ErrorBoundary>
                  <Form.Item label={t('session.launcher.EnvironmentVariable')}>
                    <EnvVarFormList
                      name={'envvars'}
                      formItemProps={{
                        validateTrigger: ['onChange', 'onBlur'],
                      }}
                    />
                  </Form.Item>
                </Card>
                <Card
                  title={t('session.launcher.ResourceAllocation')}
                  style={{
                    display:
                      currentStepKey === 'environment' ? 'block' : 'none',
                  }}
                >
                  <ResourceAllocationFormItems
                    enableAgentSelect={
                      !baiClient._config.hideAgents &&
                      baiClient.supports('agent-select')
                    }
                    enableNumOfSessions
                    enableResourcePresets
                    showRemainingWarning
                  />
                </Card>
                <Card
                  title={t('session.launcher.HPCOptimization')}
                  style={{
                    display:
                      currentStepKey === 'environment' ? 'block' : 'none',
                  }}
                >
                  <Form.Item noStyle>
                    <Flex direction="row" gap={'sm'}>
                      <Typography.Text>
                        {t('session.launcher.SwitchOpenMPoptimization')}
                      </Typography.Text>
                      <Form.Item
                        label={t('session.launcher.SwitchOpenMPoptimization')}
                        name={['hpcOptimization', 'autoEnabled']}
                        valuePropName="checked"
                        required
                        noStyle
                      >
                        <Switch
                          checkedChildren={'ON'}
                          unCheckedChildren={'OFF'}
                          onChange={(checked) => {
                            if (checked) {
                              form.setFieldsValue({
                                hpcOptimization: {
                                  autoEnabled: true,
                                  OMP_NUM_THREADS: undefined,
                                  OPENBLAS_NUM_THREADS: undefined,
                                },
                              });
                            } else {
                              form.setFieldsValue({
                                hpcOptimization: {
                                  autoEnabled: false,
                                  OMP_NUM_THREADS: '1',
                                  OPENBLAS_NUM_THREADS: '1',
                                },
                              });
                            }
                          }}
                        />
                      </Form.Item>
                    </Flex>
                  </Form.Item>
                  <Form.Item
                    noStyle
                    shouldUpdate={(prev, next) => {
                      return (
                        prev.hpcOptimization?.autoEnabled !==
                        next.hpcOptimization?.autoEnabled
                      );
                    }}
                  >
                    {() => {
                      const enabled = form.getFieldValue([
                        'hpcOptimization',
                        'autoEnabled',
                      ]);
                      return (
                        <Row
                          gutter={token.marginMD}
                          style={{
                            display: enabled ? 'none' : undefined,
                            marginTop: token.marginMD,
                          }}
                        >
                          <Col xs={24} sm={12}>
                            <Form.Item
                              style={{ flex: 1 }}
                              label={t('session.launcher.NumOpenMPthreads')}
                              name={['hpcOptimization', 'OMP_NUM_THREADS']}
                              tooltip={
                                <>
                                  {t('session.launcher.OpenMPOptimization')}
                                  <Trans
                                    i18nKey={
                                      'session.launcher.DescOpenMPOptimization'
                                    }
                                  />
                                </>
                              }
                              required
                            >
                              <InputNumber
                                min={1}
                                max={1000}
                                step={1}
                                stringMode
                                style={{ width: '100%' }}
                              />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12}>
                            <Form.Item
                              style={{ flex: 1 }}
                              label={t('session.launcher.NumOpenBLASthreads')}
                              name={['hpcOptimization', 'OPENBLAS_NUM_THREADS']}
                              tooltip={
                                <>
                                  {t('session.launcher.OpenMPOptimization')}
                                  <Trans
                                    i18nKey={
                                      'session.launcher.DescOpenMPOptimization'
                                    }
                                  />
                                </>
                              }
                              required
                            >
                              <InputNumber
                                min={1}
                                max={1000}
                                step={1}
                                stringMode
                                style={{ width: '100%' }}
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      );
                    }}
                  </Form.Item>
                </Card>
                {/* Step Start*/}
                <Card
                  title={t('webui.menu.Data&Storage')}
                  style={{
                    display: currentStepKey === 'storage' ? 'block' : 'none',
                  }}
                >
                  <Form.Item noStyle dependencies={['owner']}>
                    {({ getFieldValue }) => {
                      const ownerInfo = getFieldValue('owner');
                      const isValidOwner =
                        ownerInfo?.enabled &&
                        _.every(_.omit(ownerInfo, 'enabled'), (key, value) => {
                          return key !== undefined;
                        });

                      return (
                        <VFolderTableFormItem
                          filter={(vfolder) => {
                            return (
                              vfolder.status === 'ready' &&
                              !vfolder.name?.startsWith('.')
                            );
                          }}
                          tableProps={{
                            ownerEmail: isValidOwner
                              ? ownerInfo?.email
                              : undefined,
                          }}
                        />
                      );
                    }}
                  </Form.Item>
                  {/* <VFolderTable /> */}
                </Card>

                {/* Step Start*/}
                <Card
                  title={t('session.launcher.Network')}
                  style={{
                    display: currentStepKey === 'network' ? 'block' : 'none',
                  }}
                >
                  <PortSelectFormItem />
                </Card>

                {/* Step Start*/}
                {currentStepKey === 'review' && (
                  <SessionLauncherPreview
                    onClickEditStep={(stepKey) => {
                      const nextStep = _.findIndex(steps, { key: stepKey });
                      setCurrentStep(nextStep);
                    }}
                  />
                )}

                <Flex direction="row" justify="between">
                  <Flex gap={'sm'}>
                    <Popconfirm
                      title={t('button.Reset')}
                      description={t('session.launcher.ResetFormConfirm')}
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
                    {/* {currentStep === steps.length - 1 && (
                      <Button
                        icon={<SaveOutlined />}
                        disabled
                        onClick={() => {
                          message.info(
                            'Not implemented yet: Template edit modal',
                          );
                        }}
                      >
                        Save as a template
                      </Button>
                    )} */}
                  </Flex>
                  <Flex
                    data-test-id="neo-session-launcher-tour-step-navigation"
                    direction="row"
                    gap="sm"
                  >
                    {currentStep > 0 && (
                      <Button
                        onClick={() => {
                          setCurrentStep(currentStep - 1);
                        }}
                        icon={<LeftOutlined />}
                        disabled={isStartingSession}
                      >
                        {t('button.Previous')}
                      </Button>
                    )}
                    {currentStep === steps.length - 1 ? (
                      <Tooltip
                        title={
                          hasError
                            ? t('session.launcher.PleaseCompleteForm')
                            : undefined
                        }
                      >
                        <Button
                          type="primary"
                          icon={<PlayCircleOutlined />}
                          disabled={hasError}
                          onClick={startSession}
                          loading={isStartingSession}
                        >
                          {t('session.launcher.Launch')}
                        </Button>
                      </Tooltip>
                    ) : (
                      <Button
                        type="primary"
                        ghost
                        onClick={() => {
                          setCurrentStep(currentStep + 1);
                        }}
                      >
                        {t('button.Next')} <RightOutlined />
                      </Button>
                    )}
                    {currentStep !== steps.length - 1 && (
                      <Button
                        onClick={() => {
                          setCurrentStep(steps.length - 1);
                        }}
                      >
                        {t('session.launcher.SkipToConfirmAndLaunch')}
                        <DoubleRightOutlined />
                      </Button>
                    )}
                  </Flex>
                </Flex>
              </Flex>
            </Form>
          </Form.Provider>
          {/* </Suspense> */}
        </Flex>
        {screens.lg && (
          <Flex
            data-test-id="neo-session-launcher-tour-step"
            style={{ position: 'sticky', top: 80 }}
          >
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
          </Flex>
        )}
      </Flex>
      <SessionTemplateModal
        onRequestClose={(formValue) => {
          if (formValue) {
            const fieldsValue = _.merge(
              {
                // reset fields related to optional and nested fields
                sessionName: '',
                ports: [],
                mounts: [],
                vfoldersAliasMap: {},
                bootstrap_script: '',
                num_of_sessions: 1,
                owner: {
                  enabled: false,
                  accesskey: '',
                  domainName: '',
                  email: undefined,
                  project: '',
                  resourceGroup: '',
                },
                environments: {
                  manual: '',
                },
                batch: {
                  enabled: false,
                  command: undefined,
                  scheduleDate: undefined,
                },
                agent: 'auto', // Add the missing 'agent' property
              } as Omit<
                Required<OptionalFieldsOnly<SessionLauncherFormValue>>,
                'autoMountedFolderNames'
              >,
              formValue,
            );

            if (!_.isEmpty(fieldsValue.sessionName)) {
              fieldsValue.sessionName =
                fieldsValue.sessionName + '-' + generateRandomString(4);
            }
            form.setFieldsValue(fieldsValue);
            setCurrentStep(steps.length - 1);
            form.validateFields().catch(() => {});
          }
          toggleIsOpenTemplateModal();
        }}
        open={isOpenTemplateModal}
      />
      {currentStep === steps.length - 1 ? (
        <ErrorBoundary fallback={null}>
          <SessionLauncherValidationTour
            open={validationTourOpen}
            onClose={() => {
              setValidationTourOpen(false);
            }}
            scrollIntoViewOptions
          />
        </ErrorBoundary>
      ) : undefined}
    </Flex>
  );
};

type FormOrResourceRequired = {
  resource: ResourceAllocationFormValue['resource'];
  containerCount?: number;
};

export const ResourceNumbersOfSession: React.FC<FormOrResourceRequired> = ({
  resource,
  containerCount = 1,
}) => {
  return (
    <>
      {_.map(
        _.omit(resource, 'shmem', 'accelerator', 'acceleratorType'),
        (value, type) => {
          return value === '0' ? null : (
            <ResourceNumber
              key={type}
              // @ts-ignore
              type={type}
              value={
                type === 'mem'
                  ? (convertToBinaryUnit(value.toString(), '')?.number || 0) *
                      containerCount +
                    ''
                  : _.toNumber(value) * containerCount + ''
              }
              opts={{
                shmem: resource.shmem
                  ? (convertToBinaryUnit(resource.shmem, '')?.number || 0) *
                    containerCount
                  : undefined,
              }}
            />
          );
        },
      )}
      {resource &&
      resource.accelerator &&
      resource.acceleratorType &&
      _.isNumber(resource.accelerator) ? (
        <ResourceNumber
          // @ts-ignore
          type={resource.acceleratorType}
          value={_.toString(resource.accelerator * containerCount)}
        />
      ) : null}
    </>
  );
};

const generateSessionId = () => {
  let text = '';
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 8; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text + '-session';
};

export default SessionLauncherPage;
