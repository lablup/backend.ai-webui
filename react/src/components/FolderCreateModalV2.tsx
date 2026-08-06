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
import { useSuspendedBackendaiClient } from '../hooks';
import { useTanQuery } from '../hooks/reactQueryAlias';
import { useSetBAINotification } from '../hooks/useBAINotification';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { useEffectiveAdminRole } from '../hooks/useCurrentUserProjectRoles';
import { theme } from '../theme-shim';
import StorageSelect from './StorageSelect';
import {
  AstryxFormRadioList,
  AstryxFormSwitch,
  AstryxFormTextInput,
} from './astryxFormControls';
import { Divider } from '@astryxdesign/core/Divider';
import { Skeleton } from '@astryxdesign/core/Skeleton';
import { Tooltip } from '@astryxdesign/core/Tooltip';
// `Form` (the state engine) stays antd, per the locked ticket-08 decision.
// Only `Form.Item`'s VISUAL layer moves, to `BAIFormItem`.
import { Form } from 'antd';
import { createStyles } from 'antd-style';
import { FormInstance } from 'antd/lib';
import {
  BAIQuestionIconWithTooltip,
  BAIAlert,
  BAIButton,
  BAIFlex,
  BAIFormItem,
  BAIModal,
  BAIModalProps,
  toLocalId,
  useBAILogger,
  useErrorMessageResolver,
  useMutationWithPromise,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { TriangleAlertIcon } from 'lucide-react';
import { Suspense, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql } from 'react-relay';

// Constants
const MODEL_STORE_PROJECT_NAME = 'model-store';
const FOLDER_NAME_MAX_LENGTH = 64;
const MODAL_WIDTH = 650;

const useStyles = createStyles(({ css }) => ({
  modal: css`
    .ant-modal-body {
      padding: 0 !important;
    }
  `,
  // PILOT: the former `form` block styled `.ant-form-item-*` selectors. With
  // `Form.Item` -> `BAIFormItem` those elements no longer exist, so the rule
  // set is dead and is removed rather than translated. This is a recurring
  // shape: antd-style `createStyles` blocks that reach INTO antd's internal
  // class names die with the component and cannot be codemodded.
}));

interface FolderCreateFormItemsType {
  name: string;
  host: string | undefined;
  group: string | undefined;
  usage_mode: 'general' | 'model' | 'automount';
  type: 'user' | 'project';
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

export interface FolderCreateModalProps extends BAIModalProps {
  onRequestClose: (response?: FolderCreationResponse) => void;
  initialValidate?: boolean;
  initialValues?: Partial<FolderCreateFormItemsType>;
  /**
   * Whether to allow creating project-type folders. Should be enabled only on
   * admin pages — leaving it off ensures project folder creation UI is not
   * exposed when the same modal is used from user-facing pages, even if the
   * current user has admin privileges.
   */
  allowCreateProjectFolder?: boolean;
  /**
   * When set, narrows the form to a specific folder shape.
   *
   * - `'model_project'`: fully locks structural fields (usage_mode='model',
   *   type='project', permission='ro', cloneable=true). Used by the Model
   *   Store admin flow.
   * - `'project'`: pre-selects type='project' and disables the user-ownership
   *   and automount radios (kept visible but not selectable, no tooltip).
   *   usage_mode (general or model) and permission remain editable. Used by
   *   the project admin data page.
   */
  folderType?: 'model_project' | 'project';
  /**
   * Optional banner rendered at the top of the modal body (above the form).
   * Use this to explain caller-specific constraints, e.g. why certain
   * options are disabled. Rendered as a `BAIAlert` with `type="warning"`.
   */
  alertMessage?: React.ReactNode;
}

const FolderCreateModalV2: React.FC<FolderCreateModalProps> = ({
  onRequestClose,
  initialValidate = false,
  initialValues: initialValuesFromProps = {},
  allowCreateProjectFolder = false,
  folderType,
  alertMessage,
  ...modalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { styles } = useStyles();
  const { token } = theme.useToken();
  const { logger } = useBAILogger();
  const { getErrorMessage } = useErrorMessageResolver();

  const formRef = useRef<FormInstance>(null);
  const baiClient = useSuspendedBackendaiClient();
  const effectiveAdminRole = useEffectiveAdminRole();
  const currentProject = useCurrentProjectValue();

  const { upsertNotification } = useSetBAINotification();

  const INITIAL_FORM_VALUES: FolderCreateFormItemsType = {
    name: '',
    host: undefined,
    group: currentProject.id || undefined,
    usage_mode: 'general',
    type: 'user',
    permission: 'rw',
    cloneable: false,
  };

  // `'model_project'` is the only variant that fully locks the structural
  // radio groups. `'project'` only hides user/automount options and
  // pre-selects type='project', so the radio groups stay editable.
  const isFolderTypeLocked = folderType === 'model_project';

  // When folderType narrows the form, these preset values override any
  // user-passed initialValues for the affected fields.
  const folderTypePreset: Partial<FolderCreateFormItemsType> | undefined =
    folderType === 'model_project'
      ? {
          usage_mode: 'model',
          type: 'project',
          permission: 'ro',
          cloneable: true,
        }
      : folderType === 'project'
        ? { type: 'project' }
        : undefined;

  const mergedInitialValues: FolderCreateFormItemsType = {
    ...INITIAL_FORM_VALUES,
    ...initialValuesFromProps,
    ...folderTypePreset,
  };

  // No V2 equivalent for allowed types — keep using existing REST API approach
  const { data: allowedTypes, isFetching: isFetchingAllowedTypes } =
    useTanQuery({
      queryKey: ['allowedTypes', modalProps.open],
      enabled: modalProps.open,
      queryFn: () =>
        modalProps.open ? baiClient.vfolder.list_allowed_types() : undefined,
    });

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
  // a dedicated arg (rather than an optional input field). Access is gated by
  // project/domain/super admin role — the caller-side radio visibility already
  // enforces that; this is the corresponding server-side entry point.
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
    const isProjectFolder = values.type === 'project';

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
          projectId: values.group ?? '',
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
      loading={isFetchingAllowedTypes}
      className={styles.modal}
      title={t('data.CreateANewStorageFolder')}
      footer={
        <BAIFlex justify="between">
          <BAIButton
            danger
            onClick={() => {
              formRef.current?.resetFields();
            }}
          >
            {t('button.Reset')}
          </BAIButton>
          <BAIFlex gap={token.marginSM}>
            <BAIButton
              onClick={() => {
                onRequestClose();
              }}
            >
              {t('button.Cancel')}
            </BAIButton>
            <BAIButton
              type="primary"
              data-testid="create-folder-button"
              action={async () => {
                await handleOk();
              }}
            >
              {t('data.Create')}
            </BAIButton>
          </BAIFlex>
        </BAIFlex>
      }
      width={MODAL_WIDTH}
      onCancel={() => {
        onRequestClose();
      }}
      destroyOnHidden
      {...modalProps}
      afterOpenChange={(open) => {
        if (open) {
          if (initialValidate) {
            formRef.current?.validateFields();
          } else if (mergedInitialValues.type === 'project') {
            // The project-folder notice is a warningOnly validator on `type`;
            // antd runs validators only on interaction, so trigger it here or
            // the notice stays hidden until the user touches the form.
            formRef.current?.validateFields(['type']);
          }
        }
      }}
    >
      {alertMessage ? (
        <BAIAlert
          type="warning"
          showIcon
          description={alertMessage}
          banner
          style={{ marginBottom: token.marginMD }}
        />
      ) : null}

      <BAIFlex
        direction="column"
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
        >
          <BAIFormItem
            label={t('data.UsageMode')}
            name={'usage_mode'}
            layout="horizontal"
            required
          >
            {/* PILOT-DECISION: antd's `<Radio>` accepted arbitrary JSX children
                (a BAIFlex with a trailing question-mark tooltip). Astryx's
                `RadioListItem.label` is a plain `string`, with the trailing
                slot exposed separately as `endContent`. The composite label is
                therefore split in two — same pattern as the Tab label above.
                `onChange`-driven cross-field revalidation is preserved by
                wrapping the injected handler rather than by a `Radio.Group`
                prop, because Astryx passes the value, not the event. */}
            <AstryxFormRadioList
              label={t('data.UsageMode')}
              disabled={isFolderTypeLocked}
              onValueChange={() => {
                // Only validate name field if it has a value to prevent
                // excessive validation
                if (formRef.current?.getFieldValue('name')) {
                  formRef.current.validateFields(['name']);
                }
                if (formRef.current?.getFieldValue('type')) {
                  formRef.current.validateFields(['type']);
                }
              }}
              options={[
                {
                  value: 'general',
                  label: t('data.General'),
                  'data-testid': 'general-usage-mode',
                },
                ...(baiClient._config.enableModelFolders ||
                folderType === 'model_project' ||
                folderType === 'project'
                  ? [
                      {
                        value: 'model',
                        label: t('data.Models'),
                        'data-testid': 'model-usage-mode',
                      },
                    ]
                  : []),
                {
                  value: 'automount',
                  label: t('data.AutoMount'),
                  'data-testid': 'automount-usage-mode',
                  disabled: folderType === 'project',
                  endContent: (
                    <BAIQuestionIconWithTooltip
                      title={t('data.AutomountFolderCreationDesc')}
                    />
                  ),
                },
              ]}
            />
          </BAIFormItem>
          <Divider />

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
          <Divider />

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
              {/* Remaining antd: StorageSelect is an infinite-scroll select,
                  explicitly out of scope per the locked Select decision. */}
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
          <Divider />
          <Form.Item dependencies={['usage_mode']} noStyle required>
            {({ getFieldValue }) => {
              const usageMode = getFieldValue('usage_mode');
              const shouldDisableProject =
                (usageMode === 'model' &&
                  currentProject?.name !== MODEL_STORE_PROJECT_NAME) ||
                usageMode === 'automount';

              return (
                <BAIFormItem
                  label={t('data.Type')}
                  name={'type'}
                  layout="horizontal"
                  required
                  style={{ flex: 1, marginBottom: 0 }}
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(__, value) {
                        const currentUsageMode = getFieldValue('usage_mode');
                        const isInvalidModelProjectFolder =
                          value === 'project' &&
                          currentUsageMode === 'model' &&
                          currentProject?.name !== MODEL_STORE_PROJECT_NAME;
                        const isInvalidAutoMountFolder =
                          value === 'project' &&
                          currentUsageMode === 'automount';

                        if (isInvalidModelProjectFolder) {
                          return Promise.reject(
                            new Error(
                              t(
                                'data.folders.CreateModelFolderOnlyInExclusiveProject',
                              ),
                            ),
                          );
                        } else if (isInvalidAutoMountFolder) {
                          return Promise.reject(
                            new Error(
                              t(
                                'data.folders.ChangeTheVFolderTypeToCreateAutoMountFolder',
                              ),
                            ),
                          );
                        } else {
                          return Promise.resolve();
                        }
                      },
                    }),
                    {
                      warningOnly: true,
                      validator: async (__, value) => {
                        if (!shouldDisableProject && value === 'project') {
                          return Promise.reject(
                            new Error(
                              t('data.folders.ProjectFolderCreationHelp', {
                                projectName: currentProject?.name,
                              }),
                            ),
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  {/* Visibility rules:
                   * - 'user' option: requires the 'user' type registered in ETCD.
                   * - 'project' option: requires either an admin context that
                   *   opts in via allowCreateProjectFolder, or a folderType that
                   *   inherently requires project ownership (e.g. 'model_project').
                   *   Both paths additionally require admin role (defense-in-depth
                   *   against route-level permission misconfiguration) and the
                   *   'group' type registered in ETCD.
                   * When isFolderTypeLocked, the entire group is disabled and
                   * tooltips/warning icons are suppressed for a clean read-only
                   * appearance.
                   */}
                  <AstryxFormRadioList
                    label={t('data.Type')}
                    disabled={isFolderTypeLocked}
                    options={[
                      ...(_.includes(allowedTypes, 'user')
                        ? [
                            {
                              value: 'user',
                              label: t('data.User'),
                              'data-testid': 'user-type',
                              disabled: folderType === 'project',
                            },
                          ]
                        : []),
                      ...((allowCreateProjectFolder ||
                        folderType === 'model_project' ||
                        folderType === 'project') &&
                      effectiveAdminRole !== 'none' &&
                      _.includes(allowedTypes, 'group')
                        ? [
                            {
                              value: 'project',
                              label: t('data.Project'),
                              'data-testid': 'project-type',
                              disabled: shouldDisableProject,
                              endContent:
                                !isFolderTypeLocked && shouldDisableProject ? (
                                  <Tooltip
                                    content={
                                      usageMode === 'model'
                                        ? t(
                                            'data.folders.CreateModelFolderOnlyInExclusiveProject',
                                          )
                                        : t(
                                            'data.folders.ChangeTheVFolderTypeToCreateAutoMountFolder',
                                          )
                                    }
                                  >
                                    <TriangleAlertIcon />
                                  </Tooltip>
                                ) : undefined,
                            },
                          ]
                        : []),
                    ]}
                  />
                </BAIFormItem>
              );
            }}
          </Form.Item>
          <Divider />

          <Form.Item hidden name={'group'} />

          <Form.Item dependencies={['usage_mode', 'type']} noStyle required>
            {({ getFieldValue }) => {
              const usageMode = getFieldValue('usage_mode');
              const type = getFieldValue('type');
              // Model project folders are forced read-only (FR-1290). The
              // manager used to enforce this server-side (the dropped
              // 'allow-only-ro-permission-for-model-project-folder' capability)
              // and no longer seems to, but we keep enforcing it on the client
              // to preserve that contract until the project-folder behavior is
              // reworked. Mirrored in VFolderNodeDescriptionV2.
              const shouldDisableRWPermission =
                usageMode === 'model' && type === 'project';

              return (
                <BAIFormItem
                  label={t('data.folders.MountPermission')}
                  name={'permission'}
                  layout="horizontal"
                  required
                  dependencies={['usage_mode', 'type']}
                  rules={[
                    () => ({
                      validator(__, value) {
                        if (shouldDisableRWPermission && value === 'rw') {
                          return Promise.reject(
                            new Error(
                              t(
                                'data.folders.ModelProjectFolderRestrictedToReadOnly',
                              ),
                            ),
                          );
                        }
                        return Promise.resolve();
                      },
                    }),
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
                            <Tooltip
                              content={t(
                                'data.folders.ModelProjectFolderRestrictedToReadOnly',
                              )}
                            >
                              <TriangleAlertIcon />
                            </Tooltip>
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
                    <Divider />
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
      </BAIFlex>
    </BAIModal>
  );
};

export default FolderCreateModalV2;
