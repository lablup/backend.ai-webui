import DatePickerISO from '../components/DatePickerISO';
import EnvVarFormList, {
  sanitizeSensitiveEnv,
  EnvVarFormListValue,
} from '../components/EnvVarFormList';
import ImageEnvironmentSelectFormItems, {
  ImageEnvironmentFormInput,
} from '../components/ImageEnvironmentSelectFormItems';
import { mainContentDivRefState } from '../components/MainLayout/MainLayout';
import PortSelectFormItem, {
  PortSelectFormValues,
} from '../components/PortSelectFormItem';
import ResourceAllocationFormItems, {
  RESOURCE_ALLOCATION_INITIAL_FORM_VALUES,
  ResourceAllocationFormValue,
} from '../components/SessionFormItems/ResourceAllocationFormItems';
import SessionLauncherValidationTour from '../components/SessionLauncherErrorTourProps';
import SessionLauncherFormIncompatibleValueChecker from '../components/SessionLauncherFormIncompatibleValueChecker';
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
import { formatDuration, convertToBinaryUnit } from '../helper';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../hooks';
import { useCurrentUserRole } from '../hooks/backendai';
import { useCurrentResourceGroupState } from '../hooks/useCurrentProject';
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
  Space,
  Steps,
  Switch,
  Tooltip,
  Typography,
  theme,
} from 'antd';
import type { StepsProps } from 'antd';
import {
  filterOutEmpty,
  BAIFlex,
  useErrorMessageResolver,
  BAIButton,
  generateRandomString,
  useBAILogger,
  BAIResourceNumberWithIcon,
  useUpdatableState,
  BAIIntervalView,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import { useAtomValue } from 'jotai';
import _ from 'lodash';
import {
  parseAsInteger,
  parseAsJson,
  parseAsString,
  useQueryStates,
} from 'nuqs';
import React, {
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Trans, useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useStartSession } from 'src/hooks/useStartSession';

type SessionLauncherFormData = Omit<
  Required<OptionalFieldsOnly<SessionLauncherFormValue>>,
  'autoMountedFolderNames' | 'mounts'
>;

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
    mount_ids?: string[];
    mount_id_map?: {
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

interface SessionLauncherValue {
  sessionType: 'interactive' | 'batch' | 'inference' | 'system';
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

type StepItem = NonNullable<StepsProps['items']>[number];

interface StepPropsWithKey extends StepItem {
  key: SessionLauncherStepKey;
}

const SessionLauncherPage = () => {
  const app = App.useApp();
  const { logger } = useBAILogger();
  const { getErrorMessage } = useErrorMessageResolver();

  const mainContentDivRef = useAtomValue(mainContentDivRefState);
  const baiClient = useSuspendedBackendaiClient();
  const supportsMountById = baiClient.supports('mount-by-id');
  const supportBatchTimeout = baiClient?.supports('batch-timeout') ?? false;
  const currentUserRole = useCurrentUserRole();
  const [, setCurrentGlobalResourceGroup] = useCurrentResourceGroupState();

  const { startSession, defaultFormValues, upsertSessionNotification } =
    useStartSession();
  const [
    {
      step: currentStep,
      formValues: formValuesFromQueryParams,
      redirectTo,
      // TODO: handle appOption to launch app with specific options
      // appOption: appOptionFromQueryParams,
    },
    setQuery,
  ] = useQueryStates(
    {
      step: parseAsInteger.withDefault(0),
      formValues:
        parseAsJson<typeof defaultFormValues>().withDefault(defaultFormValues),
      redirectTo: parseAsString,
      appOption: parseAsJson<AppOption>().withDefault({}),
    },
    {
      history: 'replace',
    },
  );

  const { search } = useLocation();
  const webuiNavigate = useWebUINavigate();

  const [isOpenTemplateModal, { toggle: toggleIsOpenTemplateModal }] =
    useToggle();
  const [, { push: pushSessionHistory }] = useRecentSessionHistory();

  const { run: syncFormToURLWithDebounce } = useDebounceFn(
    () => {
      // To sync the latest form values to URL,
      // 'trailing' is set to true, and get the form values here."
      const currentValue = form.getFieldsValue();
      setQuery(
        {
          formValues: _.assign(
            _.omit(form.getFieldsValue(), [
              'environments.image',
              'environments.customizedTag',
              'autoMountedFolderNames',
              'owner',
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
      form.validateFields().catch(() => {});
    }
    // Run this memo only for the first time
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validateSilently = useEffectEvent(() => {
    const id = _.isEmpty(formValuesFromQueryParams)
      ? null
      : setTimeout(() => {
          form.validateFields().catch(() => {
            // ignore errors in preview, it will be handled in UI preview.
            return undefined;
          });
        }, 500);
    return id;
  });
  useEffect(() => {
    const id = validateSilently();
    return () => {
      id && clearTimeout(id);
    };
  }, []);

  const mergedInitialValues: SessionLauncherFormValue = useMemo(() => {
    return _.merge(
      {},
      defaultFormValues,
      RESOURCE_ALLOCATION_INITIAL_FORM_VALUES,
      formValuesFromQueryParams,
    );
  }, [defaultFormValues, formValuesFromQueryParams]);

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

  const steps: Array<StepPropsWithKey> = filterOutEmpty([
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
        .catch(() => {})
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

  const [validationTourOpen, setValidationTourOpen] = useState(false);

  const [isQueryReset, setIsQueryReset] = useState(false);
  useLayoutEffect(() => {
    if (isQueryReset) {
      form.resetFields();
      setIsQueryReset(false);
    }
  }, [isQueryReset, form]);

  return (
    <BAIFlex
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
      <BAIFlex direction="row" gap="md" align="start">
        <BAIFlex
          direction="column"
          align="stretch"
          style={{ flex: 1, maxWidth: 700 }}
        >
          <BAIFlex direction="row" justify="between">
            <Typography.Title level={4} style={{ marginTop: 0 }}>
              {t('session.launcher.StartNewSession')}
            </Typography.Title>
            <BAIFlex direction="row" gap={'sm'}>
              <Button
                type="link"
                // icon={<BlockOutlined />}
                // disabled
                style={{ paddingRight: 0, paddingLeft: 0 }}
                onClick={() => toggleIsOpenTemplateModal()}
              >
                {t('session.launcher.RecentHistory')}
              </Button>
            </BAIFlex>
          </BAIFlex>
          {/* <Suspense fallback={<FlexActivityIndicator />}> */}
          <Form.Provider
            onFormChange={() => {
              // use OnFormChange instead of Form's onValuesChange,
              // because onValuesChange will not be triggered when form is changed programmatically
              syncFormToURLWithDebounce();
            }}
          >
            <Form
              form={form}
              layout="vertical"
              initialValues={mergedInitialValues}
            >
              <SessionLauncherFormIncompatibleValueChecker form={form} />
              <BAIFlex
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
                                  <BAIFlex direction="row" gap={'xs'}>
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
                                                    _rule,
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
                                  </BAIFlex>
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
                              <BAIFlex direction="row" gap={'xs'}>
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
                                        <Space.Compact>
                                          <Form.Item
                                            name={['batch', 'timeout']}
                                            label={t(
                                              'session.launcher.BatchJobTimeoutDuration',
                                            )}
                                            noStyle
                                            dependencies={[
                                              ['batch', 'timeoutEnabled'],
                                            ]}
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
                                              style={{
                                                width: '100%',
                                              }}
                                              onChange={() => {
                                                form.validateFields([
                                                  ['batch', 'timeoutUnit'],
                                                ]);
                                              }}
                                            />
                                          </Form.Item>
                                          <Form.Item
                                            noStyle
                                            name={['batch', 'timeoutUnit']}
                                            dependencies={[
                                              ['batch', 'timeout'],
                                              ['batch', 'timeoutEnabled'],
                                            ]}
                                            rules={[
                                              ({ getFieldValue }) => ({
                                                validator() {
                                                  const timeout = getFieldValue(
                                                    ['batch', 'timeout'],
                                                  );
                                                  const timeoutEnabled =
                                                    getFieldValue([
                                                      'batch',
                                                      'timeoutEnabled',
                                                    ]);
                                                  if (
                                                    timeoutEnabled === true &&
                                                    (timeout === undefined ||
                                                      timeout === null ||
                                                      timeout < 1)
                                                  ) {
                                                    return Promise.reject();
                                                  }
                                                  return Promise.resolve();
                                                },
                                              }),
                                            ]}
                                          >
                                            <Select
                                              tabIndex={-1}
                                              disabled={disabled}
                                              style={{ width: 100 }}
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
                                        </Space.Compact>
                                      </>
                                    );
                                  }}
                                </Form.Item>
                              </BAIFlex>
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
                    fallbackRender={() => {
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
                    <BAIFlex direction="row" gap={'sm'}>
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
                    </BAIFlex>
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
                        _.every(_.omit(ownerInfo, 'enabled'), (key) => {
                          return key !== undefined;
                        });

                      return (
                        <VFolderTableFormItem
                          rowKey={supportsMountById ? 'id' : 'name'}
                          rowFilter={(vfolder) => {
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

                <BAIFlex direction="row" justify="between">
                  <BAIFlex gap={'sm'}>
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
                  </BAIFlex>
                  <BAIFlex
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
                        <BAIButton
                          type="primary"
                          icon={<PlayCircleOutlined />}
                          disabled={hasError}
                          action={async () => {
                            const usedSearchParams = search;
                            const values = await form
                              .validateFields()
                              .catch((e) => {
                                logger.error('validation errors', e);
                              });

                            // validation failed do nothing
                            if (!values) {
                              return;
                            }

                            if (
                              _.isEmpty(values.mount_ids) ||
                              values.mount_ids?.length === 0
                            ) {
                              const isConformed = await app.modal.confirm({
                                title: t('session.launcher.NoFolderMounted'),
                                content: (
                                  <>
                                    {t(
                                      'session.launcher.HomeDirectoryDeletionDialog',
                                    )}
                                    <br />
                                    <br />
                                    {t(
                                      'session.launcher.LaunchConfirmationDialog',
                                    )}
                                    <br />
                                    <br />
                                    {t('dialog.ask.DoYouWantToProceed')}
                                  </>
                                ),
                                okText: t('session.launcher.Start'),
                                closable: true,
                              });
                              if (!isConformed) return;
                            }

                            await startSession(values)
                              .then((results) => {
                                // After sending a create request, navigate to job page and set current resource group
                                if (
                                  results?.fulfilled &&
                                  results.fulfilled.length > 0
                                ) {
                                  // Do not await here to speed up the navigation
                                  upsertSessionNotification(results.fulfilled);
                                  setCurrentGlobalResourceGroup(
                                    values.resourceGroup,
                                  );
                                  pushSessionHistory({
                                    params: usedSearchParams,
                                    name: results.fulfilled[0].value
                                      .sessionName,
                                  });
                                }
                                // If at least one session creation is successful, navigate to job page and show success notifications
                                if (
                                  results?.fulfilled &&
                                  results.fulfilled.length > 0
                                ) {
                                  webuiNavigate(redirectTo || '/job');
                                }

                                // If there are any failed session creations, show the first error message
                                if (
                                  results?.rejected &&
                                  results.rejected.length > 0
                                ) {
                                  const error = results.rejected[0].reason;
                                  app.modal.error({
                                    title: error?.title,
                                    content: getErrorMessage(error),
                                  });
                                }
                              })
                              .catch((error) => {
                                // Unexpected error in `then` of allSettled
                                logger.error(
                                  'Unexpected error during session creation:',
                                  error,
                                );
                                app.message.error(t('error.UnexpectedError'));
                              });
                          }}
                        >
                          {t('session.launcher.Launch')}
                        </BAIButton>
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
                  </BAIFlex>
                </BAIFlex>
              </BAIFlex>
            </Form>
          </Form.Provider>
          {/* </Suspense> */}
        </BAIFlex>
        {screens.lg && (
          <BAIFlex
            data-test-id="neo-session-launcher-tour-step"
            style={{ position: 'sticky', top: 80 }}
          >
            <Steps
              size="small"
              orientation="vertical"
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
      <SessionTemplateModal
        onRequestClose={(formValue) => {
          if (formValue) {
            const fieldsValue = _.merge(
              {
                // reset fields related to optional and nested fields
                sessionName: '',
                ports: [],
                vfoldersNameMap: {},
                mount_ids: [],
                mount_id_map: {},
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
                agent: ['auto'], // Add the missing 'agent' property
              } as SessionLauncherFormData,
              formValue,
            );

            if (!_.isEmpty(fieldsValue.sessionName)) {
              fieldsValue.sessionName =
                fieldsValue.sessionName + '-' + generateRandomString(4);
            }
            form.setFieldsValue(fieldsValue as SessionLauncherFormData);
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
    </BAIFlex>
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
            <BAIResourceNumberWithIcon
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
        <BAIResourceNumberWithIcon
          // @ts-ignore
          type={resource.acceleratorType}
          value={_.toString(resource.accelerator * containerCount)}
        />
      ) : null}
    </>
  );
};

export default SessionLauncherPage;
