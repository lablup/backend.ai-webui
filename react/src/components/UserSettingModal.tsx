import {
  useCurrentDomainValue,
  useSuspendedBackendaiClient,
  useUpdatableState,
} from '../hooks';
import { useCurrentUserRole, useTOTPSupported } from '../hooks/backendai';
import { useTanMutation } from '../hooks/reactQueryAlias';
import BAIModal, { BAIModalProps } from './BAIModal';
import TOTPActivateModal from './TOTPActivateModal';
import UserResourcePolicySelector from './UserResourcePolicySelector';
import {
  UserInput,
  UserSettingModalCreateMutation,
} from './__generated__/UserSettingModalCreateMutation.graphql';
import {
  ModifyUserInput,
  UserSettingModalModifyMutation,
} from './__generated__/UserSettingModalModifyMutation.graphql';
import { UserSettingModalQuery } from './__generated__/UserSettingModalQuery.graphql';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { useToggle } from 'ahooks';
import {
  Form,
  Input,
  Select,
  Switch,
  message,
  Typography,
  FormInstance,
  App,
  theme,
} from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-relay';
import { useLazyLoadQuery } from 'react-relay';

type UserStatus = {
  [key: string]: string;
};
const userStatus: UserStatus = {
  active: 'Active',
  inactive: 'Inactive',
  'before-verification': 'Before Verification',
  deleted: 'Deleted',
};

type UserRole = {
  [key: string]: string[];
};
const permissionRangeOfRoleChanges: UserRole = {
  superadmin: ['superadmin', 'admin', 'user', 'monitor'],
  admin: ['admin', 'user', 'monitor'],
};

interface UserSettingModalProps extends BAIModalProps {
  userEmail?: string | null;
  onRequestClose: (success: boolean) => void;
}

const UserSettingModal: React.FC<UserSettingModalProps> = ({
  userEmail = null,
  onRequestClose,
  ...baiModalProps
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { modal } = App.useApp();
  const formRef = useRef<FormInstance>(null);

  const currentUserRole = useCurrentUserRole();
  const currentDomainName = useCurrentDomainValue();
  const baiClient = useSuspendedBackendaiClient();
  const sudoSessionEnabledSupported = baiClient?.supports(
    'sudo-session-enabled',
  );
  const { isTOTPSupported, isLoading: isLoadingManagerSupportingTOTP } =
    useTOTPSupported();
  const [isOpenTOTPActivateModal, { toggle: toggleTOTPActivateModal }] =
    useToggle(false);
  const [fetchKey, updateFetchKey] = useUpdatableState('initial-fetch');

  const { user } = useLazyLoadQuery<UserSettingModalQuery>(
    graphql`
      query UserSettingModalQuery(
        $email: String
        $isNotSupportSudoSessionEnabled: Boolean!
        $isNotSupportTotp: Boolean!
      ) {
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
          # TODO: reflect https://github.com/lablup/backend.ai-webui/pull/1999
          # support from 23.09.0b1
          # https://github.com/lablup/backend.ai/pull/1530
          sudo_session_enabled
            @skipOnClient(if: $isNotSupportSudoSessionEnabled)
          totp_activated @skipOnClient(if: $isNotSupportTotp)
          ...TOTPActivateModalFragment
        }
      }
    `,
    {
      email: userEmail ?? '',
      isNotSupportSudoSessionEnabled: !sudoSessionEnabledSupported,
      isNotSupportTotp: !isTOTPSupported,
    },
    {
      // Do not fetch user data if the modal is closed or the user email is not provided
      fetchPolicy:
        baiModalProps.open && userEmail ? 'network-only' : 'store-only',
      fetchKey: fetchKey,
    },
  );

  const [commitModifyUserSetting, isInFlightCommitModifyUserSetting] =
    useMutation<UserSettingModalModifyMutation>(graphql`
      mutation UserSettingModalModifyMutation(
        $email: String!
        $props: ModifyUserInput!
        $isNotSupportSudoSessionEnabled: Boolean!
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
            # TODO: reflect https://github.com/lablup/backend.ai-webui/pull/1999
            # support from 23.09.0b1
            # https://github.com/lablup/backend.ai/pull/1530
            sudo_session_enabled
              @skipOnClient(if: $isNotSupportSudoSessionEnabled)
            totp_activated @skipOnClient(if: $isNotSupportTotp)
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
        $isNotSupportSudoSessionEnabled: Boolean!
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
              @skipOnClient(if: $isNotSupportSudoSessionEnabled)
            totp_activated @skipOnClient(if: $isNotSupportTotp)
            ...TOTPActivateModalFragment
          }
        }
      }
    `);

  const mutationToRemoveTotp = useTanMutation({
    mutationFn: (email: string) => {
      return baiClient.remove_totp(email);
    },
  });

  const INITIAL_VALUES = {
    email: '',
    username: '',
    need_password_change: false,
    full_name: '',
    description: '',
    status: 'active',
    domain_name: currentDomainName,
    role: 'user',
    is_active: true,
    resource_policy: 'default',
  };

  const handleOk = () => {
    formRef.current
      ?.validateFields()
      .then(async (values) => {
        if (user) {
          const props: ModifyUserInput = _.omitBy(
            _.omit(values, ['email', 'password_confirm']),
            _.isNil,
          );
          commitModifyUserSetting({
            variables: {
              email: values?.email || '',
              props: props,
              isNotSupportSudoSessionEnabled: !sudoSessionEnabledSupported,
              isNotSupportTotp: !isTOTPSupported,
            },
            onCompleted: (res, errors) => {
              if (!res?.modify_user?.ok) {
                message.error(t('dialog.ErrorOccurred'));
                console.error(res?.modify_user?.msg);
                onRequestClose(false);
                return;
              }
              if (errors && errors.length > 0) {
                const errorMsgList = _.map(errors, (error) => error.message);
                for (const error of errorMsgList) {
                  message.error(error);
                }
                onRequestClose(false);
              }
              message.success(t('environment.SuccessfullyModified'));
              onRequestClose(true);
            },
            onError: (err) => {
              message.error(t('dialog.ErrorOccurred'));
              console.error(err);
            },
          });
        } else {
          const default_group_id = [
            await baiClient.group
              .list()
              .then((res: any) => _.find(res.groups, { name: 'default' })?.id),
          ];
          const props: UserInput = {
            ..._.omit(values, ['email', 'password_confirm']),
            password: values.password,
            need_password_change: values.need_password_change,
            username: values?.username || _.split(values.email, '@')[0],
            full_name: values?.full_name || _.split(values.email, '@')[0],
            description:
              values?.description ||
              `${_.split(values.email, '@')[0]}'s Account`,
            group_ids: default_group_id,
          };
          commitCreateUser({
            variables: {
              email: values?.email || '',
              props: props,
              isNotSupportSudoSessionEnabled: !sudoSessionEnabledSupported,
              isNotSupportTotp: !isTOTPSupported,
            },
            onCompleted: (res, errors) => {
              if (!res?.create_user?.ok) {
                message.error(
                  res.create_user?.msg?.includes('already exists')
                    ? t('credential.UserAccountCreatedError')
                    : t('dialog.ErrorOccurred'),
                );
                console.error(res?.create_user?.msg);
                onRequestClose(false);
                return;
              }
              if (errors && errors.length > 0) {
                const errorMsgList = _.map(errors, (error) => error.message);
                for (const error of errorMsgList) {
                  message.error(error);
                }
                onRequestClose(false);
              }
              message.success(t('environment.SuccessfullyCreated'));
              onRequestClose(true);
            },
            onError: (err) => {
              message.error(t('dialog.ErrorOccurred'));
              console.error(err);
            },
          });
        }
      })
      .catch((e) => console.error(e));
  };

  return (
    <BAIModal
      centered
      title={
        user ? t('credential.ModifyUserDetail') : t('credential.CreateUser')
      }
      destroyOnClose
      onOk={handleOk}
      confirmLoading={
        isInFlightCommitModifyUserSetting || isInFlightCommitCreateUser
      }
      onCancel={() => onRequestClose(false)}
      {...baiModalProps}
    >
      <Form
        ref={formRef}
        preserve={false}
        labelCol={{ span: 10 }}
        wrapperCol={{ span: 20 }}
        validateTrigger={['onChange', 'onBlur']}
        style={{ marginBottom: 40, marginTop: token.marginMD }}
        initialValues={user ? { ...user } : INITIAL_VALUES}
      >
        <Form.Item
          name="email"
          label={t('credential.UserID')}
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
        <Form.Item
          name="password"
          label={user ? t('general.NewPassword') : t('general.Password')}
          rules={[
            {
              required: !user,
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
              required: !user,
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
          name="description"
          label={t('credential.Description')}
          rules={[{ max: 500 }]}
        >
          <Input.TextArea placeholder={t('maxLength.500chars')} />
        </Form.Item>
        <Form.Item name="status" label={t('credential.UserStatus')}>
          <Select
            options={_.map(userStatus, (value, key) => {
              return {
                value: key,
                label: value,
              };
            })}
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
          name="need_password_change"
          label={t('credential.DescRequirePasswordChange')}
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
        {!!sudoSessionEnabledSupported && (
          <Form.Item
            name="sudo_session_enabled"
            label={t('credential.EnableSudoSession')}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        )}
        {!!isTOTPSupported && (
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
                isLoadingManagerSupportingTOTP || mutationToRemoveTotp.isPending
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
                            message.success(t('totp.RemoveTotpSetupCompleted'));
                            updateFetchKey();
                            formRef.current?.setFieldValue(
                              'totp_activated',
                              false,
                            );
                          },
                          onError: (err) => {
                            console.log(err);
                          },
                        });
                      },
                      onCancel() {
                        formRef.current?.setFieldValue('totp_activated', true);
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
          <UserResourcePolicySelector />
        </Form.Item>
      </Form>
      {!!isTOTPSupported && (
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
    </BAIModal>
  );
};

export default UserSettingModal;
