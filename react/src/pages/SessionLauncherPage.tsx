/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import EnvVarFormList, {
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
import { ResourceNumbersOfSession } from '../components/ResourceNumbersOfSession';
import BatchSessionFormItems from '../components/SessionFormItems/BatchSessionFormItems';
import HPCOptimizationFormItems from '../components/SessionFormItems/HPCOptimizationFormItems';
import ResourceAllocationFormItems, {
  RESOURCE_ALLOCATION_INITIAL_FORM_VALUES,
  ResourceAllocationFormValue,
} from '../components/SessionFormItems/ResourceAllocationFormItems';
import SessionLauncherValidationTour from '../components/SessionLauncherErrorTourProps';
import SessionLauncherFormIncompatibleValueChecker from '../components/SessionLauncherFormIncompatibleValueChecker';
import SessionLauncherPreview from '../components/SessionLauncherPreview';
import SessionLauncherStorageStep from '../components/SessionLauncherStorageStep';
import SessionNameFormItem, {
  SessionNameFormItemValue,
} from '../components/SessionNameFormItem';
import SessionTemplateModal from '../components/SessionTemplateModal';
import { Form } from '../form-engine';
import { normalizeLegacyMountFields } from '../helper/vfolderMounts';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../hooks';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import {
  toShareableFormValues,
  useLaunchSession,
} from '../hooks/useLaunchSession';
import { useStartSession } from '../hooks/useStartSession';
import { toProjectContext } from '../types/projectContext';
import { Button } from '@lablup/ui-common/Button';
import { ButtonGroup } from '@lablup/ui-common/ButtonGroup';
import { DropdownMenu } from '@lablup/ui-common/DropdownMenu';
import { Heading } from '@lablup/ui-common/Heading';
import { Step, Stepper } from '@lablup/ui-common/Stepper';
import { Tooltip } from '@lablup/ui-common/Tooltip';
import type { SessionResources as ClientSessionResources } from 'backend.ai-client';
import {
  BAIPopconfirm,
  BAICard,
  BAIFlex,
  BAIUnmountAfterClose,
  type VFolderMountConfigValue,
  filterOutEmpty,
  generateRandomString,
  useBAILogger,
  useDebounceFn,
  useToggle,
  useUpdatableState,
  useBAIBreakpoint,
  BAIRadioList,
  BAIRadioListItem,
  BAISelector,
  BAITextInput,
} from 'backend.ai-ui';
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
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

type SessionLauncherFormData = Omit<
  Required<OptionalFieldsOnly<SessionLauncherFormValue>>,
  'mounts'
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
    environ?: {
      [key: string]: string;
    };
    scaling_group?: string;
    preopen_ports?: number[];
    agent_list?: string[];
  } & Pick<
    NonNullable<ClientSessionResources['config']>,
    'mount_ids' | 'mount_id_map' | 'mount_options'
  >;
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

export interface SessionLauncherVFolderMountValues {
  vfolderMounts?: VFolderMountConfigValue[];
  /**
   * Deprecated mount-by-name field. Only `SessionLauncherFormIncompatibleValueChecker`
   * still reads it, to warn about and clear a stale `?formValues=` param.
   */
  mounts?: string[];
}

export type SessionLauncherFormValue = SessionLauncherValue &
  SessionNameFormItemValue &
  ImageEnvironmentFormInput &
  ResourceAllocationFormValue &
  SessionLauncherVFolderMountValues &
  PortSelectFormValues;

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

/** The fields this page sets on a `Stepper` step. */
type StepItem = {
  title: string;
  icon?: React.ReactNode;
};

interface StepPropsWithKey extends StepItem {
  key: SessionLauncherStepKey;
}

/**
 * Step-section container. `hidden` keeps the original
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
    <BAICard title={title} style={{ display: hidden ? 'none' : undefined }}>
      {children}
    </BAICard>
  );
};

const SessionLauncherPage = () => {
  const { logger } = useBAILogger();

  const mainContentDivRef = useAtomValue(mainContentDivRefState);
  const baiClient = useSuspendedBackendaiClient();
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

  const { defaultFormValues } = useStartSession();
  const { launch } = useLaunchSession();
  const StepParam = parseAsInteger.withDefault(0);
  // Migrate at the parser so every reader of `formValuesFromQueryParams` sees
  // `vfolderMounts`, never the legacy mount fields.
  const FormValuesParam = parseAsJson<DeepPartial<SessionLauncherFormValue>>(
    (value) =>
      normalizeLegacyMountFields(
        value as DeepPartial<SessionLauncherFormValue>,
      ),
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

  const { run: syncFormToURLWithDebounce } = useDebounceFn(
    () => {
      // To sync the latest form values to URL,
      // 'trailing' is set to true, and get the form values here."
      setQuery({
        // eslint-disable-next-line react-hooks/immutability -- forward reference to a later declaration kept as-is
        formValues: toShareableFormValues(form.getFieldsValue()),
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

    await launch(values, {
      numOfSessions,
      history: { params: usedSearchParams },
      onSuccess: () => webuiNavigate(redirectTo || '/job'),
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
          gap="md"
          style={{ flex: 1, maxWidth: 700 }}
        >
          <BAIFlex direction="row" justify="between">
            <Heading level={4}>{t('session.launcher.StartNewSession')}</Heading>
            <BAIFlex direction="row" gap={'sm'}>
              <Button
                variant="ghost"
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
                        The two-part antd label ("<mode name> <one-sentence
                        description>") splits onto `RadioListItem`'s `label` +
                        `description`; through `endContent` the sentences
                        overlapped their own labels (measured). `Text
                        type="code"` on the mode name is DROPPED: both are plain
                        strings. */}
                    <BAIRadioList
                      aria-label={t('session.launcher.SessionType')}
                      orientation="vertical"
                    >
                      <BAIRadioListItem
                        value="interactive"
                        label={t('session.launcher.InteractiveMode')}
                        description={t('session.launcher.InteractiveModeDesc')}
                      />
                      <BAIRadioListItem
                        value="batch"
                        label={t('session.launcher.BatchMode')}
                        description={t('session.launcher.BatchModeDesc')}
                      />
                    </BAIRadioList>
                  </Form.Item>
                  <SessionNameFormItem />
                  <Form.Item
                    name="bootstrap_script"
                    label="Bootstrap Script"
                    hidden
                  >
                    <BAITextInput aria-label="Bootstrap Script" />
                  </Form.Item>
                </StepCard>

                {sessionType === 'batch' && (
                  <StepCard
                    title={t('session.launcher.BatchModeConfig')}
                    hidden={currentStepKey !== 'sessionType'}
                  >
                    <BatchSessionFormItems />
                  </StepCard>
                )}

                {sessionType === 'inference' && (
                  <StepCard title={t('session.launcher.InferenceModeConfig')}>
                    <Form.Item
                      name={['inference', 'vFolderName']}
                      label={t('session.launcher.ModelStorageToMount')}
                      rules={[
                        {
                          required: true,
                        },
                      ]}
                    >
                      {/* Optionless placeholder left behind when the model
                          folder select was removed from this step. */}
                      <BAISelector
                        aria-label={t('session.launcher.ModelStorageToMount')}
                        options={[]}
                      />
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
                    // An SSH/SFTP system session runs in the SFTP resource
                    // group the selector hides from every other session type.
                    includeSFTPResourceGroups={sessionType === 'system'}
                    enableAgentSelect={!baiClient._config.hideAgents}
                    enableResourcePresets
                    showRemainingWarning
                  />
                </StepCard>
                <StepCard
                  title={t('session.launcher.HPCOptimization')}
                  hidden={currentStepKey !== 'environment'}
                >
                  <HPCOptimizationFormItems />
                </StepCard>
                {/* Step Start*/}
                <StepCard
                  title={t('webui.menu.Data&Storage')}
                  hidden={currentStepKey !== 'storage'}
                >
                  <SessionLauncherStorageStep
                    form={form}
                    project={currentProjectContext}
                  />
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
                    currentProjectId={currentProjectContext.id}
                    onClickEditStep={(stepKey) => {
                      const nextStep = _.findIndex(steps, { key: stepKey });
                      setCurrentStep(nextStep);
                    }}
                  />
                )}

                <BAIFlex direction="row" justify="between">
                  <BAIFlex gap={'sm'}>
                    {/* Reversible action -> anchored one-click confirm
                        (BAIPopconfirm, gap component 08); the typed
                        confirm modal stays reserved for irreversible flows. */}
                    <BAIPopconfirm
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
                    </BAIPopconfirm>
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
            style={{ position: 'sticky', top: 20 }}
          >
            <Stepper
              orientation="vertical"
              density="compact"
              // FR-3596: on-track puts each indicator on the connector line.
              // Keep in sync with the deployment preset rail, which mirrors this one.
              indicatorPosition="on-track"
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
                <Step
                  key={s.key}
                  step={idx}
                  label={s.title}
                  indicator={s.icon ?? 'number'}
                />
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
                vfolderMounts: [],
                bootstrap_script: '',
                num_of_sessions: 1,
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
              normalizeLegacyMountFields(formValue),
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

export { ResourceNumbersOfSession };

export default SessionLauncherPage;
