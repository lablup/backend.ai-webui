/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  UserSettingModalBulkCreateMutation,
  UserRoleV2,
  UserStatusV2,
} from '../__generated__/UserSettingModalBulkCreateMutation.graphql';
import { UserSettingModalCreateMutation } from '../__generated__/UserSettingModalCreateMutation.graphql';
import { UserSettingModalModifyMutation } from '../__generated__/UserSettingModalModifyMutation.graphql';
import { UserSettingModalQuery } from '../__generated__/UserSettingModalQuery.graphql';
import { isValidIPOrCidr } from '../helper';
import { SIGNED_32BIT_MAX_INT } from '../helper/const-vars';
import { useCurrentDomainValue, useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserRole, useTOTPSupported } from '../hooks/backendai';
import { useTanMutation } from '../hooks/reactQueryAlias';
import AccessKeySelect from './AccessKeySelect';
import GeneratedKeypairListModal from './GeneratedKeypairListModal';
import ProjectSelect from './ProjectSelect';
import TOTPActivateModal from './TOTPActivateModal';
import UserResourcePolicySelect from './UserResourcePolicySelect';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { useToggle } from 'ahooks';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  message,
  Typography,
  FormInstance,
  App,
  theme,
  Checkbox,
  Skeleton,
  Tag,
  Space,
} from 'antd';
import {
  BAIDomainSelect,
  BAIModal,
  BAIModalProps,
  BAISelect,
  BAIUnmountAfterClose,
  filterOutNullAndUndefined,
  useBAILogger,
  useUpdatableState,
} from 'backend.ai-ui';
import _ from 'lodash';
import React, { Suspense, useDeferredValue, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useMutation, useLazyLoadQuery } from 'react-relay';
import { GeneratedKeypairListModalFragment$key } from 'src/__generated__/GeneratedKeypairListModalFragment.graphql';

type UserRole = {
  [key: string]: string[];
};
const permissionRangeOfRoleChanges: UserRole = {
  superadmin: [
    'superadmin',
    // 'admin',
    'user',
    //  'monitor'
  ],
  admin: [
    // 'admin',
    'user',
    // 'monitor'
  ],
};

type FormValues = {
  email: string;
  password?: string;
  username: string;
  full_name?: string;
  description?: string;
  role: string;
  domain_name: string;
  group_ids?: string[];
  status: string;
  allowed_client_ip?: string[];
  need_password_change: boolean;
  totp_activated?: boolean;
  sudo_session_enabled?: boolean;
  resource_policy?: string;
  container_uid?: number;
  container_main_gid?: number;
  container_gids?: number[];
};

type BulkFormValues = Omit<FormValues, 'email' | 'username' | 'full_name'> & {
  email_prefix: string;
  email_suffix: string;
  user_count: number;
};

const statusToV2: Record<string, UserStatusV2> = {
  active: 'ACTIVE',
  inactive: 'INACTIVE',
  'before-verification': 'BEFORE_VERIFICATION',
  deleted: 'DELETED',
};

const roleToV2: Record<string, UserRoleV2> = {
  user: 'USER',
  admin: 'ADMIN',
  superadmin: 'SUPERADMIN',
  monitor: 'MONITOR',
};

interface UserSettingModalProps extends BAIModalProps {
  userEmail?: string | null;
  bulkCreate?: boolean;
  onRequestClose: (success: boolean) => void;
}

const UserSettingModal: React.FC<UserSettingModalProps> = ({
  userEmail = null,
  bulkCreate = false,
  onRequestClose,
  ...baiModalProps
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { modal } = App.useApp();
  const formRef = useRef<FormInstance<FormValues | BulkFormValues>>(null);
  const { logger } = useBAILogger();

  const currentUserRole = useCurrentUserRole();
  const currentDomainName = useCurrentDomainValue();
  const baiClient = useSuspendedBackendaiClient();
  const { isTOTPSupported, isLoading: isLoadingManagerSupportingTOTP } =
    useTOTPSupported();
  const [isOpenTOTPActivateModal, { toggle: toggleTOTPActivateModal }] =
    useToggle(false);
  const [fetchKey, updateFetchKey] = useUpdatableState('initial-fetch');
  const deferredOpen = useDeferredValue(baiModalProps.open);

  const [createdKeypairs, setCreatedKeypairs] =
    useState<GeneratedKeypairListModalFragment$key | null>();

  const { user } = useLazyLoadQuery<UserSettingModalQuery>(
    graphql`
      query UserSettingModalQuery($email: String, $isNotSupportTotp: Boolean!) {
        user(email: $email) {
          email
          username
          need_password_change
          full_name
          description
          status
          domain_name
          role
          groups {
            id
            name
          }
          resource_policy
          sudo_session_enabled
          totp_activated @skipOnClient(if: $isNotSupportTotp)
          allowed_client_ip
          main_access_key
          container_uid
          container_main_gid
          container_gids
          ...TOTPActivateModalFragment
        }
      }
    `,
    {
      email: userEmail ?? '',
      isNotSupportTotp: !isTOTPSupported,
    },
    {
      // Do not fetch user data if the modal is closed or the user email is not provided
      fetchPolicy: deferredOpen && userEmail ? 'network-only' : 'store-only',
      fetchKey: fetchKey,
    },
  );

  const [commitModifyUserSetting, isInFlightCommitModifyUserSetting] =
    useMutation<UserSettingModalModifyMutation>(graphql`
      mutation UserSettingModalModifyMutation(
        $email: String!
        $props: ModifyUserInput!
        $isNotSupportTotp: Boolean!
      ) {
        modify_user(email: $email, props: $props) {
          ok
          msg
          user {
            id
            email
            username
            need_password_change
            full_name
            description
            status
            domain_name
            role
            groups {
              id
              name
            }
            resource_policy
            sudo_session_enabled
            totp_activated @skipOnClient(if: $isNotSupportTotp)
            allowed_client_ip
            main_access_key
            container_uid
            container_main_gid
            container_gids
            ...TOTPActivateModalFragment
          }
        }
      }
    `);

  const [commitCreateUser, isInFlightCommitCreateUser] =
    useMutation<UserSettingModalCreateMutation>(graphql`
      mutation UserSettingModalCreateMutation(
        $email: String!
        $props: UserInput!
        $isNotSupportTotp: Boolean!
      ) {
        create_user(email: $email, props: $props) {
          ok
          msg
          user {
            id
            email
            username
            need_password_change
            full_name
            description
            status
            domain_name
            role
            groups {
              id
              name
            }
            resource_policy
            sudo_session_enabled
            totp_activated @skipOnClient(if: $isNotSupportTotp)
            allowed_client_ip
            main_access_key
            container_uid
            container_main_gid
            container_gids
            ...TOTPActivateModalFragment
          }
          keypair {
            ...GeneratedKeypairListModalFragment
          }
        }
      }
    `);

  const [commitBulkCreateUsers, isInFlightBulkCreateUsers] =
    useMutation<UserSettingModalBulkCreateMutation>(graphql`
      mutation UserSettingModalBulkCreateMutation(
        $input: BulkCreateUserV2Input!
      ) {
        adminBulkCreateUsersV2(input: $input) {
          createdUsers {
            id
          }
          failed {
            index
            username
            email
            message
          }
        }
      }
    `);

  const mutationToRemoveTotp = useTanMutation({
    mutationFn: (email: string) => {
      return baiClient.remove_totp(email);
    },
  });

  const handleOk = () => {
    formRef.current
      ?.validateFields()
      .then(async (values) => {
        if (bulkCreate) {
          const bulkValues = values as BulkFormValues;
          const users = _.range(1, bulkValues.user_count + 1).map((i) => ({
            email: `${bulkValues.email_prefix}${i}@${bulkValues.email_suffix}`,
            username: `${bulkValues.email_prefix}${i}`,
            password: bulkValues.password as string,
            domainName: bulkValues.domain_name,
            needPasswordChange: bulkValues.need_password_change || false,
            status: statusToV2[bulkValues.status] || 'ACTIVE',
            role: roleToV2[bulkValues.role] || 'USER',
            description: bulkValues.description || null,
            groupIds: bulkValues.group_ids || null,
            allowedClientIp: bulkValues.allowed_client_ip || null,
            resourcePolicy: bulkValues.resource_policy || 'default',
            sudoSessionEnabled: bulkValues.sudo_session_enabled || false,
          }));

          commitBulkCreateUsers({
            variables: {
              input: { users },
            },
            onCompleted: (res, errors) => {
              if (errors?.[0]) {
                message.error(errors[0].message || t('error.UnknownError'));
                logger.error(errors);
                return;
              }

              const createdCount =
                res.adminBulkCreateUsersV2?.createdUsers?.length ?? 0;
              const failedList = res.adminBulkCreateUsersV2?.failed ?? [];

              if (failedList.length > 0) {
                message.warning(
                  t('credential.BulkCreateUserPartialFailure', {
                    successCount: createdCount,
                    failCount: failedList.length,
                  }),
                );
                logger.error('Bulk create partial failures:', failedList);
              } else {
                message.success(
                  t('credential.BulkCreateUserSuccess', {
                    count: createdCount,
                  }),
                );
              }
              onRequestClose(true);
            },
            onError: (err) => {
              message.error(t('dialog.ErrorOccurred'));
              logger.error(err);
            },
          });
          return;
        }

        const formValues = values as FormValues;
        const mutationProps = {
          ..._.omit(formValues, 'email', 'password_confirm'),
          // Convert container_gids from string[] to number[]
          container_gids: _.map(formValues.container_gids, (v) =>
            _.toNumber(v),
          ),
          need_password_change: formValues.need_password_change || false,
        };

        if (user) {
          commitModifyUserSetting({
            variables: {
              email: formValues?.email || '',
              props: mutationProps,
              isNotSupportTotp: !isTOTPSupported,
            },
            onCompleted: (res, errors) => {
              const errorMessage = errors?.[0]?.message; //user modify mutation can have only one error at most
              const notOkMessage =
                res?.modify_user?.ok === false
                  ? res.modify_user.msg
                  : undefined;

              if (res.modify_user?.ok === false || errors?.[0]) {
                message.error(
                  notOkMessage || errorMessage || t('error.UnknownError'),
                );
                logger.error(res?.modify_user?.msg, errorMessage);
                return;
              }

              message.success(t('environment.SuccessfullyModified'));
              onRequestClose(true);
            },
            onError: (err) => {
              message.error(t('dialog.ErrorOccurred'));
              logger.error(err);
            },
          });
        } else {
          commitCreateUser({
            variables: {
              email: formValues?.email || '',
              props: {
                ...mutationProps,
                // In create user, password is required field
                password: formValues.password as string,
              },
              isNotSupportTotp: !isTOTPSupported,
            },
            onCompleted: (res, errors) => {
              const errorMessage = errors?.[0]?.message; //user creation mutation can have only one error at most
              const notOkMessage =
                res?.create_user?.ok === false
                  ? res.create_user.msg
                  : undefined;

              // Handle "user already exists" error separately to show a more user-friendly message
              if (
                (notOkMessage && notOkMessage.includes('already exists')) ||
                (errorMessage &&
                  errorMessage.includes('The user already exists'))
              ) {
                message.error(t('credential.UserAccountCreatedError'));
                logger.error(res?.create_user?.msg, errorMessage);
                return;
              }

              // Handle other errors messages
              if (res.create_user?.ok === false || errors?.[0]) {
                message.error(
                  notOkMessage || errorMessage || t('error.UnknownError'),
                );
                logger.error(res, errors);
                return;
              } else if (res.create_user?.keypair) {
                // Show the created keypair modal if user creation is successful
                setCreatedKeypairs([res.create_user.keypair]);
              } else {
                // User might have been created successfully but no keypair returned
                // Just close the modal with success to refresh the user list
                onRequestClose(true);
              }
            },
            onError: (err) => {
              message.error(t('dialog.ErrorOccurred'));
              logger.error(err);
            },
          });
        }
      })
      .catch((e) => logger.error(e));
  };

  return (
    <BAIModal
      centered
      title={
        user
          ? t('credential.ModifyUserDetail')
          : bulkCreate
            ? t('credential.BulkCreateUser')
            : t('credential.CreateUser')
      }
      destroyOnHidden
      onOk={handleOk}
      confirmLoading={
        isInFlightCommitModifyUserSetting ||
        isInFlightCommitCreateUser ||
        isInFlightBulkCreateUsers
      }
      onCancel={() => onRequestClose(false)}
      loading={deferredOpen !== baiModalProps.open}
      {...baiModalProps}
    >
      <Suspense fallback={<Skeleton active />}>
        <Form
          ref={formRef}
          preserve={false}
          validateTrigger={['onChange', 'onBlur']}
          initialValues={
            user
              ? {
                  ...user,
                  // Convert container_gids from number[] to string[] for Select mode="tags"
                  container_gids: user.container_gids
                    ? _.map(user.container_gids, (gid) => String(gid))
                    : undefined,
                }
              : ({
                  need_password_change: bulkCreate ? true : false,
                  user_count: 1,
                  status: 'active',
                  domain_name: currentDomainName,
                  role: 'user',
                  is_active: true,
                  resource_policy: 'default',
                } as Partial<FormValues>)
          }
          layout="vertical"
        >
          {bulkCreate ? (
            <>
              <Space.Compact style={{ width: '100%' }}>
                <Form.Item
                  name="email_prefix"
                  label={t('credential.EmailPrefix')}
                  style={{ flex: 1 }}
                  rules={[
                    { required: true },
                    {
                      pattern: /^[a-zA-Z0-9._-]+$/,
                      message: t('credential.WrongEmail'),
                    },
                    { max: 30 },
                  ]}
                >
                  <Input placeholder={t('maxLength.30chars')} />
                </Form.Item>
                <Form.Item
                  name="email_suffix"
                  label={t('credential.EmailSuffix')}
                  style={{ flex: 1 }}
                  rules={[
                    { required: true },
                    {
                      pattern:
                        /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/,
                      message: t('credential.WrongEmail'),
                    },
                    { max: 30 },
                  ]}
                >
                  <Input prefix="@" placeholder={t('maxLength.30chars')} />
                </Form.Item>
              </Space.Compact>
              <Form.Item
                name="user_count"
                label={t('credential.UserCount')}
                rules={[{ required: true }]}
              >
                <InputNumber style={{ width: '100%' }} min={1} max={100} />
              </Form.Item>
            </>
          ) : (
            <>
              <Form.Item
                name="email"
                label={t('general.E-Mail')}
                rules={[{ required: !user }, { type: 'email' }]}
              >
                <Input disabled={!!user} />
              </Form.Item>
              <Form.Item
                name="username"
                label={t('credential.UserName')}
                rules={[
                  {
                    max: 64,
                  },
                  {
                    required: true,
                  },
                ]}
              >
                <Input placeholder={t('maxLength.64chars')} />
              </Form.Item>
              <Form.Item
                name="full_name"
                label={t('credential.FullName')}
                rules={[
                  {
                    max: 64,
                  },
                ]}
              >
                <Input placeholder={t('maxLength.64chars')} />
              </Form.Item>
            </>
          )}
          <Form.Item
            name="password"
            label={user ? t('general.NewPassword') : t('general.Password')}
            rules={[
              {
                required: !user || bulkCreate,
              },
              {
                pattern: /^(?=.*\d)(?=.*[a-zA-Z])(?=.*[_\W]).{8,}$/,
                message: t('webui.menu.InvalidPasswordMessage'),
              },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="password_confirm"
            dependencies={['password']}
            label={
              user
                ? t('webui.menu.NewPasswordAgain')
                : t('general.ConfirmPassword')
            }
            rules={[
              {
                required: !user || bulkCreate,
                message: '',
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value && !!getFieldValue('password')) {
                    return Promise.reject(
                      new Error(t('webui.menu.PleaseConfirmYourPassword')),
                    );
                  }
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(t('environment.PasswordsDoNotMatch')),
                  );
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="need_password_change"
            label={t('credential.DescRequirePasswordChange')}
            valuePropName="checked"
            tooltip={t('credential.TooltipForRequirePasswordChange')}
          >
            <Checkbox>{t('general.Enable')}</Checkbox>
          </Form.Item>
          <Form.Item
            name="description"
            label={t('credential.Description')}
            rules={[{ max: 500 }]}
          >
            <Input.TextArea placeholder={t('maxLength.500chars')} />
          </Form.Item>
          <Form.Item name="status" label={t('credential.UserStatus')}>
            <Select
              options={[
                {
                  value: 'active',
                  label: t('general.Active'),
                },
                {
                  value: 'inactive',
                  label: t('general.Inactive'),
                },
                {
                  value: 'before-verification',
                  label: t('credential.BeforeVerification'),
                },
                {
                  value: 'deleted',
                  label: t('credential.Deleted'),
                },
              ]}
            />
          </Form.Item>
          {!!currentUserRole &&
            currentUserRole in permissionRangeOfRoleChanges && (
              <Form.Item name="role" label={t('credential.Role')}>
                <Select
                  options={_.map(
                    permissionRangeOfRoleChanges[currentUserRole],
                    (item) => {
                      return {
                        value: item,
                        label: item,
                      };
                    },
                  )}
                />
              </Form.Item>
            )}
          <Form.Item
            name="sudo_session_enabled"
            label={t('credential.EnableSudoSession')}
            valuePropName="checked"
          >
            <Checkbox>{t('general.Allow')}</Checkbox>
          </Form.Item>
          {!!isTOTPSupported && !bulkCreate && (
            <Form.Item
              name="totp_activated"
              label={t('webui.menu.TotpActivated')}
              valuePropName="checked"
              extra={
                user?.email !== baiClient?.email && (
                  <Typography.Text
                    type="secondary"
                    style={{ fontSize: token.fontSizeSM }}
                  >
                    {t('credential.AdminCanOnlyRemoveTotp')}
                  </Typography.Text>
                )
              }
            >
              <Switch
                loading={
                  isLoadingManagerSupportingTOTP ||
                  mutationToRemoveTotp.isPending
                }
                disabled={
                  user?.email !== baiClient?.email && !user?.totp_activated
                }
                onChange={(checked: boolean) => {
                  if (checked) {
                    toggleTOTPActivateModal();
                  } else {
                    if (user?.totp_activated) {
                      formRef.current?.setFieldValue('totp_activated', true);
                      modal.confirm({
                        title: t('totp.TurnOffTotp'),
                        icon: <ExclamationCircleFilled />,
                        content: t('totp.ConfirmTotpRemovalBody'),
                        okText: t('button.Yes'),
                        okType: 'danger',
                        cancelText: t('button.No'),
                        onOk() {
                          mutationToRemoveTotp.mutate(user?.email || '', {
                            onSuccess: () => {
                              message.success(
                                t('totp.RemoveTotpSetupCompleted'),
                              );
                              updateFetchKey();
                              formRef.current?.setFieldValue(
                                'totp_activated',
                                false,
                              );
                            },
                            onError: (err) => {
                              logger.error(err);
                            },
                          });
                        },
                        onCancel() {
                          formRef.current?.setFieldValue(
                            'totp_activated',
                            true,
                          );
                        },
                      });
                    }
                  }
                }}
              />
            </Form.Item>
          )}
          <Form.Item
            name="resource_policy"
            label={t('resourcePolicy.ResourcePolicy')}
            rules={[{ required: !user }]}
          >
            <UserResourcePolicySelect />
          </Form.Item>
          <Form.Item
            name="domain_name"
            label={t('credential.Domain')}
            rules={[{ required: true }]}
          >
            <BAIDomainSelect
              onChange={() => {
                formRef.current?.setFieldValue('group_ids', []);
              }}
            />
          </Form.Item>
          <Suspense
            fallback={
              <Form.Item label={t('credential.Projects')}>
                <Select loading />
              </Form.Item>
            }
          >
            <Form.Item noStyle dependencies={['domain_name']}>
              {({ getFieldValue }) => (
                <Form.Item
                  name="group_ids"
                  label={t('credential.Projects')}
                  getValueFromEvent={(value) => value}
                  getValueProps={(value) => ({
                    value: _.isArray(value)
                      ? value
                      : _.map(user?.groups, (g) => g?.id),
                  })}
                >
                  <ProjectSelect
                    mode="multiple"
                    domain={getFieldValue('domain_name')}
                    disableDefaultFilter
                    lockedProjectTypes={!user ? ['MODEL_STORE'] : undefined}
                  />
                </Form.Item>
              )}
            </Form.Item>
          </Suspense>
          <Form.Item
            name="allowed_client_ip"
            label={t('credential.AllowedClientIP')}
            extra={t('credential.AllowedClientIPHint')}
            rules={[
              {
                validator: async (_rule, value) => {
                  if (!value || value.length === 0) return Promise.resolve();
                  const invalidIPs = (value as string[]).filter(
                    (ip: string) => !isValidIPOrCidr(ip),
                  );
                  if (invalidIPs.length > 0) {
                    return Promise.reject(
                      new Error(
                        `${t('credential.InvalidIP')}: ${invalidIPs.join(', ')}`,
                      ),
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Select
              mode="tags"
              tokenSeparators={[',', ' ']}
              tagRender={(props) => {
                const isValid =
                  _.isString(props.label) && isValidIPOrCidr(props.label);
                return (
                  <Tag color={!isValid ? 'red' : undefined} {...props}>
                    {props.label}
                  </Tag>
                );
              }}
              open={false}
              suffixIcon={null}
              placeholder={t('credential.AllowedClientIPPlaceholder')}
            />
          </Form.Item>

          {!bulkCreate && (
            <>
              <Form.Item
                name="container_uid"
                label={t('credential.ContainerUID')}
                tooltip={t('credential.ContainerUIDTooltip')}
                rules={[
                  {
                    type: 'number',
                    min: 1,
                    message: t(
                      'credential.validation.PleaseEnterPositiveInteger',
                    ),
                  },
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  max={SIGNED_32BIT_MAX_INT}
                  min={1}
                />
              </Form.Item>
              <Form.Item
                name="container_main_gid"
                label={t('credential.ContainerGID')}
                tooltip={t('credential.ContainerGIDTooltip')}
                rules={[
                  {
                    type: 'number',
                    min: 1,
                    message: t(
                      'credential.validation.PleaseEnterPositiveInteger',
                    ),
                  },
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  max={SIGNED_32BIT_MAX_INT}
                  min={1}
                />
              </Form.Item>
              <Form.Item
                name="container_gids"
                label={t('credential.ContainerSupplementaryGIDs')}
                tooltip={t('credential.ContainerSupplementaryGIDsTooltip')}
                rules={[
                  () => ({
                    validator(_rule, values) {
                      if (
                        _.isEmpty(values) ||
                        _.every(values, (v) => {
                          const num = _.toNumber(v);
                          return num > 0 && num <= SIGNED_32BIT_MAX_INT;
                        })
                      ) {
                        return Promise.resolve();
                      } else {
                        return Promise.reject(
                          new Error(
                            t(
                              'credential.validation.PleaseEnterPositiveAndUnder2_31',
                            ),
                          ),
                        );
                      }
                    },
                  }),
                  () => ({
                    validator(_rule, values) {
                      if (
                        _.isEmpty(values) ||
                        _.every(values, (v) => {
                          return _.isInteger(_.toNumber(v));
                        })
                      ) {
                        return Promise.resolve();
                      } else {
                        return Promise.reject(
                          new Error(
                            t('credential.validation.PleaseEnterValidNumber'),
                          ),
                        );
                      }
                    },
                  }),
                  () => ({
                    validator(_rule, values) {
                      if (
                        _.isEmpty(values) ||
                        _.uniq(values).length === values.length
                      ) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error(
                          t('credential.validation.PleaseEnterUniqueNumbers'),
                        ),
                      );
                    },
                  }),
                ]}
              >
                <BAISelect
                  mode="tags"
                  tokenSeparators={[',', ' ']}
                  open={false}
                  suffixIcon={null}
                  placeholder={t(
                    'credential.ContainerSupplementaryGIDsPlaceholder',
                  )}
                />
              </Form.Item>
            </>
          )}
          {!!user && userEmail && (
            <Suspense
              fallback={
                <Form.Item label={t('credential.MainAccessKey')}>
                  <Select loading />
                </Form.Item>
              }
            >
              <Form.Item
                name="main_access_key"
                label={t('credential.MainAccessKey')}
              >
                <AccessKeySelect userEmail={userEmail} fetchKey={fetchKey} />
              </Form.Item>
            </Suspense>
          )}
        </Form>
        {!!isTOTPSupported && !bulkCreate && (
          <TOTPActivateModal
            userFrgmt={user}
            open={isOpenTOTPActivateModal}
            onRequestClose={(success) => {
              if (success) {
                updateFetchKey();
              } else {
                formRef.current?.setFieldValue('totp_activated', false);
              }
              toggleTOTPActivateModal();
            }}
          />
        )}
        <BAIUnmountAfterClose>
          <GeneratedKeypairListModal
            open={!!createdKeypairs}
            keypairFragment={filterOutNullAndUndefined(createdKeypairs)}
            onRequestClose={() => {
              setCreatedKeypairs(null);
              onRequestClose(true);
            }}
          />
        </BAIUnmountAfterClose>
      </Suspense>
    </BAIModal>
  );
};

export default UserSettingModal;
