/**
 @license
 Copyright (c) 2015-2023 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserInfo } from '../hooks/backendai';
import { useTanMutation } from '../hooks/reactQueryAlias';
import BAIModal from './BAIModal';
import { passwordPattern } from './ResetPasswordRequired';
import TOTPActivateModal from './TOTPActivateModal';
import { UserProfileQuery } from './UserProfileSettingModalQuery';
// @ts-ignore
import { UserProfileSettingModalQuery } from './__generated__/UserProfileSettingModalQuery.graphql';
import { ExclamationCircleFilled, LoadingOutlined } from '@ant-design/icons';
import { useToggle } from 'ahooks';
import { Modal, ModalProps, Input, Form, message, Switch, Spin } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { PreloadedQuery, usePreloadedQuery } from 'react-relay';

interface Props extends ModalProps {
  queryRef: PreloadedQuery<UserProfileSettingModalQuery>;
  onRequestClose: (success?: boolean) => void;
  onRequestRefresh: () => void;
  totpSupported?: boolean;
  isRefreshModalPending?: boolean;
}

type UserProfileFormValues = {
  full_name: string;
  originalPassword?: string;
  newPasswordConfirm?: string;
  newPassword?: string;
  totp_activated: boolean;
};

const UserProfileSettingModal: React.FC<Props> = ({
  onRequestClose,
  onRequestRefresh,
  isRefreshModalPending,
  totpSupported,
  queryRef,
  ...baiModalProps
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<UserProfileFormValues>();
  const [messageApi, contextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();
  const [isOpenTOTPActivateModal, { toggle: toggleTOTPActivateModal }] =
    useToggle(false);
  const baiClient = useSuspendedBackendaiClient();

  // const { data: isManagerSupportingTOTP } = useTanQuery(
  //   'isManagerSupportingTOTP',
  //   () => {
  //     return baiClient.isManagerSupportingTOTP();
  //   },
  //   {
  //     suspense: true,
  //   },
  // );
  // const totpSupported = baiClient.supports('2FA') && isManagerSupportingTOTP;

  const [userInfo, userMutations] = useCurrentUserInfo();
  // const [fetchKey, updateFetchKey] = useUpdatableState('initial-fetch');

  const { user } = usePreloadedQuery(UserProfileQuery, queryRef);

  const mutationToRemoveTotp = useTanMutation({
    mutationFn: () => {
      return baiClient.remove_totp();
    },
  });

  const onSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        userMutations.updateFullName(values.full_name, {
          onSuccess: (newFullName) => {
            if (newFullName !== userInfo.full_name) {
              messageApi.open({
                type: 'success',
                content: t('webui.menu.FullnameUpdated'),
              });
            }

            if (
              values.newPassword &&
              values.newPasswordConfirm &&
              values.originalPassword
            ) {
              userMutations.updatePassword(
                {
                  new_password: values.newPassword,
                  new_password2: values.newPasswordConfirm,
                  old_password: values.originalPassword,
                },
                {
                  onSuccess: () => {
                    messageApi.open({
                      type: 'success',
                      content: t('webui.menu.PasswordUpdated'),
                    });
                    onRequestClose(true);
                  },
                  onError: (e) => {
                    messageApi.open({
                      type: 'error',
                      content: e.message,
                    });
                  },
                },
              );
            } else {
              onRequestClose(true);
            }
          },
          onError: (e) => {
            messageApi.open({
              type: 'error',
              content: e.message,
            });
          },
        });
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
        confirmLoading={userInfo.isPendingMutation}
        onOk={() => onSubmit()}
        centered
        destroyOnClose
        title={t('webui.menu.MyAccountInformation')}
      >
        <Spin spinning={isRefreshModalPending} indicator={<LoadingOutlined />}>
          <Form
            layout="vertical"
            labelCol={{ span: 8 }}
            form={form}
            initialValues={{
              full_name: userInfo.full_name,
              totp_activated: user?.totp_activated || false,
            }}
            preserve={false}
          >
            <Form.Item
              name="full_name"
              label={t('webui.menu.FullName')}
              rules={[
                () => ({
                  validator(_, value) {
                    if (value && value.length < 65) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error(t('webui.menu.FullNameInvalid')),
                    );
                  },
                }),
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="originalPassword"
              label={t('webui.menu.OriginalPassword')}
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (
                      !value &&
                      (getFieldValue('newPassword') ||
                        getFieldValue('newPasswordConfirm'))
                    ) {
                      return Promise.reject(
                        new Error(t('webui.menu.InputOriginalPassword')),
                      );
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
              dependencies={['newPassword', 'newPasswordConfirm']}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              name="newPassword"
              label={t('webui.menu.NewPassword')}
              rules={[
                {
                  pattern: passwordPattern,
                  message: t('webui.menu.InvalidPasswordMessage'),
                },
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              name="newPasswordConfirm"
              label={t('webui.menu.NewPasswordAgain')}
              dependencies={['newPassword']}
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error(t('webui.menu.NewPasswordMismatch')),
                    );
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>
            {!!totpSupported && (
              <Form.Item
                name="totp_activated"
                label={t('webui.menu.TotpActivated')}
                valuePropName="checked"
              >
                <Switch
                  loading={mutationToRemoveTotp.isLoading}
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
                            mutationToRemoveTotp.mutate(undefined, {
                              onSuccess: () => {
                                message.success(
                                  t('totp.RemoveTotpSetupCompleted'),
                                );
                                // updateFetchKey();
                                onRequestRefresh();

                                form.setFieldValue('totp_activated', false);
                              },
                              onError: (error: any) => {
                                message.error(error.message);
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
        </Spin>
        {!!totpSupported && (
          <TOTPActivateModal
            userFrgmt={user}
            open={isOpenTOTPActivateModal}
            onRequestClose={(success) => {
              if (success) {
                // updateFetchKey();
                onRequestRefresh();
              } else {
                form.setFieldValue('totp_activated', false);
              }
              toggleTOTPActivateModal();
            }}
          />
        )}
      </BAIModal>
      {contextHolder}
      {modalContextHolder}
    </>
  );
};

export default UserProfileSettingModal;
