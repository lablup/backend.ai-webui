import BAICard from '../BAICard';
import BAIIntervalText from '../components/BAIIntervalText';
import DatePickerISO from '../components/DatePickerISO';
import DoubleTag from '../components/DoubleTag';
import EnvVarFormList, {
  EnvVarFormListValue,
} from '../components/EnvVarFormList';
import Flex from '../components/Flex';
import ImageEnvironmentSelectFormItems, {
  ImageEnvironmentFormInput,
} from '../components/ImageEnvironmentSelectFormItems';
import ImageMetaIcon from '../components/ImageMetaIcon';
import { mainContentDivRefState } from '../components/MainLayout/MainLayout';
import PortSelectFormItem, {
  PortSelectFormValues,
  PortTag,
} from '../components/PortSelectFormItem';
import ResourceAllocationFormItems, {
  RESOURCE_ALLOCATION_INITIAL_FORM_VALUES,
  ResourceAllocationFormValue,
} from '../components/ResourceAllocationFormItems';
import ResourceNumber from '../components/ResourceNumber';
import SessionNameFormItem, {
  SessionNameFormItemValue,
} from '../components/SessionNameFormItem';
import VFolderTableFromItem, {
  VFolderTableFormValues,
} from '../components/VFolderTableFormItem';
import { compareNumberWithUnits, iSizeToSize } from '../helper';
import {
  useCurrentProjectValue,
  useSuspendedBackendaiClient,
  useWebUINavigate,
} from '../hooks';
import { useSetBAINotification } from '../hooks/useBAINotification';
import { useThemeMode } from '../hooks/useThemeMode';
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
import { useDebounceFn } from 'ahooks';
import {
  Alert,
  App,
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  Col,
  Descriptions,
  Form,
  FormInstance,
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
  Table,
  Tag,
  Typography,
  theme,
} from 'antd';
import dayjs from 'dayjs';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { useRecoilValue } from 'recoil';
import {
  JsonParam,
  NumberParam,
  StringParam,
  useQueryParams,
  withDefault,
} from 'use-query-params';

const INITIAL_FORM_VALUES: SessionLauncherValue = {
  sessionType: 'interactive',
  // If you set `allocationPreset` to 'custom', `allocationPreset` is not changed automatically any more.
  allocationPreset: 'auto-preset',
  hpcOptimization: {
    autoEnabled: true,
    OMP_NUM_THREADS: '1',
    OPENBLAS_NUM_THREADS: '1',
  },
  batch: {
    enabled: false,
    command: undefined,
    scheduleDate: undefined,
  },
  envvars: [],
  ...RESOURCE_ALLOCATION_INITIAL_FORM_VALUES,
};
const stepParam = withDefault(NumberParam, 0);
const formValuesParam = withDefault(JsonParam, INITIAL_FORM_VALUES);

interface SessionConfig {
  group_name: string;
  domain: string;
  scaling_group: string;
  type: string;
  cluster_mode: string;
  cluster_size: number;
  maxWaitSeconds: number;
  cpu: number;
  mem: string;
  shmem: string;
  mounts: string[];
  mount_map: {
    [key: string]: string;
  };
  env: {
    [key: string]: string;
  };
  preopen_ports: number[];
  startsAt?: string;
  startupCommand?: string;
}

interface CreateSessionInfo {
  kernelName: string;
  sessionName: string;
  architecture: string;
  config: SessionConfig;
}

interface SessionLauncherValue {
  sessionType: 'interactive' | 'batch' | 'inference';
  batch: {
    enabled: boolean;
    scheduleDate?: string;
    command?: string;
  };
  allocationPreset: string;
  envvars: EnvVarFormListValue[];
  hpcOptimization: {
    autoEnabled: boolean;
    OMP_NUM_THREADS: string;
    OPENBLAS_NUM_THREADS: string;
  };
}

type SessionLauncherFormValue = SessionLauncherValue &
  SessionNameFormItemValue &
  ImageEnvironmentFormInput &
  ResourceAllocationFormValue &
  VFolderTableFormValues &
  PortSelectFormValues;

type SessionMode = 'normal' | 'inference' | 'import';
const SessionLauncherPage = () => {
  const app = App.useApp();
  let sessionMode: SessionMode = 'normal';

  const mainContentDivRef = useRecoilValue(mainContentDivRefState);

  const [isStartingSession, setIsStartingSession] = useState(false);
  const [
    { step: currentStep, formValues: formValuesFromQueryParams, redirectTo },
    setQuery,
  ] = useQueryParams({
    step: stepParam,
    formValues: formValuesParam,
    redirectTo: StringParam,
  });

  const { isDarkMode } = useThemeMode();
  const navigate = useNavigate();
  // const { moveTo } = useWebComponentInfo();
  const webuiNavigate = useWebUINavigate();
  const baiClient = useSuspendedBackendaiClient();
  const currentProject = useCurrentProjectValue();

  const { upsertNotification } = useSetBAINotification();

  const { run: syncFormToURLWithDebounce } = useDebounceFn(
    () => {
      // console.log('syncFormToURLWithDebounce', form.getFieldsValue());
      // To sync the latest form values to URL,
      // 'trailing' is set to true, and get the form values here."
      setQuery(
        {
          // formValues: form.getFieldsValue(),
          formValues: _.omit(
            form.getFieldsValue(),
            ['environments.image'],
            ['environments.customizedTag'],
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

  // After first render, set fields value using query params if it is NOT same as initial values
  useEffect(() => {
    if (
      // if form is changed, validate it to show error on the first render
      JSON.stringify(INITIAL_FORM_VALUES) !==
      JSON.stringify(formValuesFromQueryParams)
    ) {
      form.setFieldsValue(formValuesFromQueryParams);
      form.validateFields().catch((e) => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const steps = _.filter(
    [
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
        icon: (
          <PlayCircleFilled />
          // <Flex
          //   align="center"
          //   justify="center"
          //   style={{
          //     // border: '1px solid gray',
          //     backgroundColor: '#E8E7E7',
          //     width: 24,
          //     height: 24,
          //     borderRadius: 12,
          //     fontSize: 16,
          //   }}
          // >
          //   <CaretRightOutlined />
          // </Flex>
        ),
        // @ts-ignore
        key: 'review',
      },
    ] as StepProps[],
    (v) => !!v,
  );

  const currentStepKey:
    | 'sessionType'
    | 'environment'
    | 'storage'
    | 'network'
    // @ts-ignore
    | 'review' = steps[currentStep]?.key;

  const hasError = _.some(
    form.getFieldsError(),
    (item) => item.errors.length > 0,
  );

  // console.log(form.getFieldError(['resource', 'shmem']));
  // console.log(form.getFieldValue(['resource']));

  const moveToPreview = () => {
    form
      .validateFields()
      .catch((e) => {})
      .finally(() => {
        setCurrentStep(steps.length - 1);
      });
  };

  const startSession = () => {
    // TODO: support inference mode, support import mode

    setIsStartingSession(true);
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
          kernelName,
          architecture,
          sessionName: sessionName,
          config: {
            type: values.sessionType,

            ...(values.sessionType === 'batch'
              ? {
                  startsAt: values.batch.enabled
                    ? values.batch.scheduleDate
                    : undefined,
                  startupCommand: values.batch.command,
                }
              : {}),

            // TODO: support change owner
            group_name: currentProject.name,
            domain: baiClient._config.domainName,
            scaling_group: values.resourceGroup,
            ///////////////////////////

            cluster_mode: values.cluster_mode,
            cluster_size: values.cluster_size,
            maxWaitSeconds: 15,
            cpu: values.resource.cpu,
            mem: values.resource.mem,
            shmem:
              compareNumberWithUnits(values.resource.mem, '4g') > 0 &&
              compareNumberWithUnits(values.resource.shmem, '1g') < 0
                ? '1g'
                : values.resource.shmem,
            ...(values.resource.accelerator > 0
              ? {
                  [values.resource.acceleratorType]:
                    values.resource.accelerator,
                }
              : undefined),
            mounts: values.mounts,
            mount_map: values.vfoldersAliasMap,

            env: {
              ..._.fromPairs(values.envvars.map((v) => [v.variable, v.value])),
              // set hpcOptimization options: "OMP_NUM_THREADS", "OPENBLAS_NUM_THREADS"
              ..._.omit(values.hpcOptimization, 'autoEnabled'),
            },
            preopen_ports: _.map(values.ports, (v) => parseInt(v)),
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
                sessionInfo.config,
                20000,
                sessionInfo.architecture,
              )
              .then((res: { created: boolean }) => {
                // // When session is already created with the same name, the status code
                // // is 200, but the response body has 'created' field as false. For better
                // // user experience, we show the notification message.
                if (!res?.created) {
                  // message.warning(t('session.launcher.SessionAlreadyExists'));
                  throw new Error(t('session.launcher.SessionAlreadyExists'));
                }
                return res;
              })
              .catch((err: any) => {
                console.log(err);
                throw err;
                // console.log(err);
                // if (err && err.message) {
                //   if ('statusCode' in err && err.statusCode === 408) {
                //     this.notification.text = _text(
                //       'session.launcher.sessionStillPreparing',
                //     );
                //   } else {
                //     if (err.description) {
                //       this.notification.text = PainKiller.relieve(err.description);
                //     } else {
                //       this.notification.text = PainKiller.relieve(err.message);
                //     }
                //   }
                //   this.notification.detail = err.message;
                //   this.notification.show(true, err);
                // } else if (err && err.title) {
                //   this.notification.text = PainKiller.relieve(err.title);
                //   this.notification.show(true, err);
                // }
              });
          },
        );
        // console.log('##', values.mounts);
        // console.log(sessionInfo);
        webuiNavigate(redirectTo || '/job');
        upsertNotification({
          key: 'session-launcher:' + sessionName,
          backgroundTask: {
            promise: Promise.all(sessionPromises),
            status: 'pending',
            statusDescriptions: {
              pending: t('session.PreparingSession'),
              resolved: t('eduapi.ComputeSessionPrepared'),
            },
          },
          message: t('general.Session') + ': ' + sessionName,
          open: true,
        });
        await Promise.all(sessionPromises)
          .then(([firstSession]) => {
            // console.log('##sessionPromises', firstSession);
            if (
              values.num_of_sessions === 1 &&
              values.sessionType !== 'batch'
            ) {
              const res = firstSession;
              let appOptions: {
                [key in string]: any;
              };
              if ('kernelId' in res) {
                // API v4
                appOptions = {
                  'session-name': res.kernelId,
                  'access-key': '',
                  mode: sessionMode,
                  // mode: this.mode,
                };
              } else {
                // API >= v5
                appOptions = {
                  'session-uuid': res.sessionId,
                  'session-name': res.sessionName,
                  'access-key': '',
                  mode: sessionMode,
                  // mode: this.mode,
                };
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
          })
          .catch(() => {
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
      {redirectTo && (
        <Breadcrumb
          items={[
            {
              title: t('webui.menu.Sessions'),
              onClick: (e) => {
                e.preventDefault();
                webuiNavigate(redirectTo);
              },
              href: redirectTo,
            },
            {
              title: t('session.launcher.StartNewSession'),
            },
          ]}
        />
      )}
      <Flex direction="row" gap="md" align="start">
        <Flex
          direction="column"
          align="stretch"
          style={{ flex: 1, maxWidth: 700 }}
        >
          {/* <Flex direction="row" justify="between">
            <Typography.Title level={3} style={{ marginTop: 0 }}>
              {t('session.launcher.StartNewSession')}
            </Typography.Title>
            <Flex direction="row" gap={'sm'}>
              <Button
                type="link"
                icon={<BlockOutlined />}
                disabled
                style={{ paddingRight: 0, paddingLeft: 0 }}
              >
                {t('session.launcher.TemplateAndHistory')}
              </Button>
            </Flex>
          </Flex> */}
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
              initialValues={INITIAL_FORM_VALUES}
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
                      className="session-type-radio-group"
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
                      label={t('session.launcher.SessionStartTime')}
                      extra={
                        <Form.Item
                          noStyle
                          shouldUpdate={(prev, next) =>
                            prev.batch.scheduleDate !== next.batch.scheduleDate
                          }
                        >
                          {() => {
                            const scheduleDate = form.getFieldValue([
                              'batch',
                              'scheduleDate',
                            ]);
                            return (
                              <BAIIntervalText
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
                                triggerKey={
                                  scheduleDate ? scheduleDate : 'none'
                                }
                              />
                            );
                          }}
                        </Form.Item>
                      }
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
                                  form.getFieldValue(['batch', 'scheduleDate']),
                                )
                              ) {
                                form.setFieldValue(
                                  ['batch', 'scheduleDate'],
                                  dayjs().add(2, 'minutes').toISOString(),
                                );
                              } else if (e.target.checked === false) {
                                form.setFieldValue(
                                  ['batch', 'scheduleDate'],
                                  undefined,
                                );
                              }
                              form.validateFields([['batch', 'scheduleDate']]);
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
                              prev.batch?.enabled !== next.batch?.enabled
                            );
                          }}
                        >
                          {() => {
                            const disabled =
                              form.getFieldValue('batch')?.enabled !== true;
                            return (
                              <>
                                <Form.Item
                                  name={['batch', 'scheduleDate']}
                                  noStyle
                                  rules={[
                                    {
                                      // required: true,
                                      validator: async (rule, value) => {
                                        if (
                                          value &&
                                          dayjs(value).isBefore(dayjs())
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
                  </Card>
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
                    enableNumOfSessions
                    enableResourcePresets
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
                              form.setFieldsValue(
                                _.pick(INITIAL_FORM_VALUES, [
                                  'hpcOptimization',
                                ]),
                              );
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
                                min={0}
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
                                min={0}
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
                  <VFolderTableFromItem
                    filter={(vfolder) => {
                      return vfolder.status === 'ready';
                    }}
                  />
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
                  <>
                    <BAICard
                      title={t('session.launcher.SessionType')}
                      size="small"
                      status={
                        form.getFieldError('sessionName').length > 0 ||
                        form.getFieldError(['batch', 'command']).length > 0 ||
                        form.getFieldError(['batch', 'scheduleDate']).length > 0
                          ? 'error'
                          : undefined
                      }
                      extraButtonTitle={t('button.Edit')}
                      onClickExtraButton={() => {
                        setCurrentStep(
                          // @ts-ignore
                          steps.findIndex((v) => v.key === 'sessionType'),
                        );
                      }}
                      // extra={
                      //   <Button
                      //     type="link"
                      //     onClick={() => {
                      //       setCurrentStep(
                      //         // @ts-ignore
                      //         steps.findIndex((v) => v.key === 'sessionType'),
                      //       );
                      //     }}
                      //     icon={
                      //       form.getFieldError('name').length > 0 && (
                      //         <ExclamationCircleTwoTone
                      //           twoToneColor={token.colorError}
                      //         />
                      //       )
                      //     }
                      //   >
                      //     {t('button.Edit')}
                      //   </Button>
                      // }
                    >
                      <Descriptions size="small" column={1}>
                        <Descriptions.Item label={t('session.SessionType')}>
                          {form.getFieldValue('sessionType')}
                        </Descriptions.Item>
                        {!_.isEmpty(form.getFieldValue('sessionName')) && (
                          <Descriptions.Item
                            label={t('session.launcher.SessionName')}
                          >
                            {form.getFieldValue('sessionName')}
                          </Descriptions.Item>
                        )}
                        {sessionType === 'batch' && (
                          <>
                            <Descriptions.Item
                              label={t('session.launcher.StartUpCommand')}
                            >
                              {form.getFieldValue(['batch', 'command']) ? (
                                <SyntaxHighlighter
                                  style={isDarkMode ? dark : undefined}
                                  language="shell"
                                  customStyle={{
                                    margin: 0,
                                    width: '100%',
                                  }}
                                >
                                  {form.getFieldValue(['batch', 'command'])}
                                </SyntaxHighlighter>
                              ) : (
                                <Typography.Text type="secondary">
                                  {t('general.None')}
                                </Typography.Text>
                              )}
                            </Descriptions.Item>
                            <Descriptions.Item
                              label={t('session.launcher.ScheduleTimeSimple')}
                            >
                              {form.getFieldValue(['batch', 'scheduleDate']) ? (
                                dayjs(
                                  form.getFieldValue(['batch', 'scheduleDate']),
                                ).format('LLL (Z)')
                              ) : (
                                <Typography.Text type="secondary">
                                  {t('general.None')}
                                </Typography.Text>
                              )}
                            </Descriptions.Item>
                          </>
                        )}
                      </Descriptions>
                    </BAICard>
                    <BAICard
                      title={t('session.launcher.Environments')}
                      size="small"
                      status={
                        _.some(form.getFieldValue('envvars'), (v, idx) => {
                          return (
                            form.getFieldError(['envvars', idx, 'variable'])
                              .length > 0 ||
                            form.getFieldError(['envvars', idx, 'value'])
                              .length > 0
                          );
                        })
                          ? 'error'
                          : undefined
                      }
                      extraButtonTitle={t('button.Edit')}
                      onClickExtraButton={() => {
                        setCurrentStep(
                          // @ts-ignore
                          steps.findIndex((v) => v.key === 'environment'),
                        );
                      }}
                    >
                      <Descriptions size="small" column={2}>
                        <Descriptions.Item
                          label={t('session.launcher.Project')}
                        >
                          {currentProject.name}
                        </Descriptions.Item>
                        <Descriptions.Item label={t('general.ResourceGroup')}>
                          {form.getFieldValue('resourceGroup')}
                        </Descriptions.Item>
                        <Descriptions.Item label={t('general.Image')} span={2}>
                          <Flex direction="row" gap="xs" style={{ flex: 1 }}>
                            <ImageMetaIcon
                              image={
                                form.getFieldValue('environments')?.version ||
                                form.getFieldValue('environments')?.manual
                              }
                            />
                            {/* {form.getFieldValue('environments').image} */}
                            <div>
                              <Typography.Text copyable code>
                                {form.getFieldValue('environments')?.version ||
                                  form.getFieldValue('environments')?.manual}
                              </Typography.Text>
                              {form.getFieldValue('environments')
                                ?.customizedTag ? (
                                <DoubleTag
                                  values={[
                                    {
                                      label: 'Customized',
                                      color: 'cyan',
                                    },
                                    {
                                      label:
                                        form.getFieldValue('environments')
                                          ?.customizedTag,
                                      color: 'cyan',
                                    },
                                  ]}
                                />
                              ) : null}
                            </div>
                          </Flex>
                        </Descriptions.Item>
                        {form.getFieldValue('envvars')?.length > 0 && (
                          <Descriptions.Item
                            label={t('session.launcher.EnvironmentVariable')}
                          >
                            {form.getFieldValue('envvars')?.length ? (
                              <SyntaxHighlighter
                                style={isDarkMode ? dark : undefined}
                                codeTagProps={{
                                  style: {
                                    // fontFamily: 'monospace',
                                  },
                                }}
                                // showLineNumbers
                                customStyle={{
                                  margin: 0,
                                  width: '100%',
                                }}
                              >
                                {_.map(
                                  form.getFieldValue('envvars'),
                                  (v: { variable: string; value: string }) =>
                                    `${v?.variable || ''}="${v?.value || ''}"`,
                                ).join('\n')}
                              </SyntaxHighlighter>
                            ) : (
                              <Typography.Text type="secondary">
                                -
                              </Typography.Text>
                            )}
                          </Descriptions.Item>
                        )}
                      </Descriptions>
                    </BAICard>
                    <BAICard
                      title={t('session.launcher.ResourceAllocation')}
                      status={
                        _.some(form.getFieldValue('resource'), (v, key) => {
                          //                         console.log(form.getFieldError(['resource', 'shmem']));
                          // console.log(form.getFieldValue(['resource']));
                          return (
                            form.getFieldError(['resource', key]).length > 0
                          );
                        }) || form.getFieldError(['num_of_sessions']).length > 0
                          ? 'error'
                          : // : _.some(form.getFieldValue('resource'), (v, key) => {
                            //     //                         console.log(form.getFieldError(['resource', 'shmem']));
                            //     // console.log(form.getFieldValue(['resource']));
                            //     return (
                            //       form.getFieldWarning(['resource', key]).length >
                            //       0
                            //     );
                            //   })
                            // ? 'warning'
                            undefined
                      }
                      size="small"
                      extraButtonTitle={t('button.Edit')}
                      onClickExtraButton={() => {
                        setCurrentStep(
                          // @ts-ignore
                          steps.findIndex((v) => v.key === 'environment'),
                        );
                      }}
                    >
                      <Flex direction="column" align="stretch">
                        {_.some(
                          form.getFieldValue('resource').resource,
                          (v, key) => {
                            //                         console.log(form.getFieldError(['resource', 'shmem']));
                            return (
                              form.getFieldWarning(['resource', key]).length > 0
                            );
                          },
                        ) && (
                          <Alert
                            type="warning"
                            showIcon
                            message={t(
                              'session.launcher.EnqueueComputeSessionWarning',
                            )}
                          />
                        )}

                        <Descriptions column={2}>
                          <Descriptions.Item
                            label={t(
                              'session.launcher.ResourceAllocationPerContainer',
                            )}
                            span={2}
                          >
                            <Flex
                              direction="row"
                              align="start"
                              gap={'sm'}
                              wrap="wrap"
                              style={{ flex: 1 }}
                            >
                              {form.getFieldValue('allocationPreset') ===
                              'custom' ? (
                                // t('session.launcher.CustomAllocation')
                                ''
                              ) : (
                                <Tag>
                                  {form.getFieldValue('allocationPreset')}
                                </Tag>
                              )}

                              <FormResourceNumbers form={form} />
                              {/* {_.chain(
                              form.getFieldValue('allocationPreset') ===
                                'custom'
                                ? form.getFieldValue('resource')
                                : JSON.parse(
                                    form.getFieldValue('selectedPreset')
                                      ?.resource_slots || '{}',
                                  ),
                            )
                              .map((value, type) => {
                                // @ts-ignore
                                if (resourceSlots[type] === undefined)
                                  return undefined;
                                const resource_opts = {
                                  shmem:
                                    form.getFieldValue('selectedPreset')
                                      .shared_memory,
                                };
                                return (
                                  <ResourceNumber
                                    key={type}
                                    // @ts-ignore
                                    type={type}
                                    value={value}
                                    opts={resource_opts}
                                  />
                                );
                              })
                              .compact()
                              .value()} */}
                            </Flex>
                          </Descriptions.Item>
                          <Descriptions.Item
                            label={t('session.launcher.NumberOfContainer')}
                          >
                            {form.getFieldValue('cluster_size') === 1
                              ? form.getFieldValue('num_of_sessions')
                              : form.getFieldValue('cluster_size')}
                          </Descriptions.Item>
                          <Descriptions.Item
                            label={t('session.launcher.ClusterMode')}
                          >
                            {form.getFieldValue('cluster_mode') ===
                            'single-node'
                              ? t('session.launcher.SingleNode')
                              : t('session.launcher.MultiNode')}
                          </Descriptions.Item>
                        </Descriptions>
                        <Card
                          size="small"
                          type="inner"
                          title={t('session.launcher.TotalAllocation')}
                        >
                          <Flex direction="row" gap="xxs">
                            <FormResourceNumbers
                              form={form}
                              containerCount={
                                form.getFieldValue('cluster_size') === 1
                                  ? form.getFieldValue('num_of_sessions')
                                  : form.getFieldValue('cluster_size')
                              }
                            />
                          </Flex>
                        </Card>
                      </Flex>
                    </BAICard>
                    <BAICard
                      title={t('webui.menu.Data&Storage')}
                      size="small"
                      status={
                        form.getFieldError('vfoldersAliasMap').length > 0
                          ? 'error'
                          : undefined
                      }
                      extraButtonTitle={t('button.Edit')}
                      onClickExtraButton={() => {
                        setCurrentStep(
                          // @ts-ignore
                          steps.findIndex((v) => v.key === 'storage'),
                        );
                      }}
                    >
                      {form.getFieldValue('mounts')?.length > 0 ? (
                        <Table
                          rowKey="name"
                          size="small"
                          pagination={false}
                          columns={[
                            {
                              dataIndex: 'name',
                              title: t('data.folders.Name'),
                            },
                            {
                              dataIndex: 'alias',
                              title: t('session.launcher.FolderAlias'),
                              render: (value, record) => {
                                return _.isEmpty(value) ? (
                                  <Typography.Text
                                    type="secondary"
                                    style={{
                                      opacity: 0.7,
                                    }}
                                  >
                                    {`/home/work/${record.name}`}
                                  </Typography.Text>
                                ) : (
                                  value
                                );
                              },
                            },
                          ]}
                          dataSource={_.map(
                            form.getFieldValue('mounts'),
                            (v) => {
                              return {
                                name: v,
                                alias:
                                  form.getFieldValue('vfoldersAliasMap')?.[v],
                              };
                            },
                          )}
                        ></Table>
                      ) : (
                        <Alert
                          type="warning"
                          showIcon
                          message={t('session.launcher.NoFolderMounted')}
                        />
                      )}
                    </BAICard>
                    <BAICard
                      title="Network"
                      size="small"
                      status={
                        form.getFieldError('ports').length > 0
                          ? 'error'
                          : undefined
                      }
                      extraButtonTitle={t('button.Edit')}
                      onClickExtraButton={() => {
                        setCurrentStep(
                          // @ts-ignore
                          steps.findIndex((v) => v.key === 'network'),
                        );
                      }}
                    >
                      <Descriptions size="small">
                        <Descriptions.Item
                          label={t('session.launcher.PreOpenPortTitle')}
                        >
                          <Flex
                            direction="row"
                            gap="xs"
                            style={{ flex: 1 }}
                            wrap="wrap"
                          >
                            {/* {form.getFieldValue('environments').image} */}
                            {_.sortBy(form.getFieldValue('ports'), (v) =>
                              parseInt(v),
                            ).map((v) => (
                              <PortTag value={v} style={{ margin: 0 }}>
                                {v}
                              </PortTag>
                            ))}

                            {!_.isArray(form.getFieldValue('ports')) ||
                            form.getFieldValue('ports')?.length === 0 ? (
                              <Typography.Text type="secondary">
                                {t('general.None')}
                              </Typography.Text>
                            ) : null}
                          </Flex>
                        </Descriptions.Item>
                      </Descriptions>
                    </BAICard>
                  </>
                )}

                <Flex direction="row" justify="between">
                  <Flex gap={'sm'}>
                    {/* <Popconfirm
                    title={t('session.CheckAgainDialog')}
                    placement="topLeft"
                    okButtonProps={{
                      danger: true,
                    }}
                    okText={t('button.Reset')}
                    onConfirm={() => {
                      // @ts-ignore
                      form.resetFields({

                      });
                    }}
                  >
                    <Button ghost danger>
                      {t('button.Reset')}
                    </Button>
                  </Popconfirm> */}
                    <Popconfirm
                      title={t('button.Reset')}
                      description={t('session.launcher.ResetFormConfirm')}
                      onConfirm={() => {
                        form.resetFields();

                        navigate('/session/start');
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
                  <Flex direction="row" gap="sm">
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
                      <Button
                        type="primary"
                        icon={<PlayCircleOutlined />}
                        disabled={hasError}
                        onClick={startSession}
                        loading={isStartingSession}
                      >
                        {t('session.launcher.Launch')}
                      </Button>
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
                      <Button onClick={moveToPreview}>
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
          <Flex style={{ position: 'sticky', top: 80 }}>
            <Steps
              size="small"
              direction="vertical"
              current={currentStep}
              onChange={(nextCurrent) => {
                // handle "skip to review" step specifically, because validation
                if (nextCurrent === steps.length - 1) {
                  moveToPreview();
                } else {
                  setCurrentStep(nextCurrent);
                }
              }}
              items={_.map(steps, (s, idx) => ({
                ...s,
                status: idx === currentStep ? 'process' : 'wait',
              }))}
            />
          </Flex>
        )}
      </Flex>
      {/* <FolderExplorer
        folderName={selectedFolderName}
        open={!!selectedFolderName}
        onRequestClose={() => {
          setSelectedFolderName(undefined);
        }}
      /> */}
    </Flex>
  );
};

const FormResourceNumbers: React.FC<{
  form: FormInstance;
  containerCount?: number;
}> = ({ form, containerCount = 1 }) => {
  return (
    <>
      {_.map(
        _.omit(
          form.getFieldsValue().resource,
          'shmem',
          'accelerator',
          'acceleratorType',
        ),
        (value, type) => {
          return (
            <ResourceNumber
              key={type}
              // @ts-ignore
              type={type}
              value={
                type === 'mem'
                  ? (iSizeToSize(value, 'b')?.number || 0) * containerCount + ''
                  : _.toNumber(value) * containerCount + ''
              }
              opts={{
                shmem: form.getFieldValue('resource').shmem
                  ? (iSizeToSize(form.getFieldValue('resource').shmem, 'b')
                      ?.number || 0) * containerCount
                  : undefined,
              }}
            />
          );
        },
      )}
      {_.isNumber(form.getFieldValue(['resource', 'accelerator'])) &&
        form.getFieldValue(['resource', 'acceleratorType']) && (
          <ResourceNumber
            // @ts-ignore
            type={form.getFieldValue(['resource', 'acceleratorType'])}
            value={_.toString(
              form.getFieldValue(['resource', 'accelerator']) * containerCount,
            )}
          />
        )}
    </>
  );
};
// const SessionTypeItem: React.FC<{
//   title: string;
//   description?: string;
// }> = ({ title, description }) => {
//   const { token } = theme.useToken();
//   return (
//     <Flex
//       direction="column"
//       style={{ padding: token.paddingXS }}
//       align="stretch"
//     >
//       <Typography.Title level={5}>{title}</Typography.Title>
//       <Typography.Text
//         type="secondary"
//         // @ts-ignore
//         style={{ textWrap: 'wrap' }}
//       >
//         {description}
//       </Typography.Text>
//     </Flex>
//   );
// };

// interface StepContentProps extends FlexProps{

// }
// const StepContent: React.FC<{}> = () => {
//   return <Flex>

//   </Flex>
// }

const generateSessionId = () => {
  let text = '';
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 8; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text + '-session';
};

const generateRandomString = () => {
  let randNum = Math.floor(Math.random() * 52 * 52 * 52);

  const parseNum = (num: number) => {
    if (num < 26) return String.fromCharCode(65 + num);
    else return String.fromCharCode(97 + num - 26);
  };

  let randStr = '';

  for (let i = 0; i < 3; i++) {
    randStr += parseNum(randNum % 52);
    randNum = Math.floor(randNum / 52);
  }

  return randStr;
};

export default SessionLauncherPage;
