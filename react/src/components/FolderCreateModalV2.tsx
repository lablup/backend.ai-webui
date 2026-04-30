/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { FolderCreateModalV2Mutation } from '../__generated__/FolderCreateModalV2Mutation.graphql';
import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserRole } from '../hooks/backendai';
import { useTanQuery } from '../hooks/reactQueryAlias';
import { useSetBAINotification } from '../hooks/useBAINotification';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import QuestionIconWithTooltip from './QuestionIconWithTooltip';
import StorageSelect from './StorageSelect';
import {
  App,
  Divider,
  Form,
  Input,
  Radio,
  Skeleton,
  Switch,
  theme,
  Tooltip,
} from 'antd';
import { createStyles } from 'antd-style';
import { FormInstance } from 'antd/lib';
import {
  BAIButton,
  BAIFlex,
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
      padding-top: 24px !important;
      padding-bottom: 0 !important;
    }
  `,
  form: css`
    .ant-form-item-label {
      display: flex;
      align-items: start;
      padding-left: var(--token-paddingSM);
    }
    .ant-form-item-control {
      padding-right: var(--token-paddingSM);
    }
    .ant-form-item-label > label::after {
      display: none !important;
    }
  `,
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
   * When set, locks the form to a specific folder shape by pre-selecting and
   * disabling the structural fields (usage_mode, type, permission). The user
   * can still edit name, host, and cloneable. Used when a caller needs a folder
   * with a fixed shape — e.g. 'model_project' for the Model Store admin flow.
   */
  folderType?: 'model_project';
}

export interface FolderCreationResponse {
  id: string;
  name: string;
  quota_scope_id: string;
  host: string;
  usage_mode: 'general' | 'model' | 'automount';
  permission: 'rw' | 'ro';
  creator: string;
  ownership_type: 'user' | 'project';
  user: string;
  group: string | null;
  cloneable: boolean;
  status: string;
}

const FolderCreateModalV2: React.FC<FolderCreateModalProps> = ({
  onRequestClose,
  initialValidate = false,
  initialValues: initialValuesFromProps = {},
  allowCreateProjectFolder = false,
  folderType,
  ...modalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { styles } = useStyles();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const { logger } = useBAILogger();
  const { getErrorMessage } = useErrorMessageResolver();

  const formRef = useRef<FormInstance>(null);
  const baiClient = useSuspendedBackendaiClient();
  const userRole = useCurrentUserRole();
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

  const isFolderTypeLocked = folderType !== undefined;

  // When folderType locks the form to a specific shape, these preset values
  // override any user-passed initialValues for the locked fields.
  const folderTypePreset: Partial<FolderCreateFormItemsType> | undefined =
    folderType === 'model_project'
      ? {
          usage_mode: 'model',
          type: 'project',
          permission: 'ro',
          cloneable: true,
        }
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
            status
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
          }
        }
      }
    `);

  const handleOk = async () => {
    try {
      const values = await formRef.current?.validateFields();
      if (!values) return;

      const isAutomount = values.usage_mode === 'automount';
      const folderName =
        isAutomount && !_.startsWith(values.name, '.')
          ? `.${values.name}`
          : values.name;

      const input = {
        name: folderName,
        host: values.host ?? null,
        usageMode: isAutomount ? 'general' : values.usage_mode,
        permission: values.permission,
        cloneable: !!values.cloneable,
        // If type is 'project', send the current project ID; otherwise null for user-owned
        projectId: values.type === 'project' ? values.group : null,
      };

      const data = await commitCreateMutation({ input });
      const vfolder = data.createVfolderV2.vfolder;
      const rawId = toLocalId(vfolder.id);

      // Map V2 response to FolderCreationResponse for backward compatibility
      const result: FolderCreationResponse = {
        id: rawId,
        name: vfolder.metadata.name,
        quota_scope_id: vfolder.metadata.quotaScopeId ?? '',
        host: vfolder.host,
        usage_mode: isAutomount
          ? 'automount'
          : vfolder.metadata.usageMode === 'MODEL'
            ? 'model'
            : 'general',
        permission:
          vfolder.accessControl.permission === 'READ_ONLY' ? 'ro' : 'rw',
        creator: vfolder.ownership.creatorEmail ?? '',
        ownership_type:
          vfolder.accessControl.ownershipType === 'USER' ? 'user' : 'project',
        user: vfolder.ownership.userId ?? '',
        group: vfolder.ownership.projectId ?? null,
        cloneable: vfolder.metadata.cloneable,
        status: vfolder.status,
      };

      upsertNotification({
        key: `folder-create-success-${result.id}`,
        icon: 'folder',
        message: `${result.name}: ${t('data.folders.FolderCreated')}`,
        toText: t('data.folders.OpenAFolder'),
        to: {
          search: new URLSearchParams({
            folder: result.id,
          }).toString(),
        },
        open: true,
      });
      document.dispatchEvent(new CustomEvent('backend-ai-folder-list-changed'));
      document.dispatchEvent(new CustomEvent('backend-ai-folder-created'));
      onRequestClose(result);
    } catch (error) {
      if (Array.isArray(error)) {
        for (const err of error) {
          message.error(err.message);
        }
      } else if (error instanceof Error) {
        message.error(getErrorMessage(error));
      }
      logger.error(error);
    }
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
        if (open && initialValidate) {
          formRef.current?.validateFields();
        }
      }}
    >
      <Form
        className={styles.form}
        ref={formRef}
        initialValues={mergedInitialValues}
        labelCol={{ span: 8 }}
      >
        <Form.Item label={t('data.UsageMode')} name={'usage_mode'} required>
          <Radio.Group
            disabled={isFolderTypeLocked}
            onChange={() => {
              // Only validate name field if it has a value to prevent excessive validation
              if (formRef.current?.getFieldValue('name')) {
                formRef.current.validateFields(['name']);
              }
              if (formRef.current?.getFieldValue('type')) {
                formRef.current.validateFields(['type']);
              }
            }}
          >
            <Radio value={'general'} data-testid="general-usage-mode">
              {t('data.General')}
            </Radio>
            {(baiClient._config.enableModelFolders ||
              folderType === 'model_project') && (
              <Radio value={'model'} data-testid="model-usage-mode">
                {t('data.Models')}
              </Radio>
            )}
            <Radio value={'automount'} data-testid="automount-usage-mode">
              <BAIFlex gap="xxs">
                {t('data.AutoMount')}
                <QuestionIconWithTooltip
                  title={t('data.AutomountFolderCreationDesc')}
                />
              </BAIFlex>
            </Radio>
          </Radio.Group>
        </Form.Item>
        <Divider />

        <Form.Item
          label={t('data.Foldername')}
          name={'name'}
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
          <Input placeholder={t('maxLength.64chars')} />
        </Form.Item>
        <Divider />

        <Form.Item label={t('data.folders.Location')} name={'host'} required>
          <Suspense fallback={<Skeleton.Input active />}>
            <StorageSelect
              onChange={(value) => {
                formRef.current?.setFieldValue('host', value);
              }}
              showUsageStatus
              autoSelectType="usage"
              showSearch
            />
          </Suspense>
        </Form.Item>
        <Divider />
        <Form.Item dependencies={['usage_mode']} noStyle required>
          {({ getFieldValue }) => {
            const usageMode = getFieldValue('usage_mode');
            const shouldDisableProject =
              (usageMode === 'model' &&
                currentProject?.name !== MODEL_STORE_PROJECT_NAME) ||
              usageMode === 'automount';

            return (
              <Form.Item
                label={t('data.Type')}
                name={'type'}
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
                        value === 'project' && currentUsageMode === 'automount';

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
                <Radio.Group disabled={isFolderTypeLocked}>
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
                  {_.includes(allowedTypes, 'user') && (
                    <Radio value={'user'} data-testid="user-type">
                      {t('data.User')}
                    </Radio>
                  )}
                  {(allowCreateProjectFolder ||
                    folderType === 'model_project') &&
                    (userRole === 'admin' || userRole === 'superadmin') &&
                    _.includes(allowedTypes, 'group') && (
                      <Radio
                        value={'project'}
                        data-testid="project-type"
                        disabled={shouldDisableProject}
                      >
                        <Tooltip
                          title={
                            isFolderTypeLocked
                              ? undefined
                              : shouldDisableProject
                                ? usageMode === 'model'
                                  ? t(
                                      'data.folders.CreateModelFolderOnlyInExclusiveProject',
                                    )
                                  : t(
                                      'data.folders.ChangeTheVFolderTypeToCreateAutoMountFolder',
                                    )
                                : undefined
                          }
                        >
                          <BAIFlex gap="xxs">
                            {t('data.Project')}
                            {!isFolderTypeLocked && shouldDisableProject && (
                              <TriangleAlertIcon />
                            )}
                          </BAIFlex>
                        </Tooltip>
                      </Radio>
                    )}
                </Radio.Group>
              </Form.Item>
            );
          }}
        </Form.Item>
        <Divider />

        <Form.Item hidden name={'group'} />

        <Form.Item dependencies={['usage_mode', 'type']} noStyle required>
          {({ getFieldValue }) => {
            const usageMode = getFieldValue('usage_mode');
            const type = getFieldValue('type');
            const allowOnlyROForModelProjectFolder = baiClient?.supports(
              'allow-only-ro-permission-for-model-project-folder',
            );
            const shouldDisableRWPermission =
              usageMode === 'model' &&
              type === 'project' &&
              allowOnlyROForModelProjectFolder;

            return (
              <Form.Item
                label={t('data.Permission')}
                name={'permission'}
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
                <Radio.Group disabled={isFolderTypeLocked}>
                  <Radio
                    value={'rw'}
                    data-testid="rw-permission"
                    disabled={shouldDisableRWPermission}
                  >
                    <Tooltip
                      title={
                        isFolderTypeLocked
                          ? undefined
                          : shouldDisableRWPermission
                            ? t(
                                'data.folders.ModelProjectFolderRestrictedToReadOnly',
                              )
                            : undefined
                      }
                    >
                      <BAIFlex gap="xxs">
                        {t('data.ReadWrite')}
                        {!isFolderTypeLocked && shouldDisableRWPermission && (
                          <TriangleAlertIcon />
                        )}
                      </BAIFlex>
                    </Tooltip>
                  </Radio>
                  <Radio value={'ro'} data-testid="ro-permission">
                    {t('data.ReadOnly')}
                  </Radio>
                </Radio.Group>
              </Form.Item>
            );
          }}
        </Form.Item>

        <Form.Item dependencies={['usage_mode']} noStyle>
          {({ getFieldValue }) => {
            return (
              getFieldValue('usage_mode') === 'model' && (
                <>
                  <Divider />
                  <Form.Item
                    label={t('data.folders.Cloneable')}
                    name={'cloneable'}
                  >
                    <Switch />
                  </Form.Item>
                </>
              )
            );
          }}
        </Form.Item>
      </Form>
    </BAIModal>
  );
};

export default FolderCreateModalV2;
