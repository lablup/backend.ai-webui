/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { UserProfileSettingModalFragment$key } from '../__generated__/UserProfileSettingModalFragment.graphql';
import { UserProfileSettingModalUpdateUserMutation } from '../__generated__/UserProfileSettingModalUpdateUserMutation.graphql';
import { isIpIncludedInList, isValidIPOrCidr } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserInfo } from '../hooks/backendai';
import { useTanMutation } from '../hooks/reactQueryAlias';
import TOTPActivateModal from './TOTPActivateModal';
import { UserProfileSettingModalFragment } from './UserProfileSettingModalFragment.graphql';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { useToggle } from 'ahooks';
import {
  type ModalProps,
  Input,
  Form,
  Switch,
  type FormInstance,
  App,
  Tag,
  Typography,
} from 'antd';
import {
  BAIModal,
  BAISelect,
  BAIText,
  useErrorMessageResolver,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

interface Props extends ModalProps {
  userFrgmt: UserProfileSettingModalFragment$key | null | undefined;
  currentClientIp?: string;
  onRequestClose: (success?: boolean) => void;
  onRequestRefresh: () => void;
  totpSupported?: boolean;
}

type UserProfileFormValues = {
  full_name: string;
  originalPassword?: string;
  password?: string;
  passwordConfirm?: string;
  totp_activated: boolean;
  allowed_client_ip?: string[];
};

const UserProfileSettingModal: React.FC<Props> = ({
  onRequestClose,
  onRequestRefresh,
  totpSupported,
  userFrgmt,
  currentClientIp,
  ...baiModalProps
}) => {
  'use memo';

  const { t } = useTranslation();
  const formRef = useRef<FormInstance<UserProfileFormValues>>(null);
  const { message, modal } = App.useApp();
  const [isOpenTOTPActivateModal, { toggle: toggleTOTPActivateModal }] =
    useToggle(false);
  const baiClient = useSuspendedBackendaiClient();
  const supportsUpdateUserV2 = baiClient.supports('update-user-v2');
  const [userInfo, userMutations] = useCurrentUserInfo();
  const { getErrorMessage } = useErrorMessageResolver();

  const user = useFragment(UserProfileSettingModalFragment, userFrgmt);

  const [commitUpdateUser, isInFlightUpdateUser] =
    useMutation<UserProfileSettingModalUpdateUserMutation>(graphql`
      mutation UserProfileSettingModalUpdateUserMutation(
        $input: UpdateUserV2Input!
      ) {
        updateUserV2(input: $input) {
          user {
            id
          }
        }
      }
    `);

  const mutationToRemoveTotp = useTanMutation({
    mutationFn: () => {
      return baiClient.remove_totp();
    },
  });

  const onSubmit = () => {
    formRef.current
      ?.validateFields()
      .then((values) => {
        if (!formRef.current?.isFieldsTouched()) {
          message.info(t('webui.menu.NoChangesToUpdate'));
          return;
        }

        if (supportsUpdateUserV2) {
          commitUpdateUser({
            variables: {
              input: {
                fullName: values.full_name,
                password: values.password || undefined,
                allowedClientIp: values.allowed_client_ip?.length
                  ? values.allowed_client_ip
                  : null,
              },
            },
            onCompleted: (_res, errors) => {
              if (errors?.[0]) {
                message.error(errors[0].message || t('error.UnknownError'));
                return;
              }
              message.success(t('webui.menu.ProfileUpdated'));
              onRequestRefresh();
              onRequestClose(true);
            },
            onError: (err) => {
              message.error(getErrorMessage(err));
            },
          });
        } else {
          userMutations.updateFullName(values.full_name, {
            onSuccess: () => {
              if (
                values.password &&
                values.passwordConfirm &&
                values.originalPassword
              ) {
                userMutations.updatePassword(
                  {
                    old_password: values.originalPassword,
                    new_password: values.password,
                    new_password2: values.passwordConfirm,
                  },
                  {
                    onSuccess: () => {
                      message.success(t('webui.menu.PasswordUpdated'));
                      onRequestRefresh();
                      onRequestClose(true);
                    },
                    onError: (e) => {
                      message.error(e.message);
                    },
                  },
                );
              } else {
                message.success(t('webui.menu.FullNameUpdated'));
                onRequestRefresh();
                onRequestClose(true);
              }
            },
            onError: (e) => {
              message.error(e.message);
            },
          });
        }
      })
      .catch(() => {});
  };

  return (
    <>
      <BAIModal
        {...baiModalProps}
        okText={t('webui.menu.Update')}
        cancelText={t('webui.menu.Cancel')}
        onCancel={() => {
          onRequestClose();
        }}
        confirmLoading={
          supportsUpdateUserV2
            ? isInFlightUpdateUser
            : userInfo.isPendingMutation
        }
        onOk={() => onSubmit()}
        centered
        destroyOnHidden
        title={t('webui.menu.MyAccountInformation')}
      >
        <Form
          ref={formRef}
          layout="vertical"
          initialValues={{
            full_name: user?.full_name ?? '',
            totp_activated: user?.totp_activated || false,
            ...(supportsUpdateUserV2 && {
              allowed_client_ip: user?.allowed_client_ip
                ? [...user.allowed_client_ip].filter(
                    (ip): ip is string => ip != null,
                  )
                : [],
            }),
          }}
          preserve={false}
        >
          <Form.Item
            name="full_name"
            label={t('webui.menu.FullName')}
            rules={[
              () => ({
                validator(_, value) {
                  if (!value || value.length < 65) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(t('webui.menu.FullNameInvalid')),
                  );
                },
              }),
            ]}
          >
            <Input autoComplete="off" />
          </Form.Item>
          {!supportsUpdateUserV2 && (
            <Form.Item
              name="originalPassword"
              label={t('webui.menu.OriginalPassword')}
              dependencies={['password', 'passwordConfirm']}
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const password = getFieldValue('password');
                    if (password && !value) {
                      return Promise.reject(
                        new Error(t('webui.menu.InputOriginalPassword')),
                      );
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <Input.Password autoComplete="current-password" />
            </Form.Item>
          )}
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
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            name="passwordConfirm"
            label={t('webui.menu.NewPasswordAgain')}
            dependencies={['password']}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const password = getFieldValue('password');
                  if (!password && !value) {
                    return Promise.resolve();
                  }
                  if (password && !value) {
                    return Promise.reject(
                      new Error(t('webui.menu.NewPasswordMismatch')),
                    );
                  }
                  if (password !== value) {
                    return Promise.reject(
                      new Error(t('webui.menu.NewPasswordMismatch')),
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          {supportsUpdateUserV2 && (
            <Form.Item
              name="allowed_client_ip"
              label={t('credential.AllowedClientIP')}
              extra={
                <>
                  <Typography.Text type="secondary">
                    {t('credential.AllowedClientIPHint')}
                  </Typography.Text>
                  <br />
                  <BAIText
                    type="secondary"
                    copyable={
                      currentClientIp ? { text: currentClientIp } : false
                    }
                  >
                    {t('credential.CurrentClientIp', {
                      ip: currentClientIp,
                    })}
                  </BAIText>
                </>
              }
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
                    if (
                      currentClientIp &&
                      !isIpIncludedInList(currentClientIp, value)
                    ) {
                      return Promise.reject(
                        new Error(
                          t('credential.AllowedClientIpNotIncluded', {
                            ip: currentClientIp,
                          }),
                        ),
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
              style={{ marginBottom: 0 }}
            >
              <BAISelect
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
          )}
          {!!totpSupported && (
            <Form.Item
              name="totp_activated"
              label={t('webui.menu.TotpActivated')}
              valuePropName="checked"
            >
              <Switch
                loading={mutationToRemoveTotp.isPending}
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
                          mutationToRemoveTotp.mutate(undefined, {
                            onSuccess: () => {
                              message.success(
                                t('totp.RemoveTotpSetupCompleted'),
                              );
                              onRequestRefresh();

                              formRef.current?.setFieldValue(
                                'totp_activated',
                                false,
                              );
                            },
                            onError: (error) => {
                              message.error(getErrorMessage(error));
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
        </Form>
        {!!totpSupported && (
          <TOTPActivateModal
            userFrgmt={user}
            open={isOpenTOTPActivateModal}
            onRequestClose={(success) => {
              if (success) {
                onRequestRefresh();
              } else {
                formRef.current?.setFieldValue('totp_activated', false);
              }
              toggleTOTPActivateModal();
            }}
          />
        )}
      </BAIModal>
    </>
  );
};

export default UserProfileSettingModal;
