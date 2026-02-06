/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useBaiSignedRequestWithPromise } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserRole } from '../hooks/backendai';
import { useTanMutation, useTanQuery } from '../hooks/reactQueryAlias';
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
  ESMClientErrorResponse,
  useBAILogger,
  useErrorMessageResolver,
} from 'backend.ai-ui';
import _ from 'lodash';
import { TriangleAlertIcon } from 'lucide-react';
import { Suspense, useRef } from 'react';
import { useTranslation } from 'react-i18next';

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

type HiddenFormItemsType =
  | keyof FolderCreateFormItemsType
  | 'usage_mode_general'
  | 'usage_mode_model'
  | 'usage_mode_automount'
  | 'type_user'
  | 'type_project'
  | 'permission_rw'
  | 'permission_ro';

interface FolderCreateModalProps extends BAIModalProps {
  onRequestClose: (response?: FolderCreationResponse) => void;
  initialValidate?: boolean;
  initialValues?: Partial<FolderCreateFormItemsType>;
  hiddenFormItems?: HiddenFormItemsType[];
}
export interface FolderCreationResponse {
  id: string;
  name: string;
  quota_scope_id: string;
  host: string;
  usage_mode: 'general' | 'model' | 'automount';
  permission: 'rw' | 'ro';
  max_size: number;
  creator: string;
  ownership_type: 'user' | 'project';
  user: string;
  group: string | null;
  cloneable: boolean;
  status: string;
}

const FolderCreateModal: React.FC<FolderCreateModalProps> = ({
  onRequestClose,
  initialValidate = false,
  initialValues: initialValuesFromProps = {},
  hiddenFormItems = [],
  ...modalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { styles } = useStyles();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const { logger } = useBAILogger();

  const formRef = useRef<FormInstance>(null);
  const baiClient = useSuspendedBackendaiClient();
  const userRole = useCurrentUserRole();
  const currentProject = useCurrentProjectValue();

  const { upsertNotification } = useSetBAINotification();

  const baiRequestWithPromise = useBaiSignedRequestWithPromise();

  const { getErrorMessage } = useErrorMessageResolver();

  const INITIAL_FORM_VALUES: FolderCreateFormItemsType = {
    name: '',
    host: undefined,
    group: currentProject.id || undefined,
    usage_mode: 'general',
    type: 'user',
    permission: 'rw',
    cloneable: false,
  };

  const mergedInitialValues: FolderCreateFormItemsType = {
    ...INITIAL_FORM_VALUES,
    ...initialValuesFromProps,
  };

  const { data: allowedTypes, isFetching: isFetchingAllowedTypes } =
    useTanQuery({
      queryKey: ['allowedTypes', modalProps.open],
      enabled: modalProps.open,
      queryFn: () =>
        modalProps.open ? baiClient.vfolder.list_allowed_types() : undefined,
    });

  const mutationToCreateFolder = useTanMutation<
    FolderCreationResponse,
    ESMClientErrorResponse,
    FolderCreateFormItemsType
  >({
    mutationFn: (values) => {
      const body = {
        ...values,
        cloneable: !!values.cloneable,
        usage_mode:
          values.usage_mode === 'automount' ? 'general' : values.usage_mode,
        name:
          values.usage_mode === 'automount' && !_.startsWith(values.name, '.')
            ? `.${values.name}`
            : values.name,
      };
      return baiRequestWithPromise({
        method: 'POST',
        url: '/folders',
        body: body,
      });
    },
  });

  const handleOk = async () => {
    await formRef.current
      ?.validateFields()
      .then((values) => {
        const input = {
          ...values,
          group: values.type === 'user' ? null : values.group,
        };
        return mutationToCreateFolder.mutateAsync(input, {
          onSuccess: (result) => {
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
            document.dispatchEvent(
              new CustomEvent('backend-ai-folder-list-changed'),
            );
            document.dispatchEvent(
              new CustomEvent('backend-ai-folder-created'),
            );
            onRequestClose(result);
          },
          onError: (error) => {
            message.error(getErrorMessage(error));
          },
        });
      })
      .catch((error) => logger.error(error));
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
        <Form.Item
          label={t('data.UsageMode')}
          name={'usage_mode'}
          required
          hidden={_.includes(hiddenFormItems, 'usage_mode')}
        >
          <Radio.Group
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
            {!_.includes(hiddenFormItems, 'usage_mode_general') && (
              <Radio value={'general'} data-testid="general-usage-mode">
                {t('data.General')}
              </Radio>
            )}
            {baiClient._config.enableModelFolders &&
              !_.includes(hiddenFormItems, 'usage_mode_model') && (
                <Radio value={'model'} data-testid="model-usage-mode">
                  {t('data.Models')}
                </Radio>
              )}
            {!_.includes(hiddenFormItems, 'usage_mode_automount') && (
              <Radio value={'automount'} data-testid="automount-usage-mode">
                <BAIFlex gap="xxs">
                  {t('data.AutoMount')}
                  <QuestionIconWithTooltip
                    title={t('data.AutomountFolderCreationDesc')}
                  />
                </BAIFlex>
              </Radio>
            )}
          </Radio.Group>
        </Form.Item>
        <Divider />

        <Form.Item
          label={t('data.Foldername')}
          name={'name'}
          // required check is handled in the name validator
          required
          hidden={_.includes(hiddenFormItems, 'name')}
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

        <Form.Item
          label={t('data.folders.Location')}
          name={'host'}
          required
          hidden={_.includes(hiddenFormItems, 'host')}
        >
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
                hidden={_.includes(hiddenFormItems, 'type')}
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
                <Radio.Group>
                  {/* Both checks are required:
                   * - role check (admin/superadmin): Controls permission to create project folders
                   * - allowedTypes check: Ensures the 'group' type is registered in ETCD
                   * allowedTypes comes from ETCD and contains all registered types regardless of permissions,
                   * so we need both checks for proper access control
                   */}
                  {_.includes(allowedTypes, 'user') &&
                    !_.includes(hiddenFormItems, 'type_user') && (
                      <Radio value={'user'} data-testid="user-type">
                        {t('data.User')}
                      </Radio>
                    )}
                  {(userRole === 'admin' || userRole === 'superadmin') &&
                    _.includes(allowedTypes, 'group') &&
                    !_.includes(hiddenFormItems, 'type_project') && (
                      <Radio
                        value={'project'}
                        data-testid="project-type"
                        disabled={shouldDisableProject}
                      >
                        <Tooltip
                          title={
                            shouldDisableProject
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
                            {shouldDisableProject && <TriangleAlertIcon />}
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
                hidden={_.includes(hiddenFormItems, 'permission')}
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
                <Radio.Group>
                  {!_.includes(hiddenFormItems, 'permission_rw') && (
                    <Radio
                      value={'rw'}
                      data-testid="rw-permission"
                      disabled={shouldDisableRWPermission}
                    >
                      <Tooltip
                        title={
                          shouldDisableRWPermission
                            ? t(
                                'data.folders.ModelProjectFolderRestrictedToReadOnly',
                              )
                            : undefined
                        }
                      >
                        <BAIFlex gap="xxs">
                          {t('data.ReadWrite')}
                          {shouldDisableRWPermission && <TriangleAlertIcon />}
                        </BAIFlex>
                      </Tooltip>
                    </Radio>
                  )}
                  {!_.includes(hiddenFormItems, 'permission_ro') && (
                    <Radio value={'ro'} data-testid="ro-permission">
                      {t('data.ReadOnly')}
                    </Radio>
                  )}
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
                    hidden={_.includes(hiddenFormItems, 'cloneable')}
                  >
                    <Switch defaultChecked={false} />
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

export default FolderCreateModal;
