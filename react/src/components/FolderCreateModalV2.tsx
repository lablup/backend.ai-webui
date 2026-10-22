/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  FolderCreateModalV2ProjectMutation,
  FolderCreateModalV2ProjectMutation$data,
} from '../__generated__/FolderCreateModalV2ProjectMutation.graphql';
// `Form.Item` IS `BAIFormItem` — the visual shell plus the engine binding.
import { Form, FormInstance } from '../form-engine';
import { useSuspendedBackendaiClient } from '../hooks';
import { useSetBAINotification } from '../hooks/useBAINotification';
import { ProjectContext, ProjectContextOrNull } from '../types/projectContext';
import BAIFormItem from './BAIFormItem';
import ProjectSelectForAdminPage from './ProjectSelectForAdminPage';
// Keeps its antd-shaped contract until the ComplexSelector-based rebuild lands.
import StorageSelect from './StorageSelect';
import {
  AstryxFormRadioList,
  AstryxFormSwitch,
  AstryxFormTextInput,
} from './astryxFormControls';
import { Banner } from '@lablup/ui-common/Banner';
import { Button } from '@lablup/ui-common/Button';
import { Divider } from '@lablup/ui-common/Divider';
import { HStack, VStack } from '@lablup/ui-common/Stack';
import { useTheme } from '@lablup/ui-common/theme';
import {
  BAIIconWithTooltip,
  BAIModal,
  BAIQuestionIconWithTooltip,
  BAISelect,
  toLocalId,
  type BAIModalProps,
  useBAILogger,
  useErrorMessageResolver,
  useMutationWithPromise,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { TriangleAlertIcon } from 'lucide-react';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql } from 'react-relay';

const MODEL_STORE_PROJECT_NAME = 'model-store';
const FOLDER_NAME_MAX_LENGTH = 64;
const MODAL_WIDTH = 650;

interface FolderCreateFormItemsType {
  name: string;
  host: string | undefined;
  group: string | undefined;
  usage_mode: 'general' | 'model' | 'automount';
  permission: 'rw' | 'ro';
  cloneable: boolean;
}

export type FolderCreationResponse = NonNullable<
  FolderCreateModalV2ProjectMutation$data['createVFolderInProject']
>['vfolder'];

export interface FolderCreateModalProps extends Omit<
  BAIModalProps,
  'isOpen' | 'onOpenChange'
> {
  /** App-level contract, kept: 9 consumers outside this area use it. */
  open?: boolean;
  onRequestClose: (response?: FolderCreationResponse) => void;
  /**
   * Explicit project prop contract (ADR-0001). The page decides the project
   * context; this modal never reads the ambient current project.
   *
   * Every folder is created as a project folder of this project.
   *
   * - Non-null: no in-modal selector is rendered and the folder is created
   *   in exactly this project. Model-store usage-mode gating is keyed off
   *   `project.name`.
   * - `null` ("no ambient project context", e.g. super-admin pages): a
   *   required in-modal project selector is rendered and the mutation
   *   targets the project chosen there.
   */
  project: ProjectContextOrNull;
  initialValidate?: boolean;
  initialValues?: Partial<FolderCreateFormItemsType>;
  /**
   * `'model_project'` locks usage_mode='model', permission='ro',
   * cloneable=true. Used by the Model Store admin flow.
   */
  folderType?: 'model_project';
  /**
   * Optional banner above the form for caller-specific constraints,
   * rendered as an Astryx `Banner status="warning"`.
   */
  alertMessage?: React.ReactNode;
}

const FolderCreateModalV2: React.FC<FolderCreateModalProps> = ({
  onRequestClose,
  project,
  initialValidate = false,
  initialValues: initialValuesFromProps = {},
  folderType,
  alertMessage,
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

  // The permission rule closes over `effectiveProject` (model-store read-only
  // lock), so re-validate only after the in-modal selection commits.
  useEffect(() => {
    if (formRef.current?.getFieldValue('permission')) {
      formRef.current.validateFields(['permission']);
    }
  }, [selectedProject]);

  const { upsertNotification } = useSetBAINotification();

  const INITIAL_FORM_VALUES: FolderCreateFormItemsType = {
    name: '',
    host: undefined,
    group: project?.id,
    usage_mode: 'general',
    permission: 'rw',
    cloneable: false,
  };

  const isFolderTypeLocked = folderType === 'model_project';
  const isModelStoreProject =
    effectiveProject?.name === MODEL_STORE_PROJECT_NAME;
  // When folderType narrows the form, these preset values override any
  // user-passed initialValues for the affected fields.
  const folderTypePreset: Partial<FolderCreateFormItemsType> | undefined =
    folderType === 'model_project'
      ? {
          usage_mode: 'model',
          permission: 'ro',
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
    useMutationWithPromise<FolderCreateModalV2ProjectMutation>(graphql`
      mutation FolderCreateModalV2ProjectMutation(
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

    const isAutomount = values.usage_mode === 'automount';
    const folderName =
      isAutomount && !_.startsWith(values.name, '.')
        ? `.${values.name}`
        : values.name;

    let vfolderResults: FolderCreationResponse | undefined;
    try {
      vfolderResults = await commitCreateInProjectMutation({
        // Not `values.group`: the form snapshots initialValues at mount and
        // never resyncs them to later `project` prop changes.
        projectId: effectiveProject?.id ?? values.group ?? '',
        input: {
          name: folderName,
          host: values.host ?? null,
          cloneable: !!values.cloneable,
          // An automount folder is a GENERAL folder whose name starts with '.'.
          usageMode: values.usage_mode === 'model' ? 'MODEL' : 'GENERAL',
          permission: values.permission === 'ro' ? 'READ_ONLY' : 'READ_WRITE',
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

    if (vfolderResults) {
      upsertNotification({
        key: `folder-create-success-${toLocalId(vfolderResults.id)}`,
        icon: 'folder',
        node: vfolderResults.notificationFrgmt,
        description: t('data.folders.FolderCreated'),
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

    onRequestClose(vfolderResults);
  };

  return (
    <BAIModal
      isOpen={modalProps.open}
      onOpenChange={(next) => {
        if (!next) onRequestClose();
      }}
      title={t('data.CreateANewStorageFolder')}
      maskClosable={false}
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
            clickAction={async () => {
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
              ({ getFieldValue }) => ({
                validator(_rule, value) {
                  if (_.isEmpty(value)) {
                    return Promise.reject(
                      new Error(t('data.FolderNameRequired')),
                    );
                  }
                  if (
                    getFieldValue('usage_mode') === 'automount' &&
                    !_.startsWith(value, '.')
                  ) {
                    return Promise.reject(
                      new Error(t('data.AutomountFolderNameMustStartWithDot')),
                    );
                  }
                  if (
                    getFieldValue('usage_mode') !== 'automount' &&
                    _.startsWith(value, '.')
                  ) {
                    return Promise.reject(
                      new Error(t('data.DotPrefixReservedForAutomount')),
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <AstryxFormTextInput
              label={t('data.Foldername')}
              placeholder={t('maxLength.64chars')}
            />
          </BAIFormItem>

          <BAIFormItem
            label={t('data.UsageMode')}
            name={'usage_mode'}
            layout="horizontal"
            required
          >
            <AstryxFormRadioList
              label={t('data.UsageMode')}
              disabled={isFolderTypeLocked}
              onValueChange={() => {
                // Only validate name field if it has a value to prevent
                // excessive validation
                if (formRef.current?.getFieldValue('name')) {
                  formRef.current.validateFields(['name']);
                }
              }}
              options={[
                {
                  value: 'general',
                  label: t('data.General'),
                  'data-testid': 'general-usage-mode',
                },
                {
                  value: 'model',
                  label: t('data.Models'),
                  'data-testid': 'model-usage-mode',
                },
                {
                  value: 'automount',
                  label: t('data.AutoMount'),
                  'data-testid': 'automount-usage-mode',
                  endContent: (
                    <BAIQuestionIconWithTooltip
                      title={t('data.AutomountFolderCreationDesc')}
                    />
                  ),
                },
              ]}
            />
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

          <Form.Item dependencies={['usage_mode']} noStyle required>
            {({ getFieldValue }) => {
              // Model folders of the model-store project are read-only
              // (FR-1290); the manager does not enforce it. Mirrored in
              // VFolderNodeDescriptionV2.
              const shouldDisableRWPermission =
                getFieldValue('usage_mode') === 'model' && isModelStoreProject;

              return (
                <BAIFormItem
                  label={t('data.folders.MountPermission')}
                  name={'permission'}
                  layout="horizontal"
                  required
                  dependencies={['usage_mode']}
                  rules={[
                    {
                      validator: (__, value) =>
                        shouldDisableRWPermission && value === 'rw'
                          ? Promise.reject(
                              new Error(
                                t(
                                  'data.folders.ModelProjectFolderRestrictedToReadOnly',
                                ),
                              ),
                            )
                          : Promise.resolve(),
                    },
                  ]}
                >
                  <AstryxFormRadioList
                    label={t('data.folders.MountPermission')}
                    disabled={isFolderTypeLocked}
                    options={[
                      {
                        value: 'rw',
                        label: t('data.ReadWrite'),
                        'data-testid': 'rw-permission',
                        disabled: shouldDisableRWPermission,
                        endContent:
                          !isFolderTypeLocked && shouldDisableRWPermission ? (
                            <BAIIconWithTooltip
                              content={t(
                                'data.folders.ModelProjectFolderRestrictedToReadOnly',
                              )}
                              focusable={false}
                              icon={<TriangleAlertIcon />}
                            />
                          ) : undefined,
                      },
                      {
                        value: 'ro',
                        label: t('data.ReadOnly'),
                        'data-testid': 'ro-permission',
                      },
                    ]}
                  />
                </BAIFormItem>
              );
            }}
          </Form.Item>

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
                      <AstryxFormSwitch label={t('data.folders.Cloneable')} />
                    </BAIFormItem>
                  </>
                )
              );
            }}
          </Form.Item>
        </Form>
      </VStack>
    </BAIModal>
  );
};

export default FolderCreateModalV2;
