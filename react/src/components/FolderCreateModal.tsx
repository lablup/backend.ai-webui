/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  FolderCreateModalAutoMountMutation,
  FolderCreateModalAutoMountMutation$data,
} from '../__generated__/FolderCreateModalAutoMountMutation.graphql';
import { FolderCreateModalAutoMountPermissionQuery } from '../__generated__/FolderCreateModalAutoMountPermissionQuery.graphql';
import { FolderCreateModalPermissionQuery } from '../__generated__/FolderCreateModalPermissionQuery.graphql';
import {
  FolderCreateModalProjectMutation,
  FolderCreateModalProjectMutation$data,
} from '../__generated__/FolderCreateModalProjectMutation.graphql';
// `Form.Item` IS `BAIFormItem` — the visual shell plus the engine binding.
import { Form, FormInstance } from '../form-engine';
import { buildPath } from '../helper/pathBuilder';
import { useSuspendedBackendaiClient } from '../hooks';
import { useAccessibleProjects } from '../hooks/useAccessibleProjects';
import { useMyAppConfig } from '../hooks/useAppConfig';
import { useSetBAINotification } from '../hooks/useBAINotification';
import { ProjectContext, ProjectContextOrNull } from '../types/projectContext';
import BAIFormItem from './BAIFormItem';
import ErrorBoundaryWithNullFallback from './ErrorBoundaryWithNullFallback';
import ProjectSelectForAdminPage from './ProjectSelectForAdminPage';
// Keeps its antd-shaped contract until the ComplexSelector-based rebuild lands.
import StorageSelect from './StorageSelect';
import type { VFolderAutoMountScopeType } from './VFolderAutoMountSettingModal';
import './collapsible-section.css';
import { Banner } from '@lablup/ui-common/Banner';
import { Button } from '@lablup/ui-common/Button';
import { Divider } from '@lablup/ui-common/Divider';
import { HStack, VStack } from '@lablup/ui-common/Stack';
import { useTheme } from '@lablup/ui-common/theme';
import {
  BAIModal,
  BAIQuestionIconWithTooltip,
  BAISelect,
  type BAIModalProps,
  useBAILogger,
  useErrorMessageResolver,
  useMutationWithPromise,
  BAICheckboxInput,
  BAIText,
  BAIRadioList,
  BAIRadioListItem,
  BAISwitch,
  BAITextInput,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { Suspense, useEffect, useEffectEvent, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

const SKIP_PROJECT_FOLDER_CONFIRM_KEY = 'skip_project_folder_confirm';
const FOLDER_NAME_MAX_LENGTH = 64;
const MODAL_WIDTH = 650;

interface FolderCreateFormItemsType {
  name: string;
  host: string | undefined;
  group: string | undefined;
  usage_mode: 'general' | 'model';
  cloneable: boolean;
  auto_mount_enabled?: boolean;
  auto_mount_destination?: string;
  auto_mount_subpath?: string;
  auto_mount_permission?: 'READ_ONLY' | 'READ_WRITE' | 'RW_DELETE';
}

export type FolderCreationResponse = NonNullable<
  FolderCreateModalProjectMutation$data['createVFolderInProject']
>['vfolder'];

export type FolderAutoMountCreationResponse = NonNullable<
  FolderCreateModalAutoMountMutation$data['createVfolderAutoMount']
>['vfolderAutoMount'];

export interface FolderCreateModalProps extends Omit<
  BAIModalProps,
  'isOpen' | 'onOpenChange'
> {
  /** App-level contract, kept: 9 consumers outside this area use it. */
  open?: boolean;
  onRequestClose: (
    response?: FolderCreationResponse,
    autoMountResponse?: FolderAutoMountCreationResponse,
  ) => void;
  /**
   * Explicit project prop contract (ADR-0001). The page decides the project
   * context; this modal never reads the ambient current project.
   *
   * Every folder is created as a project folder of this project.
   *
   * - Non-null: no in-modal selector is rendered and the folder is created
   *   in exactly this project.
   * - `null` ("no ambient project context", e.g. super-admin pages): a
   *   required in-modal project selector is rendered and the mutation
   *   targets the project chosen there.
   */
  project: ProjectContextOrNull;
  initialValidate?: boolean;
  initialValues?: Partial<FolderCreateFormItemsType>;
  /**
   * `'model_project'` locks usage_mode='model' and cloneable=true. Used by the
   * Model Store admin flow.
   */
  folderType?: 'model_project';
  /**
   * Optional banner above the form for caller-specific constraints,
   * rendered as an Astryx `Banner status="warning"`.
   */
  alertMessage?: React.ReactNode;
  /** Scope the folder's auto-mount is set on; the caller decides (ADR 0036). */
  autoMountScopeType?: VFolderAutoMountScopeType;
  /** The `USER` scope's user when it is not the caller, with an email for the notice. */
  autoMountUser?: { id: string; email?: string | null };
}

const FolderCreateModal: React.FC<FolderCreateModalProps> = ({
  onRequestClose,
  project,
  initialValidate = false,
  initialValues: initialValuesFromProps = {},
  folderType,
  alertMessage,
  autoMountScopeType = 'PROJECT',
  autoMountUser,
  ...modalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = useTheme();
  const { logger } = useBAILogger();
  const { getErrorMessage } = useErrorMessageResolver();

  const formRef = useRef<FormInstance>(null);
  const baiClient = useSuspendedBackendaiClient();
  // ADR-0001: the target project comes exclusively from the `project` prop;
  // when it is `null`, the in-modal selector's choice is tracked here so
  // model-store gating follows it, never the ambient project.
  const [selectedProject, setSelectedProject] = useState<ProjectContext | null>(
    null,
  );
  const effectiveProject = project ?? selectedProject;

  const { personalProject } = useAccessibleProjects();
  // A general project's folders are visible to its members; the model-store
  // admin flow is excluded.
  const isSharedTarget =
    !!effectiveProject &&
    effectiveProject.id !== personalProject?.id &&
    folderType !== 'model_project';
  // Super-admins are not governed by project roles, so the check is skipped.
  const shouldCheckCreatePermission =
    isSharedTarget && !baiClient?.is_superadmin;
  const [createPermission, setCreatePermission] = useState<{
    projectId: string;
    canCreate: boolean;
  } | null>(null);
  // `undefined` until known, and for targets that need no notice.
  const canCreateInSharedProject: boolean | undefined = !isSharedTarget
    ? undefined
    : !shouldCheckCreatePermission
      ? true
      : createPermission?.projectId === effectiveProject?.id
        ? createPermission?.canCreate
        : undefined;

  const [skipSharedFolderConfirmValue, setSkipSharedFolderConfirm] =
    useMyAppConfig<boolean>('userConfig', SKIP_PROJECT_FOLDER_CONFIRM_KEY);
  const skipSharedFolderConfirm = !!skipSharedFolderConfirmValue;
  const [isSharedConfirmOpen, setIsSharedConfirmOpen] = useState(false);
  const [dontAskAgain, setDontAskAgain] = useState(false);
  const [isConfirmPending, setIsConfirmPending] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const { upsertNotification } = useSetBAINotification();

  const INITIAL_FORM_VALUES: FolderCreateFormItemsType = {
    name: '',
    host: undefined,
    group: project?.id,
    usage_mode: 'general',
    cloneable: false,
    auto_mount_enabled: false,
    auto_mount_destination: '',
    auto_mount_subpath: '.',
    auto_mount_permission: 'READ_WRITE',
  };

  const isFolderTypeLocked = folderType === 'model_project';
  const isPersonalTarget = autoMountScopeType === 'USER';
  const autoMountTarget = effectiveProject
    ? isPersonalTarget
      ? { scopeType: 'user', scopeId: autoMountUser?.id ?? baiClient.user_uuid }
      : { scopeType: 'project', scopeId: effectiveProject.id }
    : null;
  const autoMountTargetKey = autoMountTarget
    ? `${autoMountTarget.scopeType}:${autoMountTarget.scopeId}`
    : null;
  const [autoMountPermission, setAutoMountPermission] = useState<{
    key: string;
    canCreate: boolean;
  } | null>(null);
  // `undefined` while the check for the current target is in flight.
  const canSetAutoMount: boolean | undefined =
    autoMountPermission && autoMountPermission.key === autoMountTargetKey
      ? autoMountPermission.canCreate
      : undefined;
  // When folderType narrows the form, these preset values override any
  // user-passed initialValues for the affected fields.
  const folderTypePreset: Partial<FolderCreateFormItemsType> | undefined =
    folderType === 'model_project'
      ? {
          usage_mode: 'model',
          cloneable: true,
        }
      : undefined;

  const mergedInitialValues: FolderCreateFormItemsType = {
    ...INITIAL_FORM_VALUES,
    ...initialValuesFromProps,
    ...folderTypePreset,
    // Fixed mode: the `project` prop wins over any caller `initialValues.group`.
    ...(project ? { group: project.id } : {}),
  };

  // Access is gated server-side by project-scoped CREATE permission.
  const commitCreateInProjectMutation =
    useMutationWithPromise<FolderCreateModalProjectMutation>(graphql`
      mutation FolderCreateModalProjectMutation(
        $projectId: UUID!
        $input: CreateVFolderInScopeInput!
      ) {
        createVFolderInProject(projectId: $projectId, input: $input) {
          vfolder {
            id
            entityId
            vfolderStatus: status
            host
            metadata {
              name
              usageMode
              quotaScopeId
              cloneable
            }
            accessControl {
              permission
              ownershipType
            }
            ownership {
              userId
              projectId
              creatorEmail
            }
            ...BAINodeNotificationItemFragment @alias(as: "notificationFrgmt")
          }
        }
      }
    `);

  const commitCreateAutoMountMutation =
    useMutationWithPromise<FolderCreateModalAutoMountMutation>(graphql`
      mutation FolderCreateModalAutoMountMutation(
        $input: CreateVFolderAutoMountInput!
      ) {
        createVfolderAutoMount(input: $input) {
          vfolderAutoMount {
            id
          }
        }
      }
    `);

  const handleOk = async () => {
    let values: FolderCreateFormItemsType | undefined;
    try {
      values = await formRef.current?.validateFields();
    } catch (error) {
      // The form renders inline errors for validation failures; just log.
      logger.error(error);
      return;
    }
    if (!values) return;

    const folderName = values.name;

    const wantsAutoMountSetting =
      canSetAutoMount === true && !!values.auto_mount_enabled;
    let vfolderResults: FolderCreationResponse | undefined;
    try {
      // Every folder starts read-only for shared users (#10647); the default
      // mount permission is changed from the share modal.
      vfolderResults = await commitCreateInProjectMutation({
        // Not `values.group`: the form snapshots initialValues at mount and
        // never resyncs them to later `project` prop changes.
        projectId: effectiveProject?.id ?? values.group ?? '',
        input: {
          name: folderName,
          host: values.host ?? null,
          cloneable: !!values.cloneable,
          usageMode: values.usage_mode === 'model' ? 'MODEL' : 'GENERAL',
          permission: 'READ_ONLY',
        },
      }).then((res) => res?.createVFolderInProject?.vfolder);
    } catch (error) {
      const errorDetail = Array.isArray(error)
        ? _.map(error, 'message').join('\n')
        : error instanceof Error
          ? getErrorMessage(error)
          : undefined;
      upsertNotification({
        key: `folder-create-failure-${folderName}-${Date.now()}`,
        // Without this the stack falls back to 'info' and a failure paints as
        // a blue notice (FR-3700).
        type: 'error',
        icon: 'folder',
        message: `${t('general.Folder')}: ${folderName}`,
        description: t('data.folders.FolderCreationFailed'),
        extraDescription: errorDetail,
        open: true,
      });
      logger.error(error);
      return;
    }

    let autoMountError: string | undefined;
    let autoMountResults: FolderAutoMountCreationResponse | undefined;
    if (wantsAutoMountSetting && vfolderResults && autoMountTarget) {
      // The folder exists by now; a refused auto-mount is reported, not undone.
      await commitCreateAutoMountMutation({
        input: {
          scope: {
            scopeType:
              autoMountTarget.scopeType === 'user' ? 'USER' : 'PROJECT',
            scopeId: autoMountTarget.scopeId,
          },
          vfolderId: vfolderResults.entityId,
          mountDestination: (values.auto_mount_destination ?? '').trim(),
          subpath: values.auto_mount_subpath?.trim() || '.',
          mountPermission: values.auto_mount_permission ?? 'READ_WRITE',
        },
      })
        .then((res) => {
          autoMountResults = res?.createVfolderAutoMount?.vfolderAutoMount;
        })
        .catch((error) => {
          logger.error(error);
          autoMountError = getErrorMessage(error);
        });
    }

    if (vfolderResults) {
      // A refused auto-mount rides on the creation notice instead of a second one.
      upsertNotification({
        key: `folder-create-success-${vfolderResults.entityId}`,
        icon: 'folder',
        node: vfolderResults.notificationFrgmt,
        ...(autoMountError !== undefined
          ? {
              type: 'warning' as const,
              description: t('autoMount.AutoMountFailedAfterCreation'),
              extraDescription: autoMountError,
            }
          : { description: t('data.folders.FolderCreated') }),
        open: true,
      });
    } else {
      upsertNotification({
        key: `folder-create-success-${folderName}-${Date.now()}`,
        icon: 'folder',
        message: `${t('general.Folder')}: ${folderName}`,
        description: t('data.folders.FolderCreated'),
        open: true,
      });
    }

    onRequestClose(vfolderResults, autoMountResults);
  };

  return (
    <>
      <BAIModal
        isOpen={modalProps.open}
        onOpenChange={(next) => {
          if (!next) onRequestClose();
        }}
        title={t('data.CreateANewStorageFolder')}
        maskClosable={false}
        unmountOnClose
        footer={
          <HStack justify="end" gap={2}>
            <Button
              variant="secondary"
              label={t('button.Cancel')}
              onClick={() => {
                onRequestClose();
              }}
            />
            <Button
              variant="primary"
              label={t('data.Create')}
              isDisabled={canCreateInSharedProject === false}
              isLoading={isCreating}
              clickAction={async () => {
                if (canCreateInSharedProject && !skipSharedFolderConfirm) {
                  // Ask only once the form is valid; inline errors show otherwise.
                  const isValid = await formRef.current
                    ?.validateFields()
                    .then(() => true)
                    .catch(() => false);
                  if (isValid) setIsSharedConfirmOpen(true);
                  return;
                }
                await handleOk();
              }}
              {...({ 'data-testid': 'create-folder-button' } as object)}
            />
          </HStack>
        }
        width={MODAL_WIDTH}
        {...modalProps}
        afterOpenChange={(nowOpen) => {
          if (!nowOpen) return;
          // The modal is destroyed on close, which clears the form; keep the
          // tracked in-modal project selection in sync with it.
          setSelectedProject(null);
          if (initialValidate) {
            formRef.current?.validateFields();
          }
        }}
      >
        {autoMountTarget && autoMountTargetKey ? (
          <ErrorBoundaryWithNullFallback>
            <Suspense fallback={null}>
              <AutoMountPermissionCheck
                scopeType={autoMountTarget.scopeType}
                scopeId={autoMountTarget.scopeId}
                onResolved={(canCreate) => {
                  setAutoMountPermission({
                    key: autoMountTargetKey,
                    canCreate,
                  });
                  if (!canCreate) {
                    formRef.current?.setFieldValue('auto_mount_enabled', false);
                  }
                }}
              />
            </Suspense>
          </ErrorBoundaryWithNullFallback>
        ) : null}
        {shouldCheckCreatePermission && effectiveProject ? (
          <Suspense fallback={null}>
            <FolderCreatePermissionCheck
              projectId={effectiveProject.id}
              onResolved={(canCreate) =>
                setCreatePermission({
                  projectId: effectiveProject.id,
                  canCreate,
                })
              }
            />
          </Suspense>
        ) : null}
        {canCreateInSharedProject !== undefined ? (
          <div style={{ marginBottom: token('--spacing-5') }}>
            <Banner
              role="status"
              status={canCreateInSharedProject ? 'info' : 'warning'}
              title={
                canCreateInSharedProject
                  ? t('data.folders.SharedProjectFolderVisibleToMembers')
                  : t('data.folders.NoPermissionToCreateFolderInProject')
              }
              container="section"
              endContent={
                personalProject?.name ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    label={t('data.folders.FolderCreationOpenPersonalProject')}
                    onClick={() => {
                      window.open(
                        buildPath('project', 'data', personalProject.name),
                        '_blank',
                        'noopener,noreferrer',
                      );
                    }}
                  />
                ) : undefined
              }
            />
          </div>
        ) : null}
        {alertMessage ? (
          <div style={{ marginBottom: token('--spacing-5') }}>
            <Banner
              role="alert"
              status="warning"
              title={alertMessage}
              container="section"
            />
          </div>
        ) : null}

        <VStack
          align="stretch"
          style={{
            paddingLeft: token('--spacing-5'),
            paddingRight: token('--spacing-5'),
            paddingTop: alertMessage ? 0 : token('--spacing-5'),
          }}
        >
          <Form
            ref={formRef}
            initialValues={mergedInitialValues}
            labelCol={{ span: 8 }}
            // Without this the engine default (`text-align: end`) bunches the
            // labels against the control column. Measurements: QA-FINDINGS Q-26.
            labelAlign="left"
          >
            {project === null && (
              <>
                <BAIFormItem
                  label={t('data.folders.TargetProject')}
                  name={'group'}
                  layout="horizontal"
                  required
                  rules={[
                    {
                      required: true,
                      message: t('data.folders.TargetProjectRequired'),
                    },
                  ]}
                >
                  {/* The Suspense boundary swallows BAIFormItem's injected
                    props, so the field value is written explicitly. */}
                  <Suspense fallback={<BAISelect loading disabled />}>
                    <ProjectSelectForAdminPage
                      data-testid="folder-create-project-select"
                      domain={baiClient._config.domainName}
                      onSelectProject={(projectInfo) => {
                        setSelectedProject({
                          id: projectInfo.projectId,
                          name: projectInfo.projectName,
                        });
                        formRef.current?.setFieldValue(
                          'group',
                          projectInfo.projectId,
                        );
                        formRef.current?.validateFields(['group']);
                      }}
                    />
                  </Suspense>
                </BAIFormItem>
                {/* Match the 24px bottom margin form items carry (FR-3441). */}
                <Divider style={{ marginBottom: token('--spacing-6') }} />
              </>
            )}
            <BAIFormItem
              label={t('data.Foldername')}
              name={'name'}
              layout="horizontal"
              // required check is handled in the name validator
              required
              rules={[
                {
                  pattern: /^[a-zA-Z0-9-_.]+$/,
                  message: t('data.AllowsLettersNumbersAnd-_Dot'),
                },
                {
                  max: FOLDER_NAME_MAX_LENGTH,
                  message: t('data.FolderNameTooLong'),
                },
                () => ({
                  validator(_rule, value) {
                    if (_.isEmpty(value)) {
                      return Promise.reject(
                        new Error(t('data.FolderNameRequired')),
                      );
                    }
                    if (_.startsWith(value, '.')) {
                      return Promise.reject(
                        new Error(t('data.FolderNameCannotStartWithDot')),
                      );
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <BAITextInput
                aria-label={t('data.Foldername')}
                placeholder={t('maxLength.64chars')}
              />
            </BAIFormItem>

            <BAIFormItem
              label={t('data.UsageMode')}
              name={'usage_mode'}
              layout="horizontal"
              required
            >
              <BAIRadioList
                aria-label={t('data.UsageMode')}
                disabled={isFolderTypeLocked}
                orientation="horizontal"
              >
                <BAIRadioListItem
                  value="general"
                  label={t('data.General')}
                  data-testid="general-usage-mode"
                />
                <BAIRadioListItem
                  value="model"
                  label={t('data.Models')}
                  data-testid="model-usage-mode"
                />
              </BAIRadioList>
            </BAIFormItem>

            <BAIFormItem
              label={t('data.folders.Location')}
              name={'host'}
              layout="horizontal"
              required
            >
              <Suspense fallback={<BAISelect loading disabled />}>
                <StorageSelect
                  onChange={(value) => {
                    formRef.current?.setFieldValue('host', value);
                  }}
                  showUsageStatus
                  autoSelectType="usage"
                  showSearch
                />
              </Suspense>
            </BAIFormItem>
            {project !== null && <Form.Item hidden name={'group'} />}

            <Form.Item dependencies={['usage_mode']} noStyle>
              {({ getFieldValue }) => {
                return (
                  getFieldValue('usage_mode') === 'model' && (
                    <>
                      <BAIFormItem
                        label={t('data.folders.Cloneable')}
                        name={'cloneable'}
                        layout="horizontal"
                      >
                        <BAISwitch aria-label={t('data.folders.Cloneable')} />
                      </BAIFormItem>
                    </>
                  )
                );
              }}
            </Form.Item>

            {/* The switch is the section's only expander: its fields exist only while auto-mount is on. */}
            <VStack
              className="bai-collapsible-section"
              align="stretch"
              data-testid="folder-create-auto-mount-section"
            >
              <HStack
                className="bai-toggle-section__header"
                justify="between"
                vAlign="center"
              >
                <HStack gap={1} vAlign="center">
                  <BAIText strong>{t('autoMount.AutoMountSettings')}</BAIText>
                  <BAIQuestionIconWithTooltip
                    title={
                      isPersonalTarget
                        ? t('autoMount.AutoMountInUserSessionsDesc')
                        : t('autoMount.AutoMountInSessionsDesc')
                    }
                  />
                </HStack>
                <Form.Item name={'auto_mount_enabled'} noStyle>
                  <BAISwitch
                    aria-label={t('autoMount.AutoMountSettings')}
                    isLoading={
                      !!autoMountTarget && canSetAutoMount === undefined
                    }
                    disabled={canSetAutoMount !== true}
                    disabledMessage={
                      canSetAutoMount === false
                        ? isPersonalTarget
                          ? t('autoMount.NoPermissionToSetAutoMount')
                          : t('autoMount.NoPermissionToSetProjectAutoMount')
                        : undefined
                    }
                  />
                </Form.Item>
              </HStack>
              <Form.Item dependencies={['auto_mount_enabled']} noStyle>
                {({ getFieldValue: getValue }) =>
                  getValue('auto_mount_enabled') && (
                    <VStack
                      className="bai-toggle-section__content"
                      align="stretch"
                    >
                      {isPersonalTarget &&
                      autoMountUser &&
                      autoMountUser.id !== baiClient.user_uuid ? (
                        <Banner
                          status="warning"
                          title={t('autoMount.SetOnOtherUserAutoMount', {
                            email: autoMountUser.email ?? autoMountUser.id,
                          })}
                        />
                      ) : null}
                      <BAIFormItem
                        label={t('autoMount.MountDestination')}
                        tooltip={t('autoMount.MountDestinationDesc')}
                        name={'auto_mount_destination'}
                        layout="horizontal"
                        required
                        rules={[
                          {
                            required: true,
                            whitespace: true,
                            message: t('autoMount.PleaseEnterMountDestination'),
                          },
                        ]}
                      >
                        <BAITextInput
                          aria-label={t('autoMount.MountDestination')}
                          placeholder="/home/work/data"
                        />
                      </BAIFormItem>
                      <BAIFormItem
                        label={t('autoMount.Subpath')}
                        tooltip={t('autoMount.SubpathDesc')}
                        name={'auto_mount_subpath'}
                        layout="horizontal"
                      >
                        <BAITextInput
                          aria-label={t('autoMount.Subpath')}
                          placeholder="."
                        />
                      </BAIFormItem>
                      <BAIFormItem
                        label={t('autoMount.MountPermission')}
                        name={'auto_mount_permission'}
                        layout="horizontal"
                        required
                      >
                        <BAISelect
                          showSearch={false}
                          aria-label={t('autoMount.MountPermission')}
                          options={[
                            {
                              value: 'READ_ONLY',
                              label: t('data.ReadOnly'),
                            },
                            {
                              value: 'READ_WRITE',
                              label: t('data.ReadWrite'),
                            },
                            {
                              value: 'RW_DELETE',
                              label: t('autoMount.ReadWriteDelete'),
                            },
                          ]}
                        />
                      </BAIFormItem>
                    </VStack>
                  )
                }
              </Form.Item>
            </VStack>
          </Form>
        </VStack>
      </BAIModal>
      <BAIModal
        open={isSharedConfirmOpen}
        title={t('data.CreateANewStorageFolder')}
        okText={t('data.Create')}
        confirmLoading={isConfirmPending}
        unmountOnClose
        onCancel={() => {
          setIsSharedConfirmOpen(false);
          setDontAskAgain(false);
        }}
        onOk={async () => {
          setIsConfirmPending(true);
          try {
            if (dontAskAgain) {
              // A failed preference write must not block the creation.
              await setSkipSharedFolderConfirm(true).catch((error) =>
                logger.error(error),
              );
            }
          } finally {
            setIsConfirmPending(false);
          }
          setIsSharedConfirmOpen(false);
          // The creation modal's Create button carries the loading state.
          setIsCreating(true);
          try {
            await handleOk();
          } finally {
            setIsCreating(false);
          }
        }}
        {...({ 'data-testid': 'shared-folder-confirm-modal' } as object)}
      >
        <VStack align="stretch" gap={3}>
          <BAIText>
            {t('data.folders.ConfirmCreateFolderVisibleToMembers')}
          </BAIText>
          <BAICheckboxInput
            value={dontAskAgain}
            onChange={(checked) => setDontAskAgain(!!checked)}
          >
            {t('data.folders.DontAskAgain')}
          </BAICheckboxInput>
        </VStack>
      </BAIModal>
    </>
  );
};

interface FolderCreatePermissionCheckProps {
  projectId: string;
  onResolved: (canCreate: boolean) => void;
}

/** Reports whether the caller may create auto-mounts on the scope. */
const AutoMountPermissionCheck: React.FC<{
  scopeType: string;
  scopeId: string;
  onResolved: (canCreate: boolean) => void;
}> = ({ scopeType, scopeId, onResolved }) => {
  'use memo';
  const { myScopePermissions } =
    useLazyLoadQuery<FolderCreateModalAutoMountPermissionQuery>(
      graphql`
        query FolderCreateModalAutoMountPermissionQuery(
          $scopeType: String!
          $scopeId: UUID!
        ) {
          myScopePermissions(
            input: {
              target: {
                scopeType: $scopeType
                scopeId: $scopeId
                entityType: "vfolder_auto_mount"
              }
            }
          ) {
            item {
              permissions
            }
          }
        }
      `,
      { scopeType, scopeId },
      { fetchPolicy: 'store-and-network' },
    );
  const canCreate = _.includes(myScopePermissions?.item.permissions, 'CREATE');

  const reportResolved = useEffectEvent(() => onResolved(canCreate));
  useEffect(() => {
    reportResolved();
  }, [scopeType, scopeId, canCreate]);

  return null;
};

/** Reports whether the caller holds CREATE on vfolders in the project. */
const FolderCreatePermissionCheck: React.FC<
  FolderCreatePermissionCheckProps
> = ({ projectId, onResolved }) => {
  'use memo';

  const { myScopePermissions } =
    useLazyLoadQuery<FolderCreateModalPermissionQuery>(
      graphql`
        query FolderCreateModalPermissionQuery($projectId: UUID!) {
          myScopePermissions(
            input: {
              target: {
                scopeType: "project"
                scopeId: $projectId
                entityType: "vfolder"
              }
            }
          ) {
            item {
              permissions
            }
          }
        }
      `,
      { projectId },
      { fetchPolicy: 'store-and-network' },
    );
  const canCreate = _.includes(myScopePermissions?.item.permissions, 'CREATE');

  const reportResolved = useEffectEvent(() => onResolved(canCreate));
  useEffect(() => {
    reportResolved();
  }, [projectId, canCreate]);

  return null;
};

export default FolderCreateModal;
