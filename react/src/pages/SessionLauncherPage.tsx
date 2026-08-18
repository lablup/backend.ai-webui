/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { App } from '../app-shim';
import DatePickerISO from '../components/DatePickerISO';
import EnvVarFormList, {
  sanitizeSensitiveEnv,
  EnvVarFormListValue,
} from '../components/EnvVarFormList';
import ImageEnvironmentSelectFormItems, {
  ImageEnvironmentFormInput,
} from '../components/ImageEnvironmentSelectFormItems';
import LaunchMultipleSessionsModal from '../components/LaunchMultipleSessionsModal';
import { mainContentDivRefState } from '../components/MainLayout/MainLayout';
import PortSelectFormItem, {
  PortSelectFormValues,
} from '../components/PortSelectFormItem';
import ResourceAllocationFormItems, {
  RESOURCE_ALLOCATION_INITIAL_FORM_VALUES,
  ResourceAllocationFormValue,
  isUnifiedAcceleratorSlot,
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
import BAIPopconfirmAstryx from '../components/astryx-bui/BAIPopconfirmAstryx';
import {
  AstryxFormCheckbox,
  AstryxFormNumberInput,
  AstryxFormSelector,
  AstryxFormSwitch,
  AstryxFormTextArea,
  AstryxFormTextInput,
} from '../components/astryxFormControls';
import { Form } from '../form-engine';
import { formatDuration, convertToBinaryUnit } from '../helper';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../hooks';
import {
  useCurrentUserRole,
  useResourceSlotsDetails,
} from '../hooks/backendai';
import {
  useCurrentProjectValue,
  useCurrentResourceGroupState,
} from '../hooks/useCurrentProject';
import { useRecentSessionHistory } from '../hooks/useRecentSessionHistory';
import { useStartSession } from '../hooks/useStartSession';
import { theme, useBAIBreakpoint } from '../theme-shim';
import { toProjectContext } from '../types/projectContext';
import { Button } from '@astryxdesign/core/Button';
import { ButtonGroup } from '@astryxdesign/core/ButtonGroup';
import { Card } from '@astryxdesign/core/Card';
import { Divider } from '@astryxdesign/core/Divider';
import { DropdownMenu } from '@astryxdesign/core/DropdownMenu';
import { Grid as AstryxGrid } from '@astryxdesign/core/Grid';
import { Heading } from '@astryxdesign/core/Heading';
// FRONTIER (ticket 17): the Form ENGINE is still antd's — ticket 34's
// self-hosted replacement is parked (see form-engine/engine.ts). Everything
// INSIDE the items is Astryx as of wave 3: the controls go through the shared
// `astryxFormControls` adapters, and `Steps` is the lab `Stepper`, which is a
// real dependency now (`@astryxdesign/lab@0.3.0-canary.12db2a1`, already in
// the graph for Drawer/Tour and for `EduAppLauncher`'s own Stepper).
import { InputGroup } from '@astryxdesign/core/InputGroup';
import { RadioList, RadioListItem } from '@astryxdesign/core/RadioList';
import { VStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import { Step, Stepper } from '@astryxdesign/lab';
import * as stylex from '@stylexjs/stylex';
import {
  BAIFlex,
  BAIIntervalView,
  BAIResourceNumberWithIcon,
  BAIUnmountAfterClose,
  ResourceTypeIcon,
  filterOutEmpty,
  generateRandomString,
  useBAILogger,
  useDebounceFn,
  useErrorMessageResolver,
  useToggle,
  useUpdatableState,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import { useAtomValue } from 'jotai';
import * as _ from 'lodash-es';
import {
  ChevronsRight,
  Ellipsis,
  ChevronLeft,
  CirclePlay,
  CircleHelp,
  ChevronRight,
} from 'lucide-react';
import {
  parseAsInteger,
  parseAsJson,
  parseAsString,
  useQueryStates,
} from 'nuqs';
import React, {
  Suspense,
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Trans, useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

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
  reuseIfExists?: boolean;
  dependencies?: string[];
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
  reuseIfExists?: boolean;
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
  'sessionType' | 'environment' | 'storage' | 'network' | 'review';

/**
 * antd `StepsProps['items'][number]`, restated as the three fields this page
 * actually sets. `status` was assigned per item at render time (see the
 * Stepper below) and has no lab counterpart, so it is not part of the shape.
 */
type StepItem = {
  title: string;
  icon?: React.ReactNode;
};

interface StepPropsWithKey extends StepItem {
  key: SessionLauncherStepKey;
}

/**
 * Step-section container: Astryx `Card` + `Heading` composition replacing the
 * antd `Card title` (MAPPING.md §5.1). `hidden` keeps the original
 * `style={{display:'none'}}` show/hide behaviour, which preserves mounted
 * form state across steps (the form engine requirement).
 */
const StepCard: React.FC<{
  title?: React.ReactNode;
  hidden?: boolean;
  children?: React.ReactNode;
}> = ({ title, hidden, children }) => {
  'use memo';
  return (
    <Card style={{ display: hidden ? 'none' : undefined }}>
      <VStack gap={4} align="stretch">
        {title ? <Heading level={5}>{title}</Heading> : null}
        {children}
      </VStack>
    </Card>
  );
};

/**
 * The session-type chooser, as a `Form.Item` child.
 *
 * Local rather than another entry in `astryxFormControls` because the shape it
 * needs — `RadioListItem label` + `description` — is the only place in the app
 * that wants a description under each radio; every other converted radio group
 * is label-only and already served by `AstryxFormRadioList`.
 */
const SessionTypeRadioList: React.FC<{
  /** Injected by `Form.Item`. */
  value?: string;
  /** Injected by `Form.Item`. */
  onChange?: (value: string) => void;
}> = ({ value, onChange }) => {
  'use memo';
  const { t } = useTranslation();
  return (
    <RadioList
      value={value ?? ''}
      onChange={(next) => onChange?.(next)}
      label={t('session.launcher.SessionType')}
      isLabelHidden
      orientation="vertical"
    >
      <RadioListItem
        value="interactive"
        label={t('session.launcher.InteractiveMode')}
        description={t('session.launcher.InteractiveModeDesc')}
      />
      <RadioListItem
        value="batch"
        label={t('session.launcher.BatchMode')}
        description={t('session.launcher.BatchModeDesc')}
      />
    </RadioList>
  );
};

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
  // ADR-0001 (FR-3411): pages are the only readers of the ambient current
  // project; ResourceAllocationFormItems takes it as an explicit required
  // prop. The throw preserves the exact previous behavior — the form
  // fragment used to raise this error itself when the ambient project was
  // not resolvable (general pages always have one once login completes).
  const currentProject = useCurrentProjectValue();
  const currentProjectContext = toProjectContext(currentProject);
  if (!currentProjectContext) {
    throw new Error('Project ID is required for ResourceAllocationFormItems');
  }

  const { startSession, defaultFormValues, upsertSessionNotification } =
    useStartSession();
  const StepParam = parseAsInteger.withDefault(0);
  const FormValuesParam = parseAsJson<DeepPartial<SessionLauncherFormValue>>(
    (value) => value as DeepPartial<SessionLauncherFormValue>,
  ).withDefault(defaultFormValues);
  const AppOptionParam = parseAsJson<AppOption>(
    (value) => value as AppOption,
  ).withDefault({});
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
      step: StepParam,
      formValues: FormValuesParam,
      redirectTo: parseAsString,
      appOption: AppOptionParam,
    },
    { history: 'replace' },
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
      // eslint-disable-next-line react-hooks/immutability -- forward reference to a later declaration kept as-is
      const currentValue = form.getFieldsValue();
      setQuery({
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
      });
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
      { history: 'push' },
    );
  };
  const { token } = theme.useToken();

  const { t } = useTranslation();

  const screens = useBAIBreakpoint();

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
    ) as SessionLauncherFormValue;
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

  const batchLaunchResource = Form.useWatch('resource', {
    form,
    preserve: true,
  });
  const batchLaunchClusterSize = Form.useWatch('cluster_size', {
    form,
    preserve: true,
  });
  const batchLaunchClusterMode = Form.useWatch('cluster_mode', {
    form,
    preserve: true,
  });
  const batchLaunchResourceGroup = Form.useWatch('resourceGroup', {
    form,
    preserve: true,
  });

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
      icon: <CirclePlay size="1em" />,
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
  }, [currentStep, form, setFinalStepLastValidateTime, steps.length]);

  useEffect(() => {
    if (finalStepLastValidateTime !== 'first') {
      if (hasError) {
        // eslint-disable-next-line react-hooks/immutability -- forward reference to a later declaration kept as-is
        setValidationTourOpen(true);
      } else {
        setValidationTourOpen(false);
      }
    }
  }, [finalStepLastValidateTime, hasError]);

  const [validationTourOpen, setValidationTourOpen] = useState(false);

  const [
    isLaunchMultipleSessionsModalOpen,
    setIsLaunchMultipleSessionsModalOpen,
  ] = useState(false);

  const [isQueryReset, setIsQueryReset] = useState(false);
  useLayoutEffect(() => {
    if (isQueryReset) {
      form.resetFields();
      // eslint-disable-next-line react-hooks/set-state-in-effect -- legacy query-reset flow kept as-is
      setIsQueryReset(false);
    }
  }, [isQueryReset, form]);

  const performLaunch = async (numOfSessions: number) => {
    const usedSearchParams = search;
    const values = await form.validateFields().catch((e) => {
      logger.error('validation errors', e);
    });

    // validation failed do nothing
    if (!values) {
      return;
    }

    if (_.isEmpty(values.mount_ids) || values.mount_ids?.length === 0) {
      const isConfirmed = await app.modal.confirm({
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
        okText: t('session.launcher.Start'),
        closable: true,
      });
      if (!isConfirmed) return;
    }

    await startSession({ ...values, num_of_sessions: numOfSessions })
      .then((results) => {
        // After sending a create request, navigate to job page and set current resource group
        if (results?.fulfilled && results.fulfilled.length > 0) {
          // Do not await here to speed up the navigation
          upsertSessionNotification(results.fulfilled);
          setCurrentGlobalResourceGroup(values.resourceGroup);
          pushSessionHistory({
            params: usedSearchParams,
            name: results.fulfilled[0].value.sessionName,
          });
          webuiNavigate(redirectTo || '/job');
        }

        // If there are any failed session creations, show the first error message
        if (results?.rejected && results.rejected.length > 0) {
          const error = results.rejected[0].reason;
          if (error?.error_code === 'session_create_already-exists') {
            app.modal.error({
              title: t('session.launcher.SessionAlreadyExists'),
            });
          } else if (
            error?.error_code === 'storage_access_forbidden' ||
            error?.error_code === 'vfolder_access_forbidden'
          ) {
            app.modal.error({
              title: t('session.launcher.StorageAccessForbidden'),
              content: getErrorMessage(error),
            });
          } else if (error?.error_code === 'vfolder_read_not-found') {
            app.modal.error({
              title: t('session.launcher.VFolderNotFound'),
              content: getErrorMessage(error),
            });
          } else {
            app.modal.error({
              title: error?.title,
              content: getErrorMessage(error),
            });
          }
        }
      })
      .catch((error) => {
        // Unexpected error in `then` of allSettled
        logger.error('Unexpected error during session creation:', error);
        app.message.error(t('error.UnexpectedError'));
      });
  };

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
      <BAIFlex direction="row" gap="md" align="start">
        <BAIFlex
          direction="column"
          align="stretch"
          style={{ flex: 1, maxWidth: 700 }}
        >
          <BAIFlex direction="row" justify="between">
            <Heading level={4}>{t('session.launcher.StartNewSession')}</Heading>
            <BAIFlex direction="row" gap={'sm'}>
              <Button
                variant="link"
                label={t('session.launcher.RecentHistory')}
                onClick={() => toggleIsOpenTemplateModal()}
              />
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
                <StepCard
                  title={t('session.launcher.SessionType')}
                  hidden={currentStepKey !== 'sessionType'}
                >
                  <Form.Item name="sessionType">
                    {/* antd `Radio.Group options=` with ReactNode labels ->
                        Astryx `RadioList` + `RadioListItem`.
                        PILOT-DECISION: this uses the RAW controls rather than
                        the shared `AstryxFormRadioList`, because the two-part
                        antd label ("<mode name> <one-sentence description>")
                        splits cleanly onto `RadioListItem`'s `label` +
                        `description` pair, and the adapter exposes only
                        `endContent`. Routed through `endContent` the sentences
                        overlapped their own labels (measured, both
                        orientations) — `description` is the slot the shape
                        actually asks for, and it stacks the sentence under the
                        mode name.
                        `Text type="code"` on the mode name is DROPPED: `label`
                        and `description` are plain STRINGS (P2), and a prose
                        mode name was never code anyway.
                        `value`/`onChange` are injected by `Form.Item`, so they
                        are coalesced here the way the shared adapters do. */}
                    <SessionTypeRadioList />
                  </Form.Item>
                  <SessionNameFormItem />
                  <Form.Item
                    name="bootstrap_script"
                    label="Bootstrap Script"
                    hidden
                  >
                    <AstryxFormTextInput label="Bootstrap Script" />
                  </Form.Item>
                </StepCard>

                {sessionType === 'batch' && (
                  <StepCard
                    title={t('session.launcher.BatchModeConfig')}
                    hidden={currentStepKey !== 'sessionType'}
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
                      {/* antd `Input.TextArea autoSize` -> the shared
                          `AstryxFormTextArea`. `autoSize` has no destination —
                          Astryx `TextArea` takes a fixed `rows` — so the field
                          keeps the component default height instead of growing
                          with the command. */}
                      <AstryxFormTextArea
                        label={t('session.launcher.StartUpCommand')}
                      />
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
                                      {/* antd `Checkbox` with an inline text
                                          child -> `AstryxFormCheckbox`, whose
                                          `label` renders that same inline
                                          text. The handler moves from the DOM
                                          event (`e.target.checked`) to
                                          `onValueChange`, the adapter's
                                          explicit side-effect slot — the
                                          `onChange` slot itself belongs to
                                          `Form.Item`. */}
                                      <AstryxFormCheckbox
                                        label={t('session.launcher.Enable')}
                                        onValueChange={(checked) => {
                                          if (
                                            checked &&
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
                                          } else if (checked === false) {
                                            form.setFieldValue(
                                              ['batch', 'scheduleDate'],
                                              undefined,
                                            );
                                          }
                                          form.validateFields([
                                            ['batch', 'scheduleDate'],
                                          ]);
                                        }}
                                      />
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
                                  <AstryxFormCheckbox
                                    label={t('session.launcher.Enable')}
                                    onValueChange={(checked) => {
                                      if (checked === false) {
                                        form.setFieldValue(
                                          ['batch', 'timeout'],
                                          undefined,
                                        );
                                      }
                                      form.validateFields([
                                        ['batch', 'timeout'],
                                      ]);
                                    }}
                                  />
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
                                        {/* antd `Space.Compact` (weld the
                                            number field and its unit select
                                            into one control) -> Astryx
                                            `InputGroup`, the documented
                                            destination for the input flavour
                                            of Compact (MAPPING §"Space"). */}
                                        <InputGroup
                                          label={t(
                                            'session.launcher.BatchJobTimeoutDuration',
                                          )}
                                          // `BAIFormItem` already renders the
                                          // visible label above; without this
                                          // the group printed it a second time
                                          // inside the field (measured).
                                          isLabelHidden
                                        >
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
                                            {/* antd `InputNumber` ->
                                                `AstryxFormNumberInput`.
                                                `style.width:'100%'` becomes
                                                the adapter's `width` default.
                                                The cross-field revalidation
                                                stays on `onChange`: the form
                                                engine COMPOSES a child's own
                                                trigger handler after its own
                                                (`originTriggerFunc` in
                                                `form-engine/Field.tsx`), so
                                                both run. */}
                                            <AstryxFormNumberInput
                                              label={t(
                                                'session.launcher.BatchJobTimeoutDuration',
                                              )}
                                              disabled={disabled}
                                              min={1}
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
                                            {/* antd `Select options=` (five
                                                static string options) ->
                                                `AstryxFormSelector`, the
                                                plain-`Selector` branch of
                                                MAPPING §3.1. `tabIndex={-1}`
                                                is DROPPED: it took the unit
                                                select out of the tab order, so
                                                a keyboard user could never
                                                reach it.
                                                The accessible name repeats the
                                                group's own label: Astryx
                                                requires one on BOTH halves of
                                                what antd drew as a single
                                                compact control, and there is no
                                                localized "Unit" string in any
                                                of the 22 catalogues to name the
                                                right-hand half with (P8 — reuse
                                                an existing string rather than
                                                add a key needing 22
                                                translations). */}
                                            <AstryxFormSelector
                                              label={t(
                                                'session.launcher.BatchJobTimeoutDuration',
                                              )}
                                              disabled={disabled}
                                              width={100}
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
                                        </InputGroup>
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
                  </StepCard>
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
                  <StepCard title="Inference Mode Configuration">
                    <Form.Item
                      name={['inference', 'vFolderName']}
                      label={t('session.launcher.ModelStorageToMount')}
                      rules={[
                        {
                          required: true,
                        },
                      ]}
                    >
                      {/* An OPTIONLESS antd `<Select />` — a placeholder left
                          behind when the `VFolderSelect` below was commented
                          out. It converts to an equally optionless
                          `AstryxFormSelector`; there is nothing to preserve
                          but the empty control. */}
                      <AstryxFormSelector
                        label={t('session.launcher.ModelStorageToMount')}
                        options={[]}
                      />
                      {/* <VFolderSelect
                          filter={(vf) => vf.usage_mode === 'model'}
                          autoSelectDefault
                          /> */}
                    </Form.Item>
                  </StepCard>
                )}

                {/* Step Start*/}
                <StepCard
                  title={t('session.launcher.Environments')}
                  hidden={currentStepKey !== 'environment'}
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
                </StepCard>
                <StepCard
                  title={t('session.launcher.ResourceAllocation')}
                  hidden={currentStepKey !== 'environment'}
                >
                  <ResourceAllocationFormItems
                    project={currentProjectContext}
                    enableAgentSelect={
                      !baiClient._config.hideAgents &&
                      baiClient.supports('agent-select')
                    }
                    enableResourcePresets
                    showRemainingWarning
                  />
                </StepCard>
                <StepCard
                  title={t('session.launcher.HPCOptimization')}
                  hidden={currentStepKey !== 'environment'}
                >
                  <Form.Item noStyle>
                    <BAIFlex direction="row" gap={'sm'}>
                      <Text>
                        {t('session.launcher.SwitchOpenMPoptimization')}
                      </Text>
                      <Form.Item
                        label={t('session.launcher.SwitchOpenMPoptimization')}
                        name={['hpcOptimization', 'autoEnabled']}
                        valuePropName="checked"
                        required
                        noStyle
                      >
                        {/* antd `Switch` -> the shared `AstryxFormSwitch`.
                            `checkedChildren`/`unCheckedChildren` (the ON/OFF
                            text inside the track) have no Astryx destination
                            and are DROPPED — the adjacent `Text` above already
                            names what the toggle controls, and the thumb
                            position carries the state. */}
                        <AstryxFormSwitch
                          label={t('session.launcher.SwitchOpenMPoptimization')}
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
                        // Responsive policy R1 (ticket 14): antd
                        // `Row gutter` + `Col xs={24} sm={12}` -> Astryx Grid
                        // (2-up from 576px -> minWidth 280, max 2).
                        // W2A-17: a `Grid` child defaults to `min-width: auto`,
                        // so a 100%-wide field pushes its track past the
                        // container. `width="100%"` on the grid plus
                        // `minWidth: 0` on every direct child is the standing
                        // fix (it also replaces the `flex: 1` these items
                        // carried over from their old `Col` wrappers, which a
                        // grid item ignores).
                        <AstryxGrid
                          columns={{ minWidth: 280, max: 2 }}
                          gap={4}
                          width="100%"
                          style={{
                            display: enabled ? 'none' : undefined,
                            marginTop: token.marginMD,
                          }}
                        >
                          <Form.Item
                            style={{ minWidth: 0 }}
                            label={t('session.launcher.NumOpenMPthreads')}
                            name={['hpcOptimization', 'OMP_NUM_THREADS']}
                            // antd `InputNumber stringMode` kept the stored
                            // value a STRING; these two fields are spread
                            // straight into the session's `environ` dict
                            // (`useStartSession`), where a number would be an
                            // invalid env value. Astryx's `NumberInput` emits
                            // `number | null`, so the string contract moves to
                            // the item's own `getValueFromEvent`.
                            getValueFromEvent={(value) =>
                              _.isNil(value) ? value : String(value)
                            }
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
                            <AstryxFormNumberInput
                              label={t('session.launcher.NumOpenMPthreads')}
                              min={1}
                              max={1000}
                              step={1}
                              isIntegerOnly
                            />
                          </Form.Item>
                          <Form.Item
                            style={{ minWidth: 0 }}
                            label={t('session.launcher.NumOpenBLASthreads')}
                            name={['hpcOptimization', 'OPENBLAS_NUM_THREADS']}
                            getValueFromEvent={(value) =>
                              _.isNil(value) ? value : String(value)
                            }
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
                            <AstryxFormNumberInput
                              label={t('session.launcher.NumOpenBLASthreads')}
                              min={1}
                              max={1000}
                              step={1}
                              isIntegerOnly
                            />
                          </Form.Item>
                        </AstryxGrid>
                      );
                    }}
                  </Form.Item>
                </StepCard>
                {/* Step Start*/}
                <StepCard
                  title={t('webui.menu.Data&Storage')}
                  hidden={currentStepKey !== 'storage'}
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
                </StepCard>

                {/* Step Start*/}
                <StepCard
                  title={t('session.launcher.Network')}
                  hidden={currentStepKey !== 'network'}
                >
                  <PortSelectFormItem />
                </StepCard>

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
                    {/* Reversible action -> anchored one-click confirm
                        (BAIPopconfirmAstryx, gap component 08); the typed
                        confirm modal stays reserved for irreversible flows. */}
                    <BAIPopconfirmAstryx
                      title={t('button.Reset')}
                      description={t('session.launcher.ResetFormConfirm')}
                      onConfirm={() => {
                        setQuery({
                          step: null,
                          formValues: null,
                          redirectTo: null,
                          appOption: null,
                        });
                        setIsQueryReset(true);
                      }}
                      icon={
                        <CircleHelp
                          style={{ color: 'var(--color-error)' }}
                          size="1em"
                        />
                      }
                      okText={t('button.Reset')}
                      isDanger
                    >
                      {/* PILOT-DECISION: antd `Button danger type="link"` (red
                          text link) -> Astryx ghost Button. A ghost+destructive
                          combination is inexpressible in the closed variant
                          enum (P5); the danger signal moves to the confirm
                          popover. */}
                      <Button variant="ghost" label={t('button.Reset')} />
                    </BAIPopconfirmAstryx>
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
                        label={t('button.Previous')}
                        icon={<ChevronLeft size="1em" />}
                        onClick={() => {
                          setCurrentStep(currentStep - 1);
                        }}
                      />
                    )}
                    {currentStep === steps.length - 1 ? (
                      <Tooltip
                        content={
                          hasError
                            ? t('session.launcher.PleaseCompleteForm')
                            : undefined
                        }
                        isEnabled={hasError}
                      >
                        {/* antd `Space.Compact` + Dropdown split button ->
                            Astryx ButtonGroup + DropdownMenu (MAPPING.md
                            §5.3). The dropdown owns its own trigger button. */}
                        <ButtonGroup label={t('session.launcher.Launch')}>
                          <Button
                            variant="primary"
                            icon={<CirclePlay size="1em" />}
                            isDisabled={hasError}
                            label={t('session.launcher.Launch')}
                            clickAction={() => performLaunch(1)}
                          />
                          <DropdownMenu
                            hasChevron={false}
                            button={{
                              variant: 'primary',
                              icon: <Ellipsis size="1em" />,
                              isIconOnly: true,
                              isDisabled: hasError,
                              label: t(
                                'session.launcher.LaunchMultipleSessions',
                              ),
                            }}
                            items={[
                              {
                                label: t(
                                  'session.launcher.LaunchMultipleSessions',
                                ),
                                onClick: () => {
                                  setIsLaunchMultipleSessionsModalOpen(true);
                                },
                              },
                            ]}
                          />
                        </ButtonGroup>
                      </Tooltip>
                    ) : (
                      // PILOT-DECISION: antd `type="primary" ghost` (outlined
                      // primary) has no Astryx variant; `secondary` is the
                      // closest closed-enum destination (P5).
                      //
                      // The trailing chevron goes in `endContent`, NOT in
                      // `children`. Astryx `Button` lays out
                      // `icon | label | endContent` as three slots and renders
                      // `children` INSIDE the label slot — a truncating text
                      // span. An `<svg>` dropped in there is an inline
                      // replaced element inside that span, so the chevron
                      // broke onto a second line inside a 32px-tall button
                      // (measured: 55x32 box, glyph clipped below the text).
                      // `endContent` is the documented slot for "trailing
                      // icon or badge" and inherits the variant's color.
                      <Button
                        variant="secondary"
                        label={t('button.Next')}
                        endContent={<ChevronRight size="1em" />}
                        onClick={() => {
                          setCurrentStep(currentStep + 1);
                        }}
                      />
                    )}
                    {currentStep !== steps.length - 1 && (
                      // Same `endContent` fix. `ghost` rather than the default
                      // `secondary`: legacy had TWO emphasis levels here
                      // (Next = `primary ghost`, Skip = plain default), and
                      // leaving both on `secondary` collapsed them into two
                      // identical grey blocks. Within the closed variant enum,
                      // secondary-over-ghost restores that ordering.
                      <Button
                        variant="ghost"
                        label={t('session.launcher.SkipToConfirmAndLaunch')}
                        endContent={<ChevronsRight size="1em" />}
                        onClick={() => {
                          setCurrentStep(steps.length - 1);
                        }}
                      />
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
            {/* antd `Steps` -> lab `Stepper` + `Step` (MAPPING §2 LAB; same
                call W2A-15 made for `FairShareList` and ticket 23 for
                `EduAppLauncher`).
                - `current` -> `activeStep`, `onChange` -> `onStepClick`.
                - The per-item `status: 'process' | 'wait'` mapping is DROPPED:
                  lab derives completed / active / upcoming from `activeStep`,
                  and its `status` is a SEMANTIC enum (accent/success/warning/
                  error) layered on top. `process`/`wait` said nothing that
                  `activeStep` does not already say.
                - `size="small"` has no counterpart; `density` is the nearest
                  axis and `compact` is the small rung.
                - `Step.label` is a required STRING, which every step title
                  here already is. */}
            <Stepper
              orientation="vertical"
              density="compact"
              activeStep={currentStep}
              // `Stepper.label` names the whole sequence for assistive tech;
              // antd's `Steps` had none. Reuses the page's own existing title
              // string rather than adding a key across 22 catalogues (P8).
              label={t('session.launcher.StartNewSession')}
              onStepClick={(nextCurrent) => {
                setCurrentStep(nextCurrent);
              }}
            >
              {_.map(steps, (s, idx) => (
                <Step key={s.key} step={idx} label={s.title} icon={s.icon} />
              ))}
            </Stepper>
          </BAIFlex>
        )}
      </BAIFlex>
      <Suspense fallback={null}>
        <BAIUnmountAfterClose>
          <LaunchMultipleSessionsModal
            open={isLaunchMultipleSessionsModalOpen}
            resource={batchLaunchResource ?? form.getFieldValue('resource')}
            clusterSize={
              batchLaunchClusterSize ?? form.getFieldValue('cluster_size') ?? 1
            }
            clusterMode={
              batchLaunchClusterMode ??
              form.getFieldValue('cluster_mode') ??
              'single-node'
            }
            resourceGroup={
              batchLaunchResourceGroup ?? form.getFieldValue('resourceGroup')
            }
            ResourcePreview={ResourceNumbersOfSession}
            onRequestClose={async (count) => {
              setIsLaunchMultipleSessionsModalOpen(false);
              if (typeof count === 'number') {
                await performLaunch(count);
              }
            }}
          />
        </BAIUnmountAfterClose>
      </Suspense>
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
                reuseIfExists: false,
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
  /**
   * The resource map to display as the primary value. For most callers this is
   * the requested (configured) resource; on the session detail page it is the
   * actually-allocated `occupied_slots`.
   */
  resource: ResourceAllocationFormValue['resource'];
  containerCount?: number;
  /**
   * Optional reference resource map to compare against `resource`. On the
   * session detail page this is the requested amount: for any numeric slot
   * whose primary value differs from the compared value, the compared amount is
   * appended as a muted `/ <value>` reference with an "allocated / requested"
   * tooltip on the chip. The component computes the differing slots itself —
   * callers only pass the two resource maps.
   *
   * Comparison is applied to the numeric `slotChips` only. The object-shaped
   * `{ accelerator, acceleratorType }` branch is not threaded through the
   * comparison; on the session detail page fGPU is compared via its dotted
   * `cuda.shares` slot key (which routes through `slotChips`), so that path is
   * covered. A form-shaped caller relying on `accelerator` would not get a
   * comparison reference on the accelerator chip.
   */
  comparedResource?: ResourceAllocationFormValue['resource'];
  /**
   * When true, render a vertical divider between chips so the resources read as
   * distinct items (used on the session detail page). Off by default so
   * column-layout callers (e.g. `DeploymentPresetDetailModal`) don't get stray
   * dividers between stacked chips.
   */
  showDividers?: boolean;
};

const unifiedChipStyles = stylex.create({
  description: {
    minWidth: 0,
    whiteSpace: 'normal',
    overflowWrap: 'anywhere',
  },
});

// Renders a unified-memory accelerator as "<device description>" with the same
// explanatory tooltip as the launcher's accelerator field. Kept as a separate
// component so a long description wraps gracefully: the icon + text wrap as a
// unit, and the text breaks onto multiple lines instead of overflowing.
const UnifiedAcceleratorChip: React.FC<{ type: string }> = ({ type }) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  // The description lives only in the backend slot-details response, not in
  // the local device_metadata.json, and is not scoped to a resource group.
  const { mergedResourceSlots } = useResourceSlotsDetails();
  const description = mergedResourceSlots[type]?.description ?? type;
  // One line of the description text, so the icon can be vertically centered
  // against the first line (not the whole wrapped block).
  const lineHeightPx = token.fontSize * token.lineHeight;
  return (
    <Tooltip
      content={t('session.launcher.UnifiedAcceleratorMemoryNote', {
        description,
      })}
    >
      <BAIFlex
        direction="row"
        gap="xxs"
        align="start"
        style={{ minWidth: 0, maxWidth: '100%' }}
      >
        {/* Match the icon box to one text line and center the icon so it stays
            aligned with the first line when the description wraps. */}
        <BAIFlex align="center" style={{ flexShrink: 0, height: lineHeightPx }}>
          <ResourceTypeIcon type={type} showTooltip={false} />
        </BAIFlex>
        <Text xstyle={unifiedChipStyles.description}>{description}</Text>
      </BAIFlex>
    </Tooltip>
  );
};

export const ResourceNumbersOfSession: React.FC<FormOrResourceRequired> = ({
  resource,
  containerCount = 1,
  comparedResource,
  showDividers = false,
}) => {
  'use memo';
  // `resource` is the primary value to display; `comparedResource` (when given)
  // is the reference to compare against (e.g. requested vs. allocated on the
  // session detail page). Each chip carries a stable identity key (slot type /
  // 'accelerator' / 'unified') so React reconciles by resource across renders
  // even though `'0'` slots are dropped and the accelerator chip is
  // conditionally appended.
  const slotChips = _.compact(
    _.map(
      _.omit(resource, 'shmem', 'accelerator', 'acceleratorType'),
      (value, type) => {
        const comparedRaw = comparedResource
          ? _.get(comparedResource, type)
          : undefined;
        // A zero slot normally renders no chip, but when a non-zero compared
        // (requested) amount exists keep it so the fully-denied case renders
        // `0 / <requested>` instead of silently disappearing while the section
        // label still warns about the difference.
        const hasComparedAmount =
          !_.isUndefined(comparedRaw) && _.toNumber(comparedRaw) !== 0;
        if (value === '0' && !hasComparedAmount) {
          return null;
        }
        // Convert a raw slot value to the displayed amount (memory is byte count
        // → number; everything else is multiplied by the container count).
        // Applied identically to the primary and compared values.
        const toDisplayValue = (raw: string | number) =>
          type === 'mem'
            ? (convertToBinaryUnit(raw.toString(), '')?.number || 0) *
                containerCount +
              ''
            : _.toNumber(raw) * containerCount + '';
        // When a compared resource is present, compare it against this slot's
        // primary value. A difference passes the compared value to the chip,
        // which appends it as a muted `/ <value>` reference and wraps the whole
        // number group in an "allocated / requested" tooltip (separate from the
        // icon's description tooltip). Raw equality only short-circuits the
        // obviously-equal case; the chip itself additionally drops a compared
        // value that rounds to the same displayed number, so sub-precision
        // differences never render as `4 / 4 GiB`-style pairs.
        const isDifferent =
          !_.isUndefined(comparedRaw) &&
          _.toNumber(comparedRaw) !== _.toNumber(value);
        return {
          key: type,
          node: (
            <BAIResourceNumberWithIcon
              // @ts-ignore
              type={type}
              value={toDisplayValue(value)}
              comparedValue={
                isDifferent ? toDisplayValue(comparedRaw) : undefined
              }
              opts={{
                shmem: resource.shmem
                  ? (convertToBinaryUnit(resource.shmem, '')?.number || 0) *
                    containerCount
                  : undefined,
              }}
            />
          ),
        };
      },
    ),
  );
  const acceleratorChip =
    resource?.acceleratorType &&
    isUnifiedAcceleratorSlot(resource.acceleratorType)
      ? {
          key: 'unified',
          // Unified-memory accelerator: show the device description regardless
          // of amount, with the same explanatory tooltip as the launcher's
          // accelerator field on hover.
          node: <UnifiedAcceleratorChip type={resource.acceleratorType} />,
        }
      : resource &&
          resource.accelerator &&
          resource.acceleratorType &&
          _.isNumber(resource.accelerator)
        ? {
            key: 'accelerator',
            node: (
              <BAIResourceNumberWithIcon
                // @ts-ignore
                type={resource.acceleratorType}
                value={_.toString(resource.accelerator * containerCount)}
              />
            ),
          }
        : null;
  const chips = _.compact([...slotChips, acceleratorChip]);
  return (
    <>
      {chips.map(({ key, node }, index) => (
        <React.Fragment key={key}>
          {/* Separate each resource chip with a vertical divider (same pattern
              as ImageNodeSimpleTag) so the resources read as distinct items.
              Opt-in via `showDividers` — column-layout callers leave it off to
              avoid stray dividers between stacked chips. */}
          {showDividers && index > 0 ? (
            <Divider orientation="vertical" style={{ marginInline: 0 }} />
          ) : null}
          {node}
        </React.Fragment>
      ))}
    </>
  );
};

export default SessionLauncherPage;
