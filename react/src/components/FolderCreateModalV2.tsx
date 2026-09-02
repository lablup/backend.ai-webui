/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  FolderCreateModalV2Mutation,
  FolderCreateModalV2Mutation$data,
} from '../__generated__/FolderCreateModalV2Mutation.graphql';
import {
  FolderCreateModalV2ProjectMutation,
  FolderCreateModalV2ProjectMutation$data,
} from '../__generated__/FolderCreateModalV2ProjectMutation.graphql';
// `Form` and `Form.Item` both come from the self-hosted engine (ticket 34,
// re-enabled by ticket 35); `Form.Item` IS `BAIFormItem` — the visual shell
// plus the engine binding.
import { Form, FormInstance } from '../form-engine';
import { useSuspendedBackendaiClient } from '../hooks';
import { useSetBAINotification } from '../hooks/useBAINotification';
import { theme } from '../theme-shim';
import { ProjectContext, ProjectContextOrNull } from '../types/projectContext';
import BAIFormItem from './BAIFormItem';
import ProjectSelectForAdminPage from './ProjectSelectForAdminPage';
// Translating frontier (tickets 26/27): `StorageSelect` is a BUI antd Select
// composite shared with unmigrated consumers; it keeps its antd contract here
// until the ComplexSelector-based rebuild lands.
import StorageSelect from './StorageSelect';
import {
  AstryxFormRadioList,
  AstryxFormSwitch,
  AstryxFormTextInput,
} from './astryxFormControls';
import { Banner } from '@astryxdesign/core/Banner';
import { Button } from '@astryxdesign/core/Button';
import { Divider } from '@astryxdesign/core/Divider';
import { Skeleton } from '@astryxdesign/core/Skeleton';
import { HStack, VStack } from '@astryxdesign/core/Stack';
import {
  BAIModal,
  BAIQuestionIconWithTooltip,
  toLocalId,
  type BAIModalProps,
  useBAILogger,
  useErrorMessageResolver,
  useMutationWithPromise,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { Suspense, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql } from 'react-relay';

// Constants
const MODEL_STORE_PROJECT_NAME = 'model-store';
const FOLDER_NAME_MAX_LENGTH = 64;
const MODAL_WIDTH = 650;

// Ticket 16: the `createStyles` block is gone. It held two rule sets, and BOTH
// were the P6 failure mode — `.ant-form-item-*` (dead once `Form.Item` became
// `BAIFormItem`) and `.ant-modal-body` (dead once `BAIModal` became
// Astryx-based, which renders no such element).

interface FolderCreateFormItemsType {
  name: string;
  host: string | undefined;
  group: string | undefined;
  usage_mode: 'general' | 'model' | 'automount';
  permission: 'rw' | 'ro';
  cloneable: boolean;
}

// Both mutations return the same vfolder selection set; alias either generated
// type so callers don't need to know which mutation produced the value.
export type FolderCreationResponse =
  | NonNullable<FolderCreateModalV2Mutation$data['createVfolderV2']>['vfolder']
  | NonNullable<
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
   * - Non-null: no in-modal selector is rendered and project folders are
   *   created in exactly this project. Model-store usage-mode gating is
   *   keyed off `project.name`.
   * - `null` ("no ambient project context", e.g. super-admin pages): a
   *   required in-modal project selector is rendered and the mutation
   *   targets the project chosen there.
   */
  project: ProjectContextOrNull;
  initialValidate?: boolean;
  initialValues?: Partial<FolderCreateFormItemsType>;
  /**
   * Decides the folder ownership: unset creates a user folder, both other
   * values create a project folder (FR-3441 removed the in-form type radio;
   * the page context now decides).
   *
   * - `'model_project'`: additionally locks usage_mode='model',
   *   permission='ro', cloneable=true. Used by the Model Store admin flow.
   * - `'project'`: usage_mode (general or model) and permission remain
   *   editable; automount is not offered. Used by the admin data pages.
   */
  folderType?: 'model_project' | 'project';
  /**
   * Optional banner rendered at the top of the modal body (above the form).
   * Use this to explain caller-specific constraints, e.g. why certain
   * options are disabled. Rendered as an Astryx `Banner status="warning"`.
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
  const { token } = theme.useToken();
  const { logger } = useBAILogger();
  const { getErrorMessage } = useErrorMessageResolver();

  const formRef = useRef<FormInstance>(null);
  const baiClient = useSuspendedBackendaiClient();
  // ADR-0001: the target project comes exclusively from the `project` prop.
  // When it is `null`, the user picks the target project with the in-modal
  // selector below; the chosen value is tracked here so name-keyed gating
  // (model-store) follows the chosen project, never the ambient one.
  const [selectedProject, setSelectedProject] = useState<ProjectContext | null>(
    null,
  );
  const effectiveProject = project ?? selectedProject;

  const { upsertNotification } = useSetBAINotification();

  const INITIAL_FORM_VALUES: FolderCreateFormItemsType = {
    name: '',
    host: undefined,
    group: project?.id,
    usage_mode: 'general',
    permission: 'rw',
    cloneable: false,
  };

  // Ownership is decided by the page context, not an in-form radio (FR-3441).
  const isProjectFolder =
    folderType === 'project' || folderType === 'model_project';
  const isFolderTypeLocked = folderType === 'model_project';

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

  const commitCreateMutation =
    useMutationWithPromise<FolderCreateModalV2Mutation>(graphql`
      mutation FolderCreateModalV2Mutation($input: CreateVFolderV2Input!) {
        createVfolderV2(input: $input) {
          vfolder {
            id
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

  // Project-scoped creation uses a separate mutation that takes `projectId` as
  // a dedicated arg (rather than an optional input field). Access is gated
  // server-side by project/domain/super admin role; `folderType` is set only
  // by admin pages.
  const commitCreateInProjectMutation =
    useMutationWithPromise<FolderCreateModalV2ProjectMutation>(graphql`
      mutation FolderCreateModalV2ProjectMutation(
        $projectId: UUID!
        $input: CreateVFolderInScopeInput!
      ) {
        createVFolderInProject(projectId: $projectId, input: $input) {
          vfolder {
            id
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
      // antd Form renders inline errors for validation failures; just log.
      logger.error(error);
      return;
    }
    if (!values) return;

    const isAutomount = values.usage_mode === 'automount';
    const folderName =
      isAutomount && !_.startsWith(values.name, '.')
        ? `.${values.name}`
        : values.name;

    // Fields shared in shape (but not in enum typing) between the two
    // mutation inputs. `CreateVFolderV2Input` keeps lowercase strings
    // (`'general'`/`'rw'` …), while `CreateVFolderInScopeInput` expects
    // the `VFolderUsageMode` / `VFolderMountPermission` enums
    // (`GENERAL`/`READ_WRITE` …). The common fields go here; each
    // mutation path then attaches its own enum-typed values below.
    const baseInput = {
      name: folderName,
      host: values.host ?? null,
      cloneable: !!values.cloneable,
    };
    const legacyUsageMode = isAutomount ? 'general' : values.usage_mode;

    let vfolderResults: FolderCreationResponse | undefined;
    try {
      if (isProjectFolder) {
        vfolderResults = await commitCreateInProjectMutation({
          // Not `values.group`: antd snapshots initialValues at mount and
          // never resyncs them to later `project` prop changes.
          projectId: effectiveProject?.id ?? values.group ?? '',
          input: {
            ...baseInput,
            // `CreateVFolderInScopeInput` takes enum-typed values.
            usageMode: legacyUsageMode === 'model' ? 'MODEL' : 'GENERAL',
            permission: values.permission === 'ro' ? 'READ_ONLY' : 'READ_WRITE',
          },
        }).then((res) => res?.createVFolderInProject?.vfolder);
      } else {
        vfolderResults = await commitCreateMutation({
          input: {
            ...baseInput,
            // `CreateVFolderV2Input` keeps the lowercase legacy strings.
            usageMode: legacyUsageMode,
            permission: values.permission,
            projectId: null,
          },
        }).then((res) => res?.createVfolderV2?.vfolder);
      }
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
        // `token.marginSM` is 8px = Astryx spacing step 2.
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
            // `clickAction` IS Astryx-native async-with-loading; BUI's
            // `action` prop was a hand-rolled version of exactly this.
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
      {/* BUI's `BAIAlert` is antd `Alert` plus a `createStyles` block that
          reaches into `.ant-alert-*` (P6). Astryx `Banner` is the direct
          analog: `status` carries the colour and the icon, and
          `container="section"` is the closest match to antd's `banner` mode. */}
      {alertMessage ? (
        <div style={{ marginBottom: token.marginMD }}>
          <Banner status="warning" title={alertMessage} container="section" />
        </div>
      ) : null}

      <VStack
        align="stretch"
        style={{
          paddingLeft: token.paddingMD,
          paddingRight: token.paddingMD,
          paddingTop: alertMessage ? 0 : token.paddingMD,
        }}
      >
        <Form
          ref={formRef}
          initialValues={mergedInitialValues}
          // `labelCol` is an antd `Form.Item` layout prop; BAIFormItem lays out
          // its own label via `--bai-form-item-label-width`. Kept only because
          // antd's Form context still reads it for any non-migrated child.
          labelCol={{ span: 8 }}
          // QA-FINDINGS Q-26: the label column width survived the migration
          // (33.3%, i.e. the `span: 8` above) but its ALIGNMENT did not. Legacy
          // carried a `createStyles` block that set
          // `.ant-form-item-label { display: flex; align-items: start;
          // padding-left: token.paddingSM }` — left-aligned labels inset 12px.
          // That block went away with antd-style, and the form engine's own
          // default took over: `[data-bai-form-item-label-col]` is
          // `text-align: end`, which parks every label hard against the control
          // column and leaves 59-143px of dead space to its left, so the labels
          // read as a ragged block bunched in the middle of the modal.
          // `labelAlign="left"` is the engine's own switch for this — Form
          // context -> FormItem -> `FormItemVisual` emits `data-align="left"`,
          // whose rule is `text-align: start`. No CSS needed at this call site.
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
                {/* Same manual-wiring pattern as StorageSelect below: the
                    Suspense boundary swallows BAIFormItem's injected props, so
                    the field value is written explicitly. */}
                <Suspense fallback={<Skeleton height={32} />}>
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
                      // Model-store gating on `usage_mode` is keyed off the
                      // chosen project name; re-validate so it updates
                      // immediately.
                      formRef.current?.validateFields(['usage_mode']);
                    }}
                  />
                </Suspense>
              </BAIFormItem>
              {/* Match the 24px bottom margin form items carry (FR-3441). */}
              <Divider style={{ marginBottom: token.marginLG }} />
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
            rules={
              isProjectFolder
                ? [
                    {
                      validator: (__, value) =>
                        value === 'model' &&
                        effectiveProject?.name !== MODEL_STORE_PROJECT_NAME
                          ? Promise.reject(
                              new Error(
                                t(
                                  'data.folders.CreateModelFolderOnlyInExclusiveProject',
                                ),
                              ),
                            )
                          : Promise.resolve(),
                    },
                  ]
                : undefined
            }
          >
            {/* PILOT-DECISION: antd's `<Radio>` accepted arbitrary JSX children
                (a BAIFlex with a trailing question-mark tooltip). Astryx's
                `RadioListItem.label` is a plain `string`, with the trailing
                slot exposed separately as `endContent`. The composite label is
                therefore split in two. `onChange`-driven cross-field
                revalidation is preserved by wrapping the injected handler,
                because Astryx passes the value, not the event. */}
            <AstryxFormRadioList
              label={t('data.UsageMode')}
              disabled={isFolderTypeLocked}
              onValueChange={(value) => {
                // Only validate name field if it has a value to prevent
                // excessive validation
                if (formRef.current?.getFieldValue('name')) {
                  formRef.current.validateFields(['name']);
                }
                // Model project folders are read-only (FR-1290); the rw
                // option is hidden then, so keep the value in sync. The
                // dependency-driven revalidation ran before this coercion,
                // so re-validate to clear its stale 'rw' error.
                if (isProjectFolder && value === 'model') {
                  formRef.current?.setFieldValue('permission', 'ro');
                  formRef.current?.validateFields(['permission']);
                }
              }}
              options={[
                {
                  value: 'general',
                  label: t('data.General'),
                  'data-testid': 'general-usage-mode',
                },
                ...(baiClient._config.enableModelFolders || isProjectFolder
                  ? [
                      {
                        value: 'model',
                        label: t('data.Models'),
                        'data-testid': 'model-usage-mode',
                      },
                    ]
                  : []),
                // Project folders cannot be automount folders — hide the
                // option instead of disabling it (FR-3441).
                ...(isProjectFolder
                  ? []
                  : [
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
                    ]),
              ]}
            />
          </BAIFormItem>

          <BAIFormItem
            label={t('data.folders.Location')}
            name={'host'}
            layout="horizontal"
            required
          >
            {/* PILOT-DECISION: `Skeleton.Input active` (antd's input-shaped
                shimmer) has no compound equivalent; Astryx's Skeleton is a
                single primitive sized by props. 32px matches the md input. */}
            <Suspense fallback={<Skeleton height={32} />}>
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
              // Model project folders are forced read-only (FR-1290). The
              // manager used to enforce this server-side (the dropped
              // 'allow-only-ro-permission-for-model-project-folder' capability)
              // and no longer seems to, but we keep enforcing it on the client
              // to preserve that contract until the project-folder behavior is
              // reworked. Mirrored in VFolderNodeDescriptionV2.
              const isReadOnlyPermission =
                getFieldValue('usage_mode') === 'model' && isProjectFolder;

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
                        isReadOnlyPermission && value === 'rw'
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
                      // Hidden (not disabled) when read-only is forced; the
                      // usage_mode handler coerces the value to 'ro' (FR-3441).
                      ...(isReadOnlyPermission
                        ? []
                        : [
                            {
                              value: 'rw',
                              label: t('data.ReadWrite'),
                              'data-testid': 'rw-permission',
                            },
                          ]),
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
