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
import { App } from '../app-shim';
import { Form, FormInstance } from '../form-engine';
import { isValidIPOrCidr } from '../helper';
import { SIGNED_32BIT_MAX_INT } from '../helper/const-vars';
import { useCurrentDomainValue, useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserRole, useTOTPSupported } from '../hooks/backendai';
import { useTanMutation } from '../hooks/reactQueryAlias';
import { theme } from '../theme-shim';
import AccessKeySelect from './AccessKeySelect';
import BAIFormItem from './BAIFormItem';
import {
  BulkCreateUserErrorModal,
  type FailedUserCreation,
  toFailedUserCreations,
} from './BulkCreateUserFailure';
import GeneratedKeypairListModal from './GeneratedKeypairListModal';
import ProjectSelect from './ProjectSelect';
import TOTPActivateModal from './TOTPActivateModal';
import UserResourcePolicySelect from './UserResourcePolicySelect';
import {
  AstryxFormCheckbox,
  AstryxFormNumberInput,
  AstryxFormSelector,
  AstryxFormTagsInput,
  AstryxFormTextArea,
  AstryxFormTextInput,
} from './astryxFormControls';
import { Switch } from '@astryxdesign/core/Switch';
import { Text } from '@astryxdesign/core/Text';
import { Tokenizer } from '@astryxdesign/core/Tokenizer';
import type {
  SearchableItem,
  SearchSource,
} from '@astryxdesign/core/Typeahead';
import {
  BAISkeleton,
  BAIAlert,
  BAICompactGroup,
  BAIDomainSelect,
  BAIModal,
  BAIModalProps,
  BAISelect,
  BAIUnmountAfterClose,
  filterOutNullAndUndefined,
  toLocalId,
  useBAILogger,
  useToggle,
  useUpdatableState,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { CircleAlert } from 'lucide-react';
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

// Free-tag entry has no options to search — the source is intentionally empty
// and `hasCreate` commits typed text as new tokens. Module-level so the
// Tokenizer never sees a fresh identity per render.
const EMPTY_TAG_SEARCH_SOURCE: SearchSource<SearchableItem> = {
  search: () => [],
  bootstrap: () => [],
};

// antd `Select mode="tags"` → Astryx Tokenizer bridge for the antd form
// engine: the form field holds `string[]`, the Tokenizer works on
// `SearchableItem[]` ({id, label}), so the shapes are translated here.
// PILOT-DECISION: antd's `tokenSeparators={[',', ' ']}` (splitting pasted
// comma/space-separated text into multiple tags) has no Tokenizer
// equivalent and is dropped — tags are committed one at a time with Enter
// (`hasCreate`). The per-tag red highlight for invalid IPs (the antd
// `tagRender`) is also dropped: `astryx component Tokenizer` best practices
// explicitly discourage custom per-token colors, and the field's own
// `rules` validator (kept unchanged below) already surfaces every invalid
// IP in the BAIFormItem's error text under the control, so the same
// information still reaches the user without per-chip coloring.
const AllowedClientIpInput: React.FC<{
  value?: string[];
  onChange?: (next: string[]) => void;
  label: string;
  placeholder?: string;
}> = ({ value, onChange, label, placeholder }) => {
  'use memo';
  return (
    <Tokenizer
      label={label}
      isLabelHidden
      value={(value ?? []).map((ip) => ({ id: ip, label: ip }))}
      onChange={(items) =>
        onChange?.(
          Array.from(new Set(items.map((item) => item.label))).filter(Boolean),
        )
      }
      searchSource={EMPTY_TAG_SEARCH_SOURCE}
      hasCreate
      placeholder={placeholder}
      width="100%"
    />
  );
};

// Bridge for `BAIFormItem name="totp_activated" valuePropName="checked"`:
// this field needs `isLoading` (while the TOTP-support check / removal
// mutation is in flight), which `AstryxFormSwitch`'s adapter surface does
// not expose, so the raw Astryx `Switch` is used directly here — coalescing
// antd's injected `checked` the same way the adapter does elsewhere.
const TotpSwitch: React.FC<{
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label: string;
  isLoading?: boolean;
  disabled?: boolean;
}> = ({ checked, onChange, label, isLoading, disabled }) => {
  'use memo';
  return (
    <Switch
      value={checked ?? false}
      onChange={(next) => onChange?.(next)}
      label={label}
      isLabelHidden
      isLoading={isLoading}
      isDisabled={disabled}
    />
  );
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
  const { modal, message } = App.useApp();
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

  // Users the server refused to create. Reported inside the generated-keypair
  // result modal when some users were created, or in a standalone modal over
  // this form when none were.
  const [failedUsers, setFailedUsers] = useState<FailedUserCreation[]>([]);
  // The server's own created count — the mutation may reject users the form
  // considered valid, so this is not derived from the requested count.
  const [createdCount, setCreatedCount] = useState(0);

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
          totpActivated
            @skipOnClient(if: $isNotSupportTotp)
            @skip(if: $isNotSupportTotp)
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
              const succeededCount = createdList.length;
              const failedList =
                res.adminBulkCreateUsersWithKeypairV2?.failed ?? [];
              setCreatedCount(succeededCount);

              // Reveal the generated keypairs (secret keys are returned once).
              const keypairs = _.map(createdList, (created) => created.keypair);
              if (keypairs.length > 0) {
                setCreatedKeypairs(keypairs);
              }

              if (failedList.length > 0) {
                // Immediate failure notice as a toast on top of the detail
                // modal (matches FR-3357's AssignRoleModal) — the modal
                // carries the per-user table, the message the at-a-glance cue.
                message.error(
                  t('credential.BulkCreateUserPartialFailure', {
                    successCount: succeededCount,
                    failCount: failedList.length,
                  }),
                );
                // The per-user reasons only reach the admin through the error
                // modal — this form (or the keypair list of the users that were
                // created) stays open behind it, so nothing closes here.
                setFailedUsers(toFailedUserCreations(failedList));
                return;
              }

              message.success(
                t('credential.BulkCreateUserSuccess', {
                  count: succeededCount,
                }),
              );
              if (keypairs.length === 0) {
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
      // A bulk create that partially failed leaves this form open, so its
      // Cancel still has to report the users that *were* created — otherwise
      // the list behind it never refetches. `createdCount` stays 0 on the
      // single-create and edit paths, which keeps their behaviour unchanged.
      onCancel={() => onRequestClose(createdCount > 0)}
      loading={deferredOpen !== baiModalProps.open}
      {...baiModalProps}
    >
      <Suspense fallback={<BAISkeleton />}>
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
                  // Convert container_gids from number[] to string[]: the tags
                  // input (AstryxFormTagsInput) works on strings; the submit
                  // handler converts back with _.toNumber.
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
              {/* QA-FINDINGS Q-32 — "email prefix 와 email suffix 사이의
                  input margin 이 없음". The gapless `HStack` this replaces put
                  the two BORDERED boxes edge to edge at x=800 with each still
                  carrying `border-radius: 8px`, so they collided instead of
                  reading as one control. antd welded them with
                  `<Space.Compact>`; `BAICompactGroup` is that weld — the
                  members overlap by one `var(--border-width)` so the doubled
                  border collapses to a single stroke, the inner corners are
                  squared, and the focused field's edge is raised above its
                  neighbour's. The prefix and suffix are two halves of ONE
                  address, so a gap would have been the wrong control. */}
              <BAICompactGroup>
                <BAIFormItem
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
                  <AstryxFormTextInput
                    label={t('credential.EmailPrefix')}
                    placeholder={t('maxLength.30chars')}
                  />
                </BAIFormItem>
                <BAIFormItem
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
                  {/* PILOT-DECISION: antd `Input prefix="@"` rendered a static
                      "@" glyph inline before the text; Astryx TextInput only
                      supports an icon `startIcon`, not arbitrary prefix text
                      (no equivalent), so the "@" adornment is dropped. */}
                  <AstryxFormTextInput
                    label={t('credential.EmailSuffix')}
                    placeholder={t('maxLength.30chars')}
                  />
                </BAIFormItem>
              </BAICompactGroup>
              <BAIFormItem
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
                  <BAIFormItem
                    noStyle
                    dependencies={[
                      'email_prefix',
                      'email_suffix',
                      'user_count',
                    ]}
                  >
                    {(form) => {
                      // BAIFormItem render-prop children receive `unknown`
                      // (antd typed this as FormInstance); narrow it back.
                      const { getFieldValue } =
                        form as FormInstance<BulkFormValues>;
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
                        <Text color="secondary">
                          {previewEmails.join(', ')}
                          {lastEmail && ` … ${lastEmail}`}
                        </Text>
                      );
                    }}
                  </BAIFormItem>
                }
              >
                <AstryxFormNumberInput
                  label={t('credential.UserCount')}
                  min={1}
                />
              </BAIFormItem>
            </>
          ) : (
            <>
              <BAIFormItem
                name="email"
                label={t('general.E-Mail')}
                rules={[{ required: !user }, { type: 'email' }]}
              >
                <AstryxFormTextInput
                  label={t('general.E-Mail')}
                  type="email"
                  disabled={!!user}
                />
              </BAIFormItem>
              <BAIFormItem
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
                <AstryxFormTextInput
                  label={t('credential.UserName')}
                  placeholder={t('maxLength.64chars')}
                />
              </BAIFormItem>
              <BAIFormItem
                name="full_name"
                label={t('credential.FullName')}
                rules={[
                  {
                    max: 64,
                  },
                ]}
              >
                <AstryxFormTextInput
                  label={t('credential.FullName')}
                  placeholder={t('maxLength.64chars')}
                />
              </BAIFormItem>
            </>
          )}
          <BAIFormItem
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
            <AstryxFormTextInput
              label={user ? t('general.NewPassword') : t('general.Password')}
              type="password"
            />
          </BAIFormItem>
          <BAIFormItem
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
            <AstryxFormTextInput
              label={
                user
                  ? t('webui.menu.NewPasswordAgain')
                  : t('general.ConfirmPassword')
              }
              type="password"
            />
          </BAIFormItem>
          <BAIFormItem
            name="need_password_change"
            label={t('credential.DescRequirePasswordChange')}
            valuePropName="checked"
            tooltip={t('credential.TooltipForRequirePasswordChange')}
          >
            <AstryxFormCheckbox label={t('general.Enable')} />
          </BAIFormItem>
          <BAIFormItem
            name="description"
            label={t('credential.Description')}
            rules={[{ max: 500 }]}
          >
            <AstryxFormTextArea
              label={t('credential.Description')}
              placeholder={t('maxLength.500chars')}
            />
          </BAIFormItem>
          <BAIFormItem name="status" label={t('credential.UserStatus')}>
            <AstryxFormSelector
              label={t('credential.UserStatus')}
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
          </BAIFormItem>
          {!!currentUserRole &&
            currentUserRole in permissionRangeOfRoleChanges && (
              <BAIFormItem name="role" label={t('credential.Role')}>
                <AstryxFormSelector
                  label={t('credential.Role')}
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
              </BAIFormItem>
            )}
          <BAIFormItem
            name="sudo_session_enabled"
            label={t('credential.EnableSudoSession')}
            valuePropName="checked"
          >
            <AstryxFormCheckbox label={t('general.Allow')} />
          </BAIFormItem>
          {!!isTOTPSupported && !bulkCreate && (
            <BAIFormItem
              name="totp_activated"
              label={t('webui.menu.TotpActivated')}
              valuePropName="checked"
              extra={
                user?.basicInfo.email !== baiClient?.email && (
                  <Text type="supporting">
                    {t('credential.AdminCanOnlyRemoveTotp')}
                  </Text>
                )
              }
            >
              <TotpSwitch
                label={t('webui.menu.TotpActivated')}
                isLoading={
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
                        icon: <CircleAlert size="1em" />,
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
            </BAIFormItem>
          )}
          <BAIFormItem
            name="resource_policy"
            label={t('resourcePolicy.ResourcePolicy')}
            rules={[{ required: !user }]}
          >
            <UserResourcePolicySelect />
          </BAIFormItem>
          <BAIFormItem
            name="domain_name"
            label={t('credential.Domain')}
            rules={[{ required: true }]}
          >
            <BAIDomainSelect
              onChange={() => {
                formRef.current?.setFieldValue('group_ids', []);
              }}
            />
          </BAIFormItem>
          <Suspense
            fallback={
              <BAIFormItem label={t('credential.Projects')}>
                <BAISelect loading style={{ width: '100%' }} />
              </BAIFormItem>
            }
          >
            <BAIFormItem noStyle dependencies={['domain_name']}>
              {(form) => {
                // BAIFormItem render-prop children receive `unknown` (antd
                // typed this as FormInstance); narrow it back.
                const { getFieldValue } = form as FormInstance<FormValues>;
                return (
                  <BAIFormItem
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
                  </BAIFormItem>
                );
              }}
            </BAIFormItem>
          </Suspense>
          <BAIFormItem
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
            <AllowedClientIpInput
              label={t('credential.AllowedClientIP')}
              placeholder={t('credential.AllowedClientIPPlaceholder')}
            />
          </BAIFormItem>

          {!bulkCreate && (
            <>
              <BAIFormItem
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
                <AstryxFormNumberInput
                  label={t('credential.ContainerUID')}
                  max={SIGNED_32BIT_MAX_INT}
                  min={1}
                />
              </BAIFormItem>
              <BAIFormItem
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
                <AstryxFormNumberInput
                  label={t('credential.ContainerGID')}
                  max={SIGNED_32BIT_MAX_INT}
                  min={1}
                />
              </BAIFormItem>
              <BAIFormItem
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
                <AstryxFormTagsInput
                  tokenSeparators={[',', ' ']}
                  label={t('credential.ContainerSupplementaryGIDs')}
                  placeholder={t(
                    'credential.ContainerSupplementaryGIDsPlaceholder',
                  )}
                />
              </BAIFormItem>
            </>
          )}
          {!!user && (
            <Suspense
              fallback={
                <BAIFormItem label={t('credential.MainAccessKey')}>
                  <BAISelect loading style={{ width: '100%' }} />
                </BAIFormItem>
              }
            >
              <BAIFormItem
                name="main_access_key"
                label={t('credential.MainAccessKey')}
              >
                <AccessKeySelect
                  userEmail={user.basicInfo.email}
                  fetchKey={fetchKey}
                />
              </BAIFormItem>
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
              const hadFailures = !_.isEmpty(failedUsers);
              setCreatedKeypairs(null);
              if (!hadFailures) {
                // Full success — nothing left to review, finish the whole flow.
                onRequestClose(true);
              }
              // Partial failure: leave failedUsers as-is. BulkCreateUserErrorModal
              // below is the next step — its `open` gate flips true now that
              // createdKeypairs is cleared, showing the failures over the
              // still-open form (FR-3419).
            }}
          />
        </BAIUnmountAfterClose>
        {/* The failure report — shown immediately when every user failed (no
            keypairs to show first), or as the step after the admin dismisses
            the keypair modal above when some users succeeded. Never shown
            together with the keypair modal (FR-3419). */}
        <BulkCreateUserErrorModal
          open={!createdKeypairs && !_.isEmpty(failedUsers)}
          failedUsers={failedUsers}
          createdCount={createdCount}
          onRequestClose={() => setFailedUsers([])}
        />
      </Suspense>
    </BAIModal>
  );
};

export default UserSettingModal;
