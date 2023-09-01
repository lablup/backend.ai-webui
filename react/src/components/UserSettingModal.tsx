import { useSuspendedBackendaiClient, useUpdatableState } from '../hooks';
import { useTanMutation } from '../hooks/reactQueryAlias';
import BAIModal, { BAIModalProps } from './BAIModal';
import { useWebComponentInfo } from './DefaultProviders';
import TOTPActivateModal from './TOTPActivateModal';
import { UserSettingModalMutation } from './__generated__/UserSettingModalMutation.graphql';
import {
  UserSettingModalQuery,
  UserSettingModalQuery$data,
} from './__generated__/UserSettingModalQuery.graphql';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { useToggle } from 'ahooks';
import { Form, Input, Select, Switch, message, Typography, Modal } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React, { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { useMutation } from 'react-relay';
import { useLazyLoadQuery } from 'react-relay';

type User = UserSettingModalQuery$data['user'];

type UserStatus = {
  [key: string]: string;
};

type UserRole = {
  [key: string]: string[];
};

interface Props extends BAIModalProps {
  extraFetchKey?: string;
}

const UserSettingModal: React.FC<Props> = ({
  extraFetchKey = '',
  ...baiModalProps
}) => {
  const { t } = useTranslation();
  const { value, dispatchEvent } = useWebComponentInfo();
  let parsedValue: {
    open: boolean;
    userEmail: string;
  };
  try {
    parsedValue = JSON.parse(value || '');
  } catch (error) {
    parsedValue = {
      open: false,
      userEmail: '',
    };
  }
  const { open, userEmail } = parsedValue;

  const [modal, contextHolder] = Modal.useModal();

  const [form] = Form.useForm<User>();

  const userStatus: UserStatus = {
    active: 'Active',
    inactive: 'Inactive',
    'before-verification': 'Before Verification',
    deleted: 'Deleted',
  };

  const permissionRangeOfRoleChanges: UserRole = {
    superadmin: ['superadmin', 'admin', 'user', 'monitor'],
    admin: ['admin', 'user', 'monitor'],
  };

  const [fetchKey, updateFetchKey] = useUpdatableState('initial-fetch');
  const deferredMergedFetchKey = useDeferredValue(fetchKey + extraFetchKey);

  const baiClient = useSuspendedBackendaiClient();
  let totpSupported = false;
  let {
    data: isManagerSupportingTOTP,
    isLoading: isLoadingManagerSupportingTOTP,
  } = useQuery(
    'isManagerSupportingTOTP',
    () => {
      return baiClient.isManagerSupportingTOTP();
    },
    {
      // for to render even this fail query failed
      suspense: false,
    },
  );
  totpSupported = baiClient?.supports('2FA') && isManagerSupportingTOTP;

  const { user, loggedInUser } = useLazyLoadQuery<UserSettingModalQuery>(
    graphql`
      query UserSettingModalQuery(
        $email: String
        $isNotSupportTotp: Boolean!
        $loggedInUserEmail: String
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
          totp_activated @skipOnClient(if: $isNotSupportTotp)
          ...TOTPActivateModalFragment
        }
        loggedInUser: user(email: $loggedInUserEmail) {
          role
        }
      }
    `,
    {
      email: userEmail,
      isNotSupportTotp: !totpSupported,
      loggedInUserEmail: baiClient?.email ?? '',
    },
    {
      fetchKey: deferredMergedFetchKey,
      fetchPolicy: 'network-only',
    },
  );

  const [commitModifyUserSetting, isInFlightCommitModifyUserSetting] =
    useMutation<UserSettingModalMutation>(graphql`
      mutation UserSettingModalMutation(
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

  const [isOpenTOTPActivateModal, { toggle: toggleTOTPActivateModal }] =
    useToggle(false);

  const _onOk = () => {
    form.validateFields().then(async (values) => {
      let input = { ...values };
      delete input.email;
      input = _.omit(input, ['password_confirm']);
      input = _.omitBy(input, (item) => item === undefined || item === '');
      // TOTP setting
      if (!totpSupported) {
        delete input?.totp_activated;
      }

      commitModifyUserSetting({
        variables: {
          email: values?.email || '',
          props: input,
          isNotSupportTotp: !totpSupported,
        },
        onCompleted(res) {
          if (res?.modify_user?.ok) {
            message.success(t('environment.SuccessfullyModified'));
          } else {
            message.error(res?.modify_user?.msg);
          }
          dispatchEvent('ok', null);
        },
        onError(err) {
          message.error(err?.message);
        },
      });
    });
  };

  return (
    <BAIModal
      open={open}
      onCancel={() => {
        dispatchEvent('cancel', null);
      }}
      centered
      title={t('credential.ModifyUserDetail')}
      destroyOnClose={true}
      onOk={_onOk}
      confirmLoading={isInFlightCommitModifyUserSetting}
      {...baiModalProps}
    >
      <Form
        preserve={false}
        form={form}
        labelCol={{ span: 10 }}
        wrapperCol={{ span: 20 }}
        validateTrigger={['onChange', 'onBlur']}
        style={{ marginBottom: 40, marginTop: 20 }}
        initialValues={{ ...user }}
      >
        <Form.Item name="email" label={t('credential.UserID')}>
          <Input disabled />
        </Form.Item>
        <Form.Item name="username" label={t('credential.UserName')}>
          <Input placeholder={t('maxLength.64chars')} />
        </Form.Item>
        <Form.Item name="full_name" label={t('credential.FullName')}>
          <Input placeholder={t('maxLength.64chars')} />
        </Form.Item>
        <Form.Item
          name="password"
          label={t('general.NewPassword')}
          rules={[
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
          label={t('webui.menu.NewPasswordAgain')}
          rules={[
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
        <Form.Item name="description" label={t('credential.Description')}>
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
        {!!user?.role &&
          !!loggedInUser?.role &&
          loggedInUser.role in permissionRangeOfRoleChanges && (
            <Form.Item name="role" label={t('credential.Role')}>
              <Select
                options={_.map(
                  permissionRangeOfRoleChanges[loggedInUser.role],
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
        {!!totpSupported && (
          <Form.Item
            name="totp_activated"
            label={t('webui.menu.TotpActivated')}
            valuePropName="checked"
            extra={
              user?.email !== baiClient?.email && (
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {t('credential.AdminCanOnlyRemoveTotp')}
                </Typography.Text>
              )
            }
          >
            <Switch
              loading={
                isLoadingManagerSupportingTOTP || mutationToRemoveTotp.isLoading
              }
              disabled={
                user?.email !== baiClient?.email && !user?.totp_activated
              }
              onChange={(checked: boolean) => {
                if (checked) {
                  toggleTOTPActivateModal();
                } else {
                  if (user?.totp_activated) {
                    form.setFieldValue('totp_activated', true);
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
                            form.setFieldValue('totp_activated', false);
                          },
                          onError: (err) => {
                            console.log(err);
                          },
                        });
                      },
                      onCancel() {
                        form.setFieldValue('totp_activated', true);
                      },
                    });
                  }
                }
              }}
            />
          </Form.Item>
        )}
      </Form>
      {!!totpSupported && (
        <TOTPActivateModal
          userFrgmt={user}
          open={isOpenTOTPActivateModal}
          onRequestClose={(success) => {
            if (success) {
              updateFetchKey();
            } else {
              form.setFieldValue('totp_activated', false);
            }
            toggleTOTPActivateModal();
          }}
        />
      )}
      {contextHolder}
    </BAIModal>
  );
};

export default UserSettingModal;
