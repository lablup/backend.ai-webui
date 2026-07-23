/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { GeneratedKeypairListModalFragment$key } from '../__generated__/GeneratedKeypairListModalFragment.graphql';
import {
  UserSettingModalBulkCreateMutation,
  UserRoleV2,
  UserStatusV2,
} from '../__generated__/UserSettingModalBulkCreateMutation.graphql';
import { UserSettingModalCreateMutation } from '../__generated__/UserSettingModalCreateMutation.graphql';
import { UserSettingModalFragment$key } from '../__generated__/UserSettingModalFragment.graphql';
import { UserSettingModalUpdateMutation } from '../__generated__/UserSettingModalUpdateMutation.graphql';
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
  BAIAlert,
  BAIModal,
  BAIModalProps,
  BAISelect,
  BAIUnmountAfterClose,
  filterOutNullAndUndefined,
  toLocalId,
  useBAILogger,
  useUpdatableState,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { Suspense, useDeferredValue, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useMutation, useFragment } from 'react-relay';

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
  main_access_key?: string;
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

// Reverse maps: v2 enums → the form's v1 string values used by the Select inputs.
const statusFromV2: Record<string, string> = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BEFORE_VERIFICATION: 'before-verification',
  DELETED: 'deleted',
};

const roleFromV2: Record<string, string> = {
  USER: 'user',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin',
  MONITOR: 'monitor',
};

const formatBulkEmail = (
  prefix: string,
  suffix: string,
  index: number,
  totalCount: number,
) => {
  const padLength = String(totalCount).length;
  return `${prefix}${String(index).padStart(padLength, '0')}@${suffix}`;
};

const formatBulkUsername = (
  prefix: string,
  index: number,
  totalCount: number,
) => {
  const padLength = String(totalCount).length;
  return `${prefix}${String(index).padStart(padLength, '0')}`;
};

interface UserSettingModalProps extends BAIModalProps {
  userSettingFrgmt?: UserSettingModalFragment$key | null;
  bulkCreate?: boolean;
  onRequestClose: (success: boolean) => void;
}

const UserSettingModal: React.FC<UserSettingModalProps> = ({
  userSettingFrgmt = null,
  bulkCreate = false,
  onRequestClose,
  ...baiModalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { modal } = App.useApp();
  const formRef = useRef<FormInstance<FormValues>>(null);
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

  const user = useFragment(
    graphql`
      fragment UserSettingModalFragment on UserV2 {
        id
        basicInfo {
          email
          username
          fullName
          description
        }
        status {
          status
          needPasswordChange
        }
        organization {
          domainName
          role
          resourcePolicy
          mainAccessKey
        }
        security {
          totpActivated @skipOnClient(if: $isNotSupportTotp)
          sudoSessionEnabled
          allowedClientIp
        }
        container {
          containerUid
          containerMainGid
          containerGids
        }
        projects {
          edges {
            node {
              id
            }
          }
        }
        ...TOTPActivateModalFragment
      }
    `,
    userSettingFrgmt ?? null,
  );

  // >= 26.4.0: adminUpdateUserV2 — edit keyed by userId.
  const [commitUpdateUserV2, isInFlightUpdateUserV2] =
    useMutation<UserSettingModalUpdateMutation>(graphql`
      mutation UserSettingModalUpdateMutation(
        $userId: UUID!
        $input: UpdateUserV2Input!
      ) {
        adminUpdateUserV2(userId: $userId, input: $input) {
          user {
            id
            basicInfo {
              email
              fullName
              username
              description
              integrationName
            }
            organization {
              domainName
              role
              resourcePolicy
              mainAccessKey
            }
            security {
              totpActivated
              totpActivatedAt
              sudoSessionEnabled
              allowedClientIp
            }
            status {
              status
              statusInfo
              needPasswordChange
            }
            container {
              containerUid
              containerMainGid
              containerGids
            }
            timestamps {
              createdAt
              modifiedAt
            }
          }
        }
      }
    `);

  // >= 26.4.3: adminCreateUserV2 returns the user together with its generated
  // keypair (secret key shown once), so single create runs fully on v2.
  const [commitCreateUser, isInFlightCommitCreateUser] =
    useMutation<UserSettingModalCreateMutation>(graphql`
      mutation UserSettingModalCreateMutation($input: CreateUserV2Input!) {
        adminCreateUserV2(input: $input) {
          user {
            id
            basicInfo {
              email
              fullName
              username
              description
              integrationName
            }
            organization {
              domainName
              role
              resourcePolicy
              mainAccessKey
            }
            security {
              totpActivated
              totpActivatedAt
              sudoSessionEnabled
              allowedClientIp
            }
            status {
              status
              statusInfo
              needPasswordChange
            }
            container {
              containerUid
              containerMainGid
              containerGids
            }
            timestamps {
              createdAt
              modifiedAt
            }
          }
          keypair {
            ...GeneratedKeypairListModalFragment
          }
        }
      }
    `);

  // adminBulkCreateUsersWithKeypairV2 replaces the deprecated
  // adminBulkCreateUsersV2, returning each created user's generated keypair
  // and one-time secret key.
  const [commitBulkCreateUsers, isInFlightBulkCreateUsers] =
    useMutation<UserSettingModalBulkCreateMutation>(graphql`
      mutation UserSettingModalBulkCreateMutation(
        $input: BulkCreateUserV2Input!
      ) {
        adminBulkCreateUsersWithKeypairV2(input: $input) {
          created {
            keypair {
              ...GeneratedKeypairListModalFragment
            }
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
          const bulkValues = values as unknown as BulkFormValues;
          const users = _.range(1, bulkValues.user_count + 1).map((i) => ({
            email: formatBulkEmail(
              bulkValues.email_prefix,
              bulkValues.email_suffix,
              i,
              bulkValues.user_count,
            ),
            username: formatBulkUsername(
              bulkValues.email_prefix,
              i,
              bulkValues.user_count,
            ),
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

              const createdList =
                res.adminBulkCreateUsersWithKeypairV2?.created ?? [];
              const createdCount = createdList.length;
              const failedList =
                res.adminBulkCreateUsersWithKeypairV2?.failed ?? [];

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

              // Reveal the generated keypairs (secret keys are returned once).
              const keypairs = _.map(createdList, (created) => created.keypair);
              if (keypairs.length > 0) {
                setCreatedKeypairs(keypairs);
              } else {
                onRequestClose(true);
              }
            },
            onError: (err) => {
              message.error(t('dialog.ErrorOccurred'));
              logger.error(err);
            },
          });
          return;
        }

        const formValues = values as FormValues;

        if (user) {
          commitUpdateUserV2({
            variables: {
              userId: toLocalId(user.id),
              input: {
                username: formValues.username,
                password: formValues.password || undefined,
                fullName: formValues.full_name,
                description: formValues.description,
                status: formValues.status
                  ? statusToV2[formValues.status]
                  : undefined,
                role: formValues.role ? roleToV2[formValues.role] : undefined,
                domainName: formValues.domain_name,
                groupIds: formValues.group_ids,
                allowedClientIp: formValues.allowed_client_ip,
                needPasswordChange: formValues.need_password_change || false,
                resourcePolicy: formValues.resource_policy,
                sudoSessionEnabled: formValues.sudo_session_enabled,
                mainAccessKey: formValues.main_access_key,
                containerUid: formValues.container_uid,
                containerMainGid: formValues.container_main_gid,
                containerGids: _.map(formValues.container_gids, (v) =>
                  _.toNumber(v),
                ),
              },
            },
            onCompleted: (_res, errors) => {
              if (errors?.[0]) {
                message.error(errors[0].message || t('error.UnknownError'));
                logger.error(errors);
                return;
              }
              message.success(t('environment.SuccessfullyModified'));
              onRequestClose(false);
            },
            onError: (err) => {
              message.error(t('dialog.ErrorOccurred'));
              logger.error(err);
            },
          });
        } else {
          commitCreateUser({
            variables: {
              input: {
                email: formValues.email,
                username: formValues.username,
                password: formValues.password as string,
                domainName: formValues.domain_name,
                needPasswordChange: formValues.need_password_change || false,
                status: statusToV2[formValues.status] || 'ACTIVE',
                role: roleToV2[formValues.role] || 'USER',
                fullName: formValues.full_name || null,
                description: formValues.description || null,
                groupIds: formValues.group_ids || null,
                allowedClientIp: formValues.allowed_client_ip || null,
                totpActivated: formValues.totp_activated || false,
                resourcePolicy: formValues.resource_policy || 'default',
                sudoSessionEnabled: formValues.sudo_session_enabled || false,
                containerUid: formValues.container_uid ?? null,
                containerMainGid: formValues.container_main_gid ?? null,
                containerGids: formValues.container_gids
                  ? _.map(formValues.container_gids, (v) => _.toNumber(v))
                  : null,
              },
            },
            onCompleted: (res, errors) => {
              // adminCreateUserV2 reports failures via GraphQL errors
              // (at most one).
              const errorMessage = errors?.[0]?.message;

              // Handle "user already exists" error separately to show a more
              // user-friendly message.
              if (errorMessage && errorMessage.includes('already exists')) {
                message.error(t('credential.UserAccountCreatedError'));
                logger.error(errorMessage);
                return;
              }

              if (errors?.[0]) {
                message.error(errorMessage || t('error.UnknownError'));
                logger.error(errors);
                return;
              }

              if (res.adminCreateUserV2?.keypair) {
                // Show the created keypair modal (secret key returned once).
                setCreatedKeypairs([res.adminCreateUserV2.keypair]);
              } else {
                onRequestClose(false);
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
      okText={user ? t('button.Save') : t('button.Create')}
      destroyOnHidden
      onOk={handleOk}
      confirmLoading={
        isInFlightUpdateUserV2 ||
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
                  email: user.basicInfo.email,
                  username: user.basicInfo.username ?? undefined,
                  full_name: user.basicInfo.fullName ?? undefined,
                  description: user.basicInfo.description ?? undefined,
                  need_password_change: user.status.needPasswordChange ?? false,
                  status: statusFromV2[user.status.status],
                  role: user.organization.role
                    ? roleFromV2[user.organization.role]
                    : undefined,
                  domain_name: user.organization.domainName ?? undefined,
                  resource_policy: user.organization.resourcePolicy,
                  main_access_key: user.organization.mainAccessKey ?? undefined,
                  sudo_session_enabled: user.security.sudoSessionEnabled,
                  totp_activated: user.security.totpActivated ?? undefined,
                  allowed_client_ip: user.security.allowedClientIp
                    ? [...user.security.allowedClientIp]
                    : undefined,
                  container_uid: user.container.containerUid ?? undefined,
                  container_main_gid:
                    user.container.containerMainGid ?? undefined,
                  // Convert container_gids from number[] to string[] for Select mode="tags"
                  container_gids: user.container.containerGids
                    ? _.map(user.container.containerGids, (gid) => String(gid))
                    : undefined,
                  group_ids: _.compact(
                    _.map(user.projects?.edges, (edge) =>
                      edge?.node?.id ? toLocalId(edge.node.id) : null,
                    ),
                  ),
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
              <BAIAlert
                type="info"
                ghostInfoBg={false}
                showIcon
                description={t('credential.BulkCreateUserDescription')}
                style={{ marginBottom: token.marginMD }}
              />
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
                rules={[
                  { required: true },
                  {
                    type: 'number',
                    max: 100,
                    message: t('credential.validation.MaxUserCount', {
                      count: 100,
                    }),
                  },
                ]}
                extra={
                  <Form.Item
                    noStyle
                    dependencies={[
                      'email_prefix',
                      'email_suffix',
                      'user_count',
                    ]}
                  >
                    {({ getFieldValue }) => {
                      const prefix = getFieldValue('email_prefix');
                      const suffix = getFieldValue('email_suffix');
                      const count = getFieldValue('user_count');
                      if (!prefix || !suffix || !count) return null;
                      const previewCount = Math.min(count, 100);
                      const previewEmails: string[] = [];
                      if (previewCount <= 4) {
                        for (let i = 1; i <= previewCount; i++) {
                          previewEmails.push(
                            formatBulkEmail(prefix, suffix, i, previewCount),
                          );
                        }
                      } else {
                        previewEmails.push(
                          formatBulkEmail(prefix, suffix, 1, previewCount),
                          formatBulkEmail(prefix, suffix, 2, previewCount),
                        );
                      }
                      const lastEmail =
                        previewCount > 4
                          ? formatBulkEmail(
                              prefix,
                              suffix,
                              previewCount,
                              previewCount,
                            )
                          : undefined;
                      return (
                        <Typography.Text type="secondary">
                          {previewEmails.join(', ')}
                          {lastEmail && ` … ${lastEmail}`}
                        </Typography.Text>
                      );
                    }}
                  </Form.Item>
                }
              >
                <InputNumber style={{ width: '100%' }} min={1} />
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
                  value: 'deleted',
                  label: t('credential.InactiveIncludeKeypair'),
                },
                {
                  value: 'before-verification',
                  label: t('credential.BeforeVerification'),
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
                user?.basicInfo.email !== baiClient?.email && (
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
                  user?.basicInfo.email !== baiClient?.email &&
                  !user?.security.totpActivated
                }
                onChange={(checked: boolean) => {
                  if (checked) {
                    toggleTOTPActivateModal();
                  } else {
                    if (user?.security.totpActivated) {
                      formRef.current?.setFieldValue('totp_activated', true);
                      modal.confirm({
                        title: t('totp.TurnOffTotp'),
                        icon: <ExclamationCircleFilled />,
                        content: t('totp.ConfirmTotpRemovalBody'),
                        okText: t('button.Yes'),
                        okType: 'danger',
                        cancelText: t('button.No'),
                        onOk() {
                          mutationToRemoveTotp.mutate(
                            user?.basicInfo.email || '',
                            {
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
                            },
                          );
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
                      : _.compact(
                          _.map(user?.projects?.edges, (edge) =>
                            edge?.node?.id ? toLocalId(edge.node.id) : null,
                          ),
                        ),
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
          {!!user && (
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
                <AccessKeySelect
                  userEmail={user.basicInfo.email}
                  fetchKey={fetchKey}
                />
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
