/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { App } from '../app-shim';
import { Form, FormInstance } from '../form-engine';
import { useBaiSignedRequestWithPromise } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserRole } from '../hooks/backendai';
import { useTanMutation, useTanQuery } from '../hooks/reactQueryAlias';
import { useSetBAINotification } from '../hooks/useBAINotification';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import './FolderCreateModal.css';
import StorageSelect from './StorageSelect';
import {
  AstryxFormRadioList,
  AstryxFormSwitch,
  AstryxFormTextInput,
} from './astryxFormControls';
import { Divider } from '@astryxdesign/core/Divider';
import { Skeleton } from '@astryxdesign/core/Skeleton';
import {
  BAIButton,
  BAIFlex,
  BAIIconWithTooltip,
  BAIModal,
  BAIModalProps,
  BAIQuestionIconWithTooltip,
  ESMClientErrorResponse,
  useBAILogger,
  useErrorMessageResolver,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { TriangleAlertIcon } from 'lucide-react';
import { Suspense, useRef } from 'react';
import { useTranslation } from 'react-i18next';

// Constants
const MODEL_STORE_PROJECT_NAME = 'model-store';
const FOLDER_NAME_MAX_LENGTH = 64;
const MODAL_WIDTH = 650;

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
      className="folder-create-modal"
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
          <BAIFlex gap="sm">
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
      <Form
        className="folder-create-modal-form"
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
          {/* antd `Radio.Group` + `<Radio>` children → `AstryxFormRadioList`
              (MAPPING §3.10). PILOT-DECISION: `<Radio>` accepted arbitrary JSX
              children; `RadioListItem.label` is a plain string with the
              trailing slot exposed separately, so the composite AutoMount label
              splits into `label` + `endContent`. The cross-field revalidation
              antd hung on the group's `onChange` moves to `onValueChange`,
              because Astryx passes the value, not the event. */}
          <AstryxFormRadioList
            label={t('data.UsageMode')}
            onValueChange={() => {
              // Only validate name/type fields if they have a value, to prevent excessive validation
              if (formRef.current?.getFieldValue('name')) {
                formRef.current.validateFields(['name']);
              }
              if (formRef.current?.getFieldValue('type')) {
                formRef.current.validateFields(['type']);
              }
            }}
            options={[
              ...(!_.includes(hiddenFormItems, 'usage_mode_general')
                ? [
                    {
                      value: 'general',
                      label: t('data.General'),
                      'data-testid': 'general-usage-mode',
                    },
                  ]
                : []),
              ...(baiClient._config.enableModelFolders &&
              !_.includes(hiddenFormItems, 'usage_mode_model')
                ? [
                    {
                      value: 'model',
                      label: t('data.Models'),
                      'data-testid': 'model-usage-mode',
                    },
                  ]
                : []),
              ...(!_.includes(hiddenFormItems, 'usage_mode_automount')
                ? [
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
                  ]
                : []),
            ]}
          />
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
          {/* antd `Input` → `AstryxFormTextInput` (MAPPING §3.6): the adapter
              coalesces the nullable Form-injected value, hides the duplicate
              label, and normalises `onChange` to the value. */}
          <AstryxFormTextInput
            label={t('data.Foldername')}
            placeholder={t('maxLength.64chars')}
          />
        </Form.Item>
        <Divider />

        <Form.Item
          label={t('data.folders.Location')}
          name={'host'}
          required
          hidden={_.includes(hiddenFormItems, 'host')}
        >
          {/* antd `Skeleton.Input active` → a single Astryx `Skeleton` box
              sized to the control height (MAPPING "Also COMPOSITION"); the
              shimmer is always on, so `active` carries no information. */}
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
                {/* Both checks are required:
                 * - role check (admin/superadmin): Controls permission to create project folders
                 * - allowedTypes check: Ensures the 'group' type is registered in ETCD
                 * allowedTypes comes from ETCD and contains all registered types regardless of permissions,
                 * so we need both checks for proper access control
                 */}
                {/* PILOT-DECISION: antd wrapped the whole (disabled) Project
                    radio in a Tooltip. Astryx forbids wrapping a disabled
                    control — the trigger swallows the hover the wrapper needs —
                    so the warning icon in `endContent` carries the tooltip. */}
                <AstryxFormRadioList
                  label={t('data.Type')}
                  options={[
                    ...(_.includes(allowedTypes, 'user') &&
                    !_.includes(hiddenFormItems, 'type_user')
                      ? [
                          {
                            value: 'user',
                            label: t('data.User'),
                            'data-testid': 'user-type',
                          },
                        ]
                      : []),
                    ...((userRole === 'admin' || userRole === 'superadmin') &&
                    _.includes(allowedTypes, 'group') &&
                    !_.includes(hiddenFormItems, 'type_project')
                      ? [
                          {
                            value: 'project',
                            label: t('data.Project'),
                            'data-testid': 'project-type',
                            disabled: shouldDisableProject,
                            endContent: shouldDisableProject ? (
                              <BAIIconWithTooltip
                                content={
                                  usageMode === 'model'
                                    ? t(
                                        'data.folders.CreateModelFolderOnlyInExclusiveProject',
                                      )
                                    : t(
                                        'data.folders.ChangeTheVFolderTypeToCreateAutoMountFolder',
                                      )
                                }
                                focusable={false}
                                icon={<TriangleAlertIcon />}
                              />
                            ) : undefined,
                          },
                        ]
                      : []),
                  ]}
                />
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
                <AstryxFormRadioList
                  label={t('data.Permission')}
                  options={[
                    ...(!_.includes(hiddenFormItems, 'permission_rw')
                      ? [
                          {
                            value: 'rw',
                            label: t('data.ReadWrite'),
                            'data-testid': 'rw-permission',
                            disabled: shouldDisableRWPermission,
                            endContent: shouldDisableRWPermission ? (
                              <BAIIconWithTooltip
                                content={t(
                                  'data.folders.ModelProjectFolderRestrictedToReadOnly',
                                )}
                                focusable={false}
                                icon={<TriangleAlertIcon />}
                              />
                            ) : undefined,
                          },
                        ]
                      : []),
                    ...(!_.includes(hiddenFormItems, 'permission_ro')
                      ? [
                          {
                            value: 'ro',
                            label: t('data.ReadOnly'),
                            'data-testid': 'ro-permission',
                          },
                        ]
                      : []),
                  ]}
                />
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
                    {/* antd `Switch defaultChecked={false}` → `AstryxFormSwitch`
                        (MAPPING §4): the Form supplies the value, so the
                        uncontrolled default is redundant. */}
                    <AstryxFormSwitch label={t('data.folders.Cloneable')} />
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
